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

// Hacer disponible globalmente
window.initDashboard = initDashboard;
window.initCalendar = initCalendar;

console.log('✅ dashboard.js completamente cargado y listo');