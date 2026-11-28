'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const f = n =>
    B.fmt(Math.round(n * 100) / 100);

  function question(q, value, unit, solution, points, config) {

    const r = `${f(value)} ${unit}`;

    const wrong = [...new Set(
      [
        value * 2,
        value / 2,
        -value,
        value + 5,
        value + 10,
        value + 15
      ].map(v => `${f(v)} ${unit}`)
    )].filter(v => v !== r).slice(0, 3);

    const z = B.item(
      q,
      r,
      solution + ` = ${r}`,
      wrong
    );

    const src = window.STEMPhysicsGraphs.create(
      points, config
    );

    return {
      ...z,
      image: src,
      figures: [{
        src,
        width: 65,
        align: 'center',
        caption: ''
      }],
      graphData: {points, config}
    };

  }

  B.register('Gráficas de movimiento', () => {

    const t = B.rand(2, 6);
    const a = B.rand(1, 5) * 5;
    const b = B.rand(1, 4) * 5;

    const mode = B.rand(0, 9);

    // POSICION - TIEMPO

    if (mode <= 4) {

      const points = [
        [0, 0],
        [t, a],
        [2*t, a],
        [3*t, -b]
      ];

      const config = {
        xmax: 3*t,
        ymin: -b-5,
        ymax: a+5,
        xstep: t,
        ystep: 5,
        ylabel: 'x (m)',
        xlabel: 't (s)'
      };

      if (mode === 0) {
        return question(
          `Según la gráfica de posición contra tiempo, determine la posición del móvil en t = ${t} s.`,
          a, 'm',
          `x(${t})`,
          points, config
        );
      }

      if (mode === 1) {
        return question(
          `Determine la velocidad del móvil entre 0 s y ${t} s. Redondee a dos decimales.`,
          a/t, 'm/s',
          `v = Δx/Δt = ${a}/${t}`,
          points, config
        );
      }

      if (mode === 2) {
        return question(
          `Determine el desplazamiento del móvil entre 0 s y ${3*t} s.`,
          -b, 'm',
          `Δx = xf − xi = −${b} − 0`,
          points, config
        );
      }

      if (mode === 3) {
        return question(
          `Determine la distancia total recorrida durante los ${3*t} s representados.`,
          2*a+b, 'm',
          `d = ${a} + 0 + ${a+b}`,
          points, config
        );
      }

      return question(
        `Determine la velocidad del móvil entre ${2*t} s y ${3*t} s. Redondee a dos decimales.`,
        (-b-a)/t, 'm/s',
        `v = (−${b} − ${a})/(${3*t} − ${2*t})`,
        points, config
      );

    }

    // RAPIDEZ - TIEMPO

    if (mode <= 7) {

      const points = [
        [0, 0],
        [t, a],
        [2*t, a],
        [3*t, 0]
      ];

      const config = {
        xmax: 3*t,
        ymin: 0,
        ymax: a+5,
        xstep: t,
        ystep: 5,
        ylabel: 'Rapidez (m/s)',
        xlabel: 't (s)'
      };

      if (mode === 5) {
        return question(
          `Determine la distancia recorrida entre 0 s y ${t} s.`,
          a*t/2, 'm',
          `d = área del triángulo = ${t} × ${a}/2`,
          points, config
        );
      }

      if (mode === 6) {
        return question(
          `Determine la distancia total recorrida durante los ${3*t} s.`,
          2*a*t, 'm',
          `d = ${t} × ${a}/2 + ${t} × ${a} + ${t} × ${a}/2`,
          points, config
        );
      }

      return question(
        `Determine la rapidez media durante los ${3*t} s. Redondee a dos decimales.`,
        2*a/3, 'm/s',
        `Rapidez media = d/t = ${2*a*t}/${3*t}`,
        points, config
      );

    }

    // VELOCIDAD - TIEMPO

    const points = [
      [0, a],
      [t, a],
      [2*t, 0],
      [3*t, -b]
    ];

    const config = {
      xmax: 3*t,
      ymin: -b-5,
      ymax: a+5,
      xstep: t,
      ystep: 5,
      ylabel: 'v (m/s)',
      xlabel: 't (s)'
    };

    if (mode === 8) {
      return question(
        `Determine el desplazamiento total durante los ${3*t} s representados.`,
        a*t+a*t/2-b*t/2,
        'm',
        `Δx = ${a} × ${t} + ${a} × ${t}/2 − ${b} × ${t}/2`,
        points, config
      );
    }

    return question(
      `Determine la aceleración entre ${2*t} s y ${3*t} s. Redondee a dos decimales.`,
      -b/t, 'm/s²',
      `a = Δv/Δt = (−${b} − 0)/${t}`,
      points, config
    );

  });

})();
