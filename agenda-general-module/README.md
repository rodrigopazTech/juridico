# ⚖️ MÓDULO DE AGENDA-GENERAL - SISTEMA JURÍDICO GOB.MX V3

## 📁 Estructura del Módulo

```
agenda-general-module/
├── components/
│   ├── modal-observaciones.html
│   ├── table-audiencias.html
│   ├── table-terminos.html
│   ├── toolbar-audiencias.html
│   └── toolbar-terminos.html
├── CSS/
│   └── agenda-general.css
├── js/
│   └── agenda-general-module.js
├── index.html
└── README.md
```

## 🎯 Características del Módulo

### ✅ **Funcionalidades Implementadas**

1. **Audiencias desahogadas**
   - Fecha de audiencia
   - Hora de audiencia
   - Expediente
   - Tipo de Audiencia
   - Partes
   - Abogado
   - Acciones

2. **Sistema de Búsqueda y Filtros Avanzados**
   - Búsqueda en tiempo real por fecha,hora,expediente,partes,abogado
   - Filtros por hoy,semana,mes,otro mes

3. **Sistema de Actas y Documentos**
   - Descargar acta

4. **Sistema de Comentarios**
   - Ver observaciones

5. **Terminos presentados**
   - Fecha de presentacion
   - Fecha de vencimiento
   - Expediente
   - Actuacion
   - Partes
   - Acciones

6. **Sistema de Búsqueda y Filtros Avanzados**
   - Búsqueda en tiempo real por fecha,,expediente,actuacion,partes
   - Filtros por hoy,semana,mes,otro mes
   
7. **Sistema de Actas y Documentos**
   - Descargar acuse

8. **Sistema de Comentarios**
   - Ver observaciones

9. **Interfaz Responsive**
   - Diseño adaptable móvil/desktop
   - Tabla responsive con scroll horizontal
   - Modales adaptables a diferentes tamaños
   - Cumple con GOB.MX V3

## 🎨 Diseño y Estilos 

### **Paleta de Colores GOB.MX V3**
- **Botones activos**: `.#9D2449` (guinda)
- **Texto general**: `.gob-gris` (Gris)
- **Encabezados**: `.gob-oro` (Oro)
//Tipos de audiencias
- **Conciliacion**: `#e8f5e9` (verde)
- **Vista**: `#e3f2fd` (Azul Oscuro)
- **Juicio**: `#ffebee` (Rojo Oscuro)


### **Componentes de UI**
- **Tabla**: Tabla responsive con expansión de filas
- **Pestaña Activa**: Indica la pestaña actualmente seleccionada.
- **Contenido del Módulo**: Contenedores para la vista de Audiencias o Términos.
- **Contenido Activo**: Hace visible el contenido de la pestaña seleccionada.
- **Modal**: Contenedor principal para la ventana emergente de Observaciones.
- **Filtros de Tiempo**: Botones (Hoy, Semana, Mes) en la barra de herramientas.
- **Dropdown Meses**: Menú desplegable para la selección de "Otro Mes".
- **Tipos de Audiencia**: Etiquetas para diferenciar el tipo de audiencia (Conciliación, Vista, Juicio).

## 💻 Uso del Módulo

### **1. Inclusión Básica**

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <!-- Dependencias necesarias -->
    <link href="../css/output.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Noto+Sans:wght@400;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- CSS del módulo -->
    <link rel="stylesheet" href="./css/agenda-general.css">
</head>
<body>
    <!-- Contenido -->

    <!-- Scripts del módulo -->
    <script type="module">
        import { loadIncludes } from '../js/loader.js';
        import { initAgendaGeneral } from './js/agenda-general-module.js';
        
        document.addEventListener('DOMContentLoaded', async () => {
            await loadIncludes();
            
            // Inicializar lógica del módulo
            initAgendaGeneral();
        });
    </script>
</body>
</html>

```

### **2. Inicialización JavaScript**

```javascript 
// El módulo se inicializa automáticamente
 document.addEventListener('DOMContentLoaded', async () => {
            await loadIncludes();
            
});
```


## 🔧 API del Módulo 

### **Funciones Principales**

```javascript

initAgendaGeneral()                                // Inicializar módulo completo
cargarDatos()                           // carga de datos de audiencias y terminos desde localStorage
configurarFiltrosTiempo()               // Asigna listeners a los botones de filtro
filtrarPorPeriodo(datos, fechaCampo)    // plica el filtro basado en this.periodoActual o this.mesSeleccionado
mostrarAudienciasDesahogadas()          //Filtra los datos y muestra audiencias desahogadas
mostrarTerminosPresentados()                  //Filtra los términos,y lo inyecta en #terminos-presentados-body
actualizarEstadisticas()                //Placeholder para la lógica futura de actualización de widgets de estadísticas.
formatDate(dateString)                  //Función helper que convierte el formato de fecha YYYY-MM-DD a DD/MM/YYYY
inicializarEventos()                    //Configura listeners de eventos específicos, como el de búsqueda en #search-audiencias


//Funciones Globales Exportadas
showModule(moduleName)                  // Cambia entre la pestaña de 'audiencias' y 'terminos'
seleccionarMesAudiencias(mes)                      // Se llama al seleccionar un mes en el dropdown de Audiencias
seleccionarMesTerminos(mes)            // Se llama al seleccionar un mes en el dropdown de Términos
descargarDocumento(doc)                //Placeholder que simula la descarga de documentos
verObservaciones(id, tipo)             //Abre el modal de observaciones. Busca el elemento por id y tipo (audiencia o termino) e inyecta su campo observaciones en el modal.
```

### **Datos y Configuración**

#### Estructura de Audiencia desahogadas
```javascript
{
     id: 1,
    fechaAudiencia: getFechaStr(0),         // HOY (Para que aparezca en el filtro 'Hoy')
    horaAudiencia: '09:30',
    expediente: 'EXP-2025-0456',
    tipoAudiencia: 'Conciliación',
    partes: 'Martínez vs. Rodríguez',
    abogado: 'Dra. Laura Méndez',
    actaDocumento: 'ACTA-PENDIENTE.pdf',
    atendida: true,                         // Marcado true para que salga en esta lista (simulando agendado/listo)
    fechaDesahogo: getFechaStr(0), 
    observaciones: 'Programada para hoy a primera hora.'
}
```

#### Estructura de Terminos Presentados
```javascript
{
    id: 1,
    fechaIngreso: getFechaStr(0),
    fechaVencimiento: getFechaStr(0),        // VENCE HOY
    xpediente: 'EXP-2025-001',
    actuacion: 'Contestación de demanda',
    partes: 'Empresa A vs. Empleado B',
    abogado: 'Lic. Juan Pérez',
    acuseDocumento: 'ACUSE-HOY.pdf',
    etapaRevision: 'Presentado',
    fechaPresentacion: getFechaStr(0),       // PRESENTAR HOY
    observaciones: 'Vencimiento el día de hoy.'
}
```
## 📱 Responsive Design

### **Breakpoints**
- **Móvil**: `max-width: 480px`
- **Tablet**: `max-width: 768px`
- **Desktop**: `> 768px`

### **Adaptaciones** 
- Tabla: Scroll horizontal en móvil
- Filtros: Grid responsive, stack en móvil
- Modales: Ancho completo en móvil
- Menús: Posicionamiento inteligente
- Texto: Truncado en columnas estrechas

## 🎛️ Configuración Avanzada 

### **Cargar datos**

```javascript
// Agregar nuevos tipos
// agenda-general-module.js

async cargarDatos() {
    try {
        // 1. Cargar Audiencias Desahogadas
        const resAudiencias = await fetch('/api/agenda/audiencias-desahogadas');
        this.audienciasDesahogadas = await resAudiencias.json();
        
        // 2. Cargar Términos Presentados
        const resTerminos = await fetch('/api/agenda/terminos-presentados');
        this.terminosPresentados = await resTerminos.json();
        
    } catch (error) {
        console.error('Error al cargar datos del backend:', error);
        // Opcional: Mantener la lógica de fallback con datos de ejemplo si el fetch falla.
        this.cargarDatosEjemplo(); 
    }
}
```

## 🔌 Integración con Backend

### **Endpoints Sugeridos**

```javascript
// Agenda-general
GET	/api/agenda/audiencias-desahogadas
GET	/api/agenda/terminos-presentados
```

### **Integración con Fetch API**

```javascript
async cargarDatos() {
    try {
        const response = await fetch('/api/agenda/audiencias-desahogadas');
        const data = await response.json();
        this.audienciasDesahogadas = data;
    } catch (error) {
        console.error('Error al cargar audiencias:', error);
        // Mantener la carga de datos de ejemplo como fallback
    }
}
```

## 🚀 Deployment

### **Archivos Necesarios**
-index.html

-agenda-general-module.js

-agenda-general.css

-table-audiencias.html, table-terminos.html

-toolbar-audiencias.html, toolbar-terminos.html

-modal-observaciones.html

-Dependencias: loader.js, output.css (Tailwind), y enlaces a fuentes (Montserrat, Noto Sans) y Font Awesome 6.

### **Optimizaciones**
- Minificar agenda-general-module.js para producción
- Optimizar carga de modales HTML
- Configurar caché para assets estáticos

## 📋 Checklist de Implementación

- [ ] **JavaScript**: Lógica de gestión de agenda-general
- [ ] **CSS**: Estilos 
- [ ] **Responsive**: Diseño adaptable
- [ ] **Accesibilidad**: Navegación por teclado
- [ ] **Performance**: Optimización de carga
- [ ] **Integración**: APIs y backend

## 🤝 Contribución

### **Estructura de Archivos**
- Mantener separación de responsabilidades
- JS en `js/`, CSS en `css/`, componentes en `components/`
- Seguir convenciones de nomenclatura GOB.MX

### **Estándares de Código**
- Usar la guía de estilos del proyecto
- Comentar código complejo
- Mantener consistencia visual
- Probar en diferentes dispositivos

---

**📞 Soporte**  
Para dudas sobre este módulo, consultar la documentación principal del proyecto o contactar al equipo de desarrollo.
