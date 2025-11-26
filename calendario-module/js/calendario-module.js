/**
 * Calendario Module
 * Manages calendar views and events (Audiencias, Términos, Recordatorios)
 */
export class CalendarioModule {
  constructor() {
    this.currentDate = new Date();
    this.currentView = 'month'; // 'day', 'week', 'month'
    this.eventos = [];
    this.expedientes = [];
    this.usuarios = [];
    this.gerencias = [];
    this.filters = {
      tipo: '',
      gerenciaId: '',
      usuarioId: ''
    };
    this.currentEventId = null;
    this.editingEvent = null;
    
    this.gobColors = {
      audiencia: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800', solid: 'bg-blue-500' },
      termino: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', solid: 'bg-green-500' },
      recordatorio: { bg: 'bg-yellow-100', border: 'border-yellow-600', text: 'text-yellow-800', solid: 'bg-yellow-600' }
    };
  }

  init() {
    console.log('Initializing Calendario Module...');
    this.loadData();
    this.setupEventListeners();
    this.populateFilters();
    this.renderCalendar();
    console.log('Calendario Module initialized successfully');
  }

  // ==================== DATA LOADING ====================
  loadData() {
    // Load from localStorage
    this.expedientes = JSON.parse(localStorage.getItem('expedientesData')) || [];
    this.usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    this.gerencias = JSON.parse(localStorage.getItem('gerencias')) || this.getSampleGerencias();
    
    // Load events (merged from different sources)
    const audiencias = JSON.parse(localStorage.getItem('audiencias')) || this.getSampleAudiencias();
    const terminos = JSON.parse(localStorage.getItem('terminos')) || this.getSampleTerminos();
    const recordatorios = JSON.parse(localStorage.getItem('recordatorios')) || this.getSampleRecordatorios();
    
    // Merge all events
    this.eventos = [
      ...audiencias.map(a => ({ ...a, tipo: 'audiencia' })),
      ...terminos.map(t => ({ ...t, tipo: 'termino' })),
      ...recordatorios.map(r => ({ ...r, tipo: 'recordatorio' }))
    ];
    
    console.log('Loaded:', {
      eventos: this.eventos.length,
      expedientes: this.expedientes.length,
      usuarios: this.usuarios.length,
      gerencias: this.gerencias.length
    });
  }

  getSampleGerencias() {
    return [
      { id: 1, nombre: 'Gerencia de Civil, Mercantil, Fiscal y Administrativo' },
      { id: 2, nombre: 'Gerencia Laboral y Penal' },
      { id: 3, nombre: 'Gerencia de Transparencia y Amparo' }
    ];
  }

  getSampleAudiencias() {
    return [
      { 
        id: 1, 
        titulo: 'Audiencia Inicial', 
        fecha: '2025-11-25', 
        hora: '09:00', 
        estado: 'Pendiente',
        expediente: '2354/2025',
        materia: 'Civil',
        organoJurisdiccional: 'Juzgado Primero de lo Civil',
        tribunal: 'Juzgado Primero de lo Civil',
        actor: 'Gómez Rivera Laura',
        demandado: 'Martínez Contreras Luis',
        tipoAudiencia: 'Inicial',
        sala: 'Sala 2, Planta Baja',
        abogadoComparece: 'Lic. Ana Patricia Morales',
        prioridad: 'Alta',
        atendida: false,
        gerenciaId: 1, 
        usuarioId: 1
      },
      { 
        id: 2, 
        titulo: 'Audiencia Intermedia', 
        fecha: '2025-11-26', 
        hora: '11:00', 
        estado: 'Pendiente',
        expediente: '5421/2025',
        materia: 'Laboral',
        organoJurisdiccional: 'Tribunal Laboral Regional Norte',
        actor: 'Ortega Ibarra Juan Carlos',
        demandado: 'Empresa Constructora S.A. de C.V.',
        tipoAudiencia: 'Intermedia',
        sala: 'Sala A',
        abogadoComparece: 'Lic. Carlos Hernández López',
        prioridad: 'Media',
        atendida: false,
        gerenciaId: 2, 
        usuarioId: 3
      },
      { 
        id: 3, 
        titulo: 'Audiencia Testimonial', 
        fecha: '2025-11-27', 
        hora: '10:00', 
        estado: 'Desahogada',
        expediente: '1987/2025',
        materia: 'Penal',
        organoJurisdiccional: 'Juzgado Segundo en Materia Penal',
        actor: 'Fiscalía del Estado',
        demandado: 'Hernández Rivas Jorge',
        tipoAudiencia: 'Testimonial',
        sala: 'Sala 1',
        abogadoComparece: 'Lic. Fernando Ramírez Torres',
        prioridad: 'Alta',
        atendida: true,
        gerenciaId: 2, 
        usuarioId: 4
      }
    ];
  }

  getSampleTerminos() {
    return [
      { 
        id: 1, 
        titulo: 'Contestación de demanda', 
        fecha: '2025-11-25', 
        hora: '23:59',
        expediente: '2375/2025',
        actor: 'Juan Pérez',
        actuacion: 'Presentación de contestación de demanda laboral',
        asunto: 'Despido injustificado',
        prestacion: 'Reinstalación',
        fechaIngreso: '2025-11-01',
        estatus: 'Proyectista',
        prioridad: 'Alta',
        gerenciaId: 2, 
        usuarioId: 1
      },
      { 
        id: 2, 
        titulo: 'Presentar pruebas', 
        fecha: '2025-11-27', 
        hora: '18:00',
        expediente: '1090/2024',
        actor: 'Maria Lopez',
        actuacion: 'Presentación de pruebas documentales en juicio de amparo',
        asunto: 'Amparo directo',
        prestacion: 'Protección constitucional',
        fechaIngreso: '2025-10-15',
        estatus: 'Revisión',
        prioridad: 'Alta',
        gerenciaId: 3, 
        usuarioId: 5
      },
      { 
        id: 3, 
        titulo: 'Alegatos finales', 
        fecha: '2025-11-30', 
        hora: '15:00',
        expediente: '5555/2025',
        actor: 'Empresa X S.A.',
        actuacion: 'Presentación de alegatos finales en juicio mercantil',
        asunto: 'Incumplimiento de contrato',
        prestacion: 'Cobro de pesos',
        fechaIngreso: '2025-09-01',
        estatus: 'Gerencia',
        prioridad: 'Media',
        gerenciaId: 1, 
        usuarioId: 2
      }
    ];
  }

  getSampleRecordatorios() {
    return [
      { 
        id: 1, 
        titulo: 'Junta de equipo semanal', 
        detalles: 'Revisión de casos activos y asignación de nuevas tareas', 
        fecha: '2025-11-25', 
        hora: '15:00', 
        estado: 'Activo', 
        gerenciaId: 1, 
        usuarioId: 1 
      },
      { 
        id: 2, 
        titulo: 'Preparar documentación para audiencia', 
        detalles: 'Reunir todas las pruebas documentales y testimoniales necesarias', 
        fecha: '2025-11-26', 
        hora: '10:00', 
        estado: 'Activo', 
        gerenciaId: 2, 
        usuarioId: 3 
      },
      { 
        id: 3, 
        titulo: 'Llamada con cliente', 
        detalles: 'Actualización sobre el estado del proceso y siguientes pasos', 
        fecha: '2025-11-28', 
        hora: '16:00', 
        estado: 'Activo', 
        gerenciaId: 1, 
        usuarioId: 2 
      },
      { 
        id: 4, 
        titulo: 'Revisión de jurisprudencia', 
        detalles: 'Investigar precedentes relevantes para el caso de amparo', 
        fecha: '2025-11-29', 
        hora: '13:00', 
        estado: 'Activo', 
        gerenciaId: 3, 
        usuarioId: 5 
      }
    ];
  }

  // ==================== EVENT LISTENERS ====================
  setupEventListeners() {
    // View switcher
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchView(e.target.closest('.view-btn').dataset.view);
      });
    });

    // Navigation
    document.getElementById('btnToday')?.addEventListener('click', () => this.goToToday());
    document.getElementById('btnPrevious')?.addEventListener('click', () => this.navigatePrevious());
    document.getElementById('btnNext')?.addEventListener('click', () => this.navigateNext());

    // Filters
    document.getElementById('filterTipo')?.addEventListener('change', (e) => {
      this.filters.tipo = e.target.value;
      this.renderCalendar();
    });
    document.getElementById('filterGerencia')?.addEventListener('change', (e) => {
      this.filters.gerenciaId = e.target.value;
      this.renderCalendar();
    });
    document.getElementById('filterUsuario')?.addEventListener('change', (e) => {
      this.filters.usuarioId = e.target.value;
      this.renderCalendar();
    });

    // Create event
    document.getElementById('btnCreateEvent')?.addEventListener('click', () => this.openEventCreateModal());
    
    // Form tipo change
    document.getElementById('inputTipo')?.addEventListener('change', (e) => this.handleTipoChange(e.target.value));
  }

  // ==================== FILTERS ====================
  populateFilters() {
    // Populate Gerencias
    const filterGerencia = document.getElementById('filterGerencia');
    const inputGerencia = document.getElementById('inputGerencia');
    this.gerencias.forEach(g => {
      if (filterGerencia) {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.nombre;
        filterGerencia.appendChild(opt);
      }
      if (inputGerencia) {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.nombre;
        inputGerencia.appendChild(opt);
      }
    });

    // Populate Usuarios
    const filterUsuario = document.getElementById('filterUsuario');
    const inputUsuario = document.getElementById('inputUsuario');
    this.usuarios.forEach(u => {
      if (filterUsuario) {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.nombre;
        filterUsuario.appendChild(opt);
      }
      if (inputUsuario) {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.nombre;
        inputUsuario.appendChild(opt);
      }
    });

    // Populate Expedientes
    const inputExpediente = document.getElementById('inputExpediente');
    this.expedientes.forEach(e => {
      if (inputExpediente) {
        const opt = document.createElement('option');
        opt.value = e.id;
        opt.textContent = `${e.numero} - ${e.descripcion}`;
        inputExpediente.appendChild(opt);
      }
    });
  }

  getFilteredEvents() {
    return this.eventos.filter(evento => {
      if (this.filters.tipo && evento.tipo !== this.filters.tipo) return false;
      if (this.filters.gerenciaId && evento.gerenciaId != this.filters.gerenciaId) return false;
      if (this.filters.usuarioId && evento.usuarioId != this.filters.usuarioId) return false;
      return true;
    });
  }

  // ==================== VIEW SWITCHING ====================
  switchView(view) {
    this.currentView = view;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('bg-white', 'text-gob-guinda', 'shadow-sm');
      btn.classList.add('text-gray-600');
    });
    document.querySelector(`[data-view="${view}"]`)?.classList.add('bg-white', 'text-gob-guinda', 'shadow-sm');
    
    // Hide all views
    document.querySelectorAll('.calendar-view').forEach(v => v.classList.add('hidden'));
    
    // Show selected view
    if (view === 'day') {
      document.getElementById('calendarDayView')?.classList.remove('hidden');
    } else if (view === 'week') {
      document.getElementById('calendarWeekView')?.classList.remove('hidden');
    } else {
      document.getElementById('calendarMonthView')?.classList.remove('hidden');
    }
    
    this.renderCalendar();
  }

  // ==================== NAVIGATION ====================
  goToToday() {
    this.currentDate = new Date();
    this.renderCalendar();
  }

  navigatePrevious() {
    if (this.currentView === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
    } else if (this.currentView === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() - 7);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    }
    this.renderCalendar();
  }

  navigateNext() {
    if (this.currentView === 'day') {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
    } else if (this.currentView === 'week') {
      this.currentDate.setDate(this.currentDate.getDate() + 7);
    } else {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    }
    this.renderCalendar();
  }

  // ==================== RENDER CALENDAR ====================
  renderCalendar() {
    this.updatePeriodLabel();
    
    if (this.currentView === 'day') {
      this.renderDayView();
    } else if (this.currentView === 'week') {
      this.renderWeekView();
    } else {
      this.renderMonthView();
    }
  }

  updatePeriodLabel() {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    let label = '';
    if (this.currentView === 'day') {
      label = `${days[this.currentDate.getDay()]}, ${this.currentDate.getDate()} de ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    } else if (this.currentView === 'week') {
      const startOfWeek = new Date(this.currentDate);
      startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      label = `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    } else {
      label = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
    
    const periodEl = document.getElementById('currentPeriod');
    if (periodEl) periodEl.textContent = label;
  }

  renderDayView() {
    const dateStr = this.formatDate(this.currentDate);
    const eventos = this.getFilteredEvents().filter(e => e.fecha === dateStr);
    
    // Update header
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    document.getElementById('dayViewDate').textContent = 
      `${days[this.currentDate.getDay()]}, ${this.currentDate.getDate()} de ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    document.getElementById('dayViewCount').textContent = `${eventos.length} evento${eventos.length !== 1 ? 's' : ''} programado${eventos.length !== 1 ? 's' : ''}`;
    
    // Render timeline
    const timeline = document.getElementById('dayViewTimeline');
    const empty = document.getElementById('dayViewEmpty');
    
    if (eventos.length === 0) {
      timeline.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }
    
    timeline.classList.remove('hidden');
    empty.classList.add('hidden');
    
    // Group events by hour
    const eventsByHour = {};
    const timeSlots = [];
    for (let h = 8; h <= 20; h++) {
      const hour = String(h).padStart(2, '0') + ':00';
      timeSlots.push(hour);
      eventsByHour[hour] = [];
    }
    
    eventos.forEach(e => {
      const hour = e.hora ? e.hora.substring(0, 2) + ':00' : '08:00';
      if (eventsByHour[hour]) {
        eventsByHour[hour].push(e);
      }
    });
    
    timeline.innerHTML = timeSlots.map(hour => {
      const hourEvents = eventsByHour[hour] || [];
      return `
        <div class="flex items-start border-b border-gray-100 py-3">
          <div class="w-20 text-sm text-gray-500 font-medium">${hour}</div>
          <div class="flex-1 space-y-2">
            ${hourEvents.map(e => this.renderEventCard(e, 'day')).join('')}
            ${hourEvents.length === 0 ? '<div class="text-sm text-gray-400 italic">Sin eventos</div>' : ''}
          </div>
        </div>
      `;
    }).join('');
    
    // Add click listeners
    timeline.querySelectorAll('.event-card').forEach(card => {
      card.addEventListener('click', () => {
        this.showEventDetail(parseInt(card.dataset.eventId));
      });
    });
  }

  renderWeekView() {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    // Update header
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('weekViewRange').textContent = 
      `${days[0].getDate()} - ${days[6].getDate()} ${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    
    const eventos = this.getFilteredEvents();
    const weekEvents = eventos.filter(e => {
      const eventDate = new Date(e.fecha);
      return eventDate >= days[0] && eventDate <= days[6];
    });
    document.getElementById('weekViewCount').textContent = `${weekEvents.length} evento${weekEvents.length !== 1 ? 's' : ''} esta semana`;
    
    // Render grid
    const grid = document.getElementById('weekViewGrid');
    grid.innerHTML = days.map((day, i) => {
      const dateStr = this.formatDate(day);
      const dayEvents = eventos.filter(e => e.fecha === dateStr);
      const isToday = this.isToday(day);
      
      return `
        <div class="border-r border-gray-200 p-2 ${i === 6 ? '' : ''} ${isToday ? 'bg-blue-50' : 'bg-gray-50/30'}">
          <div class="text-center mb-2">
            <div class="text-2xl font-bold ${isToday ? 'text-blue-600' : 'text-gray-800'}">${day.getDate()}</div>
          </div>
          <div class="space-y-1">
            ${dayEvents.map(e => `
              <div class="event-item ${this.gobColors[e.tipo].bg} border-l-2 ${this.gobColors[e.tipo].border} p-1.5 rounded-r text-xs cursor-pointer hover:opacity-80 transition-opacity" data-event-id="${e.id}" onclick="calendarioModule.showEventDetail(${e.id})">
                <div class="font-semibold truncate">${e.titulo}</div>
                <div class="text-gray-600 truncate">${e.hora || ''} ${e.hora ? '-' : ''} ${this.getEventTypeBadge(e.tipo)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  renderMonthView() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(1 - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    while (days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    // Update header
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('monthViewName').textContent = `${months[month]} ${year}`;
    
    const eventos = this.getFilteredEvents();
    const monthEvents = eventos.filter(e => {
      const eventDate = new Date(e.fecha);
      return eventDate >= firstDay && eventDate <= lastDay;
    });
    document.getElementById('monthViewCount').textContent = `${monthEvents.length} evento${monthEvents.length !== 1 ? 's' : ''} este mes`;
    
    // Render grid
    const grid = document.getElementById('monthViewGrid');
    grid.innerHTML = days.map(day => {
      const dateStr = this.formatDate(day);
      const dayEvents = eventos.filter(e => e.fecha === dateStr);
      const isCurrentMonth = day.getMonth() === month;
      const isToday = this.isToday(day);
      
      return `
        <div class="min-h-[120px] border-r border-b border-gray-200 p-2 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/30 transition-colors cursor-pointer" onclick="calendarioModule.onDayClick('${dateStr}')">
          <div class="flex justify-between items-start mb-1">
            <span class="text-sm font-semibold ${isToday ? 'bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}">${day.getDate()}</span>
            ${dayEvents.length > 0 ? `<span class="text-xs text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">${dayEvents.length}</span>` : ''}
          </div>
          <div class="space-y-1">
            ${dayEvents.slice(0, 3).map(e => `
              <div class="event-dot ${this.gobColors[e.tipo].solid} text-white text-xs px-2 py-0.5 rounded truncate" onclick="event.stopPropagation(); calendarioModule.showEventDetail(${e.id})">
                ${e.titulo}
              </div>
            `).join('')}
            ${dayEvents.length > 3 ? `<div class="text-xs text-gray-500 text-center">+${dayEvents.length - 3} más</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  renderEventCard(evento, view = 'day') {
    const colors = this.gobColors[evento.tipo];
    const expediente = this.expedientes.find(e => e.id === evento.expedienteId);
    const usuario = this.usuarios.find(u => u.id === evento.usuarioId);
    
    return `
      <div class="event-card ${colors.bg} border-l-4 ${colors.border} p-3 rounded-r-lg cursor-pointer" data-event-id="${evento.id}">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="font-semibold text-gray-900">${evento.titulo}</div>
            <div class="text-sm text-gray-600 mt-1">${expediente ? expediente.numero + ' - ' + expediente.materia : 'Sin expediente'}</div>
            <div class="text-xs text-gray-500 mt-1">
              <i class="fas fa-user mr-1"></i>${usuario ? usuario.nombre : 'Sin asignar'}
            </div>
          </div>
          <span class="px-2 py-1 ${colors.bg} ${colors.text} text-xs rounded-full font-semibold">
            ${evento.estado}
          </span>
        </div>
      </div>
    `;
  }

  getEventTypeBadge(tipo) {
    const badges = {
      audiencia: '🎯',
      termino: '⏰',
      recordatorio: '📝'
    };
    return badges[tipo] || '';
  }

  onDayClick(dateStr) {
    this.currentDate = new Date(dateStr);
    this.switchView('day');
  }

  // ==================== MODALS ====================
  showEventDetail(eventId) {
    const evento = this.eventos.find(e => e.id === eventId);
    if (!evento) return;
    
    this.currentEventId = eventId;
    
    // Set icon and badge
    const icons = {
      audiencia: { icon: 'fa-gavel', color: 'bg-blue-100 text-blue-600' },
      termino: { icon: 'fa-hourglass-half', color: 'bg-green-100 text-green-600' },
      recordatorio: { icon: 'fa-bell', color: 'bg-yellow-100 text-yellow-700' }
    };
    const iconData = icons[evento.tipo];
    
    document.getElementById('detailEventIcon').className = `w-14 h-14 rounded-full ${iconData.color} flex items-center justify-center shadow-md`;
    document.getElementById('detailEventIcon').innerHTML = `<i class="fas ${iconData.icon} text-2xl"></i>`;
    
    // Set content
    document.getElementById('detailEventTitle').textContent = evento.titulo || 'Detalle del Evento';
    const badgeColors = {
      audiencia: 'bg-blue-100 text-blue-800',
      termino: 'bg-green-100 text-green-800',
      recordatorio: 'bg-yellow-100 text-yellow-800'
    };
    document.getElementById('detailEventBadge').textContent = evento.tipo.toUpperCase();
    document.getElementById('detailEventBadge').className = `inline-block mt-1 px-3 py-1 ${badgeColors[evento.tipo]} text-xs font-semibold rounded-full uppercase`;
    
    // Información General
    document.getElementById('detailEventDate').textContent = this.formatDisplayDate(evento.fecha);
    document.getElementById('detailEventTime').textContent = evento.hora || 'Sin hora especificada';
    
    const gerencia = this.gerencias.find(g => g.id === evento.gerenciaId);
    const usuario = this.usuarios.find(u => u.id === evento.usuarioId);
    document.getElementById('detailEventGerencia').textContent = gerencia ? gerencia.nombre : 'Sin gerencia';
    document.getElementById('detailEventUsuario').textContent = usuario ? usuario.nombre : 'Sin asignar';
    
    // Hide all specific sections
    document.getElementById('detailAudienciaSection')?.classList.add('hidden');
    document.getElementById('detailTerminoSection')?.classList.add('hidden');
    document.getElementById('detailRecordatorioSection')?.classList.add('hidden');
    
    // Show and fill type-specific section
    if (evento.tipo === 'audiencia') {
      document.getElementById('detailAudienciaSection')?.classList.remove('hidden');
      document.getElementById('detailAudExpediente').textContent = evento.expediente || 'N/A';
      document.getElementById('detailAudMateria').textContent = evento.materia || 'N/A';
      document.getElementById('detailAudOrgano').textContent = evento.organoJurisdiccional || evento.tribunal || 'N/A';
      document.getElementById('detailAudActor').textContent = evento.actor || 'N/A';
      document.getElementById('detailAudDemandado').textContent = evento.demandado || 'N/A';
      document.getElementById('detailAudSala').textContent = evento.sala || evento.ubicacion || 'N/A';
      document.getElementById('detailAudAbogadoComparece').textContent = evento.abogadoComparece || evento.abogado || 'N/A';
      
      const prioColors = { Alta: 'bg-red-100 text-red-800', Media: 'bg-yellow-100 text-yellow-800', Baja: 'bg-green-100 text-green-800' };
      document.getElementById('detailAudPrioridad').textContent = evento.prioridad || 'Media';
      document.getElementById('detailAudPrioridad').className = `inline-block px-3 py-1 ${prioColors[evento.prioridad] || prioColors.Media} text-xs font-semibold rounded-full`;
      
      const estatusColors = { Pendiente: 'bg-yellow-100 text-yellow-800', Desahogada: 'bg-green-100 text-green-800', Cancelada: 'bg-red-100 text-red-800' };
      document.getElementById('detailAudEstatus').textContent = evento.atendida ? 'Desahogada' : (evento.estado || 'Pendiente');
      document.getElementById('detailAudEstatus').className = `inline-block px-3 py-1 ${evento.atendida ? estatusColors.Desahogada : (estatusColors[evento.estado] || estatusColors.Pendiente)} text-xs font-semibold rounded-full`;
    } 
    else if (evento.tipo === 'termino') {
      document.getElementById('detailTerminoSection')?.classList.remove('hidden');
      document.getElementById('detailTermExpediente').textContent = evento.expediente || 'N/A';
      document.getElementById('detailTermActor').textContent = evento.actor || evento.partes || 'N/A';
      document.getElementById('detailTermActuacion').textContent = evento.actuacion || evento.asunto || evento.descripcion || 'N/A';
      document.getElementById('detailTermPrestacion').textContent = evento.prestacion || 'N/A';
      document.getElementById('detailTermFechaIngreso').textContent = evento.fechaIngreso ? this.formatDisplayDate(evento.fechaIngreso) : 'N/A';
      
      const estatusTermColors = {
        Proyectista: 'bg-gray-100 text-gray-800',
        Revisión: 'bg-blue-100 text-blue-800',
        Gerencia: 'bg-purple-100 text-purple-800',
        Dirección: 'bg-indigo-100 text-indigo-800',
        Liberado: 'bg-green-100 text-green-800',
        Presentado: 'bg-teal-100 text-teal-800'
      };
      document.getElementById('detailTermEstatus').textContent = evento.estatus || evento.estado || 'Proyectista';
      document.getElementById('detailTermEstatus').className = `inline-block px-3 py-1 ${estatusTermColors[evento.estatus || evento.estado] || estatusTermColors.Proyectista} text-xs font-semibold rounded-full`;
    } 
    else if (evento.tipo === 'recordatorio') {
      document.getElementById('detailRecordatorioSection')?.classList.remove('hidden');
      document.getElementById('detailRecTitulo').textContent = evento.titulo || 'Sin título';
      document.getElementById('detailRecDetalles').textContent = evento.detalles || evento.descripcion || 'Sin detalles adicionales';
    }
    
    // Show modal
    document.getElementById('modalEventDetail').classList.remove('hidden');
  }

  closeEventDetailModal() {
    document.getElementById('modalEventDetail').classList.add('hidden');
    this.currentEventId = null;
  }

  openEventCreateModal(date = null) {
    this.editingEvent = null;
    document.getElementById('createModalTitle').innerHTML = '<i class="fas fa-plus-circle mr-2"></i>Crear Nuevo Evento';
    
    // Reset form
    document.getElementById('formEvent').reset();
    if (date) {
      document.getElementById('inputFecha').value = date;
    } else {
      document.getElementById('inputFecha').value = this.formatDate(this.currentDate);
    }
    
    // Show modal
    document.getElementById('modalEventCreate').classList.remove('hidden');
  }

  closeEventCreateModal() {
    document.getElementById('modalEventCreate').classList.add('hidden');
    this.editingEvent = null;
  }

  handleTipoChange(tipo) {
    // Show/hide sections based on type
    const seccionAudiencia = document.getElementById('seccionAudiencia');
    const seccionTermino = document.getElementById('seccionTermino');
    const seccionRecordatorio = document.getElementById('seccionRecordatorio');
    
    // Hide all sections
    seccionAudiencia?.classList.add('hidden');
    seccionTermino?.classList.add('hidden');
    seccionRecordatorio?.classList.add('hidden');
    
    // Show relevant section
    if (tipo === 'audiencia') {
      seccionAudiencia?.classList.remove('hidden');
    } else if (tipo === 'termino') {
      seccionTermino?.classList.remove('hidden');
    } else if (tipo === 'recordatorio') {
      seccionRecordatorio?.classList.remove('hidden');
    }
  }
  
  // Método legacy para compatibilidad (puede eliminarse después)
  handleTipoChangeLegacy(tipo) {
    // Show/hide fields based on type
    const divDuracion = document.getElementById('divDuracion');
    const divLocation = document.getElementById('divLocation');
    const divPriority = document.getElementById('divPriority');
    
    divDuracion?.classList.add('hidden');
    divLocation?.classList.add('hidden');
    divPriority?.classList.add('hidden');
    
    if (tipo === 'audiencia') {
      divDuracion.classList.remove('hidden');
      divLocation.classList.remove('hidden');
    } else if (tipo === 'termino') {
      divPriority.classList.remove('hidden');
    }
    
    // Update estado options
    const inputEstado = document.getElementById('inputEstado');
    inputEstado.innerHTML = '';
    
    if (tipo === 'audiencia') {
      inputEstado.innerHTML = '<option value="Pendiente">Pendiente</option><option value="Desahogada">Desahogada</option><option value="Cancelada">Cancelada</option>';
    } else if (tipo === 'termino') {
      inputEstado.innerHTML = '<option value="Pendiente">Pendiente</option><option value="Concluido">Concluido</option><option value="Vencido">Vencido</option>';
    } else {
      inputEstado.innerHTML = '<option value="Activo">Activo</option><option value="Completado">Completado</option>';
    }
  }

  editEvent() {
    const evento = this.eventos.find(e => e.id === this.currentEventId);
    if (!evento) return;
    
    this.editingEvent = evento;
    this.closeEventDetailModal();
    
    // Fill form
    document.getElementById('createModalTitle').innerHTML = '<i class="fas fa-edit mr-2"></i>Editar Evento';
    document.getElementById('inputTipo').value = evento.tipo;
    this.handleTipoChange(evento.tipo);
    
    document.getElementById('inputTitulo').value = evento.titulo;
    document.getElementById('inputDescripcion').value = evento.descripcion || '';
    document.getElementById('inputFecha').value = evento.fecha;
    document.getElementById('inputHora').value = evento.hora || '';
    document.getElementById('inputDuracion').value = evento.duracion || '';
    document.getElementById('inputEstado').value = evento.estado;
    document.getElementById('inputExpediente').value = evento.expedienteId || '';
    document.getElementById('inputGerencia').value = evento.gerenciaId;
    document.getElementById('inputUsuario').value = evento.usuarioId;
    document.getElementById('inputUbicacion').value = evento.ubicacion || '';
    document.getElementById('inputPrioridad').value = evento.prioridad || 'Media';
    document.getElementById('inputNotas').value = evento.notas || '';
    
    document.getElementById('modalEventCreate').classList.remove('hidden');
  }

  saveEvent() {
    const form = document.getElementById('formEvent');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    const eventData = {
      tipo: document.getElementById('inputTipo').value,
      titulo: document.getElementById('inputTitulo').value,
      descripcion: document.getElementById('inputDescripcion').value,
      fecha: document.getElementById('inputFecha').value,
      hora: document.getElementById('inputHora').value,
      duracion: parseInt(document.getElementById('inputDuracion').value) || null,
      estado: document.getElementById('inputEstado').value,
      expedienteId: parseInt(document.getElementById('inputExpediente').value) || null,
      gerenciaId: parseInt(document.getElementById('inputGerencia').value),
      usuarioId: parseInt(document.getElementById('inputUsuario').value),
      ubicacion: document.getElementById('inputUbicacion').value,
      prioridad: document.getElementById('inputPrioridad').value,
      notas: document.getElementById('inputNotas').value
    };
    
    if (this.editingEvent) {
      // Update existing
      const index = this.eventos.findIndex(e => e.id === this.editingEvent.id);
      this.eventos[index] = { ...this.editingEvent, ...eventData };
    } else {
      // Create new
      const newId = Math.max(0, ...this.eventos.map(e => e.id)) + 1;
      this.eventos.push({ id: newId, ...eventData });
    }
    
    // Save to localStorage
    this.saveToLocalStorage();
    
    // Close modal and refresh
    this.closeEventCreateModal();
    this.renderCalendar();
  }

  deleteEvent() {
    if (!confirm('¿Está seguro de eliminar este evento?')) return;
    
    this.eventos = this.eventos.filter(e => e.id !== this.currentEventId);
    this.saveToLocalStorage();
    this.closeEventDetailModal();
    this.renderCalendar();
  }

  saveToLocalStorage() {
    const audiencias = this.eventos.filter(e => e.tipo === 'audiencia').map(({tipo, ...rest}) => rest);
    const terminos = this.eventos.filter(e => e.tipo === 'termino').map(({tipo, ...rest}) => rest);
    const recordatorios = this.eventos.filter(e => e.tipo === 'recordatorio').map(({tipo, ...rest}) => rest);
    
    localStorage.setItem('audiencias', JSON.stringify(audiencias));
    localStorage.setItem('terminos', JSON.stringify(terminos));
    localStorage.setItem('recordatorios', JSON.stringify(recordatorios));
  }

  // ==================== UTILITIES ====================
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDisplayDate(dateStr) {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const date = new Date(dateStr + 'T00:00:00');
    return `${date.getDate()} de ${months[date.getMonth()]}, ${date.getFullYear()}`;
  }

  isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
}
