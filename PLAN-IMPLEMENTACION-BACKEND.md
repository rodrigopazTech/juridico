# 🚀 PLAN DE IMPLEMENTACIÓN BACKEND - SISTEMA JURÍDICO GOB.MX V3

## 📋 Información del Proyecto

**Stack Tecnológico:**
- Java 17+
- Spring Boot 3.x
- PostgreSQL 15+
- Thymeleaf
- Spring Security
- Spring Data JPA
- Lombok

**Repositorios:**
- Frontend: https://github.com/rodrigopazTech/juridico (actual)
- Backend: https://github.com/rodrigopazTech/juridico-springboot.git

**Base de Datos:**
- Esquema: `database-schema-completo.sql` (17 tablas, 3 vistas, 40+ índices)
- Análisis detallado: `ANALISIS-BASE-DE-DATOS.md`
- ⚠️ **IMPORTANTE:** `base.sql` está OBSOLETO, usar solo `database-schema-completo.sql`

**Equipo de Desarrollo:**
- **Ramses** - Senior Developer (Disponible: 12-20 enero, 4h/día, turno mañana 10:00-14:00)
- **Aurora** - Junior Developer (Disponible: Todo el proyecto, 4h/día, turno intermedio 11:00-15:00)
- **Ricardo** - Mid-Senior Developer (Disponible: Todo el proyecto, 4h/día, turno tarde 14:00-18:00)

**Fecha Inicio:** Lunes 12 de enero 2026  
**Horarios:** Lunes a Viernes, 4 horas/día por persona  
**Traslapes:** Ramses-Aurora (11:00-14:00), Aurora-Ricardo (14:00-15:00)  
**Metodología:** Desarrollo encadenado con handoffs entre turnos y traslapes para comunicación

---

## 🎯 Objetivos del Proyecto

1. Implementar API REST completa para todos los módulos del frontend
2. Migrar persistencia de localStorage a PostgreSQL
3. Implementar autenticación y autorización con Spring Security
4. Desarrollar interfaces Thymeleaf para administración
5. Establecer arquitectura limpia y escalable
6. Documentar APIs con Swagger/OpenAPI

---

## 📊 Análisis de Módulos Frontend a Implementar

### Módulos Principales:
1. **Gestión de Usuarios** (Usuarios, Gerencias, Materias, Roles)
2. **Expedientes** (CRUD, Timeline, Documentos, Vista 360°)
3. **Audiencias** (Gestión, Estados, Actas, Semáforo)
4. **Términos** (Flujo de trabajo, Aprobaciones, Estados)
5. **Calendario** (Eventos, Vistas múltiples)
6. **Dashboard** (Métricas, Estadísticas, Gráficos)
7. **Notificaciones** (Alertas, Recordatorios)
8. **Agenda General** (Vista unificada personal)

---

## � FASE 0: PREPARACIÓN DEL PROYECTO (Antes del 12 de enero)

### Estado Actual del Repositorio

El repositorio `juridico-springboot` tiene:

✅ **Correcto:**
- Proyecto Spring Boot 3.4.12 inicializado
- Dependencias base: JPA, PostgreSQL, Thymeleaf, Security, Validation
- Estructura de carpetas documentada
- Maven wrapper configurado

❌ **Requiere Limpieza/Adaptación:**
- Controllers son stubs vacíos sin lógica
- No existen: entities, services, repositories, DTOs
- Falta Lombok y Swagger en dependencias
- Configuración de BD necesita ajustes
- Templates solo documentados, no implementados
- Paquete base muy largo: `com.juridico.sistema_juridico`

### Tareas de Preparación Inmediata

**IMPORTANTE:** Estas tareas se deben completar **ANTES del lunes 12 de enero** para que el equipo pueda comenzar a trabajar sin fricción.

#### **PREP-001**: Actualizar `pom.xml` con dependencias faltantes
- [ ] Agregar Lombok para reducir boilerplate
- [ ] Agregar Springdoc OpenAPI (Swagger)
- [ ] Agregar Jakarta Validation API
- [ ] Agregar JWT dependencies (jjwt)
- [ ] Verificar versiones de dependencias

```xml
<!-- Agregar estas dependencias -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

#### **PREP-002**: Crear estructura de paquetes completa
- [ ] Crear carpeta `entity` en `com.juridico.sistema_juridico`
- [ ] Crear carpeta `repository` 
- [ ] Crear carpeta `service`
- [ ] Crear carpeta `dto` (con subcarpetas request/response)
- [ ] Crear carpeta `exception`
- [ ] Crear carpeta `util`
- [ ] Crear carpeta `security` (mover SecurityConfig aquí)

#### **PREP-003**: Limpiar controllers existentes
- [ ] **ELIMINAR** todos los controllers actuales (son stubs sin implementación)
- [ ] Dejar solo la estructura de carpeta `controller` vacía
- [ ] El equipo los recreará con implementación correcta

Archivos a eliminar:
- `AgendaController.java`
- `AudienciasController.java`
- `AuthController.java`
- `DashboardController.java`
- `ExpedientesController.java`
- `TerminosController.java`

#### **PREP-004**: Actualizar `application.properties`
- [ ] Cambiar nombre de BD a `juridico_db` (coincide con plan)
- [ ] Ajustar configuración de Hibernate
- [ ] Agregar configuración de JWT
- [ ] Agregar configuración de Swagger
- [ ] Configurar CORS para frontend
- [ ] Agregar configuración de file upload

```properties
# Base de datos
spring.datasource.url=jdbc:postgresql://localhost:5432/juridico_db
spring.datasource.username=postgres
spring.datasource.password=postgres

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT Configuration
jwt.secret=your-secret-key-change-in-production
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# File Upload
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=./uploads

# Swagger
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html

# CORS
cors.allowed-origins=http://localhost:5500,http://127.0.0.1:5500
```

#### **PREP-005**: Actualizar SecurityConfig para desarrollo
- [ ] Modificar para permitir acceso durante desarrollo
- [ ] Configurar CORS
- [ ] Preparar para JWT (estructura básica)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/swagger-ui/**", "/api-docs/**").permitAll()
                .anyRequest().permitAll() // TODO: Configurar roles después
            );
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5500", "http://127.0.0.1:5500"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

#### **PREP-006**: Crear archivo README.md del proyecto backend
- [ ] Documentar requisitos (Java 17, PostgreSQL 15)
- [ ] Instrucciones de instalación
- [ ] Cómo ejecutar el proyecto
- [ ] Cómo crear la base de datos
- [ ] URLs importantes (Swagger, API)

#### **PREP-007**: Preparar base de datos
- [ ] Crear base de datos `juridico_db`
- [ ] Ejecutar script `base.sql` del repositorio frontend
- [ ] Verificar conectividad desde Spring Boot

```sql
-- Ejecutar en PostgreSQL
CREATE DATABASE juridico_db;
CREATE USER juridico_user WITH PASSWORD 'juridico_pass';
GRANT ALL PRIVILEGES ON DATABASE juridico_db TO juridico_user;
```

#### **PREP-008**: Crear .gitignore actualizado
- [ ] Agregar carpeta `uploads/`
- [ ] Agregar archivos de configuración local
- [ ] Agregar archivos de IDE

```gitignore
# Ya existentes
TARGET/
.mvn/
*.jar
*.war
*.ear

# Agregar
uploads/
application-local.properties
.vscode/
.idea/
*.iml
*.log
```

#### **PREP-009**: Verificar que el proyecto compile y arranque
- [ ] Ejecutar `mvn clean install`
- [ ] Ejecutar `mvn spring-boot:run`
- [ ] Verificar que no hay errores
- [ ] Verificar acceso a http://localhost:8080
- [ ] Verificar Swagger en http://localhost:8080/swagger-ui.html

#### **PREP-010**: Crear documento HANDOFF-NOTES.md
- [ ] Crear archivo para comunicación entre turnos
- [ ] Incluir template para notas diarias

```markdown
# 📝 Handoff Notes - Sistema Jurídico Backend

## Formato de Notas Diarias

### [Fecha] - [Desarrollador] - [Turno]

#### ✅ Completado hoy:
- Tarea 1
- Tarea 2

#### 🚧 En progreso:
- Tarea pendiente

#### ⚠️ Bloqueadores/Issues:
- Problema 1

#### 📌 Siguiente turno debe:
- Acción 1
- Acción 2

#### 💬 Notas adicionales:
- Observaciones importantes
```

### ✅ Checklist de Preparación

Antes de que el equipo comience el 12 de enero, verificar:

- [ ] PREP-001: Dependencias actualizadas en pom.xml
- [ ] PREP-002: Estructura de paquetes creada
- [ ] PREP-003: Controllers stubs eliminados
- [ ] PREP-004: application.properties actualizado
- [ ] PREP-005: SecurityConfig actualizado
- [ ] PREP-006: README.md creado
- [ ] PREP-007: Base de datos preparada
- [ ] PREP-008: .gitignore actualizado
- [ ] PREP-009: Proyecto compila y arranca
- [ ] PREP-010: HANDOFF-NOTES.md creado

**Estimado de tiempo:** 2-3 horas para completar toda la preparación

**Responsable sugerido:** Rodrigo o cualquier desarrollador disponible antes del 12 de enero

---

## �📅 CALENDARIO DE IMPLEMENTACIÓN

### **SEMANA 1: Fundamentos y Arquitectura Base** (12-17 enero)

#### **Lunes 12 de Enero** 
**Día 1 de desarrollo - Fundamentos del proyecto**

##### Ramses (10:00-14:00) - Configuración Base
- [ ] **TASK-001**: Verificar configuración inicial del proyecto Spring Boot
  - Revisar dependencias en `pom.xml`
  - Configurar PostgreSQL en `application.properties`
  - Verificar estructura de carpetas (controller, service, repository, entity, dto)
  - **Complejidad**: Media | **Duración**: 2h
  
- [ ] **TASK-002**: Configurar PostgreSQL y crear base de datos
  - Crear base de datos `juridico_db`
  - Ejecutar script `base.sql` inicial
  - Configurar usuario y permisos
  - Documentar credenciales en README
  - **Complejidad**: Baja | **Duración**: 1h

- [ ] **TASK-003**: Implementar entidad `Gerencia`
  - Crear clase JPA Entity `Gerencia`
  - Crear Repository `GerenciaRepository`
  - Crear DTOs (GerenciaRequestDTO, GerenciaResponseDTO)
  - **Complejidad**: Baja | **Duración**: 1h
  - **Handoff a Aurora**: Documentar estructura de entidad y relaciones

##### Aurora (11:00-15:00) - Primeras Entidades
- [ ] **TASK-004**: Implementar Service básico de Gerencias
  - Crear `GerenciaService` con métodos CRUD básicos
  - Implementar conversión DTO ↔ Entity
  - Manejo de excepciones básicas
  - **Complejidad**: Baja | **Duración**: 2h
  
- [ ] **TASK-005**: Crear entidad `Materia` y Repository
  - Crear clase JPA Entity `Materia`
  - Definir relación N:1 con Gerencia
  - Crear `MateriaRepository`
  - Crear DTOs necesarios
  - **Complejidad**: Baja | **Duración**: 2h
  - **Handoff a Ricardo**: Dejar nota sobre relaciones implementadas

##### Ricardo (14:00-18:00) - Controllers Base
- [ ] **TASK-006**: Implementar Controller REST de Gerencias
  - Crear `GerenciaController` con endpoints CRUD
  - Implementar validaciones con `@Valid`
  - Documentar con Swagger annotations
  - Pruebas con Postman/Thunder Client
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-007**: Implementar Service y Controller de Materias
  - Crear `MateriaService` completo
  - Crear `MateriaController` con endpoints
  - Implementar endpoint para listar materias por gerencia
  - **Complejidad**: Media | **Duración**: 2h
  - **Commit y push** al finalizar día

---

#### **Martes 13 de Enero**
**Día 2 - Módulo de Usuarios y Seguridad Básica**

##### Ramses (10:00-14:00) - Entidad Usuario y Roles
- [ ] **TASK-008**: Implementar entidad `Usuario` completa
  - Crear Entity con campos (nombre, correo, password, rol, activo)
  - Definir enum `RolUsuario` (SUBDIRECTOR, GERENTE, ABOGADO)
  - Crear relación con Gerencia
  - Crear `UsuarioRepository`
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-009**: Configurar Spring Security básico
  - Agregar dependencia Spring Security
  - Crear `SecurityConfig` básico
  - Configurar encoder de passwords (BCrypt)
  - Configurar CORS para el frontend
  - **Complejidad**: Alta | **Duración**: 2h
  - **Handoff a Aurora**: Explicar configuración de seguridad (disponible en traslape 11:00-14:00)

##### Aurora (11:00-15:00) - Service de Usuarios
- [ ] **TASK-010**: Implementar `UsuarioService` básico
  - Crear métodos CRUD básicos
  - Implementar encriptación de passwords
  - Crear DTOs (UsuarioRequestDTO, UsuarioResponseDTO)
  - Conversión DTO ↔ Entity
  - **Complejidad**: Media | **Duración**: 2.5h

- [ ] **TASK-011**: Crear endpoint de registro de usuarios
  - Validaciones de email único
  - Validación de formato de correo
  - Hash de password antes de guardar
  - **Complejidad**: Baja | **Duración**: 1.5h
  - **Handoff a Ricardo**: Usuario listo para endpoints REST (disponible en traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Controller y Autenticación
- [ ] **TASK-012**: Implementar `UsuarioController` completo
  - Endpoints CRUD de usuarios
  - Endpoint de activar/desactivar usuario
  - Filtros por rol y estado
  - Endpoint de búsqueda
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-013**: Implementar endpoint de Login (JWT básico)
  - Crear `AuthController` con endpoint `/api/auth/login`
  - Generar token JWT al autenticar
  - Validar credenciales
  - **Complejidad**: Alta | **Duración**: 2h
  - **Commit y push** - Autenticación básica funcional

---

#### **Miércoles 14 de Enero**
**Día 3 - Módulo de Expedientes (Core)**

##### Ramses (10:00-14:00) - Entidad Expediente
- [ ] **TASK-014**: Implementar entidad `Expediente` completa
  - Crear Entity con todos los campos del frontend
  - Definir relaciones (Gerencia, Materia, Usuario)
  - Implementar enum `EstadoExpediente` (TRAMITE, LAUDO, FIRME)
  - Implementar enum `Prioridad` (ALTA, MEDIA, BAJA)
  - Crear `ExpedienteRepository` con queries custom
  - **Complejidad**: Alta | **Duración**: 3h

- [ ] **TASK-015**: Crear queries personalizadas de búsqueda
  - Query por número de expediente
  - Query por rango de fechas
  - Query por estado, prioridad, gerencia
  - Query de búsqueda full-text (descripción, partes)
  - **Complejidad**: Media | **Duración**: 1h
  - **Handoff a Aurora**: Explicar queries y estructura (traslape 11:00-14:00)

##### Aurora (11:00-15:00) - Service de Expedientes
- [ ] **TASK-016**: Implementar `ExpedienteService` - Parte 1
  - Crear método para crear expediente
  - Crear método para obtener por ID
  - Crear método para listar todos con paginación
  - Implementar DTOs necesarios
  - **Complejidad**: Media | **Duración**: 2.5h

- [ ] **TASK-017**: Crear validaciones de negocio
  - Validar número de expediente único
  - Validar que gerencia y materia existan
  - Validar campos obligatorios
  - **Complejidad**: Baja | **Duración**: 1.5h
  - **Handoff a Ricardo**: Service listo para endpoints (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Controller de Expedientes
- [ ] **TASK-018**: Implementar `ExpedienteController` - Parte 1
  - Endpoint POST crear expediente
  - Endpoint GET obtener por ID
  - Endpoint GET listar con paginación
  - Endpoint GET buscar por filtros
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-019**: Implementar endpoints de actualización
  - Endpoint PUT actualizar expediente completo
  - Endpoint PATCH actualizar estado
  - Endpoint PATCH actualizar prioridad
  - **Complejidad**: Media | **Duración**: 2h
  - **Commit y push** - CRUD de expedientes funcional

---

#### **Jueves 15 de Enero**
**Día 4 - Timeline y Actividad de Expedientes**

##### Ramses (10:00-14:00) - Entidad Timeline
- [ ] **TASK-020**: Implementar entidad `ActividadExpediente`
  - Crear Entity para timeline de actividad
  - Definir relación con Expediente (N:1)
  - Implementar enum `TipoIcono` (UPLOAD, EDIT, STATUS, DELETE)
  - Crear `ActividadExpedienteRepository`
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-021**: Implementar listeners de auditoría
  - Crear `@EntityListener` para expedientes
  - Registrar automáticamente actividades en cambios
  - Guardar en timeline al crear/editar/cambiar estado
  - **Complejidad**: Alta | **Duración**: 2h
  - **Handoff a Aurora**: Explicar sistema de auditoría (traslape 11:00-14:00)

##### Aurora (11:00-15:00) - Service de Timeline
- [ ] **TASK-022**: Implementar `ActividadExpedienteService`
  - Método para crear actividad manual
  - Método para obtener timeline por expediente ID
  - Implementar paginación de actividades
  - Crear DTOs necesarios
  - **Complejidad**: Baja | **Duración**: 2h

- [ ] **TASK-023**: Crear métodos de estadísticas básicas
  - Método para contar actividades por tipo
  - Método para obtener última actividad
  - Método para obtener actividades recientes (últimas 10)
  - **Complejidad**: Baja | **Duración**: 2h
  - **Handoff a Ricardo**: Timeline listo para endpoints (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Endpoints Timeline y Vista 360
- [ ] **TASK-024**: Implementar endpoints de Timeline
  - Endpoint GET timeline por expediente
  - Endpoint POST crear actividad manual
  - Endpoint GET estadísticas de actividad
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-025**: Implementar endpoint Vista 360 del Expediente
  - Crear DTO compuesto `Expediente360DTO`
  - Incluir expediente + timeline + estadísticas
  - Endpoint GET `/api/expedientes/{id}/vista360`
  - **Complejidad**: Media | **Duración**: 2h
  - **Commit y push** - Expedientes completos con timeline

---

#### **Viernes 16 de Enero**
**Día 5 - Módulo de Audiencias**

##### Ramses (10:00-14:00) - Entidad Audiencias
- [ ] **TASK-026**: Implementar entidad `Audiencia` completa
  - Crear Entity con todos los campos
  - Definir relación con Expediente (N:1)
  - Implementar enums (TipoAudiencia, EstadoAudiencia)
  - Crear `AudienciaRepository`
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-027**: Implementar queries de audiencias
  - Query por expediente
  - Query por rango de fechas
  - Query por tipo y estado
  - Query de audiencias próximas (semáforo)
  - **Complejidad**: Media | **Duración**: 2h
  - **Handoff a Aurora**: Explicar lógica de semáforo (traslape 11:00-14:00)

##### Aurora (11:00-15:00) - Service de Audiencias
- [ ] **TASK-028**: Implementar `AudienciaService` - Parte 1
  - Métodos CRUD básicos
  - Implementar DTOs (AudienciaRequestDTO, AudienciaResponseDTO)
  - Validaciones de negocio básicas
  - **Complejidad**: Media | **Duración**: 2.5h

- [ ] **TASK-029**: Implementar lógica de estados de audiencia
  - Método para cambiar a "Con Acta"
  - Método para marcar como "Concluida"
  - Validar transiciones de estado
  - **Complejidad**: Baja | **Duración**: 1.5h
  - **Handoff a Ricardo**: Service listo (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Controller de Audiencias
- [ ] **TASK-030**: Implementar `AudienciaController` completo
  - Endpoints CRUD completos
  - Endpoint de audiencias por expediente
  - Endpoint de cambio de estado
  - Endpoint de audiencias próximas
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-031**: Implementar sistema de semáforo
  - Método de cálculo de días restantes
  - DTO con indicador de color (verde/amarillo/rojo)
  - Endpoint GET audiencias con semáforo
  - **Complejidad**: Media | **Duración**: 2h
  - **Commit y push** - Audiencias funcionales

---

### **SEMANA 2: Módulos Avanzados** (19-20 enero - Solo Ramses)

#### **Lunes 19 de Enero**
**Día 6 - Módulo de Términos (Solo Ramses antes de irse)**

##### Ramses (10:00-14:00) - Entidad Términos
- [ ] **TASK-032**: Implementar entidad `Termino` completa
  - Crear Entity con todos los campos
  - Definir relación con Expediente (N:1)
  - Implementar enum `EstatusTermino` (PROYECTISTA, REVISION, GERENCIA, DIRECCION, LIBERADO, PRESENTADO, CONCLUIDO)
  - Crear `TerminoRepository`
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-033**: Implementar queries de términos
  - Query por expediente
  - Query por estatus
  - Query de términos vencidos/próximos a vencer
  - Query por rango de fechas
  - **Complejidad**: Media | **Duración**: 2h
  - **Handoff especial a Ricardo**: Documentación completa para continuar (coordinar en traslape 14:00)

##### Aurora (11:00-15:00) - Service de Términos (Parte básica)
- [ ] **TASK-034**: Implementar `TerminoService` - CRUD básico
  - Métodos crear, obtener, listar
  - Implementar DTOs necesarios
  - Validaciones básicas
  - **Complejidad**: Media | **Duración**: 3h

- [ ] **TASK-035**: Crear métodos auxiliares
  - Método para calcular días restantes
  - Método para verificar si está vencido
  - **Complejidad**: Baja | **Duración**: 1h
  - **Handoff a Ricardo**: Service básico listo (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Controller de Términos
- [ ] **TASK-036**: Implementar `TerminoController` - Parte 1
  - Endpoints CRUD básicos
  - Endpoint de términos por expediente
  - Endpoint de términos vencidos
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-037**: Preparar estructura para flujo de aprobaciones
  - Diseñar DTOs para flujo de aprobación
  - Crear endpoints placeholder para cambio de estatus
  - Documentar flujo completo para implementación futura
  - **Complejidad**: Media | **Duración**: 2h
  - **Commit y push** - Términos básicos

---

#### **Martes 20 de Enero**
**Día 7 - Último día de Ramses - Documentación y Transferencia**

##### Ramses (10:00-14:00) - Documentación Final y Handoff
- [ ] **TASK-038**: Documentar arquitectura completa del proyecto
  - Crear `ARQUITECTURA-BACKEND.md`
  - Documentar estructura de carpetas
  - Documentar patrones utilizados
  - Explicar configuraciones importantes
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-039**: Crear guía de continuidad para Ricardo y Aurora
  - Documentar pendientes críticos
  - Explicar decisiones técnicas importantes
  - Crear lista de tareas pendientes priorizadas
  - Reunión de handoff con Ricardo (14:00-14:30, en traslape)
  - **Complejidad**: Baja | **Duración**: 2h
  - **🔴 ÚLTIMO DÍA DE RAMSES 🔴**

##### Aurora (11:00-15:00) - Refactoring y Limpieza
- [ ] **TASK-040**: Revisar y mejorar código existente
  - Revisar todas las entidades creadas
  - Mejorar comentarios y documentación
  - Verificar consistencia de DTOs
  - **Complejidad**: Baja | **Duración**: 2h

- [ ] **TASK-041**: Crear tests unitarios básicos para Services
  - Test de GerenciaService
  - Test de MateriaService
  - Test de UsuarioService (métodos básicos)
  - **Complejidad**: Media | **Duración**: 2h
  - **Handoff a Ricardo**: Código revisado (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Integración y Testing
- [ ] **TASK-042**: Testing de integración de módulos completos
  - Probar flujo completo de Expedientes
  - Probar flujo completo de Audiencias
  - Verificar relaciones entre entidades
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-043**: Configurar Swagger/OpenAPI completo
  - Configurar dependencias de Swagger
  - Documentar todos los endpoints existentes
  - Crear ejemplos de request/response
  - Generar documentación HTML
  - **Complejidad**: Media | **Duración**: 2h
  - **Commit y push** - Fin de Semana 2

---

### **SEMANA 3: Consolidación** (21-24 enero - Ricardo y Aurora)

#### **Miércoles 21 de Enero**
**Día 8 - Sin Ramses: Completar Términos y FileUpload**

##### Aurora (11:00-15:00) - Sistema de Comentarios
- [ ] **TASK-044**: Implementar entidad `Comentario` genérica
  - Crear Entity para comentarios en audiencias/términos
  - Relación polimórfica o dos tablas separadas
  - Crear `ComentarioRepository`
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-045**: Implementar `ComentarioService`
  - Métodos CRUD básicos
  - Método para obtener comentarios por entidad
  - Implementar DTOs
  - **Complejidad**: Baja | **Duración**: 2h
  - **Handoff a Ricardo**: Comentarios listos (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - File Upload y Manejo de Archivos
- [ ] **TASK-046**: Implementar servicio de almacenamiento de archivos
  - Crear `FileStorageService`
  - Configurar directorio de uploads
  - Métodos para guardar/recuperar/eliminar archivos
  - Validación de tipos de archivo (PDF, DOC, DOCX)
  - **Complejidad**: Alta | **Duración**: 2.5h

- [ ] **TASK-047**: Crear endpoints de upload para Audiencias
  - Endpoint POST subir acta
  - Endpoint GET descargar acta
  - Endpoint DELETE eliminar acta
  - **Complejidad**: Media | **Duración**: 1.5h
  - **Commit y push**

---

#### **Jueves 22 de Enero**
**Día 9 - Calendario y Dashboard**

##### Aurora (11:00-15:00) - Entidad Eventos de Calendario
- [ ] **TASK-048**: Implementar entidad `EventoCalendario`
  - Crear Entity con campos necesarios
  - Implementar enum `CategoriaEvento` (AUDIENCIA, TERMINO, RECORDATORIO, OTRO)
  - Crear `EventoCalendarioRepository`
  - **Complejidad**: Baja | **Duración**: 1.5h

- [ ] **TASK-049**: Implementar `EventoCalendarioService`
  - Métodos CRUD básicos
  - Método para obtener eventos por rango de fechas
  - Método para obtener eventos por categoría
  - Implementar DTOs
  - **Complejidad**: Baja | **Duración**: 2.5h
  - **Handoff a Ricardo**: Calendario listo (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Controller Calendario y Dashboard
- [ ] **TASK-050**: Implementar `CalendarioController`
  - Endpoints CRUD de eventos
  - Endpoint para vista mensual
  - Endpoint para vista semanal
  - Endpoint para vista diaria
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-051**: Implementar `DashboardController` - Métricas
  - Endpoint de estadísticas generales
  - Endpoint de distribución por gerencia
  - Endpoint de carga de trabajo por usuario
  - Endpoint de estados de expedientes
  - **Complejidad**: Alta | **Duración**: 2h
  - **Commit y push**

---

#### **Viernes 23 de Enero**
**Día 10 - Notificaciones y Recordatorios**

##### Aurora (11:00-15:00) - Sistema de Notificaciones
- [ ] **TASK-052**: Implementar entidad `Notificacion`
  - Crear Entity con campos necesarios
  - Implementar enum `TipoNotificacion` y `PrioridadNotificacion`
  - Definir relación con Usuario (N:1)
  - Crear `NotificacionRepository`
  - **Complejidad**: Baja | **Duración**: 2h

- [ ] **TASK-053**: Implementar `NotificacionService`
  - Métodos CRUD básicos
  - Método para marcar como leída
  - Método para obtener notificaciones por usuario
  - Método para obtener no leídas
  - **Complejidad**: Media | **Duración**: 2h
  - **Handoff a Ricardo**: Notificaciones listas (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Controller Notificaciones y Recordatorios
- [ ] **TASK-054**: Implementar `NotificacionController`
  - Endpoints CRUD
  - Endpoint para notificaciones del usuario actual
  - Endpoint para marcar como leída/todas como leídas
  - Endpoint de conteo de no leídas
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-055**: Implementar entidad y endpoints de `Recordatorio`
  - Crear Entity `Recordatorio` (similar a Notificacion)
  - Crear Service y Controller básico
  - Endpoint de recordatorios próximos
  - **Complejidad**: Media | **Duración**: 2h
  - **Commit y push**

---

#### **Lunes 26 de Enero**
**Día 11 - Agenda General y Flujo de Aprobaciones**

##### Aurora (11:00-15:00) - Agenda General
- [ ] **TASK-056**: Implementar `AgendaGeneralService`
  - Método para obtener vista unificada por usuario
  - Combinar audiencias + términos del usuario
  - Ordenar por fecha/prioridad
  - **Complejidad**: Media | **Duración**: 2.5h

- [ ] **TASK-057**: Crear DTOs para Agenda General
  - DTO unificado para vista personal
  - Incluir audiencias desahogadas con observaciones
  - Incluir términos concluidos con observaciones
  - **Complejidad**: Baja | **Duración**: 1.5h
  - **Handoff a Ricardo**: Agenda lista (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Flujo de Aprobaciones de Términos
- [ ] **TASK-058**: Implementar lógica de flujo de aprobación
  - Método para avanzar término al siguiente estatus
  - Validar permisos según rol del usuario
  - Validar que archivo esté adjunto antes de avanzar
  - Crear `AprobacionService`
  - **Complejidad**: Alta | **Duración**: 2.5h

- [ ] **TASK-059**: Crear endpoints de flujo de aprobación
  - Endpoint POST para avanzar a siguiente etapa
  - Endpoint POST para rechazar/devolver
  - Endpoint GET para obtener historial de aprobaciones
  - **Complejidad**: Media | **Duración**: 1.5h
  - **Commit y push**

---

#### **Martes 27 de Enero**
**Día 12 - Thymeleaf y Vistas de Administración**

##### Aurora (11:00-15:00) - Plantillas básicas Thymeleaf
- [ ] **TASK-060**: Crear layout base con Thymeleaf
  - Crear `layout.html` con Bootstrap
  - Incluir sidebar de navegación
  - Crear header con usuario logueado
  - Aplicar estilos GOB.MX V3
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-061**: Crear vistas de Gerencias y Materias
  - Vista de listado de gerencias
  - Vista de creación/edición de gerencia
  - Vista de listado de materias
  - Vista de asignación de materias a gerencia
  - **Complejidad**: Baja | **Duración**: 2h
  - **Handoff a Ricardo**: Templates básicos listos (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Thymeleaf Controllers
- [ ] **TASK-062**: Implementar controllers MVC para administración
  - `AdminGerenciaController` para vistas
  - `AdminMateriaController` para vistas
  - Métodos GET para formularios
  - Métodos POST para guardar
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-063**: Crear vistas de gestión de Usuarios
  - Vista de listado de usuarios
  - Vista de creación/edición de usuario
  - Vista de detalle de usuario
  - **Complejidad**: Media | **Duración**: 2h
  - **Commit y push**

---

#### **Miércoles 28 de Enero**
**Día 13 - Testing y Documentación**

##### Aurora (11:00-15:00) - Tests Unitarios
- [ ] **TASK-064**: Crear tests para Services principales
  - Test de ExpedienteService
  - Test de AudienciaService
  - Test de TerminoService
  - Usar Mockito para mocks de repositories
  - **Complejidad**: Media | **Duración**: 3h

- [ ] **TASK-065**: Crear tests de validaciones
  - Test de validaciones de expedientes
  - Test de validaciones de usuarios
  - Test de reglas de negocio
  - **Complejidad**: Baja | **Duración**: 1h
  - **Handoff a Ricardo**: Tests listos (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Tests de Integración
- [ ] **TASK-066**: Crear tests de integración de Controllers
  - Test de ExpedienteController con MockMvc
  - Test de AudienciaController
  - Test de UsuarioController
  - **Complejidad**: Alta | **Duración**: 2.5h

- [ ] **TASK-067**: Documentar APIs en README
  - Crear `API-DOCUMENTATION.md`
  - Documentar todos los endpoints
  - Incluir ejemplos de request/response
  - Documentar códigos de error
  - **Complejidad**: Media | **Duración**: 1.5h
  - **Commit y push**

---

#### **Jueves 29 de Enero**
**Día 14 - Seguridad Avanzada y Roles**

##### Aurora (11:00-15:00) - Configuración de permisos
- [ ] **TASK-068**: Crear anotaciones de seguridad en endpoints
  - Agregar `@PreAuthorize` en controllers
  - Configurar roles por endpoint
  - Documentar matriz de permisos
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-069**: Implementar auditoría de cambios
  - Configurar `@CreatedBy` y `@LastModifiedBy`
  - Agregar campos de auditoría en entidades
  - Configurar `AuditorAware`
  - **Complejidad**: Baja | **Duración**: 2h
  - **Handoff a Ricardo**: Seguridad configurada (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - JWT y Refresh Token
- [ ] **TASK-070**: Implementar Refresh Token
  - Crear entidad `RefreshToken`
  - Implementar lógica de generación y validación
  - Endpoint de refresh token
  - **Complejidad**: Alta | **Duración**: 2.5h

- [ ] **TASK-071**: Configurar expiración y renovación de tokens
  - Configurar tiempo de vida de tokens
  - Implementar revocación de tokens
  - Endpoint de logout
  - **Complejidad**: Media | **Duración**: 1.5h
  - **Commit y push**

---

#### **Viernes 30 de Enero**
**Día 15 - Optimización y Deploy**

##### Aurora (11:00-15:00) - Optimizaciones
- [ ] **TASK-072**: Implementar caché con Spring Cache
  - Configurar caché en métodos frecuentes
  - Caché de catálogos (gerencias, materias)
  - Configurar tiempo de expiración
  - **Complejidad**: Media | **Duración**: 2h

- [ ] **TASK-073**: Optimizar queries de base de datos
  - Revisar queries N+1
  - Agregar índices necesarios
  - Implementar FetchType adecuados
  - **Complejidad**: Baja | **Duración**: 2h
  - **Handoff a Ricardo**: Optimizaciones listas (traslape 14:00-15:00)

##### Ricardo (14:00-18:00) - Deploy y Finalización
- [ ] **TASK-074**: Preparar aplicación para deploy
  - Configurar perfiles (dev, prod)
  - Configurar variables de entorno
  - Crear `Dockerfile`
  - Crear script de inicialización de BD
  - **Complejidad**: Alta | **Duración**: 2h

- [ ] **TASK-075**: Documentación final y entrega
  - Actualizar README principal
  - Crear guía de instalación
  - Documentar configuración de ambiente
  - Video de demo (opcional)
  - **Complejidad**: Media | **Duración**: 2h
  - **🎉 PROYECTO COMPLETADO 🎉**

---

## 📊 RESUMEN EJECUTIVO

### Distribución de Trabajo

| Desarrollador | Días Activos | Horas Totales | Tareas Asignadas | Complejidad Promedia |
|---------------|--------------|---------------|------------------|---------------------|
| **Preparación** | Antes del 12/ene | 2-3 horas | 10 tareas | Baja-Media |
| **Ramses**    | 7 días (12-20 ene) | 28 horas | 39 tareas | Media-Alta |
| **Aurora**    | 15 días | 60 horas | 32 tareas | Baja-Media |
| **Ricardo**   | 15 días | 60 horas | 39 tareas | Media-Alta |

### Módulos por Prioridad

1. **✅ Crítico** (Semana 1):
   - Configuración base
   - Autenticación y usuarios
   - Expedientes (CRUD + Timeline)
   - Audiencias

2. **⚡ Alto** (Semana 2):
   - Términos
   - File Upload
   - Calendario
   - Dashboard

3. **📝 Medio** (Semana 3):
   - Notificaciones
   - Agenda General
   - Thymeleaf Admin
   - Tests

4. **🔒 Optimizaciones** (Semana 3):
   - Seguridad avanzada
   - Caché
   - Deploy

### Métricas del Proyecto

- **Tareas de preparación:** 10
- **Total de tareas de desarrollo:** 75
- **Duración:** 15 días hábiles (3 semanas) + preparación
- **Horas totales:** 148 horas (+ 2-3h preparación)
- **Endpoints estimados:** ~80-100
- **Entidades JPA:** ~12-15
- **Controllers REST:** ~10-12
- **Services:** ~12-15

---

## 🎯 RIESGOS Y MITIGACIONES

### Riesgos Identificados

1. **Salida de Ramses (20 enero)**
   - **Mitigación**: Documentación exhaustiva días 19-20, handoff completo con Ricardo
   
2. **Aurora es Junior**
   - **Mitigación**: Tareas de menor complejidad, handoffs claros, revisión de código por Ricardo

3. **Traslapes limitados entre turnos**
   - **Mitigación**: Aprovechar traslapes Ramses-Aurora (3h) y Aurora-Ricardo (1h) para comunicación directa, sistema de handoffs documentados, commits frecuentes

4. **Complejidad de Términos (flujo de aprobación)**
   - **Mitigación**: Ramses sienta las bases, Ricardo completa implementación

### Buenas Prácticas Requeridas

- ✅ **Commits** al finalizar cada turno con descripción clara
- ✅ **Handoff notes** en archivo `HANDOFF-NOTES.md` diario
- ✅ **Code review** de Ricardo sobre código de Aurora
- ✅ **Daily updates** en Slack/Teams al inicio de turno
- ✅ **Aprovechamiento de traslapes** para comunicación directa y resolución de dudas
- ✅ **Documentación inline** en código complejo

---

## 📚 ENTREGABLES

### Código
- [ ] Proyecto Spring Boot funcional y desplegable
- [ ] API REST completa y documentada
- [ ] Base de datos PostgreSQL con datos de prueba
- [ ] Interfaz Thymeleaf para administración
- [ ] Tests unitarios e integración (cobertura >60%)

### Documentación
- [ ] `README.md` principal actualizado
- [ ] `ARQUITECTURA-BACKEND.md`
- [ ] `API-DOCUMENTATION.md`
- [ ] `DEPLOYMENT-GUIDE.md`
- [ ] Colección de Postman/Thunder Client
- [ ] Swagger UI funcional

### Configuración
- [ ] `Dockerfile` para contenedor
- [ ] Scripts de inicialización de BD
- [ ] Variables de entorno documentadas
- [ ] Perfiles de configuración (dev/prod)

---

## 🔗 INTEGRACIÓN CON FRONTEND

### Endpoints que el Frontend Consumirá

**Autenticación:**
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

**Expedientes:**
- `GET /api/expedientes` (con paginación y filtros)
- `GET /api/expedientes/{id}`
- `GET /api/expedientes/{id}/vista360`
- `POST /api/expedientes`
- `PUT /api/expedientes/{id}`
- `PATCH /api/expedientes/{id}/estado`

**Audiencias:**
- `GET /api/audiencias`
- `GET /api/audiencias/proximas`
- `POST /api/audiencias`
- `PUT /api/audiencias/{id}`
- `POST /api/audiencias/{id}/acta` (upload)

**Términos:**
- `GET /api/terminos`
- `GET /api/terminos/vencidos`
- `POST /api/terminos`
- `POST /api/terminos/{id}/avanzar-etapa`

**Dashboard:**
- `GET /api/dashboard/estadisticas`
- `GET /api/dashboard/distribucion-gerencia`

**Calendario:**
- `GET /api/calendario/eventos?inicio={fecha}&fin={fecha}`
- `POST /api/calendario/eventos`

**Notificaciones:**
- `GET /api/notificaciones/usuario/{id}`
- `GET /api/notificaciones/no-leidas`
- `PATCH /api/notificaciones/{id}/leer`

---

## 🚀 SIGUIENTES PASOS DESPUÉS DE ESTE PLAN

1. Integración Frontend-Backend
2. Deploy en ambiente de staging
3. Testing de usuario (UAT)
4. Migración de datos desde localStorage
5. Deploy a producción
6. Monitoreo y ajustes

---

## 📞 CONTACTO Y SOPORTE

**Project Manager:** [Nombre]  
**Tech Lead:** Ramses (hasta 20/ene) → Ricardo (desde 21/ene)  
**Repository:** https://github.com/rodrigopazTech/juridico-springboot.git  

**Herramientas:**
- GitHub para control de versiones
- ClickUp para gestión de tareas (se configurará después de aprobación)
- Slack/Teams para comunicación
- PostgreSQL local para desarrollo

---

**Fecha de creación:** 6 de enero 2026  
**Versión:** 1.0  
**Estado:** ⏳ Pendiente de aprobación

---

*Este plan está sujeto a ajustes basados en la retroalimentación del equipo y el avance real del proyecto.*
