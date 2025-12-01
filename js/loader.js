/**
 * Global Loader: Carga componentes HTML dinámicamente usando data-include
 */
export async function loadIncludes() {
  const includes = document.querySelectorAll('[data-include]');
  
  const promises = Array.from(includes).map(async (el) => {
    const file = el.getAttribute('data-include');
    try {
      const response = await fetch(file);
      if (response.ok) {
        const content = await response.text();
        el.outerHTML = content; // Reemplaza el div contenedor por el contenido real
      } else {
        console.error(`Error cargando ${file}: ${response.statusText}`);
        el.innerHTML = `<div class="text-red-500 p-2">Error cargando componente</div>`;
      }
    } catch (error) {
      console.error(`Error de red al cargar ${file}`, error);
    }
  });

  await Promise.all(promises);
  
  // Reinicializar iconos de FontAwesome si es necesario
  if (window.FontAwesome) window.FontAwesome.dom.i2svg();
  
  // IMPORTANTE: Reinicializar Flowbite o listeners globales del sidebar si los hubiera
  const toggleBtn = document.querySelector('[data-drawer-toggle="logo-sidebar"]');
  if(toggleBtn) {
      // Lógica simple para abrir/cerrar sidebar en móvil si no usas la librería de Flowbite JS
      toggleBtn.addEventListener('click', () => {
          const sidebar = document.getElementById('logo-sidebar');
          if(sidebar) sidebar.classList.toggle('-translate-x-full');
      });
  }
}