/* ====== LÓGICA DE EXPEDIENTES (V3) ====== */
(function () {
    /* ---------- Utils ---------- */
    function getAsuntos() { try { return JSON.parse(localStorage.getItem('asuntos')) || []; } catch { return []; } }
    function setAsuntos(list) { localStorage.setItem('asuntos', JSON.stringify(list)); }
    function generarNuevoId() { const lista = getAsuntos(); const max = lista.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0); return max + 1; }
    function formatDate(dateStr) { if (!dateStr) return 'N/A'; try { const date = new Date(dateStr); return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return dateStr; } }
    function escapeHtml(s) { return (s ?? '').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
  
    /* ---------- Render: Tarjeta V3 ---------- */
    function addCardToGrid(asuntoRaw) {
      const grid = document.getElementById('asuntos-grid');
      if (!grid) return;
  
      const asunto = {
        id: asuntoRaw.id,
        expediente: asuntoRaw.expediente || '',
        estado: asuntoRaw.estado || 'Tramite',
        prioridad: asuntoRaw.prioridadAsunto || asuntoRaw.prioridad || 'Media',
        materia: asuntoRaw.materia || '',
        gerencia: asuntoRaw.gerencia || asuntoRaw.gerenciaCorporativa || '',
        sede: asuntoRaw.sede || asuntoRaw.gerenciaEstatal || '',
        abogado: asuntoRaw.abogadoResponsable || asuntoRaw.abogado || 'Sin asignar',
        partes: asuntoRaw.partesProcesales || asuntoRaw.partes || ((asuntoRaw.nombre ? asuntoRaw.nombre : '') + (asuntoRaw.demandado ? ` vs ${asuntoRaw.demandado}` : '')).trim() || 'N/D',
        fechaCreacion: asuntoRaw.fechaCreacion || '',
        descripcion: asuntoRaw.descripcion || 'Sin descripción.'
      };
  
      let borderClass = 'border-gray-300';
      if(asunto.prioridad === 'Alta') borderClass = 'border-gob-guinda';
      if(asunto.prioridad === 'Media') borderClass = 'border-gob-oro';
      
      let badgeClass = 'bg-gray-100 text-gray-600 border-gray-200';
      let dotColor = 'bg-gray-400';
      const estadoLower = asunto.estado.toLowerCase();
      
      if(estadoLower.includes('tramite') || estadoLower.includes('activo')) {
          badgeClass = 'bg-green-50 text-green-700 border-green-200'; dotColor = 'bg-green-600';
      } else if (estadoLower.includes('revisión') || estadoLower.includes('laudo')) {
          badgeClass = 'bg-yellow-50 text-yellow-700 border-yellow-200'; dotColor = 'bg-yellow-600';
      }
  
      const cardHtml = `
        <div class="card-asunto group relative bg-white border border-gray-200 rounded shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border-t-4 ${borderClass} cursor-pointer"
             data-id="${escapeHtml(asunto.id)}" data-expediente="${escapeHtml(asunto.expediente)}" data-estado="${escapeHtml(asunto.estado)}" data-prioridad="${escapeHtml(asunto.prioridad)}" data-materia="${escapeHtml(asunto.materia)}" data-gerencia="${escapeHtml(asunto.gerencia)}" data-abogado="${escapeHtml(asunto.abogado)}" data-partes="${escapeHtml(asunto.partes)}">
          
          <div class="p-5 pb-3">
              <div class="flex justify-between items-start mb-2">
                  <div>
                      <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-headings">Expediente</span>
                      <h3 class="text-xl font-bold text-gob-gris group-hover:text-gob-guinda font-headings leading-tight transition-colors btn-ver-detalle" data-id="${escapeHtml(asunto.id)}">${escapeHtml(asunto.expediente)}</h3>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border font-headings tracking-wide ${badgeClass}"><span class="w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}"></span>${escapeHtml(asunto.estado.toUpperCase())}</span>
              </div>
              <div class="flex flex-wrap gap-2 mb-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gob-gris uppercase border border-gray-200">${escapeHtml(asunto.materia)}</span>
                  ${asunto.prioridad === 'Alta' ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-gob-guinda border border-red-100 flex items-center"><i class="fas fa-exclamation-circle mr-1"></i> Alta</span>` : ''}
              </div>
              <p class="text-sm text-gray-600 font-sans line-clamp-2 mb-4">${escapeHtml(asunto.descripcion)}</p>
          </div>
          <div class="mt-auto bg-gray-50 px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs rounded-b">
              <div class="flex flex-col gap-1">
                  <div class="flex items-center text-gray-500"><i class="fas fa-user-tie w-4 text-gob-oro text-center mr-1"></i><span class="font-medium truncate max-w-[150px]">${escapeHtml(asunto.abogado)}</span></div>
                  <div class="flex items-center text-gray-500"><i class="fas fa-calendar-alt w-4 text-gob-oro text-center mr-1"></i><span>${formatDate(asunto.fechaCreacion)}</span></div>
              </div>
              <button class="btn-ver-detalle text-gob-gris hover:text-gob-guinda hover:bg-white p-2 rounded-full transition-colors border border-transparent hover:border-gray-200 shadow-none hover:shadow-sm" data-id="${escapeHtml(asunto.id)}"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
      `;
      grid.insertAdjacentHTML('afterbegin', cardHtml);
    }
  
    /* ---------- Modales ---------- */
    function abrirModalNuevoAsunto() {
      const modal = document.getElementById('modal-nuevo-asunto');
      const form = document.getElementById('form-nuevo-asunto');
      if (!modal || !form) return;
      form.reset();
      const prio = document.getElementById('na-prioridad');
      if (prio) prio.value = 'Media';
      modal.classList.remove('hidden'); modal.classList.add('flex');
    }

    function cerrarModalNuevoAsunto() {
        const modal = document.getElementById('modal-nuevo-asunto');
        if(modal) { modal.classList.remove('flex'); modal.classList.add('hidden'); }
    }
  
    function guardarNuevoAsunto() {
      const expediente = (document.getElementById('na-expediente')?.value || '').trim();
      const materia = (document.getElementById('na-materia')?.value || '').trim();
      const gerencia = (document.getElementById('na-gerencia-corporativa')?.value || '').trim();
      const sede = (document.getElementById('na-gerencia')?.value || '').trim();
      const abogado = (document.getElementById('na-abogado')?.value || '').trim();
      const partes = (document.getElementById('na-partes')?.value || '').trim(); 
      const tipo = (document.getElementById('na-tipo-asunto')?.value || '').trim();
      const organo = (document.getElementById('na-organo-jurisdiccional')?.value || '').trim();
      const prioridad = (document.getElementById('na-prioridad')?.value || 'Media').trim();
      const descripcion = (document.getElementById('na-descripcion')?.value || '').trim();
  
      if (!expediente || !materia || !gerencia || !sede || !abogado) return alert('Completa los campos obligatorios');
  
      const nuevoAsunto = {
        id: generarNuevoId(),
        expediente, materia, gerencia, sede, abogadoResponsable: abogado, partesProcesales: partes,
        tipoAsunto: tipo, organoJurisdiccional: organo, prioridadAsunto: prioridad, descripcion,
        estado: 'Tramite', fechaCreacion: new Date().toISOString().slice(0,10),
        stats: { documentos: 0, audiencias: 0, terminos: 0, dias: 0 }, ultimaActividad: new Date().toISOString()
      };
  
      const lista = getAsuntos();
      lista.unshift(nuevoAsunto);
      setAsuntos(lista);
      addCardToGrid(nuevoAsunto);
      cerrarModalNuevoAsunto();
    }
  
    /* ---------- Carga Inicial ---------- */
    function loadExistingAsuntos() {
      const grid = document.getElementById('asuntos-grid');
      const noResultados = document.getElementById('no-resultados');
      if (!grid) return;
  
      const asuntos = getAsuntos();
      if (asuntos.length === 0) {
        setAsuntos([
            { id: 1, expediente: '2375/2025', materia: 'Laboral', gerencia: 'Gerencia Laboral', sede: 'CDMX', abogadoResponsable: 'Lic. María', partesProcesales: 'Juan vs. Empresa', estado: 'Tramite', prioridadAsunto: 'Alta', descripcion: 'Demanda laboral...', fechaCreacion: '2025-10-15' },
            { id: 2, expediente: '1595/2025', materia: 'Penal', gerencia: 'Gerencia Penal', sede: 'Yucatán', abogadoResponsable: 'Lic. Ana', partesProcesales: 'Roberto vs. Comercializadora', estado: 'Firme', prioridadAsunto: 'Media', descripcion: 'Procedimiento penal.', fechaCreacion: '2025-10-20' }
        ]);
      }
      const todos = getAsuntos();
      grid.innerHTML = '';
      if (todos.length === 0) {
        if (noResultados) noResultados.classList.remove('hidden');
      } else {
        if (noResultados) noResultados.classList.add('hidden');
        todos.forEach(asunto => addCardToGrid(asunto));
      }
    }
  
    /* ---------- Filtros ---------- */
    function initFilters() {
        const inputs = document.querySelectorAll('#filter-materia-asunto, #filter-estado-asunto, #filter-prioridad-asunto, #filter-abogado-asunto, #filter-gerencia-asunto, #buscador-global');
        inputs.forEach(input => { if(input) { input.addEventListener('input', applyFilters); input.addEventListener('change', applyFilters); } });
    }
  
    function applyFilters() {
      const filterMateria = document.getElementById('filter-materia-asunto')?.value.toLowerCase() || '';
      const filterEstado = document.getElementById('filter-estado-asunto')?.value.toLowerCase() || '';
      const filterPrioridad = document.getElementById('filter-prioridad-asunto')?.value.toLowerCase() || '';
      const filterAbogado = document.getElementById('filter-abogado-asunto')?.value.toLowerCase() || '';
      const filterGerencia = document.getElementById('filter-gerencia-asunto')?.value.toLowerCase() || '';
      const searchTerm = document.getElementById('buscador-global')?.value.toLowerCase() || '';
  
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

    // Lógica para campos de transparencia
    function setupMateriaFields() {
        const materiaSelect = document.getElementById("na-materia");
        const fields = document.querySelectorAll(".field-transparencia-asunto");
        if (!materiaSelect) return;
        materiaSelect.addEventListener("change", function () {
          const isTransp = this.value === "Transparencia";
          fields.forEach((f) => { isTransp ? f.classList.remove("hidden") : f.classList.add("hidden"); });
        });
    }
  
    /* ---------- Public Init ---------- */
    window.initExpedientes = function() {
      // Event Listeners
      const btnNuevo = document.getElementById('nuevo-asunto');
      if(btnNuevo) btnNuevo.addEventListener('click', abrirModalNuevoAsunto);
      
      const btnCerrar = document.getElementById('cerrar-modal-nuevo-asunto');
      const btnCancelar = document.getElementById('cancelar-nuevo-asunto');
      if(btnCerrar) btnCerrar.addEventListener('click', cerrarModalNuevoAsunto);
      if(btnCancelar) btnCancelar.addEventListener('click', cerrarModalNuevoAsunto);

      const form = document.getElementById('form-nuevo-asunto');
      if(form) form.addEventListener('submit', (e) => { e.preventDefault(); guardarNuevoAsunto(); });

      // Click en Grid (Delegación)
      const grid = document.getElementById('asuntos-grid');
      if(grid) {
          grid.addEventListener('click', function(e) {
              const btn = e.target.closest('.btn-ver-detalle');
              if(!btn) return;
              e.preventDefault(); e.stopPropagation();
              // Ajusta la ruta si 'asunto-detalle.html' está en la raíz o en /expedientes/
              // Asumiendo que quieres ir a la página de detalle (que probablemente modularizaremos después)
              // Por ahora, apunta a la raíz:
              window.location.href = `../asunto-detalle.html?id=${encodeURIComponent(btn.dataset.id)}`;
          });
      }

      loadExistingAsuntos();
      initFilters();
      setupMateriaFields();
    };
})();