'use strict';

window.STEMPhysicsBank = (() => {

  const generators = new Map();

  const rand = (a, b) =>
    a + Math.floor(Math.random() * (b - a + 1));

  const pick = a => a[rand(0, a.length - 1)];

  const fmt = n =>
    String(Number(n.toPrecision(12))).replace('.', ',');

  function shuffle(values) {
    const a = [...values];
    for (let i = a.length - 1; i > 0; i--) {
      const j = rand(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function item(q, r, s, wrong) {
    const options = [...new Set([
      String(r),
      ...wrong.map(String)
    ])];

    if (options.length < 4) {
      throw new Error('Alternativas insuficientes: ' + q);
    }

    return {
      q,
      r: String(r),
      s,
      options: shuffle([String(r), ...shuffle(options.filter(o => o !== String(r))).slice(0, 3)])
    };
  }

  function register(topic, generator) {
    generators.set(topic, generator);
  }

  function has(topic) {
    return generators.has(topic);
  }

  function question(topic) {
    if (!has(topic)) {
      throw new Error('Tema de Física no registrado.');
    }

    return generators.get(topic)();
  }

  return {
    rand, pick, fmt, shuffle, item,
    register, has, question,
    generator: topic => generators.get(topic), topics: () => [...generators.keys()]
  };

})();
