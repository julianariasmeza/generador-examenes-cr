'use strict';

const assert = require('node:assert/strict');
const S = require('../specifications.js');

assert.equal(S.TYPES.length, 8);

const spec = S.create({
  preliminaryPoints: 19,
  rows: [
    {
      topic: 'Funciones',
      learning: 'Analizar funciones',
      indicator: 'Determina imágenes',
      lessons: 10,
      distribution: { sel: 10 }
    },
    {
      topic: 'Álgebra',
      learning: 'Resolver ecuaciones',
      indicator: 'Determina soluciones',
      lessons: 4,
      distribution: { short: 4 }
    },
    {
      topic: 'Geometría',
      learning: 'Resolver situaciones geométricas',
      indicator: 'Justifica procedimientos',
      lessons: 5,
      distribution: { dev: 5 }
    }
  ]
});

const result = S.calculate(spec);

assert.equal(result.totalLessons, 19);
assert.equal(result.constant, 1);
assert.equal(result.finalPoints, 19);
assert.equal(result.assignedPoints, 19);
assert.equal(result.distribution.sel, 10);
assert.equal(result.distribution.short, 4);
assert.equal(result.distribution.dev, 5);
assert.equal(S.validate(spec).valid, true);

console.log('OK | Distribucion de 19 puntos');

const adjusted = S.create({
  preliminaryPoints: 50,
  rows: [
    {
      learning: 'Aprendizaje A',
      indicator: 'Indicador A',
      lessons: 23,
      distribution: { exercise: 46 }
    },
    {
      learning: 'Aprendizaje B',
      indicator: 'Indicador B',
      lessons: 2,
      overridePoints: 2,
      adjustmentReason: 'Ajuste docente',
      distribution: { sel: 2 }
    }
  ]
});

const a = S.calculate(adjusted);

assert.equal(a.totalLessons, 25);
assert.equal(a.constant, 2);
assert.equal(a.rows[1].recommendedPoints, 4);
assert.equal(a.finalPoints, 48);
assert.equal(a.assignedPoints, 48);
assert.equal(S.validate(adjusted).valid, true);

console.log('OK | Ajuste de 50 a 48 puntos');

const questions = [
  ...Array.from({length: 10}, () => ({
    k: 'sel',
    p: 1,
    specId: spec.rows[0].id
  })),
  {
    k: 'short',
    p: 2,
    specId: spec.rows[1].id
  },
  {
    k: 'short',
    p: 2,
    specId: spec.rows[1].id
  },
  {
    k: 'dev',
    p: 5,
    specId: spec.rows[2].id
  }
];

let comparison = S.compare(
  spec, questions, q => q.p
);

assert.equal(comparison.actualTotal, 19);
assert.equal(comparison.matches, true);

questions.pop();

comparison = S.compare(
  spec, questions, q => q.p
);

assert.equal(comparison.actualTotal, 14);
assert.equal(comparison.remaining, 5);
assert.equal(comparison.matches, false);

console.log('OK | Comparacion con examen real');

questions.push({ k: 'dev', p: 5 });

comparison = S.compare(
  spec, questions, q => q.p
);

assert.equal(comparison.unlinked.length, 1);
assert.equal(comparison.unlinkedPoints, 5);
assert.equal(comparison.matches, false);

console.log('OK | Deteccion de preguntas sin indicador');

const corr = S.create({
  preliminaryPoints: 4,
  rows: [{
    learning: 'Clasificar conceptos',
    indicator: 'Relaciona conceptos',
    lessons: 2,
    distribution: { corr: 4 }
  }]
});

const corrResult = S.compare(
  corr,
  [{
    k: 'corr',
    p: 1,
    parts: ['A', 'B', 'C', 'D'],
    specId: corr.rows[0].id
  }],
  q => q.p * q.parts.length
);

assert.equal(corrResult.actualTotal, 4);
assert.equal(corrResult.matches, true);

console.log('OK | Correspondencia por aciertos');

const restored = S.create(
  JSON.parse(JSON.stringify(spec))
);

assert.deepEqual(restored, spec);

console.log('OK | Guardado y recuperacion');

assert.equal(S.validate(S.create()).valid, false);

console.log('OK | Validacion de tabla vacia');

console.log(
  'TODAS LAS PRUEBAS DEL MOTOR SUPERADAS'
);
