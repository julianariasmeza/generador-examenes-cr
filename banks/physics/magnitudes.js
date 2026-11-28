'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const fundamental = [
    ['longitud', 'metro', 'm'],
    ['masa', 'kilogramo', 'kg'],
    ['tiempo', 'segundo', 's'],
    ['temperatura termodinámica', 'kelvin', 'K'],
    ['corriente eléctrica', 'amperio', 'A'],
    ['cantidad de sustancia', 'mol', 'mol'],
    ['intensidad luminosa', 'candela', 'cd']
  ];

  const derived = [
    ['rapidez', 'metro por segundo', 'm/s'],
    ['aceleración', 'metro por segundo cuadrado', 'm/s²'],
    ['fuerza', 'newton', 'N'],
    ['energía', 'julio', 'J'],
    ['potencia', 'vatio', 'W'],
    ['presión', 'pascal', 'Pa'],
    ['frecuencia', 'hercio', 'Hz'],
    ['carga eléctrica', 'culombio', 'C'],
    ['resistencia eléctrica', 'ohmio', 'Ω'],
    ['densidad', 'kilogramo por metro cúbico', 'kg/m³'],
    ['área', 'metro cuadrado', 'm²'],
    ['volumen', 'metro cúbico', 'm³']
  ];

  const all = [...fundamental, ...derived];

  const scalar = [
    'masa', 'tiempo', 'temperatura',
    'rapidez', 'distancia', 'energía',
    'trabajo', 'potencia', 'volumen',
    'densidad'
  ];

  const vector = [
    'velocidad', 'aceleración', 'fuerza',
    'desplazamiento', 'peso',
    'cantidad de movimiento',
    'campo eléctrico'
  ];

  function alternatives(pool, answer) {
    return B.shuffle(
      [...new Set(pool)].filter(x => x !== answer)
    ).slice(0, 3);
  }

  B.register('Magnitudes físicas y SI', () => {

    const z = B.pick(all);
    const mode = B.rand(0, 5);

    if (mode === 0) {
      return B.item(
        `¿Cuál es la unidad del SI para la magnitud ${z[0]}?`,
        z[1],
        `La unidad correspondiente es ${z[1]} (${z[2]}).`,
        alternatives(all.map(x => x[1]), z[1])
      );
    }

    if (mode === 1) {
      return B.item(
        `¿Cuál es el símbolo de la unidad ${z[1]}?`,
        z[2],
        `El símbolo correcto es ${z[2]}.`,
        alternatives(all.map(x => x[2]), z[2])
      );
    }

    if (mode === 2) {
      const f = B.pick(fundamental);
      return B.item(
        `¿Cómo se clasifica la magnitud ${f[0]} según el SI?`,
        'Fundamental',
        `${f[0]} es una magnitud fundamental del SI.`,
        ['Derivada', 'Adimensional', 'No física']
      );
    }

    if (mode === 3) {
      const d = B.pick(derived);
      return B.item(
        `¿Cómo se clasifica la magnitud ${d[0]} según el SI?`,
        'Derivada',
        `${d[0]} es una magnitud derivada.`,
        ['Fundamental', 'Adimensional', 'No física']
      );
    }

    if (mode === 4) {
      const r = B.pick(scalar);
      return B.item(
        `¿Cómo se clasifica la magnitud ${r} según su naturaleza escalar o vectorial?`,
        'Escalar',
        `${r} no requiere dirección para su descripción.`,
        ['Vectorial', 'Tensorial', 'No es una magnitud física']
      );
    }

    const r = B.pick(vector);

    return B.item(
      `¿Cómo se clasifica la magnitud ${r} según su naturaleza escalar o vectorial?`,
      'Vectorial',
      `${r} requiere módulo y dirección para su descripción.`,
      ['Escalar', 'Tensorial', 'No es una magnitud física']
    );

  });

})();
