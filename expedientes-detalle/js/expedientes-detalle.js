// js/expedientes-detalle.js

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
        if (!this.asuntoId) this.mostrarError('No se especificó un ID de asunto válido');
    }

    cargarAsunto() {
        const asuntosGuardados = JSON.parse(localStorage.getItem('asuntos') || '[]');
        this.asunto = asuntosGuardados.find(a => a.id === this.asuntoId);
        if (!this.asunto) { this.mostrarError('No se encontró el asunto solicitado'); return; }
        this.partes = this.parsePartes(this.asunto.partesProcesales);
        this.mostrarVista360();
        this.actualizarTitulo();
        this.cargarActividadReciente();
    }

    parsePartes(partesStr) {
        if (!partesStr) return { actor: 'N/D', demandado: 'N/D' };
        const partes = partesStr.split(/ vs\. /i);
        return { actor: (partes[0] || 'N/D').trim(), demandado: (partes[1] || 'N/D').trim() };
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString.length > 10 ? dateString : dateString + 'T00:00:00');
        if (isNaN(date)) return 'N/A';
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    guardarAsunto() {
        const asuntos = JSON.parse(localStorage.getItem('asuntos') || '[]');
        const index = asuntos.findIndex(a => a.id === this.asunto.id);
        if (index !== -1) asuntos[index] = this.asunto;
        localStorage.setItem('asuntos', JSON.stringify(asuntos));
    }

    inicializarEventos() {
        // Abrir Modales
        const btnCambiarEstado = document.getElementById('btn-cambiar-estado');
        if (btnCambiarEstado) btnCambiarEstado.addEventListener('click', (e) => { e.preventDefault(); this.abrirModalCambioEstado(); });

        const btnEditar = document.getElementById('btn-editar-asunto');
        if (btnEditar) btnEditar.addEventListener('click', (e) => { e.preventDefault(); this.abrirModalEdicion(); });

        // Cerrar Modales (Delegación)
        document.querySelectorAll('[id^="close-modal"], [id^="cancelar-"]').forEach(btn => {
            btn.addEventListener('click', () => this.cerrarModales());
        });

        // Guardar
        document.getElementById('confirmar-cambio-estado')?.addEventListener('click', () => this.confirmarCambioEstado());
        document.getElementById('guardar-editar')?.addEventListener('click', () => this.guardarEdicion());

        // Click fuera
        window.addEventListener('click', (e) => { if (e.target.classList.contains('fixed')) this.cerrarModales(); });
    }

    /* === MODAL EDICIÓN === */
    abrirModalEdicion() {
        if (!this.asunto) return;
        document.getElementById('edit-expediente').value = this.asunto.expediente || '';
        document.getElementById('edit-materia').value = this.asunto.materia || 'Civil';
        document.getElementById('edit-gerencia').value = this.asunto.gerencia || '';
        document.getElementById('edit-sede').value = this.asunto.sede || this.asunto.sedeEstado || '';
        document.getElementById('edit-abogado').value = this.asunto.abogadoResponsable || '';
        document.getElementById('edit-partes').value = this.asunto.partesProcesales || '';
        document.getElementById('edit-organo').value = this.asunto.organoJurisdiccional || '';
        document.getElementById('edit-prioridad').value = this.asunto.prioridadAsunto || 'Media';
        document.getElementById('edit-descripcion').value = this.asunto.descripcion || '';

        const modal = document.getElementById('modal-editar-asunto');
        modal.classList.remove('hidden'); modal.classList.add('flex');
    }

    guardarEdicion() {
        this.asunto.expediente = document.getElementById('edit-expediente').value;
        this.asunto.materia = document.getElementById('edit-materia').value;
        this.asunto.gerencia = document.getElementById('edit-gerencia').value;
        this.asunto.sedeEstado = document.getElementById('edit-sede').value;
        this.asunto.abogadoResponsable = document.getElementById('edit-abogado').value;
        this.asunto.partesProcesales = document.getElementById('edit-partes').value;
        this.asunto.organoJurisdiccional = document.getElementById('edit-organo').value;
        this.asunto.prioridadAsunto = document.getElementById('edit-prioridad').value;
        this.asunto.descripcion = document.getElementById('edit-descripcion').value;

        this.guardarAsunto();
        this.partes = this.parsePartes(this.asunto.partesProcesales);
        this.mostrarVista360();
        this.actualizarTitulo();
        this.cerrarModales();
    }

    /* === MODAL ESTADO === */
    abrirModalCambioEstado() {
        if (!this.asunto) return;
        document.getElementById('estado-actual').textContent = this.asunto.estado || 'Activo';
        document.getElementById('nuevo-estado').value = '';
        document.getElementById('razon-cambio').value = '';
        
        const modal = document.getElementById('modal-cambio-estado');
        modal.classList.remove('hidden'); modal.classList.add('flex');
    }

    confirmarCambioEstado() {
        const nuevo = document.getElementById('nuevo-estado').value;
        const razon = document.getElementById('razon-cambio').value;
        if(!nuevo) return alert('Selecciona estado');

        this.asunto.estado = nuevo;
        if(!this.asunto.historialActividad) this.asunto.historialActividad = [];
        this.asunto.historialActividad.unshift({
            fecha: new Date().toISOString(), descripcion: `Cambio a: ${nuevo}`, usuario: 'Abogado', detalles: razon
        });

        this.guardarAsunto();
        this.mostrarVista360();
        this.cargarActividadReciente();
        this.cerrarModales();
    }

    cerrarModales() {
        document.querySelectorAll('.fixed.z-\\[60\\]').forEach(m => { m.classList.add('hidden'); m.classList.remove('flex'); });
    }

    /* === RENDER === */
    mostrarVista360() {
        const container = document.getElementById('vista-360-container');
        if (!this.asunto) { container.innerHTML = '<div class="p-8">Error loading</div>'; return; }
        container.innerHTML = this.generarVista360HTML();
    }

    generarVista360HTML() {
        const a = this.asunto;
        const badgeColor = (a.estado||'').toLowerCase().includes('tramite') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        return `
            <div class="flex flex-col gap-6">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${this.kpi('clock', 'guinda', a.stats?.terminos, 'Términos')}
                    ${this.kpi('gavel', 'oro', a.stats?.audiencias, 'Audiencias')}
                    ${this.kpi('file-alt', 'plata', a.stats?.documentos, 'Documentos')}
                    ${this.kpi('calendar-day', 'gray-400', a.stats?.dias, 'Días Activo')}
                </div>
                <div class="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <div><span class="text-xs font-bold text-gob-oro uppercase">No. Expediente</span><h2 class="text-2xl font-bold text-gob-guinda font-headings">${a.expediente}</h2></div>
                        <span class="px-3 py-1 rounded-full text-sm font-bold border uppercase ${badgeColor}">${a.estado}</span>
                    </div>
                    <div class="p-6"><div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${this.field('Materia', a.materia)} ${this.field('Gerencia', a.gerencia)} ${this.field('Sede', a.sedeEstado)}
                        <div class="md:col-span-3">${this.field('Partes', a.partesProcesales)}</div>
                        ${this.field('Abogado', a.abogadoResponsable)} ${this.field('Órgano', a.organoJurisdiccional)} ${this.field('Prioridad', a.prioridadAsunto)}
                    </div>
                    ${a.descripcion ? `<div class="mt-6 pt-6 border-t"><p class="text-sm text-gray-600 bg-gray-50 p-3 rounded">${a.descripcion}</p></div>` : ''}
                    </div>
                </div>
            </div>`;
    }

    kpi(icon, color, val, label) {
        return `<div class="bg-white p-4 rounded border shadow-sm text-center"><i class="fas fa-${icon} text-gob-${color} text-2xl mb-2"></i><span class="text-2xl font-bold block">${val||0}</span><span class="text-xs text-gray-400 uppercase">${label}</span></div>`;
    }
    field(label, val) { return `<div><label class="block text-xs font-bold text-gray-400 uppercase mb-1">${label}</label><p class="text-sm font-semibold text-gob-gris">${val||'—'}</p></div>`; }

    actualizarTitulo() {
        if (this.asunto) document.getElementById('titulo-asunto').innerHTML = `<i class="fas fa-folder-open text-gob-oro"></i> Expediente ${this.asunto.expediente}`;
    }

    cargarActividadReciente() {
        const container = document.getElementById('actividad-reciente-list');
        const hist = this.asunto.historialActividad || [];
        container.innerHTML = hist.length ? hist.map(i => `<div class="p-4 border-b text-sm"><p class="font-bold">${i.descripcion}</p><p class="text-xs text-gray-500">${this.formatDate(i.fecha)}</p></div>`).join('') : '<div class="p-4 text-sm text-gray-400">Sin actividad.</div>';
    }
}

// Init Global
let expedienteDetalle;
function initExpedienteDetalle() { expedienteDetalle = new AsuntoDetalleManager(); }