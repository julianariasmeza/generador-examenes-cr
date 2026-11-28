'use strict';

/* Exam STEM CR 2.8.2-D
   Exportacion de especificaciones a Excel */

async function buildSpecificationsWorkbook() {

  const S = STEMSpecifications;
  const spec = S.create(specDraft);
  const result = S.calculate(spec);
  const comparison = specificationComparison(
    spec, specDraftLinks
  );

  const workbook = new ExcelJS.Workbook();

  workbook.creator = 'Exam STEM CR';
  workbook.created = new Date();
  workbook.calcProperties.fullCalcOnLoad = true;

  const navy = 'FF17365D';
  const light = 'FFE8EFF7';
  const editable = 'FFFFF2CC';

  const papers = {
    Carta: 1,
    Legal: 5,
    'Doble carta': 3,
    Oficio: 14
  };

  function setup(sheet) {

    sheet.pageSetup = {
      paperSize: papers[spec.paper] || 1,
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: .3,
        right: .3,
        top: .4,
        bottom: .4,
        header: .15,
        footer: .15
      }
    };

    sheet.properties.defaultRowHeight = 22;
  }

  function header(row) {

    row.eachCell(cell => {

      cell.font = {
        name: 'Arial',
        bold: true,
        color: {argb: 'FFFFFFFF'},
        size: 10
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {argb: 'FF1F3864'}
      };

      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true
      };
    });

    row.height = 32;
  }

  function style(cell, input = false) {

    cell.font = {
      name: 'Arial',
      size: 10,
      color: {argb: 'FF111827'}
    };

    cell.alignment = {
      vertical: 'middle',
      wrapText: true
    };

    const border = {
      style: 'thin',
      color: {argb: 'FF94A3B8'}
    };

    cell.border = {
      top: border,
      bottom: border,
      left: border,
      right: border
    };

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: {
        argb: input ? 'FFFFF8E1' : 'FFEAF1FB'
      }
    };
  }

  /* HOJA 1: ESPECIFICACIONES */

  const sheet = workbook.addWorksheet(
    'Especificaciones'
  );

  setup(sheet);

  sheet.columns = [
    {width: 7},
    {width: 40},
    {width: 45},
    {width: 12},
    {width: 12},
    {width: 13},
    {width: 12},
    {width: 13},
    ...S.TYPES.map(() => ({width: 8})),
    {width: 13},
    {width: 13},
    {width: 35}
  ];

  sheet.mergeCells('A1:S1');

  sheet.getCell('A1').value =
    'MINISTERIO DE EDUCACIÓN PÚBLICA';

  header(sheet.getRow(1));

  sheet.mergeCells('A2:S2');

  sheet.getCell('A2').value =
    'TABLA DE ESPECIFICACIONES';

  header(sheet.getRow(2));

  sheet.getCell('A4').value = 'Centro educativo';
  sheet.getCell('B4').value = config.school || '';

  sheet.getCell('A5').value = 'Docente';
  sheet.getCell('B5').value = config.teacher || '';

  sheet.getCell('A6').value = 'Asignatura';
  sheet.getCell('B6').value = config.subject || '';

  sheet.getCell('A7').value = 'Nivel';
  sheet.getCell('B7').value = config.level || '';

  sheet.getCell('A8').value = 'Puntos preliminares';
  sheet.getCell('B8').value = spec.preliminaryPoints;

  sheet.getCell('A9').value = 'Total de lecciones';

  sheet.getCell('A10').value = 'Constante';

  sheet.getCell('A11').value = 'Puntos definitivos';

  sheet.mergeCells('A3:C3');
  sheet.getCell('A3').value = 'Amarillo: datos editables';
  style(sheet.getCell('A3'), true);

  sheet.mergeCells('D3:S3');
  sheet.getCell('D3').value = 'Azul claro: calculo automatico';
  style(sheet.getCell('D3'));

  sheet.getRow(3).height = 22;

  const first = 16;
  const last = first + result.rows.length - 1;
  const totalRow = last + 1;

  sheet.getCell('B9').value = {
    formula: `SUM(D${first}:D${last})`,
    result: result.totalLessons
  };

  sheet.getCell('B10').value = {
    formula: 'IFERROR(ROUND(B8/B9,2),0)',
    result: result.constant
  };

  sheet.getCell('B10').numFmt = '0.00';

  sheet.getCell('B11').value = {
    formula: `SUM(H${first}:H${last})`,
    result: result.finalPoints
  };

  for (let r = 4; r <= 11; r++) {
    sheet.getCell(`A${r}`).font = {
      bold: true,
      name: 'Arial'
    };
    style(sheet.getCell(`B${r}`), r <= 8);
  }

  const extraMetadata = [
    [4, 'Direccion Regional', spec.regional],
    [5, 'Periodo', config.period || ''],
    [6, 'Prueba', config.test || ''],
    [7, 'Fecha', config.date || ''],
    [8, 'Valor porcentual', Number(config.weight || 0) / 100],
    [9, 'Papel', spec.paper],
    [10, 'Puntos distribuidos', {
      formula: `SUM(Q${first}:Q${last})`,
      result: result.assignedPoints
    }],
    [11, 'Puntos pendientes', {
      formula: `SUM(R${first}:R${last})`,
      result: result.difference
    }]
  ];

  for (const [r, label, value] of extraMetadata) {

    sheet.mergeCells(`D${r}:H${r}`);
    sheet.mergeCells(`I${r}:S${r}`);

    const labelCell = sheet.getCell(`D${r}`);
    const valueCell = sheet.getCell(`I${r}`);

    labelCell.value = label;
    labelCell.font = {
      name: 'Arial',
      bold: true,
      size: 10
    };

    valueCell.value = value;
    style(valueCell, r <= 9);

    sheet.getRow(r).height = 24;
  }

  sheet.getCell('I8').numFmt = '0.##%';

  for (let r = 4; r <= 11; r++) {

    sheet.mergeCells(`B${r}:C${r}`);

    sheet.getCell(`A${r}`).alignment = {
      vertical: 'middle',
      wrapText: true
    };
  }

  sheet.getColumn(1).width = 9;

  sheet.getRow(15).values = [
    'N.º',
    'Aprendizaje',
    'Indicador',
    'Lecciones',
    'Puntos parciales',
    'Recomendado',
    'Ajuste manual',
    'Definitivo',
    ...S.TYPES.map(t => t.code),
    'Distribuido',
    'Diferencia',
    'Justificación'
  ];

  header(sheet.getRow(15));

  sheet.mergeCells('I14:P14');
  sheet.getCell('I14').value = 'TIPOS DE ITEMS';

  for (const col of [
    'A','B','C','D','E','F','G','H','Q','R','S'
  ]) {
    const value = sheet.getCell(col + '15').value;
    sheet.getCell(col + '15').value = null;
    sheet.mergeCells(col + '14:' + col + '15');
    sheet.getCell(col + '14').value = value;
  }

  header(sheet.getRow(14));
  sheet.getRow(14).height = 24;
  sheet.getRow(15).height = 24;

  result.rows.forEach((r, i) => {

    const n = first + i;

    sheet.getRow(n).values = [

      i + 1,
      r.learning,
      r.indicator,
      r.lessons,

      {
        formula: `ROUND(D${n}*$B$10,2)`,
        result: r.partialPoints
      },

      {
        formula: `ROUND(E${n},0)`,
        result: r.recommendedPoints
      },

      r.overridePoints,

      {
        formula: `IF(ISNUMBER(G${n}),G${n},F${n})`,
        result: r.finalPoints
      },

      ...S.TYPES.map(t => r.distribution[t.key]),

      {
        formula: `ROUND(SUM(I${n}:P${n}),2)`,
        result: r.assignedPoints
      },

      {
        formula: `ROUND(H${n}-Q${n},2)`,
        result: r.difference
      },

      r.adjustmentReason
    ];

    for (let c = 1; c <= 19; c++) {

      const cell = sheet.getCell(n, c);

      const input =
        (c >= 2 && c <= 4) ||
        c === 7 ||
        (c >= 9 && c <= 16) ||
        c === 19;

      style(cell, input);

      if (c === 1 || (c >= 4 && c <= 18)) {
        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: true
        };
        cell.numFmt = '0.##';
      }

      if (c >= 9 && c <= 16) {
        cell.numFmt = '0.##;-0.##;"–"';
      }
    }

    sheet.getCell(`E${n}`).numFmt = '0.00';

    const lines = Math.max(
      Math.ceil(r.learning.length / 40),
      Math.ceil(r.indicator.length / 45),
      Math.ceil(r.adjustmentReason.length / 35),
      3
    );

    sheet.getRow(n).height =
      Math.min(409, Math.max(48, lines * 14));
  });

  const numericValidation = {
    type: 'decimal',
    operator: 'greaterThanOrEqual',
    allowBlank: true,
    formulae: [0],
    showErrorMessage: true,
    errorStyle: 'stop',
    errorTitle: 'Valor no valido',
    error: 'Ingrese un numero mayor o igual a cero.'
  };

  sheet.getCell('B8').dataValidation = numericValidation;

  for (let n = first; n <= last; n++) {
    for (const col of [
      'D','G','I','J','K','L','M','N','O','P'
    ]) {
      sheet.getCell(`${col}${n}`).dataValidation =
        numericValidation;
    }
  }

  sheet.getCell(`A${totalRow}`).value = 'TOTAL';

  const sums = {
    D: result.totalLessons,
    E: result.rows.reduce(
      (sum, r) => sum + r.partialPoints, 0
    ),
    F: result.rows.reduce(
      (sum, r) => sum + r.recommendedPoints, 0
    ),
    H: result.finalPoints,
    Q: result.assignedPoints,
    R: result.difference
  };

  S.TYPES.forEach((t, i) => {
    sums[String.fromCharCode(73 + i)] =
      result.distribution[t.key];
  });

  for (const [col, value] of Object.entries(sums)) {

    sheet.getCell(`${col}${totalRow}`).value = {
      formula: `SUM(${col}${first}:${col}${last})`,
      result: value
    };
  }

  sheet.mergeCells(`A${totalRow}:C${totalRow}`);

  header(sheet.getRow(totalRow));

  sheet.getCell(`E${totalRow}`).numFmt = '0.00';

  sheet.mergeCells('A13:S13');

  sheet.getCell('A13').value = {
    formula:
      `IF(COUNTIF(R${first}:R${last},"<>0")=0,` +
      `"Distribucion completa",` +
      `IF(R${totalRow}>0,` +
      `"Faltan "&R${totalRow}&" puntos por distribuir",` +
      `IF(R${totalRow}<0,` +
      `"Sobran "&ABS(R${totalRow})&" puntos",` +
      `"Revisar diferencias por indicador")))`,
    result: result.rows.every(r => r.difference === 0)
      ? 'Distribucion completa'
      : result.difference > 0
        ? 'Faltan ' + result.difference +
          ' puntos por distribuir'
        : result.difference < 0
          ? 'Sobran ' + Math.abs(result.difference) +
            ' puntos'
          : 'Revisar diferencias por indicador'
  };

  style(sheet.getCell('A13'));

  sheet.getCell('A13').font = {
    name: 'Arial',
    size: 11,
    bold: true
  };

  sheet.getCell('A13').alignment = {
    horizontal: 'center',
    vertical: 'middle'
  };

  sheet.getRow(13).height = 26;

  sheet.addConditionalFormatting({
    ref: `R${first}:R${last}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'equal',
        formulae: [0],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFDCFCE7'}
          }
        }
      },
      {
        type: 'cellIs',
        operator: 'notEqual',
        formulae: [0],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFFEE2E2'}
          }
        }
      }
    ]
  });

  sheet.addConditionalFormatting({
    ref: 'A13:S13',
    rules: [
      {
        type: 'expression',
        formulae: [
          `COUNTIF($R$${first}:$R$${last},"<>0")=0`
        ],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFDCFCE7'}
          }
        }
      },
      {
        type: 'expression',
        formulae: [
          `COUNTIF($R$${first}:$R$${last},"<>0")>0`
        ],
        style: {
          fill: {
            type: 'pattern',
            pattern: 'solid',
            fgColor: {argb: 'FFFFE8C2'}
          }
        }
      }
    ]
  });

  sheet.views = [{
    state: 'frozen',
    xSplit: 3,
    ySplit: 15
  }];

  sheet.pageSetup.printTitlesRow = '14:15';

  if (spec.hideUnusedTypes) {

    S.TYPES.forEach((t, i) => {

      const actual = comparison.rows.reduce(
        (sum, row) => sum + row.actual[t.key], 0
      );

      sheet.getColumn(9 + i).hidden =
        result.distribution[t.key] === 0 &&
        actual === 0;
    });
  }

  sheet.mergeCells(
    `A${totalRow + 2}:S${totalRow + 2}`
  );

  sheet.getCell(`A${totalRow + 2}`).value =
    'Nota: los puntos parciales se calculan multiplicando las lecciones por la constante.';

  sheet.mergeCells(
    `A${totalRow + 3}:S${totalRow + 3}`
  );

  sheet.getCell(`A${totalRow + 3}`).value =
    'Simbologia: ' +
    S.TYPES.map(t => t.code + ': ' + t.name).join(' | ');

  for (const offset of [2, 3]) {
    const cell = sheet.getCell(`A${totalRow + offset}`);
    cell.font = {name: 'Arial', size: 10};
    cell.alignment = {
      wrapText: true,
      vertical: 'middle'
    };
    sheet.getRow(totalRow + offset).height =
      offset === 3 ? 32 : 24;
  }

  sheet.mergeCells(
    `A${totalRow + 5}:S${totalRow + 5}`
  );

  sheet.getCell(`A${totalRow + 5}`).value =
    spec.showSignature
      ? '______________________________  Firma del docente' +
        '                         ' +
        '______________________________  V.º B.º Coordinacion / Direccion'
      : '';

  sheet.pageSetup.printArea =
    `A1:S${totalRow + 5}`;

  /* HOJA 2: COMPARACION */

  const compare = workbook.addWorksheet(
    'Comparación'
  );

  setup(compare);

  compare.columns = [
    {width: 45},
    ...S.TYPES.flatMap(() => [
      {width: 10},
      {width: 10}
    ]),
    {width: 14},
    {width: 14},
    {width: 14}
  ];

  compare.addRow([
    'Indicador',
    ...S.TYPES.flatMap(t => [
      t.code + ' Plan',
      t.code + ' Real'
    ]),
    'Planificado',
    'Real',
    'Diferencia'
  ]);

  header(compare.getRow(1));

  comparison.rows.forEach((r, i) => {

    const source = first + i;
    const target = i + 2;

    const row = compare.addRow([

      r.indicator,

      ...S.TYPES.flatMap((t, j) => [

        {
          formula:
            `'Especificaciones'!${String.fromCharCode(73+j)}${source}`,
          result: r.distribution[t.key]
        },

        r.actual[t.key]
      ]),

      {
        formula: `'Especificaciones'!H${source}`,
        result: r.finalPoints
      },

      r.actualPoints,

      {
        formula: `ROUND(R${target}-S${target},2)`,
        result: r.remaining
      }
    ]);

    row.eachCell(cell => style(cell));

    row.height = 45;
  });

  const summary = compare.addRow([
    'TOTAL DEL EXAMEN'
  ]);

  const summaryNumber = summary.number;
  const compareLast = summaryNumber - 1;

  compare.getCell(`R${summaryNumber}`).value = {
    formula: `SUM(R2:R${compareLast})`,
    result: comparison.plannedTotal
  };

  compare.getCell(`S${summaryNumber}`).value =
    comparison.actualTotal;

  compare.getCell(`T${summaryNumber}`).value = {
    formula: `ROUND(R${summaryNumber}-S${summaryNumber},2)`,
    result: comparison.remaining
  };

  header(summary);

  compare.addRow([
    'Puntos sin vincular',
    comparison.unlinkedPoints
  ]);

  compare.addRow([
    'Preguntas sin vincular',
    questionReferences(comparison.unlinked).join('; ')
  ]);

  compare.addRow([
    'Los puntos reales corresponden al momento de exportación.'
  ]);

  compare.views = [{
    state: 'frozen',
    xSplit: 1,
    ySplit: 1
  }];

  compare.pageSetup.printTitlesRow = '1:1';

  /* HOJA 3: DATOS INSTITUCIONALES */

  const info = workbook.addWorksheet(
    'Datos institucionales'
  );

  setup(info);

  info.columns = [
    {width: 35},
    {width: 65}
  ];

  info.addRow(['Campo', 'Valor']);

  header(info.getRow(1));

  const metadata = [

    ['Dirección regional', spec.regional],
    ['Centro educativo', {formula: "'Especificaciones'!B4", result: config.school || ''}],
    ['Docente', {formula: "'Especificaciones'!B5", result: config.teacher || ''}],
    ['Asignatura', {formula: "'Especificaciones'!B6", result: config.subject || ''}],
    ['Nivel', {formula: "'Especificaciones'!B7", result: config.level || ''}],
    ['Período', config.period],
    ['Fecha', config.date],
    ['Prueba', config.test],
    ['Valor porcentual', Number(config.weight || 0) / 100],
    ['Papel', spec.paper],
    ['Puntuación preliminar', {formula: "'Especificaciones'!B8", result: spec.preliminaryPoints}],
    ['Total de lecciones', {formula: "'Especificaciones'!B9", result: result.totalLessons}],
    ['Constante', {formula: "'Especificaciones'!B10", result: result.constant}],
    ['Puntos definitivos', {formula: "'Especificaciones'!B11", result: result.finalPoints}],
    ['Puntos reales', comparison.actualTotal]
  ];

  metadata.forEach(([key, value]) => {

    const row = info.addRow([key, value ?? '']);

    row.eachCell(cell => style(cell));

    if (key === 'Valor porcentual') {
      row.getCell(2).numFmt = '0.##%';
    }

    if (key === 'Constante') {
      row.getCell(2).numFmt = '0.00';
    }
  });

  return workbook;
}

async function exportSpecificationsExcel() {

  if (!specDraft?.rows.length) {
    alert('Agregá al menos un indicador.');
    return;
  }

  const button = $('specExportExcel');

  button.disabled = true;

  try {

    const workbook =
      await buildSpecificationsWorkbook();

    const buffer =
      await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download =
      'Tabla_de_especificaciones_' +
      (config.subject || 'STEM') + '_' +
      (config.level || '') + '.xlsx';

    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 30000);

  } catch (error) {

    alert('No se pudo generar el Excel: ' + error.message);

  } finally {

    button.disabled = false;
  }
}

function initSpecificationsExcel() {

  $('specSave').insertAdjacentHTML(
    'beforebegin',
    `<button type="button" id="specExportExcel">
       Descargar Excel
     </button>`
  );

  $('specExportExcel').onclick =
    exportSpecificationsExcel;
}
