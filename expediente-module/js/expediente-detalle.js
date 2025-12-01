import { expedienteById, updateExpediente } from '../data/expedientes-data.js';
import { loadTimeline, loadActividad } from '../data/expediente-timeline-data.js';

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
    
    // Renderizamos los datos en el HTML que ya cargó el loader
    this.populateVista360();
    this.renderActividadReciente();
    
    setTimeout(() => { this.setupModals(); }, 100);
  }

  parseId(){
    const params = new URLSearchParams(window.location.search);
    this.id = params.get('id');
  }

  loadData(){
    this.expediente = expedienteById(this.id);
    this.timeline = loadTimeline(this.id);
    this.actividad = loadActividad(this.id);
  }

  // === NUEVA LÓGICA: Rellenar datos en lugar de crear HTML ===
  populateVista360() {
    const e = this.expediente;
    
    // Helper para asignar texto seguro
    const setText = (id, text) => {
        const el = document.getElementById(id);
        if(el) el.textContent = text || '—';
    };

    // 1. Textos Simples
    setText('v360-numero', e.numero);
    setText('v360-materia', e.materia);
    setText('v360-gerencia', e.gerencia);
    setText('v360-sede', e.sede);
    setText('v360-partes', e.partes || 'Actor vs Demandado');
    setText('v360-abogado', e.abogado || 'Sin asignar');
    setText('v360-organo', e.organo);
    
    // 2. Prioridad (Texto + Color)
    const elPrio = document.getElementById('v360-prioridad');
    if(elPrio) {
        elPrio.textContent = e.prioridad || 'Media';
        elPrio.className = `text-sm font-bold ${e.prioridad === 'Alta' ? 'text-gob-guinda' : 'text-gray-600'}`;
    }

    // 3. Estado (Badge)
    const elEstado = document.getElementById('v360-estado');
    if(elEstado) {
        elEstado.textContent = e.estado || 'Activo';
        // Limpiar clases anteriores y asignar nuevas según estado
        let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
        const st = (e.estado || '').toLowerCase();
        
        if (st.includes('tramite') || st.includes('activo')) colorClass = 'bg-green-100 text-green-800 border-green-200';
        else if (st.includes('suspendido')) colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        else if (st.includes('concluido') || st.includes('sentencia')) colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
        
        elEstado.className = `px-3 py-1 rounded-full text-sm font-bold border uppercase tracking-wide font-headings ${colorClass}`;
    }

    // 4. Descripción (Mostrar solo si existe)
    const descContainer = document.getElementById('v360-descripcion-container');
    const descText = document.getElementById('v360-descripcion');
    if(e.descripcion && descContainer) {
        descText.textContent = e.descripcion;
        descContainer.classList.remove('hidden');
    }

    this.actualizarHeader();
  }

  actualizarHeader() {
    const tituloEl = document.getElementById('detalle-titulo');
    if(tituloEl && this.expediente) {
        tituloEl.innerHTML = `<i class="fas fa-folder-open text-gob-oro mr-2"></i> ${this.expediente.numero}`;
    }
  }

  // ... (El resto de tu código: renderActividadReciente, setupModals, renderError, etc. se mantiene igual)
  
  renderActividadReciente() {
      // Tu código existente...
  }
  
  setupModals() {
      // Tu código existente de modales...
      // Asegúrate de copiar el setupModals completo de la respuesta anterior
      // (setupEditModal y setupEstadoModal)
      this.setupEditModal();
      this.setupEstadoModal();
  }

  // Agrega aquí las funciones setupEditModal, setupEstadoModal, saveEditForm, etc. 
  // tal como estaban en la respuesta anterior.
  
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
          newBtn.onclick = () => {
              this.saveEditForm();
              close();
          };
      }
  }

  populateEditForm() {
      const e = this.expediente;
      const setValue = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
      
      setValue('edit-id', e.id);
      setValue('edit-numero', e.numero);
      setValue('edit-materia', e.materia);
      if(e.gerenciaId) setValue('edit-gerencia', e.gerenciaId);
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
      this.populateVista360(); // Refrescamos la vista sin recargar
  }

  setupEstadoModal() {
      const modal = document.getElementById('modal-cambio-estado');
      const btnOpen = document.getElementById('btn-cambiar-estado-expediente');
      
      if (!modal || !btnOpen) return;

      btnOpen.onclick = () => {
          const display = document.getElementById('estado-actual-display');
          if(display) display.textContent = this.expediente.estado;
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
              }
          };
      }
  }

  renderError(msg){
      // Lógica de error simple
      console.error(msg);
      alert(msg);
  }
}