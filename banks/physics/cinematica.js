'use strict';

(() => {

  const B = window.STEMPhysicsBank;
  const g = 9.8;

  const f = n =>
    B.fmt(Math.round(n * 100) / 100);

  const round = ' Redondee a dos decimales.';

  const gravity =
    ' Considere g = 9,8 m/s² y desprecie la resistencia del aire.';

  function item(q, value, unit, solution) {

    const r = `${f(value)} ${unit}`;

    const wrong = [...new Set(
      [
        value * 2,
        value / 2,
        -value,
        value + 5,
        value + 10,
        value + 15
      ].map(v => `${f(v)} ${unit}`)
    )].filter(v => v !== r).slice(0, 3);

    return B.item(
      q + round,
      r,
      solution + ` = ${r}`,
      wrong
    );
  }

  // MOVIMIENTO RECTILINEO UNIFORME

  B.register('MRU', () => {

    const v = B.rand(5, 40);
    const t = B.rand(4, 60);
    const d = v * t;
    const mode = B.rand(0, 3);

    if (mode === 0) {
      return item(
        `Un automóvil se mueve con rapidez constante de ${v} m/s durante ${t} s. Determine la distancia recorrida.`,
        d, 'm',
        `d = vt = ${v} × ${t}`
      );
    }

    if (mode === 1) {
      return item(
        `Un móvil recorre ${d} m en ${t} s con rapidez constante. Determine su rapidez.`,
        v, 'm/s',
        `v = d/t = ${d}/${t}`
      );
    }

    if (mode === 2) {
      return item(
        `Un vehículo recorre ${d} m con rapidez constante de ${v} m/s. Determine el tiempo empleado.`,
        t, 's',
        `t = d/v = ${d}/${v}`
      );
    }

    return item(
      `Un automóvil viaja a ${f(v * 3.6)} km/h durante ${t} s. Determine la distancia recorrida en metros.`,
      d, 'm',
      `v = ${f(v * 3.6)}/3,6 = ${v} m/s; d = ${v} × ${t}`
    );

  });

  // MOVIMIENTO RECTILINEO UNIFORMEMENTE ACELERADO

  B.register('MRUA', () => {

    const vi = B.rand(4, 25);
    const a = B.rand(2, 12) / 2;
    const t = B.rand(3, 15);
    const vf = vi + a * t;
    const d = vi * t + a * t * t / 2;

    const mode = B.rand(0, 9);

    if (mode === 0) {
      return item(
        `Un automóvil parte del reposo y acelera a ${f(a)} m/s² durante ${t} s. Determine su velocidad final.`,
        a * t, 'm/s',
        `vf = at = ${f(a)} × ${t}`
      );
    }

    if (mode === 1) {
      return item(
        `Un ciclista parte del reposo con aceleración constante de ${f(a)} m/s² durante ${t} s. Determine su desplazamiento.`,
        a * t * t / 2, 'm',
        `d = ½at² = ½ × ${f(a)} × ${t}²`
      );
    }

    if (mode === 2) {
      return item(
        `Una motocicleta aumenta su velocidad de ${vi} m/s a ${f(vf)} m/s en ${t} s. Determine su aceleración constante.`,
        a, 'm/s²',
        `a = (vf − vi)/t = (${f(vf)} − ${vi})/${t}`
      );
    }

    if (mode === 3) {
      return item(
        `Un tren viaja inicialmente a ${vi} m/s y acelera a ${f(a)} m/s² durante ${t} s. Determine su desplazamiento.`,
        d, 'm',
        `d = vi·t + ½at² = ${vi} × ${t} + ½ × ${f(a)} × ${t}²`
      );
    }

    if (mode === 4) {

      const distance = B.rand(20, 200);

      return item(
        `Un tren viaja a ${vi} m/s y acelera uniformemente a ${f(a)} m/s². Determine su rapidez después de recorrer ${distance} m.`,
        Math.sqrt(vi * vi + 2 * a * distance),
        'm/s',
        `vf = √(vi² + 2ad) = √(${vi}² + 2 × ${f(a)} × ${distance})`
      );
    }

    if (mode === 5) {
      return item(
        `Un automóvil viaja a ${vi} m/s y frena con aceleración constante de −${f(a)} m/s². Determine el tiempo necesario para detenerse.`,
        vi / a, 's',
        `t = (vf − vi)/a = (0 − ${vi})/(−${f(a)})`
      );
    }

    if (mode === 6) {
      return item(
        `Un automóvil viaja a ${vi} m/s y frena uniformemente con aceleración de −${f(a)} m/s². Determine la distancia de frenado.`,
        vi * vi / (2 * a), 'm',
        `d = (vf² − vi²)/(2a) = (0 − ${vi}²)/(−2 × ${f(a)})`
      );
    }

    if (mode === 7) {

      const distance = B.rand(20, 100);

      return item(
        `Un autobús viaja a ${f(vi * 3.6)} km/h y se detiene uniformemente después de recorrer ${distance} m. Determine su aceleración, tomando como positivo el sentido inicial del movimiento.`,
        -vi * vi / (2 * distance),
        'm/s²',
        `vi = ${vi} m/s; a = (0 − ${vi}²)/(2 × ${distance})`
      );
    }

    if (mode === 8) {

      const distance = a * t * t / 2;

      return item(
        `Un ciclista parte del reposo y recorre ${f(distance)} m en ${t} s con aceleración constante. Determine su aceleración.`,
        a, 'm/s²',
        `a = 2d/t² = 2 × ${f(distance)}/${t}²`
      );
    }

    const tc = B.rand(5, 20);
    const tf = B.rand(3, 10);
    const speed = a * t;

    return item(
      `Un automóvil parte del reposo y acelera a ${f(a)} m/s² durante ${t} s. Mantiene la rapidez alcanzada durante ${tc} s y finalmente frena uniformemente hasta detenerse en ${tf} s. Determine la distancia total.`,
      speed * t / 2 + speed * tc + speed * tf / 2,
      'm',
      `d = ½ × ${f(speed)} × ${t} + ${f(speed)} × ${tc} + ½ × ${f(speed)} × ${tf}`
    );

  });

  // CAIDA LIBRE

  B.register('Caída libre', () => {

    const t = B.rand(2, 12) / 2;
    const h = g * t * t / 2;
    const mode = B.rand(0, 4);

    if (mode === 0) {
      return item(
        `Se deja caer una piedra desde una altura de ${f(h)} m. Determine el tiempo de caída.` + gravity,
        t, 's',
        `t = √(2h/g) = √(2 × ${f(h)}/9,8)`
      );
    }

    if (mode === 1) {
      return item(
        `Una maceta cae desde el reposo y tarda ${f(t)} s en llegar al suelo. Determine la altura inicial.` + gravity,
        h, 'm',
        `h = ½gt² = ½ × 9,8 × ${f(t)}²`
      );
    }

    if (mode === 2) {
      return item(
        `Una pelota cae desde el reposo durante ${f(t)} s. Determine su rapidez inmediatamente antes de impactar.` + gravity,
        g * t, 'm/s',
        `v = gt = 9,8 × ${f(t)}`
      );
    }

    if (mode === 3) {
      return item(
        `Se deja caer un objeto desde una altura de ${f(h)} m. Determine su rapidez de impacto.` + gravity,
        Math.sqrt(2 * g * h), 'm/s',
        `v = √(2gh) = √(2 × 9,8 × ${f(h)})`
      );
    }

    const t1 = B.rand(1, 4);
    const t2 = t1 + B.rand(1, 3);

    return item(
      `Se deja caer una esfera desde una torre suficientemente alta. Determine la distancia adicional recorrida entre t = ${t1} s y t = ${t2} s.` + gravity,
      g * (t2 * t2 - t1 * t1) / 2,
      'm',
      `d = ½g(t₂² − t₁²) = ½ × 9,8 × (${t2}² − ${t1}²)`
    );

  });

  // LANZAMIENTO VERTICAL

  B.register('Lanzamiento vertical', () => {

    const ts = B.rand(2, 10) / 2;
    const vi = g * ts;
    const h = vi * vi / (2 * g);
    const mode = B.rand(0, 9);

    if (mode === 0) {
      return item(
        `Una pelota se lanza verticalmente hacia arriba con rapidez inicial de ${f(vi)} m/s. Determine el tiempo de subida.` + gravity,
        ts, 's',
        `t = vi/g = ${f(vi)}/9,8`
      );
    }

    if (mode === 1) {
      return item(
        `Una pelota se lanza verticalmente hacia arriba a ${f(vi)} m/s. Determine la altura máxima respecto al punto de lanzamiento.` + gravity,
        h, 'm',
        `h = vi²/(2g) = ${f(vi)}²/(2 × 9,8)`
      );
    }

    if (mode === 2) {
      return item(
        `Una pelota se lanza verticalmente hacia arriba desde el suelo a ${f(vi)} m/s. Determine el tiempo total de vuelo.` + gravity,
        2 * ts, 's',
        `t = 2vi/g = 2 × ${f(vi)}/9,8`
      );
    }

    if (mode === 3 || mode === 4) {

      const t = ts * B.pick([0.5, 1.5]);

      if (mode === 3) {
        return item(
          `Una pelota se lanza verticalmente hacia arriba desde el suelo a ${f(vi)} m/s. Determine su velocidad después de ${f(t)} s, tomando hacia arriba como positivo.` + gravity,
          vi - g * t, 'm/s',
          `vf = vi − gt = ${f(vi)} − 9,8 × ${f(t)}`
        );
      }

      return item(
        `Una pelota se lanza verticalmente hacia arriba desde el suelo a ${f(vi)} m/s. Determine su desplazamiento después de ${f(t)} s, tomando hacia arriba como positivo.` + gravity,
        vi * t - g * t * t / 2, 'm',
        `y = vi·t − ½gt² = ${f(vi)} × ${f(t)} − ½ × 9,8 × ${f(t)}²`
      );
    }

    if (mode === 5 || mode === 6) {

      const v0 = B.rand(2, 12);
      const t = B.rand(2, 8) / 2;

      if (mode === 5) {
        return item(
          `Desde una altura suficiente se lanza una pelota verticalmente hacia abajo a ${v0} m/s. Determine su rapidez después de ${f(t)} s.` + gravity,
          v0 + g * t, 'm/s',
          `v = vi + gt = ${v0} + 9,8 × ${f(t)}`
        );
      }

      return item(
        `Desde una altura suficiente se lanza una pelota verticalmente hacia abajo a ${v0} m/s. Determine la distancia que desciende durante ${f(t)} s.` + gravity,
        v0 * t + g * t * t / 2, 'm',
        `d = vi·t + ½gt² = ${v0} × ${f(t)} + ½ × 9,8 × ${f(t)}²`
      );
    }

    const H = B.rand(10, 50);

    if (mode === 7) {
      return item(
        `Desde una terraza de ${H} m de altura se lanza una pelota verticalmente hacia arriba a ${f(vi)} m/s. Determine la altura máxima respecto al suelo.` + gravity,
        H + h, 'm',
        `Hmax = H + vi²/(2g) = ${H} + ${f(vi)}²/(2 × 9,8)`
      );
    }

    if (mode === 8) {
      return item(
        `Desde una terraza de ${H} m de altura se lanza una pelota verticalmente hacia arriba a ${f(vi)} m/s. Determine el tiempo hasta impactar contra el suelo.` + gravity,
        (vi + Math.sqrt(vi * vi + 2 * g * H)) / g,
        's',
        `t = (vi + √(vi² + 2gH))/g = (${f(vi)} + √(${f(vi)}² + 2 × 9,8 × ${H}))/9,8`
      );
    }

    return item(
      `Desde una terraza de ${H} m de altura se lanza una pelota verticalmente hacia arriba a ${f(vi)} m/s. Determine la rapidez de impacto contra el suelo.` + gravity,
      Math.sqrt(vi * vi + 2 * g * H),
      'm/s',
      `v = √(vi² + 2gH) = √(${f(vi)}² + 2 × 9,8 × ${H})`
    );

  });

})();
