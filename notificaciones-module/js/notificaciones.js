/**
 * MÓDULO DE NOTIFICACIONES - Sistema Jurídico GOB.MX V3
 * Funcionalidad completa con persistencia en localStorage
 */

export class NotificacionesModule {
    constructor() {
        this.STORAGE_KEY = 'jl_notifications_v2';
        this.currentFilter = 'all';
        this.notifications = [];
        this.updateInterval = null;
        
        // Referencias DOM
        this.filterButtons = null;
        this.searchInput = null;
        this.btnNuevaNotificacion = null;
        this.modal = null;
        this.form = null;
        this.contentContainer = null;
    }

    /**
     * Inicializa el módulo
     */
    init() {
        console.log('Inicializando Módulo de Notificaciones...');
        
        // Esperar a que se carguen los componentes
        setTimeout(() => {
            this.bindElements();
            this.bindEvents();
            this.loadNotifications();
            this.seedDemoData();
            this.renderAll();
            this.startAutoUpdate();
            console.log('Módulo de Notificaciones iniciado correctamente');
        }, 200);
    }

    /**
     * Enlaza elementos del DOM
     */
    bindElements() {
        this.filterButtons = document.querySelectorAll('.btn-filter');
        this.searchInput = document.querySelector('#search-notifications');
        this.btnNuevaNotificacion = document.querySelector('#btn-nueva-notificacion');
        this.modal = document.querySelector('#modal-notificacion');
        this.form = document.querySelector('#form-notificacion');
        this.contentContainer = document.querySelector('#notifications-content');
    }

    /**
     * Enlaza eventos
     */
    bindEvents() {
        // Filtros
        if (this.filterButtons) {
            this.filterButtons.forEach(button => {
                button.addEventListener('click', (e) => this.handleFilterClick(e));
            });
        }

        // Búsqueda
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // Botón nueva notificación
        if (this.btnNuevaNotificacion) {
            this.btnNuevaNotificacion.addEventListener('click', () => this.showModal());
        }

        // Modal - cerrar
        if (this.modal) {
            const closeButtons = this.modal.querySelectorAll('[data-modal-hide]');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => this.hideModal());
            });
            
            // Cerrar al hacer clic fuera del modal
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hideModal();
                }
            });
        }

        // Formulario
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            
            // Cambio en tipo de alerta
            const tipoAlerta = this.form.querySelector('#notif-tipo-alerta');
            if (tipoAlerta) {
                tipoAlerta.addEventListener('change', (e) => this.handleTipoAlertaChange(e));
            }
        }

        // Delegación de eventos para botones de eliminación
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-btn')) {
                this.deleteNotification(e.target.closest('.delete-btn'));
            }
        });
    }

    // ==================== GESTIÓN DE DATOS ====================

    /**
     * Genera un ID único
     */
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    /**
     * Carga notificaciones desde localStorage
     */
    loadNotifications() {
        try {
            this.notifications = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch (e) {
            console.error('Error cargando notificaciones:', e);
            this.notifications = [];
        }
    }

    /**
     * Guarda notificaciones en localStorage
     */
    saveNotifications() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notifications));
        
        // Actualizar badge del sidebar
        if (typeof window.updateNotificationBadge === 'function') {
            window.updateNotificationBadge();
        }
    }

    /**
     * Calcula cuándo debe notificarse
     */
    computeNotifyAt(eventISO, type, offset) {
        if (type === 'datetime') {
            return new Date(eventISO).toISOString();
        }
        const ev = new Date(eventISO);
        if (type === 'days') {
            ev.setDate(ev.getDate() - Number(offset));
        } else if (type === 'hours') {
            ev.setHours(ev.getHours() - Number(offset));
        }
        return ev.toISOString();
    }

    /**
     * Formatea tiempo relativo
     */
    formatRelativeTime(date) {
        const now = new Date();
        const notifyDate = new Date(date);
        const diff = notifyDate - now;

        const seconds = Math.round(Math.abs(diff / 1000));
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        const isFuture = diff > 0;

        if (seconds < 60) {
            return isFuture ? 'en segundos' : 'hace segundos';
        } else if (minutes < 60) {
            return isFuture ? `en ${minutes} min` : `hace ${minutes} min`;
        } else if (hours < 24) {
            return isFuture ? `en ${hours} ${hours === 1 ? 'hora' : 'horas'}` : `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
        } else {
            return isFuture ? `en ${days} ${days === 1 ? 'día' : 'días'}` : `hace ${days} ${days === 1 ? 'día' : 'días'}`;
        }
    }

    /**
     * Agrega una nueva notificación
     */
    addNotification({ eventType, title, details, detalles, expediente, eventAtISO, notifyType, offset }) {
        let notifyAt;
        if (notifyType === 'datetime') {
            notifyAt = this.computeNotifyAt(eventAtISO, 'datetime', 0);
        } else if (!eventAtISO || !notifyType || !offset) {
            return null;
        } else {
            notifyAt = this.computeNotifyAt(eventAtISO, notifyType, offset);
        }

        const notification = {
            id: this.uid(),
            eventType: eventType || 'recordatorio',
            title: title || '',
            details: details || '',
            detalles: detalles || null,
            expediente: expediente || '',
            eventAt: eventAtISO || new Date().toISOString(),
            notifyType: notifyType || 'datetime',
            offset: Number(offset) || 0,
            notifyAt: notifyAt,
            createdAt: new Date().toISOString(),
            sent: false
        };

        this.notifications.push(notification);
        this.saveNotifications();
        return notification;
    }

    /**
     * Elimina una notificación
     */
    removeNotification(id) {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
    }

    /**
     * Marca notificación como enviada
     */
    markSent(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            notification.sent = true;
            notification.sentAt = new Date().toISOString();
            this.saveNotifications();
        }
    }

    /**
     * Obtiene próximas notificaciones
     */
    upcoming(limit = 50, filter = 'all') {
        const now = new Date();
        return this.notifications
            .filter(n => {
                const passesFilter = (filter === 'all' || n.eventType === filter);
                return passesFilter && !n.sent && new Date(n.notifyAt) >= now;
            })
            .sort((a, b) => new Date(a.notifyAt) - new Date(b.notifyAt))
            .slice(0, limit);
    }

    /**
     * Obtiene notificaciones de hoy
     */
    today(filter = 'all') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return this.notifications
            .filter(n => {
                const t = new Date(n.notifyAt);
                const passesFilter = (filter === 'all' || n.eventType === filter);
                return passesFilter && t >= start && t <= end;
            })
            .sort((a, b) => new Date(a.notifyAt) - new Date(b.notifyAt));
    }

    /**
     * Carga datos de demostración si no existen
     */
    seedDemoData() {
        if (this.notifications.length > 0) return;

        console.log('Cargando datos de demostración...');
        const now = new Date();
        const in3Days = new Date(now);
        in3Days.setDate(now.getDate() + 3);
        const in5Days = new Date(now);
        in5Days.setDate(now.getDate() + 5);
        const in4Hours = new Date(now);
        in4Hours.setHours(now.getHours() + 4);
        const todayLater = new Date(now);
        todayLater.setHours(now.getHours() + 2);

        // Audiencias con estructura completa
        this.notifications.push({
            id: this.uid(),
            eventType: 'audiencia',
            title: 'Audiencia inicial - Juicio ordinario civil',
            expediente: 'Exp. 2024-00123',
            detalles: {
                juzgado: 'Segundo Civil, Sala 4',
                representante: 'Lic. María González',
                tipoJuicio: 'Ordinario Civil'
            },
            eventAt: in3Days.toISOString(),
            notifyType: 'days',
            offset: 1,
            notifyAt: this.computeNotifyAt(in3Days.toISOString(), 'days', 1),
            createdAt: new Date().toISOString(),
            sent: false
        });

        this.notifications.push({
            id: this.uid(),
            eventType: 'audiencia',
            title: 'Audiencia de pruebas - Juicio mercantil',
            expediente: 'Exp. 2024-00156',
            detalles: {
                juzgado: 'Primero Mercantil, Sala 2',
                representante: 'Lic. Carlos Hernández',
                tipoJuicio: 'Mercantil'
            },
            eventAt: in5Days.toISOString(),
            notifyType: 'hours',
            offset: 2,
            notifyAt: this.computeNotifyAt(in5Days.toISOString(), 'hours', 2),
            createdAt: new Date().toISOString(),
            sent: false
        });

        // Términos con estructura completa
        this.notifications.push({
            id: this.uid(),
            eventType: 'termino',
            title: 'Vencimiento de plazo para contestar demanda',
            expediente: 'Exp. 2024-00087',
            detalles: {
                partesProcesales: 'Ortega Ibarra Juan Carlos',
                actuacion: 'Despido injustificado',
                estado: 'Pendiente'
            },
            eventAt: in5Days.toISOString(),
            notifyType: 'hours',
            offset: 1,
            notifyAt: this.computeNotifyAt(in5Days.toISOString(), 'hours', 1),
            createdAt: new Date().toISOString(),
            sent: false
        });

        // Recordatorios con estructura completa
        this.notifications.push({
            id: this.uid(),
            eventType: 'recordatorio',
            title: 'Junta de seguimiento de casos',
            expediente: 'Reunión interna',
            detalles: {
                descripcion: 'Sala de juntas, piso 3'
            },
            eventAt: todayLater.toISOString(),
            notifyType: 'datetime',
            offset: 0,
            notifyAt: todayLater.toISOString(),
            createdAt: new Date().toISOString(),
            sent: false
        });

        this.saveNotifications();
        console.log('Datos de demostración cargados');
    }

    // ==================== RENDERIZADO ====================

    /**
     * Renderiza todas las notificaciones
     */
    renderAll() {
        if (!this.contentContainer) return;

        const upcomingNotifications = this.upcoming(50, this.currentFilter);
        const todayNotifications = this.today(this.currentFilter);
        const sentNotifications = this.notifications.filter(n => {
            const passesFilter = (this.currentFilter === 'all' || n.eventType === this.currentFilter);
            return passesFilter && n.sent;
        }).reverse();

        let html = '<div class="space-y-6">';

        // Próximas notificaciones
        if (upcomingNotifications.length > 0) {
            html += this.renderSection('Próximas Notificaciones', 'clock', upcomingNotifications);
        }

        // Notificaciones de hoy
        if (todayNotifications.length > 0) {
            html += this.renderSection('Para Hoy', 'calendar-day', todayNotifications);
        }

        // Historial
        if (sentNotifications.length > 0) {
            html += this.renderSection('Historial', 'history', sentNotifications, false);
        }

        // Mensaje vacío
        if (upcomingNotifications.length === 0 && todayNotifications.length === 0 && sentNotifications.length === 0) {
            html += `
                <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
                    <div class="text-gray-400 mb-4">
                        <i class="fas fa-bell-slash text-5xl"></i>
                    </div>
                    <h3 class="text-lg font-semibold text-gob-gris mb-2">No hay notificaciones</h3>
                    <p class="text-gray-500">No se encontraron notificaciones para mostrar.</p>
                </div>
            `;
        }

        html += '</div>';
        this.contentContainer.innerHTML = html;
    }

    /**
     * Renderiza una sección de notificaciones
     */
    renderSection(title, icon, notifications, showActions = true) {
        let html = `
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden card-shadow">
                <div class="section-header p-4 border-b border-gray-200">
                    <h3 class="text-lg font-bold text-gob-gris font-headings flex items-center gap-2">
                        <i class="fas fa-${icon} text-gob-oro"></i>
                        ${title}
                    </h3>
                </div>
                <div class="p-6">
        `;

        notifications.forEach(n => {
            html += this.renderNotificationCard(n, showActions);
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Renderiza una tarjeta de notificación horizontal
     */
    renderNotificationCard(n, showActions) {
        const typeInfo = this.getEventTypeInfo(n.eventType);
        const notifyDate = new Date(n.notifyAt);
        const when = notifyDate.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        const relativeTime = this.formatRelativeTime(notifyDate);

        // Renderizar detalles específicos según el tipo
        let detailsHTML = '';
        
        if (n.eventType === 'audiencia' && n.detalles) {
            // Audiencias: Juzgado, Representante, Tipo de Juicio
            detailsHTML = `
                <div class="horizontal-details">
                    ${n.detalles.juzgado ? `
                        <div class="horizontal-detail">
                            <span class="horizontal-label">Juzgado</span>
                            <span class="horizontal-value">${n.detalles.juzgado}</span>
                        </div>
                    ` : ''}
                    ${n.detalles.representante ? `
                        <div class="horizontal-detail">
                            <span class="horizontal-label">Representante</span>
                            <span class="horizontal-value">${n.detalles.representante}</span>
                        </div>
                    ` : ''}
                    ${n.detalles.tipoJuicio ? `
                        <div class="horizontal-detail">
                            <span class="horizontal-label">Tipo de Juicio</span>
                            <span class="horizontal-value">${n.detalles.tipoJuicio}</span>
                        </div>
                    ` : ''}
                </div>
            `;
        } else if (n.eventType === 'termino' && n.detalles) {
            // Términos: Partes procesales, Actuación, Estado
            detailsHTML = `
                <div class="horizontal-details">
                    ${n.detalles.partesProcesales ? `
                        <div class="horizontal-detail">
                            <span class="horizontal-label">Partes procesales</span>
                            <span class="horizontal-value">${n.detalles.partesProcesales}</span>
                        </div>
                    ` : ''}
                    ${n.detalles.actuacion ? `
                        <div class="horizontal-detail">
                            <span class="horizontal-label">Actuación</span>
                            <span class="horizontal-value">${n.detalles.actuacion}</span>
                        </div>
                    ` : ''}
                    ${n.detalles.estado ? `
                        <div class="horizontal-detail">
                            <span class="horizontal-label">Estado</span>
                            <span class="horizontal-value">${n.detalles.estado}</span>
                        </div>
                    ` : ''}
                </div>
            `;
        } else if (n.eventType === 'recordatorio' && n.detalles) {
            // Recordatorios: solo descripción
            detailsHTML = `
                <div class="horizontal-details">
                    ${n.detalles.descripcion ? `
                        <div class="horizontal-detail">
                            <span class="horizontal-label">Descripción</span>
                            <span class="horizontal-value">${n.detalles.descripcion}</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        return `
            <div class="horizontal-notification ${n.eventType}" data-id="${n.id}">
                ${showActions ? `
                    <button class="delete-btn" title="Eliminar notificación">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
                <div class="horizontal-icon ${n.eventType}">
                    <i class="fas ${typeInfo.icon}"></i>
                </div>
                <div class="horizontal-content">
                    <div class="horizontal-header">
                        <div class="horizontal-meta">
                            <span class="badge badge-${n.eventType}">${typeInfo.label}</span>
                            ${n.expediente ? `<span class="text-sm text-gob-plata">${n.expediente}</span>` : ''}
                        </div>
                    </div>
                    <h4 class="horizontal-title">${n.title}</h4>
                    ${detailsHTML}
                    <div class="horizontal-time">
                        <i class="fas fa-clock text-gob-guinda"></i>
                        <span class="time-text">${relativeTime} •</span>
                        <span class="time-date">${when}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene información del tipo de evento
     */
    getEventTypeInfo(type) {
        const types = {
            audiencia: {
                label: 'Audiencia',
                icon: 'fa-gavel'
            },
            termino: {
                label: 'Término',
                icon: 'fa-hourglass-end'
            },
            asunto: {
                label: 'Asunto',
                icon: 'fa-briefcase'
            },
            recordatorio: {
                label: 'Recordatorio',
                icon: 'fa-sticky-note'
            }
        };
        return types[type] || { label: 'Notificación', icon: 'fa-bell' };
    }

    // ==================== MANEJO DE EVENTOS ====================

    /**
     * Maneja clic en filtros
     */
    handleFilterClick(event) {
        const button = event.target.closest('.btn-filter');
        if (!button) return;

        // Actualizar clases de botones - estilo pills
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active', 'bg-gob-guinda', 'text-white', 'border-gob-guinda');
            btn.classList.add('bg-white', 'text-gob-gris', 'border-gray-300');
        });

        button.classList.remove('bg-white', 'text-gob-gris', 'border-gray-300');
        button.classList.add('active', 'bg-gob-guinda', 'text-white', 'border-gob-guinda');

        // Actualizar filtro y renderizar
        this.currentFilter = button.getAttribute('data-filter') || 'all';
        this.renderAll();
    }

    /**
     * Maneja búsqueda
     */
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        const allCards = document.querySelectorAll('.horizontal-notification');

        allCards.forEach(card => {
            const content = card.textContent.toLowerCase();
            card.style.display = content.includes(searchTerm) ? '' : 'none';
        });
    }

    /**
     * Elimina una notificación con animación
     */
    deleteNotification(button) {
        const card = button.closest('.horizontal-notification');
        if (!card) return;

        const id = card.getAttribute('data-id');

        // Animación
        card.style.opacity = '0';
        card.style.transform = 'translateX(100%)';
        card.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            this.removeNotification(id);
            this.renderAll();
        }, 300);
    }

    // ==================== MODAL ====================

    /**
     * Muestra el modal
     */
    showModal() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            this.modal.classList.add('flex');
            this.form.reset();
            this.handleTipoAlertaChange({ target: { value: 'datetime' } });
        }
    }

    /**
     * Oculta el modal
     */
    hideModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            this.modal.classList.remove('flex');
        }
    }

    /**
     * Maneja cambio en tipo de alerta
     */
    handleTipoAlertaChange(event) {
        const offsetContainer = document.querySelector('#offset-container');
        if (offsetContainer) {
            offsetContainer.style.display = event.target.value === 'datetime' ? 'none' : 'block';
        }
    }

    /**
     * Maneja envío del formulario
     */
    handleSubmit(event) {
        event.preventDefault();

        const tipo = document.querySelector('#notif-tipo').value;
        const titulo = document.querySelector('#notif-titulo').value;
        const detalles = document.querySelector('#notif-detalles').value;
        const expediente = document.querySelector('#notif-expediente').value;
        const fechaEvento = document.querySelector('#notif-fecha-evento').value;
        const horaEvento = document.querySelector('#notif-hora-evento').value || '09:00';
        const tipoAlerta = document.querySelector('#notif-tipo-alerta').value;
        const offset = document.querySelector('#notif-offset').value;

        if (!tipo || !titulo || !fechaEvento) {
            alert('Por favor complete los campos obligatorios');
            return;
        }

        const eventAtISO = new Date(`${fechaEvento}T${horaEvento}`).toISOString();

        this.addNotification({
            eventType: tipo,
            title: titulo,
            details: detalles,
            expediente: expediente,
            eventAtISO: eventAtISO,
            notifyType: tipoAlerta,
            offset: offset
        });

        this.renderAll();
        this.hideModal();
    }

    /**
     * Inicia actualización automática
     */
    startAutoUpdate() {
        this.updateInterval = setInterval(() => {
            this.renderAll();
        }, 60000); // Actualizar cada minuto
    }

    /**
     * Detiene actualización automática
     */
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Inicializar módulo cuando el DOM esté listo
let notificacionesModule;

document.addEventListener('DOMContentLoaded', () => {
    notificacionesModule = new NotificacionesModule();
    notificacionesModule.init();
});

// Exportar para uso global
window.NotificacionesModule = NotificacionesModule;
window.notificacionesModule = notificacionesModule;

// API Pública compatible con versión anterior
window.Notificaciones = {
    add: (params) => notificacionesModule?.addNotification(params),
    remove: (id) => notificacionesModule?.removeNotification(id),
    markSent: (id) => notificacionesModule?.markSent(id),
    upcoming: (limit, filter) => notificacionesModule?.upcoming(limit, filter),
    today: (filter) => notificacionesModule?.today(filter),
    all: () => notificacionesModule?.notifications || []
};
