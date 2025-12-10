import { expedienteById, updateExpediente } from '../data/expedientes-data.js';

export class ExpedienteDetalleModule {
  constructor(){
    this.id = null;
    this.expediente = null;
  }

  init(){
    this.parseId();
    if(!this.id){ this.renderError('ID inválido.'); return; }
    
    this.loadData();
    if(!this.expediente){ this.renderError('Expediente no encontrado.'); return; }
    
    this.populateVista360();
    setTimeout(() => { this.setupModals(); }, 100);
  }

  parseId(){
    const params = new URLSearchParams(window.location.search);
    this.id = params.get('id');
  }

  loadData(){
    this.expediente = expedienteById(this.id);
  }

  populateVista360() {
    const e = this.expediente;
    const setText = (id, text) => { const el = document.getElementById(id); if(el) el.textContent = text || '—'; };

    // 1. Datos Generales
    setText('v360-numero', e.numero);
    setText('v360-materia', e.materia);
    setText('v360-gerencia', e.gerencia);
    setText('v360-abogado', e.abogado);
    
    // 2. Datos que antes faltaban (Asegúrate de haber guardado un NUEVO expediente para verlos)
    setText('v360-sede', e.sede);
    setText('v360-partes', e.partes);
    setText('v360-organo', e.organo);
    
    // 3. Prioridad
    const elPrio = document.getElementById('v360-prioridad');
    if(elPrio) {
        elPrio.textContent = e.prioridad || 'Media';
        elPrio.className = `text-sm font-bold ${e.prioridad === 'Alta' ? 'text-red-700' : (e.prioridad === 'Baja' ? 'text-gray-600' : 'text-orange-600')}`;
    }

    // 4. Estado (TRAMITE, LAUDO, FIRME)
    const elEstado = document.getElementById('v360-estado');
    if(elEstado) {
        const st = (e.estado || 'TRAMITE').toUpperCase();
        elEstado.textContent = st;
        
        let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
        if (st === 'TRAMITE') colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
        else if (st === 'LAUDO') colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
        else if (st === 'FIRME') colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        
        elEstado.className = `px-3 py-1 rounded-full text-sm font-bold border uppercase tracking-wide font-headings ${colorClass}`;
    }

    // 5. Descripción
    const descContainer = document.getElementById('v360-descripcion-container');
    const descText = document.getElementById('v360-descripcion');
    if(e.descripcion && descContainer) {
        descText.textContent = e.descripcion;
        descContainer.classList.remove('hidden');
    }

    // 6. Actualizar Header (Quitar "Cargando...")
    this.actualizarHeader();
  }

  actualizarHeader() {
    const tituloEl = document.getElementById('detalle-titulo');
    if(tituloEl && this.expediente) {
        tituloEl.innerHTML = `<i class="fas fa-folder-open text-gob-oro mr-2"></i> ${this.expediente.numero}`;
    }
  }

  setupModals() {
      this.setupEditModal();
      this.setupEstadoModal();
  }

  setupEditModal() {
      const modal = document.getElementById('modal-edit-expediente');
      const btnOpen = document.getElementById('btn-editar-expediente');
      
      if (!modal) return;
      if(btnOpen) {
          btnOpen.onclick = () => {
              this.populateEditForm();
              modal.classList.remove('hidden');
              modal.classList.add('flex');
          };
      }
      
      const close = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };
      const btnClose = document.getElementById('close-edit-expediente');
      const btnCancel = document.getElementById('cancel-edit-expediente');
      if(btnClose) btnClose.onclick = close;
      if(btnCancel) btnCancel.onclick = close;

      const btnSave = document.getElementById('save-edit-expediente');
      if(btnSave) {
          const newBtn = btnSave.cloneNode(true);
          btnSave.parentNode.replaceChild(newBtn, btnSave);
          newBtn.onclick = () => { this.saveEditForm(); close(); };
      }
  }

  populateEditForm() {
      const e = this.expediente;
      const setValue = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
      
      setValue('edit-id', e.id);
      setValue('edit-numero', e.numero);
      setValue('edit-materia', e.materia);
      setValue('edit-gerencia', e.gerenciaId);
      setValue('edit-sede', e.sede);
      setValue('edit-abogado', e.abogado);
      setValue('edit-partes', e.partes);
      setValue('edit-organo', e.organo);
      setValue('edit-prioridad', e.prioridad);
      setValue('edit-descripcion', e.descripcion);
  }

  saveEditForm() {
      const getVal = (id) => document.getElementById(id)?.value;
      const getText = (id) => { const el = document.getElementById(id); return el && el.options ? el.options[el.selectedIndex].text : ''; };

      const changes = {
          numero: getVal('edit-numero'),
          materia: getVal('edit-materia'),
          gerenciaId: getVal('edit-gerencia'),
          gerencia: getText('edit-gerencia'),
          sede: getVal('edit-sede'),
          abogado: getVal('edit-abogado'),
          partes: getVal('edit-partes'),
          organo: getVal('edit-organo'),
          prioridad: getVal('edit-prioridad'),
          descripcion: getVal('edit-descripcion')
      };

      updateExpediente(this.id, changes);
      this.loadData();
      this.populateVista360();
  }

  setupEstadoModal() {
      const modal = document.getElementById('modal-cambio-estado');
      const btnOpen = document.getElementById('btn-cambiar-estado-expediente');
      
      if (!modal || !btnOpen) return;

      btnOpen.onclick = () => {
          const display = document.getElementById('estado-actual-display');
          if(display) display.textContent = this.expediente.estado;
          
          // Limpiar/Reiniciar Select de Estado
          const select = document.getElementById('nuevo-estado-select');
          if(select) {
             select.innerHTML = `
                <option value="">Seleccione...</option>
                <option value="TRAMITE">TRAMITE</option>
                <option value="LAUDO">LAUDO</option>
                <option value="FIRME">FIRME</option>
             `;
          }

          modal.classList.remove('hidden');
          modal.classList.add('flex');
      };

      const close = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };
      const btnClose = document.getElementById('close-cambio-estado');
      const btnCancel = document.getElementById('cancel-cambio-estado');
      if(btnClose) btnClose.onclick = close;
      if(btnCancel) btnCancel.onclick = close;

      const btnConfirm = document.getElementById('confirm-cambio-estado');
      if(btnConfirm) {
          const newBtn = btnConfirm.cloneNode(true);
          btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);
          newBtn.onclick = () => {
              const nuevo = document.getElementById('nuevo-estado-select').value;
              if(nuevo) {
                  updateExpediente(this.id, { estado: nuevo });
                  this.loadData();
                  this.populateVista360();
                  close();
              } else {
                  alert('Seleccione un nuevo estado.');
              }
          };
      }
  }

  renderError(msg){ console.error(msg); }
}