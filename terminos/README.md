# Documentación del Módulo de Términos

## Estructura del Modulo

El módulo está diseñado bajo una arquitectura modular desacoplada. Los componentes compartidos (Sidebar/Navbar) se inyectan dinámicamente, por lo que la estructura interna del módulo es la siguiente:
```
/terminos/
├── index.html                  # Punto de entrada principal (Vista)
├── css/
│   └── styles.css              # Estilos específicos (Animaciones, Modales, Scrollbars)
├── js/
│   ├── terminos.js             # Lógica de Negocio (CRUD, Flujos, Validaciones)
│   └── loader.js               # Cargador de componentes asíncronos
└── components/
    └── modals_terminos.html    # Fragmento HTML con todos los modales del módulo
```
## Características del Módulo

## Este módulo gestiona el ciclo de vida de los términos legales procesales.

  1. Gestión de Estados (Workflow): Control estricto de etapas: Proyectista → Revisión → Gerencia → Dirección → Liberado → Presentado → Concluido.

  2. Semáforo de Vencimientos: Indicadores visuales automáticos (Rojo/Amarillo/Verde) basados en la fecha actual vs. vencimiento.

  3. Acciones Inteligentes: Menú flotante ([...]) que se reposiciona automáticamente para evitar cortes por desbordamiento (scroll).

  4. Gestión de Evidencia: Carga y validación de acuses (archivos) antes de concluir un término.

  5. Rollback de Estados: Capacidad de "Quitar Acuse" regresando el estatus de Presentado a Liberado en caso de error.

  6. Bloqueo de Edición: Los registros en estado Concluido o Presentado bloquean la edición de datos sensibles, permitiendo solo lectura o descarga de evidencia.

  7. Exportación: Generación de reportes en Excel (.xlsx) mediante la librería SheetJS.

## Diseño y Estilos (Gobierno de México V3)
El diseño sigue estrictamente la Guía Gráfica Base V3, implementada mediante Tailwind CSS.

### Paleta de Colores Oficial

|Variable JS/CSS | Código Hex | Uso Principal|
|-----|-----|------|
| gob-guinda|#9D2449 | "Acciones Primarias, Botones, Títulos" |
| gob-guindaDark | #611232 | Hover de botones primarios |
|gob-oro|#B38E5D | "Bordes decorativos, acentos, iconos secundarios" |
|gob-gris | #545454 | "Texto principal, encabezados de tabla" |
|gob-verde | #13322B |Fondos institucionales (Sidebar) |

### Componentes de UI
  * Tipografía: Montserrat (Títulos/Headings) y Noto Sans (Cuerpo/Lectura).

  * Modales: Ventanas emergentes con backdrop-blur-sm, bordes superiores de color semántico (Oro=Edición, Rojo=Alerta, Verde=Éxito) y scroll interno controlado (max-h-[90vh]).

  * Tablas: Diseño limpio con hover:bg-gray-50 en filas y columna de acciones "sticky" o ajustada con whitespace-nowrap.

## Uso del Módulo
### Inclusión Básica
Para utilizar el módulo, simplemente despliega la carpeta /terminos/ en tu servidor web. El archivo index.html se encarga de orquestar la carga.

### Inicialización JavaScript
El módulo utiliza un patrón de carga asíncrona para asegurar que el DOM (incluidos los modales externos) esté listo antes de ejecutar la lógica.

```javascript
// index.html (Script Module)
import { loadIncludes } from '../js/loader.js';

document.addEventListener("DOMContentLoaded", async function () {
    // 1. Carga componentes HTML (Navbar, Sidebar, Modales)
    await loadIncludes(); 
    
    // 2. Carga e inicia la lógica de negocio
    const script = document.createElement('script');
    script.src = 'js/terminos.js';
    script.onload = () => {
        if (typeof initTerminos === "function") initTerminos();
    };
    document.body.appendChild(script);
});

```
## API del Módulo (Lógica en terminos.js)

El módulo no utiliza clases (POO) sino un patrón funcional modular. Las funciones principales están expuestas globalmente para facilitar la interacción con el DOM.

### Objeto de Configuración
```javascript
const FLUJO_ETAPAS = {
    'Proyectista': { siguiente: 'Revisión', accion: 'enviarRevision' },
    // ... configuración de transiciones
};

```

### Métodos Principales

|Función|Descripción|
|------|-----|
|initTerminos()|"Constructor. Inicializa listeners, carga datos iniciales y configura filtros."|
|loadTerminos()|Renderiza la tabla principal aplicando filtros y lógica de semáforos.|
|setupActionMenuListener()|"Controla el menú flotante inteligente (posición fixed, detección de bordes)."|
|"generarAccionesRapidas(termino, rol)"|Retorna el HTML de los botones disponibles según el estado del término y el rol del usuario.|
|avanzarEtapa(id)|Mueve el término al siguiente estado lógico definido en FLUJO_ETAPAS.|
|regresarEtapa(id)|"Devuelve el término al estado anterior (Rechazo), solicitando motivo mediante Prompt."|
|guardarTermino()|Crea o actualiza un registro en el almacenamiento (LocalStorage/Backend).|

### Estructura de Datos (Modelo Termino)

```json
{
  "id": 1699999999,
  "asuntoId": 101,
  "expediente": "123/2025",
  "fechaIngreso": "2025-11-01",
  "fechaVencimiento": "2025-11-15",
  "estatus": "Proyectista", 
  "acuseDocumento": "archivo.pdf",
  "prioridad": "Alta"
}
```

## Responsive Design
El módulo es 100% Responsivo utilizando las utilidades de Tailwind.

* Breakpoints:

  * sm (640px): Tablets verticales.    
  * md (768px): Tablets horizontales / Laptops pequeñas.
  * lg (1024px): Escritorio.
* Adaptaciones:
  * Filtros: Grid dinámico (grid-cols-1 en móvil → grid-cols-5 en escritorio).
  * Tablas: Contenedor con overflow-x-auto para permitir desplazamiento horizontal en móviles sin romper el layout.
  * Modales: Ancho fluido (w-full) con margen (p-4) en móviles, y ancho máximo (max-w-4xl) en escritorio.
 
## Integración con Backend (Fetch API)
```javascript
// Reemplazo en js/terminos.js

async function loadTerminosFromAPI() {
    try {
        const response = await fetch('/api/v1/terminos');
        TERMINOS = await response.json();
        loadTerminos(); // Renderizar
    } catch (error) {
        console.error("Error de red:", error);
    }
}

async function guardarTerminoBackend(data) {
    await fetch('/api/v1/terminos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    loadTerminosFromAPI();
}
```
## Checklist de Implementación

Antes de desplegar a producción, verifica:

  * [ ] Fuentes: Asegúrate de que las fuentes Montserrat y Noto Sans cargan correctamente (localmente o vía Google Fonts sin errores SSL).
  * [ ] Librerías: Verifica que xlsx.full.min.js y tailwindcss estén accesibles.
  * [ ] Rutas: Confirma que loader.js apunta correctamente a ../components/ (dependiendo de tu servidor web).
  * [ ] Permisos: Configura la constante USER_ROLE en terminos.js según el sistema de autenticación real.

## Estándares de Código y Contribución
* CSS: No escribir CSS personalizado a menos que sea para animaciones (@keyframes) o comportamientos del navegador (scrollbar). Usar siempre clases de utilidad de Tailwind.

* JS: Usar const y let. Evitar var.

* Modales: No usar alert() ni confirm() nativos. Usar siempre mostrarAlertaTermino(), mostrarConfirmacion() o mostrarPrompt().

* Nomenclatura:
    * Variables JS: camelCase (ej. fechaVencimiento).
    * IDs HTML: kebab-case (ej. modal-nuevo-termino).


