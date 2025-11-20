// js/asunto-detalle.js
// Lógica V3 para detalle del asunto - Estilo Gobierno y Tailwind

class AsuntoDetalleManager {
    constructor() {
        this.asunto = null;
        this.asuntoId = null;
        this.partes = null; 
        this.init();
    }

    init() {
        this.obtenerIdAsunto();
        this.cargarAsunto();
        this.inicializarEventos();
    }

    obtenerIdAsunto() {
        const urlParams = new URLSearchParams(window.location.search);
        this.asuntoId = parseInt(urlParams.get('id'));
        if (!this.asuntoId) {
            this.mostrarError('No se especificó un ID de asunto válido');
        }
    }

    cargarAsunto() {
        const asuntosGuardados = JSON.parse(localStorage.getItem('asuntos') || '[]');
        this.asunto = asuntosGuardados.find(a => a.id === this.asuntoId);

        if (!this.asunto) {
            this.mostrarError('No se encontró el asunto solicitado');
            return;
        }

        this.partes = this.parsePartes(this.asunto.partesProcesales);
        this.mostrarVista360();
        this.actualizarTitulo();
        this.cargarActividadReciente();
    }

    /* === Utilidades === */
    parsePartes(partesStr) {
        if (!partesStr) return { actor: 'N/D', demandado: 'N/D' };
        const partes = partesStr.split(/ vs\. /i);
        return {
            actor: (partes[0] || 'N/D').trim(),
            demandado: (partes[1] || 'N/D').trim()
        };
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString.length > 10 ? dateString : dateString + 'T00:00:00');
        if (isNaN(date)) return 'N/A';
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    guardarAsunto() {
        const asuntos = JSON.parse(localStorage.getItem('asuntos') || '[]');
        const index = asuntos.findIndex(a => a.id === this.asunto.id);
        if (index !== -1) asuntos[index] = this.asunto;
        localStorage.setItem('asuntos', JSON.stringify(asuntos));
    }

    /* === Render principal (VISTA 360 GOBIERNO V3) === */
    mostrarVista360() {
        const container = document.getElementById('vista-360-container');
        if (!this.asunto) {
            container.innerHTML = this.generarHTMLerror();
            return;
        }
        container.innerHTML = this.generarVista360HTML();
        // Re-init listeners internos de la vista generada
    }

    generarVista360HTML() {
        const prioridad = this.asunto.prioridadAsunto || 'Media';
        const abogado = this.asunto.abogadoResponsable || 'Sin asignar';
        const materia = this.asunto.materia || '—';
        const organo = this.asunto.organoJurisdiccional || '—';
        const gerencia = this.asunto.gerencia || '—';
        const sede = this.asunto.sedeEstado || '—';
        const estado = this.asunto.estado || 'Tramite';

        // Colores dinámicos para badges
        const badgeColor = estado.toLowerCase().includes('tramite') 
            ? 'bg-green-100 text-green-800 border-green-200' 
            : 'bg-yellow-100 text-yellow-800 border-yellow-200';

        return `
            <div class="flex flex-col gap-6">
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <i class="fas fa-clock text-gob-guinda text-2xl mb-2"></i>
                        <span class="text-2xl font-bold text-gob-gris font-headings">${(this.asunto.stats?.terminos) ?? 0}</span>
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Términos</span>
                    </div>
                    <div class="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <i class="fas fa-gavel text-gob-oro text-2xl mb-2"></i>
                        <span class="text-2xl font-bold text-gob-gris font-headings">${(this.asunto.stats?.audiencias) ?? 0}</span>
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Audiencias</span>
                    </div>
                    <div class="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <i class="fas fa-file-alt text-gob-plata text-2xl mb-2"></i>
                        <span class="text-2xl font-bold text-gob-gris font-headings">${(this.asunto.stats?.documentos) ?? 0}</span>
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Documentos</span>
                    </div>
                    <div class="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
                        <i class="fas fa-calendar-day text-gray-400 text-2xl mb-2"></i>
                        <span class="text-2xl font-bold text-gob-gris font-headings">${(this.asunto.stats?.dias) ?? 0}</span>
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Días Activo</span>
                    </div>
                </div>

                <div class="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <span class="text-xs font-bold text-gob-oro uppercase tracking-wider block mb-1">No. Expediente</span>
                            <h2 class="text-2xl font-bold text-gob-guinda font-headings">${this.asunto.expediente}</h2>
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
                                <p class="text-sm font-semibold text-gob-gris font-sans">${this.asunto.partesProcesales || `${this.partes.actor} vs ${this.partes.demandado}`}</p>
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
                                <p class="text-sm font-semibold text-gob-gris font-sans">${this.formatDate(this.asunto.fechaCreacion)}</p>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Prioridad</label>
                                <p class="text-sm font-bold ${prioridad === 'Alta' ? 'text-gob-guinda' : 'text-gray-600'}">${prioridad}</p>
                            </div>
                        </div>

                        ${this.asunto.descripcion ? `
                        <div class="mt-6 pt-6 border-t border-gray-100">
                            <label class="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción del Asunto</label>
                            <p class="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded border border-gray-100">
                                ${this.asunto.descripcion}
                            </p>
                        </div>` : ''}
                    </div>
                </div>

                <div class="bg-white rounded border border-gray-200 shadow-sm p-6">
                    <h3 class="text-lg font-bold text-gob-gris font-headings border-b border-gob-oro pb-2 mb-4">
                        Línea de Tiempo
                    </h3>
                    <div class="relative border-l-2 border-gray-200 ml-3 space-y-6 pl-6 py-2">
                        ${this.asunto.timeline && this.asunto.timeline.length > 0
                            ? this.asunto.timeline.map(item => this.generarTimelineItem(item)).join('')
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
                
                ${item.documentos && item.documentos.length > 0 ? `
                    <div class="flex flex-wrap gap-2 mt-2">
                        ${item.documentos.map(doc => `
                            <span class="inline-flex items-center px-2 py-1 rounded text-[10px] bg-gray-50 border border-gray-200 text-gray-600 hover:text-gob-guinda cursor-pointer">
                                <i class="fas fa-file-pdf mr-1 text-red-500"></i> ${doc}
                            </span>
                        `).join('')}
                    </div>` : ''
                }
            </div>
        `;
    }

    /* === Actividad Reciente (Sidebar derecho) === */
    cargarActividadReciente() {
        const container = document.getElementById('actividad-reciente-list');
        if (!container) return;

        const historial = this.asunto.historialActividad || [];
        if (historial.length === 0) {
            container.innerHTML = '<div class="p-4 text-sm text-gray-400 text-center">Sin actividad reciente.</div>';
            return;
        }

        container.innerHTML = historial.map(item => `
            <div class="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors relative pl-6">
                <div class="absolute left-2 top-5 w-1.5 h-1.5 rounded-full bg-gob-oro"></div>
                <p class="text-sm font-bold text-gray-800">${item.descripcion || 'Actualización'}</p>
                <p class="text-xs text-gray-500 mb-1">${this.formatDate(item.fecha)}</p>
                <p class="text-xs text-gray-400">por ${item.usuario || 'Sistema'}</p>
            </div>
        `).join('');
    }

    /* === UI feedback === */
    mostrarError(mensaje) {
        const container = document.getElementById('vista-360-container');
        if (container) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center p-12 bg-gray-50 rounded border border-gray-200 text-center">
                    <i class="fas fa-exclamation-circle text-4xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-bold text-gob-gris font-headings">${mensaje}</h3>
                    <a href="asuntos.html" class="mt-4 text-gob-guinda font-bold hover:underline text-sm">Volver al listado</a>
                </div>
            `;
        }
    }

    /* === Eventos globales === */
    inicializarEventos() {
        const btnCambiarEstado = document.getElementById('btn-cambiar-estado');
        if (btnCambiarEstado) btnCambiarEstado.addEventListener('click', () => this.abrirModalCambioEstado());

        // Listeners para cerrar modales (los mismos que tenías, usando flowbite attributes funciona, pero aseguramos JS)
        const modals = document.querySelectorAll('[data-modal-hide]');
        modals.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = btn.getAttribute('data-modal-hide');
                const modal = document.getElementById(targetId);
                if(modal) {
                     modal.classList.add('hidden');
                     modal.style.display = 'none';
                }
            });
        });

        const btnConfirmar = document.querySelector('#modal-cambio-estado button.bg-gob-guinda');
        if (btnConfirmar) btnConfirmar.addEventListener('click', () => this.confirmarCambioEstado());
    }

    /* === Lógica Modal Cambio Estado === */
    abrirModalCambioEstado() {
        if (!this.asunto) return;
        const modal = document.getElementById('modal-cambio-estado');
        const estadoActualEl = document.getElementById('estado-actual');
        
        if(estadoActualEl) estadoActualEl.textContent = this.asunto.estado || 'Activo';
        if(modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    confirmarCambioEstado() {
        const nuevoEstado = document.getElementById('nuevo-estado').value;
        const razon = document.getElementById('razon-cambio').value.trim();

        if (!nuevoEstado) return alert('Por favor selecciona un nuevo estado');

        // Actualizar datos
        this.asunto.estado = nuevoEstado;
        
        // Log en historial
        if (!this.asunto.historialActividad) this.asunto.historialActividad = [];
        this.asunto.historialActividad.unshift({
            fecha: new Date().toISOString(),
            descripcion: `Cambio de estado a ${nuevoEstado}`,
            detalles: razon,
            usuario: 'Usuario Abogado'
        });

        this.guardarAsunto();
        this.mostrarVista360(); // Re-renderizar para ver cambios
        
        // Cerrar modal
        const modal = document.getElementById('modal-cambio-estado');
        if(modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    actualizarTitulo() {
        if (!this.asunto) return;
        const el = document.getElementById('titulo-asunto');
        const bread = document.getElementById('titulo-breadcrumb');
        if(el) el.innerHTML = `<i class="fas fa-folder-open text-gob-guinda mr-2"></i> Expediente ${this.asunto.expediente}`;
        if(bread) bread.textContent = this.asunto.expediente;
    }
}

// Inicializar
let asuntoDetalle;
function initAsuntoDetalle() {
    asuntoDetalle = new AsuntoDetalleManager();
}