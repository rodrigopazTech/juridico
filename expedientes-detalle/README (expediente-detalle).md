# 📋 MÓDULO DE NOTIFICACIONES - SISTEMA JURÍDICO GOB.MX V3

## 📁 Estructura del Módulo

```
expedientes-detalle/
├── components/
│   └── modals.html
├── CSS/
├── js/
│   ├── expedientes-detalle.js
│   └── loader.js
├── index.html
└── README.md
```

## 🎯 Características del Módulo

### ✅ **Funcionalidades Implementadas**

1. **Carga de Datos**
   - Obtiene el id del expediente desde los parámetros de la URL
   - carga los datos del expediente correspondiente desde el localStorage del navegador

2. **Vista 360°**
   - Renderiza la información clave del expediente
  
3. **Actividad Reciente**
   - Muestra el historial de actividad y cambios de estado del expediente.

4. **Edición de Expediente**
   - Permite al usuario editar los campos principales del expediente mediante un modal 
   - guardando los cambios en localStorage
   

5. **Cambio de Estado**
   - ermite al usuario cambiar el estado del expediente
   - egistrando el cambio y la justificación en el historialActividad.


6. **Inclusión Dinámica de Componentes**
   - Utiliza loader.js para inyectar la barra lateral, la barra de navegación y los modales
   

## 🎨 Diseño y Estilos

### **Paleta de Colores GOB.MX V3**
- **Color primario de acción y énfasis.**: `#9D2449` (Gob-Guinda)
- **Tono oscuro para hover**: `#611232` (Gob-guindaDark)
- **Color secundario para iconos clave y acentos.**: `#B38E5D` (Gob-oro)
- **Color principal para texto.**: `#545454` (gob-gris)
- **Color de fondo de la página.**: `#F5F5F5` (gob-fondo)

### **Componentes de UI**
- **Scrollbar Personalizado**: personaliza la apariencia de la barra de desplazamiento.
- **KPIs**: Se usan bloques de tarjetas para mostrar estadísticas rápidas
- **Iconografía**: Font Awesome + Heroicons
- **Animaciones**: Transiciones CSS suaves

## 💻 Uso del Módulo

### **1. Inclusión Básica**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Dependencias necesarias -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalle Expediente - Agenda Legal</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Noto+Sans:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- CSS del módulo -->
        <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <!-- Contenido -->
    
    <!-- Scripts del módulo -->
   <script src="js/loader.js"></script>
    <script src="js/expedientes-detalle.js"></script>
</body>
</html>
```

### **2. Inicialización JavaScript**

```javascript
// El módulo se inicializa automáticamente
document.addEventListener("DOMContentLoaded", async function () {
    await loadComponents(); // Carga de componentes dinámicos
    if (typeof initExpedienteDetalle === "function") initExpedienteDetalle(); // Inicialización de la lógica
});
```


## 🔧 API del Módulo

### **Clase NotificacionesModule**

#### Métodos Principales:

```javascript

init()                //  Inicializa la clase: obtiene ID, carga datos, y configura event listeners.
cargarAsunto()        //Busca el expediente por ID en localStorage y llama a las funciones de renderizado.
guardarAsunto()       //ersiste los datos del objeto this.asunto en localStorage.
abrirModalEdicion()   //Llena el modal de edición con datos actuales y lo muestra.
guardarEdicion()      //Actualiza el objeto this.asunto con los valores del modal, llama a guardarAsunto(), y actualiza la vista.
confirmarCambioEstado()  // Actualiza el campo estado, registra el cambio en historialActividad, llama a guardarAsunto(), y actualiza la vista.
cerrarModales()        //Oculta todos los modales visibles.
mostrarVista360()	  //Genera y renderiza el HTML de la vista principal del expediente.
cargarActividadReciente()	//Renderiza el historial de actividad.

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

### **Adaptaciones** (?)
- Grid de notificaciones: 1 columna en móvil
- Filtros: Stack vertical en móvil
- Detalles: Columna única en móvil
- Sidebar: Colapsable en móvil

## 🎛️ Configuración Avanzada

### **Persistencia de Datos**

```javascript
el módulo utiliza localStorage como mecanismo de persistencia para la carga y guardado de datos del expediente.



## 🔌 Integración con Backend

### **Endpoints Sugeridos**

```javascript

GET /api/expedientes/{id}
GET /api/expedientes/{id}/actividad


// Actualiza
PATCH /api/expedientes/{id}/estado
PATCH  /api/expedientes/{id}

```
### **Integración con Fetch API**


```javascript
// js/expedientes-detalle.js (Función Modificada)

// ...

    // Método original: cargarAsunto() 
    // Ahora es asíncrono y usa fetch
    async cargarAsunto() {
        const url = `/api/expedientes/${this.asuntoId}`;
        
        // 1. Mostrar un indicador de carga (opcional, pero recomendado)
        // document.getElementById('vista-360-container').innerHTML = 'Cargando datos...';
        
        try {
            const response = await fetch(url);

            if (!response.ok) {
                // Manejo de errores HTTP (404, 500, etc.)
                throw new Error(`Error ${response.status}: No se encontró el expediente solicitado o el servidor falló.`);
            }

            this.asunto = await response.json(); // Parsea la respuesta JSON
            
        } catch (error) {
            // Manejo de errores de red o excepciones lanzadas
            this.mostrarError(`Error al obtener el expediente: ${error.message}`);
            return;
        }

        // 2. Lógica que se ejecuta SÓLO si la carga fue exitosa
        if (!this.asunto) { 
            this.mostrarError('El servidor devolvió un objeto vacío.'); 
            return; 
        }
        
        this.partes = this.parsePartes(this.asunto.partesProcesales);
        this.mostrarVista360();
        this.actualizarTitulo();
        this.cargarActividadReciente();
    }

// ...
```

## 🚀 Deployment

### **Archivos Necesarios**
1. Incluir toda la carpeta `expediente-detalle`
2. Asegurar dependencias (Tailwind, Font Awesome, fuentes)
3.components es crucial para la carga dinámica de la UI.
### **Optimizaciones**
- Minificar CSS y JS para producción
- Optimizar imágenes e iconos
- Configurar caché para assets estáticos

## 📋 Checklist de Implementación

- [ ] **CSS**: Estilos específicos del módulo
- [ ] **JavaScript**: Lógica de funcionamiento
- [ ] **Componentes**: Revisar que la Vista 360° (KPIs, datos principales) se renderice sin errores después de la carga de datos.
- [ ] **Datos**: Verificar que la función parsePartes() maneje correctamente el formato de las partes procesales 
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