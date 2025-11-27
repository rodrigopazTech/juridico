async function loadComponents() {
    try {
        const sidebarRes = await fetch('components/sidebar.html');
        if(sidebarRes.ok) document.getElementById('sidebar-container').innerHTML = await sidebarRes.text();

        const navbarRes = await fetch('components/navbar.html');
        if(navbarRes.ok) document.getElementById('navbar-container').innerHTML = await navbarRes.text();

        const modalsRes = await fetch('components/modals.html');
        if(modalsRes.ok) document.getElementById('modals-container').innerHTML = await modalsRes.text();
    } catch (error) { console.error("Error loading components", error); }
}