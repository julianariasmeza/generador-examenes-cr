'use strict';

(() => {

  const colors = {

    Mercurio: '#a6a6a6',
    Venus: '#d6b675',
    Tierra: '#5996c9',
    Marte: '#c47755',
    'Júpiter': '#c7a481',
    Saturno: '#d6bd85',
    Urano: '#8acbd1',
    Neptuno: '#5279c9',
    Luna: '#b5b5b5',
    'Plutón': '#b8a38e',
    Sol: '#edb948'

  };

  function create(type,data={}) {

    const canvas = document.createElement('canvas');

    canvas.width = 900;
    canvas.height = 500;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,900,500);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const A = window.STEMGravitation;

    const f = A.format;

    function text(value,x,y,size=25,color='#172033') {

      ctx.font = `600 ${size}px Arial`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillText(String(value),x,y);

    }

    function line(x1,y1,x2,y2,color='#334155',width=3,dash=[]) {

      ctx.beginPath();
      ctx.setLineDash(dash);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();
      ctx.setLineDash([]);

    }

    function circle(x,y,r,fill,stroke='#334155') {

      ctx.beginPath();
      ctx.arc(x,y,r,0,2*Math.PI);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 3;
      ctx.stroke();

    }

    function arrow(x1,y1,x2,y2,color='#b91c1c') {

      const angle = Math.atan2(y2-y1,x2-x1);

      line(x1,y1,x2,y2,color,4);

      line(
        x2,y2,
        x2-15*Math.cos(angle-Math.PI/6),
        y2-15*Math.sin(angle-Math.PI/6),
        color,4
      );

      line(
        x2,y2,
        x2-15*Math.cos(angle+Math.PI/6),
        y2-15*Math.sin(angle+Math.PI/6),
        color,4
      );

    }

    function dimension(x1,x2,y,label) {

      line(x1,y,x2,y);

      line(x1,y-10,x1,y+10);
      line(x2,y-10,x2,y+10);

      text(label,(x1+x2)/2,y+28,23);

    }

    function planet(x,y,r,name) {

      circle(
        x,y,r,
        colors[name] || '#87a9c9'
      );

      circle(x,y,4,'#ffffff','#ffffff');

    }

    function satellite(x,y) {

      ctx.fillStyle = '#64748b';
      ctx.fillRect(x-16,y-16,32,32);

      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(x-49,y-11,27,22);
      ctx.fillRect(x+22,y-11,27,22);

      line(x-22,y,x-16,y);
      line(x+16,y,x+22,y);

    }

    const name = data.name || 'Planeta';

    // INTERACCION ENTRE DOS MASAS

    if (type === 'interaction') {

      circle(185,205,95,'#9ac5eb');

      circle(715,205,75,'#cbd5e1');

      text('m₁',185,195,32);
      text('m₂',715,195,32);

      if (data.m1 !== undefined) {

        text(`${f(data.m1)} kg`,185,238,23);

      }

      if (data.m2 !== undefined) {

        text(`${f(data.m2)} kg`,715,238,23);

      }

      arrow(280,205,425,205);

      arrow(640,205,475,205);

      text('F₁₂',350,170,27,'#b91c1c');
      text('F₂₁',560,170,27,'#b91c1c');

      line(185,305,185,365);
      line(715,285,715,365);

      dimension(
        185,715,365,
        data.r === undefined
          ? 'r'
          : `r = ${f(data.r)} m`
      );

    }

    // GRAVEDAD CON LA ALTURA

    else if (type === 'height') {

      planet(235,225,135,name);

      text(name,235,390,29);

      satellite(735,225);

      line(235,225,735,225,'#334155',3,[8,6]);

      arrow(680,190,490,190);

      text('F gravitacional',585,158,25,'#b91c1c');

      line(235,240,235,310);
      line(370,240,370,310);
      line(735,250,735,310);

      dimension(235,370,310,'R');

      dimension(
        370,735,310,
        data.h === undefined
          ? 'h'
          : `h = ${f(data.h/1000)} km`
      );

      if (data.R !== undefined) {

        text(`R = ${f(data.R)} m`,235,435,24);

      }

      if (data.m !== undefined) {

        text(`m = ${f(data.m)} kg`,735,270,22);

      }

    }

    // ORBITA CIRCULAR

    else if (type === 'orbit') {

      const cx = 450;
      const cy = 245;

      const orbit = 175;

      ctx.beginPath();
      ctx.arc(cx,cy,orbit,0,2*Math.PI);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.setLineDash([10,8]);
      ctx.stroke();
      ctx.setLineDash([]);

      planet(cx,cy,90,name);

      text(name,cx,cy+30,24);

      satellite(cx+orbit,cy);

      line(
        cx,cy,cx+orbit,cy,
        '#334155',3,[7,5]
      );

      arrow(
        cx+orbit,cy-30,
        cx+orbit,cy-145,
        '#15803d'
      );

      text('v',cx+orbit+30,cy-130,30,'#15803d');

      text('r',cx+130,cy-20,26);

      if (data.r !== undefined) {

        text(`r = ${f(data.r)} m`,450,452,25);

      } else if (data.h !== undefined) {

        text(`h = ${f(data.h/1000)} km`,450,452,25);

      }

    }

    // VELOCIDAD DE ESCAPE

    else if (type === 'escape') {

      planet(270,280,145,name);

      text(name,270,335,28);

      const x = 390;
      const y = 195;

      satellite(x+55,y-30);

      line(270,280,x,y,'#334155',3,[7,5]);

      text('R',320,220,26);

      arrow(500,135,750,55,'#15803d');

      text('vₑ',645,62,30,'#15803d');

      if (data.R !== undefined) {

        text(`R = ${f(data.R)} m`,270,455,24);

      }

      if (data.h !== undefined) {

        text(`h = ${f(data.h/1000)} km`,670,340,25);

      }

    }

    else {

      throw new Error(
        'Tipo de figura desconocido: '+type
      );

    }

    text(
      'Representación esquemática — no a escala',
      450,485,16,'#64748b'
    );

    return canvas.toDataURL('image/png');

  }

  function attach(z,type,data) {

    const src = create(type,data);

    return {

      ...z,

      image:src,

      figures:[{

        src,

        width:65,

        align:'center',

        caption:''

      }],

      gravitationData:{

        type,

        data:{...data}

      }

    };

  }

  window.STEMGravitationFigures = Object.freeze({

    create,

    attach

  });

})();
