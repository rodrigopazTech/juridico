-- 1. Tablas de Catálogo
CREATE TABLE gerencias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

-- 2. Tabla Principal: Expedientes
CREATE TABLE expedientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) UNIQUE NOT NULL, -- Ej: EXP-0001
    descripcion TEXT,
    sede VARCHAR(100),
    partes TEXT, -- Actor vs Demandado
    prioridad VARCHAR(20) DEFAULT 'Media', -- Alta, Media, Baja
    estado VARCHAR(20) DEFAULT 'TRAMITE', -- TRAMITE, LAUDO, FIRME
    abogado_responsable VARCHAR(100),
    organo_jurisdiccional TEXT,
    gerencia_id INTEGER REFERENCES gerencias(id),
    materia_id INTEGER REFERENCES materias(id),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla: Términos (Flujo de Trabajo)
CREATE TABLE terminos (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    actuacion TEXT NOT NULL,
    fecha_ingreso DATE,
    fecha_vencimiento DATE NOT NULL,
    estatus VARCHAR(30) DEFAULT 'Proyectista', -- Proyectista, Revisión, Gerencia, Dirección, Liberado, Presentado, Concluido
    archivo_word VARCHAR(255), -- Nombre/Ruta del borrador
    archivo_acuse VARCHAR(255), -- Nombre/Ruta del acuse final
    observaciones TEXT,
    prioridad_termino VARCHAR(20), -- Heredada del expediente
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla: Audiencias
CREATE TABLE audiencias (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo VARCHAR(50), -- Constitucional, Incidental, etc.
    es_en_linea BOOLEAN DEFAULT FALSE,
    url_reunion TEXT,
    sala_lugar TEXT,
    abogado_comparece VARCHAR(100),
    atendida BOOLEAN DEFAULT FALSE,
    acta_documento VARCHAR(255), -- Nombre del archivo subido
    tipo_documento_subido VARCHAR(50), -- 'Acta' o 'Alegatos Amparo'
    observaciones_finales TEXT,
    fecha_desahogo DATE
);

-- 5. Tabla: Historial de Actividad (Timeline)
CREATE TABLE actividad_expedientes (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    titulo VARCHAR(100),
    descripcion TEXT,
    tipo_icono VARCHAR(20), -- upload, edit, status, delete
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);