// Lógica para la página de Agenda General
class AgendaGeneralManager {
    constructor() {
        this.audienciasDesahogadas = [];
        this.terminosPresentados = [];
        this.periodoActual = 'hoy';
        this.pestañaActiva = 'audiencias-desahogadas';
        this.mesSeleccionado = '';
        this.init();
    }

    init() {
        console.log('🎯 Iniciando Agenda General Manager');
        this.cargarDatos();
        console.log('📊 Datos cargados:', {
            audiencias: this.audienciasDesahogadas.length,
            terminos: this.terminosPresentados.length
        });
        this.inicializarEventos();
        this.configurarPestañas();
        this.configurarFiltrosTiempo();
        this.configurarFiltroOtroMes();
        this.configurarModalObservaciones(); // Nuevo
        this.actualizarVista();
        this.actualizarEstadisticas();
        console.log('✅ Agenda General Manager iniciado');
    }

    cargarDatos() {
        // Cargar audiencias desahogadas
        const todasAudiencias = JSON.parse(localStorage.getItem('audiencias')) || [];
        this.audienciasDesahogadas = todasAudiencias.filter(audiencia => audiencia.atendida === true);
        
        if (this.audienciasDesahogadas.length === 0) {
            this.audienciasDesahogadas = [
                {
                    id: 1,
                    fechaAudiencia: '2025-11-27',
                    horaAudiencia: '09:30',
                    expediente: 'EXP-2023-0456',
                    tipoAudiencia: 'Conciliación',
                    partes: 'Martínez vs. Rodríguez',
                    abogado: 'Dra. Laura Méndez',
                    actaDocumento: 'ACTA-0456-2023.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-27',
                    observaciones: 'Se llegó a un acuerdo conciliatorio. Las partes firmaron convenio de pago en parcialidades.'
                },
                {
                    id: 2,
                    fechaAudiencia: '2025-11-27',
                    horaAudiencia: '11:00',
                    expediente: 'EXP-2023-0789',
                    tipoAudiencia: 'Vista',
                    partes: 'Pérez e Hijos S.A. vs. Estado',
                    abogado: 'Lic. Carlos Ruiz',
                    actaDocumento: 'ACTA-0789-2023.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-27',
                    observaciones: 'Se admitieron las pruebas documentales. Se fijó fecha para audiencia de debate.'
                },
                {
                    id: 3,
                    fechaAudiencia: '2025-11-27',
                    horaAudiencia: '15:15',
                    expediente: 'EXP-2023-1123',
                    tipoAudiencia: 'Juicio',
                    partes: 'González vs. Instituto Federal',
                    abogado: 'Lic. Ana Vargas',
                    actaDocumento: 'ACTA-1123-2023.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-27',
                    observaciones: 'Juicio oral desahogado. Se dictó sentencia favorable a nuestro cliente.'
                },
                {
                    id: 4,
                    fechaAudiencia: '2025-11-26',
                    horaAudiencia: '10:00',
                    expediente: '3485/2025',
                    tipoAudiencia: 'Inicial',
                    partes: 'Herrera Campos María Elena vs. Transportes del Golfo S.A.',
                    abogado: 'Lic. María González Ruiz',
                    actaDocumento: 'ACTA-3485-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-26',
                    observaciones: 'Se fijó fecha para la audiencia de conciliación. La contraparte solicitó prórroga para presentar pruebas documentales.'
                },
                {
                    id: 5,
                    fechaAudiencia: '2025-11-25',
                    horaAudiencia: '14:30',
                    expediente: '3521/2025',
                    tipoAudiencia: 'Conciliación',
                    partes: 'Pech Martínez Carlos vs. Constructora Peninsular S.C.',
                    abogado: 'Lic. Carlos Hernández López',
                    actaDocumento: 'ACTA-3521-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-25',
                    observaciones: 'No hubo acuerdo conciliatorio. Se turna el expediente a la fase de juicio. El cliente debe presentar testigos.'
                }
            ];
            // Rellenar observaciones genéricas para los demás datos si es necesario
            this.audienciasDesahogadas.forEach(a => {
                if(!a.observaciones) a.observaciones = "Sin observaciones registradas durante la audiencia.";
            });
        }

        // Cargar términos presentados
        const todosTerminos = JSON.parse(localStorage.getItem('terminos')) || [];
        this.terminosPresentados = todosTerminos.filter(termino => termino.etapaRevision === 'Presentado');
        
        if (this.terminosPresentados.length === 0) {
            this.terminosPresentados = [
                {
                    id: 1,
                    fechaIngreso: '2025-11-10',
                    fechaVencimiento: '2025-11-25',
                    expediente: 'EXP-2023-0456',
                    actuacion: 'Presentación de pruebas',
                    partes: 'Martínez vs. Rodríguez',
                    abogado: 'Dra. Laura Méndez',
                    acuseDocumento: 'ACUSE-0456-2023.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-11-27',
                    observaciones: 'Se presentó en tiempo y forma ante la oficialía de partes. Sello legible con hora 10:30 AM.'
                },
                {
                    id: 2,
                    fechaIngreso: '2025-11-05',
                    fechaVencimiento: '2025-11-20',
                    expediente: 'EXP-2023-0789',
                    actuacion: 'Alegatos',
                    partes: 'Pérez e Hijos S.A. vs. Estado',
                    abogado: 'Lic. Carlos Ruiz',
                    acuseDocumento: 'ACUSE-0789-2023.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-11-27',
                    observaciones: 'Alegatos presentados con fundamento en jurisprudencia reciente. Acuse con sello digital.'
                },
                {
                    id: 3,
                    fechaIngreso: '2025-11-01',
                    fechaVencimiento: '2025-11-16',
                    expediente: 'EXP-2023-1123',
                    actuacion: 'Recurso de apelación',
                    partes: 'González vs. Instituto Federal',
                    abogado: 'Lic. Ana Vargas',
                    acuseDocumento: 'ACUSE-1123-2023.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-11-27',
                    observaciones: 'Recurso interpuesto en términos del artículo 107. Se adjuntaron 15 fojas de anexos.'
                },
                {
                    id: 4,
                    fechaIngreso: '2025-11-20',
                    fechaVencimiento: '2025-12-05',
                    expediente: '3485/2025',
                    actuacion: 'Contestación de demanda laboral',
                    partes: 'Herrera Campos María Elena vs. Transportes del Golfo S.A.',
                    abogado: 'Lic. María González Ruiz',
                    acuseDocumento: 'ACUSE-3485-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-11-26',
                    observaciones: 'Se presentó en oficialía de partes común a las 13:45 hrs. Sello legible.'
                }
            ];
            this.terminosPresentados.forEach(t => {
                if(!t.observaciones) t.observaciones = "Trámite realizado conforme a derecho sin incidencias.";
            });
        }
    }

    // ... (Mantener configurarPestañas, configurarFiltrosTiempo, configurarFiltroOtroMes, filtrarPorPeriodo sin cambios) ...

    configurarPestañas() {
        const tabButtons = document.querySelectorAll('.tab-button');
        if (!tabButtons || tabButtons.length === 0) return;

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Determinar módulo a partir del onclick o del texto
                const onClick = button.getAttribute('onclick') || '';
                const isAudiencias = onClick.includes("showModule('audiencias')") ||
                    (button.textContent || '').toLowerCase().includes('audiencias');

                const module = isAudiencias ? 'audiencias' : 'terminos';
                // Delegar al manejador central que ya controla estilos y vista
                showModule(module);
            });
        });
    }

    configurarFiltrosTiempo() {
        const timeFilters = document.querySelectorAll('.time-filter-btn[data-period]');
        timeFilters.forEach(button => {
            button.addEventListener('click', () => {
                // Solo afectar botones del mismo módulo
                const module = button.getAttribute('data-module');
                const moduleButtons = document.querySelectorAll(`.time-filter-btn[data-module="${module}"]`);
                
                moduleButtons.forEach(btn => {
                    btn.classList.remove('bg-gob-guinda', 'text-white', 'border-gob-guinda');
                    btn.classList.add('bg-white', 'text-gob-gris', 'border-gray-300');
                });
                
                this.mesSeleccionado = '';

                button.classList.remove('bg-white', 'text-gob-gris', 'border-gray-300');
                button.classList.add('bg-gob-guinda', 'text-white', 'border-gob-guinda');

                this.periodoActual = button.getAttribute('data-period');
                this.actualizarVista();
                this.actualizarEstadisticas();
            });
        });
    }

    configurarFiltroOtroMes() {
        // Configurar dropdown de meses para Audiencias
        const btnOtroMesAudiencias = document.getElementById('btn-otro-mes-audiencias');
        const dropdownMesesAudiencias = document.getElementById('dropdown-meses-audiencias');
        
        if (btnOtroMesAudiencias && dropdownMesesAudiencias) {
            btnOtroMesAudiencias.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMesesAudiencias.classList.toggle('show');
            });
        }
        
        // Configurar dropdown de meses para Términos
        const btnOtroMesTerminos = document.getElementById('btn-otro-mes-terminos');
        const dropdownMesesTerminos = document.getElementById('dropdown-meses-terminos');
        
        if (btnOtroMesTerminos && dropdownMesesTerminos) {
            btnOtroMesTerminos.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMesesTerminos.classList.toggle('show');
            });
        }
        
        // Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', () => {
            if (dropdownMesesAudiencias) dropdownMesesAudiencias.classList.remove('show');
            if (dropdownMesesTerminos) dropdownMesesTerminos.classList.remove('show');
        });
        
        // Prevenir que los dropdowns se cierren al hacer clic dentro
        if (dropdownMesesAudiencias) {
            dropdownMesesAudiencias.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        if (dropdownMesesTerminos) {
            dropdownMesesTerminos.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    filtrarPorPeriodo(datos, fechaCampo) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return datos.filter(item => {
            const fechaItem = new Date(item[fechaCampo]);
            fechaItem.setHours(0, 0, 0, 0);
            if (this.mesSeleccionado && this.mesSeleccionado !== '') {
                const mesItem = (fechaItem.getMonth() + 1).toString().padStart(2, '0');
                if (mesItem !== this.mesSeleccionado) return false;
            }
            switch (this.periodoActual) {
                case 'hoy': return fechaItem.getTime() === hoy.getTime();
                case 'semana':
                    const inicioSemana = new Date(hoy);
                    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
                    const finSemana = new Date(inicioSemana);
                    finSemana.setDate(inicioSemana.getDate() + 6);
                    return fechaItem >= inicioSemana && fechaItem <= finSemana;
                case 'mes': return fechaItem.getMonth() === hoy.getMonth() && fechaItem.getFullYear() === hoy.getFullYear();
                case 'otro-mes': return true;
                default: return true;
            }
        });
    }

    // Configuración del Modal de Observaciones
    configurarModalObservaciones() {
        const modal = document.getElementById('modal-observaciones');
        const closeBtn = document.getElementById('close-modal-observaciones');
        const closeBtnFooter = document.getElementById('btn-cerrar-obs');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.style.display = 'none');
        }
        if (closeBtnFooter) {
            closeBtnFooter.addEventListener('click', () => modal.style.display = 'none');
        }
        
        // Cerrar al hacer clic fuera
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
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
        console.log('📋 Mostrando audiencias - tbody encontrado:', !!tbody);
        if (!tbody) {
            console.error('❌ No se encontró el elemento audiencias-desahogadas-body');
            return;
        }

        const audienciasFiltradas = this.filtrarPorPeriodo(this.audienciasDesahogadas, 'fechaDesahogo');
        console.log('🔍 Audiencias filtradas:', audienciasFiltradas.length, 'de', this.audienciasDesahogadas.length);
        
        if (audienciasFiltradas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center" style="padding: 40px; color: #6c757d;">
                        <i class="fas fa-calendar-times fa-3x mb-3"></i>
                        <div>No hay audiencias desahogadas ${this.getPeriodoTexto()}</div>
                    </td>
                </tr>`;
            return;
        }

        let html = '';
        audienciasFiltradas.forEach(audiencia => {
            html += `
                <tr class="bg-white hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">${this.formatDate(audiencia.fechaAudiencia)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${audiencia.horaAudiencia}</td>
                    <td class="px-6 py-4 whitespace-nowrap expediente">${audiencia.expediente}</td>
                    <td class="px-6 py-4 whitespace-nowrap"><span class="tipo-audiencia tipo-${audiencia.tipoAudiencia.toLowerCase().replace(/ /g, '-')}">${audiencia.tipoAudiencia}</span></td>
                    <td class="px-6 py-4">${audiencia.partes}</td>
                    <td class="px-6 py-4">${audiencia.abogado}</td>
                    <td class="px-6 py-4 text-center">
                        <div class="flex justify-center gap-2">
                            <button class="text-gray-400 hover:text-gob-guinda transition-colors p-1" title="Descargar acta" onclick="descargarDocumento('${audiencia.actaDocumento}')">
                                <i class="fas fa-file-download"></i>
                            </button>
                            <button class="text-gray-400 hover:text-gob-guinda transition-colors p-1" title="Ver observaciones" onclick="verObservaciones(${audiencia.id}, 'audiencia')">
                                <i class="fas fa-sticky-note"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
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
                    <td colspan="7" class="text-center" style="padding: 40px; color: #6c757d;">
                        <i class="fas fa-clock fa-3x mb-3"></i>
                        <div>No hay términos presentados ${this.getPeriodoTexto()}</div>
                    </td>
                </tr>`;
            return;
        }

        let html = '';
        terminosFiltrados.forEach(termino => {
            html += `
                <tr class="bg-white hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">${this.formatDate(termino.fechaPresentacion)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${this.formatDate(termino.fechaVencimiento)}</td>
                    <td class="px-6 py-4 whitespace-nowrap expediente">${termino.expediente}</td>
                    <td class="px-6 py-4">${termino.actuacion}</td>
                    <td class="px-6 py-4">${termino.partes}</td>
                    <td class="px-6 py-4 text-center">
                        <div class="flex justify-center gap-2">
                            <button class="text-gray-400 hover:text-gob-guinda transition-colors p-1" title="Descargar acuse" onclick="descargarDocumento('${termino.acuseDocumento}')">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="text-gray-400 hover:text-gob-guinda transition-colors p-1" title="Ver observaciones" onclick="verObservaciones(${termino.id}, 'termino')">
                                <i class="fas fa-sticky-note"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
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
        // Placeholder para futuras estadísticas
        // Las estadísticas se pueden agregar después si se necesita un dashboard
    }

    formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    inicializarEventos() {
        // Búsqueda en Audiencias
        const searchAudiencias = document.getElementById('search-audiencias');
        if (searchAudiencias) {
            searchAudiencias.addEventListener('input', (ev) => {
                const q = ev.target.value.trim().toLowerCase();
                const tbody = document.getElementById('audiencias-desahogadas-body');
                if (!tbody) return;
                
                const rows = tbody.querySelectorAll('tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(q) ? '' : 'none';
                });
            });
        }
        
        // Búsqueda en Términos
        const searchTerminos = document.getElementById('search-terminos');
        if (searchTerminos) {
            searchTerminos.addEventListener('input', (ev) => {
                const q = ev.target.value.trim().toLowerCase();
                const tbody = document.getElementById('terminos-presentados-body');
                if (!tbody) return;
                
                const rows = tbody.querySelectorAll('tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(q) ? '' : 'none';
                });
            });
        }
    }

}

// --- Funciones Globales para Botones ---

function descargarDocumento(nombreArchivo) {
    if (!nombreArchivo || nombreArchivo === 'undefined') {
        alert("No hay documento adjunto disponible.");
        return;
    }
    // Simulación de descarga
    console.log(`Descargando ${nombreArchivo}...`);
    
    // Crear elemento temporal para simular click
    const link = document.createElement('a');
    link.href = '#'; // Aquí iría la URL real
    link.setAttribute('download', nombreArchivo);
    
    // Feedback visual simple
    const originalCursor = document.body.style.cursor;
    document.body.style.cursor = 'wait';
    
    setTimeout(() => {
        document.body.style.cursor = originalCursor;
        alert(`Descarga iniciada: ${nombreArchivo}`);
    }, 800);
}

function verObservaciones(id, tipo) {
    if (!agendaGeneral) return;
    
    let item;
    let tituloContexto = "";
    
    if (tipo === 'audiencia') {
        item = agendaGeneral.audienciasDesahogadas.find(a => a.id === id);
        tituloContexto = "Audiencia Desahogada";
    } else {
        item = agendaGeneral.terminosPresentados.find(t => t.id === id);
        tituloContexto = "Término Presentado";
    }

    if (item) {
        const modal = document.getElementById('modal-observaciones');
        const title = document.getElementById('obs-modal-title');
        const content = document.getElementById('obs-modal-content');
        const expediente = document.getElementById('obs-modal-expediente');

        if (modal && title && content) {
            title.textContent = `Observaciones - ${tituloContexto}`;
            expediente.innerHTML = `<strong>Expediente:</strong> ${item.expediente} <br> <small>${item.partes}</small>`;
            
            // Simulación de contenido bonito para la observación
            content.innerHTML = `
                <div class="obs-box">
                    <i class="fas fa-info-circle text-primary mb-2"></i>
                    <p>${item.observaciones || "Sin observaciones registradas."}</p>
                    <div class="obs-meta mt-3">
                        <small class="text-muted">Registrado por: ${item.abogado}</small><br>
                        <small class="text-muted">Fecha: ${tipo === 'audiencia' ? item.fechaDesahogo : item.fechaPresentacion}</small>
                    </div>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    }
}

// Inicializar
let agendaGeneral;

export function initAgendaGeneral() {
    console.log('🚀 Iniciando initAgendaGeneral()');
    agendaGeneral = new AgendaGeneralManager();
    
    // Configurar funciones globales para onclick
    window.showModule = showModule;
    window.seleccionarMesAudiencias = seleccionarMesAudiencias;
    window.seleccionarMesTerminos = seleccionarMesTerminos;
    window.descargarDocumento = descargarDocumento;
    window.verObservaciones = verObservaciones;
    console.log('✅ initAgendaGeneral() completado');
}

// Función para cambiar entre módulos
function showModule(module) {
    // Ocultar todos los módulos
    document.querySelectorAll('.module-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Mostrar el módulo seleccionado
    document.getElementById(`module-${module}`).classList.add('active');
    
    // Actualizar pestañas
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    // Marcar tab activa con estilos de color
    const tabButtons = document.querySelectorAll('.tab-button');
    if (module === 'audiencias') {
        tabButtons[0]?.classList.add('active');
    } else {
        tabButtons[1]?.classList.add('active');
    }
    // Actualizar la pestaña activa en el manager
    agendaGeneral.pestañaActiva = module === 'audiencias' ? 'audiencias-desahogadas' : 'terminos-presentados';
    agendaGeneral.actualizarVista();
}

// Funciones para seleccionar mes
function seleccionarMesAudiencias(mes) {
    if (agendaGeneral) {
        agendaGeneral.mesSeleccionado = mes;
        agendaGeneral.periodoActual = 'otro-mes';
        agendaGeneral.actualizarVista();
        agendaGeneral.actualizarEstadisticas();
    }
    document.getElementById('dropdown-meses-audiencias').classList.remove('show');
}

function seleccionarMesTerminos(mes) {
    if (agendaGeneral) {
        agendaGeneral.mesSeleccionado = mes;
        agendaGeneral.periodoActual = 'otro-mes';
        agendaGeneral.actualizarVista();
        agendaGeneral.actualizarEstadisticas();
    }
    document.getElementById('dropdown-meses-terminos').classList.remove('show');
}