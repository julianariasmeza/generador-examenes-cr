
'use strict';

const assert = require('node:assert/strict');

global.window = global;

require('../banks/physics/energia-parametros.js');

const P = window.STEMEnergyParameters;

let checks = 0;

function verify(type,data,target,expected){

  const result = P.calculate(type,data);

  const actual = result[target];

  assert.ok(
    Number.isFinite(actual),
    type+': resultado no finito'
  );

  const tolerance =
    1e-9*Math.max(1,Math.abs(expected));

  assert.ok(

    Math.abs(actual-expected)<=tolerance,

    JSON.stringify({
      type,
      data,
      target,
      expected,
      actual
    })

  );

  checks++;

}

const g = 9.8;

for(let i=1;i<=1000;i++){

  const m = 1+i%80;

  const F = 100+i%500;

  const d = 1+i%25;

  const mu = (i%8)/10;

  const angle = [0,30,45,60,90,120,180][i%7];

  const v = 1+i%30;

  const h = 1+i%50;

  const k = 100+i%900;

  const x = (i%100)/100;

  const t = 1+i%60;

  const W = 100+i*10;

  const input = 1000+i;

  const useful = input*(i%101)/100;

  const vi = 10+i%20;

  const vf = i%25;

  const hi = 10+i%30;

  const hf = i%10;

  // 1. Trabajo mecanico

  verify(
    'work',
    {F,d,angle},
    'W',
    F*d*Math.cos(Math.PI*angle/180)
  );

  // 2. Trabajo de friccion

  verify(
    'friction',
    {m,mu,d},
    'Wf',
    -mu*m*g*d
  );

  // 3. Trabajo neto

  verify(
    'netWork',
    {F,m,mu,d},
    'W',
    (F-mu*m*g)*d
  );

  // 4. Potencia

  verify(
    'power',
    {W,t},
    'P',
    W/t
  );

  // 5. Eficiencia

  verify(
    'efficiency',
    {input,useful},
    'eta',
    useful/input*100
  );

  // 6. Energia cinetica

  verify(
    'kinetic',
    {m,v},
    'Ec',
    m*v*v/2
  );

  // 7. Energia potencial gravitacional

  const signedHeight = i%2 ? h : -h;

  verify(
    'potential',
    {m,h:signedHeight},
    'Ep',
    m*g*signedHeight
  );

  // 8. Energia potencial elastica

  verify(
    'elastic',
    {k,x},
    'Ee',
    k*x*x/2
  );

  // 9. Teorema trabajo-energia

  verify(
    'workEnergy',
    {m,vi,vf},
    'W',
    m*(vf-vi)*(vf+vi)/2
  );

  // 10. Conservacion de energia

  verify(
    'conservation',
    {m,hi,hf,vi},
    'vf',
    Math.sqrt(vi*vi+2*g*(hi-hf))
  );

  // 11. Movimiento con rozamiento

  const roughMu = 0.1+mu;

  const stopDistance =
    vi*vi/(2*roughMu*g);

  const roughDistance =
    stopDistance*0.75;

  verify(
    'roughSurface',
    {
      m,
      vi,
      mu:roughMu,
      d:roughDistance
    },
    'vf',
    Math.sqrt(
      vi*vi-2*roughMu*g*roughDistance
    )
  );

  // 12. Sistemas con resortes

  verify(
    'spring',
    {m,v,k},
    'x',
    Math.sqrt(m*v*v/k)
  );

  // 13. Problemas de varias etapas

  const initialHeight = mu*d+h;

  verify(
    'stages',
    {
      m,
      h:initialHeight,
      mu,
      d,
      k
    },
    'x',
    Math.sqrt(2*m*g*h/k)
  );

}

console.log(
  'Modelos matematicos: 13'
);

console.log(
  'Casos por modelo: 1000'
);

console.log(
  'Comprobaciones independientes: '+checks
);

// Casos especiales

verify(
  'work',
  {F:100,d:5,angle:90},
  'W',
  0
);

verify(
  'work',
  {F:100,d:5,angle:180},
  'W',
  -500
);

verify(
  'efficiency',
  {input:1000,useful:0},
  'eta',
  0
);

verify(
  'efficiency',
  {input:1000,useful:1000},
  'eta',
  100
);

verify(
  'kinetic',
  {m:10,v:0},
  'Ec',
  0
);

verify(
  'potential',
  {m:10,h:-5},
  'Ep',
  -490
);

verify(
  'elastic',
  {k:200,x:0},
  'Ee',
  0
);

verify(
  'spring',
  {m:2,v:0,k:200},
  'x',
  0
);

verify(
  'conservation',
  {m:10,hi:5,hf:5,vi:0},
  'vf',
  0
);

console.log('Casos especiales: 9');

console.log(
  'Total de comprobaciones: '+checks
);

console.log(
  '===== VALIDACION MATEMATICA DE ENERGIA SUPERADA ====='
);
