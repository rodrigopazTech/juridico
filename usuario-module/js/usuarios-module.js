/**
 * Usuario Module
 * Manages users, gerencias, and materias functionality
 */
export class UsuarioModule {
  constructor() {
    this.currentTab = 'usuarios';
  }

  init() {
    this.initTabs();
    this.initModalUsuarios();
    this.initModalGerencias();
    this.initModalManageMaterias();
    this.loadUsuarios();
    this.loadGerencias();
    this.setupSearchUsuarios();
    this.setupSearchGerencias();
    this.setupFiltersUsuarios();
    console.log('Usuario Module initialized');
  }

  // ==================== TAB MANAGEMENT ====================
  initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = {
      'usuarios': document.getElementById('content-usuarios'),
      'gerencias': document.getElementById('content-gerencias')
    };

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // Update button styles
        tabButtons.forEach(btn => {
          btn.classList.remove('border-gob-guinda', 'text-gob-guinda', 'font-bold');
          btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        });
        button.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300');
        button.classList.add('border-gob-guinda', 'text-gob-guinda', 'font-bold');
        
        // Update content visibility
        Object.values(tabContents).forEach(content => content.classList.add('hidden'));
        tabContents[targetTab].classList.remove('hidden');
        
        // Load data
        this.currentTab = targetTab;
        if (targetTab === 'usuarios') {
          this.loadUsuarios();
        } else if (targetTab === 'gerencias') {
          this.loadGerencias();
        }
      });
    });
  }

  // ==================== MODAL MANAGEMENT ====================
  initModalUsuarios() {
    const modal = document.getElementById('modal-usuario');
    const btnOpen = document.getElementById('add-usuario');
    const btnClose = document.getElementById('close-modal-usuario');
    const btnCancel = document.getElementById('cancel-usuario');
    const btnSave = document.getElementById('save-usuario');

    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.openUsuarioModal());
    }
    if (btnClose) {
      btnClose.addEventListener('click', () => this.closeModal(modal));
    }
    if (btnCancel) {
      btnCancel.addEventListener('click', () => this.closeModal(modal));
    }
    if (btnSave) {
      btnSave.addEventListener('click', () => this.saveUsuario());
    }
    
    const gerenciaSelect = document.getElementById('usuario-gerencia');
    if (gerenciaSelect) {
      gerenciaSelect.addEventListener('change', () => this.handleGerenciaChange());
    }

    window.addEventListener('click', (event) => {
      if (event.target === modal) this.closeModal(modal);
    });
  }

  initModalGerencias() {
    const modal = document.getElementById('modal-gerencia');
    const btnOpen = document.getElementById('add-gerencia');
    const btnClose = document.getElementById('close-modal-gerencia');
    const btnCancel = document.getElementById('cancel-gerencia');
    const btnSave = document.getElementById('save-gerencia');

    if (btnOpen) {
      btnOpen.addEventListener('click', () => this.openGerenciaModal());
    }
    if (btnClose) {
      btnClose.addEventListener('click', () => this.closeModal(modal));
    }
    if (btnCancel) {
      btnCancel.addEventListener('click', () => this.closeModal(modal));
    }
    if (btnSave) {
      btnSave.addEventListener('click', () => this.saveGerencia());
    }
    
    window.addEventListener('click', (event) => {
      if (event.target === modal) this.closeModal(modal);
    });
  }

  initModalManageMaterias() {
    const modal = document.getElementById('modal-manage-materias');
    const btnClose = document.getElementById('close-modal-manage-materias');
    const btnCloseFooter = document.getElementById('close-modal-manage-materias-footer');
    const form = document.getElementById('form-add-gerencia-materia');
    const btnCancelEdit = document.getElementById('cancel-edit-gerencia-materia-btn');

    if (btnClose) {
      btnClose.addEventListener('click', () => this.closeModal(modal));
    }
    if (btnCloseFooter) {
      btnCloseFooter.addEventListener('click', () => this.closeModal(modal));
    }
    
    window.addEventListener('click', (event) => {
      if (event.target === modal) this.closeModal(modal);
    });
    
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.saveGerenciaMateria();
      });
    }

    if (btnCancelEdit) {
      btnCancelEdit.addEventListener('click', () => this.cancelEditGerenciaMateria());
    }
  }

  closeModal(modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  openModal(modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  // ==================== USUARIOS ====================
  loadUsuarios() {
    const tbody = document.getElementById('usuarios-body');
    if (!tbody) return;

    let usuarios = this.getUsuarios();
    let gerencias = this.getGerencias();

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
      const estadoClass = usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      const estadoText = usuario.activo ? 'Activo' : 'Inactivo';
      const rolBadge = this.getRolBadge(usuario.rol);
      const gerenciaEncontrada = gerencias.find(g => g.id === usuario.gerenciaId);
      const nombreGerencia = gerenciaEncontrada ? gerenciaEncontrada.nombre : '<span class="text-gray-400">Sin asignar</span>';

      html += `
        <tr data-rol="${usuario.rol}" data-activo="${usuario.activo}" class="bg-white hover:bg-gray-50">
          <td class="px-6 py-4 font-medium text-gray-900">${usuario.nombre}</td>
          <td class="px-6 py-4">${usuario.correo}</td>
          <td class="px-6 py-4">${rolBadge}</td>
          <td class="px-6 py-4">${nombreGerencia}</td>
          <td class="px-6 py-4">
            <span class="text-xs font-medium px-2.5 py-0.5 rounded ${estadoClass}">${estadoText}</span>
          </td>
          <td class="px-6 py-4">${this.formatDate(usuario.fechaCreacion)}</td>
          <td class="px-6 py-4 text-center">
            <button class="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors mr-2 edit-usuario" data-id="${usuario.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="inline-flex items-center justify-center w-8 h-8 text-${usuario.activo ? 'yellow' : 'green'}-600 hover:text-white hover:bg-${usuario.activo ? 'yellow' : 'green'}-600 rounded-lg transition-colors toggle-usuario" data-id="${usuario.id}" title="${usuario.activo ? 'Desactivar' : 'Activar'}">
              <i class="fas ${usuario.activo ? 'fa-ban' : 'fa-check'}"></i>
            </button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
    this.setupUsuarioActions();
  }

  getRolBadge(rol) {
    const badges = {
      'SUBDIRECTOR': '<span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Subdirector</span>',
      'GERENTE': '<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Gerente</span>',
      'ABOGADO': '<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Abogado</span>'
    };
    return badges[rol] || '<span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Sin rol</span>';
  }

  setupUsuarioActions() {
    document.querySelectorAll('.edit-usuario').forEach(button => {
      button.addEventListener('click', () => {
        const id = parseInt(button.getAttribute('data-id'));
        const usuarios = this.getUsuarios();
        const usuario = usuarios.find(u => u.id === id);
        if (usuario) {
          this.openUsuarioModal(usuario);
        }
      });
    });

    document.querySelectorAll('.toggle-usuario').forEach(button => {
      button.addEventListener('click', () => {
        const id = parseInt(button.getAttribute('data-id'));
        this.toggleUsuarioStatus(id);
      });
    });
  }

  toggleUsuarioStatus(id) {
    let usuarios = this.getUsuarios();
    const usuarioIndex = usuarios.findIndex(u => u.id === id);
    if (usuarioIndex !== -1) {
      usuarios[usuarioIndex].activo = !usuarios[usuarioIndex].activo;
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
      alert(`Usuario ${usuarios[usuarioIndex].activo ? 'activado' : 'desactivado'} exitosamente.`);
      this.loadUsuarios();
    }
  }

  openUsuarioModal(usuario = null) {
    const modal = document.getElementById('modal-usuario');
    const title = document.getElementById('modal-usuario-title');
    const form = document.getElementById('form-usuario');
    
    const materiasGroup = document.getElementById('usuario-materias-group');
    const materiasContainer = document.getElementById('usuario-materias-checkbox-container');
    materiasGroup.style.display = 'none';
    materiasContainer.innerHTML = '';

    this.populateGerenciasSelect('usuario-gerencia', usuario ? usuario.gerenciaId : null);

    if (usuario) {
      title.innerHTML = '<i class="fas fa-user-edit"></i> Editar Usuario';
      document.getElementById('usuario-id').value = usuario.id;
      document.getElementById('usuario-nombre').value = usuario.nombre;
      document.getElementById('usuario-correo').value = usuario.correo;
      document.getElementById('usuario-contraseña').required = false;
      document.getElementById('usuario-contraseña').placeholder = "Dejar en blanco para no cambiar";
      document.getElementById('usuario-rol').value = usuario.rol;
      document.getElementById('usuario-activo').value = usuario.activo.toString();
      
      if(usuario.gerenciaId) {
        this.handleGerenciaChange(usuario.materias || []);
      }
    } else {
      title.innerHTML = '<i class="fas fa-user-plus"></i> Nuevo Usuario';
      form.reset();
      document.getElementById('usuario-contraseña').required = true;
      document.getElementById('usuario-contraseña').placeholder = "Mínimo 8 caracteres";
      document.getElementById('usuario-activo').value = 'true';
      document.getElementById('usuario-gerencia').value = '';
    }
    
    this.openModal(modal);
  }

  saveUsuario() {
    const id = document.getElementById('usuario-id').value;
    const nombre = document.getElementById('usuario-nombre').value.trim();
    const correo = document.getElementById('usuario-correo').value.trim();
    const contraseña = document.getElementById('usuario-contraseña').value;
    const rol = document.getElementById('usuario-rol').value;
    const activo = document.getElementById('usuario-activo').value === 'true';
    const gerenciaId = document.getElementById('usuario-gerencia').value;
    const materias = this.getSelectedCheckboxValues('usuario-materias-checkbox-container');

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

    let usuarios = this.getUsuarios();
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
    this.closeModal(document.getElementById('modal-usuario'));
    this.loadUsuarios();
  }

  setupSearchUsuarios() {
    const searchInput = document.getElementById('search-usuarios');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const searchTerm = searchInput.value.toLowerCase();
      const rows = document.querySelectorAll('#usuarios-body tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    });
  }

  setupFiltersUsuarios() {
    const filters = ['filter-rol', 'filter-activo'];
    filters.forEach(filterId => {
      const filter = document.getElementById(filterId);
      if (filter) {
        filter.addEventListener('change', () => this.applyFiltersUsuarios());
      }
    });
  }

  applyFiltersUsuarios() {
    const rol = document.getElementById('filter-rol').value;
    const activo = document.getElementById('filter-activo').value;
    const rows = document.querySelectorAll('#usuarios-body tr');

    rows.forEach(row => {
      const rowRol = row.getAttribute('data-rol') || '';
      const rowActivo = row.getAttribute('data-activo') || '';
      const matchesRol = !rol || rowRol === rol;
      const matchesActivo = !activo || rowActivo === activo;
      row.style.display = (matchesRol && matchesActivo) ? '' : 'none';
    });
  }

  handleGerenciaChange(selectedMateriaIds = []) {
    const gerenciaSelect = document.getElementById('usuario-gerencia');
    const materiasGroup = document.getElementById('usuario-materias-group');
    const materiasContainer = document.getElementById('usuario-materias-checkbox-container');

    const selectedGerenciaId = gerenciaSelect.value;

    if (!selectedGerenciaId) {
      materiasGroup.style.display = 'none';
      materiasContainer.innerHTML = '';
      return;
    }

    const gerencia = this.getGerencias().find(g => g.id == selectedGerenciaId);

    if (!gerencia || !gerencia.materias) {
      console.error('No se encontró la gerencia o no tiene materias:', selectedGerenciaId);
      materiasGroup.style.display = 'none';
      materiasContainer.innerHTML = '';
      return;
    }

    const materiasDeLaGerencia = gerencia.materias;

    materiasContainer.innerHTML = '';
    const selectedIdsStr = selectedMateriaIds.map(String);

    if (materiasDeLaGerencia.length === 0) {
      materiasContainer.innerHTML = '<p class="text-gray-500 text-sm">Esta gerencia no tiene materias asignadas.</p>';
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

    materiasGroup.style.display = 'block';
  }

  // ==================== GERENCIAS ====================
  loadGerencias() {
    const tbody = document.getElementById('gerencias-body');
    if (!tbody) return;

    let gerencias = this.getGerencias();
    
    if (!localStorage.getItem('nextMateriaId')) {
      localStorage.setItem('nextMateriaId', '11');
    }

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
      const materiasNombres = gerencia.materias && gerencia.materias.length > 0
        ? gerencia.materias.map(m => m.nombre).join(', ')
        : 'Sin materias asignadas';

      html += `
        <tr data-nombre="${gerencia.nombre.toLowerCase()}" class="bg-white hover:bg-gray-50">
          <td class="px-6 py-4 font-medium text-gray-900">${gerencia.id}</td>
          <td class="px-6 py-4">${gerencia.nombre}</td>
          <td class="px-6 py-4 text-gray-600">${materiasNombres}</td>
          <td class="px-6 py-4 text-center">
            <button class="inline-flex items-center justify-center w-8 h-8 text-gob-oro hover:text-white hover:bg-gob-oro rounded-lg transition-colors mr-2 view-gerencia-materias" data-id="${gerencia.id}" title="Gestionar Materias">
              <i class="fas fa-tasks"></i>
            </button>
            <button class="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition-colors mr-2 edit-gerencia" data-id="${gerencia.id}" title="Editar Nombre">
              <i class="fas fa-edit"></i>
            </button>
            <button class="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-colors delete-gerencia" data-id="${gerencia.id}" title="Eliminar Gerencia">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
    
    tbody.innerHTML = html;
    this.setupGerenciaActions();
  }

  setupGerenciaActions() {
    document.querySelectorAll('.view-gerencia-materias').forEach(button => {
      button.addEventListener('click', () => {
        const id = parseInt(button.getAttribute('data-id'));
        this.openManageMateriasModal(id);
      });
    });

    document.querySelectorAll('.edit-gerencia').forEach(button => {
      button.addEventListener('click', () => {
        const id = parseInt(button.getAttribute('data-id'));
        const gerencia = this.getGerencias().find(g => g.id === id);
        if (gerencia) {
          this.openGerenciaModal(gerencia);
        }
      });
    });

    document.querySelectorAll('.delete-gerencia').forEach(button => {
      button.addEventListener('click', () => {
        const id = parseInt(button.getAttribute('data-id'));
        if (confirm('¿Estás seguro de que deseas eliminar esta gerencia? Se eliminarán todas sus materias y los usuarios asignados podrían perder su configuración.')) {
          this.deleteGerencia(id);
        }
      });
    });
  }

  openGerenciaModal(gerencia = null) {
    const modal = document.getElementById('modal-gerencia');
    const title = document.getElementById('modal-gerencia-title');
    const form = document.getElementById('form-gerencia');
    form.reset();

    if (gerencia) {
      title.innerHTML = '<i class="fas fa-building-edit"></i> Editar Gerencia';
      document.getElementById('gerencia-id').value = gerencia.id;
      document.getElementById('gerencia-nombre').value = gerencia.nombre;
    } else {
      title.innerHTML = '<i class="fas fa-building"></i> Nueva Gerencia';
      document.getElementById('gerencia-id').value = '';
    }
    
    this.openModal(modal);
  }

  saveGerencia() {
    const id = document.getElementById('gerencia-id').value;
    const nombre = document.getElementById('gerencia-nombre').value.trim();

    if (!nombre) {
      alert('Por favor, complete el nombre.');
      return;
    }

    let gerencias = this.getGerencias();
    
    const existing = gerencias.find(g => g.nombre.toLowerCase() === nombre.toLowerCase() && g.id.toString() !== id);
    if (existing) {
      alert('Ya existe una gerencia con este nombre.');
      return;
    }

    if (id) {
      const gerenciaIndex = gerencias.findIndex(g => g.id === parseInt(id));
      if (gerenciaIndex !== -1) {
        gerencias[gerenciaIndex].nombre = nombre;
      }
      alert('Gerencia actualizada exitosamente.');
    } else {
      const newId = gerencias.length ? Math.max(...gerencias.map(g => g.id)) + 1 : 1;
      const newGerencia = {
        id: newId,
        nombre,
        materias: []
      };
      gerencias.push(newGerencia);
      alert('Gerencia creada exitosamente. Ahora puede añadirle materias.');
    }

    localStorage.setItem('gerencias', JSON.stringify(gerencias));
    this.closeModal(document.getElementById('modal-gerencia'));
    this.loadGerencias();
  }

  deleteGerencia(id) {
    const usuarios = this.getUsuarios();
    const usuarioUsandoGerencia = usuarios.find(u => u.gerenciaId == id);
    if(usuarioUsandoGerencia) {
      alert('No se puede eliminar esta gerencia porque está asignada al usuario: ' + usuarioUsandoGerencia.nombre);
      return;
    }

    let gerencias = this.getGerencias().filter(g => g.id !== id);
    localStorage.setItem('gerencias', JSON.stringify(gerencias));
    alert('Gerencia eliminada exitosamente.');
    this.loadGerencias();
  }

  setupSearchGerencias() {
    const searchInput = document.getElementById('search-gerencias');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
      const searchTerm = searchInput.value.toLowerCase();
      const rows = document.querySelectorAll('#gerencias-body tr');
      rows.forEach(row => {
        const nombre = row.getAttribute('data-nombre') || '';
        row.style.display = (nombre.includes(searchTerm) || row.textContent.toLowerCase().includes(searchTerm)) ? '' : 'none';
      });
    });
  }

  // ==================== MATERIAS MANAGEMENT ====================
  openManageMateriasModal(gerenciaId) {
    const modal = document.getElementById('modal-manage-materias');
    const gerencia = this.getGerencias().find(g => g.id == gerenciaId);
    
    if (!gerencia) {
      alert('Error: No se encontró la gerencia.');
      return;
    }
    
    document.getElementById('manage-materias-gerencia-id').value = gerenciaId;
    document.getElementById('manage-materias-gerencia-nombre').textContent = `Gerencia: ${gerencia.nombre}`;
    
    this.cancelEditGerenciaMateria();
    this.loadGerenciaMaterias(gerenciaId);
    
    this.openModal(modal);
  }

  loadGerenciaMaterias(gerenciaId) {
    const gerencia = this.getGerencias().find(g => g.id == gerenciaId);
    const tbody = document.getElementById('gerencia-materias-body');
    
    if (!gerencia || !tbody) {
      tbody.innerHTML = '<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">Error al cargar materias.</td></tr>';
      return;
    }
    
    let html = '';
    if (gerencia.materias.length === 0) {
      html = '<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">Esta gerencia aún no tiene materias. Añada una abajo.</td></tr>';
    } else {
      gerencia.materias.forEach(materia => {
        html += `
          <tr class="bg-white hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">${materia.id}</td>
            <td class="px-6 py-4">${materia.nombre}</td>
            <td class="px-6 py-4 text-center">
              <button class="text-blue-600 hover:text-blue-900 mr-3 edit-gerencia-materia" data-id="${materia.id}" data-nombre="${materia.nombre}" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="text-red-600 hover:text-red-900 delete-gerencia-materia" data-id="${materia.id}" title="Eliminar">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      });
    }
    tbody.innerHTML = html;
    
    this.setupGerenciaMateriasActions(gerenciaId);
  }

  setupGerenciaMateriasActions(gerenciaId) {
    document.querySelectorAll('.edit-gerencia-materia').forEach(button => {
      button.addEventListener('click', () => {
        const materiaId = button.getAttribute('data-id');
        const materiaNombre = button.getAttribute('data-nombre');
        
        document.getElementById('manage-materias-materia-id').value = materiaId;
        document.getElementById('add-materia-nombre').value = materiaNombre;
        document.getElementById('save-gerencia-materia-btn').innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        document.getElementById('cancel-edit-gerencia-materia-btn').style.display = 'inline-block';
      });
    });
    
    document.querySelectorAll('.delete-gerencia-materia').forEach(button => {
      button.addEventListener('click', () => {
        const materiaId = parseInt(button.getAttribute('data-id'));
        if (confirm('¿Está seguro de eliminar esta materia? Los usuarios que la tengan asignada la perderán.')) {
          this.deleteGerenciaMateria(gerenciaId, materiaId);
        }
      });
    });
  }

  cancelEditGerenciaMateria() {
    document.getElementById('manage-materias-materia-id').value = '';
    document.getElementById('add-materia-nombre').value = '';
    document.getElementById('save-gerencia-materia-btn').innerHTML = '<i class="fas fa-plus"></i> Añadir Materia';
    document.getElementById('cancel-edit-gerencia-materia-btn').style.display = 'none';
  }

  saveGerenciaMateria() {
    const gerenciaId = parseInt(document.getElementById('manage-materias-gerencia-id').value);
    const materiaId = document.getElementById('manage-materias-materia-id').value;
    const nombre = document.getElementById('add-materia-nombre').value.trim();

    if (!nombre) {
      alert('El nombre de la materia no puede estar vacío.');
      return;
    }
    
    let gerencias = this.getGerencias();
    const gerenciaIndex = gerencias.findIndex(g => g.id === gerenciaId);
    if (gerenciaIndex === -1) {
      alert('Error: No se encontró la gerencia.');
      return;
    }
    
    const gerencia = gerencias[gerenciaIndex];
    
    const duplicado = gerencia.materias.find(
      m => m.nombre.toLowerCase() === nombre.toLowerCase() && m.id.toString() !== materiaId
    );
    if (duplicado) {
      alert('Ya existe una materia con este nombre en esta gerencia.');
      return;
    }
    
    if (materiaId) {
      // Edit mode
      const materiaIndex = gerencia.materias.findIndex(m => m.id == materiaId);
      if (materiaIndex !== -1) {
        gerencias[gerenciaIndex].materias[materiaIndex].nombre = nombre;
      }
    } else {
      // Create mode
      let nextMateriaId = parseInt(localStorage.getItem('nextMateriaId') || '11');
      const newMateria = {
        id: nextMateriaId,
        nombre: nombre
      };
      gerencias[gerenciaIndex].materias.push(newMateria);
      localStorage.setItem('nextMateriaId', nextMateriaId + 1);
    }
    
    localStorage.setItem('gerencias', JSON.stringify(gerencias));
    
    this.loadGerenciaMaterias(gerenciaId);
    this.cancelEditGerenciaMateria();
    this.loadGerencias();
  }

  deleteGerenciaMateria(gerenciaId, materiaId) {
    let gerencias = this.getGerencias();
    const gerenciaIndex = gerencias.findIndex(g => g.id === gerenciaId);
    if (gerenciaIndex === -1) return;
    
    gerencias[gerenciaIndex].materias = gerencias[gerenciaIndex].materias.filter(
      m => m.id !== materiaId
    );
    
    localStorage.setItem('gerencias', JSON.stringify(gerencias));
    
    this.loadGerenciaMaterias(gerenciaId);
    this.loadGerencias();
  }

  // ==================== UTILITY FUNCTIONS ====================
  populateGerenciasSelect(selectElementId, selectedGerenciaId = null) {
    const gerencias = this.getGerencias();
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

  getSelectedCheckboxValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const selected = [];
    const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
    checkedBoxes.forEach(checkbox => {
      selected.push(parseInt(checkbox.value));
    });
    return selected;
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch (e) {
      return dateString;
    }
  }

  getUsuarios() {
    return JSON.parse(localStorage.getItem('usuarios')) || [];
  }

  getGerencias() {
    return JSON.parse(localStorage.getItem('gerencias')) || [];
  }
}
