// js/audiencias.js

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
// LÓGICA DE SINCRONIZACIÓN A AGENDA GENERAL
// -------------------------------
function guardarAudienciaEnAgendaGeneral(audienciaData) {
    let audienciasDesahogadas = JSON.parse(localStorage.getItem('audienciasDesahogadas')) || [];
    
    const audienciaAgenda = {
        id: audienciaData.id, 
        fechaAudiencia: audienciaData.fecha,
        horaAudiencia: audienciaData.hora,
        expediente: audienciaData.expediente,
        tipoAudiencia: audienciaData.tipo,
        partes: audienciaData.actor,
        abogado: audienciaData.abogadoComparece,
        actaDocumento: audienciaData.actaDocumento || '',
        atendida: true,
        fechaDesahogo: audienciaData.fechaDesahogo, 
        observaciones: audienciaData.observaciones || '',
        esEnLinea: audienciaData.esEnLinea,
        urlReunion: audienciaData.urlReunion,
        sala: audienciaData.sala,
        fechaCreacion: new Date().toISOString()
    };
    
    const indexExistente = audienciasDesahogadas.findIndex(a => String(a.id) === String(audienciaAgenda.id));

    if (indexExistente === -1) {
        audienciasDesahogadas.unshift(audienciaAgenda);
    } else {
        audienciasDesahogadas[indexExistente] = audienciaAgenda;
    }
    
    localStorage.setItem('audienciasDesahogadas', JSON.stringify(audienciasDesahogadas));
    console.log('✅ Audiencia guardada/actualizada en Agenda General:', audienciaAgenda);
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

    // NUEVO: Inicializar la lógica del selector de ubicación segmentado
    const ubicacionGroup = document.getElementById('ubicacion-selector-group');
    if (ubicacionGroup) {
        ubicacionGroup.addEventListener('change', updateUbicacionInputs);
        updateUbicacionInputs(); 
    }
}

// NUEVA FUNCIÓN: Maneja la visibilidad de los campos según la selección
function updateUbicacionInputs() {
    // 🛑 CLAVE: Leer el estado del radio button
    const isOnline = document.getElementById('radio-online')?.checked;
    const inputSala = document.getElementById('input-sala');
    const inputUrl = document.getElementById('input-url');

    if (isOnline) {
        inputUrl?.classList.remove('hidden');
        inputSala?.classList.add('hidden');
        // Limpiar campo no usado para evitar errores de validación
        document.getElementById('sala-audiencia').value = ''; 
    } else {
        inputSala?.classList.remove('hidden');
        inputUrl?.classList.add('hidden');
        // Limpiar campo no usado
        document.getElementById('url-audiencia').value = ''; 
    }
}


// -------------------------------
// Lógica de Tipos de Audiencia (Se mantiene igual)
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
// Renderizado Principal (Actualizado para mostrar ubicación)
// -------------------------------
function loadAudiencias() {
const tbody = document.getElementById('audiencias-body');
  if(!tbody) return;

  let ls = [];
  try { ls = JSON.parse(localStorage.getItem('audiencias') || '[]'); } catch (e) { ls = []; }

  const expedientes = JSON.parse(localStorage.getItem('expedientesData')) || [];
  const NOMBRES_GERENCIAS = {
      1: 'Civil, Mercantil, Fiscal y Administrativo',
      2: 'Laboral y Penal',
      3: 'Transparencia y Amparo'
  };

  if (!ls || ls.length === 0) {
      ls = [ ];
      localStorage.setItem('audiencias', JSON.stringify(ls));
  }
  AUDIENCIAS = ls;

  const filtroTipo = document.getElementById('filter-tipo')?.value || '';
  const filtroGerencia = (document.getElementById('filter-gerencia')?.value || '').toLowerCase();
  const filtroMateria = (document.getElementById('filter-materia')?.value || '').toLowerCase(); 
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

    const textoFila = `${a.expediente} ${a.actor} ${a.tribunal} ${a.tipo} ${a.abogadoComparece} ${materiaMostrar} ${gerenciaMostrar}`.toLowerCase();
    
    if (filtroTipo && a.tipo !== filtroTipo) return;
    if (filtroGerencia && !gerenciaMostrar.toLowerCase().includes(filtroGerencia)) return;
    if (filtroMateria && !materiaMostrar.toLowerCase().includes(filtroMateria)) return; 
    if (busqueda && !textoFila.includes(busqueda)) return;

    const sem = getSemaforoStatusAudiencia(a.fecha, a.hora);
    let estadoBadge = '';
    if (a.atendida) {
        estadoBadge = '<span class="inline-flex items-center bg-gray-800 text-white text-xs font-bold px-2.5 py-0.5 rounded border border-gray-600"><i class="fas fa-flag-checkered mr-1"></i> Concluida</span>';
    } else if (a.actaDocumento) {
        if (a.tipoDocumentoSubido === 'Alegatos Amparo') {
            estadoBadge = '<span class="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded border border-indigo-200"><i class="fas fa-file-invoice mr-1"></i> Con Alegatos</span>';
        } else {
            estadoBadge = '<span class="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-200"><i class="fas fa-file-signature mr-1"></i> Con Acta</span>';
        }
    } else {
        estadoBadge = '<span class="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-0.5 rounded border border-yellow-200"><i class="fas fa-clock mr-1"></i> Pendiente</span>';
    }
  
    let ubicacionIcono = '';
    let ubicacionTooltip = '';
    if (a.esEnLinea) {
        ubicacionIcono = `<i class="fas fa-video text-blue-600"></i>`;
        ubicacionTooltip = a.urlReunion || 'En Línea';
    } else {
        ubicacionIcono = `<i class="fas fa-map-marker-alt text-gray-500"></i>`;
        ubicacionTooltip = a.sala || 'Presencial';
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
        
        <td class="px-4 py-3">
            <span class="text-[10px] bg-gray-100 text-gray-600 px-1 rounded w-fit font-semibold">${escapeHTML(a.tipo)}</span>
            <div class="flex items-center gap-1 mt-0.5 text-xs text-gray-700" title="${ubicacionTooltip}">
                 ${ubicacionIcono}
                <span>${a.esEnLinea ? 'En Línea' : 'Presencial'}</span>
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
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <span class="block text-xs font-bold text-gray-400 uppercase">Tribunal / Órgano</span>
                    <span class="font-medium text-gray-800">${escapeHTML(a.tribunal || 'No especificado')}</span>
                </div>

                <div>
                    <span class="block text-xs font-bold text-gray-400 uppercase">Ubicación Detallada</span>
                    <span class="font-medium text-gray-800">${escapeHTML(a.sala || a.urlReunion || 'No especificada')}</span>
                </div>

                ${a.observaciones ? `<div><span class="block text-xs font-bold text-gray-400 uppercase">Resultado / Observaciones</span><span class="font-medium text-gray-800">${escapeHTML(a.observaciones)}</span></div>` : ''}
            </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html || `<tr><td colspan="9" class="text-center py-8 text-gray-500">No hay datos registrados.</td></tr>`;
}

function generarAccionesRapidasAudiencia(audiencia, rol) {
    let html = '<div class="py-1">'; 
    const itemClass = "w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gob-guinda transition-all flex items-center gap-3 group";

    const crearBoton = (claseAccion, icono, texto, color = "text-gray-700", extra = "") => {
        return `
        <button class="${claseAccion} w-full text-left px-4 py-2 text-sm ${color} hover:bg-gray-50 hover:text-gob-guinda transition-all flex items-center gap-3 group ${extra}">
            <div class="w-6 flex justify-center items-center text-opacity-70 group-hover:text-opacity-100 transition-opacity">
                <i class="${icono}"></i>
            </div>
            <span class="font-medium">${texto}</span>
        </button>`;
    };

    const crearSeparador = (titulo = "") => {
        return `<div class="my-1 border-t border-gray-100">
                    ${titulo ? `<p class="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">${titulo}</p>` : ''}
                </div>`;
    };

    // 1. NAVEGACIÓN
    html += crearBoton('action-view-asunto-audiencia', 'fas fa-folder-open', 'Ir al Expediente');

    if (audiencia.esEnLinea && !audiencia.atendida && audiencia.urlReunion && !audiencia.actaDocumento) {
        html += `<a href="${audiencia.urlReunion}" target="_blank" class="w-full text-left px-4 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-3 font-bold border-l-4 border-blue-600">
                    <div class="w-6 flex justify-center"><i class="fas fa-video"></i></div>
                    <span>Unirse a Reunión</span>
                 </a>`;
    }

    // 2. GESTIÓN DE ARCHIVOS
    if (!audiencia.atendida) {
        if (audiencia.actaDocumento) {
            const labelDoc = audiencia.tipoDocumentoSubido === 'Alegatos Amparo' ? 'Alegatos' : 'Acta';
            html += crearSeparador("Gestión");
            html += crearBoton('action-view-acta', 'fas fa-eye', `Ver ${labelDoc} Prev.`, 'text-blue-600');
            html += crearBoton('action-desahogar', 'fas fa-flag-checkered', 'Concluir Audiencia', 'text-green-700', 'bg-green-50/50');
            html += crearBoton('action-remove-acta', 'fas fa-times-circle', `Quitar ${labelDoc}`, 'text-red-500');
        } else {
            html += crearSeparador("Subir Archivo");
            html += crearBoton('action-upload-generic-acta', 'fas fa-file-signature', 'Subir Acta', 'text-gob-oro font-bold');
            html += crearBoton('action-upload-generic-alegatos', 'fas fa-file-invoice', 'Subir Alegatos Amparo', 'text-indigo-600 font-bold');
        }
    } else if (audiencia.actaDocumento) {
        const labelDoc = audiencia.tipoDocumentoSubido === 'Alegatos Amparo' ? 'Alegatos' : 'Acta';
        html += crearSeparador("Archivo Final");
        html += crearBoton('action-view-acta', 'fas fa-file-pdf', `Descargar ${labelDoc}`, 'text-gob-guinda');
    }

    html += crearSeparador();
    html += crearBoton('action-comment-audiencia', 'far fa-comment-dots', 'Comentarios', 'text-gray-500');
    
    if ((rol === 'Direccion' || rol === 'Gerente') && !audiencia.atendida && !audiencia.actaDocumento) {
        html += crearBoton('action-reasignar-audiencia', 'fas fa-user-friends', 'Reasignar Abogado', 'text-orange-600');
    }

    return html + '</div>';
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
            else if (target.classList.contains('action-upload-generic-acta')) {
                const input = row.querySelector('.input-acta-hidden');
                input.dataset.tipoDoc = "Acta"; 
                input.click();
            }
            else if (target.classList.contains('action-upload-generic-alegatos')) {
                const input = row.querySelector('.input-acta-hidden');
                input.dataset.tipoDoc = "Alegatos Amparo";
                input.click();
            }
            else if (target.classList.contains('action-remove-acta')) {
                const tipoActual = audiencia.tipoDocumentoSubido || "Documento";
                mostrarConfirmacionAudiencia(`Quitar ${tipoActual}`, '¿Estás seguro de eliminar el archivo cargado?', () => quitarActa(id));
            }
            else if (target.classList.contains('action-desahogar')) {
                openFinalizarAudienciaModal(id);
            }
            else if (target.classList.contains('action-view-acta')) {
                const nombreDoc = audiencia.actaDocumento;
                const tipoDoc = audiencia.tipoDocumentoSubido || "Documento";
                mostrarAlertaAudiencia(`Previsualizando ${tipoDoc} (Simulación): ${nombreDoc}`);
            }
            else if (target.classList.contains('action-download-acta')) {
                const nombreDoc = audiencia.actaDocumento;
                mostrarAlertaAudiencia(`Descargando archivo: ${nombreDoc}`);
            }
            else if (target.classList.contains('action-reasignar-audiencia')) {
                abrirModalReasignarAudiencia(id);
            }
            else if (target.classList.contains('action-comment-audiencia')) {
                openComentariosModal(id);
            }
            else if (target.classList.contains('action-delete-audiencia')) {
                mostrarConfirmacionAudiencia('Eliminar Audiencia', '¿Deseas eliminar permanentemente este registro?', () => {
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
        if (e.target.classList.contains('input-acta-hidden') && e.target.files.length) {
            const tipo = e.target.dataset.tipoDoc || "Acta";
            subirActa(e.target.getAttribute('data-id'), e.target.files[0], tipo);
        }
    });
}



function setupFilters() {
    ['filter-tipo','filter-gerencia','filter-materia','filter-prioridad'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('change', loadAudiencias);
        if(el && el.tagName === 'INPUT') el.addEventListener('input', loadAudiencias);
    });
}

function subirActa(id, file, tipoElegido = "Acta") {
    const idx = AUDIENCIAS.findIndex(a => String(a.id) === String(id));
    if (idx !== -1) {
        AUDIENCIAS[idx].actaDocumento = file.name;
        AUDIENCIAS[idx].tipoDocumentoSubido = tipoElegido; // <--- GUARDAR TIPO
        localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
        loadAudiencias();
        mostrarMensajeGlobal(`${tipoElegido} cargado correctamente.`, 'success');
    }
}
function quitarActa(id) {
    const idx = AUDIENCIAS.findIndex(a => String(a.id) === String(id));
    if (idx !== -1) {
        AUDIENCIAS[idx].actaDocumento = '';
        AUDIENCIAS[idx].tipoDocumentoSubido = ''; // <--- LIMPIAR TIPO
        localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
        loadAudiencias();
        mostrarMensajeGlobal('Archivo eliminado.', 'warning');
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

    // NUEVO: Resetear y Cargar estado del selector
    const radioPresencial = document.getElementById('radio-presencial');
    const radioOnline = document.getElementById('radio-online');
    
    if (radioPresencial) radioPresencial.checked = true;
    if (radioOnline) radioOnline.checked = false;

    document.getElementById('sala-audiencia').value = '';
    document.getElementById('url-audiencia').value = '';

    if(audiencia) {
        title.textContent = 'Editar Audiencia';
        document.getElementById('audiencia-id').value = audiencia.id;
        
        const selector = document.getElementById('asunto-selector-audiencia');
        if(selector && audiencia.asuntoId) { selector.value = audiencia.asuntoId; selector.dispatchEvent(new Event('change')); }

        if(document.getElementById('fecha-audiencia')) document.getElementById('fecha-audiencia').value = audiencia.fecha || '';
        if(document.getElementById('hora-audiencia')) document.getElementById('hora-audiencia').value = audiencia.hora || '';
        
        // NUEVO: Cargar estado del radio button
        if (audiencia.esEnLinea) {
            if (radioOnline) radioOnline.checked = true;
        } else {
            if (radioPresencial) radioPresencial.checked = true;
        }

        document.getElementById('sala-audiencia').value = audiencia.sala || '';
        document.getElementById('url-audiencia').value = audiencia.urlReunion || '';
        
        updateUbicacionInputs(); 

        if(document.getElementById('tipo-audiencia')) document.getElementById('tipo-audiencia').value = audiencia.tipo || '';
        
        const selAbogado = document.getElementById('abogado-comparece');
        if(selAbogado) {
             if(audiencia.abogadoComparece && ![...selAbogado.options].some(o => o.value === audiencia.abogadoComparece)){
                 const opt = document.createElement('option'); opt.value = audiencia.abogadoComparece; opt.text = audiencia.abogadoComparece; selAbogado.appendChild(opt);
             }
             selAbogado.value = audiencia.abogadoComparece || '';
        }

    } else {
        title.textContent = 'Nueva Audiencia';
        document.getElementById('audiencia-id').value = '';
        updateUbicacionInputs();
    }
    
    modal.style.display = 'flex';
}

function guardarAudiencia() {
    const id = document.getElementById('audiencia-id').value;
    const fecha = document.getElementById('fecha-audiencia').value;
    const hora = document.getElementById('hora-audiencia').value;
    const asuntoId = document.getElementById('asunto-selector-audiencia').value;

    const esEnLinea = document.getElementById('radio-online')?.checked || false;
    const sala = document.getElementById('sala-audiencia')?.value || '';
    const urlReunion = document.getElementById('url-audiencia')?.value || '';
    
    if(!fecha || !hora || !asuntoId) return alert('Completa los campos obligatorios');
    if (!esEnLinea && !sala) return alert('Especifique Sala/Lugar.');
    if (esEnLinea && !urlReunion) return alert('Especifique URL.');

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

    const tipoAudiencia = document.getElementById('tipo-audiencia').value;
    const exp = document.getElementById('expediente-auto-audiencia').value;
    
    // Notificación de Recordatorio
    crearNotificacionGlobal({
        eventType: 'recordatorio',
        title: `Recordatorio: Audiencia ${tipoAudiencia}`,
        expediente: exp,
        status: 'Activo',
        notifyAt: fechaNotificacion.toISOString(),
        detalles: { descripcion: notaRec || `Audiencia programada para el expediente ${exp}` },
        meta: {
            tipoOrigen: 'audiencia',
            expediente: exp,
            anticipacion: textoAnticipacion,
            fechaEvento: fechaBase.toISOString()
        }
    });

    const nueva = {
        id: id || Date.now().toString(),
        fecha, hora, asuntoId,
        tipo: tipoAudiencia || 'General',
        esEnLinea, urlReunion, sala,
        abogadoComparece: document.getElementById('abogado-comparece').value,
        expediente: exp,
        tribunal: document.getElementById('organo-auto-audiencia').value,
        actor: document.getElementById('partes-auto-audiencia').value,
        materia: document.getElementById('materia-auto-audiencia').value, 
        gerencia: document.getElementById('gerencia-auto-audiencia').value, 
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
        AUDIENCIAS.push(nueva);
        
        // Notificación de Creación (Solo Tipo, sin "Nueva Audiencia:")
        crearNotificacionGlobal({
            eventType: 'audiencia',
            title: nueva.tipo, 
            expediente: exp,
            status: 'Pendiente',
            detalles: { juzgado: nueva.tribunal || 'Por asignar' },
            notifyAt: new Date().toISOString()
        });

        registrarActividadExpediente(
            asuntoId,
            'Nueva Audiencia Programada',
            `Tipo: ${nueva.tipo}. Fecha: ${formatDate(fecha)} ${hora} hrs. Lugar: ${esEnLinea ? 'En Línea' : nueva.sala}.`,
            'edit'
        );
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
        const observaciones = document.getElementById('observaciones-finales').value; 
        const idx = AUDIENCIAS.findIndex(a => String(a.id) === String(id));   
        
        if(idx !== -1) {
            const audienciaAConcluir = AUDIENCIAS[idx];

            audienciaAConcluir.observaciones = observaciones; 
            audienciaAConcluir.atendida = true;
            audienciaAConcluir.fechaDesahogo = new Date().toISOString().split('T')[0]; 

            // Notificación de Conclusión (Solo Tipo)
            crearNotificacionGlobal({
                eventType: 'audiencia',
                title: audienciaAConcluir.tipo,
                expediente: audienciaAConcluir.expediente,
                status: 'Concluida',
                detalles: { juzgado: 'Desahogada exitosamente' },
                notifyAt: new Date().toISOString()
            });

            // Mover a Agenda General
            const historico = JSON.parse(localStorage.getItem('audienciasDesahogadas')) || [];
            historico.push(audienciaAConcluir);
            localStorage.setItem('audienciasDesahogadas', JSON.stringify(historico));
            
            // Eliminar de pendientes
            AUDIENCIAS = AUDIENCIAS.filter(a => String(a.id) !== String(id));
            localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
            
            registrarActividadExpediente(
                audienciaAConcluir.asuntoId,
                'Audiencia Concluida',
                `Se desahogó la audiencia tipo ${audienciaAConcluir.tipo} con resultado: ${audienciaAConcluir.observaciones.substring(0, 50)}...`,
                'status'
            );

            loadAudiencias();
            mostrarMensajeGlobal('Audiencia desahogada y movida a Agenda General.', 'success');
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

// === HELPER PARA GENERAR NOTIFICACIONES DINÁMICAS ===
function crearNotificacionGlobal(datos) {
    const KEY = 'jl_notifications_v4';
    const notificaciones = JSON.parse(localStorage.getItem(KEY)) || [];
    
    const nuevaNotif = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        eventType: datos.eventType,
        title: datos.title,
        expediente: datos.expediente,
        status: datos.status,
        detalles: datos.detalles || {},
        notifyAt: datos.notifyAt || new Date().toISOString(),
        meta: datos.meta || {}
    };
    
    notificaciones.push(nuevaNotif);
    localStorage.setItem(KEY, JSON.stringify(notificaciones));
}