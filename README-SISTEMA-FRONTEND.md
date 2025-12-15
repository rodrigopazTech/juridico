# 🏛️ Sistema Jurídico GOB.MX V3 - Arquitectura Frontend

## 📋 Descripción del Proyecto

Este proyecto es un sistema integral de gestión jurídica desarrollado para instituciones gubernamentales mexicanas, siguiendo las directrices de diseño GOB.MX V3. El sistema modular permite gestionar usuarios, expedientes, audiencias, términos, calendario, notificaciones y otros aspectos del proceso jurídico desde una interfaz web moderna y responsive.

Esta propuesta presenta la arquitectura frontend (HTML, CSS, JavaScript) diseñada para ofrecer una experiencia de usuario fluida y eficiente, con persistencia local y capacidades offline.

## 🏗️ Arquitectura Frontend

### Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+ (Vanilla)
- **Framework CSS**: Tailwind CSS para diseño responsivo
- **Gráficos**: Chart.js para visualizaciones de datos
- **Iconografía**: Font Awesome 6.5.0
- **Tipografía**: Google Fonts (Montserrat, Noto Sans)
- **Persistencia**: localStorage para almacenamiento local
- **Arquitectura**: Modular con componentes reutilizables

### Diagrama de Módulos del Sistema

```mermaid
graph TD
    App[Sistema Principal] --> Dashboard[Dashboard Module]
    App --> Expedientes[Expedientes Module]
    App --> Audiencias[Audiencias Module]
    App --> Terminos[Términos Module]
    App --> Calendario[Calendario Module]
    App --> Notificaciones[Notificaciones Module]
    App --> Usuarios[Usuarios Module]
    App --> Recordatorios[Recordatorios Module]
    App --> AgendaGeneral[Agenda General Module]
    
    Dashboard --> Charts[Chart.js Visualizations]
    Expedientes --> OrganosManager[Gestor de Órganos]
    Audiencias --> ModalSystem[Sistema de Modales]
    Terminos --> Workflow[Flujo de Aprobación]
    Notificaciones --> RealTime[Actualización en Tiempo Real]
    Usuarios --> RBAC[Control de Acceso por Roles]
```

## 🔗 Matriz de Módulos y Funcionalidades (Detallada)

A continuación se detalla la arquitectura modular y las responsabilidades de cada componente.

### 1. Gestión de Expedientes (Core)

| Módulo | Archivo Principal | Funcionalidades Clave | Integración | Dependencias |
|--------|-------------------|----------------------|-------------|--------------|
| Expedientes | `expediente-module/js/expedientes.js` | CRUD expedientes, filtros, búsqueda | Crea notificaciones, timeline | Chart.js, OrganosManager |
| Detalle Expediente | `expediente-module/js/expediente-detalle.js` | Vista 360°, timeline, documentos | Integra audiencias, términos | SweetAlert2, Chart.js |
| Gestión Órganos | `expediente-module/js/organos-manager.js` | Admin órganos jurisdiccionales | Popula selectores | localStorage |

### 2. Seguimiento Procesal (Audiencias y Términos)

| Módulo | Archivo Principal | Funcionalidades Clave | Integración | Dependencias |
|--------|-------------------|----------------------|-------------|--------------|
| Audiencias | `audiencias/js/audiencias.js` | CRUD audiencias, semaforización, actas | Vincula expedientes, notificaciones | SweetAlert2 |
| Términos | `terminos/js/terminos.js` | Flujo etapas, aprobaciones, acuses | Workflow jerárquico, notificaciones | Chart.js (export) |
| Agenda General | `agenda-general-module/js/agenda-general-module.js` | Vista unificada, filtros combinados | Combina audiencias y términos | Calendario |

### 3. Gestión de Usuarios y Organización

| Módulo | Archivo Principal | Funcionalidades Clave | Integración | Dependencias |
|--------|-------------------|----------------------|-------------|--------------|
| Usuarios | `usuario-module/js/usuarios-module.js` | CRUD usuarios, roles, gerencias | RBAC, materias por gerencia | Validación email |
| Gerencias | `usuario-module/components/gerencias-table.html` | Gestión gerencias y materias | Asignación jerárquica | localStorage |
| Materias | `usuario-module/components/modal-manage-materias.html` | Admin especialidades | Relación N:M usuarios | Sistema permisos |

### 4. Visualización y Analytics

| Módulo | Archivo Principal | Funcionalidades Clave | Integración | Dependencias |
|--------|-------------------|----------------------|-------------|--------------|
| Dashboard | `dashboard-module/js/dashboard-module.js` | Métricas, gráficos dinámicos | Filtros por gerencia | Chart.js |
| Calendario | `calendario-module/js/calendario-module.js` | Vista mensual/semanal/diaria | Eventos múltiples | Date manipulation |
| Notificaciones | `notificaciones-module/js/notificaciones.js` | Sistema alertas, resumen inteligente | Actualización automática | localStorage |

## 📊 Arquitectura de Componentes (Frontend)

### 1. Estructura de Módulos

```javascript
// Estructura típica de módulo
const ModuleName = {
  constructor(opts = {}) {
    this.root = opts.root || document;
    this.data = [];
    this.filters = {};
    this.init();
  },
  
  init() {
    this.bindElements();
    this.bindEvents();
    this.loadData();
    this.render();
  },
  
  bindElements() {
    // Selección de elementos DOM
    this.listContainer = this.root.querySelector('#module-list');
    this.modal = this.root.querySelector('#modal-module');
    this.form = this.root.querySelector('#form-module');
  },
  
  bindEvents() {
    // Event listeners
    this.searchInput?.addEventListener('input', () => this.render());
    this.createBtn?.addEventListener('click', () => this.openModal());
  }
}
```

### 2. Sistema de Persistencia (localStorage)

```javascript
// Patrón de gestión de datos
class DataManager {
  static getStorageKey() {
    return 'jl_module_data_v1';
  }
  
  static load() {
    try {
      return JSON.parse(localStorage.getItem(this.getStorageKey())) || [];
    } catch (e) {
      console.error('Error cargando datos:', e);
      return [];
    }
  }
  
  static save(data) {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
  }
  
  static seedDemoData() {
    // Datos de ejemplo para desarrollo
    return [...];
  }
}
```

### 3. Sistema de Modales

```javascript
// Patrón de modales reutilizable
class ModalManager {
  static open(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }
  
  static close(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  
  static setupCloseHandlers() {
    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.close(e.target.dataset.modalId);
      }
    });
  }
}
```

## 📝 Patrones de Diseño Implementados

### 1. Module Pattern (Revealing Module)

```javascript
export class ModuleClass {
  constructor() {
    this.privateVar = 'internal';
    this.publicVar = 'accessible';
  }
  
  init() {
    this.setupEventListeners();
    this.loadInitialData();
  }
  
  // Métodos privados
  setupEventListeners() {
    // Implementation
  }
  
  loadInitialData() {
    // Implementation
  }
}
```

### 2. Observer Pattern (Notificaciones)

```javascript
class NotificationCenter {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
  
  emitEvent(type, payload) {
    this.notify({ type, payload, timestamp: new Date() });
  }
}
```

### 3. Strategy Pattern (Filtros)

```javascript
class FilterStrategy {
  static strategies = {
    text: (item, query) => item.text.toLowerCase().includes(query.toLowerCase()),
    date: (item, range) => new Date(item.date) >= range.start && new Date(item.date) <= range.end,
    status: (item, status) => item.status === status,
    multi: (item, criteria) => Object.keys(criteria).every(key => 
      this.strategies[key]?.(item, criteria[key]) ?? true
    )
  };
  
  static apply(items, criteria) {
    return items.filter(item => this.strategies.multi(item, criteria));
  }
}
```

## 🔄 Flujo de Datos y Estado

### 1. Gestión de Estado Global

```javascript
class StateManager {
  constructor() {
    this.state = {
      currentUser: null,
      filters: {},
      notifications: [],
      activeModule: 'dashboard'
    };
  }
  
  updateState(path, value) {
    this.state = { ...this.state, [path]: value };
    this.notifyStateChange(path, value);
  }
  
  getState(path) {
    return path ? this.state[path] : this.state;
  }
}
```

### 2. Comunicación Entre Módulos

```javascript
// Event Bus para comunicación
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// Uso: EventBus.emit('user:login', userData);
//      EventBus.on('expediente:created', (data) => updateDashboard());
```

## 📱 Responsive Design y Accesibilidad

### 1. Breakpoints Tailwind CSS

```css
/* Mobile First Approach */
/* sm: 640px+ */
/* md: 768px+ */
/* lg: 1024px+ */
/* xl: 1280px+ */
/* 2xl: 1536px+ */

.responsive-grid {
  @apply grid grid-cols-1 gap-4;
  @apply md:grid-cols-2 md:gap-6;
  @apply lg:grid-cols-3 lg:gap-8;
}
```

### 2. Patrón de Componentes Reutilizables

```html
<!-- Template reutilizable para tarjetas -->
<template id="card-template">
  <div class="card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div class="card-header p-4 border-b">
      <h3 class="card-title text-lg font-semibold"></h3>
    </div>
    <div class="card-body p-4">
      <div class="card-content"></div>
    </div>
    <div class="card-footer p-4 border-t">
      <div class="card-actions"></div>
    </div>
  </div>
</template>
```

## 🎨 Sistema de Diseño GOB.MX

### 1. Variables de Color

```css
:root {
  --gob-guinda: #9D2449;
  --gob-guinda-dark: #611232;
  --gob-oro: #B38E5D;
  --gob-oro-light: #DDC9A3;
  --gob-gris: #545454;
  --gob-plata: #98989A;
  --gob-verde: #13322B;
  --gob-verde-dark: #0C231E;
}
```

### 2. Clases de Utilidad Personalizadas

```css
.text-gob-guinda { color: var(--gob-guinda); }
.bg-gob-oro { background-color: var(--gob-oro); }
.border-gob-gris { border-color: var(--gob-gris); }
.font-headings { font-family: 'Montserrat', sans-serif; }
```

## 🚀 Optimizaciones de Rendimiento

### 1. Lazy Loading de Módulos

```javascript
class ModuleLoader {
  static modules = new Map();
  
  static async loadModule(moduleName) {
    if (this.modules.has(moduleName)) {
      return this.modules.get(moduleName);
    }
    
    const module = await import(`./modules/${moduleName}/js/${moduleName}.js`);
    this.modules.set(moduleName, module);
    return module;
  }
  
  static unloadModule(moduleName) {
    this.modules.delete(moduleName);
  }
}
```

### 2. Virtual Scrolling para Listas Grandes

```javascript
class VirtualList {
  constructor(container, itemHeight, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.renderItem = renderItem;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
  }
  
  render(data, scrollTop) {
    const start = Math.floor(scrollTop / this.itemHeight);
    const end = Math.min(start + this.visibleItems, data.length);
    
    // Render solo elementos visibles
    for (let i = start; i < end; i++) {
      this.renderItem(data[i], i);
    }
  }
}
```

## 📋 Puntos de Integración

### 1. APIs Futuras (Backend)

```javascript
// Adaptadores para futuras integraciones
class APIClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  // Métodos específicos
  async getExpedientes(filters = {}) {
    return this.request('/expedientes', { method: 'GET' });
  }
  
  async createAudiencia(data) {
    return this.request('/audiencias', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}
```

### 2. PWA Capabilities

```javascript
// Service Worker para funcionalidad offline
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }
});

// Manifest para instalación
const manifest = {
  name: "Sistema Jurídico GOB.MX",
  short_name: "JuridicoMX",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#9D2449",
  icons: [
    {
      src: "icons/icon-192.png",
      sizes: "192x192",
      type: "image/png"
    }
  ]
};
```

## 🔒 Seguridad Frontend

### 1. Validación de Entrada

```javascript
class InputValidator {
  static email(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  static sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  static validateForm(formData, rules) {
    const errors = {};
    Object.keys(rules).forEach(field => {
      const value = formData[field];
      const rule = rules[field];
      
      if (rule.required && !value) {
        errors[field] = 'Campo requerido';
      }
      
      if (rule.email && !this.email(value)) {
        errors[field] = 'Email inválido';
      }
      
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `Mínimo ${rule.minLength} caracteres`;
      }
    });
    
    return errors;
  }
}
```

### 2. Gestión de Sesión

```javascript
class SessionManager {
  static login(credentials) {
    // Validación de credenciales
    if (this.validateCredentials(credentials)) {
      const user = this.getUserData(credentials.email);
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('sessionToken', this.generateToken());
      return true;
    }
    return false;
  }
  
  static logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionToken');
    window.location.href = '/login';
  }
  
  static getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  static isAuthenticated() {
    return !!localStorage.getItem('sessionToken');
  }
}
```

## 🧪 Testing Strategy

### 1. Unit Testing (Jest)

```javascript
// Ejemplo de test para módulo de expedientes
import { ExpedientesModule } from './expedientes.js';

describe('ExpedientesModule', () => {
  let module;
  
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="expedientes-list"></div>
      <div id="expedientes-empty-state" class="hidden"></div>
    `;
    module = new ExpedientesModule();
  });
  
  test('should initialize module', () => {
    expect(module.listContainer).toBeTruthy();
    expect(module.data).toEqual([]);
  });
  
  test('should filter expedientes correctly', () => {
    module.data = [
      { id: 1, numero: 'EXP-001', materia: 'Civil' },
      { id: 2, numero: 'EXP-002', materia: 'Penal' }
    ];
    
    const result = module.filterExpedientes({ materia: 'Civil' });
    expect(result.length).toBe(1);
    expect(result[0].materia).toBe('Civil');
  });
});
```

### 2. E2E Testing (Cypress)

```javascript
// cypress/integration/expedientes.spec.js
describe('Gestión de Expedientes', () => {
  beforeEach(() => {
    cy.visit('/expediente-module');
  });
  
  it('should create new expediente', () => {
    cy.get('#expediente-nuevo').click();
    cy.get('#form-create-expediente').should('be.visible');
    
    cy.get('#numero-expediente').type('EXP-999');
    cy.get('#descripcion-expediente').type('Caso de prueba');
    cy.get('#materia-expediente').select('Civil');
    
    cy.get('#save-expediente').click();
    
    cy.get('.expediente-card').should('contain', 'EXP-999');
  });
});
```

## 📊 Monitoreo y Analytics

### 1. Métricas de Rendimiento

```javascript
class PerformanceMonitor {
  static measurePageLoad() {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const metrics = {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime
      };
      
      console.log('Page Load Metrics:', metrics);
      this.sendMetrics(metrics);
    });
  }
  
  static measureUserInteraction(action) {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      console.log(`${action} took ${duration.toFixed(2)}ms`);
      this.sendInteractionMetrics(action, duration);
    };
  }
}
```

### 2. Error Tracking

```javascript
class ErrorTracker {
  static init() {
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack
      });
    });
  }
  
  static logError(errorData) {
    console.error('Frontend Error:', errorData);
    
    // Enviar a servicio de monitoreo
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/errors', JSON.stringify(errorData));
    }
  }
}
```


## 🚀 Plan de Migración y Evolución

### 1. De localStorage a Backend

- **Fase 1**: Implementar API client con fallback a localStorage
- **Fase 2**: Sincronización bidireccional de datos
- **Fase 3**: Eliminación gradual de localStorage
- **Fase 4**: Migración completa a base de datos

### 2. Optimizaciones Futuras

- **Code Splitting**: Carga bajo demanda de módulos
- **Service Workers**: Funcionalidad offline completa
- **WebSockets**: Actualizaciones en tiempo real
- **Virtual Scrolling**: Para listas grandes
- **Lazy Loading**: Imágenes y componentes pesados

---

# 🗄️ Estructura de Base de Datos (PostgreSQL)

## 🏛️ Arquitectura de Base de Datos

### Tecnologías Recomendadas

- **Base de Datos**: PostgreSQL (robustez, integridad referencial y soporte JSONB).
- **ORM**: Prisma / TypeORM.
- **Migración**: Scripts SQL para transición desde localStorage.

### Diagrama de Relaciones (ERD Actualizado)

Nota: Se eliminó el módulo de "Actividades" y se ajustó la relación de Materias según las nuevas reglas de negocio (1:N estricto con Gerencias).

```mermaid
graph TD
    User[Usuarios] -->|1:N| Ger[Gerencias]
    Mat[Materias] -->|N:1| Ger[Gerencias]
    Exp[Expedientes] -->|N:1| User
    Exp -->|N:1| Ger
    Exp -->|N:1| Mat
    Aud[Audiencias] -->|N:1| Exp
    Term[Términos] -->|N:1| Exp
    Time[Timeline] -->|N:1| Exp
    Noti[Notificaciones] -->|N:1| User
    Cal[Calendario] -->|N:1| User
    Cal -.->|Opcional| Aud
    Cal -.->|Opcional| Term
```

## 🔗 Matriz de Relaciones del Sistema (Detallada)

A continuación se detalla la integridad referencial y la lógica de negocio aplicada a cada relación.

### 1. Estructura Organizacional (Usuarios y Gerencias)

| Tabla Origen | Llave Foránea (FK) | Tabla Destino | Tipo | Integridad (On Delete) | Lógica de Negocio / Razón |
|--------------|-------------------|---------------|------|-------------------------|----------------------------|
| usuarios | gerencia_id | gerencias | N:1 | RESTRICT | Un usuario pertenece administrativamente a una Gerencia. No se puede borrar una gerencia si tiene usuarios activos. |
| materias | gerencia_id | gerencias | N:1 | CASCADE | Regla estricta: Una materia (ej. Penal) es gestionada exclusivamente por una Gerencia. Si la gerencia desaparece, sus materias también. |
| usuario_materias | usuario_id | usuarios | N:M | CASCADE | Tabla pivote. Define el expertise del abogado. Si se borra el usuario, se borra su asignación de especialidad. |
| usuario_materias | materia_id | materias | N:M | CASCADE | Define qué materias domina el abogado. |

### 2. Gestión de Expedientes (Core)

| Tabla Origen | Llave Foránea (FK) | Tabla Destino | Tipo | Integridad (On Delete) | Lógica de Negocio / Razón |
|--------------|-------------------|---------------|------|-------------------------|----------------------------|
| expedientes | gerencia_id | gerencias | N:1 | RESTRICT | El expediente es activo de la Gerencia. Permite filtrar "Todos los casos de la Gerencia X". |
| expedientes | materia_id | materias | N:1 | RESTRICT | Clasifica el expediente. Es vital para reportes estadísticos. |
| expedientes | abogado_id | usuarios | N:1 | RESTRICT | Asigna el responsable principal del caso. No se puede borrar al usuario si tiene expedientes a su cargo (primero reasignar). |
| expediente_timeline | expediente_id | expedientes | N:1 | CASCADE | Historial de auditoría. Pertenece intrínsecamente al expediente. |
| expediente_timeline | usuario_id | usuarios | N:1 | SET NULL | Indica quién hizo el cambio. Si el usuario se borra, se mantiene el registro histórico pero sin link al perfil (preserva la auditoría). |

### 3. Seguimiento Procesal (Audiencias y Términos)

| Tabla Origen | Llave Foránea (FK) | Tabla Destino | Tipo | Integridad (On Delete) | Lógica de Negocio / Razón |
|--------------|-------------------|---------------|------|-------------------------|----------------------------|
| audiencias | expediente_id | expedientes | N:1 | CASCADE | Si el expediente se elimina (depuración), sus audiencias futuras o pasadas también se eliminan. |
| audiencias | abogado_id | usuarios | N:1 | RESTRICT | Lógica Flexible: El abogado que comparece puede ser distinto al del expediente. Permite reasignación de audiencia sin cambiar el dueño del caso. |
| terminos | expediente_id | expedientes | N:1 | CASCADE | Los plazos legales están atados a la existencia del expediente. |
| terminos | abogado_id | usuarios | N:1 | SET NULL | Responsable de cumplir el término. Si el abogado sale, el término queda "huérfano" (NULL) para ser reasignado inmediatamente. |

### 4. Agenda y Notificaciones (Alertas)

| Tabla Origen | Llave Foránea (FK) | Tabla Destino | Tipo | Integridad (On Delete) | Lógica de Negocio / Razón |
|--------------|-------------------|---------------|------|-------------------------|----------------------------|
| notificaciones | usuario_id | usuarios | N:1 | CASCADE | Las alertas son privadas del usuario. Si el usuario no existe, sus notificaciones no tienen sentido. |
| eventos_calendario | usuario_id | usuarios | N:1 | CASCADE | Agenda personal del abogado. |
| eventos_calendario | expediente_id | expedientes | N:1 | SET NULL | Vincula el evento al expediente para acceso rápido. Si se borra el expediente, la cita queda en agenda como referencia de tiempo ocupado. |
| eventos_calendario | audiencia_id | audiencias | 1:1 | CASCADE | Sincronización: Si se borra la audiencia oficial, debe desaparecer del calendario visual. |
| eventos_calendario | termino_id | terminos | 1:1 | CASCADE | Sincronización: Si el término se cumple/borra, debe desaparecer o actualizarse en el calendario. |
| recordatorios | usuario_id | usuarios | N:1 | CASCADE | Recordatorios personales (notas adhesivas digitales). |

## 📊 Esquema de Tablas (DDL)

### 1. usuarios

Se incluyen todos los roles jerárquicos definidos.

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contraseña_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('SUBDIRECTOR', 'GERENTE', 'ABOGADO', 'JEFEDEDEPTO', 'DIRECCION')),
    activo BOOLEAN DEFAULT TRUE,
    gerencia_id INTEGER REFERENCES gerencias(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. gerencias

```sql
CREATE TABLE gerencias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. materias

Cambio importante: Se eliminó la tabla pivote gerencia_materias. Se agrega gerencia_id aquí para cumplir la regla: "Una materia solo puede pertenecer a una gerencia".

```sql
CREATE TABLE materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    gerencia_id INTEGER REFERENCES gerencias(id) ON DELETE CASCADE, -- Relación 1:N estricta
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. usuario_materias

Relación muchos a muchos entre usuarios y materias (Expertise del abogado).

```sql
CREATE TABLE usuario_materias (
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    materia_id INTEGER REFERENCES materias(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, materia_id)
);
```

### 5. expedientes

```sql
CREATE TABLE expedientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    materia_id INTEGER REFERENCES materias(id), -- Relacionado por ID, no string
    prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')),
    estado VARCHAR(50) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'En Revisión', 'Concluido', 'Archivado')),
    abogado_id INTEGER REFERENCES usuarios(id), -- Asignación principal
    gerencia_id INTEGER REFERENCES gerencias(id),
    ultima_actividad DATE,
    actualizaciones INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_conclusion TIMESTAMP NULL
);
```

### 6. audiencias

Se ha priorizado el uso de IDs (abogado_id) sobre nombres en texto para permitir la lógica de reasignación y privilegios compartidos.

```sql
CREATE TABLE audiencias (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL,
    fecha_hora TIMESTAMP NOT NULL, -- Unificado fecha y hora
    tribunal VARCHAR(255),
    actor VARCHAR(255),
    atendida BOOLEAN DEFAULT FALSE,
    acta_documento VARCHAR(255),
    abogado_id INTEGER REFERENCES usuarios(id), -- Abogado asignado a comparecer
    prioridad VARCHAR(20) DEFAULT 'Media',
    observaciones TEXT,
    comentarios JSONB,
    estado VARCHAR(50) DEFAULT 'PROGRAMADA' CHECK (estado IN ('PROGRAMADA', 'REALIZADA', 'CANCELADA', 'POSPUESTA')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 7. terminos

```sql
CREATE TABLE terminos (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    abogado_id INTEGER REFERENCES usuarios(id),
    asunto VARCHAR(255),
    estatus VARCHAR(50) DEFAULT 'Proyectista' CHECK (estatus IN ('Proyectista', 'Revisión', 'Gerencia', 'Dirección', 'Liberado', 'Presentado', 'Concluido')),
    fecha_ingreso DATE,
    fecha_vencimiento DATE,
    acuse_documento VARCHAR(255),
    prioridad VARCHAR(20) DEFAULT 'Media',
    actuacion VARCHAR(255),
    comentarios JSONB,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 8. expediente_timeline

```sql
CREATE TABLE expediente_timeline (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
```

### 9. notificaciones

Diseñada para manejar la lógica donde Dirección recibe alertas de nuevas audiencias/términos.

```sql
CREATE TABLE notificaciones (
    id VARCHAR(50) PRIMARY KEY, -- ID generado por sistema/frontend
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('audiencia', 'termino', 'recordatorio', 'sistema')),
    title VARCHAR(255) NOT NULL,
    mensaje TEXT,
    expediente_ref VARCHAR(100),
    leida BOOLEAN DEFAULT FALSE,
    detalles JSONB, -- Para ligar a ID de audiencia/termino
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 10. eventos_calendario

Actualizado para incluir relación con términos y audiencias.

```sql
CREATE TABLE eventos_calendario (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('AUDIENCIA', 'RECORDATORIO', 'REUNION', 'PLAZO', 'TERMINO')),
    usuario_id INTEGER REFERENCES usuarios(id),
    expediente_id UUID REFERENCES expedientes(id) ON DELETE SET NULL,
    audiencia_id INTEGER REFERENCES audiencias(id) ON DELETE SET NULL,
    termino_id INTEGER REFERENCES terminos(id) ON DELETE SET NULL, -- Relación agregada
    todo_el_dia BOOLEAN DEFAULT FALSE,
    color VARCHAR(7) DEFAULT '#3788d8',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 11. recordatorios

```sql
CREATE TABLE recordatorios (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    repetir VARCHAR(50) DEFAULT 'NUNCA',
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE
);
```

## 📝 Consultas SQL Clave

### 1. Dashboard de Dirección (Carga de Trabajo)

Permite visualizar qué abogados tienen más audiencias programadas y términos por vencer.

```sql
SELECT 
    u.nombre as abogado,
    g.nombre as gerencia,
    COUNT(DISTINCT a.id) as audiencias_pendientes,
    COUNT(DISTINCT t.id) as terminos_activos
FROM usuarios u
LEFT JOIN gerencias g ON u.gerencia_id = g.id
LEFT JOIN audiencias a ON a.abogado_id = u.id AND a.estado = 'PROGRAMADA'
LEFT JOIN terminos t ON t.abogado_id = u.id AND t.estatus != 'Concluido'
WHERE u.activo = TRUE
GROUP BY u.id, g.nombre
ORDER BY audiencias_pendientes DESC;
```

### 2. Notificaciones para Dirección (Regla de Negocio)

Obtiene las alertas no leídas específicas para roles directivos.

```sql
SELECT n.* FROM notificaciones n
JOIN usuarios u ON n.usuario_id = u.id
WHERE u.rol = 'DIRECCION' 
AND n.leida = FALSE
AND n.event_type IN ('audiencia', 'termino');
```

## 🚀 Plan de Migración de Base de Datos

- **Limpieza de Datos (LocalStorage)**: Asegurar que los campos de texto libre (como nombres de abogados en audiencias) se normalicen para coincidir con los usuarios registrados.
- **Schema Setup**: Ejecutar el DDL de PostgreSQL presentado arriba.
- **Migración de Catálogos**: Cargar Gerencias y Materias (respetando la nueva regla 1:1 entre Materia-Gerencia).
- **Migración de Usuarios**: Crear usuarios y asignar sus gerencia_id.
- **Migración Transaccional**: Mover Expedientes -> Audiencias -> Términos.
- **Validación**: Verificar que las notificaciones de prueba lleguen al rol DIRECCION.

## 📅 Estado: Consolidado (Enero 2025)
## 🔒 Seguridad Frontend: Validación de entrada, sanitización, gestión de sesión segura
## 🔒 Seguridad Base de Datos: Hash bcrypt, Roles (RBAC), Logs de auditoría en Timeline
## 📈 Escalabilidad: Arquitectura modular frontend, base de datos relacional PostgreSQL, componentes reutilizables, patrones de diseño establecidos
