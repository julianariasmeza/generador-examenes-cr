'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const {
    G,
    inputFormat: f,
    numeric,
    formulas: F,
    constant,
    randomBody
  } = window.STEMGravitation;

  // ========================================
  // FUERZAS FUNDAMENTALES
  // ========================================

  const interactions = [
    'Gravitacional',
    'Electromagnética',
    'Nuclear fuerte',
    'Nuclear débil'
  ];

  const concepts = [

    [
      '¿Cuál interacción fundamental explica la caída libre de una piedra?',
      0,
      'La gravedad produce la atracción entre cuerpos con masa.'
    ],

    [
      '¿Cuál interacción explica la atracción entre un imán y un objeto de hierro?',
      1,
      'Los fenómenos magnéticos corresponden a la interacción electromagnética.'
    ],

    [
      '¿Cuál interacción contribuye a mantener unidos los protones y neutrones del núcleo?',
      2,
      'La interacción nuclear fuerte permite la unión de los nucleones.'
    ],

    [
      '¿Cuál interacción interviene en la desintegración beta?',
      3,
      'La desintegración beta se debe a la interacción nuclear débil.'
    ],

    [
      '¿Cuál interacción fundamental tiene menor intensidad relativa a escala de partículas elementales?',
      0,
      'La interacción gravitacional es la más débil a esa escala.'
    ],

    [
      '¿Cuál interacción explica principalmente el movimiento orbital de los planetas?',
      0,
      'La atracción gravitacional mantiene los planetas en órbita.'
    ],

    [
      '¿Cuál interacción produce la repulsión eléctrica entre dos protones?',
      1,
      'Las cargas eléctricas del mismo signo se repelen.'
    ],

    [
      '¿Cuál interacción mantiene unidos los quarks dentro de los protones?',
      2,
      'Los quarks interactúan mediante la interacción fuerte.'
    ],

    [
      '¿Cuál interacción explica la transformación de un neutrón en un protón durante la desintegración beta negativa?',
      3,
      'Este proceso corresponde a la interacción débil.'
    ],

    [
      '¿Cuál interacción explica principalmente las mareas terrestres?',
      0,
      'Las mareas se originan por diferencias en la atracción gravitacional.'
    ],

    [
      '¿Cuál interacción explica la atracción entre un electrón y un protón?',
      1,
      'Las cargas eléctricas de signos contrarios se atraen.'
    ],

    [
      '¿Cuál interacción fundamental es responsable de los enlaces químicos?',
      1,
      'Los enlaces químicos tienen origen electromagnético.'
    ]

  ];

  B.register('Fuerzas fundamentales', () => {

    const [q,i,s] = B.pick(concepts);

    return B.item(
      q,
      interactions[i],
      s,
      interactions.filter((_,j) => j !== i)
    );

  });

  // ========================================
  // LEY DE GRAVITACION UNIVERSAL
  // ========================================

  B.register('Ley de gravitación universal', () => {

    const m1 = B.rand(10,150);
    const m2 = B.rand(10,150);

    const r = B.rand(5,80)/10;

    const force = F.force(m1,m2,r);

    const mode = B.rand(0,5);

    if (mode === 0) {

      return numeric(
        `Dos cuerpos de masas ${m1} kg y ${m2} kg están separados por una distancia entre sus centros de ${f(r)} m. Determine la magnitud de la fuerza gravitacional.` + constant,
        force,
        'N',
        `F = Gm₁m₂/r² = G × ${m1} × ${m2}/${f(r)}²`,
        [G*m1*m2/r,G*(m1+m2)/r**2]
      );

    }

    if (mode === 1) {

      const given = B.rand(10,90)*1e-9;

      return numeric(
        `Dos cuerpos se atraen con una fuerza de ${f(given)} N. Si sus masas son ${m1} kg y ${m2} kg, determine la distancia entre sus centros.` + constant,
        Math.sqrt(G*m1*m2/given),
        'm',
        `r = √(Gm₁m₂/F) = √(G × ${m1} × ${m2}/${f(given)})`
      );

    }

    if (mode === 2) {

      const given = B.rand(10,90)*1e-9;

      return numeric(
        `Dos cuerpos están separados por una distancia entre sus centros de ${f(r)} m. La masa del primero es ${m1} kg y la fuerza gravitacional entre ambos es ${f(given)} N. Determine la masa del segundo.` + constant,
        given*r**2/(G*m1),
        'kg',
        `m₂ = Fr²/(Gm₁) = ${f(given)} × ${f(r)}²/(G × ${m1})`
      );

    }

    if (mode === 3 || mode === 4) {

      const factor = B.rand(2,5);

      const initial = B.rand(10,90)*1e-8;

      const increase = mode === 3;

      const value = increase
        ? initial/factor**2
        : initial*factor**2;

      const change = increase
        ? `aumenta a ${factor} veces su valor inicial`
        : `se reduce a 1/${factor} de su valor inicial`;

      return numeric(
        `La fuerza gravitacional entre dos cuerpos es ${f(initial)} N. Si la distancia entre sus centros ${change}, sin modificar sus masas, determine la nueva fuerza.`,
        value,
        'N',
        increase
          ? `F₂ = F₁/${factor}² = ${f(initial)}/${factor}²`
          : `F₂ = F₁ × ${factor}² = ${f(initial)} × ${factor}²`,
        [initial*factor,initial/factor]
      );

    }

    const body = randomBody();

    const m = B.rand(100,2000);

    const h = B.rand(100,2000);

    const radius = body.R+h*1000;

    return numeric(
      `Una nave de ${m} kg se encuentra a ${h} km de altura sobre ${body.name}. Considere M = ${f(body.M)} kg y R = ${f(body.R)} m. Determine la fuerza gravitacional sobre la nave.` + constant,
      F.force(body.M,m,radius),
      'N',
      `r = R+h; F = GMm/(R+h)² = G × ${f(body.M)} × ${m}/(${f(body.R)}+${h} × 1000)²`
    );

  });

  // ========================================
  // TERCERA LEY Y CAMPO GRAVITACIONAL
  // ========================================

  B.register(
    'Tercera ley y campo gravitacional',
    () => {

      const mode = B.rand(0,5);

      const m = B.rand(5,150);

      const g = B.rand(10,120)/10;

      if (mode === 0) {

        const force = B.rand(10,90)*1e19;

        return numeric(
          `Un planeta ejerce una fuerza gravitacional de magnitud ${f(force)} N sobre un satélite. Determine la magnitud de la fuerza que ejerce el satélite sobre el planeta.`,
          force,
          'N',
          `Por la tercera ley de Newton, ambas fuerzas tienen igual magnitud: F₂ = F₁`
        );

      }

      if (mode === 1) {

        return numeric(
          `Un cuerpo de ${m} kg experimenta una fuerza gravitacional de ${f(m*g)} N. Determine la intensidad del campo gravitacional.`,
          g,
          'N/kg',
          `g = F/m = ${f(m*g)}/${m}`
        );

      }

      if (mode === 2) {

        return numeric(
          `Una sonda de ${m} kg se encuentra en una región donde el campo gravitacional es ${f(g)} N/kg. Determine la fuerza gravitacional.`,
          m*g,
          'N',
          `F = mg = ${m} × ${f(g)}`
        );

      }

      if (mode === 3) {

        const body = randomBody();

        const h = B.rand(100,2000);

        const r = body.R+h*1000;

        return numeric(
          `Determine la intensidad del campo gravitacional a una distancia de ${f(r)} m del centro de ${body.name}, cuya masa es ${f(body.M)} kg.` + constant,
          F.field(body.M,r),
          'N/kg',
          `g = GM/r² = G × ${f(body.M)}/${f(r)}²`
        );

      }

      if (mode === 4) {

        const M = B.rand(10,90)*1e23;

        return numeric(
          `Un planeta tiene una masa de ${f(M)} kg. En una región exterior al planeta, el campo gravitacional es ${f(g)} N/kg. Determine la distancia desde su centro.` + constant,
          Math.sqrt(G*M/g),
          'm',
          `r = √(GM/g) = √(G × ${f(M)}/${f(g)})`
        );

      }

      const a = B.rand(10,50);
      const b = a+B.rand(5,50);

      return B.item(

        `Dos cuerpos de masas ${a} kg y ${b} kg se atraen gravitacionalmente. ¿Cuál experimenta mayor magnitud de aceleración debido exclusivamente a esta interacción?`,

        `El cuerpo de ${a} kg`,

        'Las fuerzas tienen igual magnitud, pero a = F/m. El cuerpo de menor masa experimenta mayor aceleración.',

        [
          `El cuerpo de ${b} kg`,
          'Ambos experimentan igual aceleración',
          'Ninguno experimenta aceleración'
        ]

      );

    }
  );

})();
