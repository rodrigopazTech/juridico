/**
 * Loader - Dynamic HTML Component Inclusion
 * Loads HTML components dynamically into the page
 */

/**
 * Sistema de Badge de Notificaciones
 */
function getUpcomingNotificationsCount() {
  try {
    const storageKey = 'jl_notifications_v2';
    const data = localStorage.getItem(storageKey);
    
    if (!data) return 0;
    
    const notifications = JSON.parse(data);
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Contar notificaciones no enviadas que se disparan en las próximas 24 horas
    const count = notifications.filter(notif => {
      if (notif.sent) return false;
      const notifyAt = new Date(notif.notifyAt);
      return notifyAt >= now && notifyAt <= next24h;
    }).length;
    
    return count;
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return 0;
  }
}

function updateNotificationBadge() {
  const badge = document.getElementById('sidebar-notifications-badge');
  if (!badge) return;
  
  const count = getUpcomingNotificationsCount();
  
  // Siempre mostrar el badge con el contador
  badge.textContent = count > 99 ? '99+' : count;
  badge.classList.remove('hidden');
}

function initNotificationBadge() {
  // Actualizar inmediatamente
  updateNotificationBadge();
  
  // Actualizar cada 60 segundos
  setInterval(updateNotificationBadge, 60000);
  
  // Actualizar cuando cambia el localStorage (desde otras pestañas)
  window.addEventListener('storage', function(e) {
    if (e.key === 'jl_notifications_v2') {
      updateNotificationBadge();
    }
  });
  
  // Exponer función para actualización manual
  window.updateNotificationBadge = updateNotificationBadge;
}

document.addEventListener('DOMContentLoaded', async () => {
  const includes = document.querySelectorAll('[data-include]');
  
  for (const include of includes) {
    const file = include.getAttribute('data-include');
    try {
      const response = await fetch(file);
      if (response.ok) {
        const content = await response.text();
        include.innerHTML = content;
      } else {
        console.error(`Failed to load ${file}: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error);
    }
  }
  
  // Inicializar el sistema de badge de notificaciones después de cargar el sidebar
  initNotificationBadge();
});
