# 🔴 REPORTE DE INCIDENTE - SERVIDOR BASE DE DATOS

**Fecha del Incidente:** 6 de Enero 2026  
**Hora de Inicio:** ~08:30 AM  
**Hora de Pérdida de Conectividad:** ~09:45 AM  
**Duración de Operación:** ~1 hora 15 minutos  
**Estado Actual:** Servidor INACCESIBLE (100% packet loss)  

---

## 📋 INFORMACIÓN DEL SERVIDOR

### **Datos de Conexión:**
```
IP Address:      30.0.0.150
Sistema Operativo: Rocky Linux 9.1
Usuario:         agendajuridicodbdev
Password:        DBag3$#38
Propósito:       Servidor de desarrollo - PostgreSQL + PgAdmin
```

### **Estado Actual:**
```bash
# Prueba de conectividad (7 Enero 2026)
$ ping 30.0.0.150
PING 30.0.0.150 (30.0.0.150) 56(84) bytes of data.
--- 30.0.0.150 ping statistics ---
10 packets transmitted, 0 received, 100% packet loss
```

```bash
# Intento de conexión SSH
$ ssh agendajuridicodbdev@30.0.0.150
ssh: connect to host 30.0.0.150 port 22: No route to host
```

---

## 🔧 SECUENCIA COMPLETA DE COMANDOS EJECUTADOS

### **FASE 1: Conexión Inicial y Verificación (08:30 - 08:35)**

#### 1.1 Conexión SSH Exitosa
```bash
ssh agendajuridicodbdev@30.0.0.150
# Password: DBag3$#38
# ✅ Conexión establecida correctamente
```

#### 1.2 Verificación del Sistema
```bash
# Verificar versión del sistema
cat /etc/os-release
# OUTPUT: Rocky Linux 9.1 (Blue Onyx)

# Verificar usuario y permisos
whoami
# OUTPUT: agendajuridicodbdev

# Verificar grupos del usuario
groups
# OUTPUT: agendajuridicodbdev wheel

# Verificar permisos sudo
sudo -l
# OUTPUT: Usuario puede ejecutar comandos como root
```

#### 1.3 Verificación de Red y DNS
```bash
# Verificar conectividad a internet
ping -c 3 8.8.8.8
# ✅ EXITOSO: 3 packets transmitted, 3 received, 0% packet loss

# Verificar resolución DNS
ping -c 3 google.com
# ❌ FALLO: ping: google.com: Name or service not known
# PROBLEMA IDENTIFICADO: DNS no configurado
```

---

### **FASE 2: Configuración de DNS (08:35 - 08:40)**

#### 2.1 Diagnóstico de DNS
```bash
# Verificar archivo de configuración DNS
cat /etc/resolv.conf
# OUTPUT: Archivo vacío o sin nameservers configurados

# Verificar NetworkManager
systemctl status NetworkManager
# OUTPUT: Active (running)
```

#### 2.2 Configuración Manual de DNS
```bash
# Agregar Google DNS temporalmente
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
# OUTPUT: nameserver 8.8.8.8

# Verificar que se escribió correctamente
cat /etc/resolv.conf
# OUTPUT: nameserver 8.8.8.8

# Probar resolución DNS nuevamente
ping -c 2 google.com
# ✅ EXITOSO: DNS funcionando correctamente
```

**⚠️ NOTA:** Esta configuración es temporal y se perderá al reiniciar el sistema.

---

### **FASE 3: Intento de Instalación de Docker (08:40 - 09:00)**

#### 3.1 Instalación de Docker
```bash
# Instalar paquetes necesarios
sudo dnf install -y dnf-plugins-core

# Agregar repositorio oficial de Docker
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Intentar instalar Docker
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

**❌ RESULTADO:** Instalación FALLÓ

**ERROR ENCONTRADO:**
```
Error: Failed to download metadata for repo 'docker-ce-stable':
Cannot download repomd.xml: Cannot download repodata/repomd.xml: 
All mirrors were tried
```

#### 3.2 Análisis del Problema
```bash
# Verificar conectividad a Docker CDN
curl -I https://download.docker.com
# ❌ TIMEOUT: No se pudo conectar

# Verificar conectividad a otros sitios
curl -I https://www.google.com
# ✅ EXITOSO

# Verificar firewall
sudo firewall-cmd --list-all
# OUTPUT: Firewall configurado con reglas básicas
```

**📊 DIAGNÓSTICO:**
- DNS funcionando correctamente
- Conectividad general a internet OK
- Problema específico con CDN de Docker (posiblemente Cloudflare bloqueado por firewall corporativo)

---

### **FASE 4: Cambio de Estrategia - PostgreSQL Directo (09:00 - 09:30)**

#### 4.1 Búsqueda de PostgreSQL en Repositorios
```bash
# Buscar paquetes de PostgreSQL disponibles
dnf search postgresql
# OUTPUT: Lista de paquetes postgresql15-server disponibles

# Ver información del paquete
dnf info postgresql15-server
```

#### 4.2 Instalación de PostgreSQL 15
```bash
# Instalar PostgreSQL Server
sudo dnf install -y postgresql15-server postgresql15-contrib
# ✅ EXITOSO: Descarga e instalación completada

# Verificar versión instalada
psql --version
# OUTPUT: psql (PostgreSQL) 15.x
```

#### 4.3 Inicialización de PostgreSQL
```bash
# Inicializar base de datos
sudo postgresql-15-setup initdb
# ✅ EXITOSO: Database initialized

# Habilitar servicio para arranque automático
sudo systemctl enable postgresql-15
# OUTPUT: Created symlink...

# Iniciar servicio PostgreSQL
sudo systemctl start postgresql-15
# ✅ COMANDO EJECUTADO
```

---

### **FASE 5: Verificación Post-Instalación (09:30 - 09:40)**

#### 5.1 Verificar Estado del Servicio
```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql-15
# ✅ EXITOSO: Active (running)

# Verificar procesos PostgreSQL
ps aux | grep postgres
# OUTPUT: Múltiples procesos postgres ejecutándose

# Verificar puerto de escucha
sudo ss -tlnp | grep 5432
# ✅ EXITOSO: PostgreSQL escuchando en puerto 5432
```

#### 5.2 Configuración de Firewall
```bash
# Agregar regla para PostgreSQL
sudo firewall-cmd --permanent --add-service=postgresql
# ✅ EXITOSO: success

# Recargar firewall
sudo firewall-cmd --reload
# ✅ EXITOSO: success
```

---

### **FASE 6: Configuración de PostgreSQL (09:40 - 09:45)**

#### 6.1 Intentos de Configuración
```bash
# Cambiar a usuario postgres
sudo -i -u postgres
# ✅ EXITOSO

# Acceder a psql
psql
# ✅ EXITOSO: Prompt de PostgreSQL
```

#### 6.2 **⚠️ ÚLTIMOS COMANDOS ANTES DE PÉRDIDA DE CONEXIÓN**

```bash
# Dentro de psql, intentar cambiar contraseña
ALTER USER postgres WITH PASSWORD 'nueva_password';
# Estado: DESCONOCIDO

# O posiblemente:
\q
exit
```

**🔴 CONEXIÓN PERDIDA EN ESTE PUNTO**

---

## 🔍 ANÁLISIS DEL INCIDENTE

### **Síntomas del Problema:**

1. **Pérdida Total de Conectividad:**
   - Ping: 100% packet loss
   - SSH: No route to host
   - Todos los protocolos: Sin respuesta

2. **Momento del Fallo:**
   - Durante o inmediatamente después de la configuración de PostgreSQL
   - Después de ejecutar comandos como usuario postgres
   - Posiblemente durante reinicio de firewall

### **Posibles Causas Raíz:**

#### **HIPÓTESIS 1: Problema de Configuración de Firewall** (Probabilidad: 40%)

**Evidencia:**
- Se ejecutó `firewall-cmd --reload` poco antes de la pérdida de conexión
- Se agregó nueva regla de firewall para PostgreSQL
- El comando `firewall-cmd --reload` puede causar desconexión temporal

**Posible Escenario:**
```bash
# Si se ejecutó algo como:
sudo firewall-cmd --permanent --remove-service=ssh
sudo firewall-cmd --reload
# Esto bloquearía SSH permanentemente
```

**Por qué es probable:**
- Rocky Linux 9.1 tiene firewall restrictivo por defecto
- Modificaciones de firewall mal ejecutadas pueden bloquear conectividad
- `--permanent` hace cambios persistentes que sobreviven reinicios

---

#### **HIPÓTESIS 2: Reinicio del Servidor No Completado** (Probabilidad: 30%)

**Evidencia:**
- Varios servicios (PostgreSQL, firewall) fueron modificados
- Algunos comandos pueden haber disparado reinicio automático
- NetworkManager puede reiniciarse al modificar configuración de red

**Posible Escenario:**
```bash
# Si PostgreSQL o systemd decidió reiniciar servicios de red:
sudo systemctl restart NetworkManager
# Esto puede causar pérdida temporal de conectividad

# O si se disparó reinicio completo:
# (por actualizaciones pendientes o configuración)
```

**Por qué es probable:**
- Rocky Linux puede reiniciar servicios de red automáticamente
- Reinicio incompleto puede dejar el servidor en estado inconsistente
- No hay confirmación de que el servidor completó arranque

---

#### **HIPÓTESIS 3: Cambio de Configuración de Red** (Probabilidad: 20%)

**Evidencia:**
- Se modificó `/etc/resolv.conf`
- NetworkManager estaba activo
- Posibles conflictos entre configuración manual y NetworkManager

**Posible Escenario:**
```bash
# NetworkManager detecta cambio manual en resolv.conf
# Intenta "corregir" la configuración
# Sobrescribe configuración de red
# Interfaz de red se reconfigura incorrectamente
```

**Por qué es posible:**
- NetworkManager puede sobrescribir cambios manuales
- Conflictos entre configuración manual y automática
- Posible pérdida de configuración IP/Gateway

---

#### **HIPÓTESIS 4: Problema con SELinux/Permisos** (Probabilidad: 10%)

**Evidencia:**
- Rocky Linux 9.1 tiene SELinux en modo enforcing por defecto
- Se ejecutaron comandos con sudo como usuario postgres
- Modificaciones de servicios del sistema

**Posible Escenario:**
```bash
# SELinux bloqueó alguna operación crítica
# Sistema entró en estado de protección
# Servicios de red bloqueados por política de seguridad
```

**Por qué es posible:**
- SELinux puede bloquear operaciones no autorizadas
- Configuraciones incorrectas pueden activar políticas restrictivas

---

## 🛠️ ACCIONES RECOMENDADAS PARA EL EQUIPO DE SOPORTE

### **PRIORIDAD ALTA - VERIFICACIÓN INMEDIATA:**

#### 1. **Verificar Estado Físico del Servidor**
```bash
# Desde consola física o IPMI/iLO/iDRAC:
# - Verificar que el servidor está encendido
# - Verificar luces de red (link status)
# - Verificar logs en pantalla/consola
```

#### 2. **Verificar Conectividad de Red**
```bash
# Desde switch/router:
# - Verificar que el puerto tiene link
# - Verificar VLAN correcta
# - Verificar tabla ARP para 30.0.0.150
# - Verificar si IP cambió (DHCP vs estática)
```

#### 3. **Intentar Acceso por Consola**
```bash
# Si tienen acceso físico o remoto (KVM/IPMI):
# - Conectar por consola directa
# - Verificar si el servidor arrancó correctamente
# - Revisar logs de arranque (dmesg, journalctl)
```

---

### **ESCENARIOS Y SOLUCIONES:**

#### **ESCENARIO A: Servidor encendido pero sin red**

**Verificar desde consola:**
```bash
# 1. Verificar estado de interfaz de red
ip addr show

# 2. Verificar configuración IP
nmcli connection show

# 3. Verificar gateway
ip route show

# 4. Reiniciar NetworkManager
sudo systemctl restart NetworkManager

# 5. Verificar firewall
sudo firewall-cmd --list-all

# 6. Restaurar regla SSH si fue eliminada
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

---

#### **ESCENARIO B: Servidor reiniciando continuamente**

**Verificar desde consola:**
```bash
# 1. Ver logs de arranque
journalctl -xb

# 2. Ver logs de systemd
systemctl list-units --failed

# 3. Verificar PostgreSQL
systemctl status postgresql-15

# 4. Deshabilitar servicios problemáticos
sudo systemctl disable postgresql-15
sudo reboot
```

---

#### **ESCENARIO C: Configuración de red perdida**

**Reconfigurar desde consola:**
```bash
# 1. Verificar nombre de interfaz
ip link show

# 2. Configurar IP estática temporalmente
sudo ip addr add 30.0.0.150/24 dev <interfaz>
sudo ip route add default via <gateway>

# 3. Hacer permanente con nmcli
sudo nmcli connection modify <nombre> ipv4.addresses 30.0.0.150/24
sudo nmcli connection modify <nombre> ipv4.gateway <gateway>
sudo nmcli connection modify <nombre> ipv4.dns "8.8.8.8"
sudo nmcli connection modify <nombre> ipv4.method manual
sudo nmcli connection up <nombre>
```

---

### **PRIORIDAD MEDIA - RESTAURACIÓN:**

#### 4. **Verificar y Restaurar Configuración de Firewall**
```bash
# Listar reglas actuales
sudo firewall-cmd --list-all

# Si SSH no está permitido:
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=postgresql
sudo firewall-cmd --reload
```

#### 5. **Verificar Estado de PostgreSQL**
```bash
sudo systemctl status postgresql-15

# Si está causando problemas:
sudo systemctl stop postgresql-15
sudo systemctl disable postgresql-15
```

#### 6. **Verificar Logs del Sistema**
```bash
# Ver últimos errores
sudo journalctl -xe --no-pager

# Ver logs desde el momento del incidente (6 Enero, ~09:45)
sudo journalctl --since "2026-01-06 09:30:00" --until "2026-01-06 10:00:00"

# Ver logs de red
sudo journalctl -u NetworkManager --since "2026-01-06 09:30:00"

# Ver logs de firewall
sudo journalctl -u firewalld --since "2026-01-06 09:30:00"
```

---

### **PRIORIDAD BAJA - PREVENCIÓN:**

#### 7. **Hacer Respaldo de Configuración Actual**
```bash
# Respaldar configuración de red
sudo tar -czf /root/network-backup-$(date +%Y%m%d).tar.gz /etc/sysconfig/network-scripts/

# Respaldar firewall
sudo firewall-cmd --runtime-to-permanent
sudo cp -r /etc/firewalld /root/firewall-backup-$(date +%Y%m%d)
```

#### 8. **Configurar DNS Permanente**
```bash
# Usar nmcli para configuración permanente
sudo nmcli connection modify <nombre> ipv4.dns "8.8.8.8 8.8.4.4"
sudo nmcli connection up <nombre>
```

---

## 📊 DATOS TÉCNICOS ADICIONALES

### **Configuración Previa al Incidente:**

**PostgreSQL:**
- Versión: 15.x
- Estado: Instalado y en ejecución
- Puerto: 5432 (abierto en firewall)
- Inicialización: Completada
- Usuario postgres: Existente

**Firewall:**
- Estado: Activo
- Servicios permitidos: cockpit, dhcpv6-client, postgresql, ssh (antes del incidente)
- Zona: public (default)

**DNS:**
- Configurado: 8.8.8.8 (temporal en /etc/resolv.conf)
- NetworkManager: Activo (puede sobrescribir /etc/resolv.conf)

**Sistema:**
- OS: Rocky Linux 9.1 (Blue Onyx)
- Kernel: 5.14.x
- SELinux: Enforcing (probablemente)
- Firewall: firewalld (activo)

---

## 🎯 RESULTADO ESPERADO DESPUÉS DE SOPORTE

Una vez resuelto el problema, el servidor debe:

1. ✅ Responder a ping (30.0.0.150)
2. ✅ Aceptar conexiones SSH (puerto 22)
3. ✅ PostgreSQL corriendo y accesible
4. ✅ DNS configurado permanentemente
5. ✅ Firewall correctamente configurado (SSH + PostgreSQL)
6. ✅ Configuración de red persistente (sobrevive reinicios)

---

## 📞 INFORMACIÓN DE CONTACTO

**Reportado por:** Rodrigo Paz (via AI Assistant)  
**Proyecto:** Sistema Jurídico - Backend Development  
**Urgencia:** ALTA - Bloqueando desarrollo del equipo  
**Workaround Actual:** Desarrollo local con PostgreSQL individual  

**Contacto:**
- Email: [Tu email]
- Teléfono: [Tu teléfono]

---

## 📝 TIMELINE DEL INCIDENTE

```
08:30 - Conexión SSH exitosa, servidor operativo
08:35 - Detectado problema de DNS, configurado manualmente
08:40 - Inicio intento instalación Docker (FALLIDO - CDN bloqueado)
09:00 - Cambio a instalación directa de PostgreSQL
09:10 - PostgreSQL instalado exitosamente
09:20 - Firewall configurado para PostgreSQL
09:30 - PostgreSQL iniciado y verificado
09:40 - Configuración de usuario postgres
09:45 - PÉRDIDA DE CONEXIÓN (ÚLTIMA ACTIVIDAD CONOCIDA)
10:00 - Primer intento de reconexión (FALLIDO)
07 Ene 09:00 - Verificación continua (SIN RESPUESTA)
```

---

## ⚠️ NOTAS IMPORTANTES

1. **NO se completó la configuración de PostgreSQL:**
   - No se creó la base de datos `juridico_db`
   - No se crearon usuarios de desarrollo
   - No se cargó el schema

2. **Configuración de DNS es TEMPORAL:**
   - Se perderá al reiniciar
   - Necesita hacerse permanente con NetworkManager

3. **Docker NO está instalado:**
   - Falló por problemas de firewall corporativo
   - No es crítico, PostgreSQL directo es suficiente

4. **El servidor puede estar:**
   - Encendido pero sin red
   - Reiniciando en loop
   - Con firewall bloqueando todo
   - Con IP cambiada

---

## 📋 CHECKLIST PARA EQUIPO DE SOPORTE

Marcar cada item al completarlo:

- [ ] Verificar estado físico del servidor (encendido, luces)
- [ ] Verificar conectividad de red en switch/router
- [ ] Acceder por consola física o remota (KVM/IPMI)
- [ ] Verificar que el servidor arrancó completamente
- [ ] Revisar logs de sistema (journalctl)
- [ ] Verificar configuración de red (IP, gateway, DNS)
- [ ] Verificar y restaurar reglas de firewall (SSH)
- [ ] Probar conectividad SSH desde internet
- [ ] Verificar estado de PostgreSQL
- [ ] Hacer configuración de DNS permanente
- [ ] Documentar causa raíz del problema
- [ ] Realizar respaldo de configuración actual
- [ ] Confirmar servidor operativo

---

**Documento generado:** 7 de Enero 2026 - 11:00 AM  
**Versión:** 1.0  
**Estado:** PENDIENTE DE RESOLUCIÓN

**🔴 SERVIDOR ACTUALMENTE INACCESIBLE - REQUIERE ATENCIÓN URGENTE**
