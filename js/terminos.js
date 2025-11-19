// js/terminos.js

// ===============================================
// 1. CONFIGURACIÓN Y DATOS
// ===============================================

// CAMBIA ESTO PARA PROBAR DIFERENTES VISTAS:
// Roles: 'Abogado', 'JefeDepto', 'Gerente', 'Direccion', 'Subdireccion'
const USER_ROLE = 'Direccion'; 

// Configuración del Flujo de Trabajo (Workflow)
const FLUJO_ETAPAS = {
    'Proyectista': { siguiente: 'Revisión', accion: 'enviarRevision', label: 'Enviar a Revisión' },
    'Revisión':    { siguiente: 'Gerencia', anterior: 'Proyectista', accion: 'aprobar', label: 'Aprobar a Gerencia' },
    'Gerencia':    { siguiente: 'Dirección', anterior: 'Revisión', accion: 'aprobar', label: 'Aprobar a Dirección' },
    'Dirección':   { siguiente: 'Liberado', anterior: 'Gerencia', accion: 'aprobar', label: 'Liberar Término' },
    'Liberado':    { siguiente: 'Presentado', accion: 'subirAcuse', label: 'Subir Acuse' },
    'Presentado':  { siguiente: 'Concluido', accion: 'concluir', label: 'Concluir' }
};

// Permisos: ¿Quién puede actuar en cada etapa?
const PERMISOS_ETAPAS = {
    'Proyectista': ['Abogado', 'Gerente','JefeDepto','Direccion'],
    'Revisión':    ['JefeDepto', 'Gerente', 'Direccion'],
    'Gerencia':    ['Gerente', 'Direccion'],
    'Dirección':   ['Direccion', 'Subdireccion'],
    'Liberado':    ['Abogado', 'JefeDepto', 'Gerente'],
    'Presentado':  ['Direccion'],
    'Concluido':   []
};

let TERMINOS = [];

// ===============================================
// 2. INICIALIZACIÓN
// ===============================================
function initTerminos() {
    console.log("Iniciando módulo Términos...");
    
    // Cargar datos iniciales
    cargarDatosIniciales();
    
    // Renderizar tabla
    loadTerminos(); 
    
    // Configurar UI (Buscador y Filtros)
    setupSearchAndFilters();
    
    // Inicializar Modales
    initModalTerminosJS();      // Crear/Editar
    initModalPresentar();       // Usado para Liberar/Concluir
    initModalReasignar();       // Reasignar abogado
    
    // Configurar subida de archivo (input oculto en tabla y modal)
    setupFileUploads();
    
    // Activar el menú de 3 puntos (Delegación de eventos)
    setupActionMenuListener();
    
    // Cargar selectores (simulado)
    cargarAsuntosEnSelectorJS();
    cargarAbogadosSelector();

    const btnNuevo = document.getElementById('add-termino');
    if (btnNuevo) {
        // Eliminamos listeners anteriores para evitar duplicados (buena práctica)
        const newBtn = btnNuevo.cloneNode(true);
        btnNuevo.parentNode.replaceChild(newBtn, btnNuevo);
        
        newBtn.addEventListener('click', () => {
            console.log("Click en Nuevo Término");
            openTerminoModalJS(); // Abre el modal en modo "crear"
        });
    } else {
        console.warn('Botón add-termino no encontrado');
    }

    // 2. Botón Exportar Excel
    const btnExportar = document.getElementById('export-terminos'); // Asegúrate que el ID en HTML sea 'export-terminos'
    if (btnExportar) {
        const newBtnExp = btnExportar.cloneNode(true);
        btnExportar.parentNode.replaceChild(newBtnExp, btnExportar);

        newBtnExp.addEventListener('click', () => {
             console.log("Click en Exportar");
             if(typeof XLSX !== 'undefined') {
                 exportarTablaExcel(); 
             } else {
                 alert('Librería de exportación no cargada.');
             }
        });
    } else {
         // Intenta buscar con el ID alternativo si usaste otro nombre
         const btnExportarAlt = document.getElementById('exportar-excel');
         if (btnExportarAlt) {
            const newBtnExp = btnExportarAlt.cloneNode(true);
            btnExportarAlt.parentNode.replaceChild(newBtnExp, btnExportarAlt);
            
            newBtnExp.addEventListener('click', () => {
                 if(typeof XLSX !== 'undefined') {
                     exportarTablaExcel(); 
                 } else {
                     alert('Librería de exportación no cargada.');
                 }
            });
         } else {
             console.warn('Botón export-terminos no encontrado');
         }
    }   
}

function cargarDatosIniciales() {
    const localData = JSON.parse(localStorage.getItem('terminos'));
    if (localData && localData.length > 0) {
        TERMINOS = localData;
    } else {
        // Datos Demo
        TERMINOS = [
            { id: 1, expediente: '2375/2025', actor: 'Juan Perez', asunto: 'Despido', prestacion: 'Reinstalación', abogado: 'Lic. Martínez', estatus: 'Proyectista', fechaIngreso: '2025-11-01', fechaVencimiento: '2025-11-20', acuseDocumento: '' },
            { id: 2, expediente: '1090/2024', actor: 'Maria Lopez', asunto: 'Amparo', prestacion: 'Constitucional', abogado: 'Lic. González', estatus: 'Revisión', fechaIngreso: '2025-10-15', fechaVencimiento: '2025-11-22', acuseDocumento: '' },
            { id: 3, expediente: '5555/2025', actor: 'Empresa X', asunto: 'Mercantil', prestacion: 'Cobro', abogado: 'Lic. Soto', estatus: 'Gerencia', fechaIngreso: '2025-09-01', fechaVencimiento: '2025-11-25', acuseDocumento: '' },
            { id: 4, expediente: '7777/2025', actor: 'Pedro Sola', asunto: 'Civil', prestacion: 'Daños', abogado: 'Lic. Soto', estatus: 'Liberado', fechaIngreso: '2025-09-01', fechaVencimiento: '2025-10-01', acuseDocumento: '' }
        ];
        localStorage.setItem('terminos', JSON.stringify(TERMINOS));
    }
}

// ===============================================
// 3. RENDERIZADO DE TABLA Y FILTROS
// ===============================================
function loadTerminos() {
    const tbody = document.getElementById('terminos-body');
    if(!tbody) return;

    // Obtener valores de filtros
    const filtros = {
        tribunal: document.getElementById('filter-tribunal-termino')?.value.toLowerCase() || '',
        estado: document.getElementById('filter-estado-termino')?.value.toLowerCase() || '',
        estatus: document.getElementById('filter-estatus-termino')?.value || '',
        prioridad: document.getElementById('filter-prioridad-termino')?.value || '',
        materia: document.getElementById('filter-materia-termino')?.value || '',
        search: document.getElementById('search-terminos')?.value.toLowerCase() || ''
    };

    // Filtrar datos
    const listaFiltrada = TERMINOS.filter(t => {
        // Filtro de texto general (Buscador)
        const textoCompleto = `${t.expediente} ${t.actor} ${t.asunto} ${t.abogado}`.toLowerCase();
        if (filtros.search && !textoCompleto.includes(filtros.search)) return false;

        // Filtros específicos (si el valor no es vacío o 'todos', debe coincidir)
        if (filtros.estatus && !filtros.estatus.includes('todos') && t.estatus !== filtros.estatus) return false;
        if (filtros.prioridad && !filtros.prioridad.includes('todos') && t.prioridad !== filtros.prioridad) return false;
        // ... agregar lógica para tribunal/materia si esos datos existen en el objeto TERMINOS
        
        return true;
    });

    let html = '';
    listaFiltrada.forEach(t => {
        const semaforo = getSemaforoStatus(t.fechaVencimiento);
        const estadoClass = getEstadoClass(t.estatus);
        
        html += `
        <tr data-id="${t.id}">
            <td>
                <div class="semaforo-container">
                    <div class="semaforo-dot ${semaforo.class}" title="${semaforo.tooltip}"></div>
                    ${formatDate(t.fechaIngreso)}
                </div>
            </td>
            <td>${formatDate(t.fechaVencimiento)}</td>
            <td>${t.expediente}</td>
            <td>${t.actor}</td>
            <td>${t.asunto}</td> 
            <td>${t.prestacion || 'N/A'}</td> 
            <td>${t.abogado}</td>
            <td><span class="badge-estado ${estadoClass}">${t.estatus}</span></td>
            
            <td class="actions">
                <button class="btn btn-primary btn-sm action-edit" title="Editar Datos">
                    <i class="fas fa-edit"></i>
                </button>
                
                <div class="action-menu-container">
                    <button class="btn btn-secondary btn-sm action-menu-toggle" title="Acciones">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="action-menu">
                        ${generarAccionesRapidas(t, USER_ROLE)}
                    </div>
                </div>
                <input type="file" class="input-acuse-hidden" data-id="${t.id}" style="display:none;">
            </td>
        </tr>
        `;
    });

    tbody.innerHTML = html;
}

function setupSearchAndFilters() {
    // Conectar todos los inputs de filtro a la función loadTerminos
    const ids = [
        'search-terminos', 'filter-tribunal-termino', 'filter-estado-termino',
        'filter-estatus-termino', 'filter-prioridad-termino', 'filter-materia-termino'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', loadTerminos);
        }
    });
}

// ===============================================
// 4. LÓGICA DEL MENÚ DINÁMICO (WORKFLOW)
// ===============================================
function generarAccionesRapidas(termino, rol) {
    let html = '';
    const etapa = termino.estatus;
    
    // 1. Permisos: ¿Puede este rol actuar en esta etapa?
    const rolesPermitidos = PERMISOS_ETAPAS[etapa] || [];
    const puedeActuar = rolesPermitidos.includes(rol);

    // Acciones Generales
    html += `<a href="#" class="action-item action-view-asunto"><i class="fas fa-briefcase"></i> Ver Asunto</a>`;
    html += `<a href="#" class="action-item action-history"><i class="fas fa-eye"></i> Ver Historial</a>`;

    if (puedeActuar) {
        html += `<div class="action-divider"></div>`;
        const config = FLUJO_ETAPAS[etapa];

        if (config) {
            // Acciones de avance (Aprobar/Enviar)
            if (config.accion === 'enviarRevision' || config.accion === 'aprobar') {
                html += `<a href="#" class="action-item action-advance"><i class="fas fa-check"></i> ${config.label}</a>`;
            }
            // Acciones operativas (Subir Acuse)
            if (config.accion === 'subirAcuse') {
                html += `<a href="#" class="action-item action-upload-acuse"><i class="fas fa-file-upload"></i> ${config.label}</a>`;
            }
            // Acciones finales (Concluir)
            if (config.accion === 'concluir') {
                html += `<a href="#" class="action-item action-conclude"><i class="fas fa-flag-checkered"></i> ${config.label}</a>`;
            }
            
            // Opción de Rechazar (solo si hay etapa anterior definida)
            if (config.anterior) {
                html += `<a href="#" class="action-item action-reject danger-action"><i class="fas fa-times"></i> Rechazar</a>`;
            }
        }
    }

    // Acciones Administrativas (Solo Jefes)
    if (rol === 'Gerente' || rol === 'Direccion') {
        html += `<div class="action-divider"></div>`;
        html += `<a href="#" class="action-item action-reasignar"><i class="fas fa-user-friends"></i> Reasignar</a>`;
        if (rol === 'Direccion') {
            html += `<a href="#" class="action-item action-delete danger-action"><i class="fas fa-trash-alt"></i> Eliminar</a>`;
        }
    }

    return html;
}

function setupActionMenuListener() {
    const tbody = document.getElementById('terminos-body');
    if(!tbody) return;

    tbody.addEventListener('click', function(e) {
        const target = e.target.closest('button, a');
        if (!target) return;

        const row = target.closest('tr');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const termino = TERMINOS.find(t => t.id == id);

        // 1. Toggle Menú
        if (target.classList.contains('action-menu-toggle')) {
            e.preventDefault();
            document.querySelectorAll('.action-menu.show').forEach(m => m.classList.remove('show'));
            target.nextElementSibling.classList.toggle('show');
            return;
        }

        // 2. Acciones
        if (target.classList.contains('action-edit')) {
            openTerminoModalJS(termino);
        }
        else if (target.classList.contains('action-advance')) {
            avanzarEtapa(id);
        }
        else if (target.classList.contains('action-reject')) {
            regresarEtapa(id);
        }
        else if (target.classList.contains('action-upload-acuse')) {
            row.querySelector('.input-acuse-hidden').click();
        }
        else if (target.classList.contains('action-conclude')) {
            // Usa el modal de "Presentar" reutilizado para Concluir/Liberar
            abrirModalPresentar(id, 'Concluir Término', 'Se marcará como finalizado.');
        }
        else if (target.classList.contains('action-reasignar')) {
            abrirModalReasignar(id);
        }
        else if (target.classList.contains('action-delete')) {
            if(confirm('¿Eliminar término permanentemente?')) {
                TERMINOS = TERMINOS.filter(t => t.id != id);
                guardarYRecargar();
            }
        }
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.action-menu-container')) {
            document.querySelectorAll('.action-menu.show').forEach(m => m.classList.remove('show'));
        }
    });
}

// ===============================================
// 5. LÓGICA DE TRANSICIÓN DE ESTADOS
// ===============================================
function avanzarEtapa(id) {
    const idx = TERMINOS.findIndex(t => t.id == id);
    if (idx === -1) return;
    
    const actual = TERMINOS[idx].estatus;
    const config = FLUJO_ETAPAS[actual];
    
    if(config && config.siguiente) {
        // Si requiere confirmación especial (ej. Dirección)
        if (actual === 'Dirección') {
             // Usamos el modal "Presentar" como modal de liberación
             abrirModalPresentar(id, 'Liberar Término', 'El término pasará a estado "Liberado" para carga de acuse.');
             return;
        }
        
        // Avance directo
        if(confirm(`¿Avanzar de ${actual} a ${config.siguiente}?`)) {
            TERMINOS[idx].estatus = config.siguiente;
            guardarYRecargar();
            mostrarMensajeGlobal(`Avanzado a ${config.siguiente}`, 'success');
        }
    }
}

function regresarEtapa(id) {
    const idx = TERMINOS.findIndex(t => t.id == id);
    if (idx === -1) return;
    
    const actual = TERMINOS[idx].estatus;
    const config = FLUJO_ETAPAS[actual];

    if(config && config.anterior) {
        const motivo = prompt("Motivo del rechazo:");
        if(motivo) {
            TERMINOS[idx].estatus = config.anterior;
            // Aquí guardaríamos el motivo en un log
            guardarYRecargar();
            mostrarMensajeGlobal(`Regresado a ${config.anterior}`, 'warning');
        }
    }
}

function guardarYRecargar() {
    localStorage.setItem('terminos', JSON.stringify(TERMINOS));
    loadTerminos();
}

// ===============================================
// 6. MODALES Y SUS FUNCIONES
// ===============================================

// --- Modal Crear/Editar ---
function initModalTerminosJS() {
   const modal = document.getElementById('modal-termino');
    const btnSave = document.getElementById('save-termino');
    document.querySelectorAll('#close-modal-termino, #cancel-termino').forEach(btn => {
        if(btn) btn.onclick = () => modal.style.display = 'none';
    });

    if(btnSave) {
        // Clonar para eliminar listeners previos si la funcion se llama multiple veces
        const newBtn = btnSave.cloneNode(true);
        btnSave.parentNode.replaceChild(newBtn, btnSave);
        
        newBtn.onclick = (e) => {
            e.preventDefault();
            guardarTermino();
        };
    }
}

function openTerminoModalJS(termino = null) {
    const modal = document.getElementById('modal-termino');
    const form = document.getElementById('form-termino');
    const title = document.getElementById('modal-termino-title');
    
    // Limpiar y preparar
    form.reset();
    cargarAsuntosEnSelectorJS();
    
    if (termino) {
        title.textContent = 'Editar Datos del Término';
        document.getElementById('termino-id').value = termino.id;
        // Rellenar campos (Mapear IDs del HTML a propiedades del objeto)
        if(document.getElementById('asunto-selector')) document.getElementById('asunto-selector').value = termino.asuntoId || '';
        document.getElementById('fecha-ingreso').value = termino.fechaIngreso || '';
        document.getElementById('fecha-vencimiento').value = termino.fechaVencimiento || '';
        document.getElementById('actuacion').value = termino.asunto || '';
        
        // Rellenar datos de solo lectura si hay asunto
        if(termino.asuntoId) cargarDatosAsuntoEnModalJS(termino.asuntoId);
    } else {
        title.textContent = 'Nuevo Término';
        document.getElementById('termino-id').value = '';
        limpiarCamposAutoLlenadosModal();
    }
    
    modal.style.display = 'flex';
}

function guardarTermino() {
    const id = document.getElementById('termino-id').value;
    const isEdit = !!id;
    
    const data = {
        asuntoId: document.getElementById('asunto-selector').value,
        fechaIngreso: document.getElementById('fecha-ingreso').value,
        fechaVencimiento: document.getElementById('fecha-vencimiento').value,
        asunto: document.getElementById('actuacion').value,
    };
    
    if(!data.asuntoId || !data.fechaVencimiento) {
        mostrarMensajeGlobal('Faltan campos obligatorios', 'danger');
        return;
    }

    if(isEdit) {
        const idx = TERMINOS.findIndex(t => t.id == id);
        if(idx !== -1) {
            TERMINOS[idx] = { ...TERMINOS[idx], ...data };
            mostrarMensajeGlobal('Término actualizado', 'success');
        }
    } else {
        const nuevo = {
            id: Date.now(),
            estatus: 'Proyectista',
            ...data,
            acuseDocumento: '',
            expediente: document.getElementById('termino-expediente').value,
            actor: document.getElementById('termino-partes').value,
            abogado: document.getElementById('termino-abogado').value
        };
        TERMINOS.push(nuevo);
        mostrarMensajeGlobal('Término creado', 'success');
    }
    
    guardarYRecargar();
    document.getElementById('modal-termino').style.display = 'none';
}

/// --- Modal Reasignar ---
function initModalReasignar() {
    const modal = document.getElementById('modal-reasignar');
    const btnSave = document.getElementById('save-reasignar');
    document.querySelectorAll('#close-modal-reasignar, #cancel-reasignar').forEach(btn => {
        if(btn) btn.onclick = () => modal.style.display = 'none';
    });

    if(btnSave) {
        const newBtn = btnSave.cloneNode(true);
        btnSave.parentNode.replaceChild(newBtn, btnSave);
        
        newBtn.onclick = () => {
            const id = document.getElementById('reasignar-termino-id').value;
            const sel = document.getElementById('select-nuevo-abogado');
            const nuevoAbogado = sel.options[sel.selectedIndex].text;
            
            if(!sel.value) return mostrarMensajeGlobal('Seleccione abogado', 'danger');
            
            const idx = TERMINOS.findIndex(t => t.id == id);
            if(idx !== -1) {
                TERMINOS[idx].abogado = nuevoAbogado;
                guardarYRecargar();
                mostrarMensajeGlobal('Reasignado correctamente', 'success');
                modal.style.display = 'none';
            }
        };
    }
}

function abrirModalReasignar(id) {
    const modal = document.getElementById('modal-reasignar');
    const termino = TERMINOS.find(t => t.id == id);
    if(!termino) return;
    
    document.getElementById('reasignar-termino-id').value = id;
    document.getElementById('reasignar-actuacion').value = termino.asunto;
    document.getElementById('reasignar-abogado-actual').value = termino.abogado;
    cargarAbogadosSelector();
    
    modal.style.display = 'flex';
}

// --- Modal Presentar / Liberar / Concluir ---
// --- Modal Presentar / Liberar / Concluir ---
function initModalPresentar() {
    const modal = document.getElementById('modal-presentar-termino');
    const btnConfirm = document.getElementById('confirmar-presentar');
    
    document.querySelectorAll('#close-modal-presentar, #cancel-presentar').forEach(btn => {
        if(btn) btn.onclick = () => modal.style.display = 'none';
    });

    if(btnConfirm) {
        const newBtn = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);

        newBtn.onclick = () => {
            const id = document.getElementById('presentar-termino-id').value;
            const idx = TERMINOS.findIndex(t => t.id == id);
            
            if(idx !== -1) {
                const etapaActual = TERMINOS[idx].estatus;
                const siguiente = FLUJO_ETAPAS[etapaActual]?.siguiente;
                
                if(siguiente) {
                    TERMINOS[idx].estatus = siguiente;
                    guardarYRecargar();
                    mostrarMensajeGlobal(`Término movido a: ${siguiente}`, 'success');
                    modal.style.display = 'none';
                }
            }
        };
    }
}

function abrirModalPresentar(id, titulo, mensaje) {
    const modal = document.getElementById('modal-presentar-termino');
    if (!modal) {
        console.error("Error: No se encontró el modal 'modal-presentar-termino'");
        return;
    }

    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) modalTitle.innerText = titulo || 'Confirmar Acción';

    const alertTitle = modal.querySelector('.alert-warning h3');
    if (alertTitle) alertTitle.innerText = titulo;

    const alertMsg = modal.querySelector('.alert-warning p');
    if (alertMsg) alertMsg.innerText = mensaje || '';

    const idInput = document.getElementById('presentar-termino-id');
    if (idInput) idInput.value = id;

    const obsInput = document.getElementById('observaciones-presentacion');
    if (obsInput) obsInput.value = '';
    
    modal.style.display = 'flex';
}
// ===============================================
// 7. HELPERS (Carga de selects, archivos, etc.)
// ===============================================
function setupFileUploads() {
    const tbody = document.getElementById('terminos-body');
    if(tbody) {
        tbody.addEventListener('change', function(e) {
            if (e.target.classList.contains('input-acuse-hidden') && e.target.files.length > 0) {
                const id = e.target.getAttribute('data-id');
                const file = e.target.files[0];
                const idx = TERMINOS.findIndex(t => t.id == id);
                if(idx !== -1) {
                    TERMINOS[idx].acuseDocumento = file.name;
                    if(TERMINOS[idx].estatus === 'Liberado') TERMINOS[idx].estatus = 'Presentado';
                    guardarYRecargar();
                    mostrarMensajeGlobal('Acuse subido exitosamente', 'success');
                }
            }
        });
    }
    const fileModal = document.getElementById('acuse-documento');
    if(fileModal) {
        fileModal.onchange = () => {
            const label = document.getElementById('acuse-filename');
            if(label) label.innerText = fileModal.files[0]?.name || '';
        };
    }
}

function cargarAsuntosEnSelectorJS() {
    const sel = document.getElementById('asunto-selector');
    if(!sel) return;
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [{id:101, expediente:'Demo 1'}];
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    asuntos.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.text = `${a.expediente} - ${a.descripcion || 'Sin desc.'}`;
        sel.appendChild(opt);
    });
}

function cargarDatosAsuntoEnModalJS(asuntoId) {
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    const a = asuntos.find(x => x.id == asuntoId);
    if(a) {
        document.getElementById('termino-expediente').value = a.expediente || '';
        document.getElementById('termino-materia').value = a.materia || '';
        // ... rellenar resto si es necesario
    }
}
function limpiarCamposAutoLlenadosModal() {
    const inputs = document.querySelectorAll('.auto-filled-section input');
    inputs.forEach(i => i.value = '');
}
function cargarAbogadosSelector() {
    const sel = document.getElementById('select-nuevo-abogado');
    if(!sel) return;
    const abogados = ['Lic. A', 'Lic. B', 'Lic. C'];
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    abogados.forEach(ab => {
        const opt = document.createElement('option');
        opt.value = ab;
        opt.text = ab;
        sel.appendChild(opt);
    });
}

function getSemaforoStatus(fecha) {
    // Lógica simple. Mejorar con fechas reales.
    return { class: 'semaforo-verde', tooltip: 'A tiempo' };
}

function getEstadoClass(estatus) {
    // Mapeo de colores para badges
    if(estatus === 'Proyectista') return 'badge-secondary';
    if(estatus === 'Liberado') return 'badge-success';
    if(['Revisión', 'Gerencia', 'Dirección'].includes(estatus)) return 'badge-warning';
    return 'badge-primary';
}

function formatDate(date) { return date; }

function mostrarMensajeGlobal(msg, type) {
    // Crear alerta flotante simple
    const div = document.createElement('div');
    div.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 15px; background: white; border-left: 5px solid ${type==='success'?'green':'red'}; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 9999;`;
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function obtenerEtapaSiguiente(accion, etapaActual) {
    // Busca en la configuración qué sigue después de la etapa actual
    const config = FLUJO_ETAPAS[etapaActual];
    
    // Si la configuración existe y la acción coincide (ej: 'aprobar'), devuelve la siguiente etapa
    if (config && config.accion === accion) {
        return config.siguiente;
    }
    
    // Si algo falla, se queda en la misma etapa
    return etapaActual;
}

function exportarTablaExcel() {
    // Lógica simple para exportar el array TERMINOS
    const ws = XLSX.utils.json_to_sheet(TERMINOS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Terminos");
    XLSX.writeFile(wb, "Terminos_Legales.xlsx");
}