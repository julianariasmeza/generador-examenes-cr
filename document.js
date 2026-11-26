'use strict';

/* Exam STEM CR 2.8.1 - Formato institucional */

function romanNumber(n) {
  const values = [
    [1000,'M'], [900,'CM'], [500,'D'],
    [400,'CD'], [100,'C'], [90,'XC'],
    [50,'L'], [40,'XL'], [10,'X'],
    [9,'IX'], [5,'V'], [4,'IV'], [1,'I']
  ];

  let result = '';

  for (const [value, symbol] of values) {
    while (n >= value) {
      result += symbol;
      n -= value;
    }
  }

  return result;
}

function sectionHeading(sec) {
  const index = examSections()
    .findIndex(s => s.id === sec.id);

  return romanNumber(index + 1) + '. ' + sec.title;
}

function documentSettings() {
  return {
    logo: '',
    department: '',
    showSignature: true,
    showIdentity: true,
    ...(config.document || {})
  };
}

function institutionalHeader(c) {

  const d = documentSettings();

  const department = d.department ||
    (c.subject === 'Matemática'
      ? 'Matemática' : 'Ciencias');

  const logo = /^data:image\/(png|jpeg|webp);base64,/
    .test(d.logo)
    ? `<img class="institution-logo"
        src="${esc(d.logo)}"
        alt="Escudo institucional">`
    : '';

  return `
    <div class="institution">

      <div class="institution-school">
        ${logo}
        <strong>${esc(c.school)}</strong>
        <div>Departamento de ${esc(department)}</div>
        <div>Docente: ${esc(c.teacher)}</div>
      </div>

      <div class="institution-test">
        <strong>${esc(c.test)}</strong>
        <div>Asignatura: ${esc(c.subject)}</div>
        <div>Nivel: ${esc(c.level)}</div>
        <div>${esc(c.period)}</div>
        <div>Fecha: ${esc(c.date)}</div>
        <div>Tiempo probable: ${esc(c.duration)} min</div>
      </div>

      <div class="institution-score">
        <div>Calificación: ______</div>
        <div>Puntos obtenidos: ______</div>
        <div>
          <strong>Puntaje total: ${fmt(total())} puntos</strong>
        </div>
        <div>Valor porcentual: ${esc(c.weight)} %</div>
        <div>Porcentaje obtenido: ______</div>
      </div>

    </div>

    <div class="student student-fields">

      <div class="student-name">
        <span>Nombre del estudiante:</span>
        <span class="student-blank"></span>
      </div>

      <div class="student-section">
        <span>Sección:</span>
        <span class="student-blank"></span>
      </div>

      ${d.showSignature ? `
        <div class="student-name">
          <span>Firma del encargado(a):</span>
          <span class="student-blank"></span>
        </div>` : ''}

      ${d.showIdentity ? `
        <div class="student-section">
          <span>Cédula:</span>
          <span class="student-blank"></span>
        </div>` : ''}

    </div>

    <h4 class="center">INSTRUCCIONES GENERALES</h4>

    <div class="instructions">
      ${esc(c.instructions)}
    </div>
  `;
}

function initDocumentSettings() {

  const dialog = $('documentDialog');

  $('documentSettings').onclick = () => {

    if (!config.paper) {
      return say('Creá primero un examen.');
    }

    const d = documentSettings();

    $('docDepartment').value = d.department;
    $('docSignature').checked = d.showSignature;
    $('docIdentity').checked = d.showIdentity;
    $('docLogo').value = '';
    $('docRemoveLogo').checked = false;

    dialog.showModal();
  };

  $('documentForm').onsubmit = async e => {

    e.preventDefault();

    const d = documentSettings();

    d.department = $('docDepartment').value.trim();
    d.showSignature = $('docSignature').checked;
    d.showIdentity = $('docIdentity').checked;

    if ($('docRemoveLogo').checked) {
      d.logo = '';
    }

    const file = $('docLogo').files[0];

    if (file) {

      if (!['image/png','image/jpeg','image/webp']
        .includes(file.type) || file.size > 500000) {

        alert('Usá PNG, JPEG o WebP de hasta 500 KB.');
        return;
      }

      try {

        d.logo = await new Promise((resolve,reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      } catch {
        alert('No se pudo leer el escudo.');
        return;
      }

    }

    config.document = d;

    dialog.close();

    render();

    say('Formato institucional actualizado.');
  };
}
