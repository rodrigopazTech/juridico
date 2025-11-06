// Lista de estados mexicanos para el filtro de gerencias
const estadosMexicoAudiencias = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
    'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
    'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
    'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

// Función para calcular el estado del semáforo para audiencias
function getSemaforoStatusAudiencia(fecha, hora) {
    const today = new Date();
    const audienciaDateTime = new Date(fecha + 'T' + hora);
    const diffTime = audienciaDateTime - today;
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours <= 24) {
        return { color: 'rojo', class: 'semaforo-rojo', tooltip: diffHours <= 0 ? 'En curso o pasada' : `En ${diffHours} horas` };
    } else if (diffDays <= 3) {
        return { color: 'amarillo', class: 'semaforo-amarillo', tooltip: `En ${diffDays} días` };
    } else {
        return { color: 'verde', class: 'semaforo-verde', tooltip: `En ${diffDays} días` };
    }
}

function initAudiencias() {
    // Cargar datos de audiencias
    loadAudiencias();
    
    // Configurar búsqueda
    setupSearch();
    
    // Configurar filtros
    setupFilters();
    
    // Configurar buscador de gerencias (estados)
    setupGerenciaSearch();
    
    // Configurar buscador de expedientes (desde Asuntos)
    setupExpedienteSearch();
    
    // Configurar selector de asunto para audiencias
    setupAsuntoSelectorAudiencia();
    
    // Configurar subida de archivos
    setupFileUploadAudiencia();
    
    // El botón para nueva audiencia ahora está manejado en el HTML
}

// Función para configurar el selector de asunto en audiencias
function setupAsuntoSelectorAudiencia() {
    const selector = document.getElementById('asunto-selector-audiencia');
    if (selector) {
        // Cargar asuntos disponibles
        cargarAsuntosEnSelectorAudiencia();
        
        // Configurar evento de cambio
        selector.addEventListener('change', function() {
            cargarDatosAsuntoAudiencia(this.value);
        });
    }
}

// Función para cargar asuntos en el selector de audiencias
function cargarAsuntosEnSelectorAudiencia() {
    const selector = document.getElementById('asunto-selector-audiencia');
    if (!selector) return;
    
    // Obtener asuntos del localStorage
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    
    // Limpiar selector
    selector.innerHTML = '<option value="">Seleccionar Asunto</option>';
    
    // Agregar asuntos al selector
    asuntos.forEach(asunto => {
        const option = document.createElement('option');
        option.value = asunto.id;
        option.textContent = `${asunto.expediente} - ${asunto.descripcion}`;
        selector.appendChild(option);
    });
    
    console.log(`${asuntos.length} asuntos cargados en el selector de audiencias`);
}

// Función para cargar datos auto-llenados del asunto seleccionado en audiencias
function cargarDatosAsuntoAudiencia(asuntoId) {
    console.log('Cargando datos del asunto para audiencia:', asuntoId);
    
    if (!asuntoId) {
        limpiarCamposAutoLlenadosAudiencia();
        return;
    }
    
    // Obtener asuntos del localStorage
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    const asunto = asuntos.find(a => a.id === asuntoId);
    
    if (asunto) {
        // Llenar campos auto-llenados
        document.getElementById('expediente-auto-audiencia').value = asunto.expediente || '';
        document.getElementById('materia-auto-audiencia').value = asunto.materia || '';
        document.getElementById('gerencia-auto-audiencia').value = asunto.gerencia || '';
        document.getElementById('abogado-auto-audiencia').value = asunto.abogado || '';
        document.getElementById('partes-auto-audiencia').value = asunto.partes || '';
        document.getElementById('organo-auto-audiencia').value = asunto.organoJurisdiccional || '';
        document.getElementById('prioridad-auto-audiencia').value = asunto.prioridad || '';
        
        console.log('Datos del asunto cargados en audiencia:', asunto);
    } else {
        limpiarCamposAutoLlenadosAudiencia();
        console.log('Asunto no encontrado para audiencia');
    }
}

function limpiarCamposAutoLlenadosAudiencia() {
    const campos = ['expediente-auto-audiencia', 'materia-auto-audiencia', 'gerencia-auto-audiencia', 
                   'abogado-auto-audiencia', 'partes-auto-audiencia', 'organo-auto-audiencia', 'prioridad-auto-audiencia'];
    campos.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) campo.value = '';
    });
}

// Función para configurar la subida de archivos
function setupFileUploadAudiencia() {
    const fileInput = document.getElementById('acta-documento');
    const fileName = document.getElementById('acta-filename');
    
    if (fileInput && fileName) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                fileName.textContent = this.files[0].name;
                fileName.classList.add('has-file');
            } else {
                fileName.textContent = 'Ningún archivo seleccionado';
                fileName.classList.remove('has-file');
            }
        });
    }
}

// Función para guardar audiencia
function guardarAudiencia() {
    console.log('Guardando audiencia...');
    
    // Verificar si es edición o nueva audiencia
    const audienciaId = document.getElementById('audiencia-id').value;
    const isEditing = audienciaId && audienciaId !== '';
    
    // Obtener valores del formulario
    const audienciaData = {
        // Datos heredados del asunto (solo para referencia)
        asuntoId: document.getElementById('asunto-selector-audiencia').value,
        
        // Datos específicos de la audiencia (coinciden con la BD)
        fechaAudiencia: document.getElementById('fecha-audiencia').value,
        horaAudiencia: document.getElementById('hora-audiencia').value,
        tipoAudiencia: document.getElementById('tipo-audiencia').value,
        abogadoComparece: parseInt(document.getElementById('abogado-comparece').value),
        observaciones: document.getElementById('observaciones').value.trim(),
        atendida: document.getElementById('atendida').value === 'true',
        recordatorioDias: parseInt(document.getElementById('recordatorio-dias').value) || 1,
        recordatorioHoras: parseInt(document.getElementById('recordatorio-horas').value) || 2
    };
    
    // Manejar archivo (preservar el existente si no se selecciona uno nuevo)
    const archivoInput = document.getElementById('acta-documento');
    if (archivoInput.files[0]) {
        audienciaData.actaDocumento = archivoInput.files[0].name;
    } else if (isEditing) {
        // Mantener el archivo existente si estamos editando y no se seleccionó uno nuevo
        const audienciaExistente = AUDIENCIAS.find(a => a.id == audienciaId);
        audienciaData.actaDocumento = audienciaExistente?.actaDocumento || '';
    } else {
        audienciaData.actaDocumento = '';
    }
    
    // Validar campos obligatorios
    if (!audienciaData.asuntoId) {
        alert('Por favor, selecciona un asunto.');
        return;
    }
    
    if (!audienciaData.tipoAudiencia || !audienciaData.fechaAudiencia || !audienciaData.horaAudiencia || !audienciaData.abogadoComparece) {
        alert('Por favor, completa todos los campos obligatorios (Tipo, Fecha, Hora y Abogado que Comparece).');
        return;
    }
    
    // Validar que la fecha de audiencia no sea en el pasado (solo para nuevas audiencias)
    if (!isEditing) {
        const hoy = new Date().toISOString().split('T')[0];
        if (audienciaData.fechaAudiencia < hoy) {
            alert('La fecha de la audiencia no puede ser en el pasado.');
            return;
        }
    }
    
    // Obtener audiencias existentes
    let audiencias = JSON.parse(localStorage.getItem('audiencias')) || [];
    
    if (isEditing) {
        // Modo edición: actualizar audiencia existente
        const index = AUDIENCIAS.findIndex(a => a.id == audienciaId);
        if (index !== -1) {
            // Mantener ID y fecha de creación originales
            audienciaData.id = AUDIENCIAS[index].id;
            audienciaData.fechaCreacion = AUDIENCIAS[index].fechaCreacion;
            audienciaData.fechaModificacion = new Date().toISOString().split('T')[0];
            
            // Actualizar en el array global
            AUDIENCIAS[index] = { ...AUDIENCIAS[index], ...audienciaData };
            
            // Actualizar en localStorage
            const localStorageIndex = audiencias.findIndex(a => a.id == audienciaId);
            if (localStorageIndex !== -1) {
                audiencias[localStorageIndex] = AUDIENCIAS[index];
            }
            
            alert('Audiencia actualizada exitosamente.');
        } else {
            alert('Error: No se encontró la audiencia a editar.');
            return;
        }
    } else {
        // Modo nueva audiencia
        audienciaData.id = Date.now().toString();
        audienciaData.fechaCreacion = new Date().toISOString().split('T')[0];
        
        // Agregar nueva audiencia
        audiencias.push(audienciaData);
        AUDIENCIAS.push(audienciaData);
        
        alert('Audiencia guardada exitosamente.');
    }
    
    // Guardar en localStorage
    localStorage.setItem('audiencias', JSON.stringify(audiencias));
    
    // Limpiar formulario
    document.getElementById('form-audiencia').reset();
    limpiarCamposAutoLlenadosAudiencia();
    document.getElementById('acta-filename').textContent = 'Ningún archivo seleccionado';
    document.getElementById('acta-filename').classList.remove('has-file');
    
    // Cerrar modal si está abierto
    const modal = document.getElementById('modal-audiencia');
    if (modal) modal.style.display = 'none';
    
    // Actualizar la tabla si estamos en la vista de audiencias
    if (typeof loadAudiencias === 'function') {
        loadAudiencias();
    }
    
    console.log('Audiencia procesada:', audienciaData);
}
// Estado global simple
let AUDIENCIAS = [];
function loadAudiencias() {
  const tbody = document.getElementById('audiencias-body');

  // Datos de ejemplo (solo si está vacío; así no perdemos cambios al refrescar tabla)
  if (AUDIENCIAS.length === 0) {
    AUDIENCIAS = [
      {
        id: 1,
        fecha: '2025-11-01', // HOY - ROJO
        hora: '15:00',
        tribunal: 'Primer Tribunal Colegiado en Materia Laboral',
        expediente: '2375/2025',
        actor: 'Ortega Ibarra Juan Carlos',
        tipo: 'Inicial',
        materia: 'Laboral',
        demandado: 'Empresa Constructora S.A. de C.V.',
        gerencia: 'Ciudad de México',
        abogadoEncargado: 'Lic. María González Ruiz',
        abogadoComparece: 'Lic. Carlos Hernández López',
        observaciones: '',
        prioridad: 'Alta',
        actaNombre: ''
      },
      {
        id: 2,
        fecha: '2025-11-02', // MAÑANA - ROJO
        hora: '10:00',
        tribunal: 'Segundo Tribunal Colegiado',
        expediente: '1595/2025',
        actor: 'Sosa Uc Roberto',
        tipo: 'Intermedia',
        materia: 'Penal',
        demandado: 'Comercializadora del Sureste S.A.',
        gerencia: 'Yucatán',
        abogadoEncargado: 'Lic. Ana Patricia Morales',
        abogadoComparece: 'Lic. Roberto Silva Martínez',
        observaciones: '',
        prioridad: 'Media',
        actaNombre: ''
      },
      {
        id: 3,
        fecha: '2025-11-04', // EN 3 DÍAS - AMARILLO
        hora: '11:30',
        tribunal: 'Tercer Tribunal de Distrito',
        expediente: '2156/2025',
        actor: 'González Martín Luis',
        tipo: 'Ratificación',
        materia: 'Civil',
        demandado: 'Inmobiliaria Central S.C.',
        gerencia: 'Nuevo León',
        abogadoEncargado: 'Lic. Sandra Jiménez Castro',
        abogadoComparece: 'Lic. Fernando Ramírez Torres',
        observaciones: '',
        prioridad: 'Alta',
        actaNombre: ''
      },
      {
        id: 4,
        fecha: '2025-11-12', // EN 11 DÍAS - VERDE
        hora: '09:00',
        tribunal: 'Cuarto Tribunal Colegiado',
        expediente: '1842/2025',
        actor: 'Hernández Silva María',
        tipo: 'Confesional',
        materia: 'Mercantil',
        demandado: 'Distribuidora Nacional S.A.',
        gerencia: 'Jalisco',
        abogadoEncargado: 'Lic. Carmen Delgado Vázquez',
        abogadoComparece: 'Lic. Alejandro Mendoza Ruiz',
        observaciones: '',
        prioridad: 'Baja',
        actaNombre: ''
      }
    ];
  }

  let html = '';
  AUDIENCIAS.forEach(audiencia => {
    const semaforoStatus = getSemaforoStatusAudiencia(audiencia.fecha, audiencia.hora);
    
    html += `
      <tr data-tipo="${audiencia.tipo}" data-gerencia="${audiencia.gerencia}" data-materia="${audiencia.materia}" data-prioridad="${audiencia.prioridad}">
        <td>
          <button class="toggle-expand" data-id="${audiencia.id}">
            <i class="fas fa-chevron-down"></i>
          </button>
        </td>
        <td>
          <div class="semaforo-container">
            <div class="semaforo-dot ${semaforoStatus.class}" title="${semaforoStatus.tooltip}"></div>
            ${formatDate(audiencia.fecha)}
          </div>
        </td>
        <td>${audiencia.hora}</td>
        <td>${audiencia.tribunal}</td>
        <td>${audiencia.expediente}</td>
        <td>${audiencia.actor}</td>

        <td class="actions">
            <button class="btn btn-secondary btn-sm view-changes" data-id="${audiencia.id}" title="Ver cambios">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-primary btn-sm edit-audiencia" data-id="${audiencia.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-presentado btn-sm comment-audiencia" data-id="${audiencia.id}" title="Agregar comentario">
              <i class="fas fa-comment-dots"></i>
            </button>
            <input type="checkbox" class="delete-audiencia" data-id="${audiencia.id}" title="Finalizar audiencia"> Desahogado
        </td>
      </tr>
      <tr class="expandable-row" id="expand-audiencia-${audiencia.id}">
        <td colspan="7">
          <div class="expandable-content">
            <table>
              <tr>
                <th>Tipo de Audiencia</th>
                <td>${audiencia.tipo}</td>
                <th>Materia</th>
                <td><span class="badge badge-${audiencia.materia.toLowerCase()}">${audiencia.materia}</span></td>
              </tr>
              <tr>
                <th>Demandado</th>
                <td>${audiencia.demandado}</td>
                <th>Prioridad</th>
                <td><span class="badge badge-${audiencia.prioridad.toLowerCase()}">${audiencia.prioridad}</span></td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;

  setupExpandableRows();
  setupActionButtons();
  setupActaUpload();
}
function saveAudiencia() {
    // Llamar a la nueva función de guardar audiencia
    guardarAudiencia();

  // Cerrar modal y refrescar tabla
  document.getElementById('modal-audiencia').style.display = 'none';
  loadAudiencias();
}



function setupExpandableRows() {
    document.querySelectorAll('.toggle-expand').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const expandableRow = document.getElementById(`expand-audiencia-${id}`);
            const icon = this.querySelector('i');
            
            if (expandableRow.classList.contains('active')) {
                expandableRow.classList.remove('active');
                icon.className = 'fas fa-chevron-down';
            } else {
                expandableRow.classList.add('active');
                icon.className = 'fas fa-chevron-up';
            }
        });
    });
}
function setupActionButtons() {
  // Editar -> abre el modal con datos precargados
  document.querySelectorAll('.edit-audiencia').forEach(button => {
    button.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'), 10);
      const audiencia = AUDIENCIAS.find(a => a.id === id);
      if (!audiencia) {
        alert('No se encontró la audiencia a editar.');
        return;
      }
      openAudienciaModal(audiencia); // ya tienes esta función y soporta modo edición
    });
    // Ver cambios (abre modal demostrativo)
  document.querySelectorAll('.view-changes').forEach(button => {
    button.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      openHistorialCambiosModal(id);
    });
});

  });

  // Comentarios (ya lo tenías)
  document.querySelectorAll('.comment-audiencia').forEach(button => {
    button.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      openComentariosModal(id);
    });
  });

  // Finalizar audiencia (checkbox)
  document.querySelectorAll('.delete-audiencia').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      if (this.checked) {
        const id = this.getAttribute('data-id');
        // Abrir modal para finalizar audiencia
        openFinalizarAudienciaModal(id);
      }
    });
  });
}


function setupActaUpload() {
  // Click en botón = dispara input file
  document.querySelectorAll('.btn-subir-acta').forEach(btn => {
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      const input = document.querySelector(`.input-acta[data-id="${id}"]`);
      if (input) input.click();
    });
  });

  // Al seleccionar archivo, persistimos en AUDIENCIAS
  document.querySelectorAll('.input-acta').forEach(input => {
    input.addEventListener('change', function () {
      const id = parseInt(this.getAttribute('data-id'), 10);

      if (this.files && this.files.length > 0) {
        const fileName = this.files[0].name;
        
        const idx = AUDIENCIAS.findIndex(a => a.id === id);
        if (idx !== -1) {
          AUDIENCIAS[idx].actaNombre = fileName;
          // Opcional: persistir en localStorage para que no se pierda al recargar
          // localStorage.setItem('AUDIENCIAS_DATA', JSON.stringify(AUDIENCIAS));
          
          // Mostrar confirmación visual del archivo subido
          const btn = document.querySelector(`button[data-id="${id}"].btn-subir-acta`);
          if (btn) {
            btn.classList.add('uploaded');
            btn.title = `Acta subida: ${fileName}`;
            setTimeout(() => {
              btn.classList.remove('uploaded');
            }, 2000);
          }
        }

        // Aquí podrías subir el archivo via fetch/FormData a tu API
        // const formData = new FormData();
        // formData.append('acta', this.files[0]);
        // fetch('/api/audiencias/' + id + '/acta', { method: 'POST', body: formData })
      }
    });
  });
}


function setupSearch() {
  const searchInput = document.getElementById('search-audiencias');

  searchInput.addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const tbody = document.getElementById('audiencias-body');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Recorremos en pares: [mainRow, expandableRow]
    for (let i = 0; i < rows.length; i += 2) {
      const mainRow = rows[i];
      const expRow  = rows[i + 1]; // puede existir o no (en tu caso sí existe)

      const text = (mainRow.textContent + (expRow ? expRow.textContent : '')).toLowerCase();
      const show = text.includes(searchTerm);

      mainRow.style.display = show ? '' : 'none';
      if (expRow) expRow.style.display = show ? '' : 'none';
    }
  });
}

function setupFilters() {
    // Configurar filtros normales (todos excepto gerencias que es buscador)
    const filters = ['filter-tipo', 'filter-materia', 'filter-prioridad'];
    
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });
}

function applyFilters() {
    const tipo = document.getElementById('filter-tipo').value;
    const gerencia = document.getElementById('filter-gerencia').value.trim(); // Es buscador
    const materia = document.getElementById('filter-materia').value;
    const prioridad = document.getElementById('filter-prioridad').value;

    const rows = document.querySelectorAll('#audiencias-body tr:not(.expandable-row)');

    rows.forEach(row => {
        const rowTipo = row.getAttribute('data-tipo') || '';
        const rowGerencia = row.getAttribute('data-gerencia') || '';
        const rowMateria = row.getAttribute('data-materia') || '';
        const rowPrioridad = row.getAttribute('data-prioridad') || '';

        // Aplicar filtros - gerencia usa coincidencia parcial (buscador), los demás coincidencia exacta
        const matchesTipo = !tipo || rowTipo.includes(tipo);
        const matchesGerencia = !gerencia || rowGerencia.toLowerCase().includes(gerencia.toLowerCase());
        const matchesMateria = !materia || rowMateria.includes(materia);
        const matchesPrioridad = !prioridad || rowPrioridad.includes(prioridad);

        // Mostrar/ocultar fila según los filtros
        const audienciaId = row.querySelector('.toggle-expand')?.getAttribute('data-id');
        const expandableRow = document.getElementById(`expand-audiencia-${audienciaId}`);

        if (matchesTipo && matchesGerencia && matchesMateria && matchesPrioridad) {
            row.style.display = '';
            if (expandableRow && row.querySelector('.toggle-expand').innerHTML.includes('chevron-up')) {
                expandableRow.style.display = 'table-row';
            }
        } else {
            row.style.display = 'none';
            if (expandableRow) {
                expandableRow.style.display = 'none';
            }
        }
    });
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function initModalComentarios() {
  const modal = document.getElementById('modal-comentarios');
  const btnClose = document.getElementById('close-modal-comentarios');
  const btnSave = document.getElementById('save-comentario');

  if (btnClose) {
    btnClose.addEventListener('click', () => modal.style.display = 'none');
  }

  if (btnSave) {
    btnSave.addEventListener('click', saveComentario);
  }

  // Cerrar al hacer clic fuera
  window.addEventListener('click', function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
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

  if (!texto) {
    alert('Escribe un comentario.');
    return;
  }

  const comentarios = getComentarios(audienciaId);
  comentarios.push({
    text: texto,
    ts: Date.now()
  });
  setComentarios(audienciaId, comentarios);

  textarea.value = '';
  renderComentariosList(audienciaId);
}

function renderComentariosList(audienciaId) {
  const ul = document.getElementById('lista-comentarios');
  const comentarios = getComentarios(audienciaId);

  if (!ul) return;

  if (comentarios.length === 0) {
    ul.innerHTML = `<li style="color:#666;">Sin comentarios aún.</li>`;
    return;
  }

  ul.innerHTML = comentarios.map((c, idx) => {
    const fecha = formatDateTime(c.ts);
    const safeText = escapeHTML(c.text);
    return `
      <li class="comment-item">
        <div class="comment-meta">
          <span>${fecha}</span>
          <button class="btn btn-danger btn-sm" data-idx="${idx}" data-id="${audienciaId}" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <div class="comment-text">${safeText}</div>
      </li>
    `;
  }).join('');

  // wire up delete buttons
  ul.querySelectorAll('button.btn-danger').forEach(btn => {
    btn.addEventListener('click', function() {
      const idx = parseInt(this.getAttribute('data-idx'), 10);
      const id = this.getAttribute('data-id');
      deleteComentario(id, idx);
    });
  });
}

function deleteComentario(audienciaId, index) {
  const comentarios = getComentarios(audienciaId);
  comentarios.splice(index, 1);
  setComentarios(audienciaId, comentarios);
  renderComentariosList(audienciaId);
}

/* Persistencia simple en localStorage */
function lsKey(audienciaId) {
  return `audiencia_comentarios_${audienciaId}`;
}

function getComentarios(audienciaId) {
  try {
    const raw = localStorage.getItem(lsKey(audienciaId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setComentarios(audienciaId, comentarios) {
  localStorage.setItem(lsKey(audienciaId), JSON.stringify(comentarios));
}

/* Utilidades */
function formatDateTime(ts) {
  const d = new Date(ts);
  // dd/mm/yyyy hh:mm
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

// Función para el buscador de gerencias (estados)

function setupGerenciaSearch() {
    const input = document.getElementById('filter-gerencia');
    const suggestionsDiv = document.getElementById('gerencia-suggestions');
    const clearBtn = document.getElementById('clear-gerencia');
    let selectedIndex = -1;

    // Manejar entrada de texto
    input.addEventListener('input', function() {
        const query = this.value.trim();
        updateClearButton();
        
        if (query.length === 0) {
            hideSuggestions();
            applyFilters();
            return;
        }

        showSuggestions(query);
        applyFilters();
    });

    // Mostrar todas las opciones al hacer clic en el campo
    input.addEventListener('focus', function() {
        const query = this.value.trim();
        showSuggestions(query || '');
    });

    // Manejar teclas de navegación
    input.addEventListener('keydown', function(e) {
        const suggestions = suggestionsDiv.querySelectorAll('.gerencia-suggestion[data-estado]');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
            updateSelectedSuggestion();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelectedSuggestion();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                selectSuggestion(suggestions[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });

    // Manejar clic fuera para cerrar sugerencias
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            hideSuggestions();
        }
    });

    // Botón limpiar
    clearBtn.addEventListener('click', function() {
        input.value = '';
        updateClearButton();
        hideSuggestions();
        applyFilters();
    });

    function showSuggestions(query) {
        let matches;
        
        if (query === '') {
            // Mostrar todos los estados si no hay filtro
            matches = estadosMexicoAudiencias;
        } else {
            // Filtrar estados que coincidan con la búsqueda
            matches = estadosMexicoAudiencias.filter(estado => 
                estado.toLowerCase().includes(query.toLowerCase())
            );
        }

        let html = '';
        
        // Agregar todas las coincidencias
        matches.forEach(estado => {
            html += `<div class="gerencia-suggestion" data-estado="${estado}">${estado}</div>`;
        });

        if (matches.length === 0) {
            html = '<div class="gerencia-suggestion" style="color: #666; font-style: italic;">No se encontraron coincidencias</div>';
        }

        suggestionsDiv.innerHTML = html;
        
        // Agregar event listeners a las sugerencias
        suggestionsDiv.querySelectorAll('.gerencia-suggestion[data-estado]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                selectSuggestion(this);
            });
        });

        suggestionsDiv.classList.add('show');
        selectedIndex = -1;
    }

    function selectSuggestion(suggestionElement) {
        const estado = suggestionElement.getAttribute('data-estado');
        if (!estado) return;

        input.value = estado;
        updateClearButton();
        hideSuggestions();
        applyFilters();
    }

    function updateSelectedSuggestion() {
        const suggestions = suggestionsDiv.querySelectorAll('.gerencia-suggestion[data-estado]');
        suggestions.forEach((suggestion, index) => {
            suggestion.classList.toggle('highlighted', index === selectedIndex);
        });
    }

    function hideSuggestions() {
        suggestionsDiv.classList.remove('show');
        selectedIndex = -1;
    }

    function updateClearButton() {
        if (input.value.trim()) {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }
    }
}

// Fin de las funciones de audiencias

// Función para actualizar estadísticas de asuntos cuando se crean audiencias
function updateAsuntoStats(expediente, type, increment) {
  try {
    const asuntos = JSON.parse(localStorage.getItem('asuntos') || '[]');
    const asuntoIndex = asuntos.findIndex(a => a.expediente === expediente);
    
    if (asuntoIndex !== -1) {
      if (!asuntos[asuntoIndex].stats) {
        asuntos[asuntoIndex].stats = { documentos: 0, audiencias: 0, terminos: 0, dias: 0 };
      }
      
      asuntos[asuntoIndex].stats[type] = (asuntos[asuntoIndex].stats[type] || 0) + increment;
      asuntos[asuntoIndex].ultimaActividad = new Date().toISOString().slice(0,10);
      
      localStorage.setItem('asuntos', JSON.stringify(asuntos));
      
      // Actualizar la vista de asuntos si está disponible
      if (typeof window.initAsuntos === 'function') {
        setTimeout(() => window.initAsuntos(), 100);
      }
    }
  } catch (e) {
    console.warn('No se pudieron actualizar las estadísticas del asunto:', e);
  }
}

// Buscador de Expedientes para el formulario de audiencias
function setupExpedienteSearch() {
  const input = document.getElementById('audiencia-expediente');
  const ul = document.getElementById('audiencia-expediente-suggestions');
  if (!input || !ul) return;

  let items = getExpedientesList();
  let selectedIndex = -1;

  input.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    items = getExpedientesList(); // refresh
    const matches = q ? items.filter(e => e.toLowerCase().includes(q)) : items;
    renderSuggestions(matches);
  });

  input.addEventListener('focus', function() {
    items = getExpedientesList();
    renderSuggestions(items);
  });

  input.addEventListener('keydown', function(e) {
    const visibles = ul.querySelectorAll('li[data-expediente]');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, visibles.length - 1);
      updateHighlight(visibles);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateHighlight(visibles);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && visibles[selectedIndex]) {
        chooseSuggestion(visibles[selectedIndex].getAttribute('data-expediente'));
      }
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !ul.contains(e.target)) hideSuggestions();
  });

  function getExpedientesList() {
    const set = new Set();
    try {
      const asuntos = JSON.parse(localStorage.getItem('asuntos') || '[]');
      asuntos.forEach(a => a.expediente && set.add(a.expediente));
    } catch (e) {}
    try {
      if (window.sampleData && Array.isArray(window.sampleData.terminos)) {
        window.sampleData.terminos.forEach(t => t.expediente && set.add(t.expediente));
      }
    } catch (e) {}
    try {
      AUDIENCIAS.forEach(a => a.expediente && set.add(a.expediente));
    } catch (e) {}
    return Array.from(set).sort();
  }

  function renderSuggestions(list) {
    if (!list || list.length === 0) {
      ul.style.display = 'none';
      ul.innerHTML = '';
      selectedIndex = -1;
      return;
    }
    ul.innerHTML = list.map((exp, idx) => `<li data-expediente="${exp}" class="suggestion-item">${exp}</li>`).join('');
    ul.style.display = 'block';
    selectedIndex = -1;

    ul.querySelectorAll('li[data-expediente]').forEach(li => {
      li.addEventListener('click', function() {
        chooseSuggestion(this.getAttribute('data-expediente'));
      });
    });
  }

  function chooseSuggestion(value) {
    input.value = value || '';
    hideSuggestions();
  }

  function updateHighlight(nodes) {
    nodes.forEach((n, i) => n.classList.toggle('highlighted', i === selectedIndex));
  }

  function hideSuggestions() {
    ul.style.display = 'none';
    selectedIndex = -1;
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}


