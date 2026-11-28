'use strict';

(() => {

  function create(points, config = {}) {

    const canvas = document.createElement('canvas');

    canvas.width = 900;
    canvas.height = 540;

    const ctx = canvas.getContext('2d');

    const W = canvas.width;
    const H = canvas.height;

    const left = 100;
    const right = W - 65;
    const top = 55;
    const bottom = H - 85;

    const xmax = config.xmax ||
      Math.max(...points.map(p => p[0]));

    const ymin = config.ymin ??
      Math.min(0, ...points.map(p => p[1]));

    const ymax = config.ymax ??
      Math.max(1, ...points.map(p => p[1]));

    const xstep = config.xstep || 1;
    const ystep = config.ystep || 5;

    const X = x =>
      left + x / xmax * (right - left);

    const Y = y =>
      bottom - (y - ymin) /
      (ymax - ymin) * (bottom - top);

    const fmt = n =>
      String(Number(n.toFixed(2))).replace('.', ',');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    ctx.font = '22px Arial';
    ctx.lineWidth = 1;

    // Cuadricula vertical

    for (let x = 0; x <= xmax; x += xstep) {

      ctx.strokeStyle = '#d1d5db';

      ctx.beginPath();
      ctx.moveTo(X(x), top);
      ctx.lineTo(X(x), bottom);
      ctx.stroke();

      ctx.fillStyle = '#111827';
      ctx.textAlign = 'center';

      ctx.fillText(fmt(x), X(x), bottom + 30);
    }

    // Cuadricula horizontal

    for (let y = ymin; y <= ymax; y += ystep) {

      ctx.strokeStyle = '#d1d5db';

      ctx.beginPath();
      ctx.moveTo(left, Y(y));
      ctx.lineTo(right, Y(y));
      ctx.stroke();

      ctx.fillStyle = '#111827';
      ctx.textAlign = 'right';

      ctx.fillText(fmt(y), left - 15, Y(y) + 7);
    }

    // Ejes

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(left, top - 15);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right + 15, bottom);
    ctx.stroke();

    if (ymin < 0 && ymax > 0) {

      ctx.beginPath();
      ctx.moveTo(left, Y(0));
      ctx.lineTo(right, Y(0));
      ctx.stroke();
    }

    // Etiquetas

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 24px Arial';

    ctx.textAlign = 'left';
    ctx.fillText(config.ylabel || 'x (m)', 20, 32);

    ctx.textAlign = 'right';
    ctx.fillText(config.xlabel || 't (s)', right, H - 15);

    // Curva

    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';

    ctx.beginPath();

    points.forEach(([x, y], i) => {

      if (i === 0) {
        ctx.moveTo(X(x), Y(y));
      } else {
        ctx.lineTo(X(x), Y(y));
      }

    });

    ctx.stroke();

    // Puntos

    ctx.fillStyle = '#1d4ed8';

    points.forEach(([x, y]) => {

      ctx.beginPath();
      ctx.arc(X(x), Y(y), 6, 0, Math.PI * 2);
      ctx.fill();

    });

    return canvas.toDataURL('image/png');

  }

  window.STEMPhysicsGraphs = { create };

})();
