# Arquitectura del Frontend - expediente-module

## Estructura del Módulo

| Archivo/Carpeta | Descripción |
|-----------------|-------------|
| `index.html` | Página principal del módulo de expedientes para listar y gestionar expedientes, incluyendo filtros y creación de nuevos expedientes. |
| `expediente-detalle.html` | Página de detalle de un expediente específico, mostrando metadatos, timeline, actividades y gestión de documentos. |
| `components/detalle-actividad.html` | Componente HTML para mostrar y gestionar las actividades relacionadas con un expediente. |
| `components/detalle-header.html` | Componente HTML para el encabezado del detalle del expediente, incluyendo acciones principales. |
| `components/detalle-metadata.html` | Componente HTML para mostrar los metadatos básicos del expediente (número, materia, estado, etc.). |
| `components/detalle-timeline.html` | Componente HTML para la línea de tiempo del expediente, mostrando eventos cronológicos. |
| `components/documentos-expediente.html` | Componente HTML para gestionar y mostrar documentos asociados al expediente. |
| `components/empty-state.html` | Componente HTML para mostrar un estado vacío cuando no hay expedientes en la lista. |
| `components/expediente-card.html` | Plantilla HTML para las tarjetas de expedientes en la vista de lista, mostrando información resumida. |
| `components/filters.html` | Componente HTML para los controles de filtros de búsqueda y selección de expedientes. |
| `components/historico-documentos.html` | Componente HTML para el historial de documentos del expediente. |
| `components/modal-create.html` | Modal HTML para crear nuevos expedientes con formulario de ingreso de datos. |
| `components/modal-edit.html` | Modal HTML para editar la información de un expediente existente. |
| `components/modal-manage-organos.html` | Modal HTML para gestionar y asignar órganos jurisdiccionales a expedientes. |
| `components/modal-observaciones.html` | Modal HTML para agregar observaciones o notas a un expediente. |
| `components/toolbar.html` | Barra de herramientas HTML con acciones principales como búsqueda y creación. |
| `components/vista-360.html` | Componente HTML para una vista completa de 360 grados del expediente. |
| `data/expediente-timeline-data.js` | Archivo JavaScript para persistencia y manejo de datos de timeline y actividad por expediente. |
| `data/expedientes-data.js` | Archivo JavaScript que maneja seed de datos, operaciones CRUD y filtrado de expedientes vía localStorage. |
| `js/expediente-detalle.js` | Módulo JavaScript para la lógica de la página de detalle del expediente (ExpedienteDetalleModule). |
| `js/expedientes.js` | Clase principal JavaScript (ExpedientesModule) para gestión de la interfaz de usuario en la lista de expedientes. |
| `js/organos-manager.js` | Módulo JavaScript para gestionar la lógica de órganos jurisdiccionales. |

## Resumen Funcional

Este módulo implementa la gestión completa de expedientes en el sistema jurídico, incluyendo listado con filtros, creación y edición de expedientes, vista detallada con timeline y actividades, gestión de documentos y órganos jurisdiccionales. Utiliza localStorage para persistencia temporal y sigue un patrón modular con separación de componentes HTML, lógica JavaScript y manejo de datos.
