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

    page.on('pageerror', e => errors.push(e.message));
    page.on('dialog', d => d.accept());

    await page.goto(
      process.env.TEST_URL ||
      'http://127.0.0.1:8766'
    );

    await page.click('#blankExam');

    await page.evaluate(() => {

      for (const [k] of types) {
        $(k).value = 0;
        $(k + 'p').value = 1;
      }

      $('sel').value = 4;
      $('short').value = 2;
      $('dev').value = 1;

      generate();

    });

    const expected = [1, 2, 3, 4, 1, 2, 1];

    const numbers = await page.evaluate(
      () => questionNumbersBySection()
    );

    assert.deepEqual(numbers, expected);

    console.log(name + ' | Numeracion por seccion: OK');

    const visible = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll('#exam .question')
      ).map(q => Number(
        q.querySelector('button[data-edit]')
          .getAttribute('aria-label')
          .match(/\d+$/)[0]
      ))
    );

    assert.deepEqual(visible, expected);

    console.log(name + ' | Documento visible: OK');

    const exported = await page.evaluate(() =>
      Array.from(
        latex().matchAll(/\\textbf\{(\d+)\.\}/g),
        m => Number(m[1])
      )
    );

    assert.deepEqual(exported, expected);

    console.log(name + ' | Numeracion LaTeX: OK');

    await page.evaluate(() => {
      items.splice(1, 1);
      render();
    });

    assert.deepEqual(
      await page.evaluate(
        () => questionNumbersBySection()
      ),
      [1, 2, 3, 1, 2, 1]
    );

    console.log(name + ' | Renumeracion al eliminar: OK');

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
    'TODAS LAS PRUEBAS DE NUMERACION SUPERADAS'
  );

})().catch(error => {
  console.error(error);
  process.exit(1);
});
