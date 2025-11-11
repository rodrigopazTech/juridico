// js/audiencias.js

// Simula el rol del usuario logueado.
// Cambia este valor para probar los permisos:
// 'Abogado' | 'Gerente' | 'Direccion'
const USER_ROLE = 'Gerente'; 

// Lista de estados mexicanos para el filtro de gerencias
const estadosMexicoAudiencias = [
  'Aguascalientes','Baja California','Baja California Sur','Campeche','Chiapas','Chihuahua',
  'Ciudad de México','Coahuila','Colima','Durango','Estado de México','Guanajuato','Guerrero',
  'Hidalgo','Jalisco','Michoacán','Morelos','Nayarit','Nuevo León','Oaxaca','Puebla','Querétaro',
  'Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco','Tamaulipas','Tlaxcala','Veracruz',
  'Yucatán','Zacatecas'
];

// Estado global simple
let AUDIENCIAS = [];

// Lista simulada de abogados (para reasignar y modal)
const LISTA_ABOGADOS = [
    'Lic. María González Ruiz',
    'Lic. Carlos Hernández López',
    'Lic. Ana Patricia Morales',
    'Lic. Roberto Silva Martínez',
    'Lic. Sandra Jiménez Castro',
    'Lic. Fernando Ramírez Torres',
    'Lic. Carmen Delgado Vázquez',
    'Lic. Alejandro Mendoza Ruiz'
];

// -------------------------------
// Utilidades
// -------------------------------
function caseInsensitiveIncludes(haystack, needle){
  return (haystack||'').toString().toLowerCase().includes((needle||'').toString().toLowerCase());
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString + 'T00:00:00-06:00');
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
}

function formatDateTime(ts) {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function escapeHTML(str) {
  return (str||'').replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

// Semáforo por proximidad
function getSemaforoStatusAudiencia(fecha, hora) {
  const today = new Date();
  const audienciaDateTime = new Date(fecha + 'T' + hora);
  const diffTime = audienciaDateTime - today;
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays  = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffHours <= 0) {
      return { color: 'vencido', class: 'semaforo-vencido', tooltip: 'En curso o pasada' };
  } else if (diffHours <= 24) {
    return { color: 'rojo', class: 'semaforo-rojo', tooltip: `En ${diffHours} horas` };
  } else if (diffDays <= 3) {
    return { color: 'amarillo', class: 'semaforo-amarillo', tooltip: `En ${diffDays} días` };
  } else {
    return { color: 'verde', class: 'semaforo-verde', tooltip: `En ${diffDays} días` };
  }
}

// -------------------------------
// Inicialización principal
// -------------------------------
function initAudiencias() {
  console.log('Inicializando módulo de audiencias...');
  
  // Carga de datos inicial
  loadAudiencias();
  
  // Inicializar TODOS los modales primero
  initModalAudiencias();
  initModalComentarios();
  initModalFinalizarAudiencia();
  initModalHistorialCambios();
  initGestionTiposAudiencia();
  initModalReasignarAudiencia();

  // Configurar componentes de UI
  setupSearch();
  setupFilters();
  setupGerenciaSearch();
  setupAsuntoSelectorAudiencia();
  setupFileUploadAudiencia();
  setupActionMenuListenerAudiencia();
  
  // Poblar selectores
  renderTipoOptions();
  cargarAbogadosSelects();
  
  console.log('Módulo de audiencias inicializado correctamente');
}

// -------------------------------
// Carga/Render de tabla
// -------------------------------

function loadAudiencias() {
  const tbody = document.getElementById('audiencias-body');

  const ls = JSON.parse(localStorage.getItem('audiencias') || '[]');

  if (ls && ls.length) {
    AUDIENCIAS = ls.map(a => ({ ...a, id: String(a.id) }));
  } else {
    const DEMO = [
      { id: '1', asuntoId: '1698270123456', fecha: '2025-11-12', hora: '10:00', tribunal: 'Juzgado Primero de lo Civil', expediente: '2354/2025', actor: 'Gómez Rivera Laura', tipo: 'Inicial', materia: 'Civil', demandado: 'Martínez Contreras Luis', gerencia: 'Ciudad de México', abogadoEncargado: 'Lic. María González Ruiz', abogadoComparece: 'Lic. Ana Patricia Morales', observaciones: '', prioridad: 'Alta', actaDocumento: '', atendida: false },
      { id: '2', asuntoId: '1698270234567', fecha: '2025-11-13', hora: '09:30', tribunal: 'Tribunal Laboral Regional Norte', expediente: '5421/2025', actor: 'Ortega Ibarra Juan Carlos', tipo: 'Intermedia', materia: 'Laboral', demandado: 'Empresa Constructora S.A. de C.V.', gerencia: 'Nuevo León', abogadoEncargado: 'Lic. Roberto Silva Martínez', abogadoComparece: 'Lic. Carlos Hernández López', observaciones: '', prioridad: 'Media', actaDocumento: '', atendida: false },
      { id: '3', asuntoId: '1698270345678', fecha: '2025-11-10', hora: '12:00', tribunal: 'Juzgado Segundo en Materia Penal', expediente: '1987/2025', actor: 'Fiscalía del Estado', tipo: 'Testimonial', materia: 'Penal', demandado: 'Hernández Rivas Jorge', gerencia: 'Jalisco', abogadoEncargado: 'Lic. Sandra Jiménez Castro', abogadoComparece: 'Lic. Fernando Ramírez Torres', observaciones: 'Audiencia finalizada, se anexa acta.', prioridad: 'Alta', actaDocumento: 'Acta_1987_2025.pdf', atendida: true }
    ];
    AUDIENCIAS = DEMO;
    localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
  }

  let html = '';
  // Aplicar filtros antes de renderizar
  const filtros = getFiltrosAplicadosAudiencias();
  const audienciasFiltradas = filtrarAudiencias(AUDIENCIAS, filtros);

  audienciasFiltradas.forEach(a => {
    const sem = getSemaforoStatusAudiencia(a.fecha, a.hora);
    // Asignar clase si está desahogada (atendida)
    const rowClass = a.atendida ? 'row-desahogada' : ''; 
    
    html += `
      <tr class="${rowClass}" data-id="${a.id}" data-tipo="${escapeHTML(a.tipo||'')}"
          data-gerencia="${escapeHTML(a.gerencia||'')}"
          data-materia="${escapeHTML(a.materia||'')}"
          data-prioridad="${escapeHTML(a.prioridad||'')}">
        <td>
          <button class="toggle-expand" data-id="${a.id}">
            <i class="fas fa-chevron-down"></i>
          </button>
        </td>
        <td>
          <div class="semaforo-container">
            <div class="semaforo-dot ${sem.class}" title="${escapeHTML(sem.tooltip)}"></div>
            ${formatDate(a.fecha)}
          </div>
        </td>
        <td>${escapeHTML(a.hora||'')}</td>
        <td>${escapeHTML(a.tribunal||'')}</td>
        <td>${escapeHTML(a.expediente||'')}</td>
        <td>${escapeHTML(a.actor||'')}</td>
        
        <td class="actions">
            <button class="btn btn-primary btn-sm action-edit-audiencia" title="Editar audiencia">
                <i class="fas fa-edit"></i>
            </button>
            <div class="action-menu-container">
                <button class="btn btn-secondary btn-sm action-menu-toggle" title="Acciones rápidas">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="action-menu">
                    ${generarAccionesRapidasAudiencia(a, USER_ROLE)}
                </div>
            </div>
            <input type="file" class="input-acta-hidden" data-id="${a.id}" accept=".pdf,.doc,.docx" style="display:none;">
        </td>
        </tr>
      <tr class="expandable-row ${rowClass}" id="expand-audiencia-${a.id}">
        <td colspan="7">
          <div class="expandable-content">
            <table>
              <tr>
                <th>Tipo de Audiencia</th>
                <td>${escapeHTML(a.tipo||'')}</td>
                <th>Materia</th>
                <td><span class="badge badge-${escapeHTML((a.materia||'').toLowerCase())}">${escapeHTML(a.materia||'')}</span></td>
              </tr>
              <tr>
                <th>Demandado</th>
                <td>${escapeHTML(a.demandado||'')}</td>
                <th>Prioridad</th>
                <td><span class="badge badge-${escapeHTML((a.prioridad||'').toLowerCase())}">${escapeHTML(a.prioridad||'')}</span></td>
              </tr>
              <tr>
                <th>Ab. Comparece</th>
                <td>${escapeHTML(a.abogadoComparece||'')}</td>
                <th>Estatus</th>
                <td>${a.atendida ? '<span class="status-presentado"><i class="fas fa-check-circle"></i> Desahogada</span>' : 'Pendiente'}</td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  setupExpandableRows();
}

// -------------------------------
// Guardado (alta/edición)
// -------------------------------

function guardarAudiencia() {
  console.log('Guardando audiencia...');

  const audienciaId = (document.getElementById('audiencia-id').value || '').trim();
  const isEditing = !!audienciaId;

  const audienciaData = {
    asuntoId: document.getElementById('asunto-selector-audiencia').value,
    fechaAudiencia: document.getElementById('fecha-audiencia').value,
    horaAudiencia: document.getElementById('hora-audiencia').value,
    tipoAudiencia: document.getElementById('tipo-audiencia').value,
    sala: document.getElementById('sala-audiencia').value,
    abogadoComparece: document.getElementById('abogado-comparece').value,
    recordatorioDias: parseInt(document.getElementById('recordatorio-dias')?.value) || 1,
    recordatorioHoras: parseInt(document.getElementById('recordatorio-horas')?.value) || 2,
  };

  // Validaciones
  if (!audienciaData.asuntoId) {
    mostrarMensajeGlobal('Por favor, selecciona un asunto.', 'danger');
    return;
  }
  if (!audienciaData.tipoAudiencia || !audienciaData.fechaAudiencia || !audienciaData.horaAudiencia || !audienciaData.abogadoComparece) {
    mostrarMensajeGlobal('Completa Tipo, Fecha, Hora y Abogado que Comparece.', 'danger');
    return;
  }
  if (!isEditing) {
    const hoy = new Date().toISOString().split('T')[0];
    if (audienciaData.fechaAudiencia < hoy) {
      mostrarMensajeGlobal('La fecha de la audiencia no puede ser en el pasado.', 'danger');
      return;
    }
  }

  const ls = JSON.parse(localStorage.getItem('audiencias') || '[]');
  let base = (ls && ls.length) ? ls.map(a => ({ ...a, id: String(a.id) })) : [...AUDIENCIAS.map(a => ({ ...a, id: String(a.id) }))];

  if (isEditing) {
    // Actualiza existente
    const idx = base.findIndex(a => String(a.id) === String(audienciaId));
    if (idx === -1) {
      mostrarMensajeGlobal('No se encontró la audiencia a editar.', 'danger');
      return;
    }
    
    base[idx] = {
      ...base[idx],
      ...audienciaData,
      fechaModificacion: new Date().toISOString().split('T')[0],
      fecha: audienciaData.fechaAudiencia,
      hora: audienciaData.horaAudiencia,
      tipo: audienciaData.tipoAudiencia,
    };
    
    mostrarMensajeGlobal('Audiencia actualizada exitosamente.', 'success');

  } else {
    // Nueva
    audienciaData.id = String(Date.now());
    audienciaData.fechaCreacion = new Date().toISOString().split('T')[0];
    audienciaData.atendida = false;
    audienciaData.observaciones = '';
    audienciaData.actaDocumento = '';

    // Mapeo para la tabla
    const row = {
      ...audienciaData,
      fecha: audienciaData.fechaAudiencia,
      hora: audienciaData.horaAudiencia,
      tipo: audienciaData.tipoAudiencia,
    };
    
    // Llenar datos del asunto
    const asunto = (JSON.parse(localStorage.getItem('asuntos')) || []).find(a => a.id === audienciaData.asuntoId);
    if(asunto) {
        row.expediente = asunto.expediente;
        row.materia = asunto.materia;
        row.gerencia = asunto.gerencia;
        row.abogadoEncargado = asunto.abogado;
        row.actor = asunto.partes;
        row.tribunal = asunto.organoJurisdiccional;
        row.prioridad = asunto.prioridad;
        row.demandado = asunto.demandado || '';
    }

    base.push(row);
    mostrarMensajeGlobal('Audiencia guardada exitosamente.', 'success');
  }

  // Persistencia y refresco
  localStorage.setItem('audiencias', JSON.stringify(base));
  AUDIENCIAS = base;

  document.getElementById('form-audiencia')?.reset();
  limpiarCamposAutoLlenadosAudiencia();
  const actaFilename = document.getElementById('acta-filename');
  if(actaFilename) {
      actaFilename.textContent = 'Ningún archivo seleccionado';
      actaFilename.classList.remove('has-file');
  }
  const modal = document.getElementById('modal-audiencia');
  if (modal) modal.style.display = 'none';

  loadAudiencias();
}

// -------------------------------
// Modal: Audiencia (Principal) - FUNCIONES FALTANTES
// -------------------------------
function initModalAudiencias() {
  const modal = document.getElementById('modal-audiencia');
  const btnClose = document.getElementById('close-modal-audiencia');
  const btnCancel = document.getElementById('cancel-audiencia');
  const btnSave = document.getElementById('save-audiencia');
  const btnAdd = document.getElementById('add-audiencia');

  if (btnAdd) {
    btnAdd.addEventListener('click', function() {
      openAudienciaModal(null);
    });
  }

  if (btnClose) btnClose.addEventListener('click', closeAudienciaModal);
  if (btnCancel) btnCancel.addEventListener('click', closeAudienciaModal);
  if (btnSave) btnSave.addEventListener('click', guardarAudiencia);

  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeAudienciaModal();
    }
  });
}

function openAudienciaModal(audiencia) {
  const modal = document.getElementById('modal-audiencia');
  const title = document.getElementById('modal-audiencia-title');
  const form = document.getElementById('form-audiencia');
  
  if (!modal) {
    console.error('Modal de audiencia no encontrado');
    return;
  }

  // Resetear formulario
  if (form) form.reset();
  limpiarCamposAutoLlenadosAudiencia();
  
  // Configurar para edición o nueva
  if (audiencia) {
    title.textContent = 'Editar Audiencia';
    document.getElementById('audiencia-id').value = audiencia.id;
    
    // Llenar datos existentes
    document.getElementById('asunto-selector-audiencia').value = audiencia.asuntoId || '';
    document.getElementById('tipo-audiencia').value = audiencia.tipo || '';
    document.getElementById('fecha-audiencia').value = audiencia.fecha || '';
    document.getElementById('hora-audiencia').value = audiencia.hora || '';
    document.getElementById('sala-audiencia').value = audiencia.sala || '';
    document.getElementById('abogado-comparece').value = audiencia.abogadoComparece || '';
    document.getElementById('recordatorio-dias').value = audiencia.recordatorioDias || 1;
    document.getElementById('recordatorio-horas').value = audiencia.recordatorioHoras || 2;
    
    // Cargar datos del asunto si existe
    if (audiencia.asuntoId) {
      cargarDatosAsuntoAudiencia(audiencia.asuntoId);
    }
  } else {
    title.textContent = 'Nueva Audiencia';
    document.getElementById('audiencia-id').value = '';
  }
  
  modal.style.display = 'flex';
}

function closeAudienciaModal() {
  const modal = document.getElementById('modal-audiencia');
  if (modal) modal.style.display = 'none';
}

// -------------------------------
// Asunto selector + autollenado
// -------------------------------
function setupAsuntoSelectorAudiencia() {
  const selector = document.getElementById('asunto-selector-audiencia');
  if (!selector) return;
  cargarAsuntosEnSelectorAudiencia();
  selector.addEventListener('change', function () {
    cargarDatosAsuntoAudiencia(this.value);
  });
}

function cargarAsuntosEnSelectorAudiencia() {
  const selector = document.getElementById('asunto-selector-audiencia');
  if (!selector) return;

  const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
  selector.innerHTML = '<option value="">Seleccionar Asunto</option>';
  asuntos.forEach(asunto => {
    const opt = document.createElement('option');
    opt.value = asunto.id;
    opt.textContent = `${asunto.expediente} - ${asunto.descripcion || asunto.partes}`;
    selector.appendChild(opt);
  });
}

function cargarDatosAsuntoAudiencia(asuntoId) {
  if (!asuntoId) {
    limpiarCamposAutoLlenadosAudiencia();
    return;
  }
  const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
  const asunto = asuntos.find(a => String(a.id) === String(asuntoId));
  if (!asunto) {
    limpiarCamposAutoLlenadosAudiencia();
    return;
  }
  document.getElementById('expediente-auto-audiencia').value = asunto.expediente || '';
  document.getElementById('materia-auto-audiencia').value    = asunto.materia || '';
  document.getElementById('gerencia-auto-audiencia').value   = asunto.gerencia || '';
  document.getElementById('abogado-auto-audiencia').value    = asunto.abogado || '';
  document.getElementById('partes-auto-audiencia').value     = asunto.partes || '';
  document.getElementById('organo-auto-audiencia').value     = asunto.organoJurisdiccional || '';
  document.getElementById('prioridad-auto-audiencia').value  = asunto.prioridad || '';
}

function limpiarCamposAutoLlenadosAudiencia() {
  ['expediente-auto-audiencia','materia-auto-audiencia','gerencia-auto-audiencia',
   'abogado-auto-audiencia','partes-auto-audiencia','organo-auto-audiencia','prioridad-auto-audiencia']
   .forEach(id => { 
     const el = document.getElementById(id); 
     if (el) el.value = ''; 
   });
}

// -------------------------------
// Subida de archivos
// -------------------------------
function setupFileUploadAudiencia() {
  const fileInput = document.getElementById('acta-audiencia');
  const fileName  = document.getElementById('acta-filename');
  if (!fileInput || !fileName) return;
  fileInput.addEventListener('change', function () {
    if (this.files.length > 0) {
      fileName.textContent = this.files[0].name;
      fileName.classList.add('has-file');
    } else {
      fileName.textContent = 'Ningún archivo seleccionado';
      fileName.classList.remove('has-file');
    }
  });
}

// -------------------------------
// Acciones en la tabla
// -------------------------------

function setupExpandableRows() {
  document.getElementById('audiencias-body').addEventListener('click', function(e) {
    const toggleBtn = e.target.closest('.toggle-expand');
    if (toggleBtn) {
      const id = toggleBtn.getAttribute('data-id');
      const expRow = document.getElementById(`expand-audiencia-${id}`);
      const icon = toggleBtn.querySelector('i');
      if (expRow.classList.contains('active')) {
        expRow.classList.remove('active');
        icon.className = 'fas fa-chevron-down';
      } else {
        expRow.classList.add('active');
        icon.className = 'fas fa-chevron-up';
      }
    }
  });
}

// Generador de menú de acciones rápidas
function generarAccionesRapidasAudiencia(audiencia, rol) {
    let accionesHTML = '';

    // Acciones de Navegación y Auditoría
    accionesHTML += `<a href="#" class="action-item action-view-asunto-audiencia" title="Ver el asunto principal">
                        <i class="fas fa-briefcase"></i> Ver Asunto
                    </a>`;
    if (rol === 'Gerente' || rol === 'Direccion') {
      accionesHTML += `<a href="#" class="action-item action-history-audiencia" title="Ver historial de cambios">
                          <i class="fas fa-eye"></i> Ver Historial
                      </a>`;
    }
    accionesHTML += `<a href="#" class="action-item action-comment-audiencia" title="Agregar/Ver comentarios">
                        <i class="fas fa-comment-dots"></i> Comentarios
                    </a>`;
    
    // Acciones de Workflow
    if (!audiencia.atendida) {
        accionesHTML += `<div class="action-divider"></div>`;
        accionesHTML += `<a href="#" class="action-item action-upload-acta" title="Subir acta de audiencia">
                            <i class="fas fa-file-upload"></i> Subir Acta
                        </a>`;
        accionesHTML += `<a href="#" class="action-item action-desahogar" title="Marcar como desahogada">
                            <i class="fas fa-check"></i> Desahogar
                        </a>`;
        
        if (rol === 'Gerente' || rol === 'Direccion') {
            accionesHTML += `<a href="#" class="action-item action-reasignar-audiencia" title="Asignar a otro abogado">
                                <i class="fas fa-user-friends"></i> Reasignar
                            </a>`;
        }
    } else {
        if (audiencia.actaDocumento) {
            accionesHTML += `<a href="#" class="action-item action-view-acta" title="Descargar acta">
                                <i class="fas fa-download"></i> Ver Acta
                            </a>`;
        }
    }

    // Acción de Peligro (Solo Dirección)
    if (rol === 'Direccion') {
        accionesHTML += `<div class="action-divider"></div>`; 
        accionesHTML += `<a href="#" class="action-item action-delete-audiencia danger-action" title="Eliminar esta audiencia">
                            <i class="fas fa-trash-alt"></i> Eliminar Audiencia
                        </a>`;
    }

    return accionesHTML;
}

// Listener de delegación para todas las acciones
function setupActionMenuListenerAudiencia() {
    const tbody = document.getElementById('audiencias-body');
    if (!tbody) return;

    tbody.addEventListener('click', function(e) {
        const target = e.target.closest('button, a'); 
        if (!target) return;

        const row = target.closest('tr');
        if (!row) return;

        const id = row.getAttribute('data-id');
        const audiencia = AUDIENCIAS.find(t => t.id == id);
        if (!audiencia) return;

        // Manejador del menú de 3 puntos
        if (target.classList.contains('action-menu-toggle')) {
            e.preventDefault();
            document.querySelectorAll('.action-menu.show').forEach(menu => {
                if (menu !== target.nextElementSibling) {
                    menu.classList.remove('show');
                }
            });
            target.nextElementSibling.classList.toggle('show');
        }

        // Acciones
        if (target.classList.contains('action-edit-audiencia')) {
            openAudienciaModal(audiencia);
        }
        if (target.classList.contains('action-view-asunto-audiencia')) {
            verDetallesAsunto(audiencia.asuntoId);
        }
        if (target.classList.contains('action-history-audiencia')) {
            openHistorialCambiosModal(id);
        }
        if (target.classList.contains('action-comment-audiencia')) {
            openComentariosModal(id);
        }
        if (target.classList.contains('action-desahogar')) {
            openFinalizarAudienciaModal(id);
        }
        if (target.classList.contains('action-upload-acta')) {
            row.querySelector('.input-acta-hidden').click();
        }
        if (target.classList.contains('action-view-acta')) {
            descargarActa(audiencia.actaDocumento, audiencia.expediente);
        }
        if (target.classList.contains('action-reasignar-audiencia')) {
            abrirModalReasignarAudiencia(id);
        }
        if (target.classList.contains('action-delete-audiencia')) {
            eliminarAudiencia(id);
        }
    });
    
    // Listener para el input de archivo oculto
    tbody.addEventListener('change', function(e) {
        if (e.target.classList.contains('input-acta-hidden')) {
            const id = e.target.getAttribute('data-id');
            const file = e.target.files[0];
            if (file) {
                subirActa(id, file);
            }
        }
    });
}

// -------------------------------
// Búsqueda y filtros
// -------------------------------
function setupSearch() {
  const searchInput = document.getElementById('search-audiencias');
  if (!searchInput) return;
  searchInput.addEventListener('input', function () {
    applyFilters();
  });
}

function setupFilters() {
  ['filter-tipo','filter-materia','filter-prioridad', 'filter-gerencia'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyFilters);
  });
}

function getFiltrosAplicadosAudiencias() {
    return {
        tipo: document.getElementById('filter-tipo').value,
        gerencia: (document.getElementById('filter-gerencia').value || '').trim().toLowerCase(),
        materia: document.getElementById('filter-materia').value,
        prioridad: document.getElementById('filter-prioridad').value,
        search: document.getElementById('search-audiencias').value.toLowerCase()
    };
}

function filtrarAudiencias(audiencias, filtros) {
    return audiencias.filter(a => {
        const rowTipo = a.tipo || '';
        const rowGer  = (a.gerencia || '').toLowerCase();
        const rowMat  = a.materia || '';
        const rowPri  = a.prioridad || '';

        const rowText = [
            rowTipo, rowGer, rowMat, rowPri,
            a.fecha, a.hora, a.tribunal, a.expediente, a.actor, a.demandado, a.abogadoComparece
        ].join(' ').toLowerCase();

        const matchesTipo = !filtros.tipo || rowTipo === filtros.tipo;
        const matchesGer  = !filtros.gerencia || rowGer.includes(filtros.gerencia);
        const matchesMat  = !filtros.materia || rowMat === filtros.materia;
        const matchesPri  = !filtros.prioridad || rowPri === filtros.prioridad;
        const matchesSearch = !filtros.search || rowText.includes(filtros.search);

        return matchesTipo && matchesGer && matchesMat && matchesPri && matchesSearch;
    });
}

function applyFilters() {
    loadAudiencias();
}

// -------------------------------
// Gerencias (autocomplete)
// -------------------------------
function setupGerenciaSearch() {
  const input = document.getElementById('filter-gerencia');
  const suggestionsDiv = document.getElementById('gerencia-suggestions');
  const clearBtn = document.getElementById('clear-gerencia');
  if (!input || !suggestionsDiv || !clearBtn) return;

  let selectedIndex = -1;

  function updateClearButton() {
    clearBtn.style.display = input.value.trim() ? 'block' : 'none';
  }
  function hideSuggestions() {
    suggestionsDiv.classList.remove('show');
    selectedIndex = -1;
  }
  function updateSelectedSuggestion() {
    const suggestions = suggestionsDiv.querySelectorAll('.gerencia-suggestion[data-estado]');
    suggestions.forEach((s, i) => s.classList.toggle('highlighted', i === selectedIndex));
  }
  function selectSuggestion(suggestionElement) {
    const estado = suggestionElement.getAttribute('data-estado');
    if (!estado) return;
    input.value = estado;
    updateClearButton();
    hideSuggestions();
    applyFilters();
  }
  function showSuggestions(query) {
    let matches = query ? estadosMexicoAudiencias.filter(e => caseInsensitiveIncludes(e, query))
                        : estadosMexicoAudiencias;

    let html = '';
    matches.forEach(estado => { html += `<div class="gerencia-suggestion" data-estado="${estado}">${estado}</div>`; });
    if (!matches.length) html = '<div class="gerencia-suggestion" style="color:#666; font-style:italic;">No se encontraron coincidencias</div>';

    suggestionsDiv.innerHTML = html;
    suggestionsDiv.querySelectorAll('.gerencia-suggestion[data-estado]').forEach(sg => {
      sg.addEventListener('click', function(){ selectSuggestion(this); });
    });
    suggestionsDiv.classList.add('show');
    selectedIndex = -1;
  }

  input.addEventListener('input', function(){
    const q = this.value.trim();
    updateClearButton();
    if (!q.length) { hideSuggestions(); applyFilters(); return; }
    showSuggestions(q); applyFilters();
  });
  input.addEventListener('focus', function(){
    showSuggestions(this.value.trim() || '');
  });
  input.addEventListener('keydown', function(e){
    const suggestions = suggestionsDiv.querySelectorAll('.gerencia-suggestion[data-estado]');
    if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex+1, suggestions.length-1); updateSelectedSuggestion(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = Math.max(selectedIndex-1, -1); updateSelectedSuggestion(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (selectedIndex>=0 && suggestions[selectedIndex]) selectSuggestion(suggestions[selectedIndex]); }
    else if (e.key === 'Escape') { hideSuggestions(); }
  });
  document.addEventListener('click', function(e){
    if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) hideSuggestions();
  });
  clearBtn.addEventListener('click', function(){
    input.value = ''; updateClearButton(); hideSuggestions(); applyFilters();
  });

  updateClearButton();
}

// -------------------------------
// Comentarios
// -------------------------------
function lsKey(audienciaId) { return `audiencia_comentarios_${audienciaId}`; }

function getComentarios(audienciaId) {
  try { const raw = localStorage.getItem(lsKey(audienciaId)); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
function setComentarios(audienciaId, comentarios) {
  localStorage.setItem(lsKey(audienciaId), JSON.stringify(comentarios));
}

function initModalComentarios() {
  const modal = document.getElementById('modal-comentarios');
  const btnClose = document.getElementById('close-modal-comentarios');
  const btnSave  = document.getElementById('save-comentario');
  if (btnClose) btnClose.addEventListener('click', () => modal.style.display = 'none');
  if (btnSave)  btnSave.addEventListener('click', saveComentario);
  window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
}

function openComentariosModal(audienciaId) {
  const modal = document.getElementById('modal-comentarios');
  const inputId = document.getElementById('comentarios-audiencia-id');
  const textarea = document.getElementById('nuevo-comentario');
  inputId.value = audienciaId;
  textarea.value = '';
  renderComentariosList(audienciaId);
  modal.style.display = 'flex';
}

function saveComentario() {
  const audienciaId = document.getElementById('comentarios-audiencia-id').value;
  const textarea = document.getElementById('nuevo-comentario');
  const texto = (textarea.value || '').trim();
  if (!texto) return mostrarMensajeGlobal('Escribe un comentario.', 'danger');

  const comentarios = getComentarios(audienciaId);
  comentarios.push({ text: texto, ts: Date.now() });
  setComentarios(audienciaId, comentarios);
  textarea.value = '';
  renderComentariosList(audienciaId);
}

function renderComentariosList(audienciaId) {
  const ul = document.getElementById('lista-comentarios');
  const comentarios = getComentarios(audienciaId);
  if (!ul) return;

  if (!comentarios.length) {
    ul.innerHTML = `<li style="color:#666;">Sin comentarios aún.</li>`;
    return;
  }

  ul.innerHTML = comentarios.map((c, idx) => `
    <li class="comment-item">
      <div class="comment-meta">
        <span>${formatDateTime(c.ts)}</span>
        <button class="btn btn-danger btn-sm" data-idx="${idx}" data-id="${audienciaId}" title="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      <div class="comment-text">${escapeHTML(c.text)}</div>
    </li>
  `).join('');

  ul.querySelectorAll('button.btn-danger').forEach(btn => {
    btn.addEventListener('click', function(){
      const idx = parseInt(this.getAttribute('data-idx'), 10);
      deleteComentario(this.getAttribute('data-id'), idx);
    });
  });
}

function deleteComentario(audienciaId, index) {
  const comentarios = getComentarios(audienciaId);
  comentarios.splice(index, 1);
  setComentarios(audienciaId, comentarios);
  renderComentariosList(audienciaId);
}

// -------------------------------
// Gestión de Tipos
// -------------------------------
const DEFAULT_TIPOS_AUDIENCIA = [
  'Inicial','Intermedia','Ratificación','Admisión','Confesional','Reanudación','Incidental','Constitucional'
];

function caseInsensitiveSort(a,b){ return a.localeCompare(b,'es',{sensitivity:'base'}); }
function getTiposAudiencia(){
  try{
    const raw = localStorage.getItem('tiposAudiencia');
    if (raw){
      const arr = JSON.parse(raw);
      return Array.from(new Set(arr.filter(Boolean))).sort(caseInsensitiveSort);
    }
  }catch(e){}
  setTiposAudiencia(DEFAULT_TIPOS_AUDIENCIA);
  return [...DEFAULT_TIPOS_AUDIENCIA].sort(caseInsensitiveSort);
}
function setTiposAudiencia(arr){
  const clean = Array.from(new Set((arr||[]).map(s => (s||'').trim()).filter(Boolean)));
  localStorage.setItem('tiposAudiencia', JSON.stringify(clean));
}
function renderTipoOptions(){
  const tipos = getTiposAudiencia();
  const selForm = document.getElementById('tipo-audiencia');
  if (selForm){
    selForm.innerHTML = '<option value="">Seleccione un tipo</option>' +
      tipos.map(t => `<option value="${escapeHTML(t)}">${escapeHTML(t)}</option>`).join('');
  }
  const selFiltro = document.getElementById('filter-tipo');
  if (selFiltro){
    const current = selFiltro.value;
    selFiltro.innerHTML = '<option value="">Todos los tipos</option>' +
      tipos.map(t => `<option value="${escapeHTML(t)}">${escapeHTML(t)}</option>`).join('');
    if ([...selFiltro.options].some(o => o.value === current)) selFiltro.value = current;
  }
}
function existsIgnoringCase(arr, value, ignoreIndex=-1){
  return arr.some((x,idx) => idx!==ignoreIndex && x.localeCompare(value,'es',{sensitivity:'base'})===0);
}
function initGestionTiposAudiencia(){
  const modal = document.getElementById('modal-tipos-audiencia');
  const btnOpen = document.getElementById('manage-tipos-btn');
  const btnClose = document.getElementById('close-modal-tipos');
  const btnCancel = document.getElementById('cancel-tipos');
  const btnSave = document.getElementById('save-tipos');
  const btnAdd = document.getElementById('add-tipo-btn');
  const inputNuevo = document.getElementById('nuevo-tipo-audiencia');
  const ul = document.getElementById('lista-tipos-audiencia');

  let workingList = getTiposAudiencia();

  function open(){ workingList = getTiposAudiencia(); renderList(); modal.style.display='flex'; inputNuevo.value=''; inputNuevo.focus(); }
  function close(){ modal.style.display='none'; }
  function renderList(){
    if (!ul) return;
    if (!workingList.length){ ul.innerHTML = `<li style="color:#666;">Sin tipos registrados.</li>`; return; }
    ul.innerHTML = workingList.map((t,idx)=>`
      <li style="display:flex; align-items:center; gap:8px; padding:8px 0; border-bottom:1px solid #eee;">
        <span style="flex:1;" data-idx="${idx}" class="tipo-text">${escapeHTML(t)}</span>
        <button class="btn btn-info btn-sm edit-tipo" data-idx="${idx}" title="Editar"><i class="fas fa-pen"></i></button>
        <button class="btn btn-danger btn-sm del-tipo" data-idx="${idx}" title="Eliminar"><i class="fas fa-trash"></i></button>
      </li>`).join('');

    ul.querySelectorAll('.edit-tipo').forEach(b=>{
      b.addEventListener('click', ()=>{
        const i = parseInt(b.getAttribute('data-idx'),10);
        const actual = workingList[i] || '';
        const nuevo = prompt('Editar tipo de audiencia:', actual);
        if (nuevo===null) return;
        const normalized = (nuevo||'').trim();
        if (!normalized) return mostrarMensajeGlobal('El tipo no puede estar vacío.', 'danger');
        if (existsIgnoringCase(workingList, normalized, i)) return mostrarMensajeGlobal('Ya existe un tipo con ese nombre.', 'danger');
        workingList[i] = normalized;
        workingList.sort(caseInsensitiveSort);
        renderList();
      });
    });
    ul.querySelectorAll('.del-tipo').forEach(b=>{
      b.addEventListener('click', ()=>{
        const i = parseInt(b.getAttribute('data-idx'),10);
        const nombre = workingList[i];
        if (!confirm(`¿Eliminar el tipo "${nombre}"?`)) return;
        workingList.splice(i,1);
        renderList();
      });
    });
  }

  if (btnOpen) btnOpen.addEventListener('click', open);
  if (btnClose) btnClose.addEventListener('click', close);
  if (btnCancel) btnCancel.addEventListener('click', close);
  window.addEventListener('click', e=>{ if (e.target===modal) close(); });

  if (btnAdd) btnAdd.addEventListener('click', ()=>{
    const val = (inputNuevo.value||'').trim();
    if (!val) return mostrarMensajeGlobal('Escribe un nombre para el nuevo tipo.', 'danger');
    if (existsIgnoringCase(workingList, val)) return mostrarMensajeGlobal('Ese tipo ya existe.', 'danger');
    workingList.push(val);
    workingList.sort(caseInsensitiveSort);
    inputNuevo.value='';
    renderList();
  });
  if (btnSave) btnSave.addEventListener('click', ()=>{
    setTiposAudiencia(workingList);
    renderTipoOptions();
    close();
  });
}

// -------------------------------
// Modal: Historial
// -------------------------------
function openHistorialCambiosModal(audienciaId) {
  const modal = document.getElementById('modal-historial-cambios');
  const input = modal.querySelector('.readonly-field');
  if (input) input.value = `Audiencia ID ${audienciaId}`;
  modal.style.display = 'flex';
}
function initModalHistorialCambios() {
  const modal = document.getElementById('modal-historial-cambios');
  const btnClose = document.getElementById('close-modal-historial');
  const btnCancel = document.getElementById('cancel-historial');
  if (btnClose) btnClose.addEventListener('click', () => modal.style.display = 'none');
  if (btnCancel) btnCancel.addEventListener('click', () => modal.style.display = 'none');
  window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
}

// -------------------------------
// Modal: Desahogar/Finalizar
// -------------------------------
function initModalFinalizarAudiencia() {
  const modal = document.getElementById('modal-finalizar-audiencia');
  const btnClose = document.getElementById('close-modal-finalizar');
  const btnCancel = document.getElementById('cancel-finalizar');
  const btnOk = document.getElementById('confirmar-finalizar');

  if (btnClose) btnClose.addEventListener('click', () => modal.style.display='none');
  if (btnCancel) btnCancel.addEventListener('click', () => modal.style.display='none');
  if (btnOk) btnOk.addEventListener('click', () => {
    const id = document.getElementById('finalizar-audiencia-id').value;
    const obs = document.getElementById('observaciones-finales').value.trim();
    if (!obs) return mostrarMensajeGlobal('Las observaciones son obligatorias para finalizar.', 'danger');
    
    const idx = AUDIENCIAS.findIndex(a => a.id == id);
    if (idx !== -1) {
        AUDIENCIAS[idx].atendida = true;
        AUDIENCIAS[idx].observaciones = obs;
        
        const audLS = JSON.parse(localStorage.getItem('audiencias') || '[]');
        const idxLS = audLS.findIndex(a => String(a.id) === String(id));
        if (idxLS !== -1) {
            audLS[idxLS].atendida = true;
            audLS[idxLS].observaciones = obs;
            localStorage.setItem('audiencias', JSON.stringify(audLS));
        }
        
        mostrarMensajeGlobal('Audiencia desahogada correctamente.', 'success');
        loadAudiencias();
    }
    
    modal.style.display='none';
    document.getElementById('observaciones-finales').value = '';
  });

  window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display='none'; });
}

function openFinalizarAudienciaModal(audienciaId) {
  const modal = document.getElementById('modal-finalizar-audiencia');
  document.getElementById('finalizar-audiencia-id').value = audienciaId;
  document.getElementById('observaciones-finales').value = '';
  modal.style.display = 'flex';
}

// -------------------------------
// Modal: Reasignar
// -------------------------------
function initModalReasignarAudiencia() {
    const modal = document.getElementById('modal-reasignar-audiencia');
    if (!modal) return;

    const btnClose = document.getElementById('close-modal-reasignar-audiencia');
    const btnCancel = document.getElementById('cancel-reasignar-audiencia');
    const btnSave = document.getElementById('save-reasignar-audiencia');

    const closeModal = () => {
        modal.style.display = 'none';
        document.getElementById('form-reasignar-audiencia').reset();
    };

    if (btnClose) btnClose.onclick = closeModal;
    if (btnCancel) btnCancel.onclick = closeModal;

    if (btnSave) {
        btnSave.onclick = function() {
            const audienciaId = document.getElementById('reasignar-audiencia-id').value;
            const nuevoAbogadoSelect = document.getElementById('select-nuevo-abogado-audiencia');
            const nuevoAbogadoNombre = nuevoAbogadoSelect.value;
            
            if (!nuevoAbogadoNombre) {
                mostrarMensajeGlobal('Por favor, seleccione un nuevo abogado.', 'danger');
                return;
            }
            
            guardarReasignacionAudiencia(audienciaId, nuevoAbogadoNombre);
            closeModal();
        };
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
}

function cargarAbogadosSelects() {
    const selectores = [
        document.getElementById('abogado-comparece'), 
        document.getElementById('select-nuevo-abogado-audiencia')
    ];
    
    selectores.forEach(selector => {
        if (selector) {
            const valorActual = selector.value;
            selector.innerHTML = '<option value="">Seleccione un abogado...</option>';
            
            LISTA_ABOGADOS.forEach(nombre => {
                const option = document.createElement('option');
                option.value = nombre;
                option.textContent = nombre;
                selector.appendChild(option);
            });
            
            if (valorActual) {
                selector.value = valorActual;
            }
        }
    });
}

function abrirModalReasignarAudiencia(audienciaId) {
    const modal = document.getElementById('modal-reasignar-audiencia');
    if (!modal) {
        console.error('Modal de reasignar no encontrado');
        return;
    }

    const audiencia = AUDIENCIAS.find(t => t.id == audienciaId);
    if (!audiencia) {
        mostrarMensajeGlobal('Error: No se encontró la audiencia.', 'danger');
        return;
    }

    document.getElementById('reasignar-audiencia-id').value = audienciaId;
    document.getElementById('reasignar-tipo-audiencia').value = audiencia.tipo || 'N/A';
    document.getElementById('reasignar-abogado-actual-audiencia').value = audiencia.abogadoComparece || 'No asignado';
    
    modal.style.display = 'flex';
}

function guardarReasignacionAudiencia(audienciaId, nuevoAbogadoNombre) {
    const audiencia = AUDIENCIAS.find(t => t.id == audienciaId);
    if (!audiencia) return;

    console.log(`Reasignando audiencia ID ${audienciaId} a: ${nuevoAbogadoNombre}`);

    const index = AUDIENCIAS.findIndex(t => t.id == audienciaId);
    AUDIENCIAS[index].abogadoComparece = nuevoAbogadoNombre;
    
    let audienciasLS = JSON.parse(localStorage.getItem('audiencias'));
    const lsIndex = audienciasLS.findIndex(t => t.id == audienciaId);
    audienciasLS[lsIndex].abogadoComparece = nuevoAbogadoNombre;
    localStorage.setItem('audiencias', JSON.stringify(audienciasLS));
    
    console.log(`Audiencia reasignada a ${nuevoAbogadoNombre} por ${USER_ROLE}`);
    
    mostrarMensajeGlobal('Audiencia reasignada exitosamente', 'success');
    loadAudiencias();
}

// -------------------------------
// Nuevas Acciones del Menú
// -------------------------------
function verDetallesAsunto(asuntoId) {
    if (!asuntoId) {
        mostrarMensajeGlobal('Error: Esta audiencia no tiene un asunto asociado.', 'danger');
        return;
    }
    console.log(`Redirigiendo a detalles del asunto ID: ${asuntoId}`);
    window.location.href = `asuntos-detalle.html?id=${asuntoId}`;
}

function eliminarAudiencia(audienciaId) {
    if (USER_ROLE !== 'Direccion') {
        mostrarMensajeGlobal('Acción no permitida.', 'danger');
        return;
    }
    
    const confirmacion = confirm('¿Estás seguro de que deseas ELIMINAR esta audiencia?\n\nEsta acción no se puede deshacer.');
    
    if (confirmacion) {
        console.log(`Eliminando audiencia ID: ${audienciaId}`);
        
        AUDIENCIAS = AUDIENCIAS.filter(t => t.id != audienciaId);
        
        let audienciasLS = JSON.parse(localStorage.getItem('audiencias'));
        audienciasLS = audienciasLS.filter(t => t.id != audienciaId);
        localStorage.setItem('audiencias', JSON.stringify(audienciasLS));
        
        mostrarMensajeGlobal('Audiencia eliminada.', 'success');
        loadAudiencias();
    }
}

function subirActa(id, file) {
    const audiencia = AUDIENCIAS.find(t => t.id == id);
    if (!audiencia) return;

    const nuevoNombreArchivo = file.name;
    
    audiencia.actaDocumento = nuevoNombreArchivo;
    
    let audienciasLS = JSON.parse(localStorage.getItem('audiencias'));
    const lsIndex = audienciasLS.findIndex(t => t.id == id);
    audienciasLS[lsIndex].actaDocumento = nuevoNombreArchivo;
    localStorage.setItem('audiencias', JSON.stringify(audienciasLS));
    
    console.log(`Nueva acta '${nuevoNombreArchivo}' subida por ${USER_ROLE}`);
    
    mostrarMensajeGlobal(`Acta '${nuevoNombreArchivo}' subida.`, 'success');
    loadAudiencias();
}

function descargarActa(nombreArchivo, expediente) {
    if (!nombreArchivo) {
        mostrarMensajeGlobal('Esta audiencia no tiene un acta para descargar.', 'info');
        return;
    }
    console.log('📥 Descargando acta:', nombreArchivo, 'para expediente:', expediente);
    
    const enlace = document.createElement('a');
    enlace.href = '#'; // Simulación
    enlace.download = nombreArchivo;
    enlace.click();
    
    mostrarMensajeGlobal(`Descarga simulada de: ${nombreArchivo}`, 'success');
}

// -------------------------------
// Función de utilidad para mensajes
// -------------------------------
function mostrarMensajeGlobal(mensaje, tipo = 'success') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `alert alert-${tipo}`;
    msgDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; padding: 15px; border-radius: 5px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);';
    
    if (tipo === 'success') {
        msgDiv.style.backgroundColor = '#d4edda';
        msgDiv.style.color = '#155724';
        msgDiv.style.borderColor = '#c3e6cb';
    } else if (tipo === 'danger') {
        msgDiv.style.backgroundColor = '#f8d7da';
        msgDiv.style.color = '#721c24';
        msgDiv.style.borderColor = '#f5c6cb';
    } else {
        msgDiv.style.backgroundColor = '#d1ecf1';
        msgDiv.style.color = '#0c5460';
        msgDiv.style.borderColor = '#bee5eb';
    }
    
    msgDiv.innerHTML = `<i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${mensaje}`;
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
        if (msgDiv.parentNode) {
            msgDiv.parentNode.removeChild(msgDiv); 
        }
    }, 3000);
}