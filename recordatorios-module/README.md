# 📝 MÓDULO DE RECORDATORIOS - SISTEMA JURÍDICO GOB.MX V3

## 📁 Estructura del Módulo

```
recordatorios-module/
├── js/
│   └── recordatorios.js               # Lógica JavaScript del módulo
├── components/
│   ├── toolbar.html                   # Barra de herramientas (búsqueda + crear)
│   ├── modal-create.html              # Modal para crear/editar recordatorio
│   └── card-template.html             # Plantilla de tarjeta de recordatorio
├── index.html                         # Página principal del módulo
└── README.md                          # Esta documentación
```

## 🎯 Características del Módulo

### ✅ **Funcionalidades Implementadas**

1. **Sistema de Recordatorios**
   - Crear, editar y eliminar recordatorios
   - Asignar fecha y hora específicas
   - Prioridades: Urgente y Normal
   - Detalles descriptivos

2. **Gestión de Fechas y Horarios**
   - Calendario integrado para selección de fechas
   - Formato de hora 24 horas
   - Ordenamiento automático por fecha/hora
   - Indicadores de "Hoy" y fechas relativas

3. **Sistema de Búsqueda**
   - Búsqueda en tiempo real por título y detalles
   - Filtrado dinámico sin recargar página

4. **Estadísticas y Resumen**
   - Contador de recordatorios para hoy
   - Total de recordatorios urgentes
   - Conteo total de recordatorios
   - Widget de fecha actual

5. **Interfaz Responsive**
   - Diseño adaptable móvil/desktop
   - Layout de grid responsivo
   - Transiciones y animaciones suaves
   - Cumple con GOB.MX V3

## 🎨 Diseño y Estilos

### **Paleta de Colores GOB.MX V3**
- **Urgente**: `#9D2449` (Guinda) - borde izquierdo
- **Normal**: `#B38E5D` (Oro) - borde izquierdo
- **Iconos**: `#B38E5D` (Oro) - siempre consistente
- **Estados**: Verde para hoy, Gris para fechas futuras

### **Componentes de UI**
- **Cards**: Tarjetas horizontales con iconos y detalles
- **Modals**: Formularios modales para CRUD
- **Toolbar**: Barra de búsqueda y botón de crear
- **Stats Widget**: Panel lateral con estadísticas
- **Date Widget**: Widget de fecha actual
- **Iconografía**: Font Awesome + Heroicons

## 💻 Uso del Módulo

### **1. Inclusión Básica**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Dependencias necesarias -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Noto+Sans:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- CSS del módulo -->
    <link rel="stylesheet" href="../css/output.css">
</head>
<body>
    <!-- Contenido -->

    <!-- Scripts del módulo -->
    <script type="module">
        import { RecordatoriosModule } from './js/recordatorios.js';
        const recordatoriosModule = new RecordatoriosModule();
        recordatoriosModule.init();
    </script>
</body>
</html>
```

### **2. Inicialización JavaScript**

```javascript
// El módulo se inicializa automáticamente
document.addEventListener('DOMContentLoaded', function() {
    // RecordatoriosModule ya está disponible globalmente
    console.log('Módulo de Recordatorios inicializado');
});
```

### **3. Crear Nuevo Recordatorio**

```javascript
// Ejemplo de creación de recordatorio
const nuevoRecordatorio = {
    titulo: 'Reunión de equipo',
    fecha: '2025-11-25',
    hora: '10:00',
    detalles: 'Sala de juntas 3.',
    prioridad: 'urgent' // 'urgent' o 'normal'
};

recordatoriosModule.saveRecordatorio(nuevoRecordatorio);
```

## 🔧 API del Módulo

### **Clase RecordatoriosModule**

#### Métodos Principales:

```javascript
// Gestión de Recordatorios
recordatoriosModule.loadData()              // Cargar datos del localStorage
recordatoriosModule.saveData()              // Guardar datos en localStorage
recordatoriosModule.saveRecordatorio(data)  // Crear/actualizar recordatorio
recordatoriosModule.deleteItem(id)          // Eliminar recordatorio
recordatoriosModule.openModal(id)           // Abrir modal para crear/editar

// Renderizado y Búsqueda
recordatoriosModule.render()                // Renderizar lista de recordatorios
recordatoriosModule.updateStats()           // Actualizar estadísticas
recordatoriosModule.updateWidgetDate()      // Actualizar widget de fecha

// Utilidades
recordatoriosModule.formatDateRelative(date) // Formatear fecha relativa
recordatoriosModule.getSampleData()          // Obtener datos de ejemplo
```

### **Datos y Configuración**

#### Estructura de Recordatorio:
```javascript
{
    id: 1,
    titulo: "Reunión de equipo",
    fecha: "2025-11-25", // Formato YYYY-MM-DD
    hora: "10:00",       // Formato HH:MM (24 horas)
    detalles: "Sala de juntas 3.",
    prioridad: "urgent"  // "urgent" o "normal"
}
```

#### Configuración de Prioridades:
```javascript
const prioridades = {
    urgent: {
        label: 'Urgente',
        borderColor: '#9D2449',
        icon: 'fa-exclamation'
    },
    normal: {
        label: 'Normal',
        borderColor: '#B38E5D',
        icon: 'fa-bell'
    }
};
```

## 📱 Responsive Design

### **Breakpoints**
- **Móvil**: `< 640px`
- **Tablet**: `640px - 768px`
- **Desktop**: `> 768px`

### **Adaptaciones**
- Grid: 1 columna en móvil, 3 en desktop
- Cards: Apilamiento vertical en móvil
- Sidebar: Estadísticas y widget en columna separada
- Toolbar: Elementos en fila flexible

## 🎛️ Configuración Avanzada

### **Personalizar Prioridades**

```javascript
// Agregar nueva prioridad
const nuevaPrioridad = {
    alta: {
        label: 'Alta',
        borderColor: '#13322B',
        icon: 'fa-star',
        bgColor: 'rgba(19, 50, 43, 0.1)'
    }
};
```

### **Configurar Formato de Fecha**

```javascript
// Personalizar formato de fecha relativa
const formatosFecha = {
    hoy: 'Hoy',
    manana: 'Mañana',
    semana: 'Esta semana',
    default: 'dd MMM'
};
```

## 🔌 Integración con Backend

### **Endpoints Sugeridos**

```javascript
// Recordatorios
GET /api/recordatorios
POST /api/recordatorios
PUT /api/recordatorios/{id}
DELETE /api/recordatorios/{id}

// Estadísticas
GET /api/recordatorios/stats
GET /api/recordatorios?fecha={date}
GET /api/recordatorios?prioridad={priority}
```

### **Integración con Fetch API**

```javascript
class RecordatoriosAPI {
    static async obtenerRecordatorios(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const response = await fetch(`/api/recordatorios?${params}`);
        return response.json();
    }

    static async crearRecordatorio(data) {
        const response = await fetch('/api/recordatorios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async actualizarRecordatorio(id, data) {
        const response = await fetch(`/api/recordatorios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async eliminarRecordatorio(id) {
        const response = await fetch(`/api/recordatorios/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
}
```

## 🚀 Deployment

### **Archivos Necesarios**
1. Incluir toda la carpeta `recordatorios-module/`
2. Asegurar dependencias (Tailwind, Font Awesome, fuentes)
3. Configurar rutas relativas correctamente

### **Optimizaciones**
- Minificar JS para producción
- Optimizar carga de componentes HTML
- Implementar lazy loading si es necesario
- Configurar caché para assets estáticos

## 📋 Checklist de Implementación

- [ ] **JavaScript**: Lógica de gestión de recordatorios
- [ ] **Componentes**: HTML para toolbar, modales y tarjetas
- [ ] **Estilos**: CSS para prioridades y responsive
- [ ] **Validaciones**: Formularios de fecha y hora
- [ ] **Responsive**: Diseño adaptable
- [ ] **Accesibilidad**: Navegación por teclado
- [ ] **Performance**: Optimización de carga
- [ ] **Integración**: APIs y backend

## 🤝 Contribución

### **Estructura de Archivos**
- Mantener separación de responsabilidades
- JS en `js/`, componentes en `components/`
- Seguir convenciones de nomenclatura GOB.MX

### **Estándares de Código**
- Usar la guía de estilos del proyecto
- Comentar código complejo
- Mantener consistencia visual
- Probar en diferentes dispositivos

---

**📞 Soporte**  
Para dudas sobre este módulo, consultar la documentación principal del proyecto o contactar al equipo de desarrollo.
