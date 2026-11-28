'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const A = window.STEMGravitation;

  const {
    G,
    inputFormat: f,
    numeric,
    formulas: F,
    constant,
    randomBody
  } = A;

  function body() {

    return randomBody(A.bodyNames);

  }

  function data(p) {

    return ` Considere M = ${f(p.M)} kg y R = ${f(p.R)} m.`;

  }

  // ======================================
  // PESO Y GRAVEDAD PLANETARIA
  // ======================================

  B.register('Peso y gravedad planetaria', () => {

    const p = body();

    const m = B.rand(10,150);

    const mode = B.rand(0,5);

    if (mode === 0) {

      return numeric(
        `Un objeto de ${m} kg se encuentra en ${p.name}, donde g = ${f(p.g)} m/s². Determine su peso.`,
        m*p.g,
        'N',
        `P = mg = ${m} × ${f(p.g)}`
      );

    }

    if (mode === 1) {

      const weight = Math.round(m*p.g*100)/100;

      return numeric(
        `Un objeto pesa ${f(weight)} N en ${p.name}, donde g = ${f(p.g)} m/s². Determine su masa.`,
        weight/p.g,
        'kg',
        `m = P/g = ${f(weight)}/${f(p.g)}`
      );

    }

    if (mode === 2) {

      return numeric(
        `Determine la gravedad superficial ideal de ${p.name}.` +
        data(p) + constant,
        F.field(p.M,p.R),
        'm/s²',
        `g = GM/R² = G × (${f(p.M)})/(${f(p.R)})²`
      );

    }

    if (mode === 3) {

      const R = B.rand(20,80)*1e5;

      const g = B.rand(20,150)/10;

      return numeric(
        `Un planeta hipotético tiene un radio de ${f(R)} m y una gravedad superficial de ${f(g)} m/s². Determine su masa.` +
        constant,
        g*R**2/G,
        'kg',
        `M = gR²/G = ${f(g)} × (${f(R)})²/G`
      );

    }

    const factor = B.rand(2,5);

    if (mode === 4) {

      return numeric(
        `Dos planetas tienen igual masa. El radio del segundo es ${factor} veces el radio del primero. Determine la relación g₂/g₁.`,
        1/factor**2,
        '',
        `g₂/g₁ = 1/${factor}²`,
        [1/factor,factor,factor**2]
      );

    }

    return numeric(
      `Un planeta hipotético tiene ${factor} veces la masa terrestre y el mismo radio de la Tierra. Utilice g terrestre = 9,8 m/s². Determine su gravedad superficial.`,
      factor*9.8,
      'm/s²',
      `g = ${factor} × 9,8`
    );

  });

  // ======================================
  // GRAVEDAD CON LA ALTURA
  // ======================================

  B.register('Gravedad con la altura', () => {

    const p = body();

    const h = B.rand(100,3000);

    const r = p.R+h*1000;

    const m = B.rand(20,150);

    const mode = B.rand(0,3);

    if (mode === 0) {

      return numeric(
        `Determine la intensidad del campo gravitacional a ${h} km sobre el nivel de referencia de ${p.name}.` +
        data(p) + constant,
        F.field(p.M,r),
        'N/kg',
        `g = GM/(R+h)² = G × (${f(p.M)})/(${f(p.R)}+${h} × 1000)²`
      );

    }

    if (mode === 1) {

      return numeric(
        `Una sonda de ${m} kg se encuentra a ${h} km sobre el nivel de referencia de ${p.name}. Determine la magnitud de la fuerza gravitacional.` +
        data(p) + constant,
        F.force(p.M,m,r),
        'N',
        `F = GMm/(R+h)² = G × (${f(p.M)}) × ${m}/(${f(p.R)}+${h} × 1000)²`
      );

    }

    const factor = B.rand(2,9);

    if (mode === 2) {

      return numeric(
        `Un satélite se encuentra a una distancia del centro de ${p.name} igual a ${factor} veces su radio. Determine la relación g/g₀, donde g₀ = GM/R².`,
        1/factor**2,
        '',
        `g/g₀ = 1/${factor}²`
      );

    }

    return numeric(
      `Determine la altura sobre el nivel de referencia de ${p.name} a la cual el campo gravitacional se reduce a 1/${factor} de su valor superficial ideal. Considere R = ${f(p.R)} m.`,
      p.R*(Math.sqrt(factor)-1),
      'm',
      `h = R(√${factor}−1) = (${f(p.R)})(√${factor}−1)`
    );

  });

  // ======================================
  // RAPIDEZ ORBITAL
  // ======================================

  B.register('Rapidez orbital', () => {

    const p = body();

    const h = B.rand(100,3000);

    const r = p.R+h*1000;

    const v = F.orbitalSpeed(p.M,r);

    const mode = B.rand(0,3);

    if (mode === 0) {

      return numeric(
        `Un satélite describe una órbita circular a ${h} km sobre el nivel de referencia de ${p.name}. Determine su rapidez orbital.` +
        data(p) + constant,
        v,
        'm/s',
        `v = √(GM/(R+h)) = √[G × (${f(p.M)})/(${f(p.R)}+${h} × 1000)]`
      );

    }

    if (mode === 1) {

      // Radio expresado exactamente en km.

      return numeric(
        `Un satélite describe una órbita circular de radio ${f(r/1000)} km alrededor de ${p.name}, cuya masa es ${f(p.M)} kg. Determine su rapidez orbital.` +
        constant,
        v,
        'm/s',
        `v = √(GM/r) = √[G × (${f(p.M)})/(${f(r/1000)} × 1000)]`
      );

    }

    if (mode === 2) {

      // Redondear primero el dato suministrado.

      const given = Math.round(v);

      return numeric(
        `Un satélite describe una órbita circular alrededor de ${p.name} con rapidez de ${given} m/s. Determine el radio orbital.` +
        data(p) + constant,
        F.radiusFromSpeed(p.M,given),
        'm',
        `r = GM/v² = G × (${f(p.M)})/${given}²`
      );

    }

    const factor = B.rand(2,5);

    return numeric(
      `Dos satélites describen órbitas circulares alrededor del mismo cuerpo celeste. El radio orbital del segundo es ${factor} veces el del primero. Determine la relación v₂/v₁.`,
      1/Math.sqrt(factor),
      '',
      `v₂/v₁ = 1/√${factor}`
    );

  });

  // ======================================
  // PERIODO ORBITAL
  // ======================================

  B.register('Período orbital', () => {

    const p = body();

    const h = B.rand(100,3000);

    const r = p.R+h*1000;

    const T = F.orbitalPeriod(p.M,r);

    const mode = B.rand(0,4);

    if (mode === 0 || mode === 1) {

      const minutes = mode === 1;

      return numeric(
        `Un satélite describe una órbita circular a ${h} km sobre el nivel de referencia de ${p.name}. Determine su período orbital en ${minutes?'minutos':'segundos'}.` +
        data(p) + constant,
        minutes ? T/60 : T,
        minutes ? 'min' : 's',
        `T = 2π√[(R+h)³/(GM)]${minutes?' / 60 para expresarlo en minutos':''}`
      );

    }

    if (mode === 2 || mode === 3) {

      const given = Math.round(T);

      const radius = F.radiusFromPeriod(p.M,given);

      const height = mode === 3;

      return numeric(
        `Un satélite describe una órbita circular alrededor de ${p.name} con un período de ${given} s. Determine ${height?'su altura sobre el nivel de referencia':'el radio orbital'}.` +
        data(p) + constant,
        height ? radius-p.R : radius,
        'm',
        height
          ? 'h = ∛(GMT²/(4π²)) − R'
          : 'r = ∛(GMT²/(4π²))'
      );

    }

    const factor = B.rand(2,5);

    return numeric(
      `Dos satélites describen órbitas circulares alrededor del mismo cuerpo celeste. El radio orbital del segundo es ${factor} veces el del primero. Determine la relación T₂/T₁.`,
      factor**1.5,
      '',
      `T₂/T₁ = ${factor}^(3/2)`
    );

  });

  // ======================================
  // VELOCIDAD DE ESCAPE
  // ======================================

  B.register('Velocidad de escape', () => {

    const p = body();

    const h = B.rand(100,3000);

    const mode = B.rand(0,3);

    const ideal =
      ' Desprecie la atmósfera, la rotación y la influencia de otros cuerpos.';

    if (mode === 0) {

      return numeric(
        `Determine la velocidad de escape ideal desde el nivel de referencia de ${p.name}.` +
        data(p) + constant + ideal,
        F.escapeSpeed(p.M,p.R),
        'm/s',
        `ve = √(2GM/R) = √[2G × (${f(p.M)})/(${f(p.R)})]`
      );

    }

    if (mode === 1) {

      return numeric(
        `Una nave se encuentra a ${h} km sobre el nivel de referencia de ${p.name}. Determine la velocidad de escape desde esa posición.` +
        data(p) + constant + ideal,
        F.escapeSpeed(p.M,p.R+h*1000),
        'm/s',
        `ve = √[2GM/(R+h)]`
      );

    }

    if (mode === 2) {

      const R = B.rand(20,80)*1e5;

      const g = B.rand(20,150)/10;

      return numeric(
        `Un planeta hipotético tiene un radio de ${f(R)} m y una gravedad superficial ideal de ${f(g)} m/s². Determine su velocidad de escape.` +
        ideal,
        Math.sqrt(2*g*R),
        'm/s',
        `ve = √(2gR) = √[2 × ${f(g)} × (${f(R)})]`
      );

    }

    const v = B.rand(20,120)/10;

    return numeric(
      `Un satélite describe una órbita circular con rapidez de ${f(v)} km/s. Determine la velocidad de escape desde esa misma distancia al centro del cuerpo celeste.` +
      ideal,
      Math.sqrt(2)*v*1000,
      'm/s',
      `ve = √2 × v = √2 × ${f(v)} × 1000`
    );

  });

})();
