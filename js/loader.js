/**
 * Global Loader: Carga componentes y maneja la transición de página
 */
export async function loadIncludes() {
  const includes = document.querySelectorAll('[data-include]');
  
  const promises = Array.from(includes).map(async (el) => {
    const file = el.getAttribute('data-include');
    try {
      const response = await fetch(file);
      if (response.ok) {
        const content = await response.text();
        el.outerHTML = content; 
      } else {
        console.error(`Error cargando ${file}`);
      }
    } catch (error) {
      console.error(`Error de red al cargar ${file}`, error);
    }
  });

  // 1. Esperar a que todos los componentes (Sidebar/Navbar) estén listos
  await Promise.all(promises);
  
  // 2. ACTIVAR EL LINK DEL SIDEBAR AUTOMÁTICAMENTE
  highlightActiveSidebar();

  // 3. Reinicializar iconos si es necesario
  if (window.FontAwesome) window.FontAwesome.dom.i2svg();
  
  // 4. Manejar toggle sidebar móvil
  const toggleBtn = document.querySelector('[data-drawer-toggle="logo-sidebar"]');
  if(toggleBtn) {
      toggleBtn.addEventListener('click', () => {
          const sidebar = document.getElementById('logo-sidebar');
          if(sidebar) sidebar.classList.toggle('-translate-x-full');
      });
  }

  // 5. Mostrar la página suavemente (Fade-in)
  setTimeout(() => {
      document.body.classList.add('loaded');
  }, 50); 
}

/**
 * Función para resaltar el botón actual del sidebar
 * Basado en la carpeta de la URL
 */
function highlightActiveSidebar() {
    const path = window.location.pathname;
    let page = '';

    // Detectar en qué carpeta estamos
    if (path.includes('dashboard-module')) page = 'dashboard';
    else if (path.includes('agenda-general-module')) page = 'agenda';
    else if (path.includes('recordatorios-module')) page = 'recordatorios';
    else if (path.includes('notificaciones-module')) page = 'notificaciones';
    else if (path.includes('expediente-module')) page = 'expedientes';
    else if (path.includes('audiencias')) page = 'audiencias';
    else if (path.includes('terminos')) page = 'terminos';
    else if (path.includes('usuario-module')) page = 'usuarios';
    else if (path.includes('calendario-module')) page = 'calendario';

    if (page) {
        const link = document.querySelector(`a[data-page="${page}"]`);
        if (link) {
            // Quitar clases inactivas
            link.classList.remove('text-gray-300', 'hover:bg-gob-verdeDark', 'hover:text-white');
            
            // Agregar clases activas (Dorado, borde izquierdo, fondo suave)
            link.classList.add('text-white', 'bg-white/10', 'border-l-4', 'border-gob-oro');
            
            // Pintar el icono de dorado
            const icon = link.querySelector('i');
            if (icon) {
                icon.classList.remove('text-gray-400'); // si tuviera
                icon.classList.add('text-gob-oro');
            }
        }
    }
}