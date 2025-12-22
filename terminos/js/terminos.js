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
            TERMINOS = [];
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

    const filtros = {
        tribunal: document.getElementById('filter-tribunal-termino')?.value.toLowerCase() || '',
        estado: document.getElementById('filter-estado-termino')?.value.toLowerCase() || '',
        estatus: document.getElementById('filter-estatus-termino')?.value || '',
        prioridad: document.getElementById('filter-prioridad-termino')?.value || '',
        materia: document.getElementById('filter-materia-termino')?.value || '',
        search: document.getElementById('search-terminos')?.value.toLowerCase() || ''
    };

    const listaFiltrada = TERMINOS.filter(t => {
        const textoCompleto = `${t.expediente || ''} ${t.actor || ''} ${t.asunto || ''} ${t.abogado || ''}`.toLowerCase();
        
        // ** CLAVE: Ocultar si ya está Concluido **
        if (t.estatus === 'Concluido') return false; 
        
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
            ? `<i class="fas fa-comment-alt text-blue-500 ml-2 cursor-pointer" title="Observación Final: ${t.observaciones}"></i>` 
            : '';   

        const prioridad = t.prioridad || 'Media';
        let dotColor = '';
        let textColor = '';
        let borderColor = '';

        switch(prioridad) {
            case 'Alta': 
                dotColor = 'bg-red-500'; 
                textColor = 'text-red-600'; 
                borderColor = 'border-red-200';
                break;
            case 'Baja': 
                dotColor = 'bg-gray-400'; 
                textColor = 'text-gray-500'; 
                borderColor = 'border-gray-200';
                break;
            default: // Media
                dotColor = 'bg-orange-400'; 
                textColor = 'text-orange-600'; 
                borderColor = 'border-orange-200';
        }

   
        html += `
        <tr class="bg-white hover:bg-gray-50 border-b transition-colors group" data-id="${t.id}">
            <td class="px-4 py-3 whitespace-nowrap text-center">
                <div class="flex items-center">
                    <div class="w-2.5 h-2.5 rounded-full mr-2 ${semaforoColor}" title="${tooltipTexto}"></div>
                    <span class="text-sm font-medium text-gray-900">${formatDate(t.fechaIngreso)}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 font-bold">${formatDate(t.fechaVencimiento)}</td>

            <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex flex-col">
                    <span class="text-sm font-bold text-gob-guinda leading-none">${t.expediente || 'S/N'}</span>
                    <div class="flex items-center gap-1.5 mt-1">
                        <span class="w-1.5 h-1.5 rounded-full ${dotColor}"></span>
                        <span class="text-[9px] font-bold uppercase tracking-tight ${textColor}">${prioridad}</span>
                    </div>
                </div>
            </td>

            <td class="px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate" title="${t.actor}">
                <div class="flex flex-col">
                    <span class="font-medium truncate">${t.actor || 'Sin Actor'}</span>
                    <span class="text-[9px] text-gray-400 italic mt-0.5 leading-none">
                        <i class="fas fa-university scale-75 mr-0.5"></i>${t.organo || 'No asignado'}
                    </span>
                </div>
            </td>

            <td class="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title="${t.asunto}">${t.asunto || ''}</td> 
            <td class="px-4 py-3 text-sm text-gray-500">${t.abogado || 'Sin asignar'}</td>
            
            <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${badgeClass}">${t.estatus}</span>    
            </td>           
            <td class="px-4 py-3 text-right whitespace-nowrap relative">
                <div class="flex items-center justify-end gap-2">
                    ${botonEditar}
                    <button class="text-gray-400 hover:text-gob-guinda action-menu-toggle p-1 px-2 transition-colors">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="action-menu hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100 shadow-xl">
                        ${generarAccionesRapidas(t, USER_ROLE)}
                        <input type="file" class="input-acuse-hidden hidden" data-id="${t.id}" accept=".pdf,.jpg,.jpeg,.png">
                    </div>
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
    let html = '<div class="py-1">';
    const etapa = termino.estatus;
    const tieneDocumento = !!termino.archivoWord;
    const rolesPermitidos = PERMISOS_ETAPAS[etapa] || [];
    const puedeActuar = rolesPermitidos.includes(rol);

    // 1. NAVEGACIÓN (Siempre visible)
    html += crearBoton('action-view-expediente', 'fas fa-folder-open', 'Ir al Expediente', 'text-gray-700');
    html += crearSeparador();

    // 2. ACCIONES DE DOCUMENTO (BORRADOR WORD)
    // Se muestra en etapas previas a la liberación final
    if (etapa !== 'Concluido' && etapa !== 'Presentado' && etapa !== 'Liberado') {
        if (tieneDocumento) {
            html += crearBoton('action-download-word', 'fas fa-file-word', 'Descargar Borrador', 'text-blue-600');
            html += crearBoton('action-upload-word', 'fas fa-sync-alt', 'Subir Nueva Versión', 'text-gob-oro');
        } else {
            html += crearBoton('action-upload-word', 'fas fa-cloud-upload-alt', 'Subir Borrador Word', 'text-gob-oro font-bold');
        }
    }


    // 4. GESTIÓN DE FLUJO (AVANCE DE ETAPAS)
    if (puedeActuar) {
        const config = FLUJO_ETAPAS[etapa];
        
        if (config) {
            html += crearSeparador("Flujo");
            
            if (etapa === 'Liberado') {
                // REINSTALADO: Botón para subir el acuse y pasar a 'Presentado'
                html += crearBoton('action-upload-acuse', 'fas fa-file-import', 'Subir Acuse Final', 'text-blue-600 font-bold');
            } else if (etapa === 'Presentado') {
                // Botón final para mover a Agenda General
                html += crearBoton('action-conclude', 'fas fa-flag-checkered', 'Concluir Término', 'text-green-600 font-bold');
                 html += crearBoton('action-remove-acuse', 'fas fa-undo', 'Quitar Acuse / Corregir', 'text-red-500');
            } else {
                // Botones de avance para Proyectista, Revisión, Gerencia y Dirección
                const colorBoton = tieneDocumento ? 'text-green-600' : 'text-gray-300 cursor-not-allowed';
                const labelAvance = config.label || 'Avanzar Etapa';
                html += crearBoton('action-advance', 'fas fa-arrow-right', labelAvance, colorBoton);
            }
        }
    }

    // 5. ADMINISTRACIÓN (SOLO DIRECCIÓN)
    if (rol === 'Direccion') {
        html += crearSeparador("Admin");
        html += crearBoton('action-delete', 'fas fa-trash-alt', 'Eliminar Término', 'text-red-600 hover:bg-red-50 font-bold');
    }

    return html + '</div>';
}

function crearBoton(claseAccion, icono, texto, color = "text-gray-700", extra = "") {
    return `
    <button class="${claseAccion} w-full text-left px-4 py-2 text-sm ${color} hover:bg-gray-50 hover:text-gob-guinda transition-all flex items-center gap-3 group ${extra}">
        <div class="w-6 flex justify-center items-center text-opacity-70 group-hover:text-opacity-100 transition-opacity">
            <i class="${icono}"></i>
        </div>
        <span class="font-medium">${texto}</span>
    </button>`;
}

function crearSeparador(titulo = "") {
    return `<div class="my-1 border-t border-gray-100">
                ${titulo ? `<p class="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">${titulo}</p>` : ''}
            </div>`;
}

function setupActionMenuListener() {
    const tbody = document.getElementById('terminos-body');
    if(!tbody) return;

    const newTbody = tbody.cloneNode(true);
    tbody.parentNode.replaceChild(newTbody, tbody);
    
    loadTerminos(); 
    
    document.getElementById('terminos-body').addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;
        const row = target.closest('tr');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const termino = TERMINOS.find(t => String(t.id) === String(id));

        if (target.classList.contains('action-menu-toggle')) {
            e.preventDefault(); e.stopPropagation();
            const menu = target.nextElementSibling; 
            document.querySelectorAll('.action-menu').forEach(m => { if(m !== menu) { m.classList.add('hidden'); m.style.cssText = ''; } });
            if (!menu) return;
            if (!menu.classList.contains('hidden')) { menu.classList.add('hidden'); menu.style.cssText = ''; return; }
            menu.classList.remove('hidden');
            
            const rect = target.getBoundingClientRect(); 
            const menuWidth = 224; 
            const menuHeight = menu.offsetHeight || 220; 
            const spaceBelow = window.innerHeight - rect.bottom;
            menu.style.position = 'fixed'; menu.style.zIndex = '99999'; menu.style.width = menuWidth + 'px'; menu.style.left = (rect.right - menuWidth) + 'px';
            if (spaceBelow < menuHeight) { menu.style.top = 'auto'; menu.style.bottom = (window.innerHeight - rect.top + 5) + 'px'; menu.classList.remove('border-t-4'); menu.classList.add('border-b-4'); } else { menu.style.bottom = 'auto'; menu.style.top = (rect.bottom + 5) + 'px'; menu.classList.add('border-t-4'); menu.classList.remove('border-b-4'); }
            return;
        }

        if (target.classList.contains('action-edit')) openTerminoModalJS(termino);
        else if (target.classList.contains('action-view-expediente')) {
            if (termino.asuntoId) {
                window.location.href = `../expediente-module/expediente-detalle.html?id=${termino.asuntoId}`;
            } else {
                mostrarMensajeGlobal("Este término no está vinculado a un expediente digital.", "warning");
            }
        }
        else if (target.classList.contains('action-upload-word')) {
        // Usamos un input file global
        const fileInput = document.getElementById('input-word-termino');
        fileInput.onchange = (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const tIdx = TERMINOS.findIndex(t => String(t.id) === String(id));
                TERMINOS[tIdx].archivoWord = file.name; // Guardamos el nombre
                
                registrarActividadExpediente(
                    TERMINOS[tIdx].asuntoId,
                    'Borrador Actualizado',
                    `Se cargó el archivo: ${file.name} en etapa ${TERMINOS[tIdx].estatus}`,
                    'upload'
                );
                
                guardarYRecargar();
                mostrarMensajeGlobal("Archivo cargado correctamente", "success");
            }
        };
        fileInput.click();
        }
        else if (target.classList.contains('action-download-word')) {
            mostrarMensajeGlobal(`Descargando borrador: ${termino.archivoWord}`, "success");
            // Aquí iría la lógica real de descarga
        }
        else if (target.classList.contains('action-advance')) avanzarEtapa(id);
        else if (target.classList.contains('action-reject')) regresarEtapa(id);
        else if (target.classList.contains('action-upload-acuse')) row.querySelector('.input-acuse-hidden').click();
        else if (target.classList.contains('action-download-acuse')) mostrarAlertaTermino(`Descargando documento: ${termino.acuseDocumento}`);
        else if (target.classList.contains('action-preview-acuse')) mostrarAlertaTermino(`Previsualizando (Simulación): ${termino.acuseDocumento}`);
        
        else if (target.classList.contains('action-conclude')) abrirModalPresentar(id, 'Concluir Término', 'Se marcará como finalizado.');
        else if (target.classList.contains('action-remove-acuse')) {
            mostrarConfirmacion('Quitar Acuse', '¿Deseas quitar el acuse actual? \n\nEl término regresará al estado "Liberado".', () => { termino.acuseDocumento = ''; termino.estatus = 'Liberado'; guardarYRecargar(); mostrarMensajeGlobal('Acuse eliminado. Estado regresado a Liberado.', 'warning'); });
        }
        else if (target.classList.contains('action-delete')) {
            mostrarConfirmacion('Eliminar Término', '¿Eliminar término permanentemente?', () => { TERMINOS = TERMINOS.filter(t => String(t.id) !== String(id)); guardarYRecargar(); mostrarMensajeGlobal('Término eliminado.', 'success'); });
        }
        else if (target.classList.contains('action-remove-acuse')) {
            mostrarConfirmacion(
                'Quitar Acuse / Corregir', 
                '¿Deseas eliminar el acuse actual? \n\nEl término regresará al estado "Liberado" para que puedas subir el archivo correcto.', 
                () => {
                    const tIdx = TERMINOS.findIndex(t => String(t.id) === String(id));
                    if (tIdx !== -1) {
                        TERMINOS[tIdx].acuseDocumento = '';
                        TERMINOS[tIdx].estatus = 'Liberado'; 
                        registrarActividadExpediente(
                            TERMINOS[tIdx].asuntoId,
                            'Acuse Removido',
                            `Se quitó el acuse del término "${TERMINOS[tIdx].asunto}" para corrección.`,
                            'delete'
                        );  
                        guardarYRecargar();
                        mostrarMensajeGlobal('Acuse quitado. Estado regresado a Liberado.', 'warning');
                    }
                }
            );
        }
        
        document.querySelectorAll('.action-menu').forEach(m => m.classList.add('hidden'));
    
    });
    
    document.addEventListener('click', e => { if (!e.target.closest('.action-menu-toggle') && !e.target.closest('.action-menu')) { document.querySelectorAll('.action-menu').forEach(m => { m.classList.add('hidden'); m.style.cssText = ''; }); } });
    window.addEventListener('scroll', () => { document.querySelectorAll('.action-menu:not(.hidden)').forEach(m => { m.classList.add('hidden'); m.style.cssText = ''; }); }, true);
    
    document.getElementById('terminos-body').addEventListener('change', function(e) {
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
// 5. SINCRONIZACIÓN CON AGENDA GENERAL (Solo Concluido)
// ===============================================
function sincronizarConAgendaGeneral(termino) {
    if (termino.estatus !== 'Concluido') return;    
    
    let terminosPresentados = JSON.parse(localStorage.getItem('terminosPresentados')) || [];
    const existe = terminosPresentados.some(t => 
        t.id === termino.id || 
        (t.terminoIdOriginal && String(t.terminoIdOriginal) === String(termino.id))
    );
    
    if (!existe) {
        const terminoAgenda = {
            id: termino.id, // Usar el ID original para referencia
            fechaIngreso: termino.fechaIngreso || new Date().toISOString().split('T')[0],
            fechaVencimiento: termino.fechaVencimiento || '',
            fechaPresentacion: new Date().toISOString().split('T')[0], // Fecha de conclusión
            expediente: termino.expediente || 'S/N',
            actuacion: termino.asunto || termino.actuacion || '',
            partes: termino.actor || '',
            abogado: termino.abogado || 'Sin asignar',
            acuseDocumento: termino.acuseDocumento || '',
            estatus: termino.estatus, // 'Concluido'
            observaciones: termino.observaciones || 'Término concluido y finalizado',
            fechaCreacion: new Date().toISOString(),
            terminoIdOriginal: termino.id 
        };
        
        terminosPresentados.unshift(terminoAgenda);
        
        localStorage.setItem('terminosPresentados', JSON.stringify(terminosPresentados));
        
        console.log('✅ Término sincronizado con Agenda General:', terminoAgenda);
        
        // ** ELIMINAR EL TÉRMINO DE LA TABLA PRINCIPAL **
        eliminarTerminoDeTablaPrincipal(termino.id);
        
        mostrarMensajeGlobal(`Término concluido y movido a Agenda General`, 'success');
    }
}

function eliminarTerminoDeTablaPrincipal(id) {
    const indice = TERMINOS.findIndex(t => String(t.id) === String(id));
    if (indice !== -1) {
        
        TERMINOS.splice(indice, 1);
        
        guardarYRecargar(); 
        
        console.log(`🗑️ Término ${id} eliminado de la tabla principal`);
        return true;
    }
    return false;
}


// ===============================================
// 6. LÓGICA DE NEGOCIO (AVANZAR/RETROCEDER/GUARDAR)
// ===============================================
function avanzarEtapa(id) {
    const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
    if (idx === -1) return;
    const termino = TERMINOS[idx];
    const actual = termino.estatus;

    if (!termino.archivoWord && actual !== 'Liberado' && actual !== 'Presentado') {
        mostrarMensajeGlobal("No puede avanzar sin subir el borrador Word primero.", "danger");
        return;
    }

    const config = FLUJO_ETAPAS[actual];
    if(config && config.siguiente){
        
        const ejecutarAvance = (nuevoEstado) => {
            TERMINOS[idx].estatus = nuevoEstado; 
            
            // Generar Notificación de Cambio
            crearNotificacionGlobal({
                eventType: 'termino',
                title: TERMINOS[idx].asunto,
                expediente: TERMINOS[idx].expediente,
                status: nuevoEstado,
                detalles: { actuacion: `Cambio de fase: ${actual} → ${nuevoEstado}` },
                notifyAt: new Date().toISOString()
            });

            if (nuevoEstado === 'Liberado') {
                TERMINOS[idx].observaciones = ''; 
                registrarActividadExpediente(
                    TERMINOS[idx].asuntoId,
                    'Término Liberado',
                    `El término "${TERMINOS[idx].asunto}" ha sido liberado por Dirección.`,
                    'status'
                );
            }
            guardarYRecargar(); 
            mostrarMensajeGlobal(`Avanzado a ${nuevoEstado}`, 'success'); 
        };

        if (actual === 'Dirección') { 
            mostrarConfirmacion('Liberar Término', '¿Confirmar la liberación? Esto cambia el estado a "Liberado".', () => ejecutarAvance(config.siguiente));
            return;
        }
        if (actual === 'Presentado') {
             abrirModalPresentar(id, 'Concluir Término', 'Se marcará como finalizado.');
             return;
        }

        mostrarConfirmacion('Avanzar Etapa', `¿Avanzar de "${actual}" a "${config.siguiente}"?`, () => ejecutarAvance(config.siguiente));
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
// 7. MODALES (MANUALES) - ROBUSTO
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
    
    const inputDias = document.getElementById('dias-antes-recordatorio');
    if(inputDias) inputDias.value = "3";
    
    
    const inputNota = document.getElementById('nota-recordatorio');
    if(inputNota) inputNota.value = "";

    cargarAsuntosEnSelectorJS();
    
    if (termino) {
        title.textContent = 'Editar Datos del Término';
        document.getElementById('termino-id').value = termino.id;
        
        const selAsunto = document.getElementById('asunto-selector');
        if(selAsunto) selAsunto.value = termino.asuntoId || '';
        
        if(document.getElementById('fecha-ingreso')) document.getElementById('fecha-ingreso').value = termino.fechaIngreso || '';
        if(document.getElementById('fecha-vencimiento')) document.getElementById('fecha-vencimiento').value = termino.fechaVencimiento || '';
        if(document.getElementById('actuacion')) document.getElementById('actuacion').value = termino.asunto || '';
        if(document.getElementById('link-documento')) document.getElementById('link-documento').value = termino.linkDocumento || '';
        
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
    
    const prioridadReal = document.getElementById('termino-prioridad')?.value || 'Media';

    const data = {
        asuntoId: document.getElementById('asunto-selector')?.value,
        fechaIngreso: document.getElementById('fecha-ingreso')?.value,
        fechaVencimiento: document.getElementById('fecha-vencimiento')?.value,
        asunto: document.getElementById('actuacion')?.value,
        prioridad: prioridadReal, 
        organo: document.getElementById('termino-organo')?.value || 'No asignado'
    };

    if(!data.asuntoId || !data.fechaVencimiento) return mostrarMensajeGlobal('Faltan campos obligatorios', 'danger');

    // === LÓGICA DE RECORDATORIO ===
    const fechaBaseStr = document.getElementById('fecha-vencimiento').value;
    const fechaBase = new Date(fechaBaseStr + 'T09:00:00');
    const diasAntes = parseInt(document.getElementById('dias-antes-recordatorio').value) || 0;
    const notaRec = document.getElementById('nota-recordatorio').value;
    const fechaNotificacion = new Date(fechaBase);
    fechaNotificacion.setDate(fechaBase.getDate() - diasAntes);

    let textoAnticipacion = diasAntes > 0 ? `${diasAntes} días` : "el mismo día";

    // Notificación de Recordatorio
    crearNotificacionGlobal({
        eventType: 'recordatorio',
        title: `Recordatorio: ${data.asunto}`,
        expediente: document.getElementById('termino-expediente')?.value || 'S/N',
        status: 'Activo',
        notifyAt: fechaNotificacion.toISOString(),
        detalles: { descripcion: notaRec || 'Recordatorio automático de término' },
        meta: {
            tipoOrigen: 'termino',
            expediente: document.getElementById('termino-expediente')?.value,
            anticipacion: textoAnticipacion,
            fechaEvento: fechaBase.toISOString()
        }
    });

    if(id) {
        const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
        if(idx !== -1) TERMINOS[idx] = { ...TERMINOS[idx], ...data };
    } else {
        // NUEVO TÉRMINO
        TERMINOS.push({
            id: Date.now(),
            estatus: 'Proyectista',
            ...data,
            acuseDocumento: '',
            archivoWord: '', 
            expediente: document.getElementById('termino-expediente')?.value || '',
            actor: document.getElementById('termino-partes')?.value || '',
            abogado: document.getElementById('termino-abogado')?.value || '',
        });

        crearNotificacionGlobal({
            eventType: 'termino',
            title: data.asunto,
            expediente: document.getElementById('termino-expediente')?.value || '',
            status: 'Proyectista',
            detalles: { actuacion: 'Nuevo término asignado' },
            notifyAt: new Date().toISOString()
        });

        registrarActividadExpediente(
            data.asuntoId, 
            'Nuevo Término Asignado', 
            `Se agregó el término: "${data.asunto}" con vencimiento al ${data.fechaVencimiento}.`, 
            'edit'
        );
    }
    
    guardarYRecargar();
    const modal = document.getElementById('modal-termino');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
    mostrarMensajeGlobal('Término guardado correctamente', 'success');
}

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
    
    document.querySelectorAll('#close-modal-presentar, #cancel-presentar').forEach(btn => {
        if(btn) btn.onclick = () => { 
            modal.classList.remove('flex'); 
            modal.classList.add('hidden'); 
        };
    });

    if(btnConfirm) {
        const newBtn = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);
        
        newBtn.onclick = () => {
            const id = document.getElementById('presentar-termino-id').value;
            const observaciones = document.getElementById('observaciones-cambio-estatus')?.value.trim();
            
            const idx = TERMINOS.findIndex(t => String(t.id) === String(id));
            
            if(idx !== -1) {
                let nuevoEstatus = '';
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
                    
                    if(observaciones) {
                        TERMINOS[idx].observaciones = observaciones;
                    }
                    
                    // --- PUNTO DE SINCRONIZACIÓN ---
                    if (nuevoEstatus === 'Concluido') {
                        registrarActividadExpediente(
                            TERMINOS[idx].asuntoId,
                            'Término Concluido',
                            `El término "${TERMINOS[idx].asunto}" ha sido presentado y finalizado.`,
                            'status'
                        );
                        
                        guardarYRecargar(); 
                        
                        sincronizarConAgendaGeneral(TERMINOS[idx]);
                        
                    } else {
                        guardarYRecargar();
                    }
                    // -------------------------------
                    
                    mostrarMensajeGlobal(`Término actualizado a: ${nuevoEstatus}`, 'success');
                    
                    modal.classList.remove('flex'); 
                    modal.classList.add('hidden');
                }
             
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

    const txtArea = document.getElementById('observaciones-cambio-estatus');
    if(txtArea) {
        txtArea.value = ''; 
        setTimeout(() => txtArea.focus(), 100); 
    }

    modal.classList.remove('hidden'); 
    modal.classList.add('flex');
}

// ===============================================
// 8. HELPERS Y UTILIDADES
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
    if (dias < 3) return 'bg-red-700';      
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
    
    const NOMBRES_GERENCIAS = {
        1: 'Civil, Mercantil, Fiscal y Administrativo',
        2: 'Laboral y Penal',
        3: 'Transparencia y Amparo'
    };
    
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    expedientesData.forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.text = `${e.numero} - ${e.descripcion ? e.descripcion.substring(0,30)+'...' : ''}`;
        sel.appendChild(opt);
    });
    
    const limpiarCampos = () => {
        const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
        
        setVal('termino-expediente', '');
        setVal('termino-materia', '');
        setVal('termino-gerencia', '');
        setVal('termino-abogado', '');
        setVal('termino-partes', '');
        setVal('termino-prioridad', '');
        const organoDato = e.organo || e.organoJurisdiccional || 'Por asignar';
        setVal('termino-organo', organoDato);          
        setVal('termino-organo-visual', organoDato);
    };

    sel.onchange = () => {
        const selectedId = sel.value;
        const e = expedientesData.find(x => String(x.id) === selectedId);
        
        if(e) {
            const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };

            setVal('termino-expediente', e.numero);
            setVal('termino-materia', e.materia || 'S/D');
            setVal('termino-abogado', e.abogado || 'S/D');
            setVal('termino-partes', e.partes || 'Actor vs Demandado');
            setVal('termino-prioridad', e.prioridad || 'Media');            
            let nombreGerencia = e.gerencia;
            if (!nombreGerencia && e.gerenciaId) {
                nombreGerencia = NOMBRES_GERENCIAS[e.gerenciaId];
            }
            setVal('termino-gerencia', nombreGerencia || 'Sin Gerencia');

            const organoDato = e.organo || e.organoJurisdiccional || 'Por asignar';
            setVal('termino-organo', organoDato);          
            setVal('termino-organo-visual', organoDato);   
            
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
        console.log(`Actividad registrada en expediente ${asuntoId}: ${titulo}`);
    }
}

// ===============================================
// 10. FUNCIÓN ADICIONAL PARA SINCRONIZACIÓN MANUAL
// ===============================================
function sincronizarTerminosConcluidos() {
    
    const terminosAEnviar = TERMINOS.filter(t => t.estatus === 'Concluido');
    let sincronizados = 0;
    
    terminosAEnviar.forEach(termino => {
        sincronizarConAgendaGeneral(termino);
        sincronizados++;
    });
    
    if (sincronizados > 0) {
        mostrarMensajeGlobal(`${sincronizados} términos Concluidos movidos a Agenda General`, 'success');
    } else {
        mostrarMensajeGlobal('No hay términos en estado Concluido para sincronizar', 'info');
    }
}

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