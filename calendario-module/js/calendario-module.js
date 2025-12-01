/**
 * Calendario Module (Adaptado para componentes avanzados)
 */
export class CalendarioModule {
  constructor() {
    this.currentDate = new Date();
    this.currentView = 'month'; // 'day', 'week', 'month'
    this.eventos = [];
    this.expedientes = [];
    this.usuarios = [];
    this.gerencias = [];
    this.filters = { tipo: '', gerenciaId: '', usuarioId: '' };
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
  }

  // ==================== DATA LOADING ====================
  loadData() {
    this.expedientes = JSON.parse(localStorage.getItem('expedientesData')) || [];
    this.usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    this.gerencias = JSON.parse(localStorage.getItem('gerencias')) || this.getSampleGerencias();
    
    const audiencias = JSON.parse(localStorage.getItem('audiencias')) || [];
    const terminos = JSON.parse(localStorage.getItem('terminos')) || [];
    const recordatorios = JSON.parse(localStorage.getItem('recordatorios')) || [];
    
    this.eventos = [
      ...audiencias.map(a => ({ ...a, tipo: 'audiencia', titulo: a.expediente + ' - ' + a.tipoAudiencia })),
      ...terminos.map(t => ({ ...t, tipo: 'termino', titulo: t.actuacion })),
      ...recordatorios.map(r => ({ ...r, tipo: 'recordatorio' }))
    ];
  }

  getSampleGerencias() {
    return [
      { id: 1, nombre: 'Gerencia Civil' }, { id: 2, nombre: 'Gerencia Penal' }, { id: 3, nombre: 'Gerencia Amparo' }
    ];
  }

  // ==================== EVENT LISTENERS ====================
  setupEventListeners() {
    // Vistas
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchView(e.target.closest('.view-btn').dataset.view));
    });

    // Navegación
    document.getElementById('btnToday')?.addEventListener('click', () => this.goToToday());
    document.getElementById('btnPrevious')?.addEventListener('click', () => this.navigatePrevious());
    document.getElementById('btnNext')?.addEventListener('click', () => this.navigateNext());

    // Filtros
    document.getElementById('filterTipo')?.addEventListener('change', (e) => { this.filters.tipo = e.target.value; this.renderCalendar(); });
    document.getElementById('filterGerencia')?.addEventListener('change', (e) => { this.filters.gerenciaId = e.target.value; this.renderCalendar(); });
    document.getElementById('filterUsuario')?.addEventListener('change', (e) => { this.filters.usuarioId = e.target.value; this.renderCalendar(); });

    // Crear Evento
    document.getElementById('btnCreateEvent')?.addEventListener('click', () => this.openEventCreateModal());
    
    // Cambio de Tipo en Formulario
    document.getElementById('inputTipo')?.addEventListener('change', (e) => this.handleTipoChange(e.target.value));
  }

  // ==================== FILTERS & POPULATION ====================
  populateFilters() {
    const populateSelect = (id, data, labelKey = 'nombre', valueKey = 'id') => {
      const el = document.getElementById(id);
      if(!el) return;
      // Mantener la primera opción (placeholder)
      const first = el.firstElementChild;
      el.innerHTML = '';
      if(first) el.appendChild(first);
      
      data.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item[valueKey];
        opt.textContent = item[labelKey];
        el.appendChild(opt);
      });
    };

    populateSelect('filterGerencia', this.gerencias);
    populateSelect('inputGerencia', this.gerencias);
    populateSelect('filterUsuario', this.usuarios);
    populateSelect('inputUsuario', this.usuarios);
    
    // Popular selectores de Asunto (Expediente) para cada tipo
    const expedientesLabel = (e) => `${e.numero} - ${e.materia}`;
    populateSelect('inputAsuntoAudiencia', this.expedientes, 'numero', 'id');
    populateSelect('inputAsuntoTermino', this.expedientes, 'numero', 'id');
    
    // Actualizar etiquetas con datos extra
    ['inputAsuntoAudiencia', 'inputAsuntoTermino'].forEach(id => {
       const el = document.getElementById(id);
       if(el) {
           Array.from(el.options).forEach(opt => {
               if(!opt.value) return;
               const exp = this.expedientes.find(e => e.id == opt.value);
               if(exp) opt.textContent = `${exp.numero} - ${exp.materia}`;
           });
           // Listener para auto-llenado
           el.addEventListener('change', (e) => this.fillExpedienteData(e.target.value, id.includes('Audiencia') ? 'Aud' : 'Term'));
       }
    });
  }

  fillExpedienteData(expId, suffix) {
      if(!expId) return;
      const exp = this.expedientes.find(e => e.id == expId);
      if(!exp) return;
      
      const setVal = (field, val) => {
          const el = document.getElementById(`input${field}${suffix}`);
          if(el) el.value = val || '';
      };
      
      setVal('Expediente', exp.numero);
      setVal('Materia', exp.materia);
      setVal('Organo', exp.organo); // Asegúrate que tu modelo de expediente tenga 'organo'
      setVal('Partes', exp.partes);
      setVal('Prioridad', exp.prioridad);
      setVal('Actor', exp.partes ? exp.partes.split('vs')[0] : ''); 
      setVal('Prestacion', ''); // Dato no estándar en expediente simple
  }

  getFilteredEvents() {
    return this.eventos.filter(evento => {
      if (this.filters.tipo && evento.tipo !== this.filters.tipo) return false;
      if (this.filters.gerenciaId && evento.gerenciaId != this.filters.gerenciaId) return false;
      if (this.filters.usuarioId && evento.usuarioId != this.filters.usuarioId) return false;
      return true;
    });
  }

  // ==================== VIEW LOGIC ====================
  switchView(view) {
    this.currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('bg-white', 'text-gob-guinda', 'shadow-sm');
      btn.classList.add('text-gray-600');
    });
    document.querySelector(`[data-view="${view}"]`)?.classList.add('bg-white', 'text-gob-guinda', 'shadow-sm');
    document.querySelectorAll('.calendar-view').forEach(v => v.classList.add('hidden'));
    
    if (view === 'day') document.getElementById('calendarDayView').classList.remove('hidden');
    else if (view === 'week') document.getElementById('calendarWeekView').classList.remove('hidden');
    else document.getElementById('calendarMonthView').classList.remove('hidden');
    
    this.renderCalendar();
  }

  goToToday() { this.currentDate = new Date(); this.renderCalendar(); }
  
  navigatePrevious() {
    if (this.currentView === 'day') this.currentDate.setDate(this.currentDate.getDate() - 1);
    else if (this.currentView === 'week') this.currentDate.setDate(this.currentDate.getDate() - 7);
    else this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.renderCalendar();
  }

  navigateNext() {
    if (this.currentView === 'day') this.currentDate.setDate(this.currentDate.getDate() + 1);
    else if (this.currentView === 'week') this.currentDate.setDate(this.currentDate.getDate() + 7);
    else this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.renderCalendar();
  }

  // ==================== RENDERING ====================
  renderCalendar() {
    this.updatePeriodLabel();
    if (this.currentView === 'day') this.renderDayView();
    else if (this.currentView === 'week') this.renderWeekView();
    else this.renderMonthView();
  }

  updatePeriodLabel() {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const label = `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    document.getElementById('currentPeriod').textContent = label;
  }

  renderDayView() {
    const dateStr = this.formatDate(this.currentDate);
    const eventos = this.getFilteredEvents().filter(e => e.fecha === dateStr);
    
    document.getElementById('dayViewDate').textContent = this.formatDisplayDate(dateStr);
    document.getElementById('dayViewCount').textContent = `${eventos.length} eventos`;
    
    const timeline = document.getElementById('dayViewTimeline');
    const empty = document.getElementById('dayViewEmpty');
    
    if (eventos.length === 0) {
      timeline.innerHTML = '';
      timeline.parentElement.classList.add('hidden');
      empty.classList.remove('hidden');
    } else {
      empty.classList.add('hidden');
      timeline.parentElement.classList.remove('hidden');
      
      // Ordenar por hora
      eventos.sort((a,b) => (a.hora || '00:00').localeCompare(b.hora || '00:00'));
      
      timeline.innerHTML = eventos.map(e => `
        <div class="flex items-start border-b border-gray-100 py-3 group hover:bg-gray-50 transition-colors cursor-pointer" onclick="calendarioModule.showEventDetail(${e.id})">
          <div class="w-20 text-sm text-gray-500 font-medium pt-1">${e.hora || 'Todo el día'}</div>
          <div class="flex-1">
            <div class="event-card ${this.gobColors[e.tipo].bg} border-l-4 ${this.gobColors[e.tipo].border} p-3 rounded-r-lg">
              <div class="flex justify-between">
                <div>
                  <div class="font-bold text-gray-900">${e.titulo}</div>
                  <div class="text-xs text-gray-600 mt-1">${e.tipo.toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  renderWeekView() {
      // Implementación simplificada
      const start = new Date(this.currentDate);
      start.setDate(start.getDate() - start.getDay()); // Domingo
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      
      document.getElementById('weekViewRange').textContent = `${start.getDate()} - ${end.getDate()} ${this.formatDisplayDate(this.formatDate(end)).split('de')[1]}`;
      
      const grid = document.getElementById('weekViewGrid');
      grid.innerHTML = '';
      
      for(let i=0; i<7; i++) {
          const day = new Date(start);
          day.setDate(day.getDate() + i);
          const dateStr = this.formatDate(day);
          const evs = this.getFilteredEvents().filter(e => e.fecha === dateStr);
          const isToday = this.isToday(day);
          
          grid.innerHTML += `
            <div class="border-r border-gray-200 p-2 min-h-[150px] ${isToday ? 'bg-blue-50' : 'bg-white'}">
                <div class="text-center mb-2 font-bold ${isToday ? 'text-blue-600' : 'text-gray-700'}">${day.getDate()}</div>
                <div class="space-y-1">
                    ${evs.map(e => `
                        <div class="text-[10px] p-1 rounded truncate text-white ${this.gobColors[e.tipo].solid} cursor-pointer" onclick="calendarioModule.showEventDetail(${e.id})">
                            ${e.hora} ${e.titulo}
                        </div>
                    `).join('')}
                </div>
            </div>
          `;
      }
  }

  renderMonthView() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = new Date(firstDay);
    startDay.setDate(1 - firstDay.getDay()); // Start on Sunday
    
    const grid = document.getElementById('monthViewGrid');
    grid.innerHTML = '';
    
    // 6 weeks
    for(let i=0; i<42; i++) {
        const day = new Date(startDay);
        day.setDate(day.getDate() + i);
        const dateStr = this.formatDate(day);
        const isCurrentMonth = day.getMonth() === month;
        const isToday = this.isToday(day);
        const evs = this.getFilteredEvents().filter(e => e.fecha === dateStr);
        
        grid.innerHTML += `
            <div class="min-h-[100px] border-r border-b border-gray-200 p-1 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-50 transition-colors cursor-pointer" onclick="calendarioModule.onDayClick('${dateStr}')">
                <div class="flex justify-between items-center mb-1 px-1">
                    <span class="text-sm font-semibold ${isToday ? 'bg-gob-guinda text-white w-6 h-6 rounded-full flex items-center justify-center' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}">${day.getDate()}</span>
                </div>
                <div class="space-y-1">
                    ${evs.slice(0, 3).map(e => `
                        <div class="h-1.5 rounded-full ${this.gobColors[e.tipo].solid}" title="${e.titulo}"></div>
                    `).join('')}
                    ${evs.length > 3 ? `<span class="text-[10px] text-gray-500 block text-right">+${evs.length-3}</span>` : ''}
                </div>
            </div>
        `;
    }
    
    // Update header info
    document.getElementById('monthViewName').textContent = this.formatDisplayDate(this.formatDate(new Date(year, month, 1))).split(',')[1]; // Mes Año
    document.getElementById('monthViewCount').textContent = `${this.getFilteredEvents().filter(e => new Date(e.fecha).getMonth() === month).length} eventos`;
  }

  // ==================== MODALS & FORMS ====================
  openEventCreateModal() {
      const modal = document.getElementById('modalEventCreate');
      document.getElementById('formEvent').reset();
      document.getElementById('inputFecha').value = this.formatDate(this.currentDate);
      
      this.handleTipoChange(''); // Reset sections
      modal.classList.remove('hidden');
  }

  closeEventCreateModal() {
      document.getElementById('modalEventCreate').classList.add('hidden');
  }

  handleTipoChange(tipo) {
      document.getElementById('seccionAudiencia').classList.add('hidden');
      document.getElementById('seccionTermino').classList.add('hidden');
      document.getElementById('seccionRecordatorio').classList.add('hidden');
      
      if(tipo === 'audiencia') document.getElementById('seccionAudiencia').classList.remove('hidden');
      else if(tipo === 'termino') document.getElementById('seccionTermino').classList.remove('hidden');
      else if(tipo === 'recordatorio') document.getElementById('seccionRecordatorio').classList.remove('hidden');
  }

  saveEvent() {
      const tipo = document.getElementById('inputTipo').value;
      if(!tipo) return alert('Seleccione un tipo de evento');
      
      const commonData = {
          id: Date.now(),
          tipo: tipo,
          fecha: document.getElementById('inputFecha').value,
          hora: document.getElementById('inputHora').value,
          gerenciaId: document.getElementById('inputGerencia').value,
          usuarioId: document.getElementById('inputUsuario').value,
          created: new Date().toISOString()
      };
      
      // Construir objeto específico según tipo
      let newEvent = {};
      
      if(tipo === 'audiencia') {
          const asuntoId = document.getElementById('inputAsuntoAudiencia').value;
          const exp = this.expedientes.find(e => e.id == asuntoId);
          newEvent = {
              ...commonData,
              asuntoId,
              titulo: `Audiencia - ${exp ? exp.numero : ''}`,
              expediente: exp ? exp.numero : '',
              tipoAudiencia: document.getElementById('inputTipoAudiencia').value,
              sala: document.getElementById('inputSala').value,
              abogadoComparece: document.getElementById('inputAbogadoComparece').options[document.getElementById('inputAbogadoComparece').selectedIndex]?.text || ''
          };
          
          // Guardar en array de audiencias
          const auds = JSON.parse(localStorage.getItem('audiencias')) || [];
          auds.push(newEvent);
          localStorage.setItem('audiencias', JSON.stringify(auds));
          
      } else if(tipo === 'termino') {
          const asuntoId = document.getElementById('inputAsuntoTermino').value;
          const exp = this.expedientes.find(e => e.id == asuntoId);
          newEvent = {
              ...commonData,
              asuntoId,
              titulo: document.getElementById('inputActuacion').value,
              actuacion: document.getElementById('inputActuacion').value,
              expediente: exp ? exp.numero : '',
              estatus: document.getElementById('inputEstatusTermino').value,
              fechaIngreso: document.getElementById('inputFechaIngreso').value
          };
          
          const terms = JSON.parse(localStorage.getItem('terminos')) || [];
          terms.push(newEvent);
          localStorage.setItem('terminos', JSON.stringify(terms));
          
      } else { // Recordatorio
          newEvent = {
              ...commonData,
              titulo: document.getElementById('inputTituloRecordatorio').value,
              detalles: document.getElementById('inputDetallesRecordatorio').value,
              estado: 'Activo'
          };
          
          const recs = JSON.parse(localStorage.getItem('recordatorios')) || [];
          recs.push(newEvent);
          localStorage.setItem('recordatorios', JSON.stringify(recs));
      }
      
      this.closeEventCreateModal();
      this.loadData();
      this.renderCalendar();
      alert('Evento guardado correctamente');
  }

  showEventDetail(id) {
      const ev = this.eventos.find(e => e.id === id);
      if(!ev) return;
      
      // Lógica simplificada de llenado de modal de detalle
      // (Asumiendo que los IDs del HTML coinciden con los del JS anterior)
      document.getElementById('detailEventTitle').textContent = ev.titulo;
      document.getElementById('detailEventDate').textContent = this.formatDisplayDate(ev.fecha);
      document.getElementById('detailEventTime').textContent = ev.hora;
      
      // Mostrar modal
      document.getElementById('modalEventDetail').classList.remove('hidden');
  }
  
  closeEventDetailModal() {
      document.getElementById('modalEventDetail').classList.add('hidden');
  }
  
  onDayClick(dateStr) {
      this.currentDate = new Date(dateStr + 'T00:00:00');
      this.switchView('day');
  }

  // ==================== UTILS ====================
  formatDate(d) {
      return d.toISOString().split('T')[0];
  }
  
  formatDisplayDate(dateStr) {
      if(!dateStr) return '';
      const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
      return d.toLocaleDateString('es-ES', opts);
  }
  
  isToday(d) {
      const today = new Date();
      return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }
}