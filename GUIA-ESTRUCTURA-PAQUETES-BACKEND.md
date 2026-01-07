# 📁 Guía de Estructura de Paquetes - Sistema Jurídico Backend

**Para:** Ramses, Ricardo y Aurora  
**Fecha:** 7 de Enero 2026  
**Tiempo de lectura:** 15-20 minutos

---

## 👋 Introducción

¡Hola equipo! En esta guía aprenderás **cómo está organizado el código del backend**. Piensa en los paquetes como las "carpetas" donde vive cada tipo de archivo. Así como en tu casa tienes un lugar para la ropa, otro para los platos, aquí también cada cosa tiene su lugar específico.

> 💡 **Tip:** Una buena organización hace que sea fácil encontrar y mantener el código. ¡Nunca más buscarás 10 minutos un archivo!

---

## 🏗️ Estructura General del Proyecto

```
juridico-springboot/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── juridico/
│   │   │           └── sistema/
│   │   │               ├── SistemaJuridicoApplication.java (✨ Inicio del proyecto)
│   │   │               │
│   │   │               ├── config/           (⚙️ Configuraciones)
│   │   │               ├── controller/       (🎮 Controladores - Endpoints)
│   │   │               ├── dto/              (📦 DTOs - Objetos para enviar/recibir)
│   │   │               ├── entity/           (🗄️ Entidades - Tablas de BD)
│   │   │               ├── repository/       (💾 Repositorios - Acceso a BD)
│   │   │               ├── service/          (🧠 Servicios - Lógica de negocio)
│   │   │               ├── security/         (🔐 Seguridad - JWT, Auth)
│   │   │               └── exception/        (⚠️ Manejo de errores)
│   │   │
│   │   └── resources/
│   │       ├── application.properties       (⚙️ Configuración de la app)
│   │       ├── application-dev.properties   (🛠️ Config para desarrollo)
│   │       └── application-prod.properties  (🚀 Config para producción)
│   │
│   └── test/                                (🧪 Tests unitarios)
│
├── pom.xml                                  (📦 Dependencias Maven)
└── README.md                                (📖 Documentación)
```

---

## 📂 Paquetes Detallados

### 1. **Paquete `entity`** (🗄️ Las tablas de la base de datos)

**¿Qué va aquí?**  
Clases que representan las tablas de la base de datos. Cada clase = 1 tabla.

**Características:**
- Usan anotación `@Entity`
- Tienen `@Table(name = "nombre_tabla")`
- Los campos se mapean a columnas de la tabla
- Definen relaciones entre tablas (`@OneToMany`, `@ManyToOne`, etc.)

#### Ejemplo: `Expediente.java`
```java
package com.juridico.sistema.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "expedientes")
public class Expediente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "numero_expediente", unique = true, nullable = false, length = 50)
    private String numeroExpediente;
    
    @Column(nullable = false, length = 200)
    private String demandante;
    
    @Column(nullable = false, length = 200)
    private String demandado;
    
    @Column(length = 100)
    private String juzgado;
    
    @Column(length = 50)
    private String estado;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal cuantia;
    
    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;
    
    // Relación: Un expediente tiene muchas audiencias
    @OneToMany(mappedBy = "expediente", cascade = CascadeType.ALL)
    private List<Audiencia> audiencias;
    
    // Relación: Un expediente tiene muchos términos
    @OneToMany(mappedBy = "expediente", cascade = CascadeType.ALL)
    private List<Termino> terminos;
    
    @Column(name = "activo")
    private Boolean activo = true;
}
```

**Archivos que van aquí:**
- `Expediente.java`
- `Audiencia.java`
- `Termino.java`
- `Usuario.java`
- `Documento.java`
- `Notificacion.java`
- `Recordatorio.java`
- etc. (17 entidades en total)

---

### 2. **Paquete `repository`** (💾 Acceso a la base de datos)

**¿Qué va aquí?**  
Interfaces que heredan de `JpaRepository`. Te dan métodos automáticos para trabajar con la BD.

**Características:**
- Son interfaces (no clases)
- Extienden `JpaRepository<Entidad, TipoDelID>`
- Spring crea la implementación automáticamente
- Puedes agregar métodos custom con nombres descriptivos

#### Ejemplo: `ExpedienteRepository.java`
```java
package com.juridico.sistema.repository;

import com.juridico.sistema.entity.Expediente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpedienteRepository extends JpaRepository<Expediente, Long> {
    
    // Métodos que ya tienes GRATIS sin escribir código:
    // - findById(Long id)
    // - findAll()
    // - save(Expediente exp)
    // - deleteById(Long id)
    // - count()
    
    // Métodos custom - Spring los implementa por el nombre:
    Optional<Expediente> findByNumeroExpediente(String numeroExpediente);
    
    List<Expediente> findByEstadoAndActivo(String estado, Boolean activo);
    
    List<Expediente> findByDemandanteContainingIgnoreCase(String demandante);
    
    List<Expediente> findByFechaInicioBetween(LocalDate inicio, LocalDate fin);
    
    // Consulta personalizada con JPQL:
    @Query("SELECT e FROM Expediente e WHERE e.estado = :estado AND e.cuantia > :cuantia")
    List<Expediente> buscarPorEstadoYCuantiaMinima(
        @Param("estado") String estado, 
        @Param("cuantia") BigDecimal cuantia
    );
    
    // Consulta con SQL nativo:
    @Query(value = "SELECT * FROM expedientes WHERE activo = true ORDER BY fecha_inicio DESC LIMIT 10", 
           nativeQuery = true)
    List<Expediente> obtenerUltimos10Expedientes();
}
```

**Archivos que van aquí:**
- `ExpedienteRepository.java`
- `AudienciaRepository.java`
- `TerminoRepository.java`
- `UsuarioRepository.java`
- etc. (1 repositorio por cada entidad)

---

### 3. **Paquete `dto`** (📦 Objetos para enviar/recibir datos)

**¿Qué va aquí?**  
Clases simples (POJOs) que se usan para comunicación con el frontend. **NO** son entidades de base de datos.

**¿Por qué usar DTOs?**
- ✅ No exponer la estructura completa de la BD
- ✅ Enviar solo los datos necesarios
- ✅ Recibir solo lo que el usuario puede modificar
- ✅ Agregar validaciones
- ✅ Seguridad (no enviar passwords, etc.)

**Tipos de DTOs:**

#### **a) Request DTO** (Recibir datos del frontend)
```java
package com.juridico.sistema.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpedienteRequestDTO {
    
    @NotBlank(message = "El número de expediente es obligatorio")
    @Size(max = 50, message = "Máximo 50 caracteres")
    private String numeroExpediente;
    
    @NotBlank(message = "El demandante es obligatorio")
    @Size(max = 200, message = "Máximo 200 caracteres")
    private String demandante;
    
    @NotBlank(message = "El demandado es obligatorio")
    @Size(max = 200, message = "Máximo 200 caracteres")
    private String demandado;
    
    @Size(max = 100)
    private String juzgado;
    
    @Size(max = 50)
    private String estado;
    
    @DecimalMin(value = "0.0", message = "La cuantía no puede ser negativa")
    private BigDecimal cuantia;
    
    @PastOrPresent(message = "La fecha de inicio no puede ser futura")
    private LocalDate fechaInicio;
    
    private String observaciones;
}
```

#### **b) Response DTO** (Enviar datos al frontend)
```java
package com.juridico.sistema.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpedienteResponseDTO {
    
    private Long id;
    private String numeroExpediente;
    private String demandante;
    private String demandado;
    private String juzgado;
    private String estado;
    private BigDecimal cuantia;
    private LocalDate fechaInicio;
    private String observaciones;
    private Boolean activo;
    
    // Información adicional que no está en la entidad:
    private Integer totalAudiencias;
    private Integer totalTerminos;
    private LocalDate proximaAudiencia;
}
```

#### **c) DTO Simple** (Cuando no necesitas separar request/response)
```java
package com.juridico.sistema.dto;

import lombok.Data;

@Data
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String email;
    private String rol;
    // NO incluimos el password por seguridad
}
```

**Organización sugerida:**
```
dto/
├── request/
│   ├── ExpedienteRequestDTO.java
│   ├── AudienciaRequestDTO.java
│   └── UsuarioRequestDTO.java
├── response/
│   ├── ExpedienteResponseDTO.java
│   ├── AudienciaResponseDTO.java
│   └── UsuarioResponseDTO.java
└── auth/
    ├── LoginRequestDTO.java
    ├── LoginResponseDTO.java
    └── RegisterRequestDTO.java
```

---

### 4. **Paquete `service`** (🧠 Lógica de negocio)

**¿Qué va aquí?**  
Clases con la lógica de negocio. Aquí van las reglas, validaciones complejas, y operaciones sobre los datos.

**Características:**
- Usan anotación `@Service`
- Inyectan repositorios con `@Autowired`
- NO hablan directamente con el frontend (eso es el Controller)
- Pueden llamar a otros servicios

#### Ejemplo: `ExpedienteService.java`
```java
package com.juridico.sistema.service;

import com.juridico.sistema.dto.request.ExpedienteRequestDTO;
import com.juridico.sistema.dto.response.ExpedienteResponseDTO;
import com.juridico.sistema.entity.Expediente;
import com.juridico.sistema.exception.ResourceNotFoundException;
import com.juridico.sistema.repository.ExpedienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor  // Lombok crea constructor con dependencias final
@Slf4j                    // Logger automático
@Transactional            // Manejo automático de transacciones
public class ExpedienteService {
    
    private final ExpedienteRepository expedienteRepository;
    private final ModelMapper modelMapper;
    
    // Crear nuevo expediente
    public ExpedienteResponseDTO crear(ExpedienteRequestDTO requestDTO) {
        log.info("Creando expediente: {}", requestDTO.getNumeroExpediente());
        
        // Validar que no exista
        if (expedienteRepository.findByNumeroExpediente(requestDTO.getNumeroExpediente()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un expediente con ese número");
        }
        
        // Convertir DTO a Entity
        Expediente expediente = modelMapper.map(requestDTO, Expediente.class);
        expediente.setActivo(true);
        
        // Guardar en BD
        Expediente guardado = expedienteRepository.save(expediente);
        
        log.info("Expediente creado con ID: {}", guardado.getId());
        
        // Convertir Entity a DTO y retornar
        return modelMapper.map(guardado, ExpedienteResponseDTO.class);
    }
    
    // Obtener por ID
    public ExpedienteResponseDTO obtenerPorId(Long id) {
        Expediente expediente = expedienteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado con ID: " + id));
        
        return modelMapper.map(expediente, ExpedienteResponseDTO.class);
    }
    
    // Listar todos
    public List<ExpedienteResponseDTO> listarTodos() {
        return expedienteRepository.findAll().stream()
            .map(expediente -> modelMapper.map(expediente, ExpedienteResponseDTO.class))
            .collect(Collectors.toList());
    }
    
    // Actualizar
    public ExpedienteResponseDTO actualizar(Long id, ExpedienteRequestDTO requestDTO) {
        Expediente expediente = expedienteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado"));
        
        // Actualizar campos
        modelMapper.map(requestDTO, expediente);
        
        Expediente actualizado = expedienteRepository.save(expediente);
        return modelMapper.map(actualizado, ExpedienteResponseDTO.class);
    }
    
    // Eliminar (soft delete)
    public void eliminar(Long id) {
        Expediente expediente = expedienteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado"));
        
        expediente.setActivo(false);
        expedienteRepository.save(expediente);
        
        log.info("Expediente {} marcado como inactivo", id);
    }
    
    // Buscar por número
    public ExpedienteResponseDTO buscarPorNumero(String numero) {
        Expediente expediente = expedienteRepository.findByNumeroExpediente(numero)
            .orElseThrow(() -> new ResourceNotFoundException("Expediente no encontrado: " + numero));
        
        return modelMapper.map(expediente, ExpedienteResponseDTO.class);
    }
}
```

**Archivos que van aquí:**
- `ExpedienteService.java`
- `AudienciaService.java`
- `TerminoService.java`
- `UsuarioService.java`
- etc.

---

### 5. **Paquete `controller`** (🎮 Endpoints de la API)

**¿Qué va aquí?**  
Clases que reciben las peticiones HTTP del frontend y las delegan al Service correspondiente.

**Características:**
- Usan anotación `@RestController`
- Definen rutas con `@RequestMapping`, `@GetMapping`, etc.
- Inyectan servicios
- Retornan DTOs
- Manejan códigos de estado HTTP

#### Ejemplo: `ExpedienteController.java`
```java
package com.juridico.sistema.controller;

import com.juridico.sistema.dto.request.ExpedienteRequestDTO;
import com.juridico.sistema.dto.response.ExpedienteResponseDTO;
import com.juridico.sistema.service.ExpedienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expedientes")
@RequiredArgsConstructor
@Tag(name = "Expedientes", description = "API para gestión de expedientes judiciales")
public class ExpedienteController {
    
    private final ExpedienteService expedienteService;
    
    // Crear nuevo expediente
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ABOGADO')")
    @Operation(summary = "Crear expediente", description = "Crea un nuevo expediente en el sistema")
    public ResponseEntity<ExpedienteResponseDTO> crear(@Valid @RequestBody ExpedienteRequestDTO requestDTO) {
        ExpedienteResponseDTO creado = expedienteService.crear(requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }
    
    // Obtener por ID
    @GetMapping("/{id}")
    @Operation(summary = "Obtener expediente por ID")
    public ResponseEntity<ExpedienteResponseDTO> obtenerPorId(@PathVariable Long id) {
        ExpedienteResponseDTO expediente = expedienteService.obtenerPorId(id);
        return ResponseEntity.ok(expediente);
    }
    
    // Listar todos
    @GetMapping
    @Operation(summary = "Listar todos los expedientes")
    public ResponseEntity<List<ExpedienteResponseDTO>> listarTodos() {
        List<ExpedienteResponseDTO> expedientes = expedienteService.listarTodos();
        return ResponseEntity.ok(expedientes);
    }
    
    // Actualizar
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ABOGADO')")
    @Operation(summary = "Actualizar expediente")
    public ResponseEntity<ExpedienteResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ExpedienteRequestDTO requestDTO) {
        ExpedienteResponseDTO actualizado = expedienteService.actualizar(id, requestDTO);
        return ResponseEntity.ok(actualizado);
    }
    
    // Eliminar
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar expediente")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        expedienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    
    // Buscar por número
    @GetMapping("/numero/{numero}")
    @Operation(summary = "Buscar expediente por número")
    public ResponseEntity<ExpedienteResponseDTO> buscarPorNumero(@PathVariable String numero) {
        ExpedienteResponseDTO expediente = expedienteService.buscarPorNumero(numero);
        return ResponseEntity.ok(expediente);
    }
}
```

**Métodos HTTP comunes:**
- `@GetMapping` - Obtener datos (no modifica)
- `@PostMapping` - Crear nuevo recurso
- `@PutMapping` - Actualizar recurso completo
- `@PatchMapping` - Actualizar parcialmente
- `@DeleteMapping` - Eliminar recurso

**Archivos que van aquí:**
- `ExpedienteController.java`
- `AudienciaController.java`
- `TerminoController.java`
- `AuthController.java`
- etc.

---

### 6. **Paquete `config`** (⚙️ Configuraciones)

**¿Qué va aquí?**  
Clases de configuración que definen beans y configuraciones específicas de Spring.

#### Ejemplo: `ModelMapperConfig.java`
```java
package com.juridico.sistema.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {
    
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
```

#### Ejemplo: `CorsConfig.java`
```java
package com.juridico.sistema.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5500")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

**Archivos que van aquí:**
- `ModelMapperConfig.java`
- `CorsConfig.java`
- `SwaggerConfig.java`
- `SecurityConfig.java`

---

### 7. **Paquete `security`** (🔐 Seguridad y JWT)

**¿Qué va aquí?**  
Clases relacionadas con autenticación, autorización y manejo de JWT.

#### Ejemplo: `JwtService.java`
```java
package com.juridico.sistema.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String secretKey;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    public String generarToken(String email, String rol) {
        return Jwts.builder()
                .setSubject(email)
                .claim("rol", rol)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    public String obtenerEmailDelToken(String token) {
        return obtenerClaims(token).getSubject();
    }
    
    public boolean validarToken(String token) {
        try {
            obtenerClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }
    
    private Claims obtenerClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
}
```

**Archivos que van aquí:**
- `JwtService.java`
- `JwtAuthenticationFilter.java`
- `SecurityConfig.java`
- `UserDetailsServiceImpl.java`

---

### 8. **Paquete `exception`** (⚠️ Manejo de errores)

**¿Qué va aquí?**  
Excepciones personalizadas y manejadores globales de errores.

#### Ejemplo: Excepción personalizada
```java
package com.juridico.sistema.exception;

public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String mensaje) {
        super(mensaje);
    }
}
```

#### Ejemplo: Manejador global de errores
```java
package com.juridico.sistema.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    // Maneja ResourceNotFoundException
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(ex.getMessage())
                .build();
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    
    // Maneja errores de validación
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String campo = ((FieldError) error).getField();
            String mensaje = error.getDefaultMessage();
            errores.put(campo, mensaje);
        });
        
        return ResponseEntity.badRequest().body(errores);
    }
    
    // Maneja cualquier otra excepción
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("Ocurrió un error inesperado")
                .build();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
```

#### Ejemplo: Clase de respuesta de error
```java
package com.juridico.sistema.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
}
```

**Archivos que van aquí:**
- `ResourceNotFoundException.java`
- `BadRequestException.java`
- `UnauthorizedException.java`
- `GlobalExceptionHandler.java`
- `ErrorResponse.java`

---

## 🔄 Flujo de una Petición HTTP

Entender cómo viaja una petición es **clave** para saber dónde poner cada cosa:

```
1. FRONTEND hace petición:
   GET http://localhost:8080/api/expedientes/123
   
2. CONTROLLER recibe la petición:
   @GetMapping("/{id}")
   public ResponseEntity<ExpedienteResponseDTO> obtenerPorId(@PathVariable Long id) {
       ...
   }
   
3. CONTROLLER llama al SERVICE:
   ExpedienteResponseDTO expediente = expedienteService.obtenerPorId(id);
   
4. SERVICE llama al REPOSITORY:
   Expediente expediente = expedienteRepository.findById(id)
   
5. REPOSITORY consulta la BASE DE DATOS:
   SELECT * FROM expedientes WHERE id = 123;
   
6. REPOSITORY devuelve la ENTITY al SERVICE:
   return expediente;
   
7. SERVICE convierte ENTITY → DTO:
   ExpedienteResponseDTO dto = modelMapper.map(expediente, ExpedienteResponseDTO.class);
   
8. SERVICE devuelve DTO al CONTROLLER:
   return dto;
   
9. CONTROLLER devuelve ResponseEntity:
   return ResponseEntity.ok(expediente);
   
10. SPRING convierte DTO → JSON y envía al FRONTEND:
    { "id": 123, "numeroExpediente": "EXP-2026-001", ... }
```

---

## 📋 Resumen: ¿Dónde va cada cosa?

| ¿Qué es? | ¿Dónde va? | ¿Qué hace? | Ejemplo |
|----------|-----------|------------|---------|
| Tabla de BD | `entity/` | Representa una tabla | `Expediente.java` |
| Acceso a BD | `repository/` | Métodos para BD | `ExpedienteRepository.java` |
| Lógica de negocio | `service/` | Reglas y operaciones | `ExpedienteService.java` |
| Endpoint HTTP | `controller/` | Recibe peticiones | `ExpedienteController.java` |
| Datos del frontend | `dto/request/` | Recibe datos | `ExpedienteRequestDTO.java` |
| Datos al frontend | `dto/response/` | Envía datos | `ExpedienteResponseDTO.java` |
| Configuración | `config/` | Beans y configs | `ModelMapperConfig.java` |
| Seguridad/JWT | `security/` | Auth y tokens | `JwtService.java` |
| Errores custom | `exception/` | Manejo de errores | `ResourceNotFoundException.java` |

---

## 🧠 Diccionario de Términos Técnicos

**Paquete (Package)**  
Es como una "carpeta" para organizar clases relacionadas. Ayuda a mantener el código ordenado.

**Entity (Entidad)**  
Una clase Java que representa una tabla de la base de datos. Cada objeto = 1 fila de la tabla.

**Repository (Repositorio)**  
Interface que te da métodos automáticos para trabajar con la base de datos (guardar, buscar, borrar, etc.).

**DTO (Data Transfer Object)**  
Objeto simple usado para enviar/recibir datos entre frontend y backend. Es el "mensajero".

**Service (Servicio)**  
Clase donde va la lógica de negocio. Las reglas importantes de tu aplicación van aquí.

**Controller (Controlador)**  
Clase que recibe las peticiones HTTP del frontend y decide qué hacer. Es el "recepcionista" de tu API.

**Bean**  
Objeto que Spring crea y gestiona automáticamente. Lo puedes pedir con `@Autowired`.

**Dependency Injection (Inyección de Dependencias)**  
Spring te da automáticamente los objetos que necesitas. En lugar de `new Service()`, usas `@Autowired`.

**Annotation (Anotación)**  
Son esas cosas con `@` que le dicen a Spring qué hacer. Ejemplo: `@RestController`, `@Service`, `@Entity`.

**Endpoint**  
Una "dirección" de tu API. Ejemplo: `GET /api/expedientes/123`

**HTTP Methods (Métodos HTTP)**  
Verbos que indican qué operación hacer:
- GET = Leer/Obtener
- POST = Crear
- PUT = Actualizar todo
- PATCH = Actualizar parcialmente
- DELETE = Eliminar

**Request Body**  
Los datos que el frontend envía en el cuerpo de la petición (en formato JSON).

**Response Body**  
Los datos que el backend devuelve al frontend (en formato JSON).

**Path Variable**  
Un valor que va en la URL. Ejemplo: en `/api/expedientes/123`, el `123` es una path variable.

**Query Parameter**  
Un filtro que va después de `?` en la URL. Ejemplo: `/api/expedientes?estado=activo`

**CRUD**  
Create, Read, Update, Delete - Las 4 operaciones básicas.

**JPA (Java Persistence API)**  
Estándar de Java para trabajar con bases de datos usando objetos.

**Hibernate**  
La librería que implementa JPA. Convierte tus objetos Java en SQL.

**Transaction (Transacción)**  
Un conjunto de operaciones de BD que se ejecutan juntas o ninguna. Si una falla, todas se revierten.

**Cascade**  
Cuando haces algo en una entidad (guardar, borrar), automáticamente se hace en las entidades relacionadas.

**Mapping (Mapeo)**  
Convertir un tipo de objeto a otro. Ejemplo: Entity → DTO.

**Validation (Validación)**  
Verificar que los datos cumplan ciertas reglas (ej: no vacío, email válido, etc.).

**Exception (Excepción)**  
Un error que ocurre durante la ejecución. Puedes "lanzar" y "capturar" excepciones.

**Global Exception Handler**  
Una clase que captura todos los errores de tu aplicación y devuelve respuestas consistentes.

**CORS (Cross-Origin Resource Sharing)**  
Configuración para permitir que el frontend (en otro dominio/puerto) llame a tu API.

**JWT (JSON Web Token)**  
Un token seguro que contiene información del usuario. Se usa para autenticación.

**Claims**  
Información que guardas dentro del JWT (email, rol, etc.).

**Logger**  
Herramienta para escribir mensajes de log (debug, info, error). Útil para depurar.

**Transactional**  
Anotación que hace que un método se ejecute dentro de una transacción de BD.

---

## 📚 Temas Recomendados para Estudiar con ChatGPT

### 1. **"Arquitectura en capas de Spring Boot"**

Pregúntale a ChatGPT:
> "Explícame la arquitectura en capas de Spring Boot: Controller, Service, Repository. ¿Por qué separamos en capas? ¿Qué va en cada capa? Dame ejemplos prácticos."

**Por qué es importante:** Entender esto es fundamental para saber dónde poner cada cosa y no mezclar responsabilidades.

### 2. **"Relaciones entre entidades en JPA"**

Pregúntale a ChatGPT:
> "Explícame las relaciones JPA: @OneToMany, @ManyToOne, @ManyToMany, @OneToOne. ¿Cómo se mapean? ¿Qué es mappedBy? ¿Qué es cascade? Dame ejemplos con Expediente y Audiencia."

**Por qué es importante:** Vas a crear muchas relaciones entre tablas. Necesitas entenderlas bien.

---

## ✅ Checklist de Comprensión

Antes de empezar a programar, asegúrate de poder responder:

- [ ] ¿En qué paquete va una clase que representa una tabla?
- [ ] ¿Qué es un Repository y dónde va?
- [ ] ¿Cuál es la diferencia entre un DTO Request y un DTO Response?
- [ ] ¿Dónde va la lógica de negocio?
- [ ] ¿Qué hace un Controller?
- [ ] ¿En qué orden se ejecutan Controller → Service → Repository?
- [ ] ¿Dónde pongo configuraciones como ModelMapper o CORS?
- [ ] ¿Dónde van las excepciones personalizadas?

**Si tienes dudas, ¡pregunta antes de empezar!**

---

## 🎯 Ejercicio Práctico Rápido

Para verificar que entendiste, intenta responder:

**Pregunta:** Si tienes que crear un nuevo módulo de "Documentos", ¿qué archivos crearías y en qué paquetes?

**Respuesta:**
```
entity/Documento.java              → La tabla
repository/DocumentoRepository.java → Acceso a BD
dto/request/DocumentoRequestDTO.java → Recibir datos
dto/response/DocumentoResponseDTO.java → Enviar datos
service/DocumentoService.java      → Lógica de negocio
controller/DocumentoController.java → Endpoints HTTP
```

**¿Lo entendiste?** ¡Excelente! Estás listo para empezar.

---

## 🎯 Siguiente Paso

Una vez que hayas leído esta guía:

1. ✅ Repasa el **Diccionario de Términos**
2. ✅ Estudia los **2 temas recomendados** con ChatGPT (30 min cada uno)
3. ✅ Clona el repositorio backend y explora la estructura
4. ✅ Identifica cada paquete en el proyecto real
5. ✅ ¡El lunes empieza a crear tus archivos!

---

## 💡 Tip Final

**Recuerda la regla de oro:**
- Entity = Base de datos
- Repository = Acceso a datos
- Service = Lógica de negocio
- Controller = Endpoints HTTP
- DTO = Comunicación con frontend

**¿Dudas?** ¡Pregunta ahora! Es mejor aclarar antes que equivocarse después.

**¡Mucho éxito!** 💪🚀

---

**Rodrigo Paz**  
Líder de Proyecto  
7 de Enero 2026
