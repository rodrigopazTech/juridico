// js/terminos.js

// ===============================================
// 1. CONFIGURACIÓN Y DATOS
// ===============================================
const USER_ROLE = 'Direccion'; // Cambia esto para probar permisos (Abogado, Gerente, Direccion)

const FLUJO_ETAPAS = {
    'Proyectista': { siguiente: 'Revisión', accion: 'enviarRevision', label: 'Enviar a Revisión' },
    'Revisión':    { siguiente: 'Gerencia', anterior: 'Proyectista', accion: 'aprobar', label: 'Aprobar a Gerencia' },
    'Gerencia':    { siguiente: 'Dirección', anterior: 'Revisión', accion: 'aprobar', label: 'Aprobar a Dirección' },
    'Dirección':   { siguiente: 'Liberado', anterior: 'Gerencia', accion: 'aprobar', label: 'Liberar Término' },
    'Liberado':    { siguiente: 'Presentado', accion: 'subirAcuse', label: 'Subir Acuse' },
    'Presentado':  { siguiente: 'Concluido', accion: 'concluir', label: 'Concluir' }
};

const PERMISOS_ETAPAS = {
    'Proyectista': ['Abogado', 'Gerente','JefeDepto','Direccion'],
    'Revisión':    ['JefeDepto', 'Gerente', 'Direccion'],
    'Gerencia':    ['Gerente', 'Direccion'],
    'Dirección':   ['Direccion', 'Subdireccion'],
    'Liberado':    ['Abogado', 'JefeDepto', 'Gerente','Direccion'],
    'Presentado':  ['Direccion'],
    'Concluido':   []
};

let TERMINOS = [];

// ===============================================
// 2. INICIALIZACIÓN
// ===============================================
function initTerminos() {
    console.log("Iniciando módulo Términos V3...");
    cargarDatosIniciales();
    loadTerminos(); 
    setupSearchAndFilters();
    initModalTerminosJS();      
    initModalPresentar();       
    initModalReasignar();       
    setupFileUploads();
    setupActionMenuListener(); 
    cargarAsuntosEnSelectorJS();
    cargarAbogadosSelector();

    // Botón Nuevo
    const btnNuevo = document.getElementById('add-termino');
    if (btnNuevo) {
        const newBtn = btnNuevo.cloneNode(true);
        btnNuevo.parentNode.replaceChild(newBtn, btnNuevo);
        newBtn.addEventListener('click', () => openTerminoModalJS());
    }

    // Botón Exportar
    const btnExportar = document.getElementById('export-terminos');
    if (btnExportar) {
        const newBtnExp = btnExportar.cloneNode(true);
        btnExportar.parentNode.replaceChild(newBtnExp, btnExportar);
        newBtnExp.addEventListener('click', () => {
             if(typeof XLSX !== 'undefined') exportarTablaExcel(); 
             else alert('Librería de exportación no cargada.');
        });
    }
}

function cargarDatosIniciales() {
    const localData = JSON.parse(localStorage.getItem('terminos'));
    if (localData && localData.length > 0) {
        TERMINOS = localData;
    } else {
        // Datos de Ejemplo
        TERMINOS = [
            { id: 1, expediente: '2375/2025', actor: 'Juan Perez', asunto: 'Despido', prestacion: 'Reinstalación', abogado: 'Lic. Martínez', estatus: 'Proyectista', fechaIngreso: '2025-11-01', fechaVencimiento: '2025-12-04', acuseDocumento: '' },
            { id: 2, expediente: '1090/2024', actor: 'Maria Lopez', asunto: 'Amparo', prestacion: 'Constitucional', abogado: 'Lic. González', estatus: 'Revisión', fechaIngreso: '2025-10-14', fechaVencimiento: '2025-12-03', acuseDocumento: '' },
            { id: 3, expediente: '2189/2025', actor: 'Rodrigo Paz', asunto: 'Despido', prestacion: 'Reinstalación', abogado: 'Lic. Martínez', estatus: 'Gerencia', fechaIngreso: '2025-10-11', fechaVencimiento: '2025-12-01', acuseDocumento: '' },
            { id: 7, expediente: '1201/2024', actor: 'Ricardo Villalobos', asunto: 'Amparo', prestacion: 'Constitucional', abogado: 'Lic. González', estatus: 'Concluido', fechaIngreso: '2025-11-25', fechaVencimiento: '2025-11-26', acuseDocumento: 'prueba.pdf' },
        ];
        localStorage.setItem('terminos', JSON.stringify(TERMINOS));
    }
}

// ===============================================
// 3. RENDERIZADO
// ===============================================
function loadTerminos() {
    const tbody = document.getElementById('terminos-body');
    if(!tbody) return;

    const filtros = {
        tribunal: document.getElementById('filter-tribunal-termino')?.value.toLowerCase() || '',
        estado: document.getElementById('filter-estado-termino')?.value.toLowerCase() || '',
        estatus: document.getElementById('filter-estatus-termino')?.value || '',
        prioridad: document.getElementById('filter-prioridad-termino')?.value || '',
        materia: document.getElementById('filter-materia-termino')?.value || '',
        search: document.getElementById('search-terminos')?.value.toLowerCase() || ''
    };

    const listaFiltrada = TERMINOS.filter(t => {
        const textoCompleto = `${t.expediente} ${t.actor} ${t.asunto} ${t.abogado}`.toLowerCase();
        if (filtros.search && !textoCompleto.includes(filtros.search)) return false;
        if (filtros.estatus && !filtros.estatus.includes('todos') && t.estatus !== filtros.estatus) return false;
        if (filtros.prioridad && !filtros.prioridad.includes('todos') && t.prioridad !== filtros.prioridad) return false;
        return true;
    });

    let html = '';
    listaFiltrada.forEach(t => {
        const semaforoColor = getSemaforoColor(t.fechaVencimiento); 
        const badgeClass = getBadgeClass(t.estatus);
        const diasRestantes = calcularDiasRestantes(t.fechaVencimiento);
        
        let tooltipTexto = diasRestantes < 0 ? `Vencido hace ${Math.abs(diasRestantes)} días` : (diasRestantes === 0 ? "Vence HOY" : `Faltan ${diasRestantes} días`);

        const esBloqueado = t.estatus === 'Concluido' || t.estatus === 'Presentado';
        const botonEditar = esBloqueado
            ? `<button class="text-gray-300 cursor-not-allowed p-1" title="Bloqueado"><i class="fas fa-lock"></i></button>` 
            : `<button class="text-gray-400 hover:text-gob-oro action-edit p-1" title="Editar"><i class="fas fa-edit"></i></button>`;

        html += `
        <tr class="bg-white hover:bg-gray-50 border-b transition-colors group" data-id="${t.id}">
            <td class="px-4 py-3 whitespace-nowrap text-center">
                <div class="flex items-center">
                    <div class="w-2.5 h-2.5 rounded-full mr-2 ${semaforoColor}" title="${tooltipTexto}"></div>
                    <span class="text-sm font-medium text-gray-900">${formatDate(t.fechaIngreso)}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 font-bold">${formatDate(t.fechaVencimiento)}</td>
            <td class="px-4 py-3 text-sm font-bold text-gob-guinda">${t.expediente}</td>
            <td class="px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate" title="${t.actor}">${t.actor}</td>
            <td class="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title="${t.asunto}">${t.asunto}</td> 
            <td class="px-4 py-3 text-sm text-gray-500">${t.prestacion || 'N/A'}</td> 
            <td class="px-4 py-3 text-sm text-gray-500">${t.abogado}</td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${badgeClass}">
                    ${t.estatus}
                </span>
            </td>
            
            <td class="px-4 py-3 text-right whitespace-nowrap relative">
                <div class="flex items-center justify-end gap-2">
                    ${botonEditar}
                    
                    <button class="text-gray-400 hover:text-gob-guinda action-menu-toggle p-1 px-2 transition-colors" title="Más Acciones">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="action-menu hidden bg-white rounded shadow-xl border border-gray-100 border-t-4 border-gob-oro w-56 font-headings z-50">
                        ${generarAccionesRapidas(t, USER_ROLE)}
                    </div>
                    <input type="file" class="input-acuse-hidden hidden" data-id="${t.id}">
                </div>
            </td>
        </tr>
        `;
    });

    tbody.innerHTML = html || '<tr><td colspan="9" class="text-center py-4 text-gray-500">No se encontraron resultados</td></tr>';
}

function setupSearchAndFilters() {
    const ids = ['search-terminos', 'filter-tribunal-termino', 'filter-estado-termino', 'filter-estatus-termino', 'filter-prioridad-termino', 'filter-materia-termino'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', loadTerminos);
    });
}

// ===============================================
// 4. GENERACIÓN DE MENÚ
// ===============================================
function generarAccionesRapidas(termino, rol) {
    let html = '';
    const etapa = termino.estatus;
    const rolesPermitidos = PERMISOS_ETAPAS[etapa] || [];
    const puedeActuar = rolesPermitidos.includes(rol);

    const itemClass = "w-full text-left px-4 py-3 text-sm text-gob-gris hover:bg-gray-50 hover:text-gob-guinda transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0";

    // Opciones Comunes
    html += `<button class="${itemClass} action-view-asunto"><i class="fas fa-briefcase text-gray-400"></i> Ver Asunto</button>`;
    html += `<button class="${itemClass} action-history"><i class="fas fa-eye text-gray-400"></i> Ver Historial</button>`;

    // CASO FINAL: CONCLUIDO
    if (etapa === 'Concluido') {
        if (termino.acuseDocumento) {
            html += `<button class="${itemClass} action-download-acuse text-blue-600"><i class="fas fa-file-download"></i> Descargar Acuse</button>`;
        }
        if (rol === 'Direccion') {
             html += `<div class="border-t border-gray-100 my-1"></div>`;
             html += `<button class="${itemClass} action-delete text-red-600 font-bold"><i class="fas fa-trash-alt"></i> Eliminar</button>`;
        }
        return html; 
    }

    // CASO ESPECIAL: PRESENTADO
    if (etapa === 'Presentado') {
        html += `<div class="border-t border-gray-100 my-1"></div>`;
        html += `<button class="${itemClass} action-download-acuse text-blue-600"><i class="fas fa-file-download"></i> Descargar Acuse</button>`;
        
        if (puedeActuar) {
            html += `<button class="${itemClass} action-conclude text-green-600 font-bold"><i class="fas fa-flag-checkered"></i> <strong>Concluir</strong></button>`;
        }
        html += `<button class="${itemClass} action-remove-acuse text-red-500"><i class="fas fa-times-circle"></i> Quitar Acuse</button>`;
        return html;
    }

    // RESTO DE ETAPAS
    if (puedeActuar) {
        html += `<div class="border-t border-gray-100 my-1"></div>`;
        const config = FLUJO_ETAPAS[etapa];
        if (config) {
            if (config.accion === 'enviarRevision' || config.accion === 'aprobar') {
                html += `<button class="${itemClass} action-advance text-green-700"><i class="fas fa-check"></i> <strong>${config.label}</strong></button>`;
            }
            if (config.accion === 'subirAcuse') {
                html += `<button class="${itemClass} action-upload-acuse text-blue-700"><i class="fas fa-file-upload"></i> <strong>${config.label}</strong></button>`;
            }
            if (config.anterior) {
                html += `<button class="${itemClass} action-reject text-red-600"><i class="fas fa-times"></i> Rechazar</button>`;
            }
        }
    }

    if (rol === 'Gerente' || rol === 'Direccion') {
        html += `<div class="border-t border-gray-100 my-1"></div>`;
        html += `<button class="${itemClass} action-reasignar"><i class="fas fa-user-friends text-gray-400"></i> Reasignar</button>`;
        if (rol === 'Direccion') {
            html += `<button class="${itemClass} action-delete text-red-600 font-bold hover:bg-red-50"><i class="fas fa-trash-alt"></i> Eliminar</button>`;
        }
    }
    return html;
}

// ===============================================
// 5. LISTENER INTELIGENTE
// ===============================================
function setupActionMenuListener() {
    const tbody = document.getElementById('terminos-body');
    if(!tbody) return;

    tbody.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;

        const row = target.closest('tr');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const termino = TERMINOS.find(t => String(t.id) === String(id));

        // MENÚ FLOTANTE
        if (target.classList.contains('action-menu-toggle')) {
            e.preventDefault(); e.stopPropagation();
            const menu = target.nextElementSibling; 
            
            if (!menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
                menu.style.cssText = ''; 
                return;
            }
            document.querySelectorAll('.action-menu').forEach(m => { m.classList.add('hidden'); m.style.cssText = ''; });

            menu.classList.remove('hidden');
            const rect = target.getBoundingClientRect(); 
            const menuWidth = 224; 
            const menuHeight = menu.offsetHeight || 220; 
            const spaceBelow = window.innerHeight - rect.bottom;

            menu.style.position = 'fixed';
            menu.style.zIndex = '99999';
            menu.style.width = menuWidth + 'px';
            menu.style.left = (rect.right - menuWidth) + 'px';

            if (spaceBelow < menuHeight) {
                menu.style.top = 'auto';
                menu.style.bottom = (window.innerHeight - rect.top + 5) + 'px';
                menu.classList.remove('border-t-4');
                menu.classList.add('border-b-4');
            } else {
                menu.style.bottom = 'auto';
                menu.style.top = (rect.bottom + 5) + 'px';
                menu.classList.add('border-t-4');
                menu.classList.remove('border-b-4');
            }
            return;
        }

        // ACCIONES
        if (target.classList.contains('action-edit')) openTerminoModalJS(termino);
        else if (target.classList.contains('action-advance')) avanzarEtapa(id);
        else if (target.classList.contains('action-reject')) regresarEtapa(id);
        else if (target.classList.contains('action-upload-acuse')) row.querySelector('.input-acuse-hidden').click();
        
        else if (target.classList.contains('action-download-acuse')) {
            mostrarAlertaTermino(`Descargando documento: ${termino.acuseDocumento}`);
        }
        else if (target.classList.contains('action-remove-acuse')) {
            mostrarConfirmacion(
                'Quitar Acuse',
                '¿Deseas quitar el acuse actual? \n\nEl término regresará al estado "Liberado".',
                () => {
                    termino.acuseDocumento = '';
                    termino.estatus = 'Liberado'; 
                    guardarYRecargar();
                    mostrarMensajeGlobal('Acuse eliminado. Estado regresado a Liberado.', 'warning');
                }
            );
        }
        else if (target.classList.contains('action-conclude')) abrirModalPresentar(id, 'Concluir Término', 'Se marcará como finalizado.');
        else if (target.classList.contains('action-reasignar')) abrirModalReasignar(id);
        else if (target.classList.contains('action-delete')) {
            mostrarConfirmacion('Eliminar Término', '¿Eliminar término permanentemente?', () => {
                TERMINOS = TERMINOS.filter(t => String(t.id) !== String(id));
                guardarYRecargar();
                mostrarMensajeGlobal('Término eliminado.', 'success');
            });
        }
        
        document.querySelectorAll('.action-menu').forEach(m => m.classList.add('hidden'));
    });
    
    // Cierres Globales
    document.addEventListener('click', e => {
        if (!e.target.closest('.action-menu-toggle') && !e.target.closest('.action-menu')) {
            document.querySelectorAll('.action-menu').forEach(m => { m.classList.add('hidden'); m.style.cssText = ''; });
        }
    });
    window.addEventListener('scroll', () => {
        document.querySelectorAll('.action-menu:not(.hidden)').forEach(m => { m.classList.add('hidden'); m.style.cssText = ''; });
    }, true);
    
    // Listener Archivo
    tbody.addEventListener('change', function(e) {
        if (e.target.classList.contains('input-acuse-hidden') && e.target.files.length > 0) {
            const id = e.target.getAttribute('data-id');
            const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
            if(idx !== -1) {
                TERMINOS[idx].acuseDocumento = e.target.files[0].name;
                if(TERMINOS[idx].estatus === 'Liberado') TERMINOS[idx].estatus = 'Presentado';
                guardarYRecargar();
                mostrarMensajeGlobal('Acuse subido', 'success');
            }
        }
    });
}

// ===============================================
// 6. TRANSICIONES
// ===============================================
function avanzarEtapa(id) {
    const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return;
    const actual = TERMINOS[idx].estatus;
    const config = FLUJO_ETAPAS[actual];
    
    if(config && config.siguiente) {
        if (actual === 'Dirección') {
             abrirModalPresentar(id, 'Liberar Término', 'El término pasará a estado "Liberado".');
             return;
        }
        mostrarConfirmacion('Avanzar Etapa', `¿Avanzar de "${actual}" a "${config.siguiente}"?`, () => {
            TERMINOS[idx].estatus = config.siguiente;
            guardarYRecargar();
            mostrarMensajeGlobal(`Avanzado a ${config.siguiente}`, 'success');
        });
    }
}

function regresarEtapa(id) {
    const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return;
    const actual = TERMINOS[idx].estatus;
    const config = FLUJO_ETAPAS[actual];
    
    if(config && config.anterior) {
        mostrarPrompt('Rechazar Término', `¿Por qué regresas el término de "${actual}"?`, 'Motivo...', (motivo) => {
            TERMINOS[idx].estatus = config.anterior;
            console.log(`Rechazado: ${motivo}`);
            guardarYRecargar();
            mostrarMensajeGlobal(`Regresado a ${config.anterior}`, 'warning');
        });
    }
}

function guardarYRecargar() {
    localStorage.setItem('terminos', JSON.stringify(TERMINOS));
    loadTerminos();
}

// ===============================================
// 7. MODALES (MANUALES)
// ===============================================
function initModalTerminosJS() {
   const modal = document.getElementById('modal-termino');
   const btnSave = document.getElementById('save-termino');
   document.querySelectorAll('#close-modal-termino, #cancel-termino').forEach(btn => {
       if(btn) btn.onclick = () => { modal.classList.remove('flex'); modal.classList.add('hidden'); };
   });
   if(btnSave) {
       const newBtn = btnSave.cloneNode(true);
       btnSave.parentNode.replaceChild(newBtn, btnSave);
       newBtn.onclick = (e) => { e.preventDefault(); guardarTermino(); };
   }
}

function openTerminoModalJS(termino = null) {
    const modal = document.getElementById('modal-termino');
    const form = document.getElementById('form-termino');
    const title = document.getElementById('modal-termino-title');
    form.reset();
    cargarAsuntosEnSelectorJS();
    
    if (termino) {
        title.textContent = 'Editar Datos del Término';
        document.getElementById('termino-id').value = termino.id;
        if(document.getElementById('asunto-selector')) document.getElementById('asunto-selector').value = termino.asuntoId || '';
        document.getElementById('fecha-ingreso').value = termino.fechaIngreso || '';
        document.getElementById('fecha-vencimiento').value = termino.fechaVencimiento || '';
        document.getElementById('actuacion').value = termino.asunto || '';
        if(termino.asuntoId) cargarDatosAsuntoEnModalJS(termino.asuntoId);
    } else {
        title.textContent = 'Nuevo Término';
        document.getElementById('termino-id').value = '';
    }
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function guardarTermino() {
    const id = document.getElementById('termino-id').value;
    const data = {
        asuntoId: document.getElementById('asunto-selector').value,
        fechaIngreso: document.getElementById('fecha-ingreso').value,
        fechaVencimiento: document.getElementById('fecha-vencimiento').value,
        asunto: document.getElementById('actuacion').value,
    };
    if(!data.asuntoId || !data.fechaVencimiento) return mostrarMensajeGlobal('Faltan campos obligatorios', 'danger');

    if(id) {
        const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
        if(idx !== -1) TERMINOS[idx] = { ...TERMINOS[idx], ...data };
    } else {
        TERMINOS.push({
            id: Date.now(),
            estatus: 'Proyectista',
            ...data,
            acuseDocumento: '',
            expediente: document.getElementById('termino-expediente').value,
            actor: document.getElementById('termino-partes').value,
            abogado: document.getElementById('termino-abogado').value
        });
    }
    guardarYRecargar();
    const modal = document.getElementById('modal-termino');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

// --- Helpers de Modales ---
function initModalReasignar() {
    const modal = document.getElementById('modal-reasignar');
    const btnSave = document.getElementById('save-reasignar');
    document.querySelectorAll('#close-modal-reasignar, #cancel-reasignar').forEach(btn => btn.onclick = () => { modal.classList.remove('flex'); modal.classList.add('hidden'); });
    if(btnSave) {
        const newBtn = btnSave.cloneNode(true);
        btnSave.parentNode.replaceChild(newBtn, btnSave);
        newBtn.onclick = () => {
            const id = document.getElementById('reasignar-termino-id').value;
            const sel = document.getElementById('select-nuevo-abogado');
            const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
            if(idx !== -1 && sel.value) {
                TERMINOS[idx].abogado = sel.options[sel.selectedIndex].text;
                guardarYRecargar();
                modal.classList.remove('flex'); modal.classList.add('hidden');
            }
        };
    }
}
function abrirModalReasignar(id) {
    const modal = document.getElementById('modal-reasignar');
    const termino = TERMINOS.find(t => String(t.id) === String(id));
    if(!termino) return;
    document.getElementById('reasignar-termino-id').value = id;
    document.getElementById('reasignar-actuacion').value = termino.asunto;
    document.getElementById('reasignar-abogado-actual').value = termino.abogado;
    cargarAbogadosSelector();
    modal.classList.remove('hidden'); modal.classList.add('flex');
}

function initModalPresentar() {
    const modal = document.getElementById('modal-presentar-termino');
    const btnConfirm = document.getElementById('confirmar-presentar');
    document.querySelectorAll('#close-modal-presentar, #cancel-presentar').forEach(btn => btn.onclick = () => { modal.classList.remove('flex'); modal.classList.add('hidden'); });
    if(btnConfirm) {
        const newBtn = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);
        newBtn.onclick = () => {
            const id = document.getElementById('presentar-termino-id').value;
            const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
            if(idx !== -1) {
                if (TERMINOS[idx].estatus === 'Presentado') {
                    TERMINOS[idx].estatus = 'Concluido';
                } else {
                    const siguiente = FLUJO_ETAPAS[TERMINOS[idx].estatus]?.siguiente;
                    if(siguiente) TERMINOS[idx].estatus = siguiente;
                }
                guardarYRecargar();
                modal.classList.remove('flex'); modal.classList.add('hidden');
            }
        };
    }
}
function abrirModalPresentar(id, titulo, mensaje) {
    const modal = document.getElementById('modal-presentar-termino');
    document.getElementById('presentar-termino-id').value = id;
    modal.classList.remove('hidden'); modal.classList.add('flex');
}

// ===============================================
// 8. HELPERS & MODALES GLOBALES
// ===============================================
function calcularDiasRestantes(fechaVencimiento) {
    if (!fechaVencimiento) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const [year, month, day] = fechaVencimiento.split('-').map(Number);
    const vencimiento = new Date(year, month - 1, day); 
    const diferenciaMs = vencimiento - hoy;
    return Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
}

function getSemaforoColor(fecha) {
  const dias = calcularDiasRestantes(fecha);
    if (dias === null) return 'bg-gray-300';
    if (dias < 0) return 'bg-red-700';      
    if (dias === 0) return 'bg-red-500 animate-pulse'; 
    if (dias <= 3) return 'bg-orange-500';  
    if (dias <= 7) return 'bg-yellow-400';  
    return 'bg-green-500';
}

function getBadgeClass(estatus) {
    switch(estatus) {
        case 'Proyectista': return 'bg-gray-100 text-gray-700 border-gray-200';
        case 'Liberado': return 'bg-green-100 text-green-800 border-green-200';
        case 'Concluido': return 'bg-gob-verde text-white border-gob-verdeDark';
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; 
    }
}

// --- MODAL CONFIRMACION ---
let onConfirmAction = null;
function mostrarConfirmacion(titulo, mensaje, callback) {
    const modal = document.getElementById('modal-confirmacion-global');
    if (!modal) return;
    document.getElementById('confirm-titulo').textContent = titulo;
    document.getElementById('confirm-mensaje').textContent = mensaje;
    onConfirmAction = callback;
    document.getElementById('btn-confirm-accept').onclick = function() {
        if (onConfirmAction) onConfirmAction();
        cerrarConfirmacion();
    };
    document.getElementById('btn-confirm-cancel').onclick = cerrarConfirmacion;
    modal.classList.remove('hidden'); modal.classList.add('flex');
}
function cerrarConfirmacion() {
    const modal = document.getElementById('modal-confirmacion-global');
    if (modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
    onConfirmAction = null;
}

// --- MODAL PROMPT ---
let onPromptAction = null; 
function mostrarPrompt(titulo, mensaje, placeholder, callback) {
    const modal = document.getElementById('modal-prompt-global');
    if (!modal) return;
    document.getElementById('prompt-titulo').textContent = titulo;
    document.getElementById('prompt-mensaje').textContent = mensaje;
    const input = document.getElementById('prompt-input');
    input.placeholder = placeholder || '...';
    input.value = '';
    onPromptAction = callback;
    document.getElementById('btn-prompt-accept').onclick = function() {
        if(input.value.trim()) { if(onPromptAction) onPromptAction(input.value.trim()); cerrarPrompt(); }
    };
    document.getElementById('btn-prompt-cancel').onclick = cerrarPrompt;
    modal.classList.remove('hidden'); modal.classList.add('flex');
}
function cerrarPrompt() {
    const modal = document.getElementById('modal-prompt-global');
    if (modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
    onPromptAction = null;
}

// --- MODAL ALERTA ---
function mostrarAlertaTermino(mensaje) {
    const modal = document.getElementById('modal-alerta-termino');
    if(!modal) return;
    document.getElementById('alerta-mensaje-termino').textContent = mensaje;
    document.getElementById('btn-alerta-accept-termino').onclick = () => { modal.classList.remove('flex'); modal.classList.add('hidden'); };
    modal.classList.remove('hidden'); modal.classList.add('flex');
}

// --- Helpers ---
function mostrarMensajeGlobal(msg, type) {
    const div = document.createElement('div');
    const color = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    div.className = `fixed top-5 right-5 px-6 py-3 text-white rounded shadow-lg z-[100] ${color} animate-fade-in-down`;
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function cargarAsuntosEnSelectorJS() {
    const sel = document.getElementById('asunto-selector');
    if(!sel) return;
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    asuntos.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.text = `${a.expediente} - ${a.descripcion || ''}`;
        sel.appendChild(opt);
    });
    sel.onchange = () => {
        const a = asuntos.find(x => String(x.id) === sel.value);
        if(a) {
            document.getElementById('termino-expediente').value = a.expediente || '';
            document.getElementById('termino-materia').value = a.materia || '';
            document.getElementById('termino-gerencia').value = a.gerencia || '';
            document.getElementById('termino-abogado').value = a.abogadoResponsable || '';
            document.getElementById('termino-partes').value = a.partesProcesales || '';
            document.getElementById('termino-tipo-asunto').value = a.tipoAsunto || '';
            document.getElementById('termino-prioridad').value = a.prioridadAsunto || '';
            document.getElementById('termino-organo').value = a.organoJurisdiccional || '';
        }
    };
}
function cargarDatosAsuntoEnModalJS(asuntoId) {
    const selector = document.getElementById('asunto-selector');
    if(selector) { selector.value = asuntoId; selector.dispatchEvent(new Event('change')); }
}
function cargarAbogadosSelector() {
    const sel = document.getElementById('select-nuevo-abogado');
    if(!sel) return;
    sel.innerHTML = '<option value="">Seleccionar...</option><option value="Lic. A">Lic. A</option>';
}
function formatDate(date) { return date; }