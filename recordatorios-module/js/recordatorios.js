export class RecordatoriosModule {
    constructor() {
        this.data = [];
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
        
        let filtered = this.data.filter(item => {
            return item.titulo.toLowerCase().includes(searchTerm) || (item.detalles || '').toLowerCase().includes(searchTerm);
        }).sort((a, b) => {
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

        const isUrgent = item.prioridad === 'urgent';
        card.classList.add(isUrgent ? 'reminder-urgent' : 'reminder-normal');
        
        const iconBox = clone.querySelector('.js-icon-box');
        iconBox.className = 'js-icon-box w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0 bg-amber-100 text-amber-600';
        
        const icon = clone.querySelector('.js-icon');
        icon.className = `js-icon fas ${isUrgent ? 'fa-exclamation' : 'fa-bell'}`;

        clone.querySelector('.js-title').textContent = item.titulo;
        clone.querySelector('.js-details').textContent = item.detalles || 'Sin detalles.';
        
        const fechaObj = new Date(item.fecha + 'T' + item.hora);
        const fechaStr = this.formatDateRelative(fechaObj);
        clone.querySelector('.js-date-text').textContent = `${fechaStr} • ${item.hora}`;

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
        const titulo = document.getElementById('rec-titulo').value;
        const fecha = document.getElementById('rec-fecha').value;
        const hora = document.getElementById('rec-hora').value;
        const prioridad = document.getElementById('rec-prioridad').value;
        const detalles = document.getElementById('rec-detalles').value;

        if(!titulo || !fecha || !hora) return alert("Faltan datos obligatorios");

        // === GENERAR NOTIFICACIONES AUTOMÁTICAS ===
        this.programarNotificaciones(titulo, fecha, hora, detalles);
        // ==========================================

        const nuevo = {
            id: id ? parseInt(id) : Date.now(),
            titulo, fecha, hora, prioridad, detalles
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

    // === LÓGICA DE NOTIFICACIONES ===
    programarNotificaciones(titulo, fecha, hora, detalles) {
        const eventoDate = new Date(`${fecha}T${hora}`);
        const fechaEventoStr = eventoDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        const now = new Date(); // Hora actual para validar

        // 1. Notificación 1 Día Antes
        const unDiaAntes = new Date(eventoDate);
        unDiaAntes.setDate(eventoDate.getDate() - 1);
        
        // CORRECCIÓN: Solo programar si el momento del aviso está en el futuro
        if (unDiaAntes > now) {
            crearNotificacionGlobal({
                eventType: 'recordatorio',
                title: `Recordatorio: ${titulo}`,
                status: 'Pendiente',
                expediente: '', 
                notifyAt: unDiaAntes.toISOString(),
                detalles: { descripcion: detalles || 'Recordatorio programado' },
                meta: {
                    anticipacion: `mañana ${fechaEventoStr}`, // "es en mañana 23 oct"
                    fechaEvento: eventoDate.toISOString()
                }
            });
        }

        // 2. Notificación 1 Hora Antes
        const unaHoraAntes = new Date(eventoDate);
        unaHoraAntes.setHours(eventoDate.getHours() - 1);

        // CORRECCIÓN: Solo programar si aún no ha pasado la hora del aviso
        if (unaHoraAntes > now) {
            crearNotificacionGlobal({
                eventType: 'recordatorio',
                title: `Recordatorio: ${titulo}`,
                status: 'Pendiente',
                expediente: '', 
                notifyAt: unaHoraAntes.toISOString(),
                detalles: { descripcion: detalles || 'Recordatorio programado' },
                meta: {
                    anticipacion: `una hora`, // "es en una hora"
                    fechaEvento: eventoDate.toISOString()
                }
            });
        }
    }
    
    updateStats() {
        const hoyStr = new Date().toISOString().split('T')[0];
        const hoyCount = this.data.filter(i => i.fecha === hoyStr).length;
        const urgentesCount = this.data.filter(i => i.prioridad === 'urgent').length;
        const totalCount = this.data.length;

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

// === HELPER PARA CREAR NOTIFICACIONES (Igual que en otros módulos) ===
function crearNotificacionGlobal(datos) {
    const KEY = 'jl_notifications_v4';
    const notificaciones = JSON.parse(localStorage.getItem(KEY)) || [];
    
    const nuevaNotif = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        eventType: datos.eventType,
        title: datos.title,
        expediente: datos.expediente,
        status: datos.status,
        detalles: datos.detalles || {},
        notifyAt: datos.notifyAt || new Date().toISOString(),
        meta: datos.meta || {},
        read: false
    };
    
    notificaciones.push(nuevaNotif);
    localStorage.setItem(KEY, JSON.stringify(notificaciones));
}