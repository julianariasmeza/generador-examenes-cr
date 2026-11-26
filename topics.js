'use strict';

/* Exam STEM CR - Apartados tematicos */

function newTopicBlock(topic = '') {
  return {
    id: 'block-' + crypto.randomUUID(),
    topic: String(topic || '').trim(),
    subtopic: '',
    indicator: '',
    visible: false,
    defaultPoints: 1
  };
}

function topicBlocks(section) {

  if (!Array.isArray(section.blocks)) {

    section.blocks = [];

    const questions = items.filter(
      z => z.sid === section.id
    );

    for (const z of questions) {

      const topic = String(z.topic || '').trim();

      let block = section.blocks.find(
        b => b.topic === topic
      );

      if (!block) {
        block = newTopicBlock(topic);
        block.defaultPoints = Number(z.p) || 1;
        section.blocks.push(block);
      }

      z.bid = block.id;
    }

  }

  return section.blocks;
}

function migrateTopicBlocks() {

  for (const section of examSections()) {
    topicBlocks(section);
  }

}

function topicBlockInfo(z) {

  const section = sectionInfo(z);

  return topicBlocks(section).find(
    b => b.id === z.bid
  );

}

function topicBlockPoints(id) {

  return items
    .filter(z => z.bid === id)
    .reduce((sum, z) => sum + points(z), 0);

}

function topicBlockCount(id) {

  return items.filter(
    z => z.bid === id
  ).length;

}

function availableBankTopics() {

  return topics[config.subject] || [];

}

function hasBankTopic(topic) {

  return availableBankTopics().includes(topic);

}

function validateTopicBlocks() {

  const errors = [];

  for (const section of examSections()) {

    const blocks = topicBlocks(section);

    if (!blocks.length) {
      errors.push(
        section.title + ': no tiene apartados.'
      );
    }

    for (const block of blocks) {

      if (!block.topic.trim()) {
        errors.push(
          section.title + ': falta indicar el tema.'
        );
      }

      if (!topicBlockCount(block.id)) {
        errors.push(
          section.title + ' / ' +
          block.topic + ': no tiene preguntas.'
        );
      }

    }

  }

  for (const z of items) {

    const block = topicBlockInfo(z);

    if (!block || !block.topic.trim()) {
      errors.push(
        'Existe una pregunta sin tema asignado.'
      );
    }

  }

  return [...new Set(errors)];

}

function topicSummary() {

  const result = new Map();

  for (const z of items) {

    const block = topicBlockInfo(z);

    const topic = block?.topic.trim() ||
      'Sin tema asignado';

    if (!result.has(topic)) {

      result.set(topic, {
        topic,
        questions: 0,
        points: 0,
        types: {}
      });

    }

    const row = result.get(topic);

    row.questions++;
    row.points += points(z);

    row.types[z.k] =
      (row.types[z.k] || 0) + points(z);

  }

  return [...result.values()].map(row => ({
    ...row,
    percentage: total() > 0
      ? 100 * row.points / total()
      : 0
  }));

}

function openTopicDialog(sid, bid = '') {

  const section = examSections().find(s => s.id === sid);
  if (!section) return;

  const block = topicBlocks(section).find(b => b.id === bid);

  $('topicSectionId').value = sid;
  $('topicBlockId').value = bid;
  $('topicName').value = block?.topic || '';
  $('topicSubtopic').value = block?.subtopic || '';
  $('topicIndicator').value = block?.indicator || '';
  $('topicPoints').value = block?.defaultPoints ||
    types.find(t => t[0] === section.k)[3];

  $('topicVisible').checked = block?.visible || false;

  $('topicSuggestions').replaceChildren();

  availableBankTopics().forEach(topic => {
    const option = document.createElement('option');
    option.value = topic;
    $('topicSuggestions').append(option);
  });

  $('topicDialog').showModal();
}

function renderTopicBlocks(section) {

  return topicBlocks(section).map((b, i, blocks) => `
    <div class="topic-block">

      <div class="topic-block-heading">
        <strong>${esc(b.topic || 'Tema pendiente')}</strong>
        <span>${fmt(topicBlockPoints(b.id))} pts</span>
      </div>

      <div class="topic-block-meta">
        ${topicBlockCount(b.id)} preguntas
        · ${fmt(b.defaultPoints)} pts por ítem o acierto
        · ${b.visible ? 'Visible en examen' : 'Oculto en examen'}
      </div>

      ${b.subtopic ? `
        <div class="topic-block-meta">
          Subtema: ${esc(b.subtopic)}
        </div>` : ''}

      ${b.indicator ? `
        <div class="topic-block-meta">
          Indicador: ${esc(b.indicator)}
        </div>` : ''}

      ${!b.topic ? `
        <div class="topic-warning">
          Debés asignar un tema.
        </div>` : ''}

      <div class="topic-block-actions">

        <button type="button" data-action="topic-edit"
          data-sid="${esc(section.id)}"
          data-bid="${esc(b.id)}">Editar tema</button>

        <button type="button" data-action="topic-up"
          data-sid="${esc(section.id)}"
          data-bid="${esc(b.id)}"
          ${i === 0 ? 'disabled' : ''}>↑</button>

        <button type="button" data-action="topic-down"
          data-sid="${esc(section.id)}"
          data-bid="${esc(b.id)}"
          ${i === blocks.length - 1 ? 'disabled' : ''}>↓</button>

        <button type="button" data-action="topic-delete"
          data-sid="${esc(section.id)}"
          data-bid="${esc(b.id)}">Eliminar</button>

        <button type="button" data-action="manual"
          data-sid="${esc(section.id)}"
          data-bid="${esc(b.id)}"
          ${!b.topic ? 'disabled' : ''}>
          + Pregunta manual
        </button>

        <button type="button" data-action="automatic"
          data-sid="${esc(section.id)}"
          data-bid="${esc(b.id)}"
          ${!hasBankTopic(b.topic) ? 'disabled' : ''}>
          + Desde banco
        </button>
<button type="button"
        data-action="batch"
        data-sid="${esc(section.id)}"
        data-bid="${esc(b.id)}"
        ${!hasBankTopic(b.topic) ? 'disabled' : ''}>
  Generar varias preguntas
</button>


      </div>

    </div>
  `).join('') + `
    <button type="button" class="topic-add"
      data-action="topic-add"
      data-sid="${esc(section.id)}">
      + Agregar apartado temático
    </button>`;
}

function handleTopicAction(action, sid, bid) {

  const section = examSections().find(s => s.id === sid);
  if (!section) return;

  const blocks = topicBlocks(section);
  const i = blocks.findIndex(b => b.id === bid);

  if (action === 'topic-add') {
    openTopicDialog(sid);
    return;
  }

  if (i < 0) return;

  if (action === 'topic-edit') {
    openTopicDialog(sid, bid);
    return;
  }

  if (action === 'topic-delete') {

    if (!confirm('¿Eliminar el apartado y sus preguntas?')) return;

    section.blocks = blocks.filter(b => b.id !== bid);
    items = items.filter(z => z.bid !== bid);

  }

  if (action === 'topic-up' || action === 'topic-down') {

    const j = i + (action === 'topic-up' ? -1 : 1);

    if (j < 0 || j >= blocks.length) return;

    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];

  }

  sortSections();
  render();
}

function initTopicBlocks() {

  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="topicDialog">

      <form id="topicForm">

        <h2>Apartado temático</h2>

        <input type="hidden" id="topicSectionId">
        <input type="hidden" id="topicBlockId">

        <label>
          Tema obligatorio
          <input id="topicName"
            list="topicSuggestions"
            maxlength="200"
            required
            placeholder="Ej. Funciones cuadráticas">
          <datalist id="topicSuggestions"></datalist>
        </label>

        <label>
          Subtema
          <input id="topicSubtopic"
            placeholder="Opcional">
        </label>

        <label>
          Indicador de aprendizaje
          <textarea id="topicIndicator"
            rows="3"
            placeholder="Aprendizaje que se desea evaluar">
          </textarea>
        </label>

        <label>
          Puntos por ítem o acierto
          <input id="topicPoints"
            type="number" min="0.1"
            step="any" required>
        </label>

        <label>
          <input type="checkbox" id="topicVisible">
          Mostrar el tema en el examen impreso
        </label>

        <div class="topic-block-actions">

          <button type="button"
            onclick="document.getElementById('topicDialog').close()">
            Cancelar
          </button>

          <button type="submit">
            Guardar apartado
          </button>

        </div>

      </form>

    </dialog>
  `);

  $('topicForm').onsubmit = e => {

    e.preventDefault();

    const section = examSections().find(
      s => s.id === $('topicSectionId').value
    );

    if (!section) return;

    const topic = $('topicName').value.trim();
    const p = Number($('topicPoints').value);

    if (!topic || !Number.isFinite(p) || p <= 0) return;

    const blocks = topicBlocks(section);

    let block = blocks.find(
      b => b.id === $('topicBlockId').value
    );

    if (!block) {
      block = newTopicBlock(topic);
      blocks.push(block);
    }

    block.topic = topic;
    block.subtopic = $('topicSubtopic').value.trim();
    block.indicator = $('topicIndicator').value.trim();
    block.defaultPoints = p;
    block.visible = $('topicVisible').checked;

    items.filter(z => z.bid === block.id)
      .forEach(z => { z.topic = topic; });

    $('topicDialog').close();

    sortSections();
    render();

    say('Apartado guardado: ' + topic);
  };

}
