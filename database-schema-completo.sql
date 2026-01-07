-- ================================================
-- SISTEMA JURÍDICO - ESQUEMA DE BASE DE DATOS COMPLETO
-- Base de datos: juridico_db
-- PostgreSQL 15+
-- ================================================

-- 1. TABLAS DE CATÁLOGO
-- ================================================

CREATE TABLE IF NOT EXISTS gerencias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activa BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE USUARIOS
-- ================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Contraseña hasheada (BCrypt)
    email VARCHAR(100) UNIQUE,
    nombre_completo VARCHAR(150),
    rol VARCHAR(30) NOT NULL, -- 'Proyectista', 'Revisor', 'Gerente', 'Director', 'Admin'
    gerencia_id INTEGER REFERENCES gerencias(id),
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_rol CHECK (rol IN ('Proyectista', 'Revisor', 'Gerente', 'Director', 'Admin'))
);

-- 3. TABLA PRINCIPAL: EXPEDIENTES
-- ================================================

CREATE TABLE IF NOT EXISTS expedientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) UNIQUE NOT NULL, -- Ej: EXP-0001
    descripcion TEXT,
    sede VARCHAR(100),
    partes TEXT, -- Actor vs Demandado
    prioridad VARCHAR(20) DEFAULT 'Media', -- Alta, Media, Baja
    etapa_procesal VARCHAR(50) DEFAULT 'TRAMITE', -- TRAMITE, LAUDO, FIRME, AMPARO
    abogado_responsable VARCHAR(100),
    organo_jurisdiccional TEXT,
    gerencia_id INTEGER REFERENCES gerencias(id),
    materia_id INTEGER REFERENCES materias(id),
    usuario_creador_id INTEGER REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_prioridad CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
    CONSTRAINT check_etapa_procesal CHECK (etapa_procesal IN ('TRAMITE', 'LAUDO', 'FIRME', 'AMPARO', 'CONCLUIDO'))
);

-- 4. TABLA: TÉRMINOS (FLUJO DE TRABAJO CON 6 ETAPAS)
-- ================================================

CREATE TABLE IF NOT EXISTS terminos (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    actuacion TEXT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estatus VARCHAR(30) DEFAULT 'Proyectista', 
    -- Etapas: Proyectista -> Revisión -> Gerencia -> Dirección -> Liberado -> Presentado -> Concluido
    archivo_word VARCHAR(255), -- Nombre/Ruta del borrador
    archivo_acuse VARCHAR(255), -- Nombre/Ruta del acuse final
    observaciones TEXT,
    prioridad_termino VARCHAR(20) DEFAULT 'Media',
    usuario_asignado_id INTEGER REFERENCES usuarios(id),
    usuario_proyectista_id INTEGER REFERENCES usuarios(id),
    usuario_revisor_id INTEGER REFERENCES usuarios(id),
    usuario_gerente_id INTEGER REFERENCES usuarios(id),
    usuario_director_id INTEGER REFERENCES usuarios(id),
    fecha_liberacion TIMESTAMP WITH TIME ZONE,
    fecha_presentacion TIMESTAMP WITH TIME ZONE,
    fecha_conclusion TIMESTAMP WITH TIME ZONE,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_estatus CHECK (estatus IN ('Proyectista', 'Revisión', 'Gerencia', 'Dirección', 'Liberado', 'Presentado', 'Concluido')),
    CONSTRAINT check_prioridad_termino CHECK (prioridad_termino IN ('Alta', 'Media', 'Baja'))
);

-- 5. TABLA: AUDIENCIAS
-- ================================================

CREATE TABLE IF NOT EXISTS audiencias (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- Constitucional, Incidental, Laudo, etc.
    es_en_linea BOOLEAN DEFAULT FALSE,
    url_reunion TEXT,
    sala_lugar TEXT,
    abogado_comparece VARCHAR(100),
    atendida BOOLEAN DEFAULT FALSE,
    acta_documento VARCHAR(255), -- Nombre del archivo subido
    tipo_documento_subido VARCHAR(50), -- 'Acta' o 'Alegatos Amparo'
    observaciones_finales TEXT,
    fecha_desahogo DATE,
    usuario_responsable_id INTEGER REFERENCES usuarios(id),
    gerencia_id INTEGER REFERENCES gerencias(id),
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: RECORDATORIOS (PERSONAL POR USUARIO)
-- ================================================

CREATE TABLE IF NOT EXISTS recordatorios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    detalles TEXT,
    prioridad VARCHAR(20) DEFAULT 'normal',
    expediente_id UUID REFERENCES expedientes(id) ON DELETE SET NULL, -- Opcional: vincular con expediente
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    creado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    actualizado_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_prioridad_recordatorio CHECK (prioridad IN ('urgent', 'normal'))
);

-- 7. TABLA: NOTIFICACIONES (SELECTIVAS POR USUARIO)
-- ================================================

CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, 
    -- Tipos: 'audiencia_proxima', 'termino_venciendo', 'recordatorio', 'asignacion_termino', 'cambio_estatus'
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP WITH TIME ZONE,
    referencia_tipo VARCHAR(30), -- 'expediente', 'audiencia', 'termino', 'recordatorio'
    referencia_id VARCHAR(50), -- ID del objeto relacionado
    prioridad VARCHAR(20) DEFAULT 'normal',
    fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_tipo_notificacion CHECK (tipo IN ('audiencia_proxima', 'termino_venciendo', 'recordatorio', 'asignacion_termino', 'cambio_estatus', 'comentario', 'documento_nuevo')),
    CONSTRAINT check_referencia_tipo CHECK (referencia_tipo IN ('expediente', 'audiencia', 'termino', 'recordatorio', NULL)),
    CONSTRAINT check_prioridad_notificacion CHECK (prioridad IN ('urgent', 'normal', 'low'))
);

-- 8. TABLA: HISTORIAL DE ACTIVIDAD (TIMELINE DE EXPEDIENTES)
-- ================================================

CREATE TABLE IF NOT EXISTS actividad_expedientes (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id),
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    tipo_actividad VARCHAR(30) NOT NULL, -- 'upload', 'edit', 'status', 'delete', 'comment', 'audiencia', 'termino'
    tipo_icono VARCHAR(20) DEFAULT 'edit', -- Para UI: upload, edit, status, delete, comment, calendar
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_tipo_actividad CHECK (tipo_actividad IN ('upload', 'edit', 'status', 'delete', 'comment', 'audiencia', 'termino', 'create'))
);

-- 9. TABLA: DOCUMENTOS (ARCHIVOS ADJUNTOS)
-- ================================================

CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_almacenamiento TEXT NOT NULL, -- Path en servidor o URL
    tipo_documento VARCHAR(50), -- 'Demanda', 'Contestación', 'Acuerdo', 'Acta', 'Promoción', etc.
    tipo_mime VARCHAR(100), -- application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document
    tamano_bytes BIGINT,
    usuario_subio_id INTEGER REFERENCES usuarios(id),
    es_publico BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    documento_padre_id INTEGER REFERENCES documentos(id), -- Para control de versiones
    fecha_subida TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);

-- 10. TABLA: COMENTARIOS (COLABORACIÓN EN EXPEDIENTES)
-- ================================================

CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    contenido TEXT NOT NULL,
    es_privado BOOLEAN DEFAULT FALSE, -- Solo visible para gerencia/dirección
    comentario_padre_id INTEGER REFERENCES comentarios(id), -- Para respuestas/hilos
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP WITH TIME ZONE,
    editado BOOLEAN DEFAULT FALSE
);

-- 11. TABLA: ASIGNACIONES DE EXPEDIENTES
-- ================================================

CREATE TABLE IF NOT EXISTS asignaciones_expedientes (
    id SERIAL PRIMARY KEY,
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tipo_asignacion VARCHAR(30) NOT NULL, -- 'responsable', 'colaborador', 'revisor'
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_desasignacion TIMESTAMP WITH TIME ZONE,
    activa BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    CONSTRAINT check_tipo_asignacion CHECK (tipo_asignacion IN ('responsable', 'colaborador', 'revisor'))
);

-- 12. TABLA: CONFIGURACIONES DEL SISTEMA
-- ================================================

CREATE TABLE IF NOT EXISTS configuraciones (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion TEXT,
    tipo_dato VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    modificable BOOLEAN DEFAULT TRUE,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_tipo_dato CHECK (tipo_dato IN ('string', 'number', 'boolean', 'json'))
);

-- 13. TABLA: LOGS DE AUDITORÍA
-- ================================================

CREATE TABLE IF NOT EXISTS logs_auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(50) NOT NULL, -- 'login', 'logout', 'create', 'update', 'delete', 'view'
    tabla_afectada VARCHAR(50),
    registro_id VARCHAR(50),
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    fecha_accion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_accion CHECK (accion IN ('login', 'logout', 'create', 'update', 'delete', 'view', 'export', 'import'))
);

-- ================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ================================================

-- Expedientes
CREATE INDEX IF NOT EXISTS idx_expedientes_gerencia ON expedientes(gerencia_id);
CREATE INDEX IF NOT EXISTS idx_expedientes_materia ON expedientes(materia_id);
CREATE INDEX IF NOT EXISTS idx_expedientes_etapa ON expedientes(etapa_procesal);
CREATE INDEX IF NOT EXISTS idx_expedientes_prioridad ON expedientes(prioridad);
CREATE INDEX IF NOT EXISTS idx_expedientes_numero ON expedientes(numero);
CREATE INDEX IF NOT EXISTS idx_expedientes_fecha_creacion ON expedientes(fecha_creacion);

-- Términos
CREATE INDEX IF NOT EXISTS idx_terminos_expediente ON terminos(expediente_id);
CREATE INDEX IF NOT EXISTS idx_terminos_estatus ON terminos(estatus);
CREATE INDEX IF NOT EXISTS idx_terminos_vencimiento ON terminos(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_terminos_usuario_asignado ON terminos(usuario_asignado_id);
CREATE INDEX IF NOT EXISTS idx_terminos_prioridad ON terminos(prioridad_termino);

-- Audiencias
CREATE INDEX IF NOT EXISTS idx_audiencias_expediente ON audiencias(expediente_id);
CREATE INDEX IF NOT EXISTS idx_audiencias_fecha ON audiencias(fecha);
CREATE INDEX IF NOT EXISTS idx_audiencias_gerencia ON audiencias(gerencia_id);
CREATE INDEX IF NOT EXISTS idx_audiencias_atendida ON audiencias(atendida);
CREATE INDEX IF NOT EXISTS idx_audiencias_usuario ON audiencias(usuario_responsable_id);

-- Recordatorios
CREATE INDEX IF NOT EXISTS idx_recordatorios_usuario ON recordatorios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_recordatorios_fecha ON recordatorios(fecha);
CREATE INDEX IF NOT EXISTS idx_recordatorios_completado ON recordatorios(completado);
CREATE INDEX IF NOT EXISTS idx_recordatorios_expediente ON recordatorios(expediente_id);

-- Notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha ON notificaciones(fecha_envio);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON notificaciones(tipo);

-- Actividad
CREATE INDEX IF NOT EXISTS idx_actividad_expediente ON actividad_expedientes(expediente_id);
CREATE INDEX IF NOT EXISTS idx_actividad_fecha ON actividad_expedientes(fecha_registro);
CREATE INDEX IF NOT EXISTS idx_actividad_usuario ON actividad_expedientes(usuario_id);

-- Documentos
CREATE INDEX IF NOT EXISTS idx_documentos_expediente ON documentos(expediente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_usuario ON documentos(usuario_subio_id);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo_documento);

-- Comentarios
CREATE INDEX IF NOT EXISTS idx_comentarios_expediente ON comentarios(expediente_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario ON comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_padre ON comentarios(comentario_padre_id);

-- Asignaciones
CREATE INDEX IF NOT EXISTS idx_asignaciones_expediente ON asignaciones_expedientes(expediente_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_usuario ON asignaciones_expedientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_activa ON asignaciones_expedientes(activa);

-- Logs
CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_fecha ON logs_auditoria(fecha_accion);
CREATE INDEX IF NOT EXISTS idx_logs_accion ON logs_auditoria(accion);

-- Usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_gerencia ON usuarios(gerencia_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios(activo);

-- ================================================
-- TRIGGERS Y FUNCIONES
-- ================================================

-- Función para actualizar timestamp de última modificación
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER trigger_terminos_timestamp
    BEFORE UPDATE ON terminos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_audiencias_timestamp
    BEFORE UPDATE ON audiencias
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

CREATE TRIGGER trigger_recordatorios_timestamp
    BEFORE UPDATE ON recordatorios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- Trigger para actualizar ultima_actualizacion en expedientes
CREATE OR REPLACE FUNCTION actualizar_expediente_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE expedientes 
    SET ultima_actualizacion = CURRENT_TIMESTAMP 
    WHERE id = NEW.expediente_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_terminos_actualiza_expediente
    AFTER INSERT OR UPDATE ON terminos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_expediente_timestamp();

CREATE TRIGGER trigger_audiencias_actualiza_expediente
    AFTER INSERT OR UPDATE ON audiencias
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_expediente_timestamp();

-- Trigger para crear actividad automática en cambios de estatus de términos
CREATE OR REPLACE FUNCTION registrar_cambio_estatus_termino()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.estatus IS DISTINCT FROM NEW.estatus THEN
        INSERT INTO actividad_expedientes (expediente_id, titulo, descripcion, tipo_actividad, tipo_icono)
        VALUES (
            NEW.expediente_id,
            'Cambio de estatus en término',
            'Término "' || NEW.actuacion || '" cambió de ' || OLD.estatus || ' a ' || NEW.estatus,
            'status',
            'status'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_terminos_registrar_cambio_estatus
    AFTER UPDATE ON terminos
    FOR EACH ROW
    WHEN (OLD.estatus IS DISTINCT FROM NEW.estatus)
    EXECUTE FUNCTION registrar_cambio_estatus_termino();

-- ================================================
-- DATOS SEMILLA (SEED DATA)
-- ================================================

-- Gerencias
INSERT INTO gerencias (nombre, descripcion) VALUES
    ('Gerencia de Asuntos Jurídicos Fiscales', 'Manejo de controversias fiscales'),
    ('Gerencia de Asuntos Jurídicos Laborales', 'Manejo de conflictos laborales'),
    ('Gerencia de Asuntos Jurídicos Civiles', 'Asuntos civiles y mercantiles'),
    ('Gerencia de Asuntos Jurídicos Administrativos', 'Controversias administrativas')
ON CONFLICT (nombre) DO NOTHING;

-- Materias
INSERT INTO materias (nombre) VALUES
    ('Fiscal'),
    ('Laboral'),
    ('Civil'),
    ('Mercantil'),
    ('Administrativo'),
    ('Amparo')
ON CONFLICT (nombre) DO NOTHING;

-- Usuario administrador por defecto (contraseña: admin123 - debe cambiarse en producción)
-- BCrypt hash de "admin123": $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO usuarios (username, password, email, nombre_completo, rol, activo) VALUES
    ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@juridico.gob.mx', 'Administrador del Sistema', 'Admin', true)
ON CONFLICT (username) DO NOTHING;

-- Configuraciones iniciales
INSERT INTO configuraciones (clave, valor, descripcion, tipo_dato, modificable) VALUES
    ('dias_alerta_termino', '3', 'Días antes del vencimiento para alerta de término', 'number', true),
    ('dias_alerta_audiencia', '1', 'Días antes para alerta de audiencia', 'number', true),
    ('max_expedientes_por_usuario', '50', 'Límite de expedientes activos por usuario', 'number', true),
    ('permitir_edicion_terminos_liberados', 'false', 'Permitir editar términos en estatus Liberado o superior', 'boolean', true),
    ('formato_numero_expediente', 'EXP-####', 'Formato para número de expediente (#### se reemplaza)', 'string', true),
    ('ruta_almacenamiento_documentos', '/var/juridico/documentos', 'Ruta del servidor para almacenar documentos', 'string', true)
ON CONFLICT (clave) DO NOTHING;

-- ================================================
-- VISTAS ÚTILES PARA REPORTES
-- ================================================

-- Vista: Expedientes con información completa
CREATE OR REPLACE VIEW v_expedientes_completos AS
SELECT 
    e.id,
    e.numero,
    e.descripcion,
    e.sede,
    e.partes,
    e.prioridad,
    e.etapa_procesal,
    e.abogado_responsable,
    g.nombre AS gerencia_nombre,
    m.nombre AS materia_nombre,
    u.nombre_completo AS creador_nombre,
    e.fecha_creacion,
    e.ultima_actualizacion,
    COUNT(DISTINCT t.id) AS total_terminos,
    COUNT(DISTINCT a.id) AS total_audiencias,
    COUNT(DISTINCT d.id) AS total_documentos
FROM expedientes e
LEFT JOIN gerencias g ON e.gerencia_id = g.id
LEFT JOIN materias m ON e.materia_id = m.id
LEFT JOIN usuarios u ON e.usuario_creador_id = u.id
LEFT JOIN terminos t ON e.id = t.expediente_id
LEFT JOIN audiencias a ON e.id = a.expediente_id
LEFT JOIN documentos d ON e.id = d.expediente_id
GROUP BY e.id, g.nombre, m.nombre, u.nombre_completo;

-- Vista: Términos próximos a vencer (próximos 7 días)
CREATE OR REPLACE VIEW v_terminos_proximos AS
SELECT 
    t.id,
    t.actuacion,
    t.fecha_vencimiento,
    t.estatus,
    t.prioridad_termino,
    e.numero AS expediente_numero,
    e.descripcion AS expediente_descripcion,
    g.nombre AS gerencia_nombre,
    u.nombre_completo AS usuario_asignado,
    DATE_PART('day', t.fecha_vencimiento - CURRENT_DATE) AS dias_restantes
FROM terminos t
INNER JOIN expedientes e ON t.expediente_id = e.id
LEFT JOIN gerencias g ON e.gerencia_id = g.id
LEFT JOIN usuarios u ON t.usuario_asignado_id = u.id
WHERE t.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    AND t.estatus NOT IN ('Concluido')
ORDER BY t.fecha_vencimiento ASC;

-- Vista: Audiencias próximas (próximos 7 días)
CREATE OR REPLACE VIEW v_audiencias_proximas AS
SELECT 
    a.id,
    a.fecha,
    a.hora,
    a.tipo,
    a.es_en_linea,
    a.sala_lugar,
    a.atendida,
    e.numero AS expediente_numero,
    e.descripcion AS expediente_descripcion,
    g.nombre AS gerencia_nombre,
    u.nombre_completo AS usuario_responsable
FROM audiencias a
INNER JOIN expedientes e ON a.expediente_id = e.id
LEFT JOIN gerencias g ON a.gerencia_id = g.id
LEFT JOIN usuarios u ON a.usuario_responsable_id = u.id
WHERE a.fecha BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    AND a.atendida = FALSE
ORDER BY a.fecha ASC, a.hora ASC;

-- Vista: Carga de trabajo por usuario
CREATE OR REPLACE VIEW v_carga_trabajo_usuarios AS
SELECT 
    u.id AS usuario_id,
    u.nombre_completo,
    u.rol,
    g.nombre AS gerencia_nombre,
    COUNT(DISTINCT CASE WHEN t.estatus = 'Proyectista' THEN t.id END) AS terminos_proyectista,
    COUNT(DISTINCT CASE WHEN t.estatus = 'Revisión' THEN t.id END) AS terminos_revision,
    COUNT(DISTINCT CASE WHEN t.estatus = 'Gerencia' THEN t.id END) AS terminos_gerencia,
    COUNT(DISTINCT CASE WHEN t.estatus = 'Dirección' THEN t.id END) AS terminos_direccion,
    COUNT(DISTINCT CASE WHEN t.estatus NOT IN ('Concluido') THEN t.id END) AS terminos_activos,
    COUNT(DISTINCT ae.expediente_id) AS expedientes_asignados
FROM usuarios u
LEFT JOIN gerencias g ON u.gerencia_id = g.id
LEFT JOIN terminos t ON u.id = t.usuario_asignado_id
LEFT JOIN asignaciones_expedientes ae ON u.id = ae.usuario_id AND ae.activa = TRUE
WHERE u.activo = TRUE
GROUP BY u.id, u.nombre_completo, u.rol, g.nombre;

-- ================================================
-- GRANTS Y PERMISOS (AJUSTAR SEGÚN NECESIDAD)
-- ================================================

-- Otorgar permisos al usuario de aplicación
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO juridico_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO juridico_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO juridico_user;

-- ================================================
-- FIN DEL ESQUEMA
-- ================================================

-- Verificación de tablas creadas
DO $$
DECLARE
    tabla_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tabla_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'ESQUEMA DE BASE DE DATOS CREADO EXITOSAMENTE';
    RAISE NOTICE 'Total de tablas creadas: %', tabla_count;
    RAISE NOTICE '==============================================';
END $$;
