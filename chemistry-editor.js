'use strict';

/* Exam STEM CR 2.7
   Editor molecular Ketcher */

(() => {

  function install() {

    const image = document.getElementById('e_image');

    if (!image || document.getElementById('chemistryDialog')) return;

    const trigger = document.createElement('button');

    trigger.type = 'button';
    trigger.className = 'graph-trigger';
    trigger.id = 'chemistryTrigger';
    trigger.textContent = '⚗ Crear estructura química';

    image.closest('label').after(trigger);

    const d = document.createElement('dialog');

    d.id = 'chemistryDialog';

    d.innerHTML = `
      <div class="chemistry-heading">
        <h2>Editor de estructuras químicas</h2>
        <span>Ketcher 3.21.0</span>
      </div>

      <div class="chemistry-import">

        <label>Molécula de ejemplo
          <select id="chemistryTemplate">
            <option value="">Seleccionar...</option>
            <option value="C">Metano</option>
            <option value="CC">Etano</option>
            <option value="C=C">Eteno</option>
            <option value="C#C">Etino</option>
            <option value="CCC">Propano</option>
            <option value="CCO">Etanol</option>
            <option value="CC(=O)O">Ácido acético</option>
            <option value="CC(=O)C">Acetona</option>
            <option value="c1ccccc1">Benceno</option>
            <option value="Oc1ccccc1">Fenol</option>
            <option value="C1CCCCC1">Ciclohexano</option>
            <option value="CC(C)C">2-metilpropano</option>
            <option value="O=C=O">Dióxido de carbono</option>
          </select>
        </label>

        <label>Código SMILES (opcional)
          <input id="chemistrySmiles"
            placeholder="Ejemplo: CCO">
        </label>

        <button type="button" id="chemistryImport">
          Cargar molécula
        </button>

      </div>

      <p id="chemistryStatus" role="status">
        Preparando editor molecular...
      </p>

      <iframe
        id="chemistryFrame"
        title="Editor molecular Ketcher">
      </iframe>

      <div class="dialog-actions">

        <button type="button" id="chemistryClose">
          Cancelar
        </button>

        <button type="button" id="chemistryClear" disabled>
          Limpiar
        </button>

        <button type="button" id="chemistryDownload" disabled>
          Descargar PNG
        </button>

        <button type="button" id="chemistryInsert"
          class="primary" disabled>
          Insertar en pregunta
        </button>

      </div>
    `;

    document.body.append(d);

    const $ = id => document.getElementById(id);

    const frame = $('chemistryFrame');

    const status = text => {
      $('chemistryStatus').textContent = text;
    };

    const api = () => frame.contentWindow?.ketcher;

    function enable(ready) {

      [
        'chemistryInsert',
        'chemistryDownload',
        'chemistryClear',
        'chemistryImport',
        'chemistryTemplate'
      ].forEach(id => {
        $(id).disabled = !ready;
      });

    }

    async function waitEditor() {

      enable(false);

      status('Cargando editor molecular...');

      for (let i = 0; i < 180; i++) {

        if (typeof api()?.generateImage === 'function') {

          enable(true);

          status('Editor listo. Dibujá o seleccioná una molécula.');

          return;

        }

        await new Promise(r => setTimeout(r, 500));

      }

      status('No se pudo iniciar el editor molecular.');

    }

    trigger.onclick = () => {

      d.showModal();

      if (!frame.getAttribute('src')) {

        frame.src = 'vendor/ketcher/index.html';

      }

      waitEditor();

    };

    async function loadMolecule(smiles) {

      if (!smiles || !api()) return;

      try {

        await api().setMolecule(smiles);

        status('Molécula cargada correctamente.');

      } catch (error) {

        status('No se pudo interpretar la molécula.');

      }

    }

    $('chemistryTemplate').onchange = async e => {

      $('chemistrySmiles').value = e.target.value;

      await loadMolecule(e.target.value);

    };

    $('chemistryImport').onclick = () => {

      loadMolecule($('chemistrySmiles').value.trim());

    };

    $('chemistryClear').onclick = async () => {

      try {

        await api().setMolecule('');

        $('chemistrySmiles').value = '';
        $('chemistryTemplate').value = '';

        status('Área de trabajo limpia.');

      } catch (error) {

        status('Utilizá la herramienta de limpieza del editor.');

      }

    };

    async function getImage() {

      const k = api();

      if (!k) throw new Error('Editor no disponible.');

      const smiles = await k.getSmiles();

      if (!smiles.trim()) {

        throw new Error('Dibujá una molécula primero.');

      }

      const molfile = await k.getMolfile();

      const blob = await k.generateImage(
        molfile,
        {outputFormat: 'png'}
      );

      if (!(blob.size > 0) || blob.type !== 'image/png') {

        throw new Error('Imagen no válida.');

      }

      if (blob.size > 2000000) {

        throw new Error('La imagen supera los 2 MB.');

      }

      return blob;

    }

    $('chemistryDownload').onclick = async () => {

      try {

        const blob = await getImage();

        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');

        a.href = url;
        a.download = 'estructura-quimica.png';

        a.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        status('Imagen generada correctamente.');

      } catch (error) {

        status(error.message);

      }

    };

    $('chemistryInsert').onclick = async () => {

      $('chemistryInsert').disabled = true;

      try {

        const blob = await getImage();

        const file = new File(
          [blob],
          'estructura-quimica.png',
          {type: 'image/png'}
        );

        const dt = new DataTransfer();

        dt.items.add(file);

        image.files = dt.files;

        image.dispatchEvent(
          new Event('change', {bubbles: true})
        );

        $('e_remove').checked = false;

        d.close();

      } catch (error) {

        status(error.message);

      } finally {

        $('chemistryInsert').disabled = false;

      }

    };

    $('chemistryClose').onclick = () => d.close();

    enable(false);

  }

  window.addEventListener('load', install);

})();
