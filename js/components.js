// js/components.js - VERSIÓN CORREGIDA Y FUNCIONAL
class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.sidebarLoaded = false;
        this.init();
    }

    async init() {
        console.log('🎯 ComponentLoader iniciando...');
        await this.loadComponent('sidebar', 'components/sidebar.html');
        this.renderComponents();
        await this.initializeSidebar();
        this.notifyDashboardReady();
    }

    async loadComponent(name, path) {
        try {
            console.log(`📁 Cargando componente: ${path}`);
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Error loading ${path}`);
            
            const html = await response.text();
            this.components.set(name, html);
            console.log(`✅ Componente ${name} cargado`);
        } catch (error) {
            console.error(`❌ Error cargando componente ${name}:`, error);
            this.components.set(name, this.getFallbackComponent(name));
        }
    }

    renderComponents() {
        const sidebarContainer = document.getElementById('sidebar-container');
        if (sidebarContainer && this.components.has('sidebar')) {
            sidebarContainer.innerHTML = this.components.get('sidebar');
            console.log('✅ Sidebar renderizado en el DOM');
        } else {
            console.error('❌ No se pudo renderizar el sidebar');
        }
    }

    async initializeSidebar() {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('🔄 Inicializando sidebar...');
                this.setActivePage();
                this.initDocumentManager();
                this.setupSidebarEvents();
                this.sidebarLoaded = true;
                console.log('✅ Sidebar completamente inicializado');
                resolve();
            }, 100);
        });
    }

    notifyDashboardReady() {
        console.log('🚀 Sidebar listo, notificando dashboard...');
        
        // Crear evento personalizado
        const event = new CustomEvent('sidebarReady', {
            detail: { timestamp: new Date() }
        });
        document.dispatchEvent(event);
        
        // Establecer variable global
        window.sidebarReady = true;
    }

    setActivePage() {
        const currentPage = this.getCurrentPage();
        console.log('📍 Página actual detectada:', currentPage);
        
        const navItems = document.querySelectorAll('.nav-item');
        let activeFound = false;
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const page = item.getAttribute('data-page');
            const href = item.getAttribute('href');
            
            if (page === currentPage) {
                item.classList.add('active');
                console.log('✅ Item activado por data-page:', page);
                activeFound = true;
            }
            else if (href && this.isCurrentPage(href)) {
                item.classList.add('active');
                console.log('✅ Item activado por href:', href);
                activeFound = true;
            }
        });

        if (!activeFound) {
            console.warn('⚠️ No se encontró item activo para la página:', currentPage);
        }
    }

    isCurrentPage(href) {
        const currentPath = window.location.pathname;
        const hrefPath = href;
        
        // Casos especiales para index.html
        if (currentPath.endsWith('/') && hrefPath === 'index.html') {
            return true;
        }
        
        // Comparación directa
        return currentPath.endsWith(hrefPath);
    }

    getCurrentPage() {
        const path = window.location.pathname;
        let page = path.split('/').pop() || 'dashboard.html';
        
        console.log('📄 Página extraída:', page);
        
        // Manejar caso de raíz
        if (page === '' || page === '/' || page === 'index.html') {
            return 'dashboard';
        }
        
        // Mapear nombres de archivo a identificadores de página
        const pageMap = {
            'dashboard.html': 'dashboard',
            'audiencias.html': 'audiencias', 
            'terminos.html': 'terminos',
            'asuntos.html': 'asuntos',
            'agenda-general.html': 'agenda-general',
            'index.html': 'dashboard'
        };
        
        const mappedPage = pageMap[page];
        console.log('🗺️ Página mapeada:', mappedPage);
        
        return mappedPage || 'dashboard';
    }

    initDocumentManager() {
        console.log('📂 Inicializando gestor de documentos...');
        
        // Toggle para carpetas
        document.querySelectorAll('.sidebar-folder').forEach(folder => {
            folder.addEventListener('click', function() {
                const contentId = this.id + '-content';
                const content = document.getElementById(contentId);
                if (content) {
                    content.classList.toggle('active');
                    console.log('📁 Carpeta toggle:', this.id);
                }
            });
        });
        
        // Botones para agregar elementos
        const addExpediente = document.getElementById('add-expediente');
        const addDocumento = document.getElementById('add-documento');
        
        if (addExpediente) {
            addExpediente.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('➕ Botón agregar expediente clickeado');
                ComponentLoader.showModal('Nuevo Expediente', 'Funcionalidad para agregar expediente');
            });
        }
        
        if (addDocumento) {
            addDocumento.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('➕ Botón agregar documento clickeado');
                ComponentLoader.showModal('Nuevo Documento', 'Funcionalidad para agregar documento');
            });
        }
    }

    setupSidebarEvents() {
        console.log('🔗 Configurando eventos del sidebar...');
        
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                console.log('🔘 Navegando a:', item.getAttribute('href'));
                const sidebar = document.querySelector('.sidebar');
                sidebar.classList.add('loading');
                
                setTimeout(() => {
                    sidebar.classList.remove('loading');
                }, 500);
            });
        });
    }

    static showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'component-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${content}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary close-modal">Aceptar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getFallbackComponent(name) {
        const fallbacks = {
            'sidebar': `
                <div class="sidebar">
                    <div class="sidebar-header">
                        <i class="fas fa-gavel fa-2x"></i>
                        <h2>Agenda Legal</h2>
                    </div>
                    <div class="sidebar-nav">
                        <a href="dashboard.html" class="nav-item">
                            <i class="fas fa-chart-bar"></i>
                            <span>Dashboard</span>
                        </a>
                        <a href="audiencias.html" class="nav-item">
                            <i class="fas fa-gavel"></i>
                            <span>Audiencias</span>
                        </a>
                        <a href="terminos.html" class="nav-item">
                            <i class="fas fa-clock"></i>
                            <span>Términos</span>
                        </a>
                        <a href="asuntos.html" class="nav-item">
                            <i class="fas fa-folder-open"></i>
                            <span>Asuntos</span>
                        </a>
                        <a href="agenda-general.html" class="nav-item">
                            <i class="fas fa-calendar-alt"></i>
                            <span>Agenda General</span>
                        </a>
                    </div>
                </div>
            `
        };
        return fallbacks[name] || '<div>Componente no disponible</div>';
    }
}

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Iniciando ComponentLoader...');
    window.componentLoader = new ComponentLoader();
});