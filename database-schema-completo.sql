-- =====================================================
-- SISTEMA JURÍDICO GOB.MX V3 - ESQUEMA DE BASE DE DATOS
-- =====================================================
-- Creado: 6 de enero de 2026
-- PostgreSQL 15+
-- Encoding: UTF-8
-- =====================================================

-- Eliminar tablas existentes (solo para desarrollo)
DROP TABLE IF EXISTS comentarios CASCADE;
DROP TABLE IF EXISTS documentos_expediente CASCADE;
DROP TABLE IF EXISTS actividad_expedientes CASCADE;
DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS recordatorios CASCADE;
DROP TABLE IF EXISTS eventos_calendario CASCADE;
DROP TABLE IF EXISTS terminos_presentados CASCADE;
DROP TABLE IF EXISTS audiencias_desahogadas CASCADE;
DROP TABLE IF EXISTS terminos CASCADE;
DROP TABLE IF EXISTS audiencias CASCADE;
DROP TABLE IF EXISTS expedientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS materias CASCADE;
DROP TABLE IF EXISTS gerencias CASCADE;
DROP TABLE IF EXISTS tipos_audiencia CASCADE;
DROP TABLE IF EXISTS organos_jurisdiccionales CASCADE;

-- =====================================================
-- 1. TABLAS DE CATÁLOGOS BASE
-- =====================================================

-- 1.1 Gerencias (Áreas organizacionales)
CREATE TABLE gerencias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE gerencias IS 'Gerencias o áreas organizacionales del sistema jurídico';
COMMENT ON COLUMN gerencias.nombre IS 'Nombre completo de la gerencia';

-- 1.2 Materias (Especialidades jurídicas)
CREATE TABLE materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    gerencia_id INTEGER NOT NULL REFERENCES gerencias(id) ON DELETE RESTRICT,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nombre, gerencia_id)
);

COMMENT ON TABLE materias IS 'Materias jurídicas (Civil, Penal, Laboral, etc.) asociadas a gerencias';
COMMENT ON COLUMN materias.gerencia_id IS 'Relación N:1 - Una materia pertenece a una gerencia específica';

-- 1.3 Órganos Jurisdiccionales (Catálogo)
CREATE TABLE organos_jurisdiccionales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(300) NOT NULL UNIQUE,
    tipo VARCHAR(50), -- 'Juzgado', 'Tribunal', 'Sala', 'Junta'
    sede VARCHAR(100), -- Ciudad/Estado
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE organos_jurisdiccionales IS 'Catálogo de tribunales, juzgados y juntas jurisdiccionales';
COMMENT ON COLUMN organos_jurisdiccionales.tipo IS 'Tipo de órgano: Juzgado, Tribunal, Sala, Junta';
COMMENT ON COLUMN organos_jurisdiccionales.sede IS 'Ubicación geográfica (Estado de la República Mexicana)';

-- 1.4 Tipos de Audiencia (Catálogo configurable)
CREATE TABLE tipos_audiencia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tipos_audiencia IS 'Catálogo de tipos de audiencia (Inicial, Intermedia, Juicio, Constitucional, etc.)';

-- =====================================================
-- 2. TABLA DE USUARIOS Y SEGURIDAD
-- =====================================================

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('SUBDIRECTOR', 'DIRECCION', 'SUBDIRECCION', 'GERENTE', 'JEFE_DEPTO', 'ABOGADO')),
    gerencia_id INTEGER REFERENCES gerencias(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

COMMENT ON TABLE usuarios IS 'Usuarios del sistema con roles y permisos';
COMMENT ON COLUMN usuarios.rol IS 'Rol del usuario: SUBDIRECTOR, DIRECCION, SUBDIRECCION, GERENTE, JEFE_DEPTO, ABOGADO';
COMMENT ON COLUMN usuarios.password_hash IS 'Password encriptado con BCrypt';
COMMENT ON COLUMN usuarios.gerencia_id IS 'Gerencia a la que pertenece el usuario';

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_gerencia ON usuarios(gerencia_id);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- =====================================================
-- 3. MÓDULO DE EXPEDIENTES
-- =====================================================

CREATE TABLE expedientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    materia_id INTEGER NOT NULL REFERENCES materias(id) ON DELETE RESTRICT,
    gerencia_id INTEGER NOT NULL REFERENCES gerencias(id) ON DELETE RESTRICT,
    organo_jurisdiccional_id INTEGER REFERENCES organos_jurisdiccionales(id) ON DELETE SET NULL,
    organo_jurisdiccional_texto TEXT, -- Campo auxiliar si no está en catálogo
    
    -- Información de partes
    partes TEXT, -- Formato: "Actor vs Demandado"
    
    -- Ubicación
    sede VARCHAR(150), -- Estado de la República o ciudad
    
    -- Prioridad
    prioridad VARCHAR(20) NOT NULL DEFAULT 'MEDIA' CHECK (prioridad IN ('ALTA', 'MEDIA', 'BAJA')),
    
    -- Etapa Procesal (NO "estado" para evitar confusión con estados geográficos)
    etapa_procesal VARCHAR(30) NOT NULL DEFAULT 'TRAMITE' CHECK (etapa_procesal IN ('TRAMITE', 'LAUDO', 'FIRME', 'CONCLUIDO')),
    
    -- Asignaciones
    abogado_responsable_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    abogado_responsable_nombre VARCHAR(200), -- Nombre para visualización
    
    -- Auditoría
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

COMMENT ON TABLE expedientes IS 'Expedientes o asuntos jurídicos del sistema';
COMMENT ON COLUMN expedientes.numero IS 'Número único del expediente (Ej: EXP-0001)';
COMMENT ON COLUMN expedientes.etapa_procesal IS 'Etapa del proceso: TRAMITE, LAUDO, FIRME, CONCLUIDO (NO confundir con estado geográfico)';
COMMENT ON COLUMN expedientes.prioridad IS 'Prioridad del expediente: ALTA, MEDIA, BAJA';
COMMENT ON COLUMN expedientes.sede IS 'Ubicación geográfica (Estado de la República)';
COMMENT ON COLUMN expedientes.organo_jurisdiccional_texto IS 'Nombre del órgano si no está en catálogo';

-- Índices para expedientes
CREATE INDEX idx_expedientes_numero ON expedientes(numero);
CREATE INDEX idx_expedientes_gerencia ON expedientes(gerencia_id);
CREATE INDEX idx_expedientes_materia ON expedientes(materia_id);
CREATE INDEX idx_expedientes_etapa ON expedientes(etapa_procesal);
CREATE INDEX idx_expedientes_prioridad ON expedientes(prioridad);
CREATE INDEX idx_expedientes_abogado ON expedientes(abogado_responsable_id);
CREATE INDEX idx_expedientes_fecha_creacion ON expedientes(fecha_creacion DESC);

-- =====================================================
-- 4. MÓDULO DE AUDIENCIAS
-- =====================================================

CREATE TABLE audiencias (
    id SERIAL PRIMARY KEY,
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    
    -- Información temporal
    fecha_audiencia DATE NOT NULL,
    hora_audiencia TIME NOT NULL,
    
    -- Tipo de audiencia
    tipo_audiencia_id INTEGER REFERENCES tipos_audiencia(id) ON DELETE SET NULL,
    tipo_audiencia_texto VARCHAR(100), -- Campo auxiliar para tipos personalizados
    
    -- Modalidad
    es_virtual BOOLEAN DEFAULT FALSE,
    url_reunion TEXT,
    sala_lugar TEXT,
    
    -- Participantes
    abogado_comparece_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    abogado_comparece_nombre VARCHAR(200),
    
    -- Estados de la audiencia (flujo de 3 estados)
    estatus_audiencia VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE' CHECK (estatus_audiencia IN ('PENDIENTE', 'CON_ACTA', 'CONCLUIDA')),
    
    -- Documentos
    acta_documento VARCHAR(500), -- Ruta o nombre del archivo
    tipo_documento VARCHAR(50), -- 'Acta', 'Alegatos Amparo', etc.
    
    -- Conclusión
    fecha_desahogo DATE,
    observaciones_finales TEXT,
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

COMMENT ON TABLE audiencias IS 'Audiencias programadas y desahogadas del sistema';
COMMENT ON COLUMN audiencias.estatus_audiencia IS 'Estado del flujo: PENDIENTE (sin acta), CON_ACTA (acta adjunta), CONCLUIDA (finalizada)';
COMMENT ON COLUMN audiencias.es_virtual IS 'TRUE si la audiencia es en línea, FALSE si es presencial';
COMMENT ON COLUMN audiencias.fecha_desahogo IS 'Fecha en que se desahogó la audiencia';

-- Índices para audiencias
CREATE INDEX idx_audiencias_expediente ON audiencias(expediente_id);
CREATE INDEX idx_audiencias_fecha ON audiencias(fecha_audiencia);
CREATE INDEX idx_audiencias_estatus ON audiencias(estatus_audiencia);
CREATE INDEX idx_audiencias_abogado ON audiencias(abogado_comparece_id);
CREATE INDEX idx_audiencias_tipo ON audiencias(tipo_audiencia_id);

-- =====================================================
-- 5. TABLA PUENTE: AUDIENCIAS DESAHOGADAS (AGENDA GENERAL)
-- =====================================================

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

COMMENT ON TABLE audiencias_desahogadas IS 'Vista materializada de audiencias concluidas para Agenda General';
COMMENT ON COLUMN audiencias_desahogadas.sincronizado_at IS 'Fecha de última sincronización desde audiencias';

CREATE INDEX idx_audiencias_desahogadas_fecha ON audiencias_desahogadas(fecha_desahogo DESC);
CREATE INDEX idx_audiencias_desahogadas_audiencia ON audiencias_desahogadas(audiencia_id);

-- =====================================================
-- 6. MÓDULO DE TÉRMINOS
-- =====================================================

CREATE TABLE terminos (
    id SERIAL PRIMARY KEY,
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    
    -- Información del término
    actuacion TEXT NOT NULL,
    asunto_descripcion TEXT,
    
    -- Fechas
    fecha_ingreso DATE,
    fecha_vencimiento DATE NOT NULL,
    
    -- Flujo de aprobación (7 estatus)
    estatus_termino VARCHAR(30) NOT NULL DEFAULT 'PROYECTISTA' 
        CHECK (estatus_termino IN ('PROYECTISTA', 'REVISION', 'GERENCIA', 'DIRECCION', 'LIBERADO', 'PRESENTADO', 'CONCLUIDO')),
    
    -- Documentos
    archivo_word VARCHAR(500), -- Borrador/proyecto
    archivo_acuse VARCHAR(500), -- Acuse final
    
    -- Metadatos
    prioridad VARCHAR(20) NOT NULL DEFAULT 'MEDIA' CHECK (prioridad IN ('ALTA', 'MEDIA', 'BAJA')),
    observaciones TEXT,
    
    -- Participantes
    actor TEXT, -- Parte actora
    tribunal_texto TEXT, -- Tribunal o juzgado
    abogado_responsable_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    abogado_responsable_nombre VARCHAR(200),
    
    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

COMMENT ON TABLE terminos IS 'Términos con flujo de trabajo de 7 etapas';
COMMENT ON COLUMN terminos.estatus_termino IS 'Flujo: PROYECTISTA → REVISION → GERENCIA → DIRECCION → LIBERADO → PRESENTADO → CONCLUIDO';
COMMENT ON COLUMN terminos.actuacion IS 'Descripción de la actuación o término';
COMMENT ON COLUMN terminos.archivo_word IS 'Documento borrador en proceso';
COMMENT ON COLUMN terminos.archivo_acuse IS 'Documento final con acuse de recibo';

-- Índices para términos
CREATE INDEX idx_terminos_expediente ON terminos(expediente_id);
CREATE INDEX idx_terminos_estatus ON terminos(estatus_termino);
CREATE INDEX idx_terminos_fecha_vencimiento ON terminos(fecha_vencimiento);
CREATE INDEX idx_terminos_prioridad ON terminos(prioridad);
CREATE INDEX idx_terminos_abogado ON terminos(abogado_responsable_id);

-- =====================================================
-- 7. TABLA PUENTE: TÉRMINOS PRESENTADOS (AGENDA GENERAL)
-- =====================================================

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

COMMENT ON TABLE terminos_presentados IS 'Vista materializada de términos presentados para Agenda General';

CREATE INDEX idx_terminos_presentados_fecha ON terminos_presentados(fecha_presentacion DESC);
CREATE INDEX idx_terminos_presentados_termino ON terminos_presentados(termino_id);

-- =====================================================
-- 8. MÓDULO DE ACTIVIDAD/TIMELINE DE EXPEDIENTES
-- =====================================================

CREATE TABLE actividad_expedientes (
    id SERIAL PRIMARY KEY,
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_icono VARCHAR(30) NOT NULL CHECK (tipo_icono IN ('UPLOAD', 'EDIT', 'STATUS', 'DELETE', 'CREATE', 'COMMENT', 'DOCUMENT')),
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    usuario_nombre VARCHAR(200),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE actividad_expedientes IS 'Timeline de actividades de cada expediente';
COMMENT ON COLUMN actividad_expedientes.tipo_icono IS 'Tipo de actividad para icono: UPLOAD, EDIT, STATUS, DELETE, CREATE, COMMENT, DOCUMENT';

CREATE INDEX idx_actividad_expediente ON actividad_expedientes(expediente_id);
CREATE INDEX idx_actividad_fecha ON actividad_expedientes(fecha_registro DESC);

-- =====================================================
-- 9. MÓDULO DE DOCUMENTOS DE EXPEDIENTES
-- =====================================================

CREATE TABLE documentos_expediente (
    id SERIAL PRIMARY KEY,
    expediente_id UUID NOT NULL REFERENCES expedientes(id) ON DELETE CASCADE,
    nombre_archivo VARCHAR(300) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_documento VARCHAR(50), -- 'Acta', 'Demanda', 'Contestación', 'Pruebas', 'Sentencia', etc.
    mime_type VARCHAR(100),
    tamanio_bytes BIGINT,
    descripcion TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    uploaded_by_nombre VARCHAR(200)
);

COMMENT ON TABLE documentos_expediente IS 'Documentos adjuntos a expedientes';
COMMENT ON COLUMN documentos_expediente.ruta_archivo IS 'Ruta relativa o absoluta del archivo en el sistema de archivos';

CREATE INDEX idx_documentos_expediente ON documentos_expediente(expediente_id);
CREATE INDEX idx_documentos_fecha ON documentos_expediente(uploaded_at DESC);

-- =====================================================
-- 10. MÓDULO DE COMENTARIOS (GENÉRICO)
-- =====================================================

CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    
    -- Referencia polimórfica
    entidad_tipo VARCHAR(30) NOT NULL CHECK (entidad_tipo IN ('EXPEDIENTE', 'AUDIENCIA', 'TERMINO')),
    entidad_id VARCHAR(50) NOT NULL, -- Puede ser UUID o INTEGER convertido a texto
    
    comentario TEXT NOT NULL,
    
    -- Usuario
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    usuario_nombre VARCHAR(200),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE comentarios IS 'Comentarios asociados a expedientes, audiencias o términos';
COMMENT ON COLUMN comentarios.entidad_tipo IS 'Tipo de entidad: EXPEDIENTE, AUDIENCIA, TERMINO';
COMMENT ON COLUMN comentarios.entidad_id IS 'ID de la entidad (UUID para expedientes, integer para otros)';

CREATE INDEX idx_comentarios_entidad ON comentarios(entidad_tipo, entidad_id);
CREATE INDEX idx_comentarios_fecha ON comentarios(created_at DESC);
CREATE INDEX idx_comentarios_usuario ON comentarios(usuario_id);

-- =====================================================
-- 11. MÓDULO DE NOTIFICACIONES
-- =====================================================

CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('AUDIENCIA', 'TERMINO', 'RECORDATORIO', 'SISTEMA', 'ALERTA')),
    prioridad VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (prioridad IN ('ALTA', 'NORMAL', 'BAJA')),
    
    -- Estados
    leida BOOLEAN DEFAULT FALSE,
    fecha_leida TIMESTAMP WITH TIME ZONE,
    
    -- Notificación programada
    notificar_en TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Referencia opcional a entidad
    entidad_tipo VARCHAR(30) CHECK (entidad_tipo IN ('EXPEDIENTE', 'AUDIENCIA', 'TERMINO', 'RECORDATORIO')),
    entidad_id VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE notificaciones IS 'Notificaciones del sistema para usuarios';
COMMENT ON COLUMN notificaciones.notificar_en IS 'Fecha/hora en que debe mostrarse la notificación';
COMMENT ON COLUMN notificaciones.tipo IS 'Tipo de notificación: AUDIENCIA, TERMINO, RECORDATORIO, SISTEMA, ALERTA';

CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_fecha ON notificaciones(notificar_en);
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo);

-- =====================================================
-- 12. MÓDULO DE RECORDATORIOS
-- =====================================================

CREATE TABLE recordatorios (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    titulo VARCHAR(200) NOT NULL,
    detalles TEXT,
    
    fecha_recordatorio DATE NOT NULL,
    hora_recordatorio TIME NOT NULL,
    
    prioridad VARCHAR(20) NOT NULL DEFAULT 'NORMAL' CHECK (prioridad IN ('URGENTE', 'NORMAL')),
    
    -- Estado
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE recordatorios IS 'Recordatorios personales de usuarios';
COMMENT ON COLUMN recordatorios.prioridad IS 'Prioridad: URGENTE o NORMAL';

CREATE INDEX idx_recordatorios_usuario ON recordatorios(usuario_id);
CREATE INDEX idx_recordatorios_fecha ON recordatorios(fecha_recordatorio, hora_recordatorio);
CREATE INDEX idx_recordatorios_completado ON recordatorios(completado);

-- =====================================================
-- 13. MÓDULO DE CALENDARIO
-- =====================================================

CREATE TABLE eventos_calendario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE,
    
    todo_el_dia BOOLEAN DEFAULT FALSE,
    
    categoria VARCHAR(30) NOT NULL CHECK (categoria IN ('AUDIENCIA', 'TERMINO', 'RECORDATORIO', 'REUNION', 'OTRO')),
    color VARCHAR(7), -- Código hexadecimal de color
    
    -- Referencia opcional a entidades existentes
    entidad_tipo VARCHAR(30) CHECK (entidad_tipo IN ('AUDIENCIA', 'TERMINO', 'RECORDATORIO')),
    entidad_id INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

COMMENT ON TABLE eventos_calendario IS 'Eventos del calendario del sistema';
COMMENT ON COLUMN eventos_calendario.categoria IS 'Categoría del evento para filtrado y visualización';
COMMENT ON COLUMN eventos_calendario.entidad_tipo IS 'Referencia opcional a audiencia, término o recordatorio';

CREATE INDEX idx_eventos_usuario ON eventos_calendario(usuario_id);
CREATE INDEX idx_eventos_fecha_inicio ON eventos_calendario(fecha_inicio);
CREATE INDEX idx_eventos_categoria ON eventos_calendario(categoria);

-- =====================================================
-- 14. TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- =====================================================

-- Función para actualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER trigger_gerencias_updated_at BEFORE UPDATE ON gerencias FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_materias_updated_at BEFORE UPDATE ON materias FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_expedientes_updated_at BEFORE UPDATE ON expedientes FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_audiencias_updated_at BEFORE UPDATE ON audiencias FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_terminos_updated_at BEFORE UPDATE ON terminos FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_comentarios_updated_at BEFORE UPDATE ON comentarios FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_recordatorios_updated_at BEFORE UPDATE ON recordatorios FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();
CREATE TRIGGER trigger_eventos_updated_at BEFORE UPDATE ON eventos_calendario FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- =====================================================
-- 15. FUNCIÓN PARA REGISTRAR ACTIVIDAD AUTOMÁTICA
-- =====================================================

CREATE OR REPLACE FUNCTION registrar_actividad_expediente()
RETURNS TRIGGER AS $$
BEGIN
    -- Al crear expediente
    IF TG_OP = 'INSERT' THEN
        INSERT INTO actividad_expedientes (expediente_id, titulo, descripcion, tipo_icono, usuario_id, usuario_nombre)
        VALUES (
            NEW.id,
            'Expediente creado',
            'Se creó el expediente ' || NEW.numero,
            'CREATE',
            NEW.created_by,
            (SELECT nombre_completo FROM usuarios WHERE id = NEW.created_by)
        );
    END IF;
    
    -- Al actualizar etapa procesal
    IF TG_OP = 'UPDATE' AND OLD.etapa_procesal IS DISTINCT FROM NEW.etapa_procesal THEN
        INSERT INTO actividad_expedientes (expediente_id, titulo, descripcion, tipo_icono, usuario_id, usuario_nombre)
        VALUES (
            NEW.id,
            'Cambio de etapa procesal',
            'Etapa cambió de ' || OLD.etapa_procesal || ' a ' || NEW.etapa_procesal,
            'STATUS',
            NEW.updated_by,
            (SELECT nombre_completo FROM usuarios WHERE id = NEW.updated_by)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actividad_expediente 
AFTER INSERT OR UPDATE ON expedientes 
FOR EACH ROW EXECUTE FUNCTION registrar_actividad_expediente();

-- =====================================================
-- 16. DATOS INICIALES (SEED DATA)
-- =====================================================

-- Gerencias
INSERT INTO gerencias (id, nombre, descripcion) VALUES
(1, 'Civil, Mercantil, Fiscal y Administrativo', 'Gerencia especializada en derecho civil, mercantil, fiscal y administrativo'),
(2, 'Laboral y Penal', 'Gerencia especializada en derecho laboral y penal'),
(3, 'Transparencia y Amparo', 'Gerencia especializada en transparencia y juicios de amparo');

-- Materias
INSERT INTO materias (id, nombre, gerencia_id) VALUES
(1, 'Civil', 1),
(2, 'Mercantil', 1),
(3, 'Fiscal', 1),
(4, 'Administrativo', 1),
(5, 'Laboral', 2),
(6, 'Penal', 2),
(7, 'Transparencia', 3),
(8, 'Amparo', 3);

-- Tipos de Audiencia
INSERT INTO tipos_audiencia (nombre, descripcion) VALUES
('Inicial', 'Audiencia inicial del proceso'),
('Intermedia', 'Audiencia intermedia'),
('Juicio Oral', 'Audiencia de juicio oral'),
('Constitucional', 'Audiencia constitucional'),
('Incidental', 'Audiencia incidental'),
('Conciliación', 'Audiencia de conciliación');

-- Órganos Jurisdiccionales (ejemplos)
INSERT INTO organos_jurisdiccionales (nombre, tipo, sede) VALUES
('Juzgado Primero de lo Civil', 'Juzgado', 'Ciudad de México'),
('Juzgado Segundo de lo Civil', 'Juzgado', 'Ciudad de México'),
('Juzgado Cuarto Civil', 'Juzgado', 'Ciudad de México'),
('Tribunal Federal de Justicia Administrativa', 'Tribunal', 'Ciudad de México'),
('Sala Regional del Noreste (TFJA)', 'Sala', 'Nuevo León'),
('Junta Local de Conciliación y Arbitraje No. 3', 'Junta', 'Jalisco');

-- Usuario administrador inicial (password: admin123)
INSERT INTO usuarios (nombre_completo, email, password_hash, rol, gerencia_id, activo) VALUES
('Administrador del Sistema', 'admin@juridico.gob.mx', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SUBDIRECTOR', 1, true);

-- Resetear secuencias
SELECT setval('gerencias_id_seq', (SELECT MAX(id) FROM gerencias));
SELECT setval('materias_id_seq', (SELECT MAX(id) FROM materias));
SELECT setval('tipos_audiencia_id_seq', (SELECT MAX(id) FROM tipos_audiencia));
SELECT setval('organos_jurisdiccionales_id_seq', (SELECT MAX(id) FROM organos_jurisdiccionales));
SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

-- =====================================================
-- 17. VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista de expedientes con información completa
CREATE OR REPLACE VIEW vista_expedientes_completa AS
SELECT 
    e.id,
    e.numero,
    e.descripcion,
    e.etapa_procesal,
    e.prioridad,
    e.sede,
    e.partes,
    g.nombre AS gerencia_nombre,
    m.nombre AS materia_nombre,
    o.nombre AS organo_jurisdiccional_nombre,
    o.sede AS organo_sede,
    u.nombre_completo AS abogado_responsable,
    e.fecha_creacion,
    e.fecha_actualizacion,
    (SELECT COUNT(*) FROM audiencias WHERE expediente_id = e.id) AS total_audiencias,
    (SELECT COUNT(*) FROM terminos WHERE expediente_id = e.id) AS total_terminos,
    (SELECT COUNT(*) FROM actividad_expedientes WHERE expediente_id = e.id) AS total_actividades
FROM expedientes e
LEFT JOIN gerencias g ON e.gerencia_id = g.id
LEFT JOIN materias m ON e.materia_id = m.id
LEFT JOIN organos_jurisdiccionales o ON e.organo_jurisdiccional_id = o.id
LEFT JOIN usuarios u ON e.abogado_responsable_id = u.id;

-- Vista de audiencias próximas
CREATE OR REPLACE VIEW vista_audiencias_proximas AS
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

-- Vista de términos por vencer
CREATE OR REPLACE VIEW vista_terminos_por_vencer AS
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

-- =====================================================
-- FIN DEL ESQUEMA
-- =====================================================

-- Información del esquema
COMMENT ON DATABASE juridico_db IS 'Base de datos del Sistema Jurídico GOB.MX V3 - Versión 1.0';

-- Verificación final
DO $$
BEGIN
    RAISE NOTICE '✅ Esquema de base de datos creado exitosamente';
    RAISE NOTICE '📊 Total de tablas: %', (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE');
    RAISE NOTICE '🔍 Total de vistas: %', (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public');
    RAISE NOTICE '🎯 Total de índices: %', (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public');
END $$;
