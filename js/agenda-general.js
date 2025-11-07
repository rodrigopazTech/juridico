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
        this.cargarDatos();
        this.inicializarEventos();
        this.configurarPestañas();
        this.configurarFiltrosTiempo();
        this.configurarFiltroOtroMes();
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
                // Noviembre 2025 - Datos actuales
                {
                    id: 1,
                    fechaAudiencia: '2025-11-05',
                    horaAudiencia: '10:00',
                    expediente: '3485/2025',
                    tipoAudiencia: 'Inicial',
                    partes: 'Herrera Campos María Elena vs. Transportes del Golfo S.A.',
                    abogado: 'Lic. María González Ruiz',
                    actaDocumento: 'ACTA-3485-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-05'
                },
                {
                    id: 2,
                    fechaAudiencia: '2025-11-05',
                    horaAudiencia: '14:30',
                    expediente: '3521/2025',
                    tipoAudiencia: 'Conciliación',
                    partes: 'Pech Martínez Carlos vs. Constructora Peninsular S.C.',
                    abogado: 'Lic. Carlos Hernández López',
                    actaDocumento: 'ACTA-3521-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-05'
                },
                {
                    id: 3,
                    fechaAudiencia: '2025-11-04',
                    horaAudiencia: '09:30',
                    expediente: '2890/2025',
                    tipoAudiencia: 'Intermedia',
                    partes: 'Ramírez Torres Patricia vs. Textiles del Golfo S.A.',
                    abogado: 'Lic. Fernando Gutiérrez Vega',
                    actaDocumento: 'ACTA-2890-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-04'
                },
                {
                    id: 4,
                    fechaAudiencia: '2025-11-04',
                    horaAudiencia: '16:00',
                    expediente: '3241/2025',
                    tipoAudiencia: 'Desahogo de Pruebas',
                    partes: 'López Méndez Ricardo vs. Transportes Peninsulares S.C.',
                    abogado: 'Lic. Claudia Esperanza Ruiz',
                    actaDocumento: 'ACTA-3241-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-04'
                },
                {
                    id: 5,
                    fechaAudiencia: '2025-11-03',
                    horaAudiencia: '11:45',
                    expediente: '3697/2025',
                    tipoAudiencia: 'Alegatos',
                    partes: 'Tec Pool Francisco Javier vs. Servicios Turísticos del Caribe S.A.',
                    abogado: 'Lic. Ana Patricia Morales',
                    actaDocumento: 'ACTA-3697-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-11-03'
                },
                // Octubre 2025
                {
                    id: 5,
                    fechaAudiencia: '2025-10-30',
                    horaAudiencia: '11:00',
                    expediente: '2156/2025',
                    tipoAudiencia: 'Ratificación',
                    partes: 'González Martín Luis vs. Inmobiliaria Central S.C.',
                    abogado: 'Lic. Ana Patricia Morales',
                    actaDocumento: 'ACTA-2156-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-10-30'
                },
                {
                    id: 6,
                    fechaAudiencia: '2025-10-28',
                    horaAudiencia: '15:30',
                    expediente: '1987/2025',
                    tipoAudiencia: 'Alegatos',
                    partes: 'Herrera Campos José vs. Manufacturas Industriales S.A.',
                    abogado: 'Lic. Roberto Silva Martínez',
                    actaDocumento: 'ACTA-1987-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-10-28'
                },
                {
                    id: 7,
                    fechaAudiencia: '2025-10-25',
                    horaAudiencia: '12:00',
                    expediente: '2674/2025',
                    tipoAudiencia: 'Testimonial',
                    partes: 'Pérez Canul Carmen vs. Hoteles del Caribe S.A.',
                    abogado: 'Lic. Diego Alejandro Castillo',
                    actaDocumento: 'ACTA-2674-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-10-25'
                },
                // Septiembre 2025
                {
                    id: 8,
                    fechaAudiencia: '2025-09-30',
                    horaAudiencia: '10:30',
                    expediente: '2013/2025',
                    tipoAudiencia: 'Inicial',
                    partes: 'Tun May Alberto vs. Servicios Logísticos del Sureste S.C.',
                    abogado: 'Lic. Mónica Isabel Vázquez',
                    actaDocumento: 'ACTA-2013-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-09-30'
                },
                {
                    id: 9,
                    fechaAudiencia: '2025-09-27',
                    horaAudiencia: '14:00',
                    expediente: '1789/2025',
                    tipoAudiencia: 'Conciliación',
                    partes: 'Cauich Pool María vs. Grupo Comercial Peninsular S.A.',
                    abogado: 'Lic. Alejandro Domínguez Cruz',
                    actaDocumento: 'ACTA-1789-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-09-27'
                },
                // Agosto 2025
                {
                    id: 10,
                    fechaAudiencia: '2025-08-29',
                    horaAudiencia: '11:30',
                    expediente: '1456/2025',
                    tipoAudiencia: 'Intermedia',
                    partes: 'Mukul Chan Jorge vs. Constructora Peninsular S.A.',
                    abogado: 'Lic. Sandra Jiménez Castro',
                    actaDocumento: 'ACTA-1456-2025.pdf',
                    atendida: true,
                    fechaDesahogo: '2025-08-29'
                }
                ,
                // Ejemplos adicionales
                {
                    id: 11,
                    fechaAudiencia: '2025-11-06',
                    horaAudiencia: '09:00',
                    expediente: '4012/2025',
                    tipoAudiencia: 'Conciliación',
                    partes: 'García Pérez Laura vs. Servicios Integrales del Norte S.A.',
                    abogado: 'Lic. José Arturo Méndez',
                    atendida: true,
                    fechaDesahogo: '2025-11-06'
                },
                {
                    id: 12,
                    fechaAudiencia: '2025-11-07',
                    horaAudiencia: '13:30',
                    expediente: '4020/2025',
                    tipoAudiencia: 'Inicial',
                    partes: 'Ramírez López Ana vs. Comercial del Sur S.A.',
                    abogado: 'Lic. Patricia Ortega',
                    atendida: true,
                    fechaDesahogo: '2025-11-07'
                },
                {
                    id: 13,
                    fechaAudiencia: '2025-11-08',
                    horaAudiencia: '15:00',
                    expediente: '4033/2025',
                    tipoAudiencia: 'Testimonial',
                    partes: 'Sánchez Ruiz Pedro vs. Logística Caribe S.C.',
                    abogado: 'Lic. Mariana Castillo',
                    atendida: true,
                    fechaDesahogo: '2025-11-08'
                },
                {
                    id: 14,
                    fechaAudiencia: '2025-11-09',
                    horaAudiencia: '10:45',
                    expediente: '4047/2025',
                    tipoAudiencia: 'Desahogo de Pruebas',
                    partes: 'López Mendoza Carla vs. Servicios Financieros del Golfo S.A.',
                    abogado: 'Lic. Enrique Martínez',
                    atendida: true,
                    fechaDesahogo: '2025-11-09'
                },
                {
                    id: 15,
                    fechaAudiencia: '2025-11-10',
                    horaAudiencia: '08:30',
                    expediente: '4055/2025',
                    tipoAudiencia: 'Alegatos',
                    partes: 'Vega Cruz Susana vs. Industrias del Sureste S.A.',
                    abogado: 'Lic. Raúl Hernández',
                    atendida: true,
                    fechaDesahogo: '2025-11-10'
                }
                ,
                // Cinco ejemplos nuevos añadidos bajo pedido
                {
                    id: 16,
                    fechaAudiencia: '2025-11-11',
                    horaAudiencia: '09:15',
                    expediente: '4101/2025',
                    tipoAudiencia: 'Conciliación',
                    partes: 'Martínez Gómez Laura vs. Servicios Portuarios S.A.',
                    abogado: 'Lic. Sofía Ramírez',
                    atendida: true,
                    fechaDesahogo: '2025-11-11'
                },
                {
                    id: 17,
                    fechaAudiencia: '2025-11-12',
                    horaAudiencia: '11:00',
                    expediente: '4112/2025',
                    tipoAudiencia: 'Inicial',
                    partes: 'Pérez Díaz Carlos vs. Telecomunicaciones del Norte S.C.',
                    abogado: 'Lic. Andrés Molina',
                    atendida: true,
                    fechaDesahogo: '2025-11-12'
                },
                {
                    id: 18,
                    fechaAudiencia: '2025-11-13',
                    horaAudiencia: '14:30',
                    expediente: '4120/2025',
                    tipoAudiencia: 'Testimonial',
                    partes: 'Ruiz Ortega Ana vs. Constructora del Sur S.A.',
                    abogado: 'Lic. Jorge Castillo',
                    atendida: true,
                    fechaDesahogo: '2025-11-13'
                },
                {
                    id: 19,
                    fechaAudiencia: '2025-11-14',
                    horaAudiencia: '16:00',
                    expediente: '4135/2025',
                    tipoAudiencia: 'Desahogo de Pruebas',
                    partes: 'Hernández Cruz María vs. Servicios Financieros del Golfo S.A.',
                    abogado: 'Lic. Daniela Torres',
                    atendida: true,
                    fechaDesahogo: '2025-11-14'
                },
                {
                    id: 20,
                    fechaAudiencia: '2025-11-15',
                    horaAudiencia: '08:00',
                    expediente: '4140/2025',
                    tipoAudiencia: 'Alegatos',
                    partes: 'Gómez López Roberto vs. Industrias Peninsulares S.A.',
                    abogado: 'Lic. Carla Medina',
                    atendida: true,
                    fechaDesahogo: '2025-11-15'
                }
            ];
            // Persistir ejemplos en localStorage para facilitar pruebas
            try {
                localStorage.setItem('audiencias', JSON.stringify(this.audienciasDesahogadas));
            } catch (e) {
                // ignorar errores de almacenamiento
            }
        }

        // Cargar términos presentados (etapaRevision = 'Presentado')
        const todosTerminos = JSON.parse(localStorage.getItem('terminos')) || [];
        this.terminosPresentados = todosTerminos.filter(termino => termino.etapaRevision === 'Presentado');
        
        // Si no hay datos, crear algunos de ejemplo
        if (this.terminosPresentados.length === 0) {
            this.terminosPresentados = [
                // Noviembre 2025 - Datos actuales
                {
                    id: 1,
                    fechaIngreso: '2025-11-03',
                    fechaVencimiento: '2025-11-18',
                    expediente: '3485/2025',
                    actuacion: 'Contestación de demanda laboral por despido injustificado',
                    partes: 'Herrera Campos María Elena vs. Transportes del Golfo S.A.',
                    abogado: 'Lic. María González Ruiz',
                    acuseDocumento: 'ACUSE-3485-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-11-05'
                },
                {
                    id: 2,
                    fechaIngreso: '2025-11-02',
                    fechaVencimiento: '2025-11-15',
                    expediente: '3521/2025',
                    actuacion: 'Alegatos finales en amparo directo',
                    partes: 'Pech Martínez Carlos vs. Constructora Peninsular S.C.',
                    abogado: 'Lic. Carlos Hernández López',
                    acuseDocumento: 'ACUSE-3521-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-11-05'
                },
                {
                    id: 3,
                    fechaIngreso: '2025-11-01',
                    fechaVencimiento: '2025-11-12',
                    expediente: '3697/2025',
                    actuacion: 'Solicitud de medidas cautelares en materia mercantil',
                    partes: 'Tec Pool Francisco Javier vs. Servicios Turísticos del Caribe S.A.',
                    abogado: 'Lic. Fernando Gutiérrez Vega',
                    acuseDocumento: 'ACUSE-3697-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-11-04'
                },
                {
                    id: 4,
                    fechaIngreso: '2025-10-31',
                    fechaVencimiento: '2025-11-14',
                    expediente: '3241/2025',
                    actuacion: 'Escrito de ofrecimiento y preparación de pruebas',
                    partes: 'López Méndez Ricardo vs. Transportes Peninsulares S.C.',
                    abogado: 'Lic. Claudia Esperanza Ruiz',
                    acuseDocumento: 'ACUSE-3241-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-11-04'
                },
                {
                    id: 5,
                    fechaIngreso: '2025-10-30',
                    fechaVencimiento: '2025-11-13',
                    expediente: '2890/2025',
                    actuacion: 'Promoción de incidente de nulidad de actuaciones',
                    partes: 'Ramírez Torres Patricia vs. Textiles del Golfo S.A.',
                    abogado: 'Lic. Ana Patricia Morales',
                    acuseDocumento: 'ACUSE-2890-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-11-03'
                },
                // Octubre 2025
                {
                    id: 5,
                    fechaIngreso: '2025-10-28',
                    fechaVencimiento: '2025-11-08',
                    expediente: '2413/2025',
                    actuacion: 'Promoción de rescisión laboral',
                    partes: 'García López Ana María vs. Servicios Administrativos S.C.',
                    abogado: 'Lic. Sandra Jiménez Castro',
                    acuseDocumento: 'ACUSE-2413-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-10-30'
                },
                {
                    id: 6,
                    fechaIngreso: '2025-10-25',
                    fechaVencimiento: '2025-11-05',
                    expediente: '2674/2025',
                    actuacion: 'Demanda de amparo indirecto',
                    partes: 'Pech Martín Roberto vs. Autotransportes Yucatecos S.A.',
                    abogado: 'Lic. Diego Alejandro Castillo',
                    acuseDocumento: 'ACUSE-2674-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-10-28'
                },
                {
                    id: 7,
                    fechaIngreso: '2025-10-22',
                    fechaVencimiento: '2025-11-02',
                    expediente: '2156/2025',
                    actuacion: 'Contestación a vista de traslado',
                    partes: 'Uc Kauil Marina vs. Inmobiliaria del Centro S.C.',
                    abogado: 'Lic. Ana Patricia Morales',
                    acuseDocumento: 'ACUSE-2156-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-10-25'
                },
                // Septiembre 2025
                {
                    id: 8,
                    fechaIngreso: '2025-09-28',
                    fechaVencimiento: '2025-10-10',
                    expediente: '2013/2025',
                    actuacion: 'Promoción de nulidad de actuaciones',
                    partes: 'Caamal Tun Eduardo vs. Constructora Peninsular S.A.',
                    abogado: 'Lic. Mónica Isabel Vázquez',
                    acuseDocumento: 'ACUSE-2013-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-09-30'
                },
                {
                    id: 9,
                    fechaIngreso: '2025-09-25',
                    fechaVencimiento: '2025-10-08',
                    expediente: '1789/2025',
                    actuacion: 'Incidente de acumulación de autos',
                    partes: 'May Poot Cristina vs. Hoteles y Restaurantes del Golfo S.A.',
                    abogado: 'Lic. Alejandro Domínguez Cruz',
                    acuseDocumento: 'ACUSE-1789-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-09-27'
                },
                // Agosto 2025
                {
                    id: 10,
                    fechaIngreso: '2025-08-26',
                    fechaVencimiento: '2025-09-08',
                    expediente: '1456/2025',
                    actuacion: 'Escrito de desistimiento parcial',
                    partes: 'Pool Canché Jorge vs. Servicios Especializados del Sureste S.C.',
                    abogado: 'Lic. Sandra Jiménez Castro',
                    acuseDocumento: 'ACUSE-1456-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-08-29'
                },
                // Julio 2025
                {
                    id: 11,
                    fechaIngreso: '2025-07-30',
                    fechaVencimiento: '2025-08-12',
                    expediente: '1123/2025',
                    actuacion: 'Recurso de revisión laboral',
                    partes: 'Dzul Herrera Carmen vs. Grupo Industrial Yucateco S.A.',
                    abogado: 'Lic. Fernando Gutiérrez Vega',
                    acuseDocumento: 'ACUSE-1123-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-07-31'
                },
                {
                    id: 12,
                    fechaIngreso: '2025-07-25',
                    fechaVencimiento: '2025-08-06',
                    expediente: '987/2025',
                    actuacion: 'Promoción de excepciones y defensas',
                    partes: 'Balam Cocom Luis vs. Transportes Metropolitanos S.C.',
                    abogado: 'Lic. Claudia Esperanza Ruiz',
                    acuseDocumento: 'ACUSE-987-2025.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: '2025-07-27'
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
        const timeFilters = document.querySelectorAll('.time-filters .btn[data-period]');

        timeFilters.forEach(button => {
            button.addEventListener('click', () => {
                // Remover active de todos los botones de tiempo
                timeFilters.forEach(btn => {
                    btn.classList.remove('btn-primary', 'active');
                    btn.classList.add('btn-secondary');
                });

                // Desactivar filtro de mes
                this.mesSeleccionado = '';
                document.getElementById('select-mes').style.display = 'none';
                document.getElementById('btn-otro-mes').classList.remove('btn-primary', 'active');
                document.getElementById('btn-otro-mes').classList.add('btn-secondary');

                // Activar el botón seleccionado
                button.classList.remove('btn-secondary');
                button.classList.add('btn-primary', 'active');

                this.periodoActual = button.getAttribute('data-period');
                this.actualizarVista();
                this.actualizarEstadisticas();
            });
        });
    }



    configurarFiltroOtroMes() {
        const btnOtroMes = document.getElementById('btn-otro-mes');
        const selectMes = document.getElementById('select-mes');

        btnOtroMes.addEventListener('click', () => {
            // Remover active de todos los botones de tiempo
            const timeFilters = document.querySelectorAll('.time-filters .btn[data-period]');
            timeFilters.forEach(btn => {
                btn.classList.remove('btn-primary', 'active');
                btn.classList.add('btn-secondary');
            });

            // Activar el botón Otro Mes
            btnOtroMes.classList.remove('btn-secondary');
            btnOtroMes.classList.add('btn-primary', 'active');

            // Mostrar el select
            selectMes.style.display = 'inline-block';

            this.periodoActual = 'otro-mes';
            this.actualizarVista();
            this.actualizarEstadisticas();
        });

        selectMes.addEventListener('change', () => {
            this.mesSeleccionado = selectMes.value;
            this.actualizarVista();
            this.actualizarEstadisticas();
        });
    }

    filtrarPorPeriodo(datos, fechaCampo) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        return datos.filter(item => {
            const fechaItem = new Date(item[fechaCampo]);
            fechaItem.setHours(0, 0, 0, 0);

            // Aplicar filtro por mes específico si está seleccionado
            if (this.mesSeleccionado && this.mesSeleccionado !== '') {
                const mesItem = (fechaItem.getMonth() + 1).toString().padStart(2, '0');
                if (mesItem !== this.mesSeleccionado) {
                    return false;
                }
            }

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

                case 'otro-mes':
                    // Solo filtrar por mes seleccionado
                    return true;

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
                    <td colspan="6" class="text-center" style="padding: 40px; color: #6c757d;">
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
                    <td colspan="6" class="text-center" style="padding: 40px; color: #6c757d;">
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
        
        // Elementos de estadísticas opcionales - solo si existen en el DOM
        const elemAudiencias = document.getElementById('total-audiencias-desahogadas');
        const elemTerminos = document.getElementById('total-terminos-presentados');
        const elemTotal = document.getElementById('total-completados');
        
        if (elemAudiencias) elemAudiencias.textContent = audienciasFiltradas.length;
        if (elemTerminos) elemTerminos.textContent = terminosFiltrados.length;
        if (elemTotal) elemTotal.textContent = audienciasFiltradas.length + terminosFiltrados.length;
        
        console.log(`Estadísticas actualizadas: ${audienciasFiltradas.length} audiencias, ${terminosFiltrados.length} términos`);
    }

    formatDate(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    // Inicializar listeners globales adicionales
    inicializarEventos() {
        // Si existe el botón de restablecer, vincularlo
        try {
            const btnReset = document.getElementById('btn-reset-audiencias');
            if (btnReset) {
                btnReset.addEventListener('click', (e) => {
                    e.preventDefault();
                    try { localStorage.removeItem('audiencias'); } catch (_) {}
                    window.location.reload();
                });
            }
            // Conectar búsqueda rápida
            const inputSearch = document.getElementById('search-agenda');
            if (inputSearch) {
                inputSearch.addEventListener('input', (ev) => {
                    const q = ev.target.value.trim();
                    if (q === '') {
                        // restaurar vista filtrada por periodo
                        this.actualizarVista();
                    } else {
                        this.buscarEnAgenda(q);
                    }
                });
            }
        } catch (e) {
            // no bloquear la inicialización por errores en el DOM
            console.warn('Inicializar eventos: ', e);
        }
    }

    // Buscar en audienciasDesahogadas por expediente, partes o abogado
    buscarEnAgenda(query) {
        const q = query.toLowerCase();
        const resultados = this.audienciasDesahogadas.filter(a => {
            return (a.expediente && a.expediente.toLowerCase().includes(q));
        });

        const tbody = document.getElementById('audiencias-desahogadas-body');
        if (!tbody) return;

        if (resultados.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center" style="padding: 40px; color: #6c757d;">
                        <i class="fas fa-search fa-3x mb-3"></i>
                        <div>No se encontraron resultados para "${query}"</div>
                    </td>
                </tr>
            `;
            return;
        }

        let html = '';
        resultados.forEach(audiencia => {
            html += `
                <tr>
                    <td>${this.formatDate(audiencia.fechaAudiencia)}</td>
                    <td>${audiencia.horaAudiencia}</td>
                    <td><strong>${audiencia.expediente}</strong></td>
                    <td><span class="badge badge-primary">${audiencia.tipoAudiencia}</span></td>
                    <td>${audiencia.partes}</td>
                    <td>${audiencia.abogado}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
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