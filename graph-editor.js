'use strict';

(() => {

  const W = 720;
  const H = 520;

  const types = [
    ['linear', 'Función lineal'],
    ['quadratic', 'Función cuadrática'],
    ['cubic', 'Función cúbica'],
    ['exponential', 'Función exponencial'],
    ['logarithmic', 'Función logarítmica'],
    ['circle', 'Circunferencia'],
    ['triangle', 'Triángulo'],
    ['rectangle', 'Rectángulo'],
    ['polygon', 'Polígono regular']
  ];

  function install() {

    if (document.getElementById('graphDialog')) return;

    const imageInput = document.getElementById('e_image');

    if (!imageInput) return;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.textContent = '📐 Crear gráfica o figura';
    trigger.className = 'graph-trigger';

    imageInput.closest('label').after(trigger);

    const dialog = document.createElement('dialog');

    dialog.id = 'graphDialog';

    dialog.innerHTML = `
      <h2>Generador de gráficas y figuras</h2>

      <label>Tipo de figura
        <select id="graphType">
          ${types.map(([v,t]) =>
            `<option value="${v}">${t}</option>`
          ).join('')}
        </select>
      </label>

      <p id="graphFormula"></p>

      <div class="graph-parameters">
        <label><span id="graphLabelA">a</span>
          <input id="graphA" type="number"
                 value="1" step="any">
        </label>

        <label><span id="graphLabelB">b</span>
          <input id="graphB" type="number"
                 value="0" step="any">
        </label>

        <label><span id="graphLabelC">c</span>
          <input id="graphC" type="number"
                 value="-4" step="any">
        </label>

        <label>Escala
          <input id="graphScale" type="number"
                 value="10" min="1" max="100">
        </label>
      </div>

      <div class="graph-options">
        <label><input id="graphGrid"
          type="checkbox" checked> Cuadrícula</label>

        <label><input id="graphAxes"
          type="checkbox" checked> Ejes</label>

        <label><input id="graphLabels"
          type="checkbox" checked> Etiquetas</label>

        <label>Color
          <input id="graphColor" type="color"
                 value="#111111">
        </label>
      </div>

      <canvas id="graphCanvas"
              width="${W}" height="${H}"></canvas>

      <div class="dialog-actions">
        <button type="button" id="graphClose">
          Cancelar
        </button>

        <button type="button" id="graphDownload">
          Descargar PNG
        </button>

        <button type="button" id="graphInsert"
                class="primary">
          Insertar en pregunta
        </button>
      </div>
    `;

    document.body.append(dialog);

    const $ = id => document.getElementById(id);

    const canvas = $('graphCanvas');
    const ctx = canvas.getContext('2d');

    const formulas = {
      linear: 'f(x) = ax + b',
      quadratic: 'f(x) = ax² + bx + c',
      cubic: 'f(x) = ax³ + bx + c',
      exponential: 'f(x) = a·bˣ + c; b > 0, b ≠ 1',
      logarithmic: 'f(x) = a·logᵦ(x) + c; b > 0, b ≠ 1',
      circle: '(x − b)² + (y − c)² = a²',
      triangle: 'Triángulo: base a y altura b',
      rectangle: 'Rectángulo: base a y altura b',
      polygon: 'Polígono regular: a lados y radio b'
    };

    function draw() {

      const type = $('graphType').value;

      const a = Number($('graphA').value);
      const b = Number($('graphB').value);
      const c = Number($('graphC').value);

      const scale = Math.max(1,
        Math.min(100, Number($('graphScale').value) || 10));

      const color = $('graphColor').value;

      const unit = Math.min(W,H)/(2*scale);

      const X = x => W/2 + x*unit;
      const Y = y => H/2 - y*unit;

      const labels = $('graphLabels').checked;

      $('graphFormula').textContent = formulas[type];

      $('graphLabelA').textContent =
        type === 'circle' ? 'Radio' :
        type === 'polygon' ? 'Número de lados' :
        ['triangle','rectangle'].includes(type) ? 'Base' : 'a';

      $('graphLabelB').textContent =
        type === 'circle' ? 'Centro x' :
        type === 'polygon' ? 'Radio' :
        ['triangle','rectangle'].includes(type) ? 'Altura' : 'b';

      $('graphLabelC').textContent =
        type === 'circle' ? 'Centro y' : 'c';

      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0,0,W,H);

      function line(x1,y1,x2,y2,col,width=1) {
        ctx.beginPath();
        ctx.strokeStyle = col;
        ctx.lineWidth = width;
        ctx.moveTo(X(x1),Y(y1));
        ctx.lineTo(X(x2),Y(y2));
        ctx.stroke();
      }

      function text(t,x,y) {
        ctx.fillStyle = '#111111';
        ctx.font = '15px Arial';
        ctx.fillText(t,X(x),Y(y));
      }

      const xmax = W/(2*unit);
      const ymax = H/(2*unit);

      const step = scale > 30 ? 10 :
                   scale > 15 ? 5 : 1;

      if ($('graphGrid').checked) {

        for (let x=-Math.floor(xmax/step)*step;
             x<=xmax; x+=step) {

          line(x,-ymax,x,ymax,'#dddddd');

        }

        for (let y=-Math.floor(ymax/step)*step;
             y<=ymax; y+=step) {

          line(-xmax,y,xmax,y,'#dddddd');

        }

      }

      if ($('graphAxes').checked) {

        line(-xmax,0,xmax,0,'#111111',2);
        line(0,-ymax,0,ymax,'#111111',2);

        if (labels) {

          text('x',xmax-.6,.3);
          text('y',.3,ymax-.5);

          for (let i=step;i<ymax;i+=step) {

            text(String(i),.15,i);
            text(String(-i),.15,-i);

          }

          for (let i=step;i<xmax;i+=step) {

            text(String(i),i,-.55);
            text(String(-i),-i,-.55);

          }

        }

      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 3;

      if (type === 'circle') {

        ctx.beginPath();
        ctx.arc(X(b),Y(c),Math.abs(a)*unit,
                0,Math.PI*2);
        ctx.stroke();

        if (labels) {
          text('C',b+.15,c+.2);
          line(b,c,b+Math.abs(a),c,color,2);
          text('r',b+Math.abs(a)/2,c+.2);
        }

        return;

      }

      if (['triangle','rectangle','polygon'].includes(type)) {

        let vertices = [];

        const base = Math.abs(a);
        const height = Math.abs(b);

        if (type === 'triangle') {

          vertices = [
            [-base/2,-height/2],
            [base/2,-height/2],
            [0,height/2]
          ];

        } else if (type === 'rectangle') {

          vertices = [
            [-base/2,-height/2],
            [base/2,-height/2],
            [base/2,height/2],
            [-base/2,height/2]
          ];

        } else {

          const n = Math.max(3,
            Math.min(20,Math.round(a)));

          for(let i=0;i<n;i++) {

            const angle = Math.PI/2 + 2*Math.PI*i/n;

            vertices.push([
              height*Math.cos(angle),
              height*Math.sin(angle)
            ]);

          }

        }

        ctx.beginPath();

        vertices.forEach(([x,y],i) => {

          if(i===0) ctx.moveTo(X(x),Y(y));
          else ctx.lineTo(X(x),Y(y));

        });

        ctx.closePath();
        ctx.stroke();

        if(labels) {

          vertices.forEach(([x,y],i) => {

            text(String.fromCharCode(65+i),
                 x+.2,y+.2);

          });

        }

        return;

      }

      function f(x) {

        switch(type) {

          case 'linear':
            return a*x+b;

          case 'quadratic':
            return a*x*x+b*x+c;

          case 'cubic':
            return a*x*x*x+b*x+c;

          case 'exponential':
            return b>0 && b!==1 ?
              a*Math.pow(b,x)+c : NaN;

          case 'logarithmic':
            return x>0 && b>0 && b!==1 ?
              a*Math.log(x)/Math.log(b)+c : NaN;

          default:
            return NaN;

        }

      }

      ctx.beginPath();

      let active = false;

      for(let px=0;px<=W;px++) {

        const x = (px-W/2)/unit;
        const y = f(x);
        const py = Y(y);

        if(!Number.isFinite(py) ||
           py < -H || py > 2*H) {

          active = false;
          continue;

        }

        if(!active) ctx.moveTo(px,py);
        else ctx.lineTo(px,py);

        active = true;

      }

      ctx.stroke();

    }

    $('graphType').addEventListener('change', () => {

      const defaults = {
        linear: [1,2,0],
        quadratic: [1,0,-4],
        cubic: [1,-2,0],
        exponential: [1,2,0],
        logarithmic: [1,2,0],
        circle: [4,0,0],
        triangle: [8,6,0],
        rectangle: [8,5,0],
        polygon: [6,4,0]
      };

      const type = $('graphType').value;

      const [a,b,c] = defaults[type];

      $('graphA').value = a;
      $('graphB').value = b;
      $('graphC').value = c;

      const geometry =
        ['triangle','rectangle','polygon'].includes(type);

      $('graphGrid').checked = !geometry;
      $('graphAxes').checked = !geometry;

      draw();

    });

    dialog.querySelectorAll('input').forEach(input => {

      input.addEventListener('input',draw);

    });

    trigger.addEventListener('click', () => {

      dialog.showModal();
      draw();

    });

    $('graphClose').onclick = () => dialog.close();

    $('graphDownload').onclick = () => {

      const link = document.createElement('a');

      link.download = 'figura.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

    };

    $('graphInsert').onclick = () => {

      canvas.toBlob(blob => {

        if(!blob) return;

        const file = new File([blob],
          'figura-generada.png',
          {type:'image/png'});

        const dt = new DataTransfer();

        dt.items.add(file);
        imageInput.files = dt.files;

        imageInput.dispatchEvent(
          new Event('change',{bubbles:true})
        );

        document.getElementById('e_remove').checked = false;

        dialog.close();

      },'image/png');

    };

  }

  window.addEventListener('load',install);

})();
