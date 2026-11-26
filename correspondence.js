'use strict';

window.STEMCorrespondence = (() => {

  const instructions =
    'Relacione los elementos de la columna A con los de la columna B. Escriba el símbolo correspondiente dentro del paréntesis.';

  function parse(z) {
    const left = z.parts || [];

    const right = (z.options || []).map(line => {
      const pos = line.indexOf('|');

      return {
        symbol: pos < 0 ? '' : line.slice(0, pos).trim(),
        text: pos < 0 ? line : line.slice(pos + 1).trim()
      };
    });

    const answers = String(z.r || '')
      .split(',')
      .map(x => x.trim());

    return { left, right, answers };
  }

  function validate(z) {
    const { left, right, answers } = parse(z);

    const symbols = right.map(x => x.symbol);
    const used = answers.filter(x => x !== '-');

    return (
      left.length >= 2 &&
      right.length >= 2 &&
      left.length <= 30 &&
      right.length <= 30 &&
      answers.length === left.length &&
      right.every(x => x.symbol && x.text && x.symbol !== '-') &&
      new Set(symbols).size === symbols.length &&
      used.length > 0 &&
      new Set(used).size === used.length &&
      used.every(x => symbols.includes(x))
    );
  }

  function points(z) {
    return parse(z).answers
      .filter(x => x && x !== '-').length * Number(z.p);
  }

  function create(p, topic, question, shuffle) {
    const rows = [];
    const used = new Set();

    for (let i = 0; i < 200 && rows.length < 4; i++) {
      const x = question(topic);

      if (!used.has(x.r)) {
        used.add(x.r);
        rows.push(x);
      }
    }

    if (rows.length < 2) {
      throw new Error('El banco no tiene suficientes respuestas distintas.');
    }

    const right = shuffle(rows.map((x, i) => ({
      text: x.r,
      index: i
    })));

    const symbols = ['A', 'B', 'C', 'D'];
    const answers = [];

    right.forEach((x, i) => {
      answers[x.index] = symbols[i];
    });

    return {
      k: 'corr',
      p,
      topic,
      q: instructions,
      r: answers.join(', '),
      s: '',
      parts: rows.map(x => x.q),
      options: right.map((x, i) => symbols[i] + ' | ' + x.text),
      space: 0,
      layout: 'Vertical',
      marker: 'Paréntesis',
      mode: 'Línea',
      break: false,
      rubric: [],
      image: ''
    };
  }

  function html(z, esc, show) {
    const { left, right, answers } = parse(z);
    const count = Math.max(left.length, right.length);

    let out = `
      <table class="correspondence-table">
        <thead>
          <tr>
            <th colspan="2">COLUMNA A</th>
            <th>COLUMNA B</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (let i = 0; i < count; i++) {
      const answer = show && answers[i] !== '-'
        ? esc(answers[i] || '')
        : '';

      out += `
        <tr>
          <td>${esc(left[i] || '')}</td>
          <td class="corr-parenthesis">
            ${left[i] ? `( <span>${answer}</span> )` : ''}
          </td>
          <td>
            ${right[i]
              ? `<strong>${esc(right[i].symbol)}</strong>) ${esc(right[i].text)}`
              : ''}
          </td>
        </tr>
      `;
    }

    return out + '</tbody></table>';
  }

  function latex(z, tex, show) {
    const { left, right, answers } = parse(z);
    const count = Math.max(left.length, right.length);

    let out = String.raw`\begin{tabularx}{\linewidth}{|X|c|X|}
\hline
\multicolumn{2}{|c|}{\textbf{COLUMNA A}} &
\textbf{COLUMNA B} \\ \hline
`;

    for (let i = 0; i < count; i++) {
      const answer = show && answers[i] !== '-'
        ? String.raw`{\color{violet} ` + tex(answers[i] || '') + '}'
        : String.raw`\hspace{0.6cm}`;

      const middle = left[i] ? '(' + answer + ')' : '';

      const option = right[i]
        ? tex(right[i].symbol) + ') ' + tex(right[i].text)
        : '';

      out += tex(left[i] || '') + ' & ' +
        middle + ' & ' + option +
        String.raw` \\ \hline` + '\n';
    }

    return out + String.raw`\end{tabularx}\par` + '\n';
  }

  function editor(active) {
    const labels = {
      e_q: [
        'Instrucciones de correspondencia',
        'Enunciado'
      ],
      e_options: [
        'Columna B: símbolo | concepto (uno por línea)',
        'Alternativas (una por línea; 3 o 4 para selección)'
      ],
      e_parts: [
        'Columna A: descripción (una por línea)',
        'Incisos (uno por línea)'
      ],
      e_r: [
        'Clave en orden, separada por comas. Use - si sobra un elemento de A.',
        'Respuesta correcta'
      ],
      e_p: [
        'Puntos por acierto',
        'Puntos'
      ]
    };

    Object.entries(labels).forEach(([id, texts]) => {
      const input = document.getElementById(id);
      const label = input.closest('label');

      const node = [...label.childNodes]
        .find(n => n.nodeType === 3);

      if (node) node.textContent = texts[active ? 0 : 1];
    });

    ['e_space', 'e_layout', 'e_marker', 'e_mode', 'e_rubric']
      .forEach(id => {
        document.getElementById(id).closest('label')
          .style.display = active ? 'none' : '';
      });

    document.getElementById('e_options').placeholder =
      active ? '* | Traslación\n+ | Reflexión\n# | Homotecia' : '';

    document.getElementById('e_r').placeholder =
      active ? '+, *, #, -' : '';
  }

  return {
    instructions,
    parse,
    validate,
    points,
    create,
    html,
    latex,
    editor
  };

})();
