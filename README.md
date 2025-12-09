# 🏛️ Sistema Jurídico GOB.MX V3 - Propuesta de Base de Datos

## 📋 Descripción del Proyecto

Este proyecto es un sistema integral de gestión jurídica desarrollado para instituciones gubernamentales mexicanas, siguiendo las directrices de diseño GOB.MX V3. El sistema modular permite gestionar usuarios, expedientes, audiencias, calendario, notificaciones y otros aspectos del proceso jurídico.

Actualmente, el sistema utiliza localStorage para persistencia de datos, lo cual limita la escalabilidad y el acceso multiusuario. Esta propuesta presenta una estructura de base de datos relacional que permitirá una gestión robusta y escalable de la información.

## 🗄️ Arquitectura de Base de Datos Propuesta

### Tecnologías Recomendadas
- **Base de Datos**: PostgreSQL (por su robustez y soporte JSON)
- **ORM**: Prisma / TypeORM (para migraciones y consultas tipadas)
- **Migración**: Scripts SQL para transición desde localStorage

### Diagrama de Relaciones (ERD Simplificado)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuarios  │─────│  Gerencias  │─────│   Materias  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌─────────────┐     ┌─────────────┐
│ Expedientes │─────│  Audiencias │
└─────────────┘     └─────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌─────────────┐     ┌─────────────┐
│   Timeline  │     │ Notificaciones│
└─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│  Calendario │
└─────────────┘
```

## 📊 Esquema de Tablas

### 1. `usuarios`
```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contraseña_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('SUBDIRECTOR', 'GERENTE', 'ABOGADO')),
    activo BOOLEAN DEFAULT TRUE,
    gerencia_id INTEGER REFERENCES gerencias(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos principales:**
- `id`: Identificador único
- `nombre`: Nombre completo del usuario
- `correo`: Email único
- `contraseña_hash`: Hash de contraseña (bcrypt)
- `rol`: Rol del usuario (SUBDIRECTOR, GERENTE, ABOGADO)
- `activo`: Estado del usuario
- `gerencia_id`: Referencia a gerencia asignada

### 2. `gerencias`
```sql
CREATE TABLE gerencias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos principales:**
- `id`: Identificador único
- `nombre`: Nombre de la gerencia
- `descripcion`: Descripción opcional

### 3. `materias`
```sql
CREATE TABLE materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos principales:**
- `id`: Identificador único
- `nombre`: Nombre de la materia jurídica (Civil, Penal, Laboral, etc.)

### 4. `gerencia_materias`
```sql
CREATE TABLE gerencia_materias (
    gerencia_id INTEGER REFERENCES gerencias(id) ON DELETE CASCADE,
    materia_id INTEGER REFERENCES materias(id) ON DELETE CASCADE,
    PRIMARY KEY (gerencia_id, materia_id)
);
```

**Relación muchos a muchos entre gerencias y materias.**

### 5. `usuario_materias`
```sql
CREATE TABLE usuario_materias (
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    materia_id INTEGER REFERENCES materias(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, materia_id)
);
```

**Relación muchos a muchos entre usuarios y materias asignadas.**

### 6. `expedientes`
```sql
CREATE TABLE expedientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(100) UNIQUE NOT NULL,
    actor VARCHAR(255),
    demandado VARCHAR(255),
    tribunal VARCHAR(255),
    materia_id INTEGER REFERENCES materias(id),
    abogado_id INTEGER REFERENCES usuarios(id),
    gerencia_id INTEGER REFERENCES gerencias(id),
    estado VARCHAR(50) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'ARCHIVADO', 'CONCLUIDO')),
    prioridad VARCHAR(20) DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')),
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_conclusion TIMESTAMP NULL
);
```

**Campos principales:**
- `id`: UUID como identificador único
- `numero`: Número único del expediente
- `actor`/`demandado`: Partes del proceso
- `tribunal`: Tribunal asignado
- `estado`: Estado del expediente
- `prioridad`: Nivel de prioridad

### 7. `audiencias`
```sql
CREATE TABLE audiencias (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    tipo VARCHAR(100) NOT NULL,
    fecha_hora TIMESTAMP NOT NULL,
    tribunal VARCHAR(255),
    sala VARCHAR(100),
    abogado_id INTEGER REFERENCES usuarios(id),
    estado VARCHAR(50) DEFAULT 'PROGRAMADA' CHECK (estado IN ('PROGRAMADA', 'REALIZADA', 'CANCELADA', 'POSPUESTA')),
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos principales:**
- `expediente_id`: Referencia al expediente
- `tipo`: Tipo de audiencia
- `fecha_hora`: Fecha y hora programada
- `estado`: Estado de la audiencia

### 8. `expediente_timeline`
```sql
CREATE TABLE expediente_timeline (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('CREACION', 'ACTUALIZACION', 'AUDIENCIA', 'CAMBIO_ESTADO', 'NOTA')),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- Para datos adicionales específicos del evento
);
```

**Campos principales:**
- `expediente_id`: Referencia al expediente
- `tipo`: Tipo de evento en el timeline
- `titulo`/`descripcion`: Información del evento
- `metadata`: Campo JSON para datos flexibles

### 9. `actividades`
```sql
CREATE TABLE actividades (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) CHECK (tipo IN ('TAREA', 'NOTA', 'RECORDATORIO')),
    prioridad VARCHAR(20) DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA')),
    estado VARCHAR(50) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA')),
    usuario_asignado_id INTEGER REFERENCES usuarios(id),
    usuario_creador_id INTEGER REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_limite TIMESTAMP NULL,
    fecha_completada TIMESTAMP NULL
);
```

**Campos principales:**
- `expediente_id`: Referencia al expediente
- `titulo`/`descripcion`: Detalles de la actividad
- `estado`: Estado de la actividad
- `fecha_limite`: Fecha límite opcional

### 10. `notificaciones`
```sql
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('AUDIENCIA', 'EXPEDIENTE', 'RECORDATORIO', 'SISTEMA')),
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    referencia_id VARCHAR(100) NULL, -- ID del elemento relacionado (expediente, audiencia, etc.)
    metadata JSONB
);
```

**Campos principales:**
- `usuario_id`: Usuario destinatario
- `titulo`/`mensaje`: Contenido de la notificación
- `tipo`: Tipo de notificación
- `leida`: Estado de lectura

### 11. `eventos_calendario`
```sql
CREATE TABLE eventos_calendario (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('AUDIENCIA', 'RECORDATORIO', 'REUNION', 'PLAZO')),
    usuario_id INTEGER REFERENCES usuarios(id),
    expediente_id UUID REFERENCES expedientes(id) ON DELETE SET NULL,
    audiencia_id INTEGER REFERENCES audiencias(id) ON DELETE SET NULL,
    todo_el_dia BOOLEAN DEFAULT FALSE,
    color VARCHAR(7) DEFAULT '#3788d8', -- Hex color
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Campos principales:**
- `titulo`: Título del evento
- `fecha_inicio`/`fecha_fin`: Duración del evento
- `tipo`: Tipo de evento
- `color`: Color para visualización

### 12. `recordatorios`
```sql
CREATE TABLE recordatorios (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_hora TIMESTAMP NOT NULL,
    repetir VARCHAR(50) CHECK (repetir IN ('NUNCA', 'DIARIO', 'SEMANAL', 'MENSUAL', 'ANUAL')),
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_ultima_ejecucion TIMESTAMP NULL
);
```

**Campos principales:**
- `titulo`/`descripcion`: Contenido del recordatorio
- `fecha_hora`: Fecha y hora del recordatorio
- `repetir`: Frecuencia de repetición

## 🔗 Relaciones entre Tablas

### Relaciones Uno a Muchos (1:N)

| Tabla Origen | Campo | Tabla Destino | Descripción |
|--------------|-------|---------------|-------------|
| `usuarios` | `gerencia_id` | `gerencias` | Un usuario pertenece a una gerencia |
| `expedientes` | `materia_id` | `materias` | Un expediente tiene una materia jurídica |   ----a revisar----
| `expedientes` | `abogado_id` | `usuarios` | Un expediente es asignado a un abogado |
| `expedientes` | `gerencia_id` | `gerencias` | Un expediente pertenece a una gerencia |
| `audiencias` | `expediente_id` | `expedientes` | Una audiencia pertenece a un expediente |
| `audiencias` | `abogado_id` | `usuarios` | Una audiencia es asignada a un abogado |   -----pierde acceso total el abogado si comparece----
| `expediente_timeline` | `expediente_id` | `expedientes` | Un evento del timeline pertenece a un expediente |
| `expediente_timeline` | `usuario_id` | `usuarios` | Un evento del timeline es creado por un usuario |
| `actividades` | `expediente_id` | `expedientes` | Una actividad pertenece a un expediente |
| `actividades` | `usuario_asignado_id` | `usuarios` | Una actividad es asignada a un usuario |  ----revisar a que se refiere con actividad---
| `actividades` | `usuario_creador_id` | `usuarios` | Una actividad es creada por un usuario |
| `notificaciones` | `usuario_id` | `usuarios` | Una notificación pertenece a un usuario |  ---consultar a mayra si se quiere enterar de todos los eventos del termino o solo del suyo----
| `eventos_calendario` | `usuario_id` | `usuarios` | Un evento del calendario pertenece a un usuario |
| `eventos_calendario` | `expediente_id` | `expedientes` | Un evento puede estar relacionado con un expediente (opcional) |
| `eventos_calendario` | `audiencia_id` | `audiencias` | Un evento puede estar relacionado con una audiencia (opcional) |
-------agregar terminos------
| `recordatorios` | `usuario_id` | `usuarios` | Un recordatorio pertenece a un usuario |
| `recordatorios` | `expediente_id` | `expedientes` | Un recordatorio puede estar relacionado con un expediente (opcional) |

### Relaciones Muchos a Muchos (N:M)

| Tabla Intermedia | Tabla 1 | Tabla 2 | Descripción |
|------------------|---------|---------|-------------|
| `gerencia_materias` | `gerencias` | `materias` | Una gerencia puede tener múltiples materias, una materia puede pertenecer a múltiples gerencias |
| `usuario_materias` | `usuarios` | `materias` | Un usuario puede tener múltiples materias asignadas, una materia puede ser asignada a múltiples usuarios |

### Reglas de Integridad Referencial

- **ON DELETE CASCADE**: Cuando se elimina un registro padre, se eliminan automáticamente los registros hijos relacionados
  - `gerencia_materias` (al eliminar gerencia o materia)
  - `usuario_materias` (al eliminar usuario o materia)
  - `audiencias` (al eliminar expediente)
  - `expediente_timeline` (al eliminar expediente)
  - `actividades` (al eliminar expediente)
  - `notificaciones` (al eliminar usuario)
  - `recordatorios` (al eliminar usuario)

- **ON DELETE SET NULL**: Cuando se elimina un registro padre, el campo de referencia se establece en NULL
  - `eventos_calendario.expediente_id` (al eliminar expediente)
  - `eventos_calendario.audiencia_id` (al eliminar audiencia)
  - `recordatorios.expediente_id` (al eliminar expediente)

### Dependencias Circulares y Consideraciones

- **Usuarios y Gerencias**: Los usuarios dependen de gerencias, pero las gerencias no dependen directamente de usuarios específicos
- **Expedientes**: Dependen de usuarios (abogados), gerencias y materias, creando una red de dependencias que asegura consistencia organizacional
- **Auditoría**: Las tablas de timeline y actividades mantienen historial que no debe perderse al eliminar entidades relacionadas

## 🔗 Índices Recomendados

```sql
-- Índices para búsquedas frecuentes
CREATE INDEX idx_expedientes_numero ON expedientes(numero);
CREATE INDEX idx_expedientes_estado ON expedientes(estado);
CREATE INDEX idx_expedientes_abogado ON expedientes(abogado_id);
CREATE INDEX idx_expedientes_gerencia ON expedientes(gerencia_id);
CREATE INDEX idx_audiencias_fecha ON audiencias(fecha_hora);
CREATE INDEX idx_audiencias_expediente ON audiencias(expediente_id);
CREATE INDEX idx_notificaciones_usuario_fecha ON notificaciones(usuario_id, fecha_creacion DESC);
CREATE INDEX idx_eventos_calendario_fecha ON eventos_calendario(fecha_inicio);
CREATE INDEX idx_timeline_expediente_fecha ON expediente_timeline(expediente_id, fecha DESC);
```

## 📝 Consultas SQL de Ejemplo

### Obtener expedientes por abogado
```sql
SELECT e.*, u.nombre as abogado_nombre, g.nombre as gerencia_nombre, m.nombre as materia_nombre
FROM expedientes e
LEFT JOIN usuarios u ON e.abogado_id = u.id
LEFT JOIN gerencias g ON e.gerencia_id = g.id
LEFT JOIN materias m ON e.materia_id = m.id
WHERE e.abogado_id = $1 AND e.activo = true
ORDER BY e.fecha_actualizacion DESC;
```

### Audiencias del día
```sql
SELECT a.*, e.numero as expediente_numero, e.actor, u.nombre as abogado_nombre
FROM audiencias a
JOIN expedientes e ON a.expediente_id = e.id
LEFT JOIN usuarios u ON a.abogado_id = u.id
WHERE DATE(a.fecha_hora) = CURRENT_DATE
  AND a.estado = 'PROGRAMADA'
ORDER BY a.fecha_hora;
```

### Dashboard - Estadísticas
```sql
-- Total expedientes por estado
SELECT estado, COUNT(*) as total
FROM expedientes
WHERE activo = true
GROUP BY estado;

-- Audiencias por mes
SELECT
  DATE_TRUNC('month', fecha_hora) as mes,
  COUNT(*) as total_audiencias
FROM audiencias
WHERE fecha_hora >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
GROUP BY DATE_TRUNC('month', fecha_hora)
ORDER BY mes;
```

## 🔄 Migración desde localStorage

### Estrategia de Migración
1. **Backup**: Crear respaldo completo de datos actuales
2. **Scripts de migración**: Convertir datos JSON a estructura relacional
3. **Validación**: Verificar integridad de datos migrados
4. **Rollback**: Plan de reversión en caso de errores

### Script de Migración de Ejemplo (Pseudocódigo)
```javascript
// Leer datos de localStorage
const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
const gerencias = JSON.parse(localStorage.getItem('gerencias') || '[]');
const expedientes = JSON.parse(localStorage.getItem('expedientes') || '[]');

// Insertar en base de datos
for (const usuario of usuarios) {
  await db.usuarios.create({
    data: {
      nombre: usuario.nombre,
      correo: usuario.correo,
      // ... otros campos
    }
  });
}
```

## 🚀 Próximos Pasos

### Implementación Fase 1
- [ ] Configurar PostgreSQL y conexión
- [ ] Crear esquema de base de datos
- [ ] Implementar modelos/ORM
- [ ] Migrar datos existentes
- [ ] Actualizar módulos para usar API en lugar de localStorage

### Implementación Fase 2
- [ ] Implementar autenticación JWT
- [ ] Agregar permisos por rol
- [ ] Crear API REST endpoints
- [ ] Implementar logging de auditoría
- [ ] Agregar índices de búsqueda full-text

### Implementación Fase 3
- [ ] Implementar cache (Redis)
- [ ] Agregar respaldo automático
- [ ] Implementar notificaciones push
- [ ] Crear dashboard de analytics
- [ ] Optimizar consultas complejas

## 📊 Consideraciones de Performance

### Optimizaciones
- **Paginación**: Implementar en listados largos
- **Cache**: Usar Redis para datos frecuentemente accedidos
- **Índices**: Crear índices compuestos para consultas complejas
- **Particionamiento**: Considerar particionar tablas grandes por fecha

### Monitoreo
- Queries lentas (>100ms)
- Uso de memoria de la base de datos
- Conexiones activas
- Tamaño de tablas

## 🔒 Seguridad

### Medidas Implementadas
- **Hash de contraseñas**: bcrypt con salt
- **Validación de entrada**: Sanitización de datos
- **Autenticación**: JWT tokens
- **Autorización**: Control de acceso por roles
- **Auditoría**: Logging de cambios sensibles

### Políticas de Retención
- **Datos activos**: Mantener indefinidamente
- **Logs de auditoría**: 7 años mínimo
- **Backups**: Retener 30 días
- **Datos temporales**: Purgar automáticamente

---

**📅 Última actualización**: Diciembre 2024
**👥 Autor**: Equipo de Desarrollo GOB.MX
**📧 Contacto**: desarrollo@juridico.gob.mx
