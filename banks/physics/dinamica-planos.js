'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const {
    g, f, gravity, numeric, figure
  } = window.STEMDynamicsBank;

  const radians = angle =>
    angle * Math.PI / 180;

  // FUERZAS OBLICUAS

  function oblique(withFriction) {

    const m = B.rand(10, 60);

    const angle = B.pick([
      20, 25, 30, 35, 40, 45, 50, 60
    ]);

    const rad = radians(angle);

    const down = B.rand(0, 1) === 1;

    const F = B.rand(
      Math.ceil(m*g*0.35),
      Math.floor(m*g*0.85)
    );

    const mu = withFriction
      ? B.rand(10, 35)/100
      : 0;

    const P = m*g;

    const Fx = F*Math.cos(rad);

    const Fy = F*Math.sin(rad) *
      (down ? -1 : 1);

    const N = P-Fy;

    const fk = mu*N;

    const a = (Fx-fk)/m;

    const data = {
      m, F, angle, down,
      ...(withFriction ? {mu} : {})
    };

    const direction = down
      ? 'por debajo'
      : 'por encima';

    const surface = withFriction
      ? `El bloque se desliza hacia la derecha y el coeficiente de fricción cinética es ${f(mu)}.`
      : 'La superficie no presenta fricción.';

    const stem =
      `Un bloque de ${m} kg se encuentra sobre una superficie horizontal. Se aplica una fuerza de ${F} N dirigida ${angle}° ${direction} de la horizontal, hacia la derecha. ${surface} Tome la derecha y arriba como sentidos positivos.`;

    const mode = B.rand(
      0, withFriction ? 5 : 3
    );

    let z;

    if (mode === 0) {

      z = numeric(
        stem + ' Determine la componente horizontal de la fuerza.',
        Fx, 'N',
        `Fx = ${F} cos(${angle}°)`,
        [Math.abs(Fy), F, F/2]
      );

    } else if (mode === 1) {

      z = numeric(
        stem + ' Determine la componente vertical de la fuerza.',
        Fy, 'N',
        `Fy = ${down ? '−' : ''}${F} sen(${angle}°)`,
        [-Fy, Fx, F]
      );

    } else if (mode === 2) {

      z = numeric(
        stem + ' Determine la magnitud de la fuerza normal.' + gravity,
        N, 'N',
        `ΣFy = N + Fy − mg = 0; N = ${m} × 9,8 ${down ? '+' : '−'} ${F} sen(${angle}°)`,
        [P+Fy, P, Math.abs(Fy)]
      );

    } else if (mode === 3) {

      z = numeric(
        stem + ' Determine la aceleración horizontal.' + gravity,
        a, 'm/s²',
        `N = mg − Fy; fk = μkN; a = (Fx − fk)/m = (${F} cos(${angle}°) − ${f(mu)} × (${m} × 9,8 ${down ? '+' : '−'} ${F} sen(${angle}°)))/${m}`,
        [Fx/m, (Fx+fk)/m, F/m]
      );

    } else if (mode === 4) {

      z = numeric(
        stem + ' Determine la magnitud de la fricción cinética.' + gravity,
        fk, 'N',
        `fk = μkN = ${f(mu)} × (${m} × 9,8 ${down ? '+' : '−'} ${F} sen(${angle}°))`,
        [mu*P, mu*F, N]
      );

    } else {

      z = numeric(
        stem + ' Determine la componente horizontal de la fuerza resultante.' + gravity,
        Fx-fk, 'N',
        `ΣFx = F cos(θ) − μkN = ${F} cos(${angle}°) − ${f(mu)} × (${m} × 9,8 ${down ? '+' : '−'} ${F} sen(${angle}°))`,
        [Fx+fk, Fx, fk]
      );

    }

    return figure(z, 'oblique', data);

  }

  B.register(
    'Fuerzas oblicuas',
    () => oblique(false)
  );

  B.register(
    'Fuerzas oblicuas con fricción',
    () => oblique(true)
  );

  // PLANOS INCLINADOS

  function incline(withFriction) {

    const m = B.rand(5, 60);

    const angle = B.pick([
      20, 25, 30, 35, 40, 45, 50, 60
    ]);

    const rad = radians(angle);

    const P = m*g;

    const Px = P*Math.sin(rad);

    const N = P*Math.cos(rad);

    const mu = withFriction
      ? B.rand(10, 30)/100
      : 0;

    const fk = mu*N;

    const up = B.rand(0, 1) === 1;

    const F = up
      ? Math.ceil(Px+fk) + B.rand(10, 100)
      : 0;

    // Positivo hacia arriba del plano.
    // La friccion se opone al movimiento.

    const net = F-Px+(up ? -fk : fk);

    const a = net/m;

    const data = {
      m, angle, F,
      ...(withFriction ? {mu} : {})
    };

    const movement = up
      ? `El bloque asciende bajo la acción de una fuerza de ${F} N paralela al plano y dirigida hacia arriba.`
      : 'El bloque se desliza hacia abajo sin fuerzas aplicadas adicionales.';

    const surface = withFriction
      ? `El coeficiente de fricción cinética es ${f(mu)}.`
      : 'No existe fricción.';

    const stem =
      `Un bloque de ${m} kg se encuentra sobre un plano inclinado de ${angle}°. ${movement} ${surface} Tome como positivo el sentido hacia arriba del plano.`;

    const mode = B.rand(
      0, withFriction ? 5 : 4
    );

    let z;

    if (mode === 0) {

      z = numeric(
        stem + ' Determine la magnitud de la componente del peso paralela al plano.' + gravity,
        Px, 'N',
        `Px = mg sen(θ) = ${m} × 9,8 × sen(${angle}°)`,
        [N, P, P/2]
      );

    } else if (mode === 1) {

      z = numeric(
        stem + ' Determine la magnitud de la componente del peso perpendicular al plano.' + gravity,
        N, 'N',
        `Py = mg cos(θ) = ${m} × 9,8 × cos(${angle}°)`,
        [Px, P, P/2]
      );

    } else if (mode === 2) {

      z = numeric(
        stem + ' Determine la magnitud de la fuerza normal.' + gravity,
        N, 'N',
        `ΣFy = N − mg cos(θ) = 0; N = ${m} × 9,8 × cos(${angle}°)`,
        [Px, P, P/2]
      );

    } else if (mode === 3) {

      z = numeric(
        stem + ' Determine la componente de la fuerza resultante paralela al plano.' + gravity,
        net, 'N',
        `ΣFx = F − mg sen(θ) ${up ? '−' : '+'} μkmg cos(θ) = ${F} − ${m} × 9,8 × sen(${angle}°) ${up ? '−' : '+'} ${f(mu)} × ${m} × 9,8 × cos(${angle}°)`,
        [F+Px, F-Px, -net]
      );

    } else if (mode === 4) {

      z = numeric(
        stem + ' Determine la aceleración paralela al plano.' + gravity,
        a, 'm/s²',
        `a = ΣFx/m = (${F} − ${m} × 9,8 × sen(${angle}°) ${up ? '−' : '+'} ${f(mu)} × ${m} × 9,8 × cos(${angle}°))/${m}`,
        [-a, g, (F-Px)/m]
      );

    } else {

      z = numeric(
        stem + ' Determine la magnitud de la fuerza de fricción cinética.' + gravity,
        fk, 'N',
        `fk = μkN = ${f(mu)} × ${m} × 9,8 × cos(${angle}°)`,
        [mu*P, mu*Px, N]
      );

    }

    return figure(z, 'incline', data);

  }

  B.register(
    'Planos inclinados sin fricción',
    () => incline(false)
  );

  B.register(
    'Planos inclinados con fricción',
    () => incline(true)
  );

})();
