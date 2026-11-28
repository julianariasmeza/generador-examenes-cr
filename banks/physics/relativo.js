'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const f = n =>
    B.fmt(Math.round(n * 100) / 100);

  function item(q, value, unit, solution) {

    const r = `${f(value)} ${unit}`;

    const wrong = [...new Set(
      [
        value*2,
        value/2,
        -value,
        value+5,
        value+10,
        value+15
      ].map(v => `${f(v)} ${unit}`)
    )].filter(v => v !== r).slice(0, 3);

    return B.item(
      q,
      r,
      solution + ` = ${r}`,
      wrong
    );

  }

  B.register('Movimiento relativo', () => {

    const a = B.rand(15, 35);
    const b = B.rand(5, 14);
    const c = B.rand(1, 4);

    const mode = B.rand(0, 6);

    if (mode === 0) {
      return item(
        `Dos automóviles viajan hacia el este con velocidades de ${a} m/s y ${b} m/s, respectivamente. Determine la velocidad del primero respecto al segundo, tomando el este como positivo.`,
        a-b, 'm/s',
        `vAB = vA − vB = ${a} − ${b}`
      );
    }

    if (mode === 1) {
      return item(
        `Un automóvil viaja hacia el este a ${a} m/s y otro hacia el oeste a ${b} m/s. Determine la rapidez relativa entre ambos.`,
        a+b, 'm/s',
        `|vAB| = |${a} − (−${b})|`
      );
    }

    if (mode === 2) {
      return item(
        `Un autobús viaja hacia el este a ${a} m/s. Un pasajero camina dentro del autobús hacia el frente a ${c} m/s respecto al vehículo. Determine su rapidez respecto al suelo.`,
        a+c, 'm/s',
        `vPS = vPA + vAS = ${c} + ${a}`
      );
    }

    if (mode === 3) {
      return item(
        `Un autobús viaja hacia el este a ${a} m/s. Un pasajero camina hacia la parte trasera a ${c} m/s respecto al autobús. Determine su rapidez respecto al suelo.`,
        a-c, 'm/s',
        `vPS = vPA + vAS = −${c} + ${a}`
      );
    }

    if (mode === 4) {
      return item(
        `Una persona camina sobre una banda transportadora a ${c} m/s respecto a la banda. La banda se mueve a ${b} m/s en el mismo sentido. Determine la rapidez de la persona respecto al suelo.`,
        b+c, 'm/s',
        `v = ${b} + ${c}`
      );
    }

    if (mode === 5) {
      return item(
        `Un tren viaja hacia el este a ${a} m/s. Un observador permanece en reposo en la estación. Determine la velocidad del observador respecto al tren, tomando el este como positivo.`,
        -a, 'm/s',
        `vOT = vO − vT = 0 − ${a}`
      );
    }

    const t = B.rand(5, 20);
    const d = (a-b)*t;

    return item(
      `Dos vehículos viajan en el mismo sentido a ${a} m/s y ${b} m/s. El más rápido se encuentra ${d} m detrás del otro. Determine el tiempo necesario para alcanzarlo.`,
      t, 's',
      `t = d/(vA − vB) = ${d}/(${a} − ${b})`
    );

  });

})();
