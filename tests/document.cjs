const assert = require('node:assert/strict');

const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_PATH || 'playwright'
);

const URL = process.env.TEST_URL ||
  'http://127.0.0.1:8765';

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jP1sAAAAASUVORK5CYII=',
  'base64'
);

async function test(name, engine) {

  const browser = await engine.launch({
    headless: true
  });

  try {

    const page = await browser.newPage({
      viewport: { width: 1366, height: 900 }
    });

    const errors = [];

    page.on('pageerror', e => {
      errors.push(e.message);
    });

    await page.goto(URL, {
      waitUntil: 'load',
      timeout: 90000
    });

    await page.locator('#blankExam').click();

    // Encabezado institucional

    await page.locator('#documentSettings').click();

    await page.locator('#docDepartment')
      .fill('Matemática Aplicada');

    await page.locator('#docSignature')
      .setChecked(false);

    await page.locator('#docIdentity')
      .setChecked(false);

    await page.locator('#docLogo').setInputFiles({
      name: 'escudo.png',
      mimeType: 'image/png',
      buffer: png
    });

    await page.locator(
      '#documentForm button[type="submit"]'
    ).click();

    await page.locator('#documentDialog')
      .waitFor({state: 'hidden'});

    assert.equal(
      await page.locator('.institution-logo').count(),
      1
    );

    assert.ok(
      (await page.locator('.institution').innerText())
        .includes('Matemática Aplicada')
    );

    assert.equal(
      await page.locator('.student-fields > div').count(),
      2
    );

    console.log(name + ' | Encabezado: OK');

    // Crear apartado tematico

    await page.locator('#sectionType')
      .selectOption('sel');

    await page.locator('#addSection').click();

    await page.locator(
      '[data-action="topic-add"]'
    ).first().click();

    await page.locator('#topicName')
      .fill('Ecuaciones lineales');

    await page.locator('#topicPoints').fill('2');

    await page.locator(
      '#topicForm button[type="submit"]'
    ).click();

    // Generacion masiva

    await page.locator(
      '[data-action="batch"]'
    ).first().click();

    await page.locator('#batchCount').fill('5');

    await page.locator(
      '#batchForm button[type="submit"]'
    ).click();

    assert.equal(
      await page.evaluate(() => items.length),
      5
    );

    assert.equal(
      await page.evaluate(() => total()),
      10
    );

    assert.equal(
      await page.evaluate(() =>
        new Set(items.map(z => z.q)).size
      ),
      5
    );

    console.log(name + ' | Generacion masiva: OK');

    // Numeracion romana

    assert.ok(
      (await page.locator('.sectiontitle')
        .first().innerText()).startsWith('I.')
    );

    assert.ok(
      await page.evaluate(() =>
        latex().includes('I. ')
      )
    );

    console.log(name + ' | Numeracion romana: OK');

    // Varias figuras

    await page.locator(
      '#exam [data-edit]'
    ).first().click();

    await page.locator('#addFigureFiles')
      .setInputFiles([
        {
          name: 'figura1.png',
          mimeType: 'image/png',
          buffer: png
        },
        {
          name: 'figura2.png',
          mimeType: 'image/png',
          buffer: png
        }
      ]);

    await page.waitForFunction(() =>
      draftFigures.length === 2
    );

    await page.locator(
      '[data-figure="0"][data-property="width"]'
    ).fill('50');

    await page.locator(
      '[data-figure="0"][data-property="align"]'
    ).selectOption('left');

    await page.locator(
      '[data-figure="0"][data-property="caption"]'
    ).fill('Figura de prueba');

    await page.locator(
      '#editForm button[type="submit"]'
    ).click();

    await page.locator('#dialog')
      .waitFor({state: 'hidden'});

    assert.equal(
      await page.locator('.exam-figure').count(),
      2
    );

    assert.equal(
      await page.evaluate(() =>
        items[0].figures[0].width
      ),
      50
    );

    assert.equal(
      await page.evaluate(() =>
        items[0].figures[0].align
      ),
      'left'
    );

    console.log(name + ' | Figuras multiples: OK');

    // Guardado y recuperacion

    await page.locator('#save').click();

    await page.reload({waitUntil: 'load'});

    await page.locator('#load').click();

    assert.equal(
      await page.locator('.institution-logo').count(),
      1
    );

    assert.equal(
      await page.locator('.exam-figure').count(),
      2
    );

    assert.equal(
      await page.evaluate(() => total()),
      10
    );

    console.log(name + ' | Guardado: OK');

    // Impresion

    await page.emulateMedia({media: 'print'});

    assert.equal(
      await page.locator('.toolbar').isVisible(),
      false
    );

    assert.equal(
      await page.locator('#exam').isVisible(),
      true
    );

    assert.equal(
      await page.locator('.institution-logo').isVisible(),
      true
    );

    assert.deepEqual(errors, []);

    console.log(name + ' | Impresion: OK');
    console.log(name + ' | Sin errores JavaScript: OK');

  } finally {

    await browser.close();

  }
}

(async () => {

  await test('Chromium', chromium);
  await test('WebKit', webkit);

  console.log(
    'TODAS LAS PRUEBAS DEL DOCUMENTO SUPERADAS'
  );

})().catch(error => {

  console.error(error);
  process.exitCode = 1;

});
