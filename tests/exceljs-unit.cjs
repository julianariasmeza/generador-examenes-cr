'use strict';

const assert = require('node:assert/strict');

const ExcelJS = require(
  '../vendor/exceljs/exceljs.min.js'
);

async function test() {

  const workbook = new ExcelJS.Workbook();

  const sheet = workbook.addWorksheet(
    'Especificaciones'
  );

  sheet.columns = [
    {header: 'Indicador', width: 40},
    {header: 'Lecciones', width: 15},
    {header: 'Constante', width: 15},
    {header: 'Puntos', width: 15}
  ];

  sheet.addRow([
    'Resuelve ecuaciones',
    5,
    2,
    {formula: 'B2*C2', result: 10}
  ]);

  sheet.getCell('C2').numFmt = '0.00';

  sheet.getRow(1).font = {
    bold: true,
    color: {argb: 'FFFFFFFF'}
  };

  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {argb: 'FF17365D'}
  };

  sheet.pageSetup = {
    paperSize: 1,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0
  };

  const buffer = await workbook.xlsx.writeBuffer();

  assert.ok(buffer.byteLength > 1000);

  console.log('OK | Generacion de archivo XLSX');

  const recovered = new ExcelJS.Workbook();

  await recovered.xlsx.load(buffer);

  const result = recovered.getWorksheet(
    'Especificaciones'
  );

  assert.equal(
    result.getCell('D2').formula,
    'B2*C2'
  );

  assert.equal(
    result.getCell('D2').result,
    10
  );

  console.log('OK | Formulas de Excel');

  assert.equal(
    result.getCell('C2').numFmt,
    '0.00'
  );

  console.log('OK | Formato numerico');

  assert.equal(
    result.pageSetup.orientation,
    'landscape'
  );

  console.log('OK | Orientacion horizontal');

  console.log(
    'TODAS LAS PRUEBAS DE EXCELJS SUPERADAS'
  );
}

test().catch(error => {
  console.error(error);
  process.exit(1);
});
