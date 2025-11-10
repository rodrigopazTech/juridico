// js/recordatorios-panel.js
// Lógica para el panel visual de recordatorios

(function(window){

    // Variable para guardar la instancia del gráfico y poder destruirla
    let myRecordatoriosChart = null;

    /**
     * Inicializa todos los componentes del panel
     */
    function initPanelRecordatorios() {
        
        // 1. Configurar el Modal
        const modal = document.getElementById('modal-crear-recordatorio');
        const btnAbrir = document.getElementById('btn-abrir-modal');
        const btnCerrar = document.getElementById('modal-close-btn');

        if (btnAbrir) {
            btnAbrir.onclick = () => { modal.style.display = 'block'; };
        }
        if (btnCerrar) {
            btnCerrar.onclick = () => { modal.style.display = 'none'; };
        }
        // Cierra el modal si se hace clic fuera del contenido
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };

        // 2. Configurar el formulario
        const form = document.getElementById('form-crear-recordatorio');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        // 3. Cargar los datos visuales
        loadPanelData();
    }

    /**
     * Maneja el envío del formulario del modal
     */
    function handleFormSubmit(event) {
        event.preventDefault();

        const title = document.getElementById('recordatorio-titulo').value;
        const details = document.getElementById('recordatorio-detalles').value;
        const fechaValue = document.getElementById('recordatorio-fecha').value;

        if (!title || !fechaValue) {
            alert('Por favor, completa el título y la fecha.');
            return;
        }

        if (window.Notificaciones && typeof window.Notificaciones.add === 'function') {
            window.Notificaciones.add({
                eventType: 'recordatorio',
                title: title,
                details: details,
                eventAtISO: fechaValue,
                notifyType: 'datetime',
                offset: 0
            });

            alert('¡Recordatorio creado!');
            
            // Cerrar el modal y refrescar los datos
            document.getElementById('modal-crear-recordatorio').style.display = 'none';
            this.reset(); // Limpiar el formulario
            loadPanelData(); // Volver a cargar gráficas y listas

        } else {
            console.error('La API de Notificaciones no está disponible.');
        }
    }

    /**
     * Carga todos los datos y renderiza los componentes visuales
     */
    function loadPanelData() {
        if (!window.Notificaciones) return;

        // Obtener solo recordatorios
        const allNotif = window.Notificaciones.all();
        const recordatorios = allNotif.filter(n => n.eventType === 'recordatorio');

        const now = new Date();
        const proximos = recordatorios.filter(n => !n.sent && new Date(n.notifyAt) >= now)
            .sort((a,b) => new Date(a.notifyAt) - new Date(b.notifyAt));
        
        // Consideramos "pasados" a los enviados o a los que ya pasó su fecha
        const pasados = recordatorios.filter(n => n.sent || new Date(n.notifyAt) < now);

        // Renderizar componentes
        renderChart(proximos.length, pasados.length);
        renderListaProximos(proximos);
    }

    /**
     * Dibuja la gráfica de Pie (Torta)
     */
    function renderChart(countProximos, countPasados) {
        const ctx = document.getElementById('recordatorios-chart');
        if (!ctx) return; // Salir si el canvas no existe

        // Destruir el gráfico anterior si existe (para evitar errores al recargar)
        if (myRecordatoriosChart) {
            myRecordatoriosChart.destroy();
        }

        myRecordatoriosChart = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Pendientes', 'Completados/Pasados'],
                datasets: [{
                    label: 'Recordatorios',
                    data: [countProximos, countPasados],
                    backgroundColor: [
                        'rgba(255, 193, 7, 0.7)', // Amarillo para pendientes
                        'rgba(40, 167, 69, 0.7)'  // Verde para completados
                    ],
                    borderColor: [
                        'rgba(255, 193, 7, 1)',
                        'rgba(40, 167, 69, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    /**
     * Muestra la lista de próximos recordatorios
     */
    function renderListaProximos(items) {
        const el = document.getElementById('proximos-recordatorios-lista');
        if (!el) return;

        el.innerHTML = ''; // Limpiar lista
        if (items.length === 0) {
            el.innerHTML = '<p style="padding: 10px; text-align:center;">No hay recordatorios próximos.</p>';
            return;
        }

        items.forEach(n => {
            const div = document.createElement('div');
            div.className = 'list-item';
            const when = new Date(n.notifyAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
            
            div.innerHTML = `
                <div class="title">${n.title}</div>
                <div class="date">${when}</div>
                ${n.details ? `<div class="details" style="font-size: 0.9em; color: #666;">${n.details}</div>` : ''}
            `;
            el.appendChild(div);
        });
    }

    // Exponer la función de inicialización al mundo exterior
    window.PanelRecordatorios = {
        init: initPanelRecordatorios
    };

})(window);