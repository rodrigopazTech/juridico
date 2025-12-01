// js/loader.js
async function loadComponents() {
    try {
        // 1. Cargar Sidebar
        const sidebarRes = await fetch('components/sidebar.html');
        if(sidebarRes.ok) document.getElementById('sidebar-container').innerHTML = await sidebarRes.text();

        // 2. Cargar Navbar
        const navbarRes = await fetch('components/navbar.html');
        if(navbarRes.ok) {
            document.getElementById('navbar-container').innerHTML = await navbarRes.text();
            // Opcional: Cambiar título del navbar dinámicamente
            const titleEl = document.getElementById('page-title');
            if(titleEl) titleEl.textContent = 'Control de Términos';
        }

        // 3. Cargar Modales
        const modalsRes = await fetch('components/modals.html');
        if(modalsRes.ok) document.getElementById('modals-container').innerHTML = await modalsRes.text();

    } catch (error) {
        console.error("Error cargando componentes:", error);
    }
}