'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const {
    g, f, gravity, numeric, figure
  } = window.STEMDynamicsBank;

  // TRES FUERZAS SIMULTANEAS

  function multipleForces() {

    const m = B.rand(10, 50);

    const angle = B.pick([
      25,30,35,40,45,50
    ]);

    const rad = angle*Math.PI/180;

    const F = B.rand(40, 80);

    const F1 = B.rand(60, 150);

    const F2 = B.rand(10, 40);

    const mu = B.rand(10, 30)/100;

    const Fx = F*Math.cos(rad);
    const Fy = F*Math.sin(rad);

    const N = m*g-Fy;

    const fk = mu*N;

    const net = F1-F2+Fx-fk;

    const a = net/m;

    const stem =
      `Un bloque de ${m} kg se desliza hacia la derecha sobre una superficie horizontal. Actúan tres fuerzas: ${F1} N hacia la derecha, ${F2} N hacia la izquierda y ${F} N formando un ángulo de ${angle}° sobre la horizontal hacia la derecha. El coeficiente de fricción cinética es ${f(mu)}. Tome la derecha como sentido positivo.`;

    const mode = B.rand(0,3);

    const data = {
      m,F1,F2,F,angle,mu
    };

    let z;

    if (mode === 0) {

      z = numeric(
        stem + ' Determine la magnitud de la fuerza normal.' + gravity,
        N, 'N',
        `N = mg − F sen(θ) = ${m} × 9,8 − ${F} sen(${angle}°)`,
        [m*g,m*g+Fy,Fy]
      );

    } else if (mode === 1) {

      z = numeric(
        stem + ' Determine la magnitud de la fuerza de fricción cinética.' + gravity,
        fk, 'N',
        `fk = μkN = ${f(mu)} × (${m} × 9,8 − ${F} sen(${angle}°))`,
        [mu*m*g,mu*F,N]
      );

    } else if (mode === 2) {

      z = numeric(
        stem + ' Determine la componente horizontal de la fuerza resultante.' + gravity,
        net, 'N',
        `ΣFx = ${F1} − ${F2} + ${F} cos(${angle}°) − ${f(mu)} × (${m} × 9,8 − ${F} sen(${angle}°))`,
        [net+fk,net+2*fk,-net]
      );

    } else {

      z = numeric(
        stem + ' Determine la aceleración horizontal.' + gravity,
        a, 'm/s²',
        `a = (${F1} − ${F2} + ${F} cos(${angle}°) − ${f(mu)} × (${m} × 9,8 − ${F} sen(${angle}°)))/${m}`,
        [(net+fk)/m,(net+2*fk)/m,-a]
      );

    }

    return figure(z,'multiple',data);

  }

  // CALCULO INVERSO EN POLEAS

  function inversePulley() {

    const m1 = B.rand(20, 50);
    const m2 = B.rand(10, 25);

    const a = B.rand(5, 20)/10;

    const fk = m2*g-(m1+m2)*a;

    const mu = fk/(m1*g);

    // Evitar coeficientes negativos
    // o valores fuera del rango elegido.

    if (mu < 0.08 || mu > 0.60) {
      return inversePulley();
    }

    const T = m2*(g-a);

    const stem =
      `Un bloque de ${m1} kg sobre una mesa horizontal está unido a una masa colgante de ${m2} kg mediante una cuerda y una polea ideales. La masa colgante desciende con una aceleración de ${f(a)} m/s².`;

    const mode = B.rand(0,2);

    let z;

    if (mode === 0) {

      z = numeric(
        stem + ' Determine el coeficiente de fricción cinética.' + gravity,
        mu, '',
        `μk = [m₂g − (m₁+m₂)a]/(m₁g) = [${m2} × 9,8 − (${m1}+${m2}) × ${f(a)}]/(${m1} × 9,8)`,
        [mu*2,mu/2,fk/(m2*g)]
      );

    } else if (mode === 1) {

      z = numeric(
        stem + ' Determine la magnitud de la fuerza de fricción cinética.' + gravity,
        fk, 'N',
        `fk = m₂g − (m₁+m₂)a = ${m2} × 9,8 − (${m1}+${m2}) × ${f(a)}`,
        [m2*g,m1*a,T]
      );

    } else {

      z = numeric(
        stem + ' Determine la magnitud de la tensión de la cuerda.' + gravity,
        T, 'N',
        `T = m₂(g−a) = ${m2} × (9,8−${f(a)})`,
        [m2*g,m1*a,fk]
      );

    }

    return figure(z,'pulley',{m1,m2});

  }

  // AMPLIAR LOS TEMAS EXISTENTES

  const originalOblique =
    () => originalGenerators.oblique();

  const originalPulley =
    () => originalGenerators.pulley();

  const originalGenerators = {};

  // Conservar generadores originales antes
  // de registrar las ampliaciones.

  originalGenerators.oblique =
    B.generator('Fuerzas oblicuas con fricción');

  originalGenerators.pulley =
    B.generator('Sistemas de poleas con fricción');

  B.register(
    'Fuerzas oblicuas con fricción',
    () => B.rand(0,1)
      ? multipleForces()
      : originalOblique()
  );

  B.register(
    'Sistemas de poleas con fricción',
    () => B.rand(0,1)
      ? inversePulley()
      : originalPulley()
  );

})();
