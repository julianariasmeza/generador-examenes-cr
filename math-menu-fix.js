'use strict';

(() => {
  const margin = 8;
  let observer;
  let frame = 0;

  function install() {
    const mf = document.getElementById('visualMath');

    if (!mf || !mf.shadowRoot) return false;

    const root = mf.shadowRoot;

    if (root.querySelector('#stem-menu-styles')) {
      return true;
    }

    const style = document.createElement('style');

    style.id = 'stem-menu-styles';

    style.textContent = `
      .ML__menu-toggle {
        overflow: visible !important;
      }

      .ML__menu-toggle div:has(menu.ui-menu-container) {
        contain: none !important;
        overflow: visible !important;
      }

      menu.ui-menu-container {
        box-sizing: border-box !important;
        max-width: calc(100vw - 16px) !important;
        max-height: calc(100vh - 16px) !important;
        overflow: visible !important;
      }
    `;


    style.textContent += `
      .ML__menu-toggle > div > menu.ui-menu-container:first-of-type {
        translate: -220px -60px !important;
      }
    `;

    root.appendChild(style);

    function reposition() {
      const menus = root.querySelectorAll(
        'menu.ui-menu-container'
      );

      for (const menu of menus) {
        const r = menu.getBoundingClientRect();

        if (!r.width || !r.height) continue;

        if (getComputedStyle(menu).visibility === 'hidden') {
          continue;
        }

        const parent = menu.parentElement;

        if (parent &&
            getComputedStyle(parent).contain !== 'none') {
          parent.style.setProperty(
            'contain', 'none', 'important'
          );
        }

        const dx =
          Math.max(
            margin,
            Math.min(
              r.left,
              innerWidth - r.width - margin
            )
          ) - r.left;

        const dy =
          Math.max(
            margin,
            Math.min(
              r.top,
              innerHeight - r.height - margin
            )
          ) - r.top;

        const css = getComputedStyle(menu);

        if (Math.abs(dx) > 0.5) {
          const left = parseFloat(css.left);

          if (Number.isFinite(left)) {
            menu.style.left = (left + dx) + 'px';
          }
        }

        if (Math.abs(dy) > 0.5) {
          const top = parseFloat(css.top);

          if (Number.isFinite(top)) {
            menu.style.top = (top + dy) + 'px';
          }
        }
      }
    }

    function schedule() {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;
        reposition();
      });
    }

    observer = new MutationObserver(schedule);

    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });

    window.addEventListener('resize', schedule);

    root.addEventListener('pointerover', schedule);

    root.addEventListener('pointerup', schedule);

    console.log('STEM: posicionamiento de menus activado');

    return true;
  }

  window.addEventListener('load', () => {
    if (install()) return;

    const timer = setInterval(() => {
      if (install()) clearInterval(timer);
    }, 200);

    setTimeout(() => clearInterval(timer), 15000);
  });
})();
