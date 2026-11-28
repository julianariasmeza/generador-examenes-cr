
'use strict';

const assert = require('node:assert/strict');

global.window = global;

require('../banks/physics/gravitacion-parametros.js');

const P = window.STEMGravitationParameters;

const G = 6.67430e-11;

let checks = 0;

function verify(actual,expected,label){

  assert.ok(
    Number.isFinite(actual),
    label+': resultado no finito'
  );

  const tolerance = Math.max(
    1e-25,
    Math.abs(expected)*1e-10
  );

  assert.ok(

    Math.abs(actual-expected)<=tolerance,

    JSON.stringify({
      label,
      actual,
      expected,
      tolerance
    })

  );

  checks++;

}

const bodies = [

  ['Mercurio',3.301e23,2440],

  ['Venus',4.867e24,6052],

  ['Tierra',5.972e24,6371],

  ['Marte',6.417e23,3390],

  ['Júpiter',1.898e27,69911],

  ['Saturno',5.683e26,58232],

  ['Urano',8.681e25,25362],

  ['Neptuno',1.024e26,24622],

  ['Luna',7.342e22,1737],

  ['Plutón',1.303e22,1188],

  ['Sol',1.9885e30,695700]

];

for(const [name,M,R] of bodies){

  for(let i=0;i<1000;i++){

    const h = i*125;

    const m = 1+i*2.5;

    const z = P.calculate({
      name,M,R,h,m
    });

    const radius = R*1000;

    const altitude = h*1000;

    const distance = radius+altitude;

    const gravity = G*M/distance**2;

    const speed = Math.sqrt(
      G*M/distance
    );

    const period = 2*Math.PI*distance/speed;

    const escape = Math.sqrt(
      2*G*M/distance
    );

    verify(z.R,radius,name+' radio');

    verify(z.h,altitude,name+' altura');

    verify(z.r,distance,name+' distancia');

    verify(z.g,gravity,name+' gravedad');

    verify(z.F,m*gravity,name+' peso');

    verify(z.v,speed,name+' rapidez orbital');

    verify(z.T,period,name+' periodo');

    verify(z.escape,escape,name+' escape');

    verify(
      z.minutes,
      period/60,
      name+' minutos'
    );

    verify(
      z.hours,
      period/3600,
      name+' horas'
    );

    verify(
      z.surfaceGravity,
      G*M/radius**2,
      name+' gravedad superficial'
    );

    verify(
      z.escape/z.v,
      Math.sqrt(2),
      name+' relacion de velocidades'
    );

    verify(
      z.v**2/z.r,
      z.g,
      name+' aceleracion centripeta'
    );

    verify(
      z.T**2,
      4*Math.PI**2*z.r**3/(G*M),
      name+' tercera ley de Kepler'
    );

  }

  console.log(name+': OK');

}

console.log(
  'Comprobaciones orbitales: '+checks
);

// INTERACCION ENTRE DOS MASAS

for(let i=1;i<=10000;i++){

  const m1 = 10+i*3;

  const m2 = 20+i*7;

  const r = 1+i/10;

  const z = P.interaction({
    m1,m2,r
  });

  const expected = G*m1*m2/r**2;

  verify(
    z.F,
    expected,
    'Gravitacion universal'
  );

  const reversed = P.interaction({

    m1:m2,

    m2:m1,

    r

  });

  verify(
    reversed.F,
    expected,
    'Simetria de la interaccion'
  );

  const doubled = P.interaction({

    m1,m2,

    r:2*r

  });

  verify(
    doubled.F,
    expected/4,
    'Ley del inverso del cuadrado'
  );

}

console.log(
  'Interacciones gravitacionales: 30000'
);

// CASOS INVALIDOS

const base = {

  name:'Tierra',

  M:5.972e24,

  R:6371,

  h:400,

  m:500

};

const invalid = [

  {M:0},

  {M:-1},

  {R:0},

  {R:-1},

  {h:-1},

  {m:0},

  {m:-1},

  {M:''},

  {R:Infinity},

  {h:NaN}

];

for(const changes of invalid){

  assert.throws(()=>{

    P.calculate({

      ...base,

      ...changes

    });

  });

  checks++;

}

console.log(
  'Restricciones comprobadas: '+invalid.length
);

console.log(
  'Total de comprobaciones: '+checks
);

console.log(
  '===== VALIDACION MATEMATICA DE GRAVITACION SUPERADA ====='
);
