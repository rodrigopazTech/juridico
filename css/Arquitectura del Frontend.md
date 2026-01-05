# Arquitectura del Frontend - Estilos CSS

## Estructura del Proyecto

```
css/
├── input.css          # Código fuente con directivas Tailwind y estilos personalizados
└── output.css         # Archivo compilado generado por Tailwind CSS CLI
```

---

## Tabla de Componentes

| Archivo | Tipo | Funcionalidad |
|---------|------|---------------|
| **input.css** | Source | **Archivo fuente principal**. Importa Tailwind mediante directivas `@tailwind base/components/utilities`. Define clases personalizadas con `@layer components` y `@layer utilities` para estilos reutilizables en todo el sistema. |
| **output.css** | Build | **Archivo compilado (~3073 líneas)**. Generado automáticamente por el CLI de Tailwind CSS. Contiene todos los estilos resueltos, utility classes expandidas y prefijos CSS estándar. Este es el archivo que se vincula en el HTML. |

---

## Arquitectura de Estilos

```
input.css (Tailwind Source)
    │
    ├── @tailwind base          # Estilos base (reset, tipografía)
    ├── @tailwind components    # Componentes personalizados
    │   ├── UI General          # Cards, Checkboxes, Modales
    │   ├── Sistema de Colores  # Semántico por módulo
    │   ├── Notificaciones      # Tarjetas horizontales
    │   └── Recordatorios       # Estilos específicos
    │
    ├── @tailwind utilities     # Utilidades adicionales
    │   └── Animaciones (@keyframes)
    │
    └── Custom CSS              # Scrollbars, Fuentes
            │
            ↓
    Tailwind CLI
            │
            ↓
    output.css (Compiled)
```

---

## Sistema de Colores Semánticos

| Módulo | Color | Clase CSS | Uso Principal |
|--------|-------|-----------|---------------|
| **Audiencias** | Azul | `.type-audiencia` | Badges, bordes y fondos relacionados con audiencias |
| **Términos** | Verde | `.type-termino` | Badges, bordes y fondos relacionados con términos |
| **Recordatorios** | Ámbar | `.type-recordatorio` | Badges, bordes y fondos de recordatorios |
| **Urgente** | Guinda | `.reminder-urgent` | Prioridad alta en recordatorios |

---

## Componentes UI Definidos

### Tarjetas
| Clase | Descripción |
|-------|-------------|
| `.card-asunto` | Tarjeta de expediente con hover effects y borde guinda |
| `.horizontal-notification` | Tarjeta horizontal para notificaciones |
| `.reminder-card` | Tarjeta base para recordatorios |

### Formularios
| Clase | Descripción |
|-------|-------------|
| `.checkbox-container` | Contenedor de checkboxes con scroll |
| `.readonly-field` | Campos de solo lectura con estilo deshabilitado |

### Utilidades
| Clase | Descripción |
|-------|-------------|
| `.action-menu` | Transiciones para menús desplegables |
| `.modal` / `.modal.flex` | Control de visibilidad de modales |

---

## Tipografía

| Uso | Fuente | Familia |
|-----|--------|---------|
| **Títulos** | Montserrat | `.font-headings` |
| **Cuerpo** | Noto Sans | `body` default |

---

## Personalización del Scrollbar

```css
::-webkit-scrollbar      /* Barra completa */
::-webkit-scrollbar-track /* Fondo de la barra */
::-webkit-scrollbar-thumb /* Mango desplazable */
::-webkit-scrollbar-thumb:hover /* Hover del mango */
```

---

## Tecnologías y Herramientas

- **Tailwind CSS v3.4.17** - Framework CSS utility-first
- **PostCSS** - Procesador de estilos (implícito en Tailwind)
- **Google Fonts** - Montserrat y Noto Sans

---

## Flujo de Trabajo

1. **Desarrollo**: Editar `input.css` con directivas Tailwind y clases personalizadas
2. **Compilación**: Ejecutar `npx tailwindcss -i ./input.css -o ./output.css`
3. **Producción**: Vincular `output.css` en el HTML

---

## Patrones de Diseño CSS

- **Utility-First**: Utilizar clases utilitarias de Tailwind cuando sea posible
- **Composición**: Combinar utilities con clases personalizadas
- **Responsive**: Classes con prefijos `sm:`, `md:`, `lg:`, `xl:`
- **Estado**: Classes con prefijos `hover:`, `focus:`, `active:`
- **Theming**: Custom colors definidos en `tailwind.config.js` (gob-guinda, gob-oro)

