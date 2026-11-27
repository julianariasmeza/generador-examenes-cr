'use strict';

const assert = require('node:assert/strict');

const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_PATH || 'playwright'
);

const url = process.env.TEST_URL ||
  'http://127.0.0.1:8766';

async function test(name, engine) {

  const browser = await engine.launch();

  try {

    const page = await browser.newPage();

    const errors = [];

    page.on('pageerror', e => errors.push(e.message));

    page.on('dialog', d => d.accept());

    await page.goto(url);

    await page.click('#blankExam');

    for (const type of ['sel', 'short']) {

      await page.selectOption('#sectionType', type);

      await page.click('#addSection');

      await page.locator(
        '[data-action="topic-add"]'
      ).last().click();

      await page.fill('#topicName', 'Ecuaciones lineales');

      await page.fill(
        '#topicIndicator',
        'Resuelve ecuaciones'
      );

      await page.fill('#topicPoints', '1');

      await page.click(
        '#topicForm button[type="submit"]'
      );
    }

    await page.evaluate(() => {

      for (const section of examSections()) {

        const block = topicBlocks(section)[0];

        generateTopicBatch(
          section.id,
          block.id,
          2
        );
      }
    });

    await page.click('#openSpecifications');

    await page.fill('#specPreliminary', '4');

    await page.click('#specImport');

    assert.equal(
      await page.locator('#specRows tr').count(),
      1
    );

    console.log(name + ' | Indicador sin duplicados: OK');

    await page.locator(
      '[data-row="0"][data-field="lessons"]'
    ).fill('4');

    await page.locator(
      '[data-row="0"][data-type="sel"]'
    ).fill('2');

    await page.locator(
      '[data-row="0"][data-type="short"]'
    ).fill('2');

    await page.click('#specAutoLink');

    let result = await page.evaluate(() =>
      specificationComparison(
        specDraft,
        specDraftLinks
      )
    );

    assert.equal(result.actualTotal, 4);
    assert.equal(result.unlinkedPoints, 0);
    assert.equal(result.rows.length, 1);
    assert.equal(result.matches, true);

    console.log(name + ' | Vinculacion automatica: OK');

    await page.click('#specSave');

    await page.evaluate(() => {

      const z = items[0];

      items[0] = {
        ...make(z.k, z.p, z.topic),
        sid: z.sid,
        bid: z.bid
      };

      render();
    });

    result = await page.evaluate(() =>
      specificationComparison()
    );

    assert.equal(result.matches, true);

    console.log(name + ' | Regeneracion conserva vinculo: OK');

    await page.evaluate(() => {

      items[0].p = 2;

      render();
    });

    result = await page.evaluate(() =>
      specificationComparison()
    );

    assert.equal(result.actualTotal, 5);
    assert.equal(result.matches, false);

    console.log(name + ' | Modificacion de puntaje: OK');

    await page.evaluate(() => {

      items[0].p = 1;

      items.pop();

      render();
    });

    result = await page.evaluate(() =>
      specificationComparison()
    );

    assert.equal(result.actualTotal, 3);
    assert.equal(result.remaining, 1);

    console.log(name + ' | Eliminacion de pregunta: OK');

    await page.click('#save');

    await page.reload();

    await page.click('#load');

    result = await page.evaluate(() =>
      specificationComparison()
    );

    assert.equal(result.actualTotal, 3);
    assert.equal(result.unlinkedPoints, 0);

    console.log(name + ' | Persistencia de vinculos: OK');

    await page.click('#openSpecifications');

    await page.locator(
      '#specLinkRows select'
    ).first().selectOption('');

    result = await page.evaluate(() =>
      specificationComparison(
        specDraft,
        specDraftLinks
      )
    );

    assert.ok(result.unlinkedPoints > 0);

    await page.click('#specCancel');

    result = await page.evaluate(() =>
      specificationComparison()
    );

    assert.equal(result.unlinkedPoints, 0);

    console.log(name + ' | Cancelacion de vinculos: OK');

    await page.click('#openSpecifications');

    await page.locator('[data-remove="0"]').click();

    await page.click('#specSave');

    result = await page.evaluate(() =>
      specificationComparison()
    );

    assert.equal(result.unlinkedPoints, 3);

    console.log(name + ' | Eliminacion de indicador: OK');

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
    'TODAS LAS PRUEBAS DE VINCULACION SUPERADAS'
  );

})().catch(error => {

  console.error(error);
  process.exit(1);
});
