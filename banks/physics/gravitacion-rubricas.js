'use strict';

(() => {

  const topics = Object.freeze([

    'Fuerzas fundamentales',
    'Ley de gravitación universal',
    'Tercera ley y campo gravitacional',
    'Peso y gravedad planetaria',
    'Gravedad con la altura',
    'Rapidez orbital',
    'Período orbital',
    'Velocidad de escape'

  ]);

  function has(topic) {

    return topics.includes(topic);

  }

  function create(topic,p,z={}) {

    p = Number(p);

    if (
      !has(topic) ||
      !Number.isInteger(p) ||
      p<1 ||
      p>10
    ) {

      return [];

    }

    const q = String(z.q || '');

    const conceptual =
      topic === 'Fuerzas fundamentales' ||
      /cuál experimenta mayor/i.test(q) ||
      /fuerza que ejerce el satélite sobre el planeta/i.test(q);

    const proportional =
      /determine la relación/i.test(q) ||
      /sin modificar sus masas/i.test(q) ||
      /veces la masa terrestre/i.test(q);

    const orbital =
      /orbital|con la altura|velocidad de escape/i
        .test(topic);

    let criteria;

    if (conceptual) {

      criteria = [

        'Identificación del principio físico',
        'Justificación física de la respuesta'

      ];

    } else if (proportional) {

      criteria = [

        'Identificación de la relación física',
        'Planteamiento de la proporcionalidad',
        'Sustitución y cálculo',
        'Resultado correcto'

      ];

    } else if (orbital) {

      criteria = [

        'Identificación de los datos',
        'Conversión de unidades y determinación de la distancia al centro, cuando corresponda',
        'Selección de la fórmula y despeje',
        'Sustitución y cálculo',
        'Respuesta correcta con unidades'

      ];

    } else {

      criteria = [

        'Identificación de los datos',
        'Selección de la fórmula',
        'Despeje de la incógnita, cuando corresponda',
        'Sustitución y cálculo',
        'Respuesta correcta con unidades'

      ];

    }

    if (p===1) {

      return [{

        label:'Respuesta correcta',
        p:1

      }];

    }

    const count = Math.min(
      p,
      criteria.length
    );

    const selected = [

      ...criteria.slice(0,count-1),

      criteria[criteria.length-1]

    ];

    const base = Math.floor(p/count);

    const remainder = p%count;

    return selected.map((label,i)=>({

      label,

      p:base+(i<remainder?1:0)

    }));

  }

  window.STEMGravitationRubrics = Object.freeze({

    topics,

    has,

    create

  });

})();
