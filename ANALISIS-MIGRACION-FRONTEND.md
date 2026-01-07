# 📊 ANÁLISIS DE MIGRACIÓN FRONTEND → BACKEND

**Fecha:** 7 de enero 2026  
**Proyecto:** Sistema Jurídico Gob.MX V3  
**Analista:** GitHub Copilot

## 🎯 Resumen Ejecutivo

El frontend actual está **LISTO para migrarse al backend** con algunas consideraciones menores. La arquitectura es clara y el código está bien organizado.

**Estado General:** ✅ **APTO PARA MIGRACIÓN**

**Estimación de Migración:**
- **Complejidad:** MEDIA
- **Tiempo Estimado:** 3-4 semanas
- **Riesgo:** BAJO

---

## 📦 Análisis por Módulo

### 1. ✅ Módulo de Expedientes
**Ubicación:** `/expediente-module/`

**Estado:** LISTO PARA MIGRACIÓN
- ✅ Estructura de datos clara
- ✅ CRUD completo implementado
- ✅ Uso de localStorage bien organizado
- ✅ Componentes modulares
- ⚠️ **Acción requerida:** Sustituir localStorage por llamadas API REST

**Keys de localStorage utilizadas:**
- `expedientesData` - Datos principales de expedientes
- `terminos` - Términos relacionados
- `audiencias` - Audiencias relacionadas

**Endpoints API a crear:**
```
GET    /api/expedientes
GET    /api/expedientes/{id}
POST   /api/expedientes
PUT    /api/expedientes/{id}
DELETE /api/expedientes/{id}
GET    /api/expedientes/{id}/terminos
GET    /api/expedientes/{id}/audiencias
GET    /api/expedientes/{id}/timeline
POST   /api/expedientes/{id}/documentos
```

---

### 2. ✅ Módulo de Audiencias
**Ubicación:** `/audiencias/`

**Estado:** LISTO PARA MIGRACIÓN
- ✅ Gestión de estados bien definida
- ✅ Sistema de actas implementado
- ✅ Semáforo de audiencias funcional
- ⚠️ **Acción requerida:** Implementar lógica de negocio en backend

**Keys de localStorage utilizadas:**
- `audiencias` - Audiencias principales
- `audienciasDesahogadas` - Histórico

**Endpoints API a crear:**
```
GET    /api/audiencias
GET    /api/audiencias/{id}
POST   /api/audiencias
PUT    /api/audiencias/{id}
DELETE /api/audiencias/{id}
PATCH  /api/audiencias/{id}/estado
POST   /api/audiencias/{id}/acta
GET    /api/audiencias/proximas
GET    /api/audiencias/desahogadas
```

---

### 3. ✅ Módulo de Términos
**Ubicación:** `/terminos/`

**Estado:** LISTO PARA MIGRACIÓN
- ✅ Flujo de trabajo implementado (6 etapas: Proyectista → Revisión → Gerencia → Dirección → Liberado → Presentado → Concluido)
- ✅ Sistema de aprobaciones con roles definidos (PERMISOS_ETAPAS)
- ✅ Historial de presentaciones
- ✅ **NOTA RAMA RAMSES-GESTOR:** Solo existe carpeta `/terminos/` - problema de duplicación resuelto

**Keys de localStorage utilizadas:**
- `terminos` - Términos activos
- `terminosPresentados` - Histórico de presentaciones

**Endpoints API a crear:**
```
GET    /api/terminos
GET    /api/terminos/{id}
POST   /api/terminos
PUT    /api/terminos/{id}
DELETE /api/terminos/{id}
PATCH  /api/terminos/{id}/estado
POST   /api/terminos/{id}/presentar
GET    /api/terminos/proximos-vencer
GET    /api/terminos/presentados
```

---

### 4. ✅ Módulo de Calendario
**Ubicación:** `/calendario-module/`

**Estado:** LISTO PARA MIGRACIÓN
- ✅ Múltiples vistas (día, semana, mes)
- ✅ Eventos bien estructurados (agrega audiencias + terminos + recordatorios en runtime)
- ✅ Sistema de detalle de eventos con colores gobierno
- ⚠️ **Acción requerida:** Implementar endpoint unificado que combine audiencias, términos y recordatorios desde backend

**Keys de localStorage utilizadas:**
- `audiencias` - Lecturas para sincronización
- `terminos` - Lecturas para sincronización
- `recordatorios` - Lecturas para sincronización
- **NOTA:** NO existe key `eventos_calendario` - es un array runtime que agrega las 3 fuentes

**Endpoints API a crear:**
```
GET    /api/calendario/eventos
POST   /api/calendario/eventos
PUT    /api/calendario/eventos/{id}
DELETE /api/calendario/eventos/{id}
GET    /api/calendario/eventos/fecha/{fecha}
GET    /api/calendario/eventos/rango?inicio={inicio}&fin={fin}
```

---

### 5. ✅ Módulo de Dashboard
**Ubicación:** `/dashboard-module/`

**Estado:** LISTO PARA MIGRACIÓN
- ✅ Métricas bien definidas (KPIs, workload por usuario, charts)
- ✅ Uso de Chart.js con colores gobierno
- ⚠️ **Acción requerida:** Mover cálculos de métricas (COUNT, SUM, GROUP BY) al backend

**Cálculos actuales en frontend:**
- Total expedientes, expedientes por etapa
- Workload por usuario (count de expedientes en etapa Proyectista)
- Charts de distribución por gerencia
- Análisis de tiempos de respuesta

**Endpoints API a crear:**
```
GET    /api/dashboard/kpis?gerenciaId={id}
GET    /api/dashboard/charts/gerencias
GET    /api/dashboard/charts/tiempos
GET    /api/dashboard/workload?usuarioId={id}
GET    /api/dashboard/urgentes
```

---

### 6. ✅ Módulo de Notificaciones
**Ubicación:** `/notificaciones-module/`

**Estado:** LISTO PARA MIGRACIÓN
- ✅ Sistema de notificaciones implementado
- ✅ Tipos de notificación definidos (audiencia_proxima, termino_venciendo, asignacion_termino, etc.)
- ✅ **Notificaciones son PER-USER** (tabla con usuario_id FK)
- ⚠️ **Acción requerida:** Implementar endpoints backend con **polling** (NO WebSocket en primera fase)

**Keys de localStorage utilizadas:**
- `jl_notifications_v4` - Notificaciones del usuario (serán reemplazadas por API)

**Endpoints API a crear:**
```
GET    /api/notificaciones
POST   /api/notificaciones
PATCH  /api/notificaciones/{id}/marcar-leida
DELETE /api/notificaciones/{id}
GET    /api/notificaciones/no-leidas/count
```

---

### 7. ✅ Módulo de Recordatorios
**Ubicación:** `/recordatorios-module/`

**Estado:** LISTO PARA MIGRACIÓN
- ✅ CRUD de recordatorios completo
- ✅ Sistema de prioridades (urgent, normal)
- ✅ Estructura de datos: {id, titulo, fecha, hora, detalles, prioridad}
- ✅ **Recordatorios son personales** (NO vinculados a expedientes por defecto)
- ⚠️ **Acción requerida:** Crear tabla `recordatorios` en BD con FK usuario_id, integrar con notificaciones

**Diferencia con audiencias/términos:**
- Recordatorios: Alertas personales del usuario (ej: "Reunión de equipo")
- Audiencias: Eventos legales vinculados a expedientes
- Términos: Plazos legales con flujo de aprobación

**Keys de localStorage utilizadas:**
- `recordatorios` - Recordatorios del usuario (será tabla en BD)

**Endpoints API a crear:**
```
GET    /api/recordatorios
POST   /api/recordatorios
PUT    /api/recordatorios/{id}
DELETE /api/recordatorios/{id}
PATCH  /api/recordatorios/{id}/completar
GET    /api/recordatorios/pendientes
```

---

### 8. ✅ Módulo de Agenda General
**Ubicación:** `/agenda-general-module/`

**Estado:** LISTO PARA MIGRACIÓN
- ✅ Vista unificada de audiencias y términos
- ✅ Filtros y búsqueda implementados
- ⚠️ **Acción requerida:** Consumir datos de endpoints unificados

**Endpoints API a crear:**
```
GET    /api/agenda/personal
GET    /api/agenda/audiencias
GET    /api/agenda/terminos
GET    /api/agenda/filtrar
```

---

### 9. ✅ Módulo de Usuarios
**Ubicación:** `/usuario-module/`

**Estado:** LISTO PARA MIGRACIÓN
- ✅ Gestión de perfil de usuario
- ⚠️ **Acción requerida:** Implementar autenticación JWT

**Endpoints API a crear:**
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/refresh-token
GET    /api/usuarios/perfil
PUT    /api/usuarios/perfil
PUT    /api/usuarios/cambiar-password
```

---

## 🔄 Plan de Migración por Fases

### FASE 1: Infraestructura y Autenticación (Semana 1)
**Responsable:** Ramses + Ricardo

**Tareas:**
1. Implementar entidades JPA para todas las tablas
2. Crear repositorios Spring Data
3. Implementar sistema de autenticación JWT
4. Crear DTOs para requests/responses
5. Implementar manejo global de excepciones

**Entregables:**
- 17 entidades mapeadas
- Sistema JWT funcionando
- DTOs base creados

---

### FASE 2: Módulos Core (Semana 2)
**Responsable:** Ramses + Aurora + Ricardo

**Módulos a migrar:**
1. **Expedientes** (Ramses)
   - ExpedienteController
   - ExpedienteService
   - Tests unitarios

2. **Audiencias** (Aurora)
   - AudienciasController
   - AudienciasService
   - Tests unitarios

3. **Términos** (Ricardo)
   - TerminosController
   - TerminosService
   - Tests unitarios

**Entregables:**
- 3 módulos completos con API REST
- Documentación Swagger
- Tests con cobertura >80%

---

### FASE 3: Módulos Auxiliares (Semana 3)
**Responsable:** Aurora + Ricardo

**Módulos a migrar:**
1. **Calendario** (Aurora)
2. **Notificaciones** (Ricardo)
3. **Recordatorios** (Aurora)
4. **Agenda General** (Ricardo)

**Entregables:**
- 4 módulos completos
- Integración entre módulos
- Tests

---

### FASE 4: Dashboard y Optimización (Semana 4)
**Responsable:** Todo el equipo

**Tareas:**
1. **Dashboard** con métricas y estadísticas (Ramses)
2. Optimización de queries (Ricardo)
3. Caching con Redis (opcional) (Ramses)
4. Documentación completa (Aurora)
5. Tests de integración (Todo el equipo)
6. Deployment en servidor de desarrollo (Ricardo)

**Entregables:**
- Sistema completo integrado
- Documentación técnica
- Backend deployado

---

## 🚨 Problemas Detectados y Soluciones

### ✅ ~~PROBLEMA 1: Duplicidad de módulos~~ **RESUELTO EN RAMSES-GESTOR**
**Ubicación:** ~~`/terminos/` y `/terminos-module/`~~

**Estado:** ✅ **RESUELTO** - En la rama `Ramses-Gestor` solo existe `/terminos/` con estructura completa
- [terminos/js/terminos.js](terminos/js/terminos.js) - 1082 líneas con flujo completo
- [terminos/components/](terminos/components) - Componentes HTML modulares
- [terminos/css/](terminos/css) - Estilos propios

**Acción:** Ninguna consolidación necesaria en Ramses-Gestor

---

### ⚠️ PROBLEMA 2: Datos seed mezclados
**Ubicación:** Varios archivos JS con datos iniciales (getSampleData())

**Solución:**
- Los datos seed ya están en `database-schema-completo.sql`
- Eliminar métodos `getSampleData()` en frontend una vez que backend esté funcionando
- Frontend debe consumir siempre del backend

**Estado:** Pendiente (se resolverá durante migración)

---

### ⚠️ PROBLEMA 3: Validaciones solo en frontend
**Ubicación:** Validaciones en archivos JS (funciones validate*)

**Solución:**
- Implementar todas las validaciones en backend
- Usar Jakarta Validation (@Valid, @NotNull, @NotBlank, @Size, @Email, etc.)
- Frontend solo valida UX, backend valida seguridad y reglas de negocio

**Estado:** Se resolverá con tareas PREP-004 (DTOs) y MOD-001 a MOD-006 (servicios)

---

### 📝 PROBLEMA 4: Lógica de negocio en frontend
**Ubicación:** Flujo de términos (FLUJO_ETAPAS, PERMISOS_ETAPAS)

**Solución:**
- Trasladar lógica de flujo de estados al backend (Service layer)
- Implementar máquina de estados en TerminosService
- Frontend solo muestra botones según estatus, backend valida transiciones

**Estado:** Se resolverá con tarea MOD-003 (Módulo Términos)

---

## 📋 Checklist de Migración

### Preparación del Frontend
- [ ] Eliminar o archivar módulo duplicado de términos
- [ ] Documentar todas las keys de localStorage utilizadas
- [ ] Crear un inventario de todas las operaciones CRUD
- [ ] Identificar reglas de negocio en el frontend

### Configuración Backend
- [x] ✅ Estructura de paquetes creada
- [x] ✅ Dependencies agregadas (Lombok, Swagger, JWT)
- [x] ✅ application.properties configurado
- [x] ✅ SecurityConfig para desarrollo
- [x] ✅ README completo
- [ ] Crear todas las entidades JPA
- [ ] Crear todos los repositorios
- [ ] Implementar JWT filter chain

### Migración de Módulos
- [ ] Expedientes
- [ ] Audiencias
- [ ] Términos
- [ ] Calendario
- [ ] Dashboard
- [ ] Notificaciones
- [ ] Recordatorios
- [ ] Agenda General
- [ ] Usuarios/Auth

### Integración Frontend-Backend
- [ ] Crear servicio JavaScript para API calls
- [ ] Sustituir localStorage por fetch/axios
- [ ] Implementar manejo de tokens JWT
- [ ] Implementar manejo de errores HTTP
- [ ] Actualizar todos los módulos para consumir API

### Testing y QA
- [ ] Tests unitarios backend (cobertura >80%)
- [ ] Tests de integración
- [ ] Pruebas de carga básicas
- [ ] Pruebas E2E con frontend integrado

### Deployment
- [ ] Configurar servidor de desarrollo (EN PROGRESO)
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Pruebas en ambiente de desarrollo

---

## 💡 Recomendaciones

### 1. **Priorizar Expedientes**
Los expedientes son el módulo central. Comenzar con este módulo establecerá patrones para los demás.

### 2. **Establecer Convenciones desde el inicio**
- Nomenclatura de endpoints
- Estructura de DTOs
- Manejo de errores
- Formato de respuestas

### 3. **Documentar Todo**
- Swagger para API
- Javadoc para código
- README para cada módulo

### 4. **Testing desde el principio**
- No dejar testing para el final
- Implementar tests mientras se desarrolla

### 5. **Code Review constante**
- Ramses revisa código de Aurora
- Ricardo revisa código de todos
- Pair programming en funcionalidades complejas

---

## 📊 Métricas de Migración

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Módulos Totales** | 9 | 🟡 Pendiente |
| **Entidades a crear** | 17 | 🟡 Pendiente |
| **Endpoints estimados** | ~80 | 🟡 Pendiente |
| **Líneas de código (aprox)** | ~15,000 | 🟡 Pendiente |
| **Tiempo estimado** | 4 semanas | 🟡 Pendiente |
| **Riesgo** | BAJO | ✅ OK |

---

## ✅ Conclusión

**El frontend está LISTO para ser migrado al backend.** La arquitectura modular y el código bien organizado facilitan la transición. 

**Próximos Pasos Inmediatos:**
1. ✅ Backend configurado y listo
2. 🔄 Servidor de desarrollo (bloqueado temporalmente)
3. 📋 Crear tareas en ClickUp
4. 🚀 Iniciar desarrollo el 12 de enero 2026

**Fecha de entrega estimada:** 7 de febrero 2026

---

**Documento generado:** 7 de enero 2026  
**Última actualización:** 7 de enero 2026
