'use strict';

const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_PATH || 'playwright'
);

async function inspect(name, engine, width, height, keyboard) {

  const browser = await engine.launch();

  try {

    const page = await browser.newPage({
      viewport: { width, height }, locale: 'es-CR'
    });

    page.on('pageerror', e =>
      console.log('ERROR:', e.message)
    );

    page.on('dialog', d => d.accept());

    await page.goto(
      process.env.TEST_URL ||
      'http://127.0.0.1:8766'
    );

    await page.waitForSelector('#visualMath', {
      state: 'attached',
      timeout: 30000
    });

    await page.click('#blankExam');

    await page.evaluate(() => {
      for (const [k] of types) {
        $(k).value = 0;
        $(k + 'p').value = 1;
      }

      $('sel').value = 1;
      generate();
    });

    await page.locator('[data-edit="0"]').click();

    await page.locator(
      '#dialog .formula-trigger'
    ).first().click();

    await page.evaluate(() => {



      const mf = document.getElementById('visualMath');

      mf.value = 'x^2+5';
      mf.focus();

    });


    if (keyboard) {
      await page.click('#showKeyboard');
      await page.waitForTimeout(700);
    }

    console.log(
      'RESOLUCION:', width, height,
      '| TECLADO:', keyboard
    );

    await page.locator(
      '#visualMath .ML__menu-toggle'
    ).click({timeout: 10000});

    await page.waitForTimeout(500);

    const data = await page.evaluate(() => {

      const result = [];

      function inspectRoot(root) {

        for (const el of root.querySelectorAll('*')) {

          if (el.shadowRoot) inspectRoot(el.shadowRoot);

          const part = el.getAttribute('part') || '';
          const cls = el.getAttribute('class') || '';

          if (!/menu|submenu|scrim/i.test(
            el.tagName + ' ' + part + ' ' + cls
          )) continue;

          const r = el.getBoundingClientRect();

          if (!r.width || !r.height) continue;

          const css = getComputedStyle(el);

          if (css.visibility === 'hidden') continue;

          result.push({
            tag: el.tagName,
            id: el.id,
            class: cls,
            part,
            position: css.position,
            overflowX: css.overflowX,
            overflowY: css.overflowY,
            zIndex: css.zIndex,
            x: Math.round(r.x),
            y: Math.round(r.y),
            width: Math.round(r.width),
            height: Math.round(r.height),
            outsideViewport:
              r.left < 0 ||
              r.top < 0 ||
              r.right > innerWidth ||
              r.bottom > innerHeight
          });

        }
      }

      inspectRoot(document);

      return result;

    });

    console.log('===== ' + name + ' =====');
    console.log('Menu principal:', data.filter(e => e.tag === 'MENU'));
    const ancestors = await page.locator(
      'menu.ui-menu-container:visible'
    ).first().evaluate(el => {
      const result = [];

      while (el) {
        const css = getComputedStyle(el);
        const r = el.getBoundingClientRect();

        result.push({
          tag: el.tagName,
          id: el.id,
          class: el.className,
          overflowX: css.overflowX,
          overflowY: css.overflowY,
          position: css.position,
          zIndex: css.zIndex,
          contain: css.contain,
          transform: css.transform,
          clipPath: css.clipPath,
          width: Math.round(r.width),
          height: Math.round(r.height)
        });

        el = el.parentElement ||
          el.getRootNode().host || null;
      }

      return result;
    });

    console.log(
      'CONTENEDORES:',
      JSON.stringify(ancestors)
    );

    const submenus = page.locator(
      'menu.ui-menu-container:visible > li[aria-haspopup="true"]'
    );

    const count = await submenus.count();

    console.log('SUBMENUS ENCONTRADOS:', count);

    for (let i = 0; i < count; i++) {

      const item = submenus.nth(i);

      if (!(await item.isVisible())) continue;

      const label = await item.innerText();

      await item.hover();
      await page.waitForTimeout(600);

      const menus = await page.locator(
        'menu.ui-menu-container:visible'
      ).evaluateAll(elements => elements.map(el => {

        const r = el.getBoundingClientRect();

        return {
          hitTest: Array.from(
            el.querySelectorAll(':scope > li[part="menu-item"]')
          ).filter(item => {
            const b = item.getBoundingClientRect();
            return b.width > 0 && b.height > 0;
          }).map(item => {
            const b = item.getBoundingClientRect();
            const root = item.getRootNode();
            const hit = root.elementFromPoint(
              b.left + b.width / 2,
              b.top + b.height / 2
            );

            return {
              label: item.innerText.slice(0, 40),
              blocked: !hit || !item.contains(hit)
            };
          }),
          text: el.innerText.slice(0, 100),
          x: Math.round(r.x),
          y: Math.round(r.y),
          width: Math.round(r.width),
          height: Math.round(r.height),
          outsideViewport:
            r.left < 0 ||
            r.top < 0 ||
            r.right > innerWidth ||
            r.bottom > innerHeight
        };

      }));

      console.log('SUBMENU:', label);
      console.log(JSON.stringify(menus, null, 2));

      await page.screenshot({
        path: '/tmp/stem-submenu-' + name + '-' + i + '.png'
      });
    }


    await page.screenshot({
      path: '/tmp/stem-menu-' + name + '.png'
    });

  } finally {

    await browser.close();

  }
}

(async () => {

  for (const [name, engine] of [
    ['Chromium', chromium],
    ['WebKit', webkit]
  ]) {
    for (const [w, h] of [
      [1440, 900],
      [1280, 720],
      [1024, 600],
      [390, 844]
    ]) {
      for (const keyboard of [false, true]) {
        try {
          await inspect(name, engine, w, h, keyboard);
        } catch (error) {
          console.log('FALLO:', name, w, h,
            keyboard, error.message);
        }
      }
    }
  }

})().catch(error => {

  console.error(error);
  process.exit(1);

});
