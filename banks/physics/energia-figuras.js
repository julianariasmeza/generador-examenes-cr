'use strict';

(() => {

  const E = window.STEMEnergyBank;

  function create(type,data={}) {

    const canvas = document.createElement('canvas');

    canvas.width = 900;
    canvas.height = 500;

    const c = canvas.getContext('2d');

    const blue = '#1d4ed8';
    const red = '#dc2626';
    const green = '#15803d';
    const gray = '#64748b';

    c.fillStyle = '#ffffff';
    c.fillRect(0,0,900,500);

    function text(s,x,y,color='#111827',size=25) {

      c.fillStyle = color;
      c.font = `bold ${size}px Arial`;
      c.textAlign = 'center';
      c.fillText(String(s),x,y);

    }

    function line(x1,y1,x2,y2,color='#111827',width=3) {

      c.beginPath();
      c.strokeStyle = color;
      c.lineWidth = width;
      c.moveTo(x1,y1);
      c.lineTo(x2,y2);
      c.stroke();

    }

    function arrow(x1,y1,x2,y2,color=red) {

      line(x1,y1,x2,y2,color,5);

      const a = Math.atan2(y2-y1,x2-x1);

      const length = 18;

      line(
        x2,y2,
        x2-length*Math.cos(a-0.45),
        y2-length*Math.sin(a-0.45),
        color,5
      );

      line(
        x2,y2,
        x2-length*Math.cos(a+0.45),
        y2-length*Math.sin(a+0.45),
        color,5
      );

    }

    function block(x,y,w=130,h=90,label='m') {

      c.fillStyle = '#dbeafe';
      c.fillRect(x,y,w,h);

      c.strokeStyle = blue;
      c.lineWidth = 3;
      c.strokeRect(x,y,w,h);

      text(label,x+w/2,y+h/2+8,blue,23);

    }

    function circle(x,y,r=22) {

      c.beginPath();
      c.arc(x,y,r,0,2*Math.PI);
      c.fillStyle = '#dbeafe';
      c.fill();

      c.strokeStyle = blue;
      c.lineWidth = 3;
      c.stroke();

    }

    function floor(x1,x2,y,rough=false) {

      line(x1,y,x2,y);

      if (rough) {

        for(let x=x1+15;x<x2;x+=22) {

          line(x,y,x-12,y+15,gray,2);

        }

      }

    }

    function dimension(x1,y1,x2,y2,label) {

      line(x1,y1,x2,y2,gray,2);

      const a = Math.atan2(y2-y1,x2-x1)
        + Math.PI/2;

      const dx = 9*Math.cos(a);
      const dy = 9*Math.sin(a);

      line(x1-dx,y1-dy,x1+dx,y1+dy,gray,2);
      line(x2-dx,y2-dy,x2+dx,y2+dy,gray,2);

      text(
        label,
        (x1+x2)/2+30*Math.cos(a),
        (y1+y2)/2+30*Math.sin(a),
        '#111827',
        22
      );

    }

    function spring(x1,x2,y) {

      const n = 12;
      const step = (x2-x1)/n;

      c.beginPath();
      c.strokeStyle = gray;
      c.lineWidth = 4;

      c.moveTo(x1,y);

      for(let i=1;i<n;i++) {

        c.lineTo(
          x1+i*step,
          y+(i%2===0?22:-22)
        );

      }

      c.lineTo(x2,y);
      c.stroke();

    }

    const label = (key,unit,symbol) =>

      data[key] === undefined
        ? symbol
        : `${symbol} = ${E.f(data[key])} ${unit}`.trim();

    const mass = data.m === undefined
      ? 'm'
      : `${E.f(data.m)} kg`;

    // ======================================
    // TRABAJO HORIZONTAL Y OBLICUO
    // ======================================

    if(type === 'work') {

      const angle = data.angle ?? 0;

      const a = E.radians(angle);

      floor(
        70,830,330,
        data.mu!==undefined || data.fk!==undefined
      );

      block(365,240,150,90,mass);

      const cx = 440;
      const cy = 285;

      const length = 180;

      const ex = cx+length*Math.cos(a);
      const ey = cy-length*Math.sin(a);

      const hasForce =
        data.F!==undefined ||
        data.showForce===true ||
        data.angle!==undefined;

      if(hasForce){

        arrow(cx,cy,ex,ey,red);

      text(
        label('F','N','F'),
        ex,
        ey-20,
        red
      );

      if(angle!==0) {

        c.setLineDash([8,6]);
        line(cx,cy,cx+190,cy,gray,2);
        c.setLineDash([]);

        c.beginPath();
        c.strokeStyle = gray;
        c.lineWidth = 2;
        c.arc(cx,cy,95,-a,0);
        c.stroke();

        text(
          `${angle}°`,
          cx+120*Math.cos(a/2),
          cy-120*Math.sin(a/2),
          gray,
          22
        );

      }

      }

      if(data.mu!==undefined || data.fk!==undefined) {

        arrow(365,285,170,285,red);

        text(
          label('fk','N','fₖ'),
          260,260,red
        );

      }

      arrow(320,405,580,405,green);

      text(label('d','m','d'),450,450,green);

      if(data.mu!==undefined) {

        text(`μₖ = ${E.f(data.mu)}`,740,380);

      }

    }

    // ======================================
    // ELEVACION VERTICAL
    // ======================================

    else if(type === 'friction') {

      floor(70,830,330,true);

      block(365,240,150,90,mass);

      if(data.mu>0){

        arrow(365,285,170,285,red);

        text('fₖ',260,255,red);

      }

      arrow(320,405,580,405,green);

      text(label('d','m','d'),450,450,green);

      text(label('mu','','μₖ'),720,380);

      if(data.v!==undefined){

        arrow(365,170,565,170,blue);

        text(label('v','m/s','vᵢ'),465,140,blue);

      }

    }

    else if(type === 'potential') {

      const positive = data.h>=0;

      const refY = positive ? 380 : 120;

      const objectY = data.h===0
        ? refY
        : positive ? 130 : 370;

      c.setLineDash([8,6]);

      line(100,refY,800,refY,gray,3);

      c.setLineDash([]);

      circle(450,objectY,30);

      text(mass,450,objectY-48,blue);

      text(
        'Nivel de referencia',
        650,refY-15,gray,22
      );

      if(data.h!==0){

        dimension(
          210,refY,210,objectY,
          label('h','m','h')
        );

      }else{

        text('h = 0 m',250,refY+40);

      }

    }

    else if(type === 'elastic') {

      line(800,80,800,390,gray,8);

      spring(220,800,155);

      const x2 = data.x===0 ? 220 : 420;

      spring(x2,800,315);

      text('Resorte sin deformar',510,100);

      text('Resorte deformado',510,260);

      text(label('k','N/m','k'),510,215,blue);

      c.setLineDash([8,6]);

      line(220,180,220,420,gray,2);

      line(x2,340,x2,420,gray,2);

      c.setLineDash([]);

      if(data.x!==0){

        dimension(
          220,405,x2,405,
          label('x','m','x')
        );

      }else{

        text('x = 0 m',220,445);

      }

    }

    else if(type === 'conservation') {

      const hi = data.hi;

      const hf = data.hf;

      const min = Math.min(0,hi,hf);

      const max = Math.max(0,hi,hf);

      const range = max-min || 1;

      const y = value =>
        365-245*(value-min)/range;

      const yi = y(hi);

      const yf = y(hf);

      const ref = y(0);

      c.setLineDash([8,6]);

      line(80,ref,820,ref,gray,2);

      c.setLineDash([]);

      text('Nivel de referencia',450,ref+30,gray,19);

      circle(300,yi,25);

      circle(600,yf,25);

      text('Inicial',300,yi-42,blue,22);

      text('Final',600,yf-42,blue,22);

      text(mass,300,yi+50,blue,20);

      text(mass,600,yf+50,blue,20);

      if(hi!==0){

        dimension(
          160,ref,160,yi,
          label('hi','m','hᵢ')
        );

      }else{

        text('hᵢ = 0 m',160,ref+60);

      }

      if(hf!==0){

        dimension(
          740,yf,740,ref,
          label('hf','m','hꜰ')
        );

      }else{

        text('hꜰ = 0 m',740,ref+60);

      }

      text(
        label('vi','m/s','vᵢ'),
        300,455,green,22
      );

    }

    else if(type === 'lift') {

      line(100,420,800,420);

      line(200,60,200,420,gray,8);
      line(200,60,650,60,gray,8);

      line(500,60,500,170);

      block(430,170,140,100,mass);

      arrow(500,170,500,90,green);

      dimension(
        690,270,690,420,
        label('h','m','h')
      );

      if(data.t!==undefined) {

        text(label('t','s','t'),320,460);

      }

    }

    // ======================================
    // CAIDA LIBRE
    // ======================================

    else if(type === 'fall') {

      floor(80,820,425);

      c.setLineDash([8,6]);

      line(350,70,350,400,gray,2);

      c.setLineDash([]);

      circle(350,70);

      text('Posición inicial',540,78);

      if(data.hf>0 && data.hf<data.h) {

        const y = 235;

        circle(350,y);

        text('Posición intermedia',570,y+8);

        dimension(
          720,y,720,400,
          label('hf','m','hꜰ')
        );

      }

      circle(350,400);

      text('Nivel de referencia',560,408);

      dimension(
        150,70,150,400,
        label('h','m','h')
      );

      if(data.m!==undefined) {

        text(mass,350,32,blue);

      }

    }

    // ======================================
    // PLANO INCLINADO
    // ======================================

    else if(type === 'ramp') {

      const angle = data.angle ?? 35;

      const a = E.radians(angle);

      const length = Math.min(
        560/Math.cos(a),
        300/Math.sin(a)
      );

      const dx = length*Math.cos(a);
      const dy = length*Math.sin(a);

      const x1 = 150;
      const y2 = 380;
      const y1 = y2-dy;
      const x2 = x1+dx;

      c.beginPath();

      c.moveTo(x1,y1);
      c.lineTo(x2,y2);
      c.lineTo(x1,y2);
      c.closePath();

      c.fillStyle = '#f1f5f9';
      c.fill();

      c.strokeStyle = gray;
      c.lineWidth = 3;
      c.stroke();

      c.save();

      c.translate(
        x1+dx*0.18,
        y1+dy*0.18
      );

      c.rotate(a);

      block(-55,-75,110,75,mass);

      c.restore();

      dimension(
        95,y1,95,y2,
        label('h','m','h')
      );

      if(data.L!==undefined) {

        text(
          label('L','m','L'),
          x1+dx*0.65,
          y1+dy*0.65-45
        );

      }

      if(data.angle!==undefined) {

        text(`${angle}°`,x2-60,y2-15);

      }

      text(
        data.mu===undefined
          ? 'Sin rozamiento'
          : `μₖ = ${E.f(data.mu)}`,
        450,450
      );

    }

    // ======================================
    // PENDULO
    // ======================================

    else if(type === 'pendulum') {

      const px = 450;
      const py = 65;

      const radius = 300;
      const angle = Math.PI/3;

      const x = px-radius*Math.sin(angle);
      const y = py+radius*Math.cos(angle);

      line(300,py,600,py,gray,7);

      line(px,py,x,y,blue,4);

      c.setLineDash([8,6]);

      line(px,py,px,py+radius,gray,2);

      c.beginPath();
      c.arc(px,py,radius,Math.PI/2,Math.PI/2+angle);
      c.strokeStyle = gray;
      c.stroke();

      c.setLineDash([]);

      circle(x,y,28);
      circle(px,py+radius,28);

      text(mass,x,y-45,blue);

      dimension(
        115,py+radius,115,y,
        label('h','m','h')
      );

      arrow(px+30,py+radius,px+200,py+radius,green);

      text('v',px+120,py+radius-20,green);

    }

    // ======================================
    // RESORTE
    // ======================================

    else if(type === 'spring') {

      floor(60,840,340,data.mu!==undefined);

      line(800,130,800,340,gray,8);

      block(260,240,140,100,mass);

      spring(400,800,290);

      text(label('k','N/m','k'),600,205);

      if(data.v!==undefined) {

        arrow(260,180,440,180,green);

        text(label('v','m/s','v'),350,155,green);

      }

      if(data.x!==undefined) {

        c.setLineDash([7,5]);
        line(260,230,260,410,gray,2);
        line(160,230,160,410,gray,2);
        c.setLineDash([]);

        dimension(
          160,390,260,390,
          label('x','m','x')
        );

        text('Referencia sin deformar',180,210,gray,19);

      }

      if(data.mu!==undefined) {

        text(`μₖ = ${E.f(data.mu)}`,650,400);

      }

    }

    // ======================================
    // SISTEMA DE VARIAS ETAPAS
    // ======================================

    else if(type === 'stages') {

      c.beginPath();
      c.moveTo(80,100);
      c.lineTo(330,350);
      c.lineTo(80,350);
      c.closePath();

      c.fillStyle = '#f1f5f9';
      c.fill();

      c.strokeStyle = gray;
      c.lineWidth = 3;
      c.stroke();

      c.save();
      c.translate(130,150);
      c.rotate(Math.PI/4);
      block(-45,-65,90,65,mass);
      c.restore();

      const hasSpring = data.k!==undefined;

      floor(330,hasSpring?570:840,350,true);

      dimension(
        65,350,65,100,
        label('h','m','h')
      );

      text('Sin rozamiento',190,330,gray,20);

      text(
        label('mu','','μₖ'),
        hasSpring?450:580,
        310
      );

      if(data.d!==undefined) {

        dimension(
          330,405,
          hasSpring?570:840,405,
          label('d','m','d')
        );

      }

      if(hasSpring) {

        floor(570,850,350);

        line(850,190,850,350,gray,6);

        block(590,275,85,75,'m');

        spring(675,850,312);

        text(label('k','N/m','k'),750,240);

        text('Sin rozamiento',710,445,gray,19);

      }

    }

    // ======================================
    // EFICIENCIA
    // ======================================

    else if(type === 'efficiency') {

      block(330,150,240,170,'Máquina');

      arrow(70,235,330,235,gray);
      arrow(570,235,830,235,green);
      arrow(450,320,450,420,red);

      text(
        label('input','J','Entrada'),
        195,200,gray,22
      );

      text(
        label('useful','J','Útil'),
        705,200,green,22
      );

      text(
        label('loss','J','Pérdidas'),
        450,455,red,22
      );

      if(data.eta!==undefined) {

        text(`η = ${E.f(data.eta)} %`,450,105);

      }

    }

    else {

      throw new Error(
        'Tipo de figura de energia desconocido: '+type
      );

    }

    text(
      'Esquema ilustrativo — no está a escala',
      450,487,gray,17
    );

    return canvas.toDataURL('image/png');

  }

  function attach(z,type,data={}) {

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

      energyData:{

        type,

        data:{...data}

      }

    };

  }

  window.STEMEnergyFigures = Object.freeze({

    create,
    attach

  });

})();
