// Funciones principales para gestión de usuarios y materias
function initUsuarios() {
    // Cargar datos iniciales
    loadUsuarios();
    loadMaterias();
    
    // Configurar búsqueda
    setupSearchUsuarios();
    setupSearchMaterias();
    
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
                fechaCreacion: '2025-01-15'
            },
            {
                id: 2,
                nombre: 'Lic. Carlos Hernández López',
                correo: 'carlos.hernandez@juridico.com',
                rol: 'GERENTE',
                activo: true,
                fechaCreacion: '2025-02-10'
            },
            {
                id: 3,
                nombre: 'Lic. Ana Patricia Morales',
                correo: 'ana.morales@juridico.com',
                rol: 'ABOGADO',
                activo: true,
                fechaCreacion: '2025-03-05'
            },
            {
                id: 4,
                nombre: 'Lic. Roberto Silva Martínez',
                correo: 'roberto.silva@juridico.com',
                rol: 'ABOGADO',
                activo: true,
                fechaCreacion: '2025-03-20'
            },
            {
                id: 5,
                nombre: 'Lic. Sandra Jiménez Castro',
                correo: 'sandra.jimenez@juridico.com',
                rol: 'ABOGADO',
                activo: false,
                fechaCreacion: '2025-04-12'
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

function saveUsuario() {
    const id = document.getElementById('usuario-id').value;
    const nombre = document.getElementById('usuario-nombre').value.trim();
    const correo = document.getElementById('usuario-correo').value.trim();
    const contraseña = document.getElementById('usuario-contraseña').value;
    const rol = document.getElementById('usuario-rol').value;
    const activo = document.getElementById('usuario-activo').value === 'true';
    
    // Validaciones
    if (!nombre || !correo || !rol) {
        alert('Por favor, completa todos los campos obligatorios.');
        return;
    }
    
    if (!id && !contraseña) {
        alert('La contraseña es obligatoria para nuevos usuarios.');
        return;
    }
    
    if (contraseña && contraseña.length < 8) {
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
                activo
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

// ==================== FUNCIONES AUXILIARES ====================

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Función para exportar usuarios (para uso de otros módulos)
function getUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios')) || [];
}

// Función para exportar materias (para uso de otros módulos)
function getMaterias() {
    return JSON.parse(localStorage.getItem('materias')) || [];
}