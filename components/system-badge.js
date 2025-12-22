// js/system-badge.js

(function() {
    function actualizarContador() {
        const badge = document.getElementById('sidebar-badge-count');
        if (!badge) return; 

        try {
            const notificaciones = JSON.parse(localStorage.getItem('jl_notifications_v4') || '[]');
            const now = new Date();
            
            // CAMBIO: Filtramos por FECHA PASADA y que NO ESTÉN LEÍDAS
            const activas = notificaciones.filter(n => {
                const fechaOk = new Date(n.notifyAt) <= now;
                const noLeida = !n.read; // Si read es undefined, se toma como false (no leída)
                return fechaOk && noLeida;
            });
            
            const count = activas.length;

            if (count > 0) {
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        } catch (e) {
            console.error('Error al leer notificaciones', e);
        }
    }

    // Ejecutar inmediatamente
    actualizarContador();

    // Escuchar cambios en el localStorage (para cuando se lee en otra pestaña o se marca como leída)
    window.addEventListener('storage', actualizarContador);

    // Y ejecutar cada segundo por si acaso (recordatorios que se activan)
    setInterval(actualizarContador, 1000);
})();