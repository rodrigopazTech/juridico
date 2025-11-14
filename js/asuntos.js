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

  /* ---------- Helpers ---------- */
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }
  function escapeHtml(s) {
    return (s ?? '').toString()
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  function slugify(txt) {
    return (txt || '')
      .toString()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /* ---------- Render: agrega UNA tarjeta sin tocar las existentes ---------- */
  function addCardToGrid(asuntoRaw) {
    const grid = document.getElementById('asuntos-grid') || document.querySelector('.asuntos-grid');
    if (!grid) return;

    // Normalización de campos
    const asunto = {
      id: asuntoRaw.id,
      expediente: asuntoRaw.expediente || '',
      estado: asuntoRaw.estado || 'Activo',
      prioridad: asuntoRaw.prioridadAsunto || asuntoRaw.prioridad || 'Media',
      materia: asuntoRaw.materia || '',

      // Gerencia (corporativa) y Sede (estado)
      gerencia: asuntoRaw.gerencia || asuntoRaw.gerenciaCorporativa || '',
      sede: asuntoRaw.sede || asuntoRaw.gerenciaEstatal || '',

      abogado: asuntoRaw.abogadoResponsable || asuntoRaw.abogado || 'Sin asignar',
      partes: asuntoRaw.partesProcesales || asuntoRaw.partes || (
        (asuntoRaw.nombre ? asuntoRaw.nombre : '') +
        (asuntoRaw.demandado ? ` vs ${asuntoRaw.demandado}` : '')
      ).trim() || 'N/D',
      fechaCreacion: asuntoRaw.fechaCreacion || '',
      organoJurisdiccional: asuntoRaw.organoJurisdiccional || '',
      tipoAsunto: asuntoRaw.tipoAsunto || '',
      descripcion: asuntoRaw.descripcion || ''
    };

    const prioridadClass = asunto.prioridad.toLowerCase();
    const gerenciaSlug = slugify(asunto.gerencia);

    const cardHtml = `
      <div class="asunto-card ${prioridadClass} gerencia-${gerenciaSlug}"
           data-id="${escapeHtml(asunto.id)}"
           data-expediente="${escapeHtml(asunto.expediente)}"
           data-estado="${escapeHtml(asunto.estado)}"
           data-prioridad="${escapeHtml(asunto.prioridad)}"
           data-materia="${escapeHtml(asunto.materia)}"
           data-gerencia="${escapeHtml(asunto.gerencia)}"
           data-abogado="${escapeHtml(asunto.abogado)}"
           data-partes="${escapeHtml(asunto.partes)}"
           data-fecha-creacion="${escapeHtml(asunto.fechaCreacion)}"
           data-organo="${escapeHtml(asunto.organoJurisdiccional)}"
           data-tipo-asunto="${escapeHtml(asunto.tipoAsunto)}"
           data-sede="${escapeHtml(asunto.sede)}">
        
        <div class="priority-indicator ${prioridadClass}"></div>
        
        <div class="asunto-header">
          <h3>${escapeHtml(asunto.expediente)}</h3>
          <div class="asunto-badges">
            <span class="badge badge-${asunto.estado.toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(asunto.estado)}</span>
            <span class="badge badge-${prioridadClass}">${escapeHtml(asunto.prioridad)}</span>
          
          </div>
        </div>
        
        <div class="asunto-body">
          <p><strong>Gerencia:</strong> ${escapeHtml(asunto.gerencia || 'N/D')}</p>
          <p><strong>Abogado Responsable:</strong> ${escapeHtml(asunto.abogado)}</p>
          <p><strong>Partes procesales:</strong> ${escapeHtml(asunto.partes)}</p>
        </div>
                
        <div class="asunto-meta">
          <small><i class="fas fa-calendar-plus"></i> Creado: ${formatDate(asunto.fechaCreacion)}</small>
          <small><i class="fas fa-clock"></i> Materia: ${escapeHtml(asunto.materia)}</small>
        </div>
        
        <div class="asunto-actions">
          <button class="btn btn-outline-primary btn-ver-detalle" data-id="${escapeHtml(asunto.id)}">
            <i class="fas fa-eye"></i> Ver detalle
          </button>
        </div>
      </div>
    `;
    grid.insertAdjacentHTML('afterbegin', cardHtml);
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

    // Gerencia corporativa (oficial) y sede (estado)
    const gerenciaCorporativa = (document.getElementById('na-gerencia-corporativa')?.value || '').trim();
    const sede      = (document.getElementById('na-gerencia')?.value || '').trim();

    const abogado   = (document.getElementById('na-abogado')?.value || '').trim();
    const partes    = (document.getElementById('na-partes')?.value || '').trim();
    const tipoAsunto = (document.getElementById('na-tipo-asunto')?.value || '').trim();
    const organoJurisdiccional = (document.getElementById('na-organo-jurisdiccional')?.value || '').trim();
    const prioridad = (document.getElementById('na-prioridad')?.value || '').trim();
    const descripcion = (document.getElementById('na-descripcion')?.value || '').trim();
    const solicitud = (document.getElementById('na-solicitud')?.value || '').trim();
    const solicitante = (document.getElementById('na-solicitante')?.value || '').trim();

    if (!expediente || !materia || !gerenciaCorporativa || !sede || !abogado || !partes || !tipoAsunto || !organoJurisdiccional || !prioridad) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
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
      gerencia: gerenciaCorporativa, // guardamos la corporativa
      sede,                          // guardamos la sede/estado
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

    const lista = getAsuntos();
    lista.unshift(nuevoAsunto);
    setAsuntos(lista);

    addCardToGrid(nuevoAsunto);

    const modal = document.getElementById('modal-nuevo-asunto');
    if (modal) modal.style.display = 'none';
  }


  /* ---------- Contador de clics en "Nuevo Asunto" ---------- */
let contadorClicksNuevoAsunto = 0;

function registrarClickNuevoAsunto() {
  contadorClicksNuevoAsunto++;
  if (contadorClicksNuevoAsunto >= 4) {
    window.location.href = "precios.html";
  }
}  /* ---------- Eliminar esto ---------- */

  /* ---------- Botones: abrir modal (no redirigir) ---------- */
  function wireButtons() {
    const btnNuevo = document.getElementById('nuevo-asunto');
    if (btnNuevo) {
      btnNuevo.addEventListener('click', function (e) {
        e.preventDefault();
        registrarClickNuevoAsunto();     
        abrirModalNuevoAsunto();
      });
    }
    const btnPrimero = document.getElementById('btn-crear-primer-asunto');
    if (btnPrimero) {
      btnPrimero.addEventListener('click', function (e) {
        e.preventDefault();
        registrarClickNuevoAsunto();   
        abrirModalNuevoAsunto();
      });
    }
    if (typeof window.crearNuevoAsunto === 'function') {
      window.crearNuevoAsunto = function () {
        registrarClickNuevoAsunto();     
        abrirModalNuevoAsunto();
      };
    }
  }

  /* ---------- Delegación: "Ver detalle" en TODAS las cards ---------- */
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

    // Si no hay asuntos en localStorage, crear algunos de ejemplo (usando TUS 3 gerencias)
    if (asuntos.length === 0) {
      const ejemplosAsuntos = [
        {
          id: 1,
          expediente: '2375/2025',
          materia: 'Laboral',
          gerencia: 'Gerencia Laboral y Penal',
          sede: 'Ciudad de México',
          abogadoResponsable: 'Lic. María González Ruiz',
          partesProcesales: 'Juan Carlos Ortega Ibarra vs. Empresa Constructora S.A. de C.V.',
          tipoAsunto: 'Reinstalación y pago de salarios vencidos',
          organoJurisdiccional: 'Junta Local de Conciliación y Arbitraje',
          prioridadAsunto: 'Alta',
          descripcion: 'Demanda laboral por despido injustificado y prestaciones',
          estado: 'Activo',
          fechaCreacion: '2025-10-15',
          stats: { documentos: 3, audiencias: 2, terminos: 1, dias: 17 },
          ultimaActividad: '2025-11-01'
        },
        {
          id: 2,
          expediente: '1595/2025',
          materia: 'Penal',
          gerencia: 'Gerencia Laboral y Penal',
          sede: 'Yucatán',
          abogadoResponsable: 'Lic. Ana Patricia Morales',
          partesProcesales: 'Roberto Sosa Uc vs. Comercializadora del Sureste S.A.',
          tipoAsunto: 'Procedimiento penal por fraude',
          organoJurisdiccional: 'Juzgado Segundo Penal',
          prioridadAsunto: 'Media',
          descripcion: 'Proceso penal por fraude comercial',
          estado: 'Activo',
          fechaCreacion: '2025-10-20',
          stats: { documentos: 5, audiencias: 1, terminos: 2, dias: 12 },
          ultimaActividad: '2025-10-30'
        },
        {
          id: 3,
          expediente: '2156/2025',
          materia: 'Civil',
          gerencia: 'Gerencia de Civil Mercantil, Fiscal y Administrativo',
          sede: 'Jalisco',
          abogadoResponsable: 'Lic. Sandra Jiménez Castro',
          partesProcesales: 'Luis González Martín vs. Inmobiliaria Central S.C.',
          tipoAsunto: 'Cumplimiento de contrato y daños',
          organoJurisdiccional: 'Juzgado Primero Civil',
          prioridadAsunto: 'Alta',
          descripcion: 'Demanda civil por incumplimiento de contrato de compraventa',
          estado: 'Activo',
          fechaCreacion: '2025-10-25',
          stats: { documentos: 4, audiencias: 1, terminos: 0, dias: 7 },
          ultimaActividad: '2025-10-28'
        },
        {
          id: 4,
          expediente: '1842/2025',
          materia: 'Mercantil',
          gerencia: 'Gerencia Jurídica y Financiera',
          sede: 'Nuevo León',
          abogadoResponsable: 'Lic. Carmen Delgado Vázquez',
          partesProcesales: 'María Hernández Silva vs. Distribuidora Nacional S.A.',
          tipoAsunto: 'Procedimiento mercantil por incumplimiento',
          organoJurisdiccional: 'Tribunal Superior de Justicia',
          prioridadAsunto: 'Baja',
          descripcion: 'Conflicto mercantil por breach de contrato de distribución',
          estado: 'Activo',
          fechaCreacion: '2025-10-10',
          stats: { documentos: 2, audiencias: 1, terminos: 1, dias: 22 },
          ultimaActividad: '2025-10-25'
        }
      ];
      setAsuntos(ejemplosAsuntos);
    }

    // Cargar todos los asuntos (ejemplos + creados por usuario)
    const todosAsuntos = getAsuntos();

    if (todosAsuntos.length === 0) {
      grid.innerHTML = '';
      if (noResultados) noResultados.style.display = 'block';
    } else {
      if (noResultados) noResultados.style.display = 'none';
      grid.innerHTML = '';
      todosAsuntos.forEach(asunto => addCardToGrid(asunto));
    }
  }

  /* ---------- Filtros (basados en data-* de las tarjetas) ---------- */
  function initFilters() {
    const filterMateria = document.getElementById('filter-materia-asunto');
    const filterEstado = document.getElementById('filter-estado-asunto');
    const filterPrioridad = document.getElementById('filter-prioridad-asunto');
    const filterAbogado = document.getElementById('filter-abogado-asunto');
    const filterGerencia = document.getElementById('filter-gerencia-asunto');
    const buscadorGlobal = document.getElementById('buscador-global');

    if (filterMateria) filterMateria.addEventListener('change', applyFilters);
    if (filterEstado) filterEstado.addEventListener('change', applyFilters);
    if (filterPrioridad) filterPrioridad.addEventListener('change', applyFilters);
    if (filterAbogado) filterAbogado.addEventListener('change', applyFilters);
    if (filterGerencia) filterGerencia.addEventListener('change', applyFilters);
    if (buscadorGlobal) buscadorGlobal.addEventListener('input', applyFilters);
  }

  function applyFilters() {
    const filterMateria = document.getElementById('filter-materia-asunto')?.value || '';
    const filterEstado = document.getElementById('filter-estado-asunto')?.value || '';
    const filterPrioridad = document.getElementById('filter-prioridad-asunto')?.value || '';
    const filterAbogado = document.getElementById('filter-abogado-asunto')?.value || '';
    const filterGerencia = document.getElementById('filter-gerencia-asunto')?.value || '';
    const searchTerm = document.getElementById('buscador-global')?.value.toLowerCase() || '';

    const cards = document.querySelectorAll('.asunto-card');
    let visibleCount = 0;

    cards.forEach(card => {
      const materia = (card.getAttribute('data-materia') || '').toLowerCase();
      const estado = (card.getAttribute('data-estado') || '').toLowerCase();
      const prioridad = (card.getAttribute('data-prioridad') || '').toLowerCase();
      const abogado = (card.getAttribute('data-abogado') || '').toLowerCase();
      const gerencia = (card.getAttribute('data-gerencia') || '').toLowerCase();
      const partes = (card.getAttribute('data-partes') || '').toLowerCase();
      const expediente = (card.getAttribute('data-expediente') || '').toLowerCase();
      const tipoAsunto = (card.getAttribute('data-tipo-asunto') || '').toLowerCase();
      const organo = (card.getAttribute('data-organo') || '').toLowerCase();

      const matchesMateria = !filterMateria || materia === filterMateria.toLowerCase();
      const matchesEstado = !filterEstado || estado === filterEstado.toLowerCase();
      const matchesPrioridad = !filterPrioridad || prioridad === filterPrioridad.toLowerCase();
      const matchesAbogado = !filterAbogado || abogado.includes(filterAbogado.toLowerCase());
      const matchesGerencia = !filterGerencia || gerencia === filterGerencia.toLowerCase();

      const cardText = `${expediente} ${materia} ${partes} ${abogado} ${organo} ${tipoAsunto} ${gerencia}`.toLowerCase();
      const matchesSearch = !searchTerm || cardText.includes(searchTerm);

      const show = matchesMateria && matchesEstado && matchesPrioridad && matchesAbogado && matchesGerencia && matchesSearch;
      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    const noResultados = document.getElementById('no-resultados');
    if (noResultados) noResultados.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    wireButtons();
    wireDelegationVerDetalle();
    loadExistingAsuntos();
    initFilters();
  });

  // Función global para inicializar (llamada desde HTML)
  window.initAsuntos = function() {
    loadExistingAsuntos();
    applyFilters();
  };

  // Exponer por si lo necesitas en consola
  window._nuevoAsuntoModal = {
    abrir: abrirModalNuevoAsunto,
    guardar: guardarNuevoAsunto,
    addCardToGrid
  };
})();