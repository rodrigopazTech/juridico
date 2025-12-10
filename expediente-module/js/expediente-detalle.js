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
    setTimeout(() => { 
        this.setupModals(); 
        this.setupDocumentsModule();
    }, 200);
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

 setupDocumentsModule() {
    this.renderDocumentsTable();
    this.setupUploadModal();
    this.setupSearch();
  }

  renderDocumentsTable(filterText = '') {
      const tbody = document.getElementById('tabla-documentos-body');
      if(!tbody) return;

      tbody.innerHTML = '';
      
      const docs = this.expediente.documentos || [];
      
      // Filtrar
      const filteredDocs = docs.filter(d => {
          const term = filterText.toLowerCase();
          return d.nombre.toLowerCase().includes(term) || 
                 d.tipo.toLowerCase().includes(term) || 
                 d.comentario.toLowerCase().includes(term);
      });

      if (filteredDocs.length === 0) {
          tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400 italic">No se encontraron documentos.</td></tr>`;
          return;
      }

      filteredDocs.forEach((doc, index) => {
          const row = document.createElement('tr');
          row.className = 'bg-white border-b hover:bg-gray-50 transition-colors';
          
          // Icono según extensión (simulado)
          let iconClass = 'fa-file-alt text-gray-400';
          if(doc.nombre.endsWith('.pdf')) iconClass = 'fa-file-pdf text-red-500';
          else if(doc.nombre.endsWith('.doc') || doc.nombre.endsWith('.docx')) iconClass = 'fa-file-word text-blue-600';
          else if(doc.nombre.endsWith('.jpg') || doc.nombre.endsWith('.png')) iconClass = 'fa-file-image text-purple-500';

          row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <i class="fas ${iconClass} text-xl"></i>
                    <div>
                        <div class="font-bold text-gray-900">${doc.nombre}</div>
                        <div class="text-xs text-gob-oro font-bold uppercase">${doc.tipo}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4 text-gray-600 italic text-xs max-w-xs truncate">
                ${doc.comentario}
            </td>
            <td class="px-6 py-4 text-gray-500 text-xs">
                ${doc.fecha}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    <button class="text-blue-600 hover:text-blue-800 p-1" title="Descargar (Simulado)" onclick="alert('Descargando: ${doc.nombre}')">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="delete-doc-btn text-red-500 hover:text-red-700 p-1" title="Eliminar" data-index="${index}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
          `;
          tbody.appendChild(row);
      });

      // Listeners para eliminar (delegación o asignación directa)
      document.querySelectorAll('.delete-doc-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const idx = e.currentTarget.getAttribute('data-index');
              this.deleteDocument(idx);
          });
      });
  }

  setupUploadModal() {
      const modal = document.getElementById('modal-subir-documento');
      const btnOpen = document.getElementById('btn-nuevo-documento');
      
      if(!modal) return;

      const open = () => {
          document.getElementById('form-subir-documento').reset();
          modal.classList.remove('hidden');
          modal.classList.add('flex');
      };
      
      const close = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };

      if(btnOpen) btnOpen.onclick = open;
      document.getElementById('close-subir-documento').onclick = close;
      document.getElementById('cancel-subir-documento').onclick = close;

      const btnSave = document.getElementById('save-subir-documento');
      if(btnSave) {
          // Reemplazar nodo para limpiar listeners viejos
          const newBtn = btnSave.cloneNode(true);
          btnSave.parentNode.replaceChild(newBtn, btnSave);
          
          newBtn.onclick = () => {
              const fileInput = document.getElementById('doc-file');
              const tipo = document.getElementById('doc-tipo').value;
              const comentario = document.getElementById('doc-comentario').value;

              if(fileInput.files.length === 0) { alert('Seleccione un archivo.'); return; }
              if(!tipo) { alert('Seleccione un tipo de documento.'); return; }
              if(!comentario) { alert('Escriba un comentario.'); return; }

              const file = fileInput.files[0];
              const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour:'2-digit', minute:'2-digit'});

              const newDoc = {
                  nombre: file.name,
                  tipo: tipo,
                  comentario: comentario,
                  fecha: fecha
              };

              // Guardar en array y actualizar localStorage
              if(!this.expediente.documentos) this.expediente.documentos = [];
              this.expediente.documentos.push(newDoc);
              
              updateExpediente(this.id, { documentos: this.expediente.documentos });
              
              this.loadData(); // Recargar datos locales
              this.renderDocumentsTable();
              close();
          };
      }
  }

  setupSearch() {
      const input = document.getElementById('search-documentos');
      if(input) {
          input.addEventListener('input', (e) => {
              this.renderDocumentsTable(e.target.value);
          });
      }
  }

  deleteDocument(index) {
      if(confirm('¿Estás seguro de eliminar este documento?')) {
          this.expediente.documentos.splice(index, 1);
          updateExpediente(this.id, { documentos: this.expediente.documentos });
          this.loadData();
          this.renderDocumentsTable();
      }
  }

  renderError(msg){ console.error(msg); }
}