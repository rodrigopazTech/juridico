# 🎨 GUÍA DE ESTILOS - SISTEMA JURÍDICO GOB.MX V3

> **Documento Maestro de Diseño | Versión 1.0 | Noviembre 2025**  
> Este documento define los estándares visuales y de UX para todo el sistema jurídico.  
> **OBLIGATORIO**: Leer antes de desarrollar cualquier interfaz.

---

## 📋 ÍNDICE
1. [Cumplimiento Normativo](#cumplimiento-normativo)
2. [Paleta de Colores Oficial](#paleta-de-colores-oficial)
3. [Tipografía](#tipografía)
4. [Componentes Base](#componentes-base)
5. [Layout y Estructura](#layout-y-estructura)
6. [Estados y Feedback](#estados-y-feedback)
7. [Iconografía](#iconografía)
8. [Responsive Design](#responsive-design)
9. [Ejemplos de Referencia](#ejemplos-de-referencia)

---

## 🏛️ CUMPLIMIENTO NORMATIVO

### **Normativa Aplicable:**
- **Guía Oficial**: [GOB.MX Identidad Gráfica V3](https://www.gob.mx/guias/grafica/v3/)
- **Accesibilidad**: WCAG 2.1 AA mínimo
- **Compatibilidad**: Navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+)

### **Principios de Diseño:**
1. **Institucional**: Respetar la identidad visual del gobierno mexicano
2. **Funcional**: Priorizar la usabilidad sobre la decoración
3. **Accesible**: Cumplir estándares de accesibilidad web
4. **Consistente**: Mantener patrones uniformes en todo el sistema

---

## 🎨 PALETA DE COLORES OFICIAL

### **Colores Primarios (Uso obligatorio)**

```css
/* CONFIGURACIÓN TAILWIND CSS */
gob: {
    guinda: '#9D2449',        // Color Principal - Botones primarios, enlaces importantes
    guindaDark: '#611232',    // Hover/Active del color principal
    oro: '#B38E5D',           // Color Secundario - Acentos, badges importantes
    oroLight: '#DDC9A3',      // Fondos suaves, badges secundarios
    gris: '#545454',          // Texto principal/títulos
    plata: '#98989A',         // Texto secundario/subtítulos
    verde: '#13322B',         // Fondo institucional (Sidebar)
    verdeDark: '#0C231E',     // Hover sidebar/navegación
    fondo: '#F5F5F5'          // Fondo general de páginas
}
```

### **Colores de Sistema (Estados)**

```css
/* Estados de elementos */
success: {
    50: '#F0FDF4',   // Fondo badges éxito
    700: '#15803D',  // Texto badges éxito
    600: '#16A34A'   // Indicador punto verde
}

warning: {
    50: '#FFFBEB',   // Fondo badges advertencia
    700: '#B45309',  // Texto badges advertencia
    600: '#D97706'   // Indicador punto naranja
}

error: {
    50: '#FEF2F2',   // Fondo badges error
    700: '#B91C1C',  // Texto badges error
    600: '#DC2626'   // Indicador punto rojo
}

gray: {
    100: '#F3F4F6',  // Fondos de tabla headers
    200: '#E5E7EB',  // Bordes y separadores
    300: '#D1D5DB',  // Bordes de inputs
    400: '#9CA3AF',  // Iconos inactivos
    500: '#6B7280'   // Texto placeholder
}
```

### **Uso de Colores por Contexto**

| Elemento | Color Principal | Color Hover | Notas |
|----------|----------------|-------------|-------|
| **Botones Primarios** | `bg-gob-guinda` | `hover:bg-gob-guindaDark` | Acciones principales |
| **Botones Secundarios** | `bg-gob-oro` | `hover:bg-gob-oro/90` | Acciones secundarias |
| **Enlaces** | `text-gob-guinda` | `hover:text-gob-guindaDark` | Links y navegación |
| **Sidebar** | `bg-gob-verde` | `hover:bg-gob-verdeDark` | Navegación principal |
| **Títulos H1-H3** | `text-gob-gris` | - | Jerarquía visual |
| **Texto Cuerpo** | `text-gob-gris` | - | Lectura principal |
| **Texto Secundario** | `text-gob-plata` | - | Metadata, descripciones |

---

## ✍️ TIPOGRAFÍA

### **Fuentes Oficiales**
```html
<!-- Google Fonts (OBLIGATORIO incluir) -->
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Noto+Sans:wght@400;600&display=swap" rel="stylesheet">
```

### **Jerarquía Tipográfica**

```css
/* Configuración Tailwind */
fontFamily: {
    'sans': ['"Noto Sans"', 'sans-serif'],      // Texto general
    'headings': ['"Montserrat"', 'sans-serif']   // Títulos y elementos destacados
}
```

### **Escala de Títulos**

| Nivel | Clase CSS | Uso | Ejemplo |
|-------|-----------|-----|---------|
| **H1** | `text-3xl font-bold font-headings text-gob-gris` | Títulos principales de página | "Directorio de Usuarios" |
| **H2** | `text-2xl font-semibold font-headings text-gob-gris` | Títulos de sección | "Información Personal" |
| **H3** | `text-xl font-medium font-headings text-gob-gris` | Subsecciones | "Datos de Contacto" |
| **H4** | `text-lg font-medium font-headings text-gob-gris` | Elementos de card/modal | "Detalles del Expediente" |

### **Texto de Contenido**

| Tipo | Clase CSS | Uso |
|------|-----------|-----|
| **Cuerpo Normal** | `text-sm text-gob-gris` | Texto principal |
| **Cuerpo Pequeño** | `text-xs text-gob-plata` | Metadata, fechas |
| **Texto Destacado** | `text-sm font-bold text-gob-gris` | Nombres, datos importantes |
| **Enlaces** | `text-gob-guinda hover:text-gob-guindaDark font-medium` | Links clickeables |

---

## 🧱 COMPONENTES BASE

### **1. Botones**

```html
<!-- Botón Primario -->
<button class="flex items-center justify-center text-white bg-gob-guinda hover:bg-gob-guindaDark focus:ring-4 focus:ring-gob-guinda/30 font-bold rounded text-sm px-5 py-2.5 shadow-sm transition-all">
    <svg class="h-4 w-4 mr-2"><!-- icono --></svg>
    Crear Usuario
</button>

<!-- Botón Secundario -->
<button class="flex items-center justify-center py-2.5 px-4 text-sm font-medium text-gob-gris bg-white rounded border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gob-oro">
    <svg class="w-4 h-4 mr-2"><!-- icono --></svg>
    Filtros
</button>
```

### **2. Badges de Estado**

```html
<!-- Estado Activo -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
    <span class="w-1.5 h-1.5 rounded-full bg-green-600"></span>
    Activo
</span>

<!-- Estado Inactivo -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
    <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
    Inactivo
</span>

<!-- Badge de Rol/Nivel -->
<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gob-guinda/10 text-gob-guinda border border-gob-guinda/20">
    Nivel A
</span>
```

### **3. Inputs y Formularios**

```html
<!-- Input con Icono -->
<div class="relative">
    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <svg class="w-4 h-4 text-gray-400"><!-- icono --></svg>
    </div>
    <input type="text" class="bg-white border border-gray-300 text-gob-gris text-sm rounded focus:ring-gob-oro focus:border-gob-oro block w-full ps-10 p-2.5" placeholder="Buscar...">
</div>
```

### **4. Tablas**

```html
<!-- Header de Tabla -->
<thead class="text-xs text-gob-gris uppercase bg-gray-100 border-b border-gray-200 font-headings">
    <tr>
        <th scope="col" class="px-6 py-3 font-bold">Usuario</th>
    </tr>
</thead>

<!-- Fila de Tabla -->
<tr class="bg-white hover:bg-gray-50 transition-colors">
    <td class="px-6 py-4 whitespace-nowrap">
        <!-- contenido -->
    </td>
</tr>
```

### **5. Cards y Contenedores**

```html
<!-- Card Principal -->
<div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
    <!-- Header del card -->
    <div class="bg-gray-50 p-4 border-b border-gray-200">
        <!-- controles -->
    </div>
    <!-- Contenido -->
    <div class="p-6">
        <!-- contenido principal -->
    </div>
</div>
```

---

## 🏗️ LAYOUT Y ESTRUCTURA

### **Estructura Base de Página**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Meta tags GOB.MX -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Título] - GOB.MX</title>
    
    <!-- Fuentes oficiales -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Noto+Sans:wght@400;600&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Flowbite -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.0/flowbite.min.css" rel="stylesheet" />
</head>
<body class="font-sans text-gob-gris antialiased" style="background-color: #F5F5F5;">
    <!-- Sidebar -->
    <aside id="logo-sidebar" class="fixed top-0 left-0 z-40 w-64 h-screen bg-gob-verde">
        <!-- contenido sidebar -->
    </aside>
    
    <!-- Contenido Principal -->
    <div class="p-4 sm:ml-64">
        <!-- Navbar -->
        <nav class="w-full bg-white border-b border-gray-200 sticky top-0 z-30 mb-8 rounded-b-lg shadow-sm">
            <!-- breadcrumbs y controles -->
        </nav>
        
        <!-- Header de Página -->
        <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h1 class="text-3xl font-bold text-gob-gris font-headings tracking-tight">[Título Principal]</h1>
                <p class="text-gray-500 text-sm mt-1 border-l-4 border-gob-oro pl-2">[Descripción]</p>
            </div>
            <!-- Botones de acción -->
        </div>
        
        <!-- Contenido -->
        <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
            <!-- contenido principal -->
        </div>
    </div>
</body>
</html>
```

### **Sidebar Institucional**

- **Fondo**: `bg-gob-verde` (#13322B)
- **Logo**: Logo oficial GOB.MX (blanco invertido)
- **Menús**: Agrupados por categorías con headers
- **Item Activo**: `bg-white/10 border-l-4 border-gob-oro`
- **Hover**: `hover:bg-gob-verdeDark`

### **Navbar Superior**

- **Fondo**: `bg-white`
- **Breadcrumbs**: Separados con flechas, último elemento en `text-gob-guinda`
- **Acciones**: Notificaciones, menú hamburguesa (móvil)

---

## 🎭 ESTADOS Y FEEDBACK

### **Estados de Elementos Interactivos**

| Estado | Selector CSS | Descripción |
|--------|-------------|-------------|
| **Default** | `.elemento` | Estado normal |
| **Hover** | `.elemento:hover` | Mouse sobre elemento |
| **Focus** | `.elemento:focus` | Elemento seleccionado (teclado) |
| **Active** | `.elemento:active` | Elemento siendo clickeado |
| **Disabled** | `.elemento:disabled` | Elemento deshabilitado |

### **Transiciones Estándar**

```css
/* Transición por defecto */
.transition-standard {
    transition: all 0.2s ease-in-out;
}

/* Transición de colores */
.transition-colors {
    transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}
```

---

## 🎯 ICONOGRAFÍA

### **Biblioteca de Iconos**
- **Primaria**: Heroicons (https://heroicons.com/)
- **Estilo**: Outline (líneas) para la mayoría
- **Tamaño estándar**: `w-5 h-5` (20px)
- **Color**: `text-gray-400` por defecto, `text-gob-oro` en hover

### **Iconos Frecuentes**

| Acción | Icono | Contexto |
|--------|-------|----------|
| **Crear/Agregar** | Plus | Botones de alta |
| **Editar** | Pencil | Botones de edición |
| **Eliminar** | Trash | Botones de eliminación |
| **Buscar** | Search | Inputs de búsqueda |
| **Filtrar** | Filter | Controles de filtro |
| **Usuario** | User | Perfiles, autenticación |
| **Configuración** | Cog | Ajustes |
| **Notificación** | Bell | Alertas |

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints Tailwind**

```css
sm: '640px',   // Tablet pequeña
md: '768px',   // Tablet
lg: '1024px',  // Desktop
xl: '1280px',  // Desktop grande
2xl: '1536px'  // Desktop extra grande
```

### **Comportamiento Responsive**

| Componente | Móvil (<640px) | Tablet (640px+) | Desktop (1024px+) |
|------------|----------------|-----------------|-------------------|
| **Sidebar** | Oculto (hamburger) | Fijo colapsable | Fijo expandido |
| **Tablas** | Scroll horizontal | Responsive | Completas |
| **Cards** | 1 columna | 2 columnas | 3+ columnas |
| **Botones** | Ancho completo | Tamaño normal | Tamaño normal |

---

## 💡 EJEMPLOS DE REFERENCIA

### **Archivos de Referencia Visual**
- **Archivo maestro**: `/home/rodrigo/juridico/a.html`
- **Estructura**: `/home/rodrigo/juridico/estructura.txt`

### **URLs de Referencia**
- **Guía oficial**: https://www.gob.mx/guias/grafica/v3/
- **Ejemplos GOB.MX**: https://www.gob.mx/

---

## ✅ CHECKLIST DE CALIDAD

Antes de considerar terminado cualquier componente, verificar:

- [ ] **Colores**: Usa únicamente la paleta definida
- [ ] **Tipografía**: Montserrat para títulos, Noto Sans para texto
- [ ] **Responsivo**: Funciona en móvil, tablet y desktop
- [ ] **Accesibilidad**: Contraste adecuado, navegable por teclado
- [ ] **Consistencia**: Sigue los patrones establecidos
- [ ] **Performance**: Cargas rápidas, transiciones suaves
- [ ] **Institucional**: Respeta la identidad visual GOB.MX

---

## 🔄 CONTROL DE VERSIONES

| Versión | Fecha | Cambios |
|---------|-------|---------|
| **1.0** | Nov 2025 | Versión inicial basada en GOB.MX V3 |

---

**📞 CONTACTO**  
Para dudas sobre esta guía, contactar al equipo de desarrollo principal.

**⚠️ IMPORTANTE**  
Esta guía debe ser consultada antes de crear cualquier interfaz. El cumplimiento de estos estándares es **obligatorio** para mantener la consistencia visual y la identidad institucional del sistema.