# 👥 MÓDULO DE USUARIOS - SISTEMA JURÍDICO GOB.MX V3

## 📁 Estructura del Módulo

```
usuario-module/
├── js/
│   └── usuarios-module.js           # Lógica JavaScript del módulo
├── components/
│   ├── users-table.html             # Tabla de usuarios
│   ├── gerencias-table.html         # Tabla de gerencias
│   ├── modal-create-user.html       # Modal para crear/editar usuario
│   ├── modal-create-gerencia.html   # Modal para crear/editar gerencia
│   └── modal-manage-materias.html   # Modal para gestionar materias
├── index.html                       # Página principal del módulo
└── README.md                        # Esta documentación
```

## 🎯 Características del Módulo

### ✅ **Funcionalidades Implementadas**

1. **Sistema de Gestión de Usuarios**
   - Crear, editar y eliminar usuarios
   - Asignar roles: Subdirector, Gerente, Abogado
   - Activar/desactivar usuarios
   - Asignar gerencias y materias específicas

2. **Gestión de Gerencias**
   - Crear, editar y eliminar gerencias
   - Gestionar materias por gerencia
   - Asignar usuarios a gerencias

3. **Materias Jurídicas**
   - Administrar materias por gerencia (Civil, Penal, Laboral, etc.)
   - Asignar materias a usuarios según su gerencia
   - Validación de asignaciones

4. **Sistema de Búsqueda y Filtros**
   - Búsqueda en tiempo real por nombre, correo
   - Filtros por rol y estado de usuario
   - Navegación por pestañas (Usuarios/Gerencias)

5. **Interfaz Responsive**
   - Diseño adaptable móvil/desktop
   - Transiciones y animaciones suaves
   - Cumple con GOB.MX V3

## 🎨 Diseño y Estilos

### **Paleta de Colores GOB.MX V3**
- **Subdirector**: `#9D2449` (Guinda)
- **Gerente**: `#B38E5D` (Oro)
- **Abogado**: `#545454` (Gris)
- **Estados**: Verde para activo, Rojo para inactivo

### **Componentes de UI**
- **Badges**: Indicadores de roles y estados
- **Tables**: Tablas responsivas con acciones
- **Modals**: Formularios modales para CRUD
- **Tabs**: Navegación por secciones
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
        import { UsuarioModule } from './js/usuarios-module.js';
        const usuarioModule = new UsuarioModule();
        usuarioModule.init();
    </script>
</body>
</html>
```

### **2. Inicialización JavaScript**

```javascript
// El módulo se inicializa automáticamente
document.addEventListener('DOMContentLoaded', function() {
    // UsuarioModule ya está disponible globalmente
    console.log('Módulo de Usuarios inicializado');
});
```

### **3. Crear Nuevo Usuario**

```javascript
// Ejemplo de creación de usuario
const nuevoUsuario = {
    nombre: 'Lic. Juan Pérez',
    correo: 'juan.perez@juridico.com',
    contraseña: 'password123',
    rol: 'ABOGADO',
    gerenciaId: 1,
    materias: [1, 2]
};

usuarioModule.createUsuario(nuevoUsuario);
```

## 🔧 API del Módulo

### **Clase UsuarioModule**

#### Métodos Principales:

```javascript
// Gestión de Usuarios
usuarioModule.loadUsuarios()              // Cargar lista de usuarios
usuarioModule.saveUsuario(data)           // Crear/actualizar usuario
usuarioModule.toggleUsuarioStatus(id)     // Activar/desactivar usuario
usuarioModule.deleteUsuario(id)           // Eliminar usuario

// Gestión de Gerencias
usuarioModule.loadGerencias()             // Cargar lista de gerencias
usuarioModule.saveGerencia(data)          // Crear/actualizar gerencia
usuarioModule.deleteGerencia(id)          // Eliminar gerencia

// Gestión de Materias
usuarioModule.saveGerenciaMateria(gerenciaId, data)  // Crear/actualizar materia
usuarioModule.deleteGerenciaMateria(gerenciaId, materiaId)  // Eliminar materia

// Utilidades
usuarioModule.getUsuarios()               // Obtener usuarios del localStorage
usuarioModule.getGerencias()              // Obtener gerencias del localStorage
usuarioModule.populateGerenciasSelect()   // Poblar select de gerencias
```

### **Datos y Configuración**

#### Estructura de Usuario:
```javascript
{
    id: 1,
    nombre: "Lic. María González",
    correo: "maria.gonzalez@juridico.com",
    rol: "SUBDIRECTOR", // SUBDIRECTOR, GERENTE, ABOGADO
    activo: true,
    gerenciaId: 1,
    materias: [1, 4], // IDs de materias asignadas
    fechaCreacion: "2025-01-15"
}
```

#### Estructura de Gerencia:
```javascript
{
    id: 1,
    nombre: "Gerencia de Civil, Mercantil, Fiscal y Administrativo",
    materias: [
        { id: 1, nombre: "Civil" },
        { id: 4, nombre: "Mercantil" }
    ]
}
```

## 📱 Responsive Design

### **Breakpoints**
- **Móvil**: `< 640px`
- **Tablet**: `640px - 768px`
- **Desktop**: `> 768px`

### **Adaptaciones**
- Tablas: Scroll horizontal en móvil
- Modales: Ancho completo en móvil
- Filtros: Stack vertical en móvil
- Navegación: Tabs colapsables en móvil

## 🎛️ Configuración Avanzada

### **Personalizar Roles de Usuario**

```javascript
// Agregar nuevo rol
const nuevosRoles = {
    'DIRECTOR': {
        label: 'Director',
        color: '#9D2449',
        bgColor: 'rgba(157, 36, 73, 0.1)',
        borderColor: '#9D2449'
    }
};
```

### **Configurar Validaciones**

```javascript
// Personalizar validaciones de contraseña
const passwordConfig = {
    minLength: 8,
    requireSpecialChar: true,
    requireNumber: true
};
```

## 🔌 Integración con Backend

### **Endpoints Sugeridos**

```javascript
// Usuarios
GET /api/usuarios
POST /api/usuarios
PUT /api/usuarios/{id}
DELETE /api/usuarios/{id}
PATCH /api/usuarios/{id}/status

// Gerencias
GET /api/gerencias
POST /api/gerencias
PUT /api/gerencias/{id}
DELETE /api/gerencias/{id}

// Materias
GET /api/gerencias/{id}/materias
POST /api/gerencias/{id}/materias
PUT /api/gerencias/{id}/materias/{materiaId}
DELETE /api/gerencias/{id}/materias/{materiaId}
```

### **Integración con Fetch API**

```javascript
class UsuariosAPI {
    static async obtenerUsuarios(filtros = {}) {
        const params = new URLSearchParams(filtros);
        const response = await fetch(`/api/usuarios?${params}`);
        return response.json();
    }
    
    static async crearUsuario(data) {
        const response = await fetch('/api/usuarios', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }
    
    static async actualizarUsuario(id, data) {
        const response = await fetch(`/api/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }
}
```

## 🚀 Deployment

### **Archivos Necesarios**
1. Incluir toda la carpeta `usuario-module/`
2. Asegurar dependencias (Tailwind, Font Awesome, fuentes)
3. Configurar rutas relativas correctamente

### **Optimizaciones**
- Minificar JS para producción
- Optimizar carga de componentes HTML
- Implementar lazy loading si es necesario
- Configurar caché para assets estáticos

## 📋 Checklist de Implementación

- [ ] **JavaScript**: Lógica de gestión de usuarios y gerencias
- [ ] **Componentes**: HTML reutilizable para tablas y modales
- [ ] **Validaciones**: Formularios y asignaciones
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
