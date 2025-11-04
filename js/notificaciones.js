// js/notificaciones.js
// Gestión de notificaciones en localStorage

(function(window){
    const STORAGE_KEY = 'jl_notifications_v1';

    function uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2,8);
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
        // eventISO is ISO datetime string
        const ev = new Date(eventISO);
        if (type === 'days') {
            ev.setDate(ev.getDate() - Number(offset));
        } else if (type === 'hours') {
            ev.setHours(ev.getHours() - Number(offset));
        }
        return ev.toISOString();
    }

    function upcoming(limit = 50) {
        const now = new Date();
        return load()
            .filter(n => !n.sent && new Date(n.notifyAt) >= now)
            .sort((a,b) => new Date(a.notifyAt) - new Date(b.notifyAt))
            .slice(0, limit);
    }

    function today() {
        const start = new Date(); start.setHours(0,0,0,0);
        const end = new Date(); end.setHours(23,59,59,999);
        return load()
            .filter(n => {
                const t = new Date(n.notifyAt);
                return t >= start && t <= end;
            })
            .sort((a,b) => new Date(a.notifyAt) - new Date(b.notifyAt));
    }

    // UI helpers used by notificaciones.html
    function renderList(containerId, items, showActions = true) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = '';
        if (!items || items.length === 0) {
            el.innerHTML = '<p class="empty-state">No hay notificaciones</p>';
            return;
        }
        items.forEach(n => {
            const div = document.createElement('div');
            div.className = 'notification-item';
            const when = new Date(n.notifyAt).toLocaleString();
            div.innerHTML = `
                <div class="notification-main">
                    <div class="notification-meta"><strong>${n.eventType === 'audiencia' ? 'Audiencia' : 'Término'}</strong> — ${n.title || n.expediente || ''}</div>
                    <div class="notification-when">Notificar: ${when} (${n.notifyType === 'days' ? n.offset+' días' : n.offset+' horas'})</div>
                </div>
            `;
            if (showActions) {
                const actions = document.createElement('div');
                actions.className = 'notification-actions';
                const btnSent = document.createElement('button');
                btnSent.className = 'btn btn-success';
                btnSent.textContent = 'Marcar como recibido';
                btnSent.onclick = () => { markSent(n.id); renderAll(); };
                const btnDel = document.createElement('button');
                btnDel.className = 'btn btn-danger';
                btnDel.textContent = 'Eliminar';
                btnDel.onclick = () => { removeNotification(n.id); renderAll(); };
                actions.appendChild(btnSent);
                actions.appendChild(btnDel);
                div.appendChild(actions);
            }
            el.appendChild(div);
        });
    }

    function renderAll() {
        renderList('upcoming-list', upcoming(50), true);
        renderList('today-list', today(), true);
        renderList('sent-list', load().filter(n => n.sent).reverse(), false);
    }

    function initNotificaciones() {
        renderAll();
        // live update every 60s
        setInterval(() => renderAll(), 60*1000);
    }

    // Public API
    window.Notificaciones = {
        add: function({eventType, title, expediente, eventAtISO, notifyType, offset}) {
            if (!eventAtISO || !notifyType || !offset) return null;
            const notifyAt = computeNotifyAt(eventAtISO, notifyType, offset);
            const n = {
                id: uid(),
                eventType: eventType || 'termino',
                title: title || '',
                expediente: expediente || '',
                eventAt: eventAtISO,
                notifyType: notifyType,
                offset: Number(offset),
                notifyAt: notifyAt,
                createdAt: new Date().toISOString(),
                sent: false
            };
            addNotification(n);
            return n;
        },
        all: load,
        remove: removeNotification,
        markSent: markSent,
        upcoming: upcoming,
        today: today,
        init: initNotificaciones
    };

    // auto-init on pages that include this file
    document.addEventListener('DOMContentLoaded', function(){
        if (document.getElementById('upcoming-list') || document.getElementById('today-list')) {
            initNotificaciones();
        }
    });

})(window);
