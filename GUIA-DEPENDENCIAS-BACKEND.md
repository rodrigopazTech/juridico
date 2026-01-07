# 📚 Guía de Dependencias del Backend - Sistema Jurídico

**Para:** Ramses, Ricardo y Aurora  
**Fecha:** 7 de Enero 2026  
**Tiempo de lectura:** 15-20 minutos

---

## 👋 Introducción

¡Hola equipo! Esta guía te ayudará a entender **para qué sirve cada librería** que vamos a usar en el proyecto. No te preocupes si eres nuevo en esto, verás ejemplos de código **CON** y **SIN** cada dependencia para que veas el beneficio real.

> 💡 **Tip:** Lee esta guía con calma, prueba los ejemplos en tu mente y si algo no te queda claro, ¡pregunta sin pena!

---

## 🏗️ Dependencias Principales

### 1. **Spring Boot Starter Web**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

**¿Qué hace?** 
Te permite crear una API REST (endpoints HTTP) para que el frontend pueda comunicarse con el backend.

**Incluye:**
- Servidor web Tomcat embebido
- Spring MVC (para crear controladores)
- Jackson (para convertir JSON ↔ Java)

#### Ejemplo SIN Spring Web:
```java
// ❌ Tendrías que configurar manualmente un servidor HTTP
ServerSocket serverSocket = new ServerSocket(8080);
Socket clientSocket = serverSocket.accept();
// ... muchísimo código manual para leer HTTP, parsear JSON, etc.
```

#### Ejemplo CON Spring Web:
```java
// ✅ ¡Solo esto! Spring hace el resto
@RestController
@RequestMapping("/api/expedientes")
public class ExpedienteController {
    
    @GetMapping("/{id}")
    public Expediente obtenerExpediente(@PathVariable Long id) {
        return expedienteService.findById(id);
        // Spring convierte automáticamente el objeto a JSON
    }
    
    @PostMapping
    public Expediente crearExpediente(@RequestBody ExpedienteDTO dto) {
        // Spring convierte el JSON del request a objeto Java
        return expedienteService.crear(dto);
    }
}
```

---

### 2. **Spring Boot Starter Data JPA**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

**¿Qué hace?** 
Te permite trabajar con la base de datos usando **objetos Java** en lugar de escribir SQL manualmente.

**Incluye:**
- Hibernate (implementación de JPA)
- Spring Data JPA (repositorios automáticos)

#### Ejemplo SIN JPA:
```java
// ❌ SQL manual, propenso a errores
public Expediente buscarPorId(Long id) {
    Connection conn = DriverManager.getConnection(url, user, pass);
    PreparedStatement stmt = conn.prepareStatement(
        "SELECT * FROM expedientes WHERE id = ?"
    );
    stmt.setLong(1, id);
    ResultSet rs = stmt.executeQuery();
    
    Expediente exp = new Expediente();
    if (rs.next()) {
        exp.setId(rs.getLong("id"));
        exp.setNumeroExpediente(rs.getString("numero_expediente"));
        exp.setDemandante(rs.getString("demandante"));
        // ... mapear cada campo manualmente
    }
    
    rs.close();
    stmt.close();
    conn.close();
    return exp;
}
```

#### Ejemplo CON JPA:
```java
// ✅ ¡Spring lo hace por ti!
@Repository
public interface ExpedienteRepository extends JpaRepository<Expediente, Long> {
    // ¡Ya tienes estos métodos sin escribir código!
    // - findById(Long id)
    // - findAll()
    // - save(Expediente exp)
    // - deleteById(Long id)
    
    // Y puedes crear consultas con solo el nombre del método:
    List<Expediente> findByDemandanteContaining(String demandante);
    List<Expediente> findByEstadoAndActivo(String estado, Boolean activo);
}
```

---

### 3. **Lombok**
```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
```

**¿Qué hace?** 
Elimina el código repetitivo (boilerplate) usando anotaciones. Genera automáticamente getters, setters, constructores, etc.

#### Ejemplo SIN Lombok:
```java
// ❌ Tienes que escribir TODO esto:
public class Usuario {
    private Long id;
    private String nombre;
    private String email;
    private String password;
    
    public Usuario() {}
    
    public Usuario(Long id, String nombre, String email, String password) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    @Override
    public boolean equals(Object o) { /* ... */ }
    
    @Override
    public int hashCode() { /* ... */ }
    
    @Override
    public String toString() { /* ... */ }
}
// ❌ ¡100+ líneas de código aburrido!
```

#### Ejemplo CON Lombok:
```java
// ✅ ¡Solo 7 líneas!
@Data
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String email;
    private String password;
}
// ✅ @Data genera: getters, setters, toString, equals, hashCode
```

**Anotaciones más usadas:**
- `@Data` - Genera getters, setters, toString, equals, hashCode
- `@NoArgsConstructor` - Constructor sin argumentos
- `@AllArgsConstructor` - Constructor con todos los argumentos
- `@Builder` - Patrón builder para crear objetos
- `@Slf4j` - Logger automático

---

### 4. **Spring Boot Starter Security**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

**¿Qué hace?** 
Protege tu API, maneja autenticación y autorización (quién puede acceder y qué puede hacer).

#### Ejemplo SIN Spring Security:
```java
// ❌ Validación manual en cada endpoint
@PostMapping("/expedientes")
public Expediente crear(@RequestBody ExpedienteDTO dto, HttpServletRequest request) {
    String token = request.getHeader("Authorization");
    if (token == null) {
        throw new RuntimeException("No autorizado");
    }
    
    Usuario usuario = validarToken(token);
    if (usuario == null) {
        throw new RuntimeException("Token inválido");
    }
    
    if (!usuario.getRol().equals("ADMIN") && !usuario.getRol().equals("ABOGADO")) {
        throw new RuntimeException("No tienes permisos");
    }
    
    // Finalmente... el código real
    return expedienteService.crear(dto);
}
// ❌ ¡Tienes que repetir esto en CADA endpoint!
```

#### Ejemplo CON Spring Security:
```java
// ✅ Spring Security lo maneja automáticamente
@RestController
@RequestMapping("/api/expedientes")
public class ExpedienteController {
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ABOGADO')")
    public Expediente crear(@RequestBody ExpedienteDTO dto) {
        // Spring ya validó el token y los permisos
        return expedienteService.crear(dto);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Long id) {
        expedienteService.eliminar(id);
    }
}
```

---

### 5. **JWT (JSON Web Token)**
```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
```

**¿Qué hace?** 
Crea y valida tokens seguros para autenticación sin sesiones. El usuario se loguea una vez y recibe un token que usa en cada petición.

#### ¿Cómo funciona JWT?
```
1. Usuario envía: { email: "juan@email.com", password: "123" }
2. Backend valida y crea token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
3. Frontend guarda el token
4. En cada petición, frontend envía: Authorization: Bearer <token>
5. Backend valida el token y permite/deniega el acceso
```

#### Ejemplo de uso:
```java
@Service
public class JwtService {
    
    private String secretKey = "MiClaveSecretaSuperSegura12345";
    
    // Crear token cuando el usuario se loguea
    public String generarToken(Usuario usuario) {
        return Jwts.builder()
            .setSubject(usuario.getEmail())
            .claim("rol", usuario.getRol())
            .claim("id", usuario.getId())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24 horas
            .signWith(Keys.hmacShaKeyFor(secretKey.getBytes()))
            .compact();
    }
    
    // Validar token en cada petición
    public String obtenerEmailDelToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes()))
            .build()
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }
}
```

---

### 6. **ModelMapper**
```xml
<dependency>
    <groupId>org.modelmapper</groupId>
    <artifactId>modelmapper</artifactId>
    <version>3.2.0</version>
</dependency>
```

**¿Qué hace?** 
Convierte automáticamente entre Entidades (base de datos) y DTOs (objetos para el frontend).

**¿Por qué necesitamos DTOs?**
- No exponer toda la estructura de la base de datos
- Enviar solo lo necesario al frontend
- Evitar problemas de seguridad (ej: no enviar passwords)

#### Ejemplo SIN ModelMapper:
```java
// ❌ Mapeo manual, propenso a errores
public ExpedienteDTO toDTO(Expediente entidad) {
    ExpedienteDTO dto = new ExpedienteDTO();
    dto.setId(entidad.getId());
    dto.setNumeroExpediente(entidad.getNumeroExpediente());
    dto.setDemandante(entidad.getDemandante());
    dto.setDemandado(entidad.getDemandado());
    dto.setJuzgado(entidad.getJuzgado());
    dto.setEstado(entidad.getEstado());
    // ... 15 campos más
    // Si olvidas un campo = BUG
}

public Expediente toEntity(ExpedienteDTO dto) {
    Expediente entidad = new Expediente();
    entidad.setId(dto.getId());
    entidad.setNumeroExpediente(dto.getNumeroExpediente());
    // ... todo de nuevo
}
```

#### Ejemplo CON ModelMapper:
```java
// ✅ ¡Una línea!
@Service
public class ExpedienteService {
    
    @Autowired
    private ModelMapper modelMapper;
    
    public ExpedienteDTO toDTO(Expediente entidad) {
        return modelMapper.map(entidad, ExpedienteDTO.class);
    }
    
    public Expediente toEntity(ExpedienteDTO dto) {
        return modelMapper.map(dto, Expediente.class);
    }
}
```

---

### 7. **Spring Boot Starter Validation**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

**¿Qué hace?** 
Valida automáticamente los datos que llegan del frontend usando anotaciones.

#### Ejemplo SIN Validation:
```java
// ❌ Validación manual
@PostMapping
public Expediente crear(@RequestBody ExpedienteDTO dto) {
    if (dto.getNumeroExpediente() == null || dto.getNumeroExpediente().isEmpty()) {
        throw new RuntimeException("Número de expediente requerido");
    }
    if (dto.getNumeroExpediente().length() > 50) {
        throw new RuntimeException("Número de expediente muy largo");
    }
    if (dto.getDemandante() == null || dto.getDemandante().isEmpty()) {
        throw new RuntimeException("Demandante requerido");
    }
    if (dto.getEmail() != null && !dto.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
        throw new RuntimeException("Email inválido");
    }
    // ... ¡mucho código repetitivo!
}
```

#### Ejemplo CON Validation:
```java
// ✅ DTO con validaciones
public class ExpedienteDTO {
    
    @NotNull(message = "El número de expediente es requerido")
    @Size(max = 50, message = "El número no puede tener más de 50 caracteres")
    private String numeroExpediente;
    
    @NotBlank(message = "El demandante es requerido")
    private String demandante;
    
    @Email(message = "Email inválido")
    private String email;
    
    @Min(value = 0, message = "La cuantía no puede ser negativa")
    private BigDecimal cuantia;
}

// ✅ Controller - Spring valida automáticamente
@PostMapping
public Expediente crear(@Valid @RequestBody ExpedienteDTO dto) {
    // Si hay errores, Spring responde automáticamente con 400 Bad Request
    return expedienteService.crear(dto);
}
```

---

### 8. **Springdoc OpenAPI (Swagger)**
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

**¿Qué hace?** 
Genera documentación automática e interactiva de tu API. Puedes probar los endpoints desde el navegador.

#### Ejemplo de uso:
```java
@RestController
@RequestMapping("/api/expedientes")
@Tag(name = "Expedientes", description = "API para gestión de expedientes judiciales")
public class ExpedienteController {
    
    @GetMapping("/{id}")
    @Operation(summary = "Obtener expediente por ID", 
               description = "Devuelve toda la información de un expediente específico")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Expediente encontrado"),
        @ApiResponse(responseCode = "404", description = "Expediente no encontrado")
    })
    public ExpedienteDTO obtener(@PathVariable Long id) {
        return expedienteService.findById(id);
    }
}
```

**Acceder a Swagger:** http://localhost:8080/swagger-ui.html

---

### 9. **PostgreSQL Driver**
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>
```

**¿Qué hace?** 
Permite que Java se conecte a la base de datos PostgreSQL.

**Configuración en `application.properties`:**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/juridico_db
spring.datasource.username=postgres
spring.datasource.password=JuridicoPostgres2026!
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

### 10. **Spring Boot DevTools**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
</dependency>
```

**¿Qué hace?** 
Recarga automáticamente la aplicación cuando cambias código. No tienes que parar y volver a ejecutar el proyecto.

**Beneficios:**
- ✅ Recarga automática al guardar archivos
- ✅ Desactiva caché en desarrollo
- ✅ Acelera el desarrollo

---

## 📊 Resumen Visual

| Dependencia | Para qué sirve | Ejemplo clave |
|-------------|----------------|---------------|
| **Spring Web** | Crear API REST | `@RestController` |
| **Spring Data JPA** | Trabajar con BD sin SQL | `extends JpaRepository` |
| **Lombok** | Menos código repetitivo | `@Data` |
| **Spring Security** | Proteger la API | `@PreAuthorize` |
| **JWT** | Autenticación con tokens | `generarToken()` |
| **ModelMapper** | Convertir Entity ↔ DTO | `modelMapper.map()` |
| **Validation** | Validar datos automáticamente | `@NotNull`, `@Email` |
| **Swagger** | Documentar API | `@Operation` |
| **PostgreSQL** | Conectar a base de datos | Driver JDBC |
| **DevTools** | Recarga automática | Auto-reload |

---

## 🧠 Diccionario de Términos Técnicos

**API (Application Programming Interface)**  
Es como un "mesero" entre el frontend y el backend. El frontend le pide algo (datos de un expediente) y el API se los trae.

**REST (Representational State Transfer)**  
Es un estilo de diseño para APIs. Usa métodos HTTP simples: GET (leer), POST (crear), PUT (actualizar), DELETE (borrar).

**Endpoint**  
Es una "dirección" específica de tu API. Ejemplo: `GET /api/expedientes/123` es un endpoint para obtener el expediente con ID 123.

**JSON (JavaScript Object Notation)**  
Formato de texto para enviar datos. Ejemplo: `{"nombre": "Juan", "edad": 25}`

**JPA (Java Persistence API)**  
Estándar de Java para trabajar con bases de datos usando objetos en lugar de SQL.

**Entity (Entidad)**  
Una clase Java que representa una tabla de la base de datos. Ejemplo: la clase `Expediente` representa la tabla `expedientes`.

**Repository (Repositorio)**  
Interface que te da métodos automáticos para trabajar con la base de datos (guardar, buscar, eliminar, etc.).

**DTO (Data Transfer Object)**  
Objeto simple que se usa para enviar/recibir datos. Es como un "mensajero" entre el frontend y backend.

**Controller (Controlador)**  
Clase que recibe las peticiones HTTP y decide qué hacer con ellas. Es el "punto de entrada" de tu API.

**Service (Servicio)**  
Clase donde va la lógica de negocio (las reglas y operaciones complejas).

**Boilerplate**  
Código repetitivo y aburrido que tienes que escribir una y otra vez (getters, setters, constructores, etc.). Lombok lo elimina.

**Token**  
Un "pase de acceso" temporal. El usuario se loguea, recibe un token, y lo usa en cada petición para demostrar quién es.

**Autenticación**  
Verificar quién eres (login con usuario y contraseña).

**Autorización**  
Verificar qué puedes hacer (qué permisos tienes).

**Bean**  
Un objeto que Spring crea y gestiona automáticamente. Puedes pedirle a Spring que te dé beans con `@Autowired`.

**Dependency Injection (Inyección de Dependencias)**  
Spring te da automáticamente los objetos que necesitas. En lugar de hacer `new Service()`, usas `@Autowired` y Spring te lo da.

**Annotation (Anotación)**  
Son esas cosas con `@` que le dicen a Spring qué hacer. Ejemplo: `@RestController` le dice "esto es un controlador".

**HTTP Status Code**  
Números que indican el resultado de una petición:
- 200 = OK
- 201 = Creado
- 400 = Error en los datos enviados
- 401 = No autenticado
- 403 = No autorizado
- 404 = No encontrado
- 500 = Error del servidor

**CRUD**  
Create (Crear), Read (Leer), Update (Actualizar), Delete (Borrar). Son las 4 operaciones básicas con datos.

---

## 📚 Temas Recomendados para Estudiar con ChatGPT

Antes de empezar a programar, te recomiendo que estudies estos 2 temas con ChatGPT:

### 1. **"¿Cómo funciona Spring Boot por dentro?"**

Pregúntale a ChatGPT:
> "Explícame de forma simple cómo funciona Spring Boot. ¿Qué es la inyección de dependencias? ¿Cómo Spring sabe qué beans crear? ¿Qué hace la anotación @SpringBootApplication?"

**Por qué es importante:** Entender cómo Spring "conecta" todo automáticamente te ayudará a entender el proyecto completo.

### 2. **"REST API y HTTP - Conceptos básicos"**

Pregúntale a ChatGPT:
> "Explícame qué es una API REST, los métodos HTTP (GET, POST, PUT, DELETE), qué son los códigos de estado HTTP, y dame ejemplos prácticos de cómo el frontend se comunica con el backend."

**Por qué es importante:** Todo lo que vamos a hacer es crear una API REST. Necesitas entender cómo funciona la comunicación HTTP.

---

## ✅ Checklist de Comprensión

Antes de empezar a programar, asegúrate de poder responder estas preguntas:

- [ ] ¿Para qué sirve `@RestController`?
- [ ] ¿Cuál es la diferencia entre una Entity y un DTO?
- [ ] ¿Qué hace `@Data` de Lombok?
- [ ] ¿Por qué usamos JWT en lugar de sesiones?
- [ ] ¿Qué es un Repository y qué métodos tiene automáticamente?
- [ ] ¿Cómo valido que un campo no esté vacío?
- [ ] ¿Dónde va la lógica de negocio: en el Controller o en el Service?

**Si tienes dudas en alguna pregunta, ¡es el momento de preguntar!**

---

## 🎯 Siguiente Paso

Una vez que hayas leído esta guía:

1. ✅ Lee el **Diccionario de Términos** al final
2. ✅ Estudia los **2 temas recomendados** con ChatGPT (30 min cada uno)
3. ✅ Lee la siguiente guía: **GUIA-ESTRUCTURA-PAQUETES-BACKEND.md**
4. ✅ Configura tu entorno de desarrollo
5. ✅ ¡Empieza a programar el lunes!

---

**¿Dudas?** ¡Pregunta sin pena! Es mejor aclarar ahora que atascarse después.

**¡Éxito en el proyecto!** 💪🚀

---

**Rodrigo Paz**  
Líder de Proyecto  
7 de Enero 2026
