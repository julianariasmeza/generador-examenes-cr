(function(){

  'use strict';

  const P = window.STEMEnergyParameters;
  const C = window.STEMEnergyCustom;

  const $ = id=>document.getElementById(id);

  let current = null;
  let pending = null;

  const labels = {

    F:'Fuerza aplicada (N)',
    d:'Distancia o desplazamiento (m)',
    angle:'Ángulo (°)',
    m:'Masa (kg)',
    mu:'Coeficiente de fricción',
    W:'Trabajo (J)',
    t:'Tiempo (s)',
    input:'Energía suministrada (J)',
    useful:'Energía útil (J)',
    v:'Rapidez (m/s)',
    h:'Altura (m)',
    k:'Constante elástica (N/m)',
    x:'Deformación (m)',
    vi:'Rapidez inicial (m/s)',
    vf:'Rapidez final (m/s)',
    hi:'Altura inicial (m)',
    hf:'Altura final (m)'

  };

  const names = {

    work:'Trabajo de una fuerza',
    friction:'Trabajo de la fricción',
    netWork:'Trabajo neto horizontal',
    power:'Potencia mecánica',
    efficiency:'Eficiencia mecánica',
    kinetic:'Energía cinética',
    potential:'Energía potencial gravitacional',
    elastic:'Energía potencial elástica',
    workEnergy:'Teorema trabajo-energía',
    conservation:'Conservación de energía',
    roughSurface:'Movimiento con rozamiento',
    spring:'Compresión de un resorte',
    stages:'Rampa, rozamiento y resorte'

  };

  function install(){

    if($('energyParametersPanel')) return;

    const panel = document.createElement('fieldset');

    panel.id = 'energyParametersPanel';

    panel.hidden = true;

    panel.innerHTML = `

      <legend>Parámetros de trabajo y energía</legend>

      <label>Modelo de ejercicio
        <select id="ep_type"></select>
      </label>

      <div id="ep_fields"
        style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">
      </div>

      <p id="ep_result" aria-live="polite"></p>

      <small>
        Recalcular sustituye el enunciado,
        la respuesta, el procedimiento,
        las alternativas y las figuras anteriores.
      </small>

      <button type="button" id="ep_apply">
        Recalcular ejercicio
      </button>

    `;

    $('e_q').closest('label').before(panel);

    $('ep_type').onchange = ()=>{

      buildFields();

      preview();

    };

    panel.addEventListener('input',preview);

    $('ep_apply').onclick = apply;

  }

  function buildFields(data){

    const type = $('ep_type').value;

    const definition = C.definitions[type];

    $('ep_fields').replaceChildren();

    for(const key of definition.fields){

      const label = document.createElement('label');

      label.textContent = labels[key] || key;

      const input = document.createElement('input');

      input.id = 'ep_'+key;

      input.type = 'text';

      input.inputMode = 'decimal';

      input.value = String(

        data?.[key] ?? definition.defaults[key]

      ).replace('.',',');

      label.appendChild(input);

      $('ep_fields').appendChild(label);

    }

  }

  function read(){

    const type = $('ep_type').value;

    const data = Object.fromEntries(

      C.definitions[type].fields.map(

        key=>[key,$('ep_'+key).value]

      )

    );

    return {type,data};

  }

  function preview(){

    if(!current) return;

    try{

      const {type,data} = read();

      const definition = C.definitions[type];

      const z = P.calculate(type,data);

      $('ep_result').textContent =

        'Respuesta calculada: '+

        C.format(z[definition.target])+

        ' '+definition.unit;

      $('ep_apply').disabled = false;

    }catch(error){

      $('ep_result').textContent = error.message;

      $('ep_apply').disabled = true;

    }

  }

  function prepare(z){

    current = null;

    pending = null;

    const panel = $('energyParametersPanel');

    if(!panel) return;

    const models = Object.keys(C.definitions)

      .filter(type=>

        C.definitions[type].topic===z.topic

      );

    panel.hidden = !models.length || z.k==='corr';

    if(panel.hidden) return;

    current = z;

    $('ep_type').replaceChildren();

    for(const type of models){

      const option = document.createElement('option');

      option.value = type;

      option.textContent = names[type];

      $('ep_type').appendChild(option);

    }

    const saved = z.energyParameters;

    if(saved && models.includes(saved.type)){

      $('ep_type').value = saved.type;

      buildFields(saved.data);

    }else{

      $('ep_type').value = models[0];

      buildFields();

    }

    preview();

    if(!saved){

      $('ep_result').textContent =

        'Valores iniciales de referencia. '+

        'Recalcular sustituirá el ejercicio original.';

    }

  }

  function regenerateFigure(z){

    const {type,data} = z.energyParameters;

    const Figures = window.STEMEnergyFigures;

    const p = P.calculate(type,data);

    let model = null;

    switch(type){

      case 'work':

        model = {
          type:'work',
          data:{
            F:p.F,
            d:p.d,
            angle:p.angle
          }
        };

        break;

      case 'friction':

        model = {
          type:'friction',
          data:{
            m:p.m,
            mu:p.mu,
            d:p.d
          }
        };

        break;

      case 'roughSurface':

        model = {
          type:'friction',
          data:{
            m:p.m,
            mu:p.mu,
            d:p.d,
            v:p.vi
          }
        };

        break;

      case 'potential':

        model = {
          type:'potential',
          data:{
            m:p.m,
            h:p.h
          }
        };

        break;

      case 'elastic':

        model = {
          type:'elastic',
          data:{
            k:p.k,
            x:p.x
          }
        };

        break;

      case 'conservation':

        model = {
          type:'conservation',
          data:{
            m:p.m,
            hi:p.hi,
            hf:p.hf,
            vi:p.vi
          }
        };

        break;

      case 'netWork':

        model = {
          type:'work',
          data:{
            F:p.F,
            m:p.m,
            mu:p.mu,
            d:p.d,
            angle:0
          }
        };

        break;

      case 'efficiency':

        model = {
          type:'efficiency',
          data:{
            input:p.input,
            useful:p.useful
          }
        };

        break;

      case 'spring':

        model = {
          type:'spring',
          data:{
            m:p.m,
            v:p.v,
            k:p.k
          }
        };

        break;

      case 'stages':

        model = {
          type:'stages',
          data:{
            m:p.m,
            h:p.h,
            mu:p.mu,
            d:p.d,
            k:p.k
          }
        };

        break;

    }

    if(!model){

      return {
        ...z,
        figures:[],
        image:''
      };

    }

    return Figures.attach(
      z,
      model.type,
      model.data
    );

  }

  function apply(){

    if(!current) return;

    try{

      const {type,data} = read();

      const z = C.create(type,data);

      if(z.topic!==current.topic){

        throw new Error('Tema incompatible.');

      }

      const development = [

        'dev','exercise','problem','restricted'

      ].includes(current.k);

      const count = current.options?.length===4

        ? 4 : 3;

      const options = window.STEMPhysicsBank.shuffle([

        z.r,

        ...z.options.filter(x=>x!==z.r)

          .slice(0,count-1)

      ]);

      const points = Number($('e_p').value);

      let rubric = null;

      if(

        development &&

        Number.isInteger(points) &&

        points>=1 && points<=10

      ){

        rubric = window.STEMEnergyRubrics.create(

          z.topic,points,z

        );

      }

      const generatedFigure = regenerateFigure(z);

      $('e_q').value = z.q+

        (development

          ? ' Muestre el procedimiento correspondiente.'

          : '');

      $('e_r').value = z.r;

      $('e_s').value = z.s;

      $('e_options').value = options.join('\n');

      if(rubric){

        $('e_rubric').value = rubric.map(

          r=>r.p+' | '+r.label

        ).join('\n');

      }

      openFigureManager(generatedFigure);

      $('e_image').value = '';

      $('e_remove').checked = false;

      pending = {

        parameters:z.energyParameters,

        figureData:generatedFigure.energyData,

        q:$('e_q').value,

        r:$('e_r').value,

        s:$('e_s').value

      };

      $('ep_result').textContent =

        'Ejercicio recalculado. Respuesta: '+

        z.r+'. Aplicá los cambios para guardar.';

    }catch(error){

      alert(error.message);

    }

  }

  function save(z){

    if(

      pending &&

      z.q===pending.q &&

      z.r===pending.r &&

      z.s===pending.s

    ){

      z.energyParameters = {

        type:pending.parameters.type,

        data:{...pending.parameters.data}

      };

      if(pending.figureData && z.figures?.length){

        z.energyData = pending.figureData;

      }else{

        delete z.energyData;

      }

    }else if(current && (

      z.q!==current.q ||

      z.r!==current.r ||

      z.s!==current.s

    )){

      delete z.energyParameters;

      delete z.energyData;

    }

  }

  window.STEMEnergyEditor = Object.freeze({

    prepare,

    save

  });

  window.addEventListener('load',install);

})();
