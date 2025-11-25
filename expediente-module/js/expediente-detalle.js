import { expedienteById, updateExpediente } from '../data/expedientes-data.js';
import { loadTimeline, addTimelineEntry, loadActividad, addActividadEntry } from '../data/expediente-timeline-data.js';

class ExpedienteDetalleModule {
  constructor(){
    this.id = null;
    this.expediente = null;
    this.timeline = [];
    this.actividad = [];
  }

  init(){
    this.parseId();
    if(!this.id){ this.renderError('ID inválido'); return; }
    this.loadData();
    if(!this.expediente){ this.renderError('Expediente no encontrado'); return; }
    
    this.renderVista360();
    this.renderActividadReciente();
    this.bindEvents();
  }

  parseId(){
    const params = new URLSearchParams(window.location.search);
    this.id = params.get('id');
  }

  loadData(){
    this.expediente = expedienteById(this.id);
    this.timeline = loadTimeline(this.id);
    this.actividad = loadActividad(this.id);
  }

  renderError(msg){
    const container = document.getElementById('vista-360-container');
    if (container) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center p-12 bg-gray-50 rounded border border-gray-200 text-center">
                <i class="fas fa-exclamation-circle text-4xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-bold text-gob-gris font-headings">${msg}</h3>
                <a href="index.html" class="mt-4 text-gob-guinda font-bold hover:underline text-sm">Volver al listado</a>
            </div>
        `;
    }
  }

  /* === Render principal (VISTA 360 GOBIERNO V3) === */
  renderVista360() {
    const container = document.getElementById('vista-360-container');
    if (!container) return;
    
    container.innerHTML = this.generarVista360HTML();
    this.actualizarHeader();
  }

  generarVista360HTML() {
    const e = this.expediente;
    const prioridad = e.prioridad || 'Media';
    const abogado = e.abogado || 'Sin asignar';
    const materia = e.materia || '—';
    const organo = e.organo || '—';
    const gerencia = e.gerencia || '—';
    const sede = e.sede || '—';
    const estado = e.estado || 'Tramite';

    // Colores dinámicos para badges
    const badgeColor = estado.toLowerCase().includes('tramite') 
        ? 'bg-green-100 text-green-800 border-green-200' 
        : 'bg-yellow-100 text-yellow-800 border-yellow-200';

    // Stats (mocked or from data)
    const stats = {
        terminos: 0,
        audiencias: 0,
        documentos: 0,
        dias: 0
    };

    return `
        <div class="flex flex-col gap-6">
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <i class="fas fa-clock text-gob-guinda text-2xl mb-2"></i>
                    <span class="text-2xl font-bold text-gob-gris font-headings">${stats.terminos}</span>
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Términos</span>
                </div>
                <div class="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <i class="fas fa-gavel text-gob-oro text-2xl mb-2"></i>
                    <span class="text-2xl font-bold text-gob-gris font-headings">${stats.audiencias}</span>
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Audiencias</span>
                </div>
                <div class="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <i class="fas fa-file-alt text-gob-plata text-2xl mb-2"></i>
                    <span class="text-2xl font-bold text-gob-gris font-headings">${stats.documentos}</span>
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Documentos</span>
                </div>
                <div class="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <i class="fas fa-calendar-day text-gray-400 text-2xl mb-2"></i>
                    <span class="text-2xl font-bold text-gob-gris font-headings">${stats.dias}</span>
                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Días Activo</span>
                </div>
            </div>

            <div class="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <span class="text-xs font-bold text-gob-oro uppercase tracking-wider block mb-1">No. Expediente</span>
                        <h2 class="text-2xl font-bold text-gob-guinda font-headings">${e.numero}</h2>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-bold border ${badgeColor} uppercase tracking-wide font-headings">
                        ${estado}
                    </span>
                </div>
                
                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                        
                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Materia</label>
                            <p class="text-sm font-semibold text-gob-gris font-sans">${materia}</p>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Gerencia</label>
                            <p class="text-sm font-semibold text-gob-gris font-sans">${gerencia}</p>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Sede / Estado</label>
                            <p class="text-sm font-semibold text-gob-gris font-sans">${sede}</p>
                        </div>

                        <div class="md:col-span-2">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Partes Procesales</label>
                            <p class="text-sm font-semibold text-gob-gris font-sans">${e.partes || 'Actor vs Demandado'}</p>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Abogado Resp.</label>
                            <div class="flex items-center gap-2">
                                <i class="fas fa-user-tie text-gob-oro"></i>
                                <p class="text-sm font-semibold text-gob-gris font-sans">${abogado}</p>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Órgano Jurisdiccional</label>
                            <p class="text-sm font-semibold text-gob-gris font-sans">${organo}</p>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Fecha Creación</label>
                            <p class="text-sm font-semibold text-gob-gris font-sans">${this.formatDate(e.fechaInicio || new Date().toISOString())}</p>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prioridad</label>
                            <p class="text-sm font-bold ${prioridad === 'Alta' ? 'text-gob-guinda' : 'text-gray-600'}">${prioridad}</p>
                        </div>
                    </div>

                    ${e.descripcion ? `
                    <div class="mt-6 pt-6 border-t border-gray-100">
                        <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción del Asunto</label>
                        <p class="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">
                            ${e.descripcion}
                        </p>
                    </div>` : ''}
                </div>
            </div>

            <div class="bg-white rounded border border-gray-200 shadow-sm p-6">
                <h3 class="text-lg font-bold text-gob-gris font-headings border-b border-gob-oro pb-2 mb-4">
                    Línea de Tiempo
                </h3>
                <div class="relative border-l-2 border-gray-200 ml-3 space-y-6 pl-6 py-2">
                    ${this.timeline && this.timeline.length > 0
                        ? this.timeline.map(item => this.generarTimelineItem(item)).join('')
                        : '<div class="text-gray-400 text-sm italic">No hay eventos registrados en la línea de tiempo.</div>'
                    }
                </div>
            </div>

        </div>
    `;
  }

  generarTimelineItem(item) {
    return `
        <div class="relative">
            <div class="absolute -left-[33px] top-1 w-4 h-4 rounded-full bg-white border-2 border-gob-guinda"></div>
            
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                <span class="text-xs font-bold text-gob-guinda font-headings">${this.formatDate(item.fecha)}</span>
                <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">${item.tipo || 'Evento'}</span>
            </div>
            
            <h4 class="text-sm font-bold text-gob-gris mt-1">${item.titulo || 'Evento sin título'}</h4>
            <p class="text-xs text-gray-600 mt-1 mb-2">${item.descripcion || ''}</p>
        </div>
    `;
  }

  renderActividadReciente() {
    const container = document.getElementById('actividad-reciente-list');
    if (!container) return;

    if (this.actividad.length === 0) {
        container.innerHTML = '<div class="p-4 text-sm text-gray-400 text-center">Sin actividad reciente.</div>';
        return;
    }

    container.innerHTML = this.actividad.map(item => `
        <div class="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors relative pl-6">
            <div class="absolute left-2 top-5 w-1.5 h-1.5 rounded-full bg-gob-oro"></div>
            <p class="text-sm font-bold text-gray-800">${item.descripcion || 'Actualización'}</p>
            <p class="text-xs text-gray-500 mb-1">${this.formatDate(item.fecha)}</p>
            <p class="text-xs text-gray-400">por ${item.usuario || 'Sistema'}</p>
        </div>
    `).join('');
  }

  actualizarHeader() {
    const tituloEl = document.getElementById('detalle-titulo');
    if(tituloEl) tituloEl.innerHTML = `<i class="fas fa-folder-open text-gob-oro"></i> Expediente ${this.expediente.numero}`;
  }

  bindEvents() {
    // Modal events
    const btnCambiarEstado = document.getElementById('btn-cambiar-estado-expediente');
    if (btnCambiarEstado) btnCambiarEstado.addEventListener('click', () => this.abrirModalCambioEstado());
  }

  abrirModalCambioEstado() {
    const modal = document.getElementById('modal-cambio-estado');
    const estadoActualEl = document.getElementById('estado-actual-modal');
    
    if(estadoActualEl && this.expediente) {
        estadoActualEl.textContent = this.expediente.estado || 'Activo';
    }

    if(modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
  }

  formatDate(iso){
    if(!iso) return '—';
    const d = new Date(iso);
    if(isNaN(d)) return '—';
    return d.toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric'});
  }
}

export { ExpedienteDetalleModule };