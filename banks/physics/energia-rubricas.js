'use strict';

(() => {

  const topics = Object.freeze([

    'Trabajo mecánico',
    'Trabajo neto y rozamiento',
    'Potencia mecánica',
    'Eficiencia mecánica',
    'Energía cinética',
    'Energía potencial gravitacional',
    'Energía potencial elástica',
    'Teorema trabajo-energía',
    'Conservación de la energía mecánica',
    'Energía mecánica con rozamiento',
    'Sistemas con resortes',
    'Problemas de varias etapas'

  ]);

  const has = topic => topics.includes(topic);

  function conceptual(z={}) {

    return /qué ocurre|cuál es el trabajo realizado por su peso/i
      .test(z.q || '');

  }

  function proportional(z={}) {

    return /determine la relación/i
      .test(z.q || '');

  }

  function criteria(topic,z={}) {

    const result =
      'Resultado correcto con unidades cuando corresponda';

    if(conceptual(z)) {

      return [

        'Identificación del principio físico',

        'Justificación física de la respuesta'

      ];

    }

    if(proportional(z)) {

      return [

        'Identificación de la relación física',

        'Aplicación de la proporcionalidad',

        'Sustitución y cálculo',

        'Relación numérica correcta'

      ];

    }

    switch(topic) {

      case 'Trabajo mecánico':

        return [

          'Identificación de los datos',

          'Planteamiento de la ecuación de trabajo',

          'Identificación del ángulo o sentido de la fuerza',

          'Despeje de la incógnita cuando corresponda',

          'Sustitución y cálculo',

          result

        ];

      case 'Trabajo neto y rozamiento':

        return [

          'Identificación de los datos y las fuerzas',

          'Planteamiento de las ecuaciones correspondientes',

          'Determinación de la fuerza de fricción cuando corresponda',

          'Identificación del signo del trabajo',

          'Sustitución y cálculo',

          result

        ];

      case 'Potencia mecánica':

        return [

          'Identificación de los datos',

          'Selección de la ecuación de potencia',

          'Conversión de unidades o cálculo del trabajo cuando corresponda',

          'Despeje de la incógnita',

          'Sustitución y cálculo',

          result

        ];

      case 'Eficiencia mecánica':

        return [

          'Identificación de los datos',

          'Planteamiento de la relación entre entrada y salida',

          'Manejo correcto del porcentaje de eficiencia',

          'Despeje de la incógnita',

          'Sustitución y cálculo',

          result

        ];

      case 'Energía cinética':

      case 'Energía potencial gravitacional':

      case 'Energía potencial elástica':

        return [

          'Identificación de los datos',

          'Selección de la ecuación de energía',

          'Conversión de unidades cuando corresponda',

          'Despeje de la incógnita',

          'Sustitución y cálculo',

          result

        ];

      case 'Teorema trabajo-energía':

        return [

          'Identificación de los datos',

          'Planteamiento del teorema trabajo-energía',

          'Identificación de las energías cinéticas inicial y final',

          'Despeje de la incógnita',

          'Sustitución y cálculo',

          result

        ];

      case 'Conservación de la energía mecánica':

        return [

          'Identificación de los datos',

          'Planteamiento de la conservación de energía',

          'Identificación de las energías involucradas',

          'Despeje de la incógnita',

          'Sustitución y cálculo',

          result

        ];

      case 'Energía mecánica con rozamiento':

        return [

          'Identificación de los datos',

          'Planteamiento del balance energético',

          'Determinación del trabajo de la fricción',

          'Identificación de las energías involucradas',

          'Despeje de la incógnita',

          'Sustitución y cálculo',

          result

        ];

      case 'Sistemas con resortes':

        return [

          'Identificación de los datos',

          'Planteamiento del balance energético',

          'Identificación de la energía potencial elástica',

          'Consideración del rozamiento cuando corresponda',

          'Despeje de la incógnita',

          'Sustitución y cálculo',

          result

        ];

      case 'Problemas de varias etapas':

        return [

          'Identificación de los datos y las etapas',

          'Planteamiento del balance energético',

          'Determinación de la energía mecánica inicial',

          'Determinación del trabajo de las fuerzas no conservativas',

          'Determinación de la energía disponible en la etapa final',

          'Despeje de la incógnita',

          'Sustitución y cálculo',

          result

        ];

      default:

        return [];

    }

  }

  function create(topic,points,z={}) {

    const p = Number(points);

    if(!has(topic)) return [];

    if(!Number.isInteger(p) || p<1 || p>10) {

      return [];

    }

    if(p===1) {

      return [{

        label:'Respuesta correcta',

        p:1

      }];

    }

    const all = criteria(topic,z);

    const count = Math.min(p,all.length);

    const selected = [

      ...all.slice(0,count-1),

      all[all.length-1]

    ];

    const base = Math.floor(p/count);

    const remainder = p%count;

    return selected.map((label,i)=>({

      label,

      p:base+(i<remainder?1:0)

    }));

  }

  window.STEMEnergyRubrics = Object.freeze({

    topics,

    has,

    conceptual,

    proportional,

    create

  });

})();
