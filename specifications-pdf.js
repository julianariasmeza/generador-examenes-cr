'use strict';

/* Exam STEM CR 2.8.2-D2
   Documento institucional de especificaciones */

function buildSpecificationsPrintHTML() {

  const S = STEMSpecifications;
  const spec = S.create(specDraft);
  const result = S.calculate(spec);

  const comparison = specificationComparison(
    spec, specDraftLinks
  );

  const validation = S.validate(spec);

  const papers = {
    Carta: '11in 8.5in',
    Legal: '14in 8.5in',
    Oficio: '13in 8.5in',
    'Doble carta': '17in 11in'
  };

  const paper = papers[spec.paper] || papers.Carta;

  const visibleTypes = S.TYPES.filter(t => {

    if (!spec.hideUnusedTypes) return true;

    return result.distribution[t.key] !== 0 ||
      comparison.rows.some(
        r => r.actual[t.key] !== 0
      );
  });

  const number = n => fmt(n);

  const decimal = n =>
    Number(n).toFixed(2).replace('.', ',');

  const field = (label, value) =>
    `<div><strong>${esc(label)}:</strong>
    ${esc(value ?? '')}</div>`;

  const logo = config.document?.logo || '';

  const safeLogo =
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/
      .test(logo);

  const rows = result.rows.map((r, i) => `
    <tr>
      <td class="center">${i + 1}</td>
      <td>${esc(r.topic)}</td>
      <td>${esc(r.learning)}</td>
      <td>${esc(r.indicator)}</td>
      <td class="center">${number(r.lessons)}</td>
      <td class="center">${decimal(r.partialPoints)}</td>
      <td class="center">${number(r.finalPoints)}</td>

      ${visibleTypes.map(t => `
        <td class="center">
          ${number(r.distribution[t.key])}
        </td>
      `).join('')}

    </tr>
  `).join('');

  const adjustments = result.rows.filter(
    r => r.overridePoints !== null &&
         r.overridePoints !== r.recommendedPoints
  );

  const columns = 7 + visibleTypes.length;

  return `<!DOCTYPE html>
<html lang="es">
<head>

<meta charset="UTF-8">

<meta name="viewport"
      content="width=device-width, initial-scale=1">

<title>Tabla de especificaciones</title>

<style>

@page {
  size: ${paper};
  margin: 10mm;
}

* {
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  font-size: 10pt;
  line-height: 1.35;
  color: #111827;
  background: white;
  margin: 0;
}

.document {
  width: 100%;
  margin: auto;
}

.institution {
  text-align: center;
  margin-bottom: 12px;
}

.institution img {
  max-width: 65px;
  max-height: 65px;
  object-fit: contain;
  margin-bottom: 5px;
}

.institution h1 {
  font-size: 15pt;
  margin: 10px 0;
}

.institution p {
  margin: 3px 0;
}

.metadata {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 15px;
  font-size: 9pt;
}

.metadata div div {
  margin-bottom: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 8pt;
}

th, td {
  border: 1px solid #64748b;
  padding: 5px 4px;
  vertical-align: middle;
  overflow-wrap: anywhere;
}

td {
  white-space: pre-wrap;
}

th {
  background: #dce6f1;
  text-align: center;
}

.center {
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.total td {
  background: #dce6f1;
  font-weight: bold;
}

thead {
  display: table-header-group;
}

tr {
  break-inside: avoid;
  page-break-inside: avoid;
}

.notes {
  font-size: 8pt;
  margin-top: 12px;
}

.notes p {
  margin: 5px 0;
}

.signature {
  margin: 40px auto 10px;
  width: 230px;
  text-align: center;
  border-top: 1px solid #111827;
  padding-top: 5px;
  break-inside: avoid;
}

.toolbar {
  padding: 12px;
  background: #e8eff7;
  text-align: center;
  margin-bottom: 15px;
}

.toolbar button {
  padding: 9px 18px;
  margin: 3px;
  cursor: pointer;
  font-size: 10pt;
}

.warning {
  border: 1px solid #b45309;
  padding: 8px;
  margin-bottom: 12px;
  color: #92400e;
}

@media screen {

  body {
    padding: 20px;
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    min-width: 850px;
  }
}

@media print {

  .toolbar {
    display: none !important;
  }

  body {
    padding: 0;
    margin: 0;
  }

  table {
    min-width: 0;
  }

  .table-wrap {
    overflow: visible;
  }

  th, .total td {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}

</style>
</head>

<body>

<div class="toolbar">
  <button id="printSpecifications">
    Imprimir / Guardar como PDF
  </button>

  <button id="closeSpecifications">
    Cerrar
  </button>
</div>

<main class="document">

<header class="institution">

  ${safeLogo
    ? `<img src="${logo}" alt="Logo institucional">`
    : ''}

  <p><strong>MINISTERIO DE EDUCACIÓN PÚBLICA</strong></p>

  <p>Dirección Regional de Educación:
    ${esc(spec.regional)}</p>

  <h1>TABLA DE ESPECIFICACIONES</h1>

</header>

<section class="metadata">

  <div>

    ${field('Centro educativo', config.school)}
    ${field('Docente', config.teacher)}
    ${field('Asignatura', config.subject)}
    ${field('Nivel', config.level)}
    ${field('Período', config.period)}
    ${field('Fecha', config.date)}
    ${field('Prueba', config.test)}

  </div>

  <div>

    ${field('Valor porcentual', (config.weight || 0) + ' %')}
    ${field('Puntuación preliminar', number(result.preliminaryPoints))}
    ${field('Total de lecciones', number(result.totalLessons))}
    ${field('Constante', decimal(result.constant))}
    ${field('Puntuación definitiva', number(result.finalPoints))}
    ${field('Puntos distribuidos', number(result.assignedPoints))}

  </div>

</section>

${validation.valid ? '' : `
  <div class="warning">
    <strong>BORRADOR — Planificación pendiente de revisión.</strong>
    <p>${esc(validation.errors.join(' | '))}</p>
  </div>
`}

<div class="table-wrap">

<table id="specificationPrintTable">

  <colgroup>
    <col style="width:3%">
    <col style="width:12%">
    <col style="width:20%">
    <col style="width:24%">
    <col style="width:5%">
    <col style="width:6%">
    <col style="width:6%">
    ${visibleTypes.map(() =>
      `<col style="width:${24 / visibleTypes.length}%">`
    ).join('')}
  </colgroup>

  <thead>

    <tr>

      <th rowspan="2">N.º</th>
      <th rowspan="2">Tema</th>
      <th rowspan="2">Aprendizaje</th>
      <th rowspan="2">Indicador</th>
      <th rowspan="2">Lecciones</th>
      <th rowspan="2">Pts. parcial</th>
      <th rowspan="2">Puntos</th>

      ${visibleTypes.length ? `
        <th colspan="${visibleTypes.length}">
          Tipos de ítems
        </th>
      ` : ''}

    </tr>

    ${visibleTypes.length ? `
      <tr>
        ${visibleTypes.map(t =>
          `<th>${t.code}</th>`
        ).join('')}
      </tr>
    ` : '<tr></tr>'}

  </thead>

  <tbody>

    ${rows || `
      <tr>
        <td colspan="${columns}">
          No hay indicadores registrados.
        </td>
      </tr>
    `}

    <tr class="total">

      <td colspan="4">TOTAL</td>

      <td class="center">
        ${number(result.totalLessons)}
      </td>

      <td class="center">
        ${decimal(result.rows.reduce(
          (sum, r) => sum + r.partialPoints, 0
        ))}
      </td>

      <td class="center">
        ${number(result.finalPoints)}
      </td>

      ${visibleTypes.map(t => `
        <td class="center">
          ${number(result.distribution[t.key])}
        </td>
      `).join('')}

    </tr>

  </tbody>

</table>

</div>

<section class="notes">

  <p><strong>Simbología:</strong>
    ${visibleTypes.map(t =>
      esc(t.code + ': ' + t.name)
    ).join(' · ')}
  </p>

  ${adjustments.length ? `
    <p><strong>Ajustes de puntuación:</strong></p>

    ${adjustments.map(r => `
      <p>
        ${esc(r.indicator)}:
        ${number(r.recommendedPoints)}
        → ${number(r.finalPoints)} puntos.
        ${esc(r.adjustmentReason || 'Sin justificación registrada.')}
      </p>
    `).join('')}
  ` : ''}

  ${validation.warnings.map(w =>
    `<p>${esc(w)}</p>`
  ).join('')}

</section>

${spec.showSignature !== false ? `
  <div class="signature">
    Firma del docente
  </div>
` : ''}

</main>

</body>
</html>`;
}

function exportSpecificationsPDF() {

  if (!specDraft?.rows.length) {

    alert('Agregá al menos un indicador.');
    return;
  }

  const preview = window.open('', '_blank');

  if (!preview) {

    alert('Permití las ventanas emergentes para generar el PDF.');
    return;
  }

  try {

    preview.opener = null;

    preview.document.open();

    preview.document.write(
      buildSpecificationsPrintHTML()
    );

    preview.document.close();

    preview.document
      .getElementById('printSpecifications')
      .onclick = () => preview.print();

    preview.document
      .getElementById('closeSpecifications')
      .onclick = () => preview.close();

    preview.focus();

  } catch (error) {

    preview.close();

    alert('No se pudo generar el documento: ' +
      error.message);
  }
}

function initSpecificationsPDF() {

  $('specSave').insertAdjacentHTML(
    'beforebegin',
    `<button type="button" id="specExportPDF">
       Imprimir / PDF
     </button>`
  );

  $('specExportPDF').onclick =
    exportSpecificationsPDF;
}
