// js/asunto-detalle.js
// Lógica para la página de detalle del asunto - Versión Optimizada (Edición con campos requeridos exactos)

class AsuntoDetalleManager {
    constructor() {
        this.asunto = null;
        this.asuntoId = null;
        this.partes = null; // { actor: '...', demandado: '...' }
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

        // Parseo centralizado de partes procesales
        this.partes = this.parsePartes(this.asunto.partesProcesales);

        this.mostrarVista360();
        this.actualizarTitulo();
        this.cargarDatosAdicionales();
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
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    guardarAsunto() {
        const asuntos = JSON.parse(localStorage.getItem('asuntos') || '[]');
        const index = asuntos.findIndex(a => a.id === this.asunto.id);
        if (index !== -1) asuntos[index] = this.asunto;
        else asuntos.push(this.asunto);
        localStorage.setItem('asuntos', JSON.stringify(asuntos));
    }

    /* === Render principal === */
    mostrarVista360() {
        const container = document.getElementById('vista-360-container');
        if (!this.asunto) {
            container.innerHTML = this.generarHTMLerror();
            return;
        }
        container.innerHTML = this.generarVista360HTML();
        this.configurarEventosVista360();
    }

    generarVista360HTML() {
        const prioridad = this.asunto.prioridadAsunto || 'Media';
        const abogado = this.asunto.abogadoResponsable || 'Sin asignar';
        const materia = this.asunto.tipoAsunto || '—'; // Prestación / Procedimiento
        const organo = this.asunto.organoJurisdiccional || '—';
        const gerencia = this.asunto.gerencia || '—';
        const sede = this.asunto.sedeEstado || '—';

        return `
            <div class="vista-360">
                <div class="caso-header">
                    <div class="caso-info">
                        <h2>Expediente: ${this.asunto.expediente}</h2>
                        <div class="caso-estado">
                            <span class="badge badge-${prioridad.toLowerCase()}">${prioridad} Prioridad</span>
                            <span class="badge badge-info">${this.capitalize(materia)}</span>
                            <span class="badge badge-secondary">${this.capitalize(organo)}</span>
                        </div>
                    </div>
                    <div class="caso-meta">
                        <p><strong>Gerencia:</strong> ${gerencia}</p>
                        <p><strong>Sede (Estado):</strong> ${sede}</p>
                        <p><strong>Abogado Responsable:</strong> ${abogado}</p>
                        <p><strong>Partes Procesales:</strong> ${this.asunto.partesProcesales || `${this.partes.actor} vs. ${this.partes.demandado}`}</p>
                        <p><strong>Fecha creación:</strong> ${this.formatDate(this.asunto.fechaCreacion)}</p>
                    </div>
                </div>

                <div class="caso-stats">
                    <div class="stat-card">
                        <i class="fas fa-clock"></i>
                        <div class="stat-number">${(this.asunto.stats && this.asunto.stats.terminos) ?? 0}</div>
                        <div class="stat-label">Términos Pendientes</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-gavel"></i>
                        <div class="stat-number">${(this.asunto.stats && this.asunto.stats.audiencias) ?? 0}</div>
                        <div class="stat-label">Audiencias Programadas</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-file"></i>
                        <div class="stat-number">${(this.asunto.stats && this.asunto.stats.documentos) ?? 0}</div>
                        <div class="stat-label">Documentos</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-calendar"></i>
                        <div class="stat-number">${(this.asunto.stats && this.asunto.stats.dias) ?? 0}</div>
                        <div class="stat-label">Días Transcurridos</div>
                    </div>
                </div>

                <div class="timeline-caso">
                    <div class="timeline-header">
                        <h3>Línea de Tiempo del Caso</h3>
                    </div>
                    <div class="timeline">
                        ${this.asunto.timeline && this.asunto.timeline.length > 0
                            ? this.asunto.timeline.map(item => this.generarTimelineItem(item)).join('')
                            : '<div class="timeline-empty">No hay eventos registrados</div>'
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

                ${this.asunto.descripcion ? `
                <div class="descripcion-section">
                    <h3><i class="fas fa-align-left"></i> Descripción</h3>
                    <p>${this.asunto.descripcion}</p>
                </div>` : '' }
            </div>
        `;
    }

    generarTimelineItem(item) {
        return `
            <div class="timeline-item ${item.estado || ''}">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                    <div class="timeline-date">${this.formatDate(item.fecha)}</div>
                    <div class="timeline-title">${item.titulo || ''}</div>
                    <div class="timeline-desc">${item.descripcion || ''}</div>
                    ${item.documentos && item.documentos.length > 0 ? `
                        <div class="timeline-docs">
                            ${item.documentos.map(doc => `<span class="doc-badge"><i class="fas fa-file-pdf"></i> ${doc}</span>`).join('')}
                        </div>` : ''
                    }
                    ${item.alerta ? `<div class="timeline-alerta">⚠️ ${item.alerta}</div>` : ''}
                    <div class="timeline-actions">
                        <button class="btn btn-sm btn-warning editar-evento" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger eliminar-evento" data-id="${item.id}"><i class="fas fa-trash"></i></button>
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
                    ${documentos.length > 0
                        ? documentos.map(doc => this.generarDocumentoItem(doc)).join('')
                        : '<div class="documento-empty">No hay documentos</div>'
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
                    <button class="btn btn-sm btn-primary"><i class="fas fa-download"></i></button>
                    <button class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    }

    configurarEventosVista360() {
        document.getElementById('btn-editar-asunto')?.addEventListener('click', () => this.editarAsunto());
        document.getElementById('btn-agregar-evento')?.addEventListener('click', () => this.agregarEvento());
        document.getElementById('btn-subir-documento')?.addEventListener('click', () => this.subirDocumento());
    }

    /* === Edición: SOLO los campos solicitados === */
    editarAsunto() {
        if (!this.asunto) return;

        if (!document.getElementById('modal-editar-asunto')) {
            this.crearModalEditarAsunto();
        }

        // Prefill de campos
        document.getElementById('edit-expediente').value = this.asunto.expediente || '';
        document.getElementById('edit-gerencia').value = this.asunto.gerencia || '';
        document.getElementById('edit-sede').value = this.asunto.sedeEstado || '';
        document.getElementById('edit-abogado').value = this.asunto.abogadoResponsable || '';
        document.getElementById('edit-partes').value = this.asunto.partesProcesales || `${this.partes.actor} vs. ${this.partes.demandado}`;
        document.getElementById('edit-tipo-asunto').value = this.asunto.tipoAsunto || '';
        document.getElementById('edit-organo').value = this.asunto.organoJurisdiccional || '';
        document.getElementById('edit-prioridad').value = this.asunto.prioridadAsunto || 'Media';
        document.getElementById('edit-descripcion').value = this.asunto.descripcion || '';

        // Mostrar modal
        document.getElementById('modal-editar-asunto').style.display = 'flex';
    }

    crearModalEditarAsunto() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'modal-editar-asunto';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> Editar Asunto</h2>
                    <button class="btn btn-danger" id="close-modal-editar"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="form-grid">
                        
                        <!-- Expediente -->
                        <div class="form-group">
                            <label for="edit-expediente">Expediente *</label>
                            <input id="edit-expediente" type="text" required placeholder="2375/2025">
                        </div>
    
                        <!-- Gerencia (corporativa) -->
                        <div class="form-group">
                            <label for="edit-gerencia">Gerencia *</label>
                            <select id="edit-gerencia" required>
                                <option value="">Selecciona...</option>
                                <option value="Gerencia de Civil Mercantil, Fiscal y Administrativo">
                                    Gerencia de Civil Mercantil, Fiscal y Administrativo
                                </option>
                                <option value="Gerencia Jurídica y Financiera">Gerencia Jurídica y Financiera</option>
                                <option value="Gerencia Laboral y Penal">Gerencia Laboral y Penal</option>
                            </select>
                        </div>
    
                        <!-- Sede (Estado) -->
                        <div class="form-group">
                            <label for="edit-sede">Sede (Estado) *</label>
                            <select id="edit-sede" required>
                                <option value="">Seleccione un estado</option>
                                <option>Aguascalientes</option>
                                <option>Baja California</option>
                                <option>Baja California Sur</option>
                                <option>Campeche</option>
                                <option>Chiapas</option>
                                <option>Chihuahua</option>
                                <option>Ciudad de México</option>
                                <option>Coahuila</option>
                                <option>Colima</option>
                                <option>Durango</option>
                                <option>Estado de México</option>
                                <option>Guanajuato</option>
                                <option>Guerrero</option>
                                <option>Hidalgo</option>
                                <option>Jalisco</option>
                                <option>Michoacán</option>
                                <option>Morelos</option>
                                <option>Nayarit</option>
                                <option>Nuevo León</option>
                                <option>Oaxaca</option>
                                <option>Puebla</option>
                                <option>Querétaro</option>
                                <option>Quintana Roo</option>
                                <option>San Luis Potosí</option>
                                <option>Sinaloa</option>
                                <option>Sonora</option>
                                <option>Tabasco</option>
                                <option>Tamaulipas</option>
                                <option>Tlaxcala</option>
                                <option>Veracruz</option>
                                <option>Yucatán</option>
                                <option>Zacatecas</option>
                            </select>
                        </div>
    
                        <!-- Materia -->
                        <div class="form-group">
                            <label for="edit-materia">Materia *</label>
                            <select id="edit-materia" required>
                                <option value="">Seleccione...</option>
                                <option>Laboral</option>
                                <option>Civil</option>
                                <option>Mercantil</option>
                                <option>Fiscal</option>
                                <option>Administrativo</option>
                                <option>Penal</option>
                            </select>
                        </div>
    
                        <!-- Abogado Responsable -->
                        <div class="form-group">
                            <label for="edit-abogado">Abogado Responsable *</label>
                            <input id="edit-abogado" type="text" required placeholder="Lic. Martínez">
                        </div>
    
                        <!-- Partes Procesales -->
                        <div class="form-group two-col">
                            <label for="edit-partes">Partes Procesales (Actor/Quejoso/Partes) *</label>
                            <input id="edit-partes" type="text" required placeholder="Juan Pérez vs. Empresa S.A. de C.V.">
                        </div>
    
                        <!-- Tipo de Asunto -->
                        <div class="form-group">
                            <label for="edit-tipo-asunto">Tipo de Asunto *</label>
                            <select id="edit-tipo-asunto" required>
                                <option value="">Seleccione...</option>
                                <option value="Prestación">Prestación</option>
                                <option value="Procedimiento">Procedimiento</option>
                            </select>
                        </div>
    
                        <!-- Órgano Jurisdiccional -->
                        <div class="form-group">
                            <label for="edit-organo">Órgano Jurisdiccional *</label>
                            <select id="edit-organo" required>
                                <option value="">Seleccione...</option>
                                <option value="Tribunal">Tribunal</option>
                                <option value="Autoridad">Autoridad</option>
                            </select>
                        </div>
    
                        <!-- Prioridad -->
                        <div class="form-group">
                            <label for="edit-prioridad">Prioridad del Asunto *</label>
                            <select id="edit-prioridad" required>
                                <option>Alta</option>
                                <option selected>Media</option>
                                <option>Baja</option>
                            </select>
                        </div>
    
                        <!-- Descripción -->
                        <div class="form-group two-col">
                            <label for="edit-descripcion">Descripción</label>
                            <textarea id="edit-descripcion" placeholder="Descripción general del asunto..."></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="btn-cancelar-edicion">Cancelar</button>
                    <button class="btn btn-primary" id="btn-guardar-edicion">
                        <i class="fas fa-check"></i> Guardar cambios
                    </button>
                </div>
            </div>
        `;
    
        document.body.appendChild(modal);
    
        // Cerrar modal
        document.getElementById('close-modal-editar').addEventListener('click', () => this.cerrarModalEditarAsunto());
        document.getElementById('btn-cancelar-edicion').addEventListener('click', () => this.cerrarModalEditarAsunto());
        modal.addEventListener('click', (e) => { if (e.target === modal) this.cerrarModalEditarAsunto(); });
    
        // Guardar
        document.getElementById('btn-guardar-edicion').addEventListener('click', () => this.confirmarEdicionAsunto());
    
        // Estilos
        if (!document.getElementById('edit-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'edit-modal-styles';
            styles.textContent = `
                .form-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:14px; }
                .form-group label { display:block; font-weight:600; margin-bottom:6px; }
                .form-group input, .form-group select, .form-group textarea {
                    width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;
                }
                .form-group textarea { min-height: 90px; resize: vertical; }
                .two-col { grid-column: span 2; }
                @media (max-width: 640px) { .two-col { grid-column: span 1; } }
            `;
            document.head.appendChild(styles);
        }
    }
    
    cerrarModalEditarAsunto() {
        const modal = document.getElementById('modal-editar-asunto');
        if (modal) modal.style.display = 'none';
    }

    confirmarEdicionAsunto() {
        // Validaciones mínimas
        const reqIds = [
            'edit-expediente','edit-gerencia','edit-sede','edit-abogado',
            'edit-partes','edit-tipo-asunto','edit-organo','edit-prioridad'
        ];
        for (const id of reqIds) {
            const el = document.getElementById(id);
            if (!el || !String(el.value || '').trim()) {
                el?.focus();
                return alert('Por favor completa los campos obligatorios (*)');
            }
        }

        const expediente = document.getElementById('edit-expediente').value.trim();
        const gerencia = document.getElementById('edit-gerencia').value.trim();
        const sedeEstado = document.getElementById('edit-sede').value.trim();
        const abogadoResponsable = document.getElementById('edit-abogado').value.trim();
        const partesProcesales = document.getElementById('edit-partes').value.trim();
        const tipoAsunto = document.getElementById('edit-tipo-asunto').value.trim(); // Prestación/Procedimiento
        const organoJurisdiccional = document.getElementById('edit-organo').value.trim(); // Tribunal/Autoridad
        const prioridadAsunto = document.getElementById('edit-prioridad').value.trim();
        const descripcion = document.getElementById('edit-descripcion').value.trim();

        // Valida formato de partes (si aplica a tu operación)
        if (!/.*\s+vs\.?\s+.*/i.test(partesProcesales)) {
            return alert('Usa el formato "Actor vs. Parte" en Partes Procesales');
        }

        // Snapshot para auditoría
        const snapshot = {
            expediente: this.asunto.expediente,
            gerencia: this.asunto.gerencia,
            sedeEstado: this.asunto.sedeEstado,
            abogadoResponsable: this.asunto.abogadoResponsable,
            partesProcesales: this.asunto.partesProcesales,
            tipoAsunto: this.asunto.tipoAsunto,
            organoJurisdiccional: this.asunto.organoJurisdiccional,
            prioridadAsunto: this.asunto.prioridadAsunto,
            descripcion: this.asunto.descripcion
        };

        // Asignar cambios al modelo
        this.asunto.expediente = expediente;
        this.asunto.gerencia = gerencia;
        this.asunto.sedeEstado = sedeEstado;
        this.asunto.abogadoResponsable = abogadoResponsable;
        this.asunto.partesProcesales = partesProcesales;
        this.asunto.tipoAsunto = tipoAsunto;
        this.asunto.organoJurisdiccional = organoJurisdiccional;
        this.asunto.prioridadAsunto = prioridadAsunto;
        this.asunto.descripcion = descripcion;

        // Reparsear partes para título
        this.partes = this.parsePartes(this.asunto.partesProcesales);

        // Historial de cambios
        if (!this.asunto.historialActividad) this.asunto.historialActividad = [];
        const etiquetas = {
            expediente: 'Expediente',
            gerencia: 'Gerencia',
            sedeEstado: 'Sede (Estado)',
            abogadoResponsable: 'Abogado Responsable',
            partesProcesales: 'Partes Procesales',
            tipoAsunto: 'Tipo de Asunto',
            organoJurisdiccional: 'Órgano Jurisdiccional',
            prioridadAsunto: 'Prioridad del Asunto',
            descripcion: 'Descripción'
        };
        const cambios = [];
        Object.keys(snapshot).forEach(k => {
            const antes = snapshot[k] ?? '—';
            const ahora = this.asunto[k] ?? '—';
            if ((antes || '') !== (ahora || '')) {
                cambios.push(`${etiquetas[k]}: "${antes}" → "${ahora}"`);
            }
        });
        if (cambios.length) {
            this.asunto.historialActividad.unshift({
                fecha: new Date().toISOString(),
                tipo: 'edicion_asunto',
                descripcion: 'Edición de datos del asunto',
                detalles: cambios.join('; '),
                usuario: 'Usuario Actual'
            });
        }

        // Persistir y refrescar
        this.guardarAsunto();
        this.actualizarTitulo();
        this.actualizarVistaDetalle();
        this.cargarActividadReciente();

        // Cerrar + Toast
        this.cerrarModalEditarAsunto();
        this.mostrarMensajeExito('Asunto actualizado correctamente');
    }

    /* === Placeholders === */
    agregarEvento() { alert('Funcionalidad de agregar evento - Por implementar'); }
    subirDocumento() { alert('Funcionalidad de subir documento - Por implementar'); }

    /* === Eventos globales (modal cambio de estado) === */
    inicializarEventos() {
        const closePanel = document.getElementById('close-panel-recordatorios');
        if (closePanel) closePanel.addEventListener('click', () => {
            document.getElementById('panel-recordatorios').classList.remove('mostrar');
        });

        const btnCambiarEstado = document.getElementById('btn-cambiar-estado');
        if (btnCambiarEstado) btnCambiarEstado.addEventListener('click', () => this.abrirModalCambioEstado());

        const btnCerrarModal = document.querySelector('#modal-cambio-estado .btn-secondary');
        if (btnCerrarModal) btnCerrarModal.addEventListener('click', () => this.cerrarModalCambioEstado());

        const btnCerrarModalIcono = document.getElementById('close-modal-estado');
        if (btnCerrarModalIcono) btnCerrarModalIcono.addEventListener('click', () => this.cerrarModalCambioEstado());

        const btnConfirmar = document.querySelector('#modal-cambio-estado .btn-primary');
        if (btnConfirmar) btnConfirmar.addEventListener('click', () => this.confirmarCambioEstado());

        const modal = document.getElementById('modal-cambio-estado');
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) this.cerrarModalCambioEstado(); });
    }

    actualizarTitulo() {
        if (!this.asunto) return;
        const actor = this.partes?.actor || 'N/D';
        document.getElementById('titulo-asunto').textContent =
            `Detalles de asunto - ${this.asunto.expediente} - ${actor}`;
        document.title = `Detalles - ${this.asunto.expediente} (${actor}) - Agenda Legal`;
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

        container.innerHTML = documentos.map(doc => `
            <div class="documento-relacionado">
                <i class="fas fa-file-${doc.tipo}"></i>
                <div class="documento-info">
                    <div class="documento-nombre">${doc.nombre}</div>
                    <div class="documento-fecha">${this.formatDate(doc.fecha)}</div>
                </div>
                <button class="btn btn-sm btn-primary"><i class="fas fa-download"></i></button>
            </div>
        `).join('');
    }

    cargarActividadReciente() {
        const container = document.getElementById('actividad-reciente-list');
        if (!container) return;

        const historial = this.asunto.historialActividad || [];
        const actividadBase = [
            { accion: 'Documento agregado', usuario: 'Lic. Martínez', fecha: '2025-01-20 14:30' },
            { accion: 'Evento programado', usuario: 'Sistema', fecha: '2025-01-18 16:45' }
        ];

        const actividadCompleta = historial.map(item => ({
            accion: item.descripcion,
            usuario: item.usuario,
            fecha: item.fecha
        })).concat(actividadBase);

        container.innerHTML = actividadCompleta.map(item => `
            <div class="actividad-item">
                <div class="actividad-icon"><i class="fas fa-circle"></i></div>
                <div class="actividad-content">
                    <div class="actividad-text">${item.accion}</div>
                    <div class="actividad-meta">
                        <span>por ${item.usuario}</span>
                        <span>•</span>
                        <span>${this.formatDate(item.fecha)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /* === Modal de cambio de estado existente === */
    abrirModalCambioEstado() {
        if (!this.asunto) return;

        document.getElementById('estado-actual').textContent = this.capitalize(this.asunto.estado || 'activo');

        const selectNuevoEstado = document.getElementById('nuevo-estado');
        const estadosDisponibles = ['activo', 'en revision', 'pausado', 'completado', 'cerrado'];

        selectNuevoEstado.innerHTML = '<option value="">Seleccione nuevo estado...</option>';
        estadosDisponibles.forEach(estado => {
            if (estado !== (this.asunto.estado || 'activo')) {
                const option = document.createElement('option');
                option.value = estado;
                option.textContent = this.capitalize(estado);
                selectNuevoEstado.appendChild(option);
            }
        });

        document.getElementById('razon-cambio').value = '';
        document.getElementById('modal-cambio-estado').style.display = 'flex';
    }

    cerrarModalCambioEstado() {
        const modal = document.getElementById('modal-cambio-estado');
        if (modal) modal.style.display = 'none';
    }

    confirmarCambioEstado() {
        const nuevoEstado = document.getElementById('nuevo-estado').value;
        const razon = document.getElementById('razon-cambio').value.trim();

        if (!nuevoEstado) return alert('Por favor selecciona un nuevo estado');
        if (!razon) return alert('Por favor proporciona una razón para el cambio');

        const estadoAnterior = this.asunto.estado || 'activo';
        this.asunto.estado = nuevoEstado;
        this.asunto.fechaActualizacion = new Date().toISOString();

        if (!this.asunto.historialActividad) this.asunto.historialActividad = [];
        this.asunto.historialActividad.unshift({
            fecha: new Date().toISOString(),
            tipo: 'cambio_estado',
            descripcion: `Estado cambiado de "${this.capitalize(estadoAnterior)}" a "${this.capitalize(nuevoEstado)}"`,
            detalles: razon,
            usuario: 'Usuario Actual'
        });

        this.guardarAsunto();
        this.actualizarVistaDetalle();
        this.cargarActividadReciente();
        this.cerrarModalCambioEstado();
        this.mostrarMensajeExito(`Estado actualizado a "${this.capitalize(nuevoEstado)}" exitosamente`);
    }

    actualizarVistaDetalle() {
        if (!this.asunto) return;
        const container = document.getElementById('vista-360-container');
        if (container) {
            container.innerHTML = this.generarVista360HTML();
            this.configurarEventosVista360();
        }
    }

    /* === UI feedback === */
    mostrarError(mensaje) {
        const container = document.getElementById('vista-360-container');
        if (container) container.innerHTML = this.generarHTMLerror(mensaje);
    }

    generarHTMLerror(mensaje = 'Error al cargar el asunto') {
        return `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>${mensaje}</h3>
                <p>No se pudo cargar la información del asunto solicitado.</p>
                <a href="asuntos.html" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Volver a Asuntos</a>
            </div>
        `;
    }

    mostrarMensajeExito(mensaje) {
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `<i class="fas fa-check-circle"></i><span>${mensaje}</span>`;

        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed; top: 20px; right: 20px; padding: 15px 20px;
                    background: #4CAF50; color: white; border-radius: 5px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10000;
                    display: flex; align-items: center; gap: 10px; animation: slideIn 0.3s ease;
                }
                .notification.success { background: #4CAF50; }
                @keyframes slideIn { from { transform: translateX(100%); opacity:0 } to { transform: translateX(0); opacity:1 } }
                @keyframes slideOut { from { transform: translateX(0); opacity:1 } to { transform: translateX(100%); opacity:0 } }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.parentNode && notification.parentNode.removeChild(notification), 300);
        }, 3000);
    }
}

// Inicializar la aplicación
let asuntoDetalle;
function initAsuntoDetalle() {
    asuntoDetalle = new AsuntoDetalleManager();
}