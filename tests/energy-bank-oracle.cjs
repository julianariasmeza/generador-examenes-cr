'use strict';

const assert = require('node:assert/strict');

global.window = global;

require('../banks/physics/index.js');
require('../banks/physics/energia-utils.js');
require('../banks/physics/trabajo-potencia.js');
require('../banks/physics/energia-basica.js');
require('../banks/physics/energia-conservacion.js');
require('../banks/physics/energia-avanzada.js');

const B = window.STEMPhysicsBank;
const g = 9.8;

const coverage = new Map();

function numbers(s) {
  return (s.replace(/,/g,'.')
    .replace(/−/g,'-')
    .match(/-?\d+(?:\.\d+)?/g)||[])
    .map(Number);
}

function expected(topic,q) {

  const a = numbers(
    q.replace(/Considere g = 9,8 m\/s²\./g,'')
  );

  const [A,C,D,E,H] = a;

  const has = s => q.includes(s);
  const starts = s => q.startsWith(s);

  function r(mode,value,unit='J') {
    const key = topic+' / '+mode;
    coverage.set(key,(coverage.get(key)||0)+1);
    return {value,unit};
  }

  switch(topic) {

    case 'Trabajo mecánico':

      if(starts('Una fuerza horizontal'))
        return r('Directo',A*C);

      if(has('forma un ángulo'))
        return r('Angular',
          A*D*Math.cos(C*Math.PI/180));

      if(starts('Una fuerza paralela'))
        return r('Fuerza',A/C,'N');

      if(has('distancia recorrida'))
        return r('Distancia',C/A,'m');

      if(starts('Una persona'))
        return r('Elevacion',A*g*C);

      break;

    case 'Trabajo neto y rozamiento':

      if(has('¿Cuál'))
        return r('Peso perpendicular',0);

      if(starts('Una fuerza horizontal'))
        return r('Friccion conocida',(A-D)*C);

      if(has('magnitud de la fuerza de fricción'))
        return r('Friccion',E*A*g,'N');

      if(has('trabajo realizado por la fuerza aplicada'))
        return r('Trabajo aplicado',D*C);

      if(has('trabajo realizado por la fuerza de fricción'))
        return r('Trabajo friccion',-E*A*g*C);

      if(has('Determine el trabajo neto'))
        return r('Trabajo neto',(D-E*A*g)*C);

      break;

    case 'Potencia mecánica':

      if(starts('Una máquina realiza'))
        return r('Potencia media',A/C,'W');

      if(starts('Una grúa'))
        return r('Grua',A*g*C/D,'W');

      if(starts('Un vehículo'))
        return r('Traccion',A*C,'W');

      if(starts('Una máquina desarrolla'))
        return r('Trabajo',A*C);

      if(starts('Una máquina de potencia'))
        return r('Tiempo',C/A,'s');

      if(starts('Un motor'))
        return r('Kilovatios',1000*A*C);

      break;

    case 'Eficiencia mecánica':

      if(has('eficiencia porcentual'))
        return r('Eficiencia',100*C/A,'%');

      if(has('energía útil entregada'))
        return r('Energia util',A*C/100);

      if(has('no se transforma'))
        return r('Perdidas',A*(1-C/100));

      if(has('energía suministrada'))
        return r('Entrada',100*A/C);

      if(has('potencia útil'))
        return r('Potencia util',A*C/100,'W');

      break;

    case 'Energía cinética':

      if(has('relación'))
        return r('Relacion',A**2,'');

      if(starts('Un automóvil'))
        return r('Kilometros hora',
          A*(C/3.6)**2/2);

      if(starts('Una pelota'))
        return r('Gramos',A*C**2/2000);

      if(has('Determine su masa'))
        return r('Masa',2*C/A**2,'kg');

      if(has('Determine su rapidez.'))
        return r('Rapidez',Math.sqrt(2*C/A),'m/s');

      if(has('Determine su energía cinética'))
        return r('Directo',A*C**2/2);

      break;

    case 'Energía potencial gravitacional':

      if(has('variación'))
        return r('Variacion',A*g*(D-C));

      if(has('Determine su altura'))
        return r('Altura',C/(A*g),'m');

      if(has('Determine su masa'))
        return r('Masa',C/(A*g),'kg');

      if(/\d+\s+g\s+se encuentra/.test(q))
        return r('Gramos',A*g*C/1000);

      return r('Directo',A*g*C);

    case 'Energía potencial elástica':

      if(has('relación'))
        return r('Relacion',A**2,'');

      if(has('magnitud de su deformación'))
        return r('Deformacion',
          Math.sqrt(2*C/A),'m');

      if(has('Determine su constante elástica'))
        return r('Constante',2*C/A**2,'N/m');

      if(has(' cm '))
        return r('Centimetros',A*(C/100)**2/2);

      return r('Directo',A*C**2/2);

    case 'Teorema trabajo-energía':

      if(has('¿qué ocurre'))
        return r('Conceptual','Disminuye','');

      if(has('cambia su rapidez'))
        return r('Variacion',A*(D**2-C**2)/2);

      if(has('Determine su rapidez final'))
        return r('Rapidez final',
          Math.sqrt(Math.max(0,C**2+2*D/A)),
          'm/s');

      if(has('inicialmente en reposo'))
        return r('Desde reposo',A*C**2/2);

      if(has('distancia de frenado'))
        return r('Distancia',A*C**2/(2*D),'m');

      if(has('magnitud de esa fuerza'))
        return r('Fuerza',A*C**2/(2*D),'N');

      break;

    case 'Conservación de la energía mecánica':

      if(has('¿Qué ocurre'))
        return r('Conceptual','Permanece constante','');

      if(has('energía mecánica durante'))
        return r('Energia mecanica',A*g*C);

      if(has('energía potencial gravitacional'))
        return r('Potencial',A*g*D);

      if(has('energía cinética cuando'))
        return r('Cinetica',A*g*(C-D));

      if(starts('Un objeto se deja caer'))
        return r('Rapidez intermedia',
          Math.sqrt(2*g*(A-C)),'m/s');

      if(has('rapidez inmediatamente antes'))
        return r('Impacto',Math.sqrt(2*g*C),'m/s');

      if(has('parte del reposo'))
        return r('Rampa reposo',Math.sqrt(2*g*C),'m/s');

      if(has('inicia su descenso'))
        return r('Rampa velocidad inicial',
          Math.sqrt(C**2+2*g*D),'m/s');

      if(starts('Un péndulo'))
        return r('Pendulo',Math.sqrt(2*g*C),'m/s');

      if(has('altura máxima'))
        return r('Altura maxima',C**2/(2*g),'m');

      if(has('lanza horizontalmente'))
        return r('Lanzamiento horizontal',
          Math.sqrt(C**2+2*g*A),'m/s');

      if(has('lanza verticalmente'))
        return r('Altura intermedia',
          (A**2-C**2)/(2*g),'m');

      break;

    case 'Energía mecánica con rozamiento':

      if(has('superficie horizontal rugosa')) {

        const friction = A*g*D;
        const kinetic = A*C**2/2;
        const final = kinetic-friction*E;

        if(has('hasta detenerse'))
          return r('Distancia frenado',
            kinetic/friction,'m');

        if(has('trabajo de la fricción'))
          return r('Trabajo horizontal',-friction*E);

        if(has('energía cinética'))
          return r('Cinetica horizontal',final);

        if(has('Determine su rapidez'))
          return r('Rapidez horizontal',
            Math.sqrt(2*final/A),'m/s');

      }

      if(has('plano inclinado')) {

        const angle = D*Math.PI/180;
        const Wg = A*g*C*Math.sin(angle);
        const Wf = -E*A*g*C*Math.cos(angle);

        if(has('trabajo realizado por el peso'))
          return r('Trabajo peso',Wg);

        if(has('trabajo realizado por la fricción'))
          return r('Friccion inclinada',Wf);

        if(has('energía cinética'))
          return r('Cinetica inclinada',Wg+Wf);

        if(has('Determine su rapidez'))
          return r('Rapidez inclinada',
            Math.sqrt(2*(Wg+Wf)/A),'m/s');

      }

      break;

    case 'Sistemas con resortes':

      if(has('impulsa desde el reposo'))
        return r('Lanzamiento',
          C*Math.sqrt(A/D),'m/s');

      if(has('Determine la constante elástica'))
        return r('Constante',A*C**2/D**2,'N/m');

      if(has('trabajo realizado por el resorte'))
        return r('Trabajo resorte',A*C**2/2);

      if(has('desciende por una rampa'))
        return r('Rampa resorte',
          Math.sqrt(2*A*g*C/D),'m');

      if(has('Durante toda la compresión')) {

        const friction = E*A*g;

        const x = (
          Math.sqrt(friction**2+D*A*C**2)
          -friction
        )/D;

        return r('Resorte con friccion',x,'m');

      }

      if(has('compresión máxima'))
        return r('Compresion',
          C*Math.sqrt(A/D),'m');

      break;

    case 'Problemas de varias etapas':

      if(has('Luego atraviesa')) {

        const kinetic = A*g*(C-E*D);

        if(has('energía cinética'))
          return r('Cinetica antes resorte',kinetic);

        if(has('Determine la rapidez'))
          return r('Rapidez antes resorte',
            Math.sqrt(2*kinetic/A),'m/s');

        if(has('Determine la compresión'))
          return r('Compresion final',
            Math.sqrt(2*kinetic/H),'m');

        if(has('energía potencial elástica'))
          return r('Energia elastica final',kinetic);

      } else {

        const friction = A*g*D;
        const kinetic = A*g*C-friction*E;

        if(has('hasta detenerse'))
          return r('Distancia',C/D,'m');

        if(has('trabajo de la fricción'))
          return r('Trabajo friccion',-friction*E);

        if(has('energía cinética'))
          return r('Energia cinetica',kinetic);

        if(has('Determine la rapidez'))
          return r('Rapidez',
            Math.sqrt(2*kinetic/A),'m/s');

      }

      break;

  }

  throw new Error('Enunciado no reconocido: '+q);

}

function verify(z,expected) {

  assert.equal(z.options.length,4,z.q);

  assert.equal(
    new Set(z.options).size,4,z.q
  );

  assert.ok(z.options.includes(z.r),z.q);

  const {value,unit} = expected;

  if(typeof value==='string') {
    assert.equal(z.r,value,z.q);
    return;
  }

  assert.ok(Number.isFinite(value),z.q);

  const actual = numbers(z.r)[0];

  assert.ok(
    Number.isFinite(actual),
    'Respuesta no numerica: '+z.r
  );

  const actualUnit = z.r.trim().replace(
    /^[-−]?\d+(?:[,.]\d+)?\s*/,
    ''
  );

  assert.equal(actualUnit,unit,z.q);

  const tolerance = 0.005+Math.abs(value)*1e-12;

  assert.ok(
    Math.abs(actual-value)<=tolerance,
    JSON.stringify({
      pregunta:z.q,
      respuesta:z.r,
      esperado:value,
      unidad:unit,
      tolerancia:tolerance
    },null,2)
  );

  if(unit==='%') {
    for(const option of z.options) {
      const n = numbers(option)[0];
      assert.ok(n>=0 && n<=100,option);
    }
  }

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

assert.equal(B.topics().length,12);
assert.equal(coverage.size,78);
assert.equal(total,60000);

console.log('\nTemas comprobados: 12');
console.log('Variantes comprobadas: '+coverage.size);
console.log('Ejercicios comprobados: '+total);

console.log(
  '===== BANCO DE ENERGIA VALIDADO ====='
);
