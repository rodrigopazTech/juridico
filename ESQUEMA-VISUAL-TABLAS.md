# 🗂️ ESQUEMA VISUAL DE TABLAS - SISTEMA JURÍDICO V3

## 📊 Arquitectura de Base de Datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SISTEMA JURÍDICO GOB.MX V3                           │
│                    17 Tablas + 3 Vistas                                 │
│                    PostgreSQL 15+                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 CATÁLOGOS BASE (4 Tablas)

### 1. gerencias
```
┌──────────────────────────────────┐
│          gerencias               │
├──────────────────────────────────┤
│ PK │ id (SERIAL)                │
│    │ nombre (VARCHAR 200) UNIQUE│
│    │ descripcion (TEXT)         │
│    │ activo (BOOLEAN)           │
│    │ created_at (TIMESTAMPTZ)   │
│    │ updated_at (TIMESTAMPTZ)   │
└──────────────────────────────────┘

DATOS: 3 registros
- Civil, Mercantil, Fiscal y Administrativo
- Laboral y Penal
- Transparencia y Amparo
```

### 2. materias
```
┌──────────────────────────────────┐
│          materias                │
├──────────────────────────────────┤
│ PK │ id (SERIAL)                │
│    │ nombre (VARCHAR 100)       │
│ FK │ gerencia_id → gerencias    │
│    │ descripcion (TEXT)         │
│    │ activo (BOOLEAN)           │
│    │ created_at (TIMESTAMPTZ)   │
│    │ updated_at (TIMESTAMPTZ)   │
└──────────────────────────────────┘

DATOS: 8 registros
- Civil, Mercantil, Fiscal, Administrativo
- Laboral, Penal
- Transparencia, Amparo
```

### 3. organos_jurisdiccionales
```
┌──────────────────────────────────┐
│   organos_jurisdiccionales       │
├──────────────────────────────────┤
│ PK │ id (SERIAL)                │
│    │ nombre (VARCHAR 300) UNIQUE│
│    │ tipo (VARCHAR 50)          │
│    │   Juzgado/Tribunal/Sala    │
│    │ sede (VARCHAR 100)         │
│    │   Estado de la República   │
│    │ activo (BOOLEAN)           │
│    │ created_at (TIMESTAMPTZ)   │
└──────────────────────────────────┘

DATOS: 6 registros ejemplo
- Juzgados civiles
- Tribunales federales
- Juntas de conciliación
```

### 4. tipos_audiencia
```
┌──────────────────────────────────┐
│       tipos_audiencia            │
├──────────────────────────────────┤
│ PK │ id (SERIAL)                │
│    │ nombre (VARCHAR 100) UNIQUE│
│    │ descripcion (TEXT)         │
│    │ activo (BOOLEAN)           │
│    │ created_at (TIMESTAMPTZ)   │
└──────────────────────────────────┘

DATOS: 6 registros
- Inicial, Intermedia
- Juicio Oral, Constitucional
- Incidental, Conciliación
```

---

## 👤 USUARIOS Y SEGURIDAD (1 Tabla)

### 5. usuarios
```
┌─────────────────────────────────────┐
│            usuarios                 │
├─────────────────────────────────────┤
│ PK │ id (SERIAL)                   │
│    │ nombre_completo (VARCHAR 200) │
│    │ email (VARCHAR 255) UNIQUE    │
│    │ password_hash (VARCHAR 255)   │
│    │ rol (VARCHAR 50) CHECK        │
│    │   SUBDIRECTOR | DIRECCION     │
│    │   SUBDIRECCION | GERENTE      │
│    │   JEFE_DEPTO | ABOGADO        │
│ FK │ gerencia_id → gerencias       │
│    │ activo (BOOLEAN)              │
│    │ ultimo_acceso (TIMESTAMPTZ)   │
│    │ created_at (TIMESTAMPTZ)      │
│    │ updated_at (TIMESTAMPTZ)      │
│ FK │ created_by → usuarios         │
│ FK │ updated_by → usuarios         │
└─────────────────────────────────────┘

DATOS: 1 admin
- admin@juridico.gob.mx
- Password: admin123 (BCrypt hash)
```

---

## 📁 MÓDULO EXPEDIENTES (4 Tablas)

### 6. expedientes (TABLA PRINCIPAL)
```
┌────────────────────────────────────────────┐
│              expedientes                   │
├────────────────────────────────────────────┤
│ PK │ id (UUID) gen_random_uuid()          │
│    │ numero (VARCHAR 50) UNIQUE           │
│    │   Ej: EXP-0001                       │
│    │ descripcion (TEXT)                   │
│ FK │ materia_id → materias                │
│ FK │ gerencia_id → gerencias              │
│ FK │ organo_jurisdiccional_id → organos   │
│    │ organo_jurisdiccional_texto (TEXT)   │
│    │ partes (TEXT)                        │
│    │   "Actor vs Demandado"               │
│    │ sede (VARCHAR 150)                   │
│    │   Estado de la República             │
│    │ prioridad (VARCHAR 20) CHECK         │
│    │   ALTA | MEDIA | BAJA                │
│    │ etapa_procesal (VARCHAR 30) CHECK    │
│    │   TRAMITE | LAUDO | FIRME            │
│    │   | CONCLUIDO                        │
│ FK │ abogado_responsable_id → usuarios    │
│    │ abogado_responsable_nombre (VARCHAR) │
│    │ fecha_creacion (TIMESTAMPTZ)         │
│    │ fecha_actualizacion (TIMESTAMPTZ)    │
│ FK │ created_by → usuarios                │
│ FK │ updated_by → usuarios                │
└────────────────────────────────────────────┘

ÍNDICES:
- idx_expedientes_numero (UNIQUE)
- idx_expedientes_gerencia
- idx_expedientes_materia
- idx_expedientes_etapa
- idx_expedientes_prioridad
- idx_expedientes_abogado
- idx_expedientes_fecha_creacion DESC
```

### 7. actividad_expedientes
```
┌────────────────────────────────────────┐
│       actividad_expedientes            │
├────────────────────────────────────────┤
│ PK │ id (SERIAL)                       │
│ FK │ expediente_id → expedientes (UUID)│
│    │ titulo (VARCHAR 200)              │
│    │ descripcion (TEXT)                │
│    │ tipo_icono (VARCHAR 30) CHECK     │
│    │   UPLOAD | EDIT | STATUS          │
│    │   DELETE | CREATE | COMMENT       │
│    │   DOCUMENT                        │
│ FK │ usuario_id → usuarios             │
│    │ usuario_nombre (VARCHAR 200)      │
│    │ fecha_registro (TIMESTAMPTZ)      │
└────────────────────────────────────────┘

TRIGGER: Inserta automáticamente al crear/actualizar expediente
```

### 8. documentos_expediente
```
┌────────────────────────────────────────┐
│       documentos_expediente            │
├────────────────────────────────────────┤
│ PK │ id (SERIAL)                       │
│ FK │ expediente_id → expedientes (UUID)│
│    │ nombre_archivo (VARCHAR 300)      │
│    │ ruta_archivo (VARCHAR 500)        │
│    │ tipo_documento (VARCHAR 50)       │
│    │ mime_type (VARCHAR 100)           │
│    │ tamanio_bytes (BIGINT)            │
│    │ descripcion (TEXT)                │
│    │ uploaded_at (TIMESTAMPTZ)         │
│ FK │ uploaded_by → usuarios            │
│    │ uploaded_by_nombre (VARCHAR 200)  │
└────────────────────────────────────────┘
```

### 9. comentarios (POLIMÓRFICO)
```
┌────────────────────────────────────────┐
│            comentarios                 │
├────────────────────────────────────────┤
│ PK │ id (SERIAL)                       │
│    │ entidad_tipo (VARCHAR 30) CHECK   │
│    │   EXPEDIENTE | AUDIENCIA          │
│    │   | TERMINO                       │
│    │ entidad_id (VARCHAR 50)           │
│    │   UUID para expedientes           │
│    │   INTEGER para otros              │
│    │ comentario (TEXT)                 │
│ FK │ usuario_id → usuarios             │
│    │ usuario_nombre (VARCHAR 200)      │
│    │ created_at (TIMESTAMPTZ)          │
│    │ updated_at (TIMESTAMPTZ)          │
└────────────────────────────────────────┘

RELACIÓN: Puede asociarse a expedientes, audiencias o términos
```

---

## 🎙️ MÓDULO AUDIENCIAS (2 Tablas)

### 10. audiencias
```
┌────────────────────────────────────────┐
│            audiencias                  │
├────────────────────────────────────────┤
│ PK │ id (SERIAL)                       │
│ FK │ expediente_id → expedientes (UUID)│
│    │ fecha_audiencia (DATE)            │
│    │ hora_audiencia (TIME)             │
│ FK │ tipo_audiencia_id → tipos_aud.    │
│    │ tipo_audiencia_texto (VARCHAR)    │
│    │ es_virtual (BOOLEAN)              │
│    │ url_reunion (TEXT)                │
│    │ sala_lugar (TEXT)                 │
│ FK │ abogado_comparece_id → usuarios   │
│    │ abogado_comparece_nombre (VARCHAR)│
│    │ estatus_audiencia (VARCHAR 30)    │
│    │   PENDIENTE → CON_ACTA            │
│    │   → CONCLUIDA                     │
│    │ acta_documento (VARCHAR 500)      │
│    │ tipo_documento (VARCHAR 50)       │
│    │ fecha_desahogo (DATE)             │
│    │ observaciones_finales (TEXT)      │
│    │ created_at (TIMESTAMPTZ)          │
│    │ updated_at (TIMESTAMPTZ)          │
│ FK │ created_by → usuarios             │
│ FK │ updated_by → usuarios             │
└────────────────────────────────────────┘

FLUJO: PENDIENTE → CON_ACTA → CONCLUIDA
```

### 11. audiencias_desahogadas (AGENDA GENERAL)
```
┌────────────────────────────────────────┐
│       audiencias_desahogadas           │
├────────────────────────────────────────┤
│ PK │ id (SERIAL)                       │
│ FK │ audiencia_id → audiencias         │
│    │ expediente_numero (VARCHAR 50)    │
│    │ fecha_audiencia (DATE)            │
│    │ hora_audiencia (TIME)             │
│    │ tipo_audiencia (VARCHAR 100)      │
│    │ partes (TEXT)                     │
│    │ abogado_nombre (VARCHAR 200)      │
│    │ acta_documento (VARCHAR 500)      │
│    │ fecha_desahogo (DATE)             │
│    │ observaciones (TEXT)              │
│    │ es_virtual (BOOLEAN)              │
│    │ url_reunion (TEXT)                │
│    │ sala_lugar (TEXT)                 │
│    │ sincronizado_at (TIMESTAMPTZ)     │
└────────────────────────────────────────┘

PROPÓSITO: Vista materializada de audiencias concluidas
USO: Módulo de Agenda General
```

---

## 📝 MÓDULO TÉRMINOS (2 Tablas)

### 12. terminos
```
┌────────────────────────────────────────┐
│             terminos                   │
├────────────────────────────────────────┤
│ PK │ id (SERIAL)                       │
│ FK │ expediente_id → expedientes (UUID)│
│    │ actuacion (TEXT)                  │
│    │ asunto_descripcion (TEXT)         │
│    │ fecha_ingreso (DATE)              │
│    │ fecha_vencimiento (DATE)          │
│    │ estatus_termino (VARCHAR 30)      │
│    │   PROYECTISTA → REVISION          │
│    │   → GERENCIA → DIRECCION          │
│    │   → LIBERADO → PRESENTADO         │
│    │   → CONCLUIDO                     │
│    │ archivo_word (VARCHAR 500)        │
│    │ archivo_acuse (VARCHAR 500)       │
│    │ prioridad (VARCHAR 20) CHECK      │
│    │   ALTA | MEDIA | BAJA             │
│    │ observaciones (TEXT)              │
│    │ actor (TEXT)                      │
│    │ tribunal_texto (TEXT)             │
│ FK │ abogado_responsable_id → usuarios │
│    │ abogado_responsable_nombre (V200) │
│    │ created_at (TIMESTAMPTZ)          │
│    │ updated_at (TIMESTAMPTZ)          │
│ FK │ created_by → usuarios             │
│ FK │ updated_by → usuarios             │
└────────────────────────────────────────┘

FLUJO: 7 estatus de aprobación
```

### 13. terminos_presentados (AGENDA GENERAL)
```
┌────────────────────────────────────────┐
│       terminos_presentados             │
├────────────────────────────────────────┤
│ PK │ id (SERIAL)                       │
│ FK │ termino_id → terminos             │
│    │ expediente_numero (VARCHAR 50)    │
│    │ actuacion (TEXT)                  │
│    │ fecha_presentacion (DATE)         │
│    │ acuse_documento (VARCHAR 500)     │
│    │ observaciones (TEXT)              │
│    │ abogado_nombre (VARCHAR 200)      │
│    │ sincronizado_at (TIMESTAMPTZ)     │
└────────────────────────────────────────┘

PROPÓSITO: Vista materializada de términos presentados
USO: Módulo de Agenda General
```

---

## 🔔 MÓDULO NOTIFICACIONES (1 Tabla)

### 14. notificaciones
```
┌────────────────────────────────────────┐
│          notificaciones                │
├────────────────────────────────────────┤
│ PK │ id (SERIAL)                       │
│ FK │ usuario_id → usuarios             │
│    │ titulo (VARCHAR 200)              │
│    │ mensaje (TEXT)                    │
│    │ tipo (VARCHAR 30) CHECK           │
│    │   AUDIENCIA | TERMINO             │
│    │   RECORDATORIO | SISTEMA | ALERTA │
│    │ prioridad (VARCHAR 20) CHECK      │
│    │   ALTA | NORMAL | BAJA            │
│    │ leida (BOOLEAN)                   │
│    │ fecha_leida (TIMESTAMPTZ)         │
│    │ notificar_en (TIMESTAMPTZ)        │
│    │ entidad_tipo (VARCHAR 30)         │
│    │ entidad_id (VARCHAR 50)           │
│    │ created_at (TIMESTAMPTZ)          │
└────────────────────────────────────────┘

ÍNDICES:
- idx_notificaciones_usuario
- idx_notificaciones_leida
- idx_notificaciones_fecha
- idx_notificaciones_tipo
```

---

## ⏰ MÓDULO RECORDATORIOS (1 Tabla)

### 15. recordatorios
```
┌────────────────────────────────────────┐
│          recordatorios                 │
├────────────────────────────────────────┤
│ PK │ id (SERIAL)                       │
│ FK │ usuario_id → usuarios             │
│    │ titulo (VARCHAR 200)              │
│    │ detalles (TEXT)                   │
│    │ fecha_recordatorio (DATE)         │
│    │ hora_recordatorio (TIME)          │
│    │ prioridad (VARCHAR 20) CHECK      │
│    │   URGENTE | NORMAL                │
│    │ completado (BOOLEAN)              │
│    │ fecha_completado (TIMESTAMPTZ)    │
│    │ created_at (TIMESTAMPTZ)          │
│    │ updated_at (TIMESTAMPTZ)          │
└────────────────────────────────────────┘

INTEGRACIÓN: Genera notificaciones automáticamente
```

---

## 📅 MÓDULO CALENDARIO (1 Tabla)

### 16. eventos_calendario
```
┌────────────────────────────────────────┐
│         eventos_calendario             │
├────────────────────────────────────────┤
│ PK │ id (SERIAL)                       │
│ FK │ usuario_id → usuarios             │
│    │ titulo (VARCHAR 200)              │
│    │ descripcion (TEXT)                │
│    │ fecha_inicio (TIMESTAMPTZ)        │
│    │ fecha_fin (TIMESTAMPTZ)           │
│    │ todo_el_dia (BOOLEAN)             │
│    │ categoria (VARCHAR 30) CHECK      │
│    │   AUDIENCIA | TERMINO             │
│    │   RECORDATORIO | REUNION | OTRO   │
│    │ color (VARCHAR 7)                 │
│    │   Hexadecimal #RRGGBB             │
│    │ entidad_tipo (VARCHAR 30)         │
│    │ entidad_id (INTEGER)              │
│    │ created_at (TIMESTAMPTZ)          │
│    │ updated_at (TIMESTAMPTZ)          │
│ FK │ created_by → usuarios             │
└────────────────────────────────────────┘

VISTAS: Día, Semana, Mes
```

---

## 📊 VISTAS MATERIALIZADAS (3 Vistas)

### VISTA 1: vista_expedientes_completa
```sql
SELECT 
    e.id, e.numero, e.descripcion,
    e.etapa_procesal, e.prioridad,
    g.nombre AS gerencia_nombre,
    m.nombre AS materia_nombre,
    o.nombre AS organo_jurisdiccional_nombre,
    u.nombre_completo AS abogado_responsable,
    COUNT(DISTINCT a.id) AS total_audiencias,
    COUNT(DISTINCT t.id) AS total_terminos,
    COUNT(DISTINCT act.id) AS total_actividades
FROM expedientes e
LEFT JOIN gerencias g ON e.gerencia_id = g.id
LEFT JOIN materias m ON e.materia_id = m.id
LEFT JOIN organos_jurisdiccionales o ON e.organo_jurisdiccional_id = o.id
LEFT JOIN usuarios u ON e.abogado_responsable_id = u.id
LEFT JOIN audiencias a ON a.expediente_id = e.id
LEFT JOIN terminos t ON t.expediente_id = e.id
LEFT JOIN actividad_expedientes act ON act.expediente_id = e.id
GROUP BY e.id, g.nombre, m.nombre, o.nombre, u.nombre_completo;
```

**USO:** Dashboard, listado de expedientes, reportes

---

### VISTA 2: vista_audiencias_proximas
```sql
SELECT 
    a.id,
    a.fecha_audiencia,
    a.hora_audiencia,
    e.numero AS expediente_numero,
    e.descripcion AS expediente_descripcion,
    ta.nombre AS tipo_audiencia,
    a.estatus_audiencia,
    u.nombre_completo AS abogado_comparece,
    a.es_virtual,
    a.sala_lugar,
    EXTRACT(DAY FROM (a.fecha_audiencia - CURRENT_DATE)) AS dias_restantes
FROM audiencias a
INNER JOIN expedientes e ON a.expediente_id = e.id
LEFT JOIN tipos_audiencia ta ON a.tipo_audiencia_id = ta.id
LEFT JOIN usuarios u ON a.abogado_comparece_id = u.id
WHERE a.fecha_audiencia >= CURRENT_DATE
  AND a.estatus_audiencia != 'CONCLUIDA'
ORDER BY a.fecha_audiencia, a.hora_audiencia;
```

**USO:** Dashboard, alertas, calendario

---

### VISTA 3: vista_terminos_por_vencer
```sql
SELECT 
    t.id,
    t.actuacion,
    t.fecha_vencimiento,
    t.estatus_termino,
    t.prioridad,
    e.numero AS expediente_numero,
    e.descripcion AS expediente_descripcion,
    u.nombre_completo AS abogado_responsable,
    EXTRACT(DAY FROM (t.fecha_vencimiento - CURRENT_DATE)) AS dias_restantes
FROM terminos t
INNER JOIN expedientes e ON t.expediente_id = e.id
LEFT JOIN usuarios u ON t.abogado_responsable_id = u.id
WHERE t.fecha_vencimiento >= CURRENT_DATE
  AND t.estatus_termino != 'CONCLUIDO'
ORDER BY t.fecha_vencimiento;
```

**USO:** Dashboard, alertas críticas, reportes

---

## 🔗 DIAGRAMA DE RELACIONES

```
                           ┌─────────────┐
                           │  gerencias  │
                           └──────┬──────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
                    ▼             ▼             ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │ materias │  │ usuarios │  │expedientes│
              └────┬─────┘  └────┬─────┘  └────┬─────┘
                   │             │             │
                   │             │      ┌──────┼──────┐
                   │             │      │      │      │
                   │             ▼      ▼      ▼      ▼
                   │      ┌────────┐ ┌────┐ ┌────┐ ┌────┐
                   │      │noti    │ │aud.│ │term│ │act.│
                   │      │ficacio │ └─┬──┘ └─┬──┘ └────┘
                   │      │nes     │   │      │
                   │      └────────┘   │      │
                   │                   ▼      ▼
                   │              ┌──────┐ ┌──────┐
                   │              │aud.  │ │term. │
                   │              │desah.│ │pres. │
                   │              └──────┘ └──────┘
                   │
                   └───────────┐
                               │
                               ▼
                      ┌─────────────────┐
                      │organos_jurisdic │
                      └─────────────────┘

LEYENDA:
─── Relación 1:N (One-to-Many)
└─┬ JOIN
  ▼ Foreign Key
```

---

## 🎯 ESTADÍSTICAS DEL ESQUEMA

| Métrica | Valor |
|---------|-------|
| **Tablas Principales** | 17 |
| **Vistas** | 3 |
| **Índices** | 40+ |
| **Triggers** | 10 |
| **Foreign Keys** | 30+ |
| **CHECK Constraints** | 15+ |
| **Datos Iniciales** | 26 registros |

---

## ✅ NOMENCLATURA CONSISTENTE

### Tablas
- **snake_case** plural: `actividad_expedientes`, `organos_jurisdiccionales`

### Columnas
- **snake_case**: `fecha_creacion`, `abogado_responsable_id`

### Foreign Keys
- **Patrón**: `tabla_id` → `gerencia_id`, `usuario_id`

### Índices
- **Patrón**: `idx_tabla_columna` → `idx_expedientes_numero`

### Triggers
- **Patrón**: `trigger_tabla_accion` → `trigger_expedientes_updated_at`

### Vistas
- **Patrón**: `vista_descripcion` → `vista_audiencias_proximas`

---

## 🚀 SIGUIENTE PASO

Ejecutar `database-schema-completo.sql` para crear todas estas tablas:

```bash
psql -U postgres -d juridico_db -f database-schema-completo.sql
```

**Resultado esperado:**
```
✅ 17 tablas creadas
✅ 3 vistas creadas
✅ 40+ índices creados
✅ 10 triggers instalados
✅ 26 registros seed data insertados
```

---

**Creado:** 6 de enero de 2026  
**Versión:** 1.0
