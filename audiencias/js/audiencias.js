// js/audiencias.js

const USER_ROLE = 'Gerente'; 

const estadosMexicoAudiencias = [
  'Aguascalientes','Baja California','Ciudad de México','Estado de México','Jalisco','Nuevo León','Puebla','Veracruz'
];

let AUDIENCIAS = [];

// -------------------------------
// Utilidades
// -------------------------------
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  // Asegurar formato YYYY-MM-DD para evitar problemas de zona horaria
  const parts = dateString.split('-');
  if(parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]); 
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return dateString;
}

function escapeHTML(str) {
  return (str || '').toString().replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function getSemaforoStatusAudiencia(fecha, hora) {
  if(!fecha || !hora) return { class: 'bg-gray-300', tooltip: 'Sin fecha' };
  
  const today = new Date();
  const audienciaDateTime = new Date(fecha + 'T' + hora);
  const diffTime = audienciaDateTime - today;
  const diffDays  = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffTime < 0) return { class: 'bg-gray-400', tooltip: 'Pasada' };
  if (diffDays <= 1) return { class: 'bg-red-600 animate-pulse', tooltip: '¡Es HOY o mañana!' };
  if (diffDays <= 3) return { class: 'bg-yellow-400', tooltip: `En ${diffDays} días` };
  return { class: 'bg-green-500', tooltip: `En ${diffDays} días` };
}

// -------------------------------
// Inicialización
// -------------------------------
function initAudiencias() {
    console.log('Iniciando Audiencias...');
    
    // 1. Cargar datos (con recuperación de errores)
    loadAudiencias(); 
    
    initModalComentarios();
    // 2. Inicializar Modales
    initModalAudiencias();
    initModalFinalizarAudiencia();
    initModalReasignarAudiencia(); 
    
    // 3. Configurar Listeners
    setupActionMenuListenerAudiencia();
    setupFilters();
    
    // Cargar selectores
    cargarAsuntosEnSelectorAudiencia();
    cargarAbogadosSelects();

    // 4. Configurar Buscador
    const searchInput = document.getElementById('search-audiencias');
    if(searchInput) searchInput.addEventListener('input', loadAudiencias);
}

// -------------------------------
// Renderizado (Tabla)
// -------------------------------
function loadAudiencias() {
  const tbody = document.getElementById('audiencias-body');
  if(!tbody) return;

  // Intentar cargar de localStorage
  let ls = [];
  try {
      ls = JSON.parse(localStorage.getItem('audiencias') || '[]');
  } catch (e) {
      console.error("Error leyendo datos, reseteando...", e);
      ls = [];
  }

  // Si no hay datos, cargar DEMO
  if (!ls || ls.length === 0) {
      ls = [
        { id: '1', expediente: '100/2025', tipo: 'Inicial', fecha: '2025-12-01', hora: '10:00', tribunal: 'Juzgado 1', actor: 'Juan Perez', atendida: false, actaDocumento: '', abogadoComparece: 'Lic. Demo' }, // Pendiente
        { id: '2', expediente: '200/2025', tipo: 'Intermedia', fecha: '2025-11-20', hora: '12:00', tribunal: 'Juzgado 2', actor: 'Maria Lopez', atendida: false, actaDocumento: 'Acta_Preliminar.pdf', abogadoComparece: 'Lic. Demo' }, // Con Acta
        { id: '3', expediente: '300/2025', tipo: 'Juicio', fecha: '2025-10-15', hora: '09:00', tribunal: 'Juzgado 3', actor: 'Pedro Sola', atendida: true, actaDocumento: 'Sentencia.pdf', abogadoComparece: 'Lic. Demo' } // Concluida
      ];
      localStorage.setItem('audiencias', JSON.stringify(ls));
  }
  AUDIENCIAS = ls;

  // Obtener valores de filtros de forma segura
  const filtroTipo = document.getElementById('filter-tipo')?.value || '';
  const filtroGerencia = (document.getElementById('filter-gerencia')?.value || '').toLowerCase();
  const filtroMateria = document.getElementById('filter-materia')?.value || '';
  const filtroPrioridad = document.getElementById('filter-prioridad')?.value || '';
  const busqueda = (document.getElementById('search-audiencias')?.value || '').toLowerCase();

  let html = '';
  
  AUDIENCIAS.forEach(a => {
    // Filtros
    const textoFila = `${a.expediente} ${a.actor} ${a.tribunal} ${a.tipo}`.toLowerCase();
    if (filtroTipo && a.tipo !== filtroTipo) return;
    if (filtroGerencia && !(a.gerencia || '').toLowerCase().includes(filtroGerencia)) return;
    if (filtroMateria && a.materia !== filtroMateria) return;
    if (filtroPrioridad && a.prioridad !== filtroPrioridad) return;
    if (busqueda && !textoFila.includes(busqueda)) return;

    // Lógica visual
    const sem = getSemaforoStatusAudiencia(a.fecha, a.hora);
    
    // --- NUEVA LÓGICA DE ESTADOS (3 ESTADOS) ---
    let estadoBadge = '';
    
    if (a.atendida) {
        // Estado: CONCLUIDA (Finalizada)
        estadoBadge = '<span class="inline-flex items-center bg-gray-800 text-white text-xs font-bold px-2.5 py-0.5 rounded border border-gray-600"><i class="fas fa-flag-checkered mr-1"></i> Concluida</span>';
    } else if (a.actaDocumento) {
        // Estado: CON ACTA (Tiene archivo, falta confirmar)
        estadoBadge = '<span class="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded border border-blue-200"><i class="fas fa-file-signature mr-1"></i> Con Acta</span>';
    } else {
        // Estado: PENDIENTE (No tiene archivo)
        estadoBadge = '<span class="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-0.5 rounded border border-yellow-200"><i class="fas fa-clock mr-1"></i> Pendiente</span>';
    }
      
    html += `
      <tr class="bg-white hover:bg-gray-50 border-b transition-colors group" data-id="${a.id}">
        <td class="px-4 py-3 text-center">
            <button class="text-gray-400 hover:text-gob-guinda toggle-expand transition-transform duration-200" data-id="${a.id}">
                <i class="fas fa-chevron-down"></i>
            </button>
        </td>
        <td class="px-4 py-3 whitespace-nowrap">
          <div class="flex items-center">
            <div class="w-3 h-3 rounded-full mr-2 ${sem.class}" title="${sem.tooltip}"></div>
            <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-900">${formatDate(a.fecha)}</span>
                <span class="text-xs text-gray-500">${a.hora} hrs</span>
            </div>
          </div>
        </td>
        <td class="px-4 py-3 text-sm text-gray-700">${escapeHTML(a.tribunal)}</td>
        <td class="px-4 py-3 text-sm font-bold text-gob-guinda">${escapeHTML(a.expediente)}</td>
        <td class="px-4 py-3 text-sm text-gray-600 truncate max-w-[150px]">${escapeHTML(a.actor)}</td>
        <td class="px-4 py-3">${estadoBadge}</td> <td class="px-4 py-3 text-right whitespace-nowrap relative">
            <div class="flex items-center justify-end gap-2">
                ${!a.atendida ? 
                    `<button class="text-gray-400 hover:text-gob-oro action-edit-audiencia p-1" title="Editar"><i class="fas fa-edit fa-lg"></i></button>` : 
                    `<button class="text-gray-200 cursor-not-allowed p-1" title="Cerrado"><i class="fas fa-lock fa-lg"></i></button>`
                }
                <div class="relative action-menu-container">

                    <button class="text-gray-400 hover:text-gob-guinda action-menu-toggle p-1 px-2 transition-colors" title="Acciones">
                        <i class="fas fa-ellipsis-v fa-lg"></i>
                    </button>
                    
                     <div class="action-menu hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100 ring-1 ring-black ring-opacity-5">

                        ${generarAccionesRapidasAudiencia(a, USER_ROLE)}
                    </div>
                </div>   
                <input type="file" class="input-acta-hidden hidden" data-id="${a.id}" accept=".pdf,.doc,.docx">
            </div>
        </td>
      </tr>
      
      <tr id="expand-row-${a.id}" class="hidden bg-gray-50 border-b shadow-inner">
        <td colspan="7" class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span class="block text-xs font-bold text-gray-400 uppercase">Tipo</span><span class="font-medium text-gray-800">${escapeHTML(a.tipo)}</span></div>
                <div><span class="block text-xs font-bold text-gray-400 uppercase">Abogado</span><span class="font-medium text-gray-800">${escapeHTML(a.abogadoComparece)}</span></div>
                <div><span class="block text-xs font-bold text-gray-400 uppercase">Observaciones</span><p class="text-gray-600 italic">${escapeHTML(a.observaciones)}</p></div>
            </div>
        </td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html || `<tr><td colspan="7" class="text-center py-8 text-gray-500">No hay datos.</td></tr>`;
}

// -------------------------------
// Reglas de Negocio (Menú)
// -------------------------------
function generarAccionesRapidasAudiencia(audiencia, rol) {
    let html = '';
    const itemClass = "w-full text-left px-4 py-3 text-sm text-gob-gris hover:bg-gray-50 hover:text-gob-guinda transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0";

    // Acciones Comunes
    html += `<button class="${itemClass} action-view-asunto-audiencia"><i class="fas fa-briefcase text-gray-400"></i> Ver Asunto</button>`;

// LÓGICA DE FLUJO DE 3 ESTADOS
    if (!audiencia.atendida) {
        // CASO: NO ESTÁ CONCLUIDA
        
        if (audiencia.actaDocumento) {
            // ESTADO: CON ACTA (Azul)
            // 1. Ver el acta subida
            html += `<button class="${itemClass} action-view-acta"><i class="fas fa-file-pdf text-blue-600"></i> Ver Acta</button>`;
            
            // 2. Acción Principal: CONCLUIR (Antes Desahogar)
            html += `<button class="${itemClass} action-desahogar"><i class="fas fa-flag-checkered text-green-600"></i> <strong>Concluir</strong></button>`;
            
            // 3. Corrección: Quitar Acta (Regresa a Pendiente)
            html += `<button class="${itemClass} action-remove-acta"><i class="fas fa-times-circle text-red-500"></i> Quitar Acta</button>`;
        
        } else {
            // ESTADO: PENDIENTE (Amarillo)
            // Solo permite subir el acta
            html += `<button class="${itemClass} action-upload-acta"><i class="fas fa-cloud-upload-alt text-gob-oro"></i> <strong>Subir Acta</strong></button>`;
        }
        
    } else {
        // CASO: ESTADO CONCLUIDA (Gris/Verde)
        // Ya no permite editar acta ni concluir de nuevo. Solo ver.
        if(audiencia.actaDocumento) {
            html += `<button class="${itemClass} action-view-acta"><i class="fas fa-download text-gray-400"></i> Descargar Acta</button>`;
        }
    }

    // Opciones Extras
    html += `<button class="${itemClass} action-comment-audiencia"><i class="fas fa-comment-dots text-gray-400"></i> Comentarios</button>`;
if (rol === 'Direccion' || rol === 'Gerente') {
        html += `<div class="border-t border-gray-100 my-1"></div>`;
        html += `<button class="${itemClass} action-reasignar-audiencia"><i class="fas fa-user-friends text-gob-oro"></i> Reasignar Abogado</button>`;
        
        if (rol === 'Direccion') {
            html += `<button class="${itemClass} action-delete-audiencia text-red-600 hover:bg-red-50"><i class="fas fa-trash-alt"></i> Eliminar</button>`;
        }
    }

    return html;
}

// -------------------------------
// Listeners & Menú Flotante Inteligente
// -------------------------------
/* Reemplaza esta función en js/audiencias.js */

function setupActionMenuListenerAudiencia() {
    const tbody = document.getElementById('audiencias-body');
    if (!tbody) return;

    // 1. Listener de Clics en la tabla
    tbody.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;

        const row = target.closest('tr');
        if (!row) return; 
        
        const id = row.getAttribute('data-id');
        
        // CORRECCIÓN AQUÍ: Usamos 'audiencia' en lugar de 'termino'
        // Y aseguramos que los IDs sean String para evitar errores de tipo
        const audiencia = AUDIENCIAS.find(t => String(t.id) === String(id));

        // 1. EXPANDIR FILA (Flecha)
        if (target.classList.contains('toggle-expand')) {
            const detailRow = document.getElementById(`expand-row-${id}`);
            if (detailRow) {
                detailRow.classList.toggle('hidden');
                const icon = target.querySelector('i');
                if(icon) { 
                    icon.classList.toggle('fa-chevron-up'); 
                    icon.classList.toggle('fa-chevron-down'); 
                }
            }
            return;
        }

        // 2. BOTÓN EDITAR (El lápiz fuera del menú)
        if (target.classList.contains('action-edit-audiencia')) {
            if (audiencia) {
                openAudienciaModal(audiencia);
            } else {
                console.error("Error: No se encontraron datos para la audiencia ID:", id);
            }
            return;
        }

        // 3. MENÚ FLOTANTE INTELIGENTE
        if (target.classList.contains('action-menu-toggle')) {
            e.preventDefault(); 
            e.stopPropagation();
            
            const menu = target.nextElementSibling; 
            
            // Si ya está abierto, cerrar
            if (!menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
                menu.style.cssText = ''; 
                return;
            }
            
            // Cerrar otros menús
            document.querySelectorAll('.action-menu').forEach(m => { 
                m.classList.add('hidden'); 
                m.style.cssText = ''; 
            });
            
            // Mostrar el menú actual
            menu.classList.remove('hidden');
            
            // Calcular posición
            const rect = target.getBoundingClientRect(); 
            const menuWidth = 224; 
            const menuHeight = menu.offsetHeight || 220; 
            const spaceBelow = window.innerHeight - rect.bottom;

            // Aplicar estilos fijos
            menu.style.position = 'fixed';
            menu.style.zIndex = '99999';
            menu.style.width = menuWidth + 'px';
            
            // Alinear a la derecha del botón
            menu.style.left = (rect.right - menuWidth) + 'px'; 

            // Decidir Arriba/Abajo
            if (spaceBelow < menuHeight) {
                menu.style.top = 'auto';
                menu.style.bottom = (window.innerHeight - rect.top + 5) + 'px';
                menu.classList.remove('border-t-4');
                menu.classList.add('border-b-4');
            } else {
                menu.style.bottom = 'auto';
                menu.style.top = (rect.bottom + 5) + 'px';
                menu.classList.add('border-t-4');
                menu.classList.remove('border-b-4');
            }
            return;
        }

        // 4. ACCIONES DENTRO DEL MENÚ
        // Aquí usamos la variable 'audiencia' que corregimos arriba
        if(audiencia) {
            if (target.classList.contains('action-view-asunto-audiencia')) window.location.href = `asuntos-detalle.html?id=${audiencia.asuntoId}`;
            else if (target.classList.contains('action-upload-acta')) row.querySelector('.input-acta-hidden').click();
            else if (target.classList.contains('action-remove-acta')) {
            mostrarConfirmacionAudiencia(
                'Quitar Acta',
                '¿Estás seguro de quitar el archivo adjunto? La audiencia regresará al estado "Pendiente".',
                () => {
                    quitarActa(id);
                }
            );
        }
            else if (target.classList.contains('action-desahogar')) openFinalizarAudienciaModal(id);
            else if (target.classList.contains('action-view-acta')) {
                mostrarAlertaAudiencia('Descargando documento: ' + audiencia.actaDocumento);
            }
            else if (target.classList.contains('action-reasignar-audiencia')) {
                abrirModalReasignarAudiencia(id);
            }
            else if (target.classList.contains('action-comment-audiencia')) openComentariosModal(id);
            else if (target.classList.contains('action-delete-audiencia')) {
            mostrarConfirmacionAudiencia(
                'Eliminar Audiencia',
                '¿Eliminar este registro permanentemente? Esta acción no se puede deshacer.',
                () => {
                    AUDIENCIAS = AUDIENCIAS.filter(a => String(a.id) !== String(id));
                    localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
                    loadAudiencias();
                }
            );
        }
    }
        
        // Ocultar menús tras acción
        document.querySelectorAll('.action-menu').forEach(m => m.classList.add('hidden'));
    });

    // Listeners globales
    document.addEventListener('click', e => {
        if (!e.target.closest('.action-menu-toggle')) document.querySelectorAll('.action-menu').forEach(m => m.classList.add('hidden'));
    });
    window.addEventListener('scroll', () => {
        document.querySelectorAll('.action-menu:not(.hidden)').forEach(m => m.classList.add('hidden'));
    }, true);
    
    // Listener input file
    tbody.addEventListener('change', function(e) {
        if (e.target.classList.contains('input-acta-hidden') && e.target.files.length) {
            subirActa(e.target.getAttribute('data-id'), e.target.files[0]);
        }
    });
}

function setupFilters() {
    ['filter-tipo','filter-gerencia','filter-materia','filter-prioridad'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('change', loadAudiencias);
        if(el && el.tagName === 'INPUT') el.addEventListener('input', loadAudiencias);
    });
}

// -------------------------------
// Lógica Negocio Actas
// -------------------------------
function subirActa(id, file) {
    const idx = AUDIENCIAS.findIndex(a => a.id == id);
    if (idx !== -1) {
        AUDIENCIAS[idx].actaDocumento = file.name;
        localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
        loadAudiencias();
        mostrarMensajeGlobal('Acta subida correctamente.', 'success');
    }
}

function quitarActa(id) {
    const idx = AUDIENCIAS.findIndex(a => a.id == id);
    if (idx !== -1) {
        AUDIENCIAS[idx].actaDocumento = '';
        localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
        loadAudiencias();
        mostrarMensajeGlobal('Acta eliminada.', 'warning');
    }
}

// -------------------------------
// Modales (Simplificados)
// -------------------------------
function initModalAudiencias() {
    const modal = document.getElementById('modal-audiencia');
    const btnAdd = document.getElementById('add-audiencia');
    const btnClose = document.getElementById('close-modal-audiencia');
    const btnCancel = document.getElementById('cancel-audiencia');
    const btnSave = document.getElementById('save-audiencia');

    if(btnAdd) btnAdd.onclick = () => openAudienciaModal();
    if(btnClose) btnClose.onclick = () => modal.style.display = 'none';
    if(btnCancel) btnCancel.onclick = () => modal.style.display = 'none';
    if(btnSave) btnSave.onclick = guardarAudiencia;
}

function openAudienciaModal(audiencia = null) {
    const modal = document.getElementById('modal-audiencia');
    const form = document.getElementById('form-audiencia');
    const title = document.getElementById('modal-audiencia-title');
    
    // Limpiar formulario
    form.reset();
    
    // Cargar selector de asuntos
    cargarAsuntosEnSelectorAudiencia();

    if(audiencia) {
        title.textContent = 'Editar Audiencia';
        
        // Llenar IDs
        document.getElementById('audiencia-id').value = audiencia.id;
        
        // Seleccionar el asunto (esto dispara el auto-llenado de datos readonly)
        const selector = document.getElementById('asunto-selector-audiencia');
        if(selector && audiencia.asuntoId) {
            selector.value = audiencia.asuntoId;
            // Disparar evento change manualmente para llenar datos automáticos
            selector.dispatchEvent(new Event('change'));
        }

        // Llenar campos editables
        if(document.getElementById('fecha-audiencia')) document.getElementById('fecha-audiencia').value = audiencia.fecha || '';
        if(document.getElementById('hora-audiencia')) document.getElementById('hora-audiencia').value = audiencia.hora || '';
        if(document.getElementById('sala-audiencia')) document.getElementById('sala-audiencia').value = audiencia.sala || '';
        if(document.getElementById('tipo-audiencia')) document.getElementById('tipo-audiencia').value = audiencia.tipo || '';
        
        // Llenar abogado comparece (si existe el campo)
        if(document.getElementById('abogado-comparece')) {
             // Asegurar que la opción exista o agregarla temporalmente
             const selAbogado = document.getElementById('abogado-comparece');
             if(audiencia.abogadoComparece && ![...selAbogado.options].some(o => o.value === audiencia.abogadoComparece)){
                 const opt = document.createElement('option');
                 opt.value = audiencia.abogadoComparece;
                 opt.text = audiencia.abogadoComparece;
                 selAbogado.appendChild(opt);
             }
             selAbogado.value = audiencia.abogadoComparece || '';
        }

    } else {
        title.textContent = 'Nueva Audiencia';
        document.getElementById('audiencia-id').value = '';
    }
    
    modal.style.display = 'flex';
}

function guardarAudiencia() {
    // Lógica básica de guardado
    const id = document.getElementById('audiencia-id').value;
    const fecha = document.getElementById('fecha-audiencia').value;
    const hora = document.getElementById('hora-audiencia').value;
    const asuntoId = document.getElementById('asunto-selector-audiencia').value;

    if(!fecha || !hora || !asuntoId) return alert('Completa los campos obligatorios');

    const nueva = {
        id: id || Date.now().toString(),
        fecha, hora, asuntoId,
        // Se deberían tomar todos los campos del form
        tipo: document.getElementById('tipo-audiencia').value || 'General',
        sala: document.getElementById('sala-audiencia').value,
        abogadoComparece: document.getElementById('abogado-comparece').value,
        
        // Campos heredados del asunto (simulados aquí, deberías obtenerlos del objeto asunto)
        expediente: document.getElementById('expediente-auto-audiencia').value,
        tribunal: document.getElementById('organo-auto-audiencia').value,
        actor: document.getElementById('partes-auto-audiencia').value,
        
        atendida: false,
        actaDocumento: ''
    };

    if(id) {
        const idx = AUDIENCIAS.findIndex(a => a.id == id);
        // Conservar datos no editables
        nueva.actaDocumento = AUDIENCIAS[idx].actaDocumento;
        nueva.atendida = AUDIENCIAS[idx].atendida;
        AUDIENCIAS[idx] = nueva;
    } else {
        AUDIENCIAS.push(nueva);
    }
    
    localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
    document.getElementById('modal-audiencia').style.display = 'none';
    loadAudiencias();
}

function initModalFinalizarAudiencia() {
    const modal = document.getElementById('modal-finalizar-audiencia');
    document.getElementById('close-modal-finalizar').onclick = () => modal.style.display='none';
    document.getElementById('cancel-finalizar').onclick = () => modal.style.display='none';
    
    document.getElementById('confirmar-finalizar').onclick = () => {
        const id = document.getElementById('finalizar-audiencia-id').value;
        const idx = AUDIENCIAS.findIndex(a => a.id == id);
        if(idx !== -1) {
            AUDIENCIAS[idx].atendida = true;
            AUDIENCIAS[idx].observaciones = document.getElementById('observaciones-finales').value;
            localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
            loadAudiencias();
            mostrarMensajeGlobal('Audiencia desahogada.', 'success');
        }
        modal.style.display='none';
    };
}

function openFinalizarAudienciaModal(id) {
    document.getElementById('finalizar-audiencia-id').value = id;
    document.getElementById('observaciones-finales').value = '';
    document.getElementById('modal-finalizar-audiencia').style.display = 'flex';
}

// -------------------------------
// LÓGICA DE COMENTARIOS (Faltante)
// -------------------------------

function initModalComentarios() {
    const modal = document.getElementById('modal-comentarios');
    const btnClose = document.getElementById('close-modal-comentarios');
    const btnSave = document.getElementById('save-comentario');

    if (btnClose) btnClose.onclick = () => modal.style.display = 'none';
    
    if (btnSave) {
        // Clonamos para evitar múltiples listeners si se reinicia
        const newBtn = btnSave.cloneNode(true);
        btnSave.parentNode.replaceChild(newBtn, btnSave);
        newBtn.onclick = guardarComentario;
    }

    // Cerrar al hacer clic fuera del contenido
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
}

function openComentariosModal(id) {
    const modal = document.getElementById('modal-comentarios');
    if (!modal) return console.error('No existe el modal de comentarios');

    // Guardar el ID de la audiencia que estamos comentando
    document.getElementById('comentarios-audiencia-id').value = id;
    document.getElementById('nuevo-comentario').value = '';
    
    renderComentarios(id);
    modal.style.display = 'flex';
}

function renderComentarios(id) {
    const lista = document.getElementById('lista-comentarios');
    lista.innerHTML = ''; // Limpiar lista anterior
    
    // Buscar la audiencia
    const audiencia = AUDIENCIAS.find(a => String(a.id) === String(id));
    if (!audiencia) return;

    // Obtener comentarios (si no existen, crear array vacío)
    const comentarios = audiencia.comentarios || [];

    if (comentarios.length === 0) {
        lista.innerHTML = '<li class="text-gray-400 text-sm italic text-center p-4">No hay comentarios registrados.</li>';
        return;
    }

    // Dibujar comentarios
    comentarios.forEach(c => {
        const li = document.createElement('li');
        li.className = "bg-gray-50 p-3 rounded border border-gray-200 text-sm";
        li.innerHTML = `
            <div class="flex justify-between mb-1">
                <span class="font-bold text-gob-guinda text-xs">${c.usuario}</span>
                <span class="text-gray-400 text-xs">${c.fecha}</span>
            </div>
            <div class="text-gray-700">${c.texto}</div>
        `;
        lista.appendChild(li);
    });
}

function guardarComentario() {
    const id = document.getElementById('comentarios-audiencia-id').value;
    const textoInput = document.getElementById('nuevo-comentario');
    const texto = textoInput.value.trim();
    
    if (!texto) return; // No guardar vacíos

    const idx = AUDIENCIAS.findIndex(a => String(a.id) === String(id));
    if (idx !== -1) {
        // Asegurar que el array de comentarios exista
        if (!AUDIENCIAS[idx].comentarios) AUDIENCIAS[idx].comentarios = [];
        
        // Agregar nuevo comentario
        AUDIENCIAS[idx].comentarios.push({
            texto: texto,
            usuario: 'Usuario Actual', // Aquí podrías poner el nombre del usuario logueado
            fecha: new Date().toLocaleString('es-MX')
        });
        
        // Guardar en localStorage
        localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
        
        // Limpiar y recargar
        textoInput.value = '';
        renderComentarios(id);
    }
}

// --- Helpers ---
function mostrarMensajeGlobal(msg, type) {
    const div = document.createElement('div');
    div.className = `fixed top-5 right-5 px-6 py-3 text-white rounded shadow-lg z-50 ${type==='success'?'bg-green-600':'bg-yellow-500'}`;
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function cargarAsuntosEnSelectorAudiencia() {
    const sel = document.getElementById('asunto-selector-audiencia');
    if(!sel) return;
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    asuntos.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.text = `${a.expediente} - ${a.descripcion || ''}`;
        sel.appendChild(opt);
    });
    sel.onchange = () => {
        const a = asuntos.find(x => x.id == sel.value);
        if(a) {
            // Auto-fill simple
            document.getElementById('expediente-auto-audiencia').value = a.expediente;
            document.getElementById('materia-auto-audiencia').value = a.materia;
            document.getElementById('partes-auto-audiencia').value = a.partes || a.partesProcesales;
            document.getElementById('organo-auto-audiencia').value = a.organoJurisdiccional;
        }
    };
}

// Renderizar opciones adicionales
function renderTipoOptions(){ 
    const sel = document.getElementById('tipo-audiencia');
    if(sel) sel.innerHTML += '<option>Inicial</option><option>Intermedia</option>'; 
}
function cargarAbogadosSelects(selectId = 'abogado-comparece') {
    const sel = document.getElementById(selectId);
    if(!sel) return;
    
    // Lista simulada o traer de localStorage('usuarios')
    const abogados = ['Lic. María González', 'Lic. Carlos Hernández', 'Lic. Ana Patricia', 'Lic. Roberto Silva'];
    
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    abogados.forEach(nombre => {
        const opt = document.createElement('option');
        opt.value = nombre; // O el ID si tienes
        opt.text = nombre;
        sel.appendChild(opt);
    });
}

// ===============================================
// SISTEMA DE CONFIRMACIÓN (AUDIENCIAS)
// ===============================================

let onConfirmAudiencia = null;

function mostrarConfirmacionAudiencia(titulo, mensaje, callback) {
    const modal = document.getElementById('modal-confirmacion-audiencia');
    const tituloEl = document.getElementById('confirm-titulo-audiencia');
    const mensajeEl = document.getElementById('confirm-mensaje-audiencia');
    const btnConfirm = document.getElementById('btn-confirm-accept-audiencia');
    const btnCancel = document.getElementById('btn-confirm-cancel-audiencia');

    if (!modal) return;

    tituloEl.textContent = titulo;
    mensajeEl.textContent = mensaje;
    onConfirmAudiencia = callback;

    // Listeners
    btnConfirm.onclick = function() {
        if (onConfirmAudiencia) onConfirmAudiencia();
        cerrarConfirmacionAudiencia();
    };
    btnCancel.onclick = cerrarConfirmacionAudiencia;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarConfirmacionAudiencia() {
    const modal = document.getElementById('modal-confirmacion-audiencia');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
    onConfirmAudiencia = null;
}

// ===============================================
// SISTEMA DE ALERTAS (AUDIENCIAS)
// ===============================================

function mostrarAlertaAudiencia(mensaje) {
    const modal = document.getElementById('modal-alerta-audiencia');
    const mensajeEl = document.getElementById('alerta-mensaje-audiencia');
    const btnAccept = document.getElementById('btn-alerta-accept-audiencia');

    if (!modal) return;

    // Configurar texto
    mensajeEl.textContent = mensaje;

    // Configurar botón
    btnAccept.onclick = cerrarAlertaAudiencia;

    // Mostrar
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarAlertaAudiencia() {
    const modal = document.getElementById('modal-alerta-audiencia');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// ===============================================
// LÓGICA DE REASIGNACIÓN 
// ===============================================

function initModalReasignarAudiencia() {
    const modal = document.getElementById('modal-reasignar-audiencia');
    const btnSave = document.getElementById('save-reasignar-audiencia');
    
    if(!modal) return;

    // Cerrar
    document.querySelectorAll('#close-modal-reasignar-audiencia, #cancel-reasignar-audiencia').forEach(btn => {
        btn.onclick = () => { 
            modal.classList.remove('flex'); 
            modal.classList.add('hidden'); 
        };
    });

    // Guardar
    if(btnSave) {
        // Clonar para limpiar eventos previos
        const newBtn = btnSave.cloneNode(true);
        btnSave.parentNode.replaceChild(newBtn, btnSave);
        
        newBtn.onclick = () => {
            const id = document.getElementById('reasignar-audiencia-id').value;
            const sel = document.getElementById('select-nuevo-abogado-audiencia');
            const idx = AUDIENCIAS.findIndex(t => String(t.id) === String(id));
            
            if(idx !== -1 && sel.value) {
                // Actualizamos el abogado que comparece
                AUDIENCIAS[idx].abogadoComparece = sel.options[sel.selectedIndex].text;
                localStorage.setItem('audiencias', JSON.stringify(AUDIENCIAS));
                loadAudiencias();
                
                modal.classList.remove('flex'); 
                modal.classList.add('hidden');
                mostrarMensajeGlobal('Abogado reasignado correctamente', 'success');
            } else {
                alert("Selecciona un abogado");
            }
        };
    }
}

function abrirModalReasignarAudiencia(id) {
    const modal = document.getElementById('modal-reasignar-audiencia');
    const audiencia = AUDIENCIAS.find(t => String(t.id) === String(id));
    if(!audiencia) return;

    document.getElementById('reasignar-audiencia-id').value = id;
    
    // Mostrar datos actuales
    document.getElementById('reasignar-tipo-audiencia').value = audiencia.tipo; 
    document.getElementById('reasignar-abogado-actual-audiencia').value = audiencia.abogadoComparece || 'Sin asignar';
    
    // Cargar lista de abogados (Simulada o de localStorage)
    cargarAbogadosSelects('select-nuevo-abogado-audiencia');
    
    modal.classList.remove('hidden'); 
    modal.classList.add('flex');
}