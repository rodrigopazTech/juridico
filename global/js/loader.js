/**
 * Global Loader - Carga componentes HTML compartidos
 */

/**
 * Carga todos los elementos con atributo data-include
 */
export async function loadIncludes() {
  const elements = document.querySelectorAll('[data-include]');
  
  for (const element of elements) {
    const file = element.getAttribute('data-include');
    try {
      const response = await fetch(file);
      if (response.ok) {
        const html = await response.text();
        element.innerHTML = html;
      } else {
        console.error(`Failed to load ${file}`);
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }
}

/**
 * Inicializa el sidebar con la página activa
 * @param {string} currentPage - Identificador de la página actual
 */
export function initSidebar(currentPage) {
  // Remover clases activas de todos los items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('bg-white/10', 'border-l-4', 'border-gob-oro', 'shadow-sm');
    item.classList.add('text-gray-300', 'hover:bg-gob-verdeDark');
    
    const icon = item.querySelector('i');
    if (icon) {
      icon.classList.remove('text-gob-oro');
    }
    
    const span = item.querySelector('span');
    if (span) {
      span.classList.remove('font-bold');
    }
  });

  // Marcar el item activo
  const activeItem = document.querySelector(`[data-page="${currentPage}"]`);
  if (activeItem) {
    activeItem.classList.add('bg-white/10', 'border-l-4', 'border-gob-oro', 'shadow-sm');
    activeItem.classList.remove('text-gray-300', 'hover:bg-gob-verdeDark');
    activeItem.classList.add('text-white');
    
    const icon = activeItem.querySelector('i');
    if (icon) {
      icon.classList.add('text-gob-oro');
    }
    
    const span = activeItem.querySelector('span');
    if (span) {
      span.classList.add('font-bold');
    }
  }
}

/**
 * Actualiza el título del navbar
 * @param {string} icon - Clase del icono de Font Awesome
 * @param {string} title - Texto del título
 */
export function setNavbarTitle(icon, title) {
  const navbarIcon = document.getElementById('navbar-icon');
  const navbarText = document.getElementById('navbar-text');
  
  if (navbarIcon) {
    navbarIcon.className = `fas ${icon}`;
  }
  
  if (navbarText) {
    navbarText.textContent = title;
  }
}
