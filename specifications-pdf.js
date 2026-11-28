'use strict';

/* Exam STEM CR 2.8.4.3
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

  const itemNumber = n =>
    Number(n) === 0 ? '–' : number(n);

  const decimal = n =>
    Number(n).toFixed(2).replace('.', ',');

  const field = (label, value) =>
    `<div class="field">
      <strong>${esc(label)}</strong>
      <span>${esc(value ?? '')}</span>
    </div>`;

  const logo = config.document?.logo || '';

  const safeLogo =
    /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/
      .test(logo);

  const learningSpans = result.rows.map((r, i) => {
    const learning = String(r.learning || '').trim();

    if (!learning) return 1;

    if (i > 0 &&
        String(result.rows[i - 1].learning || '').trim() === learning) {
      return 0;
    }

    let span = 1;

    while (
      result.rows[i + span] &&
      String(result.rows[i + span].learning || '').trim() === learning
    ) {
      span++;
    }

    return span;
  });

  const rows = result.rows.map((r, i) => `
    <tr>
      <td class="center">${i + 1}</td>
      ${learningSpans[i] ? `
        <td class="learning" rowspan="${learningSpans[i]}">
          ${esc(r.learning)}
        </td>
      ` : ''}
      <td>${esc(r.indicator)}</td>
      <td class="center">${number(r.lessons)}</td>
      <td class="center">${decimal(r.partialPoints)}</td>
      <td class="center points">${number(r.finalPoints)}</td>

      ${visibleTypes.map(t => `
        <td class="center">
          ${itemNumber(r.distribution[t.key])}
        </td>
      `).join('')}

    </tr>
  `).join('');

  const adjustments = result.rows.filter(
    r => r.overridePoints !== null &&
         r.overridePoints !== r.recommendedPoints
  );

  const columns = 6 + visibleTypes.length;

  const itemWidth = 4;
  const textWidth = 78 - itemWidth * visibleTypes.length;

  const learningWidth = textWidth * 22 / 46;
  const indicatorWidth = textWidth * 24 / 46;

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
  font-family: Arial, Helvetica, sans-serif;
  font-size: 9pt;
  line-height: 1.25;
  color: #111827;
  background: white;
  margin: 0;
}

.document {
  width: 100%;
  margin: auto;
}

.institution {
  position: relative;
  text-align: center;
  background: #1F3864;
  color: white;
  padding: 9px 12px;
  margin-bottom: 10px;
}

.institution img {
  max-width: 45px;
  max-height: 45px;
  object-fit: contain;
  margin-bottom: 4px;
}

.institution p {
  font-size: 12pt;
  margin: 0 0 6px;
}

.institution h1 {
  font-size: 12pt;
  margin: 0;
}

.metadata {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  padding: 0 8px;
  margin-bottom: 12px;
  font-size: 9pt;
  break-inside: avoid;
}

.field {
  display: grid;
  grid-template-columns: 43% minmax(0, 1fr);
  align-items: baseline;
  gap: 4px;
  margin-bottom: 3px;
}

.field strong {
  font-weight: 700;
}

.field span {
  min-height: 15px;
  border-bottom: 1px solid #B8C4D6;
  padding: 1px 3px;
  overflow-wrap: anywhere;
}

table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 8.5pt;
}

th, td {
  border: 0.7px solid #B8C4D6;
  padding: 6px 4px;
  vertical-align: middle;
}

td {
  white-space: pre-line;
  overflow-wrap: anywhere;
}

th {
  background: #1F3864;
  color: white;
  text-align: center;
  font-weight: 700;
  word-break: normal;
  padding-left: 2px;
  padding-right: 2px;
}

thead tr:last-child th {
  white-space: nowrap;
  padding: 4px 1px;
}

tbody tr:nth-child(even) td {
  background: #F3F6FB;
}

.center {
  text-align: center;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow-wrap: normal;
  word-break: keep-all;
  padding-left: 1px;
  padding-right: 1px;
}

.points {
  font-weight: 700;
}

.total td {
  white-space: nowrap;
  overflow-wrap: normal;
  word-break: keep-all;
  background: #1F3864 !important;
  color: white;
  font-weight: 700;
  text-align: center;
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
  margin: 9px 5px 0;
}

.notes p {
  margin: 4px 0;
}

.signatures {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20%;
  padding: 0 8%;
  margin-top: 32px;
  break-inside: avoid;
  page-break-inside: avoid;
}

.signature {
  border-top: 1px solid #111827;
  text-align: center;
  padding-top: 4px;
  font-size: 8.5pt;
}

.toolbar {
  padding: 12px;
  background: #EAF1FB;
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
  background: #FFF8E1;
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

  * {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .toolbar, .warning, .screen-only {
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

  <h1>TABLA DE ESPECIFICACIONES</h1>

</header>

<section class="metadata">

  <div>

    ${field('Centro educativo', config.school)}
    ${field('Dirección Regional', spec.regional)}
    ${field('Docente', config.teacher)}
    ${field('Asignatura', config.subject)}
    ${field('Nivel', config.level)}
    ${field('Período', config.period)}
    ${field('Prueba', config.test)}
    ${field('Fecha', config.date)}

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
    <col style="width:4%">
    <col style="width:${learningWidth}%">
    <col style="width:${indicatorWidth}%">
    <col style="width:5%">
    <col style="width:7%">
    <col style="width:6%">
    ${visibleTypes.map(() =>
      `<col style="width:${itemWidth}%">`
    ).join('')}
  </colgroup>

  <thead>

    <tr>

      <th rowspan="${visibleTypes.length ? 2 : 1}">N.º</th>
      <th rowspan="${visibleTypes.length ? 2 : 1}">Aprendizaje</th>
      <th rowspan="${visibleTypes.length ? 2 : 1}">Indicador</th>
      <th rowspan="${visibleTypes.length ? 2 : 1}">Lecc.</th>
      <th rowspan="${visibleTypes.length ? 2 : 1}">Pts.<br>parciales</th>
      <th rowspan="${visibleTypes.length ? 2 : 1}">Puntos</th>

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
    ` : ''}

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

      <td colspan="3">TOTAL</td>

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
          ${itemNumber(result.distribution[t.key])}
        </td>
      `).join('')}

    </tr>

  </tbody>

</table>

</div>

<section class="notes">

  <p><strong>Nota:</strong>
    Pts. parciales = lecciones × constante.
    Su suma puede diferir de la puntuación por el redondeo.
    Los puntos se distribuyen en enteros hasta sumar
    la puntuación definitiva.
  </p>

  <p><strong>Simbología:</strong>
    SR: Selección de respuesta ·
    CO: Correspondencia ·
    ID: Identificación ·
    RC: Respuesta corta ·
    RR: Respuesta restringida ·
    RE: Respuesta extensa ·
    RP: Resolución de problemas ·
    DE: Desarrollo.
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
    `<p class="screen-only">${esc(w)}</p>`
  ).join('')}

</section>

${spec.showSignature !== false ? `
  <div class="signatures">
    <div class="signature">
      Firma del docente
    </div>
    <div class="signature">
      V.º B.º Coordinación / Dirección
    </div>
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
