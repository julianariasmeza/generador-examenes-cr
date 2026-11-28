(function(){

  'use strict';

  const P = window.STEMGravitationParameters;

  const B = window.STEMPhysicsBank;

  const definitions = Object.freeze({

    g: {
      topic:'Gravedad con la altura',
      ask:'Determine el campo gravitacional a dicha altura.',
      unit:'N/kg',
      formula:'g = GM/r²'
    },

    F: {
      topic:'Gravedad con la altura',
      ask:'Determine la magnitud de la fuerza gravitacional sobre el objeto.',
      unit:'N',
      formula:'F = GMm/r²'
    },

    v: {
      topic:'Rapidez orbital',
      ask:'Determine la rapidez necesaria para mantener una órbita circular.',
      unit:'m/s',
      formula:'v = √(GM/r)'
    },

    T: {
      topic:'Período orbital',
      ask:'Determine el período de una órbita circular.',
      unit:'s',
      formula:'T = 2π√(r³/GM)'
    },

    escape: {
      topic:'Velocidad de escape',
      ask:'Determine la velocidad de escape desde dicha altura.',
      unit:'m/s',
      formula:'vₑ = √(2GM/r)'
    }

  });

  function fmt(n){

    if(!Number.isFinite(n)){

      throw new Error('Resultado inválido.');

    }

    if(n===0) return '0';

    const a = Math.abs(n);

    if(a>=1e6 || a<0.01){

      const [c,e] = n.toExponential(5).split('e');

      const superscript = {
        '-':'⁻','+':'⁺',
        '0':'⁰','1':'¹','2':'²','3':'³',
        '4':'⁴','5':'⁵','6':'⁶','7':'⁷',
        '8':'⁸','9':'⁹'
      };

      return String(Number(c)).replace('.',',')+
        ' × 10'+
        String(Number(e)).split('')
          .map(x=>superscript[x]).join('');

    }

    return String(Number(n.toFixed(2)))
      .replace('.',',');

  }

  function exact(n){

    if(!Number.isFinite(n)){

      throw new Error('Dato inválido.');

    }

    const parts = String(n).split('e');

    if(parts.length===1){

      return parts[0].replace('.',',');

    }

    const superscript = {

      '-':'⁻','+':'⁺',

      '0':'⁰','1':'¹','2':'²',

      '3':'³','4':'⁴','5':'⁵',

      '6':'⁶','7':'⁷','8':'⁸','9':'⁹'

    };

    return parts[0].replace('.',',')+

      ' × 10'+

      String(Number(parts[1])).split('')

        .map(x=>superscript[x]).join('');

  }

  function create(data){

    const target = data.target;

    if(!Object.hasOwn(definitions,target)){

      throw new Error('Seleccione una incógnita válida.');

    }

    const d = definitions[target];

    const z = P.calculate(data);

    const name = String(
      data.name || 'Cuerpo celeste'
    ).trim();

    if(!name || name.length>80){

      throw new Error('Nombre inválido.');

    }

    const q =

      `Considere el cuerpo celeste ${name}, `+

      `de masa ${exact(z.M)} kg y radio `+

      `${exact(z.R/1000)} km. `+

      (target==='F'

        ? `Un objeto de ${exact(z.m)} kg se encuentra `

        : 'Un objeto se encuentra ')+

      `a ${exact(z.h/1000)} km sobre su superficie. `+

      d.ask+

      ' Utilice G = 6,67430 × 10⁻¹¹ N·m²/kg². '+

      'Redondee a dos decimales cuando corresponda; '+

      'en notación científica utilice seis cifras significativas.';

    const value = z[target];

    const render = n=>`${fmt(n)} ${d.unit}`;

    const answer = render(value);

    const substitutions = {

      g: `${exact(P.G)} · ${exact(z.M)} / (${exact(z.r)})²`,

      F: `${exact(P.G)} · ${exact(z.M)} · ${exact(z.m)} / (${exact(z.r)})²`,

      v: `√(${exact(P.G)} · ${exact(z.M)} / ${exact(z.r)})`,

      T: `2π√((${exact(z.r)})³ / (${exact(P.G)} · ${exact(z.M)}))`,

      escape: `√(2 · ${exact(P.G)} · ${exact(z.M)} / ${exact(z.r)})`

    };

    const solution = [

      `R = ${exact(z.R)} m`,

      `h = ${exact(z.h)} m`,

      `r = R + h = ${exact(z.r)} m`,

      d.formula,

      substitutions[target],

      `Respuesta: ${answer}`

    ].join('\n');

    const wrong = [...new Set(

      [value/2,value*2,value*1.5,value/4,value*3]

        .map(render)

    )].filter(x=>x!==answer);

    if(wrong.length<3){

      throw new Error(
        'No se pudieron generar alternativas distintas.'
      );

    }

    const item = B.item(

      q,answer,solution,wrong

    );

    return {

      ...item,

      topic:d.topic,

      gravitationParameters:{

        name,

        M:z.M,

        R:z.R/1000,

        h:z.h/1000,

        m:z.m,

        target

      }

    };

  }

  window.STEMGravitationCustom = Object.freeze({

    definitions,

    fmt,

    create

  });

})();
