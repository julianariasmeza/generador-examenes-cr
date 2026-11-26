const assert = require('node:assert/strict');

const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_PATH || 'playwright'
);

const URL = process.env.TEST_URL ||
  'http://127.0.0.1:8765';

const sizes = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 }
];

async function test(name, engine) {

  const browser = await engine.launch({
    headless: true
  });

  try {

    for (const size of sizes) {

      const page = await browser.newPage({
        viewport: size,
        deviceScaleFactor: 1,
        hasTouch: size.width <= 1000
      });

      const errors = [];

      page.on('pageerror', error => {
        errors.push(error.message);
      });

      await page.goto(URL, {
        waitUntil: 'load',
        timeout: 90000
      });

      await page.locator('#blankExam').click();

      await page.locator('#sectionType')
        .selectOption('short');

      await page.locator('#addSection').click();

      await page.locator(
        '[data-action="topic-add"]'
      ).first().click();

      await page.locator('#topicName')
        .fill('Ecuaciones lineales');

      await page.locator(
        '#topicForm button[type="submit"]'
      ).click();


      await page.locator(
        '#sectionManager [data-action="automatic"]'
      ).first().click();

      assert.equal(
        await page.locator('#exam .question').count(),
        1,
        'No se pudo agregar una pregunta'
      );

      const result = await page.evaluate(() => ({
        viewport: window.innerWidth,
        documentWidth:
          document.documentElement.scrollWidth,
        navigation:
          getComputedStyle(
            document.querySelector('.mobile-nav')
          ).display
      }));

      assert.ok(
        result.documentWidth <= result.viewport + 2,
        'Desbordamiento horizontal: ' +
        JSON.stringify(result)
      );

      assert.equal(
        result.navigation !== 'none',
        size.width <= 1000,
        'Navegacion incorrecta'
      );

      await page.locator(
        '#exam [data-edit]'
      ).first().click();

      await page.locator('#dialog')
        .waitFor({ state: 'visible' });

      const dialog = await page.locator(
        '#dialog'
      ).boundingBox();

      assert.ok(
        dialog.width <= size.width + 2,
        'Ventana de edicion demasiado ancha'
      );

      await page.evaluate(() => {
        document.getElementById('dialog').close();
      });

      await page.emulateMedia({ media: 'print' });

      assert.equal(
        await page.locator('.mobile-nav').isVisible(),
        false,
        'La navegacion aparece en impresion'
      );

      assert.equal(
        await page.locator('.config').isVisible(),
        false,
        'La configuracion aparece en impresion'
      );

      assert.equal(
        await page.locator('#exam').isVisible(),
        true,
        'El examen no aparece en impresion'
      );

      assert.deepEqual(errors, []);

      console.log(
        'OK | ' + name + ' | ' +
        size.width + ' x ' + size.height
      );

      await page.close();

    }

  } finally {

    await browser.close();

  }

}

(async () => {

  await test('Chromium', chromium);
  await test('WebKit', webkit);

  console.log(
    'TODAS LAS PRUEBAS RESPONSIVE SUPERADAS'
  );

})().catch(error => {

  console.error(error);
  process.exitCode = 1;

});
