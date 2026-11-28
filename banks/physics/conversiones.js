'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const conversions = [
    ['km', 'm', 1000],
    ['m', 'cm', 100],
    ['m', 'mm', 1000],
    ['cm', 'mm', 10],
    ['kg', 'g', 1000],
    ['g', 'mg', 1000],
    ['h', 'min', 60],
    ['min', 's', 60],
    ['h', 's', 3600],
    ['L', 'mL', 1000],
    ['m²', 'cm²', 10000],
    ['m³', 'cm³', 1000000],
    ['L', 'cm³', 1000],
    ['m³', 'L', 1000],
    ['m/s', 'km/h', 3.6],
    ['g/cm³', 'kg/m³', 1000]
  ];

  B.register('Conversión de unidades', () => {

    const [u, v, factor] = B.pick(conversions);
    const reverse = B.rand(0, 1) === 1;
    const n = B.rand(2, 90);

    const source = reverse ? v : u;
    const target = reverse ? u : v;

    const value = reverse ? n * factor : n;
    const result = reverse ? n : n * factor;

    const r = `${B.fmt(result)} ${target}`;

    return B.item(
      `Convierta ${B.fmt(value)} ${source} a ${target}.`,
      r,
      reverse
        ? `${B.fmt(value)} ÷ ${B.fmt(factor)} = ${r}`
        : `${B.fmt(value)} × ${B.fmt(factor)} = ${r}`,
      [
        `${B.fmt(result * 10)} ${target}`,
        `${B.fmt(result / 10)} ${target}`,
        `${B.fmt(result * 100)} ${target}`
      ]
    );

  });

})();
