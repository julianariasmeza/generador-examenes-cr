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

  // ======================================
  // TRABAJO MECANICO
  // ======================================

  B.register('Trabajo mecánico', () => {

    const force = B.rand(10,80)*5;

    const d = B.rand(2,40);

    const angle = B.pick([
      0,30,45,60,90,120,180
    ]);

    const mode = B.rand(0,4);

    if (mode === 0) {

      return numeric(

        `Una fuerza horizontal de ${force} N desplaza un objeto ${d} m en el mismo sentido de la fuerza. Determine el trabajo realizado.`,

        force*d,

        'J',

        `W = Fd = ${force} × ${d}`

      );

    }

    if (mode === 1) {

      const value = F.work(force,d,angle);

      return numeric(

        `Una fuerza constante de ${force} N forma un ángulo de ${angle}° con el desplazamiento de ${d} m de un objeto. Determine el trabajo realizado por la fuerza.`,

        value,

        'J',

        `W = Fd cos θ = ${force} × ${d} × cos(${angle}°)`,

        [force*d,force*d/2]

      );

    }

    if (mode === 2) {

      return numeric(

        `Una fuerza paralela al desplazamiento realiza ${force*d} J de trabajo al mover un objeto ${d} m. Determine la magnitud de la fuerza.`,

        force,

        'N',

        `F = W/d = ${force*d}/${d}`

      );

    }

    if (mode === 3) {

      return numeric(

        `Una fuerza constante de ${force} N, paralela y del mismo sentido que el desplazamiento, realiza ${force*d} J de trabajo. Determine la distancia recorrida.`,

        d,

        'm',

        `d = W/F = ${force*d}/${force}`

      );

    }

    const m = B.rand(5,50);

    const h = B.rand(5,40)/10;

    return numeric(

      `Una persona levanta verticalmente un objeto de ${m} kg hasta una altura de ${f(h)} m. El objeto comienza y termina en reposo. Determine el trabajo realizado por la persona, despreciando otras fuerzas distintas del peso y la fuerza aplicada.`+gravity,

      m*g*h,

      'J',

      `W = mgh = ${m} × 9,8 × ${f(h)}`

    );

  });

  // ======================================
  // TRABAJO NETO Y ROZAMIENTO
  // ======================================

  B.register('Trabajo neto y rozamiento', () => {

    const m = B.rand(10,60);

    const d = B.rand(3,30);

    const mu = B.rand(10,40)/100;

    const N = m*g;

    const friction = mu*N;

    const force = Math.ceil(friction)
      + B.rand(20,150);

    const Wa = force*d;

    const Wf = -friction*d;

    const Wnet = Wa+Wf;

    const mode = B.rand(0,5);

    const q =

      `Un objeto de ${m} kg se desplaza ${d} m sobre una superficie horizontal. Se aplica una fuerza horizontal de ${force} N en el sentido del movimiento. El coeficiente de fricción cinética es ${f(mu)}.`+gravity;

    if (mode === 0) {

      return numeric(

        q+' Determine la magnitud de la fuerza de fricción.',

        friction,

        'N',

        `fk = μmg = ${f(mu)} × ${m} × 9,8`

      );

    }

    if (mode === 1) {

      return numeric(

        q+' Determine el trabajo realizado por la fuerza aplicada.',

        Wa,

        'J',

        `Wa = Fd = ${force} × ${d}`,

        [Wf,Wnet]

      );

    }

    if (mode === 2) {

      return numeric(

        q+' Determine el trabajo realizado por la fuerza de fricción.',

        Wf,

        'J',

        `Wf = −μmgd = −${f(mu)} × ${m} × 9,8 × ${d}`,

        [Wa,Wnet,-Wf]

      );

    }

    if (mode === 3) {

      return numeric(

        q+' Determine el trabajo neto.',

        Wnet,

        'J',

        `Wneto = (F−μmg)d = (${force}−${f(mu)} × ${m} × 9,8) × ${d}`,

        [Wa,Wf,Wa-Wf]

      );

    }

    if (mode === 4) {

      const fk = B.rand(5,50);

      const applied = fk+B.rand(20,100);

      return numeric(

        `Una fuerza horizontal de ${applied} N, aplicada en el sentido del movimiento, desplaza un objeto ${d} m sobre una superficie horizontal. La fuerza de fricción tiene una magnitud constante de ${fk} N. Determine el trabajo neto.`,

        (applied-fk)*d,

        'J',

        `Wneto = (${applied}−${fk}) × ${d}`

      );

    }

    return B.item(

      'Un objeto se desplaza horizontalmente sobre una superficie horizontal. ¿Cuál es el trabajo realizado por su peso?',

      '0 J',

      'El peso es perpendicular al desplazamiento: W = Fd cos 90° = 0 J.',

      [
        'Positivo',
        'Negativo',
        'Igual al trabajo de fricción'
      ]

    );

  });

  // ======================================
  // POTENCIA MECANICA
  // ======================================

  B.register('Potencia mecánica', () => {

    const W = B.rand(10,200)*100;

    const t = B.rand(5,60);

    const mode = B.rand(0,5);

    if (mode === 0) {

      return numeric(

        `Una máquina realiza ${W} J de trabajo durante ${t} s. Determine su potencia mecánica media.`,

        W/t,

        'W',

        `P = W/t = ${W}/${t}`

      );

    }

    if (mode === 1) {

      const m = B.rand(10,100)*5;

      const h = B.rand(3,20);

      return numeric(

        `Una grúa eleva una carga de ${m} kg hasta una altura de ${h} m en ${t} s, con igual rapidez inicial y final. Desprecie las pérdidas. Determine la potencia mecánica media de la fuerza aplicada.`+gravity,

        m*g*h/t,

        'W',

        `P = mgh/t = ${m} × 9,8 × ${h}/${t}`

      );

    }

    if (mode === 2) {

      const force = B.rand(10,80)*50;

      const v = B.rand(5,30);

      return numeric(

        `Un vehículo se mueve a ${v} m/s mientras su motor ejerce una fuerza de tracción de ${force} N en el sentido del movimiento. Determine la potencia mecánica desarrollada por esa fuerza.`,

        force*v,

        'W',

        `P = Fv = ${force} × ${v}`

      );

    }

    const power = B.rand(10,100)*20;

    if (mode === 3) {

      return numeric(

        `Una máquina desarrolla una potencia constante de ${power} W durante ${t} s. Determine el trabajo realizado.`,

        power*t,

        'J',

        `W = Pt = ${power} × ${t}`

      );

    }

    if (mode === 4) {

      return numeric(

        `Una máquina de potencia constante de ${power} W realiza ${power*t} J de trabajo. Determine el tiempo empleado.`,

        t,

        's',

        `t = W/P = ${power*t}/${power}`

      );

    }

    const kw = B.rand(2,40)/2;

    return numeric(

      `Un motor desarrolla una potencia mecánica constante de ${f(kw)} kW durante ${t} s. Determine el trabajo realizado en joules.`,

      kw*1000*t,

      'J',

      `W = Pt = ${f(kw)} × 1000 × ${t}`

    );

  });

  // ======================================
  // EFICIENCIA MECANICA
  // ======================================

  B.register('Eficiencia mecánica', () => {

    const input = B.rand(10,100)*100;

    const eta = B.rand(40,95);

    const useful = input*eta/100;

    const loss = input-useful;

    const mode = B.rand(0,4);

    if (mode === 0) {

      return numeric(

        `Una máquina recibe ${input} J de energía y entrega ${f(useful)} J de energía útil. Determine su eficiencia porcentual.`,

        F.efficiency(useful,input),

        '%',

        `η = (Eu/Ee) × 100 = (${f(useful)}/${input}) × 100`,

        [100-eta,eta/2,eta/100]

      );

    }

    if (mode === 1) {

      return numeric(

        `Una máquina recibe ${input} J de energía y tiene una eficiencia del ${eta} %. Determine la energía útil entregada.`,

        useful,

        'J',

        `Eu = Ee × η/100 = ${input} × ${eta}/100`,

        [loss,input]

      );

    }

    if (mode === 2) {

      return numeric(

        `Una máquina recibe ${input} J de energía y tiene una eficiencia del ${eta} %. Determine la energía que no se transforma en energía útil.`,

        loss,

        'J',

        `Epérdida = Ee(1−η/100) = ${input}(1−${eta}/100)`,

        [useful,input]

      );

    }

    if (mode === 3) {

      return numeric(

        `Una máquina entrega ${f(useful)} J de energía útil y tiene una eficiencia del ${eta} %. Determine la energía suministrada.`,

        input,

        'J',

        `Ee = Eu/(η/100) = ${f(useful)}/(${eta}/100)`

      );

    }

    const power = B.rand(10,100)*100;

    return numeric(

      `Un motor recibe una potencia de ${power} W y tiene una eficiencia del ${eta} %. Determine su potencia útil.`,

      power*eta/100,

      'W',

      `Pu = Pe × η/100 = ${power} × ${eta}/100`

    );

  });

})();
