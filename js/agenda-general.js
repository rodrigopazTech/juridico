// Lógica para la página de Agenda General
class AgendaGeneralManager {
    constructor() {
        this.audienciasDesahogadas = [];
        this.terminosPresentados = [];
        this.periodoActual = 'hoy';
        this.pestañaActiva = 'audiencias-desahogadas';
        this.init();
    }

    init() {
        this.cargarDatos();
        this.inicializarEventos();
        this.configurarPestañas();
        this.configurarFiltrosTiempo();
        this.actualizarVista();
        this.actualizarEstadisticas();
    }

    cargarDatos() {
        // Cargar audiencias desahogadas (atendidas = true)
        const todasAudiencias = JSON.parse(localStorage.getItem('audiencias')) || [];
        this.audienciasDesahogadas = todasAudiencias.filter(audiencia => audiencia.atendida === true);
        
        // Si no hay datos, crear algunos de ejemplo
        if (this.audienciasDesahogadas.length === 0) {
            this.audienciasDesahogadas = [
                {
                    id: 1,
                    fechaAudiencia: '2025-11-04',
                    horaAudiencia: '10:00',
                    expediente: '2375/2025',
                    tipoAudiencia: 'Inicial',
                    partes: 'Ortega Ibarra Juan Carlos vs. Empresa Constructora S.A.',
                    abogado: 'Lic. María González Ruiz',
                    actaDocumento: 'ACTA-2375-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-04'
                },
                {
                    id: 2,
                    fechaAudiencia: '2025-11-03',
                    horaAudiencia: '14:30',
                    expediente: '1595/2025',
                    tipoAudiencia: 'Intermedia',
                    partes: 'Sosa Uc Roberto vs. Comercializadora del Sureste S.A.',
                    abogado: 'Lic. Carlos Hernández López',
                    actaDocumento: 'ACTA-1595-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-03'
                },
                {
                    id: 3,
                    fechaAudiencia: '2025-10-30',
                    horaAudiencia: '11:00',
                    expediente: '2156/2025',
                    tipoAudiencia: 'Ratificación',
                    partes: 'González Martín Luis vs. Inmobiliaria Central S.C.',
                    abogado: 'Lic. Ana Patricia Morales',
                    actaDocumento: 'ACTA-2156-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-10-30'
                }
            ];
        }

        // Cargar términos presentados (etapaRevision = 'Presentado')
        const todosTerminos = JSON.parse(localStorage.getItem('terminos')) || [];
        this.terminosPresentados = todosTerminos.filter(termino => termino.etapaRevision === 'Presentado');
        
        // Si no hay datos, crear algunos de ejemplo
        if (this.terminosPresentados.length === 0) {
            this.terminosPresentados = [
                {
                    id: 1,
                    fechaIngreso: '2025-11-02',
                    fechaVencimiento: '2025-11-15',
                    expediente: '2375/2025',
                    actuacion: 'Contestación de demanda laboral',
                    partes: 'Ortega Ibarra Juan Carlos vs. Empresa Constructora S.A.',
                    abogado: 'Lic. María González Ruiz',
                    acuseDocumento: 'ACUSE-2375-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-11-04'
                },
                {
                    id: 2,
                    fechaIngreso: '2025-11-01',
                    fechaVencimiento: '2025-11-10',
                    expediente: '1987/2025',
                    actuacion: 'Alegatos por escrito en amparo laboral',
                    partes: 'Martínez Pérez Carlos vs. Constructora del Norte S.A.',
                    abogado: 'Lic. Roberto Silva Martínez',
                    acuseDocumento: 'ACUSE-1987-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-11-03'
                },
                {
                    id: 3,
                    fechaIngreso: '2025-10-28',
                    fechaVencimiento: '2025-11-08',
                    expediente: '2413/2025',
                    actuacion: 'Promoción de rescisión laboral',
                    partes: 'García López Ana María vs. Servicios Administrativos S.C.',
                    abogado: 'Lic. Sandra Jiménez Castro',
                    acuseDocumento: 'ACUSE-2413-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-10-30'
                }
            ];
        }
    }

    configurarPestañas() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remover clase active de todos los botones y contenidos
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Agregar clase active al botón y contenido seleccionado
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
                
                this.pestañaActiva = targetTab;
                this.actualizarVista();
            });
        });
    }

    configurarFiltrosTiempo() {
        const timeFilters = document.querySelectorAll('.time-filters .btn');
        
        timeFilters.forEach(button => {
            button.addEventListener('click', () => {
                // Remover active de todos los botones
                timeFilters.forEach(btn => {
                    btn.classList.remove('btn-primary', 'active');
                    btn.classList.add('btn-secondary');
                });
                
                // Activar el botón seleccionado
                button.classList.remove('btn-secondary');
                button.classList.add('btn-primary', 'active');
                
                this.periodoActual = button.getAttribute('data-period');
                this.actualizarVista();
                this.actualizarEstadisticas();
            });
        });
    }

    filtrarPorPeriodo(datos, fechaCampo) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        return datos.filter(item => {
            const fechaItem = new Date(item[fechaCampo]);
            fechaItem.setHours(0, 0, 0, 0);
            
            switch (this.periodoActual) {
                case 'hoy':
                    return fechaItem.getTime() === hoy.getTime();
                    
                case 'semana':
                    const inicioSemana = new Date(hoy);
                    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
                    const finSemana = new Date(inicioSemana);
                    finSemana.setDate(inicioSemana.getDate() + 6);
                    return fechaItem >= inicioSemana && fechaItem <= finSemana;
                    
                case 'mes':
                    return fechaItem.getMonth() === hoy.getMonth() && 
                           fechaItem.getFullYear() === hoy.getFullYear();
                    
                default:
                    return true;
            }
        });
    }

    actualizarVista() {
        if (this.pestañaActiva === 'audiencias-desahogadas') {
            this.mostrarAudienciasDesahogadas();
        } else {
            this.mostrarTerminosPresentados();
        }
    }

    mostrarAudienciasDesahogadas() {
        const tbody = document.getElementById('audiencias-desahogadas-body');
        if (!tbody) return;

        const audienciasFiltradas = this.filtrarPorPeriodo(this.audienciasDesahogadas, 'fechaDesahogo');
        
        if (audienciasFiltradas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center" style="padding: 40px; color: #6c757d;">
                        <i class="fas fa-calendar-times fa-3x mb-3"></i>
                        <div>No hay audiencias desahogadas ${this.getPeriodoTexto()}</div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        audienciasFiltradas.forEach(audiencia => {
            html += `
                <tr>
                    <td>${this.formatDate(audiencia.fechaAudiencia)}</td>
                    <td>${audiencia.horaAudiencia}</td>
                    <td><strong>${audiencia.expediente}</strong></td>
                    <td>
                        <span class="badge badge-primary">${audiencia.tipoAudiencia}</span>
                    </td>
                    <td>${audiencia.partes}</td>
                    <td>${audiencia.abogado}</td>
                    <td>
                        ${audiencia.actaDocumento ? 
                            `<a href="#" class="btn btn-sm btn-success">
                                <i class="fas fa-download"></i> ${audiencia.actaDocumento}
                            </a>` : 
                            '<span class="text-muted">Sin acta</span>'}
                    </td>
                    <td class="actions">
                        <button class="btn btn-primary btn-sm" onclick="verDetalleAudiencia(${audiencia.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editarAudiencia(${audiencia.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    mostrarTerminosPresentados() {
        const tbody = document.getElementById('terminos-presentados-body');
        if (!tbody) return;

        const terminosFiltrados = this.filtrarPorPeriodo(this.terminosPresentados, 'fechaPresentacion');
        
        if (terminosFiltrados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center" style="padding: 40px; color: #6c757d;">
                        <i class="fas fa-clock fa-3x mb-3"></i>
                        <div>No hay términos presentados ${this.getPeriodoTexto()}</div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        terminosFiltrados.forEach(termino => {
            html += `
                <tr>
                    <td>${this.formatDate(termino.fechaPresentacion)}</td>
                    <td>${this.formatDate(termino.fechaVencimiento)}</td>
                    <td><strong>${termino.expediente}</strong></td>
                    <td>${termino.actuacion}</td>
                    <td>${termino.partes}</td>
                    <td>${termino.abogado}</td>
                    <td>
                        ${termino.acuseDocumento ? 
                            `<a href="#" class="btn btn-sm btn-success">
                                <i class="fas fa-download"></i> ${termino.acuseDocumento}
                            </a>` : 
                            '<span class="text-muted">Sin acuse</span>'}
                    </td>
                    <td class="actions">
                        <button class="btn btn-primary btn-sm" onclick="verDetalleTermino(${termino.id})" title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="editarTermino(${termino.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    }

    getPeriodoTexto() {
        switch (this.periodoActual) {
            case 'hoy': return 'hoy';
            case 'semana': return 'esta semana';
            case 'mes': return 'este mes';
            default: return '';
        }
    }

    actualizarEstadisticas() {
        const audienciasFiltradas = this.filtrarPorPeriodo(this.audienciasDesahogadas, 'fechaDesahogo');
        const terminosFiltrados = this.filtrarPorPeriodo(this.terminosPresentados, 'fechaPresentacion');
        
        document.getElementById('total-audiencias-desahogadas').textContent = audienciasFiltradas.length;
        document.getElementById('total-terminos-presentados').textContent = terminosFiltrados.length;
        document.getElementById('total-completados').textContent = audienciasFiltradas.length + terminosFiltrados.length;
    }

    formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }
}

// Funciones globales para manejar eventos desde los botones
function verDetalleAudiencia(id) {
    if (agendaGeneral) {
        const audiencia = agendaGeneral.audienciasDesahogadas.find(a => a.id === id);
        if (audiencia) {
            alert(`Detalles de audiencia ${audiencia.expediente}:\n${audiencia.partes}`);
        }
    }
}

function editarAudiencia(id) {
    if (agendaGeneral) {
        alert('Funcionalidad de edición próximamente disponible');
    }
}

function verDetalleTermino(id) {
    if (agendaGeneral) {
        const termino = agendaGeneral.terminosPresentados.find(t => t.id === id);
        if (termino) {
            alert(`Detalles del término ${termino.expediente}:\n${termino.actuacion}`);
        }
    }
}

function editarTermino(id) {
    if (agendaGeneral) {
        alert('Funcionalidad de edición próximamente disponible');
    }
}

// Inicializar la aplicación
let agendaGeneral;

function initAgendaGeneral() {
    agendaGeneral = new AgendaGeneralManager();
}