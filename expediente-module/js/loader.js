/**
 * Cargador dinámico de componentes HTML
 * Busca elementos con el atributo data-include y carga su contenido.
 */
export async function loadIncludes() {
  const includes = document.querySelectorAll('[data-include]');
  const promises = [];

  includes.forEach(el => {
    const path = el.getAttribute('data-include');
    const promise = fetch(path)
      .then(response => {
        if (!response.ok) throw new Error(`No se pudo cargar ${path}`);
        return response.text();
      })
      .then(html => {
        el.outerHTML = html; // Reemplaza el contenedor por el contenido del componente
      })
      .catch(err => {
        console.error(err);
        el.innerHTML = `<div class="text-red-500 text-xs p-2">Error cargando ${path}</div>`;
      });
    promises.push(promise);
  });

  return Promise.all(promises);
}