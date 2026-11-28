'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const {
    g,
    gravity,
    f,
    radians,
    formulas:F,
    numeric
  } = window.STEMEnergyBank;

  // ======================================
  // ENERGIA MECANICA CON ROZAMIENTO
  // ======================================

  B.register('Energía mecánica con rozamiento', () => {

    const m = B.rand(2,40);

    const mu = B.rand(10,40)/100;

    const vi = B.rand(10,25);

    const Ei = F.kinetic(m,vi);

    const friction = mu*m*g;

    const stop = Ei/friction;

    const d = Math.max(
      1,
      Math.floor(stop*0.5)
    );

    const Wf = -friction*d;

    const Ef = Ei+Wf;

    const mode = B.rand(0,7);

    const horizontal =
      `Un bloque de ${m} kg se mueve inicialmente a ${vi} m/s sobre una superficie horizontal rugosa. El coeficiente de fricción cinética es ${f(mu)}. No actúan otras fuerzas horizontales.`+gravity;

    if (mode === 0) {

      return numeric(
        horizontal+
        ` Determine la distancia que recorre hasta detenerse.`,
        stop,
        'm',
        `μmgd = mvi²/2; d = ${vi}²/(2 × ${f(mu)} × 9,8)`
      );

    }

    if (mode === 1) {

      return numeric(
        horizontal+
        ` Determine el trabajo de la fricción durante los primeros ${d} m.`,
        Wf,
        'J',
        `Wf = −μmgd = −${f(mu)} × ${m} × 9,8 × ${d}`
      );

    }

    if (mode === 2) {

      return numeric(
        horizontal+
        ` Determine su energía cinética después de recorrer ${d} m.`,
        Ef,
        'J',
        `Ecf = mvi²/2−μmgd = ${m} × ${vi}²/2−${f(mu)} × ${m} × 9,8 × ${d}`,
        [Ei,-Wf]
      );

    }

    if (mode === 3) {

      return numeric(
        horizontal+
        ` Determine su rapidez después de recorrer ${d} m.`,
        Math.sqrt(2*Ef/m),
        'm/s',
        `vf = √(vi²−2μgd) = √(${vi}²−2 × ${f(mu)} × 9,8 × ${d})`
      );

    }

    // PLANO INCLINADO RUGOSO

    const angle = B.pick([30,45,60]);

    const L = B.rand(4,20);

    const theta = radians(angle);

    const h = L*Math.sin(theta);

    const fk = mu*m*g*Math.cos(theta);

    const Wg = m*g*h;

    const Wfr = -fk*L;

    const Ebottom = Wg+Wfr;

    const q =
      `Un bloque de ${m} kg parte del reposo y desciende por un plano inclinado de ${L} m de longitud, que forma un ángulo de ${angle}° con la horizontal. El coeficiente de fricción cinética es ${f(mu)}.`+gravity;

    if (mode === 4) {

      return numeric(
        q+' Determine el trabajo realizado por el peso.',
        Wg,
        'J',
        `Wg = mgL sen θ = ${m} × 9,8 × ${L} × sen(${angle}°)`
      );

    }

    if (mode === 5) {

      return numeric(
        q+' Determine el trabajo realizado por la fricción.',
        Wfr,
        'J',
        `Wf = −μmgL cos θ = −${f(mu)} × ${m} × 9,8 × ${L} × cos(${angle}°)`
      );

    }

    if (mode === 6) {

      return numeric(
        q+' Determine su energía cinética al llegar al extremo inferior.',
        Ebottom,
        'J',
        `Ec = mgL(sen θ−μ cos θ) = ${m} × 9,8 × ${L} × (sen(${angle}°)−${f(mu)} cos(${angle}°))`,
        [Wg,Wfr]
      );

    }

    return numeric(
      q+' Determine su rapidez al llegar al extremo inferior.',
      Math.sqrt(2*Ebottom/m),
      'm/s',
      `v = √[2gL(sen θ−μ cos θ)] = √[2 × 9,8 × ${L} × (sen(${angle}°)−${f(mu)} cos(${angle}°))]`
    );

  });

  // ======================================
  // SISTEMAS CON RESORTES
  // ======================================

  B.register('Sistemas con resortes', () => {

    const m = B.rand(2,20);

    const k = B.rand(4,40)*50;

    const v = B.rand(2,12);

    const x = B.rand(5,40)/100;

    const mode = B.rand(0,5);

    if (mode === 0) {

      return numeric(
        `Un bloque de ${m} kg se mueve a ${v} m/s sobre una superficie horizontal sin rozamiento y comprime un resorte ideal inicialmente sin deformar, de constante elástica ${k} N/m. Determine la compresión máxima.`,
        v*Math.sqrt(m/k),
        'm',
        `mv²/2 = kx²/2; x = v√(m/k) = ${v}√(${m}/${k})`
      );

    }

    if (mode === 1) {

      return numeric(
        `Un resorte ideal de constante elástica ${k} N/m, comprimido ${f(x)} m, impulsa desde el reposo un bloque de ${m} kg sobre una superficie horizontal sin rozamiento. Determine su rapidez cuando el resorte recupera su longitud natural.`,
        x*Math.sqrt(k/m),
        'm/s',
        `kx²/2 = mv²/2; v = x√(k/m) = ${f(x)}√(${k}/${m})`
      );

    }

    if (mode === 2) {

      return numeric(
        `Un bloque de ${m} kg se mueve a ${v} m/s sobre una superficie horizontal y comprime un resorte ideal inicialmente sin deformar hasta alcanzar una compresión máxima de ${f(x)} m. Desprecie el rozamiento. Determine la constante elástica del resorte.`,
        m*v**2/x**2,
        'N/m',
        `mv²/2 = kx²/2; k = ${m} × ${v}²/${f(x)}²`
      );

    }

    if (mode === 3) {

      return numeric(
        `Un resorte ideal de constante elástica ${k} N/m está comprimido ${f(x)} m. Determine el trabajo realizado por el resorte al recuperar su longitud natural.`,
        F.elastic(k,x),
        'J',
        `W = kx²/2 = ${k} × ${f(x)}²/2`
      );

    }

    if (mode === 4) {

      const h = B.rand(1,10);

      return numeric(
        `Un bloque de ${m} kg parte del reposo desde una altura de ${h} m y desciende por una rampa sin rozamiento. En el tramo horizontal inferior sin rozamiento comprime un resorte ideal inicialmente sin deformar, de constante elástica ${k} N/m. Determine la compresión máxima.`+gravity,
        Math.sqrt(2*m*g*h/k),
        'm',
        `mgh = kx²/2; x = √(2mgh/k) = √(2 × ${m} × 9,8 × ${h}/${k})`
      );

    }

    // RESORTE CON ROZAMIENTO DURANTE
    // LA COMPRESION

    const mu = B.rand(10,30)/100;

    const fk = mu*m*g;

    const Ec = F.kinetic(m,v);

    const compression =
      2*Ec/(
        Math.sqrt(fk**2+2*k*Ec)+fk
      );

    return numeric(
      `Un bloque de ${m} kg entra en contacto con un resorte ideal inicialmente sin deformar con una rapidez de ${v} m/s. La constante elástica es ${k} N/m. Durante toda la compresión, el bloque se mueve sobre una superficie horizontal con coeficiente de fricción cinética ${f(mu)}. Determine la compresión máxima.`+gravity,
      compression,
      'm',
      `mv²/2 = kx²/2+μmgx; x = [−μmg+√((μmg)²+kmv²)]/k; x = [−${f(mu)} × ${m} × 9,8+√((${f(mu)} × ${m} × 9,8)²+${k} × ${m} × ${v}²)]/${k}`,
      [v*Math.sqrt(m/k)]
    );

  });

  // ======================================
  // PROBLEMAS DE VARIAS ETAPAS
  // ======================================

  B.register('Problemas de varias etapas', () => {

    const m = B.rand(2,30);

    const h = B.rand(3,15);

    const mu = B.rand(10,40)/100;

    const k = B.rand(4,40)*50;

    const Em = m*g*h;

    const friction = mu*m*g;

    const stop = h/mu;

    // Garantiza que el bloque llegue
    // al final del tramo rugoso.

    const d = B.rand(
      1,
      Math.floor(stop*0.7)
    );

    const Wf = -friction*d;

    const Ef = Em+Wf;

    const vf = Math.sqrt(2*Ef/m);

    const mode = B.rand(0,7);

    const q =
      `Un bloque de ${m} kg parte del reposo desde una altura de ${h} m y desciende por una rampa sin rozamiento. Después entra en una superficie horizontal rugosa con coeficiente de fricción cinética ${f(mu)}.`+gravity;

    if (mode === 0) {

      return numeric(
        q+' Determine la distancia recorrida sobre la superficie rugosa hasta detenerse.',
        stop,
        'm',
        `mgh = μmgd; d = h/μ = ${h}/${f(mu)}`
      );

    }

    if (mode === 1) {

      return numeric(
        q+` Determine el trabajo de la fricción después de recorrer ${d} m sobre la superficie rugosa.`,
        Wf,
        'J',
        `Wf = −μmgd = −${f(mu)} × ${m} × 9,8 × ${d}`
      );

    }

    if (mode === 2) {

      return numeric(
        q+` Determine la energía cinética después de recorrer ${d} m sobre la superficie rugosa.`,
        Ef,
        'J',
        `Ec = mgh−μmgd = ${m} × 9,8 × (${h}−${f(mu)} × ${d})`,
        [Em,-Wf]
      );

    }

    if (mode === 3) {

      return numeric(
        q+` Determine la rapidez después de recorrer ${d} m sobre la superficie rugosa.`,
        vf,
        'm/s',
        `v = √[2g(h−μd)] = √[2 × 9,8 × (${h}−${f(mu)} × ${d})]`
      );

    }

    const spring =
      `Un bloque de ${m} kg parte del reposo desde una altura de ${h} m y desciende por una rampa sin rozamiento. Luego atraviesa un tramo horizontal rugoso de ${d} m, con coeficiente de fricción cinética ${f(mu)}. Finalmente, sobre una superficie horizontal sin rozamiento, entra en contacto con un resorte ideal inicialmente sin deformar, de constante elástica ${k} N/m.`+gravity;

    if (mode === 4) {

      return numeric(
        spring+' Determine la energía cinética del bloque justo antes de tocar el resorte.',
        Ef,
        'J',
        `Ec = mgh−μmgd = ${m} × 9,8 × (${h}−${f(mu)} × ${d})`
      );

    }

    if (mode === 5) {

      return numeric(
        spring+' Determine la rapidez del bloque justo antes de tocar el resorte.',
        vf,
        'm/s',
        `v = √[2g(h−μd)] = √[2 × 9,8 × (${h}−${f(mu)} × ${d})]`
      );

    }

    if (mode === 6) {

      return numeric(
        spring+' Determine la compresión máxima del resorte.',
        Math.sqrt(2*Ef/k),
        'm',
        `mgh−μmgd = kx²/2; x = √[2mg(h−μd)/k] = √[2 × ${m} × 9,8 × (${h}−${f(mu)} × ${d})/${k}]`,
        [Math.sqrt(2*Em/k)]
      );

    }

    return numeric(
      spring+' Determine la energía potencial elástica almacenada en el resorte cuando alcanza su compresión máxima.',
      Ef,
      'J',
      `Ee = mgh−μmgd = ${m} × 9,8 × (${h}−${f(mu)} × ${d})`,
      [Em,-Wf]
    );

  });

})();
