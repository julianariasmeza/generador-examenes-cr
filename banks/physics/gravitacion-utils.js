'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const G = 6.67430e-11;

  const planets = Object.freeze({

    Mercurio: Object.freeze({
      M: 3.301e23,
      R: 2.440e6,
      g: 3.70
    }),

    Venus: Object.freeze({
      M: 4.867e24,
      R: 6.052e6,
      g: 8.87
    }),

    Tierra: Object.freeze({
      M: 5.972e24,
      R: 6.371e6,
      g: 9.8
    }),

    Marte: Object.freeze({
      M: 6.417e23,
      R: 3.390e6,
      g: 3.71
    }),

    'Júpiter': Object.freeze({
      M: 1.898e27,
      R: 6.9911e7,
      g: 24.79
    }),

    Saturno: Object.freeze({
      M: 5.683e26,
      R: 5.8232e7,
      g: 10.44
    }),

    Urano: Object.freeze({
      M: 8.681e25,
      R: 2.5362e7,
      g: 8.69
    }),

    Neptuno: Object.freeze({
      M: 1.024e26,
      R: 2.4622e7,
      g: 11.15
    }),

    Luna: Object.freeze({
      M: 7.342e22,
      R: 1.737e6,
      g: 1.62
    }),

    'Plutón': Object.freeze({
      M: 1.303e22,
      R: 1.188e6,
      g: 0.62
    }),

    Sol: Object.freeze({
      M: 1.9885e30,
      R: 6.957e8,
      g: 274
    })

  });

  const planetNames = Object.freeze([
    'Mercurio',
    'Venus',
    'Tierra',
    'Marte',
    'Júpiter',
    'Saturno',
    'Urano',
    'Neptuno'
  ]);

  const bodyNames = Object.freeze(
    Object.keys(planets)
  );

  function customBody(name,M,R) {

    name = String(name || '').trim();

    M = Number(M);
    R = Number(R);

    if (
      !name ||
      !Number.isFinite(M) ||
      !Number.isFinite(R) ||
      M <= 0 ||
      R <= 0
    ) {
      throw new Error(
        'Datos del cuerpo celeste invalidos'
      );
    }

    const g = G*M/R**2;

    if (!Number.isFinite(g) || g <= 0) {
      throw new Error(
        'Campo gravitacional invalido'
      );
    }

    return Object.freeze({
      name,
      M,
      R,
      g
    });

  }

  function getBody(name) {

    if (
      !Object.prototype.hasOwnProperty.call(
        planets,name
      )
    ) {
      throw new Error(
        'Cuerpo celeste desconocido: '+name
      );
    }

    return {
      name,
      ...planets[name]
    };

  }

  function randomBody(names=planetNames) {

    return getBody(B.pick(names));

  }

  function orbitalRadius(R,h=0) {

    R = Number(R);
    h = Number(h);

    if (
      !Number.isFinite(R) ||
      !Number.isFinite(h) ||
      R <= 0 ||
      h < 0
    ) {
      throw new Error(
        'Radio o altura invalidos'
      );
    }

    const r = R+h;

    if (!Number.isFinite(r)) {
      throw new Error('Radio orbital invalido');
    }

    return r;

  }

  const superscripts = {
    '-':'⁻',
    '0':'⁰',
    '1':'¹',
    '2':'²',
    '3':'³',
    '4':'⁴',
    '5':'⁵',
    '6':'⁶',
    '7':'⁷',
    '8':'⁸',
    '9':'⁹'
  };

  function scientific(value, digits=4) {

    if (!Number.isFinite(value)) {
      throw new Error('Valor numerico invalido');
    }

    if (value === 0) return '0';

    const [coefficient, exponent] =
      value.toExponential(digits-1).split('e');

    const power = String(Number(exponent))
      .split('')
      .map(c => superscripts[c])
      .join('');

    return coefficient.replace('.',',') +
      ' × 10' + power;

  }

  function format(value) {

    if (!Number.isFinite(value)) {
      throw new Error('Valor numerico invalido');
    }

    const magnitude = Math.abs(value);

    if (
      magnitude !== 0 &&
      (magnitude < 0.01 || magnitude >= 1e6)
    ) {
      return scientific(value);
    }

    return B.fmt(
      Math.round(value*100)/100
    );

  }

  function inputFormat(value) {

    if (!Number.isFinite(value)) {
      throw new Error('Dato numerico invalido');
    }

    const magnitude = Math.abs(value);

    if (
      magnitude !== 0 &&
      (magnitude < 0.01 || magnitude >= 1e6)
    ) {

      const digits = Math.min(
        12,
        Number(value.toPrecision(12))
          .toExponential()
          .split('e')[0]
          .replace(/[^0-9]/g,'')
          .length
      );

      return scientific(value,digits);

    }

    return B.fmt(value);

  }

  function numeric(q,value,unit,solution,errors=[]) {

    const render = v =>
      `${format(v)} ${unit}`.trim();

    const r = render(value);

    const wrong = [...new Set([

      ...errors,

      value*2,
      value/2,
      value*4,
      value/4,
      value*10,
      value/10,

      value+1,
      value+2,
      value+3

    ].filter(Number.isFinite).map(render))]
      .filter(v => v !== r)
      .slice(0,3);

    return B.item(

      q + ' Exprese el resultado con dos decimales o cuatro cifras significativas si utiliza notación científica.',

      r,

      solution + ' = ' + r,

      wrong

    );

  }

  const formulas = Object.freeze({

    force: (m1,m2,r) =>
      G*m1*m2/r**2,

    field: (M,r) =>
      G*M/r**2,

    orbitalSpeed: (M,r) =>
      Math.sqrt(G*M/r),

    orbitalPeriod: (M,r) =>
      2*Math.PI*Math.sqrt(r**3/(G*M)),

    escapeSpeed: (M,r) =>
      Math.sqrt(2*G*M/r),

    radiusFromSpeed: (M,v) =>
      G*M/v**2,

    radiusFromPeriod: (M,T) =>
      Math.cbrt(G*M*T**2/(4*Math.PI**2))

  });

  const constant =
    ' Utilice G = 6,67430 × 10⁻¹¹ N·m²/kg².';

  window.STEMGravitation = Object.freeze({

    G,
    planets,
    planetNames,
    bodyNames,
    customBody,
    getBody,
    randomBody,
    orbitalRadius,
    inputFormat,
    scientific,
    format,
    numeric,
    formulas,
    constant

  });

})();
