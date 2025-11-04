// Funciones de inicialización generales
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initDocumentManager();
    loadPageContent();
});

function initNavigation() {
    // Marcar elemento activo en el sidebar
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function initDocumentManager() {
    // Toggle para carpetas en el sidebar
    document.querySelectorAll('.sidebar-folder').forEach(folder => {
        folder.addEventListener('click', function() {
            const contentId = this.id + '-content';
            const content = document.getElementById(contentId);
            content.classList.toggle('active');
        });
    });
    
    // Botones para agregar elementos
    document.getElementById('add-expediente').addEventListener('click', function(e) {
        e.stopPropagation();
        alert('Función para agregar expediente');
    });
    
    document.getElementById('add-documento').addEventListener('click', function(e) {
        e.stopPropagation();
        alert('Función para agregar documento');
    });
}

function loadPageContent() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const pageContent = document.getElementById('page-content');
    
    // Cargar el contenido de la página actual
    fetch(currentPage)
        .then(response => response.text())
        .then(html => {
            pageContent.innerHTML = html;
            
            // Inicializar scripts específicos de la página
            switch(currentPage) {
                case 'dashboard.html':
                    initDashboard();
                    break;
                case 'audiencias.html':
                    initAudiencias();
                    break;
                case 'terminos.html':
                    initTerminos();
                    break;
            }
        })
        .catch(error => {
            console.error('Error loading page content:', error);
            pageContent.innerHTML = '<p>Error al cargar la página</p>';
        });
}

function initNavigation() {
    // Marcar elemento activo en el sidebar
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Manejar páginas de detalle (asunto-detalle.html)
    if (currentPage === 'asunto-detalle.html') {
        const asuntosLink = document.querySelector('a[href="asuntos.html"]');
        if (asuntosLink) {
            asuntosLink.classList.add('active');
        }
    }
}