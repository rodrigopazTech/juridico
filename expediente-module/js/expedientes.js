import { loadExpedientes, filterExpedientes, createExpediente } from '../data/expedientes-data.js';

export class ExpedientesModule {
  constructor(opts = {}) {
    this.root = opts.root || document;
    this.listContainer = this.root.querySelector('#expedientes-list');
    this.emptyState = this.root.querySelector('#expedientes-empty-state');
    this.searchInput = this.root.querySelector('#expediente-search');
    this.createBtn = this.root.querySelector('#expediente-nuevo');
    this.emptyCreateBtn = this.root.querySelector('#empty-create-expediente');
    
    // Modal elements
    this.modal = this.root.querySelector('#modal-create-expediente');
    this.closeModalBtn = this.root.querySelector('#close-create-expediente');
    this.cancelModalBtn = this.root.querySelector('#cancel-create-expediente');
    this.form = this.root.querySelector('#form-create-expediente');
    
    this.filters = {
      materia: this.root.querySelector('#filter-materia'),
      prioridad: this.root.querySelector('#filter-prioridad'),
      estado: this.root.querySelector('#filter-estado'),
      abogado: this.root.querySelector('#filter-abogado')
    };
    this.data = [];
  }

  init() {
    this.data = loadExpedientes();
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => this.render());
    }
    Object.values(this.filters).forEach(el => {
      if (el) el.addEventListener('change', () => this.render());
    });
    
    if (this.createBtn) this.createBtn.addEventListener('click', () => this.openModal());
    if (this.emptyCreateBtn) this.emptyCreateBtn.addEventListener('click', () => this.openModal());
    
    if (this.closeModalBtn) this.closeModalBtn.addEventListener('click', () => this.closeModal());
    if (this.cancelModalBtn) this.cancelModalBtn.addEventListener('click', () => this.closeModal());
    
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        // Crear expediente
        const expediente = createExpediente(data);
        this.data.unshift(expediente);
        
        this.closeModal();
        this.form.reset();
        this.render();
        
        // Opcional: Mostrar alerta
        alert('Expediente creado exitosamente');
      });
    }
  }

  criteria() {
    return {
      search: this.searchInput?.value.trim(),
      materia: this.filters.materia?.value,
      prioridad: this.filters.prioridad?.value,
      estado: this.filters.estado?.value,
      abogado: this.filters.abogado?.value
    };
  }

  // --- CORRECCIÓN AQUÍ ---
  openModal() {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex'); // Necesario para que funcionen justify-center e items-center
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex'); // Limpieza
  }
  // ------------------------

  buildCard(expediente) {
    const tpl = this.root.querySelector('#expediente-card-template');
    if (!tpl) return document.createTextNode('');
    
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.expedienteId = expediente.id;
    
    // Llenar datos
    const setText = (sel, val) => { const el = node.querySelector(sel); if(el) el.textContent = val; };
    
    setText('.numero-expediente', expediente.numero);
    setText('.descripcion-expediente', expediente.descripcion);
    setText('.materia-expediente', expediente.materia);
    setText('.abogado-expediente', expediente.abogado);
    setText('.ultima-actividad-expediente', expediente.ultimaActividad);
    
    const estadoEl = node.querySelector('.estado-badge');
    if(estadoEl) {
        estadoEl.textContent = expediente.estado;
        // Colores simples
        if (['Activo', 'Tramite'].includes(expediente.estado)) {
            estadoEl.className = 'text-xs font-medium px-2.5 py-0.5 rounded border bg-green-100 text-green-800 border-green-400';
        } else {
            estadoEl.className = 'text-xs font-medium px-2.5 py-0.5 rounded border bg-yellow-100 text-yellow-800 border-yellow-400';
        }
    }

    const verDetalleBtn = node.querySelector('.ver-detalle-btn');
    const irADetalle = () => {
        window.location.href = `expediente-detalle.html?id=${encodeURIComponent(expediente.id)}`;
    };

    if (verDetalleBtn) {
        verDetalleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            irADetalle();
        });
    }
    
    // Click en toda la tarjeta
    node.addEventListener('click', irADetalle);

    return node;
  }

  render() {
    if (!this.listContainer) return;
    const filtered = filterExpedientes(this.criteria());
    this.listContainer.innerHTML = '';

    if (!filtered.length) {
      this.emptyState?.classList.remove('hidden');
    } else {
      this.emptyState?.classList.add('hidden');
      filtered.forEach(exp => {
        this.listContainer.appendChild(this.buildCard(exp));
      });
    }
  }
}