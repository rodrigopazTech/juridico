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
        this.renderTimeline()
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
    if(!this.expediente.documentos) this.expediente.documentos = [];
    if(!this.expediente.actividad) {
        this.expediente.actividad = [
            { 
                fecha: new Date().toISOString(), 
                titulo: 'Expediente Consultado', 
                descripcion: 'Se accedió al detalle del expediente.',
                tipo: 'info' 
            }
        ];
    }
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
      this.registrarActividad('Edición de Datos', 'Se actualizaron los datos generales del expediente.', 'edit');
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
        const razonInput = document.getElementById('razon-cambio'); // Referencia al input
        
        if(select) {
           select.innerHTML = `
              <option value="">Seleccione...</option>
              <option value="TRAMITE">TRAMITE</option>
              <option value="LAUDO">LAUDO</option>
              <option value="FIRME">FIRME</option>
           `;
        }
        // Limpiar el campo de razón al abrir el modal
        if(razonInput) razonInput.value = '';

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
            
            // --- AQUÍ ESTABA EL ERROR: AGREGA ESTA LÍNEA ---
            const razon = document.getElementById('razon-cambio').value; 
            // -----------------------------------------------

            if(nuevo) {
                updateExpediente(this.id, { estado: nuevo });
                
                // Ahora 'razon' ya existe y no dará error
                this.registrarActividad('Cambio de Estado', `Estado cambiado a ${nuevo}. ${razon ? 'Motivo: '+razon : ''}`, 'status');
                
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
          row.className = 'bg-white border-b hover:bg-gray-50 transition-colors group'; // 'group' para efectos hover
          
          let iconClass = 'fa-file-alt text-gray-400';
          if(doc.nombre.endsWith('.pdf')) iconClass = 'fa-file-pdf text-red-500';
          else if(doc.nombre.endsWith('.doc') || doc.nombre.endsWith('.docx')) iconClass = 'fa-file-word text-blue-600';
          else if(doc.nombre.endsWith('.jpg') || doc.nombre.endsWith('.png')) iconClass = 'fa-file-image text-purple-500';
          else if(doc.nombre.endsWith('.xls') || doc.nombre.endsWith('.xlsx')) iconClass = 'fa-file-excel text-green-600';

          row.innerHTML = `
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                        <i class="fas ${iconClass} text-xl"></i>
                    </div>
                    <div>
                        <div class="font-bold text-gray-900">${doc.nombre}</div>
                        <div class="text-[10px] text-gob-oro font-bold uppercase tracking-wide bg-yellow-50 px-1.5 py-0.5 rounded inline-block border border-yellow-100">${doc.tipo}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <p class="text-gray-600 italic text-xs max-w-xs truncate" title="${doc.comentario}">
                    ${doc.comentario}
                </p>
            </td>
            <td class="px-6 py-4 text-gray-500 text-xs font-mono">
                ${doc.fecha}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button class="btn-preview-doc w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm" 
                            title="Ver detalles" data-index="${index}">
                        <i class="fas fa-eye"></i>
                    </button>
                    
                    <button class="btn-download-doc w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all shadow-sm" 
                            title="Descargar documento" data-index="${index}">
                        <i class="fas fa-download"></i>
                    </button>
                    
                    <button class="btn-delete-doc w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm" 
                            title="Eliminar documento" data-index="${index}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
          `;
          tbody.appendChild(row);
      });

      // Asignar listeners a los nuevos botones
      this.asignarListenersDocumentos();
  }

asignarListenersDocumentos() {
      // Listener para PREVISUALIZAR
      document.querySelectorAll('.btn-preview-doc').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const idx = e.currentTarget.getAttribute('data-index');
              this.previewDocument(idx);
          });
      });

      // Listener para DESCARGAR
      document.querySelectorAll('.btn-download-doc').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const idx = e.currentTarget.getAttribute('data-index');
              this.downloadDocument(idx);
          });
      });

      // Listener para ELIMINAR
      document.querySelectorAll('.btn-delete-doc').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const idx = e.currentTarget.getAttribute('data-index');
              this.confirmDeleteDocument(idx);
          });
      });
  }

  // ACCIÓN 1: Previsualizar (Modal Informativo Bonito)
  previewDocument(index) {
      const doc = this.expediente.documentos[index];
      
      Swal.fire({
          title: `<span class="text-gob-guinda">${doc.nombre}</span>`,
          html: `
            <div class="text-left bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                <p><strong>Tipo:</strong> ${doc.tipo}</p>
                <p><strong>Fecha:</strong> ${doc.fecha}</p>
                <p class="mt-2"><strong>Comentario:</strong><br><span class="italic text-gray-600">${doc.comentario}</span></p>
                <div class="mt-4 text-center text-xs text-gray-400">
                    <i class="fas fa-eye mr-1"></i> Vista previa de metadatos
                </div>
            </div>
          `,
          icon: 'info',
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#545454' // Gris
      });
  }

  // ACCIÓN 2: Descargar (Toast Notification)
  downloadDocument(index) {
      const doc = this.expediente.documentos[index];
      
      // Simulación de descarga con Toast
      const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
      });

      Toast.fire({
          icon: 'success',
          title: 'Descarga iniciada',
          text: `Bajando: ${doc.nombre}`
      });
      
      // Aquí iría tu lógica real de window.open(url)
  }

  // ACCIÓN 3: Confirmar Eliminación (SweetAlert2)
  confirmDeleteDocument(index) {
      const docName = this.expediente.documentos[index].nombre;

      Swal.fire({
          title: '¿Eliminar documento?',
          text: `Se eliminará permanentemente "${docName}".`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#9D2449', // Gob Guinda
          cancelButtonColor: '#9ca3af',  // Gris
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          reverseButtons: true
      }).then((result) => {
          if (result.isConfirmed) {
              this.deleteDocument(index); // Llamamos a la lógica real
              
              Swal.fire({
                  title: '¡Eliminado!',
                  text: 'El documento ha sido borrado.',
                  icon: 'success',
                  confirmButtonColor: '#B38E5D' // Gob Oro
              });
          }
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

              this.registrarActividad('Documento Adjuntado', `Se subió el documento "${file.name}" (${tipo}).`, 'upload');
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
      const docName = this.expediente.documentos[index].nombre;     
      this.expediente.documentos.splice(index, 1);     
      updateExpediente(this.id, { documentos: this.expediente.documentos });     
      this.registrarActividad('Documento Eliminado', `Se eliminó el documento "${docName}" del expediente.`, 'delete');
      this.loadData();
      this.renderDocumentsTable();
  }
registrarActividad(titulo, descripcion, tipo) {
      const nuevaActividad = {
          fecha: new Date().toISOString(),
          titulo: titulo,
          descripcion: descripcion,
          tipo: tipo // 'upload', 'delete', 'edit', 'status'
      };

      // Agregar al inicio del array
      if(!this.expediente.actividad) this.expediente.actividad = [];
      this.expediente.actividad.unshift(nuevaActividad);

      // Guardar en persistencia
      updateExpediente(this.id, { actividad: this.expediente.actividad });

      // Refrescar vista
      this.renderTimeline();
  }

  renderTimeline() {
      const container = document.getElementById('actividad-reciente-list');
      if (!container) return;

      container.innerHTML = '';

      const actividades = this.expediente.actividad || [];

      if (actividades.length === 0) {
          container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Sin actividad reciente.</p>';
          return;
      }

      actividades.forEach(act => {
          const date = new Date(act.fecha);
          const fechaStr = date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
          const horaStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
          
          // Configurar iconos y colores según tipo
          let icon = 'fa-info-circle';
          let colorBg = 'bg-gray-100';
          let colorIcon = 'text-gray-500';

          switch(act.tipo) {
              case 'upload':
                  icon = 'fa-file-upload';
                  colorBg = 'bg-blue-50';
                  colorIcon = 'text-blue-600';
                  break;
              case 'delete':
                  icon = 'fa-trash-alt';
                  colorBg = 'bg-red-50';
                  colorIcon = 'text-red-600';
                  break;
              case 'edit':
                  icon = 'fa-pen';
                  colorBg = 'bg-yellow-50';
                  colorIcon = 'text-yellow-600';
                  break;
              case 'status':
                  icon = 'fa-exchange-alt';
                  colorBg = 'bg-green-50';
                  colorIcon = 'text-green-600';
                  break;
          }

          const item = document.createElement('div');
          item.className = 'relative pl-4 pb-6 border-l border-gray-200 last:pb-0 last:border-0';
          
          item.innerHTML = `
              <div class="absolute -left-1.5 top-0 w-3 h-3 rounded-full border border-white ${colorBg.replace('50', '400')}"></div>
              
              <div class="flex flex-col gap-1">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">${fechaStr} • ${horaStr}</span>
                  
                  <div class="flex items-start gap-2">
                      <div class="mt-0.5 p-1 rounded ${colorBg}">
                          <i class="fas ${icon} ${colorIcon} text-xs"></i>
                      </div>
                      <div>
                          <h4 class="text-xs font-bold text-gray-800">${act.titulo}</h4>
                          <p class="text-xs text-gray-500 leading-relaxed">${act.descripcion}</p>
                      </div>
                  </div>
              </div>
          `;
          container.appendChild(item);
      });
  }
  renderError(msg){ console.error(msg); }
}