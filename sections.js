'use strict';

/* Exam STEM CR 2.6.2 */

function examSections() {
  if (!Array.isArray(config.sections)) {
    config.sections = [];

    items.forEach(z => {
      let section = config.sections.find(s => s.k === z.k);

      if (!section) {
        section = newSection(z.k);
        config.sections.push(section);
      }

      z.sid = section.id;
    });
  }

  return config.sections;
}

function newSection(k) {
  const instructions = {
    sel: 'Marque con una X la opción correcta.',
    corr: 'Complete las correspondencias.',
    id: 'Identifique lo solicitado.',
    short: 'Escriba la respuesta en el espacio indicado.',
    restricted: 'Responda únicamente lo que se solicita.',
    exercise: 'Resuelva los ejercicios y muestre los procedimientos.',
    problem: 'Resuelva los problemas y justifique sus respuestas.',
    dev: 'Muestre todos los procedimientos.'
  };

  return {
    id: 'sec-' + Date.now() + '-' + Math.random().toString(36).slice(2),
    k,
    title: label(k),
    instructions: config['inst_' + k] || instructions[k] || ''
  };
}

function sectionInfo(z) {
  return examSections().find(s => s.id === z.sid) || {
    id: z.sid,
    k: z.k,
    title: label(z.k),
    instructions: ''
  };
}

function sectionPoints(id) {
  return items
    .filter(z => z.sid === id)
    .reduce((a, z) => a + points(z), 0);
}

function sortSections() {
  const order = examSections().map(s => s.id);

  items.sort((a, b) =>
    order.indexOf(a.sid) - order.indexOf(b.sid)
  );
}

function blankExam() {
  if (dirty && !confirm('¿Crear otro examen? Los cambios sin guardar se perderán.')) {
    return;
  }

  if (num('font') < 8 || num('font') > 18 ||
      num('margin') < 0.5 || num('margin') > 4) {
    return say('Revisá el tamaño de letra y los márgenes.');
  }

  config = Object.fromEntries(
    fields.map(([k]) => [k, val(k)])
  );

  config.sections = [];
  items = [];
  show = false;

  render();
  say('Examen en blanco creado. Agregá las secciones.');
}

function addExamSection() {
  if (!config.paper) {
    blankExam();
    if (!config.paper) return;
  }

  const k = $('sectionType').value;
  const s = newSection(k);

  examSections().push(s);

  render();
  say('Sección agregada: ' + s.title);
}

function addSectionQuestion(id, automatic = false) {
  const s = examSections().find(x => x.id === id);

  if (!s) return;

  const defaults = types.find(t => t[0] === s.k);
  const p = defaults ? defaults[3] : 1;

  let z;

  if (automatic) {
    try {
      for (let i = 0; i < 200; i++) {
        const candidate = make(s.k, p, config.topic);

        if (s.k === 'corr' ||
            !items.some(x => x.q === candidate.q)) {
          z = candidate;
          break;
        }
      }
    } catch (error) {
      return say(error.message);
    }

    if (!z) return say('No hay más preguntas distintas disponibles.');

  } else if (s.k === 'corr') {

    z = {
      k: 'corr',
      p,
      topic: config.topic,
      q: 'Relacione los elementos de ambas columnas.',
      r: 'A, B',
      s: '',
      parts: ['Descripción 1', 'Descripción 2'],
      options: ['A | Concepto 1', 'B | Concepto 2'],
      space: 0,
      layout: 'Vertical',
      marker: 'Paréntesis',
      mode: 'Línea',
      break: false,
      rubric: [],
      image: ''
    };

  } else {

    z = {
      k: s.k,
      p,
      topic: config.topic,
      q: 'Escriba el enunciado aquí',
      r: 'Respuesta',
      s: '',
      options: [
        'Respuesta',
        'Alternativa 2',
        'Alternativa 3',
        ...(config.alternatives === '4'
          ? ['Alternativa 4'] : [])
      ],
      parts: [],
      rubric: [],
      image: '',
      space: ['dev', 'exercise', 'problem'].includes(s.k)
        ? 4 : s.k === 'restricted' ? 2 : 1,
      layout: config.layout,
      marker: config.marker,
      mode: ['short', 'id'].includes(s.k)
        ? 'Línea' : 'Recuadro',
      break: false
    };
  }

  z.sid = id;

  items.push(z);
  sortSections();

  render();

  if (!automatic) {
    edit(items.indexOf(z));
  }
}

function editExamSection(id) {
  const s = examSections().find(x => x.id === id);

  if (!s) return;

  $('sectionEditId').value = id;
  $('sectionTitle').value = s.title;
  $('sectionInstructions').value = s.instructions;

  $('sectionDialog').showModal();
}

function moveExamSection(id, direction) {
  const sections = examSections();
  const i = sections.findIndex(s => s.id === id);
  const j = i + direction;

  if (i < 0 || j < 0 || j >= sections.length) return;

  [sections[i], sections[j]] =
    [sections[j], sections[i]];

  sortSections();
  render();
}

function deleteExamSection(id) {
  const s = examSections().find(x => x.id === id);

  if (!s) return;

  if (!confirm('¿Eliminar "' + s.title +
      '" y todas sus preguntas?')) return;

  config.sections = examSections()
    .filter(x => x.id !== id);

  items = items.filter(z => z.sid !== id);

  render();
}

function renderSectionManager() {
  const host = $('sectionManager');

  if (!host) return;

  if (!config.paper) {
    host.innerHTML =
      '<p class="hint">Generá un examen o creá uno en blanco.</p>';
    return;
  }

  const sections = examSections();

  host.innerHTML = sections.map((s, i) => `
    <div class="section-card">
      <div class="section-card-heading">
        <strong>${i + 1}. ${esc(s.title)}</strong>
        <span>${fmt(sectionPoints(s.id))} pts</span>
      </div>

      <div class="section-card-meta">
        ${esc(label(s.k))} ·
        ${items.filter(z => z.sid === s.id).length} ítems
      </div>

      <div class="section-card-actions">
        <button type="button"
          data-action="edit"
          data-sid="${esc(s.id)}">Editar</button>

        <button type="button"
          data-action="up"
          data-sid="${esc(s.id)}"
          ${i === 0 ? 'disabled' : ''}>↑</button>

        <button type="button"
          data-action="down"
          data-sid="${esc(s.id)}"
          ${i === sections.length - 1 ? 'disabled' : ''}>↓</button>

        <button type="button"
          data-action="delete"
          data-sid="${esc(s.id)}">Eliminar</button>
      </div>

      <div class="section-card-actions">
        <button type="button"
          data-action="manual"
          data-sid="${esc(s.id)}">+ Pregunta manual</button>

        <button type="button"
          data-action="automatic"
          data-sid="${esc(s.id)}">+ Desde banco</button>
      </div>
    </div>
  `).join('') || '<p class="hint">Todavía no hay secciones.</p>';
}

function initSections() {
  const select = $('sectionType');

  types.forEach(([k, name]) =>
    select.add(new Option(name, k))
  );

  $('blankExam').onclick = blankExam;
  $('addSection').onclick = addExamSection;

  $('sectionManager').onclick = e => {
    const button = e.target.closest('button[data-action]');

    if (!button) return;

    const { action, sid } = button.dataset;

    if (action === 'edit') editExamSection(sid);
    if (action === 'up') moveExamSection(sid, -1);
    if (action === 'down') moveExamSection(sid, 1);
    if (action === 'delete') deleteExamSection(sid);
    if (action === 'manual') addSectionQuestion(sid);
    if (action === 'automatic') addSectionQuestion(sid, true);
  };

  $('sectionForm').onsubmit = e => {
    e.preventDefault();

    const s = examSections().find(
      x => x.id === $('sectionEditId').value
    );

    if (!s) return;

    const title = $('sectionTitle').value.trim();

    if (!title) return;

    s.title = title;
    s.instructions = $('sectionInstructions').value.trim();

    $('sectionDialog').close();

    render();
  };

  renderSectionManager();
}
