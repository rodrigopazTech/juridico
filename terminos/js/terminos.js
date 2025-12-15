// js/terminos.js

// ===============================================
// 1. CONFIGURACIÓN Y DATOS
// ===============================================
const USER_ROLE = 'Direccion'; // Puedes cambiar esto para probar permisos

const FLUJO_ETAPAS = {
    'Proyectista': { siguiente: 'Revisión', accion: 'enviarRevision', label: 'Enviar a Revisión' },
    'Revisión':    { siguiente: 'Gerencia', anterior: 'Proyectista', accion: 'aprobar', label: 'Aprobar a Gerencia' },
    'Gerencia':    { siguiente: 'Dirección', anterior: 'Revisión', accion: 'aprobar', label: 'Aprobar a Dirección' },
    'Dirección':   { siguiente: 'Liberado', anterior: 'Gerencia', accion: 'aprobar', label: 'Liberar Término' },
    'Liberado':    { siguiente: 'Presentado', accion: 'subirAcuse', label: 'Subir Acuse' },
    'Presentado':  { siguiente: 'Concluido', accion: 'concluir', label: 'Concluir' }
};

// CORRECCIÓN: Agregado 'Subdireccion' a todos los permisos para que veas los botones
const PERMISOS_ETAPAS = {
    'Proyectista': ['Abogado', 'Gerente','JefeDepto','Direccion', 'Subdireccion'],
    'Revisión':    ['JefeDepto', 'Gerente', 'Direccion', 'Subdireccion'],
    'Gerencia':    ['Gerente', 'Direccion', 'Subdireccion'],
    'Dirección':   ['Direccion', 'Subdireccion'],
    'Liberado':    ['Abogado', 'JefeDepto', 'Gerente','Direccion', 'Subdireccion'],
    'Presentado':  ['Direccion', 'Subdireccion', 'Abogado'],
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
    setupActionMenuListener(); 
    cargarAsuntosEnSelectorJS();
    cargarAbogadosSelector();

    const btnNuevo = document.getElementById('add-termino');
    if (btnNuevo) {
        const newBtn = btnNuevo.cloneNode(true);
        btnNuevo.parentNode.replaceChild(newBtn, btnNuevo);
        newBtn.addEventListener('click', () => openTerminoModalJS());
    }

    const btnExportar = document.getElementById('export-terminos');
    if (btnExportar) {
        const newBtnExp = btnExportar.cloneNode(true);
        btnExportar.parentNode.replaceChild(newBtnExp, btnExportar);
        newBtnExp.addEventListener('click', () => { if(typeof XLSX !== 'undefined') exportarTablaExcel(); else alert('Librería de exportación no cargada.'); });
    }

    document.querySelectorAll('.fixed.inset-0').forEach(modal => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });
}

function cargarDatosIniciales() {
    try {
        const localData = JSON.parse(localStorage.getItem('terminos'));
        if (localData && Array.isArray(localData) && localData.length > 0) {
            TERMINOS = localData;
        } else {
            // Datos de prueba si está vacío
            TERMINOS = [
                //{ id: 1, expediente: '2375/2025', actor: 'Juan Perez', asunto: 'Despido', prestacion: 'Reinstalación', abogado: 'Lic. Martínez', estatus: 'Proyectista', fechaIngreso: '2025-11-01', fechaVencimiento: '2025-12-15', acuseDocumento: '', prioridad: 'Alta' },
                //{ id: 2, expediente: '1090/2024', actor: 'Maria Lopez', asunto: 'Amparo', prestacion: 'Constitucional', abogado: 'Lic. González', estatus: 'Revisión', fechaIngreso: '2025-10-14', fechaVencimiento: '2025-12-12', acuseDocumento: '', prioridad: 'Media' },
                //{ id: 3, expediente: '2189/2025', actor: 'Rodrigo Paz', asunto: 'Despido', prestacion: 'Reinstalación', abogado: 'Lic. Martínez', estatus: 'Gerencia', fechaIngreso: '2025-10-11', fechaVencimiento: '2025-12-06', acuseDocumento: '', prioridad: 'Alta' },
                //{ id: 4, expediente: '2376/2125', actor: 'Juan Perez', asunto: 'Despido', prestacion: 'Reinstalación', abogado: 'Lic. Martínez', estatus: 'Dirección', fechaIngreso: '2025-11-01', fechaVencimiento: '2025-12-15', acuseDocumento: '', prioridad: 'Alta' },
                //{ id: 5, expediente: '1290/2124', actor: 'Maria Lopez', asunto: 'Amparo', prestacion: 'Constitucional', abogado: 'Lic. González', estatus: 'Liberado', fechaIngreso: '2025-10-14', fechaVencimiento: '2025-12-12', acuseDocumento: '', prioridad: 'Media' }
            ];
            localStorage.setItem('terminos', JSON.stringify(TERMINOS));
        }
    } catch (e) {
        console.error("Error cargando datos iniciales", e);
        TERMINOS = [];
    }
}

// ===============================================
// 3. RENDERIZADO
// ===============================================
function loadTerminos() {
    const tbody = document.getElementById('terminos-body');
    if(!tbody) return;

    // Obtener filtros de forma segura
    const filtros = {
        tribunal: document.getElementById('filter-tribunal-termino')?.value.toLowerCase() || '',
        estado: document.getElementById('filter-estado-termino')?.value.toLowerCase() || '',
        estatus: document.getElementById('filter-estatus-termino')?.value || '',
        prioridad: document.getElementById('filter-prioridad-termino')?.value || '',
        materia: document.getElementById('filter-materia-termino')?.value || '',
        search: document.getElementById('search-terminos')?.value.toLowerCase() || ''
    };

    // Filtrar términos que NO están en estado "Liberado" para la tabla principal
    // (Los liberados se mueven a Agenda General)
    const listaFiltrada = TERMINOS.filter(t => {
        const textoCompleto = `${t.expediente || ''} ${t.actor || ''} ${t.asunto || ''} ${t.abogado || ''}`.toLowerCase();
        
        // Excluir términos liberados de la tabla principal
        if (t.estatus === 'Liberado') return false;
        
        if (filtros.search && !textoCompleto.includes(filtros.search)) return false;
        if (filtros.estatus && !filtros.estatus.includes('Todos') && t.estatus !== filtros.estatus) return false;
        if (filtros.prioridad && !filtros.prioridad.includes('Todas') && t.prioridad !== filtros.prioridad) return false;
        
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
        
        const iconoObservacion = t.observaciones 
            ? `<i class="fas fa-comment-alt text-blue-500 ml-2" title="Observación: ${t.observaciones}"></i>` 
            : '';

        html += `
        <tr class="bg-white hover:bg-gray-50 border-b transition-colors group" data-id="${t.id}">
            <td class="px-4 py-3 whitespace-nowrap text-center">
                <div class="flex items-center">
                    <div class="w-2.5 h-2.5 rounded-full mr-2 ${semaforoColor}" title="${tooltipTexto}"></div>
                    <span class="text-sm font-medium text-gray-900">${formatDate(t.fechaIngreso)}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 font-bold">${formatDate(t.fechaVencimiento)}</td>
            <td class="px-4 py-3 text-sm font-bold text-gob-guinda">${t.expediente || 'S/N'}</td>
            <td class="px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate" title="${t.actor}">${t.actor || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title="${t.asunto}">${t.asunto || ''}</td> 
            <td class="px-4 py-3 text-sm text-gray-500">${t.prestacion || 'N/A'}</td> 
            <td class="px-4 py-3 text-sm text-gray-500">${t.abogado || 'Sin asignar'}</td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${badgeClass}">${t.estatus}</span>
                ${iconoObservacion}
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap relative">
                <div class="flex items-center justify-end gap-2">
                    ${botonEditar}
                    <button class="text-gray-400 hover:text-gob-guinda action-menu-toggle p-1 px-2 transition-colors" title="Más Acciones">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    
                     <div class="action-menu hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100 ring-1 ring-black ring-opacity-5">
                        ${generarAccionesRapidas(t, USER_ROLE)}
                    </div>
                    <input type="file" class="input-acuse-hidden hidden" data-id="${t.id}">
                </div>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html || '<tr><td colspan="9" class="text-center py-8 text-gray-500">No se encontraron resultados</td></tr>';
}

function setupSearchAndFilters() {
    const ids = ['search-terminos', 'filter-tribunal-termino', 'filter-estado-termino', 'filter-estatus-termino', 'filter-prioridad-termino', 'filter-materia-termino'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', loadTerminos);
    });
}

// ===============================================
// 4. ACCIONES Y MENÚ
// ===============================================
function generarAccionesRapidas(termino, rol) {
    let html = '';
    const etapa = termino.estatus;
    const rolesPermitidos = PERMISOS_ETAPAS[etapa] || [];
    const puedeActuar = rolesPermitidos.includes(rol);
    
    // Debug para verificar permisos
    // console.log(`Generando acciones para ${etapa}. Rol: ${rol}. Permitidos: ${rolesPermitidos}. Puede: ${puedeActuar}`);

    const itemClass = "w-full text-left px-4 py-3 text-sm text-gob-gris hover:bg-gray-50 hover:text-gob-guinda transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0";

    html += `<button class="${itemClass} action-view-expediente"><i class="fas fa-briefcase text-gray-400"></i> Ver Expediente</button>`;
    
    if (etapa === 'Concluido') {
        if (termino.acuseDocumento) {
            html += `<button class="${itemClass} action-download-acuse text-blue-600"><i class="fas fa-file-download"></i> Descargar Acuse</button>`;
        }
        if (rol === 'Direccion' || rol === 'Subdireccion') {
             html += `<div class="border-t border-gray-100 my-1"></div>`;
             html += `<button class="${itemClass} action-delete text-red-600 font-bold"><i class="fas fa-trash-alt"></i> Eliminar</button>`;
        }
        return html; 
    }

    if (etapa === 'Presentado') {
        html += `<div class="border-t border-gray-100 my-1"></div>`;
        html += `<button class="${itemClass} action-download-acuse text-blue-600"><i class="fas fa-file-download"></i> Descargar Acuse</button>`;
        
        if (puedeActuar) {
            html += `<button class="${itemClass} action-conclude text-green-600 font-bold"><i class="fas fa-flag-checkered"></i> <strong>Concluir</strong></button>`;
        }
        html += `<button class="${itemClass} action-remove-acuse text-red-500"><i class="fas fa-times-circle"></i> Quitar Acuse</button>`;
        return html;
    }

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

    if (rol === 'Gerente' || rol === 'Direccion' || rol === 'Subdireccion') {
        html += `<div class="border-t border-gray-100 my-1"></div>`;
        if (rol === 'Direccion' || rol === 'Subdireccion') {
            html += `<button class="${itemClass} action-delete text-red-600 font-bold hover:bg-red-50"><i class="fas fa-trash-alt"></i> Eliminar</button>`;
        }
    }
    return html;
}

function setupActionMenuListener() {
    const tbody = document.getElementById('terminos-body');
    if(!tbody) return;

    // Clonar para limpiar eventos previos
    const newTbody = tbody.cloneNode(true);
    tbody.parentNode.replaceChild(newTbody, tbody);
    
    // Recargar eventos sobre el nuevo elemento
    loadTerminos(); 
    
    document.getElementById('terminos-body').addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;
        const row = target.closest('tr');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const termino = TERMINOS.find(t => String(t.id) === String(id));

        // MENU TOGGLE
        if (target.classList.contains('action-menu-toggle')) {
            e.preventDefault(); e.stopPropagation();
            const menu = target.nextElementSibling; 
            document.querySelectorAll('.action-menu').forEach(m => { if(m !== menu) { m.classList.add('hidden'); m.style.cssText = ''; } });
            if (!menu) return;
            if (!menu.classList.contains('hidden')) { menu.classList.add('hidden'); menu.style.cssText = ''; return; }
            menu.classList.remove('hidden');
            
            // Posicionamiento
            const rect = target.getBoundingClientRect(); 
            const menuWidth = 224; 
            const menuHeight = menu.offsetHeight || 220; 
            const spaceBelow = window.innerHeight - rect.bottom;
            menu.style.position = 'fixed'; menu.style.zIndex = '99999'; menu.style.width = menuWidth + 'px'; menu.style.left = (rect.right - menuWidth) + 'px';
            if (spaceBelow < menuHeight) { menu.style.top = 'auto'; menu.style.bottom = (window.innerHeight - rect.top + 5) + 'px'; menu.classList.remove('border-t-4'); menu.classList.add('border-b-4'); } else { menu.style.bottom = 'auto'; menu.style.top = (rect.bottom + 5) + 'px'; menu.classList.add('border-t-4'); menu.classList.remove('border-b-4'); }
            return;
        }

        // ACCIONES
        if (target.classList.contains('action-edit')) openTerminoModalJS(termino);
        else if (target.classList.contains('action-view-expediente')) {
            if (termino.asuntoId) {
                window.location.href = `../expediente-module/expediente-detalle.html?id=${termino.asuntoId}`;
            } else {
                mostrarMensajeGlobal("Este término no está vinculado a un expediente digital.", "warning");
            }
        }
        else if (target.classList.contains('action-advance')) avanzarEtapa(id);
        else if (target.classList.contains('action-reject')) regresarEtapa(id);
        else if (target.classList.contains('action-upload-acuse')) row.querySelector('.input-acuse-hidden').click();
        else if (target.classList.contains('action-download-acuse')) mostrarAlertaTermino(`Descargando documento: ${termino.acuseDocumento}`);
        else if (target.classList.contains('action-remove-acuse')) {
            mostrarConfirmacion('Quitar Acuse', '¿Deseas quitar el acuse actual? \n\nEl término regresará al estado "Liberado".', () => { 
                termino.acuseDocumento = ''; 
                termino.estatus = 'Liberado'; 
                
                // Cuando se quita el acuse, mover a Agenda General
                sincronizarConAgendaGeneral(termino);
                
                guardarYRecargar(); 
                mostrarMensajeGlobal('Acuse eliminado. Estado regresado a Liberado y movido a Agenda General.', 'warning'); 
            });
        }
        else if (target.classList.contains('action-conclude')) abrirModalPresentar(id, 'Concluir Término', 'Se marcará como finalizado.');
        else if (target.classList.contains('action-delete')) {
            mostrarConfirmacion('Eliminar Término', '¿Eliminar término permanentemente?', () => { 
                TERMINOS = TERMINOS.filter(t => String(t.id) !== String(id)); 
                guardarYRecargar(); 
                mostrarMensajeGlobal('Término eliminado.', 'success'); 
            });
        }
        
        document.querySelectorAll('.action-menu').forEach(m => m.classList.add('hidden'));
    });
    
    document.addEventListener('click', e => { if (!e.target.closest('.action-menu-toggle') && !e.target.closest('.action-menu')) { document.querySelectorAll('.action-menu').forEach(m => { m.classList.add('hidden'); m.style.cssText = ''; }); } });
    window.addEventListener('scroll', () => { document.querySelectorAll('.action-menu:not(.hidden)').forEach(m => { m.classList.add('hidden'); m.style.cssText = ''; }); }, true);
    
    // Listener archivo
    document.getElementById('terminos-body').addEventListener('change', function(e) {
        if (e.target.classList.contains('input-acuse-hidden') && e.target.files.length > 0) {
            const id = e.target.getAttribute('data-id');
            const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
            if(idx !== -1) {
                TERMINOS[idx].acuseDocumento = e.target.files[0].name;
                if(TERMINOS[idx].estatus === 'Liberado') {
                    TERMINOS[idx].estatus = 'Presentado';
                    
                    // Si se sube acuse a un término liberado, sincronizar primero
                    sincronizarConAgendaGeneral(TERMINOS[idx]);
                }
                guardarYRecargar();
                mostrarMensajeGlobal('Acuse subido', 'success');
            }
        }
    });
}

// ===============================================
// 5. SINCRONIZACIÓN CON AGENDA GENERAL
// ===============================================
function sincronizarConAgendaGeneral(termino) {
    // Solo sincronizar cuando el término está en estado "Liberado"
    if (termino.estatus !== 'Liberado') return;
    
    // Obtener términos presentados actuales
    let terminosPresentados = JSON.parse(localStorage.getItem('terminosPresentados')) || [];
    
    // Verificar si ya existe (para evitar duplicados)
    const existe = terminosPresentados.some(t => 
        t.id === termino.id || 
        (t.terminoIdOriginal && t.terminoIdOriginal === termino.id)
    );
    
    if (!existe) {
        // Crear objeto para Agenda General
        const terminoAgenda = {
            id: Date.now(), // ID único para Agenda General
            fechaIngreso: termino.fechaIngreso || new Date().toISOString().split('T')[0],
            fechaVencimiento: termino.fechaVencimiento || '',
            fechaPresentacion: new Date().toISOString().split('T')[0], // Fecha de presentación (hoy)
            expediente: termino.expediente || 'S/N',
            actuacion: termino.asunto || termino.actuacion || '',
            partes: termino.actor || '',
            abogado: termino.abogado || 'Sin asignar',
            acuseDocumento: termino.acuseDocumento || '',
            etapaRevision: termino.estatus,
            estatus: termino.estatus,
            observaciones: termino.observaciones || 'Término liberado para presentación',
            fechaCreacion: new Date().toISOString(),
            terminoIdOriginal: termino.id // Referencia al término original
        };
        
        // Agregar a la lista
        terminosPresentados.unshift(terminoAgenda);
        
        // Guardar en localStorage
        localStorage.setItem('terminosPresentados', JSON.stringify(terminosPresentados));
        
        console.log('✅ Término sincronizado con Agenda General:', terminoAgenda);
        
        // **ELIMINAR EL TÉRMINO DE LA TABLA PRINCIPAL**
        eliminarTerminoDeTablaPrincipal(termino.id);
        
        // Mostrar notificación
        mostrarMensajeGlobal(`Término liberado y movido a Agenda General`, 'success');
    }
}

// ===============================================
// 6. ELIMINAR TÉRMINO DE TABLA PRINCIPAL
// ===============================================
function eliminarTerminoDeTablaPrincipal(id) {
    // Eliminar de la variable TERMINOS
    const indice = TERMINOS.findIndex(t => String(t.id) === String(id));
    if (indice !== -1) {
        // Guardar una copia en histórico si es necesario (opcional)
        const terminoEliminado = TERMINOS[indice];
        
        // Eliminar del array
        TERMINOS.splice(indice, 1);
        
        // Actualizar localStorage
        localStorage.setItem('terminos', JSON.stringify(TERMINOS));
        
        console.log(`🗑️ Término ${id} eliminado de la tabla principal`);
        
        // Opcional: Guardar en histórico
        guardarEnHistoricoTerminos(terminoEliminado);
        
        return true;
    }
    return false;
}

function guardarEnHistoricoTerminos(termino) {
    // Opcional: Guardar en un histórico de términos movidos
    try {
        const historico = JSON.parse(localStorage.getItem('historicoTerminos')) || [];
        historico.push({
            ...termino,
            fechaMovimiento: new Date().toISOString(),
            motivo: 'Movido a Agenda General'
        });
        localStorage.setItem('historicoTerminos', JSON.stringify(historico));
        console.log(`📋 Término ${termino.id} guardado en histórico`);
    } catch (e) {
        console.error('Error guardando en histórico:', e);
    }
}

// ===============================================
// 7. LÓGICA DE NEGOCIO (AVANZAR/RETROCEDER/GUARDAR)
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
            
            // SINCRONIZAR Y ELIMINAR SI SE LIBERA
            if (config.siguiente === 'Liberado') {
                sincronizarConAgendaGeneral(TERMINOS[idx]);
                // El término ya se elimina dentro de sincronizarConAgendaGeneral
            }
            
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
// 8. MODALES (MANUALES) - ROBUSTO
// ===============================================
function initModalTerminosJS() {
   const modal = document.getElementById('modal-termino');
   const btnSave = document.getElementById('save-termino');
   
   if (!modal) return console.error("Error Crítico: No se encontró el modal #modal-termino");

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
    if (!modal) return alert("Error: El modal no se cargó correctamente.");

    const form = document.getElementById('form-termino');
    const title = document.getElementById('modal-termino-title');
    
    if(form) form.reset();
    
    // Reset inputs de recordatorio manual (opcional)
    document.getElementById('dias-antes-recordatorio').value = "3";
    document.getElementById('horas-antes-recordatorio').value = "0";
    document.getElementById('nota-recordatorio').value = "";

    cargarAsuntosEnSelectorJS();
    
    if (termino) {
        title.textContent = 'Editar Datos del Término';
        document.getElementById('termino-id').value = termino.id;
        
        const selAsunto = document.getElementById('asunto-selector');
        if(selAsunto) selAsunto.value = termino.asuntoId || '';
        
        if(document.getElementById('fecha-ingreso')) document.getElementById('fecha-ingreso').value = termino.fechaIngreso || '';
        if(document.getElementById('fecha-vencimiento')) document.getElementById('fecha-vencimiento').value = termino.fechaVencimiento || '';
        if(document.getElementById('actuacion')) document.getElementById('actuacion').value = termino.asunto || '';
        
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
        asuntoId: document.getElementById('asunto-selector')?.value,
        fechaIngreso: document.getElementById('fecha-ingreso')?.value,
        fechaVencimiento: document.getElementById('fecha-vencimiento')?.value,
        asunto: document.getElementById('actuacion')?.value,
    };

    if(!data.asuntoId || !data.fechaVencimiento) return mostrarMensajeGlobal('Faltan campos obligatorios', 'danger');

    // === LÓGICA DE RECORDATORIO (SIEMPRE ACTIVA) ===
    // Se ejecuta siempre porque el contenedor de recordatorios siempre está visible (sin checkbox)
    const fechaBaseStr = document.getElementById('fecha-vencimiento').value;
    // Asumimos 9:00 AM del día de vencimiento para el cálculo base
    const fechaBase = new Date(fechaBaseStr + 'T09:00:00');

    const diasAntes = parseInt(document.getElementById('dias-antes-recordatorio').value) || 0;
    const horasAntes = parseInt(document.getElementById('horas-antes-recordatorio').value) || 0;
    const notaRec = document.getElementById('nota-recordatorio').value;

    // Calcular fecha notificación
    const fechaNotificacion = new Date(fechaBase);
    fechaNotificacion.setDate(fechaBase.getDate() - diasAntes);
    fechaNotificacion.setHours(fechaBase.getHours() - horasAntes);

    // Texto anticipación
    let textoAnticipacion = "";
    if (diasAntes > 0) textoAnticipacion = `${diasAntes} días`;
    if (horasAntes > 0) textoAnticipacion += (textoAnticipacion ? " y " : "") + `${horasAntes} horas`;
    if (!textoAnticipacion) textoAnticipacion = "el momento";

    const recordatorios = JSON.parse(localStorage.getItem('recordatorios')) || [];
    const nuevoRecordatorio = {
        id: Date.now() + 1,
        titulo: `Vencimiento: ${data.asunto}`,
        meta: {
            tipoOrigen: 'termino',
            expediente: document.getElementById('termino-expediente')?.value,
            anticipacion: textoAnticipacion,
            fechaEvento: fechaBase.toISOString()
        },
        detalles: notaRec || `Recordatorio asociado al término del expediente ${document.getElementById('termino-expediente')?.value}`,
        fecha: fechaNotificacion.toISOString().split('T')[0],
        hora: fechaNotificacion.toTimeString().substring(0,5),
        prioridad: 'urgent',
        completado: false
    };
    
    recordatorios.unshift(nuevoRecordatorio);
    localStorage.setItem('recordatorios', JSON.stringify(recordatorios));
    // =======================================================

    if(id) {
        const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
        if(idx !== -1) TERMINOS[idx] = { ...TERMINOS[idx], ...data };
    } else {
        TERMINOS.push({
            id: Date.now(),
            estatus: 'Proyectista',
            ...data,
            acuseDocumento: '',
            expediente: document.getElementById('termino-expediente')?.value || '',
            actor: document.getElementById('termino-partes')?.value || '',
            abogado: document.getElementById('termino-abogado')?.value || '',
            prioridad: 'Media'
        });
    }
    
    guardarYRecargar();
    
    const modal = document.getElementById('modal-termino');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    
    mostrarMensajeGlobal('Término guardado correctamente', 'success');
}

// Helpers...
function initModalReasignar() {
    const modal = document.getElementById('modal-reasignar');
    if (!modal) return;
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
    if (!modal) return;
    
    const btnConfirm = document.getElementById('confirmar-presentar');
    
    // Configurar botones de cerrar
    document.querySelectorAll('#close-modal-presentar, #cancel-presentar').forEach(btn => {
        if(btn) btn.onclick = () => { 
            modal.classList.remove('flex'); 
            modal.classList.add('hidden'); 
        };
    });

    // Configurar botón Confirmar
    if(btnConfirm) {
        // Clonar para limpiar eventos previos
        const newBtn = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);
        
        newBtn.onclick = () => {
            const id = document.getElementById('presentar-termino-id').value;
            const observaciones = document.getElementById('observaciones-cambio-estatus')?.value.trim();
            
            const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
            
            if(idx !== -1) {
                let nuevoEstatus = '';
                // Lógica para determinar el siguiente estado
                if (TERMINOS[idx].estatus === 'Presentado') {
                    nuevoEstatus = 'Concluido';
                } else if (TERMINOS[idx].estatus === 'Dirección') {
                    nuevoEstatus = 'Liberado';
                } else {
                    const siguiente = FLUJO_ETAPAS[TERMINOS[idx].estatus]?.siguiente;
                    if(siguiente) nuevoEstatus = siguiente;
                }
                
                if(nuevoEstatus) {
                    TERMINOS[idx].estatus = nuevoEstatus;
                    
                    // Guardar observación si existe
                    if(observaciones) {
                        TERMINOS[idx].observaciones = observaciones;
                    }
                    
                    // SINCRONIZAR Y ELIMINAR SI SE LIBERA
                    if (nuevoEstatus === 'Liberado') {
                        sincronizarConAgendaGeneral(TERMINOS[idx]);
                        // El término ya se elimina dentro de sincronizarConAgendaGeneral
                    }
                    
                    guardarYRecargar();
                    mostrarMensajeGlobal(`Término actualizado a: ${nuevoEstatus}`, 'success');
                }
                
                modal.classList.remove('flex'); 
                modal.classList.add('hidden');
            }
        };
    }
}

function abrirModalPresentar(id, titulo, mensaje) {
    const modal = document.getElementById('modal-presentar-termino');
    if(!modal) return;

    document.getElementById('presentar-termino-id').value = id;
    
    const tituloEl = document.getElementById('modal-presentar-titulo');
    const mensajeEl = document.getElementById('modal-presentar-mensaje');
    
    if(tituloEl) tituloEl.textContent = titulo;
    if(mensajeEl) mensajeEl.textContent = mensaje;

    // Limpiar textarea si existe
    const txtArea = document.getElementById('observaciones-cambio-estatus');
    if(txtArea) {
        txtArea.value = ''; 
        setTimeout(() => txtArea.focus(), 100); 
    }

    modal.classList.remove('hidden'); 
    modal.classList.add('flex');
}

// ===============================================
// 9. HELPERS Y UTILIDADES
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

function mostrarAlertaTermino(mensaje) {
    const modal = document.getElementById('modal-alerta-termino');
    if(!modal) return;
    document.getElementById('alerta-mensaje-termino').textContent = mensaje;
    document.getElementById('btn-alerta-accept-termino').onclick = () => { modal.classList.remove('flex'); modal.classList.add('hidden'); };
    modal.classList.remove('hidden'); modal.classList.add('flex');
}

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
    
    const expedientesData = JSON.parse(localStorage.getItem('expedientesData')) || [];
    
    // Diccionario de Gerencias 
    const NOMBRES_GERENCIAS = {
        1: 'Civil, Mercantil, Fiscal y Administrativo',
        2: 'Laboral y Penal',
        3: 'Transparencia y Amparo'
    };
    
    // 3. Llenamos el dropdown
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    expedientesData.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.text = `${e.numero} - ${e.descripcion ? e.descripcion.substring(0,30)+'...' : ''}`;
        sel.appendChild(opt);
    });
    
    // 4. Función segura para limpiar campos
    const limpiarCampos = () => {
        const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
        
        setVal('termino-expediente', '');
        setVal('termino-materia', '');
        setVal('termino-gerencia', '');
        setVal('termino-abogado', '');
        setVal('termino-partes', '');
        
        // Limpiamos ambos IDs de órgano (el oculto y el visual si aplicaste el fix anterior)
        setVal('termino-organo', ''); 
        setVal('termino-organo-visual', ''); 
    };

    // 5. Lógica de cambio (On Change) robusta
    sel.onchange = () => {
        const selectedId = sel.value;
        // Convertimos a string para comparar, por seguridad
        const e = expedientesData.find(x => String(x.id) === selectedId);
        
        if(e) {
            const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };

            setVal('termino-expediente', e.numero);
            setVal('termino-materia', e.materia || 'S/D');
            setVal('termino-abogado', e.abogado || 'S/D');
            setVal('termino-partes', e.partes || 'Actor vs Demandado');
            
            // Lógica robusta de Gerencia (Si no hay nombre, usa el ID para buscarlo)
            let nombreGerencia = e.gerencia;
            if (!nombreGerencia && e.gerenciaId) {
                nombreGerencia = NOMBRES_GERENCIAS[e.gerenciaId];
            }
            setVal('termino-gerencia', nombreGerencia || 'Sin Gerencia');

            // Lógica robusta de Órgano (Compatible con fix visual y campo oculto)
            const organoDato = e.organo || e.organoJurisdiccional || 'Por asignar';
            setVal('termino-organo', organoDato);          // Campo oculto original
            setVal('termino-organo-visual', organoDato);   // Campo visual nuevo
            
        } else {
            limpiarCampos();
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
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const abogados = usuarios.filter(u => u.rol === 'ABOGADO' && u.activo);
    
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    abogados.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.text = a.nombre;
        sel.appendChild(opt);
    });
}

function formatDate(date) { return date; }

function exportarTablaExcel() {
    const table = document.querySelector('table');
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb, 'Terminos.xlsx');
}

// ===============================================
// 10. FUNCIÓN ADICIONAL PARA SINCRONIZACIÓN MANUAL
// ===============================================
function sincronizarTodosLiberados() {
    const terminosLiberados = TERMINOS.filter(t => t.estatus === 'Liberado');
    let sincronizados = 0;
    
    terminosLiberados.forEach(termino => {
        sincronizarConAgendaGeneral(termino);
        sincronizados++;
    });
    
    if (sincronizados > 0) {
        mostrarMensajeGlobal(`${sincronizados} términos liberados movidos a Agenda General`, 'success');
    } else {
        mostrarMensajeGlobal('No hay términos en estado "Liberado" para mover', 'info');
    }
}