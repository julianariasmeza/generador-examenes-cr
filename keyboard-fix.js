'use strict';

(() => {

  function configureDialog(dialog, layer) {

    if (!dialog || dialog.dataset.stemFixed) return;

    dialog.dataset.stemFixed = 'true';
    dialog.classList.add('stem-floating-dialog');
    dialog.style.zIndex = String(layer);

    dialog.showModal = function () {

      if (this.open) return;

      this.show();

    };

  }

  function install() {

    const editor = document.getElementById('dialog');
    const math = document.getElementById('mathDialog');
    const keyboard = window.mathVirtualKeyboard;

    if (!editor || !math || !keyboard) return false;

    configureDialog(editor, 100);
    configureDialog(math, 110);

    keyboard.hide();
    keyboard.container = document.body;

    const oldHost =
      document.getElementById('stemKeyboardHost');

    if (oldHost) oldHost.remove();

    const observer = new MutationObserver(() => {

      if (math.open) {

        keyboard.container = document.body;
        editor.inert = true;

      } else {

        keyboard.hide();
        editor.inert = false;

      }

    });

    observer.observe(math, {
      attributes: true,
      attributeFilter: ['open']
    });

    math.addEventListener('close', () => {

      keyboard.hide();
      editor.inert = false;

    });

    document.addEventListener('keydown', event => {

      if (event.key !== 'Escape') return;

      if (math.open) {

        event.preventDefault();
        math.close();

      } else if (editor.open) {

        event.preventDefault();
        editor.close();

      }

    });

    console.log('STEM: capas de MathLive corregidas.');

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
