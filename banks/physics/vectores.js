'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const rad = a => a * Math.PI / 180;

  const f = n =>
    B.fmt(Math.round(n * 100) / 100);

  const angle = (x, y) =>
    (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

  function numeric(q, value, unit, solution) {

    const r = `${f(value)} ${unit}`.trim();

    return B.item(
      q,
      r,
      solution + ` = ${r}`,
      [1, 2, 3].map(k =>
        `${f(value + k * 5)} ${unit}`.trim()
      )
    );
  }

  B.register('Vectores', () => {

    const a = B.rand(2, 20) * 5;
    const b = B.rand(2, 20) * 5;

    const theta = B.pick([
      25, 30, 35, 40, 50, 60,
      120, 125, 135, 150,
      210, 225, 230, 240,
      300, 315, 330, 335
    ]);

    const mode = B.rand(0, 10);

    const rounding =
      ' Redondee a dos decimales.';

    const x = a * Math.cos(rad(theta));
    const y = a * Math.sin(rad(theta));

    if (mode === 0) {

      return numeric(
        `Una fuerza de ${a} N forma un ángulo de ${theta}° medido en sentido antihorario desde el eje x positivo. Determine su componente horizontal.` + rounding,
        x,
        'N',
        `Fx = F cos θ = ${a} cos(${theta}°)`
      );
    }

    if (mode === 1) {

      return numeric(
        `Una fuerza de ${a} N forma un ángulo de ${theta}° medido en sentido antihorario desde el eje x positivo. Determine su componente vertical.` + rounding,
        y,
        'N',
        `Fy = F sen θ = ${a} sen(${theta}°)`
      );
    }

    if (mode === 2) {

      return numeric(
        `Un estudiante camina ${a} m hacia el este y ${b} m hacia el norte. Determine la magnitud del desplazamiento resultante.` + rounding,
        Math.hypot(a, b),
        'm',
        `R = √(${a}² + ${b}²)`
      );
    }

    if (mode === 3) {

      const r = angle(a, b);

      return B.item(
        `Un estudiante camina ${a} m hacia el este y ${b} m hacia el norte. Determine el ángulo del desplazamiento resultante respecto al este.` + rounding,
        `${f(r)}°`,
        `θ = arctan(${b}/${a}) = ${f(r)}°`,
        [
          `${f(r + 90)}°`,
          `${f(r + 180)}°`,
          `${f(r + 270)}°`
        ]
      );
    }

    if (mode === 4) {

      return numeric(
        `Sobre un cuerpo actúan dos fuerzas perpendiculares: ${a} N hacia el este y ${b} N hacia el norte. Determine la magnitud de la fuerza resultante.` + rounding,
        Math.hypot(a, b),
        'N',
        `R = √(${a}² + ${b}²)`
      );
    }

    if (mode === 5) {

      const r = angle(-a, -b);

      return B.item(
        `Un vehículo se desplaza ${a} m hacia el oeste y ${b} m hacia el sur. Determine la dirección de la resultante medida en sentido antihorario desde el este.` + rounding,
        `${f(r)}°`,
        `Rx = −${a} m; Ry = −${b} m. θ = 180° + arctan(${b}/${a}) = ${f(r)}°`,
        [
          `${f(r - 180)}°`,
          `${f(r - 90)}°`,
          `${f(r + 90)}°`
        ]
      );
    }

    if (mode === 6) {

      return numeric(
        `El vector A tiene magnitud ${a} N hacia el este y el vector B tiene magnitud ${b} N hacia el norte. Determine la magnitud de R = A − B.` + rounding,
        Math.hypot(a, b),
        'N',
        `Rx = ${a} N; Ry = −${b} N. R = √(${a}² + ${b}²)`
      );
    }

    if (mode === 7) {

      const quadrant = Math.floor(theta / 90);

      const names = [
        'Primer cuadrante',
        'Segundo cuadrante',
        'Tercer cuadrante',
        'Cuarto cuadrante'
      ];

      const r = names[quadrant];

      return B.item(
        `Un vector de ${a} N forma un ángulo de ${theta}° medido en sentido antihorario desde el eje x positivo. ¿En cuál cuadrante se encuentra?`,
        r,
        `El ángulo ${theta}° corresponde al ${r.toLowerCase()}.`,
        names.filter(v => v !== r)
      );
    }

    if (mode === 8) {

      const c = B.rand(2, 15) * 5;
      const rx = a - c;
      const ry = b;

      return numeric(
        `Sobre un cuerpo actúan tres fuerzas: ${a} N al este, ${b} N al norte y ${c} N al oeste. Determine la magnitud de la fuerza resultante.` + rounding,
        Math.hypot(rx, ry),
        'N',
        `Rx = ${a} − ${c} = ${rx} N; Ry = ${ry} N. R = √((${rx})² + ${ry}²)`
      );
    }

    if (mode === 9) {

      const rx = a + b * Math.cos(rad(theta));
      const ry = b * Math.sin(rad(theta));

      return numeric(
        `Dos fuerzas concurrentes tienen magnitudes de ${a} N y ${b} N, con direcciones de 0° y ${theta}°, respectivamente, medidas en sentido antihorario desde el eje x positivo. Determine la magnitud de la resultante.` + rounding,
        Math.hypot(rx, ry),
        'N',
        `Rx = ${a} + ${b} cos(${theta}°); Ry = ${b} sen(${theta}°). R = √(Rx² + Ry²)`
      );
    }

    const rx = a + b * Math.cos(rad(theta));
    const ry = b * Math.sin(rad(theta));
    const r = angle(rx, ry);

    return B.item(
      `Dos fuerzas concurrentes de ${a} N y ${b} N tienen direcciones de 0° y ${theta}°, respectivamente. Determine la dirección de la resultante entre 0° y 360°, medida en sentido antihorario desde el eje x positivo.` + rounding,
      `${f(r)}°`,
      `Rx = ${f(rx)} N; Ry = ${f(ry)} N. Aplicando atan2(Ry,Rx), θ = ${f(r)}°`,
      [90, 180, 270].map(d =>
        `${f((r + d) % 360)}°`
      )
    );

  });

})();
