// Asuntos - Lógica principal
class Vista360Asuntos {
    constructor() {
        this.asuntos = [];
        this.casoActual = null;
        this.recordatorios = new RecordatoriosAutomaticos();
        this.checklists = new ChecklistsInteligentes(); // (no usado en detalle por petición, se conserva si lo ocupas en otro lado)
        this.flujos = new FlujosTrabajo();
        this.buscador = new BuscadorFullText();
        this.comparticion = new ComparticionControlada();
        
        this.init();
    }

    init() {
        this.cargarAsuntos();
        this.inicializarEventos();
        this.iniciarRecordatoriosAutomaticos();
        this.cargarGestorDocumentos();
    }

    cargarAsuntos() {
        // Datos de ejemplo - en producción vendrían de una API
        this.asuntos = [
            {
                id: 1,
                expediente: '2375/2025',
                nombre: 'Ortega Ibarra Juan Carlos',
                materia: 'Laboral',
                estado: 'Activo',
                prioridad: 'Alta',
                abogado: 'Lic. Martínez',
                demandado: 'Empresa Constructora S.A. de C.V.',
                fechaCreacion: '2025-01-10',
                descripcion: 'Despido injustificado - Reinstalación',
                stats: { documentos: 15, audiencias: 3, terminos: 2, dias: 45 },
                timeline: [
                    {
                        fecha: '2025-01-15',
                        tipo: 'audiencia',
                        titulo: 'Audiencia Inicial',
                        descripcion: 'Primer Tribunal - Se fijaron fechas para pruebas',
                        documentos: ['Acta.pdf'],
                        estado: 'completado'
                    },
                    {
                        fecha: '2025-01-25',
                        tipo: 'termino',
                        titulo: 'Término para Pruebas',
                        descripcion: 'Vencimiento para presentar pruebas documentales',
                        estado: 'pendiente',
                        alerta: '3 días restantes'
                    }
                ],
                documentos: {
                    'inicial': [
                        { nombre: 'Demanda inicial.pdf', tipo: 'pdf', fecha: '2025-01-10' },
                        { nombre: 'Poder notarial.pdf', tipo: 'pdf', fecha: '2025-01-10' }
                    ],
                    'pruebas': [
                        { nombre: 'Pruebas documentales.docx', tipo: 'word', fecha: '2025-01-20' }
                    ]
                }
            },
            {
                id: 2,
                expediente: '2012/2025',
                nombre: 'Valdez Sánchez María Elena',
                materia: 'Penal',
                estado: 'Activo',
                prioridad: 'Media',
                abogado: 'Lic. González',
                demandado: 'Comercializadora del Sureste S.A.',
                fechaCreacion: '2025-01-12',
                descripcion: 'Amparo indirecto - Suspensión definitiva',
                stats: { documentos: 8, audiencias: 1, terminos: 1, dias: 43 },
                timeline: [
                    {
                        fecha: '2025-01-18',
                        tipo: 'audiencia',
                        titulo: 'Audiencia de Vista',
                        descripcion: 'Segundo Tribunal - Presentación de argumentos',
                        documentos: ['Acta_vista.pdf'],
                        estado: 'completado'
                    }
                ],
                documentos: {
                    'inicial': [
                        { nombre: 'Escrito acusación.pdf', tipo: 'pdf', fecha: '2025-01-12' }
                    ]
                }
            }
        ];

        // Persistir en localStorage para poder leer desde la página de detalle
        localStorage.setItem('asuntos_master', JSON.stringify(this.asuntos));

        this.mostrarAsuntos();
    }

    mostrarAsuntos() {
        const grid = document.getElementById('asuntos-grid');
        let html = '';

        this.asuntos.forEach(asunto => {
            html += `
                <div class="asunto-card ${asunto.prioridad.toLowerCase()}" data-id="${asunto.id}">
                    <div class="asunto-header">
                        <h3>${asunto.expediente} - ${asunto.nombre}</h3>
                        <div>
                            <span class="badge badge-${asunto.materia.toLowerCase()}">${asunto.materia}</span>
                            <span class="badge badge-${asunto.prioridad.toLowerCase()}">${asunto.prioridad}</span>
                        </div>
                    </div>
                    <div class="asunto-body">
                        <p><strong>Demandado:</strong> ${asunto.demandado}</p>
                        <p><strong>Abogado:</strong> ${asunto.abogado}</p>
                        <p><strong>Descripción:</strong> ${asunto.descripcion}</p>
                        <div class="asunto-stats">
                            <span>${asunto.stats.documentos} docs</span>
                            <span>${asunto.stats.audiencias} aud.</span>
                            <span>${asunto.stats.terminos} términos</span>
                            <span>${asunto.stats.dias} días</span>
                        </div>
                    </div>
                    <div class="asunto-actions">
                        <button class="btn btn-primary btn-sm ver-asunto" data-id="${asunto.id}">
                            <i class="fas fa-eye"></i> Asunto detallado
                        </button>
                        <button class="btn btn-warning btn-sm editar-asunto" data-id="${asunto.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-info btn-sm compartir-asunto" data-id="${asunto.id}">
                            <i class="fas fa-share"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
        this.configurarEventosAsuntos();
    }

    configurarEventosAsuntos() {
        // Botón "Asunto detallado"
        document.querySelectorAll('.ver-asunto').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(button.getAttribute('data-id'));
                this.navegarADetalle(id);
            });
        });

        // Card clickeable
        document.querySelectorAll('.asunto-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const id = parseInt(card.getAttribute('data-id'));
                    this.navegarADetalle(id);
                }
            });
        });

        // Botón nuevo asunto
        const nuevo = document.getElementById('nuevo-asunto');
        if (nuevo) {
            nuevo.addEventListener('click', () => {
                this.crearNuevoAsunto();
            });
        }
    }

    // Nueva navegación a página de detalle
    navegarADetalle(asuntoId) {
        // Guarda el asunto actual opcionalmente
        this.casoActual = this.asuntos.find(a => a.id === asuntoId) || null;
        if (this.casoActual) localStorage.setItem('asunto_actual', JSON.stringify(this.casoActual));
        // Redirige con query param
        window.location.href = `asunto-detalle.html?id=${encodeURIComponent(asuntoId)}`;
    }

    inicializarEventos() {
        // Búsqueda global
        const buscador = document.getElementById('buscador-global');
        if (buscador) {
            buscador.addEventListener('input', (e) => {
                this.buscador.buscarEnTiempoReal(e.target.value)
                    .then(resultados => this.mostrarResultadosBusqueda(resultados));
            });
        }

        // Búsqueda por voz
        const btnVoz = document.getElementById('btn-voz');
        if (btnVoz) {
            btnVoz.addEventListener('click', () => {
                this.iniciarBusquedaVoz();
            });
        }

        // Filtros
        this.configurarFiltros();
    }

    configurarFiltros() {
        // Quitamos el filtro de ESTADO por solicitud
        const filtros = ['filter-materia-asunto', 'filter-prioridad-asunto', 'filter-abogado-asunto'];
        
        filtros.forEach(filtroId => {
            const filtro = document.getElementById(filtroId);
            if (filtro) {
                filtro.addEventListener('change', () => {
                    this.aplicarFiltros();
                });
            }
        });
    }

    aplicarFiltros() {
        const materia = document.getElementById('filter-materia-asunto')?.value || '';
        const prioridad = document.getElementById('filter-prioridad-asunto')?.value || '';
        const abogado = document.getElementById('filter-abogado-asunto')?.value || '';

        // Usa la fuente maestra del LS para no perder el listado original al filtrar
        const fuente = JSON.parse(localStorage.getItem('asuntos_master') || '[]');

        const asuntosFiltrados = fuente.filter(asunto => {
            return (!materia || asunto.materia === materia) &&
                   (!prioridad || asunto.prioridad === prioridad) &&
                   (!abogado || asunto.abogado === abogado);
        });

        this.asuntos = asuntosFiltrados;
        this.mostrarAsuntos();
    }

    iniciarRecordatoriosAutomaticos() {
        // Verificar recordatorios cada hora
        setInterval(() => {
            this.actualizarRecordatorios();
        }, 60 * 60 * 1000);

        // Verificar al cargar la página
        this.actualizarRecordatorios();

        // Solicitar permiso para notificaciones
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    actualizarRecordatorios() {
        const fuente = JSON.parse(localStorage.getItem('asuntos_master') || '[]');
        const recordatorios = this.recordatorios.calcularRecordatorios(fuente);
        this.mostrarPanelRecordatorios(recordatorios);
        
        // Notificaciones del navegador
        if ('Notification' in window && Notification.permission === 'granted') {
            recordatorios.forEach(recordatorio => {
                new Notification('Recordatorio Legal', {
                    body: recordatorio.mensaje,
                    icon: '/icon.png'
                });
            });
        }
    }

    mostrarPanelRecordatorios(recordatorios) {
        const panel = document.getElementById('panel-recordatorios');
        const lista = document.getElementById('lista-recordatorios');
        const contador = document.getElementById('contador-recordatorios');

        if (!panel || !lista || !contador) return;

        if (recordatorios.length === 0) {
            panel.classList.remove('mostrar');
            return;
        }

        contador.textContent = recordatorios.length;
        
        let html = '';
        recordatorios.forEach(recordatorio => {
            html += `
                <div class="recordatorio-item recordatorio-${recordatorio.tipo.toLowerCase()}">
                    <strong>${recordatorio.expediente}</strong><br>
                    ${recordatorio.mensaje}<br>
                    <small>Vence: ${this.formatDate(recordatorio.fecha)}</small>
                </div>
            `;
        });

        lista.innerHTML = html;
        panel.classList.add('mostrar');
    }

    cargarGestorDocumentos() {
        // Sidebar: clic manda a detalle también
        const expedientesContent = document.getElementById('sidebar-expedientes-content');
        if (!expedientesContent) return;

        let html = '';
        this.asuntos.forEach(asunto => {
            html += `
                <div class="sidebar-document-item" data-id="${asunto.id}">
                    <i class="fas fa-file-pdf"></i>
                    <span>${asunto.expediente} - ${asunto.nombre}</span>
                </div>
            `;
        });

        expedientesContent.innerHTML = html;

        document.querySelectorAll('#sidebar-expedientes-content .sidebar-document-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.getAttribute('data-id'));
                this.navegarADetalle(id);
            });
        });
    }

    iniciarBusquedaVoz() {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Tu navegador no soporta búsqueda por voz');
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.start();

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const input = document.getElementById('buscador-global');
            if (!input) return;

            input.value = transcript;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        };

        recognition.onerror = (event) => {
            console.error('Error en reconocimiento de voz:', event.error);
        };
    }

    mostrarResultadosBusqueda(resultados) {
        console.log('Resultados de búsqueda:', resultados);
    }

    formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    guardarCambios() {
        localStorage.setItem('asuntos_master', JSON.stringify(this.asuntos));
    }
}

// Inicializar la aplicación
let vista360;

function initVista360() {
    vista360 = new Vista360Asuntos();
}
