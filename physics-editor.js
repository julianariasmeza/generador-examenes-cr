'use strict';

(() => {

  const specs = {
    dcl: ['Diagrama de cuerpo libre', [
      ['Masa (kg)', 5, 0],
      ['Normal (N)', 49, 0],
      ['Fuerza aplicada (N)', 30, 0],
      ['Fricción (N)', 10, 0],
      ['Tensión (N)', 0, 0],
      ['Ángulo de tensión (°)', 45, -180, 180]
    ]],
    incline: ['Plano inclinado', [
      ['Ángulo (°)', 30, 5, 65],
      ['Masa (kg)', 5, 0],
      ['Normal (N)', 42.44, 0],
      ['Fricción hacia arriba (N)', 10, 0]
    ]],
    vector: ['Vector y componentes', [
      ['Magnitud', 10, 0],
      ['Ángulo (°)', 40, -360, 360]
    ]],
    pulley: ['Máquina de Atwood', [
      ['Masa 1 (kg)', 5, 0],
      ['Masa 2 (kg)', 3, 0]
    ]],
    series: ['Circuito en serie', [
      ['Voltaje (V)', 12, 0],
      ['R₁ (Ω)', 4, 0.01],
      ['R₂ (Ω)', 6, 0.01],
      ['R₃ (Ω)', 8, 0.01]
    ]],
    parallel: ['Circuito en paralelo', [
      ['Voltaje (V)', 12, 0],
      ['R₁ (Ω)', 4, 0.01],
      ['R₂ (Ω)', 6, 0.01],
      ['R₃ (Ω)', 8, 0.01]
    ]],
    mixed: ['Circuito mixto', [
      ['Voltaje (V)', 12, 0],
      ['R₁ (Ω)', 4, 0.01],
      ['R₂ (Ω)', 6, 0.01],
      ['R₃ (Ω)', 8, 0.01]
    ]],
    beam: ['Viga simplemente apoyada', [
      ['Longitud (m)', 6, 0.01],
      ['Posición de F (%)', 50, 0, 100],
      ['Carga F (N)', 200, 0]
    ]]
  };

  function install() {

    const image = document.getElementById('e_image');

    if (!image || document.getElementById('physicsDialog')) return;

    const trigger = document.createElement('button');

    trigger.type = 'button';
    trigger.className = 'graph-trigger';
    trigger.textContent = '⚛ Crear diagrama de física';

    image.closest('label').after(trigger);

    const d = document.createElement('dialog');

    d.id = 'physicsDialog';

    d.innerHTML = `
      <h2>Editor de diagramas de física</h2>

      <label>Tipo de diagrama
        <select id="physicsType">
          ${Object.entries(specs).map(([k,v]) =>
            `<option value="${k}">${v[0]}</option>`
          ).join('')}
        </select>
      </label>

      <div id="physicsParams"></div>

      <div class="physics-options">
        <label>
          <input type="checkbox" id="physicsValues" checked>
          Mostrar valores numéricos
        </label>

        <label>
          <input type="checkbox" id="physicsMono" checked>
          Blanco y negro
        </label>
      </div>

      <p id="physicsNote" role="status"></p>

      <canvas id="physicsCanvas"
        width="1440" height="960"></canvas>

      <div class="dialog-actions">
        <button type="button" id="physicsClose">
          Cancelar
        </button>

        <button type="button" id="physicsDownload">
          Descargar PNG
        </button>

        <button type="button" id="physicsInsert"
          class="primary">
          Insertar en pregunta
        </button>
      </div>
    `;

    document.body.append(d);

    const $ = id => document.getElementById(id);

    const canvas = $('physicsCanvas');
    const ctx = canvas.getContext('2d');

    const fmt = n => Number(n.toFixed(2))
      .toLocaleString('es-CR', {
        maximumFractionDigits: 2,
        useGrouping: false
      });

    function params() {

      $('physicsParams').innerHTML =
        specs[$('physicsType').value][1]
          .map(([label,v,min,max],i) => `
            <label>${label}
              <input type="number"
                step="any"
                value="${v}"
                min="${min}"
                ${max === undefined ? '' : `max="${max}"`}
                data-p="${i}">
            </label>
          `).join('');

      draw();
    }

    function draw() {

      const type = $('physicsType').value;

      const inputs = [
        ...$('physicsParams').querySelectorAll('input')
      ];

      const valid = inputs.every(i =>
        i.value !== '' &&
        i.checkValidity() &&
        Number.isFinite(i.valueAsNumber)
      );

      $('physicsInsert').disabled = !valid;
      $('physicsDownload').disabled = !valid;

      ctx.setTransform(2,0,0,2,0,0);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,720,480);

      if (!valid) {
        $('physicsNote').textContent =
          'Revisá los valores ingresados.';
        return;
      }

      const a = inputs.map(i => i.valueAsNumber);
      const values = $('physicsValues').checked;

      const ink = '#172033';

      const accent = $('physicsMono').checked
        ? ink : '#1654a3';

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      function line(x,y,X,Y,col=ink,w=2) {
        ctx.beginPath();
        ctx.strokeStyle = col;
        ctx.lineWidth = w;
        ctx.moveTo(x,y);
        ctx.lineTo(X,Y);
        ctx.stroke();
      }

      function text(t,x,y,align='center') {
        ctx.fillStyle = ink;
        ctx.font = '19px Arial';
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';
        ctx.fillText(t,x,y);
      }

      function rect(x,y,w,h) {
        ctx.fillStyle = '#edf0f4';
        ctx.fillRect(x,y,w,h);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(x,y,w,h);
      }

      function circle(x,y,r) {
        ctx.beginPath();
        ctx.arc(x,y,r,0,Math.PI*2);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      function arrow(x,y,X,Y,label,dx=0,dy=-16) {

        const t = Math.atan2(Y-y,X-x);

        line(x,y,X,Y,accent,3);

        line(
          X,Y,
          X-12*Math.cos(t-.45),
          Y-12*Math.sin(t-.45),
          accent,3
        );

        line(
          X,Y,
          X-12*Math.cos(t+.45),
          Y-12*Math.sin(t+.45),
          accent,3
        );

        if(label) text(label,X+dx,Y+dy);
      }

      function val(s,n,u) {
        return values
          ? `${s} = ${fmt(n)} ${u}`
          : s;
      }

      $('physicsNote').textContent =
        'Esquema didáctico. Las fuerzas no están a escala.';

      // DIAGRAMA DE CUERPO LIBRE

      if(type === 'dcl') {

        rect(315,190,90,70);

        text(val('m',a[0],'kg'),360,225);

        if(a[0]) arrow(
          360,260,360,395,
          val('P',a[0]*9.8,'N'),65,0
        );

        if(a[1]) arrow(
          360,190,360,65,
          val('N',a[1],'N'),65,0
        );

        if(a[2]) arrow(
          405,225,600,225,
          val('F',a[2],'N')
        );

        if(a[3]) arrow(
          315,225,120,225,
          val('f',a[3],'N')
        );

        if(a[4]) {

          const t = a[5]*Math.PI/180;

          arrow(
            360,225,
            360+145*Math.cos(t),
            225-145*Math.sin(t),
            val('T',a[4],'N')
          );
        }
      }

      // PLANO INCLINADO

      if(type === 'incline') {

        const t = a[0]*Math.PI/180;

        const L = Math.min(
          460,300/Math.sin(t)
        );

        const x=100, y=400;

        const X=x+L*Math.cos(t);
        const Y=y-L*Math.sin(t);

        line(x,y,X,Y);
        line(X,Y,X,y);
        line(x,y,X,y);

        text(`${fmt(a[0])}°`,x+65,y-12);

        const bx=(x+X)/2;
        const by=(y+Y)/2;

        ctx.save();
        ctx.translate(bx,by);
        ctx.rotate(-t);

        rect(-42,-65,84,65);
        text(val('m',a[1],'kg'),0,-32);

        ctx.restore();

        const px=bx-32*Math.sin(t);
        const py=by-32*Math.cos(t);

        if(a[1]) arrow(
          px,py,px,py+115,
          val('P',a[1]*9.8,'N'),65,0
        );

        if(a[2]) arrow(
          px,py,
          px-105*Math.sin(t),
          py-105*Math.cos(t),
          val('N',a[2],'N'),0,-18
        );

        if(a[3]) arrow(
          px,py,
          px+115*Math.cos(t),
          py-115*Math.sin(t),
          val('f',a[3],'N'),35,-15
        );
      }

      // VECTORES

      if(type === 'vector') {

        const x=360,y=240;
        const t=a[1]*Math.PI/180;

        const dx=a[0] ? 150*Math.cos(t) : 0;
        const dy=a[0] ? -150*Math.sin(t) : 0;

        arrow(65,y,655,y,'x',0,18);
        arrow(x,435,x,40,'y',18,0);

        ctx.setLineDash([5,5]);

        line(x+dx,y,x+dx,y+dy);
        line(x,y+dy,x+dx,y+dy);

        ctx.setLineDash([]);

        if(a[0]) arrow(
          x,y,x+dx,y+dy,
          val('A',a[0],''),0,-20
        );

        text(
          values ? 'Aₓ = '+fmt(a[0]*Math.cos(t)) : 'Aₓ',
          x+dx/2,y+25
        );

        text(
          values ? 'Aᵧ = '+fmt(a[0]*Math.sin(t)) : 'Aᵧ',
          x-65,y+dy/2
        );

        text(`θ = ${fmt(a[1])}°`,360,455);

        $('physicsNote').textContent =
          'Componentes calculadas a partir de magnitud y ángulo.';
      }

      // MÁQUINA DE ATWOOD

      if(type === 'pulley') {

        line(260,40,460,40);
        line(360,40,360,100);

        circle(360,150,50);

        line(310,150,310,325);
        line(410,150,410,265);

        rect(260,325,100,65);
        rect(360,265,100,65);

        text(val('m₁',a[0],'kg'),310,358);
        text(val('m₂',a[1],'kg'),410,298);
      }

      // COMPONENTES ELÉCTRICOS

      function resistor(x,y,X,Y,label) {

        const mx=(x+X)/2;
        const my=(y+Y)/2;

        if(y===Y) {

          line(x,y,mx-34,y);
          rect(mx-34,y-13,68,26);
          line(mx+34,y,X,Y);

          text(label,mx,y-30);

        } else {

          line(x,y,x,my-34);
          rect(x-13,my-34,26,68);
          line(x,my+34,X,Y);

          text(label,x+22,my,'left');
        }
      }

      function battery(y) {

        line(80,90,80,y-10);

        line(55,y-10,105,y-10);
        line(65,y+10,95,y+10);

        line(80,y+10,80,390);

        text(val('V',a[0],'V'),115,y+36,'left');
        text('+',48,y-24);
      }

      // CIRCUITOS ELÉCTRICOS

      if(['series','parallel','mixed'].includes(type)) {

        battery(240);

        line(80,390,550,390);

        if(type==='series') {

          line(80,90,140,90);

          resistor(140,90,270,90,val('R₁',a[1],'Ω'));
          resistor(270,90,410,90,val('R₂',a[2],'Ω'));
          resistor(410,90,550,90,val('R₃',a[3],'Ω'));

          line(550,90,550,390);

        } else if(type==='parallel') {

          line(80,90,550,90);

          [240,395,550].forEach((x,i) => {

            resistor(
              x,90,x,390,
              val(['R₁','R₂','R₃'][i],a[i+1],'Ω')
            );
          });

        } else {

          resistor(80,90,330,90,val('R₁',a[1],'Ω'));

          line(330,90,550,90);

          resistor(330,90,330,390,val('R₂',a[2],'Ω'));
          resistor(550,90,550,390,val('R₃',a[3],'Ω'));
        }

        $('physicsNote').textContent =
          'Circuito esquemático de corriente continua.';
      }

      // VIGAS Y ESTÁTICA

      if(type==='beam') {

        const left=100;
        const right=620;
        const y=220;

        rect(left,y,right-left,20);

        function support(x,roller) {

          line(x,y+20,x-25,y+60);
          line(x-25,y+60,x+25,y+60);
          line(x+25,y+60,x,y+20);

          if(roller) {
            circle(x-13,y+68,7);
            circle(x+13,y+68,7);
          }

          const base=y+(roller?78:60);

          line(x-35,base,x+35,base);

          for(let i=-30;i<=30;i+=10) {
            line(x+i,base,x+i-8,base+10);
          }
        }

        support(left,false);
        support(right,true);

        text('A',left-35,y+40);
        text('B',right+35,y+40);

        const px=left+(right-left)*a[1]/100;

        if(a[2]) arrow(
          px,75,px,y,
          '',0,0
        );

        text(val('F',a[2],'N'),px,55);

        line(left,340,right,340);
        line(left,330,left,350);
        line(right,330,right,350);

        text(val('L',a[0],'m'),360,365);

        line(left,400,px,400);
        line(left,390,left,410);
        line(px,390,px,410);

        text(
          val('d',a[0]*a[1]/100,'m'),
          (left+px)/2,425
        );
      }
    }

    $('physicsType').onchange = params;

    d.addEventListener('input',draw);

    trigger.onclick = () => {
      d.showModal();
      params();
    };

    $('physicsClose').onclick = () => d.close();

    $('physicsDownload').onclick = () => {

      const link = document.createElement('a');

      link.download = 'diagrama-fisica.png';
      link.href = canvas.toDataURL('image/png');

      link.click();
    };

    $('physicsInsert').onclick = () => {

      canvas.toBlob(blob => {

        if(!blob) return;

        try {

          const file = new File(
            [blob],
            'diagrama-fisica.png',
            {type:'image/png'}
          );

          const dt = new DataTransfer();

          dt.items.add(file);

          image.files = dt.files;

          image.dispatchEvent(
            new Event('change',{bubbles:true})
          );

          $('e_remove').checked = false;

          d.close();

        } catch(error) {

          alert(
            'No se pudo insertar la figura. ' +
            'Descargá el PNG y adjuntalo manualmente.'
          );
        }

      },'image/png');
    };

    params();
  }

  window.addEventListener('load',install);

})();
