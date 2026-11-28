'use strict';

const assert = require('node:assert/strict');

const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_PATH || 'playwright'
);

async function test(name, engine) {

  const browser = await engine.launch();

  try {

    const page = await browser.newPage();

    const errors = [];

    page.on('pageerror', e =>
      errors.push(e.message)
    );

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
          indicator: 'Calcula imágenes',
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

    const pending = page.waitForEvent('popup');

    await page.click('#specExportPDF');

    const preview = await pending;

    await preview.locator(
      '#specificationPrintTable'
    ).waitFor();

    assert.match(
      await preview.locator('h1').textContent(),
      /TABLA DE ESPECIFICACIONES/
    );

    console.log(name + ' | Encabezado institucional: OK');

    const text = await preview.locator(
      '.metadata'
    ).innerText();

    assert.match(text, /Cartago|50/);
    assert.match(text, /2,00/);
    assert.match(text, /48/);

    console.log(name + ' | Calculos: OK');

    assert.equal(
      await preview.locator(
        '#specificationPrintTable tbody tr'
      ).count(),
      3
    );

    console.log(name + ' | Filas y totales: OK');

    assert.equal(
      await preview.locator('.signature').count(),
      2
    );

    assert.match(
      await preview.locator('.signature').nth(0).innerText(),
      /Firma del docente/
    );

    assert.match(
      await preview.locator('.signature').nth(1).innerText(),
      /Coordinación \/ Dirección/
    );

    console.log(name + ' | Firma: OK');

    await preview.emulateMedia({
      media: 'print'
    });

    assert.equal(
      await preview.locator('.toolbar').isVisible(),
      false
    );

    console.log(name + ' | Impresion limpia: OK');

    if (name === 'Chromium') {

      const pdf = await preview.pdf({
        preferCSSPageSize: true,
        printBackground: true
      });

      assert.ok(pdf.length > 1000);

      assert.equal(
        pdf.subarray(0, 4).toString(),
        '%PDF'
      );

      console.log(name + ' | Archivo PDF valido: OK');
    }

    await preview.close();

    const sizes = {

      Carta: '11in 8.5in',
      Legal: '14in 8.5in',
      Oficio: '13in 8.5in',
      'Doble carta': '17in 11in'
    };

    for (const [paper, expected] of Object.entries(sizes)) {

      await page.selectOption('#specPaper', paper);

      const html = await page.evaluate(() =>
        buildSpecificationsPrintHTML()
      );

      assert.ok(
        html.includes('size: ' + expected)
      );
    }

    console.log(name + ' | Cuatro tamanos de papel: OK');

    await page.uncheck('#specShowSignature');

    const html = await page.evaluate(() =>
      buildSpecificationsPrintHTML()
    );

    assert.ok(
      !html.includes('class="signature"')
    );

    console.log(name + ' | Firma opcional: OK');

    await page.check('#specHideUnused');

    const headings = await page.evaluate(() => {

      const doc = new DOMParser().parseFromString(
        buildSpecificationsPrintHTML(),
        'text/html'
      );

      return Array.from(
        doc.querySelectorAll('thead tr:last-child th')
      ).map(x => x.textContent.trim());
    });

    assert.deepEqual(headings, ['SR', 'RC']);

    console.log(name + ' | Ocultar tipos sin uso: OK');

    await page.click('#specCancel');

    await page.emulateMedia({
      media: 'print'
    });

    assert.equal(
      await page.locator('#specDialog').isVisible(),
      false
    );

    console.log(name + ' | Impresion independiente: OK');

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
    'TODAS LAS PRUEBAS DE EXPORTACION PDF SUPERADAS'
  );

})().catch(error => {

  console.error(error);
  process.exit(1);
});
