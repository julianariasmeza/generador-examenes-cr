'use strict';

const assert = require('node:assert/strict');

const ExcelJS = require(
  '../vendor/exceljs/exceljs.min.js'
);

const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_PATH || 'playwright'
);

async function test(name, engine) {

  const browser = await engine.launch();

  try {

    const page = await browser.newPage({
      acceptDownloads: true
    });

    const errors = [];

    page.on('pageerror', e => {
      errors.push(e.message);
    });

    await page.goto(
      process.env.TEST_URL ||
      'http://127.0.0.1:8766'
    );

    await page.click('#blankExam');
    await page.click('#openSpecifications');

    await page.evaluate(() => {

      specDraft.regional = 'Cartago';
      specDraft.preliminaryPoints = 50;

      specDraft.rows = [

        STEMSpecifications.createRow({
          topic: 'Funciones',
          learning: 'Analizar funciones',
          indicator: 'Calcula imagenes',
          lessons: 23,
          distribution: {sel: 46}
        }),

        STEMSpecifications.createRow({
          topic: 'Ecuaciones',
          learning: 'Resolver ecuaciones',
          indicator: 'Determina soluciones',
          lessons: 2,
          overridePoints: 2,
          adjustmentReason: 'Ajuste de puntaje',
          distribution: {short: 2}
        })
      ];

      renderSpecifications();
    });

    const pending = page.waitForEvent('download');

    await page.click('#specExportExcel');

    const download = await pending;

    assert.match(
      download.suggestedFilename(),
      /\.xlsx$/
    );

    const path = await download.path();

    const workbook = new ExcelJS.Workbook();

    const buffer = require('node:fs').readFileSync(path);

    await workbook.xlsx.load(buffer);

    assert.equal(workbook.worksheets.length, 3);

    console.log(name + ' | Tres hojas: OK');

    const sheet = workbook.getWorksheet(
      'Especificaciones'
    );

    assert.equal(sheet.getCell('B8').value, 50);
    assert.equal(sheet.getCell('B9').result, 25);
    assert.equal(sheet.getCell('B10').result, 2);
    assert.equal(sheet.getCell('B11').result, 48);

    console.log(name + ' | Calculos: OK');

    assert.equal(sheet.getCell('H14').result, 46);
    assert.equal(sheet.getCell('H15').result, 2);

    assert.equal(
      sheet.getCell('H15').formula,
      'IF(ISNUMBER(G15),G15,F15)'
    );

    console.log(name + ' | Ajustes y formulas: OK');

    assert.equal(
      sheet.pageSetup.orientation,
      'landscape'
    );

    console.log(name + ' | Impresion horizontal: OK');

    const compare = workbook.getWorksheet(
      'Comparación'
    );

    assert.equal(compare.getCell('R2').result, 46);
    assert.equal(compare.getCell('R3').result, 2);
    assert.equal(compare.getCell('T4').result, 48);

    console.log(name + ' | Comparacion: OK');

    assert.deepEqual(errors, []);

    console.log(name + ' | Sin errores JavaScript: OK');

  } finally {

    await browser.close();
  }
}

(async () => {

  await test('Chromium', chromium);
  await test('WebKit', webkit);

  console.log(
    'TODAS LAS PRUEBAS DE EXPORTACION EXCEL SUPERADAS'
  );

})().catch(error => {

  console.error(error);
  process.exit(1);
});
