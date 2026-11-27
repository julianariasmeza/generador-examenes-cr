'use strict';

/* Exam STEM CR 2.8.2-A
   Motor de tabla de especificaciones */

const STEMSpecifications = (() => {

  const TYPES = Object.freeze([
    { key: 'sel', code: 'SR', name: 'Selección de respuesta' },
    { key: 'corr', code: 'CO', name: 'Correspondencia' },
    { key: 'id', code: 'ID', name: 'Identificación' },
    { key: 'short', code: 'RC', name: 'Respuesta corta' },
    { key: 'restricted', code: 'RR', name: 'Respuesta restringida' },
    { key: 'exercise', code: 'RE', name: 'Resolución de ejercicios' },
    { key: 'problem', code: 'RP', name: 'Resolución de problemas' },
    { key: 'dev', code: 'DE', name: 'Desarrollo' }
  ].map(Object.freeze));

  const number = value => {
    const n = Number(String(value ?? 0).replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };

  const round = (n, decimals = 2) => {
    const factor = 10 ** decimals;
    return Math.round((n + Number.EPSILON) * factor) / factor;
  };

  const sum = values =>
    round(values.reduce((a, b) => a + number(b), 0));

  const uid = () =>
    globalThis.crypto?.randomUUID?.() ||
    Date.now().toString(36) + Math.random().toString(36).slice(2);

  function emptyDistribution() {
    return Object.fromEntries(
      TYPES.map(type => [type.key, 0])
    );
  }

  function createRow(data = {}) {

    const distribution = emptyDistribution();

    for (const type of TYPES) {
      distribution[type.key] =
        number(data.distribution?.[type.key]);
    }

    return {
      id: data.id || uid(),
      topic: String(data.topic || ''),
      learning: String(data.learning || ''),
      indicator: String(data.indicator || ''),
      lessons: number(data.lessons),
      overridePoints:
        data.overridePoints == null ||
        data.overridePoints === ''
          ? null
          : number(data.overridePoints),
      adjustmentReason: String(data.adjustmentReason || ''),
      distribution
    };
  }

  function create(data = {}) {
    return {
      version: 1,
      regional: String(data.regional || ''),
      preliminaryPoints: number(data.preliminaryPoints),
      paper: data.paper || 'Carta',
      hideUnusedTypes: data.hideUnusedTypes !== false,
      rows: Array.isArray(data.rows)
        ? data.rows.map(createRow)
        : []
    };
  }

  function calculate(data) {

    const spec = create(data);

    const totalLessons = sum(
      spec.rows.map(row => row.lessons)
    );

    const constant = totalLessons > 0
      ? round(spec.preliminaryPoints / totalLessons)
      : 0;

    const distribution = emptyDistribution();

    const rows = spec.rows.map(row => {

      const partialPoints = round(
        row.lessons * constant
      );

      const recommendedPoints = Math.round(partialPoints);

      const finalPoints = row.overridePoints === null
        ? recommendedPoints
        : row.overridePoints;

      const assignedPoints = sum(
        Object.values(row.distribution)
      );

      for (const type of TYPES) {
        distribution[type.key] = round(
          distribution[type.key] +
          row.distribution[type.key]
        );
      }

      return {
        ...row,
        partialPoints,
        recommendedPoints,
        finalPoints,
        assignedPoints,
        difference: round(finalPoints - assignedPoints)
      };
    });

    const finalPoints = sum(
      rows.map(row => row.finalPoints)
    );

    const assignedPoints = sum(
      Object.values(distribution)
    );

    return {
      preliminaryPoints: spec.preliminaryPoints,
      totalLessons,
      constant,
      rows,
      distribution,
      finalPoints,
      assignedPoints,
      difference: round(finalPoints - assignedPoints)
    };
  }

  function validate(data) {

    const result = calculate(data);
    const errors = [];
    const warnings = [];
    const ids = new Set();

    if (result.preliminaryPoints <= 0) {
      errors.push('Ingresá una puntuación preliminar positiva.');
    }

    if (!result.rows.length) {
      errors.push('Agregá al menos un indicador.');
    }

    if (result.totalLessons <= 0) {
      errors.push('Registrá las lecciones impartidas.');
    }

    result.rows.forEach((row, index) => {

      const prefix = 'Fila ' + (index + 1) + ': ';

      if (ids.has(row.id)) {
        errors.push(prefix + 'Identificador duplicado.');
      }

      ids.add(row.id);

      if (!row.learning.trim()) {
        errors.push(prefix + 'Falta el aprendizaje.');
      }

      if (!row.indicator.trim()) {
        errors.push(prefix + 'Falta el indicador.');
      }

      if (row.lessons <= 0) {
        errors.push(prefix + 'Faltan lecciones.');
      }

      if (row.difference !== 0) {
        errors.push(
          prefix + 'La distribución no coincide con los puntos.'
        );
      }

      if (
        row.overridePoints !== null &&
        row.overridePoints !== row.recommendedPoints &&
        !row.adjustmentReason.trim()
      ) {
        warnings.push(
          prefix + 'Conviene justificar el ajuste de puntos.'
        );
      }
    });

    if (
      result.finalPoints !== result.preliminaryPoints
    ) {
      warnings.push(
        'El puntaje definitivo difiere del preliminar.'
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      result
    };
  }

  function compare(data, questions, pointFunction) {

    if (typeof pointFunction !== 'function') {
      throw new TypeError(
        'Se requiere la función de puntaje del examen.'
      );
    }

    const plan = calculate(data);

    const actual = new Map(
      plan.rows.map(row => [
        row.id,
        emptyDistribution()
      ])
    );

    const unlinked = [];
    let actualTotal = 0;
    let unlinkedPoints = 0;

    questions.forEach((question, index) => {

      const value = number(pointFunction(question));

      actualTotal = round(actualTotal + value);

      const target = actual.get(question.specId);

      if (
        !target ||
        !Object.hasOwn(target, question.k)
      ) {
        unlinked.push(index + 1);
        unlinkedPoints = round(unlinkedPoints + value);
        return;
      }

      target[question.k] = round(
        target[question.k] + value
      );
    });

    const rows = plan.rows.map(row => {

      const real = actual.get(row.id);
      const actualPoints = sum(Object.values(real));

      const differences = Object.fromEntries(
        TYPES.map(type => [
          type.key,
          round(
            row.distribution[type.key] -
            real[type.key]
          )
        ])
      );

      return {
        ...row,
        actual: real,
        actualPoints,
        differences,
        remaining: round(
          row.finalPoints - actualPoints
        ),
        matches:
          row.difference === 0 &&
          row.finalPoints === actualPoints &&
          Object.values(differences)
            .every(value => value === 0)
      };
    });

    return {
      plannedTotal: plan.finalPoints,
      actualTotal,
      unlinked,
      unlinkedPoints,
      remaining: round(
        plan.finalPoints - actualTotal
      ),
      rows,
      matches:
        rows.length > 0 &&
        unlinked.length === 0 &&
        rows.every(row => row.matches)
    };
  }

  return Object.freeze({
    TYPES,
    create,
    createRow,
    calculate,
    validate,
    compare,
    emptyDistribution
  });

})();

if (typeof window !== 'undefined') {
  window.STEMSpecifications = STEMSpecifications;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = STEMSpecifications;
}
