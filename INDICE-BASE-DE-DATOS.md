# 📚 ÍNDICE DE BASE DE DATOS - SISTEMA JURÍDICO V3

## 📁 Archivos Principales

### 1. `database-schema-completo.sql`
**Archivo principal del esquema de base de datos**

- **Tamaño:** ~800 líneas de SQL
- **Creado:** 6 de enero de 2026
- **Versión:** 1.0
- **PostgreSQL:** 15+

**Contenido:**
- ✅ 17 tablas principales con relaciones completas
- ✅ 3 vistas materializadas para reportes
- ✅ 40+ índices optimizados
- ✅ 10 triggers automáticos
- ✅ Datos iniciales (seed data)
- ✅ Comentarios en español

**Uso:**
```bash
# Crear base de datos
createdb juridico_db

# Ejecutar esquema
psql -d juridico_db -f database-schema-completo.sql
```

---

### 2. `ANALISIS-BASE-DE-DATOS.md`
**Documentación técnica completa del esquema**

- **Tamaño:** ~1,500 líneas de documentación
- **Formato:** Markdown con ejemplos de código

**Contenido:**
- ✅ Análisis detallado de los 9 módulos del frontend
- ✅ Decisiones de diseño explicadas
- ✅ Diagramas de relaciones entre tablas
- ✅ Justificación de nomenclatura ("Etapa Procesal" vs "Estado")
- ✅ Índices y optimizaciones
- ✅ Guía de migración desde `base.sql`
- ✅ Checklist de validación completo

---

### 3. `base.sql` (⚠️ OBSOLETO)
**Esquema antiguo - NO USAR**

⚠️ **ESTADO:** Obsoleto, creado antes de finalizar el frontend

**Problemas:**
- ❌ Solo 6 tablas (faltan 11 tablas)
- ❌ Nomenclatura incorrecta ("estado" en vez de "etapa_procesal")
- ❌ Sin índices optimizados
- ❌ Sin triggers ni auditoría
- ❌ Sin datos iniciales
- ❌ Sin vistas para reportes

**Acción requerida:** Ignorar este archivo y usar `database-schema-completo.sql`

---

## 📊 Resumen del Esquema Actual

### Tablas por Módulo

| Módulo | Tablas | Descripción |
|--------|--------|-------------|
| **Catálogos** | 4 | gerencias, materias, organos_jurisdiccionales, tipos_audiencia |
| **Usuarios** | 1 | usuarios (con roles y permisos) |
| **Expedientes** | 4 | expedientes, actividad_expedientes, documentos_expediente, comentarios |
| **Audiencias** | 2 | audiencias, audiencias_desahogadas |
| **Términos** | 2 | terminos, terminos_presentados |
| **Notificaciones** | 1 | notificaciones |
| **Recordatorios** | 1 | recordatorios |
| **Calendario** | 1 | eventos_calendario |
| **TOTAL** | **17 tablas** | |

### Vistas Materializadas

1. **vista_expedientes_completa** - Datos completos de expedientes con joins
2. **vista_audiencias_proximas** - Audiencias pendientes con días restantes
3. **vista_terminos_por_vencer** - Términos próximos a vencer

### Datos Iniciales (Seed Data)

- **3 gerencias** predefinidas
- **8 materias** relacionadas a gerencias
- **6 tipos de audiencia**
- **6 órganos jurisdiccionales** de ejemplo
- **1 usuario administrador** (email: admin@juridico.gob.mx, password: admin123)

---

## 🔑 Nomenclatura Corregida

### ⚠️ CRÍTICO: Estado vs Etapa Procesal

**Contexto del usuario:**
> "El filtro Estado deberia llamarse Etapa Procesal. Debido a que Estado es para referirse a Estados de la Republica, Estatus a otro dato y Etapa Procesal a la estapa del Expediente"

**Implementación:**

```sql
-- ❌ INCORRECTO (base.sql)
estado VARCHAR(30)

-- ✅ CORRECTO (database-schema-completo.sql)
etapa_procesal VARCHAR(30) NOT NULL DEFAULT 'TRAMITE' 
    CHECK (etapa_procesal IN ('TRAMITE', 'LAUDO', 'FIRME', 'CONCLUIDO'))
```

**Uso de términos:**
- **Estado**: Estados geográficos de la República Mexicana (Jalisco, CDMX, etc.)
- **Estatus**: Estado operativo de entidades (PENDIENTE, CON_ACTA, CONCLUIDA)
- **Etapa Procesal**: Fase del expediente (TRAMITE, LAUDO, FIRME, CONCLUIDO)

---

## 🚀 Guía de Implementación

### Paso 1: Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE juridico_db;

# Salir
\q

# Ejecutar esquema completo
psql -U postgres -d juridico_db -f database-schema-completo.sql
```

### Paso 2: Verificar Instalación

```sql
-- Contar tablas creadas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Resultado esperado: 17

-- Contar vistas
SELECT COUNT(*) FROM information_schema.views 
WHERE table_schema = 'public';
-- Resultado esperado: 3

-- Verificar datos iniciales
SELECT COUNT(*) FROM gerencias; -- Esperado: 3
SELECT COUNT(*) FROM materias; -- Esperado: 8
SELECT COUNT(*) FROM usuarios WHERE email = 'admin@juridico.gob.mx'; -- Esperado: 1
```

### Paso 3: Configurar Backend (Spring Boot)

Actualizar `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/juridico_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

**IMPORTANTE:** Usar `ddl-auto=validate` (NO `update` o `create-drop`) ya que el esquema se gestiona mediante SQL scripts.

---

## 🏗️ Arquitectura de Entidades JPA

### Ejemplo: Expediente Entity

```java
@Entity
@Table(name = "expedientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Expediente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String numero;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "materia_id", nullable = false)
    private Materia materia;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gerencia_id", nullable = false)
    private Gerencia gerencia;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "etapa_procesal", nullable = false, length = 30)
    private EtapaProcesal etapaProcesal; // ← IMPORTANTE: NO "estado"
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Prioridad prioridad;
    
    @Column(length = 150)
    private String sede; // Estado geográfico
    
    @Column(columnDefinition = "TEXT")
    private String partes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "abogado_responsable_id")
    private Usuario abogadoResponsable;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
    
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @OneToMany(mappedBy = "expediente", cascade = CascadeType.ALL)
    private List<Audiencia> audiencias;
    
    @OneToMany(mappedBy = "expediente", cascade = CascadeType.ALL)
    private List<Termino> terminos;
}

// Enum para Etapa Procesal
public enum EtapaProcesal {
    TRAMITE,
    LAUDO,
    FIRME,
    CONCLUIDO
}
```

---

## 📋 Checklist de Migración

### Antes de Iniciar Desarrollo

- [ ] Ejecutar `database-schema-completo.sql` en PostgreSQL
- [ ] Verificar que se crearon las 17 tablas
- [ ] Verificar que se crearon las 3 vistas
- [ ] Verificar datos iniciales (gerencias, materias, usuario admin)
- [ ] Actualizar `application.properties` con conexión correcta
- [ ] Configurar `ddl-auto=validate` (NO `update`)

### Durante Desarrollo

- [ ] Crear entidades JPA para las 17 tablas
- [ ] Usar `etapa_procesal` (NO `estado`) en clase Expediente
- [ ] Implementar enums: EtapaProcesal, Prioridad, Rol, etc.
- [ ] Crear repositories Spring Data JPA
- [ ] Implementar DTOs para requests/responses
- [ ] Configurar mappers (ModelMapper o MapStruct)

### Testing

- [ ] Probar CRUD de expedientes
- [ ] Verificar que triggers funcionan (updated_at, actividad)
- [ ] Probar vistas materializadas desde servicios
- [ ] Validar relaciones (expediente → audiencias → audiencias_desahogadas)
- [ ] Verificar cascadas (DELETE expediente → DELETE audiencias/terminos)

---

## 📞 Documentos Relacionados

1. **PLAN-IMPLEMENTACION-BACKEND.md** - Plan de 75 tareas en 3 semanas
2. **PREPARACION-BACKEND.md** - Guía paso a paso de configuración
3. **database-schema-completo.sql** - Esquema SQL ejecutable
4. **ANALISIS-BASE-DE-DATOS.md** - Documentación técnica detallada
5. ~~**base.sql**~~ - OBSOLETO, NO USAR

---

## ✅ Resumen Ejecutivo

| Aspecto | Detalle |
|---------|---------|
| **Tablas** | 17 tablas principales |
| **Vistas** | 3 vistas materializadas |
| **Índices** | 40+ índices optimizados |
| **Triggers** | 10 triggers automáticos |
| **Seed Data** | Gerencias, materias, tipos audiencia, órganos, admin |
| **Nomenclatura** | ✅ Corregida ("Etapa Procesal" NO "estado") |
| **Módulos** | ✅ 9 módulos del frontend cubiertos |
| **Auditoría** | ✅ created_at, updated_at, created_by, updated_by |
| **PostgreSQL** | 15+ requerido (usa gen_random_uuid(), CHECK constraints) |

---

**Creado:** 6 de enero de 2026  
**Última actualización:** 6 de enero de 2026  
**Versión:** 1.0
