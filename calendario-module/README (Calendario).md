# 📅 MÓDULO DE CALENDARIO - SISTEMA JURÍDICO GOB.MX V3

## 📁 Estructura del Módulo

```
calendario-module/
├── js/
│   └── calendario-module.js        # Lógica JavaScript del módulo
├── components/
│   ├── calendar-header.html        # Cabecera con navegación y controles
│   ├── calendar-month-view.html    # Vista mensual del calendario
│   ├── calendar-week-view.html     # Vista semanal del calendario
│   ├── calendar-day-view.html      # Vista diaria del calendario
│   ├── event-detail-modal.html     # Modal para ver detalles de evento
│   └── event-create-modal.html     # Modal para crear/editar eventos
├── index.html                      # Página principal del módulo
└── README.md                       # Esta documentación
```

## 🎯 Características del Módulo

### ✅ **Funcionalidades Implementadas**

1. **Vistas Múltiples del Calendario**
   - **Vista Mensual**: Vista tradicional de calendario con navegación por meses
   - **Vista Semanal**: Vista semanal con horas del día
   - **Vista Diaria**: Vista detallada de un día específico
   - Navegación fluida entre vistas

2. **Gestión Completa de Eventos**
   - Crear nuevos eventos con título, descripción y fecha/hora
   - Editar eventos existentes
   - Eliminar eventos
   - Visualizar detalles completos de eventos

3. **Sistema de Categorías y Colores**
   - Categorías predefinidas: Audiencias, Términos, Recordatorios, Otros
   - Colores distintivos por categoría
   - Gestión visual intuitiva

4. **Navegación y Controles**
   - Navegación por meses/años
   - Botones de hoy, anterior, siguiente
   - Selector de vista (Mes, Semana, Día)
   - Indicadores de fecha actual

5. **Interfaz Responsive**
   - Diseño adaptable móvil/desktop
   - Layout responsivo para diferentes vistas
   - Touch-friendly en dispositivos móviles
   - Cumple con GOB.MX V3

## 🎨 Diseño y Estilos

### **Paleta de Colores GOB.MX V3**
- **Audiencias**: `#9D2449` (Guinda)
- **Términos**: `#B38E5D` (Oro)
- **Recordatorios**: `#545454` (Gris)
- **Otros**: `#13322B` (Verde)
- **Fondos**: Blanco para calendario, Gris claro para headers

### **Componentes de UI**
- **Calendario**: Grid responsivo con celdas de fecha
- **Eventos**: Tarjetas coloreadas por categoría
- **Modales**: Formularios modales para CRUD
- **Navegación**: Controles de fecha y vista
- **Indicadores**: Fecha actual destacada
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
        import { CalendarioModule } from './js/calendario-module.js';
        const calendarioModule = new CalendarioModule();
        calendarioModule.init();
    </script>
</body>
</html>
```

### **2. Inicialización JavaScript**

```javascript
// El módulo se inicializa automáticamente
document.addEventListener('DOMContentLoaded', function() {
    // CalendarioModule ya está disponible globalmente
    console.log('Módulo de Calendario inicializado');
});
```

### **3. Crear Nuevo Evento**

```javascript
// Ejemplo de creación de evento
const nuevoEvento = {
    title: 'Audiencia Programada',
    description: 'Audiencia en Juzgado 1',
    date: '2025-12-01',
    time: '10:00',
    category: 'audiencias',
    duration: 60 // minutos
};

calendarioModule.createEvent(nuevoEvento);
```

## 🔧 API del Módulo

### **Clase CalendarioModule**

#### Métodos Principales:

```javascript
// Inicialización y Renderizado
calendarioModule.init()                    // Inicializar módulo completo
calendarioModule.render()                  // Renderizar vista actual
calendarioModule.switchView(viewType)      // Cambiar vista (month/week/day)

// Gestión de Eventos
calendarioModule.createEvent(eventData)    // Crear nuevo evento
calendarioModule.updateEvent(id, eventData)// Actualizar evento existente
calendarioModule.deleteEvent(id)           // Eliminar evento
calendarioModule.getEventsForDate(date)    // Obtener eventos de una fecha

// Navegación
calendarioModule.navigateMonth(direction)  // Navegar meses (+1/-1)
calendarioModule.goToToday()               // Ir a fecha actual
calendarioModule.goToDate(date)            // Ir a fecha específica

// Utilidades
calendarioModule.formatDate(date)          // Formatear fechas
calendarioModule.getCategoryColor(category)// Obtener color de categoría
calendarioModule.isToday(date)             // Verificar si es hoy
```

### **Datos y Configuración**

#### Estructura de Evento:
```javascript
{
    id: '1',
    title: 'Audiencia Programada',
    description: 'Audiencia en Juzgado 1',
    date: '2025-12-01',
    time: '10:00',
    category: 'audiencias',
    duration: 60,           // en minutos
    created: '2025-11-25T10:00:00Z',
    updated: '2025-11-25T10:00:00Z'
}
```

#### Categorías de Eventos:
```javascript
const categoriasEventos = {
    audiencias: {
        label: 'Audiencias',
        color: '#9D2449',
        bgColor: 'rgba(157, 36, 73, 0.1)',
        icon: 'fa-gavel'
    },
    terminos: {
        label: 'Términos',
        color: '#B38E5D',
        bgColor: 'rgba(179, 142, 93, 0.1)',
        icon: 'fa-clock'
    },
    recordatorios: {
        label: 'Recordatorios',
        color: '#545454',
        bgColor: 'rgba(84, 84, 84, 0.1)',
        icon: 'fa-bell'
    },
    otros: {
        label: 'Otros',
        color: '#13322B',
        bgColor: 'rgba(19, 50, 43, 0.1)',
        icon: 'fa-calendar'
    }
};
```

## 📱 Responsive Design

### **Breakpoints**
- **Móvil**: `< 640px`
- **Tablet**: `640px - 768px`
- **Desktop**: `> 768px`

### **Adaptaciones**
- Vista Mensual: Grid compacto en móvil
- Vista Semanal: Scroll horizontal en móvil
- Vista Diaria: Lista vertical en móvil
- Controles: Stack vertical en móvil
- Eventos: Texto truncado en móvil

## 🎛️ Configuración Avanzada

### **Personalizar Categorías**

```javascript
// Agregar nueva categoría
const nuevaCategoria = {
    reuniones: {
        label: 'Reuniones',
        color: '#6B46C1',
        bgColor: 'rgba(107, 70, 193, 0.1)',
        icon: 'fa-users'
    }
};
```

### **Configurar Vistas**

```javascript
// Configuración de vistas disponibles
const configVistas = {
    month: { enabled: true, default: true },
    week: { enabled: true },
    day: { enabled: true },
    agenda: { enabled: false } // Vista adicional futura
};
```

## 🔌 Integración con Backend

### **Endpoints Sugeridos**

```javascript
// Eventos
GET /api/events
GET /api/events?date={date}
GET /api/events?month={month}&year={year}
POST /api/events
PUT /api/events/{id}
DELETE /api/events/{id}

// Categorías
GET /api/event-categories
POST /api/event-categories
PUT /api/event-categories/{id}
DELETE /api/event-categories/{id}
```

### **Integración con Fetch API**

```javascript
class CalendarioAPI {
    static async obtenerEventos(fecha = null) {
        const params = fecha ? `?date=${fecha}` : '';
        const response = await fetch(`/api/events${params}`);
        return response.json();
    }

    static async crearEvento(eventData) {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        return response.json();
    }

    static async actualizarEvento(id, eventData) {
        const response = await fetch(`/api/events/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        return response.json();
    }

    static async eliminarEvento(id) {
        const response = await fetch(`/api/events/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }
}
```

## 🚀 Deployment

### **Archivos Necesarios**
1. Incluir toda la carpeta `calendario-module/`
2. Asegurar dependencias (Tailwind, Font Awesome, fuentes)
3. Configurar rutas relativas correctamente

### **Optimizaciones**
- Minificar JS para producción
- Optimizar carga de componentes HTML
- Implementar lazy loading para vistas
- Configurar caché para assets estáticos

## 📋 Checklist de Implementación

- [ ] **JavaScript**: Lógica de calendario y gestión de eventos
- [ ] **Componentes**: HTML para vistas y modales
- [ ] **Estilos**: CSS para categorías y responsive
- [ ] **Validaciones**: Formularios de eventos
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
