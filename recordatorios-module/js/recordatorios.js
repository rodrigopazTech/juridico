export class RecordatoriosModule {
    constructor() {
        this.data = [];
        // Eliminamos this.filter ya que no filtraremos por estado
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.render();
        this.updateWidgetDate();
    }

    loadData() {
        const stored = localStorage.getItem('recordatorios');
        this.data = stored ? JSON.parse(stored) : this.getSampleData();
    }
    
    getSampleData() {
        return [
            { id: 1, titulo: 'Reunión de equipo', fecha: '2025-11-25', hora: '10:00', detalles: 'Sala de juntas 3.', prioridad: 'urgent' },
            { id: 2, titulo: 'Audiencia con cliente', fecha: '2025-11-26', hora: '14:30', detalles: 'Juzgado Segundo.', prioridad: 'normal' },
            { id: 3, titulo: 'Revisión contratos', fecha: '2025-11-20', hora: '09:00', detalles: 'Proveedores.', prioridad: 'normal' }
        ];
    }

    saveData() {
        localStorage.setItem('recordatorios', JSON.stringify(this.data));
        this.updateStats();
    }

    setupEventListeners() {
        document.getElementById('search-recordatorios')?.addEventListener('input', () => this.render());
        document.getElementById('btn-nuevo-recordatorio')?.addEventListener('click', () => this.openModal());
        
        // Modal cerrar
        const closeModal = () => {
            const m = document.getElementById('modal-recordatorio');
            m.classList.add('hidden'); m.classList.remove('flex');
        };
        document.getElementById('close-modal-recordatorio')?.addEventListener('click', closeModal);
        document.getElementById('cancel-recordatorio')?.addEventListener('click', closeModal);

        // Modal Guardar
        document.getElementById('form-recordatorio')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRecordatorio();
        });
    }

    render() {
        const container = document.getElementById('lista-recordatorios');
        const template = document.getElementById('template-recordatorio');
        
        if (!container || !template) return;

        container.innerHTML = ''; 
        const searchTerm = document.getElementById('search-recordatorios')?.value.toLowerCase() || '';
        
        // Filtrar y Ordenar (Solo por texto y fecha, ya no por estado)
        let filtered = this.data.filter(item => {
            return item.titulo.toLowerCase().includes(searchTerm) || (item.detalles || '').toLowerCase().includes(searchTerm);
        }).sort((a, b) => {
            // Ordenar por fecha: Más reciente primero o más próximo
            return new Date(a.fecha + 'T' + a.hora) - new Date(b.fecha + 'T' + b.hora);
        });

        if (filtered.length === 0) {
            container.innerHTML = `<div class="text-center py-10 text-gray-400"><i class="fas fa-inbox text-3xl mb-2"></i><p>No hay recordatorios.</p></div>`;
            return;
        }

        filtered.forEach(item => {
            const clone = template.content.cloneNode(true);
            this.hydrateCard(clone, item);
            container.appendChild(clone);
        });
        
        this.updateStats();
    }

    hydrateCard(clone, item) {
        const card = clone.querySelector('.reminder-card');
        card.dataset.id = item.id;

        // 1. Estilos de Borde (Mantenemos distinción de urgencia solo en el borde izquierdo)
        const isUrgent = item.prioridad === 'urgent';
        // Si es urgente borde Guinda, si no, borde Oro (Normal)
        card.classList.add(isUrgent ? 'reminder-urgent' : 'reminder-normal');
        
        // 2. Estilos del Icono (SIEMPRE ORO/AMBER, según tu requerimiento)
        const iconBox = clone.querySelector('.js-icon-box');
        // Usamos la clase personalizada o utilidades directas de Tailwind para Oro
        iconBox.className = 'js-icon-box w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0 bg-amber-100 text-amber-600';
        
        const icon = clone.querySelector('.js-icon');
        // Cambiamos el icono según prioridad, pero el color ya es oro por el contenedor
        icon.className = `js-icon fas ${isUrgent ? 'fa-exclamation' : 'fa-bell'}`;

        // 3. Rellenar Textos
        clone.querySelector('.js-title').textContent = item.titulo;
        clone.querySelector('.js-details').textContent = item.detalles || 'Sin detalles.';
        
        const fechaObj = new Date(item.fecha + 'T' + item.hora);
        const fechaStr = this.formatDateRelative(fechaObj);
        clone.querySelector('.js-date-text').textContent = `${fechaStr} • ${item.hora}`;

        // 4. Asignar Eventos
        clone.querySelector('.js-btn-delete').onclick = () => this.deleteItem(item.id);
        clone.querySelector('.js-btn-edit').onclick = () => this.openModal(item.id);
    }
    
    deleteItem(id) {
        if(confirm('¿Eliminar recordatorio?')) {
            this.data = this.data.filter(i => i.id != id);
            this.saveData();
            this.render();
        }
    }

    openModal(id = null) {
        const modal = document.getElementById('modal-recordatorio');
        const form = document.getElementById('form-recordatorio');
        form.reset();
        document.getElementById('rec-id').value = '';
        document.getElementById('modal-title').textContent = 'Nuevo Recordatorio';
        document.getElementById('rec-fecha').valueAsDate = new Date();

        if (id) {
            const item = this.data.find(i => i.id == id);
            if (item) {
                document.getElementById('modal-title').textContent = 'Editar Recordatorio';
                document.getElementById('rec-id').value = item.id;
                document.getElementById('rec-titulo').value = item.titulo;
                document.getElementById('rec-fecha').value = item.fecha;
                document.getElementById('rec-hora').value = item.hora;
                document.getElementById('rec-prioridad').value = item.prioridad;
                document.getElementById('rec-detalles').value = item.detalles;
            }
        }
        modal.classList.remove('hidden'); modal.classList.add('flex');
    }

    saveRecordatorio() {
        const id = document.getElementById('rec-id').value;
        const nuevo = {
            id: id ? parseInt(id) : Date.now(),
            titulo: document.getElementById('rec-titulo').value,
            fecha: document.getElementById('rec-fecha').value,
            hora: document.getElementById('rec-hora').value,
            prioridad: document.getElementById('rec-prioridad').value,
            detalles: document.getElementById('rec-detalles').value
        };

        if (id) {
            const idx = this.data.findIndex(i => i.id == id);
            this.data[idx] = nuevo;
        } else {
            this.data.unshift(nuevo);
        }
        this.saveData();
        this.render();
        
        const modal = document.getElementById('modal-recordatorio');
        modal.classList.add('hidden'); modal.classList.remove('flex');
    }
    
    updateStats() {
        const hoyStr = new Date().toISOString().split('T')[0];
        const hoyCount = this.data.filter(i => i.fecha === hoyStr).length;
        const urgentesCount = this.data.filter(i => i.prioridad === 'urgent').length;
        const totalCount = this.data.length;

        // Actualizamos los IDs que existen en el HTML
        if(document.getElementById('stat-hoy')) document.getElementById('stat-hoy').textContent = hoyCount;
        if(document.getElementById('stat-urgentes')) document.getElementById('stat-urgentes').textContent = urgentesCount;
        if(document.getElementById('stat-total')) document.getElementById('stat-total').textContent = totalCount;
    }

    updateWidgetDate() {
        const now = new Date();
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        document.getElementById('widget-dia').textContent = now.getDate();
        document.getElementById('widget-mes').textContent = months[now.getMonth()] + ' ' + now.getFullYear();
    }

    formatDateRelative(date) {
        const today = new Date();
        const dStr = date.toISOString().split('T')[0];
        const tStr = today.toISOString().split('T')[0];
        return dStr === tStr ? 'Hoy' : date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
}