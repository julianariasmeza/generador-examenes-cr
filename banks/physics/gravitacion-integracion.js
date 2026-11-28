'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const A = window.STEMGravitation;

  const Figures = window.STEMGravitationFigures;

  const superscripts = {

    '⁻':'-',
    '⁺':'+',
    '⁰':'0',
    '¹':'1',
    '²':'2',
    '³':'3',
    '⁴':'4',
    '⁵':'5',
    '⁶':'6',
    '⁷':'7',
    '⁸':'8',
    '⁹':'9'

  };

  function parseNumber(value) {

    let s = String(value).trim()
      .replace(/,/g,'.');

    s = s.replace(
      /×\s*10([⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,
      (_,power) =>
        'e'+[...power]
          .map(c=>superscripts[c])
          .join('')
    );

    return Number(s.replace(/\s/g,''));

  }

  const number =
    '([0-9]+(?:[,.][0-9]+)?' +
    '(?:\\s*×\\s*10[⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+)?)';

  function extract(q,pattern) {

    const match = q.match(
      new RegExp(pattern,'i')
    );

    if (!match) return undefined;

    const value = parseNumber(match[1]);

    return Number.isFinite(value)
      ? value
      : undefined;

  }

  function bodyName(q) {

    return A.bodyNames.find(name =>
      new RegExp(
        `\\b${name}\\b`,
        'i'
      ).test(q)
    );

  }

  function wrap(topic,type,getData) {

    const original = B.generator(topic);

    if (typeof original !== 'function') {

      throw new Error(
        'Generador no encontrado: '+topic
      );

    }

    B.register(topic,() => {

      const z = original();

      const data = getData(z.q);

      if (!data) return z;

      return Figures.attach(z,type,data);

    });

  }

  // INTERACCION GRAVITACIONAL

  wrap(
    'Ley de gravitación universal',
    'interaction',
    q => {

      const masses = q.match(
        new RegExp(
          'masas '+number+' kg y '+number+' kg',
          'i'
        )
      );

      const r = extract(
        q,
        'separados por (?:una distancia entre sus centros de )?'+number+' m'
      );

      const m1 = masses
        ? parseNumber(masses[1])
        : extract(q,'masa del primero es '+number+' kg');

      const m2 = masses
        ? parseNumber(masses[2])
        : undefined;

      if (
        m1 === undefined &&
        m2 === undefined &&
        r === undefined
      ) {
        return null;
      }

      return {m1,m2,r};

    }
  );

  // ALTURA Y CAMPO GRAVITACIONAL

  wrap(
    'Gravedad con la altura',
    'height',
    q => {

      const name = bodyName(q);

      if (!name) return null;

      const p = A.getBody(name);

      const h = extract(q,number+' km');

      const m = extract(q,number+' kg se encuentra');

      return {

        name,

        R:p.R,

        h:h === undefined
          ? undefined
          : h*1000,

        m

      };

    }
  );

  // ORBITAS CIRCULARES

  for (const topic of [
    'Rapidez orbital',
    'Período orbital'
  ]) {

    wrap(topic,'orbit',q => {

      const name = bodyName(q);

      if (!name) return null;

      const p = A.getBody(name);

      const h = extract(q,number+' km sobre');

      const radius = extract(
        q,
        'radio '+number+' km'
      );

      return {

        name,

        R:p.R,

        h:h === undefined
          ? undefined
          : h*1000,

        r:radius === undefined
          ? undefined
          : radius*1000

      };

    });

  }

  // VELOCIDAD DE ESCAPE

  wrap(
    'Velocidad de escape',
    'escape',
    q => {

      const name = bodyName(q);

      const h = extract(q,number+' km sobre');

      const R = extract(q,'R = '+number+' m')
        ?? extract(q,'radio de '+number+' m');

      if (!name && R === undefined) {

        return null;

      }

      return {

        name:name || 'Planeta hipotético',

        R,

        h:h === undefined
          ? undefined
          : h*1000

      };

    }
  );

})();
