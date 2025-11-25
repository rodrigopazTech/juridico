// Clase principal para manejar la vista de lista de Expedientes
import { loadExpedientes, filterExpedientes, createExpediente } from '../data/expedientes-data.js';

class ExpedientesModule {
  constructor(opts = {}) {
    this.root = opts.root || document;
    this.listContainer = this.root.querySelector('#expedientes-list');
    this.emptyState = this.root.querySelector('#expedientes-empty-state');
    this.searchInput = this.root.querySelector('#expediente-search');
    this.createBtn = this.root.querySelector('#expediente-nuevo');
    this.emptyCreateBtn = this.root.querySelector('#empty-create-expediente');
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
        const expediente = createExpediente(Object.fromEntries(formData.entries()));
        this.data.unshift(expediente);
        this.closeModal();
        this.form.reset();
        this.render();
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
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.classList.add('hidden');
  }

  buildCard(expediente) {
    const tpl = this.root.querySelector('#expediente-card-template');
    if (!tpl) return document.createTextNode('');
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.dataset.expedienteId = expediente.id;
    
    const numEl = node.querySelector('.numero-expediente');
    if(numEl) numEl.textContent = expediente.numero;
    
    const descEl = node.querySelector('.descripcion-expediente');
    if(descEl) descEl.textContent = expediente.descripcion;
    
    const matEl = node.querySelector('.materia-expediente');
    if(matEl) matEl.textContent = expediente.materia;
    
    // Prioridad y actualizaciones no están en el diseño de asuntos.html
    // const prioEl = node.querySelector('.prioridad-expediente');
    // if(prioEl) prioEl.textContent = expediente.prioridad;
    
    const estadoEl = node.querySelector('.estado-badge');
    if(estadoEl) {
        estadoEl.textContent = expediente.estado;
        estadoEl.dataset.estado = expediente.estado;
        // Lógica de colores similar a asuntos.html
        if (expediente.estado === 'Activo' || expediente.estado === 'Finalizado') {
            estadoEl.className = 'text-xs font-medium px-2.5 py-0.5 rounded border estado-badge bg-green-100 text-green-800 border-green-400';
        } else {
            estadoEl.className = 'text-xs font-medium px-2.5 py-0.5 rounded border estado-badge bg-yellow-100 text-yellow-800 border-yellow-400';
        }
    }
    
    const aboEl = node.querySelector('.abogado-expediente');
    if(aboEl) aboEl.textContent = expediente.abogado;
    
    const ultEl = node.querySelector('.ultima-actividad-expediente');
    if(ultEl) ultEl.textContent = expediente.ultimaActividad;
    
    // const actEl = node.querySelector('.actualizaciones-expediente');
    // if(actEl) actEl.textContent = expediente.actualizaciones;

    const verDetalleBtn = node.querySelector('.ver-detalle-btn');
    if (verDetalleBtn) {
        verDetalleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.location.href = `expediente-detalle.html?id=${encodeURIComponent(expediente.id)}`;
        });
    }

    node.addEventListener('click', () => {
      window.location.href = `expediente-detalle.html?id=${encodeURIComponent(expediente.id)}`;
    });

    return node;
  }

  render() {
    if (!this.listContainer) return;
    const filtered = filterExpedientes(this.criteria());
    this.listContainer.innerHTML = '';

    if (!filtered.length) {
      this.emptyState?.classList.remove('hidden');
      return;
    } else {
      this.emptyState?.classList.add('hidden');
    }

    filtered.forEach(exp => {
      this.listContainer.appendChild(this.buildCard(exp));
    });
  }
}

// Auto init removed to allow manual init after includes load
// window.addEventListener('DOMContentLoaded', () => {
//   const module = new ExpedientesModule();
//   module.init();
// });

export { ExpedientesModule };