async function loadComponents() {
    try {
        // Nota: Asegúrate de tener los archivos sidebar.html y navbar.html
        // en la carpeta components/ para que esto funcione sin errores 404.
        const sidebarRes = await fetch('components/sidebar.html');
        if(sidebarRes.ok) document.getElementById('sidebar-container').innerHTML = await sidebarRes.text();

        const navbarRes = await fetch('components/navbar.html');
        if(navbarRes.ok) document.getElementById('navbar-container').innerHTML = await navbarRes.text();

        const modalsRes = await fetch('components/modals.html');
        if(modalsRes.ok) document.getElementById('modals-container').innerHTML = await modalsRes.text();
    } catch (error) { console.error("Error loading components", error); }
}