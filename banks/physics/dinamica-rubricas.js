'use strict';

(() => {

  function create(topic, p, z) {

    if (!Number.isInteger(p) || p < 1 || p > 10) {
      return [];
    }

    let criteria;

    if (topic === 'Leyes de Newton') {

      criteria = [
        'Identifica correctamente la ley de Newton.',
        'Justifica la respuesta mediante el principio físico.'
      ];

    } else if (topic === 'Masa y peso') {

      criteria = [
        'Identifica los datos y las unidades.',
        'Selecciona la ecuación correspondiente.',
        'Sustituye correctamente los valores.',
        'Obtiene el resultado con sus unidades.'
      ];

    } else if (
      topic.includes('poleas') ||
      topic === 'Máquina de Atwood'
    ) {

      criteria = [
        'Representa los diagramas de cuerpo libre.',
        'Establece las sumatorias de fuerzas.',
        'Plantea las ecuaciones del sistema.',
        'Realiza los despejes correspondientes.',
        'Sustituye correctamente los datos.',
        'Obtiene el resultado con sus unidades.'
      ];

    } else if (z.dynamicsData) {

      criteria = [
        'Representa el diagrama de cuerpo libre.',
        'Identifica las fuerzas y sus sentidos.',
        'Plantea las ecuaciones necesarias.',
        'Realiza los despejes correspondientes.',
        'Sustituye correctamente los datos.',
        'Obtiene el resultado con sus unidades.'
      ];

    } else {

      criteria = [
        'Identifica los datos del problema.',
        'Plantea la ecuación correspondiente.',
        'Despeja la incógnita.',
        'Sustituye correctamente los valores.',
        'Obtiene el resultado con sus unidades.'
      ];

    }

    if (p === 1) {
      return [{
        label: 'Resuelve correctamente el ejercicio.',
        p: 1
      }];
    }

    const count = Math.min(p, criteria.length);

    const selected = [
      ...criteria.slice(0, count-1),
      criteria[criteria.length-1]
    ];

    const base = Math.floor(p/count);
    const remainder = p % count;

    return selected.map((label, i) => ({
      label,
      p: base + (i < remainder ? 1 : 0)
    }));

  }

  const topics = [
    'Leyes de Newton',
    'Masa y peso',
    'Segunda ley de Newton',
    'Fuerza normal',
    'Fricción cinética',
    'Fuerzas oblicuas',
    'Fuerzas oblicuas con fricción',
    'Planos inclinados sin fricción',
    'Planos inclinados con fricción',
    'Máquina de Atwood',
    'Sistemas de poleas sin fricción',
    'Sistemas de poleas con fricción',
    'Coeficiente de fricción',
    'Fuerzas verticales y grúas',
    'Elevadores y peso aparente'
  ];

  window.STEMDynamicsRubrics = {
    create,
    has: topic => topics.includes(topic),
    topics
  };

})();
