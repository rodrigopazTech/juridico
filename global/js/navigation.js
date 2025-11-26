// global/js/navigation.js
// Maneja la navegación global y el highlighting del sidebar activo

/**
 * Inicializa el sidebar marcando la página activa
 * @param {string} currentPage - El identificador de la página actual (ej: 'dashboard', 'expedientes', 'usuarios')
 */
function initSidebar(currentPage) {
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
 * @param {string} icon - La clase del icono de Font Awesome (ej: 'fa-chart-line')
 * @param {string} title - El texto del título
 */
function setNavbarTitle(icon, title) {
  const navbarIcon = document.getElementById('navbar-icon');
  const navbarText = document.getElementById('navbar-text');
  
  if (navbarIcon) {
    navbarIcon.className = `fas ${icon}`;
  }
  
  if (navbarText) {
    navbarText.textContent = title;
  }
}

/**
 * Carga un componente HTML de forma asíncrona
 * @param {string} componentPath - Ruta relativa al componente HTML
 * @param {string} targetId - ID del elemento donde se insertará el componente
 */
async function loadComponent(componentPath, targetId) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.innerHTML = html;
    }
  } catch (error) {
    console.error(`Error loading component ${componentPath}:`, error);
  }
}

// Exportar funciones para uso global
if (typeof window !== 'undefined') {
  window.NavigationUtils = {
    initSidebar,
    setNavbarTitle,
    loadComponent
  };
}
