'use strict';

/* Exam STEM CR 2.8.1 - Generacion masiva */


function batchQuestionKey(z) {

  if (
    z.k !== 'corr' &&
    (
      window.STEMGravitationRubrics?.has(z.topic) ||
      window.STEMEnergyRubrics?.has(z.topic)
    )
  ) {

    const statement = String(z.q || '')
      .replace(
        /\\s*(Justifique su respuesta\\.|Muestre el procedimiento correspondiente\\.)\\s*$/i,
        ''
      )
      .replace(/\\s+/g,' ')
      .trim();

    return JSON.stringify([
      z.topic,
      statement
    ]);

  }


  if (z.k === 'corr') {
    return JSON.stringify([
      [...z.parts].sort(),
      z.options.map(o =>
        o.split('|').slice(1).join('|').trim()
      ).sort()
    ]);
  }

  if (z.graphData) {
    return JSON.stringify([
      z.q.trim(),
      z.graphData
    ]);
  }

  return z.q.trim();
}

function generateTopicBatch(sid, bid, count) {

  const section = examSections()
    .find(s => s.id === sid);

  if (!section) return 0;

  const block = topicBlocks(section)
    .find(b => b.id === bid);

  if (!block || !hasBankTopic(block.topic)) {
    say('Este tema no tiene banco automático.');
    return 0;
  }

  if (!Number.isInteger(count) ||
      count < 1 || count > 100) {
    say('Ingresá una cantidad entre 1 y 100.');
    return 0;
  }

  const generated = [];
  const existing = new Set(items.map(batchQuestionKey));

  try {

    for (let i = 0; i < count; i++) {

      let found = null;

      for (let attempt = 0; attempt < 200; attempt++) {

        const candidate = make(
          section.k,
          block.defaultPoints,
          block.topic
        );

        const key = batchQuestionKey(candidate);

        if (!existing.has(key)) {

          candidate.sid = sid;
          candidate.bid = bid;

          found = candidate;
          existing.add(key);
          break;
        }
      }

      if (!found) break;

      generated.push(found);
    }

  } catch (error) {

    say(error.message);
    return 0;

  }

  items.push(...generated);

  sortSections();
  render();

  say(
    'Se agregaron ' + generated.length +
    ' de ' + count + ' preguntas solicitadas.'
  );

  return generated.length;
}

function openBatchDialog(sid, bid) {

  const section = examSections()
    .find(s => s.id === sid);

  if (!section) return;

  const block = topicBlocks(section)
    .find(b => b.id === bid);

  if (!block || !hasBankTopic(block.topic)) {
    return say('Tema sin banco automático.');
  }

  $('batchSection').value = sid;
  $('batchBlock').value = bid;
  $('batchTopic').textContent = block.topic;
  $('batchCount').value = 5;

  updateBatchSummary();

  $('batchDialog').showModal();
}

function updateBatchSummary() {

  const section = examSections()
    .find(s => s.id === $('batchSection').value);

  if (!section) return;

  const block = topicBlocks(section)
    .find(b => b.id === $('batchBlock').value);

  if (!block) return;

  const n = Number($('batchCount').value);

  $('batchSummary').textContent =
    section.k === 'corr'
      ? n + ' ejercicios de correspondencia. ' +
        fmt(block.defaultPoints) + ' puntos por acierto.'
      : n + ' preguntas × ' +
        fmt(block.defaultPoints) + ' puntos = ' +
        fmt(n * block.defaultPoints) + ' puntos.';
}

function initBatchGenerator() {

  document.body.insertAdjacentHTML('beforeend', `
    <dialog id="batchDialog">
      <form id="batchForm">

        <h2>Generar preguntas</h2>

        <input type="hidden" id="batchSection">
        <input type="hidden" id="batchBlock">

        <strong id="batchTopic"></strong>

        <label>Cantidad de preguntas
          <input type="number"
                 id="batchCount"
                 min="1"
                 max="100"
                 step="1"
                 required>
        </label>

        <p id="batchSummary"></p>

        <p class="hint">
          Se evitarán enunciados repetidos.
          La cantidad depende del banco disponible.
        </p>

        <div class="dialog-actions">

          <button type="button"
            onclick="document.getElementById('batchDialog').close()">
            Cancelar
          </button>

          <button type="submit" class="primary">
            Generar preguntas
          </button>

        </div>
      </form>
    </dialog>
  `);

  $('batchCount').oninput = updateBatchSummary;

  $('batchForm').onsubmit = e => {

    e.preventDefault();

    const sid = $('batchSection').value;
    const bid = $('batchBlock').value;
    const count = Number($('batchCount').value);

    $('batchDialog').close();

    generateTopicBatch(sid, bid, count);
  };
}
