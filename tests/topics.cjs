const assert = require('node:assert/strict');

const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_PATH || 'playwright'
);

const URL = process.env.TEST_URL ||
  'http://127.0.0.1:8765';

async function test(name, engine) {

  const browser = await engine.launch({
    headless: true
  });

  try {

    const page = await browser.newPage({
      viewport: { width: 1366, height: 900 }
    });

    const errors = [];

    page.on('pageerror', e => errors.push(e.message));

    await page.goto(URL, {
      waitUntil: 'load',
      timeout: 90000
    });

    await page.locator('#blankExam').click();

    await page.locator('#sectionType')
      .selectOption('sel');

    await page.locator('#addSection').click();

    async function addTopic(topic, p, visible) {

      await page.locator(
        '[data-action="topic-add"]'
      ).first().click();

      await page.locator('#topicName').fill(topic);

      await page.locator('#topicSubtopic')
        .fill('Subtema de prueba');

      await page.locator('#topicIndicator')
        .fill('Resuelve ejercicios correctamente.');

      await page.locator('#topicPoints')
        .fill(String(p));

      await page.locator('#topicVisible')
        .setChecked(visible);

      await page.locator(
        '#topicForm button[type="submit"]'
      ).click();

    }

    await addTopic('Ecuaciones lineales', 1, false);
    await addTopic('Geometría: áreas', 2, true);

    assert.equal(
      await page.locator('.topic-block').count(), 2
    );

    await page.locator(
      '.topic-block [data-action="automatic"]'
    ).nth(0).click();

    await page.locator(
      '.topic-block [data-action="automatic"]'
    ).nth(1).click();

    let result = await page.evaluate(() => ({
      count: items.length,
      points: total(),
      sections: examSections().length,
      blocks: examSections()[0].blocks.length,
      topics: items.map(z => z.topic),
      errors: validateTopicBlocks()
    }));

    assert.equal(result.count, 2);
    assert.equal(result.points, 3);
    assert.equal(result.sections, 1);
    assert.equal(result.blocks, 2);

    assert.deepEqual(result.topics, [
      'Ecuaciones lineales',
      'Geometría: áreas'
    ]);

    assert.deepEqual(result.errors, []);

    console.log(name + ' | Temas y puntajes: OK');

    assert.equal(
      await page.locator('#exam .sectiontitle').count(),
      1
    );

    assert.deepEqual(
      await page.locator('#exam .exam-topic')
        .allTextContents(),
      ['Geometría: áreas']
    );

    const source = await page.evaluate(() => latex());

    assert.ok(
      source.includes(
        '\\subsection*{Geometría: áreas}'
      )
    );

    assert.ok(
      !source.includes(
        '\\subsection*{Ecuaciones lineales}'
      )
    );

    console.log(name + ' | Impresion y LaTeX: OK');

    await page.locator(
      '.topic-block [data-action="topic-down"]'
    ).first().click();

    assert.deepEqual(
      await page.evaluate(() => items.map(z => z.topic)),
      ['Geometría: áreas', 'Ecuaciones lineales']
    );

    console.log(name + ' | Reordenamiento: OK');

    await page.locator(
      '.topic-block [data-action="manual"]'
    ).first().click();

    await page.evaluate(() => $('dialog').close());

    await page.waitForFunction(() => items.length === 2);

    console.log(name + ' | Cancelacion: OK');

    await page.locator('#save').click();

    await page.reload({ waitUntil: 'load' });

    await page.locator('#load').click();

    assert.equal(
      await page.evaluate(() => total()), 3
    );

    assert.equal(
      await page.locator('.topic-block').count(), 2
    );

    console.log(name + ' | Guardado y recuperacion: OK');

    // Simular un examen guardado en una version anterior.

    await page.evaluate(() => {

      const data = JSON.parse(
        localStorage.getItem('stem-v2')
      );

      data.config.sections.forEach(s => delete s.blocks);

      data.items.forEach(z => delete z.bid);

      localStorage.setItem(
        'stem-v2', JSON.stringify(data)
      );

    });

    await page.locator('#load').click();

    assert.equal(
      await page.locator('.topic-block').count(), 2
    );

    assert.equal(
      await page.evaluate(() => total()), 3
    );

    assert.deepEqual(
      await page.evaluate(() => validateTopicBlocks()),
      []
    );

    console.log(name + ' | Migracion anterior: OK');

    assert.deepEqual(errors, []);

    console.log(name + ' | Sin errores JavaScript: OK');

  } finally {

    await browser.close();

  }

}

(async () => {

  await test('Chromium', chromium);
  await test('WebKit', webkit);

  console.log('TODAS LAS PRUEBAS TEMATICAS SUPERADAS');

})().catch(error => {

  console.error(error);
  process.exitCode = 1;

});
