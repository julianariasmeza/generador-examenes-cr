'use strict';

const assert = require('node:assert/strict');
const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_PATH || 'playwright'
);

const URL = process.env.TEST_URL ||
  'http://127.0.0.1:8766';

const sizes = [
  [360, 800],
  [390, 844],
  [768, 1024],
  [1366, 768],
  [1920, 1080]
];

(async () => {

  for (const [name, engine] of [
    ['Chromium', chromium],
    ['WebKit', webkit]
  ]) {

    const browser = await engine.launch({
      headless: true
    });

    try {

      for (const [width, height] of sizes) {

        const page = await browser.newPage({
          viewport: { width, height },
          colorScheme: 'light',
          locale: 'es-CR'
        });

        const errors = [];

        page.on('pageerror', error =>
          errors.push(error.message)
        );

        page.on('dialog', d => d.accept());

        await page.goto(URL, {
          waitUntil: 'load'
        });

        await page.waitForSelector('#specDialog', {
          state: 'attached'
        });

        const data = await page.evaluate(() => {

          const color = (selector, property) =>
            getComputedStyle(
              document.querySelector(selector)
            )[property];

          const spec =
            document.getElementById('openSpecifications');

          const external =
            document.getElementById('openLatex2WordPro');

          return {
            background: color('body', 'backgroundColor'),
            panel: color('.config', 'backgroundColor'),
            button: color(
              '#openSpecifications', 'backgroundColor'
            ),
            paper: color('#exam', 'backgroundColor'),
            paperText: color('#exam', 'color'),
            headerSpec: !!spec.closest('.app-header'),
            headerExternal: !!external.closest('.app-header'),
            unique: document.querySelectorAll(
              '#openSpecifications'
            ).length,
            href: external.href,
            target: external.target,
            rel: external.rel,
            overflow:
              document.documentElement.scrollWidth >
              innerWidth + 2
          };

        });

        assert.equal(
          data.background, 'rgb(15, 23, 42)'
        );

        assert.equal(
          data.panel, 'rgb(30, 41, 59)'
        );

        assert.equal(
          data.button, 'rgb(45, 212, 191)'
        );

        assert.equal(
          data.paper, 'rgb(255, 255, 255)'
        );

        assert.equal(
          data.paperText, 'rgb(17, 17, 17)'
        );

        assert.equal(data.headerSpec, true);
        assert.equal(data.headerExternal, true);
        assert.equal(data.unique, 1);

        assert.equal(
          data.href, 'https://latex2wordpro.com/'
        );

        assert.equal(data.target, '_blank');
        assert.ok(data.rel.includes('noopener'));
        assert.equal(data.overflow, false);

        await page.click('#openSpecifications');

        await page.waitForSelector(
          '#specDialog[open]'
        );

        await page.click('#specAdd');

        const table = await page.evaluate(() => {

          const css = selector =>
            getComputedStyle(
              document.querySelector(selector)
            );

          return {
            background:
              css('#specDialog').backgroundColor,

            title:
              css('#specTitle').backgroundColor,

            heading:
              css('.spec-table thead th').backgroundColor,

            sticky:
              css('.spec-table thead th').position,

            total:
              css('#specTotals th').backgroundColor,

            metric:
              css('.spec-metric').backgroundColor,

            columns:
              document.querySelectorAll(
                '.spec-table thead th'
              ).length,

            rows:
              document.querySelectorAll(
                '#specRows tr'
              ).length,

            scroll:
              css('.spec-table-wrap').overflowX
          };

        });

        assert.equal(
          table.background, 'rgb(241, 245, 249)'
        );

        assert.equal(
          table.title, 'rgb(15, 23, 42)'
        );

        assert.equal(
          table.heading, 'rgb(15, 118, 110)'
        );

        assert.equal(
          table.total, 'rgb(204, 251, 241)'
        );

        assert.equal(
          table.metric, 'rgb(255, 255, 255)'
        );

        assert.equal(table.sticky, 'sticky');
        assert.equal(table.columns, 20);
        assert.ok(table.rows > 0);
        assert.equal(table.scroll, 'auto');

        await page.click('#specCancel');

        await page.emulateMedia({
          media: 'print'
        });

        const print = await page.evaluate(() => ({
          header: getComputedStyle(
            document.querySelector('.app-header')
          ).display,
          paper: getComputedStyle(
            document.querySelector('#exam')
          ).backgroundColor
        }));

        assert.equal(print.header, 'none');
        assert.equal(
          print.paper, 'rgb(255, 255, 255)'
        );

        assert.deepEqual(errors, []);

        console.log(
          `OK | ${name} | ${width} x ${height}`
        );

        await page.close();

      }

    } finally {
      await browser.close();
    }

  }

  console.log(
    'TODAS LAS PRUEBAS DEL TEMA SUPERADAS'
  );

})().catch(error => {
  console.error(error);
  process.exit(1);
});
