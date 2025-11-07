// Lógica para la página de detalle del asunto - Versión Optimizada
class AsuntoDetalleManager {
    constructor() {
        this.asunto = null;
        this.asuntoId = null;
        this.partes = null; // Guardará { actor: '...', demandado: '...' }
        this.init();
    }

    init() {
        this.obtenerIdAsunto();
        this.cargarAsunto();
        this.inicializarEventos();
    }

    obtenerIdAsunto() {
        const urlParams = new URLSearchParams(window.location.search);
        // Usar parseInt() es bueno, pero como lo guardas como número, está bien
        this.asuntoId = parseInt(urlParams.get('id')); 
        
        if (!this.asuntoId) {
            this.mostrarError('No se especificó un ID de asunto válido');
            return;
        }
    }

    cargarAsunto() {
        const asuntosGuardados = JSON.parse(localStorage.getItem('asuntos') || '[]');
        
        // El ID de localStorage es un número, así que comparamos números
        this.asunto = asuntosGuardados.find(a => a.id === this.asuntoId);

        if (!this.asunto) {
            this.mostrarError('No se encontró el asunto solicitado');
            return;
        }

        // --- ¡CAMBIO IMPORTANTE! ---
        // Parseamos las partes procesales aquí para usarlas en toda la clase
        this.partes = this.parsePartes(this.asunto.partesProcesales);
        // --- FIN DEL CAMBIO ---

        this.mostrarVista360();
        this.actualizarTitulo();
        this.cargarDatosAdicionales();
    }
    
    /* --- NUEVA FUNCIÓN DE AYUDA --- */
    parsePartes(partesStr) {
        if (!partesStr) return { actor: 'N/D', demandado: 'N/D' };
        // Separa por " vs. " (con o sin mayúsculas)
        const partes = partesStr.split(/ vs\. /i); 
        return {
            actor: partes[0] || 'N/D',
            demandado: partes[1] || 'N/D'
        };
    }

    mostrarVista360() {
        const container = document.getElementById('vista-360-container');
        
        if (!this.asunto) {
            container.innerHTML = this.generarHTMLerror();
            return;
        }

        container.innerHTML = this.generarVista360HTML();
        this.configurarEventosVista360();
    }

    /* --- FUNCIÓN MODIFICADA --- */
    generarVista360HTML() {
        // Leemos de las claves de datos NUEVAS
        const prioridad = this.asunto.prioridadAsunto || 'Media';
        const abogado = this.asunto.abogadoResponsable || 'Sin asignar';
        // this.partes fue definido en cargarAsunto()
        
        return `
            <div class="vista-360">
                <div class="caso-header">
                    <div class="caso-info">
                        <h2>Expediente: ${this.asunto.expediente}</h2>
                        <div class="caso-estado">
                            <span class="badge badge-${this.asunto.materia.toLowerCase()}">${this.asunto.materia}</span>
                            <span class="badge badge-${prioridad.toLowerCase()}">${prioridad} Prioridad</span>
                            <span class="badge badge-activo">${this.asunto.estado}</span>
                        </div>
                    </div>
                    <div class="caso-meta">
                        <p><strong>Abogado:</strong> ${abogado}</p>
                        <p><strong>Demandado:</strong> ${this.partes.demandado}</p>
                        <p><strong>Fecha creación:</strong> ${this.formatDate(this.asunto.fechaCreacion)}</p>
                        <p><strong>Cliente:</strong> ${this.partes.actor}</p>
                    </div>
                </div>
                
                <div class="caso-stats">
                    <div class="stat-card">
                        <i class="fas fa-clock"></i>
                        <div class="stat-number">${this.asunto.stats.terminos}</div>
                        <div class="stat-label">Términos Pendientes</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-gavel"></i>
                        <div class="stat-number">${this.asunto.stats.audiencias}</div>
                        <div class="stat-label">Audiencias Programadas</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-file"></i>
                        <div class="stat-number">${this.asunto.stats.documentos}</div>
                        <div class="stat-label">Documentos</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-calendar"></i>
                        <div class="stat-number">${this.asunto.stats.dias}</div>
                        <div class="stat-label">Días Transcurridos</div>
                    </div>
                </div>
                
                <div class="timeline-caso">
                    <div class="timeline-header">
                        <h3>Línea de Tiempo del Caso</h3>
                    </div>
                    <div class="timeline">
                        ${this.asunto.timeline && this.asunto.timeline.length > 0 ? 
                            this.asunto.timeline.map(item => this.generarTimelineItem(item)).join('') :
                            '<div class="timeline-empty">No hay eventos registrados</div>'
                        }
                    </div>
                </div>

                <div class="documentos-section">
                    <div class="documentos-header">
                        <h3>Documentos del asunto</h3>
                        <button class="btn btn-sm btn-primary" id="btn-subir-documento">
                            <i class="fas fa-upload"></i> Subir Documento
                        </button>
                    </div>
                    <div class="documentos-fases">
                        ${this.generarDocumentosFases()}
                    </div>
                </div>
            </div>
        `;
    }

    // ... (el resto del código se mantiene igual)
    generarTimelineItem(item) {
        return `
            <div class="timeline-item ${item.estado}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${this.formatDate(item.fecha)}</div>
                    <div class="timeline-title">${item.titulo}</div>
                    <div class="timeline-desc">${item.descripcion}</div>
                    ${item.documentos && item.documentos.length > 0 ? `
                        <div class="timeline-docs">
                            ${item.documentos.map(doc => `
                                <span class="doc-badge"><i class="fas fa-file-pdf"></i> ${doc}</span>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${item.alerta ? `
                        <div class="timeline-alerta">⚠️ ${item.alerta}</div>
                    ` : ''}
                    <div class="timeline-actions">
                        <button class="btn btn-sm btn-warning editar-evento" data-id="${item.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger eliminar-evento" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    generarDocumentosFases() {
        if (!this.asunto.documentos) {
            return '<div class="fase-empty">No hay documentos registrados</div>';
        }

        return Object.entries(this.asunto.documentos).map(([fase, documentos]) => `
            <div class="fase">
                <h4>${this.capitalize(fase)}</h4>
                <div class="documentos-list">
                    ${documentos.length > 0 ? 
                        documentos.map(doc => this.generarDocumentoItem(doc)).join('') :
                        '<div class="documento-empty">No hay documentos</div>'
                    }
                </div>
            </div>
        `).join('');
    }

    generarDocumentoItem(doc) {
        return `
            <div class="documento-item">
                <i class="fas fa-file-${doc.tipo || 'pdf'}"></i>
                <span class="documento-nombre">${doc.nombre}</span>
                <div class="documento-actions">
                    <button class="btn btn-sm btn-primary">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn btn-sm btn-warning">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    configurarEventosVista360() {
        document.getElementById('btn-editar-asunto')?.addEventListener('click', () => {
            this.editarAsunto();
        });

        document.getElementById('btn-agregar-evento')?.addEventListener('click', () => {
            this.agregarEvento();
        });

        document.getElementById('btn-subir-documento')?.addEventListener('click', () => {
            this.subirDocumento();
        });
    }

    editarAsunto() {
        alert('Funcionalidad de edición de asunto - Por implementar');
    }

    agregarEvento() {
        alert('Funcionalidad de agregar evento - Por implementar');
    }

    subirDocumento() {
        alert('Funcionalidad de subir documento - Por implementar');
    }

    inicializarEventos() {
        const closePanel = document.getElementById('close-panel-recordatorios');
        if (closePanel) {
            closePanel.addEventListener('click', () => {
                document.getElementById('panel-recordatorios').classList.remove('mostrar');
            });
        }

        // Evento para abrir modal de cambio de estado
        const btnCambiarEstado = document.getElementById('btn-cambiar-estado');
        console.log('Botón cambiar estado encontrado:', btnCambiarEstado);
        if (btnCambiarEstado) {
            btnCambiarEstado.addEventListener('click', () => {
                console.log('Click en botón cambiar estado');
                this.abrirModalCambioEstado();
            });
        }

        // Evento para cerrar modal de cambio de estado
        const btnCerrarModal = document.querySelector('#modal-cambio-estado .btn-secondary');
        if (btnCerrarModal) {
            btnCerrarModal.addEventListener('click', () => {
                this.cerrarModalCambioEstado();
            });
        }
        
        // --- CORRECCIÓN: Tu HTML usa btn-danger para cerrar, vamos a añadirlo ---
        const btnCerrarModalIcono = document.getElementById('close-modal-estado');
        if (btnCerrarModalIcono) {
            btnCerrarModalIcono.addEventListener('click', () => {
                this.cerrarModalCambioEstado();
            });
        }
        // --- FIN DE CORRECCIÓN ---


        // Evento para confirmar cambio de estado
        const btnConfirmar = document.querySelector('#modal-cambio-estado .btn-primary');
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', () => {
                this.confirmarCambioEstado();
            });
        }

        // Cerrar modal al hacer clic fuera
        const modal = document.getElementById('modal-cambio-estado');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModalCambioEstado();
                }
            });
        }
    }

    /* --- FUNCIÓN MODIFICADA --- */
    actualizarTitulo() {
        if (this.asunto) {
            // Usamos 'this.partes.actor' que ya parseamos
            document.getElementById('titulo-asunto').textContent = 
                `Detalles de asunto - ${this.asunto.expediente} - ${this.partes.actor}`;
            
            // Actualizamos también el título de la pestaña del navegador
            document.title = `Detalles - ${this.asunto.expediente} (${this.partes.actor}) - Agenda Legal`;
        }
    }

    cargarDatosAdicionales() {
        this.cargarDocumentosRelacionados();
        this.cargarActividadReciente();
    }

    cargarDocumentosRelacionados() {
        const container = document.getElementById('documentos-relacionados');
        if (!container) return;

        const documentos = [
            { nombre: 'Contrato principal.pdf', tipo: 'pdf', fecha: '2025-01-10' },
            { nombre: 'Anexo técnico.docx', tipo: 'word', fecha: '2025-01-12' },
            { nombre: 'Evidencia fotográfica.zip', tipo: 'archive', fecha: '2025-01-15' }
        ];

        let html = '';
        documentos.forEach(doc => {
            html += `
                <div class="documento-relacionado">
                    <i class="fas fa-file-${doc.tipo}"></i>
                    <div class="documento-info">
                        <div class="documento-nombre">${doc.nombre}</div>
                        <div class="documento-fecha">${this.formatDate(doc.fecha)}</div>
                    </div>
                    <button class="btn btn-sm btn-primary">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    cargarActividadReciente() {
        const container = document.getElementById('actividad-reciente-list');
        if (!container) return;

        // --- Muestra el historial de cambios de estado ---
        const historial = this.asunto.historialActividad || [];
        
        const actividad = [
            { accion: 'Documento agregado', usuario: 'Lic. Martínez', fecha: '2025-01-20 14:30' },
            { accion: 'Evento programado', usuario: 'Sistema', fecha: '2025-01-18 16:45' }
        ];
        
        // Combinar historial con actividad de ejemplo (en un futuro, todo vendrá del historial)
        const actividadCompleta = historial.map(item => ({
            accion: item.descripcion,
            usuario: item.usuario,
            fecha: item.fecha
        })).concat(actividad);


        let html = '';
        actividadCompleta.forEach(item => {
            html += `
                <div class="actividad-item">
                    <div class="actividad-icon">
                        <i class="fas fa-circle"></i>
                    </div>
                    <div class="actividad-content">
                        <div class="actividad-text">${item.accion}</div>
                        <div class="actividad-meta">
                            <span>por ${item.usuario}</span>
                            <span>•</span>
                            <span>${this.formatDate(item.fecha)}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    guardarAsunto() {
        const asuntos = JSON.parse(localStorage.getItem('asuntos') || '[]');
        const index = asuntos.findIndex(a => a.id === this.asunto.id);
        
        if (index !== -1) {
            asuntos[index] = this.asunto;
        } else {
            asuntos.push(this.asunto);
        }
        
        localStorage.setItem('asuntos', JSON.stringify(asuntos));
    }

    mostrarError(mensaje) {
        const container = document.getElementById('vista-360-container');
        if (container) {
             container.innerHTML = this.generarHTMLerror(mensaje);
        }
    }

    generarHTMLerror(mensaje = 'Error al cargar el asunto') {
        return `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>${mensaje}</h3>
                <p>No se pudo cargar la información del asunto solicitado.</p>
                <a href="asuntos.html" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i> Volver a Asuntos
                </a>
            </div>
        `;
    }

    abrirModalCambioEstado() {
        console.log('Abriendo modal de cambio de estado');
        if (!this.asunto) {
            console.log('No hay asunto cargado');
            return;
        }

        // Mostrar estado actual
        document.getElementById('estado-actual').textContent = this.capitalize(this.asunto.estado);
        
        // Llenar el select con los estados disponibles
        const selectNuevoEstado = document.getElementById('nuevo-estado');
        const estadosDisponibles = ['activo', 'en revision', 'pausado', 'completado', 'cerrado'];
        
        selectNuevoEstado.innerHTML = '';
        estadosDisponibles.forEach(estado => {
            if (estado !== this.asunto.estado) {
                const option = document.createElement('option');
                option.value = estado;
                option.textContent = this.capitalize(estado);
                selectNuevoEstado.appendChild(option);
            }
        });

        // Limpiar textarea de razón
        document.getElementById('razon-cambio').value = '';

        // Mostrar modal
        document.getElementById('modal-cambio-estado').style.display = 'flex';
    }

    cerrarModalCambioEstado() {
        document.getElementById('modal-cambio-estado').style.display = 'none';
    }

    confirmarCambioEstado() {
        const nuevoEstado = document.getElementById('nuevo-estado').value;
        const razon = document.getElementById('razon-cambio').value.trim();

        if (!nuevoEstado) {
            alert('Por favor selecciona un nuevo estado');
            return;
        }

        if (!razon) {
            alert('Por favor proporciona una razón para el cambio');
            return;
        }

        // Guardar estado anterior para el historial
        const estadoAnterior = this.asunto.estado;
        
        // Actualizar el estado del asunto
        this.asunto.estado = nuevoEstado;
        this.asunto.fechaActualizacion = new Date().toISOString();

        // Agregar entrada al historial de actividad
        if (!this.asunto.historialActividad) {
            this.asunto.historialActividad = [];
        }

        this.asunto.historialActividad.unshift({
            fecha: new Date().toISOString(),
            tipo: 'cambio_estado',
            descripcion: `Estado cambiado de "${this.capitalize(estadoAnterior)}" a "${this.capitalize(nuevoEstado)}"`,
            detalles: razon,
            usuario: 'Usuario Actual' // En una aplicación real, esto vendría del sistema de autenticación
        });

        // Guardar en localStorage
        this.guardarAsunto();

        // Actualizar la vista
        this.actualizarVistaDetalle(); // Esta función recargará la vista
        this.cargarActividadReciente(); // Y esta recargará la lista de actividad

        // Cerrar modal
        this.cerrarModalCambioEstado();

        // Mostrar mensaje de confirmación
        this.mostrarMensajeExito(`Estado actualizado a "${this.capitalize(nuevoEstado)}" exitosamente`);
    }

    actualizarVistaDetalle() {
        if (!this.asunto) return;

        // Actualizar el badge de estado en la vista principal
        // Esta es la forma más simple de actualizar, recargando el HTML principal
        const container = document.getElementById('vista-360-container');
        if (container) {
            container.innerHTML = this.generarVista360HTML();
            // Re-conectar eventos después de recargar el HTML
            this.configurarEventosVista360(); 
        }
    }

    mostrarMensajeExito(mensaje) {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${mensaje}</span>
        `;

        // Agregar estilos si no existen
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    background: #4CAF50;
                    color: white;
                    border-radius: 5px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                }
                
                .notification.success {
                    background: #4CAF50;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(styles);
        }

        // Agregar al DOM
        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const date = new Date(dateString + 'T00:00:00'); // Evitar desfase de zona horaria
        return date.toLocaleDateString('es-ES', options);
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Inicializar la aplicación
let asuntoDetalle;

function initAsuntoDetalle() {
    asuntoDetalle = new AsuntoDetalleManager();
}