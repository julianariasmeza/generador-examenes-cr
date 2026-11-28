'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const {
    g, f, gravity, numeric, figure
  } = window.STEMDynamicsBank;

  // MAQUINA DE ATWOOD

  B.register('Máquina de Atwood', () => {

    const m1 = B.rand(3, 25);
    const m2 = m1 + B.rand(2, 20);

    const a = (m2-m1)*g/(m1+m2);

    const T = m1*(g+a);

    const stem =
      `Dos cuerpos de masas m₁ = ${m1} kg y m₂ = ${m2} kg están unidos mediante una cuerda ideal que pasa por una polea ideal. El sistema se libera desde el reposo.`;

    const mode = B.rand(0, 2);

    let z;

    if (mode === 0) {

      z = numeric(
        stem + ' Determine la magnitud de la aceleración del sistema.' + gravity,
        a, 'm/s²',
        `a = (m₂ − m₁)g/(m₁ + m₂) = (${m2} − ${m1}) × 9,8/(${m1} + ${m2})`,
        [g, (m2-m1)*g/m2, (m2-m1)*g/m1]
      );

    } else if (mode === 1) {

      z = numeric(
        stem + ' Determine la magnitud de la tensión de la cuerda.' + gravity,
        T, 'N',
        `a = (${m2} − ${m1}) × 9,8/(${m1} + ${m2}); T = m₁(g+a)`,
        [m1*g, m2*g, m1*a]
      );

    } else {

      z = numeric(
        stem + ' Determine la magnitud de la fuerza resultante sobre el cuerpo de mayor masa.' + gravity,
        m2*a, 'N',
        `a = (${m2} − ${m1}) × 9,8/(${m1} + ${m2}); ΣF₂ = m₂a`,
        [m2*g, T, m1*a]
      );

    }

    return figure(z, 'atwood', {m1,m2});

  });

  // MASA HORIZONTAL Y MASA COLGANTE

  function pulley(withFriction) {

    const m1 = B.rand(5, 50);

    const mu = withFriction
      ? B.rand(10, 35)/100
      : 0;

    const m2 = Math.ceil(mu*m1) +
      B.rand(3, 30);

    const N = m1*g;
    const fk = mu*N;

    const a = (m2*g-fk)/(m1+m2);

    const T = m1*a+fk;

    const surface = withFriction
      ? `El coeficiente de fricción cinética entre el bloque y la mesa es ${f(mu)}. El sistema ya se mueve con la masa colgante descendiendo.`
      : 'La superficie horizontal no presenta fricción.';

    const stem =
      `Un bloque de ${m1} kg situado sobre una mesa está unido a una masa colgante de ${m2} kg mediante una cuerda y una polea ideales. ${surface}`;

    const mode = B.rand(
      0, withFriction ? 3 : 1
    );

    let z;

    if (mode === 0) {

      z = numeric(
        stem + ' Determine la magnitud de la aceleración del sistema.' + gravity,
        a, 'm/s²',
        `a = (m₂g − μkm₁g)/(m₁ + m₂) = (${m2} × 9,8 − ${f(mu)} × ${m1} × 9,8)/(${m1} + ${m2})`,
        [m2*g/m1, m2*g/(m1+m2), g]
      );

    } else if (mode === 1) {

      z = numeric(
        stem + ' Determine la magnitud de la tensión de la cuerda.' + gravity,
        T, 'N',
        `a = (m₂g − μkm₁g)/(m₁ + m₂); T = m₂(g − a)`,
        [m2*g, m1*g, m1*a]
      );

    } else if (mode === 2) {

      z = numeric(
        stem + ' Determine la magnitud de la fuerza de fricción cinética.' + gravity,
        fk, 'N',
        `fk = μkN = ${f(mu)} × ${m1} × 9,8`,
        [N, mu*m2*g, m1*mu]
      );

    } else {

      z = numeric(
        stem + ' Determine la magnitud de la fuerza resultante sobre el bloque horizontal.' + gravity,
        m1*a, 'N',
        `a = (m₂g − μkm₁g)/(m₁ + m₂); ΣF₁ = m₁a`,
        [T, fk, m2*g]
      );

    }

    return figure(z, 'pulley', {
      m1,m2,
      ...(withFriction ? {mu} : {})
    });

  }

  B.register(
    'Sistemas de poleas sin fricción',
    () => pulley(false)
  );

  B.register(
    'Sistemas de poleas con fricción',
    () => pulley(true)
  );

  // COEFICIENTE DE FRICCION

  B.register('Coeficiente de fricción', () => {

    const m = B.rand(10, 60);

    const mu = B.rand(10, 40)/100;

    const fk = mu*m*g;

    const mode = B.rand(0, 1);

    if (mode === 0) {

      return numeric(
        `Un bloque de ${m} kg se desliza sobre una superficie horizontal. La magnitud de la fuerza de fricción cinética es ${B.fmt(fk)} N. Determine el coeficiente de fricción cinética.` + gravity,
        mu, '',
        `μk = fk/N = ${B.fmt(fk)}/(${m} × 9,8)`,
        [fk/m, mu*2, mu/2]
      );

    }

    const a = B.rand(1, 5);

    const F = m*a+fk;

    return figure(
      numeric(
        `Un bloque de ${m} kg se desliza hacia la derecha sobre una superficie horizontal. Se aplica una fuerza de ${B.fmt(F)} N hacia la derecha y se obtiene una aceleración de ${a} m/s² en ese sentido. Determine el coeficiente de fricción cinética.` + gravity,
        mu, '',
        `μk = (F − ma)/(mg) = (${B.fmt(F)} − ${m} × ${a})/(${m} × 9,8)`,
        [F/(m*g), a/g, mu*2]
      ),
      'horizontal', {m,F1:F}
    );

  });

  // FUERZAS VERTICALES Y GRUAS

  B.register('Fuerzas verticales y grúas', () => {

    const m = B.rand(5, 100)*5;

    const a = B.pick([
      -3,-2,-1,0,1,2,3,4
    ]);

    const F = m*(g+a);

    const mode = B.rand(0, 1);

    if (mode === 0) {

      return figure(
        numeric(
          `Una grúa sostiene una carga de ${m} kg mediante un cable que ejerce una tensión de ${f(F)} N hacia arriba. Determine la aceleración vertical de la carga, tomando hacia arriba como positivo.` + gravity,
          a, 'm/s²',
          `a = (T − mg)/m = (${f(F)} − ${m} × 9,8)/${m}`,
          [F/m,-a,g]
        ),
        'vertical', {m,F}
      );

    }

    return numeric(
      `Una grúa sostiene una carga de ${m} kg cuya aceleración vertical es ${f(a)} m/s², tomando hacia arriba como positivo. Determine la magnitud de la tensión del cable.` + gravity,
      F, 'N',
      `T = m(g+a) = ${m} × (9,8 + (${f(a)}))`,
      [m*g,m*(g-a),Math.abs(m*a)]
    );

  });

  // ELEVADORES

  B.register('Elevadores y peso aparente', () => {

    const m = B.rand(40, 100);

    const a = B.pick([
      -4,-3,-2,-1,0,1,2,3,4
    ]);

    const N = m*(g+a);

    const mode = B.rand(0, 1);

    if (mode === 0) {

      return numeric(
        `Una persona de ${m} kg permanece sobre una balanza dentro de un elevador. La aceleración vertical del elevador es ${f(a)} m/s², tomando hacia arriba como positivo. Determine la magnitud de la fuerza normal ejercida por la balanza.` + gravity,
        N, 'N',
        `N = m(g+a) = ${m} × (9,8 + (${f(a)}))`,
        [m*g,m*(g-a),Math.abs(m*a)]
      );

    }

    return numeric(
      `Una persona de ${m} kg se encuentra sobre una balanza dentro de un elevador. La balanza ejerce una fuerza normal de ${f(N)} N. Determine la aceleración vertical del elevador, tomando hacia arriba como positivo.` + gravity,
      a, 'm/s²',
      `a = (N − mg)/m = (${f(N)} − ${m} × 9,8)/${m}`,
      [N/m,-a,g]
    );

  });

})();
