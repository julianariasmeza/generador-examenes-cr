'use strict';

(() => {

  function create(type, data = {}) {

    const canvas = document.createElement('canvas');

    canvas.width = 900;
    canvas.height = 500;

    const ctx = canvas.getContext('2d');

    const fmt = n =>
      String(Number(n.toFixed(2))).replace('.', ',');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 900, 500);

    function line(x1, y1, x2, y2, color = '#334155', w = 4) {

      ctx.strokeStyle = color;
      ctx.lineWidth = w;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

    }

    function text(s, x, y, color = '#111827', size = 26) {

      ctx.fillStyle = color;
      ctx.font = `bold ${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s, x, y);

    }

    function block(x, y, w, h, label) {

      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, w, h);

      text(label, x+w/2, y+h/2);

    }

    function circle(x, y, r) {

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI*2);

      ctx.fillStyle = '#e2e8f0';
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.stroke();

    }

    function arrow(x, y, length, angle, label, color = '#15803d') {

      const rad = angle*Math.PI/180;

      const X = x + length*Math.cos(rad);
      const Y = y - length*Math.sin(rad);

      line(x, y, X, Y, color, 5);

      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.moveTo(X, Y);

      ctx.lineTo(
        X-18*Math.cos(rad-0.45),
        Y+18*Math.sin(rad-0.45)
      );

      ctx.lineTo(
        X-18*Math.cos(rad+0.45),
        Y+18*Math.sin(rad+0.45)
      );

      ctx.closePath();
      ctx.fill();

      if (label) {

        text(
          label,
          (x+X)/2,
          (y+Y)/2-25,
          color,
          24
        );

      }

    }

    function floor(x1, x2, y) {

      line(x1, y, x2, y, '#475569', 5);

      for (let x=x1+15; x<x2; x+=24) {
        line(x, y, x-12, y+14, '#94a3b8', 2);
      }

    }

    function mass(m) {
      return fmt(m) + ' kg';
    }

    function force(F) {
      return fmt(F) + ' N';
    }

    function friction(mu) {

      if (mu !== undefined) {
        text('μk = ' + fmt(mu), 450, 455);
      }

    }

    // BLOQUE SOBRE SUPERFICIE HORIZONTAL

    if (type === 'horizontal') {

      floor(65, 835, 350);

      block(350, 230, 200, 120, mass(data.m));

      if (data.F1 > 0) {
        arrow(550, 280, 210, 0, force(data.F1));
      }

      if (data.F2 > 0) {
        arrow(350, 280, 210, 180, force(data.F2), '#b91c1c');
      }

      friction(data.mu);

    }

    // FUERZA OBLICUA

    else if (type === 'multiple') {

      floor(65, 835, 350);

      block(350, 230, 200, 120, mass(data.m));

      arrow(550, 300, 220, 0, force(data.F1));

      arrow(350, 300, 220, 180,
            force(data.F2), '#b91c1c');

      arrow(550, 240, 230, data.angle,
            force(data.F), '#15803d');

      ctx.setLineDash([8,6]);
      line(550, 240, 800, 240, '#94a3b8', 2);
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(
        550, 240, 65,
        -data.angle*Math.PI/180, 0
      );
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      text(fmt(data.angle)+'°', 650, 215);

      friction(data.mu);

    }

    else if (type === 'oblique') {

      floor(65, 835, 350);

      block(300, 230, 200, 120, mass(data.m));

      const angle = data.angle;
      const sign = data.down ? -1 : 1;

      const y = data.down ? 180 : 250;

      ctx.setLineDash([10, 8]);

      if (!data.down) line(500, y, 800, y, '#94a3b8', 2);

      ctx.setLineDash([]);

      if (data.down) {

        const rad = angle*Math.PI/180;

        const startX = 300-160*Math.cos(rad);
        const startY = 250-160*Math.sin(rad);

        arrow(
          startX,
          startY,
          160,
          -angle,
          force(data.F)
        );

        ctx.setLineDash([8,6]);
        line(startX, startY, startX+140, startY,
             '#94a3b8', 2);
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(startX, startY, 45, 0, rad);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        text(fmt(angle)+'°', startX+75, startY+20);

      } else {

        arrow(500, y, 240, sign*angle, force(data.F));

        ctx.beginPath();
        ctx.arc(500, y, 70, -angle*Math.PI/180, 0);

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        text(fmt(angle)+'°', 610, y-22);

      }

      friction(data.mu);

    }

    // PLANO INCLINADO

    else if (type === 'incline') {

      const rad = data.angle*Math.PI/180;

      const length = Math.min(
        620,
        330/Math.sin(rad)
      );

      const x = 95;
      const y = 405;

      const X = x + length*Math.cos(rad);
      const Y = y - length*Math.sin(rad);

      ctx.fillStyle = '#e2e8f0';

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(X, Y);
      ctx.lineTo(X, y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.save();

      ctx.translate(x, y);
      ctx.rotate(-rad);

      const pos = length*0.32;

      block(pos, -90, 145, 90, mass(data.m));

      if (data.F > 0) {

        arrow(
          pos+145, -45, 115, 0,
          force(data.F)
        );

      }

      ctx.restore();

      ctx.beginPath();
      ctx.arc(x, y, 65, -rad, 0);

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      text(fmt(data.angle)+'°', x+100, y-20);

      friction(data.mu);

    }

    // MAQUINA DE ATWOOD

    else if (type === 'atwood') {

      line(300, 30, 600, 30);
      line(450, 30, 450, 110);

      circle(450, 110, 70);

      ctx.beginPath();
      ctx.arc(450, 110, 70, Math.PI, 2*Math.PI);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.stroke();

      line(380, 110, 380, 310);
      line(520, 110, 520, 240);

      block(305, 310, 150, 100, mass(data.m1));
      block(445, 240, 150, 100, mass(data.m2));

      text('m₁', 380, 435);
      text('m₂', 520, 365);

    }

    // MASA HORIZONTAL Y MASA COLGANTE

    else if (type === 'pulley') {

      const floorY = 240;

      const bx = 210;
      const bw = 180;
      const bh = 110;
      const by = floorY - bh;

      const ropeY = by + bh/2;

      const radius = 45;
      const px = 640;
      const py = ropeY + radius;

      const hangingX = px + radius;
      const hangingY = 330;
      const hangingW = 150;
      const hangingH = 100;

      // Superficie horizontal.
      floor(70, px - 20, floorY);

      // Soporte de la polea.
      line(px - 35, floorY, px, py,
           '#475569', 7);

      // Bloque horizontal.
      block(bx, by, bw, bh, mass(data.m1));

      // Polea.
      circle(px, py, radius);

      // Cuerda continua y tangente a la polea.
      ctx.beginPath();
      ctx.moveTo(bx + bw, ropeY);
      ctx.lineTo(px, ropeY);

      ctx.arc(
        px, py, radius,
        -Math.PI/2, 0
      );

      ctx.lineTo(hangingX, hangingY);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Eje central.
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, 2*Math.PI);
      ctx.fillStyle = '#475569';
      ctx.fill();

      // Masa suspendida.
      block(
        hangingX - hangingW/2,
        hangingY,
        hangingW,
        hangingH,
        mass(data.m2)
      );

      // Coeficiente de friccion.
      if (data.mu !== undefined) {
        text(
          'μₖ = ' + fmt(data.mu),
          450, 455
        );
      }

    }

    // FUERZAS VERTICALES

    else if (type === 'vertical') {

      block(350, 290, 200, 130, mass(data.m));

      if (data.F > 0) {

        arrow(
          450, 290, 190, 90,
          '', '#15803d'
        );

        text(force(data.F), 560, 180, '#15803d');

      }

    }

    else {

      throw new Error(
        'Tipo de figura desconocido: ' + type
      );

    }

    return canvas.toDataURL('image/png');

  }

  window.STEMDynamicsFigures = { create };

})();
