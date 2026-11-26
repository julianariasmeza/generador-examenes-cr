'use strict';
const $ = id => document.getElementById(id);

/* ---------- Configuración del formulario ---------- */
const fields = [
  ['school', 'Centro educativo', 'Liceo de Paraíso'],
  ['teacher', 'Docente', ''],
  ['subject', 'Asignatura', ['Matemática', 'Física', 'Química']],
  ['level', 'Nivel', ['Sétimo', 'Octavo', 'Noveno', 'Décimo', 'Undécimo', 'Duodécimo']],
  ['period', 'Período', ['I período', 'II período', 'Convocatoria']],
  ['date', 'Fecha', ''],
  ['duration', 'Tiempo (min)', 80],
  ['weight', 'Valor porcentual', 25],
  ['topic', 'Tema', []],
  ['paper', 'Papel', ['Carta', 'Legal', 'Doble carta', 'Oficio']],
  ['orientation', 'Orientación', ['Vertical', 'Horizontal']],
  ['font', 'Letra (pt)', 11],
  ['margin', 'Margen (cm)', 1.5],
  ['alternatives', 'Alternativas', ['3', '4']],
  ['layout', 'Opciones', ['Vertical', 'Horizontal']],
  ['marker', 'Marcador', ['Paréntesis', 'Letras', 'Casillas']],
  ['test', 'Nombre de prueba', 'II Prueba'],
  ['instructions', 'Instrucciones generales', 'Conteste con tinta azul o negra. Trabaje individualmente. Muestre los procedimientos y utilice unidades del SI.']
];
const types = [
  ['sel', 'Selección de respuesta', 10, 1],
  ['corr', 'Correspondencia', 0, 1],
  ['id', 'Identificación', 0, 1],
  ['short', 'Respuesta corta', 0, 2],
  ['restricted', 'Respuesta restringida', 0, 3],
  ['exercise', 'Resolución de ejercicios', 0, 5],
  ['problem', 'Resolución de problemas', 0, 5],
  ['dev', 'Desarrollo', 0, 5]
];
const topics = {
  'Matemática': ['Ecuaciones lineales', 'Geometría: áreas', 'Funciones lineales'],
  'Física': ['MRU', 'MRUA', 'Segunda ley de Newton'],
  'Química': ['Nomenclatura inorgánica', 'Balanceo de ecuaciones', 'Mol y masa molar']
};

function field(id, label, value) {
  const l = document.createElement('label');
  l.textContent = label;
  const el = document.createElement(Array.isArray(value) ? 'select' : 'input');
  el.id = id;
  if (Array.isArray(value)) value.forEach(v => el.add(new Option(v, v)));
  else {
    el.value = value;
    if (typeof value === 'number') { el.type = 'number'; el.min = 0; el.step = 'any'; }
  }
  l.append(el);
  return l;
}
fields.forEach(x => $('fields').append(field(...x)));
types.forEach(([k, n, c, p]) => {
  $('counts').append(field(k, n + ' (cantidad)', c), field(k + 'p', k === 'corr' ? 'Puntos por acierto' : 'Puntos por ítem', p));
});

function refresh() {
  const t = $('topic');
  t.replaceChildren();
  topics[$('subject').value].forEach(v => t.add(new Option(v, v)));
}
$('subject').onchange = refresh;
refresh();

/* ---------- Utilidades ---------- */
const val = k => $(k).value;
const num = k => Number(val(k));
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const fmt = n => String(Math.round(n * 100) / 100).replace('.', ',');
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rand(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const say = t => { $('status').textContent = t; };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Banco de preguntas ---------- */
/*BANCO-INICIO*/
const NOMEN = [
  ['NaOH', 'Hidróxido de sodio'], ['CaH₂', 'Hidruro de calcio'], ['Fe₂O₃', 'Óxido de hierro (III)'],
  ['MgO', 'Óxido de magnesio'], ['KCl', 'Cloruro de potasio'], ['Al(OH)₃', 'Hidróxido de aluminio'],
  ['HCl(ac)', 'Ácido clorhídrico'], ['CO₂', 'Dióxido de carbono'], ['CaO', 'Óxido de calcio'],
  ['NaCl', 'Cloruro de sodio'], ['H₂SO₄', 'Ácido sulfúrico'], ['HNO₃', 'Ácido nítrico']
];
const BALANCE = [
  ['H₂ + O₂ → H₂O', '2, 1, 2'], ['N₂ + H₂ → NH₃', '1, 3, 2'], ['Al + O₂ → Al₂O₃', '4, 3, 2'],
  ['Na + Cl₂ → NaCl', '2, 1, 2'], ['Fe + O₂ → Fe₂O₃', '4, 3, 2'], ['KClO₃ → KCl + O₂', '2, 2, 3'],
  ['CH₄ + O₂ → CO₂ + H₂O', '1, 2, 1, 2'], ['C₃H₈ + O₂ → CO₂ + H₂O', '1, 5, 3, 4'],
  ['Mg + O₂ → MgO', '2, 1, 2'], ['Zn + HCl → ZnCl₂ + H₂', '1, 2, 1, 1'],
  ['H₂O₂ → H₂O + O₂', '2, 2, 1'], ['Ca + H₂O → Ca(OH)₂ + H₂', '1, 2, 1, 1']
];

function question(topic) {
  const a = rand(2, 12), b = rand(3, 20), x = rand(2, 15);
  let q, r, s, wrong, extra = null;
  switch (topic) {
    case 'Ecuaciones lineales':
      q = `Determine x: ${a}x + ${b} = ${a * x + b}.`; r = String(x);
      s = `x = (${a * x + b} − ${b}) / ${a} = ${x}`; wrong = [x + 1, x + 2]; break;
    case 'Geometría: áreas':
      q = `Determine el área de un rectángulo de ${a} cm de ancho y ${b} cm de largo.`; r = `${a * b} cm²`;
      s = `A = ${a} × ${b} = ${r}`; wrong = [`${a * b + 2} cm²`, `${a * b + 5} cm²`]; break;
    case 'Funciones lineales':
      q = `Si f(x) = ${a}x + ${b}, calcule f(${x}).`; r = String(a * x + b);
      s = `f(${x}) = ${a}(${x}) + ${b} = ${r}`; wrong = [a * x + b + 1, a * x + b - 1]; break;
    case 'MRU':
      q = `Un móvil viaja a ${a} m/s durante ${b} s. Determine la distancia.`; r = `${a * b} m`;
      s = `d = vt = ${a} × ${b} = ${r}`; wrong = [`${a * b + 5} m`, `${a * b - 1} m`]; break;
    case 'MRUA':
      q = `Un móvil parte del reposo con aceleración ${a} m/s² durante ${b} s. Determine su velocidad final.`; r = `${a * b} m/s`;
      s = `v = v₀ + at = 0 + ${a} × ${b} = ${r}`; wrong = [`${a * b + 2} m/s`, `${a * b - 1} m/s`]; break;
    case 'Segunda ley de Newton':
      q = `Una masa de ${a} kg experimenta una aceleración de ${b} m/s². Determine la fuerza neta.`; r = `${a * b} N`;
      s = `F = ma = ${a} × ${b} = ${r}`; wrong = [`${a * b + 2} N`, `${a * b - 1} N`]; break;
    case 'Nomenclatura inorgánica': {
      const z = NOMEN[rand(0, NOMEN.length - 1)];
      const otros = shuffle(NOMEN.filter(y => y !== z)).slice(0, 2);
      if (Math.random() < 0.5) {
        q = `Escriba el nombre de ${z[0]}.`; r = z[1]; wrong = otros.map(y => y[1]); extra = 'Óxido de cobre (II)';
      } else {
        q = `Escriba la fórmula de: ${z[1]}.`; r = z[0]; wrong = otros.map(y => y[0]); extra = 'Cu₂O';
      }
      s = r; break;
    }
    case 'Balanceo de ecuaciones': {
      const z = BALANCE[rand(0, BALANCE.length - 1)];
      const co = z[1].split(', ').map(Number);
      const sube = i => co.map((v, j) => j === i ? v + 1 : v).join(', ');
      q = `Indique los coeficientes enteros mínimos (incluya 1) para balancear: ${z[0]}.`; r = z[1];
      s = `Coeficientes: ${r}`;
      wrong = [sube(0), co.map(v => v * 2).join(', ')];
      extra = sube(co.length - 1); break;
    }
    default:
      q = `Calcule la masa de ${a} mol de una sustancia de masa molar ${b} g/mol.`; r = `${a * b} g`;
      s = `m = nM = ${a} × ${b} = ${r}`; wrong = [`${a * b + 2} g`, `${a * b - 1} g`];
  }
  if (extra === null) {
    const m = String(r).match(/^(-?\d+)(.*)$/);
    extra = m ? String(Number(m[1]) + 7) + m[2] : 'Otra cantidad';
  }
  return { q, r, s, options: shuffle([r, ...wrong.map(String), extra].filter((v, i, arr) => arr.indexOf(v) === i)) };
}
/*BANCO-FIN*/

/* ---------- Estado del examen ---------- */
let items = [], config = {}, show = false, dirty = false;

const points = z => z.k === 'corr' ? window.STEMCorrespondence.points(z) : z.rubric?.length ? z.rubric.reduce((a, r) => a + Number(r.p), 0) : Number(z.p);
const total = () => items.reduce((a, z) => a + points(z), 0);
const section = k => items.filter(z => z.k === k).reduce((a, z) => a + points(z), 0);

function totals() {
  const t = types.reduce((a, [k]) => a + num(k) * num(k + 'p') * (k === 'corr' ? 4 : 1), 0);
  $('total').textContent = Number.isFinite(t) ? 'Puntaje previsto: ' + fmt(t) + ' puntos' : 'Revise cantidades y puntajes.';
}
$('counts').oninput = totals;
totals();

function make(k, p, topic) {
  if (!Object.values(topics).flat().includes(topic)) {
    throw new Error('No existe un banco para este tema.');
  }
  if (k === 'corr') {
    return window.STEMCorrespondence.create(p, topic, question, shuffle);
  }
  const z = question(topic);
  const n = Number(config.alternatives || 3);
  const options = shuffle([z.r, ...z.options.filter(o => o !== z.r).slice(0, n - 1)]);
  return {
    ...z, k, p, topic, options,
    space: ['dev','exercise','problem'].includes(k) ? 4 : k === 'restricted' ? 2 : 1, layout: config.layout, marker: config.marker, break: false,
    mode: ['short','id'].includes(k) ? 'Línea' : 'Recuadro', parts: [],
    rubric: ['dev','exercise','problem','restricted'].includes(k) && Number.isInteger(p) && p <= 10 ? [{ label: 'Resuelve correctamente el ejercicio y presenta el procedimiento.', p }] : [],
    image: ''
  };
}

function generate() {
  if (dirty && !confirm('¿Generar otro examen? Los cambios sin guardar se perderán.')) return;
  if (types.some(([k]) => !Number.isInteger(num(k)) || num(k) < 0 || num(k) > 100 || !Number.isFinite(num(k + 'p')) || num(k + 'p') <= 0)
    || !types.some(([k]) => num(k) > 0) || num('font') < 8 || num('font') > 18 || num('margin') < 0.5 || num('margin') > 4) {
    say('Revisá cantidades, puntajes, márgenes y tamaño de letra.');
    return;
  }
  const old = config;
  config = Object.fromEntries(fields.map(([k]) => [k, val(k)]));
  const next = [], seen = new Set();
  for (const [k] of types) {
    for (let i = 0; i < num(k); i++) {
      let z, tries = 0;
      do { z = make(k, num(k + 'p'), val('topic')); } while (k !== 'corr' && seen.has(z.q) && ++tries < 200);
      if (k !== 'corr' && seen.has(z.q)) {
        config = old;
        say(`El banco de este tema solo alcanza para ${next.length} preguntas distintas. Reducí la cantidad total o elegí otro tema.`);
        return;
      }
      seen.add(z.q);
      next.push(z);
    }
  }
  items = next;
  examSections();
  render();
  say('Examen generado. Revisá preguntas y clave.');
}

/* ---------- Presentación ---------- */
const sizes = { Carta: [8.5, 11], Legal: [8.5, 14], 'Doble carta': [11, 17], Oficio: [8.5, 13] };
const label = k => types.find(t => t[0] === k)[1];
const mark = (z, j) => z.marker === 'Letras' ? String.fromCharCode(97 + j) + '.' : z.marker === 'Casillas' ? '□' : '(   )';

function render(clean) {
  dirty = !clean && Boolean(config.paper);
  if (!config.paper) {
    $('exam').innerHTML = '';
    renderSectionManager();
    return;
  }
  examSections();
  migrateTopicBlocks();
  renderSectionManager();
  const c = config, e = $('exam');
  window.MathJax?.typesetClear?.([e]);
  e.style.fontSize = c.font + 'pt';
  const sz = [...sizes[c.paper]];
  if (c.orientation === 'Horizontal') sz.reverse();
  $('pageStyle').textContent = `@page{size:${sz[0]}in ${sz[1]}in;margin:${Number(c.margin)}cm}`;

  e.innerHTML = `<div class="institution"><div>${esc(c.school)}<br>Materia: ${esc(c.subject)}<br>Profesor: ${esc(c.teacher)}<br>Tiempo probable: ${esc(c.duration)} minutos</div><div>Departamento de ${c.subject === 'Matemática' ? 'Matemática' : 'Ciencias'}<br>${esc(c.level)} nivel<br>${esc(c.test)} – ${esc(c.period)}<br>Fecha: ${esc(c.date)}</div><div>Calificación: ______ &nbsp; % obt.: ______<br>Puntos obtenidos: ______<br><b>Puntaje total: ${fmt(total())} puntos</b><br>Porcentaje: ${esc(c.weight)} %</div></div><div class="student">Nombre: __________________________________ Sección: ______<br>Firma del encargado(a): __________________ Cédula: __________</div><h4 class="center">INSTRUCCIONES GENERALES</h4><div class="instructions">${esc(c.instructions)}</div>`;

  const especifica = { corr: 'Complete las correspondencias según las indicaciones.', sel: 'Marque con una X la opción correcta.', id: 'Identifique lo solicitado.', short: 'Escriba la respuesta en el espacio indicado.', restricted: 'Responda únicamente lo que se solicita.', exercise: 'Resuelva los ejercicios y muestre los procedimientos.', problem: 'Analice cada problema, plantee la solución y justifique su respuesta.', dev: 'Muestre todos los procedimientos y las unidades correspondientes.' };
  let last = '', lastBlock = '';
  items.forEach((z, i) => {
    const sec = sectionInfo(z);

    if (last !== sec.id) {
      e.insertAdjacentHTML('beforeend',
        `<h3 class="sectiontitle">
          ${esc(sec.title.toUpperCase())}
          <span>VALOR ${fmt(sectionPoints(sec.id))} PUNTOS</span>
        </h3>
        <p class="specific">${esc(sec.instructions)}</p>`);
      last = sec.id;
    }
    const block = topicBlockInfo(z);

    if (block && lastBlock !== block.id) {
      if (block.visible) {
        e.insertAdjacentHTML('beforeend',
          `<h4 class="exam-topic">${esc(block.topic)}</h4>`);
      }
      lastBlock = block.id;
    }

    const body = z.k === 'corr'
      ? window.STEMCorrespondence.html(z, esc, show)
      : z.k === 'sel'
      ? `<div class="options ${z.layout === 'Vertical' ? 'vertical' : ''}">${z.options.map((o, j) => `<span>${mark(z, j)} ${esc(o)}</span>`).join('')}</div>`
      : z.parts.length
        ? z.parts.map((p, j) => `<div class="workbox" style="min-height:${z.space}cm">${String.fromCharCode(97 + j)}) ${esc(p)}</div>`).join('')
        : z.mode === 'Operación / respuesta'
          ? `<div class="split" style="min-height:${z.space}cm"><div>Operación</div><div>Respuesta</div></div>`
          : z.mode === 'Línea'
            ? `<div class="line" style="min-height:${z.space}cm"></div>`
            : `<div class="workbox" style="min-height:${z.space}cm"></div>`;

    let rubric = '';
    if (z.rubric.length) {
      const cols = Math.min(10, Math.ceil(Math.max(...z.rubric.map(r => r.p)))) + 1;
      rubric = `<table class="rubric"><tr><th>Indicador</th><th>Máximo</th>${Array.from({ length: cols }, (_, j) => `<th>${j}</th>`).join('')}<th>Obtenido</th></tr>${z.rubric.map(r => `<tr><td>${esc(r.label)}</td><td>${r.p}</td>${Array.from({ length: cols }, (_, j) => `<td class="${j > r.p ? 'blocked' : ''}"></td>`).join('')}<td></td></tr>`).join('')}</table>`;
    }
    const n = i + 1;
    e.insertAdjacentHTML('beforeend', `<div class="question ${z.break ? 'pagebreak' : ''}"><div class="tools"><button type="button" data-edit="${i}" aria-label="Editar pregunta ${n}">Editar</button><button type="button" data-move="${i},-1" aria-label="Subir pregunta ${n}">↑</button><button type="button" data-move="${i},1" aria-label="Bajar pregunta ${n}">↓</button><button type="button" data-regen="${i}" aria-label="Regenerar pregunta ${n}">Regenerar</button><button type="button" data-del="${i}" aria-label="Eliminar pregunta ${n}">Eliminar</button></div><div>${n}. ${esc(z.q)}${z.k === 'sel' ? '' : z.k === 'corr' ? ` (Valor: ${fmt(points(z))} puntos; ${fmt(z.p)} por acierto)` : ` (${fmt(points(z))} pts)`}</div>${z.image ? `<img class="figure" alt="Figura de la pregunta ${n}" src="${esc(z.image)}">` : ''}${body}${rubric}<div class="answer">Respuesta: ${esc(z.r)}<br>${esc(z.s)}</div></div>`);
  });
  e.classList.toggle('show', show);
  $('solution').textContent = show ? 'Ocultar soluciones' : 'Mostrar soluciones';
  $('actual').textContent = `Puntaje actual: ${fmt(total())} puntos`;
  window.STEMMath.typeset(e);
}

/* ---------- Edición de preguntas ---------- */
function edit(i) {
  const z = items[i];
  window.STEMCorrespondence.editor(z.k === 'corr');
  $('editIndex').value = i;
  for (const k of ['q', 'r', 's', 'p', 'space', 'layout', 'marker', 'mode']) $('e_' + k).value = z[k];
  $('e_options').value = z.options.join('\n');
  $('e_parts').value = z.parts.join('\n');
  $('e_rubric').value = z.rubric.map(r => r.p + ' | ' + r.label).join('\n');
  $('e_break').checked = z.break;
  $('e_image').value = '';
  $('e_remove').checked = false;
  $('dialog').showModal();
}

$('editForm').onsubmit = async e => {
  e.preventDefault();
  const i = Number($('editIndex').value), z = { ...items[i] };
  for (const k of ['q', 'r', 's', 'layout', 'marker', 'mode']) z[k] = $('e_' + k).value.trim();
  for (const k of ['p', 'space']) z[k] = Number($('e_' + k).value);
  z.options = $('e_options').value.split('\n').map(x => x.trim()).filter(Boolean);
  z.parts = $('e_parts').value.split('\n').map(x => x.trim()).filter(Boolean);
  z.rubric = $('e_rubric').value.split('\n').filter(x => x.trim()).map(x => {
    const [p, ...l] = x.split('|');
    return { p: Number(p), label: l.join('|').trim() };
  });
  if (!z.q || !z.r || !(z.p > 0) || z.space < 0 || z.space > 20
    || z.rubric.some(r => !r.label || !Number.isInteger(r.p) || r.p < 1 || r.p > 10)
    || (z.k === 'sel' && (![3, 4].includes(z.options.length) || new Set(z.options).size !== z.options.length || !z.options.includes(z.r)))) {
    alert('Revisá el enunciado, respuesta, puntajes, espacio y alternativas (3 o 4 distintas, incluida la respuesta correcta). Rúbrica: 1–10 puntos por indicador.');
    return;
  }
  if (z.k === 'corr') {
    z.rubric = [];
    if (!window.STEMCorrespondence.validate(z)) {
      alert('Revisá las columnas y la clave. Cada símbolo debe ser único. Usá un guion para los elementos sobrantes de la columna A.');
      return;
    }
  }

  z.break = $('e_break').checked;
  if ($('e_remove').checked) z.image = '';
  const f = $('e_image').files[0];
  if (f) {
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type) || f.size > 2e6) {
      alert('Usá PNG, JPEG o WebP de hasta 2 MB.');
      return;
    }
    try {
      z.image = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(f);
      });
    } catch { alert('No se pudo leer la imagen.'); return; }
  }
  items[i] = z;
  $('dialog').close();
  render();
};

$('exam').onclick = e => {
  const d = e.target.dataset;
  if (d.edit !== undefined) edit(+d.edit);
  if (d.del !== undefined && confirm('¿Eliminar pregunta?')) { items.splice(+d.del, 1); render(); }
  if (d.move) {
    const [i, v] = d.move.split(',').map(Number), j = i + v;
    if (items[j] && items[i].sid === items[j].sid && items[i].bid === items[j].bid) { [items[i], items[j]] = [items[j], items[i]]; render(); }
  }
  if (d.regen !== undefined) {
    const i = +d.regen, z = items[i];
    for (let t = 0; t < 200; t++) {
      if (!hasBankTopic(z.topic)) {
        return say('Este tema no tiene banco automático.');
      }

      const n = make(z.k, z.p, z.topic);
      if (z.k === 'corr' || !items.some(x => x.q === n.q)) { n.sid = z.sid; n.bid = z.bid; items[i] = n; render(); return; }
    }
    say('No hay otra pregunta distinta disponible.');
  }
};

/* ---------- Botones principales ---------- */
$('generate').onclick = generate;
$('print').onclick = () => {
  if (items.length) {
    const errors = validateTopicBlocks();

    if (errors.length) {
      alert(errors.join('\n'));
      return say('Revisá los apartados antes de exportar.');
    }
  }

  if (!items.length) return say('Genere un examen antes de imprimir.');
  /* El navegador usa el título de la página como nombre sugerido del PDF. */
  const anterior = document.title;
  document.title = 'Examen ' + [config.test, config.subject, config.level].filter(Boolean).join(' - ');
  const restaurar = () => { document.title = anterior; window.removeEventListener('afterprint', restaurar); };
  window.addEventListener('afterprint', restaurar);
  window.print();
};
$('solution').onclick = () => { show = !show; render(!dirty); };
$('add').onclick = () => {
  if (!config.paper) {
    blankExam();
    if (!config.paper) return;
  }

  const k = $('addType').value;
  let sec = examSections().find(s => s.k === k);

  if (!sec) {
    sec = newSection(k);
    examSections().push(sec);
  }

  const blocks = topicBlocks(sec);

  if (blocks.length === 1 && blocks[0].topic) {
    addSectionQuestion(sec.id, false, blocks[0].id);
  } else {
    render();
    say('Seleccioná el apartado en el constructor.');
    if (!blocks.length) openTopicDialog(sec.id);
  }
};
$('apply').onclick = () => {
  if (!config.paper) return say('Creá primero un examen.');
  if (num('font') < 8 || num('font') > 18 || num('margin') < 0.5 || num('margin') > 4) { say('Revisá letra y margen.'); return; }
  for (const [k] of fields) if (!['subject', 'topic', 'alternatives', 'layout', 'marker'].includes(k)) config[k] = val(k);
  render();
  say('Encabezado y papel actualizados.');
};

/* ---------- Guardar y recuperar ---------- */
$('save').onclick = () => {
  try {
    localStorage.setItem('stem-v2', JSON.stringify({
      items, config,
      form: Object.fromEntries([...fields.map(x => x[0]), ...types.flatMap(([k]) => [k, k + 'p'])].map(k => [k, val(k)]))
    }));
    dirty = false;
    say('Examen guardado en este navegador.');
  } catch { say('No se pudo guardar: espacio local insuficiente.'); }
};
$('load').onclick = () => {
  try {
    const x = JSON.parse(localStorage.getItem('stem-v2'));
    if (!x) return say('No hay examen guardado.');
    if (!Array.isArray(x.items) || !x.config || !x.form) return say('El examen guardado está dañado.');
    $('subject').value = x.form.subject;
    refresh();
    Object.entries(x.form).forEach(([k, v]) => { if ($(k)) $(k).value = v; });
    items = x.items; config = x.config;
    examSections();
    sortSections();
    totals();
    render(true);
    say('Examen recuperado.');
  } catch { say('No se pudo recuperar.'); }
};
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- LaTeX ---------- */
const texPlain = s => String(s ?? '')
  .replace(/[\\{}%$#&_~^]/g, c => ({ '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '%': '\\%', '$': '\\$', '#': '\\#', '&': '\\&', '_': '\\_', '~': '\\textasciitilde{}', '^': '\\textasciicircum{}' }[c]))
  .replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, m => '\\textsubscript{' + [...m].map(c => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).join('') + '}')
  .replace(/²/g, '\\textsuperscript{2}').replace(/³/g, '\\textsuperscript{3}')
  .replace(/→/g, '\\ensuremath{\\to}').replace(/×/g, '\\ensuremath{\\times}')
  .replace(/≈/g, '\\ensuremath{\\approx}').replace(/Δ/g, '\\ensuremath{\\Delta}')
  .replace(/μ/g, '\\ensuremath{\\mu}').replace(/θ/g, '\\ensuremath{\\theta}')
  .replace(/°/g, '\\textdegree{}').replace(/−/g, '-');

const tex = s => window.STEMMath.exportTex(s, texPlain);

function latex() {
  const c = config, sz = [...sizes[c.paper]];
  if (c.orientation === 'Horizontal') sz.reverse();
  let out = `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage[T1]{fontenc}\n\\usepackage[spanish]{babel}\n\\usepackage{helvet,xcolor,tabularx,tcolorbox}\n\\usepackage{amsmath,amssymb,mathtools}\n\\usepackage{graphicx}\n\\usepackage{tikz,pgfplots}\n\\usepackage[version=4]{mhchem}\n\\usepackage{siunitx}\n\\usepackage{enumitem,multicol}\n\\pgfplotsset{compat=1.18}\n\\sisetup{output-decimal-marker={,}}\n\\renewcommand{\\familydefault}{\\sfdefault}\n\\usepackage[paperwidth=${sz[0]}in,paperheight=${sz[1]}in,margin=${c.margin}cm]{geometry}\n\\setlength{\\parindent}{0pt}\n\\begin{document}\n\\fontsize{${c.font}}{${(Number(c.font) * 1.2).toFixed(1)}}\\selectfont\n\\begin{tcolorbox}[colback=white,colframe=black,arc=3mm]\n${tex(c.school)}\\\\ ${tex(c.subject)} -- ${tex(c.level)} -- ${tex(c.test)} -- ${tex(c.period)}\\\\ Docente: ${tex(c.teacher)}\\\\ Fecha: ${tex(c.date)} -- Tiempo: ${tex(c.duration)} min\\\\ Calificación: \\rule{1cm}{.4pt} -- Puntos obtenidos: \\rule{1cm}{.4pt} -- Puntaje total: ${fmt(total())} -- Valor: ${tex(c.weight)}\\%\\\\ \\% obtenido: \\rule{1cm}{.4pt}\n\\end{tcolorbox}\nNombre: \\hrulefill\\quad Sección: \\rule{1cm}{.4pt}\\par Firma del encargado: \\hrulefill\\quad Cédula: \\hrulefill\n\\section*{Instrucciones generales} ${tex(c.instructions)}\n`;
  let last = '', lastBlock = '';
  items.forEach((z, i) => {
    if (z.break) out += '\\newpage\n';
    const sec = sectionInfo(z);

    if (last !== sec.id) {
      out += `\\section*{${tex(sec.title)} -- Valor ${fmt(sectionPoints(sec.id))} puntos}\n`;
      out += `${tex(sec.instructions)}\\par\n`;
      last = sec.id;
    }
    const block = topicBlockInfo(z);

    if (block && lastBlock !== block.id) {
      if (block.visible) {
        out += `\\subsection*{${tex(block.topic)}}\n`;
      }
      lastBlock = block.id;
    }

    out += `\\textbf{${i + 1}.} ${tex(z.q)}${z.k === 'sel' ? '' : z.k === 'corr' ? ` (Valor: ${fmt(points(z))} puntos; ${fmt(z.p)} por acierto)` : ` (${fmt(points(z))} pts)`}\\par\n`;
    if (z.image) out += '\\textit{Figura: insertar imagen manualmente.}\\par\n';
    if (z.k === 'corr') {
      out += window.STEMCorrespondence.latex(z, tex, show);
    } else if (z.k === 'sel') {
      out += z.options.map((o, j) => `${tex(mark(z, j) === '□' ? '( )' : mark(z, j))} ${tex(o)}`).join(z.layout === 'Vertical' ? '\\par\n' : '\\quad ') + '\\par\n';
    } else {
      const parts = z.parts.length ? z.parts : [''];
      parts.forEach((p, j) => {
        if (p) out += `${String.fromCharCode(97 + j)}) ${tex(p)}\\par\n`;
        out += `\\vspace{${z.space}cm}\\par\n`;
      });
    }
    if (z.rubric.length) {
      out += '\\begin{tabularx}{\\linewidth}{|X|c|c|}\\hline Indicador & Máximo & Obtenido \\\\ \\hline\n';
      z.rubric.forEach(r => out += `${tex(r.label)} & ${r.p} & \\\\ \\hline\n`);
      out += '\\end{tabularx}\\par\n';
    }
    if (show) out += `{\\color{violet} ${tex(z.r)}. ${tex(z.s)}}\\par\n`;
    out += '\\medskip\n';
  });
  return out + '\\end{document}\n';
}
$('latex').onclick = () => {
  if (items.length) {
    const errors = validateTopicBlocks();

    if (errors.length) {
      alert(errors.join('\n'));
      return say('Revisá los apartados antes de exportar.');
    }
  }

  if (!items.length) return say('Genere un examen antes de exportar a LaTeX.');
  $('texSource').value = latex();
  $('texDialog').showModal();
};
$('downloadTex').onclick = () => {
  const u = URL.createObjectURL(new Blob([$('texSource').value], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = u; a.download = 'examen.tex'; a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
};

initTopicBlocks();
initSections();
