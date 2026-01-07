# 🚀 SETUP SERVIDOR DE DESARROLLO - SISTEMA JURÍDICO GOB.MX V3

**Fecha:** 6 de enero de 2026  
**Versión:** 1.0  
**Propósito:** Configurar servidor Linux con Docker, PostgreSQL y PgAdmin para desarrollo

---

## 📋 INFORMACIÓN DEL SERVIDOR

```
IP: 30.0.0.150
Usuario: agendajuridicodbdev
Password: DBag3$#38
OS: Linux
```

---

## 🎯 OBJETIVO

Configurar un entorno de desarrollo con:
- ✅ Docker y Docker Compose instalados
- ✅ PostgreSQL 15 en contenedor
- ✅ PgAdmin 4 en contenedor
- ✅ 4 usuarios de base de datos (Rodrigo-Admin, Ramses, Ricardo, Aurora)
- ✅ 5 bases de datos (1 principal + 4 de pruebas)
- ✅ Acceso seguro para cada desarrollador

---

## 🔧 INSTRUCCIONES PARA LA IA

**IMPORTANTE:** Ejecuta estos comandos en orden secuencial. Verifica cada paso antes de continuar.

---

## PASO 1: VERIFICAR SISTEMA Y ACTUALIZAR

```bash
# Verificar sistema operativo
cat /etc/os-release

# Actualizar paquetes del sistema
sudo apt update && sudo apt upgrade -y

# Instalar utilidades necesarias
sudo apt install -y curl wget git nano net-tools
```

**Verificación:**
```bash
# Debe mostrar la versión de Ubuntu/Debian
lsb_release -a
```

---

## PASO 2: INSTALAR DOCKER

```bash
# Remover versiones antiguas de Docker (si existen)
sudo apt remove -y docker docker-engine docker.io containerd runc

# Instalar dependencias
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Agregar clave GPG oficial de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Configurar repositorio de Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Actualizar índice de paquetes
sudo apt update

# Instalar Docker Engine, containerd y Docker Compose
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Agregar usuario actual al grupo docker (evitar usar sudo)
sudo usermod -aG docker $USER

# Aplicar cambios de grupo (o hacer logout/login)
newgrp docker
```

**Verificación:**
```bash
# Verificar versión de Docker (debe mostrar 24.x o superior)
docker --version

# Verificar Docker Compose (debe mostrar 2.x)
docker compose version

# Probar Docker sin sudo
docker run hello-world
```

---

## PASO 3: CREAR ESTRUCTURA DE DIRECTORIOS

```bash
# Crear directorio del proyecto
mkdir -p ~/juridico-dev
cd ~/juridico-dev

# Crear subdirectorios
mkdir -p postgres-data
mkdir -p pgadmin-data
mkdir -p backups
mkdir -p scripts

# Establecer permisos
chmod -R 755 ~/juridico-dev
sudo chown -R 5050:5050 ~/juridico-dev/pgadmin-data
```

**Verificación:**
```bash
# Verificar estructura
tree -L 2 ~/juridico-dev
# O si tree no está instalado:
ls -la ~/juridico-dev
```

---

## PASO 4: CREAR DOCKER COMPOSE FILE

```bash
# Crear archivo docker-compose.yml
cat > ~/juridico-dev/docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: juridico-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: JuridicoPostgres2026!
      POSTGRES_DB: postgres
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
      - ./scripts:/docker-entrypoint-initdb.d
    networks:
      - juridico-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: juridico-pgadmin
    restart: always
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@juridico.gob.mx
      PGADMIN_DEFAULT_PASSWORD: PgAdmin2026!
      PGADMIN_CONFIG_SERVER_MODE: 'False'
      PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED: 'False'
    ports:
      - "5050:80"
    volumes:
      - ./pgadmin-data:/var/lib/pgadmin
    networks:
      - juridico-network
    depends_on:
      postgres:
        condition: service_healthy

networks:
  juridico-network:
    driver: bridge

volumes:
  postgres-data:
  pgadmin-data:
EOF

echo "✅ Archivo docker-compose.yml creado"
```

**Verificación:**
```bash
# Verificar contenido del archivo
cat ~/juridico-dev/docker-compose.yml
```

---

## PASO 5: CREAR SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS

```bash
# Crear script SQL de inicialización
cat > ~/juridico-dev/scripts/01-init-databases.sql << 'EOF'
-- =====================================================
-- SCRIPT DE INICIALIZACIÓN - SISTEMA JURÍDICO DEV
-- =====================================================
-- Fecha: 6 de enero de 2026
-- Propósito: Crear usuarios y bases de datos de desarrollo
-- =====================================================

-- Conectar como superusuario postgres
\c postgres

-- =====================================================
-- CREAR ROLES/USUARIOS
-- =====================================================

-- 1. Usuario Administrador (Rodrigo)
DROP USER IF EXISTS rodrigo_admin;
CREATE USER rodrigo_admin WITH 
    PASSWORD 'Rodrigo2026!Admin' 
    CREATEDB 
    CREATEROLE 
    LOGIN;

-- 2. Usuario Ramses (Senior Developer)
DROP USER IF EXISTS ramses_dev;
CREATE USER ramses_dev WITH 
    PASSWORD 'Ramses2026!Dev' 
    CREATEDB 
    LOGIN;

-- 3. Usuario Ricardo (Mid-Senior Developer)
DROP USER IF EXISTS ricardo_dev;
CREATE USER ricardo_dev WITH 
    PASSWORD 'Ricardo2026!Dev' 
    CREATEDB 
    LOGIN;

-- 4. Usuario Aurora (Junior Developer)
DROP USER IF EXISTS aurora_dev;
CREATE USER aurora_dev WITH 
    PASSWORD 'Aurora2026!Dev' 
    LOGIN;

-- =====================================================
-- CREAR BASES DE DATOS
-- =====================================================

-- Base de datos principal del proyecto
DROP DATABASE IF EXISTS juridico_db;
CREATE DATABASE juridico_db 
    OWNER rodrigo_admin 
    ENCODING 'UTF8' 
    LC_COLLATE = 'es_MX.UTF-8' 
    LC_CTYPE = 'es_MX.UTF-8' 
    TEMPLATE template0;

-- Base de datos de pruebas para Rodrigo
DROP DATABASE IF EXISTS juridico_rodrigo_test;
CREATE DATABASE juridico_rodrigo_test 
    OWNER rodrigo_admin 
    ENCODING 'UTF8' 
    LC_COLLATE = 'es_MX.UTF-8' 
    LC_CTYPE = 'es_MX.UTF-8' 
    TEMPLATE template0;

-- Base de datos de pruebas para Ramses
DROP DATABASE IF EXISTS juridico_ramses_test;
CREATE DATABASE juridico_ramses_test 
    OWNER ramses_dev 
    ENCODING 'UTF8' 
    LC_COLLATE = 'es_MX.UTF-8' 
    LC_CTYPE = 'es_MX.UTF-8' 
    TEMPLATE template0;

-- Base de datos de pruebas para Ricardo
DROP DATABASE IF EXISTS juridico_ricardo_test;
CREATE DATABASE juridico_ricardo_test 
    OWNER ricardo_dev 
    ENCODING 'UTF8' 
    LC_COLLATE = 'es_MX.UTF-8' 
    LC_CTYPE = 'es_MX.UTF-8' 
    TEMPLATE template0;

-- Base de datos de pruebas para Aurora
DROP DATABASE IF EXISTS juridico_aurora_test;
CREATE DATABASE juridico_aurora_test 
    OWNER aurora_dev 
    ENCODING 'UTF8' 
    LC_COLLATE = 'es_MX.UTF-8' 
    LC_CTYPE = 'es_MX.UTF-8' 
    TEMPLATE template0;

-- =====================================================
-- OTORGAR PERMISOS
-- =====================================================

-- Rodrigo: Acceso total a todas las bases de datos
GRANT ALL PRIVILEGES ON DATABASE juridico_db TO rodrigo_admin;
GRANT ALL PRIVILEGES ON DATABASE juridico_rodrigo_test TO rodrigo_admin;
GRANT ALL PRIVILEGES ON DATABASE juridico_ramses_test TO rodrigo_admin;
GRANT ALL PRIVILEGES ON DATABASE juridico_ricardo_test TO rodrigo_admin;
GRANT ALL PRIVILEGES ON DATABASE juridico_aurora_test TO rodrigo_admin;

-- Ramses: Acceso a BD principal (lectura/escritura) y su BD de pruebas (total)
GRANT CONNECT ON DATABASE juridico_db TO ramses_dev;
GRANT ALL PRIVILEGES ON DATABASE juridico_ramses_test TO ramses_dev;

-- Ricardo: Acceso a BD principal (lectura/escritura) y su BD de pruebas (total)
GRANT CONNECT ON DATABASE juridico_db TO ricardo_dev;
GRANT ALL PRIVILEGES ON DATABASE juridico_ricardo_test TO ricardo_dev;

-- Aurora: Acceso a BD principal (lectura/escritura) y su BD de pruebas (total)
GRANT CONNECT ON DATABASE juridico_db TO aurora_dev;
GRANT ALL PRIVILEGES ON DATABASE juridico_aurora_test TO aurora_dev;

-- =====================================================
-- CONFIGURAR PERMISOS EN BD PRINCIPAL
-- =====================================================

\c juridico_db

-- Crear schema público con permisos
GRANT ALL ON SCHEMA public TO rodrigo_admin;
GRANT USAGE ON SCHEMA public TO ramses_dev;
GRANT USAGE ON SCHEMA public TO ricardo_dev;
GRANT USAGE ON SCHEMA public TO aurora_dev;

-- Permisos para crear tablas (solo en sus BDs de prueba por defecto)
-- En juridico_db principal, solo rodrigo_admin puede crear tablas inicialmente

-- =====================================================
-- INFORMACIÓN DE VERIFICACIÓN
-- =====================================================

-- Listar usuarios creados
\du

-- Listar bases de datos creadas
\l

-- Mensaje de confirmación
SELECT 'Base de datos inicializada correctamente' AS status;
EOF

echo "✅ Script de inicialización creado"
```

**Verificación:**
```bash
# Verificar contenido del script
cat ~/juridico-dev/scripts/01-init-databases.sql
```

---

## PASO 6: INICIAR CONTENEDORES

```bash
# Ir al directorio del proyecto
cd ~/juridico-dev

# Iniciar contenedores en modo detached
docker compose up -d

# Esperar 30 segundos para que PostgreSQL se inicialice completamente
sleep 30
```

**Verificación:**
```bash
# Ver estado de contenedores (ambos deben estar "Up")
docker compose ps

# Ver logs de PostgreSQL
docker compose logs postgres

# Ver logs de PgAdmin
docker compose logs pgadmin
```

---

## PASO 7: VERIFICAR CONEXIÓN A POSTGRESQL

```bash
# Conectar a PostgreSQL como superusuario
docker exec -it juridico-postgres psql -U postgres

# Dentro de psql, ejecutar:
# \l          (listar bases de datos)
# \du         (listar usuarios)
# \q          (salir)
```

**Comandos de verificación automática:**
```bash
# Verificar que se crearon las 5 bases de datos
docker exec -it juridico-postgres psql -U postgres -c "\l" | grep juridico

# Verificar que se crearon los 4 usuarios
docker exec -it juridico-postgres psql -U postgres -c "\du" | grep -E "rodrigo_admin|ramses_dev|ricardo_dev|aurora_dev"
```

---

## PASO 8: CARGAR ESQUEMA PRINCIPAL EN juridico_db

**IMPORTANTE:** El archivo `database-schema-completo.sql` debe estar en `/home/agendajuridicodbdev/`

```bash
# Copiar esquema SQL al contenedor
docker cp /home/agendajuridicodbdev/database-schema-completo.sql juridico-postgres:/tmp/

# Ejecutar esquema en la base de datos principal
docker exec -it juridico-postgres psql -U rodrigo_admin -d juridico_db -f /tmp/database-schema-completo.sql

# Verificar que se crearon las tablas
docker exec -it juridico-postgres psql -U rodrigo_admin -d juridico_db -c "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"
```

**Resultado esperado:**
```
 table_name
----------------------------
 actividad_expedientes
 audiencias
 audiencias_desahogadas
 comentarios
 documentos_expediente
 eventos_calendario
 expedientes
 gerencias
 materias
 notificaciones
 organos_jurisdiccionales
 recordatorios
 terminos
 terminos_presentados
 tipos_audiencia
 usuarios
(17 rows)
```

---

## PASO 9: CREAR ARCHIVO DE CREDENCIALES

```bash
# Crear archivo con todas las credenciales
cat > ~/juridico-dev/CREDENCIALES.md << 'EOF'
# 🔐 CREDENCIALES - SISTEMA JURÍDICO DEV

**Fecha de creación:** 6 de enero de 2026  
**Servidor:** 30.0.0.150

---

## 🗄️ POSTGRESQL

**Host:** 30.0.0.150  
**Puerto:** 5432  
**Superusuario:** postgres  
**Password Superusuario:** JuridicoPostgres2026!

---

## 👥 USUARIOS DE DESARROLLO

### 1️⃣ Rodrigo (Administrador)
```
Usuario: rodrigo_admin
Password: Rodrigo2026!Admin
Base de datos principal: juridico_db (owner)
Base de datos de pruebas: juridico_rodrigo_test (owner)
Permisos: CREATEDB, CREATEROLE, acceso total a todas las BDs
```

**String de conexión:**
```
postgresql://rodrigo_admin:Rodrigo2026!Admin@30.0.0.150:5432/juridico_db
```

---

### 2️⃣ Ramses (Senior Developer)
```
Usuario: ramses_dev
Password: Ramses2026!Dev
Base de datos principal: juridico_db (lectura/escritura)
Base de datos de pruebas: juridico_ramses_test (owner)
Permisos: CREATEDB, acceso a BD principal y su BD de pruebas
Disponibilidad: 12-20 enero 2026
Horario: 10:00-14:00 (4 horas/día)
```

**String de conexión:**
```
postgresql://ramses_dev:Ramses2026!Dev@30.0.0.150:5432/juridico_ramses_test
```

---

### 3️⃣ Ricardo (Mid-Senior Developer)
```
Usuario: ricardo_dev
Password: Ricardo2026!Dev
Base de datos principal: juridico_db (lectura/escritura)
Base de datos de pruebas: juridico_ricardo_test (owner)
Permisos: CREATEDB, acceso a BD principal y su BD de pruebas
Disponibilidad: Todo el proyecto
Horario: 14:00-18:00 (4 horas/día)
```

**String de conexión:**
```
postgresql://ricardo_dev:Ricardo2026!Dev@30.0.0.150:5432/juridico_ricardo_test
```

---

### 4️⃣ Aurora (Junior Developer)
```
Usuario: aurora_dev
Password: Aurora2026!Dev
Base de datos principal: juridico_db (lectura/escritura)
Base de datos de pruebas: juridico_aurora_test (owner)
Permisos: Acceso a BD principal y su BD de pruebas
Disponibilidad: Todo el proyecto
Horario: 11:00-15:00 (4 horas/día)
```

**String de conexión:**
```
postgresql://aurora_dev:Aurora2026!Dev@30.0.0.150:5432/juridico_aurora_test
```

---

## 🌐 PGADMIN 4

**URL:** http://30.0.0.150:5050  
**Email:** admin@juridico.gob.mx  
**Password:** PgAdmin2026!

**Nota:** PgAdmin está configurado en modo standalone (SERVER_MODE='False')

---

## 📊 BASES DE DATOS CREADAS

| Base de Datos | Owner | Propósito | Encoding |
|---------------|-------|-----------|----------|
| juridico_db | rodrigo_admin | Base de datos principal (17 tablas) | UTF8 |
| juridico_rodrigo_test | rodrigo_admin | Pruebas de Rodrigo | UTF8 |
| juridico_ramses_test | ramses_dev | Pruebas de Ramses | UTF8 |
| juridico_ricardo_test | ricardo_dev | Pruebas de Ricardo | UTF8 |
| juridico_aurora_test | aurora_dev | Pruebas de Aurora | UTF8 |

---

## 🔧 CONEXIÓN DESDE SPRING BOOT

### application.properties (Rodrigo - BD Principal)
```properties
spring.datasource.url=jdbc:postgresql://30.0.0.150:5432/juridico_db
spring.datasource.username=rodrigo_admin
spring.datasource.password=Rodrigo2026!Admin
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### application.properties (Ramses - BD Pruebas)
```properties
spring.datasource.url=jdbc:postgresql://30.0.0.150:5432/juridico_ramses_test
spring.datasource.username=ramses_dev
spring.datasource.password=Ramses2026!Dev
spring.jpa.hibernate.ddl-auto=create-drop
```

### application.properties (Ricardo - BD Pruebas)
```properties
spring.datasource.url=jdbc:postgresql://30.0.0.150:5432/juridico_ricardo_test
spring.datasource.username=ricardo_dev
spring.datasource.password=Ricardo2026!Dev
spring.jpa.hibernate.ddl-auto=create-drop
```

### application.properties (Aurora - BD Pruebas)
```properties
spring.datasource.url=jdbc:postgresql://30.0.0.150:5432/juridico_aurora_test
spring.datasource.username=aurora_dev
spring.datasource.password=Aurora2026!Dev
spring.jpa.hibernate.ddl-auto=create-drop
```

---

## 🐳 COMANDOS DOCKER ÚTILES

```bash
# Ver estado de contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Reiniciar contenedores
docker compose restart

# Detener contenedores
docker compose stop

# Iniciar contenedores
docker compose start

# Detener y eliminar contenedores (mantiene datos)
docker compose down

# Detener y eliminar contenedores + volúmenes (BORRA DATOS)
docker compose down -v

# Entrar al contenedor de PostgreSQL
docker exec -it juridico-postgres bash

# Conectar a psql como superusuario
docker exec -it juridico-postgres psql -U postgres

# Conectar a psql como rodrigo_admin
docker exec -it juridico-postgres psql -U rodrigo_admin -d juridico_db
```

---

## 📦 BACKUP Y RESTORE

### Backup de una base de datos
```bash
# Backup de juridico_db
docker exec juridico-postgres pg_dump -U rodrigo_admin juridico_db > ~/juridico-dev/backups/juridico_db_$(date +%Y%m%d_%H%M%S).sql

# Backup de todas las bases de datos
docker exec juridico-postgres pg_dumpall -U postgres > ~/juridico-dev/backups/all_databases_$(date +%Y%m%d_%H%M%S).sql
```

### Restore de una base de datos
```bash
# Restore de juridico_db
cat ~/juridico-dev/backups/juridico_db_20260106.sql | docker exec -i juridico-postgres psql -U rodrigo_admin -d juridico_db
```

---

## ⚠️ NOTAS DE SEGURIDAD

1. **Cambiar passwords en producción:** Las contraseñas actuales son para desarrollo únicamente
2. **Firewall:** Asegurarse de que solo las IPs del equipo puedan acceder al puerto 5432
3. **SSL:** En producción, habilitar SSL para conexiones a PostgreSQL
4. **Backups:** Configurar backups automáticos diarios

---

## 📞 SOPORTE

**Documentos relacionados:**
- database-schema-completo.sql - Esquema SQL completo
- ANALISIS-BASE-DE-DATOS.md - Documentación técnica
- PLAN-IMPLEMENTACION-BACKEND.md - Plan de desarrollo

---

**Creado:** 6 de enero de 2026  
**Última actualización:** 6 de enero de 2026
EOF

echo "✅ Archivo de credenciales creado"
```

---

## PASO 10: VERIFICACIÓN FINAL COMPLETA

```bash
# Ejecutar script de verificación completo
cat > ~/juridico-dev/verificar-setup.sh << 'EOF'
#!/bin/bash

echo "========================================"
echo "VERIFICACIÓN DEL SETUP - SISTEMA JURÍDICO"
echo "========================================"
echo ""

# 1. Verificar Docker
echo "1️⃣ Verificando Docker..."
docker --version
docker compose version
echo ""

# 2. Verificar contenedores
echo "2️⃣ Verificando contenedores..."
docker compose ps
echo ""

# 3. Verificar bases de datos
echo "3️⃣ Verificando bases de datos..."
docker exec -it juridico-postgres psql -U postgres -c "\l" | grep juridico
echo ""

# 4. Verificar usuarios
echo "4️⃣ Verificando usuarios..."
docker exec -it juridico-postgres psql -U postgres -c "\du" | grep -E "rodrigo_admin|ramses_dev|ricardo_dev|aurora_dev"
echo ""

# 5. Verificar tablas en juridico_db
echo "5️⃣ Verificando tablas en juridico_db..."
TABLA_COUNT=$(docker exec -it juridico-postgres psql -U rodrigo_admin -d juridico_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
echo "Total de tablas en juridico_db: $TABLA_COUNT"
echo "Esperado: 17 tablas"
echo ""

# 6. Verificar vistas
echo "6️⃣ Verificando vistas..."
VISTA_COUNT=$(docker exec -it juridico-postgres psql -U rodrigo_admin -d juridico_db -t -c "SELECT COUNT(*) FROM information_schema.views WHERE table_schema='public';")
echo "Total de vistas en juridico_db: $VISTA_COUNT"
echo "Esperado: 3 vistas"
echo ""

# 7. Verificar datos iniciales
echo "7️⃣ Verificando datos iniciales..."
echo "Gerencias:"
docker exec -it juridico-postgres psql -U rodrigo_admin -d juridico_db -c "SELECT COUNT(*) as total FROM gerencias;"
echo "Materias:"
docker exec -it juridico-postgres psql -U rodrigo_admin -d juridico_db -c "SELECT COUNT(*) as total FROM materias;"
echo "Usuario admin:"
docker exec -it juridico-postgres psql -U rodrigo_admin -d juridico_db -c "SELECT email, rol FROM usuarios WHERE email='admin@juridico.gob.mx';"
echo ""

# 8. Verificar acceso a PgAdmin
echo "8️⃣ Verificando PgAdmin..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:5050
echo " - PgAdmin responde en puerto 5050"
echo ""

echo "========================================"
echo "✅ VERIFICACIÓN COMPLETADA"
echo "========================================"
echo ""
echo "🔗 URLs de acceso:"
echo "   PostgreSQL: 30.0.0.150:5432"
echo "   PgAdmin: http://30.0.0.150:5050"
echo ""
echo "📄 Ver credenciales completas en:"
echo "   ~/juridico-dev/CREDENCIALES.md"
EOF

chmod +x ~/juridico-dev/verificar-setup.sh

# Ejecutar verificación
~/juridico-dev/verificar-setup.sh
```

---

## PASO 11: CREAR SCRIPT DE GESTIÓN

```bash
# Crear script de gestión del entorno
cat > ~/juridico-dev/manage.sh << 'EOF'
#!/bin/bash

case "$1" in
  start)
    echo "🚀 Iniciando contenedores..."
    cd ~/juridico-dev && docker compose start
    ;;
  stop)
    echo "🛑 Deteniendo contenedores..."
    cd ~/juridico-dev && docker compose stop
    ;;
  restart)
    echo "🔄 Reiniciando contenedores..."
    cd ~/juridico-dev && docker compose restart
    ;;
  status)
    echo "📊 Estado de contenedores:"
    cd ~/juridico-dev && docker compose ps
    ;;
  logs)
    echo "📋 Logs de contenedores:"
    cd ~/juridico-dev && docker compose logs -f
    ;;
  backup)
    echo "💾 Creando backup..."
    FECHA=$(date +%Y%m%d_%H%M%S)
    docker exec juridico-postgres pg_dumpall -U postgres > ~/juridico-dev/backups/backup_$FECHA.sql
    echo "✅ Backup creado: backups/backup_$FECHA.sql"
    ;;
  verify)
    echo "🔍 Verificando setup..."
    ~/juridico-dev/verificar-setup.sh
    ;;
  *)
    echo "Uso: $0 {start|stop|restart|status|logs|backup|verify}"
    exit 1
    ;;
esac
EOF

chmod +x ~/juridico-dev/manage.sh

echo "✅ Script de gestión creado"
echo ""
echo "Uso: ~/juridico-dev/manage.sh {start|stop|restart|status|logs|backup|verify}"
```

---

## 📋 CHECKLIST FINAL PARA LA IA

Marca cada item después de completarlo:

- [ ] **Paso 1:** Sistema actualizado y utilidades instaladas
- [ ] **Paso 2:** Docker y Docker Compose instalados correctamente
- [ ] **Paso 3:** Estructura de directorios creada
- [ ] **Paso 4:** docker-compose.yml creado
- [ ] **Paso 5:** Script de inicialización SQL creado
- [ ] **Paso 6:** Contenedores iniciados correctamente
- [ ] **Paso 7:** Conexión a PostgreSQL verificada
- [ ] **Paso 8:** Esquema principal cargado en juridico_db (17 tablas)
- [ ] **Paso 9:** Archivo de credenciales creado
- [ ] **Paso 10:** Verificación final ejecutada exitosamente
- [ ] **Paso 11:** Scripts de gestión creados

---

## ✅ RESULTADO ESPERADO

Al finalizar todos los pasos, debes tener:

```
✅ Docker instalado y funcionando
✅ 2 contenedores corriendo:
   - juridico-postgres (PostgreSQL 15)
   - juridico-pgadmin (PgAdmin 4)
✅ 5 bases de datos creadas:
   - juridico_db (principal con 17 tablas)
   - juridico_rodrigo_test (vacía)
   - juridico_ramses_test (vacía)
   - juridico_ricardo_test (vacía)
   - juridico_aurora_test (vacía)
✅ 4 usuarios creados:
   - rodrigo_admin (admin)
   - ramses_dev (developer)
   - ricardo_dev (developer)
   - aurora_dev (developer)
✅ PgAdmin accesible en http://30.0.0.150:5050
✅ PostgreSQL accesible en 30.0.0.150:5432
```

---

## 🔧 COMANDOS RÁPIDOS POST-SETUP

```bash
# Ver estado
~/juridico-dev/manage.sh status

# Ver logs
~/juridico-dev/manage.sh logs

# Reiniciar servicios
~/juridico-dev/manage.sh restart

# Crear backup
~/juridico-dev/manage.sh backup

# Verificar setup
~/juridico-dev/manage.sh verify

# Conectar a psql como Rodrigo
docker exec -it juridico-postgres psql -U rodrigo_admin -d juridico_db

# Ver todas las tablas
docker exec -it juridico-postgres psql -U rodrigo_admin -d juridico_db -c "\dt"

# Ver todas las bases de datos
docker exec -it juridico-postgres psql -U postgres -c "\l"
```

---

## 📞 INFORMACIÓN DE CONTACTO Y SIGUIENTE PASO

Una vez completado este setup, notificar a Rodrigo que:

1. ✅ Servidor de desarrollo configurado correctamente
2. ✅ PostgreSQL 15 con 5 bases de datos listo
3. ✅ PgAdmin accesible para administración visual
4. ✅ 4 usuarios creados con sus respectivas bases de datos de prueba
5. ✅ Esquema principal (17 tablas) cargado en juridico_db

**Credenciales disponibles en:** `~/juridico-dev/CREDENCIALES.md`

**Siguiente paso:** Iniciar Phase 0 del PLAN-IMPLEMENTACION-BACKEND.md

---

## 🚨 TROUBLESHOOTING

### Problema: Contenedores no inician
```bash
# Ver logs detallados
docker compose logs

# Verificar puertos en uso
sudo netstat -tlnp | grep -E '5432|5050'

# Reiniciar Docker
sudo systemctl restart docker
```

### Problema: No se puede conectar a PostgreSQL
```bash
# Verificar que el contenedor está corriendo
docker ps | grep postgres

# Verificar logs de PostgreSQL
docker compose logs postgres

# Probar conexión desde el host
psql -h 30.0.0.150 -U postgres -d postgres
```

### Problema: PgAdmin no carga
```bash
# Verificar logs de PgAdmin
docker compose logs pgadmin

# Verificar permisos de directorio
sudo chown -R 5050:5050 ~/juridico-dev/pgadmin-data

# Reiniciar contenedor
docker compose restart pgadmin
```

### Problema: Esquema SQL no se carga
```bash
# Verificar que el archivo existe
ls -lh /home/agendajuridicodbdev/database-schema-completo.sql

# Verificar permisos
chmod 644 /home/agendajuridicodbdev/database-schema-completo.sql

# Intentar carga manual
docker cp /home/agendajuridicodbdev/database-schema-completo.sql juridico-postgres:/tmp/
docker exec -it juridico-postgres psql -U rodrigo_admin -d juridico_db -f /tmp/database-schema-completo.sql
```

---

**FIN DEL DOCUMENTO MAESTRO**

**Versión:** 1.0  
**Fecha:** 6 de enero de 2026  
**Última revisión:** 6 de enero de 2026
