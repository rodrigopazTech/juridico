// Funciones principales para gestión de usuarios y materias
function initUsuarios() {
    // Cargar datos iniciales
    loadUsuarios();
    loadGerencias(); 
    
    // Configurar búsqueda
    setupSearchUsuarios();
    setupSearchGerencias(); 
    
    // Configurar filtros
    setupFiltersUsuarios();
    
    console.log('Módulo de usuarios inicializado');
}

// ==================== GESTIÓN DE USUARIOS ====================

function loadUsuarios() {
    // ... (Esta función no cambia) ...
    const tbody = document.getElementById('usuarios-body');
    if (!tbody) return;
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.length === 0) {
        usuarios = [
            { id: 1, nombre: 'Lic. María González Ruiz', correo: 'maria.gonzalez@juridico.com', rol: 'SUBDIRECTOR', activo: true, fechaCreacion: '2025-01-15', gerenciaId: 1, materias: [1, 4] },
            { id: 2, nombre: 'Lic. Carlos Hernández López', correo: 'carlos.hernandez@juridico.com', rol: 'GERENTE', activo: true, fechaCreacion: '2025-02-10', gerenciaId: 1, materias: [1, 4, 5, 7] },
            { id: 3, nombre: 'Lic. Ana Patricia Morales', correo: 'ana.morales@juridico.com', rol: 'ABOGADO', activo: true, fechaCreacion: '2025-03-05', gerenciaId: 2, materias: [3] },
            { id: 4, nombre: 'Lic. Roberto Silva Martínez', correo: 'roberto.silva@juridico.com', rol: 'ABOGADO', activo: true, fechaCreacion: '2025-03-20', gerenciaId: 2, materias: [2, 3] },
            { id: 5, nombre: 'Lic. Sandra Jiménez Castro', correo: 'sandra.jimenez@juridico.com', rol: 'ABOGADO', activo: false, fechaCreacion: '2025-04-12', gerenciaId: 3, materias: [9] }
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
    setupUsuarioActions();
}

function getRolBadge(rol) {
    // ... (Esta función no cambia) ...
    const badges = {
        'SUBDIRECTOR': '<span class="badge badge-danger">Subdirector</span>',
        'GERENTE': '<span class="badge badge-warning">Gerente</span>',
        'ABOGADO': '<span class="badge badge-primary">Abogado</span>'
    };
    return badges[rol] || '<span class="badge badge-secondary">Sin rol</span>';
}

function setupUsuarioActions() {
    // ... (Esta función no cambia) ...
    document.querySelectorAll('.edit-usuario').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usuario = usuarios.find(u => u.id === id);
            if (usuario) {
                openUsuarioModal(usuario);
            }
        });
    });
    document.querySelectorAll('.toggle-usuario').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            toggleUsuarioStatus(id);
        });
    });
}

function toggleUsuarioStatus(id) {
    // ... (Esta función no cambia) ...
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioIndex = usuarios.findIndex(u => u.id === id);
    if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].activo = !usuarios[usuarioIndex].activo;
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        alert(`Usuario ${usuarios[usuarioIndex].activo ? 'activado' : 'desactivado'} exitosamente.`);
        loadUsuarios();
    }
}

// Función saveUsuario (Sin cambios, sigue funcionando)
function saveUsuario() {
    const id = document.getElementById('usuario-id').value;
    const nombre = document.getElementById('usuario-nombre').value.trim();
    const correo = document.getElementById('usuario-correo').value.trim();
    const contraseña = document.getElementById('usuario-contraseña').value;
    const rol = document.getElementById('usuario-rol').value;
    const activo = document.getElementById('usuario-activo').value === 'true';
    const gerenciaId = document.getElementById('usuario-gerencia').value;
    const materias = getSelectedCheckboxValues('usuario-materias-checkbox-container');
    if (!nombre || !correo || !rol || !gerenciaId) {
        alert('Por favor, completa todos los campos obligatorios (Nombre, Correo, Rol, Gerencia).');
        return;
    }
    const materiasGroup = document.getElementById('usuario-materias-group');
    if (materiasGroup.style.display === 'block' && materias.length === 0) {
        alert('Debe seleccionar al menos una materia para la gerencia elegida.');
        return;
    }
    if (!id && !contraseña) {
        alert('La contraseña es obligatoria para nuevos usuarios.');
        return;
    }
    if (contraseña && contraseña.length < 8 && id === "") {
        alert('La contraseña debe tener al menos 8 caracteres.');
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        alert('Por favor, ingresa un correo electrónico válido.');
        return;
    }
    let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const existingUser = usuarios.find(u => u.correo === correo && u.id.toString() !== id);
    if (existingUser) {
        alert('Ya existe un usuario con este correo electrónico.');
        return;
    }
    if (id) {
        const usuarioIndex = usuarios.findIndex(u => u.id === parseInt(id));
        if (usuarioIndex !== -1) {
            usuarios[usuarioIndex] = {
                ...usuarios[usuarioIndex],
                nombre, correo, rol, activo,
                gerenciaId: parseInt(gerenciaId),
                materias: materias
            };
            if (contraseña) {
                usuarios[usuarioIndex].contraseña = contraseña;
            }
        }
        alert('Usuario actualizado exitosamente.');
    } else {
        const newId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
        const newUser = {
            id: newId, nombre, correo, contraseña, rol, activo,
            gerenciaId: parseInt(gerenciaId),
            materias: materias,
            fechaCreacion: new Date().toISOString().split('T')[0]
        };
        usuarios.push(newUser);
        alert('Usuario creado exitosamente.');
    }
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    document.getElementById('modal-usuario').style.display = 'none';
    loadUsuarios();
}

function setupSearchUsuarios() {
    // ... (Esta función no cambia) ...
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
    // ... (Esta función no cambia) ...
    const filters = ['filter-rol', 'filter-activo'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', applyFiltersUsuarios);
        }
    });
}

function applyFiltersUsuarios() {
    // ... (Esta función no cambia) ...
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

// ==================== GESTIÓN DE MATERIAS (GLOBAL - ELIMINADA) ====================
// (Todo el bloque de loadMaterias, saveMateria, etc., ha sido eliminado)


// ==================== GESTIÓN DE GERENCIAS (MODIFICADA) ================

function getGerencias() {
    return JSON.parse(localStorage.getItem('gerencias')) || [];
}

// Función loadGerencias (MODIFICADA)
function loadGerencias() {
    const tbody = document.getElementById('gerencias-body');
    if (!tbody) return;

    let gerencias = getGerencias();
    
    // Generar un ID global para las materias
    if (!localStorage.getItem('nextMateriaId')) {
        localStorage.setItem('nextMateriaId', '11'); // Empezar en 11 (después de los datos de ejemplo)
    }

    // Datos de ejemplo (MODIFICADOS: materias es un array de objetos)
    if (gerencias.length === 0) {
        gerencias = [
            { id: 1, nombre: 'Gerencia de Civil, Mercantil, Fiscal y Administrativo', 
              materias: [
                { id: 1, nombre: 'Civil' },
                { id: 4, nombre: 'Mercantil' },
                { id: 5, nombre: 'Fiscal' },
                { id: 7, nombre: 'Administrativo' }
              ] 
            },
            { id: 2, nombre: 'Gerencia Laboral y Penal', 
              materias: [
                { id: 2, nombre: 'Penal' },
                { id: 3, nombre: 'Laboral' }
              ] 
            },
            { id: 3, nombre: 'Gerencia de Transparencia y Amparo', 
              materias: [
                { id: 9, nombre: 'Amparo' },
                { id: 10, nombre: 'Transparencia' }
              ] 
            }
        ];
        localStorage.setItem('gerencias', JSON.stringify(gerencias));
    }

    let html = '';
    gerencias.forEach(gerencia => {
        // Mapear el array de objetos de materias a un string de nombres
        const materiasNombres = gerencia.materias && gerencia.materias.length > 0
            ? gerencia.materias.map(m => m.nombre).join(', ')
            : 'Sin materias asignadas';

        html += `
            <tr data-nombre="${gerencia.nombre.toLowerCase()}">
                <td>${gerencia.id}</td>
                <td>${gerencia.nombre}</td>
                <td>${materiasNombres}</td>
                <td class="actions">
                    <button class="btn btn-info btn-sm view-gerencia-materias" data-id="${gerencia.id}" title="Gestionar Materias">
                        <i class="fas fa-tasks"></i>
                    </button>
                    <button class="btn btn-primary btn-sm edit-gerencia" data-id="${gerencia.id}" title="Editar Nombre">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm delete-gerencia" data-id="${gerencia.id}" title="Eliminar Gerencia">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
    setupGerenciaActions();
}

// Función setupGerenciaActions (MODIFICADA)
function setupGerenciaActions() {
    // NUEVO: Listener para el botón "Ver Materias"
    document.querySelectorAll('.view-gerencia-materias').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            openManageMateriasModal(id); // Función del script inline
        });
    });

    // Botón de editar (solo edita nombre)
    document.querySelectorAll('.edit-gerencia').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const gerencia = getGerencias().find(g => g.id === id);
            if (gerencia) {
                openGerenciaModal(gerencia); // Función del script inline
            }
        });
    });

    // Botón de eliminar
    document.querySelectorAll('.delete-gerencia').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            if (confirm('¿Estás seguro de que deseas eliminar esta gerencia? Se eliminarán todas sus materias y los usuarios asignados podrían perder su configuración.')) {
                deleteGerencia(id);
            }
        });
    });
}

// Función saveGerencia (SIMPLIFICADA)
function saveGerencia() {
    const id = document.getElementById('gerencia-id').value;
    const nombre = document.getElementById('gerencia-nombre').value.trim();

    if (!nombre) {
        alert('Por favor, complete el nombre.');
        return;
    }

    let gerencias = getGerencias();
    
    const existing = gerencias.find(g => g.nombre.toLowerCase() === nombre.toLowerCase() && g.id.toString() !== id);
    if (existing) {
        alert('Ya existe una gerencia con este nombre.');
        return;
    }

    if (id) {
        // Editar (solo el nombre)
        const gerenciaIndex = gerencias.findIndex(g => g.id === parseInt(id));
        if (gerenciaIndex !== -1) {
            gerencias[gerenciaIndex].nombre = nombre;
            // No se tocan las materias
        }
        alert('Gerencia actualizada exitosamente.');
    } else {
        // Crear (con materias vacías)
        const newId = gerencias.length ? Math.max(...gerencias.map(g => g.id)) + 1 : 1;
        const newGerencia = {
            id: newId,
            nombre,
            materias: [] // Se crea con materias vacías
        };
        gerencias.push(newGerencia);
        alert('Gerencia creada exitosamente. Ahora puede añadirle materias.');
    }

    localStorage.setItem('gerencias', JSON.stringify(gerencias));
    document.getElementById('modal-gerencia').style.display = 'none';
    loadGerencias();
}

function deleteGerencia(id) {
    // ... (Validación sin cambios) ...
    const usuarios = getUsuarios();
    const usuarioUsandoGerencia = usuarios.find(u => u.gerenciaId == id);
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
    // ... (Esta función no cambia) ...
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


// ===================================================================
// ================= NUEVA SECCIÓN: GESTIÓN DE MATERIAS POR GERENCIA =
// ===================================================================

/**
 * Carga la tabla de materias dentro del modal de gestión.
 * @param {number} gerenciaId El ID de la gerencia a cargar.
 */
function loadGerenciaMaterias(gerenciaId) {
    const gerencia = getGerencias().find(g => g.id == gerenciaId);
    const tbody = document.getElementById('gerencia-materias-body');
    
    if (!gerencia || !tbody) {
        tbody.innerHTML = '<tr><td colspan="3">Error al cargar materias.</td></tr>';
        return;
    }
    
    let html = '';
    if (gerencia.materias.length === 0) {
        html = '<tr><td colspan="3">Esta gerencia aún no tiene materias. Añada una abajo.</td></tr>';
    } else {
        gerencia.materias.forEach(materia => {
            html += `
                <tr>
                    <td>${materia.id}</td>
                    <td>${materia.nombre}</td>
                    <td class="actions">
                        <button class="btn btn-primary btn-sm edit-gerencia-materia" data-id="${materia.id}" data-nombre="${materia.nombre}" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-gerencia-materia" data-id="${materia.id}" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    tbody.innerHTML = html;
    
    // Configurar los botones de esta tabla
    setupGerenciaMateriasActions(gerenciaId);
}

/**
 * Configura los botones de Editar y Eliminar dentro del modal de gestión.
 * @param {number} gerenciaId El ID de la gerencia actual.
 */
function setupGerenciaMateriasActions(gerenciaId) {
    // Botones de Editar
    document.querySelectorAll('.edit-gerencia-materia').forEach(button => {
        button.addEventListener('click', function() {
            const materiaId = this.getAttribute('data-id');
            const materiaNombre = this.getAttribute('data-nombre');
            
            // Poner el modal en "modo edición"
            document.getElementById('manage-materias-materia-id').value = materiaId;
            document.getElementById('add-materia-nombre').value = materiaNombre;
            document.getElementById('save-gerencia-materia-btn').innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
            document.getElementById('cancel-edit-gerencia-materia-btn').style.display = 'inline-block';
        });
    });
    
    // Botones de Eliminar
    document.querySelectorAll('.delete-gerencia-materia').forEach(button => {
        button.addEventListener('click', function() {
            const materiaId = parseInt(this.getAttribute('data-id'));
            if (confirm(`¿Está seguro de eliminar esta materia? Los usuarios que la tengan asignada la perderán.`)) {
                deleteGerenciaMateria(gerenciaId, materiaId);
            }
        });
    });
}

/**
 * Resetea el formulario del modal de gestión a "modo añadir".
 */
function cancelEditGerenciaMateria() {
    document.getElementById('manage-materias-materia-id').value = '';
    document.getElementById('add-materia-nombre').value = '';
    document.getElementById('save-gerencia-materia-btn').innerHTML = '<i class="fas fa-plus"></i> Añadir Materia';
    document.getElementById('cancel-edit-gerencia-materia-btn').style.display = 'none';
}

/**
 * Guarda (añade o edita) una materia para una gerencia específica.
 */
function saveGerenciaMateria() {
    const gerenciaId = parseInt(document.getElementById('manage-materias-gerencia-id').value);
    const materiaId = document.getElementById('manage-materias-materia-id').value; // Puede ser string vacío o un ID
    const nombre = document.getElementById('add-materia-nombre').value.trim();

    if (!nombre) {
        alert('El nombre de la materia no puede estar vacío.');
        return;
    }
    
    let gerencias = getGerencias();
    const gerenciaIndex = gerencias.findIndex(g => g.id === gerenciaId);
    if (gerenciaIndex === -1) {
        alert('Error: No se encontró la gerencia.');
        return;
    }
    
    const gerencia = gerencias[gerenciaIndex];
    
    // Validar nombre duplicado DENTRO de esta gerencia
    const duplicado = gerencia.materias.find(
        m => m.nombre.toLowerCase() === nombre.toLowerCase() && m.id.toString() !== materiaId
    );
    if (duplicado) {
        alert('Ya existe una materia con este nombre en esta gerencia.');
        return;
    }
    
    if (materiaId) {
        // --- Modo Edición ---
        const materiaIndex = gerencia.materias.findIndex(m => m.id == materiaId);
        if (materiaIndex !== -1) {
            gerencias[gerenciaIndex].materias[materiaIndex].nombre = nombre;
        }
    } else {
        // --- Modo Creación ---
        // Obtener y actualizar el ID global
        let nextMateriaId = parseInt(localStorage.getItem('nextMateriaId') || '11');
        const newMateria = {
            id: nextMateriaId,
            nombre: nombre
        };
        gerencias[gerenciaIndex].materias.push(newMateria);
        localStorage.setItem('nextMateriaId', nextMateriaId + 1); // Incrementar para la próxima vez
    }
    
    // Guardar cambios en localStorage
    localStorage.setItem('gerencias', JSON.stringify(gerencias));
    
    // Recargar la tabla y resetear el formulario
    loadGerenciaMaterias(gerenciaId);
    cancelEditGerenciaMateria();
    
    // Recargar la tabla principal de gerencias para que muestre la lista actualizada
    loadGerencias();
}

/**
 * Elimina una materia de una gerencia específica.
 * @param {number} gerenciaId El ID de la gerencia.
 * @param {number} materiaId El ID de la materia a eliminar.
 */
function deleteGerenciaMateria(gerenciaId, materiaId) {
    let gerencias = getGerencias();
    const gerenciaIndex = gerencias.findIndex(g => g.id === gerenciaId);
    if (gerenciaIndex === -1) return;
    
    // Filtrar la materia a eliminar
    gerencias[gerenciaIndex].materias = gerencias[gerenciaIndex].materias.filter(
        m => m.id !== materiaId
    );
    
    // TODO: Opcional: Eliminar esta materia de todos los usuarios que la tengan.
    // (Por ahora, el usuario simplemente ya no la verá disponible)
    
    localStorage.setItem('gerencias', JSON.stringify(gerencias));
    
    // Recargar la tabla del modal
    loadGerenciaMaterias(gerenciaId);
    
    // Recargar la tabla principal
    loadGerencias();
}


// ================================================================
// ==================== FUNCIONES AUXILIARES (MODIFICADAS) =
// ================================================================

// populateAllMateriasCheckboxes(); // ELIMINADA

// populateGerenciasSelect (Sin cambios, sigue siendo necesaria)
function populateGerenciasSelect(selectElementId, selectedGerenciaId = null) {
    const gerencias = getGerencias(); 
    const select = document.getElementById(selectElementId);
    const placeholder = select.querySelector('option[value=""]');
    select.innerHTML = '';
    if (placeholder) {
        select.appendChild(placeholder);
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

// ================================================================
// ============= handleGerenciaChange (MODIFICADA) ================
// ================================================================
/**
 * Maneja el evento de cambio en el selector de gerencias del modal de usuario.
 * Muestra y puebla el contenedor de checkboxes correspondiente.
 * AHORA LEE LAS MATERIAS DEL OBJETO GERENCIA.
 */
function handleGerenciaChange(event, selectedMateriaIds = []) {
    const gerenciaSelect = document.getElementById('usuario-gerencia');
    const materiasGroup = document.getElementById('usuario-materias-group');
    const materiasContainer = document.getElementById('usuario-materias-checkbox-container');

    const selectedGerenciaId = gerenciaSelect.value;

    if (!selectedGerenciaId) {
        materiasGroup.style.display = 'none';
        materiasContainer.innerHTML = '';
        return;
    }

    // --- LÓGICA MODIFICADA ---
    // Ya no hay getMaterias() global. Se busca la gerencia y se usan sus materias.
    const gerencia = getGerencias().find(g => g.id == selectedGerenciaId);

    if (!gerencia || !gerencia.materias) {
        console.error('No se encontró la gerencia o no tiene materias:', selectedGerenciaId);
        materiasGroup.style.display = 'none';
        materiasContainer.innerHTML = '';
        return;
    }

    // Usar el array de materias *de la gerencia*
    const materiasDeLaGerencia = gerencia.materias;
    // --- FIN DE LÓGICA MODIFICADA ---

    // Poblar el contenedor de checkboxes (esta lógica es la misma)
    materiasContainer.innerHTML = '';
    const selectedIdsStr = selectedMateriaIds.map(String); 

    if (materiasDeLaGerencia.length === 0) {
        materiasContainer.innerHTML = '<p style="color: #888; margin: 0;">Esta gerencia no tiene materias asignadas.</p>';
    } else {
        materiasDeLaGerencia.forEach(materia => {
            const div = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `materia-chk-usuario-${materia.id}`;
            checkbox.value = materia.id;
            checkbox.name = 'usuario-materia';
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
    }

    // Mostrar el grupo
    materiasGroup.style.display = 'block';
}

// getSelectedCheckboxValues (Sin cambios, sigue siendo necesaria)
function getSelectedCheckboxValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const selected = [];
    const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
    checkedBoxes.forEach(checkbox => {
        selected.push(parseInt(checkbox.value));
    });
    return selected;
}

// ==================== FUNCIONES AUXILIARES (Originales) ====================
function formatDate(dateString) {
    // ... (Esta función no cambia) ...
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    try {
        return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (e) {
        return dateString;
    }
}

function getUsuarios() {
    // ... (Esta función no cambia) ...
    return JSON.parse(localStorage.getItem('usuarios')) || [];
}

// getMaterias(); // ELIMINADA