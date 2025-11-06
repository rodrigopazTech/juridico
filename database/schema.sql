CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    rol VARCHAR(50) CHECK (rol IN ('SUBDIRECTOR', 'GERENTE', 'ABOGADO')),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 🔹 2. Tabla: `materias`

**Descripción:** representa las Gerencias o Materias (Civil, Mercantil, Laboral, etc.).

```sql
CREATE TABLE materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT
);
```

---

### 🔹 3. Tabla: `asuntos`

**Descripción:** núcleo del sistema. Cada asunto pertenece a una materia y tiene un abogado responsable.

```sql
CREATE TABLE asuntos (
    id SERIAL PRIMARY KEY,
    expediente VARCHAR(100) NOT NULL,
    materia_id INT REFERENCES materias(id),
    gerencia_estado VARCHAR(100) NOT NULL, -- Estado de la República
    abogado_id INT REFERENCES usuarios(id),
    partes_procesales TEXT, -- Actor/Quejoso/Partes
    tipo_asunto VARCHAR(100), -- Prestación / Procedimiento
    organo_jurisdiccional VARCHAR(150),
    prioridad VARCHAR(50), -- Alta, Media, Baja
    descripcion TEXT,
    solicitud VARCHAR(100), -- Solo Unidad de Transparencia
    solicitante VARCHAR(150), -- Solo Unidad de Transparencia
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 🔹 4. Tabla: `terminos`

**Descripción:** plazos o actuaciones que pertenecen a un asunto.

```sql
CREATE TABLE terminos (
    id SERIAL PRIMARY KEY,
    asunto_id INT REFERENCES asuntos(id) ON DELETE CASCADE,
    fecha_ingreso DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    actuacion TEXT NOT NULL, -- Etapa procesal / Movimiento procesal
    etapa_revision VARCHAR(100), -- Antes estatus: proyectista, gerencia, presentado, liberado
    acuse_documento VARCHAR(255), -- ruta del archivo
    observaciones TEXT,
    atendido BOOLEAN DEFAULT FALSE,
    recordatorio_dias INT DEFAULT 1,
    recordatorio_horas INT DEFAULT 2,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> 🔸 El semáforo no se almacena — se calcula lógicamente según la fecha de vencimiento y si está atendido o no.

---

### 🔹 5. Tabla: `audiencias`

**Descripción:** audiencias vinculadas a un asunto.

```sql
CREATE TABLE audiencias (
    id SERIAL PRIMARY KEY,
    asunto_id INT REFERENCES asuntos(id) ON DELETE CASCADE,
    fecha_audiencia DATE NOT NULL,
    hora_audiencia TIME NOT NULL,
    tipo_audiencia VARCHAR(150),
    abogado_comparece INT REFERENCES usuarios(id),
    acta_documento VARCHAR(255),
    observaciones TEXT,
    atendida BOOLEAN DEFAULT FALSE,
    recordatorio_dias INT DEFAULT 1,
    recordatorio_horas INT DEFAULT 2,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 🔹 6. Tabla: `documentos`

**Descripción:** archivos asociados directamente a un asunto o alguno de sus elementos.

```sql
CREATE TABLE documentos (
    id SERIAL PRIMARY KEY,
    asunto_id INT REFERENCES asuntos(id) ON DELETE CASCADE,
    termino_id INT REFERENCES terminos(id),
    audiencia_id INT REFERENCES audiencias(id),
    tipo VARCHAR(50), -- ej: Acuse, Acta, Otro
    nombre_archivo VARCHAR(255),
    ruta_archivo VARCHAR(255),
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT REFERENCES usuarios(id)
);
```

---

### 🔹 7. Tabla: `movimientos`

**Descripción:** historial de cambios y acciones realizadas por usuarios (bitácora).

```sql
CREATE TABLE movimientos (
    id SERIAL PRIMARY KEY,
    asunto_id INT REFERENCES asuntos(id) ON DELETE CASCADE,
    usuario_id INT REFERENCES usuarios(id),
    descripcion TEXT NOT NULL,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 🔹 8. Tabla: `notificaciones`

**Descripción:** notificaciones internas generadas por términos, audiencias o tareas personales.

```sql
CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    asunto_id INT REFERENCES asuntos(id),
    termino_id INT REFERENCES terminos(id),
    audiencia_id INT REFERENCES audiencias(id),
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('TERMINO', 'AUDIENCIA', 'TAREA')),
    leido BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 🔹 9. Tabla: `tareas_personales`

**Descripción:** recordatorios o pendientes no asociados a un asunto.

```sql
CREATE TABLE tareas_personales (
    id SERIAL PRIMARY KEY,
    usuario_id INT REFERENCES usuarios(id),
    fecha_tarea DATE NOT NULL,
    hora_tarea TIME,
    descripcion TEXT NOT NULL,
    recordatorio_dias INT DEFAULT 1,
    recordatorio_horas INT DEFAULT 2,
    completada BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 🔹 10. Tabla: `configuracion_general`

**Descripción:** ajustes globales del sistema (por Subdirección).

```sql
CREATE TABLE configuracion_general (
    id SERIAL PRIMARY KEY,
    dias_recordatorio_default INT DEFAULT 1,
    horas_recordatorio_default INT DEFAULT 2,
    color_semaforo_verde INTERVAL DEFAULT '5 days',
    color_semaforo_amarillo INTERVAL DEFAULT '3 days',
    color_semaforo_rojo INTERVAL DEFAULT '1 day',
    fecha_ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
CREATE TABLE comentarios_generales (
    id SERIAL PRIMARY KEY,
    tipo_objeto VARCHAR(20) CHECK (tipo_objeto IN ('ASUNTO', 'TERMINO', 'AUDIENCIA')),
    objeto_id INT NOT NULL,
    usuario_id INT REFERENCES usuarios(id),
    comentario TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


---

## 🧠 **Relaciones principales**

| Relación                         | Tipo | Descripción                                           |
| -------------------------------- | ---- | ----------------------------------------------------- |
| `materias` ↔ `asuntos`           | 1:N  | Cada materia puede tener muchos asuntos.              |
| `usuarios` ↔ `asuntos`           | 1:N  | Cada abogado puede ser responsable de varios asuntos. |
| `asuntos` ↔ `terminos`           | 1:N  | Un asunto tiene varios términos.                      |
| `asuntos` ↔ `audiencias`         | 1:N  | Un asunto tiene varias audiencias.                    |
| `asuntos` ↔ `documentos`         | 1:N  | Pueden existir múltiples documentos por asunto.       |
| `terminos` ↔ `notificaciones`    | 1:N  | Cada término puede generar varias notificaciones.     |
| `audiencias` ↔ `notificaciones`  | 1:N  | Cada audiencia puede generar varias notificaciones.   |
| `usuarios` ↔ `movimientos`       | 1:N  | Cada usuario puede registrar varios movimientos.      |
| `usuarios` ↔ `tareas_personales` | 1:N  | Cada usuario puede crear sus propias tareas.          |

---

## 📋 **Notas de diseño**

* El **semaforo** no requiere campo: se calcula con una función SQL o lógica en backend (`CASE WHEN current_date >= fecha_vencimiento - INTERVAL '3 days' THEN ...`).
* Los **recordatorios** se basan en `recordatorio_dias` y `recordatorio_horas`.
* Se recomienda usar **UUID** si deseas escalabilidad o integrarlo con APIs REST.
* Los documentos de términos/audiencias se pueden listar en la pestaña de Documentos del Asunto, gracias a sus claves foráneas.

---

¿Quieres que te entregue también el **diagrama entidad-relación (ERD)** de esta base de datos para visualizar las relaciones (por ejemplo en formato `.png` o `.drawio`)?
