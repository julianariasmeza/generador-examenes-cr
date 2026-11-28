'use strict';

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

  try {

    const page = await browser.newPage();

    const errors = [];

    page.on('pageerror',e=>errors.push(e.message));

    page.on('dialog',async d=>{
      errors.push(d.message());
      await d.dismiss();
    });

    await page.goto(url);

    await page.waitForFunction(()=>
      window.STEMEnergyEditor &&
      window.STEMGravitationEditor &&
      document.getElementById('ep_apply') &&
      document.getElementById('gp_apply')
    );

    const result = await page.evaluate(async()=>{

      const $ = id=>document.getElementById(id);

      const EC = window.STEMEnergyCustom;
      const GC = window.STEMGravitationCustom;
      const GP = window.STEMGravitationParameters;

      let checks = 0;
      let models = 0;

      function check(condition,message){

        if(!condition) throw new Error(message);

        checks++;

      }

      function input(id,value){

        $(id).value = String(value);

        $(id).dispatchEvent(
          new Event('input',{bubbles:true})
        );

      }

      function change(id,value){

        $(id).value = String(value);

        $(id).dispatchEvent(
          new Event('change',{bubbles:true})
        );

      }

      async function save(){

        await $('editForm').onsubmit(
          new Event('submit',{
            cancelable:true,
            bubbles:true
          })
        );

        check(
          !$('dialog').open,
          'El formulario no se cerro'
        );

      }

      function open(topic){

        const z = make('dev',5,topic);

        items.push(z);

        const i = items.length-1;

        edit(i);

        check(
          $('dialog').open,
          'No se abrio el formulario'
        );

        return i;

      }

      function verifySaved(i,expected){

        const z = items[i];

        check(
          z.q===expected.q,
          'Enunciado no guardado'
        );

        check(
          z.r===expected.r,
          'Respuesta no guardada'
        );

        check(
          z.s===expected.s,
          'Procedimiento no guardado'
        );

        check(
          z.image===(z.figures[0]?.src||''),
          'Imagen incompatible con figures'
        );

        check(
          z.options.includes(z.r),
          'Respuesta ausente en alternativas'
        );

        check(
          new Set(z.options).size===z.options.length,
          'Alternativas duplicadas'
        );

        check(
          z.rubric.reduce((s,r)=>s+r.p,0)===5,
          'Puntaje de rubrica incorrecto'
        );

      }

      function snapshot(){

        return {
          q:$('e_q').value.trim(),
          r:$('e_r').value.trim(),
          s:$('e_s').value.trim()
        };

      }

      const gravitation = [

        ['Gravedad con la altura','g'],
        ['Gravedad con la altura','F'],
        ['Rapidez orbital','v'],
        ['Período orbital','T'],
        ['Velocidad de escape','escape']

      ];

      for(const [topic,target] of gravitation){

        const i = open(topic);

        change('gp_planet','Marte');

        input('gp_height',800);
        input('gp_object',750);

        change('gp_target',target);

        check(
          !$('gp_apply').disabled,
          'Parametros gravitacionales rechazados'
        );

        $('gp_apply').click();

        const expected = snapshot();

        const calculated = GC.create({

          ...GP.catalog.Marte,

          name:'Marte',
          h:800,
          m:750,
          target

        });

        check(
          expected.r===calculated.r,
          'Respuesta gravitacional incorrecta'
        );

        await save();

        verifySaved(i,expected);

        check(
          items[i].gravitationParameters?.name==='Marte',
          'Planeta no guardado'
        );

        check(
          items[i].gravitationParameters?.h===800,
          'Altura no guardada'
        );

        check(
          items[i].gravitationParameters?.target===target,
          'Incognita no guardada'
        );

        check(
          items[i].figures.length>0,
          'Figura gravitacional no guardada'
        );

        check(
          Boolean(items[i].gravitationData),
          'Metadatos gravitacionales ausentes'
        );

        edit(i);

        check(
          $('gp_planet').value==='Marte',
          'Planeta no recuperado'
        );

        check(
          Number($('gp_height').value)===800,
          'Altura no recuperada'
        );

        $('e_q').value += ' Texto modificado.';

        await save();

        check(
          !items[i].gravitationParameters,
          'Parametros gravitacionales obsoletos'
        );

        check(
          !items[i].gravitationData,
          'Metadatos gravitacionales obsoletos'
        );

        models++;

      }

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
        Object.entries(EC.definitions)){

        const data = {

          ...definition.defaults,

          ...changes[type]

        };

        const calculated = EC.create(type,data);

        const i = open(calculated.topic);

        change('ep_type',type);

        for(const key of definition.fields){

          input(
            'ep_'+key,
            String(data[key]).replace('.',',')
          );

        }

        check(
          !$('ep_apply').disabled,
          type+': parametros rechazados'
        );

        $('ep_apply').click();

        const expected = snapshot();

        check(
          expected.r===calculated.r,
          type+': respuesta incorrecta'
        );

        await save();

        verifySaved(i,expected);

        check(
          items[i].energyParameters?.type===type,
          type+': modelo no guardado'
        );

        for(const key of definition.fields){

          check(

            items[i].energyParameters.data[key]
              ===calculated.energyParameters.data[key],

            type+': parametro no guardado '+key

          );

        }

        check(

          items[i].figures.length
            ===(graphical.has(type)?1:0),

          type+': figuras incorrectas'

        );

        check(

          Boolean(items[i].energyData)
            ===graphical.has(type),

          type+': metadatos incorrectos'

        );

        edit(i);

        check(
          $('ep_type').value===type,
          type+': modelo no recuperado'
        );

        for(const key of definition.fields){

          check(

            Number(
              $('ep_'+key).value.replace(',','.')
            )===Number(data[key]),

            type+': parametro no recuperado '+key

          );

        }

        $('e_q').value += ' Texto modificado.';

        await save();

        check(
          !items[i].energyParameters,
          type+': parametros obsoletos'
        );

        check(
          !items[i].energyData,
          type+': metadatos obsoletos'
        );

        models++;

      }

      return {checks,models};

    });

    assert.deepEqual(errors,[]);

    assert.equal(result.models,18);

    console.log(name+': OK');

    console.log(
      'Modelos comprobados: '+result.models
    );

    console.log(
      'Comprobaciones: '+result.checks
    );

    return result.checks;

  } finally {

    await browser.close();

  }

}

(async()=>{

  const a = await run(chromium,'Chromium');
  const b = await run(webkit,'WebKit');

  console.log('Total de modelos comprobados: 36');

  console.log(
    'Total de comprobaciones: '+(a+b)
  );

  console.log(
    '===== GUARDADO INTEGRAL VALIDADO ====='
  );

})().catch(error=>{

  console.error(error);

  process.exit(1);

});
