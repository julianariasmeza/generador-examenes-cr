'use strict';

const assert = require('node:assert/strict');

const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_PATH || 'playwright'
);

const url = process.env.TEST_URL ||
  'http://127.0.0.1:8766';

async function test(name, engine) {

  const browser = await engine.launch({
    headless: true
  });

  try {

    const page = await browser.newPage({
      viewport: {
        width: 1440,
        height: 900
      }
    });

    const errors = [];

    page.on('pageerror', error => {
      errors.push(error.message);
    });

    page.on('dialog', dialog => dialog.accept());

    await page.goto(url);

    await page.click('#blankExam');

    await page.click('#openSpecifications');

    assert.equal(
      await page.locator('#specDialog').isVisible(),
      true
    );

    console.log(name + ' | Apertura de tabla: OK');

    await page.fill('#specRegional', 'Cartago');
    await page.fill('#specPreliminary', '19');

    const data = [
      {
        topic: 'Funciones',
        learning: 'Analizar funciones',
        indicator: 'Determina imagenes',
        lessons: 10,
        type: 'sel',
        points: 10
      },
      {
        topic: 'Algebra',
        learning: 'Resolver ecuaciones',
        indicator: 'Determina soluciones',
        lessons: 4,
        type: 'short',
        points: 4
      },
      {
        topic: 'Geometria',
        learning: 'Resolver problemas',
        indicator: 'Justifica procedimientos',
        lessons: 5,
        type: 'dev',
        points: 5
      }
    ];

    for (let i = 0; i < data.length; i++) {

      const row = data[i];

      await page.click('#specAdd');

      for (const field of [
        'topic',
        'learning',
        'indicator',
        'lessons'
      ]) {

        await page.locator(
          `[data-row="${i}"][data-field="${field}"]`
        ).fill(String(row[field]));
      }

      await page.locator(
        `[data-row="${i}"][data-type="${row.type}"]`
      ).fill(String(row.points));
    }

    assert.equal(
      await page.locator('#specLessons').textContent(),
      '19'
    );

    assert.equal(
      await page.locator('#specConstant').textContent(),
      '1,00'
    );

    assert.equal(
      await page.locator('#specFinal').textContent(),
      '19'
    );

    assert.equal(
      await page.locator('#specAssigned').textContent(),
      '19'
    );

    assert.match(
      await page.locator('#specValidation').textContent(),
      /completa/
    );

    console.log(name + ' | Calculo automatico: OK');

    await page.locator(
      '[data-row="0"][data-type="sel"]'
    ).fill('8');

    assert.equal(
      await page.locator('#specDifference0').textContent(),
      '2'
    );

    console.log(name + ' | Deteccion de diferencias: OK');

    await page.locator(
      '[data-row="0"][data-type="sel"]'
    ).fill('10');

    await page.click('#specSave');

    assert.equal(
      await page.locator('#specDialog').isVisible(),
      false
    );

    const saved = await page.evaluate(
      () => config.specifications
    );

    assert.equal(saved.rows.length, 3);
    assert.equal(saved.regional, 'Cartago');
    assert.equal(saved.preliminaryPoints, 19);

    console.log(name + ' | Guardado de tabla: OK');

    await page.click('#openSpecifications');

    await page.fill('#specPreliminary', '80');

    await page.click('#specCancel');

    await page.click('#openSpecifications');

    assert.equal(
      await page.locator('#specPreliminary').inputValue(),
      '19'
    );

    await page.click('#specCancel');

    console.log(name + ' | Cancelacion sin cambios: OK');

    await page.click('#save');

    await page.reload();

    await page.click('#load');

    await page.click('#openSpecifications');

    assert.equal(
      await page.locator('#specPreliminary').inputValue(),
      '19'
    );

    assert.equal(
      await page.locator('#specRows tr').count(),
      3
    );

    await page.click('#specCancel');

    console.log(name + ' | Persistencia: OK');

    await page.selectOption('#sectionType', 'sel');

    await page.click('#addSection');

    await page.locator(
      '[data-action="topic-add"]'
    ).first().click();

    await page.fill(
      '#topicName',
      'Ecuaciones lineales'
    );

    await page.fill(
      '#topicIndicator',
      'Resuelve ecuaciones de primer grado'
    );

    await page.fill('#topicPoints', '1');

    await page.click(
      '#topicForm button[type="submit"]'
    );

    await page.click('#openSpecifications');

    await page.click('#specImport');

    assert.equal(
      await page.locator('#specRows tr').count(),
      4
    );

    await page.click('#specImport');

    assert.equal(
      await page.locator('#specRows tr').count(),
      4
    );

    console.log(name + ' | Importacion sin duplicados: OK');

    await page.click('#specCancel');

    await page.emulateMedia({
      media: 'print'
    });

    assert.equal(
      await page.locator('#openSpecifications').isVisible(),
      false
    );

    console.log(name + ' | Compatibilidad de impresion: OK');

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
    'TODAS LAS PRUEBAS DE ESPECIFICACIONES SUPERADAS'
  );

})().catch(error => {

  console.error(error);

  process.exit(1);
});
