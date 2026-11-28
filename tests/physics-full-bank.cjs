'use strict';

const assert = require('node:assert/strict');

const {
  chromium,
  webkit
} = require(process.env.PLAYWRIGHT_PATH);

(async()=>{

  for(const [name,engine] of [

    ['Chromium',chromium],

    ['WebKit',webkit]

  ]) {

    console.log('\n===== '+name+' =====');

    const browser = await engine.launch({

      headless:true

    });

    try {

      const page = await browser.newPage();

      const errors = [];

      page.on('pageerror',error=>{

        errors.push(error.message);

      });

      await page.goto(process.env.TEST_URL,{

        waitUntil:'load'

      });

      await page.waitForFunction(()=>{

        return Boolean(

          window.STEMPhysicsBank &&

          window.STEMDynamicsRubrics &&

          window.STEMGravitationRubrics &&

          window.STEMEnergyRubrics

        );

      });

      const report = await page.evaluate(()=>{

        const B = window.STEMPhysicsBank;

        const rubrics = [

          window.STEMDynamicsRubrics,

          window.STEMGravitationRubrics,

          window.STEMEnergyRubrics

        ];

        const failures = [];

        const rows = [];

        let generated = 0;

        let figures = 0;

        let rubricChecks = 0;

        function check(condition,message) {

          if(!condition && failures.length<100) {

            failures.push(message);

          }

        }

        const topics = B.topics();

        check(topics.length===45,

          'Cantidad incorrecta de temas: '+topics.length
        );

        for(const topic of topics) {

          let topicFigures = 0;

          let topicRubrics = 0;

          const unique = new Set();

          for(let i=0;i<300;i++) {

            try {

              const z = B.question(topic);

              generated++;

              unique.add(z.q);

              check(

                Boolean(z.q && z.r && z.s),

                topic+': pregunta incompleta'

              );

              check(

                Array.isArray(z.options) &&

                z.options.length===4,

                topic+': cantidad de opciones incorrecta'

              );

              check(

                new Set(z.options).size===4,

                topic+': opciones duplicadas'

              );

              check(

                z.options.includes(z.r),

                topic+': respuesta correcta ausente'

              );

              check(

                !/NaN|Infinity|undefined/.test(

                  [z.q,z.r,z.s,...z.options].join(' ')

                ),

                topic+': valor invalido'

              );

              if(z.image) {

                figures++;

                topicFigures++;

                check(

                  z.image.startsWith(

                    'data:image/png;base64,'

                  ),

                  topic+': formato de imagen incorrecto'

                );

                check(

                  z.image.length>1000,

                  topic+': imagen demasiado pequena'

                );

                check(

                  Array.isArray(z.figures) &&

                  z.figures.length>0,

                  topic+': figura no registrada'

                );

              }

              const R = rubrics.find(

                r=>r.has(topic)

              );

              if(R) {

                for(let p=1;p<=10;p++) {

                  const rubric = R.create(topic,p,z);

                  rubricChecks++;

                  topicRubrics++;

                  check(

                    rubric.length>0,

                    topic+': rubrica vacia'

                  );

                  check(

                    rubric.reduce(

                      (sum,r)=>sum+r.p,0

                    )===p,

                    topic+': puntaje incorrecto'

                  );

                  check(

                    rubric.every(r=>

                      r.label &&

                      Number.isInteger(r.p) &&

                      r.p>0

                    ),

                    topic+': criterio invalido'

                  );

                }

              }

            } catch(error) {

              failures.push(

                topic+': '+error.message

              );

              break;

            }

          }

          rows.push({

            tema:topic,

            distintas:unique.size,

            figuras:topicFigures,

            rubricas:topicRubrics

          });

        }

        return {

          topics:topics.length,

          generated,

          figures,

          rubricChecks,

          failures,

          rows

        };

      });

      console.table(report.rows);

      console.log('Temas:',report.topics);

      console.log('Preguntas generadas:',report.generated);

      console.log('Figuras generadas:',report.figures);

      console.log('Rubricas comprobadas:',report.rubricChecks);

      console.log('Errores de JavaScript:',errors.length);

      console.log('Fallos del banco:',report.failures.length);

      if(errors.length) {

        console.error(errors);

      }

      if(report.failures.length) {

        console.error(report.failures);

      }

      assert.equal(errors.length,0);

      assert.equal(report.failures.length,0);

      assert.equal(report.topics,45);

      assert.equal(report.generated,13500);

      assert.equal(report.rubricChecks,105000);

      console.log(name+': OK');

    } finally {

      await browser.close();

    }

  }

})().catch(error=>{

  console.error(error);

  process.exit(1);

});
