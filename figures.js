'use strict';

/* Exam STEM CR 2.8.1 - Administrador de figuras */

let draftFigures = [];

function questionFigures(z) {

  if (Array.isArray(z.figures)) {
    return z.figures;
  }

  return z.image ? [{
    src: z.image,
    width: 75,
    align: 'center',
    caption: ''
  }] : [];
}

function figureHTML(z, n) {

  return questionFigures(z).map((f, i) => {

    if (!/^data:image\/(png|jpeg|webp);base64,/
      .test(f.src)) return '';

    const width = Math.max(
      10, Math.min(100, Number(f.width) || 75)
    );

    const align = ['left','center','right']
      .includes(f.align) ? f.align : 'center';

    return `
      <figure class="exam-figure figure-${align}"
              style="width:${width}%">

        <img src="${esc(f.src)}"
             alt="${esc(f.caption ||
               'Figura ' + (i + 1) +
               ' de la pregunta ' + n)}">

        ${f.caption
          ? `<figcaption>${esc(f.caption)}</figcaption>`
          : ''}

      </figure>
    `;

  }).join('');
}

function renderFigureManager() {

  $('figureManager').innerHTML = draftFigures.map(
    (f, i) => `
      <div class="figure-card">

        <strong>Figura ${i + 1}</strong>

        <img src="${esc(f.src)}"
             alt="Vista previa de la figura">

        <label>Ancho (%)
          <input type="number"
                 min="10" max="100"
                 data-figure="${i}"
                 data-property="width"
                 value="${f.width}">
        </label>

        <label>Alineación
          <select data-figure="${i}"
                  data-property="align">
            ${[
              ['left','Izquierda'],
              ['center','Centro'],
              ['right','Derecha']
            ].map(([value,label]) =>
              `<option value="${value}"
                ${f.align === value ? 'selected' : ''}>
                ${label}
              </option>`
            ).join('')}
          </select>
        </label>

        <label>Descripción opcional
          <input data-figure="${i}"
                 data-property="caption"
                 value="${esc(f.caption || '')}">
        </label>

        <div class="figure-actions">
          <button type="button"
                  data-figure-action="up"
                  data-index="${i}"
                  ${i === 0 ? 'disabled' : ''}>↑</button>

          <button type="button"
                  data-figure-action="down"
                  data-index="${i}"
                  ${i === draftFigures.length - 1
                    ? 'disabled' : ''}>↓</button>

          <button type="button"
                  data-figure-action="delete"
                  data-index="${i}">Eliminar</button>
        </div>

      </div>
    `
  ).join('') || '<p class="hint">Sin figuras agregadas.</p>';
}

function openFigureManager(z) {

  draftFigures = questionFigures(z).map(
    f => ({...f})
  );

  renderFigureManager();
}

async function appendFigure(file) {

  if (!['image/png','image/jpeg','image/webp']
    .includes(file.type) || file.size > 2e6) {
    throw new Error(
      'Usá PNG, JPEG o WebP de hasta 2 MB.'
    );
  }

  if (draftFigures.length >= 8) {
    throw new Error(
      'Máximo de ocho figuras por pregunta.'
    );
  }

  const src = await new Promise((resolve,reject) => {

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);

  });

  draftFigures.push({
    src,
    width: 75,
    align: 'center',
    caption: ''
  });
}

function initFigureManager() {

  const host = $('figureManager');

  host.addEventListener('input', e => {

    const {figure, property} = e.target.dataset;

    if (figure === undefined) return;

    const f = draftFigures[Number(figure)];

    if (!f) return;

    if (property === 'width') {
      f.width = Math.max(
        10, Math.min(100, Number(e.target.value) || 75)
      );
    }

    if (property === 'align') {
      f.align = e.target.value;
    }

    if (property === 'caption') {
      f.caption = e.target.value;
    }

  });

  host.addEventListener('click', e => {

    const button = e.target.closest(
      '[data-figure-action]'
    );

    if (!button) return;

    const i = Number(button.dataset.index);
    const action = button.dataset.figureAction;

    if (action === 'delete') {
      draftFigures.splice(i, 1);
    } else {

      const j = i + (action === 'up' ? -1 : 1);

      if (j < 0 || j >= draftFigures.length) return;

      [draftFigures[i], draftFigures[j]] =
        [draftFigures[j], draftFigures[i]];
    }

    renderFigureManager();

  });

  $('addFigureFiles').onchange = async e => {

    try {

      for (const file of e.target.files) {
        await appendFigure(file);
      }

    } catch (error) {
      alert(error.message);
    }

    e.target.value = '';

    renderFigureManager();
  };
}
