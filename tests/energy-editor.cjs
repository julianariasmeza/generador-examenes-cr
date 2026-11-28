
const assert = require('node:assert/strict');

const {chromium,webkit} = require(
  process.env.PLAYWRIGHT_PATH || 'playwright'
);

const url = process.env.TEST_URL ||
  'http://127.0.0.1:8766';

async function run(engine,name){

  const browser = await engine.launch({
    headless:true
  });

  try{

    const page = await browser.newPage();

    const errors = [];

    page.on('pageerror',e=>{
      errors.push(e.message);
    });

    await page.goto(url);

    await page.waitForFunction(()=>

      window.STEMEnergyEditor &&
      window.STEMEnergyCustom &&
      document.getElementById(
        'energyParametersPanel'
      )

    );

    const result = await page.evaluate(()=>{

      const C = window.STEMEnergyCustom;

      const E = window.STEMEnergyEditor;

      const $ = id=>document.getElementById(id);

      let checks = 0;

      const models = [];

      function check(condition,message){

        if(!condition){

          throw new Error(message);

        }

        checks++;

      }

      const graphical = new Set([

        'work',
        'friction',
        'netWork',
        'efficiency',
        'potential',
        'elastic',
        'conservation',
        'roughSurface',
        'spring',
        'stages'

      ]);

      for(const [type,definition] of
        Object.entries(C.definitions)){

        const original = C.create(
          type,definition.defaults
        );

        const z = {

          ...original,

          k:'dev',

          p:5,

          figures:[],

          image:''

        };

        $('e_p').value = 5;

        E.prepare(z);

        check(
          !$('energyParametersPanel').hidden,
          type+': panel oculto'
        );

        check(
          $('ep_type').value===type,
          type+': modelo incorrecto'
        );

        for(const key of definition.fields){

          check(
            !!$('ep_'+key),
            type+': campo faltante '+key
          );

        }

        check(
          !$('ep_apply').disabled,
          type+': boton deshabilitado'
        );

        // Modificar un dato para verificar
        // que el ejercicio se recalcula.

        const changes = {

          work:{F:150},
          friction:{m:15},
          netWork:{F:150},
          power:{W:1800},
          efficiency:{useful:600},
          kinetic:{v:8},
          potential:{h:-3},
          elastic:{x:0.3},
          workEnergy:{vf:8},
          conservation:{hi:8},
          roughSurface:{vi:18},
          spring:{v:6},
          stages:{h:8}

        };

        const data = {

          ...definition.defaults,

          ...changes[type]

        };

        for(const key of definition.fields){

          $('ep_'+key).value =
            String(data[key]).replace('.',',');

          $('ep_'+key).dispatchEvent(
            new Event('input',{bubbles:true})
          );

        }

        const expected = C.create(type,data);

        check(
          !$('ep_apply').disabled,
          type+': datos validos rechazados'
        );

        $('ep_apply').click();

        check(
          $('e_r').value===expected.r,
          type+': respuesta incorrecta'
        );

        check(
          $('e_s').value===expected.s,
          type+': procedimiento incorrecto'
        );

        check(
          $('e_q').value.startsWith(expected.q),
          type+': enunciado incorrecto'
        );

        const options = $('e_options').value
          .split('\n');

        check(
          options.length===4,
          type+': cantidad de alternativas'
        );

        check(
          new Set(options).size===4,
          type+': alternativas repetidas'
        );

        check(
          options.includes(expected.r),
          type+': respuesta ausente'
        );

        const rubric = $('e_rubric').value
          .split('\n')
          .filter(Boolean);

        const total = rubric.reduce(

          (sum,row)=>
            sum+Number(row.split('|')[0]),

          0

        );

        check(
          total===5,
          type+': puntaje de rubrica incorrecto'
        );

        const images = [

          ...$('figureManager')
            .querySelectorAll('img')

        ];

        check(

          images.length===(graphical.has(type)?1:0),

          type+': cantidad de figuras incorrecta'

        );

        if(graphical.has(type)){

          check(

            images[0].src.startsWith(
              'data:image/png;base64,'
            ),

            type+': formato de figura incorrecto'

          );

          check(
            images[0].src.length>1000,
            type+': figura vacia'
          );

        }

        const saved = {

          ...z,

          q:$('e_q').value,

          r:$('e_r').value,

          s:$('e_s').value,

          options,

          figures:images.map(img=>({

            src:img.src

          }))

        };

        E.save(saved);

        check(

          saved.energyParameters?.type===type,

          type+': parametros no guardados'

        );

        for(const key of definition.fields){

          check(

            saved.energyParameters.data[key]
              ===expected.energyParameters.data[key],

            type+': dato no guardado '+key

          );

        }

        check(

          Boolean(saved.energyData)
            ===graphical.has(type),

          type+': metadatos graficos incorrectos'

        );

        E.prepare(saved);

        for(const key of definition.fields){

          check(

            Number(
              $('ep_'+key).value.replace(',','.')
            )===Number(data[key]),

            type+': dato no recuperado '+key

          );

        }

        // Rechazar campos vacios.

        const key = definition.fields[0];

        $('ep_'+key).value = '';

        $('ep_'+key).dispatchEvent(

          new Event('input',{bubbles:true})

        );

        check(

          $('ep_apply').disabled,

          type+': campo vacio aceptado'

        );

        models.push(type);

      }

      // No mostrar el panel en otros temas.

      E.prepare({

        topic:'Rapidez orbital',

        k:'dev'

      });

      check(

        $('energyParametersPanel').hidden,

        'Panel visible en tema incompatible'

      );

      // No mostrar el panel en correspondencia.

      E.prepare({

        topic:'Trabajo mecánico',

        k:'corr'

      });

      check(

        $('energyParametersPanel').hidden,

        'Panel visible en correspondencia'

      );

      return {checks,models};

    });

    assert.deepEqual(errors,[]);

    assert.equal(result.models.length,13);

    console.log(name+': OK');

    console.log(
      'Modelos comprobados: '+result.models.length
    );

    console.log(
      'Comprobaciones: '+result.checks
    );

    for(const model of result.models){

      console.log('  '+model+': OK');

    }

    return result.checks;

  }finally{

    await browser.close();

  }

}

(async()=>{

  const a = await run(chromium,'Chromium');

  const b = await run(webkit,'WebKit');

  console.log(
    'Total de comprobaciones: '+(a+b)
  );

  console.log(
    '===== EDITOR DE ENERGIA VALIDADO ====='
  );

})().catch(error=>{

  console.error(error);

  process.exit(1);

});
