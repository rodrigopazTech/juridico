export class NotificacionesModule {
    constructor() {
        this.STORAGE_KEY = 'jl_notifications_v4'; 
        this.currentFilter = 'all';
        this.notifications = [];
        this.updateInterval = null;
        
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
            this.renderTable();
            
            // CAMBIO 1: Marcar como leídas al entrar
            this.markAllAsRead(); 
            
            this.startAutoUpdate();
        }, 200);
    }

    bindElements() {
        this.filterButtons = document.querySelectorAll('.btn-filter');
        this.searchInput = document.querySelector('#search-notifications');
        this.tableBody = document.querySelector('#notifications-body');
        this.emptyState = document.querySelector('#empty-state');
        this.modal = document.querySelector('#modal-notificacion');
        this.form = document.querySelector('#form-notificacion');
        
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
        if (this.modal) {
            this.modal.querySelectorAll('[data-modal-hide]').forEach(b => b.addEventListener('click', () => this.hideModal()));
        }
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    // ==================== GESTIÓN DE DATOS ====================
    
    uid() { 
        return Date.now().toString(36) + Math.random().toString(36).slice(2); 
    }
    
    loadNotifications() {
        try {
            this.notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch (e) {
            this.notifications = [];
        }
    }
    
    saveNotifications() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notifications));
    }

    // CAMBIO 1: Función para "limpiar" el badge
    markAllAsRead() {
        let huboCambios = false;
        const now = new Date();
        
        this.notifications.forEach(n => {
            // Solo marcamos las que ya ocurrieron y no estaban leídas
            if (!n.read && new Date(n.notifyAt) <= now) {
                n.read = true;
                huboCambios = true;
            }
        });

        if (huboCambios) {
            this.saveNotifications();
            // Disparar evento para que el badge se actualice al instante
            window.dispatchEvent(new Event('storage')); 
        }
    }

    // ==================== RENDERIZADO ====================

    renderTable() {
        if (!this.tableBody) return;
        
        const template = document.getElementById('template-notification-row');
        if (!template) return; 

        const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        const now = new Date(); 

        const filtered = this.notifications.filter(n => {
            const notificationTime = new Date(n.notifyAt);
            if (notificationTime > now) return false; 

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
        const dateObj = new Date(n.notifyAt);
        const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        
        clone.querySelector('.js-date').textContent = dateStr;
        clone.querySelector('.js-time').textContent = timeStr;

        // Estilos visuales
        const styles = {
            audiencia: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: 'fa-gavel', label: 'Audiencia' },
            termino: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: 'fa-hourglass-end', label: 'Término' },
            recordatorio: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: 'fa-sticky-note', label: 'Aviso' }
        };
        const st = styles[n.eventType] || styles.recordatorio;

        const typeBadge = clone.querySelector('.js-badge');
        typeBadge.classList.add(st.bg, st.text, st.border);
        clone.querySelector('.js-type-icon').classList.add(st.icon);
        clone.querySelector('.js-type-text').textContent = st.label;

        // Status Badge
        const statusBadge = clone.querySelector('.js-status-badge');
        const statusText = n.status || 'Pendiente';
        statusBadge.textContent = statusText;
        
        let statusClass = 'bg-gray-100 text-gray-600 border-gray-200';
        if (n.eventType === 'audiencia') {
            if (statusText === 'Pendiente') statusClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
            else if (statusText === 'Con Acta') statusClass = 'bg-blue-100 text-blue-800 border-blue-200';
            else if (['Concluida', 'Desahogada'].includes(statusText)) statusClass = 'bg-gray-800 text-white border-gray-600';
        } else if (n.eventType === 'termino') {
            if (['Liberado', 'Presentado'].includes(statusText)) statusClass = 'bg-green-100 text-green-800 border-green-200';
            else if (statusText === 'Concluido') statusClass = 'bg-gray-800 text-white border-gray-600';
            else if (['Revisión', 'Gerencia', 'Dirección'].includes(statusText)) statusClass = 'bg-indigo-100 text-indigo-800 border-indigo-200';
        } else {
            statusClass = 'bg-amber-100 text-amber-800 border-amber-200';
        }
        statusBadge.className = `js-status-badge inline-flex items-center px-2.5 py-0.5 rounded border text-xs font-bold ${statusClass}`;

        // Contenido
        const resumenEl = clone.querySelector('.js-resumen');
        const extraEl = clone.querySelector('.js-detalles-extra');
        
        let resumenHTML = '';
        let extraText = '';

        if (n.eventType === 'termino') {
            const accion = this.obtenerAccionTermino(statusText);
            const exp = n.expediente ? `<span class="font-mono text-xs bg-gray-100 px-1 rounded border ml-1">${n.expediente}</span>` : '';
            resumenHTML = `El término <span class="font-bold text-gob-guinda">${n.title}</span> ${exp} ${accion}.`;
            extraText = n.detalles?.actuacion || 'Sin detalles adicionales';

        } else if (n.eventType === 'audiencia') {
            let estadoDesc = "está pendiente de realizarse";
            if (statusText === 'Con Acta') estadoDesc = "ya cuenta con acta cargada";
            if (['Concluida', 'Desahogada'].includes(statusText)) estadoDesc = "ha sido concluida exitosamente";
            
            const exp = n.expediente ? `<span class="font-mono text-xs bg-gray-100 px-1 rounded border ml-1">${n.expediente}</span>` : '';
            const cleanTitle = n.title.replace('Nueva Audiencia:', '').replace('Audiencia Concluida:', '').trim();
            resumenHTML = `La audiencia de tipo <span class="font-bold text-blue-700">${cleanTitle}</span> ${exp} ${estadoDesc}.`;
            extraText = n.detalles?.juzgado || 'Juzgado no especificado';

        } else if (n.eventType === 'recordatorio') {
            const tiempo = n.meta?.anticipacion || "breve";
            const expRef = n.meta?.expediente ? `(Exp. ${n.meta.expediente})` : '';
            const cleanTitle = n.title.replace('Recordatorio:', '').trim();
            resumenHTML = `<span class="text-amber-700 font-bold"><i class="fas fa-exclamation-circle"></i> Aviso:</span> El evento <span class="font-semibold">${cleanTitle}</span> ${expRef} es en <span class="font-bold underline text-gray-800">${tiempo}</span>.`;
            extraText = n.detalles?.descripcion || n.detalles || '';
        }

        resumenEl.innerHTML = resumenHTML;
        extraEl.textContent = extraText;
        extraEl.title = extraText;

        const btnDelete = clone.querySelector('.js-delete-btn');
        btnDelete.onclick = () => this.deleteNotification(n.id);
    }

    obtenerAccionTermino(estado) {
        switch(estado) {
            case 'Proyectista': return 'ha sido asignado a Proyectista';
            case 'Revisión': return 'pasó a la etapa de Revisión';
            case 'Gerencia': return 'fue enviado para aprobación de Gerencia';
            case 'Dirección': return 'pasó a Dirección para firma final';
            case 'Liberado': return 'ha sido Liberado y está listo para presentarse';
            case 'Presentado': return 'fue Presentado ante la autoridad';
            case 'Concluido': return 'ha finalizado su proceso';
            default: return 'ha cambiado de estado';
        }
    }

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

    // CAMBIO 2: Eliminación sin confirmación (Directa + Toast)
    deleteNotification(id) {
        // Eliminación inmediata de la memoria y persistencia
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
        this.renderTable();

        // Mostrar notificación tipo "Toast" discreta
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: false,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        });

        Toast.fire({
            icon: 'success',
            title: 'Notificación eliminada'
        });
    }

    startAutoUpdate() { 
        this.updateInterval = setInterval(() => this.renderTable(), 60000); 
    }

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
        const detalles = document.querySelector('#notif-detalles').value;
        const fecha = document.querySelector('#notif-fecha-evento').value;
        
        if (!tipo || !titulo) return alert('Datos incompletos');

        const now = new Date().toISOString();
        const notifyAt = fecha ? new Date(fecha).toISOString() : now;
        
        this.notifications.push({
            id: this.uid(),
            eventType: tipo,
            title: titulo,
            expediente: expediente,
            status: 'Pendiente', 
            detalles: { descripcion: detalles || 'Notificación manual' },
            notifyAt: notifyAt,
            sent: false,
            read: false // Nueva propiedad para badge
        });
        
        this.saveNotifications();
        this.renderTable();
        this.hideModal();
    }
}