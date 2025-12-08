export class NotificacionesModule {
    constructor() {
        this.STORAGE_KEY = 'jl_notifications_v3'; // Cambié key para forzar nuevos datos
        this.currentFilter = 'all';
        this.notifications = [];
        
        // Elementos DOM
        this.tableBody = null;
        this.emptyState = null;
        this.searchInput = null;
        this.filterButtons = null;
        this.modal = null;
        this.form = null;
    }

    init() {
        setTimeout(() => {
            this.bindElements();
            this.bindEvents();
            this.loadNotifications();
            
            // Si no hay datos, cargar ejemplos variados
            if(this.notifications.length === 0) this.seedDemoData();
            
            this.renderTable();
        }, 200);
    }

    bindElements() {
        this.filterButtons = document.querySelectorAll('.btn-filter');
        this.searchInput = document.querySelector('#search-notifications');
        this.tableBody = document.querySelector('#notifications-body');
        this.emptyState = document.querySelector('#empty-state');
        this.modal = document.querySelector('#modal-notificacion');
        this.form = document.querySelector('#form-notificacion');
        
        // Botón nuevo (si existe)
        const btnNew = document.querySelector('#btn-nueva-notificacion');
        if(btnNew) btnNew.addEventListener('click', () => this.showModal());
    }

    bindEvents() {
        if (this.filterButtons) {
            this.filterButtons.forEach(btn => btn.addEventListener('click', (e) => this.handleFilterClick(e)));
        }
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.renderTable());
        }
        // Eventos del modal
        if (this.modal) {
            this.modal.querySelectorAll('[data-modal-hide]').forEach(b => b.addEventListener('click', () => this.hideModal()));
        }
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    // ==================== DATOS ====================
    uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
    
    loadNotifications() {
        this.notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    }
    
    saveNotifications() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notifications));
    }
    
    // === DATOS DE EJEMPLO AMPLIADOS ===
    seedDemoData() {
        const now = new Date();
        const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
        const in3Days = new Date(now); in3Days.setDate(now.getDate() + 3);
        const past = new Date(now); past.setDate(now.getDate() - 1);

        this.notifications = [
            // AUDIENCIAS (Estados: Pendiente, Con Acta, Concluido)
            { 
                id: this.uid(), 
                eventType: 'audiencia', 
                title: 'Audiencia Inicial', 
                expediente: '100/2025', 
                status: 'Pendiente', // Amarillo
                detalles: { juzgado: 'Juzgado 1 Civil' }, 
                notifyAt: tomorrow.toISOString() 
            },
            { 
                id: this.uid(), 
                eventType: 'audiencia', 
                title: 'Audiencia Intermedia', 
                expediente: '200/2025', 
                status: 'Con Acta', // Azul
                detalles: { juzgado: 'Juzgado 2 Penal' }, 
                notifyAt: in3Days.toISOString() 
            },
            { 
                id: this.uid(), 
                eventType: 'audiencia', 
                title: 'Juicio Oral', 
                expediente: '300/2025', 
                status: 'Concluida', // Gris/Oscuro
                detalles: { juzgado: 'Tribunal Laboral' }, 
                notifyAt: past.toISOString() 
            },

            // TÉRMINOS (Estados del Flujo: Proyectista, Revisión, Gerencia, etc.)
            { 
                id: this.uid(), 
                eventType: 'termino', 
                title: 'Contestación de Demanda', 
                expediente: '456/2024', 
                status: 'Proyectista', // Gris claro
                detalles: { actuacion: 'Elaboración de proyecto' }, 
                notifyAt: now.toISOString() 
            },
            { 
                id: this.uid(), 
                eventType: 'termino', 
                title: 'Alegatos Finales', 
                expediente: '789/2024', 
                status: 'Gerencia', // Morado
                detalles: { actuacion: 'Revisión Gerencial' }, 
                notifyAt: tomorrow.toISOString() 
            },
            { 
                id: this.uid(), 
                eventType: 'termino', 
                title: 'Amparo Directo', 
                expediente: '999/2024', 
                status: 'Liberado', // Verde
                detalles: { actuacion: 'Listo para presentar' }, 
                notifyAt: in3Days.toISOString() 
            },
            { 
                id: this.uid(), 
                eventType: 'termino', 
                title: 'Recurso de Revisión', 
                expediente: '555/2024', 
                status: 'Presentado', // Azul/Verde oscuro
                detalles: { actuacion: 'Acuse recibido' }, 
                notifyAt: past.toISOString() 
            },

            // RECORDATORIOS
            { 
                id: this.uid(), 
                eventType: 'recordatorio', 
                title: 'Junta Semanal', 
                expediente: '-', 
                status: 'Activo', // Oro
                detalles: { descripcion: 'Sala de juntas 3' }, 
                notifyAt: now.toISOString() 
            }
        ];
        this.saveNotifications();
    }

    // ==================== RENDERIZADO ====================

    renderTable() {
        if (!this.tableBody) return;
        
        const template = document.getElementById('template-notification-row');
        if (!template) return;

        const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        
        const filtered = this.notifications.filter(n => {
            const matchesFilter = this.currentFilter === 'all' || n.eventType === this.currentFilter;
            const matchesSearch = n.title.toLowerCase().includes(searchTerm) || 
                                  (n.expediente || '').toLowerCase().includes(searchTerm) ||
                                  (n.status || '').toLowerCase().includes(searchTerm);
            return matchesFilter && matchesSearch;
        }).sort((a, b) => new Date(b.notifyAt) - new Date(a.notifyAt));

        this.tableBody.innerHTML = '';

        if (filtered.length === 0) {
            this.emptyState?.classList.remove('hidden');
            this.tableBody.parentElement.classList.add('hidden');
        } else {
            this.emptyState?.classList.add('hidden');
            this.tableBody.parentElement.classList.remove('hidden');
            
            filtered.forEach(n => {
                const clone = template.content.cloneNode(true);
                this.hydrateRow(clone, n);
                this.tableBody.appendChild(clone);
            });
        }
    }

    hydrateRow(clone, n) {
        // 1. Fechas
        const dateObj = new Date(n.notifyAt);
        clone.querySelector('.js-date').textContent = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        clone.querySelector('.js-time').textContent = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        // 2. Tipo (Badge) - Usando los colores semánticos globales
        const styles = {
            audiencia: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'fa-gavel' },
            termino: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'fa-hourglass-end' },
            recordatorio: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'fa-sticky-note' }
        };
        const st = styles[n.eventType] || styles.recordatorio;

        const typeBadge = clone.querySelector('.js-badge');
        typeBadge.classList.add(st.bg, st.text, st.border);
        clone.querySelector('.js-type-icon').classList.add(st.icon);
        clone.querySelector('.js-type-text').textContent = n.eventType.charAt(0).toUpperCase() + n.eventType.slice(1);

        // 3. ESTADO (Lógica de colores específica)
        const statusBadge = clone.querySelector('.js-status-badge');
        const statusText = n.status || 'Pendiente';
        statusBadge.textContent = statusText;
        
        let statusClass = 'bg-gray-100 text-gray-600 border-gray-200'; // Default

        // Reglas para Audiencias
        if (n.eventType === 'audiencia') {
            if (statusText === 'Pendiente') statusClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
            else if (statusText === 'Con Acta') statusClass = 'bg-blue-100 text-blue-800 border-blue-200';
            else if (statusText === 'Concluida' || statusText === 'Desahogada') statusClass = 'bg-gray-800 text-white border-gray-600';
        }
        // Reglas para Términos (Flujo)
        else if (n.eventType === 'termino') {
            if (statusText === 'Proyectista') statusClass = 'bg-gray-100 text-gray-700 border-gray-300';
            else if (statusText === 'Revisión') statusClass = 'bg-indigo-100 text-indigo-700 border-indigo-200';
            else if (statusText === 'Gerencia') statusClass = 'bg-purple-100 text-purple-700 border-purple-200';
            else if (statusText === 'Dirección') statusClass = 'bg-orange-100 text-orange-700 border-orange-200';
            else if (statusText === 'Liberado') statusClass = 'bg-green-100 text-green-700 border-green-200';
            else if (statusText === 'Presentado') statusClass = 'bg-teal-100 text-teal-700 border-teal-200';
            else if (statusText === 'Concluido') statusClass = 'bg-gray-800 text-white border-gray-600';
        }
        // Reglas para Recordatorios
        else if (n.eventType === 'recordatorio') {
            statusClass = 'bg-amber-100 text-amber-800 border-amber-200';
        }

        // Limpiar clases anteriores y aplicar nuevas
        statusBadge.className = `js-status-badge inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-bold ${statusClass}`;

        // 4. Textos
        clone.querySelector('.js-title').textContent = n.title;
        clone.querySelector('.js-expediente').textContent = n.expediente || '-';

        let detailsText = '-';
        if (n.detalles) {
            detailsText = Object.values(n.detalles).filter(v => v).join(' • ');
        }
        const detailsEl = clone.querySelector('.js-details');
        detailsEl.textContent = detailsText;
        detailsEl.title = detailsText;

        // 5. Botón Eliminar
        const btnDelete = clone.querySelector('.js-delete-btn');
        btnDelete.onclick = () => this.deleteNotification(n.id);
    }

    // ==================== ACCIONES ====================

    handleFilterClick(event) {
        const btn = event.target.closest('.btn-filter');
        if (!btn) return;
        
        this.filterButtons.forEach(b => {
            b.classList.remove('active', 'bg-gob-guinda', 'text-white', 'border-gob-guinda');
            b.classList.add('bg-white', 'text-gob-gris', 'border-gray-300');
        });
        btn.classList.remove('bg-white', 'text-gob-gris', 'border-gray-300');
        btn.classList.add('active', 'bg-gob-guinda', 'text-white', 'border-gob-guinda');

        this.currentFilter = btn.dataset.filter;
        this.renderTable();
    }

    deleteNotification(id) {
        if(confirm('¿Eliminar notificación?')) {
            this.notifications = this.notifications.filter(n => n.id !== id);
            this.saveNotifications();
            this.renderTable();
        }
    }

    // ==================== MODAL ====================
    showModal() {
        if (this.modal) {
            this.modal.classList.remove('hidden'); this.modal.classList.add('flex');
            this.form.reset();
        }
    }
    
    hideModal() {
        if (this.modal) {
            this.modal.classList.add('hidden'); this.modal.classList.remove('flex');
        }
    }
    
    handleSubmit(event) {
        event.preventDefault();
        const tipo = document.querySelector('#notif-tipo').value;
        const titulo = document.querySelector('#notif-titulo').value;
        const expediente = document.querySelector('#notif-expediente').value;
        
        if (!tipo || !titulo) return alert('Datos incompletos');

        const now = new Date().toISOString();
        
        this.notifications.push({
            id: this.uid(),
            eventType: tipo,
            title: titulo,
            expediente: expediente,
            status: 'Pendiente', // Default manual
            detalles: { creado: 'Manualmente' },
            notifyAt: now,
            sent: false
        });
        
        this.saveNotifications();
        this.renderTable();
        this.hideModal();
    }
}
