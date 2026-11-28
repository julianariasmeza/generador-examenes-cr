'use strict';

const assert = require('node:assert/strict');

global.window = global;

require('../banks/physics/index.js');
require('../banks/physics/gravitacion-utils.js');
require('../banks/physics/gravitacion-basica.js');
require('../banks/physics/gravitacion-orbital.js');

const B = window.STEMPhysicsBank;
const G = 6.67430e-11;

const superscripts = {
  '⁻':'-', '⁰':'0', '¹':'1', '²':'2',
  '³':'3', '⁴':'4', '⁵':'5', '⁶':'6',
  '⁷':'7', '⁸':'8', '⁹':'9'
};

function normalize(s) {
  return s.replace(
    /×\s*10([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,
    (_, e) => 'e' + [...e]
      .map(c => superscripts[c]).join('')
  ).replace(/,/g,'.')
   .replace(/\s+e/g,'e');
}

function numbers(s) {
  return (
    normalize(s).match(
      /-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi
    ) || []
  ).map(Number);
}

const concepts = [
  ['caída libre','Gravitacional'],
  ['imán','Electromagnética'],
  ['protones y neutrones','Nuclear fuerte'],
  ['desintegración beta','Nuclear débil'],
  ['menor intensidad','Gravitacional'],
  ['movimiento orbital','Gravitacional'],
  ['repulsión eléctrica','Electromagnética'],
  ['quarks','Nuclear fuerte'],
  ['mareas','Gravitacional'],
  ['electrón y un protón','Electromagnética'],
  ['enlaces químicos','Electromagnética']
];

const coverage = new Map();

function expected(topic,q) {

  const statement = q.split(' Utilice G')[0];
  const a = numbers(statement);

  function result(mode,value) {
    const key = topic+' / '+mode;
    coverage.set(key,(coverage.get(key)||0)+1);
    return value;
  }

  switch(topic) {

    case 'Fuerzas fundamentales': {
      const c = concepts.find(([text]) =>
        q.includes(text)
      );
      assert.ok(c,q);
      return result(q,c[1]);
    }

    case 'Ley de gravitación universal':

      if(q.startsWith('Dos cuerpos de masas'))
        return result('F',G*a[0]*a[1]/a[2]**2);

      if(q.startsWith('Dos cuerpos se atraen'))
        return result('r',
          Math.sqrt(G*a[1]*a[2]/a[0]));

      if(q.startsWith('Dos cuerpos están separados'))
        return result('m',
          a[2]*a[0]**2/(G*a[1]));

      if(q.includes('aumenta a'))
        return result('Aumento distancia',
          a[0]/a[1]**2);

      if(q.includes('se reduce a'))
        return result('Reduccion distancia',
          a[0]*a[2]**2);

      if(q.startsWith('Una nave'))
        return result('F altura',
          G*a[2]*a[0]/(a[3]+1000*a[1])**2);

      break;

    case 'Tercera ley y campo gravitacional':

      if(q.startsWith('Un planeta ejerce'))
        return result('Tercera ley',a[0]);

      if(q.startsWith('Un cuerpo de'))
        return result('g',a[1]/a[0]);

      if(q.startsWith('Una sonda'))
        return result('F',a[0]*a[1]);

      if(q.startsWith('Determine la intensidad'))
        return result('Campo radial',
          G*a[1]/a[0]**2);

      if(q.startsWith('Un planeta tiene'))
        return result('Distancia',
          Math.sqrt(G*a[0]/a[1]));

      if(q.startsWith('Dos cuerpos'))
        return result('Aceleracion',
          `El cuerpo de ${Math.min(a[0],a[1])} kg`);

      break;

    case 'Peso y gravedad planetaria':

      if(q.startsWith('Un objeto de'))
        return result('Peso',a[0]*a[1]);

      if(q.startsWith('Un objeto pesa'))
        return result('Masa',a[0]/a[1]);

      if(q.startsWith('Determine la gravedad'))
        return result('Gravedad superficial',
          G*a[0]/a[1]**2);

      if(q.includes('Determine su masa'))
        return result('Masa planetaria',
          a[1]*a[0]**2/G);

      if(q.startsWith('Dos planetas'))
        return result('Relacion',1/a[0]**2);

      if(q.includes('veces la masa terrestre'))
        return result('Proporcionalidad',a[0]*9.8);

      break;

    case 'Gravedad con la altura':

      if(q.startsWith('Determine la intensidad'))
        return result('Campo',
          G*a[1]/(a[2]+1000*a[0])**2);

      if(q.startsWith('Una sonda'))
        return result('Fuerza',
          G*a[0]*a[2]/(a[3]+1000*a[1])**2);

      if(q.startsWith('Un satélite'))
        return result('Relacion',1/a[0]**2);

      if(q.startsWith('Determine la altura'))
        return result('Altura',
          a[2]*(Math.sqrt(a[1])-1));

      break;

    case 'Rapidez orbital':

      if(q.includes('km sobre el nivel'))
        return result('Rapidez altura',
          Math.sqrt(G*a[1]/(a[2]+1000*a[0])));

      if(q.includes('órbita circular de radio'))
        return result('Rapidez radio',
          Math.sqrt(G*a[1]/(1000*a[0])));

      if(q.includes('Determine el radio orbital'))
        return result('Radio',G*a[1]/a[0]**2);

      if(q.startsWith('Dos satélites'))
        return result('Relacion',1/Math.sqrt(a[0]));

      break;

    case 'Período orbital':

      if(q.includes('km sobre el nivel')) {

        const T = 2*Math.PI*Math.sqrt(
          (a[2]+1000*a[0])**3/(G*a[1])
        );

        const minutes = q.includes('en minutos');

        return result(
          minutes?'Minutos':'Segundos',
          minutes?T/60:T
        );

      }

      if(q.includes('con un período de')) {

        const r = Math.cbrt(
          G*a[1]*a[0]**2/(4*Math.PI**2)
        );

        const height = q.includes(
          'Determine su altura'
        );

        return result(
          height?'Altura':'Radio',
          height?r-a[2]:r
        );

      }

      if(q.startsWith('Dos satélites'))
        return result('Relacion',a[0]**1.5);

      break;

    case 'Velocidad de escape':

      if(q.startsWith('Determine la velocidad'))
        return result('Superficie',
          Math.sqrt(2*G*a[0]/a[1]));

      if(q.startsWith('Una nave'))
        return result('Altura',
          Math.sqrt(2*G*a[1]/(a[2]+1000*a[0])));

      if(q.startsWith('Un planeta hipotético'))
        return result('Radio y gravedad',
          Math.sqrt(2*a[0]*a[1]));

      if(q.startsWith('Un satélite'))
        return result('Relacion orbital',
          Math.sqrt(2)*1000*a[0]);

      break;

  }

  throw new Error('Enunciado no reconocido: '+q);

}

function verify(z,value) {

  assert.equal(z.options.length,4);
  assert.equal(new Set(z.options).size,4);
  assert.ok(z.options.includes(z.r));

  if(typeof value==='string') {
    assert.equal(z.r,value,z.q);
    return;
  }

  assert.ok(Number.isFinite(value),z.q);

  const actual = numbers(z.r)[0];

  const tolerance =
    Math.abs(value)>=1e6 ||
    (Math.abs(value)>0 && Math.abs(value)<0.01)
      ? 0.5*10**(
          Math.floor(Math.log10(Math.abs(value)))-3
        )
      : 0.005;

  assert.ok(
    Math.abs(actual-value)<=
      tolerance+Math.abs(value)*1e-12+1e-14,
    JSON.stringify({
      q:z.q,
      respuesta:z.r,
      esperado:value,
      tolerancia:tolerance
    },null,2)
  );

}

let total = 0;

for(const topic of B.topics()) {

  for(let i=0;i<5000;i++) {

    const z = B.question(topic);

    verify(z,expected(topic,z.q));

    total++;

  }

  console.log(topic+': 5000 ejercicios OK');

}

console.log('\n===== COBERTURA DE VARIANTES =====');

for(const [key,count] of coverage)
  console.log(key+': '+count);

assert.equal(coverage.size,47);
assert.equal(total,40000);

console.log('\nVariantes comprobadas: '+coverage.size);
console.log('Ejercicios comprobados: '+total);

console.log(
  '===== BANCO DE GRAVITACION VALIDADO ====='
);
