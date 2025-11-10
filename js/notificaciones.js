// js/notificaciones.js
// Gestión de notificaciones en localStorage

(function(window){
    const STORAGE_KEY = 'jl_notifications_v1';
    let currentFilter = 'all'; // Estado del filtro actual

    function uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
    }

    // AÑADIDO: Helper para tiempo relativo
    function formatRelativeTime(date) {
        const now = new Date();
        const notifyDate = new Date(date);
        const diff = notifyDate - now; // Diferencia en milisegundos

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

    function load() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch(e) {
            console.error('Error parsing notifications', e);
            return [];
        }
    }

    function save(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    function addNotification(notification) {
        const list = load();
        list.push(notification);
        save(list);
        return notification;
    }

    function removeNotification(id) {
        let list = load();
        list = list.filter(n => n.id !== id);
        save(list);
    }

    function markSent(id) {
        const list = load();
        const item = list.find(n => n.id === id);
        if (item) {
            item.sent = true;
            item.sentAt = new Date().toISOString();
            save(list);
        }
    }

    function computeNotifyAt(eventISO, type, offset) {
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

    function upcoming(limit = 50, filter = 'all') {
        const now = new Date();
        return load()
            .filter(n => {
                const passesFilter = (filter === 'all' || n.eventType === filter);
                return passesFilter && !n.sent && new Date(n.notifyAt) >= now;
            })
            .sort((a,b) => new Date(a.notifyAt) - new Date(b.notifyAt))
            .slice(0, limit);
    }

    function today(filter = 'all') {
        const start = new Date(); start.setHours(0,0,0,0);
        const end = new Date(); end.setHours(23,59,59,999);
        return load()
            .filter(n => {
                const t = new Date(n.notifyAt);
                const passesFilter = (filter === 'all' || n.eventType === filter);
                return passesFilter && t >= start && t <= end;
            })
            .sort((a,b) => new Date(a.notifyAt) - new Date(b.notifyAt));
    }

    // MODIFICADO: renderList
    function renderList(containerId, items, showActions = true) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '';
        if (!items || items.length === 0) {
            el.innerHTML = '<p class="empty-state">No hay notificaciones</p>';
            return;
        }

        // Helper para iconos y etiquetas
        function getEventTypeInfo(type) {
            switch(type) {
                case 'audiencia': return {label: 'Audiencia', icon: 'fa-gavel'};
                case 'termino': return {label: 'Término', icon: 'fa-hourglass-end'};
                case 'asunto': return {label: 'Asunto', icon: 'fa-briefcase'};
                case 'recordatorio': return {label: 'Recordatorio', icon: 'fa-sticky-note'};
                default: return {label: 'Notificación', icon: 'fa-bell'};
            }
        }

        items.forEach(n => {
            const div = document.createElement('div');
            div.className = `notification-item event-${n.eventType}`;
            
            // MODIFICADO: Lógica de 'cuándo'
            const notifyDate = new Date(n.notifyAt);
            // Formato más corto para la fecha absoluta
            const when = notifyDate.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            const relativeTime = formatRelativeTime(notifyDate); // "en 4 horas"
            
            const typeInfo = getEventTypeInfo(n.eventType);

            // Estructura HTML mejorada
            div.innerHTML = `
                <div class="notification-icon"><i class="fas ${typeInfo.icon}"></i></div>
                <div class="notification-main">
                    <div class="notification-meta">
                        <strong>${typeInfo.label}</strong>
                        ${n.expediente ? ` — ${n.expediente}` : ''}
                    </div>
                    <div class="notification-title">${n.title}</div>
                    
                    ${n.details ? `<div class="notification-details">${n.details}</div>` : ''}

                    <div class="notification-when">
                        <i class="fas fa-bell"></i> ${relativeTime} 
                        <span class="when-full">(${when})</span>
                    </div>
                </div>
            `;
            
            // MODIFICADO: Lógica de botones de acción
            if (showActions) {
                const actions = document.createElement('div');
                actions.className = 'notification-actions';
                
                // --- Botón 'Marcar como recibido' ELIMINADO ---
                
                const btnDel = document.createElement('button');
                btnDel.className = 'btn btn-danger';
                btnDel.textContent = 'Eliminar';
                btnDel.onclick = () => { removeNotification(n.id); renderAll(); };
                
                actions.appendChild(btnDel);
                div.appendChild(actions);
            }
            el.appendChild(div);
        });
    }

    function renderAll() {
        renderList('upcoming-list', upcoming(50, currentFilter), true);
        renderList('today-list', today(currentFilter), true);
        renderList('sent-list', load().filter(n => {
                const passesFilter = (currentFilter === 'all' || n.eventType === currentFilter);
                return passesFilter && n.sent;
            }).reverse(), 
            false);
    }

    // MODIFICADO: seedDemoData con mejores descripciones
    function seedDemoData() {
        if (load().length > 0) return; // Ya tiene datos

        console.log('Cargando datos de demostración...');
        const now = new Date();
        const in3Days = new Date(now); in3Days.setDate(now.getDate() + 3);
        const in4Hours = new Date(now); in4Hours.setHours(now.getHours() + 4);
        const in4Days = new Date(now); in4Days.setDate(now.getDate() + 4);
        const in7Hours = new Date(now); in7Hours.setHours(now.getHours() + 7);
        const todayLater = new Date(now); todayLater.setHours(now.getHours() + 2);
        
        const nextFriday = new Date(now);
        nextFriday.setDate(nextFriday.getDate() + (5 + 7 - nextFriday.getDay()) % 7);
        nextFriday.setHours(10, 0, 0, 0);

        // 1. Audiencias
        Notificaciones.add({
            eventType: 'audiencia', title: 'Pedro programó la Audiencia 3173', expediente: 'EXP-1001',
            eventAtISO: in3Days.toISOString(), notifyType: 'days', offset: 3
        });
        Notificaciones.add({
            eventType: 'audiencia', title: 'Audiencia 5232 en 4 horas', expediente: 'EXP-1002',
            details: 'Lugar: Sala 3, Juzgado 5.',
            eventAtISO: in4Hours.toISOString(), notifyType: 'hours', offset: 4
        });
        Notificaciones.add({
            eventType: 'audiencia', title: 'Audiencia 1233 (Hoy)', expediente: 'EXP-1003',
            details: 'Juan es el abogado que compadece.',
            eventAtISO: todayLater.toISOString(), notifyType: 'hours', offset: 2
        });

        // 2. Términos
        Notificaciones.add({
            eventType: 'termino', title: 'Rosa programó el Término 31234', expediente: 'EXP-2001',
            eventAtISO: in4Days.toISOString(), notifyType: 'days', offset: 4
        });
        Notificaciones.add({
            eventType: 'termino', title: 'Vencimiento del Término 53534', expediente: 'EXP-2002',
            details: 'Presentar escrito de contestación.',
            eventAtISO: in7Hours.toISOString(), notifyType: 'hours', offset: 7
        });

        // 3. Asuntos
        Notificaciones.add({
            eventType: 'asunto',
            title: 'Asignación de Asunto 4184',
            expediente: 'AS-4184',
            details: 'La Directora asignó a Miguel como responsable.',
            eventAtISO: new Date().toISOString(), // Notificar ahora
            notifyType: 'datetime'
        });

        // 4. Recordatorios
        Notificaciones.add({
            eventType: 'recordatorio',
            title: 'Junta de equipo',
            details: 'Revisión semanal de casos.',
            eventAtISO: nextFriday.toISOString(),
            notifyType: 'datetime'
        });
        
        // Demo de algo enviado
        const sentDemo = {
            id: uid(), eventType: 'audiencia', title: 'Audiencia pasada 1111', expediente: 'EXP-OLD',
            details: 'Cliente: Juan Pérez',
            eventAt: new Date().toISOString(), notifyType: 'days', offset: 7,
            notifyAt: new Date(now.setDate(now.getDate() - 3)).toISOString(), // Hace 3 días
            createdAt: new Date().toISOString(), sent: true, sentAt: new Date().toISOString()
        };
        addNotification(sentDemo);
    }

    function initNotificaciones() {
        seedDemoData();
        document.querySelectorAll('.btn-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderAll();
            });
        });

        renderAll();
        setInterval(() => renderAll(), 60*1000);
    }

    // Public API
    window.Notificaciones = {
        // MODIFICADO: Añadido 'details'
        add: function({eventType, title, details, expediente, eventAtISO, notifyType, offset}) {
            let notifyAt;
            if (notifyType === 'datetime') {
                notifyAt = computeNotifyAt(eventAtISO, 'datetime', 0);
            } else if (!eventAtISO || !notifyType || !offset) {
                return null;
            } else {
                notifyAt = computeNotifyAt(eventAtISO, notifyType, offset);
            }
            
            const n = {
                id: uid(),
                eventType: eventType || 'recordatorio',
                title: title || '',
                details: details || '', // AÑADIDO
                expediente: expediente || '',
                eventAt: eventAtISO || new Date().toISOString(),
                notifyType: notifyType || 'datetime',
                offset: Number(offset) || 0,
                notifyAt: notifyAt,
                createdAt: new Date().toISOString(),
                sent: false
            };
            addNotification(n);
            renderAll();
            return n;
        },
        all: load,
        remove: (id) => { removeNotification(id); renderAll(); },
        markSent: (id) => { markSent(id); renderAll(); },
        upcoming: upcoming,
        today: today,
        init: initNotificaciones
    };

    // auto-init
    document.addEventListener('DOMContentLoaded', function(){
        if (document.getElementById('upcoming-list') || document.getElementById('today-list')) {
            initNotificaciones();
        }
    });

})(window);