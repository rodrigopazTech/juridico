const USER_ROLE = 'Gerente'; 

// Lista base de tipos de audiencia
const DEFAULT_TIPOS_AUDIENCIA = ['Inicial', 'Intermedia', 'Juicio Oral', 'Constitucional', 'Incidental', 'Conciliación'];

let AUDIENCIAS = [];

// -------------------------------
// Utilidades
// -------------------------------
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const parts = dateString.split('-');
  if(parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]); 
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return dateString;
}

function escapeHTML(str) {
  return (str || '').toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function getSemaforoStatusAudiencia(fecha, hora) {
  if(!fecha || !hora) return { class: 'bg-gray-300', tooltip: 'Sin fecha' };
  
  const today = new Date();
  const audienciaDateTime = new Date(fecha + 'T' + hora);
  const diffTime = audienciaDateTime - today;
  const diffDays  = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffTime < 0) return { class: 'bg-gray-400', tooltip: 'Pasada' };
  if (diffDays <= 1) return { class: 'bg-red-600 animate-pulse', tooltip: '¡Es HOY o mañana!' };
  if (diffDays <= 3) return { class: 'bg-yellow-400', tooltip: `En ${diffDays} días` };
  return { class: 'bg-green-500', tooltip: `En ${diffDays} días` };
}
// -------------------------------
// Guardar audiencia concluida en Agenda General
// -------------------------------
function guardarAudienciaEnAgendaGeneral(audienciaData) {
    // Obtener audiencias desahogadas existentes
    let audienciasDesahogadas = JSON.parse(localStorage.getItem('audienciasDesahogadas')) || [];
    
    // Crear registro para la agenda general
    const registroAgenda = {
        id: Date.now(),
        fechaAudiencia: audienciaData.fecha,
        horaAudiencia: audienciaData.hora,
        expediente: audienciaData.expediente,
        tipoAudiencia: audienciaData.tipo,
        partes: audienciaData.actor,
        abogado: audienciaData.abogadoComparece,
        actaDocumento: audienciaData.actaDocumento || '',
        atendida: true,
        fechaDesahogo: new Date().toISOString().split('T')[0], // Fecha actual
        observaciones: audienciaData.observaciones || '',
        fechaCreacion: new Date().toISOString()
    };
    
    // Agregar al inicio del array
    audienciasDesahogadas.unshift(registroAgenda);
    
    // Guardar en localStorage
    localStorage.setItem('audienciasDesahogadas', JSON.stringify(audienciasDesahogadas));
    
    console.log('✅ Audiencia guardada en Agenda General:', registroAgenda);
    
    // RETORNAR EL REGISTRO CREADO PARA PODER USARLO DESPUÉS
    return registroAgenda;
}
// -------------------------------
// Guardar audiencia concluida en Agenda General
// -------------------------------
function guardarAudienciaEnAgendaGeneral(audienciaData) {
    // Obtener audiencias desahogadas existentes
    let audienciasDesahogadas = JSON.parse(localStorage.getItem('audienciasDesahogadas')) || [];
    
    // Crear registro para la agenda general
    const registroAgenda = {
        id: Date.now(),
        fechaAudiencia: audienciaData.fecha,
        horaAudiencia: audienciaData.hora,
        expediente: audienciaData.expediente,
        tipoAudiencia: audienciaData.tipo,
        partes: audienciaData.actor,
        abogado: audienciaData.abogadoComparece,
        actaDocumento: audienciaData.actaDocumento || '',
        atendida: true,
        fechaDesahogo: new Date().toISOString().split('T')[0], // Fecha actual
        observaciones: audienciaData.observaciones || '',
        fechaCreacion: new Date().toISOString()
    };
    
    // Agregar al inicio del array
    audienciasDesahogadas.unshift(registroAgenda);
    
    // Guardar en localStorage
    localStorage.setItem('audienciasDesahogadas', JSON.stringify(audienciasDesahogadas));
    
    console.log('✅ Audiencia guardada en Agenda General:', registroAgenda);
    
    // RETORNAR EL REGISTRO CREADO PARA PODER USARLO DESPUÉS
    return registroAgenda;
}

// -------------------------------
// Inicialización
// -------------------------------
function initAudiencias() {
    console.log('Iniciando Audiencias...');
    
    loadAudiencias(); 
    
    initModalComentarios();
    initModalAudiencias();
    initModalFinalizarAudiencia();
    initModalReasignarAudiencia(); 
    initModalManageTipos(); 
    
    setupActionMenuListenerAudiencia();
    setupFilters();
    
    cargarAsuntosEnSelectorAudiencia();
    cargarAbogadosSelects();
    cargarTiposAudienciaSelect();

    const searchInput = document.getElementById('search-audiencias');
    if(searchInput) searchInput.addEventListener('input', loadAudiencias);
}

// -------------------------------
// Lógica de Tipos de Audiencia
// -------------------------------
function getTiposAudiencia() {
    return JSON.parse(localStorage.getItem('tiposAudiencia')) || DEFAULT_TIPOS_AUDIENCIA;
}

function saveTiposAudiencia(tipos) {
    localStorage.setItem('tiposAudiencia', JSON.stringify(tipos));
    cargarTiposAudienciaSelect();
}

function cargarTiposAudienciaSelect() {
    const select = document.getElementById('tipo-audiencia');
    if (!select) return;
    
    const tipos = getTiposAudiencia();
    const currentVal = select.value;
    
    select.innerHTML = '<option value="">Seleccione...</option>';
    tipos.sort().forEach(tipo => {
        const opt = document.createElement('option');
        opt.value = tipo;
        opt.textContent = tipo;
        select.appendChild(opt);
    });
    
    if (tipos.includes(currentVal)) {
        select.value = currentVal;
    }
}

function initModalManageTipos() {
    const btnOpen = document.getElementById('btn-manage-tipos');
    const modal = document.getElementById('modal-manage-tipos');
    const btnClose = document.getElementById('close-manage-tipos');
    const btnSave = document.getElementById('btn-save-tipo');
    const btnCancelEdit = document.getElementById('btn-cancel-edit-tipo');
    const input = document.getElementById('input-nuevo-tipo');
    
    if(!modal) return;

    if(btnOpen) btnOpen.onclick = () => { renderListaTipos(); modal.classList.remove('hidden'); modal.classList.add('flex'); };
    if(btnClose) btnClose.onclick = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); resetEditMode(); };

    if(btnSave) {
        btnSave.onclick = () => {
            const valor = input.value.trim();
            const editIndex = document.getElementById('tipo-audiencia-edit-index').value;
            let tipos = getTiposAudiencia();

            if(!valor) return alert("Escribe un nombre");

            if(editIndex !== "") {
                tipos[editIndex] = valor;
            } else {
                if(tipos.includes(valor)) return alert("Ya existe");
                tipos.push(valor);
            }
            
            saveTiposAudiencia(tipos);
            renderListaTipos();
            input.value = '';
            resetEditMode();
        };
    }

    if(btnCancelEdit) btnCancelEdit.onclick = resetEditMode;
}

function resetEditMode() {
    document.getElementById('tipo-audiencia-edit-index').value = '';
    document.getElementById('input-nuevo-tipo').value = '';
    document.getElementById('btn-save-tipo').innerHTML = '<i class="fas fa-plus"></i>';
    document.getElementById('btn-cancel-edit-tipo').classList.add('hidden');
}

function renderListaTipos() {
    const lista = document.getElementById('lista-tipos-audiencia');
    if(!lista) return;
    
    const tipos = getTiposAudiencia();
    lista.innerHTML = '';
    
    tipos.forEach((tipo, index) => {
        const li = document.createElement('li');
        li.className = "flex justify-between items-center p-3 hover:bg-gray-100";
        li.innerHTML = `
            <span class="text-sm text-gray-700">${tipo}</span>
            <div class="flex gap-2">
                <button class="text-blue-600 hover:text-blue-800 btn-edit-tipo" data-index="${index}"><i class="fas fa-pen"></i></button>
                <button class="text-red-600 hover:text-red-800 btn-del-tipo" data-index="${index}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        lista.appendChild(li);
    });

    lista.querySelectorAll('.btn-del-tipo').forEach(btn => {
        btn.onclick = function() {
            if(confirm('¿Eliminar este tipo?')) {
                const idx = this.dataset.index;
                let t = getTiposAudiencia();
                t.splice(idx, 1);
                saveTiposAudiencia(t);
                renderListaTipos();
            }
        };
    });

    lista.querySelectorAll('.btn-edit-tipo').forEach(btn => {
        btn.onclick = function() {
            const idx = this.dataset.index;
            let t = getTiposAudiencia();
            document.getElementById('input-nuevo-tipo').value = t[idx];
            document.getElementById('tipo-audiencia-edit-index').value = idx;
            document.getElementById('btn-save-tipo').innerHTML = '<i class="fas fa-save"></i>';
            document.getElementById('btn-cancel-edit-tipo').classList.remove('hidden');
        };
    });
}

// -------------------------------
// Renderizado Principal
// -------------------------------
function loadAudiencias() {
  const tbody = document.getElementById('audiencias-body');
  if(!tbody) return;

  // 1. Cargar Audiencias
  let ls = [];
  try { ls = JSON.parse(localStorage.getItem('audiencias') || '[]'); } catch (e) { ls = []; }

  // 2. Cargar Expedientes para hacer el "cruce" de datos si falta información
  const expedientes = JSON.parse(localStorage.getItem('expedientesData')) || [];
  const NOMBRES_GERENCIAS = {
      1: 'Civil, Mercantil, Fiscal y Administrativo',
      2: 'Laboral y Penal',
      3: 'Transparencia y Amparo'
  };

  // Datos de prueba si está vacío
  if (!ls || ls.length === 0) {
      ls = [ ];
      localStorage.setItem('audiencias', JSON.stringify(ls));
  }
  AUDIENCIAS = ls;

  const filtroTipo = document.getElementById('filter-tipo')?.value || '';
  const filtroGerencia = (document.getElementById('filter-gerencia')?.value || '').toLowerCase();
  const filtroMateria = document.getElementById('filter-materia')?.value || '';
  const busqueda = (document.getElementById('search-audiencias')?.value || '').toLowerCase();

  let html = '';
  
  AUDIENCIAS.forEach(a => {
    let materiaMostrar = a.materia;
    let gerenciaMostrar = a.gerencia;

    if (!materiaMostrar || !gerenciaMostrar || materiaMostrar === 'S/D') {
        const expRelacionado = expedientes.find(e => 
            (a.asuntoId && String(e.id) === String(a.asuntoId)) || 
            (e.numero === a.expediente) ||
            (e.expediente === a.expediente)
        );

        if (expRelacionado) {
            if (!materiaMostrar) materiaMostrar = expRelacionado.materia;
            if (!gerenciaMostrar) {
                gerenciaMostrar = expRelacionado.gerencia || NOMBRES_GERENCIAS[expRelacionado.gerenciaId] || '';
            }
        }
    }
    
    materiaMostrar = materiaMostrar || 'S/D';
    gerenciaMostrar = gerenciaMostrar || '-';

    const textoFila = `${a.expediente} ${a.actor} ${a.tribunal} ${a.tipo} ${a.abogadoComparece}`.toLowerCase();
    
    if (filtroTipo && a.tipo !== filtroTipo) return;
    if (filtroGerencia && !gerenciaMostrar.toLowerCase().includes(filtroGerencia)) return;
    if (filtroMateria && materiaMostrar !== filtroMateria) return;
    if (busqueda && !textoFila.includes(busqueda)) return;

    const sem = getSemaforoStatusAudiencia(a.fecha, a.hora);
    
    let estadoBadge = '';
    if (a.atendida) {
        estadoBadge = '<span class="inline-flex items-center bg-gray-800 text-white text-xs font-bold px-2.5 py-0.5 rounded border border-gray-600"><i class="fas fa-flag-checkered mr-1"></i> Concluida</span>';
    } else if (a.actaDocumento) {
        estadoBadge = '<span class="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-200"><i class="fas fa-file-signature mr-1"></i> Con Acta</span>';
    } else {
        estadoBadge = '<span class="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-0.5 rounded border border-yellow-200"><i class="fas fa-clock mr-1"></i> Pendiente</span>';
    }
      
    html += `
      <tr class="bg-white hover:bg-gray-50 border-b transition-colors group" data-id="${a.id}">
        <td class="px-4 py-3 text-center">
            <button class="text-gray-400 hover:text-gob-guinda toggle-expand transition-transform duration-200" data-id="${a.id}"><i class="fas fa-chevron-down"></i></button>
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="flex items-center">
            <div class="w-2.5 h-2.5 rounded-full mr-2 ${sem.class}" title="${sem.tooltip}"></div>
            <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-900">${formatDate(a.fecha)}</span>
                <span class="text-xs text-gray-500">${a.hora} hrs</span>
                <span class="text-[10px] bg-gray-100 text-gray-600 px-1 rounded mt-0.5 w-fit">${escapeHTML(a.tipo)}</span>
            </div>
          </div>
        </td>
        <td class="px-4 py-3 text-sm font-bold text-gob-guinda whitespace-nowrap">
            ${escapeHTML(a.expediente)}
        </td>
        <td class="px-4 py-3">
            <div class="flex flex-col">
                <span class="text-xs font-bold text-gray-700">${escapeHTML(materiaMostrar)}</span>
                <span class="text-[10px] text-gray-500 truncate max-w-[120px]" title="${escapeHTML(gerenciaMostrar)}">${escapeHTML(gerenciaMostrar)}</span>
            </div>
        </td>
        <td class="px-4 py-3 text-sm text-gray-700">
             <div class="flex items-center gap-1" title="Comparece">
                <i class="fas fa-user-tie text-gray-400 text-xs"></i>
                <span>${escapeHTML(a.abogadoComparece || 'Por asignar')}</span>
             </div>
        </td>
        <td class="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]" title="${escapeHTML(a.actor)}">
            ${escapeHTML(a.actor)}
        </td>
        <td class="px-4 py-3 text-xs text-gray-500 truncate max-w-[120px]" title="${escapeHTML(a.tribunal)}">
            ${escapeHTML(a.tribunal)}
        </td>
        <td class="px-4 py-3">${estadoBadge}</td> 
        <td class="px-4 py-3 text-right whitespace-nowrap relative">
            <div class="flex items-center justify-end gap-2">
                ${!a.atendida ? 
                    `<button class="text-gray-400 hover:text-gob-oro action-edit-audiencia p-1" title="Editar"><i class="fas fa-edit"></i></button>` : 
                    `<button class="text-gray-200 cursor-not-allowed p-1" title="Cerrado"><i class="fas fa-lock"></i></button>`
                }
                <div class="relative action-menu-container">
                    <button class="text-gray-400 hover:text-gob-guinda action-menu-toggle p-1 px-2 transition-colors" title="Acciones"><i class="fas fa-ellipsis-v"></i></button>
                     <div class="action-menu hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100 ring-1 ring-black ring-opacity-5">
                        ${generarAccionesRapidasAudiencia(a, USER_ROLE)}
                    </div>
                </div>   
                <input type="file" class="input-acta-hidden hidden" data-id="${a.id}" accept=".pdf,.doc,.docx">
            </div>
        </td>
      </tr>
      <tr id="expand-row-${a.id}" class="hidden bg-gray-50 border-b shadow-inner">
        <td colspan="9" class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span class="block text-xs font-bold text-gray-400 uppercase">Sala / Ubicación Detallada</span><span class="font-medium text-gray-800">${escapeHTML(a.sala || 'No especificada')}</span></div>
                ${a.observaciones ? `<div><span class="block text-xs font-bold text-gray-400 uppercase">Resultado / Observaciones</span><span class="font-medium text-gray-800">${escapeHTML(a.observaciones)}</span></div>` : ''}
            </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html || `<tr><td colspan="9" class="text-center py-8 text-gray-500">No hay datos registrados.</td></tr>`;
}


function generarAccionesRapidasAudiencia(audiencia, rol) {
    let html = '';
    const itemClass = "w-full text-left px-4 py-3 text-sm text-gob-gris hover:bg-gray-50 hover:text-gob-guinda transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0";

    html += `<button class="${itemClass} action-view-asunto-audiencia"><i class="fas fa-briefcase text-gray-400"></i> Ver Expediente</button>`;

    if (!audiencia.atendida) {
        if (audiencia.actaDocumento) {
            html += `<button class="${itemClass} action-view-acta"><i class="fas fa-file-pdf text-blue-600"></i> Ver Acta</button>`;
            html += `<button class="${itemClass} action-desahogar"><i class="fas fa-flag-checkered text-green-600"></i> <strong>Concluir</strong></button>`;
            html += `<button class="${itemClass} action-remove-acta"><i class="fas fa-times-circle text-red-500"></i> Quitar Acta</button>`;
        } else {
            html += `<button class="${itemClass} action-upload-acta"><i class="fas fa-cloud-upload-alt text-gob-oro"></i> <strong>Subir Acta</strong></button>`;
        }
    } else {
        if(audiencia.actaDocumento) {
            html += `<button class="${itemClass} action-view-acta"><i class="fas fa-download text-gray-400"></i> Descargar Acta</button>`;
        }
    }

    html += `<button class="${itemClass} action-comment-audiencia"><i class="fas fa-comment-dots text-gray-400"></i> Comentarios</button>`;
    if (rol === 'Direccion' || rol === 'Gerente') {
        html += `<div class="border-t border-gray-100 my-1"></div>`;
        html += `<button class="${itemClass} action-reasignar-audiencia"><i class="fas fa-user-friends text-gob-oro"></i> Reasignar Abogado</button>`;
        if (rol === 'Direccion') {
            html += `<button class="${itemClass} action-delete-audiencia text-red-600 hover:bg-red-50"><i class="fas fa-trash-alt"></i> Eliminar</button>`;
        }
    }
    return html;
}

function setupActionMenuListenerAudiencia() {
    const tbody = document.getElementById('audiencias-body');
    if (!tbody) return;

    tbody.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;
        const row = target.closest('tr');
        if (!row) return; 
        const id = row.getAttribute('data-id');
        const audiencia = AUDIENCIAS.find(t => String(t.id) === String(id));

        if (target.classList.contains('toggle-expand')) {
            const detailRow = document.getElementById(`expand-row-${id}`);
            if (detailRow) {
                detailRow.classList.toggle('hidden');
                const icon = target.querySelector('i');
                if(icon) { icon.classList.toggle('fa-chevron-up'); icon.classList.toggle('fa-chevron-down'); }
            }
            return;
        }

        if (target.classList.contains('action-edit-audiencia')) {
            if (audiencia) openAudienciaModal(audiencia);
            return;
        }

        if (target.classList.contains('action-menu-toggle')) {
            e.preventDefault(); e.stopPropagation();
            const menu = target.nextElementSibling; 
            if (!menu.classList.contains('hidden')) { menu.classList.add('hidden'); menu.style.cssText = ''; return; }
            document.querySelectorAll('.action-menu').forEach(m => { m.classList.add('hidden'); m.style.cssText = ''; });
            menu.classList.remove('hidden');
            const rect = target.getBoundingClientRect(); 
            const menuWidth = 224; 
            const menuHeight = menu.offsetHeight || 220; 
            const spaceBelow = window.innerHeight - rect.bottom;
            menu.style.position = 'fixed'; menu.style.zIndex = '99999'; menu.style.width = menuWidth + 'px'; menu.style.left = (rect.right - menuWidth) + 'px'; 
            if (spaceBelow < menuHeight) {
                menu.style.top = 'auto'; menu.style.bottom = (window.innerHeight - rect.top + 5) + 'px';
                menu.classList.remove('border-t-4'); menu.classList.add('border-b-4');
            } else {
                menu.style.bottom = 'auto'; menu.style.top = (rect.bottom + 5) + 'px';
                menu.classList.add('border-t-4'); menu.classList.remove('border-b-4');
            }
            return;
        }

        if(audiencia) {
            if (target.classList.contains('action-view-asunto-audiencia')) {
                if(audiencia.asuntoId) {
                    window.location.href = `../expediente-module/expediente-detalle.html?id=${audiencia.asuntoId}`;
                } else {
                    alert("Esta audiencia no tiene un expediente vinculado correctamente.");
                }
                return;
            }
            else if (target.classList.contains('action-upload-acta')) row.querySelector('.input-acta-hidden').click();
            else if (target.classList.contains('action-remove-acta')) mostrarConfirmacionAudiencia('Quitar Acta', '¿Estás seguro?', () => quitarActa(id));
            else if (target.classList.contains('action-desahogar')) openFinalizarAudienciaModal(id);
            else if (target.classList.contains('action-view-acta')) mostrarAlertaAudiencia('Descargando documento: ' + audiencia.actaDocumento);
            else if (target.classList.contains('action-reasignar-audiencia')) abrirModalReasignarAudiencia(id);
            else if (target.classList.contains('action-comment-audiencia')) openComentariosModal(id);
            else if (target.classList.contains('action-delete-audiencia')) {
                mostrarConfirmacionAudiencia('Eliminar', '¿Eliminar permanente?', () => {
                    AUDIENCIAS = AUDIENCIAS.filter(a => String(a.id) !== String(id));
                    localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
                    loadAudiencias();
                });
            }
        }
        document.querySelectorAll('.action-menu').forEach(m => m.classList.add('hidden'));
    });

    document.addEventListener('click', e => { if (!e.target.closest('.action-menu-toggle')) document.querySelectorAll('.action-menu').forEach(m => m.classList.add('hidden')); });
    window.addEventListener('scroll', () => { document.querySelectorAll('.action-menu:not(.hidden)').forEach(m => m.classList.add('hidden')); }, true);
    
    tbody.addEventListener('change', function(e) {
        if (e.target.classList.contains('input-acta-hidden') && e.target.files.length) subirActa(e.target.getAttribute('data-id'), e.target.files[0]);
    });
}

function setupFilters() {
    ['filter-tipo','filter-gerencia','filter-materia','filter-prioridad'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('change', loadAudiencias);
        if(el && el.tagName === 'INPUT') el.addEventListener('input', loadAudiencias);
    });
}

function subirActa(id, file) {
    const idx = AUDIENCIAS.findIndex(a => a.id == id);
    if (idx !== -1) {
        AUDIENCIAS[idx].actaDocumento = file.name;
        localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
        loadAudiencias();
        mostrarMensajeGlobal('Acta subida correctamente.', 'success');
    }
}

function quitarActa(id) {
    const idx = AUDIENCIAS.findIndex(a => a.id == id);
    if (idx !== -1) {
        AUDIENCIAS[idx].actaDocumento = '';
        localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
        loadAudiencias();
        mostrarMensajeGlobal('Acta eliminada.', 'warning');
    }
}

function initModalAudiencias() {
    const modal = document.getElementById('modal-audiencia');
    const btnAdd = document.getElementById('add-audiencia');
    const btnClose = document.getElementById('close-modal-audiencia');
    const btnCancel = document.getElementById('cancel-audiencia');
    const btnSave = document.getElementById('save-audiencia');

    if(btnAdd) btnAdd.onclick = () => openAudienciaModal();
    if(btnClose) btnClose.onclick = () => modal.style.display = 'none';
    if(btnCancel) btnCancel.onclick = () => modal.style.display = 'none';
    if(btnSave) btnSave.onclick = guardarAudiencia;
}

function openAudienciaModal(audiencia = null) {
    const modal = document.getElementById('modal-audiencia');
    const form = document.getElementById('form-audiencia');
    const title = document.getElementById('modal-audiencia-title');
    
    form.reset();
    
    cargarAsuntosEnSelectorAudiencia();
    cargarTiposAudienciaSelect();

    if(audiencia) {
        title.textContent = 'Editar Audiencia';
        document.getElementById('audiencia-id').value = audiencia.id;
        
        const selector = document.getElementById('asunto-selector-audiencia');
        if(selector && audiencia.asuntoId) { selector.value = audiencia.asuntoId; selector.dispatchEvent(new Event('change')); }

        if(document.getElementById('fecha-audiencia')) document.getElementById('fecha-audiencia').value = audiencia.fecha || '';
        if(document.getElementById('hora-audiencia')) document.getElementById('hora-audiencia').value = audiencia.hora || '';
        if(document.getElementById('sala-audiencia')) document.getElementById('sala-audiencia').value = audiencia.sala || '';
        if(document.getElementById('tipo-audiencia')) document.getElementById('tipo-audiencia').value = audiencia.tipo || '';
        if(document.getElementById('abogado-comparece')) {
             const selAbogado = document.getElementById('abogado-comparece');
             if(audiencia.abogadoComparece && ![...selAbogado.options].some(o => o.value === audiencia.abogadoComparece)){
                 const opt = document.createElement('option'); opt.value = audiencia.abogadoComparece; opt.text = audiencia.abogadoComparece; selAbogado.appendChild(opt);
             }
             selAbogado.value = audiencia.abogadoComparece || '';
        }

    } else {
        title.textContent = 'Nueva Audiencia';
        document.getElementById('audiencia-id').value = '';
    }
    
    modal.style.display = 'flex';
}

function guardarAudiencia() {
    const id = document.getElementById('audiencia-id').value;
    const fecha = document.getElementById('fecha-audiencia').value;
    const hora = document.getElementById('hora-audiencia').value;
    const asuntoId = document.getElementById('asunto-selector-audiencia').value;

    if(!fecha || !hora || !asuntoId) return alert('Completa los campos obligatorios');

    const fechaBase = new Date(fecha + 'T' + hora);
    const diasAntes = parseInt(document.getElementById('dias-antes-rec-aud').value) || 0;
    const horasAntes = parseInt(document.getElementById('horas-antes-rec-aud').value) || 0;
    const notaRec = document.getElementById('nota-rec-aud').value;

    const fechaNotificacion = new Date(fechaBase);
    fechaNotificacion.setDate(fechaBase.getDate() - diasAntes);
    fechaNotificacion.setHours(fechaBase.getHours() - horasAntes);

    let textoAnticipacion = "";
    if (diasAntes > 0) textoAnticipacion = `${diasAntes} días`;
    if (horasAntes > 0) textoAnticipacion += (textoAnticipacion ? " y " : "") + `${horasAntes} horas`;
    if (!textoAnticipacion) textoAnticipacion = "el momento";

    const recordatorios = JSON.parse(localStorage.getItem('recordatorios')) || [];
    const tipoAudiencia = document.getElementById('tipo-audiencia').value;
    const exp = document.getElementById('expediente-auto-audiencia').value;
    
    const nuevoRecordatorio = {
        id: Date.now() + 1,
        titulo: `Audiencia: ${tipoAudiencia}`,
        meta: {
            tipoOrigen: 'audiencia',
            expediente: exp,
            anticipacion: textoAnticipacion,
            fechaEvento: fechaBase.toISOString()
        },
        detalles: notaRec || `Recordatorio de audiencia programada para el expediente ${exp}.`,
        fecha: fechaNotificacion.toISOString().split('T')[0],
        hora: fechaNotificacion.toTimeString().substring(0,5),
        prioridad: 'urgent',
        completado: false
    };
    recordatorios.unshift(nuevoRecordatorio);
    localStorage.setItem('recordatorios', JSON.stringify(recordatorios));

    const nueva = {
        id: id || Date.now().toString(),
        fecha, hora, asuntoId,
        tipo: tipoAudiencia || 'General',
        sala: document.getElementById('sala-audiencia').value,
        abogadoComparece: document.getElementById('abogado-comparece').value,
        expediente: exp,
        tribunal: document.getElementById('organo-auto-audiencia').value,
        actor: document.getElementById('partes-auto-audiencia').value,
        atendida: false,
        actaDocumento: ''
    };

    if(id) {
        const idx = AUDIENCIAS.findIndex(a => a.id == id);
        nueva.actaDocumento = AUDIENCIAS[idx].actaDocumento;
        nueva.atendida = AUDIENCIAS[idx].atendida;
        nueva.comentarios = AUDIENCIAS[idx].comentarios; 
        AUDIENCIAS[idx] = nueva;
    } else {
        // === NUEVA AUDIENCIA ===
        AUDIENCIAS.push(nueva);

        // --- REGISTRO DE ACTIVIDAD EN EXPEDIENTE (CREACIÓN) ---
        registrarActividadExpediente(
            asuntoId,
            'Nueva Audiencia Programada',
            `Tipo: ${nueva.tipo}. Fecha: ${formatDate(fecha)} ${hora} hrs.`,
            'edit'
        );
        // -----------------------------------------------------
    }
    
    localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
    document.getElementById('modal-audiencia').style.display = 'none';
    loadAudiencias();
    mostrarMensajeGlobal('Audiencia guardada', 'success');
}

function initModalFinalizarAudiencia() {
    const modal = document.getElementById('modal-finalizar-audiencia');
    document.getElementById('close-modal-finalizar').onclick = () => modal.style.display='none';
    document.getElementById('cancel-finalizar').onclick = () => modal.style.display='none';
    document.getElementById('confirmar-finalizar').onclick = () => {
        const id = document.getElementById('finalizar-audiencia-id').value;
        const idx = AUDIENCIAS.findIndex(a => a.id == id);
        
        if(idx !== -1) {
            // Guardar observaciones
            AUDIENCIAS[idx].observaciones = document.getElementById('observaciones-finales').value;
            AUDIENCIAS[idx].atendida = true;
            
            // GUARDAR EN AGENDA GENERAL Y OBTENER EL REGISTRO
            const registroAgenda = guardarAudienciaEnAgendaGeneral(AUDIENCIAS[idx]);
            
            // ELIMINAR DE LA TABLA PRINCIPAL DE AUDIENCIAS
            AUDIENCIAS = AUDIENCIAS.filter(a => a.id != id);
            
            // Guardar cambios en audiencias (sin la audiencia desahogada)
            localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
            
            // Cargar tabla actualizada
            loadAudiencias();
            
            // Mostrar mensaje de éxito
            mostrarMensajeGlobal('Audiencia desahogada y movida a Agenda General.', 'success');
            
            console.log(`🗑️ Audiencia ${id} eliminada de la tabla principal y movida a agenda general`);
        }
        
        modal.style.display='none';
    };
}

function openFinalizarAudienciaModal(id) {
    document.getElementById('finalizar-audiencia-id').value = id;
    document.getElementById('observaciones-finales').value = '';
    document.getElementById('modal-finalizar-audiencia').style.display = 'flex';
}

function initModalComentarios() {
    const modal = document.getElementById('modal-comentarios');
    const btnClose = document.getElementById('close-modal-comentarios');
    const btnSave = document.getElementById('save-comentario');
    if (btnClose) btnClose.onclick = () => modal.style.display = 'none';
    if (btnSave) {
        const newBtn = btnSave.cloneNode(true);
        btnSave.parentNode.replaceChild(newBtn, btnSave);
        newBtn.onclick = guardarComentario;
    }
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
}

function openComentariosModal(id) {
    const modal = document.getElementById('modal-comentarios');
    document.getElementById('comentarios-audiencia-id').value = id;
    document.getElementById('nuevo-comentario').value = '';
    renderComentarios(id);
    modal.style.display = 'flex';
}

function renderComentarios(id) {
    const lista = document.getElementById('lista-comentarios');
    lista.innerHTML = ''; 
    const audiencia = AUDIENCIAS.find(a => String(a.id) === String(id));
    if (!audiencia) return;
    const comentarios = audiencia.comentarios || [];
    if (comentarios.length === 0) { lista.innerHTML = '<li class="text-gray-400 text-sm italic text-center p-4">No hay comentarios.</li>'; return; }
    comentarios.forEach(c => {
        const li = document.createElement('li');
        li.className = "bg-gray-50 p-3 rounded border border-gray-200 text-sm";
        li.innerHTML = `<div class="flex justify-between mb-1"><span class="font-bold text-gob-guinda text-xs">${c.usuario}</span><span class="text-gray-400 text-xs">${c.fecha}</span></div><div class="text-gray-700">${c.texto}</div>`;
        lista.appendChild(li);
    });
}

function guardarComentario() {
    const id = document.getElementById('comentarios-audiencia-id').value;
    const textoInput = document.getElementById('nuevo-comentario');
    const texto = textoInput.value.trim();
    if (!texto) return; 
    const idx = AUDIENCIAS.findIndex(a => String(a.id) === String(id));
    if (idx !== -1) {
        if (!AUDIENCIAS[idx].comentarios) AUDIENCIAS[idx].comentarios = [];
        AUDIENCIAS[idx].comentarios.push({ texto: texto, usuario: 'Usuario Actual', fecha: new Date().toLocaleString('es-MX') });
        localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
        textoInput.value = '';
        renderComentarios(id);
    }
}

function mostrarMensajeGlobal(msg, type) {
    const div = document.createElement('div');
    div.className = `fixed top-5 right-5 px-6 py-3 text-white rounded shadow-lg z-50 ${type==='success'?'bg-green-600':'bg-yellow-500'}`;
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function cargarAsuntosEnSelectorAudiencia() {
    const sel = document.getElementById('asunto-selector-audiencia');
    if(!sel) return;
    
    const dataToUse = JSON.parse(localStorage.getItem('expedientesData')) || [];
    
    const NOMBRES_GERENCIAS = {
        1: 'Civil, Mercantil, Fiscal y Administrativo',
        2: 'Laboral y Penal',
        3: 'Transparencia y Amparo'
    };
    
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    
    dataToUse.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.text = `${a.numero || a.expediente} - ${(a.descripcion || a.asunto || '').substring(0,30)}...`;
        sel.appendChild(opt);
    });
    
    sel.onchange = () => {
        const a = dataToUse.find(x => String(x.id) === String(sel.value));
        if(a) {
            document.getElementById('expediente-auto-audiencia').value = a.numero || a.expediente || '';
            document.getElementById('materia-auto-audiencia').value = a.materia || 'Sin Materia';
            document.getElementById('partes-auto-audiencia').value = a.partes || a.actor || 'Actor vs Demandado';
            document.getElementById('organo-auto-audiencia').value = a.organo || a.organoJurisdiccional || 'Por asignar';
            
            let nombreGerencia = a.gerencia || '';
            if (!nombreGerencia && a.gerenciaId) {
                nombreGerencia = NOMBRES_GERENCIAS[a.gerenciaId] || 'Gerencia General';
            }
            document.getElementById('gerencia-auto-audiencia').value = nombreGerencia || 'Sin Gerencia';
            document.getElementById('abogado-auto-audiencia').value = a.abogado || 'Por asignar';
        } else {
            document.getElementById('materia-auto-audiencia').value = '';
            document.getElementById('gerencia-auto-audiencia').value = '';
        }
    };
}

function cargarAbogadosSelects() {
    const sel = document.getElementById('abogado-comparece');
    if(sel) sel.innerHTML += '<option>Lic. Demo</option><option>Lic. Pérez</option>';
}

// ===============================================
// LÓGICA DE MODALES FALTANTE 
// ===============================================

function initModalReasignarAudiencia() {
    const modal = document.getElementById('modal-reasignar-audiencia');
    const btnClose = document.getElementById('close-modal-reasignar-audiencia');
    const btnCancel = document.getElementById('cancel-reasignar-audiencia');
    const btnSave = document.getElementById('save-reasignar-audiencia');

    if (modal) {
        const close = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };
        if (btnClose) btnClose.onclick = close;
        if (btnCancel) btnCancel.onclick = close;
        
        if (btnSave) {
            const newBtn = btnSave.cloneNode(true);
            btnSave.parentNode.replaceChild(newBtn, btnSave);
            
            newBtn.onclick = () => {
                const id = document.getElementById('reasignar-audiencia-id').value;
                const select = document.getElementById('select-nuevo-abogado-audiencia');
                const nuevoAbogado = select.value;

                if (nuevoAbogado) {
                    const idx = AUDIENCIAS.findIndex(a => String(a.id) === String(id));
                    if (idx !== -1) {
                        AUDIENCIAS[idx].abogadoComparece = nuevoAbogado;
                        localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
                        loadAudiencias();
                        mostrarMensajeGlobal(`Reasignado a ${nuevoAbogado}`, 'success');
                        close();
                    }
                } else {
                    alert("Selecciona un abogado");
                }
            };
        }
    }
}

function abrirModalReasignarAudiencia(id) {
    const modal = document.getElementById('modal-reasignar-audiencia');
    const audiencia = AUDIENCIAS.find(a => String(a.id) === String(id));
    
    if(!audiencia || !modal) return;

    document.getElementById('reasignar-audiencia-id').value = id;
    document.getElementById('reasignar-tipo-audiencia').value = audiencia.tipo;
    document.getElementById('reasignar-abogado-actual-audiencia').value = audiencia.abogadoComparece || 'Sin asignar';

    const select = document.getElementById('select-nuevo-abogado-audiencia');
    select.innerHTML = '<option value="">Seleccione...</option>';
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const abogados = usuarios.filter(u => u.rol === 'ABOGADO' && u.activo);
    
    if(abogados.length > 0) {
        abogados.forEach(abg => {
            const opt = document.createElement('option');
            opt.value = abg.nombre;
            opt.textContent = abg.nombre;
            select.appendChild(opt);
        });
    } else {
        ['Lic. Demo', 'Lic. Pérez', 'Lic. Gómez'].forEach(nombre => {
            const opt = document.createElement('option');
            opt.value = nombre;
            opt.textContent = nombre;
            select.appendChild(opt);
        });
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function mostrarAlertaAudiencia(mensaje) {
    const modal = document.getElementById('modal-alerta-audiencia');
    if(!modal) return alert(mensaje); 

    document.getElementById('alerta-mensaje-audiencia').textContent = mensaje;
    
    const btn = document.getElementById('btn-alerta-accept-audiencia');
    btn.onclick = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

let onConfirmActionAudiencia = null;

function mostrarConfirmacionAudiencia(titulo, mensaje, callback) {
    const modal = document.getElementById('modal-confirmacion-audiencia');
    if(!modal) {
        if(confirm(mensaje)) callback();
        return;
    }

    document.getElementById('confirm-titulo-audiencia').textContent = titulo;
    document.getElementById('confirm-mensaje-audiencia').textContent = mensaje;
    
    onConfirmActionAudiencia = callback;

    document.getElementById('btn-confirm-accept-audiencia').onclick = () => {
        if (onConfirmActionAudiencia) onConfirmActionAudiencia();
        cerrarConfirmacionAudiencia();
    };
    
    document.getElementById('btn-confirm-cancel-audiencia').onclick = cerrarConfirmacionAudiencia;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarConfirmacionAudiencia() {
    const modal = document.getElementById('modal-confirmacion-audiencia');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    onConfirmActionAudiencia = null;
}

// === FUNCION HELPER PARA VINCULAR CON EXPEDIENTE ===
function registrarActividadExpediente(asuntoId, titulo, descripcion, tipoIcono = 'info') {
    if (!asuntoId) return;

    const expedientes = JSON.parse(localStorage.getItem('expedientesData')) || [];
    const index = expedientes.findIndex(e => String(e.id) === String(asuntoId));

    if (index !== -1) {
        if (!expedientes[index].actividad) expedientes[index].actividad = [];

        const nuevaActividad = {
            fecha: new Date().toISOString(),
            titulo: titulo,
            descripcion: descripcion,
            tipo: tipoIcono
        };

        expedientes[index].actividad.unshift(nuevaActividad);
        localStorage.setItem('expedientesData', JSON.stringify(expedientes));
    }
}