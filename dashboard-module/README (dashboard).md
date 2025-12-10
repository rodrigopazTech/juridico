# 📊 MÓDULO DE DASHBOARD - SISTEMA JURÍDICO GOB.MX V3

## 📁 Estructura del Módulo

```
dashboard-module/
├── js/
│   └── dashboard-module.js          # Lógica JavaScript del módulo
├── components/
│   └── stats-cards.html             # Tarjetas de estadísticas principales
├── index.html                       # Página principal del módulo
└── README.md                        # Esta documentación
```

## 🎯 Características del Módulo

### ✅ **Funcionalidades Implementadas**

1. **Panel de Estadísticas Principales**
   - Tarjetas con métricas clave: Total expedientes, Audiencias activas, Términos próximos, Recordatorios pendientes
   - Indicadores visuales con iconos y colores distintivos
   - Actualización automática de datos

2. **Gráficos Interactivos con Chart.js**
   - **Distribución por Gerencia**: Gráfico de barras/dona mostrando carga de trabajo
   - **Carga de Trabajo por Usuario**: Visualización de distribución de tareas
   - **Trabajo Completado**: Gráfico de línea mostrando tendencias mensuales
   - **Estados de Expedientes**: Gráfico circular de estados actuales

3. **Sistema de Filtros Unificado**
   - Filtro global por gerencia que afecta todos los gráficos
   - Actualización en tiempo real de visualizaciones
   - Selector intuitivo con opciones dinámicas

4. **Visualizaciones Avanzadas**
   - Gráficos responsivos que se adaptan al tamaño de pantalla
   - Tooltips informativos en hover
   - Leyendas integradas para fácil interpretación
   - Animaciones suaves en carga de datos

5. **Interfaz Responsive**
   - Diseño adaptable móvil/desktop
   - Grid responsivo para múltiples gráficos
   - Optimización de visualizaciones en diferentes dispositivos
   - Cumple con GOB.MX V3

## 🎨 Diseño y Estilos

### **Paleta de Colores GOB.MX V3**
- **Audiencias**: `#9D2449` (Guinda) - gráficos y badges
- **Términos**: `#B38E5D` (Oro) - gráficos y badges
- **Expedientes**: `#13322B` (Verde) - gráficos y badges
- **Recordatorios**: `#545454` (Gris) - gráficos y badges
- **Fondos**: Blanco para tarjetas, Gris claro para contenedores

### **Componentes de UI**
- **Stats Cards**: Tarjetas grandes con métricas principales
- **Charts**: Gráficos interactivos con Chart.js
- **Filters**: Controles de filtro con selectores
- **Grid Layout**: Layout responsivo de múltiples columnas
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

    <!-- Chart.js para gráficos -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- CSS del módulo -->
    <link rel="stylesheet" href="../css/output.css">
</head>
<body>
    <!-- Contenido -->

    <!-- Scripts del módulo -->
    <script type="module">
        import { DashboardModule } from './js/dashboard-module.js';
        const dashboardModule = new DashboardModule();
        dashboardModule.init();
    </script>
</body>
</html>
```

### **2. Inicialización JavaScript**

```javascript
// El módulo se inicializa automáticamente
document.addEventListener('DOMContentLoaded', function() {
    // DashboardModule ya está disponible globalmente
    console.log('Módulo de Dashboard inicializado');
});
```

### **3. Actualizar Datos del Dashboard**

```javascript
// Ejemplo de actualización manual de datos
const nuevosDatos = {
    totalExpedientes: 150,
    audienciasActivas: 25,
    terminosProximos: 12,
    recordatoriosPendientes: 8
};

dashboardModule.updateStats(nuevosDatos);
```

## 🔧 API del Módulo

### **Clase DashboardModule**

#### Métodos Principales:

```javascript
// Inicialización y Renderizado
dashboardModule.init()                    // Inicializar módulo completo
dashboardModule.loadData()                // Cargar datos del localStorage
dashboardModule.renderCharts()            // Renderizar todos los gráficos
dashboardModule.updateStats(data)         // Actualizar estadísticas principales

// Gestión de Gráficos
dashboardModule.createGerenciasChart()    // Crear gráfico de gerencias
dashboardModule.createUsuariosChart()     // Crear gráfico de usuarios
dashboardModule.createTrabajoChart()      // Crear gráfico de trabajo completado
dashboardModule.createEstadosChart()      // Crear gráfico de estados

// Filtros y Actualización
dashboardModule.setupFilters()            // Configurar filtros
dashboardModule.applyFilter(gerenciaId)   // Aplicar filtro por gerencia
dashboardModule.updateChartsWithFilter()  // Actualizar gráficos con filtro

// Utilidades
dashboardModule.formatNumber(num)         // Formatear números
dashboardModule.getChartColors()          // Obtener colores de gráficos
dashboardModule.generateSampleData()      // Generar datos de ejemplo
```

### **Datos y Configuración**

#### Estructura de Estadísticas:
```javascript
{
    totalExpedientes: 150,
    audienciasActivas: 25,
    terminosProximos: 12,
    recordatoriosPendientes: 8,
    distribucionGerencias: [
        { gerencia: 'Civil', expedientes: 45, audiencias: 12 },
        { gerencia: 'Penal', expedientes: 38, audiencias: 8 }
    ],
    cargaUsuarios: [
        { usuario: 'Lic. García', expedientes: 15, audiencias: 5 },
        { usuario: 'Lic. López', expedientes: 12, audiencias: 3 }
    ]
}
```

#### Configuración de Gráficos:
```javascript
const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom',
            labels: {
                usePointStyle: true,
                padding: 20
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: 'white',
            bodyColor: 'white'
        }
    }
};
```

## 📱 Responsive Design

### **Breakpoints**
- **Móvil**: `< 640px`
- **Tablet**: `640px - 768px`
- **Desktop**: `> 768px`

### **Adaptaciones**
- Grid: 1 columna en móvil, 2 en tablet/desktop
- Charts: Altura adaptable, tooltips optimizados
- Stats Cards: Stack vertical en móvil
- Filters: Ancho completo en móvil
- Leyendas: Posición bottom en todos los tamaños

## 🎛️ Configuración Avanzada

### **Personalizar Métricas**

```javascript
// Agregar nueva métrica al dashboard
const nuevaMetrica = {
    nombre: 'apelacionesActivas',
    label: 'Apelaciones Activas',
    icon: 'fa-gavel',
    color: '#6B46C1',
    bgColor: 'rgba(107, 70, 193, 0.1)'
};
```

### **Configurar Gráficos**

```javascript
// Personalizar configuración de Chart.js
const customChartOptions = {
    animation: {
        duration: 1000,
        easing: 'easeOutQuart'
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: function(value) {
                    return value + '%';
                }
            }
        }
    }
};
```

## 🔌 Integración con Backend

### **Endpoints Sugeridos**

```javascript
// Estadísticas Generales
GET /api/dashboard/stats
GET /api/dashboard/summary

// Datos de Gráficos
GET /api/dashboard/gerencias-distribution
GET /api/dashboard/usuarios-workload
GET /api/dashboard/trabajo-completado
GET /api/dashboard/expedientes-estados

// Filtros
GET /api/dashboard/filter-options
GET /api/dashboard/filtered-data?gerencia={id}
```

### **Integración con Fetch API**

```javascript
class DashboardAPI {
    static async obtenerEstadisticas() {
        const response = await fetch('/api/dashboard/stats');
        return response.json();
    }

    static async obtenerDatosGraficos(tipo, filtros = {}) {
        const params = new URLSearchParams(filtros);
        const response = await fetch(`/api/dashboard/${tipo}?${params}`);
        return response.json();
    }

    static async obtenerDatosFiltrados(gerenciaId) {
        const response = await fetch(`/api/dashboard/filtered-data?gerencia=${gerenciaId}`);
        return response.json();
    }
}
```

## 🚀 Deployment

### **Archivos Necesarios**
1. Incluir toda la carpeta `dashboard-module/`
2. Asegurar dependencias (Tailwind, Font Awesome, Chart.js, fuentes)
3. Configurar rutas relativas correctamente

### **Optimizaciones**
- Minificar JS para producción
- Optimizar carga de Chart.js
- Implementar lazy loading para gráficos pesados
- Configurar caché para assets estáticos

## 📋 Checklist de Implementación

- [ ] **JavaScript**: Lógica de dashboard y gráficos
- [ ] **Chart.js**: Integración y configuración de gráficos
- [ ] **Componentes**: HTML para tarjetas y contenedores
- [ ] **Estilos**: CSS para responsive y colores
- [ ] **Datos**: Manejo de datos y filtros
- [ ] **Responsive**: Diseño adaptable
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
