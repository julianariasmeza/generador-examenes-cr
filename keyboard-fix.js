'use strict';

(() => {

  function install() {

    const dialog = document.getElementById('mathDialog');
    const mf = document.getElementById('visualMath');
    const keyboard = window.mathVirtualKeyboard;

    if (!dialog || !mf || !keyboard) return false;

    if (document.getElementById('stemKeyboardHost')) {
      return true;
    }

    const host = document.createElement('div');

    host.id = 'stemKeyboardHost';

    dialog.appendChild(host);

    keyboard.hide();
    keyboard.container = host;

    const observer = new MutationObserver(() => {

      if (dialog.open) {

        keyboard.container = host;

      } else {

        keyboard.hide();

      }

    });

    observer.observe(dialog, {
      attributes: true,
      attributeFilter: ['open']
    });

    console.log('Teclado STEM integrado correctamente.');

    return true;

  }

  window.addEventListener('load', () => {

    if (install()) return;

    const observer = new MutationObserver(() => {

      if (install()) observer.disconnect();

    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

  });

})();
