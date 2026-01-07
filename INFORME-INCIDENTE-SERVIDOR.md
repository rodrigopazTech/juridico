# INFORME DE INCIDENTE - SERVIDOR BASE DE DATOS

**Fecha del Incidente:** 6 de Enero 2026  
**Hora:** 09:45 AM  
**Servidor:** 30.0.0.150 (Rocky Linux 9.1)  
**Estado Actual:** INACCESIBLE  
**Impacto:** Bloqueo de desarrollo del equipo

---

## RESUMEN EJECUTIVO

El servidor de desarrollo de base de datos (30.0.0.150) se encuentra completamente inaccesible desde las 09:45 AM del 6 de enero de 2026. El servidor estaba operativo durante aproximadamente 1 hora y 15 minutos antes de perder toda conectividad. No responde a ping, SSH ni ningún otro protocolo de red (100% packet loss).

## CONTEXTO DEL INCIDENTE

### Actividades Realizadas Antes de la Pérdida de Conexión

**08:30 - 08:40:** Configuración inicial del sistema
- Conexión SSH exitosa al servidor
- Detección y corrección de problema de DNS (configurado 8.8.8.8)
- Verificación de permisos y conectividad de red

**08:40 - 09:00:** Intento de instalación de Docker
- Instalación de Docker CE falló por problemas con CDN
- Cambio de estrategia a instalación directa de PostgreSQL

**09:00 - 09:40:** Instalación y configuración de PostgreSQL 15
- Instalación exitosa de PostgreSQL 15 mediante repositorios DNF
- Inicialización de base de datos completada
- Servicio iniciado correctamente en puerto 5432
- Configuración de firewall: agregada regla para PostgreSQL
- Recarga de firewall ejecutada

**09:40 - 09:45:** Configuración de usuario PostgreSQL
- Cambio a usuario 'postgres'
- Acceso a consola psql
- **Conexión perdida durante o después de esta operación**

## SÍNTOMAS DEL PROBLEMA

**Conectividad de Red:**
```
$ ping 30.0.0.150
--- 30.0.0.150 ping statistics ---
10 packets transmitted, 0 received, 100% packet loss
```

**Acceso SSH:**
```
$ ssh agendajuridicodbdev@30.0.0.150
ssh: connect to host 30.0.0.150 port 22: No route to host
```

**Características:**
- Pérdida total de conectividad
- Todos los protocolos sin respuesta
- Sin indicios de reinicio parcial
- Momento específico identificado (~09:45 AM)

## IMPACTO

- **Desarrollo bloqueado:** El equipo no puede acceder al servidor de base de datos compartido
- **Workaround actual:** Desarrollo local con instancias individuales de PostgreSQL
- **Datos:** No hay pérdida de datos, el servidor no contenía información de producción
- **Configuración:** La configuración de PostgreSQL no se completó antes del incidente

## ACCIONES REQUERIDAS

**Prioridad Inmediata:**
1. Verificar estado físico del servidor y conectividad de red en switch/router
2. Acceder por consola física o remota (KVM/IPMI/iLO)
3. Revisar logs del sistema para identificar causa raíz
4. Restaurar conectividad SSH si fue bloqueada por firewall
5. Verificar configuración de red (IP, gateway, DNS)

**Configuración Pendiente al Restaurar:**
- Hacer configuración de DNS permanente (actualmente temporal)
- Completar configuración de PostgreSQL (base de datos, usuarios)
- Validar reglas de firewall (SSH + PostgreSQL)
- Realizar respaldo de configuración

## INFORMACIÓN DE CONTACTO

**Usuario del servidor:** agendajuridicodbdev  
**Propósito:** Servidor de desarrollo PostgreSQL + PgAdmin  
**Proyecto:** Sistema de Gestión Jurídica  
**Urgencia:** ALTA

---

**Documento generado:** 7 de Enero 2026  
**Estado:** PENDIENTE DE RESOLUCIÓN

---

# ANÁLISIS DE CAUSA PROBABLE

## CAUSA MÁS PROBABLE: Configuración Incorrecta de Firewall

Durante la configuración del servidor, se realizaron modificaciones al firewall del sistema para permitir el acceso a PostgreSQL. La pérdida de conectividad ocurrió inmediatamente después de ejecutar comandos de firewall, específicamente tras la recarga de reglas.

### Cronología de Eventos Relacionados

**09:20 - 09:30:** Modificación de firewall
```bash
# Agregar regla para PostgreSQL
sudo firewall-cmd --permanent --add-service=postgresql
# Resultado: success

# Recargar firewall
sudo firewall-cmd --reload
# Resultado: success
```

**09:40 - 09:45:** Configuración adicional y pérdida de conexión

### ¿Por Qué Esta Es La Causa Más Probable?

**1. Momento del Fallo**
- La conexión se perdió inmediatamente después de las modificaciones al firewall
- No hubo otros cambios significativos en el sistema en ese período
- El comando `firewall-cmd --reload` puede causar desconexión temporal que no se recupera si hay errores

**2. Características del Sistema**
- Rocky Linux 9.1 incluye firewall restrictivo (firewalld) activo por defecto
- Las modificaciones con flag `--permanent` persisten después de reinicios
- Un error en las reglas de firewall puede bloquear completamente SSH

**3. Escenario Técnico**

Es posible que durante las operaciones de configuración se haya ejecutado inadvertidamente un comando que removió el servicio SSH de las reglas permitidas, por ejemplo:

```bash
# Comando que pudo haberse ejecutado por error
sudo firewall-cmd --permanent --remove-service=ssh
sudo firewall-cmd --reload
```

O que la recarga del firewall activó una configuración por defecto que no incluía SSH:

```bash
# La recarga podría haber aplicado una zona más restrictiva
# o eliminado reglas temporales que incluían SSH
```

### Evidencia de Soporte

- **Antes del incidente:** Servidor respondía normalmente a SSH
- **Durante modificaciones:** Se ejecutaron comandos de firewall con cambios permanentes
- **Después del incidente:** Total pérdida de conectividad (característica de bloqueo de firewall)
- **Tipo de error:** "No route to host" es consistente con bloqueo por firewall

### Solución Esperada

Si esta es la causa correcta, el problema se resuelve accediendo por consola física o remota y ejecutando:

```bash
# Verificar reglas actuales
sudo firewall-cmd --list-all

# Restaurar servicio SSH
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

# O en caso extremo, deshabilitar temporalmente
sudo systemctl stop firewalld
```

### Otras Posibilidades Consideradas

**Reinicio del servidor:** Si bien algunos servicios fueron modificados, no hay evidencia de comando de reinicio explícito. Un reinicio no completado mostraría síntomas diferentes.

**Cambio de configuración de red:** Se modificó `/etc/resolv.conf` pero solo para DNS, no para configuración IP. NetworkManager podría haber reconfigurado la interfaz, pero es menos probable que bloquee completamente la conectividad.

**Problema de SELinux:** Rocky Linux incluye SELinux en modo enforcing, pero un bloqueo de SELinux típicamente afecta servicios específicos, no la conectividad de red completa.

### Recomendaciones de Prevención

1. **Siempre mantener una conexión secundaria** (consola física o KVM) antes de modificar firewall
2. **Probar cambios de firewall sin `--permanent`** primero para validar que no bloquean la conexión actual
3. **Documentar reglas de firewall** antes de realizar cambios
4. **Usar scripts de rollback automático** para cambios críticos de red

---

**Conclusión:** La causa más probable del incidente es una modificación incorrecta en las reglas del firewall que bloqueó el acceso SSH de manera permanente. La solución requiere acceso por consola física o remota para restaurar las reglas correctas.
