// js/terminos.js

// Simula el rol del usuario logueado.
// Cambia este valor para probar los permisos:
// 'Abogado' | 'Gerente' | 'Direccion'
const USER_ROLE = 'Abogado';

// Lista de tribunales existentes - solo declarar si no existe
if (typeof tribunalesExistentes === 'undefined') {
    var tribunalesExistentes = [
        'Primer Tribunal Colegiado en Materia Laboral',
        'Segundo Tribunal Laboral',
        'Tercer Tribunal de Enjuiciamiento',
        'Cuarto Tribunal Colegiado',
        'Quinto Tribunal Civil',
        'Sexto Tribunal Penal',
        'Séptimo Tribunal Administrativo',
        'Octavo Tribunal de Amparo',
        'Noveno Tribunal Mercantil',
        'Décimo Tribunal Familiar'
    ];
}

// Lista de estados de México (fija, no se permite agregar más)
const estadosMexico = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
    'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
    'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo',
    'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca',
    'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa',
    'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

function initTerminos() {
    // Cargar datos de términos
    loadTerminos();
    
    // Configurar búsqueda
    setupSearchTerminos();
    
    // Configurar filtros
    setupFiltersTerminos();
    
    // Configurar buscador de tribunales
    setupTribunalSearch();
    
    // Configurar buscador de estados
    setupEstadoSearch();
    
    // ===== MODIFICADO: Renombrado de 'Presentar' a 'Liberar' =====
    initModalLiberarTermino();
    
    // Configurar subida de archivos
    setupFileUploadTermino();
    
    // Inicializar modal de términos
    initModalTerminosJS();

    // ===== NUEVO: Listener para el menú de acciones dinámico =====
    setupActionMenuListener();
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

// Función para abrir el modal de términos desde JavaScript
function openTerminoModalJS(termino = null) {
    console.log('openTerminoModalJS llamada con:', termino);
    
    const modal = document.getElementById('modal-termino');
    const title = document.getElementById('modal-termino-title');
    const form = document.getElementById('form-termino');
    
    if (!modal) {
        console.error('Modal modal-termino no encontrado');
        alert('Error: Modal no encontrado');
        return;
    }
    
    // Cargar lista de asuntos en el selector
    cargarAsuntosEnSelectorJS();
    
    // ===== NUEVO: Ocultar campos según tus reglas =====
    // Ocultamos los campos que ya no deben estar en el modal de edición/creación
    const camposAOcultar = ['etapa-revision', 'atendido', 'acuse-documento', 'observaciones'];
    camposAOcultar.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Ocultamos el 'form-group' padre para una mejor UI
            let parent = el.closest('.form-group') || el.closest('.form-row');
            if (parent) {
                parent.style.display = 'none';
            }
        }
    });
    // ===== FIN NUEVO =====
    
    if (termino) {
        // Modo edición
        title.textContent = 'Editar Término';
        document.getElementById('save-termino').textContent = 'Actualizar Término';
        document.getElementById('termino-id').value = termino.id;
        
        // Si tiene asunto asociado, seleccionarlo
        if (termino.asuntoId) {
            document.getElementById('asunto-selector').value = termino.asuntoId;
            // Deshabilitar selector de asunto al editar
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
        
        // Datos específicos del término - mapear nombres de campos
        document.getElementById('fecha-ingreso').value = termino.fechaIngreso || '';
        document.getElementById('fecha-vencimiento').value = termino.fechaVencimiento || '';
        document.getElementById('actuacion').value = termino.actuacion || termino.asunto || '';
        document.getElementById('recordatorio-dias').value = termino.recordatorioDias || 1;
        document.getElementById('recordatorio-horas').value = termino.recordatorioHoras || 2;
        
    } else {
        // Modo nuevo término
        title.textContent = 'Nuevo Término';
        document.getElementById('save-termino').textContent = 'Guardar Término';
        if (form) form.reset();
        document.getElementById('termino-id').value = '';
        
        // Habilitar selector de asunto
        document.getElementById('asunto-selector').disabled = false;
        document.getElementById('asunto-selector').closest('.asunto-selector-section').style.opacity = '1';
        document.getElementById('asunto-selector').value = '';
        
        // Limpiar campos auto-llenados
        limpiarCamposAutoLlenadosModal();
        
        // Establecer fecha de hoy como predeterminada
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('fecha-ingreso').value = today;
        
        // Establecer vencimiento en 15 días
        const vencimiento = new Date();
        vencimiento.setDate(vencimiento.getDate() + 15);
        document.getElementById('fecha-vencimiento').value = vencimiento.toISOString().split('T')[0];
    }
    
    // Configurar evento de cambio para el selector de asunto
    const asuntoSelector = document.getElementById('asunto-selector');
    if (asuntoSelector) {
        asuntoSelector.removeEventListener('change', handleAsuntoCambioJS); // Evitar duplicados
        asuntoSelector.addEventListener('change', handleAsuntoCambioJS);
    }
    
    modal.style.display = 'flex';
    console.log('Modal abierto correctamente');
}

// Función para cargar asuntos en el selector desde JavaScript
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

// Función para manejar el cambio de asunto desde JavaScript
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

// Función para cargar datos del asunto seleccionado en el modal desde JavaScript
function cargarDatosAsuntoEnModalJS(asuntoId) {
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    const asunto = asuntos.find(a => a.id === asuntoId);
    
    if (asunto) {
        // Llenar campos auto-llenados del modal
        document.getElementById('termino-expediente').value = asunto.expediente || '';
        document.getElementById('termino-materia').value = asunto.materia || '';
        document.getElementById('termino-gerencia').value = asunto.gerencia || '';
        document.getElementById('termino-abogado').value = asunto.abogado || '';
        document.getElementById('termino-partes').value = asunto.partes || '';
        document.getElementById('termino-organo').value = asunto.organoJurisdiccional || '';
        document.getElementById('termino-prioridad').value = asunto.prioridad || '';
    }
}

// Función para inicializar el modal de términos desde JavaScript
function initModalTerminosJS() {
    const modalTermino = document.getElementById('modal-termino');
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
    if (modalTermino) {
        window.addEventListener('click', function(event) {
            if (event.target === modalTermino) {
                modalTermino.style.display = 'none';
            }
        });
    }
}

// ===== MODIFICADO: Lógica de guardado actualizada =====
function guardarTermino() {
    console.log('Guardando término...');
    
    const terminoId = document.getElementById('termino-id').value;
    const isEditing = terminoId && terminoId !== '';
    
    // Obtener valores del formulario
    const terminoData = {
        asuntoId: document.getElementById('asunto-selector').value,
        fechaIngreso: document.getElementById('fecha-ingreso').value,
        fechaVencimiento: document.getElementById('fecha-vencimiento').value,
        actuacion: document.getElementById('actuacion').value.trim(),
        recordatorioDias: parseInt(document.getElementById('recordatorio-dias').value) || 1,
        recordatorioHoras: parseInt(document.getElementById('recordatorio-horas').value) || 2,
    };
    
    // Validar campos obligatorios
    if (!terminoData.asuntoId) {
        alert('Por favor, selecciona un asunto.');
        return;
    }
    
    if (!terminoData.actuacion || !terminoData.fechaIngreso || !terminoData.fechaVencimiento) {
        alert('Por favor, completa todos los campos obligatorios (Fecha Ingreso, Fecha Vencimiento y Actuación).');
        return;
    }
    
    if (new Date(terminoData.fechaVencimiento) <= new Date(terminoData.fechaIngreso)) {
        alert('La fecha de vencimiento debe ser posterior a la fecha de ingreso.');
        return;
    }
    
    let terminos = JSON.parse(localStorage.getItem('terminos')) || [];
    
    if (isEditing) {
        // Modo edición
        const index = TERMINOS.findIndex(t => t.id == terminoId);
        if (index !== -1) {
            // Actualizar solo los campos editables
            TERMINOS[index] = { 
                ...TERMINOS[index], // Mantener datos existentes (id, estatus, acuses, etc.)
                ...terminoData      // Sobrescribir con los datos del formulario
            };
            TERMINOS[index].fechaModificacion = new Date().toISOString().split('T')[0];
            
            // Actualizar en localStorage
            const localStorageIndex = terminos.findIndex(t => t.id == terminoId);
            if (localStorageIndex !== -1) {
                terminos[localStorageIndex] = TERMINOS[index];
            }
            
            alert('Término actualizado exitosamente.');
        } else {
            alert('Error: No se encontró el término a editar.');
            return;
        }
    } else {
        // Modo nuevo término
        terminoData.id = Date.now().toString();
        terminoData.fechaCreacion = new Date().toISOString().split('T')[0];
        
        // ===== NUEVO: Forzar estatus 'Proyectista' =====
        terminoData.estatus = 'Proyectista';
        terminoData.observaciones = ''; // Inicializar vacío
        terminoData.atendido = false; // Inicializar falso
        terminoData.acuseDocumento = ''; // Inicializar vacío
        terminoData.historialAcuses = []; // Inicializar array de historial

        // Llenar datos del asunto para la tabla (esto es desnormalizado, pero tu diseño lo usa)
        const asunto = (JSON.parse(localStorage.getItem('asuntos')) || []).find(a => a.id === terminoData.asuntoId);
        if(asunto) {
            terminoData.expediente = asunto.expediente;
            terminoData.materia = asunto.materia;
            terminoData.gerencia = asunto.gerencia;
            terminoData.abogado = asunto.abogado;
            terminoData.actor = asunto.partes;
            terminoData.tribunal = asunto.organoJurisdiccional;
            terminoData.prioridad = asunto.prioridad;
            terminoData.asunto = terminoData.actuacion; // 'asunto' en la tabla es la 'actuacion'
            terminoData.prestacion = asunto.tipoAsunto; // Mapear
        }
        
        // Agregar nuevo término
        terminos.push(terminoData);
        TERMINOS.push(terminoData);
        
        alert('Término guardado exitosamente.');
    }
    
    localStorage.setItem('terminos', JSON.stringify(terminos));
    
    document.getElementById('form-termino').reset();
    limpiarCamposAutoLlenadosModal();
    
    const modal = document.getElementById('modal-termino');
    if (modal) modal.style.display = 'none';
    
    if (typeof loadTerminos === 'function') {
        loadTerminos();
    }
}

// Función para configurar la subida de archivos en términos (ahora oculta)
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

// ===== MODIFICADO: Lógica del Semáforo =====
function getSemaforoStatus(fechaVencimiento) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar 'hoy'
    
    const vencimiento = new Date(fechaVencimiento);
    vencimiento.setHours(0, 0, 0, 0); // Normalizar 'vencimiento'
    
    const diffTime = vencimiento - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { color: 'vencido', class: 'semaforo-vencido', tooltip: `Vencido hace ${Math.abs(diffDays)} días` };
    } else if (diffDays <= 2) { // 0, 1, 2 días
        return { color: 'rojo', class: 'semaforo-rojo', tooltip: `Vence en ${diffDays} días` };
    } else if (diffDays <= 7) { // 3 a 7 días
        return { color: 'amarillo', class: 'semaforo-amarillo', tooltip: `Vence en ${diffDays} días` };
    } else if (diffDays <= 30) { // 8 a 30 días
        return { color: 'verde', class: 'semaforo-verde', tooltip: `Vence en ${diffDays} días` };
    } else { // Más de 30 días
        return { color: 'azul', class: 'semaforo-azul', tooltip: `Vence en ${diffDays} días` };
    }
}

// Estado global simple
let TERMINOS = [];

function loadTerminos() {
    const tbody = document.getElementById('terminos-body');
    
    // Datos de ejemplo
    if (TERMINOS.length === 0) {
        const localTerminos = JSON.parse(localStorage.getItem('terminos'));
        if (localTerminos && localTerminos.length > 0) {
            TERMINOS = localTerminos;
        } else {
            // Si no hay nada en localStorage, cargar datos de ejemplo
            TERMINOS = [
                {
                    id: 1,
                    asuntoId: '1698270123456', // ID de un asunto de ejemplo
                    fechaIngreso: '2025-10-25',
                    fechaVencimiento: '2025-11-12', // Vence en 2 días (Rojo)
                    expediente: '2375/2025',
                    actor: 'Ortega Ibarra Juan Carlos',
                    asunto: 'Despido injustificado', // Este es 'actuacion'
                    actuacion: 'Despido injustificado',
                    prestacion: 'Reinstalación',
                    tribunal: 'Primer Tribunal Colegiado en Materia Laboral',
                    abogado: 'Lic. Martínez',
                    estado: 'Ciudad de México',
                    prioridad: 'Alta',
                    estatus: 'Proyectista', // ESTADO
                    materia: 'Laboral',
                    acuseDocumento: '',
                    historialAcuses: []
                },
                {
                    id: 2,
                    asuntoId: '1698270234567',
                    fechaIngreso: '2025-10-28',
                    fechaVencimiento: '2025-11-16', // Vence en 6 días (Amarillo)
                    expediente: '2012/2025',
                    actor: 'Valdez Sánchez María Elena',
                    asunto: 'Amparo indirecto',
                    actuacion: 'Amparo indirecto',
                    prestacion: 'Suspensión definitiva',
                    tribunal: 'Tercer Tribunal de Enjuiciamiento',
                    abogado: 'Lic. González',
                    estado: 'Jalisco',
                    prioridad: 'Media',
                    estatus: 'En Revision', // ESTADO
                    materia: 'Amparo',
                    acuseDocumento: '',
                    historialAcuses: []
                },
                {
                    id: 3,
                    asuntoId: '1698270345678',
                    fechaIngreso: '2025-11-01',
                    fechaVencimiento: '2025-11-20', // Vence en 10 días (Verde)
                    expediente: '2413/2025',
                    actor: 'García López Ana María',
                    asunto: 'Rescisión laboral',
                    actuacion: 'Rescisión laboral',
                    prestacion: 'Indemnización',
                    tribunal: 'Segundo Tribunal Laboral',
                    abogado: 'Lic. Rodríguez',
                    estado: 'Nuevo León',
                    prioridad: 'Alta',
                    estatus: 'Aprobado', // ESTADO
                    materia: 'Laboral',
                    acuseDocumento: '',
                    historialAcuses: []
                },
                {
                    id: 4,
                    asuntoId: '1698270456789',
                    fechaIngreso: '2025-10-20',
                    fechaVencimiento: '2025-12-15', // Vence en > 1 mes (Azul)
                    expediente: '1987/2025',
                    actor: 'Martínez Pérez Carlos',
                    asunto: 'Amparo laboral',
                    actuacion: 'Amparo laboral',
                    prestacion: 'Reinstalación',
                    tribunal: 'Cuarto Tribunal Colegiado',
                    abogado: 'Lic. Hernández',
                    estado: 'Jalisco',
                    prioridad: 'Baja',
                    estatus: 'Presentado', // ESTADO
                    materia: 'Amparo',
                    acuseDocumento: 'Acuse_1987-2025.pdf',
                    historialAcuses: ['Acuse_viejo_1987.pdf']
                },
                {
                    id: 5,
                    asuntoId: '1698270567890',
                    fechaIngreso: '2025-10-01',
                    fechaVencimiento: '2025-11-01', // Vencido (Vencido)
                    expediente: '1010/2025',
                    actor: 'Soto Reyna Luisa',
                    asunto: 'Cierre de caso',
                    actuacion: 'Cierre de caso',
                    prestacion: 'Finiquito',
                    tribunal: 'Quinto Tribunal Civil',
                    abogado: 'Lic. Sánchez',
                    estado: 'Puebla',
                    prioridad: 'Media',
                    estatus: 'Liberado', // ESTADO
                    materia: 'Civil',
                    acuseDocumento: 'Acuse_FIN_1010.pdf',
                    historialAcuses: []
                }
            ];
            localStorage.setItem('terminos', JSON.stringify(TERMINOS));
        }
    }
    
    let html = '';
    // Aplicar filtros antes de renderizar
    const filtros = getFiltrosAplicados();
    const terminosFiltrados = filtrarTerminos(TERMINOS, filtros);

    terminosFiltrados.forEach(termino => {
        const fechaIngresoClass = isToday(termino.fechaIngreso) ? 'current-date' : '';
        const fechaVencimientoClass = isToday(termino.fechaVencimiento) ? 'current-date' : '';
        
        const semaforoStatus = getSemaforoStatus(termino.fechaVencimiento);
        
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
                </td>
                </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// ===== MODIFICADO: generarAccionesRapidas con nuevas opciones =====
function generarAccionesRapidas(termino, rol) {
    let accionesHTML = '';
    
    // --- ACCIONES DE NAVEGACIÓN Y AUDITORÍA (CASI TODOS) ---
    accionesHTML += `<a href="#" class="action-item action-view-asunto" title="Ver el asunto principal">
                        <i class="fas fa-briefcase"></i> Ver Asunto
                    </a>`;
    accionesHTML += `<a href="#" class="action-item action-history" title="Ver historial de cambios">
                        <i class="fas fa-eye"></i> Ver Historial
                    </a>`;

    // --- ACCIONES DE WORKFLOW (Dependen del estado) ---
    switch (termino.estatus) {
        case 'Proyectista':
            if (rol === 'Abogado' || rol === 'Gerente' || rol === 'Direccion') {
                accionesHTML += `<a href="#" class="action-item action-send-review" title="Enviar a revisión">
                                    <i class="fas fa-paper-plane"></i> Enviar a Revisión
                                </a>`;
            }
            break;
            
        case 'En Revision':
            if (rol === 'Gerente' || rol === 'Direccion') {
                accionesHTML += `<a href="#" class="action-item action-approve" title="Aprobar el término">
                                    <i class="fas fa-check"></i> Aprobar
                                </a>`;
                accionesHTML += `<a href="#" class="action-item action-reject" title="Rechazar y devolver">
                                    <i class="fas fa-times"></i> Rechazar
                                </a>`;
            }
            break;
            
        case 'Aprobado':
            if (rol === 'Abogado' || rol === 'Gerente' || rol === 'Direccion') {
                accionesHTML += `<a href="#" class="action-item action-upload-acuse" title="Subir acuse de presentación">
                                    <i class="fas fa-file-upload"></i> Subir Acuse
                                </a>`;
            }
            break;
            
        case 'Presentado':
            if (rol === 'Direccion') {
                accionesHTML += `<a href="#" class="action-item action-liberar" title="Liberar el término (solo Dirección)">
                                    <i class="fas fa-lock-open"></i> Liberar Término
                                </a>`;
            }
            break;
    }
    
    // --- ACCIONES DE GESTIÓN (Dependen del Rol) ---
    if (rol === 'Gerente' || rol === 'Direccion') {
         accionesHTML += `<a href="#" class="action-item action-reasignar" title="Asignar a otro abogado">
                            <i class="fas fa-user-friends"></i> Reasignar
                        </a>`;
    }
    
    // --- ACCIONES DE ACUSE (Si existen) ---
    if (termino.acuseDocumento) {
        accionesHTML += `<a href="#" class="action-item action-download-acuse" title="Descargar acuse actual">
                            <i class="fas fa-download"></i> Ver Acuse Actual
                        </a>`;
    }
    if (termino.historialAcuses && termino.historialAcuses.length > 0) {
         accionesHTML += `<a href="#" class="action-item action-history-acuse" title="Ver acuses anteriores">
                            <i class="fas fa-history"></i> Historial Acuses
                        </a>`;
    }

    // --- ACCIÓN DE PELIGRO (Solo Dirección) ---
    if (rol === 'Direccion') {
        accionesHTML += `<div class="action-divider"></div>`; // Separador visual
        accionesHTML += `<a href="#" class="action-item action-delete danger-action" title="Eliminar este término">
                            <i class="fas fa-trash-alt"></i> Eliminar Término
                        </a>`;
    }
    
    // Input de archivo oculto
    accionesHTML += `<input type="file" class="input-acuse-hidden" data-id="${termino.id}" accept=".pdf,.doc,.docx" style="display:none;">`;

    return accionesHTML;
}

// ===== MODIFICADO: setupActionMenuListener con nuevos handlers =====
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
        
        // --- NUEVAS ACCIONES ---
        if (target.classList.contains('action-view-asunto')) {
            verDetallesAsunto(termino.asuntoId);
        }
        if (target.classList.contains('action-reasignar')) {
            abrirModalReasignar(id);
        }
        if (target.classList.contains('action-delete')) {
            eliminarTermino(id);
        }
        // --- FIN NUEVAS ACCIONES ---
        
        if (target.classList.contains('action-history')) {
            verHistorial(id);
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
        if (target.classList.contains('action-liberar')) {
            abrirModalLiberarTermino(id);
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
// ===== STUBS (PLANTILLAS) PARA NUEVAS FUNCIONES =====
// ===============================================

function verDetallesAsunto(asuntoId) {
    if (!asuntoId) {
        alert('Error: Este término no tiene un asunto asociado.');
        return;
    }
    // Asumiendo que tu página de detalles se llama 'asuntos-detalle.html'
    // y recibe el ID por la URL.
    console.log(`Redirigiendo a detalles del asunto ID: ${asuntoId}`);
    window.location.href = `asuntos-detalle.html?id=${asuntoId}`;
}

function abrirModalReasignar(terminoId) {
    // Aquí crearías un nuevo modal, más simple
    const termino = TERMINOS.find(t => t.id == terminoId);
    
    // (Simulación con un prompt)
    const abogadosDisponibles = "Lista de abogados: 1=Lic. Pérez, 2=Lic. Garza, 3=Lic. Soto";
    const nuevoAbogado = prompt(`Reasignar término: "${termino.asunto}" (Actual: ${termino.abogado})\n\n${abogadosDisponibles}\n\nIngrese el nombre del nuevo abogado:`);
    
    if (nuevoAbogado && nuevoAbogado.trim() !== '') {
        // Lógica de actualización
        const index = TERMINOS.findIndex(t => t.id == terminoId);
        TERMINOS[index].abogado = nuevoAbogado.trim();
        
        // Persistir en localStorage
        let terminosLS = JSON.parse(localStorage.getItem('terminos'));
        const lsIndex = terminosLS.findIndex(t => t.id == terminoId);
        terminosLS[lsIndex].abogado = nuevoAbogado.trim();
        localStorage.setItem('terminos', JSON.stringify(terminosLS));
        
        // (Simulación de log)
        actualizarEstatusTermino(terminoId, termino.estatus, `Reasignado a ${nuevoAbogado} por ${USER_ROLE}`);
        
        alert('Término reasignado.');
        loadTerminos(); // Recargar la tabla
    }
}

function eliminarTermino(terminoId) {
    // ¡Siempre confirmar una acción destructiva!
    const confirmacion = confirm('¿Estás seguro de que deseas ELIMINAR este término?\n\nEsta acción no se puede deshacer.');
    
    if (confirmacion) {
        console.log(`Eliminando término ID: ${terminoId}`);
        
        // Eliminar del array en memoria
        TERMINOS = TERMINOS.filter(t => t.id != terminoId);
        
        // Eliminar de localStorage
        let terminosLS = JSON.parse(localStorage.getItem('terminos'));
        terminosLS = terminosLS.filter(t => t.id != terminoId);
        localStorage.setItem('terminos', JSON.stringify(terminosLS));
        
        alert('Término eliminado.');
        loadTerminos(); // Recargar la tabla
    }
}

// ===============================================
// ===== FUNCIONES DE ACCIÓN (NUEVAS Y MODIFICADAS) =====
// ===============================================

function verHistorial(id) {
    alert(`(Simulación) Viendo historial para el término ID: ${id}. Aquí se mostraría un modal con la tabla 'Historial_Terminos'.`);
}

function verHistorialAcuses(id) {
    const termino = TERMINOS.find(t => t.id == id);
    if (termino && termino.historialAcuses.length > 0) {
        alert(`(Simulación) Historial de Acuses para ID ${id}:\n\n- ${termino.historialAcuses.join('\n- ')}`);
    } else {
        alert('Este término no tiene historial de acuses.');
    }
}

function enviarARevision(id) {
    console.log(`Enviando a revisión término ID: ${id}`);
    actualizarEstatusTermino(id, 'En Revision', `Enviado a revisión por ${USER_ROLE}`);
}

function aprobarTermino(id) {
    console.log(`Aprobando término ID: ${id}`);
    actualizarEstatusTermino(id, 'Aprobado', `Aprobado por ${USER_ROLE}`);
}

function rechazarTermino(id) {
    const motivo = prompt('Motivo del rechazo (se devolverá a "Proyectista"):');
    if (motivo) {
        console.log(`Rechazando término ID: ${id} por: ${motivo}`);
        actualizarEstatusTermino(id, 'Proyectista', `Rechazado por ${USER_ROLE}: ${motivo}`);
    }
}

function subirAcuse(id, file) {
    const termino = TERMINOS.find(t => t.id == id);
    if (!termino) return;

    const nuevoNombreArchivo = file.name;
    
    // Lógica de Versionamiento
    if (termino.acuseDocumento) {
        if (!termino.historialAcuses) {
            termino.historialAcuses = [];
        }
        termino.historialAcuses.push(termino.acuseDocumento); // Guardar el acuse anterior
        console.log(`Acuse anterior '${termino.acuseDocumento}' guardado en historial.`);
    }
    
    // Asignar el nuevo acuse
    termino.acuseDocumento = nuevoNombreArchivo;
    
    // Cambiar estatus a 'Presentado'
    actualizarEstatusTermino(id, 'Presentado', `Nuevo acuse '${nuevoNombreArchivo}' subido por ${USER_ROLE}`);
    
    alert(`Acuse '${nuevoNombreArchivo}' subido. El término ahora está 'Presentado'.`);
}

// Función genérica para actualizar estatus y persistir
function actualizarEstatusTermino(terminoId, nuevoEstatus, log) {
    const index = TERMINOS.findIndex(t => t.id == terminoId);
    if (index === -1) return;

    // Actualizar objeto en memoria
    TERMINOS[index].estatus = nuevoEstatus;
    
    // (Simulación de log de auditoría)
    if (!TERMINOS[index].log) TERMINOS[index].log = [];
    TERMINOS[index].log.push({ fecha: new Date().toISOString(), accion: log });
    console.log(log);

    // Persistir en localStorage
    let terminosLS = JSON.parse(localStorage.getItem('terminos')) || [];
    const lsIndex = terminosLS.findIndex(t => t.id == terminoId);
    if (lsIndex !== -1) {
        terminosLS[lsIndex].estatus = nuevoEstatus;
        localStorage.setItem('terminos', JSON.stringify(terminosLS));
    }

    // Recargar la tabla para reflejar el cambio
    loadTerminos();
}

// ===============================================

function setupSearchTerminos() {
    const searchInput = document.getElementById('search-terminos');
    
    searchInput.addEventListener('input', function() {
        applyFiltersTerminos();
    });
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

// ===== MODIFICADO: Funciones de filtrado =====
function getFiltrosAplicados() {
    return {
        tribunal: document.getElementById('filter-tribunal-termino').value.trim().toLowerCase(),
        estado: document.getElementById('filter-estado-termino').value.trim().toLowerCase(),
        estatus: document.getElementById('filter-estatus-termino').value,
        prioridad: document.getElementById('filter-prioridad-termino').value,
        materia: document.getElementById('filter-materia-termino').value,
        search: document.getElementById('search-terminos').value.toLowerCase()
    };
}

function filtrarTerminos(terminos, filtros) {
    return terminos.filter(termino => {
        const rowTribunal = (termino.tribunal || '').toLowerCase();
        const rowEstado = (termino.estado || termino.gerencia || '').toLowerCase();
        const rowEstatus = (termino.estatus || '');
        const rowPrioridad = (termino.prioridad || '');
        const rowMateria = (termino.materia || '');
        
        // Combinar todos los campos de texto para la búsqueda global
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
    // Esta función ahora solo llama a loadTerminos, que contiene la lógica de filtrado
    loadTerminos();
}
// ===============================================

function setupTribunalSearch() {
    // ... (Tu código de setupTribunalSearch existente, no necesita cambios)
    const input = document.getElementById('filter-tribunal-termino');
    const suggestionsDiv = document.getElementById('tribunal-suggestions');
    const clearBtn = document.getElementById('clear-tribunal');
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
    // ... (Tu código de setupEstadoSearch existente, no necesita cambios)
    const input = document.getElementById('filter-estado-termino');
    const suggestionsDiv = document.getElementById('estado-suggestions');
    const clearBtn = document.getElementById('clear-estado');
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

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString + 'T00:00:00-06:00'); // Asumir zona horaria local
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options);
}

function isToday(dateString) {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
}

// ===== MODIFICADO: Renombrado a 'Liberar' =====
function initModalLiberarTermino() {
    const modal = document.getElementById('modal-presentar-termino');
    const btnCerrar = document.getElementById('close-modal-presentar');
    const btnCancelar = document.getElementById('cancel-presentar');
    const btnConfirmar = document.getElementById('confirmar-presentar');

    if (!modal) return; 

    function cerrarModal() {
        modal.style.display = 'none';
        const observacionesField = document.getElementById('observaciones-presentacion');
        const idField = document.getElementById('presentar-termino-id');
        if (observacionesField) observacionesField.value = '';
        if (idField) idField.value = '';
    }

    if (btnCerrar) btnCerrar.onclick = cerrarModal;
    if (btnCancelar) btnCancelar.onclick = cerrarModal;

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            cerrarModal();
        }
    });

    if (btnConfirmar) {
        btnConfirmar.onclick = function() {
            const terminoId = document.getElementById('presentar-termino-id').value;
            const observaciones = document.getElementById('observaciones-presentacion').value.trim();
            
            if (!observaciones) {
                alert('Las observaciones son obligatorias para liberar el término');
                return;
            }
            
            liberarTermino(terminoId, observaciones);
        };
    }
}

function abrirModalLiberarTermino(terminoId) {
    console.log('Abriendo modal para LIBERAR término ID:', terminoId); 
    
    // ===== NUEVO: Chequeo de Rol =====
    if (USER_ROLE !== 'Direccion') {
        alert('Acción no permitida. Solo "Direccion" puede liberar términos.');
        return;
    }

    const modal = document.getElementById('modal-presentar-termino');
    const idField = document.getElementById('presentar-termino-id');
    
    // Cambiar textos del modal
    const modalTitle = modal.querySelector('.modal-header h2');
    const modalWarning = modal.querySelector('.alert-warning h3');
    const modalWarningP = modal.querySelector('.alert-warning p');
    const modalObsLabel = modal.querySelector('label[for="observaciones-presentacion"]');
    const modalConfirmBtn = document.getElementById('confirmar-presentar');

    if (modalTitle) modalTitle.textContent = 'Liberar Término';
    if (modalWarning) modalWarning.textContent = '¿Confirma que desea liberar este término?';
    if (modalWarningP) modalWarningP.textContent = 'El término cambiará su estatus a "Liberado" y se marcará como finalizado.';
    if (modalObsLabel) modalObsLabel.textContent = 'Observaciones de Liberación';
    if (modalConfirmBtn) modalConfirmBtn.textContent = 'Liberar Término';

    if (modal && idField) {
        idField.value = terminoId;
        modal.style.display = 'flex';
    } else {
        console.error('Modal o campo ID no encontrado');
    }
}

function liberarTermino(terminoId, observaciones) {
    console.log('Liberando término:', terminoId, 'Observaciones:', observaciones);
    
    // Actualizar estatus y guardar observaciones
    const index = TERMINOS.findIndex(t => t.id == terminoId);
    if (index !== -1) {
        TERMINOS[index].observaciones = observaciones; // Guardar observaciones
    }
    
    actualizarEstatusTermino(terminoId, 'Liberado', `Término liberado por ${USER_ROLE}. Obs: ${observaciones}`);

    // Mostrar mensaje de éxito
    mostrarMensajeGlobal(`Término ${terminoId} liberado correctamente`, 'success');
          
    // Cerrar modal
    const modal = document.getElementById('modal-presentar-termino');
    const observacionesField = document.getElementById('observaciones-presentacion');
    if (modal) modal.style.display = 'none';
    if (observacionesField) observacionesField.value = '';
    
    // Recargar la tabla (ya lo hace actualizarEstatusTermino)
}

// Función global para descargar acuse
function descargarAcuse(nombreArchivo, expediente) {
    if (!nombreArchivo) {
        alert('Este término no tiene un acuse para descargar.');
        return;
    }
    console.log('📥 Descargando acuse:', nombreArchivo, 'para expediente:', expediente);
    
    const enlace = document.createElement('a');
    enlace.href = '#'; // Simulación
    enlace.download = nombreArchivo;
    enlace.click();
    
    mostrarMensajeGlobal(`Descarga simulada de: ${nombreArchivo}`, 'success');
}

// Función de utilidad para mensajes
function mostrarMensajeGlobal(mensaje, tipo = 'success') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `alert alert-${tipo}`;
    msgDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; padding: 15px; border-radius: 5px;';
    msgDiv.innerHTML = `<i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i> ${mensaje}`;
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
        if (msgDiv.parentNode) {
            // Corrección de un pequeño typo que tenías en el código anterior (msgSgDiv -> msgDiv)
            msgDiv.parentNode.removeChild(msgDiv); 
        }
    }, 3000);
}