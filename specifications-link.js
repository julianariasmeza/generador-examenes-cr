'use strict';

/* Exam STEM CR 2.8.2-C
   Vinculacion entre indicadores y apartados */

let specDraftLinks = {};

function specificationLinkKey(sid, bid) {
  return JSON.stringify([sid, bid]);
}

function specificationBlocks() {

  const blocks = [];

  for (const section of examSections()) {

    for (const block of topicBlocks(section)) {

      blocks.push({
        sid: section.id,
        bid: block.id,
        key: specificationLinkKey(section.id, block.id),
        type: section.k,
        section: section.title,
        topic: block.topic || '',
        subtopic: block.subtopic || '',
        indicator: block.indicator || ''
      });
    }
  }

  return blocks;
}

function specificationLinks() {
  return config.specificationLinks || {};
}

function specificationComparison(
  spec = config.specifications,
  links = specificationLinks()
) {

  const questions = items.map(z => ({
    ...z,
    specId: links[
      specificationLinkKey(z.sid, z.bid)
    ] || ''
  }));

  return STEMSpecifications.compare(
    spec || STEMSpecifications.create(),
    questions,
    points
  );
}

function cleanSpecificationLinks(spec, links) {

  const validRows = new Set(
    spec.rows.map(r => r.id)
  );

  const validBlocks = new Set(
    specificationBlocks().map(b => b.key)
  );

  return Object.fromEntries(
    Object.entries(links).filter(([key, id]) =>
      validBlocks.has(key) && validRows.has(id)
    )
  );
}

function autoLinkSpecifications() {

  let count = 0;

  for (const block of specificationBlocks()) {

    if (specDraftLinks[block.key]) continue;

    if (!block.indicator.trim()) continue;

    const matches = specDraft.rows.filter(r =>
      r.topic.trim() === block.topic.trim() &&
      r.indicator.trim() === block.indicator.trim() &&
      r.learning.trim() === block.subtopic.trim()
    );

    if (matches.length === 1) {
      specDraftLinks[block.key] = matches[0].id;
      count++;
    }
  }

  renderSpecificationLinks();

  $('specLinkMessage').textContent =
    count + ' apartados vinculados automaticamente.';
}

function renderSpecificationLinks() {

  const host = $('specLinkRows');

  if (!host || !specDraft) return;

  specDraftLinks = cleanSpecificationLinks(
    specDraft,
    specDraftLinks
  );

  const blocks = specificationBlocks();

  host.innerHTML = blocks.map(block => {

    const current = specDraftLinks[block.key] || '';

    const value = items
      .filter(z =>
        z.sid === block.sid &&
        z.bid === block.bid
      )
      .reduce((sum, z) => sum + points(z), 0);

    return `
      <tr>
        <td>${esc(block.section)}</td>
        <td>${esc(block.topic)}</td>
        <td>${esc(block.indicator || 'Sin indicador')}</td>
        <td>${fmt(value)}</td>
        <td>
          <select data-spec-link="${esc(block.key)}">
            <option value="">Sin vincular</option>
            ${specDraft.rows.map(r => `
              <option value="${esc(r.id)}"
                ${r.id === current ? 'selected' : ''}>
                ${esc(r.topic)} — ${esc(r.indicator || 'Sin indicador')}
              </option>
            `).join('')}
          </select>
        </td>
      </tr>`;
  }).join('') || `
    <tr>
      <td colspan="5">No hay apartados tematicos.</td>
    </tr>`;

  renderSpecificationComparison();
}

function renderSpecificationComparison() {

  if (!$('specComparison') || !specDraft) return;

  const result = specificationComparison(
    specDraft,
    specDraftLinks
  );

  const S = STEMSpecifications;

  $('specComparisonSummary').innerHTML = `
    <div class="spec-summary">

      <div class="spec-metric">
        <span>Planificado</span>
        <strong>${fmt(result.plannedTotal)}</strong>
      </div>

      <div class="spec-metric">
        <span>Puntaje real</span>
        <strong>${fmt(result.actualTotal)}</strong>
      </div>

      <div class="spec-metric">
        <span>Diferencia global</span>
        <strong>${fmt(result.remaining)}</strong>
      </div>

      <div class="spec-metric">
        <span>Puntos sin vincular</span>
        <strong>${fmt(result.unlinkedPoints)}</strong>
      </div>

    </div>`;

  $('specComparison').innerHTML = `
    <table class="spec-compare-table">

      <thead>
        <tr>
          <th>Indicador</th>
          ${S.TYPES.map(t =>
            `<th title="${esc(t.name)}">${t.code}</th>`
          ).join('')}
          <th>Plan</th>
          <th>Real</th>
          <th>Diferencia</th>
        </tr>
      </thead>

      <tbody>
        ${result.rows.map(r => `
          <tr>
            <td>${esc(r.indicator)}</td>

            ${S.TYPES.map(t => `
              <td class="${
                r.differences[t.key] === 0
                  ? 'spec-ok'
                  : 'spec-warning'
              }">
                ${fmt(r.actual[t.key])} /
                ${fmt(r.distribution[t.key])}
              </td>
            `).join('')}

            <td>${fmt(r.finalPoints)}</td>
            <td>${fmt(r.actualPoints)}</td>

            <td class="${
              r.remaining === 0
                ? 'spec-ok'
                : 'spec-warning'
            }">
              ${fmt(r.remaining)}
            </td>
          </tr>
        `).join('')}
      </tbody>

    </table>`;

  const messages = [];

  if (result.unlinked.length) {
    messages.push(
      'Preguntas sin vincular: ' +
      result.unlinked.join(', ')
    );
  }

  if (!result.matches) {
    messages.push(
      'La distribucion real aun no coincide con la planificacion.'
    );
  }

  $('specComparisonStatus').className =
    result.matches ? 'spec-ok' : 'spec-warning';

  $('specComparisonStatus').textContent =
    result.matches
      ? 'El examen coincide con la distribucion planificada.'
      : messages.join(' | ');
}

function initSpecificationLinks() {

  $('specValidation').insertAdjacentHTML('afterend', `

    <section class="spec-link-panel">

      <h3>Vinculacion con el examen</h3>

      <p class="hint">
        Relaciona cada apartado con un indicador.
        Todas sus preguntas heredaran la vinculacion.
      </p>

      <button type="button" id="specAutoLink">
        Vincular coincidencias automaticamente
      </button>

      <p id="specLinkMessage" aria-live="polite"></p>

      <div class="spec-table-wrap">
        <table class="spec-link-table">
          <thead>
            <tr>
              <th>Seccion</th>
              <th>Tema</th>
              <th>Indicador del apartado</th>
              <th>Puntos reales</th>
              <th>Indicador vinculado</th>
            </tr>
          </thead>
          <tbody id="specLinkRows"></tbody>
        </table>
      </div>

      <h3>Comparacion: examen y planificacion</h3>

      <p class="hint">
        Cada celda muestra puntos reales / planificados.
      </p>

      <div id="specComparisonSummary"></div>

      <div class="spec-table-wrap"
           id="specComparison"></div>

      <p id="specComparisonStatus"
         aria-live="polite"></p>

    </section>
  `);

  $('specAutoLink').onclick = autoLinkSpecifications;

  $('specLinkRows').onchange = e => {

    const key = e.target.dataset.specLink;

    if (!key) return;

    if (e.target.value) {
      specDraftLinks[key] = e.target.value;
    } else {
      delete specDraftLinks[key];
    }

    renderSpecificationComparison();
  };
}
