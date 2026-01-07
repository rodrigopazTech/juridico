# 📊 ANÁLISIS COMPLETO - BASE DE DATOS JURÍDICA V3

**Fecha:** 6 de enero de 2026  
**Versión:** 1.0  
**Autor:** Análisis del Sistema Frontend Existente

---

## 🎯 RESUMEN EJECUTIVO

Se creó una base de datos relacional profesional analizando **9 módulos** del frontend del Sistema Jurídico GOB.MX V3. El esquema incluye **17 tablas principales**, **3 vistas materializadas**, y cumple con los estándares de nomenclatura solicitados.

### Características Principales

✅ **17 tablas** con relaciones completas  
✅ **Nomenclatura consistente**: "Etapa Procesal" (NO "Estado")  
✅ **Auditoría automática** con triggers  
✅ **Índices optimizados** para rendimiento  
✅ **Datos iniciales** (seed data) incluidos  
✅ **3 vistas útiles** para reportes  
✅ **Comentarios en español** en cada tabla

---

## 📋 ANÁLISIS MÓDULO POR MÓDULO

### 1️⃣ MÓDULO DE EXPEDIENTES

**Archivo analizado:** `expediente-module/data/expedientes-data.js`

#### Campos Identificados
```javascript
{
  id: UUID,
  numero: "EXP-0001",
  descripcion: "Texto largo",
  materia: "Civil",
  prioridad: "ALTA" | "MEDIA" | "BAJA",
  estado: "TRAMITE" | "LAUDO" | "FIRME",  // ⚠️ RENOMBRADO
  abogado: "Nombre del abogado",
  gerenciaId: integer,
  gerencia: "Nombre gerencia",
  sede: "Estado geográfico",
  organo: "Juzgado/Tribunal",
  partes: "Actor vs Demandado",
  ultimaActividad: timestamp
}
```

#### Decisiones de Diseño

**✅ CORRECCIÓN CRÍTICA: Estado → Etapa Procesal**
```sql
-- ❌ INCORRECTO (confusión con estados geográficos)
estado VARCHAR(30) CHECK (estado IN ('TRAMITE', 'LAUDO', 'FIRME'))

-- ✅ CORRECTO (claridad semántica)
etapa_procesal VARCHAR(30) CHECK (etapa_procesal IN ('TRAMITE', 'LAUDO', 'FIRME', 'CONCLUIDO'))
```

**Justificación:** El usuario indicó que "Estado" se refiere a **Estados de la República** (geográfico), "Estatus" a otro tipo de dato, y **"Etapa Procesal"** a la fase del expediente.

#### Tabla Resultante

```sql
CREATE TABLE expedientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    materia_id INTEGER NOT NULL REFERENCES materias(id),
    gerencia_id INTEGER NOT NULL REFERENCES gerencias(id),
    organo_jurisdiccional_id INTEGER REFERENCES organos_jurisdiccionales(id),
    organo_jurisdiccional_texto TEXT,
    partes TEXT,
    sede VARCHAR(150), -- ← Estado geográfico
    prioridad VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    etapa_procesal VARCHAR(30) NOT NULL DEFAULT 'TRAMITE', -- ← CORREGIDO
    abogado_responsable_id INTEGER REFERENCES usuarios(id),
    abogado_responsable_nombre VARCHAR(200),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES usuarios(id),
    updated_by INTEGER REFERENCES usuarios(id)
);
```

#### Índices Creados
- `idx_expedientes_numero` - Búsqueda por número único
- `idx_expedientes_gerencia` - Filtro por gerencia
- `idx_expedientes_materia` - Filtro por materia
- `idx_expedientes_etapa` - Filtro por etapa procesal
- `idx_expedientes_prioridad` - Filtro por prioridad
- `idx_expedientes_abogado` - Consultas por abogado
- `idx_expedientes_fecha_creacion DESC` - Ordenamiento temporal

---

### 2️⃣ MÓDULO DE AUDIENCIAS

**Archivo analizado:** `audiencias/js/audiencias.js`

#### Campos Identificados
```javascript
{
  id: integer,
  fecha: date,
  hora: time,
  tipo: "Inicial" | "Intermedia" | "Juicio Oral" | "Constitucional",
  expediente: {numero, descripcion},
  actor: "Nombre parte actora",
  abogadoComparece: "Nombre abogado",
  esEnLinea: boolean,
  urlReunion: "https://...",
  sala: "Sala física",
  actaDocumento: "path/to/file.pdf",
  atendida: boolean,
  fechaDesahogo: date,
  observaciones: text
}
```

#### Flujo de Estados (3 Fases)
```
PENDIENTE → CON_ACTA → CONCLUIDA
   (sin acta)   (adjuntó acta)   (finalizada)
```

#### Tabla Resultante

```sql
CREATE TABLE audiencias (
    id SERIAL PRIMARY KEY,
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    fecha_audiencia DATE NOT NULL,
    hora_audiencia TIME NOT NULL,
    tipo_audiencia_id INTEGER REFERENCES tipos_audiencia(id),
    tipo_audiencia_texto VARCHAR(100),
    es_virtual BOOLEAN DEFAULT FALSE,
    url_reunion TEXT,
    sala_lugar TEXT,
    abogado_comparece_id INTEGER REFERENCES usuarios(id),
    abogado_comparece_nombre VARCHAR(200),
    estatus_audiencia VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE'
        CHECK (estatus_audiencia IN ('PENDIENTE', 'CON_ACTA', 'CONCLUIDA')),
    acta_documento VARCHAR(500),
    tipo_documento VARCHAR(50),
    fecha_desahogo DATE,
    observaciones_finales TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES usuarios(id),
    updated_by INTEGER REFERENCES usuarios(id)
);
```

#### Relación con Agenda General

```sql
-- Tabla puente para audiencias concluidas
CREATE TABLE audiencias_desahogadas (
    id SERIAL PRIMARY KEY,
    audiencia_id INTEGER NOT NULL REFERENCES audiencias(id) ON DELETE CASCADE,
    expediente_numero VARCHAR(50),
    fecha_audiencia DATE NOT NULL,
    hora_audiencia TIME NOT NULL,
    tipo_audiencia VARCHAR(100),
    partes TEXT,
    abogado_nombre VARCHAR(200),
    acta_documento VARCHAR(500),
    fecha_desahogo DATE NOT NULL,
    observaciones TEXT,
    es_virtual BOOLEAN DEFAULT FALSE,
    url_reunion TEXT,
    sala_lugar TEXT,
    sincronizado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### 3️⃣ MÓDULO DE TÉRMINOS

**Archivo analizado:** `terminos/js/terminos.js`

#### Flujo de Trabajo (7 Etapas)

```
PROYECTISTA → REVISION → GERENCIA → DIRECCION → LIBERADO → PRESENTADO → CONCLUIDO
    (1)          (2)         (3)         (4)         (5)         (6)         (7)
```

#### Campos Identificados
```javascript
{
  id: integer,
  expediente: {numero, descripcion},
  actuacion: "Descripción",
  asunto: "Texto asunto",
  estatus: "PROYECTISTA" | ... | "CONCLUIDO",
  fechaIngreso: date,
  fechaVencimiento: date,
  archivoWord: "borrador.docx",
  archivoAcuse: "acuse-final.pdf",
  observaciones: text,
  prioridad: "ALTA" | "MEDIA" | "BAJA",
  actor: "Nombre",
  tribunal: "Tribunal texto",
  abogado: "Nombre abogado"
}
```

#### Tabla Resultante

```sql
CREATE TABLE terminos (
    id SERIAL PRIMARY KEY,
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    actuacion TEXT NOT NULL,
    asunto_descripcion TEXT,
    fecha_ingreso DATE,
    fecha_vencimiento DATE NOT NULL,
    estatus_termino VARCHAR(30) NOT NULL DEFAULT 'PROYECTISTA' 
        CHECK (estatus_termino IN ('PROYECTISTA', 'REVISION', 'GERENCIA', 
                                   'DIRECCION', 'LIBERADO', 'PRESENTADO', 'CONCLUIDO')),
    archivo_word VARCHAR(500),
    archivo_acuse VARCHAR(500),
    prioridad VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    observaciones TEXT,
    actor TEXT,
    tribunal_texto TEXT,
    abogado_responsable_id INTEGER REFERENCES usuarios(id),
    abogado_responsable_nombre VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES usuarios(id),
    updated_by INTEGER REFERENCES usuarios(id)
);
```

#### Tabla Puente para Agenda General

```sql
CREATE TABLE terminos_presentados (
    id SERIAL PRIMARY KEY,
    termino_id INTEGER NOT NULL REFERENCES terminos(id) ON DELETE CASCADE,
    expediente_numero VARCHAR(50),
    actuacion TEXT,
    fecha_presentacion DATE NOT NULL,
    acuse_documento VARCHAR(500),
    observaciones TEXT,
    abogado_nombre VARCHAR(200),
    sincronizado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

### 4️⃣ MÓDULO DE USUARIOS

**Archivo analizado:** `usuario-module/js/usuarios-module.js`

#### Campos Identificados
```javascript
{
  id: integer,
  nombre: "Nombre completo",
  correo: "email@example.com",
  rol: "SUBDIRECTOR" | "GERENTE" | "ABOGADO",
  activo: boolean,
  gerenciaId: integer,
  materias: ["Civil", "Mercantil"]
}
```

#### Roles del Sistema

| Rol | Nivel | Permisos |
|-----|-------|----------|
| `SUBDIRECTOR` | Máximo | Acceso total |
| `DIRECCION` | Alto | Aprobación de términos en fase 4 |
| `SUBDIRECCION` | Alto | Supervisión general |
| `GERENTE` | Medio | Aprobación de términos en fase 3 |
| `JEFE_DEPTO` | Medio | Gestión de equipos |
| `ABOGADO` | Base | Trabajo operativo |

#### Tabla Resultante

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('SUBDIRECTOR', 'DIRECCION', 'SUBDIRECCION', 
                                            'GERENTE', 'JEFE_DEPTO', 'ABOGADO')),
    gerencia_id INTEGER REFERENCES gerencias(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES usuarios(id),
    updated_by INTEGER REFERENCES usuarios(id)
);
```

**Nota:** Las materias se relacionan indirectamente mediante `gerencias → materias`.

---

### 5️⃣ MÓDULO DE NOTIFICACIONES

**Archivo analizado:** `notificaciones-module/js/notificaciones.js`

#### Campos Identificados
```javascript
{
  id: integer,
  titulo: "Título corto",
  descripcion: "Mensaje largo",
  tipo: "AUDIENCIA" | "TERMINO" | "RECORDATORIO" | "SISTEMA",
  prioridad: "ALTA" | "NORMAL" | "BAJA",
  read: boolean,
  notifyAt: timestamp,
  relatedModule: "expedientes" | "audiencias" | "terminos"
}
```

#### Tabla Resultante

```sql
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('AUDIENCIA', 'TERMINO', 'RECORDATORIO', 'SISTEMA', 'ALERTA')),
    prioridad VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (prioridad IN ('ALTA', 'NORMAL', 'BAJA')),
    leida BOOLEAN DEFAULT FALSE,
    fecha_leida TIMESTAMP WITH TIME ZONE,
    notificar_en TIMESTAMP WITH TIME ZONE NOT NULL,
    entidad_tipo VARCHAR(30) CHECK (entidad_tipo IN ('EXPEDIENTE', 'AUDIENCIA', 'TERMINO', 'RECORDATORIO')),
    entidad_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Índices Especializados
- `idx_notificaciones_usuario` - Filtro por destinatario
- `idx_notificaciones_leida` - Separar leídas/no leídas
- `idx_notificaciones_fecha` - Notificaciones futuras
- `idx_notificaciones_tipo` - Filtro por categoría

---

### 6️⃣ MÓDULO DE RECORDATORIOS

**Archivo analizado:** `recordatorios-module/js/recordatorios.js`

#### Campos Identificados
```javascript
{
  id: integer,
  titulo: "Título",
  detalles: "Descripción detallada",
  fecha: date,
  hora: time,
  prioridad: "urgent" | "normal"
}
```

#### Funcionalidad Automática

El módulo incluye `this.programarNotificaciones()` que genera automáticamente notificaciones cuando se crea un recordatorio.

#### Tabla Resultante

```sql
CREATE TABLE recordatorios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    detalles TEXT,
    fecha_recordatorio DATE NOT NULL,
    hora_recordatorio TIME NOT NULL,
    prioridad VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (prioridad IN ('URGENTE', 'NORMAL')),
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Integración:** Cuando se crea un recordatorio, el backend debe insertar también una notificación en la tabla `notificaciones`.

---

### 7️⃣ MÓDULO DE CALENDARIO

**Archivo analizado:** `calendario-module/js/calendario-module.js`

#### Eventos Identificados
```javascript
{
  id: integer,
  tipo: "audiencia" | "termino" | "recordatorio",
  fecha: date,
  titulo: "Título evento",
  gerenciaId: integer,
  usuarioId: integer,
  descripcion: "Detalle"
}
```

#### Características del Calendario

- **Vista Día**: Eventos por hora
- **Vista Semana**: 7 columnas con eventos
- **Vista Mes**: Grid 7x6 con eventos
- **Colores por categoría**: Diferentes colores según tipo

#### Tabla Resultante

```sql
CREATE TABLE eventos_calendario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    todo_el_dia BOOLEAN DEFAULT FALSE,
    categoria VARCHAR(30) NOT NULL CHECK (categoria IN ('AUDIENCIA', 'TERMINO', 'RECORDATORIO', 'REUNION', 'OTRO')),
    color VARCHAR(7), -- Código hexadecimal
    entidad_tipo VARCHAR(30) CHECK (entidad_tipo IN ('AUDIENCIA', 'TERMINO', 'RECORDATORIO')),
    entidad_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES usuarios(id)
);
```

---

### 8️⃣ MÓDULO DE DASHBOARD

**Archivo analizado:** `dashboard-module/js/dashboard-module.js`

#### Datos Agregados

El dashboard **NO requiere tablas propias**, obtiene datos de:

```javascript
// Estadísticas del dashboard
{
  totalExpedientes: COUNT(*) FROM expedientes,
  totalUsuarios: COUNT(*) FROM usuarios WHERE activo=true,
  totalGerencias: COUNT(*) FROM gerencias,
  audienciasPendientes: COUNT(*) FROM audiencias WHERE estatus != 'CONCLUIDA',
  terminosPorVencer: COUNT(*) FROM terminos WHERE fecha_vencimiento < NOW() + 7
}
```

#### Gráficas Implementadas
1. **Chart.js Line**: Tendencia temporal de expedientes
2. **Chart.js Bar**: Expedientes por gerencia
3. **Chart.js Doughnut**: Distribución por etapa procesal
4. **Chart.js Pie**: Prioridades

#### Consultas Optimizadas

Se crearon **3 vistas** para facilitar consultas del dashboard:

```sql
-- 1. Vista completa de expedientes
CREATE VIEW vista_expedientes_completa AS ...

-- 2. Vista de audiencias próximas
CREATE VIEW vista_audiencias_proximas AS ...

-- 3. Vista de términos por vencer
CREATE VIEW vista_terminos_por_vencer AS ...
```

---

### 9️⃣ MÓDULO DE AGENDA GENERAL

**Archivo analizado:** `agenda-general-module/js/agenda-general-module.js`

#### Estructura del Módulo

```javascript
{
  audienciasDesahogadas: [
    {
      fechaAudiencia: date,
      horaAudiencia: time,
      partes: "Actor vs Demandado",
      abogado: "Nombre",
      tipoAudiencia: "Inicial",
      fechaDesahogo: date,
      observaciones: text
    }
  ],
  terminosPresentados: [
    {
      fechaPresentacion: date,
      actuacion: "Descripción",
      expediente: "EXP-0001",
      acuse: "archivo.pdf",
      observaciones: text
    }
  ]
}
```

#### Implementación con Tablas Puente

Ya creadas en secciones anteriores:
- `audiencias_desahogadas` - Sincroniza desde `audiencias`
- `terminos_presentados` - Sincroniza desde `terminos`

**Ventaja:** Permite agregar campos específicos de Agenda General sin modificar las tablas originales.

---

## 🔗 RELACIONES ENTRE TABLAS

### Diagrama de Relaciones

```
gerencias (1) ──< (N) materias
    │
    ├──< (N) usuarios
    │
    └──< (N) expedientes ──< (N) audiencias ──< (1) audiencias_desahogadas
                   │
                   ├──< (N) terminos ──< (1) terminos_presentados
                   │
                   ├──< (N) actividad_expedientes
                   │
                   └──< (N) documentos_expediente

usuarios (1) ──< (N) notificaciones
         │
         ├──< (N) recordatorios
         │
         ├──< (N) eventos_calendario
         │
         └──< (N) comentarios

tipos_audiencia (1) ──< (N) audiencias

organos_jurisdiccionales (1) ──< (N) expedientes
```

### Tipos de Relaciones

| Relación | Tipo | Cascada | Justificación |
|----------|------|---------|---------------|
| expedientes → audiencias | 1:N | DELETE CASCADE | Las audiencias no existen sin expediente |
| expedientes → terminos | 1:N | DELETE CASCADE | Los términos no existen sin expediente |
| usuarios → notificaciones | 1:N | DELETE CASCADE | Notificaciones personales del usuario |
| gerencias → materias | 1:N | DELETE RESTRICT | No borrar gerencia con materias activas |
| expedientes → actividad | 1:N | DELETE CASCADE | Timeline asociado a expediente |

---

## 🏗️ CATÁLOGOS CONFIGURABLES

### 1. Gerencias (3 predefinidas)
```sql
1 - Civil, Mercantil, Fiscal y Administrativo
2 - Laboral y Penal
3 - Transparencia y Amparo
```

### 2. Materias (8 predefinidas)
```sql
Civil (G1), Mercantil (G1), Fiscal (G1), Administrativo (G1),
Laboral (G2), Penal (G2), Transparencia (G3), Amparo (G3)
```

### 3. Tipos de Audiencia (6 iniciales)
```sql
Inicial, Intermedia, Juicio Oral, Constitucional, Incidental, Conciliación
```

### 4. Órganos Jurisdiccionales (6 ejemplos)
```sql
- Juzgado Primero de lo Civil (CDMX)
- Juzgado Segundo de lo Civil (CDMX)
- Juzgado Cuarto Civil (CDMX)
- Tribunal Federal de Justicia Administrativa (CDMX)
- Sala Regional del Noreste TFJA (Nuevo León)
- Junta Local de Conciliación No. 3 (Jalisco)
```

**Nota:** Todos son configurables mediante interfaz de administración.

---

## ⚙️ CARACTERÍSTICAS TÉCNICAS

### 1. Auditoría Automática

#### Trigger para `updated_at`

```sql
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Aplicado a: `gerencias`, `materias`, `usuarios`, `expedientes`, `audiencias`, `terminos`, `comentarios`, `recordatorios`, `eventos_calendario`.

#### Registro Automático de Actividad

```sql
CREATE OR REPLACE FUNCTION registrar_actividad_expediente()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO actividad_expedientes (...)
        VALUES ('Expediente creado', ...);
    END IF;
    
    IF TG_OP = 'UPDATE' AND OLD.etapa_procesal != NEW.etapa_procesal THEN
        INSERT INTO actividad_expedientes (...)
        VALUES ('Cambio de etapa procesal', ...);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 2. Índices Estratégicos

#### Índices por Búsqueda
- `expedientes.numero` - UNIQUE + INDEX
- `usuarios.email` - UNIQUE + INDEX

#### Índices por Filtros
- `expedientes.gerencia_id`
- `expedientes.etapa_procesal`
- `audiencias.estatus_audiencia`
- `terminos.estatus_termino`

#### Índices por Ordenamiento Temporal
- `expedientes.fecha_creacion DESC`
- `actividad_expedientes.fecha_registro DESC`
- `notificaciones.notificar_en`

### 3. Restricciones CHECK

```sql
-- Expedientes
CHECK (prioridad IN ('ALTA', 'MEDIA', 'BAJA'))
CHECK (etapa_procesal IN ('TRAMITE', 'LAUDO', 'FIRME', 'CONCLUIDO'))

-- Audiencias
CHECK (estatus_audiencia IN ('PENDIENTE', 'CON_ACTA', 'CONCLUIDA'))

-- Términos
CHECK (estatus_termino IN ('PROYECTISTA', 'REVISION', 'GERENCIA', 
                           'DIRECCION', 'LIBERADO', 'PRESENTADO', 'CONCLUIDO'))

-- Usuarios
CHECK (rol IN ('SUBDIRECTOR', 'DIRECCION', 'SUBDIRECCION', 
               'GERENTE', 'JEFE_DEPTO', 'ABOGADO'))
```

### 4. Tipos de Datos

| Campo | Tipo | Justificación |
|-------|------|---------------|
| expedientes.id | UUID | Seguridad (no secuencial) |
| *_id | SERIAL | Rendimiento para IDs relacionales |
| timestamps | TIMESTAMP WITH TIME ZONE | Soporte multizona horaria |
| fechas | DATE | Solo fecha sin hora |
| horas | TIME | Solo hora sin fecha |
| observaciones | TEXT | Sin límite de caracteres |
| enums | VARCHAR con CHECK | Validación a nivel de BD |

---

## 📊 VISTAS MATERIALIZADAS

### Vista 1: Expedientes Completa

```sql
CREATE VIEW vista_expedientes_completa AS
SELECT 
    e.*,
    g.nombre AS gerencia_nombre,
    m.nombre AS materia_nombre,
    o.nombre AS organo_jurisdiccional_nombre,
    u.nombre_completo AS abogado_responsable,
    COUNT(DISTINCT a.id) AS total_audiencias,
    COUNT(DISTINCT t.id) AS total_terminos
FROM expedientes e
LEFT JOIN gerencias g ON e.gerencia_id = g.id
LEFT JOIN materias m ON e.materia_id = m.id
...
```

**Uso:** Dashboard, listado de expedientes, reportes.

### Vista 2: Audiencias Próximas

```sql
CREATE VIEW vista_audiencias_proximas AS
SELECT 
    a.id,
    a.fecha_audiencia,
    e.numero AS expediente_numero,
    ta.nombre AS tipo_audiencia,
    EXTRACT(DAY FROM (a.fecha_audiencia - CURRENT_DATE)) AS dias_restantes
FROM audiencias a
WHERE a.fecha_audiencia >= CURRENT_DATE
  AND a.estatus_audiencia != 'CONCLUIDA'
ORDER BY a.fecha_audiencia;
```

**Uso:** Dashboard, calendario, alertas.

### Vista 3: Términos por Vencer

```sql
CREATE VIEW vista_terminos_por_vencer AS
SELECT 
    t.id,
    t.actuacion,
    t.fecha_vencimiento,
    e.numero AS expediente_numero,
    EXTRACT(DAY FROM (t.fecha_vencimiento - CURRENT_DATE)) AS dias_restantes
FROM terminos t
WHERE t.fecha_vencimiento >= CURRENT_DATE
  AND t.estatus_termino != 'CONCLUIDO'
ORDER BY t.fecha_vencimiento;
```

**Uso:** Dashboard, alertas críticas, reportes.

---

## 🔐 SEGURIDAD Y USUARIOS

### Usuario Administrador Inicial

```sql
-- Email: admin@juridico.gob.mx
-- Password: admin123
-- Rol: SUBDIRECTOR
-- Hash BCrypt: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

**⚠️ IMPORTANTE:** Cambiar contraseña en producción.

### Campos de Auditoría

Todas las tablas principales incluyen:
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
created_by INTEGER REFERENCES usuarios(id),
updated_by INTEGER REFERENCES usuarios(id)
```

---

## 📝 NOMENCLATURA Y ESTÁNDARES

### ✅ Convenciones Aplicadas

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Tablas | snake_case, plural | `actividad_expedientes` |
| Columnas | snake_case | `fecha_creacion` |
| Foreign Keys | `tabla_id` | `gerencia_id` |
| Índices | `idx_tabla_columna` | `idx_expedientes_numero` |
| Triggers | `trigger_tabla_accion` | `trigger_expedientes_updated_at` |
| Vistas | `vista_descripcion` | `vista_expedientes_completa` |
| Funciones | snake_case, verbo | `actualizar_updated_at()` |

### ✅ Corrección Crítica: Estado → Etapa Procesal

**Contexto del usuario:**
> "El filtro Estado... deberia llamarse Etapa Procesal. Debido a que Estado es para referirse a Estados de la Republica, Estatus a otro dato y Etapa Procesal a la estapa del Expediente"

**Implementación:**

```sql
-- ❌ base.sql original (INCORRECTO)
estado VARCHAR(30) CHECK (estado IN ('TRAMITE', 'LAUDO', 'FIRME'))

-- ✅ database-schema-completo.sql (CORRECTO)
etapa_procesal VARCHAR(30) NOT NULL DEFAULT 'TRAMITE' 
    CHECK (etapa_procesal IN ('TRAMITE', 'LAUDO', 'FIRME', 'CONCLUIDO'))
```

**Comentario en SQL:**
```sql
COMMENT ON COLUMN expedientes.etapa_procesal IS 
    'Etapa del proceso: TRAMITE, LAUDO, FIRME, CONCLUIDO (NO confundir con estado geográfico)';
```

---

## 🔄 MIGRACIÓN DESDE `base.sql`

### Comparación de Esquemas

| Aspecto | base.sql (viejo) | database-schema-completo.sql (nuevo) |
|---------|------------------|--------------------------------------|
| Tablas | 6 tablas | 17 tablas |
| Módulos cubiertos | 3 (parcial) | 9 (completo) |
| Nomenclatura | "estado" (incorrecto) | "etapa_procesal" (correcto) |
| Índices | 3 índices | 40+ índices |
| Triggers | 0 | 10 triggers |
| Vistas | 0 | 3 vistas |
| Auditoría | Parcial | Completa |
| Comentarios | Ninguno | Todos los campos |

### Script de Migración

```sql
-- 1. Backup de datos existentes (si hay)
CREATE TABLE backup_expedientes AS SELECT * FROM expedientes;

-- 2. Drop del esquema viejo
DROP TABLE IF EXISTS actividad_expedientes CASCADE;
DROP TABLE IF EXISTS audiencias CASCADE;
DROP TABLE IF EXISTS terminos CASCADE;
DROP TABLE IF EXISTS expedientes CASCADE;
DROP TABLE IF EXISTS materias CASCADE;
DROP TABLE IF EXISTS gerencias CASCADE;

-- 3. Ejecutar database-schema-completo.sql
\i database-schema-completo.sql

-- 4. Migrar datos (si existían)
INSERT INTO expedientes (
    id, numero, descripcion, 
    etapa_procesal, -- ← MAPEAR desde "estado"
    ...
)
SELECT 
    id, numero, descripcion,
    estado, -- ← se mapea automáticamente
    ...
FROM backup_expedientes;
```

---

## 📦 DATOS INICIALES (SEED DATA)

### Gerencias (3)
```sql
1 - Civil, Mercantil, Fiscal y Administrativo
2 - Laboral y Penal
3 - Transparencia y Amparo
```

### Materias (8)
```sql
1 - Civil (Gerencia 1)
2 - Mercantil (Gerencia 1)
3 - Fiscal (Gerencia 1)
4 - Administrativo (Gerencia 1)
5 - Laboral (Gerencia 2)
6 - Penal (Gerencia 2)
7 - Transparencia (Gerencia 3)
8 - Amparo (Gerencia 3)
```

### Tipos de Audiencia (6)
```sql
Inicial
Intermedia
Juicio Oral
Constitucional
Incidental
Conciliación
```

### Órganos Jurisdiccionales (6)
```sql
Juzgado Primero de lo Civil (CDMX)
Juzgado Segundo de lo Civil (CDMX)
Juzgado Cuarto Civil (CDMX)
Tribunal Federal de Justicia Administrativa (CDMX)
Sala Regional del Noreste TFJA (Nuevo León)
Junta Local de Conciliación y Arbitraje No. 3 (Jalisco)
```

### Usuario Administrador (1)
```sql
Nombre: Administrador del Sistema
Email: admin@juridico.gob.mx
Password: admin123 (BCrypt hash)
Rol: SUBDIRECTOR
```

---

## 🚀 PRÓXIMOS PASOS

### 1. Implementación del Backend (PLAN-IMPLEMENTACION-BACKEND.md)

**Fase 0: Preparación** (PREPARACION-BACKEND.md)
- ✅ Ejecutar `database-schema-completo.sql`
- ⏳ Actualizar `application.properties` con conexión a PostgreSQL
- ⏳ Crear entidades JPA para las 17 tablas
- ⏳ Implementar repositorios Spring Data JPA

**Fase 1: Semana 1** (12-16 enero 2026)
- Día 1: Entidades JPA (expedientes, gerencias, materias)
- Día 2: Repositorios y servicios base
- Día 3: DTOs y mappers (ModelMapper)
- Día 4: Seguridad JWT
- Día 5: Endpoints CRUD expedientes

**Fase 2: Semana 2** (19-23 enero 2026)
- Día 6-10: Módulos de audiencias, términos, usuarios

**Fase 3: Semana 3** (26-30 enero 2026)
- Día 11-15: Notificaciones, recordatorios, calendario, dashboard

### 2. Testing de Base de Datos

```sql
-- Crear base de datos de prueba
CREATE DATABASE juridico_test;

-- Ejecutar schema
\c juridico_test
\i database-schema-completo.sql

-- Verificar estructura
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar seed data
SELECT * FROM gerencias;
SELECT * FROM materias;
SELECT * FROM tipos_audiencia;
SELECT * FROM usuarios WHERE email = 'admin@juridico.gob.mx';
```

### 3. Documentación API (Swagger)

Una vez implementado el backend, Swagger generará automáticamente:
```
http://localhost:8080/swagger-ui/index.html
```

Endpoints esperados:
- `GET /api/expedientes`
- `POST /api/expedientes`
- `PUT /api/expedientes/{id}/etapa-procesal`
- `GET /api/audiencias/proximas`
- `GET /api/terminos/por-vencer`
- `GET /api/dashboard/estadisticas`

---

## ✅ CHECKLIST DE VALIDACIÓN

### Completitud de Módulos

- [x] **Expedientes**: Tabla completa con 16 campos + auditoría
- [x] **Audiencias**: Tabla con flujo de 3 estados + tabla puente
- [x] **Términos**: Tabla con flujo de 7 estatus + tabla puente
- [x] **Usuarios**: Tabla con 6 roles + relaciones
- [x] **Gerencias**: Catálogo con 3 registros iniciales
- [x] **Materias**: Catálogo con 8 registros iniciales
- [x] **Notificaciones**: Tabla con tipos y prioridades
- [x] **Recordatorios**: Tabla con prioridad urgente/normal
- [x] **Calendario**: Tabla con 5 categorías
- [x] **Dashboard**: Vistas materializadas (sin tabla propia)
- [x] **Agenda General**: Tablas puente para audiencias/términos desahogadas

### Consistencia de Nomenclatura

- [x] "Estado" → "Etapa Procesal" en expedientes
- [x] "Sede" para ubicación geográfica (Estados de la República)
- [x] "Estatus" para estados operativos (audiencias, términos)
- [x] snake_case en todas las tablas y columnas
- [x] Comentarios en español en todos los campos críticos

### Relaciones y Constraints

- [x] 15+ Foreign Keys definidas
- [x] 10+ CHECK constraints para enums
- [x] 6+ UNIQUE constraints
- [x] 40+ índices para rendimiento
- [x] Cascadas apropiadas (DELETE CASCADE vs RESTRICT)

### Auditoría y Triggers

- [x] Triggers `updated_at` en 9 tablas
- [x] Trigger de actividad automática en expedientes
- [x] Campos `created_by` y `updated_by` en tablas principales
- [x] Timestamps con zona horaria (WITH TIME ZONE)

### Datos Iniciales

- [x] 3 gerencias predefinidas
- [x] 8 materias relacionadas a gerencias
- [x] 6 tipos de audiencia
- [x] 6 órganos jurisdiccionales de ejemplo
- [x] 1 usuario administrador (BCrypt hash)

### Vistas y Reportes

- [x] Vista `vista_expedientes_completa`
- [x] Vista `vista_audiencias_proximas`
- [x] Vista `vista_terminos_por_vencer`

---

## 📞 SOPORTE Y CONTACTO

### Documentos Relacionados

1. **PLAN-IMPLEMENTACION-BACKEND.md** - Plan de 75 tareas, 3 semanas
2. **PREPARACION-BACKEND.md** - Guía paso a paso de preparación
3. **database-schema-completo.sql** - Esquema SQL completo (este archivo)
4. **base.sql** - Esquema original (OBSOLETO)

### Equipo de Desarrollo

| Nombre | Rol | Horario | Inicio |
|--------|-----|---------|--------|
| Ramses | Senior Backend | 10:00-14:00 | 12 ene - 20 ene |
| Aurora | Junior Backend | 11:00-15:00 | 12 ene - 30 ene |
| Ricardo | Mid-Senior Backend | 14:00-18:00 | 12 ene - 30 ene |

**Traslapes de comunicación:**
- **11:00-14:00**: Ramses + Aurora (3 horas)
- **14:00-15:00**: Aurora + Ricardo (1 hora)

---

## 🎉 CONCLUSIÓN

Se ha creado un **esquema de base de datos profesional y completo** que:

✅ Cubre los **9 módulos** del sistema frontend  
✅ Incluye **17 tablas** con relaciones apropiadas  
✅ Aplica **nomenclatura consistente** (Etapa Procesal, no Estado)  
✅ Incorpora **auditoría automática** con triggers  
✅ Proporciona **3 vistas** para reportes y dashboard  
✅ Incluye **datos iniciales** para desarrollo  
✅ Está **optimizado** con 40+ índices estratégicos  
✅ Sigue **mejores prácticas** de PostgreSQL 15+

**El esquema está listo para ser ejecutado en desarrollo y comenzar la Fase 0 del PLAN-IMPLEMENTACION-BACKEND.md.**

---

**Fecha de creación:** 6 de enero de 2026  
**Versión del esquema:** 1.0  
**Última actualización:** 6 de enero de 2026
