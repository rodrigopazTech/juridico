// js/terminos.js

// ===============================================
// CONFIGURACIÓN DEL SISTEMA
// ===============================================

// Simula el rol del usuario logueado.
// Cambia este valor para probar los permisos:
// 'Abogado' | 'JefeDepto' | 'Gerente' | 'Direccion' | 'Subdireccion'
const USER_ROLE = 'Abogado';
const USER_NAME = 'Lic. María González'; // Simula el nombre del usuario logueado

// Configuración de límites de tiempo por etapa (en días)
const LIMITES_ETAPAS = {
    'Proyectista': 2,
    'Revisión': 3, 
    'Gerencia': 2,
    'Dirección': 2,
    'Liberado': 5,
    'Presentado': 3,
    'Concluido': 0
};

// Responsables por etapa (quién debe actuar en esta etapa)
const RESPONSABLES_ETAPAS = {
    'Proyectista': ['Abogado'],
    'Revisión': ['JefeDepto'],
    'Gerencia': ['Gerente'],
    'Dirección': ['Direccion', 'Subdireccion'],
    'Liberado': ['Abogado'],
    'Presentado': ['Direccion', 'Subdireccion'],
    'Concluido': []
};

// Flujo de etapas (qué acción te lleva a qué etapa)
const FLUJO_ETAPAS = {
    'Proyectista': { 'enviarRevision': 'Revisión' },
    'Revisión': { 
        'aprobar': 'Gerencia',
        'rechazar': 'Proyectista' 
    },
    'Gerencia': { 
        'aprobar': 'Dirección',
        'rechazar': 'Revisión' 
    },
    'Dirección': { 
        'aprobar': 'Liberado',
        'rechazar': 'Gerencia' 
    },
    'Liberado': { 'subirAcuse': 'Presentado' },
    'Presentado': { 'concluir': 'Concluido' }
};

// Listas de datos
const tribunalesExistentes = [
    'Primer Tribunal Colegiado en Materia Laboral', 'Segundo Tribunal Laboral', 'Tercer Tribunal de Enjuiciamiento',
    'Cuarto Tribunal Colegiado', 'Quinto Tribunal Civil', 'Sexto Tribunal Penal',
    'Séptimo Tribunal Administrativo', 'Octavo Tribunal de Amparo', 'Noveno Tribunal Mercantil', 'Décimo Tribunal Familiar'
];

const estadosMexico = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
    'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
    'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
    'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

// Estado global
let TERMINOS = [];

// ===============================================
// FUNCIONES DE INICIALIZACIÓN
// ===============================================

function initTerminos() {
    console.log('🚀 Inicializando módulo de términos...');
    
    // Asumiendo que tienes un span con id="current-user" en tu HTML
    const userSpan = document.getElementById('current-user');
    if (userSpan) {
        userSpan.textContent = USER_NAME;
    }
    
    // Cargar datos
    loadTerminos();
    
    // Configurar componentes
    setupSearchTerminos();
    setupFiltersTerminos();
    setupTribunalSearch();
    setupEstadoSearch();
    
    // Inicializar modales
    initModalTerminosJS();
    initModalAprobacion();
    initModalHistorial();
    initModalReasignar();
    
    // Configurar subida de archivos (para el modal principal, aunque esté oculto)
    setupFileUploadTermino();
    
    // Listener para acciones
    setupActionMenuListener();
    
    console.log('✅ Módulo de términos inicializado correctamente');
}

// ===============================================
// FUNCIONES DE CARGA Y RENDERIZADO
// ===============================================

function loadTerminos() {
    const tbody = document.getElementById('terminos-body');
    if (!tbody) {
        console.error('No se encontró el body de la tabla #terminos-body');
        return;
    }
    
    if (TERMINOS.length === 0) {
        const localTerminos = JSON.parse(localStorage.getItem('terminos'));
        if (localTerminos && localTerminos.length > 0) {
            TERMINOS = localTerminos.map(t => ({
                ...t,
                fechaIngresoEtapa: t.fechaIngresoEtapa || t.fechaModificacion || t.fechaCreacion,
                historial: t.historial || [] // Asegurar que el historial exista
            }));
        } else {
            // Datos de ejemplo
            TERMINOS = [
                { 
                    id: '1', asuntoId: '1698270123456', fechaIngreso: '2025-10-25', fechaVencimiento: '2025-11-12', 
                    expediente: '2375/2025', actor: 'Ortega Ibarra Juan Carlos', asunto: 'Despido injustificado', 
                    actuacion: 'Despido injustificado', prestacion: 'Reinstalación', 
                    tribunal: 'Primer Tribunal Colegiado en Materia Laboral', abogado: 'Lic. Martínez', 
                    estado: 'Ciudad de México', prioridad: 'Alta', estatus: 'Proyectista', materia: 'Laboral', 
                    acuseDocumento: '', historialAcuses: [], fechaIngresoEtapa: '2025-10-25',
                    historial: [
                        { fecha: '2025-10-25T10:00:00Z', usuario: 'Sistema', rol: 'Admin', accion: 'Creó término', observaciones: 'Término creado inicialmente' }
                    ]
                }
            ];
            localStorage.setItem('terminos', JSON.stringify(TERMINOS));
        }
    }
    
    let html = '';
    const filtros = getFiltrosAplicados();
    const terminosFiltrados = filtrarTerminos(TERMINOS, filtros);

    terminosFiltrados.forEach(termino => {
        const fechaIngresoClass = isToday(termino.fechaIngreso) ? 'current-date' : '';
        const fechaVencimientoClass = isToday(termino.fechaVencimiento) ? 'current-date' : '';
        const semaforoStatus = getSemaforoStatus(termino.fechaVencimiento);
        const alertaTiempo = getAlertaTiempo(termino);
        
        html += `
            <tr data-id="${termino.id}" data-tribunal="${termino.tribunal}" data-estado="${termino.estado || termino.gerencia}" data-estatus="${termino.estatus}" data-prioridad="${termino.prioridad}" data-materia="${termino.materia}">
                <td class="${fechaIngresoClass}">
                    <div class="semaforo-container">
                        <div class="semaforo-dot ${semaforoStatus.class}" title="${semaforoStatus.tooltip}"></div>
                        ${formatDate(termino.fechaIngreso)}
                    </div>
                </td>
                <td class="${fechaVencimientoClass}">${formatDate(termino.fechaVencimiento)}</td>
                <td>${termino.expediente}</td>
                <td>${termino.actor}</td>
                <td>${termino.asunto}</td>
                <td>${termino.prestacion}</td>
                <td>${termino.abogado}</td>
                
                <td>
                    <span class="badge-estado ${getEstadoClass(termino.estatus)}">
                        ${termino.estatus}
                    </span>
                </td>
                
                <td>
                    <span class="badge-tiempo ${alertaTiempo.clase}" title="${alertaTiempo.tooltip}">
                        ${alertaTiempo.texto}
                    </span>
                </td>
                
                <td class="actions">
                    <button class="btn btn-primary btn-sm action-edit" title="Editar término">
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    <div class="action-menu-container">
                        <button class="btn btn-secondary btn-sm action-menu-toggle" title="Acciones rápidas">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="action-menu">
                            ${generarAccionesRapidas(termino, USER_ROLE)}
                        </div>
                    </div>
                    <input type="file" class="input-acuse-hidden" data-id="${termino.id}" accept=".pdf,.doc,.docx" style="display:none;">
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ===============================================
// MODAL PRINCIPAL (CREAR/EDITAR)
// ===============================================

function initModalTerminosJS() {
    const modalTermino = document.getElementById('modal-termino');
    if (!modalTermino) return;
    
    const btnAddTermino = document.getElementById('add-termino');
    const btnCloseTermino = document.getElementById('close-modal-termino');
    const btnCancelTermino = document.getElementById('cancel-termino');
    const btnSaveTermino = document.getElementById('save-termino');

    if (btnAddTermino) {
        btnAddTermino.addEventListener('click', function() {
            openTerminoModalJS();
        });
    }
    if (btnCloseTermino) {
        btnCloseTermino.addEventListener('click', function() {
            modalTermino.style.display = 'none';
        });
    }
    if (btnCancelTermino) {
        btnCancelTermino.addEventListener('click', function() {
            modalTermino.style.display = 'none';
        });
    }
    if (btnSaveTermino) {
        btnSaveTermino.addEventListener('click', function() {
            guardarTermino();
        });
    }
    window.addEventListener('click', function(event) {
        if (event.target === modalTermino) {
            modalTermino.style.display = 'none';
        }
    });
}

function openTerminoModalJS(termino = null) {
    const modal = document.getElementById('modal-termino');
    const title = document.getElementById('modal-termino-title');
    const form = document.getElementById('form-termino');
    
    if (!modal || !form) return;
    
    // Cargar lista de asuntos en el selector
    cargarAsuntosEnSelectorJS();
    
    // Ocultar campos de workflow del modal de edición
    const camposAOcultar = ['etapa-revision', 'atendido', 'acuse-documento', 'observaciones'];
    camposAOcultar.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            let parent = el.closest('.form-group') || el.closest('.form-row');
            if (parent) parent.style.display = 'none';
        }
    });
    
    if (termino) {
        // Modo edición
        title.textContent = 'Editar Término';
        document.getElementById('save-termino').textContent = 'Actualizar Término';
        document.getElementById('termino-id').value = termino.id;
        
        if (termino.asuntoId) {
            document.getElementById('asunto-selector').value = termino.asuntoId;
            document.getElementById('asunto-selector').disabled = true;
            document.getElementById('asunto-selector').closest('.asunto-selector-section').style.opacity = '0.7';
            cargarDatosAsuntoEnModalJS(termino.asuntoId);
        } else {
             // Llenar manualmente (si no hay asuntoId)
            document.getElementById('termino-expediente').value = termino.expediente || '';
            document.getElementById('termino-materia').value = termino.materia || '';
            document.getElementById('termino-gerencia').value = termino.estado || termino.gerencia || '';
            document.getElementById('termino-abogado').value = termino.abogado || '';
            document.getElementById('termino-partes').value = termino.actor || '';
            document.getElementById('termino-organo').value = termino.tribunal || '';
            document.getElementById('termino-prioridad').value = termino.prioridad || '';
        }
        
        // Datos específicos del término
        document.getElementById('fecha-ingreso').value = termino.fechaIngreso || '';
        document.getElementById('fecha-vencimiento').value = termino.fechaVencimiento || '';
        document.getElementById('actuacion').value = termino.actuacion || termino.asunto || '';
        document.getElementById('recordatorio-dias').value = termino.recordatorioDias || 1;
        document.getElementById('recordatorio-horas').value = termino.recordatorioHoras || 2;
        
    } else {
        // Modo nuevo término
        title.textContent = 'Nuevo Término';
        document.getElementById('save-termino').textContent = 'Guardar Término';
        form.reset();
        document.getElementById('termino-id').value = '';
        
        document.getElementById('asunto-selector').disabled = false;
        document.getElementById('asunto-selector').closest('.asunto-selector-section').style.opacity = '1';
        document.getElementById('asunto-selector').value = '';
        
        limpiarCamposAutoLlenadosModal();
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-ingreso').value = today;
    }
    
    // Configurar evento de cambio para el selector de asunto
    const asuntoSelector = document.getElementById('asunto-selector');
    if (asuntoSelector) {
        asuntoSelector.removeEventListener('change', handleAsuntoCambioJS); // Evitar duplicados
        asuntoSelector.addEventListener('change', handleAsuntoCambioJS);
    }
    
    modal.style.display = 'flex';
}

function guardarTermino() {
    const terminoId = document.getElementById('termino-id').value;
    const isEditing = !!terminoId;
    
    const terminoData = {
        asuntoId: document.getElementById('asunto-selector').value,
        fechaIngreso: document.getElementById('fecha-ingreso').value,
        fechaVencimiento: document.getElementById('fecha-vencimiento').value,
        actuacion: document.getElementById('actuacion').value.trim(),
        recordatorioDias: parseInt(document.getElementById('recordatorio-dias').value) || 1,
        recordatorioHoras: parseInt(document.getElementById('recordatorio-horas').value) || 2,
    };
    
    if (!terminoData.asuntoId) {
        return mostrarMensajeGlobal('Por favor, selecciona un asunto.', 'danger');
    }
    
    if (!terminoData.actuacion || !terminoData.fechaIngreso || !terminoData.fechaVencimiento) {
        return mostrarMensajeGlobal('Por favor, completa todos los campos obligatorios.', 'danger');
    }
    
    let terminos = JSON.parse(localStorage.getItem('terminos')) || [];
    
    if (isEditing) {
        const index = TERMINOS.findIndex(t => t.id == terminoId);
        if (index !== -1) {
            TERMINOS[index] = { ...TERMINOS[index], ...terminoData };
            TERMINOS[index].fechaModificacion = new Date().toISOString().split('T')[0];
            
            // Actualizar en localStorage
            const localStorageIndex = terminos.findIndex(t => t.id == terminoId);
            if (localStorageIndex !== -1) {
                terminos[localStorageIndex] = TERMINOS[index];
            }
            registrarEnHistorial(terminoId, 'Editó término', 'Se modificaron los datos base del término.');
            mostrarMensajeGlobal('Término actualizado exitosamente.', 'success');
        } else {
            return mostrarMensajeGlobal('Error: No se encontró el término a editar.', 'danger');
        }
    } else {
        // Modo nuevo término
        terminoData.id = Date.now().toString();
        terminoData.fechaCreacion = new Date().toISOString().split('T')[0];
        terminoData.fechaIngresoEtapa = new Date().toISOString().split('T')[0];
        terminoData.estatus = 'Proyectista'; // Estado inicial
        terminoData.acuseDocumento = '';
        terminoData.historialAcuses = [];
        terminoData.historial = [{
            fecha: new Date().toISOString(),
            usuario: USER_NAME,
            rol: USER_ROLE,
            accion: 'Creó término',
            observaciones: 'Término creado inicialmente'
        }];

        // Llenar datos del asunto
        const asunto = (JSON.parse(localStorage.getItem('asuntos')) || []).find(a => a.id === terminoData.asuntoId);
        if(asunto) {
            terminoData.expediente = asunto.expediente;
            terminoData.materia = asunto.materia;
            terminoData.gerencia = asunto.gerencia;
            terminoData.abogado = asunto.abogado;
            terminoData.actor = asunto.partes;
            terminoData.tribunal = asunto.organoJurisdiccional;
            terminoData.prioridad = asunto.prioridad;
            terminoData.asunto = terminoData.actuacion;
            terminoData.prestacion = asunto.tipoAsunto;
        }
        
        terminos.push(terminoData);
        TERMINOS.push(terminoData);
        mostrarMensajeGlobal('Término guardado exitosamente.', 'success');
    }
    
    guardarEnLocalStorage();
    document.getElementById('form-termino').reset();
    limpiarCamposAutoLlenadosModal();
    document.getElementById('modal-termino').style.display = 'none';
    loadTerminos();
}

// Configuración de subida de archivos (para el modal principal, ahora oculto)
function setupFileUploadTermino() {
    const fileInput = document.getElementById('acuse-documento');
    const fileName = document.getElementById('acuse-filename');
    
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

// ===============================================
// ACCIONES DEL MENÚ [...]
// ===============================================

function generarAccionesRapidas(termino, rol) {
    let accionesHTML = '';
    const etapaActual = termino.estatus;
    
    // Verificar si el rol actual puede accionar en esta etapa
    const puedeAccionar = RESPONSABLES_ETAPAS[etapaActual]?.includes(rol);

    // 1. Acciones de Workflow (Aprobar, Rechazar, etc.)
    if (puedeAccionar) {
        const accionesPosibles = FLUJO_ETAPAS[etapaActual] || {};
        
        if (accionesPosibles.enviarRevision) {
            accionesHTML += `<a href="#" class="action-item action-send-review" title="Enviar a Revisión"><i class="fas fa-paper-plane"></i> Enviar a Revisión</a>`;
        }
        if (accionesPosibles.aprobar) {
            accionesHTML += `<a href="#" class="action-item action-approve" title="Aprobar y avanzar"><i class="fas fa-check"></i> Aprobar</a>`;
        }
        if (accionesPosibles.rechazar) {
            accionesHTML += `<a href="#" class="action-item action-reject danger-action" title="Rechazar y devolver"><i class="fas fa-times"></i> Rechazar</a>`;
        }
        if (accionesPosibles.subirAcuse) {
            accionesHTML += `<a href="#" class="action-item action-upload-acuse" title="Subir acuse de presentación"><i class="fas fa-file-upload"></i> Subir Acuse</a>`;
        }
        if (accionesPosibles.concluir) {
            accionesHTML += `<a href="#" class="action-item action-concluir" title="Marcar como concluido"><i class="fas fa-check-double"></i> Concluir Término</a>`;
        }
    }
    
    // 2. Acciones Generales (Ver, Comentar, etc.)
    accionesHTML += `<div class="action-divider"></div>`;
    accionesHTML += `<a href="#" class="action-item action-view-asunto" title="Ver el asunto principal"><i class="fas fa-briefcase"></i> Ver Asunto</a>`;
    accionesHTML += `<a href="#" class="action-item action-history" title="Ver historial de cambios"><i class="fas fa-history"></i> Ver Historial</a>`;
    
    // 3. Acciones de Acuse (si ya existe)
    if (termino.acuseDocumento) {
        accionesHTML += `<a href="#" class="action-item action-download-acuse" title="Descargar acuse actual"><i class="fas fa-download"></i> Ver Acuse Actual</a>`;
    }
    if (termino.historialAcuses && termino.historialAcuses.length > 0) {
         accionesHTML += `<a href="#" class="action-item action-history-acuse" title="Ver acuses anteriores"><i class="fas fa-archive"></i> Historial Acuses</a>`;
    }

    // 4. Acciones Administrativas (Reasignar, Eliminar)
    if (rol === 'Gerente' || rol === 'Direccion' || rol === 'Subdireccion') {
         accionesHTML += `<a href="#" class="action-item action-reasignar" title="Asignar a otro abogado"><i class="fas fa-user-friends"></i> Reasignar</a>`;
    }
    if (rol === 'Direccion' || rol === 'Subdireccion') {
        accionesHTML += `<div class="action-divider"></div>`;
        accionesHTML += `<a href="#" class="action-item action-delete danger-action" title="Eliminar este término"><i class="fas fa-trash-alt"></i> Eliminar Término</a>`;
    }

    return accionesHTML;
}

function setupActionMenuListener() {
    const tbody = document.getElementById('terminos-body');
    if (!tbody) return;

    tbody.addEventListener('click', function(e) {
        const target = e.target.closest('button, a'); 
        if (!target) return;

        const row = target.closest('tr');
        if (!row) return;

        const id = row.getAttribute('data-id');
        const termino = TERMINOS.find(t => t.id == id);
        if (!termino) return;

        // --- Manejador del menú de 3 puntos ---
        if (target.classList.contains('action-menu-toggle')) {
            e.preventDefault();
            document.querySelectorAll('.action-menu.show').forEach(menu => {
                if (menu !== target.nextElementSibling) {
                    menu.classList.remove('show');
                }
            });
            target.nextElementSibling.classList.toggle('show');
        }

        // --- Acciones ---
        if (target.classList.contains('action-edit')) {
            openTerminoModalJS(termino);
        }
        if (target.classList.contains('action-view-asunto')) {
            verDetallesAsunto(termino.asuntoId);
        }
        if (target.classList.contains('action-reasignar')) {
            abrirModalReasignar(id);
        }
        if (target.classList.contains('action-delete')) {
            eliminarTermino(id);
        }
        if (target.classList.contains('action-history')) {
            abrirModalHistorial(id);
        }
        if (target.classList.contains('action-send-review')) {
            enviarARevision(id);
        }
        if (target.classList.contains('action-approve')) {
            aprobarTermino(id);
        }
        if (target.classList.contains('action-reject')) {
            rechazarTermino(id);
        }
        if (target.classList.contains('action-upload-acuse')) {
            row.querySelector('.input-acuse-hidden').click();
        }
        if (target.classList.contains('action-concluir')) {
            concluirTermino(id);
        }
        if (target.classList.contains('action-download-acuse')) {
            descargarAcuse(termino.acuseDocumento, termino.expediente);
        }
        if (target.classList.contains('action-history-acuse')) {
            verHistorialAcuses(id);
        }
    });
    
    // Listener para el input de archivo oculto
    tbody.addEventListener('change', function(e) {
        if (e.target.classList.contains('input-acuse-hidden')) {
            const id = e.target.getAttribute('data-id');
            const file = e.target.files[0];
            if (file) {
                subirAcuse(id, file);
            }
        }
    });

    // Cerrar menús al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.action-menu-container')) {
            document.querySelectorAll('.action-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });
}

// ===============================================
// LÓGICA DE MODALES DE ACCIÓN
// ===============================================

// --- Modal Aprobación/Rechazo ---
function initModalAprobacion() {
    const modal = document.getElementById('modal-aprobacion');
    if (!modal) return;
    
    const btnCerrar = document.getElementById('close-modal-aprobacion');
    const btnCancelar = document.getElementById('cancel-aprobacion');
    const btnConfirmar = document.getElementById('confirmar-aprobacion');

    function cerrarModal() {
        modal.style.display = 'none';
        document.getElementById('observaciones-aprobacion').value = '';
    }

    if (btnCerrar) btnCerrar.onclick = cerrarModal;
    if (btnCancelar) btnCancelar.onclick = cerrarModal;

    window.addEventListener('click', function(event) {
        if (event.target === modal) cerrarModal();
    });

    if (btnConfirmar) {
        btnConfirmar.onclick = function() {
            const terminoId = document.getElementById('aprobacion-termino-id').value;
            const accion = document.getElementById('aprobacion-accion').value;
            const observaciones = document.getElementById('observaciones-aprobacion').value.trim();
            
            if (accion !== 'aprobar' && !observaciones) {
                mostrarMensajeGlobal('Las observaciones son obligatorias para esta acción.', 'danger');
                return;
            }
            
            procesarAccion(terminoId, accion, observaciones || 'Aprobado');
            cerrarModal();
        };
    }
}

function abrirModalAprobacion(terminoId, accion, titulo, descripcion) {
    const modal = document.getElementById('modal-aprobacion');
    if (!modal) return;
    
    const tituloElement = document.getElementById('modal-aprobacion-title');
    const mensajeElement = document.getElementById('aprobacion-mensaje');
    const descripcionElement = document.getElementById('aprobacion-descripcion');
    
    tituloElement.textContent = titulo;
    mensajeElement.textContent = titulo;
    descripcionElement.textContent = descripcion;
    
    document.getElementById('aprobacion-termino-id').value = terminoId;
    document.getElementById('aprobacion-accion').value = accion;
    document.getElementById('observaciones-aprobacion').value = '';
    
    // Observaciones no obligatorias para aprobar
    const obsLabel = document.querySelector('label[for="observaciones-aprobacion"]');
    if (accion === 'aprobar') {
        obsLabel.textContent = 'Observaciones (Opcional)';
    } else {
        obsLabel.textContent = 'Observaciones (Obligatorio)';
    }

    modal.style.display = 'flex';
}

function procesarAccion(terminoId, accion, observaciones) {
    const termino = TERMINOS.find(t => t.id == terminoId);
    if (!termino) return;

    const etapaAnterior = termino.estatus;
    const etapaNueva = obtenerEtapaSiguiente(accion, etapaAnterior);
    
    if (etapaNueva === etapaAnterior && accion !== 'subirAcuse') {
        console.error(`Acción ${accion} no válida para la etapa ${etapaAnterior}`);
        return;
    }
    
    // Actualizar estado
    termino.estatus = etapaNueva;
    termino.fechaModificacion = new Date().toISOString().split('T')[0];
    termino.fechaIngresoEtapa = new Date().toISOString().split('T')[0];
    
    // Registrar en historial
    registrarEnHistorial(terminoId, accion, observaciones, { etapaNueva: etapaNueva, etapaAnterior: etapaAnterior });
    
    // Notificar al siguiente responsable
    if (etapaNueva !== etapaAnterior) {
        notificarSiguienteResponsable(termino, etapaAnterior, etapaNueva);
    }
    
    const mensajes = {
        'enviarRevision': 'Término enviado a Revisión',
        'aprobar': 'Término aprobado y enviado a la siguiente etapa',
        'rechazar': 'Término rechazado y devuelto',
        'subirAcuse': 'Acuse subido correctamente',
        'concluir': 'Término concluido exitosamente'
    };
    
    mostrarMensajeGlobal(mensajes[accion] || 'Acción completada', 'success');
    guardarEnLocalStorage();
    loadTerminos();
}

// --- Modal Historial ---
function initModalHistorial() {
    const modal = document.getElementById('modal-historial');
    if (!modal) return;
    
    const btnCerrar = document.getElementById('close-modal-historial');
    const btnCancelar = document.getElementById('cancel-historial');

    if (btnCerrar) btnCerrar.onclick = () => modal.style.display = 'none';
    if (btnCancelar) btnCancelar.onclick = () => modal.style.display = 'none';
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) modal.style.display = 'none';
    });
}

function abrirModalHistorial(terminoId) {
    const termino = TERMINOS.find(t => t.id == terminoId);
    if (!termino) return;

    const contenido = document.getElementById('historial-contenido');
    if (!contenido) return;

    let htmlHistorial = '';
    
    if (termino.historial && termino.historial.length > 0) {
        // Ordenar del más reciente al más antiguo
        [...termino.historial].reverse().forEach(registro => {
            htmlHistorial += `
                <div class="historial-item">
                    <div class="historial-header">
                        <strong>${registro.usuario || 'Usuario'}</strong> 
                        <span class="historial-rol">(${registro.rol || 'Rol'})</span>
                        <span class="historial-fecha">${formatDateTime(registro.fecha)}</span>
                    </div>
                    <div class="historial-accion">
                        <span class="badge-accion">${registro.accion}</span>
                        ${registro.datosAdicionales?.etapaAnterior ? `de <strong>${registro.datosAdicionales.etapaAnterior}</strong>` : ''}
                        ${registro.datosAdicionales?.etapaNueva ? `a <strong>${registro.datosAdicionales.etapaNueva}</strong>` : ''}
                    </div>
                    ${registro.observaciones ? `
                        <div class="historial-observaciones">
                            <em>${registro.observaciones}</em>
                        </div>
                    ` : ''}
                </div>
            `;
        });
    } else {
        htmlHistorial = '<p>No hay historial registrado para este término.</p>';
    }

    contenido.innerHTML = htmlHistorial;
    document.getElementById('modal-historial').style.display = 'flex';
}

// --- Modal Reasignar ---
function initModalReasignar() {
    const modal = document.getElementById('modal-reasignar');
    if (!modal) return;

    const btnClose = document.getElementById('close-modal-reasignar');
    const btnCancel = document.getElementById('cancel-reasignar');
    const btnSave = document.getElementById('save-reasignar');

    const closeModal = () => {
        modal.style.display = 'none';
        document.getElementById('form-reasignar').reset();
    };

    if (btnClose) btnClose.onclick = closeModal;
    if (btnCancel) btnCancel.onclick = closeModal;

    if (btnSave) {
        btnSave.onclick = function() {
            const terminoId = document.getElementById('reasignar-termino-id').value;
            const nuevoAbogadoSelect = document.getElementById('select-nuevo-abogado');
            const nuevoAbogadoNombre = nuevoAbogadoSelect.options[nuevoAbogadoSelect.selectedIndex].text;
            
            if (!nuevoAbogadoSelect.value) {
                return mostrarMensajeGlobal('Por favor, seleccione un nuevo abogado.', 'danger');
            }
            
            guardarReasignacion(terminoId, nuevoAbogadoNombre);
            closeModal();
        };
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) closeModal();
    });
}

function abrirModalReasignar(terminoId) {
    const modal = document.getElementById('modal-reasignar');
    if (!modal) return;

    const termino = TERMINOS.find(t => t.id == terminoId);
    if (!termino) return;

    cargarAbogadosSelector();

    document.getElementById('reasignar-termino-id').value = terminoId;
    document.getElementById('reasignar-actuacion').value = termino.asunto || 'N/A';
    document.getElementById('reasignar-abogado-actual').value = termino.abogado || 'No asignado';
    
    modal.style.display = 'flex';
}

function guardarReasignacion(terminoId, nuevoAbogadoNombre) {
    const index = TERMINOS.findIndex(t => t.id == terminoId);
    if (index === -1) return;

    TERMINOS[index].abogado = nuevoAbogadoNombre;
    
    registrarEnHistorial(terminoId, 'Reasignado', `Término reasignado a ${nuevoAbogadoNombre}`);
    
    mostrarMensajeGlobal('Término reasignado exitosamente', 'success');
    guardarEnLocalStorage();
    loadTerminos();
}

// ===============================================
// LÓGICA DE ACCIONES (STUBS Y REALES)
// ===============================================

function registrarEnHistorial(terminoId, accion, observaciones, datosAdicionales = {}) {
    const index = TERMINOS.findIndex(t => t.id == terminoId);
    if (index === -1) return;

    if (!TERMINOS[index].historial) {
        TERMINOS[index].historial = [];
    }

    const nuevoRegistro = {
        fecha: new Date().toISOString(),
        usuario: USER_NAME,
        rol: USER_ROLE,
        accion: accion,
        observaciones: observaciones,
        datosAdicionales: datosAdicionales
    };
    
    TERMINOS[index].historial.push(nuevoRegistro);
    guardarEnLocalStorage(); // Guardar en LS cada que hay un cambio
}

function verDetallesAsunto(asuntoId) {
    if (!asuntoId) {
        return mostrarMensajeGlobal('Error: Este término no tiene un asunto asociado.', 'danger');
    }
    console.log(`Redirigiendo a detalles del asunto ID: ${asuntoId}`);
    window.location.href = `asuntos-detalle.html?id=${asuntoId}`;
}

function eliminarTermino(terminoId) {
    const confirmacion = confirm('¿Estás seguro de que deseas ELIMINAR este término?\n\nEsta acción no se puede deshacer.');
    
    if (confirmacion) {
        TERMINOS = TERMINOS.filter(t => t.id != terminoId);
        guardarEnLocalStorage();
        mostrarMensajeGlobal('Término eliminado.', 'success');
        loadTerminos();
    }
}

function verHistorialAcuses(id) {
    const termino = TERMINOS.find(t => t.id == id);
    if (termino && termino.historialAcuses && termino.historialAcuses.length > 0) {
        alert(`(Simulación) Historial de Acuses para ID ${id}:\n\n- ${termino.historialAcuses.join('\n- ')}`);
    } else {
        mostrarMensajeGlobal('Este término no tiene historial de acuses.', 'info');
    }
}

function descargarAcuse(nombreArchivo, expediente) {
    if (!nombreArchivo) {
        return mostrarMensajeGlobal('Este término no tiene un acuse para descargar.', 'info');
    }
    console.log('📥 Descargando acuse:', nombreArchivo, 'para expediente:', expediente);
    
    const enlace = document.createElement('a');
    enlace.href = '#'; // Simulación
    enlace.download = nombreArchivo;
    enlace.click();
    
    mostrarMensajeGlobal(`Descarga simulada de: ${nombreArchivo}`, 'success');
}

// ===============================================
// LÓGICA DE FILTROS Y BÚSQUEDA (COMPLETADA)
// ===============================================

function setupSearchTerminos() {
    const searchInput = document.getElementById('search-terminos');
    if (searchInput) {
        searchInput.addEventListener('input', applyFiltersTerminos);
    }
}

function setupFiltersTerminos() {
    const filters = ['filter-tribunal-termino', 'filter-estado-termino', 'filter-estatus-termino', 'filter-prioridad-termino', 'filter-materia-termino'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', applyFiltersTerminos);
        }
    });
}

function getFiltrosAplicados() {
    const filtros = {
        tribunal: document.getElementById('filter-tribunal-termino')?.value.trim().toLowerCase() || '',
        estado: document.getElementById('filter-estado-termino')?.value.trim().toLowerCase() || '',
        estatus: document.getElementById('filter-estatus-termino')?.value || '',
        prioridad: document.getElementById('filter-prioridad-termino')?.value || '',
        materia: document.getElementById('filter-materia-termino')?.value || '',
        search: document.getElementById('search-terminos')?.value.toLowerCase() || ''
    };
    return filtros;
}

function filtrarTerminos(terminos, filtros) {
    return terminos.filter(termino => {
        const rowTribunal = (termino.tribunal || '').toLowerCase();
        const rowEstado = (termino.estado || termino.gerencia || '').toLowerCase();
        const rowEstatus = (termino.estatus || '');
        const rowPrioridad = (termino.prioridad || '');
        const rowMateria = (termino.materia || '');
        
        const rowText = [
            rowTribunal, rowEstado, rowEstatus, rowPrioridad, rowMateria,
            (termino.expediente || ''),
            (termino.actor || ''),
            (termino.asunto || ''),
            (termino.prestacion || ''),
            (termino.abogado || '')
        ].join(' ').toLowerCase();

        const matchesTribunal = !filtros.tribunal || rowTribunal.includes(filtros.tribunal);
        const matchesEstado = !filtros.estado || rowEstado.includes(filtros.estado);
        const matchesEstatus = !filtros.estatus || rowEstatus === filtros.estatus;
        const matchesPrioridad = !filtros.prioridad || rowPrioridad === filtros.prioridad;
        const matchesMateria = !filtros.materia || rowMateria === filtros.materia;
        const matchesSearch = !filtros.search || rowText.includes(filtros.search);

        return matchesTribunal && matchesEstado && matchesEstatus && matchesPrioridad && matchesMateria && matchesSearch;
    });
}

function applyFiltersTerminos() {
    loadTerminos();
}

function setupTribunalSearch() {
    const input = document.getElementById('filter-tribunal-termino');
    const suggestionsDiv = document.getElementById('tribunal-suggestions');
    const clearBtn = document.getElementById('clear-tribunal');
    if (!input || !suggestionsDiv || !clearBtn) return;
    
    let selectedIndex = -1;
      // Manejar entrada de texto
    input.addEventListener('input', function() {
        const query = this.value.trim();
        updateClearButton();
        
        if (query.length === 0) {
            hideSuggestions();
            applyFiltersTerminos();
            return;
        }

        showSuggestions(query);
        applyFiltersTerminos();
    });

    // Mostrar todas las opciones al hacer clic en el campo
    input.addEventListener('focus', function() {
        const query = this.value.trim();
        if (query === '') {
            // Mostrar todos los tribunales disponibles
            showSuggestions('', true);
        } else {
            showSuggestions(query);
        }
    });

    // Manejar teclas de navegación
    input.addEventListener('keydown', function(e) {
        const suggestions = suggestionsDiv.querySelectorAll('.tribunal-suggestion');
        
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
        applyFiltersTerminos();
    });

    function showSuggestions(query, showAll = false) {
        let matches;
        
        if (showAll || query === '') {
            // Mostrar todos los tribunales disponibles
            matches = tribunalesExistentes;
        } else {
            // Filtrar tribunales que coincidan con la búsqueda
            matches = tribunalesExistentes.filter(tribunal => 
                tribunal.toLowerCase().includes(query.toLowerCase())
            );
        }

        let html = '';
        
        // Agregar coincidencias existentes
        matches.forEach(match => {
            html += `<div class="tribunal-suggestion" data-tribunal="${match}">${match}</div>`;
        });

        // Opción para agregar nuevo tribunal si no hay coincidencia exacta y hay búsqueda
        if (!showAll && query.length > 2) {
            const exactMatch = matches.find(m => m.toLowerCase() === query.toLowerCase());
            if (!exactMatch) {
                html += `<div class="tribunal-suggestion add-new" data-tribunal="${query}">
                            <i class="fas fa-plus"></i> Agregar "${query}"
                         </div>`;
            }
        }

        suggestionsDiv.innerHTML = html;
        
        // Agregar event listeners a las sugerencias
        suggestionsDiv.querySelectorAll('.tribunal-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                selectSuggestion(this);
            });
        });

        suggestionsDiv.classList.add('show');
        selectedIndex = -1;
    }

    function selectSuggestion(suggestionElement) {
        const tribunal = suggestionElement.getAttribute('data-tribunal');
        
        // Si es una nueva opción, agregarla a la lista
        if (suggestionElement.classList.contains('add-new')) {
            if (!tribunalesExistentes.includes(tribunal)) {
                tribunalesExistentes.push(tribunal);
                tribunalesExistentes.sort();
            }
        }

        input.value = tribunal;
        updateClearButton();
        hideSuggestions();
        applyFiltersTerminos();
    }

    function updateSelectedSuggestion() {
        const suggestions = suggestionsDiv.querySelectorAll('.tribunal-suggestion');
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

function setupEstadoSearch() {
    const input = document.getElementById('filter-estado-termino');
    const suggestionsDiv = document.getElementById('estado-suggestions');
    const clearBtn = document.getElementById('clear-estado');
    if (!input || !suggestionsDiv || !clearBtn) return;

    let selectedIndex = -1;
      // Manejar entrada de texto
    input.addEventListener('input', function() {
        const query = this.value.trim();
        updateClearButtonEstado();
        
        if (query.length === 0) {
            hideSuggestionsEstado();
            applyFiltersTerminos();
            return;
        }

        showSuggestionsEstado(query);
        applyFiltersTerminos();
    });

    // Mostrar todas las opciones al hacer clic en el campo
    input.addEventListener('focus', function() {
        const query = this.value.trim();
        showSuggestionsEstado(query || '');
    });

    // Manejar teclas de navegación
    input.addEventListener('keydown', function(e) {
        const suggestions = suggestionsDiv.querySelectorAll('.estado-suggestion');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
            updateSelectedSuggestionEstado();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelectedSuggestionEstado();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                selectSuggestionEstado(suggestions[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            hideSuggestionsEstado();
        }
    });

    // Manejar clic fuera para cerrar sugerencias
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            hideSuggestionsEstado();
        }
    });

    // Botón limpiar
    clearBtn.addEventListener('click', function() {
        input.value = '';
        updateClearButtonEstado();
        hideSuggestionsEstado();
        applyFiltersTerminos();
    });

    function showSuggestionsEstado(query) {
        let matches;
        
        if (query === '') {
            // Mostrar todos los estados si no hay filtro
            matches = estadosMexico;
        } else {
            // Filtrar estados que coincidan con la búsqueda
            matches = estadosMexico.filter(estado => 
                estado.toLowerCase().includes(query.toLowerCase())
            );
        }

        let html = '';
        
        // Agregar todas las coincidencias
        matches.forEach(estado => {
            html += `<div class="estado-suggestion" data-estado="${estado}">${estado}</div>`;
        });

        if (matches.length === 0) {
            html = '<div class="estado-suggestion" style="color: #666; font-style: italic;">No se encontraron coincidencias</div>';
        }

        suggestionsDiv.innerHTML = html;
        
        // Agregar event listeners a las sugerencias
        suggestionsDiv.querySelectorAll('.estado-suggestion[data-estado]').forEach(suggestion => {
            suggestion.addEventListener('click', function() {
                selectSuggestionEstado(this);
            });
        });

        suggestionsDiv.classList.add('show');
        selectedIndex = -1;
    }

    function selectSuggestionEstado(suggestionElement) {
        const estado = suggestionElement.getAttribute('data-estado');
        if (!estado) return;

        input.value = estado;
        updateClearButtonEstado();
        hideSuggestionsEstado();
        applyFiltersTerminos();
    }

    function updateSelectedSuggestionEstado() {
        const suggestions = suggestionsDiv.querySelectorAll('.estado-suggestion[data-estado]');
        suggestions.forEach((suggestion, index) => {
            suggestion.classList.toggle('highlighted', index === selectedIndex);
        });
    }

    function hideSuggestionsEstado() {
        suggestionsDiv.classList.remove('show');
        selectedIndex = -1;
    }



    function updateClearButtonEstado() {
        if (input.value.trim()) {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }
    }
}

// ===============================================
// HELPERS DE UI (NUEVOS Y ANTIGUOS)
// ===============================================

function getAlertaTiempo(termino) {
    const limiteDias = LIMITES_ETAPAS[termino.estatus];
    if (limiteDias === undefined || limiteDias === 0) {
        return { texto: '-', clase: 'tiempo-ok', tooltip: 'No aplica límite de tiempo para esta etapa' };
    }

    const fechaEtapa = new Date(termino.fechaIngresoEtapa);
    const hoy = new Date();
    const diffTime = hoy - fechaEtapa;
    const diasEnEtapa = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const diasRestantes = limiteDias - diasEnEtapa;

    if (diasRestantes < 0) {
        return { texto: `Vencido (${diasEnEtapa}d)`, clase: 'tiempo-vencido', tooltip: `Límite de ${limiteDias} días. Lleva ${diasEnEtapa} días.` };
    } else if (diasRestantes <= 1) {
        return { texto: `${diasEnEtapa}d (Rest. 1)`, clase: 'tiempo-alerta', tooltip: `Límite de ${limiteDias} días. Queda 1 día.` };
    } else {
        return { texto: `${diasEnEtapa}d / ${limiteDias}d`, clase: 'tiempo-ok', tooltip: `Límite de ${limiteDias} días. Quedan ${diasRestantes} días.` };
    }
}

function getEstadoClass(estatus) {
    const estatusMap = {
        'Proyectista': 'estado-proyectista',
        'Revisión': 'estado-revision',
        'Gerencia': 'estado-gerencia',
        'Dirección': 'estado-direccion',
        'Liberado': 'estado-liberado',
        'Presentado': 'estado-presentado',
        'Concluido': 'estado-concluido'
    };
    return estatusMap[estatus] || 'estado-default';
}

function getSemaforoStatus(fechaVencimiento) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0); 
    
    const diffTime = vencimiento - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { color: 'vencido', class: 'semaforo-vencido', tooltip: `Vencido hace ${Math.abs(diffDays)} días` };
    } else if (diffDays <= 2) {
        return { color: 'rojo', class: 'semaforo-rojo', tooltip: `Vence en ${diffDays} días` };
    } else if (diffDays <= 7) {
        return { color: 'amarillo', class: 'semaforo-amarillo', tooltip: `Vence en ${diffDays} días` };
    } else if (diffDays <= 30) {
        return { color: 'verde', class: 'semaforo-verde', tooltip: `Vence en ${diffDays} días` };
    } else {
        return { color: 'azul', class: 'semaforo-azul', tooltip: `Vence en ${diffDays} días` };
    }
}

function cargarAsuntosEnSelectorJS() {
    const selector = document.getElementById('asunto-selector');
    if (!selector) return;
    
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    selector.innerHTML = '<option value="">Seleccionar Asunto</option>';
    
    asuntos.forEach(asunto => {
        const option = document.createElement('option');
        option.value = asunto.id;
        const descripcion = asunto.descripcion || asunto.partes || 'Asunto sin descripción';
        option.textContent = `${asunto.expediente} - ${descripcion}`;
        selector.appendChild(option);
    });
}

function handleAsuntoCambioJS() {
    const asuntoId = this.value;
    if (asuntoId) {
        cargarDatosAsuntoEnModalJS(asuntoId);
        document.getElementById('termino-asunto-id').value = asuntoId;
    } else {
        limpiarCamposAutoLlenadosModal();
        document.getElementById('termino-asunto-id').value = '';
    }
}

function cargarDatosAsuntoEnModalJS(asuntoId) {
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    const asunto = asuntos.find(a => a.id === asuntoId);
    
    if (asunto) {
        document.getElementById('termino-expediente').value = asunto.expediente || '';
        document.getElementById('termino-materia').value = asunto.materia || '';
        document.getElementById('termino-gerencia').value = asunto.gerencia || '';
        document.getElementById('termino-abogado').value = asunto.abogado || '';
        document.getElementById('termino-partes').value = asunto.partes || '';
        document.getElementById('termino-organo').value = asunto.organoJurisdiccional || '';
        document.getElementById('termino-prioridad').value = asunto.prioridad || '';
    }
}

function limpiarCamposAutoLlenadosModal() {
    const campos = [
        'termino-expediente', 'termino-materia', 'termino-gerencia', 
        'termino-abogado', 'termino-partes', 'termino-organo', 'termino-prioridad'
    ];
    campos.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) campo.value = '';
    });
}

function cargarAbogadosSelector() {
    const selector = document.getElementById('select-nuevo-abogado');
    if (!selector) return;

    // --- SIMULACIÓN ---
    const usuarios = [
        { id: 'user1', nombre: 'Lic. Martínez' },
        { id: 'user2', nombre: 'Lic. González' },
        { id: 'user3', nombre: 'Lic. Rodríguez' },
        { id: 'user4', nombre: 'Lic. Hernández' },
        { id: 'user5', nombre: 'Lic. Sánchez' },
        { id: 'user6', nombre: 'Lic. Pérez (Nuevo)' }
    ];
    // --- FIN SIMULACIÓN ---
    
    selector.innerHTML = '<option value="">Seleccione un abogado...</option>';
    
    usuarios.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.nombre;
        selector.appendChild(option);
    });
}

// ===============================================
// FUNCIÓN DE UTILIDAD PARA MENSAJES (TU CÓDIGO)
// ===============================================

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
    } else { // 'info' o default
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