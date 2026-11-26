
'use strict';

/* Exam STEM CR 2.1
   Editor visual de expresiones matemáticas */

window.STEMMath = (() => {

  const fields = [
    'e_q',
    'e_options',
    'e_r',
    'e_s',
    'e_parts',
    'e_rubric'
  ];

  let activeField = null;
  let start = 0;
  let end = 0;

  const get = id => document.getElementById(id);

  function init() {

    const dialog = document.createElement('dialog');

    dialog.id = 'mathDialog';

    dialog.innerHTML = `
      <div class="math-editor">

        <h2>Editor de fórmulas</h2>

        <p class="hint">
          Escribí la expresión utilizando el teclado matemático.
        </p>

        <div class="math-buttons">
          <button type="button" data-math="frac">Fracción</button>
          <button type="button" data-math="sqrt">Raíz</button>
          <button type="button" data-math="power">Potencia</button>
          <button type="button" data-math="sub">Subíndice</button>
          <button type="button" data-math="pi">π</button>
          <button type="button" data-math="theta">θ</button>
          <button type="button" data-math="delta">Δ</button>
          <button type="button" data-math="pm">±</button>
          <button type="button" data-math="le">≤</button>
          <button type="button" data-math="ge">≥</button>
          <button type="button" data-math="infty">∞</button>
          <button type="button" data-math="log">Logaritmo</button>
          <button type="button" data-math="vec">Vector</button>
          <button type="button" data-math="arrow">→</button>
        </div>

        <math-field id="visualMath"
          math-virtual-keyboard-policy="manual">
        </math-field>

        <div class="math-buttons">
          <button type="button" id="showKeyboard">
            Teclado matemático
          </button>

          <button type="button" id="clearMath">
            Limpiar
          </button>
        </div>

        <label class="check">
          <input type="checkbox" id="displayMath">
          Mostrar fórmula en una línea independiente
        </label>

        <label>
          Código LaTeX
          <textarea id="mathLatex" rows="3"
            spellcheck="false"></textarea>
        </label>

        <div class="dialog-actions">
          <button type="button" id="cancelMath">
            Cancelar
          </button>

          <button type="button" id="insertMath" class="primary">
            Insertar fórmula
          </button>
        </div>

      </div>
    `;

    document.body.append(dialog);

    const mf = get('visualMath');
    const source = get('mathLatex');

    const symbols = {
      frac: '\\frac{#0}{#?}',
      sqrt: '\\sqrt{#0}',
      power: '^{#?}',
      sub: '_{#?}',
      pi: '\\pi',
      theta: '\\theta',
      delta: '\\Delta',
      pm: '\\pm',
      le: '\\leq',
      ge: '\\geq',
      infty: '\\infty',
      log: '\\log_{#?}',
      vec: '\\vec{#0}',
      arrow: '\\rightarrow'
    };

    dialog.querySelectorAll('[data-math]').forEach(button => {
      button.addEventListener('click', () => {
        mf.focus();
        mf.insert(symbols[button.dataset.math]);
        source.value = mf.value;
      });
    });

    mf.addEventListener('input', () => {
      source.value = mf.value;
    });

    source.addEventListener('input', () => {
      mf.value = source.value;
    });

    get('showKeyboard').onclick = () => {
      mf.focus();
      window.mathVirtualKeyboard?.show();
    };

    get('clearMath').onclick = () => {
      mf.value = '';
      source.value = '';
      mf.focus();
    };

    get('cancelMath').onclick = () => dialog.close();

    dialog.addEventListener('close', () => {
      window.mathVirtualKeyboard?.hide();
    });

    get('insertMath').onclick = () => {

      const latex = mf.value.trim();

      if (!latex || !activeField) return;

      const display = get('displayMath').checked;

      const formula = display
        ? '\\[' + latex + '\\]'
        : '\\(' + latex + '\\)';

      activeField.setRangeText(
        formula,
        start,
        end,
        'end'
      );

      activeField.dispatchEvent(
        new Event('input', { bubbles: true })
      );

      dialog.close();
      activeField.focus();
    };

    fields.forEach(id => {

      const input = get(id);

      if (!input) return;

      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'formula-trigger';
      button.textContent = 'ƒ(x) Insertar fórmula';

      button.addEventListener('click', () => {

        activeField = input;
        start = input.selectionStart ?? input.value.length;
        end = input.selectionEnd ?? start;

        const selected = input.value.slice(start, end);

        const existing = selected.match(
          /^\\\(([\s\S]*)\\\)$|^\\\[([\s\S]*)\\\]$/
        );

        mf.value = existing
          ? existing[1] ?? existing[2]
          : '';

        source.value = mf.value;

        get('displayMath').checked = Boolean(existing?.[2]);

        dialog.showModal();
        mf.focus();

      });

      input.insertAdjacentElement('afterend', button);

    });

  }

  function typeset(element) {

    if (!window.MathJax?.typesetPromise) {
      return Promise.resolve();
    }

    return window.MathJax.typesetPromise([element])
      .catch(error => console.warn('MathJax:', error));

  }

  /* Conserva las fórmulas y escapa únicamente el texto. */

  function exportTex(value, escapeText) {

    const text = String(value ?? '');

    const parts = text.split(
      /(\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\])/g
    );

    return parts.map(part => {

      if (
        part.startsWith('\\(') ||
        part.startsWith('\\[')
      ) {
        return part;
      }

      return escapeText(part);

    }).join('');

  }

  window.addEventListener('load', async () => {

    if (!window.customElements.get('math-field')) {
      console.warn('MathLive no está disponible.');
      return;
    }

    init();

  });

  return { typeset, exportTex };

})();

