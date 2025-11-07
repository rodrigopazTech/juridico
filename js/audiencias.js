// ===============================
// Audiencias - JS fusionado
// ===============================

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

// -------------------------------
// Utilidades
// -------------------------------
function caseInsensitiveIncludes(haystack, needle){
  return (haystack||'').toString().toLowerCase().includes((needle||'').toString().toLowerCase());
}

function formatDate(dateString) {
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
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

  if (diffHours <= 24) {
    return { color: 'rojo', class: 'semaforo-rojo', tooltip: diffHours <= 0 ? 'En curso o pasada' : `En ${diffHours} horas` };
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
  loadAudiencias();
  setupSearch();
  setupFilters();
  setupGerenciaSearch();
  setupExpedienteSearch();
  setupAsuntoSelectorAudiencia();
  setupFileUploadAudiencia(); // del modal (acta-audiencia)
}

// -------------------------------
// Carga/Render de tabla
// -------------------------------

function loadAudiencias() {
  const tbody = document.getElementById('audiencias-body');

  // Lee de localStorage
  const ls = JSON.parse(localStorage.getItem('audiencias') || '[]');

  if (ls && ls.length) {
    // Caso normal: ya hay datos persistidos
    AUDIENCIAS = ls.map(a => ({ ...a, id: String(a.id) })); // normaliza id a string
  } else {
    // Demo inicial (ajusta si quieres otras)
    const DEMO = [
      {
        id: '1',
        fecha: '2025-11-06',
        hora: '10:00',
        tribunal: 'Juzgado Primero de lo Civil del Distrito Federal',
        expediente: '2354/2025',
        actor: 'Gómez Rivera Laura',
        tipo: 'Inicial',
        materia: 'Civil',
        demandado: 'Martínez Contreras Luis',
        gerencia: 'Ciudad de México',
        abogadoEncargado: 'Lic. María González Ruiz',
        abogadoComparece: 'Lic. Ana Patricia Morales',
        observaciones: 'Primera audiencia de ofrecimiento de pruebas',
        prioridad: 'Alta',
        actaDocumento: ''
      },
      {
        id: '2',
        fecha: '2025-11-08',
        hora: '09:30',
        tribunal: 'Tribunal Laboral Regional Norte',
        expediente: '5421/2025',
        actor: 'Ortega Ibarra Juan Carlos',
        tipo: 'Intermedia',
        materia: 'Laboral',
        demandado: 'Empresa Constructora S.A. de C.V.',
        gerencia: 'Nuevo León',
        abogadoEncargado: 'Lic. Roberto Silva Martínez',
        abogadoComparece: 'Lic. Carlos Hernández López',
        observaciones: 'Desahogo de testigos',
        prioridad: 'Media',
        actaDocumento: ''
      },
      {
        id: '3',
        fecha: '2025-11-10',
        hora: '12:00',
        tribunal: 'Juzgado Segundo en Materia Penal',
        expediente: '1987/2025',
        actor: 'Fiscalía del Estado',
        tipo: 'Testimonial',
        materia: 'Penal',
        demandado: 'Hernández Rivas Jorge',
        gerencia: 'Jalisco',
        abogadoEncargado: 'Lic. Sandra Jiménez Castro',
        abogadoComparece: 'Lic. Fernando Ramírez Torres',
        observaciones: 'Audiencia de testigos presenciales',
        prioridad: 'Alta',
        actaDocumento: ''
      }
    ];

    AUDIENCIAS = DEMO;
    // ⬅️ siembra en localStorage para que no se “pierdan” al primer guardado
    localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
  }

  // pinta la tabla (tu código existente a partir de aquí)
  let html = '';
  AUDIENCIAS.forEach(a => {
    const sem = getSemaforoStatusAudiencia(a.fecha, a.hora);
    html += `
      <tr data-tipo="${escapeHTML(a.tipo||'')}"
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
          <button class="btn btn-info btn-sm btn-subir-acta" title="Subir acta" data-id="${a.id}">
            <i class="fas fa-file-upload"></i>
          </button>
          <input type="file" class="input-acta" data-id="${a.id}" accept=".pdf,.doc,.docx" style="display:none;">
          <button class="btn btn-secondary btn-sm view-changes" data-id="${a.id}" title="Ver cambios">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-primary btn-sm edit-audiencia" data-id="${a.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-presentado btn-sm comment-audiencia" data-id="${a.id}" title="Agregar comentario">
            <i class="fas fa-comment-dots"></i>
          </button>
          <input type="checkbox" class="delete-audiencia" data-id="${a.id}" title="Finalizar audiencia"> Desahogado
        </td>
      </tr>
      <tr class="expandable-row" id="expand-audiencia-${a.id}">
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

// -------------------------------
// Guardado (alta/edición)
// -------------------------------
function saveAudiencia() {
  guardarAudiencia();
  // cierra modal y refresca tabla (por si la función no lo hace)
  const m = document.getElementById('modal-audiencia');
  if (m) m.style.display = 'none';
  loadAudiencias();
}

function guardarAudiencia() {
  console.log('Guardando audiencia...');

  const audienciaId = (document.getElementById('audiencia-id').value || '').trim();
  const isEditing = !!audienciaId;

  const audienciaData = {
    asuntoId: document.getElementById('asunto-selector-audiencia').value,
    fechaAudiencia: document.getElementById('fecha-audiencia').value,
    horaAudiencia: document.getElementById('hora-audiencia').value,
    tipoAudiencia: document.getElementById('tipo-audiencia').value,
    abogadoComparece: document.getElementById('abogado-comparece').value, // usa string para consistencia
    observaciones: (document.getElementById('observaciones')?.value || '').trim(),
    atendida: (document.getElementById('atendida')?.value === 'true'),
    recordatorioDias: parseInt(document.getElementById('recordatorio-dias')?.value) || 1,
    recordatorioHoras: parseInt(document.getElementById('recordatorio-horas')?.value) || 2
  };

  // Archivo
  const archivoInput = document.getElementById('acta-documento');
  if (archivoInput?.files?.[0]) {
    audienciaData.actaDocumento = archivoInput.files[0].name;
  }

  // Validaciones
  if (!audienciaData.asuntoId) {
    alert('Por favor, selecciona un asunto.');
    return;
  }
  if (!audienciaData.tipoAudiencia || !audienciaData.fechaAudiencia || !audienciaData.horaAudiencia || !audienciaData.abogadoComparece) {
    alert('Completa Tipo, Fecha, Hora y Abogado que Comparece.');
    return;
  }
  if (!isEditing) {
    const hoy = new Date().toISOString().split('T')[0];
    if (audienciaData.fechaAudiencia < hoy) {
      alert('La fecha de la audiencia no puede ser en el pasado.');
      return;
    }
  }

  // Base = LS si existe, o lo que ya está en memoria (demo)
  const ls = JSON.parse(localStorage.getItem('audiencias') || '[]');
  let base = (ls && ls.length) ? ls.map(a => ({ ...a, id: String(a.id) })) : [...AUDIENCIAS.map(a => ({ ...a, id: String(a.id) }))];

  if (isEditing) {
    // Actualiza existente
    const idx = base.findIndex(a => String(a.id) === String(audienciaId));
    if (idx === -1) {
      alert('No se encontró la audiencia a editar.');
      return;
    }
    audienciaData.id = String(base[idx].id);
    audienciaData.fechaCreacion = base[idx].fechaCreacion || new Date().toISOString().split('T')[0];
    audienciaData.fechaModificacion = new Date().toISOString().split('T')[0];

    // Mapea nombres usados en la tabla para no romper display
    base[idx] = {
      ...base[idx],
      ...audienciaData,
      // Campos que usa la tabla “lista”
      fecha: audienciaData.fechaAudiencia,
      hora: audienciaData.horaAudiencia,
      tipo: audienciaData.tipoAudiencia,
      actor: base[idx].actor || '',        // conserva si ya existía
      tribunal: base[idx].tribunal || '',  // conserva si ya existía
      materia: base[idx].materia || '',
      gerencia: base[idx].gerencia || '',
      prioridad: base[idx].prioridad || '',
      demandado: base[idx].demandado || ''
    };
    alert('Audiencia actualizada exitosamente.');
  } else {
    // Nueva
    audienciaData.id = String(Date.now());
    audienciaData.fechaCreacion = new Date().toISOString().split('T')[0];

    // Campos usados por la tabla “lista”
    const row = {
      id: audienciaData.id,
      fecha: audienciaData.fechaAudiencia,
      hora: audienciaData.horaAudiencia,
      tribunal: '', // completar si quieres
      expediente: '', // lo puedes derivar del asunto si lo cargas
      actor: '',
      tipo: audienciaData.tipoAudiencia,
      materia: '',
      demandado: '',
      gerencia: '',
      abogadoEncargado: '',
      abogadoComparece: audienciaData.abogadoComparece,
      observaciones: audienciaData.observaciones,
      prioridad: 'Media',
      actaDocumento: audienciaData.actaDocumento || ''
    };

    base.push(row);
    alert('Audiencia guardada exitosamente.');
  }

  // Persistencia y refresco
  localStorage.setItem('audiencias', JSON.stringify(base));
  AUDIENCIAS = base;

  // Limpia formulario y cierra modal
  document.getElementById('form-audiencia')?.reset();
  document.getElementById('acta-filename').textContent = 'Ningún archivo seleccionado';
  document.getElementById('acta-filename').classList.remove('has-file');
  const modal = document.getElementById('modal-audiencia');
  if (modal) modal.style.display = 'none';

  // Redibuja tabla
  loadAudiencias();
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
    opt.textContent = `${asunto.expediente} - ${asunto.descripcion}`;
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
   .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

// -------------------------------
// Subida de archivos (modal)
// -------------------------------
function setupFileUploadAudiencia() {
  const fileInput = document.getElementById('acta-audiencia'); // modal
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
/* Acciones en la tabla */
// -------------------------------
function setupExpandableRows() {
  document.querySelectorAll('.toggle-expand').forEach(btn => {
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      const expRow = document.getElementById(`expand-audiencia-${id}`);
      const icon = this.querySelector('i');
      if (expRow.classList.contains('active')) {
        expRow.classList.remove('active');
        icon.className = 'fas fa-chevron-down';
      } else {
        expRow.classList.add('active');
        icon.className = 'fas fa-chevron-up';
      }
    });
  });
}

function setupActionButtons() {
  // Editar
  document.querySelectorAll('.edit-audiencia').forEach(button => {
    button.addEventListener('click', function () {
      const id = parseInt(this.getAttribute('data-id'), 10);
      const audiencia = AUDIENCIAS.find(a => a.id == id);
      if (!audiencia) return alert('No se encontró la audiencia a editar.');

      // Mapa mínimo esperado por openAudienciaModal (compatibilidad)
      openAudienciaModal({
        id: audiencia.id,
        asuntoId: audiencia.asuntoId,
        expediente: audiencia.expediente,
        materia: audiencia.materia,
        gerencia: audiencia.gerencia,
        abogadoEncargado: audiencia.abogadoEncargado,
        actor: audiencia.actor,
        demandado: audiencia.demandado,
        tribunal: audiencia.tribunal,
        prioridad: audiencia.prioridad,
        tipoAudiencia: audiencia.tipo || audiencia.tipoAudiencia,
        fechaAudiencia: audiencia.fecha || audiencia.fechaAudiencia,
        horaAudiencia: audiencia.hora || audiencia.horaAudiencia,
        sala: audiencia.sala || audiencia.salaAudiencia,
        abogadoComparece: audiencia.abogadoComparece,
        observaciones: audiencia.observaciones,
        atendida: audiencia.atendida,
        recordatorioDias: audiencia.recordatorioDias,
        recordatorioHoras: audiencia.recordatorioHoras,
        actaDocumento: audiencia.actaDocumento || audiencia.actaNombre
      });
    });
  });

  // Ver cambios (si tienes el modal demo)
  document.querySelectorAll('.view-changes').forEach(button => {
    button.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      if (typeof openHistorialCambiosModal === 'function') {
        openHistorialCambiosModal(id);
      } else {
        alert('El historial de cambios no está disponible.');
      }
    });
  });

  // Comentarios
  document.querySelectorAll('.comment-audiencia').forEach(button => {
    button.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      openComentariosModal(id);
    });
  });

  // Finalizar
  document.querySelectorAll('.delete-audiencia').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      if (this.checked) {
        const id = this.getAttribute('data-id');
        openFinalizarAudienciaModal(id);
      }
    });
  });
}

// Subida de acta desde la tabla
function setupActaUpload() {
  // Click en botón => dispara input file
  document.querySelectorAll('.btn-subir-acta').forEach(btn => {
    btn.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      const input = document.querySelector(`.input-acta[data-id="${id}"]`);
      if (input) input.click();
    });
  });

  // Al seleccionar archivo, actualiza AUDIENCIAS y persiste
  document.querySelectorAll('.input-acta').forEach(input => {
    input.addEventListener('change', function () {
      const id = parseInt(this.getAttribute('data-id'), 10);

      if (this.files && this.files.length > 0) {
        const fileName = this.files[0].name;

        const idx = AUDIENCIAS.findIndex(a => a.id == id);
        if (idx !== -1) {
          AUDIENCIAS[idx].actaDocumento = fileName;

          // Persistir en localStorage
          const audLS = JSON.parse(localStorage.getItem('audiencias') || '[]');
          const idxLS = audLS.findIndex(a => String(a.id) === String(id));
          if (idxLS !== -1) {
            audLS[idxLS].actaDocumento = fileName;
            localStorage.setItem('audiencias', JSON.stringify(audLS));
          }
        }

        // Feedback visual rápido en el botón
        const btn = document.querySelector(`button[data-id="${id}"].btn-subir-acta`);
        if (btn) {
          btn.classList.add('uploaded');
          btn.title = `Acta subida: ${fileName}`;
          setTimeout(() => btn.classList.remove('uploaded'), 2000);
        }
      }
    });
  });
}

  // al elegir archivo, actualizar nombre visible y AUDIENCIAS
  document.querySelectorAll('.input-acta').forEach(input => {
    input.addEventListener('change', function () {
      const id = parseInt(this.getAttribute('data-id'), 10);
      const spanNombre = document.getElementById(`acta-nombre-${id}`);

      if (this.files && this.files.length > 0) {
        const fileName = this.files[0].name;
        if (spanNombre) spanNombre.textContent = fileName;

        const idx = AUDIENCIAS.findIndex(a => a.id == id);
        if (idx !== -1) {
          AUDIENCIAS[idx].actaDocumento = fileName;
          // persistir en localStorage
          const audLS = JSON.parse(localStorage.getItem('audiencias') || '[]');
          const idxLS = audLS.findIndex(a => String(a.id) === String(id));
          if (idxLS !== -1) {
            audLS[idxLS].actaDocumento = fileName;
            localStorage.setItem('audiencias', JSON.stringify(audLS));
          }
        }

        // aquí podrías hacer upload real con fetch/FormData
      } else {
        if (spanNombre) spanNombre.textContent = 'Sin archivo';
      }
    });
  });


// -------------------------------
// Búsqueda y filtros
// -------------------------------
function setupSearch() {
  const searchInput = document.getElementById('search-audiencias');
  if (!searchInput) return;
  searchInput.addEventListener('input', function () {
    const term = this.value.toLowerCase();
    const rows = Array.from(document.getElementById('audiencias-body').querySelectorAll('tr'));
    for (let i = 0; i < rows.length; i += 2) {
      const mainRow = rows[i];
      const expRow  = rows[i + 1];
      const text = (mainRow.textContent + (expRow ? expRow.textContent : '')).toLowerCase();
      const show = text.includes(term);
      mainRow.style.display = show ? '' : 'none';
      if (expRow) expRow.style.display = show ? '' : 'none';
    }
  });
}

function setupFilters() {
  ['filter-tipo','filter-materia','filter-prioridad'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyFilters);
  });
}

function applyFilters() {
  const tipo = document.getElementById('filter-tipo').value;
  const gerencia = (document.getElementById('filter-gerencia').value || '').trim();
  const materia = document.getElementById('filter-materia').value;
  const prioridad = document.getElementById('filter-prioridad').value;

  const rows = document.querySelectorAll('#audiencias-body tr:not(.expandable-row)');

  rows.forEach(row => {
    const rowTipo = row.getAttribute('data-tipo') || '';
    const rowGer  = row.getAttribute('data-gerencia') || '';
    const rowMat  = row.getAttribute('data-materia') || '';
    const rowPri  = row.getAttribute('data-prioridad') || '';

    const matchesTipo = !tipo || rowTipo.includes(tipo);
    const matchesGer  = !gerencia || caseInsensitiveIncludes(rowGer, gerencia);
    const matchesMat  = !materia || rowMat.includes(materia);
    const matchesPri  = !prioridad || rowPri.includes(prioridad);

    const id = row.querySelector('.toggle-expand')?.getAttribute('data-id');
    const expRow = document.getElementById(`expand-audiencia-${id}`);

    if (matchesTipo && matchesGer && matchesMat && matchesPri) {
      row.style.display = '';
      if (expRow && row.querySelector('.toggle-expand').innerHTML.includes('chevron-up')) {
        expRow.style.display = 'table-row';
      }
    } else {
      row.style.display = 'none';
      if (expRow) expRow.style.display = 'none';
    }
  });
}

// -------------------------------
// Gerencias (autocomplete tipo chips)
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
// Comentarios (localStorage por audiencia)
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
  if (!texto) return alert('Escribe un comentario.');

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
// Buscador de Expedientes (input auxiliar opcional)
// -------------------------------
function setupExpedienteSearch() {
  const input = document.getElementById('audiencia-expediente');
  const ul = document.getElementById('audiencia-expediente-suggestions');
  if (!input || !ul) return;

  let items = getExpedientesList();
  let selectedIndex = -1;

  input.addEventListener('input', function(){
    const q = this.value.trim().toLowerCase();
    items = getExpedientesList();
    const matches = q ? items.filter(e => e.toLowerCase().includes(q)) : items;
    renderSuggestions(matches);
  });
  input.addEventListener('focus', function(){
    items = getExpedientesList();
    renderSuggestions(items);
  });
  input.addEventListener('keydown', function(e){
    const visibles = ul.querySelectorAll('li[data-expediente]');
    if (e.key === 'ArrowDown') { e.preventDefault(); selectedIndex = Math.min(selectedIndex+1, visibles.length-1); updateHighlight(visibles); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selectedIndex = Math.max(selectedIndex-1, -1); updateHighlight(visibles); }
    else if (e.key === 'Enter') { e.preventDefault(); if (selectedIndex>=0 && visibles[selectedIndex]) chooseSuggestion(visibles[selectedIndex].getAttribute('data-expediente')); }
    else if (e.key === 'Escape') { hideSuggestions(); }
  });
  document.addEventListener('click', function(e){
    if (!input.contains(e.target) && !ul.contains(e.target)) hideSuggestions();
  });

  function getExpedientesList() {
    const set = new Set();
    try { (JSON.parse(localStorage.getItem('asuntos') || '[]')||[]).forEach(a => a.expediente && set.add(a.expediente)); } catch(e){}
    try { AUDIENCIAS.forEach(a => a.expediente && set.add(a.expediente)); } catch(e){}
    return Array.from(set).sort();
  }
  function renderSuggestions(list){
    if (!list || !list.length) { ul.style.display = 'none'; ul.innerHTML = ''; selectedIndex = -1; return; }
    ul.innerHTML = list.map((exp) => `<li data-expediente="${escapeHTML(exp)}" class="suggestion-item">${escapeHTML(exp)}</li>`).join('');
    ul.style.display = 'block';
    selectedIndex = -1;
    ul.querySelectorAll('li[data-expediente]').forEach(li => {
      li.addEventListener('click', function(){ chooseSuggestion(this.getAttribute('data-expediente')); });
    });
  }
  function chooseSuggestion(value){ input.value = value || ''; hideSuggestions(); }
  function updateHighlight(nodes){ nodes.forEach((n,i)=> n.classList.toggle('highlighted', i===selectedIndex)); }
  function hideSuggestions(){ ul.style.display='none'; selectedIndex=-1; }
}

// -------------------------------
// Exponer init para el HTML
// -------------------------------
window.initAudiencias = initAudiencias;
window.saveAudiencia = saveAudiencia;