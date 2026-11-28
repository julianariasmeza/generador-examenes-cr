'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const {
    g,
    gravity,
    f,
    formulas:F,
    numeric
  } = window.STEMEnergyBank;

  // ======================================
  // ENERGIA CINETICA
  // ======================================

  B.register('Energía cinética', () => {

    const m = B.rand(5,200);
    const v = B.rand(2,30);
    const E = F.kinetic(m,v);

    const mode = B.rand(0,5);

    if (mode === 0) {

      return numeric(
        `Un objeto de ${m} kg se mueve con una rapidez de ${v} m/s. Determine su energía cinética.`,
        E,
        'J',
        `Ec = mv²/2 = ${m} × ${v}²/2`,
        [m*v*v,m*v/2]
      );

    }

    if (mode === 1) {

      return numeric(
        `Un objeto de ${m} kg posee una energía cinética de ${f(E)} J. Determine su rapidez.`,
        Math.sqrt(2*E/m),
        'm/s',
        `v = √(2Ec/m) = √(2 × ${f(E)}/${m})`
      );

    }

    if (mode === 2) {

      return numeric(
        `Un objeto se mueve a ${v} m/s y posee una energía cinética de ${f(E)} J. Determine su masa.`,
        2*E/v**2,
        'kg',
        `m = 2Ec/v² = 2 × ${f(E)}/${v}²`
      );

    }

    if (mode === 3) {

      const mass = B.rand(8,25)*100;
      const speed = B.rand(10,30);
      const kmh = speed*3.6;

      return numeric(
        `Un automóvil de ${mass} kg se desplaza a ${f(kmh)} km/h. Determine su energía cinética.`,
        F.kinetic(mass,speed),
        'J',
        `v = ${f(kmh)}/3,6 = ${speed} m/s; Ec = ${mass} × ${speed}²/2`
      );

    }

    if (mode === 4) {

      const grams = B.rand(1,20)*50;
      const mass = grams/1000;

      return numeric(
        `Una pelota de ${grams} g se mueve a ${v} m/s. Determine su energía cinética.`,
        F.kinetic(mass,v),
        'J',
        `m = ${grams}/1000 = ${f(mass)} kg; Ec = ${f(mass)} × ${v}²/2`
      );

    }

    const factor = B.rand(2,5);

    return numeric(
      `Si la rapidez de un cuerpo aumenta a ${factor} veces su valor inicial y su masa permanece constante, determine la relación Ec₂/Ec₁.`,
      factor**2,
      '',
      `Ec₂/Ec₁ = ${factor}²`,
      [factor,1/factor,1/factor**2]
    );

  });

  // ======================================
  // ENERGIA POTENCIAL GRAVITACIONAL
  // ======================================

  B.register('Energía potencial gravitacional', () => {

    const m = B.rand(2,80);
    const h = B.rand(2,40);

    const E = F.potential(m,h);

    const mode = B.rand(0,4);

    if (mode === 0) {

      return numeric(
        `Un objeto de ${m} kg se encuentra a ${h} m sobre el nivel de referencia. Determine su energía potencial gravitacional.`+gravity,
        E,
        'J',
        `Ep = mgh = ${m} × 9,8 × ${h}`
      );

    }

    if (mode === 1) {

      return numeric(
        `Un objeto de ${m} kg posee una energía potencial gravitacional de ${f(E)} J. Determine su altura respecto al nivel de referencia.`+gravity,
        E/(m*g),
        'm',
        `h = Ep/(mg) = ${f(E)}/(${m} × 9,8)`
      );

    }

    if (mode === 2) {

      return numeric(
        `Un objeto situado a ${h} m sobre el nivel de referencia posee una energía potencial gravitacional de ${f(E)} J. Determine su masa.`+gravity,
        E/(g*h),
        'kg',
        `m = Ep/(gh) = ${f(E)}/(9,8 × ${h})`
      );

    }

    if (mode === 3) {

      const hi = B.rand(5,30);
      const hf = B.rand(0,40);

      return numeric(
        `Un objeto de ${m} kg cambia su altura de ${hi} m a ${hf} m. Determine la variación de su energía potencial gravitacional, definida como energía final menos inicial.`+gravity,
        m*g*(hf-hi),
        'J',
        `ΔEp = mg(hf−hi) = ${m} × 9,8 × (${hf}−${hi})`
      );

    }

    const grams = B.rand(1,20)*50;
    const mass = grams/1000;

    return numeric(
      `Un objeto de ${grams} g se encuentra a ${h} m sobre el nivel de referencia. Determine su energía potencial gravitacional.`+gravity,
      F.potential(mass,h),
      'J',
      `m = ${grams}/1000 = ${f(mass)} kg; Ep = ${f(mass)} × 9,8 × ${h}`
    );

  });

  // ======================================
  // ENERGIA POTENCIAL ELASTICA
  // ======================================

  B.register('Energía potencial elástica', () => {

    const k = B.rand(2,40)*50;

    const cm = B.rand(5,50);
    const x = cm/100;

    const E = F.elastic(k,x);

    const mode = B.rand(0,4);

    if (mode === 0) {

      return numeric(
        `Un resorte ideal de constante elástica ${k} N/m se comprime ${f(x)} m respecto a su longitud natural. Determine la energía potencial elástica almacenada.`,
        E,
        'J',
        `Ee = kx²/2 = ${k} × ${f(x)}²/2`
      );

    }

    if (mode === 1) {

      return numeric(
        `Un resorte ideal de constante elástica ${k} N/m se estira ${cm} cm respecto a su longitud natural. Determine la energía potencial elástica almacenada.`,
        E,
        'J',
        `x = ${cm}/100 = ${f(x)} m; Ee = ${k} × ${f(x)}²/2`
      );

    }

    if (mode === 2) {

      const given = B.rand(5,100);

      return numeric(
        `Un resorte ideal de constante elástica ${k} N/m almacena ${given} J de energía potencial elástica. Determine la magnitud de su deformación.`,
        Math.sqrt(2*given/k),
        'm',
        `x = √(2Ee/k) = √(2 × ${given}/${k})`
      );

    }

    if (mode === 3) {

      const given = B.rand(5,100);

      return numeric(
        `Un resorte ideal deformado ${f(x)} m almacena ${given} J de energía potencial elástica. Determine su constante elástica.`,
        2*given/x**2,
        'N/m',
        `k = 2Ee/x² = 2 × ${given}/${f(x)}²`
      );

    }

    const factor = B.rand(2,5);

    return numeric(
      `La deformación de un resorte ideal aumenta a ${factor} veces su valor inicial. Determine la relación Ee₂/Ee₁, si su constante elástica permanece invariable.`,
      factor**2,
      '',
      `Ee₂/Ee₁ = ${factor}²`,
      [factor,1/factor,1/factor**2]
    );

  });

  // ======================================
  // TEOREMA TRABAJO-ENERGIA
  // ======================================

  B.register('Teorema trabajo-energía', () => {

    const m = B.rand(2,80);

    const vi = B.rand(0,20);
    const vf = B.rand(0,30);

    const Ei = F.kinetic(m,vi);
    const Ef = F.kinetic(m,vf);

    const W = Ef-Ei;

    const mode = B.rand(0,5);

    if (mode === 0) {

      return numeric(
        `Un cuerpo de ${m} kg cambia su rapidez de ${vi} m/s a ${vf} m/s. Determine el trabajo neto realizado sobre el cuerpo.`,
        W,
        'J',
        `Wneto = ΔEc = ${m}(${vf}²−${vi}²)/2`,
        [Ef,Ei,-W]
      );

    }

    if (mode === 1) {

      return numeric(
        `Un objeto de ${m} kg tiene una rapidez inicial de ${vi} m/s. Sobre él se realiza un trabajo neto de ${f(W)} J. Determine su rapidez final.`,
        vf,
        'm/s',
        `vf = √(vi²+2Wneto/m) = √(${vi}²+2 × (${f(W)})/${m})`
      );

    }

    if (mode === 2) {

      const speed = B.rand(5,30);

      return numeric(
        `Un objeto de ${m} kg inicialmente en reposo alcanza una rapidez de ${speed} m/s. Determine el trabajo neto realizado sobre él.`,
        F.kinetic(m,speed),
        'J',
        `Wneto = mvf²/2 = ${m} × ${speed}²/2`
      );

    }

    if (mode === 3) {

      const speed = B.rand(5,30);
      const force = B.rand(10,100)*10;

      return numeric(
        `Un objeto de ${m} kg se mueve a ${speed} m/s. Una fuerza neta constante de magnitud ${force} N actúa en sentido contrario al movimiento hasta detenerlo. Determine la distancia de frenado.`,
        m*speed**2/(2*force),
        'm',
        `−Fd = −mvi²/2; d = ${m} × ${speed}²/(2 × ${force})`
      );

    }

    if (mode === 4) {

      const speed = B.rand(5,30);
      const d = B.rand(5,50);

      return numeric(
        `Un objeto de ${m} kg se mueve a ${speed} m/s y se detiene después de recorrer ${d} m bajo la acción de una fuerza neta constante opuesta al movimiento. Determine la magnitud de esa fuerza.`,
        m*speed**2/(2*d),
        'N',
        `F = mvi²/(2d) = ${m} × ${speed}²/(2 × ${d})`
      );

    }

    return B.item(

      'Si el trabajo neto realizado sobre un objeto es negativo, ¿qué ocurre con su energía cinética?',

      'Disminuye',

      'Wneto = ΔEc. Si el trabajo neto es negativo, la variación de energía cinética también es negativa.',

      [
        'Aumenta',
        'Permanece constante',
        'Siempre se hace cero'
      ]

    );

  });

})();
