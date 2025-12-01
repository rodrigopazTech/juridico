# Módulo de Expedientes

Este módulo encapsula la funcionalidad relacionada con la gestión de Expedientes (antes "Asuntos"). Sigue el mismo patrón modular utilizado en `notificaciones-module` para favorecer reutilización, mantenibilidad y escalabilidad.

## Estructura
```
expediente-module/
  index.html                    # Página de listado de expedientes
  expediente-detalle.html       # Página de detalle de un expediente
  README.md                     # Documentación del módulo
  components/                   # Fragmentos HTML reutilizables (lista y detalle)
    toolbar.html
    filters.html
    expediente-card.html
    empty-state.html
    modal-create.html
    detalle-header.html
    detalle-metadata.html
    detalle-timeline.html
    detalle-actividad.html
  data/
    expedientes-data.js         # Seed, CRUD y filtrado de expedientes vía localStorage
    expediente-timeline-data.js # Persistencia timeline + actividad por expediente
  js/
    expedientes.js              # Clase principal (ExpedientesModule) para gestión de UI listado
    expediente-detalle.js       # Lógica de página detalle (ExpedienteDetalleModule)
```

## Flujo Listado
1. `expedientes-data.js` provee funciones para cargar, crear, filtrar y actualizar expedientes.
2. `expedientes.js` instancia `ExpedientesModule` al cargar el DOM.
3. Se leen criterios (búsqueda y filtros) y se renderizan tarjetas desde el template `expediente-card.html`.
4. Botones de creación abren el modal `modal-create.html`; el formulario persiste en localStorage y fuerza re-render.
5. Navegación a detalle: `expediente-detalle.html?id=<ID>`.

## Flujo Detalle
1. `expediente-detalle.js` obtiene el `id` de la URL y carga el expediente con `expedienteById`.
2. Carga timeline y actividad desde `expediente-timeline-data.js` (claves por ID).
3. Renderiza metadatos (`detalle-metadata.html`), acciones (`detalle-header.html`), timeline y actividad.
4. Acciones rápidas (cambiar estado / nueva actividad) actualizan expediente y agregan entradas a actividad + timeline.
5. Se refleja actualización en contadores y última actividad.

## Extensión Próxima (Detalle)
Añadir componentes opcionales: documentos, checklist, participantes, notas rápidas, adjuntos y control granular de estados. Integrar subida de archivos y API real.

## Estilos
Actualmente se apoya en Tailwind vía CDN y tokens definidos en `GUIA-ESTILOS-SISTEMA-JURIDICO.md`. Si se migra a build (PostCSS), estos fragmentos podrán integrarse en un pipeline.

## Adaptación desde Asuntos
- Se renombra entidad principal a "Expediente".
- Se simplifica la tarjeta para esta primera versión.
- Se mantiene localStorage como store provisional.

## Consideraciones de Accesibilidad
- Modales: agregar foco inicial al primer campo del formulario al abrir (pendiente).
- Tecla Escape para cerrar modal (pendiente).
- Atributos ARIA en badges y estado (pendiente de refinar).

## Próximos Pasos Sugeridos
1. Ordenamiento (por fecha, prioridad, actualizaciones) en listado.
2. Paginación virtual o lazy load.
3. Documentos y adjuntos (componente adicional + persistencia).
4. Checklist de tareas internas del expediente.
5. Integrar sistema de permisos / roles (cuando exista backend).
6. Sincronizar con API REST (reemplazar localStorage totalmente).
7. Mejorar accesibilidad (foco modal, Escape, ARIA roles/tags).

---
Última actualización: 2025-11-24
