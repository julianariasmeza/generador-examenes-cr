'use strict';

/* Exam STEM CR 2.8.2-B */

let specDraft = null;

function specFormat(n) {
  return fmt(n);
}

function specMetric(label, id) {
  return `
    <div class="spec-metric">
      <span>${esc(label)}</span>
      <strong id="${id}">0</strong>
    </div>`;
}

function openSpecifications() {

  if (!config.paper) {
    blankExam();
    if (!config.paper) return;
  }

  specDraft = STEMSpecifications.create(
    config.specifications || {
      preliminaryPoints: total(),
      paper: config.paper
    }
  );

  specDraftLinks = {...specificationLinks()};

  $('specRegional').value = specDraft.regional;
  $('specPreliminary').value = specDraft.preliminaryPoints;
  $('specPaper').value = specDraft.paper;
  $('specHideUnused').checked = specDraft.hideUnusedTypes;
  $('specShowSignature').checked = specDraft.showSignature;

  renderSpecifications();

  renderSpecificationLinks();

  $('specDialog').showModal();
}

function renderSpecifications() {

  const S = STEMSpecifications;

  $('specRows').innerHTML = specDraft.rows.map((r, i) => `
    <tr>
      <td>${i + 1}</td>

      ${['topic','learning','indicator'].map(key => `
        <td>
          <textarea data-row="${i}"
                    data-field="${key}"
                    aria-label="${key}">${esc(r[key])}</textarea>
        </td>
      `).join('')}

      <td>
        <input type="number" min="0" step="1"
               data-row="${i}" data-field="lessons"
               value="${r.lessons}">
      </td>

      <td class="spec-number" id="specPartial${i}"></td>
      <td class="spec-number" id="specRecommended${i}"></td>

      <td>
        <input type="number" min="0" step="any"
               data-row="${i}" data-field="overridePoints"
               placeholder="Auto"
               value="${r.overridePoints ?? ''}">
      </td>

      ${S.TYPES.map(t => `
        <td>
          <input type="number" min="0" step="any"
                 data-row="${i}"
                 data-type="${t.key}"
                 aria-label="${esc(t.name)}"
                 value="${r.distribution[t.key]}">
        </td>
      `).join('')}

      <td class="spec-number" id="specAssigned${i}"></td>
      <td class="spec-number" id="specDifference${i}"></td>

      <td>
        <textarea data-row="${i}"
                  data-field="adjustmentReason"
                  placeholder="Opcional">${esc(r.adjustmentReason)}</textarea>
      </td>

      <td>
        <button type="button"
                data-remove="${i}"
                aria-label="Eliminar indicador">
          Eliminar
        </button>
      </td>
    </tr>
  `).join('');

  updateSpecifications();

  renderSpecificationLinks();
}

function updateSpecifications() {

  const S = STEMSpecifications;
  const validation = S.validate(specDraft);
  const r = validation.result;

  $('specLessons').textContent =
    specFormat(r.totalLessons);

  $('specConstant').textContent =
    r.constant.toFixed(2).replace('.', ',');

  $('specFinal').textContent =
    specFormat(r.finalPoints);

  $('specAssigned').textContent =
    specFormat(r.assignedPoints);

  r.rows.forEach((row, i) => {

    $('specPartial' + i).textContent =
      row.partialPoints.toFixed(2).replace('.', ',');

    $('specRecommended' + i).textContent =
      specFormat(row.recommendedPoints);

    $('specAssigned' + i).textContent =
      specFormat(row.assignedPoints);

    const difference = $('specDifference' + i);

    difference.textContent =
      specFormat(row.difference);

    difference.className =
      'spec-number ' +
      (row.difference === 0
        ? 'spec-ok' : 'spec-warning');
  });

  $('specTotals').innerHTML = `
    <tr>
      <th colspan="4">TOTAL</th>
      <th>${specFormat(r.totalLessons)}</th>
      <th>—</th>
      <th>—</th>
      <th>${specFormat(r.finalPoints)}</th>

      ${S.TYPES.map(t => `
        <th>${specFormat(r.distribution[t.key])}</th>
      `).join('')}

      <th>${specFormat(r.assignedPoints)}</th>
      <th>${specFormat(r.difference)}</th>
      <th colspan="2"></th>
    </tr>`;

  const messages = [
    ...validation.errors,
    ...validation.warnings
  ];

  $('specValidation').className =
    'spec-validation ' +
    (messages.length ? 'spec-warning' : 'spec-ok');

  $('specValidation').textContent =
    messages.length
      ? messages.join(' | ')
      : 'La distribución planificada está completa.';

  renderSpecificationComparison();
}

function importSpecificationTopics() {

  const S = STEMSpecifications;

  for (const section of examSections()) {

    for (const block of topicBlocks(section)) {

      if (!block.topic.trim()) continue;

      const topic = block.topic.trim();
      const indicator = (block.indicator || '').trim();
      const learning = (block.subtopic || '').trim();

      let row = specDraft.rows.find(r =>
        r.topic === topic &&
        r.indicator === indicator &&
        r.learning === learning
      );

      if (!row) {

        row = S.createRow({
          topic,
          indicator,
          learning,
          lessons: 0
        });

        specDraft.rows.push(row);
      }
    }
  }

  renderSpecifications();
}

function initSpecifications() {

  const S = STEMSpecifications;

  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="specDialog" aria-labelledby="specTitle">

      <h2 id="specTitle">Tabla de especificaciones</h2>

      <p class="hint">
        Planificación de aprendizajes, indicadores y puntajes.
        Los valores de las columnas SR a DE representan puntos,
        no cantidades de preguntas.
      </p>

      <div class="spec-settings">

        <label>Dirección regional
          <input id="specRegional">
        </label>

        <label>Puntuación preliminar
          <input id="specPreliminary"
                 type="number" min="0" step="any">
        </label>

        <label>Papel de exportación
          <select id="specPaper">
            <option>Carta</option>
            <option>Legal</option>
            <option>Doble carta</option>
            <option>Oficio</option>
          </select>
        </label>

        <label class="check">
          <input type="checkbox" id="specHideUnused">
          Ocultar tipos sin puntos al exportar
        </label>

      </div>

      <div class="spec-summary">
        ${specMetric('Total de lecciones','specLessons')}
        ${specMetric('Constante','specConstant')}
        ${specMetric('Puntos definitivos','specFinal')}
        ${specMetric('Puntos distribuidos','specAssigned')}
      </div>

      <div class="spec-actions">
        <button type="button" id="specAdd">
          + Agregar indicador
        </button>

        <button type="button" id="specImport">
          Importar apartados del examen
        </button>
      </div>

      <div class="spec-table-wrap">

        <table class="spec-table">
          <thead>
            <tr>
              <th>N.º</th>
              <th>Tema</th>
              <th>Aprendizaje</th>
              <th>Indicador</th>
              <th>Lecciones</th>
              <th>P. parcial</th>
              <th>Recomendado</th>
              <th>Ajuste definitivo</th>

              ${S.TYPES.map(t => `
                <th title="${esc(t.name)}">${t.code}</th>
              `).join('')}

              <th>Distribuido</th>
              <th>Diferencia</th>
              <th>Justificación</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody id="specRows"></tbody>
          <tfoot id="specTotals"></tfoot>
        </table>

      </div>

      <p class="hint">
        ${S.TYPES.map(t =>
          t.code + ': ' + esc(t.name)
        ).join(' · ')}
      </p>

      <div id="specValidation" aria-live="polite"></div>

      <div class="dialog-actions">
        <button type="button" id="specCancel">
          Cancelar
        </button>

        <button type="button" id="specSave" class="primary">
          Guardar tabla
        </button>
      </div>

    </dialog>
  `);

  initSpecificationLinks();
  initSpecificationsExcel();
  initSpecificationsPDF();

  $('specHideUnused').closest('label').insertAdjacentHTML(
    'afterend',
    `<label>
       <input type="checkbox" id="specShowSignature">
       Incluir firma del docente
     </label>`
  );

  $('specShowSignature').onchange = e => {
    specDraft.showSignature = e.target.checked;
  };

  $('openSpecifications').onclick = openSpecifications;

  $('specAdd').onclick = () => {
    specDraft.rows.push(S.createRow());
    renderSpecifications();
  };

  $('specImport').onclick = importSpecificationTopics;

  $('specRegional').oninput = e => {
    specDraft.regional = e.target.value;
  };

  $('specPreliminary').oninput = e => {
    specDraft.preliminaryPoints =
      Number(e.target.value);
    updateSpecifications();
  };

  $('specPaper').onchange = e => {
    specDraft.paper = e.target.value;
  };

  $('specHideUnused').onchange = e => {
    specDraft.hideUnusedTypes = e.target.checked;
  };

  $('specRows').oninput = e => {

    const input = e.target;
    const row = specDraft.rows[Number(input.dataset.row)];

    if (!row) return;

    const field = input.dataset.field;
    const type = input.dataset.type;

    if (type) {
      row.distribution[type] = Number(input.value);
    } else if (field === 'overridePoints') {
      row[field] = input.value === ''
        ? null : Number(input.value);
    } else if (field === 'lessons') {
      row[field] = Number(input.value);
    } else if (field) {
      row[field] = input.value;
    }

    updateSpecifications();
  };

  $('specRows').onclick = e => {

    const button = e.target.closest('[data-remove]');

    if (!button) return;

    const row = specDraft.rows[Number(button.dataset.remove)];

    if (!row) return;

    const linked = Object.values(specDraftLinks)
      .filter(id => id === row.id).length;

    const message = linked
      ? 'Este indicador tiene ' + linked +
        ' apartados vinculados. Se eliminaran sus vinculos. Continuar?'
      : '¿Eliminar este indicador?';

    if (!confirm(message)) return;

    specDraft.rows.splice(
      Number(button.dataset.remove), 1
    );

    renderSpecifications();
  };

  $('specCancel').onclick = () => {
    $('specDialog').close();
  };

  $('specSave').onclick = () => {

    config.specifications = S.create(specDraft);

    config.specificationLinks = cleanSpecificationLinks(
      config.specifications,
      specDraftLinks
    );

    $('specDialog').close();

    render();

    say('Tabla actualizada. Usá Guardar examen para conservarla.');
  };
}
