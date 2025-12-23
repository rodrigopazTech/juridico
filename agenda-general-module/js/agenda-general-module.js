// js/agenda-general-module.js

// Lógica para la página de Agenda General
class AgendaGeneralManager {
    constructor() {
        this.audienciasDesahogadas = [];
        this.terminosPresentados = [];
        this.periodoActual = 'hoy'; // Filtro por defecto
        this.pestañaActiva = 'audiencias-desahogadas';
        this.mesSeleccionado = '';
        this.init();
    }

    init() {
        console.log('🎯 Iniciando Agenda General Manager');
        this.cargarDatos();
        this.inicializarEventos();
        this.configurarPestañas();
        this.configurarFiltrosTiempo();
        this.configurarFiltroOtroMes();
        this.configurarModalObservaciones();
        this.actualizarVista();
        this.actualizarEstadisticas();
        console.log('✅ Agenda General Manager iniciado');
    }

    // ==========================================
    // CARGA DE DATOS (FECHAS FUTURAS Y HOY)
    // ==========================================
    cargarDatos() {
        // Helper: Genera fechas dinámicas a partir de hoy
        const hoy = new Date();
        const getFechaStr = (diasOffset) => {
            const d = new Date(hoy);
            d.setDate(hoy.getDate() + diasOffset);
            return d.toISOString().split('T')[0];
        };

        // 1. CARGAR AUDIENCIAS (Simulando Agenda Futura/Presente)
        const todasAudiencias = JSON.parse(localStorage.getItem('audiencias')) || [];
        
        this.audienciasDesahogadas = todasAudiencias
            .filter(audiencia => audiencia.atendida === true)
            .map(a => ({
                ...a,
                // Si falta fechaDesahogo, usamos fechaAudiencia o la fecha genérica para evitar errores
                fechaDesahogo: a.fechaDesahogo || a.fechaAudiencia || a.fecha
            }));        
        // Si no hay datos, usar ejemplos con fechas de HOY y FUTURO
        if (this.audienciasDesahogadas.length === 0) {
            this.audienciasDesahogadas = [
                {
                    id: 1,
                    fechaAudiencia: getFechaStr(0), // HOY (Para que aparezca en el filtro 'Hoy')
                    horaAudiencia: '09:30',
                    expediente: 'EXP-2025-0456',
                    tipoAudiencia: 'Conciliación',
                    partes: 'Martínez vs. Rodríguez',
                    abogado: 'Dra. Laura Méndez',
                    actaDocumento: 'ACTA-PENDIENTE.pdf',
                    atendida: true, // Marcado true para que salga en esta lista (simulando agendado/listo)
                    fechaDesahogo: getFechaStr(0), 
                    observaciones: 'Programada para hoy a primera hora.'
                },
                {
                    id: 2,
                    fechaAudiencia: getFechaStr(1), // MAÑANA (Para filtro Semana)
                    horaAudiencia: '11:00',
                    expediente: 'EXP-2025-0789',
                    tipoAudiencia: 'Vista',
                    partes: 'Pérez e Hijos S.A. vs. Estado',
                    abogado: 'Lic. Carlos Ruiz',
                    actaDocumento: 'ACTA-FUTURA.pdf',
                    atendida: true,
                    fechaDesahogo: getFechaStr(1),
                    observaciones: 'Vista pública confirmada para mañana.'
                },
                {
                    id: 3,
                    fechaAudiencia: getFechaStr(3), // EN 3 DÍAS (Para filtro Semana)
                    horaAudiencia: '15:15',
                    expediente: 'EXP-2025-1123',
                    tipoAudiencia: 'Juicio',
                    partes: 'González vs. Instituto Federal',
                    abogado: 'Lic. Ana Vargas',
                    actaDocumento: 'ACTA-PROXIMA.pdf',
                    atendida: true,
                    fechaDesahogo: getFechaStr(3),
                    observaciones: 'Juicio oral próximo.'
                },
                {
                    id: 4,
                    fechaAudiencia: getFechaStr(15), // EN 15 DÍAS (Para filtro Mes)
                    horaAudiencia: '10:00',
                    expediente: '3485/2025',
                    tipoAudiencia: 'Inicial',
                    partes: 'Herrera Campos vs. Transportes',
                    abogado: 'Lic. María González',
                    actaDocumento: 'ACTA-MES.pdf',
                    atendida: true,
                    fechaDesahogo: getFechaStr(15),
                    observaciones: 'Audiencia inicial programada para final de mes.'
                }
            ];
        }

        // 2. CARGAR TÉRMINOS (Simulando Vencimientos Futuros)
        const todosTerminos = JSON.parse(localStorage.getItem('terminos')) || [];
        this.terminosPresentados = todosTerminos.filter(termino => termino.estatus === 'Presentado' || termino.estatus === 'Concluido');
        
        if (this.terminosPresentados.length === 0) {
            this.terminosPresentados = [
                {
                    id: 1,
                    fechaIngreso: getFechaStr(0),
                    fechaVencimiento: getFechaStr(0), // VENCE HOY
                    expediente: 'EXP-2025-001',
                    actuacion: 'Contestación de demanda',
                    partes: 'Empresa A vs. Empleado B',
                    abogado: 'Lic. Juan Pérez',
                    acuseDocumento: 'ACUSE-HOY.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: getFechaStr(0), // PRESENTAR HOY
                    observaciones: 'Vencimiento el día de hoy.'
                },
                {
                    id: 2,
                    fechaIngreso: getFechaStr(0),
                    fechaVencimiento: getFechaStr(2), // VENCE EN 2 DÍAS
                    expediente: 'EXP-2025-002',
                    actuacion: 'Ofrecimiento de pruebas',
                    partes: 'Banco X vs. Deudor Y',
                    abogado: 'Lic. Ana López',
                    acuseDocumento: 'ACUSE-PENDIENTE.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: getFechaStr(2),
                    observaciones: 'Preparar pruebas para esta semana.'
                },
                {
                    id: 3,
                    fechaIngreso: getFechaStr(5),
                    fechaVencimiento: getFechaStr(10), // VENCE EN 10 DÍAS
                    expediente: 'EXP-2025-003',
                    actuacion: 'Alegatos finales',
                    partes: 'Constructora Z vs. Municipio',
                    abogado: 'Lic. Roberto M.',
                    acuseDocumento: 'ACUSE-FUTURO.pdf',
                    etapaRevision: 'Presentado',
                    fechaPresentacion: getFechaStr(10),
                    observaciones: 'Alegatos programados para mediados de mes.'
                }
            ];
        }
    }

    configurarPestañas() {
        const tabButtons = document.querySelectorAll('.tab-button');
        if (!tabButtons || tabButtons.length === 0) return;

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const onClick = button.getAttribute('onclick') || '';
                const isAudiencias = onClick.includes("showModule('audiencias')") ||
                    (button.textContent || '').toLowerCase().includes('audiencias');

                const module = isAudiencias ? 'audiencias' : 'terminos';
                showModule(module);
            });
        });
    }

    configurarFiltrosTiempo() {
        const timeFilters = document.querySelectorAll('.time-filter-btn');
        timeFilters.forEach(button => {
            button.addEventListener('click', () => {
                const module = button.getAttribute('data-module');
                
                document.querySelectorAll(`.time-filter-btn[data-module="${module}"]`).forEach(btn => {
                    btn.classList.remove('bg-gob-guinda', 'text-white', 'border-gob-guinda');
                    btn.classList.add('bg-white', 'text-gob-gris', 'border-gray-300');
                });
                
                button.classList.remove('bg-white', 'text-gob-gris', 'border-gray-300');
                button.classList.add('bg-gob-guinda', 'text-white', 'border-gob-guinda');

                this.periodoActual = button.getAttribute('data-period');
                this.mesSeleccionado = ''; 
                this.actualizarVista();
            });
        });
    }

    configurarFiltroOtroMes() {
        const setupDropdown = (btnId, menuId) => {
            const btn = document.getElementById(btnId);
            const menu = document.getElementById(menuId);
            if(btn && menu) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.meses-dropdown-content').forEach(d => {
                        if(d !== menu) d.classList.remove('show');
                    });
                    menu.classList.toggle('show');
                });
                menu.addEventListener('click', (e) => e.stopPropagation());
            }
        };

        setupDropdown('btn-otro-mes-audiencias', 'dropdown-meses-audiencias');
        setupDropdown('btn-otro-mes-terminos', 'dropdown-meses-terminos');

        document.addEventListener('click', () => {
            document.querySelectorAll('.meses-dropdown-content').forEach(d => d.classList.remove('show'));
        });
    }

    filtrarPorPeriodo(datos, fechaCampo) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        return datos.filter(item => {
            // Si el dato no tiene la fecha o no es válida, lo saltamos
            if (!item[fechaCampo]) return false; 

            const partesFecha = item[fechaCampo].split('-');
            if (partesFecha.length !== 3) return false;

            const fechaItem = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);
            fechaItem.setHours(0, 0, 0, 0);

            if (this.mesSeleccionado) {
                const mesItemStr = (fechaItem.getMonth() + 1).toString().padStart(2, '0');
                return mesItemStr === this.mesSeleccionado && fechaItem.getFullYear() === hoy.getFullYear();
            }

            switch (this.periodoActual) {
                case 'hoy': 
                    return fechaItem.getTime() === hoy.getTime();
                
                case 'semana':
                    const diaSemana = hoy.getDay() || 7; 
                    const inicioSemana = new Date(hoy);
                    inicioSemana.setDate(hoy.getDate() - diaSemana + 1);
                    
                    const finSemana = new Date(inicioSemana);
                    finSemana.setDate(inicioSemana.getDate() + 6);
                    
                    return fechaItem >= inicioSemana && fechaItem <= finSemana;
                
                case 'mes': 
                    return fechaItem.getMonth() === hoy.getMonth() && fechaItem.getFullYear() === hoy.getFullYear();
                
                default: return true;
            }
        });
    }
    
    configurarModalObservaciones() {
        const modal = document.getElementById('modal-observaciones');
        const btnsClose = document.querySelectorAll('#close-modal-observaciones, #btn-cerrar-obs');
        
        btnsClose.forEach(btn => {
            if(btn) btn.addEventListener('click', () => modal.style.display = 'none');
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
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

        const filtradas = this.filtrarPorPeriodo(this.audienciasDesahogadas, 'fechaDesahogo');
        
        if (filtradas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-gray-500">No hay audiencias desahogadas para este periodo.</td></tr>`;
            return;
        }

        let html = '';
        filtradas.forEach(a => {
            html += `
                <tr class="bg-white hover:bg-gray-50 border-b">
                    <td class="px-6 py-4">${this.formatDate(a.fechaAudiencia)}</td>
                    <td class="px-6 py-4">${a.horaAudiencia}</td>
                    <td class="px-6 py-4 font-medium text-gob-guinda">${a.expediente || 'S/N'}</td>
                    <td class="px-6 py-4"><span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">${a.tipoAudiencia || 'General'}</span></td>
                    <td class="px-6 py-4 text-sm truncate max-w-[200px]" title="${a.partes}">${a.partes || ''}</td>
                    <td class="px-6 py-4 text-sm">${a.abogado || ''}</td>
                    <td class="px-6 py-4 text-center">
                        <div class="flex justify-center gap-2">
                            <button onclick="descargarDocumento('${a.actaDocumento}')" class="text-gray-500 hover:text-gob-guinda" title="Acta"><i class="fas fa-file-pdf"></i></button>
                            <button onclick="verObservaciones(${a.id}, 'audiencia')" class="text-gray-500 hover:text-blue-600" title="Observaciones"><i class="fas fa-eye"></i></button>
                        </div>
                    </td>
                </tr>`;
        });
        tbody.innerHTML = html;
    }

    mostrarTerminosPresentados() {
        const tbody = document.getElementById('terminos-presentados-body');
        if (!tbody) return;

        // Filtrar por fecha de presentación
        const filtradas = this.filtrarPorPeriodo(this.terminosPresentados, 'fechaPresentacion');
        
        if (filtradas.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">No hay términos presentados para este periodo.</td></tr>`;
            return;
        }

        let html = '';
        filtradas.forEach(t => {
            // Determinar color del badge según estado
            let badgeClass = 'bg-gray-100 text-gray-800';
            if (t.estatus === 'Presentado') badgeClass = 'bg-green-100 text-green-800';
            if (t.estatus === 'Concluido') badgeClass = 'bg-blue-100 text-blue-800';
            if (t.estatus === 'Liberado') badgeClass = 'bg-yellow-100 text-yellow-800';
            
            html += `
                <tr class="bg-white hover:bg-gray-50 border-b">
                    <td class="px-6 py-4">${this.formatDate(t.fechaPresentacion)}</td>
                    <td class="px-6 py-4">${this.formatDate(t.fechaVencimiento)}</td>
                    <td class="px-6 py-4 font-medium text-gob-guinda">${t.expediente}</td>
                    <td class="px-6 py-4 text-sm">${t.actuacion}</td>
                    <td class="px-6 py-4 text-sm truncate max-w-[200px]">${t.partes}</td>
                    <td class="px-6 py-4 text-center">
                        <div class="flex justify-center gap-2">
                            ${t.acuseDocumento ? 
                                `<button onclick="descargarDocumento('${t.acuseDocumento}')" class="text-gray-500 hover:text-gob-guinda" title="Acuse"><i class="fas fa-file-download"></i></button>` : 
                                `<span class="text-gray-400" title="Sin acuse"><i class="fas fa-file"></i></span>`
                            }
                            <button onclick="verObservaciones(${t.id}, 'termino')" class="text-gray-500 hover:text-blue-600" title="Observaciones"><i class="fas fa-eye"></i></button>
                        </div>
                    </td>
                </tr>`;
        });
        tbody.innerHTML = html;
    }

    actualizarEstadisticas() {
        // Placeholder para futuras estadísticas
    }

    formatDate(dateString) {
        if(!dateString) return '-';
        const parts = dateString.split('-');
        if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateString;
    }

    inicializarEventos() {
        const searchInput = document.getElementById('search-audiencias');
        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#audiencias-desahogadas-body tr');
                rows.forEach(row => {
                    const text = row.innerText.toLowerCase();
                    row.style.display = text.includes(term) ? '' : 'none';
                });
            });
        }
        
        const searchTerminosInput = document.getElementById('search-terminos');
        if(searchTerminosInput) {
            searchTerminosInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const rows = document.querySelectorAll('#terminos-presentados-body tr');
                rows.forEach(row => {
                    const text = row.innerText.toLowerCase();
                    row.style.display = text.includes(term) ? '' : 'none';
                });
            });
        }
    }
}

// --- GLOBALES ---
let agendaGeneral;

export function initAgendaGeneral() {
    agendaGeneral = new AgendaGeneralManager();
    
    window.showModule = showModule;
    window.seleccionarMesAudiencias = (mes) => {
        agendaGeneral.mesSeleccionado = mes;
        agendaGeneral.periodoActual = 'otro-mes';
        document.querySelectorAll('.time-filter-btn[data-module="audiencias"]').forEach(b => {
            b.classList.remove('bg-gob-guinda', 'text-white');
            b.classList.add('bg-white', 'text-gob-gris');
        });
        agendaGeneral.actualizarVista();
        document.getElementById('dropdown-meses-audiencias').classList.remove('show');
    };
    
    window.seleccionarMesTerminos = (mes) => {
        agendaGeneral.mesSeleccionado = mes;
        agendaGeneral.periodoActual = 'otro-mes';
        document.querySelectorAll('.time-filter-btn[data-module="terminos"]').forEach(b => {
            b.classList.remove('bg-gob-guinda', 'text-white');
            b.classList.add('bg-white', 'text-gob-gris');
        });
        agendaGeneral.actualizarVista();
        document.getElementById('dropdown-meses-terminos').classList.remove('show');
    };

    window.descargarDocumento = (doc) => alert(`Descargando ${doc}...`);
    
    window.verObservaciones = (id, tipo) => {
        let item = tipo === 'audiencia' 
            ? agendaGeneral.audienciasDesahogadas.find(x => x.id == id)
            : agendaGeneral.terminosPresentados.find(x => x.id == id);
            
        if(item) {
            document.getElementById('obs-modal-title').textContent = tipo === 'audiencia' ? 'Observaciones Audiencia' : 'Observaciones Término';
            document.getElementById('obs-modal-expediente').innerHTML = `<span class="font-bold text-gob-guinda">${item.expediente}</span>`;
            document.getElementById('obs-modal-content').innerHTML = `<p class="text-gray-700 bg-gray-50 p-4 rounded border">${item.observaciones || 'Sin observaciones'}</p>`;
            document.getElementById('modal-observaciones').style.display = 'block';
        }
    };
    
    // Función para sincronizar manualmente todos los términos liberados
    window.sincronizarTodosLiberadosManual = () => {
        const todosTerminos = JSON.parse(localStorage.getItem('terminos')) || [];
        const terminosLiberados = todosTerminos.filter(t => t.estatus === 'Liberado');
        let terminosPresentados = JSON.parse(localStorage.getItem('terminosPresentados')) || [];
        let sincronizados = 0;
        
        terminosLiberados.forEach(termino => {
            // Verificar si ya existe
            const existe = terminosPresentados.some(t => 
                t.id === termino.id || 
                (t.terminoIdOriginal && t.terminoIdOriginal === termino.id)
            );
            
            if (!existe) {
                const terminoAgenda = {
                    id: Date.now() + Math.random(),
                    fechaIngreso: termino.fechaIngreso || new Date().toISOString().split('T')[0],
                    fechaVencimiento: termino.fechaVencimiento || '',
                    fechaPresentacion: new Date().toISOString().split('T')[0],
                    expediente: termino.expediente || 'S/N',
                    actuacion: termino.asunto || termino.actuacion || '',
                    partes: termino.actor || '',
                    abogado: termino.abogado || 'Sin asignar',
                    acuseDocumento: termino.acuseDocumento || '',
                    etapaRevision: termino.estatus,
                    estatus: termino.estatus,
                    observaciones: termino.observaciones || 'Término liberado para presentación',
                    fechaCreacion: new Date().toISOString(),
                    terminoIdOriginal: termino.id
                };
                
                terminosPresentados.unshift(terminoAgenda);
                
                // Eliminar de la tabla principal
                const indice = todosTerminos.findIndex(t => String(t.id) === String(termino.id));
                if (indice !== -1) {
                    todosTerminos.splice(indice, 1);
                }
                
                sincronizados++;
            }
        });
        
        if (sincronizados > 0) {
            // Actualizar ambos localStorage
            localStorage.setItem('terminos', JSON.stringify(todosTerminos));
            localStorage.setItem('terminosPresentados', JSON.stringify(terminosPresentados));
            
            // Recargar datos
            agendaGeneral.terminosPresentados = terminosPresentados;
            agendaGeneral.actualizarVista();
            
            alert(`${sincronizados} términos liberados movidos a Agenda General y eliminados de la tabla principal`);
        } else {
            alert('No hay términos en estado "Liberado" para mover');
        }
    };
}

function showModule(moduleName) {
    document.querySelectorAll('.module-content').forEach(el => el.classList.remove('active'));
    document.getElementById(`module-${moduleName}`).classList.add('active');
    
    document.querySelectorAll('.tab-button').forEach(el => {
        el.classList.remove('active', 'border-gob-guinda', 'text-gob-guinda');
        el.classList.add('border-transparent', 'text-gray-500');
    });
    
    const buttons = document.querySelectorAll('.tab-button');
    if(moduleName === 'audiencias') {
        buttons[0].classList.add('active', 'border-gob-guinda', 'text-gob-guinda');
        buttons[0].classList.remove('border-transparent', 'text-gray-500');
    } else {
        buttons[1].classList.add('active', 'border-gob-guinda', 'text-gob-guinda');
        buttons[1].classList.remove('border-transparent', 'text-gray-500');
    }

    if(agendaGeneral) {
        agendaGeneral.pestañaActiva = moduleName === 'audiencias' ? 'audiencias-desahogadas' : 'terminos-presentados';
        agendaGeneral.actualizarVista();
    }
}