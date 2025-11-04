// js/calendar.js - Solo si es necesario para otras páginas
console.log('calendar.js cargado (modo standby)');

// Función de respaldo si se necesita en otras páginas
function initCalendarStandalone() {
    console.log('Inicializando calendario en modo standalone...');
    
    if (typeof initCalendar === 'function') {
        return initCalendar();
    }
    
    console.warn('initCalendar no disponible, cargando versión standalone...');
    
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return null;
    
    try {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'es',
            events: []
        });
        calendar.render();
        return calendar;
    } catch (error) {
        console.error('Error en calendar standalone:', error);
        return null;
    }
}

// Auto-inicialización solo si no hay otro calendario
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (document.getElementById('calendar') && !window.calendarInicializado) {
            console.log('Auto-inicializando calendario desde calendar.js');
            initCalendarStandalone();
            window.calendarInicializado = true;
        }
    }, 2000);
});