import { loadExpedientes, filterExpedientes, createExpediente } from '../data/expedientes-data.js';

export class ExpedientesModule {
  constructor(opts = {}) {
    this.root = opts.root || document;
    this.listContainer = this.root.querySelector('#expedientes-list');
    this.emptyState = this.root.querySelector('#expedientes-empty-state');
    this.searchInput = this.root.querySelector('#expediente-search');
    this.createBtn = this.root.querySelector('#expediente-nuevo');
    this.emptyCreateBtn = this.root.querySelector('#empty-create-expediente');
    
    // Elementos del Modal Crear
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
    if (this.searchInput) this.searchInput.addEventListener('input', () => this.render());
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
        
        // Crear expediente (los campos extra se manejan en data/expedientes-data.js ahora)
        const expediente = createExpediente(data);
        this.data.unshift(expediente);
        
        this.closeModal();
        this.form.reset();
        this.render();
        alert('Expediente creado correctamente en TRAMITE');
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

  openModal() {
    if (!this.modal) return;
    this.modal.classList.remove('hidden');
    this.modal.classList.add('flex');
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
    this.modal.classList.remove('flex');
  }

  buildCard(expediente) {
    const tpl = this.root.querySelector('#expediente-card-template');
    if (!tpl) return document.createTextNode('');
    
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.expedienteId = expediente.id;
    
    // Helpers
    const setText = (sel, val) => { const el = node.querySelector(sel); if(el) el.textContent = val || '—'; };
    
    setText('.numero-expediente', expediente.numero);
    setText('.descripcion-expediente', expediente.descripcion);
    setText('.materia-expediente', expediente.materia);
    setText('.abogado-expediente', expediente.abogado);
    setText('.ultima-actividad-expediente', expediente.ultimaActividad);
    
    // 1. Lógica de ESTADO (TRAMITE, LAUDO, FIRME)
    const estadoEl = node.querySelector('.estado-badge');
    if(estadoEl) {
        const st = (expediente.estado || 'TRAMITE').toUpperCase();
        estadoEl.textContent = st;

        if (st === 'TRAMITE') {
            estadoEl.className = 'estado-badge text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-blue-50 text-blue-700 border-blue-200';
        } else if (st === 'LAUDO') {
            estadoEl.className = 'estado-badge text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200';
        } else if (st === 'FIRME') {
            estadoEl.className = 'estado-badge text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200';
        } else {
            estadoEl.className = 'estado-badge text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-gray-50 text-gray-500 border-gray-200';
        }
    }

    // 2. Lógica de PRIORIDAD (Alta, Media, Baja)
    const prioEl = node.querySelector('.prioridad-badge');
    if(prioEl) {
        const prio = expediente.prioridad || 'Media';
        prioEl.textContent = prio;

        if (prio === 'Alta') {
            prioEl.className = 'prioridad-badge text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-red-50 text-red-700 border-red-200';
        } else if (prio === 'Baja') {
            prioEl.className = 'prioridad-badge text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-gray-50 text-gray-600 border-gray-200';
        } else {
            // Media
            prioEl.className = 'prioridad-badge text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-orange-50 text-orange-700 border-orange-200';
        }
    }

    const irADetalle = () => {
        window.location.href = `expediente-detalle.html?id=${encodeURIComponent(expediente.id)}`;
    };

    const btnDetalle = node.querySelector('.ver-detalle-btn');
    if(btnDetalle) btnDetalle.addEventListener('click', (e) => { e.stopPropagation(); irADetalle(); });
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