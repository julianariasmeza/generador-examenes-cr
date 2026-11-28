(function(){

  'use strict';

  const P = window.STEMEnergyParameters;
  const B = window.STEMPhysicsBank;

  const definitions = {

    work:{
      topic:'Trabajo mecánico',
      fields:['F','d','angle'],
      target:'W',
      unit:'J',
      defaults:{F:100,d:5,angle:60},
      question:z=>
        `Una fuerza constante de ${f(z.F)} N forma un ángulo de ${f(z.angle)}° con un desplazamiento de ${f(z.d)} m. Determine el trabajo realizado por la fuerza.`,
      solution:z=>[
        'W = Fd cos(θ)',
        `W = ${f(z.F)} · ${f(z.d)} · cos(${f(z.angle)}°)`
      ]
    },

    friction:{
      topic:'Trabajo neto y rozamiento',
      fields:['m','mu','d'],
      target:'Wf',
      unit:'J',
      defaults:{m:10,mu:0.2,d:5},
      question:z=>
        `Un bloque de ${f(z.m)} kg se desplaza ${f(z.d)} m sobre una superficie horizontal. El coeficiente de fricción cinética es ${f(z.mu)}. Determine el trabajo realizado por la fricción.`,
      solution:z=>[
        'N = mg',
        `N = ${f(z.m)} · 9,8`,
        'fk = μN',
        `fk = ${f(z.mu)} · ${f(z.N)}`,
        'Wf = −fk d',
        `Wf = −${f(z.fk)} · ${f(z.d)}`
      ],
      gravity:true
    },

    netWork:{
      topic:'Trabajo neto y rozamiento',
      fields:['F','m','mu','d'],
      target:'W',
      unit:'J',
      defaults:{F:100,m:10,mu:0.2,d:5},
      question:z=>
        `Un bloque de ${f(z.m)} kg se desplaza ${f(z.d)} m sobre una superficie horizontal. Se aplica una fuerza horizontal de ${f(z.F)} N en el sentido del movimiento. El coeficiente de fricción cinética es ${f(z.mu)}. Determine el trabajo neto.`,
      solution:z=>[
        'fk = μmg',
        `fk = ${f(z.mu)} · ${f(z.m)} · 9,8`,
        'Wn = (F − fk)d',
        `Wn = (${f(z.F)} − ${f(z.fk)}) · ${f(z.d)}`
      ],
      gravity:true
    },

    power:{
      topic:'Potencia mecánica',
      fields:['W','t'],
      target:'P',
      unit:'W',
      defaults:{W:1200,t:6},
      question:z=>
        `Una máquina realiza ${f(z.W)} J de trabajo durante ${f(z.t)} s. Determine su potencia mecánica media.`,
      solution:z=>[
        'P = W/t',
        `P = ${f(z.W)} / ${f(z.t)}`
      ]
    },

    efficiency:{
      topic:'Eficiencia mecánica',
      fields:['input','useful'],
      target:'eta',
      unit:'%',
      defaults:{input:1000,useful:800},
      question:z=>
        `Una máquina recibe ${f(z.input)} J de energía y entrega ${f(z.useful)} J de energía útil. Determine su eficiencia porcentual.`,
      solution:z=>[
        'η = (Eu/Es) · 100',
        `η = (${f(z.useful)} / ${f(z.input)}) · 100`
      ]
    },

    kinetic:{
      topic:'Energía cinética',
      fields:['m','v'],
      target:'Ec',
      unit:'J',
      defaults:{m:10,v:4},
      question:z=>
        `Un objeto de ${f(z.m)} kg se mueve con una rapidez de ${f(z.v)} m/s. Determine su energía cinética.`,
      solution:z=>[
        'Ec = mv²/2',
        `Ec = ${f(z.m)} · (${f(z.v)})² / 2`
      ]
    },

    potential:{
      topic:'Energía potencial gravitacional',
      fields:['m','h'],
      target:'Ep',
      unit:'J',
      defaults:{m:10,h:5},
      question:z=>
        `Un objeto de ${f(z.m)} kg se encuentra a una altura de ${f(z.h)} m respecto al nivel de referencia. Determine su energía potencial gravitacional.`,
      solution:z=>[
        'Ep = mgh',
        `Ep = ${f(z.m)} · 9,8 · (${f(z.h)})`
      ],
      gravity:true
    },

    elastic:{
      topic:'Energía potencial elástica',
      fields:['k','x'],
      target:'Ee',
      unit:'J',
      defaults:{k:200,x:0.5},
      question:z=>
        `Un resorte ideal de constante elástica ${f(z.k)} N/m se deforma ${f(z.x)} m respecto a su longitud natural. Determine la energía potencial elástica almacenada.`,
      solution:z=>[
        'Ee = kx²/2',
        `Ee = ${f(z.k)} · (${f(z.x)})² / 2`
      ]
    },

    workEnergy:{
      topic:'Teorema trabajo-energía',
      fields:['m','vi','vf'],
      target:'W',
      unit:'J',
      defaults:{m:10,vi:2,vf:6},
      question:z=>
        `Un cuerpo de ${f(z.m)} kg cambia su rapidez de ${f(z.vi)} m/s a ${f(z.vf)} m/s. Determine el trabajo neto realizado sobre el cuerpo.`,
      solution:z=>[
        'Wn = ΔEc',
        'Wn = m(vf² − vi²)/2',
        `Wn = ${f(z.m)} · ((${f(z.vf)})² − (${f(z.vi)})²) / 2`
      ]
    },

    conservation:{
      topic:'Conservación de la energía mecánica',
      fields:['m','hi','hf','vi'],
      target:'vf',
      unit:'m/s',
      defaults:{m:10,hi:5,hf:0,vi:0},
      question:z=>
        `Un objeto de ${f(z.m)} kg se mueve desde una altura inicial de ${f(z.hi)} m hasta una altura final de ${f(z.hf)} m. Su rapidez inicial es ${f(z.vi)} m/s. Desprecie el rozamiento. Determine su rapidez final.`,
      solution:z=>[
        'Eci + Epi = Ecf + Epf',
        'vi²/2 + ghi = vf²/2 + ghf',
        'vf = √(vi² + 2g(hi − hf))',
        `vf = √((${f(z.vi)})² + 2 · 9,8 · (${f(z.hi)} − (${f(z.hf)})))`
      ],
      gravity:true
    },

    roughSurface:{
      topic:'Energía mecánica con rozamiento',
      fields:['m','vi','mu','d'],
      target:'vf',
      unit:'m/s',
      defaults:{m:10,vi:14,mu:0.2,d:10},
      question:z=>
        `Un bloque de ${f(z.m)} kg se mueve inicialmente a ${f(z.vi)} m/s sobre una superficie horizontal rugosa. El coeficiente de fricción cinética es ${f(z.mu)}. No actúan otras fuerzas horizontales. Determine su rapidez después de recorrer ${f(z.d)} m.`,
      solution:z=>[
        'Wf = −μmgd',
        `Wf = −${f(z.mu)} · ${f(z.m)} · 9,8 · ${f(z.d)}`,
        'Ecf = Eci + Wf',
        'vf = √(vi² − 2μgd)',
        `vf = √((${f(z.vi)})² − 2 · ${f(z.mu)} · 9,8 · ${f(z.d)})`
      ],
      gravity:true
    },

    spring:{
      topic:'Sistemas con resortes',
      fields:['m','v','k'],
      target:'x',
      unit:'m',
      defaults:{m:2,v:4,k:200},
      question:z=>
        `Un bloque de ${f(z.m)} kg se mueve a ${f(z.v)} m/s sobre una superficie horizontal sin rozamiento y comprime un resorte ideal inicialmente sin deformar, de constante elástica ${f(z.k)} N/m. Determine la compresión máxima.`,
      solution:z=>[
        'Ec = Ee',
        'mv²/2 = kx²/2',
        'x = v√(m/k)',
        `x = ${f(z.v)} · √(${f(z.m)} / ${f(z.k)})`
      ]
    },

    stages:{
      topic:'Problemas de varias etapas',
      fields:['m','h','mu','d','k'],
      target:'x',
      unit:'m',
      defaults:{m:10,h:5,mu:0.2,d:5,k:200},
      question:z=>
        `Un bloque de ${f(z.m)} kg parte del reposo desde una altura de ${f(z.h)} m y desciende por una rampa sin rozamiento. Atraviesa un tramo horizontal rugoso de ${f(z.d)} m, con coeficiente de fricción cinética ${f(z.mu)}. Finalmente comprime un resorte ideal inicialmente sin deformar de constante elástica ${f(z.k)} N/m, sobre una superficie horizontal sin rozamiento. Determine la compresión máxima.`,
      solution:z=>[
        'Epi + Wf = Ee',
        'mgh − μmgd = kx²/2',
        'x = √(2(mgh − μmgd)/k)',
        `x = √(2 · (${f(z.m)} · 9,8 · ${f(z.h)} − ${f(z.mu)} · ${f(z.m)} · 9,8 · ${f(z.d)}) / ${f(z.k)})`
      ],
      gravity:true
    }

  };

  function f(n){

    return String(n).replace('.',',');

  }

  function format(n){

    if(!Number.isFinite(n)){
      throw new Error('Resultado inválido.');
    }

    if(n!==0 && (
      Math.abs(n)<0.01 ||
      Math.abs(n)>=1e6
    )){
      return window.STEMGravitationCustom.fmt(n);
    }

    return Number(n.toFixed(2))
      .toString().replace('.',',');

  }

  function create(type,data){

    if(!Object.hasOwn(definitions,type)){
      throw new Error('Modelo no reconocido.');
    }

    const d = definitions[type];

    const z = P.calculate(type,data);

    const value = z[d.target];

    const render = n=>format(n)+' '+d.unit;

    const answer = render(value);

    let candidates = [

      value/2,value*2,value*1.5,
      value/4,value*3,
      value+1,value+2,value+3,
      value-1,value-2,value-3

    ];

    if(type==='efficiency'){

      candidates.push(0,25,50,75,100);

      candidates = candidates.filter(
        x=>x>=0 && x<=100
      );

    }else if(![
      'work','friction','netWork',
      'potential','workEnergy'
    ].includes(type)){

      candidates = candidates.filter(x=>x>=0);

    }

    const wrong = [...new Set(

      candidates.filter(Number.isFinite)
        .map(render)

    )].filter(x=>x!==answer);

    if(wrong.length<3){
      throw new Error(
        'No hay suficientes alternativas distintas.'
      );
    }

    const q = d.question(z)+

      (d.gravity
        ? ' Considere g = 9,8 m/s².'
        : '')+

      ' Redondee a dos decimales cuando corresponda; en notación científica utilice seis cifras significativas.';

    const solution = [

      ...d.solution(z),

      'Respuesta: '+answer

    ].join('\n');

    return {

      ...B.item(q,answer,solution,wrong),

      topic:d.topic,

      energyParameters:{

        type,

        data:Object.fromEntries(
          d.fields.map(key=>[key,z[key]])
        )

      }

    };

  }

  window.STEMEnergyCustom = Object.freeze({

    definitions,

    format,

    create

  });

})();
