/**
 * Loader utility to include HTML components
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
  