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
    // Cargar datos de términos - Updated Nov 1, 2025
    loadTerminos();
    
    // Configurar búsqueda
    setupSearchTerminos();
    
    // Configurar filtros
    setupFiltersTerminos();
    
    // Configurar buscador de tribunales
    setupTribunalSearch();
    
    // Configurar buscador de estados
    setupEstadoSearch();
    
    // Inicializar modal de presentar término
    initModalPresentarTermino();
    
    // Configurar selector de asunto y carga de datos
    setupAsuntoSelector();
    
    // Configurar subida de archivos
    setupFileUploadTermino();
    
    // El botón para nuevo término ahora está manejado en el HTML
}

// Función para configurar el selector de asunto
function setupAsuntoSelector() {
    const selector = document.getElementById('asunto-selector');
    if (selector) {
        // Cargar asuntos disponibles
        cargarAsuntosEnSelector();
        
        // Configurar evento de cambio
        selector.addEventListener('change', function() {
            cargarDatosAsunto(this.value);
        });
    }
}

// Función para cargar asuntos en el selector
function cargarAsuntosEnSelector() {
    const selector = document.getElementById('asunto-selector');
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
    
    console.log(`${asuntos.length} asuntos cargados en el selector`);
}

// Función para cargar datos auto-llenados del asunto seleccionado
function cargarDatosAsunto(asuntoId) {
    console.log('Cargando datos del asunto:', asuntoId);
    
    if (!asuntoId) {
        limpiarCamposAutoLlenados();
        return;
    }
    
    // Obtener asuntos del localStorage
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    const asunto = asuntos.find(a => a.id === asuntoId);
    
    if (asunto) {
        // Llenar campos auto-llenados
        document.getElementById('expediente-auto').value = asunto.expediente || '';
        document.getElementById('materia-auto').value = asunto.materia || '';
        document.getElementById('gerencia-auto').value = asunto.gerencia || '';
        document.getElementById('abogado-auto').value = asunto.abogado || '';
        document.getElementById('partes-auto').value = asunto.partes || '';
        document.getElementById('organo-auto').value = asunto.organoJurisdiccional || '';
        document.getElementById('prioridad-auto').value = asunto.prioridad || '';
        
        console.log('Datos del asunto cargados:', asunto);
    } else {
        limpiarCamposAutoLlenados();
        console.log('Asunto no encontrado');
    }
}

function limpiarCamposAutoLlenados() {
    const campos = ['expediente-auto', 'materia-auto', 'gerencia-auto', 'abogado-auto', 'partes-auto', 'organo-auto', 'prioridad-auto'];
    campos.forEach(campoId => {
        const campo = document.getElementById(campoId);
        if (campo) campo.value = '';
    });
}

// Función para guardar término
function guardarTermino() {
    console.log('Guardando término...');
    
    // Obtener valores del formulario
    const termino = {
        // Datos heredados del asunto (solo para referencia)
        asuntoId: document.getElementById('asunto-selector').value,
        
        // Datos específicos del término (coinciden con la BD)
        fechaIngreso: document.getElementById('fecha-ingreso').value,
        fechaVencimiento: document.getElementById('fecha-vencimiento').value,
        actuacion: document.getElementById('actuacion').value.trim(),
        etapaRevision: document.getElementById('etapa-revision').value,
        acuseDocumento: document.getElementById('acuse-documento').files[0]?.name || '',
        observaciones: document.getElementById('observaciones').value.trim(),
        atendido: document.getElementById('atendido').value === 'true',
        recordatorioDias: parseInt(document.getElementById('recordatorio-dias').value) || 1,
        recordatorioHoras: parseInt(document.getElementById('recordatorio-horas').value) || 2,
        id: Date.now().toString(),
        fechaCreacion: new Date().toISOString().split('T')[0]
    };
    
    // Validar campos obligatorios
    if (!termino.asuntoId) {
        alert('Por favor, selecciona un asunto.');
        return;
    }
    
    if (!termino.actuacion || !termino.fechaIngreso || !termino.fechaVencimiento || !termino.etapaRevision) {
        alert('Por favor, completa todos los campos obligatorios (Fecha Ingreso, Fecha Vencimiento, Actuación y Etapa de Revisión).');
        return;
    }
    
    // Validar que la fecha de vencimiento sea posterior a la de ingreso
    if (new Date(termino.fechaVencimiento) <= new Date(termino.fechaIngreso)) {
        alert('La fecha de vencimiento debe ser posterior a la fecha de ingreso.');
        return;
    }
    
    // Obtener términos existentes
    let terminos = JSON.parse(localStorage.getItem('terminos')) || [];
    
    // Agregar nuevo término
    terminos.push(termino);
    
    // Guardar en localStorage
    localStorage.setItem('terminos', JSON.stringify(terminos));
    
    alert('Término guardado exitosamente.');
    
    // Limpiar formulario
    document.getElementById('formTerminos').reset();
    limpiarCamposAutoLlenados();
    document.getElementById('acuse-filename').textContent = 'Ningún archivo seleccionado';
    document.getElementById('acuse-filename').classList.remove('has-file');
    
    // Actualizar la tabla si estamos en la vista de términos
    if (typeof loadTerminos === 'function') {
        loadTerminos();
    }
    
    console.log('Término guardado:', termino);
}

// Función para configurar la subida de archivos en términos
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

// Función para calcular el estado del semáforo
function getSemaforoStatus(fechaVencimiento) {
    const today = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
        return { color: 'rojo', class: 'semaforo-rojo', tooltip: diffDays === 0 ? 'Vence hoy' : 'Vence mañana' };
    } else if (diffDays <= 5) {
        return { color: 'amarillo', class: 'semaforo-amarillo', tooltip: `Faltan ${diffDays} días` };
    } else {
        return { color: 'verde', class: 'semaforo-verde', tooltip: `Faltan ${diffDays} días` };
    }
}

function loadTerminos() {
    const tbody = document.getElementById('terminos-body');
    
    // Datos de ejemplo
    const terminos = [
        {
            id: 1,
            fechaIngreso: '2025-10-25',
            fechaVencimiento: '2025-11-02', // Mañana - ROJO
            expediente: '2375/2025',
            actor: 'Ortega Ibarra Juan Carlos',
            asunto: 'Despido injustificado',
            prestacion: 'Reinstalación',
            tribunal: 'Primer Tribunal Colegiado en Materia Laboral',
            abogado: 'Lic. Martínez',
            estado: 'Ciudad de México',
            prioridad: 'Alta',
            estatus: 'Proyectista',
            materia: 'Laboral'
        },
        {
            id: 2,
            fechaIngreso: '2025-10-28',
            fechaVencimiento: '2025-11-04', // En 3 días - AMARILLO
            expediente: '2012/2025',
            actor: 'Valdez Sánchez María Elena',
            asunto: 'Amparo indirecto',
            prestacion: 'Suspensión definitiva',
            tribunal: 'Tercer Tribunal de Enjuiciamiento',
            abogado: 'Lic. González',
            estado: 'Jalisco',
            prioridad: 'Media',
            estatus: 'Liberado',
            materia: 'Amparo'
        },
        {
            id: 3,
            fechaIngreso: '2025-11-01',
            fechaVencimiento: '2025-11-01', // HOY - ROJO
            expediente: '2413/2025',
            actor: 'García López Ana María',
            asunto: 'Rescisión laboral',
            prestacion: 'Indemnización',
            tribunal: 'Segundo Tribunal Laboral',
            abogado: 'Lic. Rodríguez',
            estado: 'Nuevo León',
            prioridad: 'Alta',
            estatus: 'Proyectista',
            materia: 'Laboral'
        },
        {
            id: 4,
            fechaIngreso: '2025-10-20',
            fechaVencimiento: '2025-11-15', // En 14 días - VERDE
            expediente: '1987/2025',
            actor: 'Martínez Pérez Carlos',
            asunto: 'Amparo laboral',
            prestacion: 'Reinstalación',
            tribunal: 'Cuarto Tribunal Colegiado',
            abogado: 'Lic. Hernández',
            estado: 'Jalisco',
            prioridad: 'Baja',
            estatus: 'Liberado',
            materia: 'Amparo'
        }
    ];
    
    let html = '';
    terminos.forEach(termino => {
        const fechaIngresoClass = isToday(termino.fechaIngreso) ? 'current-date' : '';
        const fechaVencimientoClass = isToday(termino.fechaVencimiento) ? 'current-date' : '';
        
        const semaforoStatus = getSemaforoStatus(termino.fechaVencimiento);
        
        html += `
            <tr data-tribunal="${termino.tribunal}" data-estado="${termino.estado}" data-estatus="${termino.estatus}" data-prioridad="${termino.prioridad}" data-materia="${termino.materia}">
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
                    ${termino.estatus === 'Presentado' ? 
                        `<div class="acuse-container">
                            <div class="acuse-text">ACUSE-${termino.expediente.replace('/', '-')}.pdf</div>
                            <div class="acuse-actions">
                                <button class="btn btn-primary btn-sm">
                                    <i class="fas fa-download"></i>
                                </button>
                            </div>
                        </div>` : 
                        `<div class="acuse-container">
                            <button class="btn btn-info btn-sm btn-subir-acuse" title="Subir acuse" data-id="${termino.id}">
                                <i class="fas fa-file-upload"></i>
                            </button>
                            <input type="file" class="input-acuse" data-id="${termino.id}" accept=".pdf,.doc,.docx" style="display:none;">
                            <span class="acuse-nombre" id="acuse-nombre-${termino.id}" style="font-size:.85rem; color:#555;">
                                Sin archivo
                            </span>
                        </div>`}
                </td>
                <td class="actions">
                    <button class="btn btn-primary btn-sm edit-termino" data-id="${termino.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    ${termino.estatus !== 'Presentado' ? 
                        `<input type="checkbox" class="presentar-termino" data-id="${termino.id}"> Presentar` : 
                        '<span class="status-presentado"><i class="fas fa-check-circle"></i> Presentado</span>'}
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Configurar botones de acción
    setupActionButtons();
}

function setupActionButtons() {
    // Botones de edición
    document.querySelectorAll('.edit-termino').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            alert('Editar término ID: ' + id);
        });
    });
    
    // Checkboxes para presentar término
    document.querySelectorAll('.presentar-termino').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                const id = this.getAttribute('data-id');
                abrirModalPresentarTermino(id);
                
                // Desmarcar el checkbox temporalmente hasta que se confirme
                this.checked = false;
            }
        });
    });
    
    // Configurar subida de acuses
    setupAcuseUpload();
}

function setupSearchTerminos() {
    const searchInput = document.getElementById('search-terminos');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#terminos-body tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

function setupFiltersTerminos() {
    // Configurar filtros de términos
    const filters = ['filter-tribunal-termino', 'filter-estado-termino', 'filter-estatus-termino', 'filter-prioridad-termino', 'filter-materia-termino'];
    
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', applyFiltersTerminos);
        }
    });
}

function applyFiltersTerminos() {
    const tribunal = document.getElementById('filter-tribunal-termino').value.trim();
    const estado = document.getElementById('filter-estado-termino').value.trim();
    const estatus = document.getElementById('filter-estatus-termino').value;
    const prioridad = document.getElementById('filter-prioridad-termino').value;
    const materia = document.getElementById('filter-materia-termino').value;

    const rows = document.querySelectorAll('#terminos-body tr');

    rows.forEach(row => {
        const rowTribunal = row.getAttribute('data-tribunal') || '';
        const rowEstado = row.getAttribute('data-estado') || '';
        const rowEstatus = row.getAttribute('data-estatus') || '';
        const rowPrioridad = row.getAttribute('data-prioridad') || '';
        const rowMateria = row.getAttribute('data-materia') || '';

        // Aplicar filtros - para tribunal y estado usamos coincidencia parcial
        const matchesTribunal = !tribunal || rowTribunal.toLowerCase().includes(tribunal.toLowerCase());
        const matchesEstado = !estado || rowEstado.toLowerCase().includes(estado.toLowerCase());
        const matchesEstatus = !estatus || rowEstatus.includes(estatus);
        const matchesPrioridad = !prioridad || rowPrioridad.includes(prioridad);
        const matchesMateria = !materia || rowMateria.includes(materia);

        // Mostrar/ocultar fila según los filtros
        if (matchesTribunal && matchesEstado && matchesEstatus && matchesPrioridad && matchesMateria) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function setupTribunalSearch() {
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
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function isToday(dateString) {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
}

// Funciones para modal de presentar término
function initModalPresentarTermino() {
    const modal = document.getElementById('modal-presentar-termino');
    const btnCerrar = document.getElementById('close-modal-presentar');
    const btnCancelar = document.getElementById('cancel-presentar');
    const btnConfirmar = document.getElementById('confirmar-presentar');

    if (!modal) return; // Si el modal no existe, salir

    // Cerrar modal
    function cerrarModal() {
        modal.style.display = 'none';
        const observacionesField = document.getElementById('observaciones-presentacion');
        const idField = document.getElementById('presentar-termino-id');
        if (observacionesField) observacionesField.value = '';
        if (idField) idField.value = '';
    }

    if (btnCerrar) btnCerrar.onclick = cerrarModal;
    if (btnCancelar) btnCancelar.onclick = cerrarModal;

    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            cerrarModal();
        }
    });

    // Confirmar presentación
    if (btnConfirmar) {
        btnConfirmar.onclick = function() {
            const terminoId = document.getElementById('presentar-termino-id').value;
            const observaciones = document.getElementById('observaciones-presentacion').value.trim();
            
            if (!observaciones) {
                alert('Las observaciones son obligatorias para presentar el término');
                return;
            }
            
            presentarTermino(terminoId, observaciones);
        };
    }
}

function abrirModalPresentarTermino(terminoId) {
    console.log('Abriendo modal para término ID:', terminoId); // Debug
    const modal = document.getElementById('modal-presentar-termino');
    const idField = document.getElementById('presentar-termino-id');
    
    if (modal && idField) {
        idField.value = terminoId;
        modal.style.display = 'flex';
    } else {
        console.error('Modal o campo ID no encontrado');
    }
}

function presentarTermino(terminoId, observaciones) {
    // Aquí implementarías la lógica para cambiar el estatus del término a "Presentado"
    // y guardar las observaciones (por ejemplo, en localStorage o enviando a un servidor)
    
    // Por ahora solo mostramos un mensaje de confirmación
    console.log('Presentando término:', terminoId, 'Observaciones:', observaciones);
    
    // Mostrar mensaje de éxito sin alert para no ser intrusivo
    const mensaje = document.createElement('div');
    mensaje.className = 'alert alert-success';
    mensaje.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; padding: 15px; background: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 5px;';
    mensaje.innerHTML = `<i class="fas fa-check-circle"></i> Término ${terminoId} presentado correctamente`;
    document.body.appendChild(mensaje);
    
    // Remover mensaje después de 3 segundos
    setTimeout(() => {
        if (mensaje.parentNode) {
            mensaje.parentNode.removeChild(mensaje);
        }
    }, 3000);
          
    // Cerrar modal
    const modal = document.getElementById('modal-presentar-termino');
    const observacionesField = document.getElementById('observaciones-presentacion');
    if (modal) modal.style.display = 'none';
    if (observacionesField) observacionesField.value = '';
    
    // Simular cambio de estatus en los datos y recargar la tabla
    // En una implementación real, esto se haría en el servidor
    updateTerminoStatus(terminoId, 'Presentado', observaciones);
    loadTerminos();
}

function updateTerminoStatus(terminoId, nuevoEstatus, observaciones) {
    // Esta función simula el cambio de estatus
    // En una implementación real, esto se haría en el servidor o localStorage
    console.log(`Término ${terminoId} cambiado a estatus: ${nuevoEstatus}`);
    console.log(`Observaciones guardadas: ${observaciones}`);
}

function setupAcuseUpload() {
    // Configurar botones de subir acuse
    document.querySelectorAll('.btn-subir-acuse').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const input = document.querySelector(`.input-acuse[data-id="${id}"]`);
            if (input) input.click();
        });
    });

    // Configurar inputs de archivo
    document.querySelectorAll('.input-acuse').forEach(input => {
        input.addEventListener('change', function() {
            const id = this.getAttribute('data-id');
            const spanNombre = document.getElementById(`acuse-nombre-${id}`);
            
            if (this.files.length > 0) {
                const fileName = this.files[0].name;
                
                // Simular subida del archivo
                if (spanNombre) {
                    spanNombre.textContent = fileName;
                    spanNombre.style.color = '#28a745'; // Verde para indicar éxito
                }
                
                // Aquí implementarías la lógica real de subida
                // const formData = new FormData();
                // formData.append('acuse', this.files[0]);
                // fetch('/api/terminos/' + id + '/acuse', { method: 'POST', body: formData })
                
                console.log(`Archivo ${fileName} seleccionado para término ${id}`);
                
                // Mostrar mensaje de éxito
                const mensaje = document.createElement('div');
                mensaje.className = 'alert alert-success';
                mensaje.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; padding: 15px; background: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 5px;';
                mensaje.innerHTML = `<i class="fas fa-check-circle"></i> Acuse "${fileName}" subido correctamente`;
                document.body.appendChild(mensaje);
                
                // Remover mensaje después de 3 segundos
                setTimeout(() => {
                    if (mensaje.parentNode) {
                        mensaje.parentNode.removeChild(mensaje);
                    }
                }, 3000);
            }
        });
    });
}