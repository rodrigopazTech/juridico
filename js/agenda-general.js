// Lógica para la página de Agenda General
class AgendaGeneralManager {
    constructor() {
        this.eventos = [];
        this.filtrosActivos = {};
        this.vistaActual = 'todos';
        this.semanaActual = new Date();
        this.init();
    }

    init() {
        this.cargarEventos();
        this.inicializarEventos();
        this.mostrarVistaSemana();
        this.actualizarEstadisticas();
    }

    cargarEventos() {
        // Datos de ejemplo - en producción vendrían de una API
        this.eventos = [
            {
                id: 1,
                tipo: 'audiencia',
                titulo: 'Audiencia Inicial - Ortega Ibarra',
                fecha: '2025-01-20',
                hora: '10:00',
                expediente: '2375/2025',
                materia: 'Laboral',
                tribunal: 'Primer Tribunal Colegiado',
                prioridad: 'Alta',
                estado: 'pendiente',
                descripcion: 'Primera audiencia para fijar posturas'
            },
            {
                id: 2,
                tipo: 'termino',
                titulo: 'Término para Pruebas - Valdez Sánchez',
                fecha: '2025-01-20',
                hora: '14:00',
                expediente: '2012/2025',
                materia: 'Penal',
                tribunal: 'Segundo Tribunal',
                prioridad: 'Media',
                estado: 'pendiente',
                descripcion: 'Vencimiento para presentar pruebas documentales'
            },
            {
                id: 3,
                tipo: 'audiencia',
                titulo: 'Audiencia Intermedia - Sosa Uc',
                fecha: '2025-01-22',
                hora: '09:30',
                expediente: '1595/2025',
                materia: 'Mercantil',
                tribunal: 'Tercer Tribunal',
                prioridad: 'Alta',
                estado: 'pendiente',
                descripcion: 'Audiencia para presentación de testigos'
            },
            {
                id: 4,
                tipo: 'termino',
                titulo: 'Término de Alegatos - Rodríguez Pérez',
                fecha: '2025-01-18',
                hora: '16:00',
                expediente: '2890/2025',
                materia: 'Civil',
                tribunal: 'Cuarto Tribunal',
                prioridad: 'Baja',
                estado: 'vencido',
                descripcion: 'Plazo para presentar alegatos finales'
            },
            {
                id: 5,
                tipo: 'audiencia',
                titulo: 'Audiencia de Conciliación - García López',
                fecha: '2025-01-25',
                hora: '11:00',
                expediente: '3124/2025',
                materia: 'Laboral',
                tribunal: 'Primer Tribunal Colegiado',
                prioridad: 'Media',
                estado: 'pendiente',
                descripcion: 'Intento de conciliación entre las partes'
            }
        ];

        this.mostrarEventos();
    }

    inicializarEventos() {
        // Controles de vista
        document.querySelectorAll('.view-controls .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.cambiarVista(e.target.getAttribute('data-view'));
            });
        });

        // Navegación de semanas
        document.getElementById('prev-week').addEventListener('click', () => {
            this.cambiarSemana(-7);
        });

        document.getElementById('next-week').addEventListener('click', () => {
            this.cambiarSemana(7);
        });

        // Filtros
        this.configurarFiltros();

        // Búsqueda
        document.getElementById('search-agenda').addEventListener('input', (e) => {
            this.filtrosActivos.busqueda = e.target.value;
            this.mostrarEventos();
        });

        // Modal
        this.configurarModal();
    }

    cambiarVista(vista) {
        this.vistaActual = vista;
        
        // Actualizar botones activos
        document.querySelectorAll('.view-controls .btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-view') === vista) {
                btn.classList.add('active');
            }
        });

        this.mostrarEventos();
    }

    cambiarSemana(dias) {
        this.semanaActual.setDate(this.semanaActual.getDate() + dias);
        this.mostrarVistaSemana();
        this.mostrarEventos();
    }

    mostrarVistaSemana() {
        const grid = document.getElementById('days-grid');
        const inicioSemana = this.getInicioSemana(this.semanaActual);
        
        let html = '';
        
        for (let i = 0; i < 7; i++) {
            const fecha = new Date(inicioSemana);
            fecha.setDate(inicioSemana.getDate() + i);
            
            const esHoy = this.esMismoDia(fecha, new Date());
            const eventosDia = this.obtenerEventosDia(fecha);
            
            html += `
                <div class="day-column ${esHoy ? 'day-today' : ''}">
                    <div class="day-header">
                        <div class="day-name">${this.getNombreDia(fecha)}</div>
                        <div class="day-number">${fecha.getDate()}</div>
                    </div>
                    <div class="day-events">
                        ${eventosDia.length > 0 ? 
                            eventosDia.map(evento => this.generarEventoHTML(evento)).join('') :
                            '<div class="empty-day"><i class="fas fa-calendar-plus"></i><p>Sin eventos</p></div>'
                        }
                    </div>
                </div>
            `;
        }
        
        grid.innerHTML = html;
        this.actualizarTituloSemana(inicioSemana);
    }

    mostrarEventos() {
        const eventosFiltrados = this.aplicarFiltros(this.eventos);
        
        // Actualizar vista de días
        this.mostrarVistaSemana();
        
        // Actualizar vista de lista
        this.mostrarVistaLista(eventosFiltrados);
        
        // Actualizar eventos de hoy
        this.mostrarEventosHoy();
        
        // Actualizar estadísticas
        this.actualizarEstadisticas();
    }

    mostrarVistaLista(eventos) {
        const lista = document.getElementById('agenda-list');
        
        // Agrupar eventos por fecha
        const eventosPorFecha = this.agruparPorFecha(eventos);
        
        let html = '';
        
        Object.keys(eventosPorFecha).sort().forEach(fecha => {
            const eventosDia = eventosPorFecha[fecha];
            const fechaObj = new Date(fecha);
            const esHoy = this.esMismoDia(fechaObj, new Date());
            
            html += `
                <div class="agenda-day-group">
                    <div class="agenda-day-header ${esHoy ? 'hoy' : ''}">
                        <div class="agenda-date">
                            ${this.formatFechaCompleta(fechaObj)}
                            ${esHoy ? ' - <strong>HOY</strong>' : ''}
                        </div>
                        <div class="agenda-day-count">${eventosDia.length} eventos</div>
                    </div>
                    <div class="agenda-events">
                        ${eventosDia.map(evento => this.generarEventoListaHTML(evento)).join('')}
                    </div>
                </div>
            `;
        });
        
        lista.innerHTML = html || '<div class="empty-state">No hay eventos que coincidan con los filtros</div>';
    }

    mostrarEventosHoy() {
        const hoy = new Date();
        const eventosHoy = this.obtenerEventosDia(hoy);
        const container = document.getElementById('hoy-events');
        const count = document.getElementById('hoy-count');
        
        count.textContent = eventosHoy.length;
        
        if (eventosHoy.length === 0) {
            container.innerHTML = `
                <div class="hoy-empty">
                    <i class="fas fa-sun"></i>
                    <h4>¡Día despejado!</h4>
                    <p>No tienes eventos programados para hoy</p>
                </div>
            `;
            return;
        }
        
        let html = eventosHoy.map(evento => this.generarEventoHoyHTML(evento)).join('');
        container.innerHTML = html;
    }

    generarEventoHTML(evento) {
        const esUrgente = this.esEventoUrgente(evento);
        const estaVencido = evento.estado === 'vencido';
        
        return `
            <div class="evento-item ${evento.tipo} ${esUrgente ? 'urgente' : ''} ${estaVencido ? 'vencido' : ''}" 
                 data-id="${evento.id}">
                <div class="evento-hora">
                    <i class="fas fa-clock"></i> ${evento.hora}
                </div>
                <div class="evento-titulo">${evento.titulo}</div>
                <div class="evento-meta">
                    <span>${evento.expediente}</span>
                    <span>${evento.tribunal}</span>
                </div>
                <div class="evento-prioridad prioridad-${evento.prioridad.toLowerCase()}">
                    ${evento.prioridad}
                </div>
            </div>
        `;
    }

    generarEventoListaHTML(evento) {
        const esUrgente = this.esEventoUrgente(evento);
        const estaVencido = evento.estado === 'vencido';
        
        return `
            <div class="evento-item ${evento.tipo} ${esUrgente ? 'urgente' : ''} ${estaVencido ? 'vencido' : ''}" 
                 data-id="${evento.id}">
                <div class="evento-hora">
                    <i class="fas fa-clock"></i> ${evento.hora}
                    <span class="evento-tipo-badge">${evento.tipo === 'audiencia' ? 'Audiencia' : 'Término'}</span>
                </div>
                <div class="evento-titulo">${evento.titulo}</div>
                <div class="evento-meta">
                    <span><strong>Expediente:</strong> ${evento.expediente}</span>
                    <span><strong>Tribunal:</strong> ${evento.tribunal}</span>
                    <span><strong>Materia:</strong> ${evento.materia}</span>
                </div>
                <div class="evento-prioridad prioridad-${evento.prioridad.toLowerCase()}">
                    ${evento.prioridad}
                </div>
            </div>
        `;
    }

    generarEventoHoyHTML(evento) {
        const esUrgente = this.esEventoUrgente(evento);
        
        return `
            <div class="evento-item ${evento.tipo} ${esUrgente ? 'urgente' : ''}" data-id="${evento.id}">
                <div class="evento-hora">
                    <i class="fas fa-clock"></i> ${evento.hora}
                </div>
                <div class="evento-titulo">${evento.titulo}</div>
                <div class="evento-meta">
                    <span>${evento.expediente} - ${evento.tribunal}</span>
                </div>
                <div class="evento-prioridad prioridad-${evento.prioridad.toLowerCase()}">
                    ${evento.prioridad}
                </div>
            </div>
        `;
    }

    configurarFiltros() {
        const filtros = ['filter-fecha', 'filter-prioridad', 'filter-materia', 'filter-estado'];
        
        filtros.forEach(filtroId => {
            const filtro = document.getElementById(filtroId);
            if (filtro) {
                filtro.addEventListener('change', (e) => {
                    const campo = filtroId.replace('filter-', '');
                    this.filtrosActivos[campo] = e.target.value || null;
                    this.mostrarEventos();
                });
            }
        });
    }

    configurarModal() {
        const modal = document.getElementById('modal-evento');
        const closeBtn = document.getElementById('close-modal-evento');
        const cerrarBtn = document.getElementById('btn-cerrar-evento');

        // Cerrar modal
        [closeBtn, cerrarBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => {
                    modal.style.display = 'none';
                });
            }
        });

        // Cerrar al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Configurar eventos para abrir modal
        document.addEventListener('click', (e) => {
            const eventoItem = e.target.closest('.evento-item');
            if (eventoItem) {
                const eventoId = parseInt(eventoItem.getAttribute('data-id'));
                this.mostrarDetallesEvento(eventoId);
            }
        });
    }

    mostrarDetallesEvento(eventoId) {
        const evento = this.eventos.find(e => e.id === eventoId);
        if (!evento) return;

        const modal = document.getElementById('modal-evento');
        const titulo = document.getElementById('modal-evento-title');
        const detalles = document.getElementById('evento-detalles');

        titulo.textContent = evento.titulo;

        detalles.innerHTML = `
            <div class="detalle-item">
                <div class="detalle-label">Tipo:</div>
                <div class="detalle-value">
                    <span class="badge ${evento.tipo === 'audiencia' ? 'badge-audiencia' : 'badge-termino'}">
                        ${evento.tipo === 'audiencia' ? 'Audiencia' : 'Término'}
                    </span>
                </div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Fecha y Hora:</div>
                <div class="detalle-value">${this.formatFechaCompleta(new Date(evento.fecha))} a las ${evento.hora}</div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Expediente:</div>
                <div class="detalle-value">${evento.expediente}</div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Tribunal:</div>
                <div class="detalle-value">${evento.tribunal}</div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Materia:</div>
                <div class="detalle-value">${evento.materia}</div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Prioridad:</div>
                <div class="detalle-value">
                    <span class="evento-prioridad prioridad-${evento.prioridad.toLowerCase()}">
                        ${evento.prioridad}
                    </span>
                </div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Estado:</div>
                <div class="detalle-value">
                    <span class="badge ${evento.estado === 'pendiente' ? 'badge-warning' : 'badge-secondary'}">
                        ${evento.estado === 'pendiente' ? 'Pendiente' : 'Vencido'}
                    </span>
                </div>
            </div>
            <div class="detalle-item">
                <div class="detalle-label">Descripción:</div>
                <div class="detalle-value">${evento.descripcion}</div>
            </div>
        `;

        modal.style.display = 'flex';
    }

    aplicarFiltros(eventos) {
        let filtrados = eventos;

        // Filtrar por tipo de vista
        if (this.vistaActual !== 'todos') {
            filtrados = filtrados.filter(evento => evento.tipo === this.vistaActual);
        }

        // Filtrar por fecha
        if (this.filtrosActivos.fecha) {
            filtrados = this.filtrarPorFecha(filtrados, this.filtrosActivos.fecha);
        }

        // Filtrar por prioridad
        if (this.filtrosActivos.prioridad) {
            filtrados = filtrados.filter(evento => evento.prioridad === this.filtrosActivos.prioridad);
        }

        // Filtrar por materia
        if (this.filtrosActivos.materia) {
            filtrados = filtrados.filter(evento => evento.materia === this.filtrosActivos.materia);
        }

        // Filtrar por estado
        if (this.filtrosActivos.estado) {
            filtrados = filtrados.filter(evento => evento.estado === this.filtrosActivos.estado);
        }

        // Filtrar por búsqueda
        if (this.filtrosActivos.busqueda) {
            const termino = this.filtrosActivos.busqueda.toLowerCase();
            filtrados = filtrados.filter(evento => 
                evento.titulo.toLowerCase().includes(termino) ||
                evento.expediente.toLowerCase().includes(termino) ||
                evento.tribunal.toLowerCase().includes(termino) ||
                evento.materia.toLowerCase().includes(termino)
            );
        }

        return filtrados;
    }

    filtrarPorFecha(eventos, filtro) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        switch (filtro) {
            case 'hoy':
                return eventos.filter(evento => this.esMismoDia(new Date(evento.fecha), hoy));
            case 'semana':
                const inicioSemana = this.getInicioSemana(hoy);
                const finSemana = new Date(inicioSemana);
                finSemana.setDate(inicioSemana.getDate() + 6);
                return eventos.filter(evento => {
                    const fechaEvento = new Date(evento.fecha);
                    return fechaEvento >= inicioSemana && fechaEvento <= finSemana;
                });
            case 'mes':
                return eventos.filter(evento => {
                    const fechaEvento = new Date(evento.fecha);
                    return fechaEvento.getMonth() === hoy.getMonth() && 
                           fechaEvento.getFullYear() === hoy.getFullYear();
                });
            case 'proximos':
                const en7Dias = new Date(hoy);
                en7Dias.setDate(hoy.getDate() + 7);
                return eventos.filter(evento => {
                    const fechaEvento = new Date(evento.fecha);
                    return fechaEvento >= hoy && fechaEvento <= en7Dias;
                });
            case 'pasados':
                return eventos.filter(evento => new Date(evento.fecha) < hoy);
            default:
                return eventos;
        }
    }

    obtenerEventosDia(fecha) {
        return this.eventos.filter(evento => 
            this.esMismoDia(new Date(evento.fecha), fecha) &&
            this.aplicarFiltros([evento]).length > 0
        );
    }

    actualizarEstadisticas() {
        const audiencias = this.eventos.filter(e => e.tipo === 'audiencia').length;
        const terminos = this.eventos.filter(e => e.tipo === 'termino').length;
        const pendientes = this.eventos.filter(e => e.estado === 'pendiente').length;
        const urgentes = this.eventos.filter(e => this.esEventoUrgente(e)).length;

        document.getElementById('total-audiencias').textContent = audiencias;
        document.getElementById('total-terminos').textContent = terminos;
        document.getElementById('total-pendientes').textContent = pendientes;
        document.getElementById('total-urgentes').textContent = urgentes;
    }

    esEventoUrgente(evento) {
        if (evento.estado === 'vencido') return false;
        
        const fechaEvento = new Date(evento.fecha);
        const hoy = new Date();
        const diferenciaDias = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));
        
        return evento.prioridad === 'Alta' && diferenciaDias <= 3;
    }

    // Utilidades
    getInicioSemana(fecha) {
        const inicio = new Date(fecha);
        const dia = inicio.getDay();
        const diff = inicio.getDate() - dia + (dia === 0 ? -6 : 1);
        inicio.setDate(diff);
        inicio.setHours(0, 0, 0, 0);
        return inicio;
    }

    esMismoDia(fecha1, fecha2) {
        return fecha1.toDateString() === fecha2.toDateString();
    }

    getNombreDia(fecha) {
        const dias = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
        return dias[fecha.getDay()];
    }

    agruparPorFecha(eventos) {
        return eventos.reduce((grupos, evento) => {
            const fecha = evento.fecha;
            if (!grupos[fecha]) {
                grupos[fecha] = [];
            }
            grupos[fecha].push(evento);
            return grupos;
        }, {});
    }

    actualizarTituloSemana(inicioSemana) {
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);
        
        const titulo = `Semana del ${this.formatFechaCorta(inicioSemana)} al ${this.formatFechaCorta(finSemana)}`;
        document.getElementById('current-week').textContent = titulo;
    }

    formatFechaCorta(fecha) {
        return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }

    formatFechaCompleta(fecha) {
        return fecha.toLocaleDateString('es-ES', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Inicializar la aplicación
let agendaGeneral;

function initAgendaGeneral() {
    agendaGeneral = new AgendaGeneralManager();
}