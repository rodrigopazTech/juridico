# Arquitectura del Frontend - Módulo Términos

## Estructura del Proyecto

```
terminos/
├── index.html                  # Punto de entrada principal (Vista)
├── css/
│   └── styles.css              # Estilos específicos (Animaciones, Modales, Scrollbars)
├── js/
│   ├── terminos.js             # Lógica de Negocio (CRUD, Flujos, Validaciones)
│   └── loader.js               # Cargador de componentes asíncronos
└── components/
    ├── modals_terminos.html    # Fragmento HTML con todos los modales del módulo
    └── modals.html             # Modales globales del sistema
```

---

## Tabla de Componentes

| Carpeta | Archivo | Funcionalidad |
|---------|---------|---------------|
| **/** | `index.html` | Punto de entrada principal del módulo. Contiene la estructura HTML de la vista, filtros de búsqueda, tabla de términos y orchestra la carga de componentes mediante JavaScript módulo. |
| **css/** | `styles.css` | Define estilos CSS personalizados para animaciones (@keyframes), comportamiento de scrollbars y estilos específicos de modales que no se pueden lograr con Tailwind CSS únicamente. |
| **js/** | `terminos.js` | **Lógica de negocio principal**. Maneja el ciclo de vida de términos: CRUD completo, workflow de etapas (Proyectista → Revisión → Gerencia → Dirección → Liberado → Presentado → Concluido), semáforos de vencimiento, gestión de acuses, exportación Excel, validación de permisos por rol y sincronización con Agenda General. |
| **js/** | `loader.js` | Sistema de carga asíncrona de componentes. Lee atributos `data-include` del DOM e inyecta fragmentos HTML (Sidebar, Navbar, Modales) dinámicamente antes de ejecutar la lógica de negocio. |
| **components/** | `modals_terminos.html` | Contiene todos los modales específicos del módulo: modal de nuevo/editar término, modal de presentar términos, modal de reasignar, modales globales de confirmación, prompt y alerta. |
| **components/** | `modals.html` | Fragmentos de modales globales del sistema que se comparten entre múltiples módulos (alertas, confirmaciones, prompts). |

---

## Flujo de Datos

```
index.html (Vista)
    ↓
loader.js (Carga componentes)
    ↓
components/ (Sidebar, Navbar, Modales)
    ↓
terminos.js (Lógica de Negocio)
    ↓
localStorage/API (Persistencia)
```

---

## Tecnologías Utilizadas

- **Tailwind CSS** - Framework CSS para diseño responsivo
- **SheetJS (xlsx)** - Generación de reportes Excel
- **Font Awesome 6.4** - Iconografía
- **Google Fonts** - Tipografía: Montserrat (títulos) y Noto Sans (cuerpo)
- **LocalStorage** - Persistencia de datos local

---

## Patrones de Diseño

- **Carga Asíncrona**: Componentes inyectados dinámicamente
- **Patrón Funcional Modular**: Funciones expuestas globalmente para interacción DOM
- **Gestión de Estados**: Workflow definido por `FLUJO_ETAPAS`
- **Semáforo Visual**: Indicadores de vencimiento según días restantes

