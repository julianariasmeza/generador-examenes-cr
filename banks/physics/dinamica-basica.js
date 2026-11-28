'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const g = 9.8;

  const f = n =>
    B.fmt(Math.round(n * 100) / 100);

  const gravity =
    ' Considere g = 9,8 m/s².';

  const rounding =
    ' Redondee a dos decimales cuando sea necesario.';

  function numeric(q, value, unit, solution, errors = []) {

    const r = `${f(value)} ${unit}`.trim();

    const wrong = [...new Set([
      ...errors,
      value*2,
      value/2,
      value+5,
      value+10,
      value+15
    ].map(v => `${f(v)} ${unit}`.trim()))]
      .filter(v => v !== r)
      .slice(0, 3);

    return B.item(
      q + rounding,
      r,
      solution + ` = ${r}`,
      wrong
    );

  }

  function figure(z, type, data) {

    const src =
      window.STEMDynamicsFigures.create(type, data);

    return {
      ...z,
      image: src,
      figures: [{
        src,
        width: 60,
        align: 'center',
        caption: ''
      }],
      dynamicsData: {type, data}
    };

  }

  // LEYES DE NEWTON

  const concepts = [

    [
      'Un pasajero tiende a continuar hacia adelante cuando el autobús frena. ¿Qué ley explica este fenómeno?',
      'Primera ley de Newton',
      'Por inercia, el pasajero tiende a conservar su estado de movimiento.'
    ],

    [
      'Una fuerza neta constante produce una aceleración constante en un cuerpo de masa constante. ¿Qué ley describe esta relación?',
      'Segunda ley de Newton',
      'La fuerza neta es igual al producto de la masa por la aceleración.'
    ],

    [
      'Una persona empuja una pared y la pared ejerce una fuerza sobre ella. ¿Qué ley explica esta interacción?',
      'Tercera ley de Newton',
      'Las fuerzas de acción y reacción actúan sobre cuerpos diferentes.'
    ],

    [
      'Un objeto continúa moviéndose con velocidad constante cuando la fuerza neta es cero. ¿Qué ley establece este comportamiento?',
      'Primera ley de Newton',
      'Si la fuerza neta es cero, la velocidad permanece constante.'
    ],

    [
      'Al duplicar la fuerza neta sobre un objeto de masa constante, su aceleración se duplica. ¿Qué ley explica este resultado?',
      'Segunda ley de Newton',
      'La aceleración es directamente proporcional a la fuerza neta.'
    ],

    [
      'Un nadador empuja el agua hacia atrás y el agua lo impulsa hacia adelante. ¿Qué ley explica esta interacción?',
      'Tercera ley de Newton',
      'El nadador y el agua ejercen fuerzas iguales y opuestas entre sí.'
    ]

  ];

  B.register('Leyes de Newton', () => {

    const [q,r,s] = B.pick(concepts);

    const options = [
      'Primera ley de Newton',
      'Segunda ley de Newton',
      'Tercera ley de Newton',
      'Ley de gravitación universal'
    ];

    return B.item(
      q, r, s,
      options.filter(o => o !== r)
    );

  });

  // MASA Y PESO

  B.register('Masa y peso', () => {

    const m = B.rand(2, 100);

    const P = m*g;

    if (B.rand(0, 1) === 0) {

      return numeric(
        `Determine el peso de un cuerpo cuya masa es ${m} kg.` + gravity,
        P, 'N',
        `P = mg = ${m} × 9,8`,
        [m, m/g, m*10]
      );

    }

    return numeric(
      `Un objeto tiene un peso de ${f(P)} N. Determine su masa.` + gravity,
      m, 'kg',
      `m = P/g = ${f(P)}/9,8`,
      [P, P*g, P/10]
    );

  });

  // SEGUNDA LEY DE NEWTON

  B.register('Segunda ley de Newton', () => {

    const m = B.rand(5, 50);

    const a = B.rand(2, 16)/2;

    const F = m*a;

    const mode = B.rand(0, 3);

    if (mode === 0) {

      return numeric(
        `Un carrito de ${m} kg adquiere una aceleración de ${f(a)} m/s². Determine la magnitud de la fuerza neta.`,
        F, 'N',
        `ΣF = ma = ${m} × ${f(a)}`,
        [m/a, a/m, m+a]
      );

    }

    if (mode === 1) {

      return numeric(
        `Una fuerza neta de ${f(F)} N produce una aceleración de ${f(a)} m/s². Determine la masa del objeto.`,
        m, 'kg',
        `m = ΣF/a = ${f(F)}/${f(a)}`,
        [F*a, a/F, F+a]
      );

    }

    const F2 = B.rand(10, 80);
    const F1 = F2 + F;

    const data = {m, F1, F2};

    const stem =
      `Un bloque de ${m} kg se encuentra sobre una superficie horizontal sin fricción. Se aplican ${f(F1)} N hacia la derecha y ${F2} N hacia la izquierda.`;

    if (mode === 2) {

      return figure(
        numeric(
          stem + ' Determine la magnitud de la fuerza resultante.',
          F, 'N',
          `ΣFx = ${f(F1)} − ${F2}`,
          [F1+F2, F1, F2]
        ),
        'horizontal', data
      );

    }

    return figure(
      numeric(
        stem + ' Determine la magnitud de la aceleración.',
        a, 'm/s²',
        `a = ΣFx/m = (${f(F1)} − ${F2})/${m}`,
        [(F1+F2)/m, F1/m, F2/m]
      ),
      'horizontal', data
    );

  });

  // FUERZA NORMAL

  B.register('Fuerza normal', () => {

    const m = B.rand(5, 80);
    const P = m*g;

    const mode = B.rand(0, 2);

    if (mode === 0) {

      return figure(
        numeric(
          `Una caja de ${m} kg permanece en reposo sobre un piso horizontal. Determine la magnitud de la fuerza normal.` + gravity,
          P, 'N',
          `ΣFy = N − mg = 0; N = ${m} × 9,8`,
          [m, 0, P/g]
        ),
        'horizontal', {m}
      );

    }

    const F = Math.floor(P/2);

    if (mode === 1) {

      return numeric(
        `Una caja de ${m} kg permanece sobre un piso horizontal. Se aplica una fuerza vertical de ${F} N hacia abajo. Determine la magnitud de la fuerza normal.` + gravity,
        P+F, 'N',
        `N = mg + F = ${f(P)} + ${F}`,
        [P-F, P, F]
      );

    }

    return numeric(
      `Una caja de ${m} kg permanece sobre un piso horizontal. Se aplica una fuerza vertical de ${F} N hacia arriba. Determine la magnitud de la fuerza normal.` + gravity,
      P-F, 'N',
      `N = mg − F = ${f(P)} − ${F}`,
      [P+F, P, F]
    );

  });

  // FRICCION CINETICA

  B.register('Fricción cinética', () => {

    const m = B.rand(5, 50);

    const mu = B.rand(10, 40)/100;

    const N = m*g;
    const fk = mu*N;

    const F = Math.ceil(fk) + B.rand(10, 100);

    const mode = B.rand(0, 2);

    const data = {m, F1:F, mu};

    const stem =
      `Un bloque de ${m} kg se desliza hacia la derecha sobre una superficie horizontal. Se aplica una fuerza horizontal de ${F} N hacia la derecha. El coeficiente de fricción cinética es ${f(mu)}.`;

    if (mode === 0) {

      return figure(
        numeric(
          stem + ' Determine la magnitud de la fuerza de fricción cinética.' + gravity,
          fk, 'N',
          `N = ${m} × 9,8 = ${f(N)} N; fk = μkN = ${f(mu)} × ${f(N)}`,
          [N, mu*m, N/mu]
        ),
        'horizontal', data
      );

    }

    if (mode === 1) {

      return figure(
        numeric(
          stem + ' Determine la magnitud de la aceleración.' + gravity,
          (F-fk)/m, 'm/s²',
          `fk = ${f(mu)} × ${f(N)}; a = (F − fk)/m = (${F} − ${B.fmt(fk)})/${m}`,
          [F/m, (F+fk)/m, fk/m]
        ),
        'horizontal', data
      );

    }

    return figure(
      numeric(
        stem + ' Determine la magnitud de la fuerza neta.' + gravity,
        F-fk, 'N',
        `fk = ${f(mu)} × ${f(N)}; ΣFx = ${F} − ${B.fmt(fk)}`,
        [F+fk, F, fk]
      ),
      'horizontal', data
    );

  });

  window.STEMDynamicsBank = {
    g, f, gravity, numeric, figure
  };

})();
