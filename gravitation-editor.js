(function(){

  'use strict';

  const $ = id => document.getElementById(id);

  const P = window.STEMGravitationParameters;

  const C = window.STEMGravitationCustom;

  let current = null;

  function install(){

    const panel = document.createElement('fieldset');

    panel.id = 'gravitationParametersPanel';

    panel.hidden = true;

    panel.innerHTML = `
      <legend>Parámetros de gravitación universal</legend>

      <p class="hint">
        Personalizá los datos físicos y recalculá el ejercicio.
      </p>

      <div class="grid">

        <label>Cuerpo celeste
          <select id="gp_planet"></select>
        </label>

        <label>Nombre
          <input id="gp_name" type="text">
        </label>

        <label>Masa planetaria (kg)
          <input id="gp_mass" type="text">
        </label>

        <label>Radio planetario (km)
          <input id="gp_radius" type="text">
        </label>

        <label>Altura sobre la superficie (km)
          <input id="gp_height" type="text">
        </label>

        <label>Masa del objeto (kg)
          <input id="gp_object" type="text">
        </label>

        <label>Incógnita
          <select id="gp_target">
            <option value="g">Campo gravitacional</option>
            <option value="F">Fuerza gravitacional</option>
            <option value="v">Rapidez orbital</option>
            <option value="T">Período orbital</option>
            <option value="escape">Velocidad de escape</option>
          </select>
        </label>

      </div>

      <p id="gp_result" aria-live="polite"></p>

      <button type="button" id="gp_apply" class="primary">
        Recalcular ejercicio
      </button>

      <p class="hint">
        Los cambios se guardarán al aplicar
        los cambios de la pregunta.
      </p>
    `;

    $('e_q').closest('label').before(panel);

    const select = $('gp_planet');

    for(const name of Object.keys(P.catalog)){

      select.add(new Option(name,name));

    }

    select.add(
      new Option('Personalizado','custom')
    );

    select.onchange = () => {

      const name = select.value;

      if(name !== 'custom'){

        const body = P.catalog[name];

        $('gp_name').value = name;

        $('gp_mass').value = body.M;

        $('gp_radius').value = body.R;

      }

      preview();

    };

    for(const id of [

      'gp_name','gp_mass','gp_radius'

    ]){

      $(id).addEventListener('input',()=>{

        select.value = 'custom';

      });

    }

    panel.addEventListener('input',preview);

    panel.addEventListener('change',preview);

    $('gp_apply').onclick = apply;

  }

  function read(){

    return {

      name:$('gp_name').value,

      M:$('gp_mass').value,

      R:$('gp_radius').value,

      h:$('gp_height').value,

      m:$('gp_object').value,

      target:$('gp_target').value

    };

  }

  function preview(){

    try{

      const data = read();

      const result = P.calculate(data);

      const d = C.definitions[data.target];

      $('gp_result').textContent =

        'Resultado: '+

        C.fmt(result[data.target])+

        ' '+d.unit;

      $('gp_apply').disabled = false;

    }catch(error){

      $('gp_result').textContent = error.message;

      $('gp_apply').disabled = true;

    }

  }

  function open(z){

    current = null;

    const panel = $('gravitationParametersPanel');

    const compatible = [

      'Gravedad con la altura',

      'Rapidez orbital',

      'Período orbital',

      'Velocidad de escape'

    ].includes(z.topic) && z.k !== 'corr';

    panel.hidden = !compatible;

    if(!compatible) return;

    current = z;

    const target = {

      'Gravedad con la altura':'g',

      'Rapidez orbital':'v',

      'Período orbital':'T',

      'Velocidad de escape':'escape'

    }[z.topic];

    const data = z.gravitationParameters || {

      ...P.catalog.Tierra,

      name:'Tierra',

      h:400,

      m:500,

      target

    };

    $('gp_name').value = data.name;

    $('gp_mass').value = data.M;

    $('gp_radius').value = data.R;

    $('gp_height').value = data.h;

    $('gp_object').value = data.m;

    $('gp_target').value = data.target;

    const body = P.catalog[data.name];

    $('gp_planet').value =

      body &&

      body.M === data.M &&

      body.R === data.R

        ? data.name

        : 'custom';

    for(const option of $('gp_target').options){

      option.disabled =

        C.definitions[option.value].topic !== z.topic;

    }

    preview();

    if(!z.gravitationParameters){

      $('gp_result').textContent =

        'Valores iniciales de referencia. '+

        'Recalcular sustituirá el ejercicio original.';

    }

  }

  function apply(){

    if(!current) return;

    try{

      const z = C.create(read());

      if(z.topic !== current.topic){

        throw new Error(
          'La incógnita debe corresponder al tema original.'
        );

      }

      const count = current.options.length === 4

        ? 4 : 3;

      const options = window.STEMPhysicsBank.shuffle([

        z.r,

        ...z.options.filter(x=>x!==z.r)
          .slice(0,count-1)

      ]);

      const development = [

        'dev','exercise','problem','restricted'

      ].includes(current.k);

      $('e_q').value = z.q +

        (development

          ? ' Muestre el procedimiento correspondiente.'

          : '');

      $('e_r').value = z.r;

      $('e_s').value = z.s;

      $('e_options').value = options.join('\n');

      const points = Number($('e_p').value);

      if(

        development &&

        Number.isInteger(points) &&

        points>=1 && points<=10

      ){

        $('e_rubric').value =

          window.STEMGravitationRubrics

            .create(z.topic,points,z)

            .map(r=>r.p+' | '+r.label)

            .join('\n');

      }

      // Regenerar la figura con los datos actuales.

      const parameters = z.gravitationParameters;

      const calculated = P.calculate(parameters);

      const type = {

        g:'height',

        F:'height',

        v:'orbit',

        T:'orbit',

        escape:'escape'

      }[parameters.target];

      const figureData = {

        name:parameters.name,

        R:calculated.R,

        h:calculated.h

      };

      if(parameters.target==='F'){

        figureData.m = calculated.m;

      }

      const generatedFigure =

        window.STEMGravitationFigures.attach(

          z,type,figureData

        );

      openFigureManager(generatedFigure);

      $('e_image').value = '';

      $('e_remove').checked = false;

      $('gp_result').textContent =

        'Ejercicio recalculado. '+

        'Respuesta: '+z.r+

        '. Aplicá los cambios para guardar.';

      pending = {

        parameters:z.gravitationParameters,

        figureData:generatedFigure.gravitationData,

        q:$('e_q').value,

        r:$('e_r').value,

        s:$('e_s').value

      };

    }catch(error){

      alert(error.message);

    }

  }

  let pending = null;

  function prepare(z){

    pending = null;

    open(z);

  }

  function save(z){

    if(pending &&

       z.q === pending.q &&

       z.r === pending.r &&

       z.s === pending.s){

      z.gravitationParameters = {

        ...pending.parameters

      };

      if(pending.figureData){

        z.gravitationData = pending.figureData;

      }else{

        delete z.gravitationData;

      }

    }else if(

      current &&

      (

        z.q !== current.q ||

        z.r !== current.r ||

        z.s !== current.s

      )

    ){

      delete z.gravitationParameters;

      delete z.gravitationData;

    }

  }

  window.STEMGravitationEditor = Object.freeze({

    prepare,

    save

  });

  window.addEventListener('load',install);

})();
