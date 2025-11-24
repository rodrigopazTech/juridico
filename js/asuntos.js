/* ====== EXTENSIÓN MODAL NUEVO ASUNTO (Estilo V3 GOB.MX) ====== */
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
  
    /* ---------- Render: TARJETA ESTILO V3 (CORREGIDO PARA TU CSS) ---------- */
    function addCardToGrid(asuntoRaw) {
      const grid = document.getElementById('asuntos-grid') || document.querySelector('.asuntos-grid');
      if (!grid) return;
  
      // Normalización
      const asunto = {
        id: asuntoRaw.id,
        expediente: asuntoRaw.expediente || '',
        estado: asuntoRaw.estado || 'Tramite',
        prioridad: asuntoRaw.prioridadAsunto || asuntoRaw.prioridad || 'Media',
        materia: asuntoRaw.materia || '',
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
        descripcion: asuntoRaw.descripcion || 'Sin descripción registrada.'
      };
  
      // 1. Lógica de Colores (Borde Superior)
      const prioridad = asunto.prioridad; 
      let borderClass = 'border-gray-300';
      if(prioridad === 'Alta') borderClass = 'border-gob-guinda';
      if(prioridad === 'Media') borderClass = 'border-gob-oro';
      
      // 2. Lógica de Badges (Estado)
      let badgeClass = 'bg-gray-100 text-gray-600 border-gray-200';
      let dotColor = 'bg-gray-400';
      const estadoLower = asunto.estado.toLowerCase();
      
      if(estadoLower.includes('tramite') || estadoLower.includes('activo')) {
          badgeClass = 'bg-green-50 text-green-700 border-green-200';
          dotColor = 'bg-green-600';
      } else if (estadoLower.includes('revisión') || estadoLower.includes('laudo')) {
          badgeClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
          dotColor = 'bg-yellow-600';
      }
  
      // 3. Generación HTML (Usando clase .card-asunto para coincidir con tu HTML)
      const cardHtml = `
        <div class="card-asunto group relative bg-white border border-gray-200 rounded shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border-t-4 ${borderClass} cursor-pointer"
             data-id="${escapeHtml(asunto.id)}"
             data-expediente="${escapeHtml(asunto.expediente)}"
             data-estado="${escapeHtml(asunto.estado)}"
             data-prioridad="${escapeHtml(asunto.prioridad)}"
             data-materia="${escapeHtml(asunto.materia)}"
             data-gerencia="${escapeHtml(asunto.gerencia)}"
             data-abogado="${escapeHtml(asunto.abogado)}"
             data-partes="${escapeHtml(asunto.partes)}">
          
          <div class="p-5 pb-3">
              <div class="flex justify-between items-start mb-2">
                  <div>
                      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-headings">Expediente</span>
                      <h3 class="text-xl font-bold text-gob-gris group-hover:text-gob-guinda font-headings leading-tight transition-colors btn-ver-detalle" data-id="${escapeHtml(asunto.id)}">
                          ${escapeHtml(asunto.expediente)}
                      </h3>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border font-headings tracking-wide ${badgeClass}">
                      <span class="w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}"></span>
                      ${escapeHtml(asunto.estado.toUpperCase())}
                  </span>
              </div>
              
              <div class="flex flex-wrap gap-2 mb-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gob-gris uppercase border border-gray-200">
                      ${escapeHtml(asunto.materia)}
                  </span>
                  ${prioridad === 'Alta' ? `
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-gob-guinda border border-red-100 flex items-center">
                      <i class="fas fa-exclamation-circle mr-1"></i> Alta
                  </span>` : ''}
              </div>
  
              <p class="text-sm text-gray-600 font-sans line-clamp-2 mb-4">
                  ${escapeHtml(asunto.descripcion)}
              </p>
          </div>
  
          <div class="mt-auto bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs rounded-b">
              <div class="flex flex-col gap-1">
                  <div class="flex items-center text-gray-500" title="Abogado Responsable">
                      <i class="fas fa-user-tie w-4 text-gob-oro text-center mr-1"></i>
                      <span class="font-medium truncate max-w-[150px]">${escapeHtml(asunto.abogado)}</span>
                  </div>
                  <div class="flex items-center text-gray-500" title="Fecha Creación">
                      <i class="fas fa-calendar-alt w-4 text-gob-oro text-center mr-1"></i>
                      <span>${formatDate(asunto.fechaCreacion)}</span>
                  </div>
              </div>
              <button class="btn-ver-detalle text-gob-gris hover:text-gob-guinda hover:bg-white p-2 rounded-full transition-colors border border-transparent hover:border-gray-200 shadow-none hover:shadow-sm" data-id="${escapeHtml(asunto.id)}">
                  <i class="fas fa-chevron-right"></i>
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
      if (!modal || !form) return;
  
      form.reset();
      const prio = document.getElementById('na-prioridad');
      if (prio) prio.value = 'Media';
  
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
  
      const cerrar = () => {
          modal.classList.add('hidden');
          modal.style.display = 'none';
      };
  
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
        guardarNuevoAsunto(cerrar);
      };
    }
  
    function guardarNuevoAsunto(callbackCerrar) {
      const expediente = (document.getElementById('na-expediente')?.value || '').trim();
      const materia = (document.getElementById('na-materia')?.value || '').trim();
      const gerenciaCorporativa = (document.getElementById('na-gerencia-corporativa')?.value || '').trim();
      const sede = (document.getElementById('na-gerencia')?.value || '').trim();
      const abogado = (document.getElementById('na-abogado')?.value || '').trim();
      // Si no tienes input de partes, usa placeholder o ajusta tu HTML para tener id="na-partes"
      const partes = (document.getElementById('na-partes')?.value || '').trim(); 
      const tipoAsunto = (document.getElementById('na-tipo-asunto')?.value || '').trim(); // Asegúrate de tener este ID en tu HTML
      const organoJurisdiccional = (document.getElementById('na-organo-jurisdiccional')?.value || '').trim(); // Asegúrate de tener este ID
      const prioridad = (document.getElementById('na-prioridad')?.value || 'Media').trim();
      const descripcion = (document.getElementById('na-descripcion')?.value || '').trim(); // Asegúrate de tener este ID
  
      if (!expediente || !materia || !gerenciaCorporativa || !sede || !abogado) {
        alert('Por favor completa los campos obligatorios.');
        return;
      }
  
      const id = generarNuevoId();
      const hoyISO = new Date().toISOString().slice(0,10);
      const nuevoAsunto = {
        id, expediente, materia, gerencia: gerenciaCorporativa, sede,
        abogadoResponsable: abogado, partesProcesales: partes,
        tipoAsunto, organoJurisdiccional, prioridadAsunto: prioridad,
        descripcion, estado: 'Tramite', fechaCreacion: hoyISO,
        stats: { documentos: 0, audiencias: 0, terminos: 0, dias: 0 },
        ultimaActividad: hoyISO
      };
  
      const lista = getAsuntos();
      lista.unshift(nuevoAsunto);
      setAsuntos(lista);
      addCardToGrid(nuevoAsunto);
      if(callbackCerrar) callbackCerrar();
    }
  
    /* ---------- Contador Clicks (Tu lógica existente) ---------- */
    let contadorClicksNuevoAsunto = 0;
    function registrarClickNuevoAsunto() {
      contadorClicksNuevoAsunto++;
      if (contadorClicksNuevoAsunto >= 4) window.location.href = "precios.html";
    }
  
    /* ---------- Botones ---------- */
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
          btnPrimero.addEventListener('click', function(e){
              e.preventDefault();
              registrarClickNuevoAsunto();
              abrirModalNuevoAsunto();
          });
      }
      window.crearNuevoAsunto = function () {
        registrarClickNuevoAsunto();
        abrirModalNuevoAsunto();
      };
    }
  
    /* ---------- Delegación Ver Detalle ---------- */
    function wireDelegationVerDetalle() {
      const grid = document.getElementById('asuntos-grid') || document.body;
      grid.addEventListener('click', function (e) {
        const btn = e.target.closest('.btn-ver-detalle');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        const id = btn.dataset.id;
        if (id) window.location.href = `asunto-detalle.html?id=${encodeURIComponent(id)}`;
      });
    }
  
    /* ---------- Carga Inicial ---------- */
    function loadExistingAsuntos() {
      const grid = document.getElementById('asuntos-grid');
      const noResultados = document.getElementById('no-resultados');
      if (!grid) return;
  
      const asuntos = getAsuntos();
      // Generar datos ejemplo si está vacío
      if (asuntos.length === 0) {
        const ejemplosAsuntos = [
            { id: 1, expediente: '2375/2025', materia: 'Laboral', gerencia: 'Gerencia Laboral y Penal', sede: 'Ciudad de México', abogadoResponsable: 'Lic. María González', partesProcesales: 'Juan Ortega vs. Empresa S.A.', estado: 'Tramite', prioridadAsunto: 'Alta', descripcion: 'Demanda laboral por despido.', fechaCreacion: '2025-10-15' },
            { id: 2, expediente: '1595/2025', materia: 'Penal', gerencia: 'Gerencia Laboral y Penal', sede: 'Yucatán', abogadoResponsable: 'Lic. Ana Patricia', partesProcesales: 'Roberto Sosa vs. Comercializadora', estado: 'Firme', prioridadAsunto: 'Media', descripcion: 'Procedimiento penal.', fechaCreacion: '2025-10-20' },
            { id: 3, expediente: '2156/2025', materia: 'Civil', gerencia: 'Gerencia Civil', sede: 'Jalisco', abogadoResponsable: 'Lic. Sandra Jiménez', partesProcesales: 'Luis González vs. Inmobiliaria', estado: 'Tramite', prioridadAsunto: 'Alta', descripcion: 'Incumplimiento contrato.', fechaCreacion: '2025-10-25' }
        ];
        setAsuntos(ejemplosAsuntos);
      }
      
      const todosAsuntos = getAsuntos();
      grid.innerHTML = ''; // Limpiar placeholder del HTML
      if (todosAsuntos.length === 0) {
        if (noResultados) noResultados.classList.remove('hidden');
      } else {
        if (noResultados) noResultados.classList.add('hidden');
        todosAsuntos.forEach(asunto => addCardToGrid(asunto));
      }
    }
  
    /* ---------- Filtros ---------- */
    function initFilters() {
        const inputs = document.querySelectorAll('#filter-materia-asunto, #filter-estado-asunto, #filter-prioridad-asunto, #filter-abogado-asunto, #filter-gerencia-asunto, #buscador-global');
        inputs.forEach(input => {
            if(input) {
                input.addEventListener('input', applyFilters);
                input.addEventListener('change', applyFilters);
            }
        });
    }
  
    function applyFilters() {
      const filterMateria = document.getElementById('filter-materia-asunto')?.value.toLowerCase() || '';
      const filterEstado = document.getElementById('filter-estado-asunto')?.value.toLowerCase() || '';
      const filterPrioridad = document.getElementById('filter-prioridad-asunto')?.value.toLowerCase() || '';
      const filterAbogado = document.getElementById('filter-abogado-asunto')?.value.toLowerCase() || '';
      const filterGerencia = document.getElementById('filter-gerencia-asunto')?.value.toLowerCase() || '';
      const searchTerm = document.getElementById('buscador-global')?.value.toLowerCase() || '';
  
      // NOTA: Ahora buscamos '.card-asunto' porque es la clase que genera el nuevo addCardToGrid
      const cards = document.querySelectorAll('.card-asunto');
      let visibleCount = 0;
  
      cards.forEach(card => {
        const d = card.dataset;
        const matchMat = !filterMateria || (d.materia||'').toLowerCase() === filterMateria;
        const matchEst = !filterEstado || (d.estado||'').toLowerCase() === filterEstado;
        const matchPrio = !filterPrioridad || (d.prioridad||'').toLowerCase() === filterPrioridad;
        const matchAbo = !filterAbogado || (d.abogado||'').toLowerCase().includes(filterAbogado);
        const matchGer = !filterGerencia || (d.gerencia||'').toLowerCase() === filterGerencia;
        
        const textContent = `${d.expediente} ${d.materia} ${d.partes} ${d.abogado} ${d.gerencia}`.toLowerCase();
        const matchSearch = !searchTerm || textContent.includes(searchTerm);
  
        const show = matchMat && matchEst && matchPrio && matchAbo && matchGer && matchSearch;
        card.style.display = show ? '' : 'none';
        if(show) visibleCount++;
      });
  
      const noRes = document.getElementById('no-resultados');
      if(noRes) visibleCount === 0 ? noRes.classList.remove('hidden') : noRes.classList.add('hidden');
    }
  
    /* ---------- Init ---------- */
    document.addEventListener('DOMContentLoaded', function () {
      wireButtons();
      wireDelegationVerDetalle();
      loadExistingAsuntos();
      initFilters();
    });
  
    window.initAsuntos = function() {
      loadExistingAsuntos();
      applyFilters();
    };
  })();