# ⚖️ MÓDULO DE AUDIENCIAS - SISTEMA JURÍDICO GOB.MX V3

## 📁 Estructura del Módulo

```
audiencias/
├── js/
│   └── audiencias.js               # Lógica JavaScript del módulo
├── css/
│   └── styles.css                  # Estilos específicos del módulo
├── components/
│   └── modals.html                 # Modales para crear/editar audiencias
├── index.html                      # Página principal del módulo
└── README.md                       # Esta documentación
```

## 🎯 Características del Módulo

### ✅ **Funcionalidades Implementadas**

1. **Sistema de Gestión de Audiencias**
   - Crear, editar y eliminar audiencias
   - Asignar fecha, hora y sala específica
   - Vincular con expedientes/asuntos existentes
   - Seleccionar tipo de audiencia (Inicial, Intermedia, Juicio)

2. **Estados de Audiencia (Flujo de 3 Estados)**
   - **Pendiente**: Audiencia sin acta adjunta
   - **Con Acta**: Audiencia con documento adjunto, pendiente de conclusión
   - **Concluida**: Audiencia finalizada con observaciones

3. **Sistema de Actas y Documentos**
   - Subir archivos de actas (PDF, DOC, DOCX)
   - Visualizar y descargar documentos adjuntos
   - Quitar actas para corregir estado
   - Validación de archivos

4. **Sistema de Comentarios**
   - Agregar comentarios a audiencias
   - Historial de comentarios por usuario y fecha
   - Interfaz modal para gestión de comentarios

5. **Sistema de Búsqueda y Filtros Avanzados**
   - Búsqueda en tiempo real por expediente, actor, tribunal
   - Filtros por tipo, gerencia, materia y prioridad
   - Interfaz responsive con filtros colapsables

6. **Indicadores Visuales y Semáforo**
   - Semáforo de colores según proximidad de fecha
   - Expansión de filas para detalles adicionales
   - Badges de estado con iconografía clara

7. **Interfaz Responsive**
   - Diseño adaptable móvil/desktop
   - Tabla responsive con scroll horizontal
   - Modales adaptables a diferentes tamaños
   - Cumple con GOB.MX V3

## 🎨 Diseño y Estilos

### **Paleta de Colores GOB.MX V3**
- **Estados Pendiente**: `#F59E0B` (Amarillo - badge)
- **Estados Con Acta**: `#3B82F6` (Azul - badge)
- **Estados Concluida**: `#374151` (Gris oscuro - badge)
- **Semáforo**: Verde (lejos), Amarillo (próximo), Rojo (urgente)
- **Acciones**: Guinda para editar, Oro para acciones principales

### **Componentes de UI**
- **Tabla**: Tabla responsive con expansión de filas
- **Semáforo**: Indicadores circulares de estado temporal
- **Badges**: Etiquetas de estado con iconos
- **Menús**: Menús flotantes inteligentes con acciones contextuales
- **Modales**: Formularios modales para CRUD y comentarios
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
    <link rel="stylesheet" href="./css/styles.css">
</head>
<body>
    <!-- Contenido -->

    <!-- Scripts del módulo -->
    <script src="./js/audiencias.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            initAudiencias();
        });
    </script>
</body>
</html>
```

### **2. Inicialización JavaScript**

```javascript
// El módulo se inicializa automáticamente
document.addEventListener('DOMContentLoaded', function() {
    // initAudiencias() ya está disponible globalmente
    console.log('Módulo de Audiencias inicializado');
});
```

### **3. Crear Nueva Audiencia**

```javascript
// Ejemplo de creación de audiencia
const nuevaAudiencia = {
    expediente: '100/2025',
    fecha: '2025-12-01',
    hora: '10:00',
    tribunal: 'Juzgado 1',
    actor: 'Juan Perez',
    tipo: 'Inicial',
    abogadoComparece: 'Lic. Demo'
};

audienciasModule.saveAudiencia(nuevaAudiencia);
```

## 🔧 API del Módulo

### **Funciones Principales**

```javascript
// Gestión de Audiencias
initAudiencias()                    // Inicializar módulo completo
loadAudiencias()                    // Cargar y renderizar tabla
saveAudiencia(data)                 // Crear/actualizar audiencia
deleteAudiencia(id)                 // Eliminar audiencia

// Gestión de Estados
subirActa(id, file)                 // Subir archivo de acta
quitarActa(id)                      // Remover acta adjunta
openFinalizarAudienciaModal(id)     // Abrir modal de conclusión

// Gestión de Comentarios
openComentariosModal(id)            // Abrir modal de comentarios
guardarComentario()                 // Guardar nuevo comentario
renderComentarios(id)               // Renderizar lista de comentarios

// Utilidades
formatDate(dateString)              // Formatear fechas
getSemaforoStatusAudiencia(fecha, hora) // Calcular estado semáforo
escapeHTML(str)                     // Sanitizar HTML
```

### **Datos y Configuración**

#### Estructura de Audiencia:
```javascript
{
    id: '1',
    expediente: '100/2025',
    fecha: '2025-12-01',
    hora: '10:00',
    tribunal: 'Juzgado 1',
    actor: 'Juan Perez',
    tipo: 'Inicial',
    abogadoComparece: 'Lic. Demo',
    sala: 'Sala 3',
    atendida: false,           // true cuando se concluye
    actaDocumento: '',         // nombre del archivo adjunto
    observaciones: '',         // observaciones finales
    comentarios: [],           // array de comentarios
    asuntoId: '123'            // ID del asunto relacionado
}
```

#### Estados de Audiencia:
```javascript
const estadosAudiencia = {
    pendiente: {
        label: 'Pendiente',
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: 'fa-clock',
        actions: ['upload-acta']
    },
    conActa: {
        label: 'Con Acta',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: 'fa-file-signature',
        actions: ['view-acta', 'desahogar', 'remove-acta']
    },
    concluida: {
        label: 'Concluida',
        badgeClass: 'bg-gray-800 text-white border-gray-600',
        icon: 'fa-flag-checkered',
        actions: ['view-acta']
    }
};
```

## 📱 Responsive Design

### **Breakpoints**
- **Móvil**: `< 640px`
- **Tablet**: `640px - 768px`
- **Desktop**: `> 768px`

### **Adaptaciones**
- Tabla: Scroll horizontal en móvil
- Filtros: Grid responsive, stack en móvil
- Modales: Ancho completo en móvil
- Menús: Posicionamiento inteligente
- Texto: Truncado en columnas estrechas

## 🎛️ Configuración Avanzada

### **Personalizar Tipos de Audiencia**

```javascript
// Agregar nuevos tipos
const tiposAudienciaPersonalizados = {
    'apelacion': {
        label: 'Apelación',
        icon: 'fa-gavel',
        color: '#9D2449'
    },
    'ejecucion': {
        label: 'Ejecución',
        icon: 'fa-balance-scale',
        color: '#B38E5D'
    }
};
```

### **Configurar Estados del Semáforo**

```javascript
// Personalizar umbrales del semáforo
const configSemaforo = {
    urgente: { dias: 1, color: 'bg-red-600 animate-pulse' },
    proximo: { dias: 3, color: 'bg-yellow-400' },
    lejano: { dias: 999, color: 'bg-green-500' }
};
```

## 🔌 Integración con Backend

### **Endpoints Sugeridos**

```javascript
// Audiencias
GET /api/audiencias
POST /api/audiencias
PUT /api/audiencias/{id}
DELETE /api/audiencias/{id}

// Actas y Documentos
POST /api/audiencias/{id}/acta
DELETE /api/audiencias/{id}/acta
GET /api/audiencias/{id}/acta/download

// Comentarios
GET /api/audiencias/{id}/comentarios
POST /api/audiencias/{id}/comentarios

// Estados
PATCH /api/audiencias/{id}/estado
PATCH /api/audiencias/{id}/finalizar
```

### **Integración con Fetch API**

```javascript
class AudienciasAPI {
    static async obtenerAudiencias(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const response = await fetch(`/api/audiencias?${params}`);
        return response.json();
    }

    static async crearAudiencia(data) {
        const response = await fetch('/api/audiencias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    static async subirActa(id, formData) {
        const response = await fetch(`/api/audiencias/${id}/acta`, {
            method: 'POST',
            body: formData
        });
        return response.json();
    }

    static async finalizarAudiencia(id, observaciones) {
        const response = await fetch(`/api/audiencias/${id}/finalizar`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ observaciones })
        });
        return response.json();
    }
}
```

## 🚀 Deployment

### **Archivos Necesarios**
1. Incluir toda la carpeta `audiencias/`
2. Asegurar dependencias (Tailwind, Font Awesome, fuentes)
3. Configurar rutas relativas correctamente

### **Optimizaciones**
- Minificar JS para producción
- Optimizar carga de modales HTML
- Implementar lazy loading para comentarios
- Configurar caché para assets estáticos

## 📋 Checklist de Implementación

- [ ] **JavaScript**: Lógica de gestión de audiencias y estados
- [ ] **CSS**: Estilos para semáforo y estados
- [ ] **Componentes**: Modales para CRUD y comentarios
- [ ] **Validaciones**: Formularios y archivos adjuntos
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
