'use strict';

(() => {

  const B = window.STEMPhysicsBank;

  const {
    g,
    gravity,
    f,
    formulas:F,
    numeric
  } = window.STEMEnergyBank;

  B.register('Conservación de la energía mecánica', () => {

    const m = B.rand(2,30);

    const h = B.rand(10,60);

    const hf = B.rand(1,h-1);

    const Em = m*g*h;

    const Ep = m*g*hf;

    const Ec = Em-Ep;

    const ideal =
      ' Desprecie la resistencia del aire.';

    const mode = B.rand(0,11);

    // ENERGIA MECANICA TOTAL

    if (mode === 0) {

      return numeric(

        `Un objeto de ${m} kg se deja caer desde una altura de ${h} m respecto al suelo. Determine su energía mecánica durante la caída.`+gravity+ideal,

        Em,

        'J',

        `Em = mgh = ${m} × 9,8 × ${h}`

      );

    }

    // ENERGIA POTENCIAL DURANTE LA CAIDA

    if (mode === 1) {

      return numeric(

        `Un objeto de ${m} kg se deja caer desde una altura de ${h} m. Determine su energía potencial gravitacional cuando se encuentra a ${hf} m sobre el suelo, tomando el suelo como referencia.`+gravity+ideal,

        Ep,

        'J',

        `Ep = mghf = ${m} × 9,8 × ${hf}`,

        [Em,Ec]

      );

    }

    // ENERGIA CINETICA DURANTE LA CAIDA

    if (mode === 2) {

      return numeric(

        `Un objeto de ${m} kg se deja caer desde una altura de ${h} m. Determine su energía cinética cuando se encuentra a ${hf} m sobre el suelo.`+gravity+ideal,

        Ec,

        'J',

        `Ec = mg(hi−hf) = ${m} × 9,8 × (${h}−${hf})`,

        [Em,Ep]

      );

    }

    // RAPIDEZ DURANTE LA CAIDA

    if (mode === 3) {

      return numeric(

        `Un objeto se deja caer desde una altura de ${h} m. Determine su rapidez cuando se encuentra a ${hf} m sobre el suelo.`+gravity+ideal,

        Math.sqrt(2*g*(h-hf)),

        'm/s',

        `v = √[2g(hi−hf)] = √[2 × 9,8 × (${h}−${hf})]`

      );

    }

    // RAPIDEZ DE IMPACTO

    if (mode === 4) {

      return numeric(

        `Un objeto de ${m} kg se deja caer desde una altura de ${h} m. Determine su rapidez inmediatamente antes de llegar al suelo.`+gravity+ideal,

        Math.sqrt(2*g*h),

        'm/s',

        `mgh = mv²/2; v = √(2gh) = √(2 × 9,8 × ${h})`

      );

    }

    // RAMPA SIN ROZAMIENTO

    if (mode === 5) {

      const height = B.rand(2,15);

      return numeric(

        `Un bloque de ${m} kg parte del reposo desde la parte superior de una rampa sin rozamiento, situada a ${height} m sobre su extremo inferior. Determine su rapidez al llegar al extremo inferior.`+gravity,

        Math.sqrt(2*g*height),

        'm/s',

        `mgh = mv²/2; v = √(2gh) = √(2 × 9,8 × ${height})`

      );

    }

    // RAMPA CON RAPIDEZ INICIAL

    if (mode === 6) {

      const height = B.rand(2,15);

      const vi = B.rand(2,10);

      return numeric(

        `Un bloque de ${m} kg inicia su descenso por una rampa sin rozamiento con una rapidez de ${vi} m/s. La diferencia de altura entre los extremos de la rampa es ${height} m. Determine su rapidez al llegar al extremo inferior.`+gravity,

        Math.sqrt(vi**2+2*g*height),

        'm/s',

        `vf = √(vi²+2gh) = √(${vi}²+2 × 9,8 × ${height})`

      );

    }

    // PENDULO

    if (mode === 7) {

      const height = B.rand(2,30)/10;

      return numeric(

        `Un péndulo ideal de masa ${m} kg se libera desde el reposo a una altura de ${f(height)} m respecto a su posición más baja. Determine su rapidez al pasar por dicha posición.`+gravity,

        Math.sqrt(2*g*height),

        'm/s',

        `mgh = mv²/2; v = √(2gh) = √(2 × 9,8 × ${f(height)})`

      );

    }

    // LANZAMIENTO VERTICAL

    if (mode === 8) {

      const vi = B.rand(5,30);

      return numeric(

        `Un objeto de ${m} kg se lanza verticalmente hacia arriba con una rapidez inicial de ${vi} m/s. Determine la altura máxima alcanzada respecto al punto de lanzamiento.`+gravity+ideal,

        vi**2/(2*g),

        'm',

        `mvi²/2 = mgh; h = vi²/(2g) = ${vi}²/(2 × 9,8)`

      );

    }

    // LANZAMIENTO HORIZONTAL

    if (mode === 9) {

      const vi = B.rand(5,20);

      return numeric(

        `Un objeto se lanza horizontalmente desde una altura de ${h} m con una rapidez inicial de ${vi} m/s. Determine la magnitud de su velocidad inmediatamente antes de llegar al suelo.`+gravity+ideal,

        Math.sqrt(vi**2+2*g*h),

        'm/s',

        `vf = √(vi²+2gh) = √(${vi}²+2 × 9,8 × ${h})`

      );

    }

    // ALTURA CONOCIDA LA RAPIDEZ

    if (mode === 10) {

      const vi = B.rand(15,30);

      const vf = B.rand(2,vi-1);

      return numeric(

        `Un objeto se lanza verticalmente hacia arriba con una rapidez inicial de ${vi} m/s. Determine su altura respecto al punto de lanzamiento cuando su rapidez es ${vf} m/s.`+gravity+ideal,

        (vi**2-vf**2)/(2*g),

        'm',

        `h = (vi²−vf²)/(2g) = (${vi}²−${vf}²)/(2 × 9,8)`

      );

    }

    // CONCEPTO DE CONSERVACION

    return B.item(

      'Un objeto cae libremente sin resistencia del aire. ¿Qué ocurre con su energía mecánica total durante la caída?',

      'Permanece constante',

      'La energía potencial gravitacional se transforma en energía cinética, pero la suma de ambas permanece constante.',

      [

        'Aumenta continuamente',

        'Disminuye continuamente',

        'Se hace cero antes del impacto'

      ]

    );

  });

})();
