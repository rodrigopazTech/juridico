// js/dashboard.js - VERSIÓN CORREGIDA Y SINCRONIZADA
console.log('📄 dashboard.js cargado - Esperando sidebar...');

// Variable para controlar el estado de inicialización
let dashboardInitialized = false;

function initDashboard() {
    if (dashboardInitialized) {
        console.log('⚠️ Dashboard ya estaba inicializado, omitiendo...');
        return;
    }
    
    dashboardInitialized = true;
    console.log('🎯 Ejecutando initDashboard...');
    
    // Inicializar componentes básicos
    initBasicComponents();
    
    // Inicializar calendario (CRÍTICO: después de asegurar que el sidebar está listo)
    initCalendar();
    
    // Configurar eventos
    setupEventListeners();
    
    console.log('✅ Dashboard completamente inicializado');
}

function initBasicComponents() {
    console.log('📊 Inicializando componentes básicos...');
    
    // Cargar datos básicos
    document.getElementById('total-audiencias').textContent = '12';
    document.getElementById('total-terminos').textContent = '8';
    document.getElementById('total-presentado').textContent = '10';
    
    // Inicializar gráfica de gerencias
    initGerenciaChart();

    // ===== ⬇️ AQUÍ ESTÁ LA LÍNEA AÑADIDA ⬇️ =====
    initAbogadoChart();
    // ===== ⬆️ FIN DE LA LÍNEA AÑADIDA ⬆️ =====
}

function initCalendar() {
    console.log('📅 Inicializando calendario...');
    
    const calendarEl = document.getElementById('calendar');
    
    if (!calendarEl) {
        console.error('❌ ERROR: Elemento #calendar no encontrado en el DOM');
        return null;
    }
    
    if (typeof FullCalendar === 'undefined') {
        console.error('❌ ERROR: FullCalendar no está disponible');
        return null;
    }
    
    console.log('✅ Elemento del calendario encontrado, creando instancia...');
    
    try {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'es',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            events: [
                {
                    title: 'Audiencia Inicial - Ortega Ibarra',
                    start: '2025-01-15T10:00:00',
                    end: '2025-01-15T11:00:00',
                    className: 'fc-event-audiencia',
                    description: 'Primer Tribunal - Materia Laboral'
                },
                {
                    title: 'Término de Contestación - Valdez Sánchez',
                    start: '2025-01-18',
                    className: 'fc-event-termino',
                    description: 'Vencimiento para presentar contestación'
                },
                {
                    title: 'Audiencia Intermedia - Sosa Uc',
                    start: '2025-01-22T14:00:00',
                    end: '2025-01-22T15:00:00',
                    className: 'fc-event-audiencia',
                    description: 'Segundo Tribunal - Presentación de pruebas'
                },
                {
                    title: 'Término de Pruebas - Rodríguez Pérez',
                    start: '2025-01-25',
                    className: 'fc-event-termino',
                    description: 'Vencimiento para ofrecer pruebas'
                }
            ],
            eventClick: function(info) {
                const event = info.event;
                const description = event.extendedProps.description || 'Sin descripción adicional';
                
                alert(`📅 ${event.title}\n\n📝 ${description}\n\n⏰ ${event.start ? event.start.toLocaleString('es-ES') : 'Fecha no disponible'}`);
            },
            eventDisplay: 'block',
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }
        });
        
        console.log('✅ Instancia de calendario creada, renderizando...');
        calendar.render();
        console.log('🎉 CALENDARIO RENDERIZADO EXITOSAMENTE');
        
        // 🔄 CRÍTICO: Redimensionar después de que el layout esté estabilizado
        setTimeout(() => {
            calendar.updateSize();
            console.log('📏 Calendario redimensionado correctamente');
        }, 800);
        
        return calendar;
        
    } catch (error) {
        console.error('💥 ERROR CRÍTICO al crear el calendario:', error);
        return null;
    }
}

function setupEventListeners() {
    console.log('🔗 Configurando event listeners...');
    
    // Botones de filtro del calendario
    const verTodos = document.getElementById('ver-todos');
    const verAudiencias = document.getElementById('ver-audiencias');
    const verTerminos = document.getElementById('ver-terminos');
    
    if (verTodos) {
        verTodos.addEventListener('click', () => {
            console.log('👁️ Mostrando todos los eventos');
            alert('Función: Mostrar todos los eventos');
        });
    }
    
    if (verAudiencias) {
        verAudiencias.addEventListener('click', () => {
            console.log('⚖️ Filtrando solo audiencias');
            alert('Función: Filtrar solo audiencias');
        });
    }
    
    if (verTerminos) {
        verTerminos.addEventListener('click', () => {
            console.log('⏰ Filtrando solo términos');
            alert('Función: Filtrar solo términos');
        });
    }
}

function initGerenciaChart() {
    console.log('📈 Inicializando gráfica de gerencias...');
    
    const ctx = document.getElementById('gerencia-chart');
    if (!ctx) {
        console.error('❌ ERROR: Elemento gerencia-chart no encontrado');
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error('❌ ERROR: Chart.js no está disponible');
        return;
    }
    
    // Obtener datos de asuntos por gerencia
    const datosGerencia = obtenerDatosGerencia();
    
    try {
        const chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: datosGerencia.labels,
                datasets: [{
                    label: 'Asuntos por Gerencia',
                    data: datosGerencia.values,
                    backgroundColor: [
                        '#2c5aa0', // Azul institucional - Civil, Mercantil, Fiscal y Administrativo
                        '#ffc107', // Amarillo dorado - Jurídica Financiera
                        '#28a745', // Verde profesional - Laboral y Penal
                        '#dc3545', // Rojo para más gerencias
                        '#6f42c1', // Púrpura
                        '#fd7e14', // Naranja
                        '#20c997', // Verde azulado
                        '#6c757d', // Gris
                        '#e83e8c', // Rosa
                        '#17a2b8'  // Cian
                    ],
                    borderColor: [
                        '#1e3d6f', // Civil, Mercantil, Fiscal y Administrativo
                        '#d39e00', // Jurídica Financiera
                        '#1e7e34', // Laboral y Penal
                        '#bd2130',
                        '#59359a',
                        '#dc6307',
                        '#1a9c87',
                        '#545b62',
                        '#d91a72',
                        '#138496'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 11
                            },
                            boxWidth: 12,
                            generateLabels: function(chart) {
                                const original = Chart.defaults.plugins.legend.labels.generateLabels;
                                const labels = original.call(this, chart);
                                
                                // Acortar nombres muy largos para la leyenda
                                labels.forEach(label => {
                                    if (label.text.length > 35) {
                                        const parts = label.text.split(',');
                                        if (parts.length > 1) {
                                            label.text = parts[0] + '...';
                                        } else {
                                            label.text = label.text.substring(0, 32) + '...';
                                        }
                                    }
                                });
                                
                                return labels;
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} asuntos (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log('✅ Gráfica de gerencias creada exitosamente');
        
        // Actualizar estadísticas
        actualizarEstadisticasChart(datosGerencia);
        
        return chart;
        
    } catch (error) {
        console.error('💥 ERROR al crear la gráfica de gerencias:', error);
        return null;
    }
}

function obtenerDatosGerencia() {
    console.log('📊 Obteniendo datos de asuntos por gerencia...');
    
    // Intentar obtener datos reales del localStorage
    let asuntos = [];
    try {
        asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    } catch (error) {
        console.warn('⚠️ No se pudieron cargar asuntos del localStorage:', error);
    }
    
    // Si no hay datos reales, usar datos de ejemplo
    if (asuntos.length === 0) {
        console.log('📋 Usando datos de ejemplo para la gráfica');
        return {
            labels: [
                'Gerencia de Civil, Mercantil, Fiscal y Administrativo',
                'Gerencia Jurídica Financiera',
                'Gerencia Laboral y Penal'
            ],
            values: [25, 18, 12]
        };
    }
    
    // Procesar datos reales
    const gerenciaCounts = {};
    
    asuntos.forEach(asunto => {
        // Usamos la clave correcta 'gerencia' del formulario de 'asuntos.js'
        const gerencia = asunto.gerencia || 'Sin Gerencia';
        gerenciaCounts[gerencia] = (gerenciaCounts[gerencia] || 0) + 1;
    });
    
    // Convertir a arrays para Chart.js
    const labels = Object.keys(gerenciaCounts);
    const values = Object.values(gerenciaCounts);
    
    // Ordenar por cantidad (mayor a menor)
    const sortedData = labels.map((label, index) => ({
        label: label,
        value: values[index]
    })).sort((a, b) => b.value - a.value);
    
    console.log('📈 Datos procesados:', sortedData);
    
    return {
        labels: sortedData.map(item => item.label),
        values: sortedData.map(item => item.value)
    };
}

function actualizarEstadisticasChart(datosGerencia) {
    console.log('📊 Actualizando estadísticas de la gráfica...');
    
    // Calcular totales
    const totalAsuntos = datosGerencia.values.reduce((sum, value) => sum + value, 0);
    const totalGerencias = datosGerencia.labels.length;
    
    // Actualizar elementos del DOM
    const totalAsuntosEl = document.getElementById('total-asuntos');
    const totalGerenciasEl = document.getElementById('total-gerencias');
    
    if (totalAsuntosEl) {
        totalAsuntosEl.textContent = totalAsuntos;
    }
    
    if (totalGerenciasEl) {
        totalGerenciasEl.textContent = totalGerencias;
    }
    
    console.log(`📈 Estadísticas actualizadas: ${totalAsuntos} asuntos en ${totalGerencias} gerencias`);
}

// ===============================================
// ===== ⬇️ NUEVAS FUNCIONES AÑADIDAS ⬇️ =====
// ===============================================

/**
 * Procesa los datos de localStorage para la gráfica de abogados.
 */
function obtenerDatosAbogado() {
    console.log('📊 Obteniendo datos de asuntos por abogado...');
    
    let asuntos = [];
    try {
        asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    } catch (error) {
        console.warn('⚠️ No se pudieron cargar asuntos del localStorage:', error);
    }
    
    // Si no hay datos reales, usar datos de ejemplo
    if (asuntos.length === 0) {
        console.log('📋 Usando datos de ejemplo para la gráfica de abogados');
        return {
            labels: ['Lic. María González', 'Lic. Ana Morales', 'Lic. Sandra Jiménez'],
            values: [5, 3, 4]
        };
    }
    
    // Procesar datos reales
    const abogadoCounts = {};
    
    asuntos.forEach(asunto => {
        // Usamos la clave correcta: 'abogadoResponsable'
        const abogado = asunto.abogadoResponsable || 'Sin Asignar';
        abogadoCounts[abogado] = (abogadoCounts[abogado] || 0) + 1;
    });
    
    // Convertir a arrays para Chart.js
    const labels = Object.keys(abogadoCounts);
    const values = Object.values(abogadoCounts);
    
    // Ordenar por cantidad (mayor a menor)
    const sortedData = labels.map((label, index) => ({
        label: label,
        value: values[index]
    })).sort((a, b) => b.value - a.value);
    
    console.log('📈 Datos de abogados procesados:', sortedData);
    
    return {
        labels: sortedData.map(item => item.label),
        values: sortedData.map(item => item.value)
    };
}


/**
 * Inicializa la gráfica de barras "Carga por Abogado".
 */
function initAbogadoChart() {
    console.log('📈 Inicializando gráfica de abogados...');
    
    const ctx = document.getElementById('abogado-chart');
    if (!ctx) {
        console.error('❌ ERROR: Elemento abogado-chart no encontrado');
        return;
    }
    
    if (typeof Chart === 'undefined') {
        console.error('❌ ERROR: Chart.js no está disponible');
        return;
    }
    
    const datosAbogado = obtenerDatosAbogado();
    
    try {
        new Chart(ctx, {
            type: 'bar', // Gráfica de Barras (más legible para esta data)
            data: {
                labels: datosAbogado.labels,
                datasets: [{
                    label: 'Asuntos Activos',
                    data: datosAbogado.values,
                    backgroundColor: 'rgba(44, 90, 160, 0.8)', // Azul institucional
                    borderColor: 'rgba(30, 61, 111, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                // indexAxis: 'y', // Descomenta esto si prefieres barras horizontales
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1 // Asegura que la cuenta sea en enteros (1, 2, 3...)
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // No es necesaria con una sola barra
                    }
                }
            }
        });
        
        console.log('✅ Gráfica de abogados creada exitosamente');
        
    } catch (error) {
        console.error('💥 ERROR al crear la gráfica de abogados:', error);
    }
}

// ===============================================
// ===== ⬆️ FIN DE LAS FUNCIONES NUEVAS ⬆️ =====
// ===============================================

// Hacer disponible globalmente
window.initDashboard = initDashboard;
window.initCalendar = initCalendar;
window.initGerenciaChart = initGerenciaChart;

console.log('✅ dashboard.js completamente cargado y listo');