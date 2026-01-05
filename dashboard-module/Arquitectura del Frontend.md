# Arquitectura del Frontend - dashboard-module

## Estructura del Módulo

| Archivo/Carpeta | Descripción |
|-----------------|-------------|
| `index.html` | Página principal del módulo de dashboard que incluye la estructura HTML, carga de dependencias y inicialización del módulo JavaScript. |
| `README (dashboard).md` | Documentación detallada del módulo de dashboard, incluyendo características, uso, API, configuración y ejemplos de integración. |
| `README.md` | Documentación adicional del módulo (contenido similar al archivo anterior). |
| `components/stats-cards.html` | Componente HTML que define las tarjetas de estadísticas principales (Total Expedientes, Expedientes Activos, Usuarios Activos, Gerencias) con estilos y iconos. |
| `js/dashboard-module.js` | Módulo JavaScript principal que maneja la lógica del dashboard: carga de datos, creación de gráficos con Chart.js, actualización de estadísticas, gestión de filtros y configuración de colores. |

## Resumen Funcional

Este módulo implementa un dashboard interactivo para el sistema jurídico, proporcionando visualizaciones de datos clave como estadísticas de expedientes, distribución por gerencias, carga de trabajo de usuarios, trabajo completado a lo largo del tiempo y estados de expedientes. Utiliza Chart.js para gráficos responsivos y soporta filtros dinámicos para análisis detallado.
