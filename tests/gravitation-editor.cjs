
const assert = require('node:assert/strict');

const {chromium,webkit} = require(
  process.env.PLAYWRIGHT_PATH || 'playwright'
);

const url = process.env.TEST_URL ||
  'http://127.0.0.1:8766';

async function test(name,engine){

  const browser = await engine.launch({
    headless:true
  });

  try{

    const page = await browser.newPage();

    const errors = [];

    page.on('pageerror',e=>errors.push(e.message));

    await page.goto(url);

    await page.waitForFunction(()=>
      window.STEMGravitationEditor &&
      document.getElementById('gp_apply')
    );

    const result = await page.evaluate(()=>{

      const $ = id=>document.getElementById(id);

      const P = window.STEMGravitationParameters;

      const C = window.STEMGravitationCustom;

      const E = window.STEMGravitationEditor;

      let checks = 0;

      function check(condition,message){

        if(!condition) throw new Error(message);

        checks++;

      }

      const topics = [

        ['Gravedad con la altura','g'],

        ['Gravedad con la altura','F'],

        ['Rapidez orbital','v'],

        ['Período orbital','T'],

        ['Velocidad de escape','escape']

      ];

      for(const [topic,target] of topics){

        const original = {

          ...C.create({

            ...P.catalog.Tierra,

            name:'Tierra',

            h:400,

            m:500,

            target

          }),

          topic,

          k:'dev',

          p:5

        };

        E.prepare(original);

        check(
          !$('gravitationParametersPanel').hidden,
          'Panel no visible'
        );

        $('e_p').value = 5;

        $('gp_planet').value = 'Marte';

        $('gp_planet').dispatchEvent(
          new Event('change',{bubbles:true})
        );

        check(
          Number($('gp_mass').value)===P.catalog.Marte.M,
          'Masa incorrecta'
        );

        check(
          Number($('gp_radius').value)===P.catalog.Marte.R,
          'Radio incorrecto'
        );

        $('gp_height').value = '800';

        $('gp_object').value = '750';

        $('gp_target').value = target;

        $('gp_apply').click();

        const expected = C.create({

          ...P.catalog.Marte,

          name:'Marte',

          h:800,

          m:750,

          target

        });

        check(
          $('e_q').value.includes('Marte'),
          'Enunciado no actualizado'
        );

        check(
          $('e_r').value===expected.r,
          'Respuesta incorrecta'
        );

        check(
          $('e_s').value===expected.s,
          'Procedimiento incorrecto'
        );

        const options = $('e_options').value.split('\n');

        check(
          options.includes(expected.r),
          'Falta respuesta correcta'
        );

        check(
          new Set(options).size===options.length,
          'Alternativas duplicadas'
        );

        check(
          $('figureManager').querySelectorAll('img').length>0,
          'Figura no generada'
        );

        const saved = {

          ...original,

          q:$('e_q').value,

          r:$('e_r').value,

          s:$('e_s').value

        };

        E.save(saved);

        check(
          saved.gravitationParameters?.name==='Marte',
          'Parametros no guardados'
        );

        check(
          saved.gravitationParameters?.h===800,
          'Altura no guardada'
        );

        check(
          saved.gravitationParameters?.target===target,
          'Incognita no guardada'
        );

        E.prepare(saved);

        check(
          Number($('gp_height').value)===800,
          'Altura no restaurada'
        );

        check(
          $('gp_planet').value==='Marte',
          'Planeta no restaurado'
        );

        // Comprobar que preparar nuevamente
        // descarta los parametros pendientes.

        $('gp_height').value = '900';

        $('gp_apply').click();

        E.prepare(saved);

        check(
          Number($('gp_height').value)===800,
          'Cambios pendientes no descartados'
        );

        // Validar alturas negativas.

        $('gp_height').value = '-100';

        $('gp_height').dispatchEvent(
          new Event('input',{bubbles:true})
        );

        check(
          $('gp_apply').disabled,
          'Altura negativa aceptada'
        );

      }

      E.prepare({

        topic:'Energía cinética',

        k:'dev'

      });

      check(
        $('gravitationParametersPanel').hidden,
        'Panel visible en tema incompatible'
      );

      return {checks};

    });

    assert.deepEqual(errors,[]);

    console.log(name+': OK');

    console.log(
      'Comprobaciones:',result.checks
    );

  }finally{

    await browser.close();

  }

}

(async()=>{

  await test('Chromium',chromium);

  await test('WebKit',webkit);

  console.log(
    '===== EDITOR DE GRAVITACION VALIDADO ====='
  );

})().catch(error=>{

  console.error(error);

  process.exit(1);

});
