'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const g = 9.8;

  const gravity = ' Considere g = 9,8 m/s².';

  const f = n => B.fmt(
    Math.sign(n)*Math.round((Math.abs(n)+Number.EPSILON)*100)/100
  );

  const radians = angle => angle*Math.PI/180;

  const formulas = Object.freeze({

    work: (F,d,angle=0) =>
      angle === 90 ? 0 : F*d*Math.cos(radians(angle)),

    friction: (mu,N) => mu*N,

    power: (W,t) => W/t,

    efficiency: (useful,input) =>
      100*useful/input,

    kinetic: (m,v) => m*v*v/2,

    potential: (m,h) => m*g*h,

    elastic: (k,x) => k*x*x/2

  });

  function numeric(q,value,unit,solution,errors=[]) {

    if (!Number.isFinite(value)) {

      throw new Error('Resultado no valido');

    }

    const render = n =>
      `${f(n)} ${unit}`.trim();

    const r = render(value);

    const candidates = [

      ...errors,

      value*2,
      value/2,
      -value,
      value+5,
      value+10,
      value+15

    ];

    if (unit === '%') {
      candidates.push(0,25,50,75,100);
    }

    const signed =
      unit === 'J' &&
      /trabajo|variación|potencial gravitacional/i.test(q);

    const valid = n =>
      Number.isFinite(n) &&
      (unit !== '%' || (n >= 0 && n <= 100)) &&
      (signed || n >= 0);

    const wrong = [...new Set(

      candidates
        .filter(valid)
        .map(render)

    )].filter(v=>v!==r).slice(0,3);

    return B.item(

      q+' Redondee a dos decimales cuando sea necesario.',

      r,

      solution+' = '+r,

      wrong

    );

  }

  window.STEMEnergyBank = Object.freeze({

    g,
    gravity,
    f,
    radians,
    formulas,
    numeric

  });

})();
