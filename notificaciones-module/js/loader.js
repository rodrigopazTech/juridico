/**
 * Loader - Dynamic HTML Component Inclusion
 * Loads HTML components dynamically into the page
 */

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
});
