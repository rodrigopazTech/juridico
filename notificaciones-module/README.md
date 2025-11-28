# 📋 MÓDULO DE NOTIFICACIONES - SISTEMA JURÍDICO GOB.MX V3

## 📁 Estructura del Módulo

```
notificaciones-module/
├── css/
│   └── notificaciones.css          # Estilos específicos del módulo
├── js/
│   └── notificaciones.js           # Lógica JavaScript del módulo
├── components/
│   ├── toolbar.html                # Barra de herramientas (búsqueda + filtros)
│   ├── section-header.html         # Encabezado de sección reutilizable
│   ├── notification-horizontal.html # Tarjeta de notificación horizontal
│   └── empty-state.html            # Estado vacío
├── data/
│   └── notifications-data.js       # Datos de ejemplo y configuración
├── index.html                      # Página principal del módulo
└── README.md                       # Esta documentación
```

## 🎯 Características del Módulo

### ✅ **Funcionalidades Implementadas**

1. **Sistema de Filtros**
   - Todas las notificaciones
   - Por tipo: Audiencias, Términos, Recordatorios
   - Búsqueda en tiempo real

2. **Tipos de Notificaciones**
   - **Audiencias**: Alertas sobre audiencias programadas
   - **Términos**: Recordatorios de plazos y vencimientos
   - **Recordatorios**: Notificaciones personales
   - **Asuntos**: Alertas sobre expedientes

3. **Gestión Completa**
   - Crear nuevas notificaciones
   - Marcar como leídas
   - Eliminar notificaciones
   - Agrupar por fecha (Hoy, Esta semana, etc.)

4. **Interfaz Responsive**
   - Diseño adaptable móvil/desktop
   - Transiciones y animaciones suaves
   - Cumple con GOB.MX V3

## 🎨 Diseño y Estilos

### **Paleta de Colores GOB.MX V3**
- **Audiencias**: `#9D2449` (Guinda)
- **Términos**: `#B38E5D` (Oro)
- **Recordatorios**: `#545454` (Gris)
- **Asuntos**: `#13322B` (Verde)

### **Componentes de UI**
- **Badges**: Indicadores de tipo y prioridad
- **Cards**: Tarjetas horizontales y verticales
- **Iconografía**: Font Awesome + Heroicons
- **Animaciones**: Transiciones CSS suaves

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
    <link rel="stylesheet" href="./notificaciones-module/css/notificaciones.css">
</head>
<body>
    <!-- Contenido -->
    
    <!-- Scripts del módulo -->
    <script src="./notificaciones-module/data/notifications-data.js"></script>
    <script src="./notificaciones-module/js/notificaciones.js"></script>
</body>
</html>
```

### **2. Inicialización JavaScript**

```javascript
// El módulo se inicializa automáticamente
document.addEventListener('DOMContentLoaded', function() {
    // notificacionesModule ya está disponible globalmente
    console.log(notificacionesModule.getStats());
});
```

### **3. Crear Nueva Notificación**

```javascript
// Ejemplo de creación de notificación
const nuevaNotificacion = {
    type: 'audiencia',
    title: 'Nueva Audiencia Programada',
    message: 'Se ha programado una audiencia para mañana',
    date: new Date(),
    priority: 'alta'
};

notificacionesModule.createNotification(nuevaNotificacion);
```

## 🔧 API del Módulo

### **Clase NotificacionesModule**

#### Métodos Principales:

```javascript
// Crear notificación
notificacionesModule.createNotification(data)

// Eliminar notificación
notificacionesModule.deleteNotification(button)

// Marcar como leída
notificacionesModule.markAsRead(notificationId)

// Obtener estadísticas
notificacionesModule.getStats()

// Manejar filtros
notificacionesModule.handleFilterClick(event)

// Buscar notificaciones
notificacionesModule.handleSearch(event)
```

### **Datos y Configuración**

#### notificacionesData:
- `tipos`: Configuración de tipos de notificaciones
- `prioridades`: Niveles de prioridad
- `notificaciones`: Array de notificaciones
- `secciones`: Configuración de secciones

#### NotificacionesUtils:
- `obtenerPorTipo(tipo)`: Filtrar por tipo
- `obtenerNoLeidas()`: Obtener no leídas
- `agruparPorFecha()`: Agrupar por fecha
- `obtenerEstadisticas()`: Estadísticas generales

## 📱 Responsive Design

### **Breakpoints**
- **Móvil**: `< 640px`
- **Tablet**: `640px - 768px`
- **Desktop**: `> 768px`

### **Adaptaciones**
- Grid de notificaciones: 1 columna en móvil
- Filtros: Stack vertical en móvil
- Detalles: Columna única en móvil
- Sidebar: Colapsable en móvil

## 🎛️ Configuración Avanzada

### **Personalizar Tipos de Notificación**

```javascript
// Agregar nuevo tipo
notificacionesData.tipos.custom = {
    label: 'Personalizada',
    icon: 'fa-star',
    color: '#purple',
    bgColor: 'rgba(128, 0, 128, 0.1)',
    borderColor: '#purple'
};
```

### **Configurar Prioridades**

```javascript
// Agregar nueva prioridad
notificacionesData.prioridades.urgente = {
    label: 'Urgente',
    color: '#ff0000',
    bgColor: 'rgba(255, 0, 0, 0.1)'
};
```

## 🔌 Integración con Backend

### **Endpoints Sugeridos**

```javascript
// Obtener notificaciones
GET /api/notifications
GET /api/notifications?type=audiencia
GET /api/notifications?unread=true

// Crear notificación
POST /api/notifications
{
    "type": "audiencia",
    "title": "Nueva Audiencia",
    "message": "Descripción...",
    "priority": "alta"
}

// Marcar como leída
PATCH /api/notifications/{id}
{
    "read": true
}

// Eliminar notificación
DELETE /api/notifications/{id}
```

### **Integración con Fetch API**

```javascript
class NotificacionesAPI {
    static async obtenerNotificaciones(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const response = await fetch(`/api/notifications?${params}`);
        return response.json();
    }
    
    static async crearNotificacion(data) {
        const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }
    
    static async marcarLeida(id) {
        const response = await fetch(`/api/notifications/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ read: true })
        });
        return response.json();
    }
}
```

## 🚀 Deployment

### **Archivos Necesarios**
1. Incluir toda la carpeta `notificaciones-module/`
2. Asegurar dependencias (Tailwind, Font Awesome, fuentes)
3. Configurar rutas relativas correctamente

### **Optimizaciones**
- Minificar CSS y JS para producción
- Optimizar imágenes e iconos
- Implementar lazy loading si es necesario
- Configurar caché para assets estáticos

## 📋 Checklist de Implementación

- [ ] **CSS**: Estilos específicos del módulo
- [ ] **JavaScript**: Lógica de funcionamiento
- [ ] **Componentes**: HTML reutilizable
- [ ] **Datos**: Estructura de datos y ejemplos
- [ ] **Responsive**: Diseño adaptable
- [ ] **Accesibilidad**: Navegación por teclado
- [ ] **Performance**: Optimización de carga
- [ ] **Integración**: APIs y backend

## 🤝 Contribución

### **Estructura de Archivos**
- Mantener separación de responsabilidades
- CSS en `css/`, JS en `js/`, componentes en `components/`
- Seguir convenciones de nomenclatura GOB.MX

### **Estándares de Código**
- Usar la guía de estilos del proyecto
- Comentar código complejo
- Mantener consistencia visual
- Probar en diferentes dispositivos

---

**📞 Soporte**  
Para dudas sobre este módulo, consultar la documentación principal del proyecto o contactar al equipo de desarrollo.