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

    let preserve = true;

    page.on('pageerror', e => errors.push(e.message));

    page.on('dialog', async dialog => {

      if (dialog.message().includes(
        'Conservar la tabla'
      )) {

        if (preserve) await dialog.accept();
        else await dialog.dismiss();

      } else {

        await dialog.accept();
      }
    });

    await page.goto(
      process.env.TEST_URL ||
      'http://127.0.0.1:8766'
    );

    await page.click('#blankExam');

    await page.evaluate(() => {

      config.specifications =
        STEMSpecifications.create({

          preliminaryPoints: 10,

          regional: 'Cartago',

          rows: [{
            topic: 'Funciones',
            learning: 'Analizar funciones',
            indicator: 'Calcula imágenes',
            lessons: 5,
            distribution: {sel: 10}
          }]
        });

      config.specificationLinks = {
        anterior: config.specifications.rows[0].id
      };

      for (const [k] of types) {
        $(k).value = 0;
        $(k + 'p').value = 1;
      }

      $('sel').value = 1;
    });

    const original = await page.evaluate(
      () => config.specifications
    );

    await page.evaluate(() => generate());

    const saved = await page.evaluate(() => ({
      spec: config.specifications,
      links: config.specificationLinks,
      count: items.length
    }));

    assert.deepEqual(saved.spec, original);
    assert.deepEqual(saved.links, {});
    assert.equal(saved.count, 1);

    console.log(name + ' | Conservacion: OK');
    console.log(name + ' | Limpieza de vinculos: OK');

    preserve = false;

    await page.evaluate(() => generate());

    assert.equal(
      await page.evaluate(
        () => Boolean(config.specifications)
      ),
      false
    );

    console.log(name + ' | Nueva planificacion: OK');

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
    'TODAS LAS PRUEBAS DE PROTECCION SUPERADAS'
  );

})().catch(error => {

  console.error(error);
  process.exit(1);
});
