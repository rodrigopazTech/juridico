/* ====== EXTENSIÓN MODAL NUEVO ASUNTO (respetando body-cards existentes) ====== */
(function () {
  /* ---------- Utilidades de almacenamiento ---------- */
  function getAsuntos() {
    try { return JSON.parse(localStorage.getItem('asuntos')) || []; } catch { return []; }
  }
  function setAsuntos(list) {
    localStorage.setItem('asuntos', JSON.stringify(list));
  }
  function generarNuevoId() {
    const lista = getAsuntos();
    const max = lista.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0);
    return max + 1;
  }

  /* ---------- Render: agrega UNA tarjeta sin tocar las existentes ---------- */
  function addCardToGrid(asunto) {
    const grid = document.getElementById('asuntos-grid') || document.querySelector('.asuntos-grid');
    if (!grid) return;

    const prioridadClass = (asunto.prioridad || 'Media').toLowerCase();
    
    const cardHtml = `
      <div class="asunto-card ${prioridadClass}" data-id="${asunto.id}">
        <div class="priority-indicator ${prioridadClass}"></div>
        
        <div class="asunto-header">
          <h3>${escapeHtml(asunto.expediente)} · ${escapeHtml(asunto.materia)}</h3>
          <div class="asunto-badges">
            <span class="badge badge-${(asunto.estado || 'Activo').toLowerCase().replace(' ', '-')}">${escapeHtml(asunto.estado || 'Activo')}</span>
            <span class="badge badge-${prioridadClass}">${escapeHtml(asunto.prioridad || 'Media')}</span>
          </div>
        </div>
        
        <div class="asunto-body">
          <p><strong>Actor/Cliente:</strong> ${escapeHtml(asunto.nombre)}</p>
          <p><strong>Demandado:</strong> ${escapeHtml(asunto.demandado || 'N/D')}</p>
          <p><strong>Abogado:</strong> ${escapeHtml(asunto.abogado || 'Sin asignar')}</p>
        </div>
        
        <div class="asunto-stats">
          <span><i class="fas fa-file"></i> ${asunto.stats?.documentos || 0} Documentos</span>
          <span><i class="fas fa-gavel"></i> ${asunto.stats?.audiencias || 0} Audiencias</span>
          <span><i class="fas fa-clock"></i> ${asunto.stats?.terminos || 0} Términos</span>
          <span><i class="fas fa-calendar"></i> ${asunto.stats?.dias || 0} Días activo</span>
        </div>
        
        <div class="asunto-meta">
          <small><i class="fas fa-calendar-plus"></i> Creado: ${formatDate(asunto.fechaCreacion)}</small>
          <small><i class="fas fa-clock"></i> Última: ${formatDate(asunto.ultimaActividad)}</small>
        </div>
        
        <div class="asunto-actions">
          <button class="btn btn-outline-primary btn-ver-detalle" data-id="${asunto.id}">
            <i class="fas fa-eye"></i> Ver detalle
          </button>
          <button class="btn btn-outline-secondary btn-sm" title="Vista 360">
            <i class="fas fa-chart-pie"></i>
          </button>
        </div>
      </div>
    `;
    grid.insertAdjacentHTML('afterbegin', cardHtml);
  }

  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  }

  function escapeHtml(s) {
    return (s ?? '').toString()
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  /* ---------- Modal: abrir / guardar ---------- */
  function abrirModalNuevoAsunto() {
    const modal = document.getElementById('modal-nuevo-asunto');
    const form = document.getElementById('form-nuevo-asunto');
    if (!modal || !form) { console.warn('[Nuevo Asunto] Falta el HTML del modal.'); return; }

    form.reset();
    const prio = document.getElementById('na-prioridad');
    if (prio) prio.value = 'Media';

    modal.style.display = 'flex';

    const cerrar = () => (modal.style.display = 'none');

    const btnCerrar = document.getElementById('cerrar-modal-nuevo-asunto');
    const btnCancelar = document.getElementById('cancelar-nuevo-asunto');
    if (btnCerrar) btnCerrar.onclick = cerrar;
    if (btnCancelar) btnCancelar.onclick = cerrar;

    const outsideClick = (e) => {
      if (e.target === modal) {
        cerrar();
        modal.removeEventListener('click', outsideClick);
      }
    };
    modal.addEventListener('click', outsideClick);

    form.onsubmit = (e) => {
      e.preventDefault();
      guardarNuevoAsunto();
    };
  }

  function guardarNuevoAsunto() {
    const expediente = (document.getElementById('na-expediente')?.value || '').trim();
    const materia   = (document.getElementById('na-materia')?.value || '').trim();
    const gerencia  = (document.getElementById('na-gerencia')?.value || '').trim();
    const abogado   = (document.getElementById('na-abogado')?.value || '').trim();
    const partes    = (document.getElementById('na-partes')?.value || '').trim();
    const tipoAsunto = (document.getElementById('na-tipo-asunto')?.value || '').trim();
    const organoJurisdiccional = (document.getElementById('na-organo-jurisdiccional')?.value || '').trim();
    const prioridad = (document.getElementById('na-prioridad')?.value || '').trim();
    const descripcion = (document.getElementById('na-descripcion')?.value || '').trim();
    const solicitud = (document.getElementById('na-solicitud')?.value || '').trim();
    const solicitante = (document.getElementById('na-solicitante')?.value || '').trim();

    if (!expediente || !materia || !gerencia || !abogado || !partes || !tipoAsunto || !organoJurisdiccional || !prioridad) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
    
    // Validar campos específicos de Transparencia
    if (materia === 'Transparencia' && (!solicitud || !solicitante)) {
      alert('Los campos Solicitud y Solicitante son obligatorios para Unidad de Transparencia.');
      return;
    }

    const id = generarNuevoId();
    const hoyISO = new Date().toISOString().slice(0,10);
    const nuevoAsunto = {
      id,
      expediente,
      materia,
      gerencia,
      abogadoResponsable: abogado,
      partesProcesales: partes,
      tipoAsunto,
      organoJurisdiccional,
      prioridadAsunto: prioridad,
      descripcion: descripcion || '',
      solicitud: materia === 'Transparencia' ? solicitud : '',
      solicitante: materia === 'Transparencia' ? solicitante : '',
      estado: 'Activo',
      fechaCreacion: hoyISO,
      stats: { documentos: 0, audiencias: 0, terminos: 0, dias: 0 },
      ultimaActividad: hoyISO
    };

    // Persistir
    const lista = getAsuntos();
    lista.unshift(nuevoAsunto);
    setAsuntos(lista);

    // Pintar SOLO la nueva card, sin tocar tus ejemplos
    addCardToGrid(nuevoAsunto);

    // Cerrar modal
    const modal = document.getElementById('modal-nuevo-asunto');
    if (modal) modal.style.display = 'none';
  }

  /* ---------- Botones: abrir modal (no redirigir) ---------- */
  function wireButtons() {
    const btnNuevo = document.getElementById('nuevo-asunto');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', function (e) {
        e.preventDefault();
        abrirModalNuevoAsunto();
      });
    }
    const btnPrimero = document.getElementById('btn-crear-primer-asunto');
    if (btnPrimero) {
      btnPrimero.addEventListener('click', function (e) {
        e.preventDefault();
        abrirModalNuevoAsunto();
      });
    }

    // Por si existía una función global que redirigía
    if (typeof window.crearNuevoAsunto === 'function') {
      window.crearNuevoAsunto = function () { abrirModalNuevoAsunto(); };
    }
  }

  /* ---------- Delegación: botón "Ver detalle" en TODAS las cards (demo + nuevas) ---------- */
  function wireDelegationVerDetalle() {
    const grid = document.getElementById('asuntos-grid') || document.querySelector('.asuntos-grid') || document;
    grid.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn-ver-detalle,[data-action="ver-detalle"]');
      if (!btn) return;
      e.preventDefault();
      const id = btn.dataset.id || btn.getAttribute('data-id') || btn.getAttribute('data-detalle-id');
      if (!id) return;
      window.location.href = `asunto-detalle.html?id=${encodeURIComponent(id)}&nuevo=false`;
    });
  }

  /* ---------- Cargar asuntos existentes ---------- */
  function loadExistingAsuntos() {
    const grid = document.getElementById('asuntos-grid');
    const noResultados = document.getElementById('no-resultados');
    if (!grid) return;

    const asuntos = getAsuntos();
    
    // Si no hay asuntos en localStorage, crear algunos de ejemplo
    if (asuntos.length === 0) {
      const ejemplosAsuntos = [
        {
          id: 1,
          expediente: '2375/2025',
          materia: 'Laboral',
          gerencia: 'Ciudad de México',
          abogadoResponsable: 'Lic. María González Ruiz',
          partesProcesales: 'Juan Carlos Ortega Ibarra vs. Empresa Constructora S.A. de C.V.',
          tipoAsunto: 'Reinstalación y pago de salarios vencidos',
          organoJurisdiccional: 'Junta Local de Conciliación y Arbitraje',
          prioridadAsunto: 'Alta',
          descripcion: 'Demanda laboral por despido injustificado y prestaciones',
          solicitud: '',
          solicitante: '',
          estado: 'Activo',
          fechaCreacion: '2025-10-15',
          stats: { documentos: 3, audiencias: 2, terminos: 1, dias: 17 },
          ultimaActividad: '2025-11-01'
        },
        {
          id: 2,
          expediente: '1595/2025',
          materia: 'Penal',
          gerencia: 'Yucatán',
          abogadoResponsable: 'Lic. Ana Patricia Morales',
          partesProcesales: 'Roberto Sosa Uc vs. Comercializadora del Sureste S.A.',
          tipoAsunto: 'Procedimiento penal por fraude',
          organoJurisdiccional: 'Juzgado Segundo Penal',
          prioridadAsunto: 'Media',
          descripcion: 'Proceso penal por fraude comercial',
          solicitud: '',
          solicitante: '',
          estado: 'Activo',
          fechaCreacion: '2025-10-20',
          stats: { documentos: 5, audiencias: 1, terminos: 2, dias: 12 },
          ultimaActividad: '2025-10-30'
        },
        {
          id: 3,
          expediente: '2156/2025',
          materia: 'Civil',
          gerencia: 'Jalisco',
          abogadoResponsable: 'Lic. Sandra Jiménez Castro',
          partesProcesales: 'Luis González Martín vs. Inmobiliaria Central S.C.',
          tipoAsunto: 'Cumplimiento de contrato y daños',
          organoJurisdiccional: 'Juzgado Primero Civil',
          prioridadAsunto: 'Alta',
          descripcion: 'Demanda civil por incumplimiento de contrato de compraventa',
          solicitud: '',
          solicitante: '',
          estado: 'Activo',
          fechaCreacion: '2025-10-25',
          stats: { documentos: 4, audiencias: 1, terminos: 0, dias: 7 },
          ultimaActividad: '2025-10-28'
        },
        {
          id: 4,
          expediente: '1842/2025',
          materia: 'Mercantil',
          gerencia: 'Nuevo León',
          abogadoResponsable: 'Lic. Carmen Delgado Vázquez',
          partesProcesales: 'María Hernández Silva vs. Distribuidora Nacional S.A.',
          tipoAsunto: 'Procedimiento mercantil por incumplimiento',
          organoJurisdiccional: 'Tribunal Superior de Justicia',
          prioridadAsunto: 'Baja',
          descripcion: 'Conflicto mercantil por breach de contrato de distribución',
          solicitud: '',
          solicitante: '',
          estado: 'Activo',
          fechaCreacion: '2025-10-10',
          stats: { documentos: 2, audiencias: 1, terminos: 1, dias: 22 },
          ultimaActividad: '2025-10-25'
        }
      ];
      
      // Guardar ejemplos en localStorage
      setAsuntos(ejemplosAsuntos);
    }

    // Cargar todos los asuntos (ejemplos + creados por usuario)
    const todosAsuntos = getAsuntos();
    
    if (todosAsuntos.length === 0) {
      // Mostrar mensaje de no resultados
      grid.innerHTML = '';
      if (noResultados) noResultados.style.display = 'block';
    } else {
      // Mostrar asuntos
      if (noResultados) noResultados.style.display = 'none';
      grid.innerHTML = '';
      
      todosAsuntos.forEach(asunto => {
        addCardToGrid(asunto);
      });
    }
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    wireButtons();
    wireDelegationVerDetalle();
    loadExistingAsuntos();
  });

  // Función global para inicializar (llamada desde HTML)
  window.initAsuntos = function() {
    loadExistingAsuntos();
  };

  // Exponer por si lo necesitas
  window._nuevoAsuntoModal = {
    abrir: abrirModalNuevoAsunto,
    guardar: guardarNuevoAsunto,
    addCardToGrid
  };

  /* ---------- Funciones de Filtrado ---------- */
  function initFilters() {
    // Obtener elementos de filtros
    const filterMateria = document.getElementById('filter-materia-asunto');
    const filterEstado = document.getElementById('filter-estado-asunto');
    const filterPrioridad = document.getElementById('filter-prioridad-asunto');
    const filterAbogado = document.getElementById('filter-abogado-asunto');
    const filterMes = document.getElementById('filter-mes-asunto');
    const buscadorGlobal = document.getElementById('buscador-global');

    // Agregar event listeners
    if (filterMateria) filterMateria.addEventListener('change', applyFilters);
    if (filterEstado) filterEstado.addEventListener('change', applyFilters);
    if (filterPrioridad) filterPrioridad.addEventListener('change', applyFilters);
    if (filterAbogado) filterAbogado.addEventListener('change', applyFilters);
    if (filterMes) filterMes.addEventListener('change', applyFilters);
    if (buscadorGlobal) buscadorGlobal.addEventListener('input', applyFilters);
  }

  function applyFilters() {
    const filterMateria = document.getElementById('filter-materia-asunto')?.value || '';
    const filterEstado = document.getElementById('filter-estado-asunto')?.value || '';
    const filterPrioridad = document.getElementById('filter-prioridad-asunto')?.value || '';
    const filterAbogado = document.getElementById('filter-abogado-asunto')?.value || '';
    const filterMes = document.getElementById('filter-mes-asunto')?.value || '';
    const searchTerm = document.getElementById('buscador-global')?.value.toLowerCase() || '';

    const cards = document.querySelectorAll('.asunto-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const cardId = card.getAttribute('data-id');
      const asuntos = getAsuntos();
      const asunto = asuntos.find(a => a.id == cardId);
      
      if (!asunto) {
        // Si no encuentra el asunto en localStorage, usar datos de la tarjeta HTML
        const shouldShow = filterByCardContent(card, {
          filterMateria,
          filterEstado,
          filterPrioridad,
          filterAbogado,
          filterMes,
          searchTerm
        });
        
        if (shouldShow) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
        return;
      }

      // Aplicar filtros
      const matchesMateria = !filterMateria || asunto.materia === filterMateria;
      const matchesEstado = !filterEstado || asunto.estado === filterEstado;
      const matchesPrioridad = !filterPrioridad || asunto.prioridadAsunto === filterPrioridad;
      const matchesAbogado = !filterAbogado || asunto.abogadoResponsable.includes(filterAbogado);
      
      // Filtro por mes de creación
      const matchesMes = !filterMes || (asunto.fechaCreacion && 
        asunto.fechaCreacion.substring(5, 7) === filterMes);
      
      // Búsqueda global
      const matchesSearch = !searchTerm || [
        asunto.expediente,
        asunto.materia,
        asunto.partesProcesales,
        asunto.abogadoResponsable,
        asunto.descripcion,
        asunto.tipoAsunto,
        asunto.organoJurisdiccional
      ].some(field => field && field.toLowerCase().includes(searchTerm));

      if (matchesMateria && matchesEstado && matchesPrioridad && matchesAbogado && matchesMes && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Mostrar mensaje de no resultados si no hay tarjetas visibles
    const noResultados = document.getElementById('no-resultados');
    if (noResultados) {
      noResultados.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  function filterByCardContent(card, filters) {
    const cardText = card.textContent.toLowerCase();
    const headerText = card.querySelector('.asunto-header h3')?.textContent || '';
    
    // Extraer información de la tarjeta
    const materia = headerText.split(' · ')[1] || '';
    const badges = Array.from(card.querySelectorAll('.badge')).map(b => b.textContent);
    const estado = badges.find(b => ['activo', 'archivado', 'espera', 'finalizado'].some(e => b.toLowerCase().includes(e))) || '';
    const prioridad = badges.find(b => ['alta', 'media', 'baja'].includes(b.toLowerCase())) || '';
    
    // Obtener abogado del contenido
    const abogadoMatch = cardText.match(/abogado:\s*([^\\n]+)/i);
    const abogado = abogadoMatch ? abogadoMatch[1].trim() : '';
    
    // Obtener fecha de creación para filtro de mes
    const fechaMatch = cardText.match(/creado:\s*(\d{2})\/(\d{2})\/(\d{4})/i);
    const mesTarjeta = fechaMatch ? fechaMatch[2] : '';

    // Aplicar filtros
    const matchesMateria = !filters.filterMateria || materia.includes(filters.filterMateria);
    const matchesEstado = !filters.filterEstado || estado.toLowerCase().includes(filters.filterEstado.toLowerCase());
    const matchesPrioridad = !filters.filterPrioridad || prioridad.toLowerCase() === filters.filterPrioridad.toLowerCase();
    const matchesAbogado = !filters.filterAbogado || abogado.includes(filters.filterAbogado);
    const matchesMes = !filters.filterMes || mesTarjeta === filters.filterMes;
    const matchesSearch = !filters.searchTerm || cardText.includes(filters.searchTerm);

    return matchesMateria && matchesEstado && matchesPrioridad && matchesAbogado && matchesMes && matchesSearch;
  }

  /* ---------- Inicializar filtros al cargar la página ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    // ... código existente ...
    initFilters();
  });

  // Exponer función para uso externo
  window.applyAsuntosFilters = applyFilters;

})();