// Funciones principales para gestión de usuarios y materias
function initUsuarios() {
    // Cargar datos iniciales
    loadUsuarios();
    loadMaterias();
    loadGerencias(); // Carga inicial para que existan
    
    // Configurar búsqueda
    setupSearchUsuarios();
    setupSearchMaterias();
    setupSearchGerencias(); 
    
    // Configurar filtros
    setupFiltersUsuarios();
    
    console.log('Módulo de usuarios inicializado');
}

// ==================== GESTIÓN DE USUARIOS ====================

function loadUsuarios() {
    const tbody = document.getElementById('usuarios-body');
    if (!tbody) return;
    
    // Obtener usuarios del localStorage o crear datos de ejemplo
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Si no hay usuarios, crear algunos de ejemplo
    if (usuarios.length === 0) {
        usuarios = [
            {
                id: 1,
                nombre: 'Lic. María González Ruiz',
                correo: 'maria.gonzalez@juridico.com',
                rol: 'SUBDIRECTOR',
                activo: true,
                fechaCreacion: '2025-01-15',
                gerenciaId: 1, // ID de Gerencia
                materias: [1, 4] // IDs de Materias
            },
            {
                id: 2,
                nombre: 'Lic. Carlos Hernández López',
                correo: 'carlos.hernandez@juridico.com',
                rol: 'GERENTE',
                activo: true,
                fechaCreacion: '2025-02-10',
                gerenciaId: 1,
                materias: [1, 4, 5, 7]
            },
            {
                id: 3,
                nombre: 'Lic. Ana Patricia Morales',
                correo: 'ana.morales@juridico.com',
                rol: 'ABOGADO',
                activo: true,
                fechaCreacion: '2025-03-05',
                gerenciaId: 2,
                materias: [3]
            },
            {
                id: 4,
                nombre: 'Lic. Roberto Silva Martínez',
                correo: 'roberto.silva@juridico.com',
                rol: 'ABOGADO',
                activo: true,
                fechaCreacion: '2025-03-20',
                gerenciaId: 2,
                materias: [2, 3]
            },
            {
                id: 5,
                nombre: 'Lic. Sandra Jiménez Castro',
                correo: 'sandra.jimenez@juridico.com',
                rol: 'ABOGADO',
                activo: false,
                fechaCreacion: '2025-04-12',
                gerenciaId: 3,
                materias: [9]
            }
        ];
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
    
    let html = '';
    usuarios.forEach(usuario => {
        const estadoClass = usuario.activo ? 'status-active' : 'status-inactive';
        const estadoText = usuario.activo ? 'Activo' : 'Inactivo';
        const rolBadge = getRolBadge(usuario.rol);
        
        html += `
            <tr data-rol="${usuario.rol}" data-activo="${usuario.activo}">
                <td>${usuario.nombre}</td>
                <td>${usuario.correo}</td>
                <td>${rolBadge}</td>
                <td><span class="${estadoClass}">${estadoText}</span></td>
                <td>${formatDate(usuario.fechaCreacion)}</td>
                <td class="actions">
                    <button class="btn btn-primary btn-sm edit-usuario" data-id="${usuario.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn ${usuario.activo ? 'btn-warning' : 'btn-success'} btn-sm toggle-usuario" 
                            data-id="${usuario.id}" 
                            title="${usuario.activo ? 'Desactivar' : 'Activar'}">
                        <i class="fas ${usuario.activo ? 'fa-ban' : 'fa-check'}"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Configurar botones de acción
    setupUsuarioActions();
}

function getRolBadge(rol) {
    const badges = {
        'SUBDIRECTOR': '<span class="badge badge-danger">Subdirector</span>',
        'GERENTE': '<span class="badge badge-warning">Gerente</span>',
        'ABOGADO': '<span class="badge badge-primary">Abogado</span>'
    };
    return badges[rol] || '<span class="badge badge-secondary">Sin rol</span>';
}

function setupUsuarioActions() {
    // Botones de edición
    document.querySelectorAll('.edit-usuario').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usuario = usuarios.find(u => u.id === id);
            if (usuario) {
                // openUsuarioModal (definida en el HTML)
                openUsuarioModal(usuario);
            }
        });
    });
    
    // Botones de activar/desactivar
    document.querySelectorAll('.toggle-usuario').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            toggleUsuarioStatus(id);
        });
    });
}

function toggleUsuarioStatus(id) {
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioIndex = usuarios.findIndex(u => u.id === id);
    
    if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].activo = !usuarios[usuarioIndex].activo;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        const action = usuarios[usuarioIndex].activo ? 'activado' : 'desactivado';
        alert(`Usuario ${action} exitosamente.`);
        
        loadUsuarios();
    }
}

// =======================================================
// ============= FUNCIÓN SAVEUSUARIO (MODIFICADA PARA CHECKBOX) ==========
// =======================================================
function saveUsuario() {
    const id = document.getElementById('usuario-id').value;
    const nombre = document.getElementById('usuario-nombre').value.trim();
    const correo = document.getElementById('usuario-correo').value.trim();
    const contraseña = document.getElementById('usuario-contraseña').value;
    const rol = document.getElementById('usuario-rol').value;
    const activo = document.getElementById('usuario-activo').value === 'true';

    // --- LÍNEAS MODIFICADAS ---
    const gerenciaId = document.getElementById('usuario-gerencia').value;
    // Leer desde el nuevo contenedor de checkboxes
    const materias = getSelectedCheckboxValues('usuario-materias-checkbox-container');
    // --- FIN DE LÍNEAS MODIFICADAS ---

    // Validaciones
    if (!nombre || !correo || !rol || !gerenciaId) {
        alert('Por favor, completa todos los campos obligatorios (Nombre, Correo, Rol, Gerencia).');
        return;
    }

    // Validar materias solo si el grupo es visible
    const materiasGroup = document.getElementById('usuario-materias-group');
    if (materiasGroup.style.display === 'block' && materias.length === 0) {
        alert('Debe seleccionar al menos una materia para la gerencia elegida.');
        return;
    }

    if (!id && !contraseña) {
        alert('La contraseña es obligatoria para nuevos usuarios.');
        return;
    }
    
    if (contraseña && contraseña.length < 8 && id === "") { // Solo validar longitud en creación
        alert('La contraseña debe tener al menos 8 caracteres.');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        alert('Por favor, ingresa un correo electrónico válido.');
        return;
    }
    
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    
    // Verificar que el correo no esté duplicado
    const existingUser = usuarios.find(u => u.correo === correo && u.id.toString() !== id);
    if (existingUser) {
        alert('Ya existe un usuario con este correo electrónico.');
        return;
    }
    
    if (id) {
        // Editar usuario existente
        const usuarioIndex = usuarios.findIndex(u => u.id === parseInt(id));
        if (usuarioIndex !== -1) {
            usuarios[usuarioIndex] = {
                ...usuarios[usuarioIndex],
                nombre,
                correo,
                rol,
                activo,
                gerenciaId: parseInt(gerenciaId),
                materias: materias // Guardar array de checkboxes
            };
            
            // Solo actualizar contraseña si se proporcionó una nueva
            if (contraseña) {
                usuarios[usuarioIndex].contraseña = contraseña; // En un sistema real, esto debería ser hash
            }
        }
        alert('Usuario actualizado exitosamente.');
    } else {
        // Crear nuevo usuario
        const newId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
        const newUser = {
            id: newId,
            nombre,
            correo,
            contraseña, // En un sistema real, esto debería ser hash
            rol,
            activo,
            gerenciaId: parseInt(gerenciaId),
            materias: materias, // Guardar array de checkboxes
            fechaCreacion: new Date().toISOString().split('T')[0]
        };
        usuarios.push(newUser);
        alert('Usuario creado exitosamente.');
    }
    
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // Cerrar modal y actualizar tabla
    document.getElementById('modal-usuario').style.display = 'none';
    loadUsuarios();
}

function setupSearchUsuarios() {
    const searchInput = document.getElementById('search-usuarios');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#usuarios-body tr');
        
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

function setupFiltersUsuarios() {
    const filters = ['filter-rol', 'filter-activo'];
    
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', applyFiltersUsuarios);
        }
    });
}

function applyFiltersUsuarios() {
    const rol = document.getElementById('filter-rol').value;
    const activo = document.getElementById('filter-activo').value;
    const rows = document.querySelectorAll('#usuarios-body tr');

    rows.forEach(row => {
        const rowRol = row.getAttribute('data-rol') || '';
        const rowActivo = row.getAttribute('data-activo') || '';

        const matchesRol = !rol || rowRol === rol;
        const matchesActivo = !activo || rowActivo === activo;

        if (matchesRol && matchesActivo) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// ==================== GESTIÓN DE MATERIAS ====================

function loadMaterias() {
    const tbody = document.getElementById('materias-body');
    if (!tbody) return;
    
    // Obtener materias del localStorage o crear datos de ejemplo
    let materias = JSON.parse(localStorage.getItem('materias')) || [];
    
    // Si no hay materias, crear algunas de ejemplo
    if (materias.length === 0) {
        materias = [
            { id: 1, nombre: 'Civil', descripcion: 'Derecho civil y contratos' },
            { id: 2, nombre: 'Penal', descripcion: 'Derecho penal y criminología' },
            { id: 3, nombre: 'Laboral', descripcion: 'Derecho laboral y relaciones de trabajo' },
            { id: 4, nombre: 'Mercantil', descripcion: 'Derecho mercantil y empresarial' },
            { id: 5, nombre: 'Fiscal', descripcion: 'Derecho fiscal y tributario' },
            { id: 6, nombre: 'Familiar', descripcion: 'Derecho de familia' },
            { id: 7, nombre: 'Administrativo', descripcion: 'Derecho administrativo' },
            { id: 8, nombre: 'Constitucional', descripcion: 'Derecho constitucional' },
            { id: 9, nombre: 'Amparo', descripcion: 'Juicios de amparo' },
            { id: 10, nombre: 'Transparencia', descripcion: 'Unidad de Transparencia y Acceso a la Información' }
        ];
        localStorage.setItem('materias', JSON.stringify(materias));
    }
    
    let html = '';
    materias.forEach(materia => {
        html += `
            <tr>
                <td>${materia.id}</td>
                <td>${materia.nombre}</td>
                <td>${materia.descripcion || 'Sin descripción'}</td>
                <td class="actions">
                    <button class="btn btn-primary btn-sm edit-materia" data-id="${materia.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-materia" data-id="${materia.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    
    // Configurar botones de acción
    setupMateriaActions();
}

function setupMateriaActions() {
    // Botones de edición
    document.querySelectorAll('.edit-materia').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const materias = JSON.parse(localStorage.getItem('materias')) || [];
            const materia = materias.find(m => m.id === id);
            if (materia) {
                // openMateriaModal (definida en el HTML)
                openMateriaModal(materia);
            }
        });
    });
    
    // Botones de eliminación
    document.querySelectorAll('.delete-materia').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            if (confirm('¿Estás seguro de que deseas eliminar esta materia? Esta acción no se puede deshacer.')) {
                deleteMateria(id);
            }
        });
    });
}

function deleteMateria(id) {
    let materias = JSON.parse(localStorage.getItem('materias')) || [];
    materias = materias.filter(m => m.id !== id);
    localStorage.setItem('materias', JSON.stringify(materias));
    
    alert('Materia eliminada exitosamente.');
    loadMaterias();
}

function saveMateria() {
    const id = document.getElementById('materia-id').value;
    const nombre = document.getElementById('materia-nombre').value.trim();
    const descripcion = document.getElementById('materia-descripcion').value.trim();
    
    // Validaciones
    if (!nombre) {
        alert('Por favor, ingresa el nombre de la materia.');
        return;
    }
    
    let materias = JSON.parse(localStorage.getItem('materias')) || [];
    
    // Verificar que el nombre no esté duplicado
    const existingMateria = materias.find(m => m.nombre.toLowerCase() === nombre.toLowerCase() && m.id.toString() !== id);
    if (existingMateria) {
        alert('Ya existe una materia con este nombre.');
        return;
    }
    
    if (id) {
        // Editar materia existente
        const materiaIndex = materias.findIndex(m => m.id === parseInt(id));
        if (materiaIndex !== -1) {
            materias[materiaIndex] = {
                ...materias[materiaIndex],
                nombre,
                descripcion
            };
        }
        alert('Materia actualizada exitosamente.');
    } else {
        // Crear nueva materia
        const newId = materias.length ? Math.max(...materias.map(m => m.id)) + 1 : 1;
        const newMateria = {
            id: newId,
            nombre,
            descripcion
        };
        materias.push(newMateria);
        alert('Materia creada exitosamente.');
    }
    
    localStorage.setItem('materias', JSON.stringify(materias));
    
    // Cerrar modal y actualizar tabla
    document.getElementById('modal-materia').style.display = 'none';
    loadMaterias();
}

function setupSearchMaterias() {
    const searchInput = document.getElementById('search-materias');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#materias-body tr');
        
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


// ================================================================
// ==================== NUEVA GESTIÓN DE GERENCIAS ================
// ================================================================

function getGerencias() {
    return JSON.parse(localStorage.getItem('gerencias')) || [];
}

function loadGerencias() {
    const tbody = document.getElementById('gerencias-body');
    if (!tbody) return;

    let gerencias = getGerencias();
    const materias = getMaterias(); // Necesitamos esto para mapear IDs a nombres

    // Datos de ejemplo si no hay nada
    if (gerencias.length === 0) {
        gerencias = [
            { id: 1, nombre: 'Gerencia de Civil, Mercantil, Fiscal y Administrativo', materias: [1, 4, 5, 7] },
            { id: 2, nombre: 'Gerencia Laboral y Penal', materias: [2, 3] },
            { id: 3, nombre: 'Gerencia de Transparencia y Amparo', materias: [9, 10] }
        ];
        localStorage.setItem('gerencias', JSON.stringify(gerencias));
    }

    // Mapear materias para fácil acceso por ID
    const materiasMap = new Map(materias.map(m => [m.id, m.nombre]));

    let html = '';
    gerencias.forEach(gerencia => {
        // Convertir IDs de materias a nombres
        const materiasNombres = gerencia.materias
            .map(id => materiasMap.get(id) || `ID:${id}?`)
            .join(', ');

        html += `
            <tr data-nombre="${gerencia.nombre.toLowerCase()}">
                <td>${gerencia.id}</td>
                <td>${gerencia.nombre}</td>
                <td>${materiasNombres || 'Sin materias asignadas'}</td>
                <td class="actions">
                    <button class="btn btn-primary btn-sm edit-gerencia" data-id="${gerencia.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-gerencia" data-id="${gerencia.id}" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    setupGerenciaActions();
}

function setupGerenciaActions() {
    document.querySelectorAll('.edit-gerencia').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const gerencia = getGerencias().find(g => g.id === id);
            if (gerencia) {
                // openGerenciaModal (definida en el HTML)
                openGerenciaModal(gerencia);
            }
        });
    });

    document.querySelectorAll('.delete-gerencia').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            if (confirm('¿Estás seguro de que deseas eliminar esta gerencia?')) {
                deleteGerencia(id);
            }
        });
    });
}

// =======================================================
// ============= FUNCIÓN SAVEGERENCIA (MODIFICADA PARA CHECKBOX) ==========
// =======================================================
function saveGerencia() {
    const id = document.getElementById('gerencia-id').value;
    const nombre = document.getElementById('gerencia-nombre').value.trim();
    
    // --- LÍNEA MODIFICADA ---
    // Leer desde el nuevo contenedor de checkboxes
    const materiasSeleccionadas = getSelectedCheckboxValues('gerencia-materias-checkbox-container');
    // --- FIN DE LÍNEA MODIFICADA ---

    if (!nombre || materiasSeleccionadas.length === 0) {
        alert('Por favor, complete el nombre y seleccione al menos una materia.');
        return;
    }

    let gerencias = getGerencias();
    
    // Validar nombre duplicado
    const existing = gerencias.find(g => g.nombre.toLowerCase() === nombre.toLowerCase() && g.id.toString() !== id);
    if (existing) {
        alert('Ya existe una gerencia con este nombre.');
        return;
    }

    if (id) {
        // Editar
        const gerenciaIndex = gerencias.findIndex(g => g.id === parseInt(id));
        if (gerenciaIndex !== -1) {
            gerencias[gerenciaIndex].nombre = nombre;
            gerencias[gerenciaIndex].materias = materiasSeleccionadas;
        }
        alert('Gerencia actualizada exitosamente.');
    } else {
        // Crear
        const newId = gerencias.length ? Math.max(...gerencias.map(g => g.id)) + 1 : 1;
        const newGerencia = {
            id: newId,
            nombre,
            materias: materiasSeleccionadas
        };
        gerencias.push(newGerencia);
        alert('Gerencia creada exitosamente.');
    }

    localStorage.setItem('gerencias', JSON.stringify(gerencias));
    document.getElementById('modal-gerencia').style.display = 'none';
    loadGerencias();
}

function deleteGerencia(id) {
    // Validar que ningún usuario esté usando esta gerencia
    const usuarios = getUsuarios();
    const usuarioUsandoGerencia = usuarios.find(u => u.gerenciaId == id); // Usar == para comparación flexible
    if(usuarioUsandoGerencia) {
        alert('No se puede eliminar esta gerencia porque está asignada al usuario: ' + usuarioUsandoGerencia.nombre);
        return;
    }

    let gerencias = getGerencias().filter(g => g.id !== id);
    localStorage.setItem('gerencias', JSON.stringify(gerencias));
    alert('Gerencia eliminada exitosamente.');
    loadGerencias();
}

function setupSearchGerencias() {
    const searchInput = document.getElementById('search-gerencias');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('#gerencias-body tr');
        
        rows.forEach(row => {
            const nombre = row.getAttribute('data-nombre') || '';
            if (nombre.includes(searchTerm) || row.textContent.toLowerCase().includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}


// ================================================================
// ==================== NUEVAS FUNCIONES AUXILIARES (CON CHECKBOX) =
// ================================================================

/**
 * Puebla un div con checkboxes de todas las materias disponibles.
 * Usado en el modal de "Nueva Gerencia".
 * @param {string} containerId - El ID del <div> contenedor.
 * @param {Array<number>} [selectedMateriaIds=[]] - Array de IDs de materias a pre-seleccionar.
 */
function populateAllMateriasCheckboxes(containerId, selectedMateriaIds = []) {
    const materias = getMaterias();
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = ''; // Limpiar opciones anteriores
    const selectedIdsStr = selectedMateriaIds.map(String); // Para comparación fiable

    materias.forEach(materia => {
        const div = document.createElement('div'); // Contenedor para el par
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `materia-chk-gerencia-${materia.id}`; // ID único
        checkbox.value = materia.id;
        checkbox.name = 'gerencia-materia'; // Nombre de grupo
        
        // Marcar si está en la lista de seleccionados
        if (selectedIdsStr.includes(String(materia.id))) {
            checkbox.checked = true;
        }

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = materia.nombre;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
}

/**
 * Puebla un <select> de gerencias.
 * Usado en el modal de "Nuevo Usuario".
 * @param {string} selectElementId - El ID del <select> a poblar.
 * @param {number|null} [selectedGerenciaId=null] - El ID de la gerencia a pre-seleccionar.
 */
function populateGerenciasSelect(selectElementId, selectedGerenciaId = null) {
    const gerencias = getGerencias(); 
    const select = document.getElementById(selectElementId);
    
    // Guardar la opción "Seleccione..."
    const placeholder = select.querySelector('option[value=""]');
    select.innerHTML = ''; // Limpiar
    if (placeholder) {
        select.appendChild(placeholder); // Restaurar placeholder
    }

    gerencias.forEach(gerencia => {
        const option = document.createElement('option');
        option.value = gerencia.id;
        option.textContent = gerencia.nombre;
        if (selectedGerenciaId && gerencia.id == selectedGerenciaId) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

/**
 * Maneja el evento de cambio en el selector de gerencias del modal de usuario.
 * Muestra y puebla el contenedor de checkboxes correspondiente.
 * @param {Event|null} event - El evento de cambio (puede ser null si se llama manualmente).
 * @param {Array<number>} [selectedMateriaIds=[]] - Materias a pre-seleccionar (para modo edición).
 */
function handleGerenciaChange(event, selectedMateriaIds = []) {
    const gerenciaSelect = document.getElementById('usuario-gerencia');
    const materiasGroup = document.getElementById('usuario-materias-group');
    // --- CAMBIO AQUÍ ---
    // Obtener el nuevo contenedor de checkboxes
    const materiasContainer = document.getElementById('usuario-materias-checkbox-container');

    const selectedGerenciaId = gerenciaSelect.value;

    if (!selectedGerenciaId) {
        materiasGroup.style.display = 'none'; // Ocultar
        materiasContainer.innerHTML = ''; // Limpiar
        return;
    }

    // Obtener datos
    const gerencias = getGerencias();
    const allMaterias = getMaterias();
    const gerencia = gerencias.find(g => g.id == selectedGerenciaId);

    if (!gerencia) {
        console.error('No se encontró la gerencia con ID:', selectedGerenciaId);
        materiasGroup.style.display = 'none';
        return;
    }

    // Filtrar las materias que pertenecen a esta gerencia
    const materiasDeLaGerencia = allMaterias.filter(materia => 
        gerencia.materias.map(String).includes(String(materia.id)) // Comparación fiable
    );

    // --- BLOQUE MODIFICADO ---
    // Poblar el contenedor de checkboxes
    materiasContainer.innerHTML = ''; // Limpiar
    const selectedIdsStr = selectedMateriaIds.map(String); // Para comparación fiable

    materiasDeLaGerencia.forEach(materia => {
        const div = document.createElement('div');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `materia-chk-usuario-${materia.id}`; // ID único
        checkbox.value = materia.id;
        checkbox.name = 'usuario-materia'; // Nombre de grupo

        // Marcar si está en la lista de seleccionados
        if (selectedIdsStr.includes(String(materia.id))) {
            checkbox.checked = true;
        }

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = materia.nombre;
        
        div.appendChild(checkbox);
        div.appendChild(label);
        materiasContainer.appendChild(div);
    });
    // --- FIN BLOQUE MODIFICADO ---

    // Mostrar el grupo
    materiasGroup.style.display = 'block';
}

/**
 * Obtiene el array de IDs seleccionados de un contenedor de checkboxes.
 * @param {string} containerId - El ID del <div> que contiene los checkboxes.
 * @returns {Array<number>} - Array de IDs (convertidos a número).
 */
function getSelectedCheckboxValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    
    const selected = [];
    // Buscar todos los checkboxes marcados dentro del contenedor
    const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
    
    checkedBoxes.forEach(checkbox => {
        selected.push(parseInt(checkbox.value));
    });
    return selected;
}


// ==================== FUNCIONES AUXILIARES (Originales) ====================

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    try {
        return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (e) {
        return dateString; // Devolver el string original si la fecha es inválida
    }
}

// Función para exportar usuarios (para uso de otros módulos)
function getUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios')) || [];
}

// Función para exportar materias (para uso de otros módulos)
function getMaterias() {
    return JSON.parse(localStorage.getItem('materias')) || [];
}