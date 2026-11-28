(function(){

  'use strict';

  const G = 6.67430e-11;

  const catalog = Object.freeze({

    'Mercurio': Object.freeze({M:3.301e23,R:2440}),
    'Venus': Object.freeze({M:4.867e24,R:6052}),
    'Tierra': Object.freeze({M:5.972e24,R:6371}),
    'Marte': Object.freeze({M:6.417e23,R:3390}),
    'Júpiter': Object.freeze({M:1.898e27,R:69911}),
    'Saturno': Object.freeze({M:5.683e26,R:58232}),
    'Urano': Object.freeze({M:8.681e25,R:25362}),
    'Neptuno': Object.freeze({M:1.024e26,R:24622}),
    'Luna': Object.freeze({M:7.342e22,R:1737}),
    'Plutón': Object.freeze({M:1.303e22,R:1188}),
    'Sol': Object.freeze({M:1.9885e30,R:695700})

  });

  function number(value){

    if(
      value === null ||
      value === undefined ||
      String(value).trim() === ''
    ){
      throw new Error('Complete todos los parámetros.');
    }

    const n = Number(
      String(value).trim().replace(',','.')
    );

    if(!Number.isFinite(n)){

      throw new Error('Valor numérico inválido.');

    }

    return n;

  }

  function calculate(data){

    const M = number(data.M);

    const R = number(data.R)*1000;

    const h = number(data.h)*1000;

    const m = number(data.m);

    if(M<=0 || R<=0 || h<0 || m<=0){

      throw new Error(
        'La masa y el radio deben ser positivos. '+
        'La altura no puede ser negativa.'
      );

    }

    const r = R+h;

    const g = G*M/r**2;

    const F = m*g;

    const v = Math.sqrt(G*M/r);

    const T = 2*Math.PI*Math.sqrt(r**3/(G*M));

    const escape = Math.sqrt(2*G*M/r);

    const result = {

      M,R,h,m,r,g,F,v,T,escape,

      minutes:T/60,

      hours:T/3600,

      surfaceGravity:G*M/R**2

    };

    if(
      !Object.values(result).every(
        x=>Number.isFinite(x)
      ) ||
      [g,F,v,T,escape,result.surfaceGravity]
        .some(x=>x<=0)
    ){

      throw new Error(
        'Los parámetros exceden el rango de cálculo.'
      );

    }

    return result;

  }

  function interaction(data){

    const m1 = number(data.m1);

    const m2 = number(data.m2);

    const r = number(data.r);

    if(m1<=0 || m2<=0 || r<=0){

      throw new Error(
        'Las masas y la distancia deben ser positivas.'
      );

    }

    const F = G*m1*m2/r**2;

    if(!Number.isFinite(F) || F<=0){

      throw new Error('Resultado fuera de rango.');

    }

    return {m1,m2,r,F};

  }

  window.STEMGravitationParameters = Object.freeze({

    G,

    catalog,

    number,

    calculate,

    interaction

  });

})();
