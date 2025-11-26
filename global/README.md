# Global Components - Sistema Legal

Esta carpeta contiene los componentes compartidos entre todos los módulos del sistema.

## Estructura

```
global/
├── components/
│   ├── sidebar.html     # Sidebar global con navegación completa
│   └── navbar.html      # Navbar global con título dinámico
└── js/
    ├── loader.js        # Utilidades para cargar componentes e inicializar navegación
    └── navigation.js    # Funciones de navegación (deprecado, usar loader.js)
```

## Componentes

### Sidebar (`components/sidebar.html`)

Barra lateral de navegación global con las siguientes secciones:

- **Principal**: Dashboard
- **Gestión Jurídica**: Expedientes, Audiencias, Términos
- **Organización**: Calendario, Agenda General, Recordatorios, Notificaciones
- **Admin**: Usuarios

**Características:**
- Diseño responsive con toggle para mobile
- Highlighting automático de página activa mediante `data-page` attribute
- Iconos Font Awesome para cada sección
- Estilo gubernamental (gob-verde, gob-oro)

### Navbar (`components/navbar.html`)

Barra superior con:
- Título dinámico con icono configurable
- Toggle de sidebar para mobile
- Información de usuario

**IDs importantes:**
- `navbar-icon`: Elemento del icono (clase Font Awesome)
- `navbar-text`: Texto del título
- `navbar-title`: Contenedor principal del título

## Utilidades JavaScript

### `loader.js`

#### `loadIncludes()`
Carga todos los elementos con atributo `data-include`.

```javascript
import { loadIncludes } from '../global/js/loader.js';
await loadIncludes();
```

#### `initSidebar(currentPage)`
Marca el item activo del sidebar.

**Parámetros:**
- `currentPage` (string): Identificador de la página (`data-page` del item)

**Valores válidos:**
- `'dashboard'` - Dashboard Analítico
- `'expedientes'` - Gestión de Expedientes
- `'audiencias'` - Audiencias
- `'terminos'` - Términos
- `'calendario'` - Calendario
- `'agenda-general'` - Agenda General
- `'panel-recordatorios'` - Recordatorios
- `'notificaciones'` - Notificaciones
- `'usuarios'` - Gestión de Usuarios

```javascript
import { initSidebar } from '../global/js/loader.js';
initSidebar('dashboard');
```

#### `setNavbarTitle(icon, title)`
Actualiza el título del navbar dinámicamente.

**Parámetros:**
- `icon` (string): Clase del icono Font Awesome (ej: `'fa-chart-line'`)
- `title` (string): Texto del título

```javascript
import { setNavbarTitle } from '../global/js/loader.js';
setNavbarTitle('fa-chart-line', 'Dashboard Analítico');
```

## Uso en Módulos

### Estructura HTML

```html
<body class="bg-gray-50">
  <!-- Sidebar -->
  <div data-include="../global/components/sidebar.html"></div>

  <!-- Main Content Wrapper -->
  <div class="p-4 sm:ml-64">
    <!-- Navbar -->
    <div data-include="../global/components/navbar.html"></div>
    
    <!-- Tu contenido aquí -->
  </div>
  
  <script type="module">
    import { loadIncludes, initSidebar, setNavbarTitle } from '../global/js/loader.js';
    import { TuModulo } from './js/tu-modulo.js';

    document.addEventListener('DOMContentLoaded', async () => {
      // 1. Cargar componentes
      await loadIncludes();
      
      // 2. Esperar a que el DOM se renderice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 3. Inicializar navegación
      initSidebar('tu-pagina');
      setNavbarTitle('fa-tu-icono', 'Tu Título');
      
      // 4. Inicializar tu módulo
      const modulo = new TuModulo();
      modulo.init();
    });
  </script>
</body>
```

## Módulos Actualizados

Los siguientes módulos ya utilizan los componentes globales:

- ✅ **dashboard-module**: Dashboard Analítico
- ✅ **expediente-module**: Gestión de Expedientes
- ✅ **usuario-module**: Gestión de Usuarios
- ✅ **calendario-module**: Calendario de Eventos

## Notas Importantes

1. **Rutas relativas**: Todos los módulos deben usar `../global/` para acceder a componentes globales
2. **Orden de carga**: Siempre cargar componentes antes de inicializar navegación
3. **Timing**: Esperar 100ms después de `loadIncludes()` para asegurar renderizado del DOM
4. **data-page**: Cada link del sidebar tiene un atributo `data-page` que debe coincidir con el parámetro de `initSidebar()`

## Mantenimiento

Para agregar una nueva página al sidebar:

1. Editar `global/components/sidebar.html`
2. Agregar un nuevo `<li>` con el link y `data-page` correspondiente
3. Actualizar este README con el nuevo valor de `data-page`

Para cambiar el diseño del navbar:

1. Editar `global/components/navbar.html`
2. Mantener los IDs: `navbar-icon`, `navbar-text`, `navbar-title`
