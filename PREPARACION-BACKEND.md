# 🔧 GUÍA DE PREPARACIÓN DEL BACKEND

## 📋 Resumen

Este documento contiene instrucciones detalladas para preparar el repositorio `juridico-springboot` antes de que el equipo comience a trabajar el **12 de enero de 2026**.

**Tiempo estimado:** 2-3 horas  
**Responsable:** Rodrigo (o cualquier dev disponible antes del 12/ene)

---

## 🎯 Objetivo

Limpiar y adaptar el proyecto Spring Boot para que coincida con el contexto del frontend y el equipo pueda comenzar a trabajar sin fricciones.

---

## 📝 PASOS DE PREPARACIÓN

### 1️⃣ Clonar el repositorio (si no lo tienes)

```bash
cd ~/
git clone https://github.com/rodrigopazTech/juridico-springboot.git
cd juridico-springboot
```

---

### 2️⃣ Crear rama de preparación

```bash
git checkout -b prep/setup-inicial
```

---

### 3️⃣ Actualizar `pom.xml`

Abre `pom.xml` y agrega estas dependencias **DESPUÉS** de las existentes, **ANTES** de `</dependencies>`:

```xml
<!-- Lombok para reducir boilerplate -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- Swagger/OpenAPI para documentación de API -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>

<!-- JWT para autenticación -->
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

<!-- ModelMapper para conversión DTO-Entity -->
<dependency>
    <groupId>org.modelmapper</groupId>
    <artifactId>modelmapper</artifactId>
    <version>3.2.0</version>
</dependency>
```

**También actualiza el plugin de Maven** para incluir Lombok:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <excludes>
                    <exclude>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                    </exclude>
                </excludes>
            </configuration>
        </plugin>
    </plugins>
</build>
```

---

### 4️⃣ Crear estructura de paquetes

```bash
cd src/main/java/com/juridico/sistema_juridico/

# Crear carpetas necesarias
mkdir -p entity
mkdir -p repository
mkdir -p service
mkdir -p dto/request
mkdir -p dto/response
mkdir -p exception
mkdir -p util
mkdir -p security

# Mover SecurityConfig a security/
mv config/SecurityConfig.java security/

# Eliminar carpeta config vacía
rmdir config
```

---

### 5️⃣ Eliminar controllers stubs

```bash
# Eliminar todos los controllers existentes (son stubs sin implementación)
cd controller
rm AgendaController.java
rm AudienciasController.java
rm AuthController.java
rm DashboardController.java
rm ExpedientesController.java
rm TerminosController.java

cd ../../../../../../../..
```

---

### 6️⃣ Actualizar `application.properties`

Reemplaza **TODO** el contenido de `src/main/resources/application.properties` con:

```properties
spring.application.name=sistema-juridico

# ============================================
# CONFIGURACIÓN DE BASE DE DATOS POSTGRESQL
# ============================================
spring.datasource.url=jdbc:postgresql://localhost:5432/juridico_db
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# Pool de conexiones
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5

# ============================================
# CONFIGURACIÓN DE JPA/HIBERNATE
# ============================================
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

# ============================================
# CONFIGURACIÓN DE THYMELEAF
# ============================================
spring.thymeleaf.cache=false
spring.thymeleaf.mode=HTML
spring.thymeleaf.encoding=UTF-8
spring.thymeleaf.servlet.content-type=text/html
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html

# ============================================
# CONFIGURACIÓN DE SERVIDOR
# ============================================
server.port=8080
server.servlet.context-path=/
server.error.include-message=always
server.error.include-stacktrace=on_param

# ============================================
# CONFIGURACIÓN DE JWT
# ============================================
jwt.secret=5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# ============================================
# CONFIGURACIÓN DE FILE UPLOAD
# ============================================
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload-dir=./uploads

# ============================================
# CONFIGURACIÓN DE SWAGGER/OPENAPI
# ============================================
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.tagsSorter=alpha

# ============================================
# CONFIGURACIÓN DE CORS
# ============================================
cors.allowed-origins=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000

# ============================================
# CONFIGURACIÓN DE LOGGING
# ============================================
logging.level.com.juridico.sistema_juridico=DEBUG
logging.level.org.springframework.web=INFO
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE

# ============================================
# CONFIGURACIÓN DE AUDITORÍA
# ============================================
spring.jpa.properties.hibernate.envers.audit_table_suffix=_AUD
spring.jpa.properties.hibernate.envers.revision_field_name=REV
spring.jpa.properties.hibernate.envers.revision_type_field_name=REVTYPE
```

---

### 7️⃣ Actualizar `SecurityConfig.java`

Reemplaza el contenido de `src/main/java/com/juridico/sistema_juridico/security/SecurityConfig.java` con:

```java
package com.juridico.sistema_juridico.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuración de seguridad para el sistema jurídico.
 * En esta fase inicial, la seguridad está configurada de manera permisiva
 * para facilitar el desarrollo. Se endurecerá en fases posteriores.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Deshabilitar CSRF para desarrollo de API REST
            .csrf(csrf -> csrf.disable())
            
            // Configurar CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // Configurar autorización de requests
            .authorizeHttpRequests(auth -> auth
                // Permitir acceso público a endpoints de autenticación
                .requestMatchers("/api/auth/**").permitAll()
                
                // Permitir acceso a Swagger/OpenAPI
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api-docs/**").permitAll()
                
                // Permitir acceso a recursos estáticos
                .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**").permitAll()
                
                // TODO: En desarrollo, permitir todo. Configurar roles después.
                .anyRequest().permitAll()
            )
            
            // Configurar sesiones stateless (JWT)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );

        return http.build();
    }

    /**
     * Configuración de CORS para permitir requests desde el frontend
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Orígenes permitidos (frontend local)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:3000"
        ));
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Headers permitidos
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Permitir credenciales
        configuration.setAllowCredentials(true);
        
        // Tiempo de cache de preflight
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    /**
     * Encoder de passwords usando BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

---

### 8️⃣ Crear README.md del backend

Crea `README.md` en la raíz del proyecto:

```markdown
# 🏛️ Sistema Jurídico GOB.MX - Backend

Sistema de gestión jurídica para instituciones gubernamentales mexicanas.

## 🚀 Tecnologías

- **Java:** 17
- **Spring Boot:** 3.4.12
- **Base de Datos:** PostgreSQL 15+
- **ORM:** Spring Data JPA / Hibernate
- **Seguridad:** Spring Security + JWT
- **Documentación:** Swagger/OpenAPI
- **Templates:** Thymeleaf

## 📋 Requisitos Previos

- Java JDK 17 o superior
- Maven 3.8+
- PostgreSQL 15+
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/rodrigopazTech/juridico-springboot.git
cd juridico-springboot
```

### 2. Configurar Base de Datos

Crear base de datos en PostgreSQL:

```sql
CREATE DATABASE juridico_db;
CREATE USER juridico_user WITH PASSWORD 'juridico_pass';
GRANT ALL PRIVILEGES ON DATABASE juridico_db TO juridico_user;
```

### 3. Configurar application.properties

Actualizar credenciales si es necesario en `src/main/resources/application.properties`

### 4. Compilar el proyecto

```bash
mvn clean install
```

### 5. Ejecutar la aplicación

```bash
mvn spring-boot:run
```

O ejecutar el JAR:

```bash
java -jar target/sistema-juridico-0.0.1-SNAPSHOT.jar
```

## 🌐 URLs Importantes

- **API:** http://localhost:8080/api
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **API Docs:** http://localhost:8080/api-docs

## 📁 Estructura del Proyecto

```
src/main/java/com/juridico/sistema_juridico/
├── controller/          # Controladores REST
├── entity/             # Entidades JPA
├── repository/         # Repositorios Spring Data
├── service/            # Lógica de negocio
├── dto/                # Data Transfer Objects
│   ├── request/        # DTOs de entrada
│   └── response/       # DTOs de salida
├── security/           # Configuración de seguridad
├── exception/          # Excepciones personalizadas
└── util/               # Utilidades
```

## 🗃️ Base de Datos

El proyecto usa PostgreSQL con Hibernate para gestión automática del esquema.

### Ejecutar script inicial

```bash
psql -U postgres -d juridico_db -f /path/to/base.sql
```

## 👥 Equipo de Desarrollo

- **Ramses** - Senior Developer (12-20 enero)
- **Aurora** - Junior Developer
- **Ricardo** - Mid-Senior Developer

## 📝 Documentación Adicional

- [Plan de Implementación](../juridico/PLAN-IMPLEMENTACION-BACKEND.md)
- [Handoff Notes](HANDOFF-NOTES.md)
- [API Documentation](API-DOCUMENTATION.md) (próximamente)

## 🔧 Desarrollo

### Ejecutar en modo desarrollo

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Ejecutar tests

```bash
mvn test
```

### Generar JAR

```bash
mvn clean package
```

## 📞 Contacto

**Project Manager:** Rodrigo Paz  
**Repository:** https://github.com/rodrigopazTech/juridico-springboot

---

**Última actualización:** 6 de enero 2026
```

---

### 9️⃣ Actualizar `.gitignore`

Agrega al final del archivo `.gitignore`:

```gitignore
### Uploads ###
uploads/
*.pdf
*.doc
*.docx

### Local Configuration ###
application-local.properties
application-prod.properties

### IDE ###
.vscode/
.idea/
*.iml
*.iws
*.ipr

### Logs ###
*.log
logs/

### OS ###
.DS_Store
Thumbs.db

### Backup files ###
*~
*.bak
*.swp
*.swo
```

---

### 🔟 Crear archivo HANDOFF-NOTES.md

```bash
cd ~/juridico-springboot
cat > HANDOFF-NOTES.md << 'EOF'
# 📝 Handoff Notes - Sistema Jurídico Backend

Este archivo es para comunicación asíncrona entre desarrolladores de diferentes turnos.

## 📌 Instrucciones de Uso

Al **FINALIZAR** tu turno:
1. Copia el template de abajo
2. Llena con tus avances del día
3. Haz commit de este archivo junto con tu código
4. Haz push

Al **INICIAR** tu turno:
1. Haz git pull
2. Lee las notas del turno anterior
3. Verifica la sección "Siguiente turno debe"

---

## Template de Notas

### [FECHA] - [NOMBRE] - [HORARIO]

#### ✅ Completado hoy:
- 

#### 🚧 En progreso:
- 

#### ⚠️ Bloqueadores/Issues:
- 

#### 📍 Siguiente turno debe:
- 

#### 💬 Notas adicionales:
- 

---

## 📅 Historial de Handoffs

<!-- Las notas más recientes van arriba -->

### 12 Enero 2026 - [Nombre] - [10:00-14:00]

#### ✅ Completado hoy:
- Primera entrada después de preparación

#### 🚧 En progreso:
- N/A

#### ⚠️ Bloqueadores/Issues:
- Ninguno

#### 📍 Siguiente turno debe:
- Verificar que el proyecto arranca correctamente
- Comenzar con TASK-001

#### 💬 Notas adicionales:
- Proyecto preparado y listo para desarrollo
- Base de datos creada
- Swagger accesible en /swagger-ui.html

EOF
```

---

### 1️⃣1️⃣ Preparar Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Ejecutar comandos SQL
CREATE DATABASE juridico_db;
CREATE USER juridico_user WITH PASSWORD 'juridico_pass';
GRANT ALL PRIVILEGES ON DATABASE juridico_db TO juridico_user;

# Salir
\q

# Importar schema inicial (ajusta la ruta)
psql -U postgres -d juridico_db -f ~/juridico/base.sql
```

---

### 1️⃣2️⃣ Crear carpeta uploads

```bash
cd ~/juridico-springboot
mkdir uploads
touch uploads/.gitkeep
```

---

### 1️⃣3️⃣ Verificar compilación

```bash
# Limpiar y compilar
mvn clean install

# Si hay errores, resolverlos antes de continuar
```

---

### 1️⃣4️⃣ Ejecutar aplicación

```bash
mvn spring-boot:run
```

Verificar que no hay errores en consola.

---

### 1️⃣5️⃣ Verificar endpoints

Abre en el navegador:

- ✅ http://localhost:8080 (debería responder)
- ✅ http://localhost:8080/swagger-ui.html (debería mostrar Swagger UI)
- ✅ http://localhost:8080/api-docs (debería mostrar JSON de API)

---

### 1️⃣6️⃣ Commit y push

```bash
git add .
git commit -m "feat: preparación inicial del proyecto backend

- Actualizar dependencias (Lombok, Swagger, JWT)
- Crear estructura de paquetes
- Eliminar controllers stubs
- Actualizar configuración
- Agregar README y documentación
- Configurar base de datos"

git push origin prep/setup-inicial
```

---

### 1️⃣7️⃣ Crear Pull Request (opcional)

Si prefieres revisión antes de merge:

1. Ve a GitHub
2. Crea Pull Request de `prep/setup-inicial` → `main`
3. Revisa cambios
4. Merge

O directamente:

```bash
git checkout main
git merge prep/setup-inicial
git push origin main
```

---

## ✅ Checklist Final

Antes de informar al equipo que el proyecto está listo:

- [ ] Dependencias actualizadas en pom.xml
- [ ] Estructura de paquetes creada
- [ ] Controllers stubs eliminados
- [ ] application.properties configurado
- [ ] SecurityConfig actualizado con CORS
- [ ] README.md creado
- [ ] HANDOFF-NOTES.md creado
- [ ] .gitignore actualizado
- [ ] Base de datos `juridico_db` creada
- [ ] Proyecto compila sin errores (`mvn clean install`)
- [ ] Proyecto arranca sin errores (`mvn spring-boot:run`)
- [ ] Swagger accesible en http://localhost:8080/swagger-ui.html
- [ ] Cambios commiteados y pusheados
- [ ] Equipo notificado que pueden comenzar

---

## 🎉 ¡Proyecto Listo!

El proyecto ahora está preparado para que el equipo comience a trabajar el **lunes 12 de enero de 2026**.

### Próximos pasos para el equipo:

1. Hacer `git pull` del repositorio actualizado
2. Seguir el README.md para setup local
3. Comenzar con TASK-001 del plan de implementación

---

**Tiempo estimado de esta preparación:** 2-3 horas  
**Estado:** ⏳ Pendiente de ejecución

