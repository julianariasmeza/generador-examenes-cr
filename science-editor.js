'use strict';

/* Exam STEM CR 2.2
   Herramientas de Matemática, Física y Química */

(() => {

  const groups = {

    'Matemática': [
      ['Fracción', '\\frac{#0}{#?}'],
      ['Raíz cuadrada', '\\sqrt{#0}'],
      ['Raíz n-ésima', '\\sqrt[#?]{#0}'],
      ['Potencia', '^{#?}'],
      ['Subíndice', '_{#?}'],
      ['Valor absoluto', '\\left|#0\\right|'],
      ['Logaritmo', '\\log_{#?}'],
      ['Logaritmo natural', '\\ln'],
      ['Seno', '\\sin'],
      ['Coseno', '\\cos'],
      ['Tangente', '\\tan'],
      ['Pi', '\\pi'],
      ['Infinito', '\\infty'],
      ['Menor o igual', '\\leq'],
      ['Mayor o igual', '\\geq'],
      ['Distinto', '\\neq'],
      ['Unión', '\\cup'],
      ['Intersección', '\\cap'],
      ['Pertenece', '\\in'],
      ['Reales', '\\mathbb{R}'],
      ['Intervalo abierto', '\\left]#?,#?\\right['],
      ['Intervalo cerrado', '\\left[#?,#?\\right]'],
      ['Matriz 2 × 2', '\\begin{pmatrix}#?&#?\\\\#?&#?\\end{pmatrix}'],
      ['Sumatoria', '\\sum_{#?}^{#?}'],
      ['Límite', '\\lim_{#?\\to#?}'],
      ['Integral', '\\int_{#?}^{#?}']
    ],

    'Física': [
      ['Vector', '\\vec{#0}'],
      ['Fracción', '\\frac{#0}{#?}'],
      ['Delta', '\\Delta'],
      ['Theta', '\\theta'],
      ['Omega', '\\Omega'],
      ['Micro', '\\mu'],
      ['Densidad', '\\rho'],
      ['Lambda', '\\lambda'],
      ['Notación científica', '#?\\times10^{#?}'],
      ['Grados', '^{\\circ}'],
      ['Metro', '\\mathrm{m}'],
      ['Segundo', '\\mathrm{s}'],
      ['Kilogramo', '\\mathrm{kg}'],
      ['Velocidad (m/s)', '\\mathrm{m/s}'],
      ['Aceleración (m/s²)', '\\mathrm{m/s^2}'],
      ['Newton', '\\mathrm{N}'],
      ['Joule', '\\mathrm{J}'],
      ['Watt', '\\mathrm{W}'],
      ['Pascal', '\\mathrm{Pa}'],
      ['Coulomb', '\\mathrm{C}'],
      ['Voltio', '\\mathrm{V}'],
      ['Ampere', '\\mathrm{A}'],
      ['Ohm', '\\Omega'],
      ['Hertz', '\\mathrm{Hz}'],
      ['Segunda ley de Newton', '\\sum\\vec{F}=m\\vec{a}'],
      ['MRU', 'd=vt'],
      ['MRUA', 'v=v_0+at'],
      ['Posición MRUA', 'x=x_0+v_0t+\\frac{1}{2}at^2'],
      ['Energía cinética', 'E_c=\\frac{1}{2}mv^2'],
      ['Ley de Ohm', 'V=IR'],
      ['Gravedad', 'g=9{,}8\\,\\mathrm{m/s^2}']
    ],

    'Química': [
      ['Elemento', '\\mathrm{#?}'],
      ['Subíndice', '_{#?}'],
      ['Carga positiva', '^{#?+}'],
      ['Carga negativa', '^{#?-}'],
      ['Agua', '\\mathrm{H_2O}'],
      ['Dióxido de carbono', '\\mathrm{CO_2}'],
      ['Oxígeno', '\\mathrm{O_2}'],
      ['Hidrógeno', '\\mathrm{H_2}'],
      ['Hidróxido de sodio', '\\mathrm{NaOH}'],
      ['Ácido sulfúrico', '\\mathrm{H_2SO_4}'],
      ['Ion sodio', '\\mathrm{Na}^{+}'],
      ['Ion calcio', '\\mathrm{Ca}^{2+}'],
      ['Ion sulfato', '\\mathrm{SO_4}^{2-}'],
      ['Ion nitrato', '\\mathrm{NO_3}^{-}'],
      ['Ion hidróxido', '\\mathrm{OH}^{-}'],
      ['Reacción', '\\rightarrow'],
      ['Equilibrio', '\\rightleftharpoons'],
      ['Calor', '\\Delta'],
      ['Sólido', '\\mathrm{(s)}'],
      ['Líquido', '\\mathrm{(l)}'],
      ['Gas', '\\mathrm{(g)}'],
      ['Acuoso', '\\mathrm{(ac)}'],
      ['Mol', '\\mathrm{mol}'],
      ['Masa molar', '\\mathrm{g/mol}'],
      ['Molaridad', '\\mathrm{mol/L}'],
      ['Avogadro', '6{,}022\\times10^{23}\\,\\mathrm{mol}^{-1}'],
      ['Cantidad de sustancia', 'n=\\frac{m}{M}'],
      ['Partículas', 'N=nN_A'],
      ['Concentración', 'C=\\frac{n}{V}'],
      ['pH', '\\mathrm{pH}=-\\log[\\mathrm{H}^{+}]'],
      ['Isótopo', '{}^{#?}_{#?}\\mathrm{#?}'],
      ['Reacción de ejemplo', '2\\mathrm{H_2}+\\mathrm{O_2}\\rightarrow2\\mathrm{H_2O}']
    ]

  };

  function install() {

    const dialog = document.getElementById('mathDialog');
    const mf = document.getElementById('visualMath');

    if (!dialog || !mf) return false;

    if (document.getElementById('scienceTools')) {
      return true;
    }

    const panel = document.createElement('section');

    panel.id = 'scienceTools';

    const heading = document.createElement('h3');
    heading.textContent = 'Herramientas científicas';

    const tabs = document.createElement('div');
    tabs.className = 'science-tabs';

    const tools = document.createElement('div');
    tools.className = 'science-grid';

    const search = document.createElement('input');
    search.type = 'search';
    search.placeholder = 'Buscar símbolo, fórmula o unidad...';
    search.setAttribute('aria-label', 'Buscar herramienta científica');

    let current = 'Matemática';

    function draw() {

      tools.replaceChildren();

      const query = search.value.toLowerCase().trim();

      for (const [name, formula] of groups[current]) {

        if (!name.toLowerCase().includes(query)) continue;

        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'science-button';
        button.textContent = name;

        button.addEventListener('click', () => {

          mf.focus();
          mf.insert(formula);

          const source = document.getElementById('mathLatex');

          if (source) source.value = mf.value;

        });

        tools.append(button);

      }

    }

    function selectMode(mode) {

      current = mode;
      search.value = '';

      tabs.querySelectorAll('button').forEach(button => {

        const selected = button.dataset.mode === mode;

        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));

      });

      draw();

    }

    Object.keys(groups).forEach(mode => {

      const button = document.createElement('button');

      button.type = 'button';
      button.textContent = mode;
      button.dataset.mode = mode;

      button.addEventListener('click', () => selectMode(mode));

      tabs.append(button);

    });

    search.addEventListener('input', draw);

    panel.append(heading, tabs, search, tools);

    mf.insertAdjacentElement('beforebegin', panel);

    const oldToolbar = dialog.querySelector('.math-buttons');

    if (oldToolbar) oldToolbar.hidden = true;

    const observer = new MutationObserver(() => {

      if (!dialog.open) return;

      const subject = document.getElementById('subject')?.value;

      selectMode(groups[subject] ? subject : 'Matemática');

    });

    observer.observe(dialog, {
      attributes: true,
      attributeFilter: ['open']
    });

    selectMode('Matemática');

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
