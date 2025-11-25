// js/terminos.js

// ===============================================
// 1. CONFIGURACIÓN Y DATOS (INTACTO)
// ===============================================
const USER_ROLE = 'Direccion'; // Cambia esto para probar permisos

const FLUJO_ETAPAS = {
    'Proyectista': { siguiente: 'Revisión', accion: 'enviarRevision', label: 'Enviar a Revisión' },
    'Revisión':    { siguiente: 'Gerencia', anterior: 'Proyectista', accion: 'aprobar', label: 'Aprobar a Gerencia' },
    'Gerencia':    { siguiente: 'Dirección', anterior: 'Revisión', accion: 'aprobar', label: 'Aprobar a Dirección' },
    'Dirección':   { siguiente: 'Liberado', anterior: 'Gerencia', accion: 'aprobar', label: 'Liberar Término' },
    'Liberado':    { siguiente: 'Presentado', accion: 'subirAcuse', label: 'Subir Acuse' },
    'Presentado':  { siguiente: 'Concluido', accion: 'concluir', label: 'Concluir' }
};

const PERMISOS_ETAPAS = {
    'Proyectista': ['Abogado', 'Gerente','JefeDepto','Direccion'],
    'Revisión':    ['JefeDepto', 'Gerente', 'Direccion'],
    'Gerencia':    ['Gerente', 'Direccion'],
    'Dirección':   ['Direccion', 'Subdireccion'],
    'Liberado':    ['Abogado', 'JefeDepto', 'Gerente','Direccion'],
    'Presentado':  ['Direccion'],
    'Concluido':   []
};

let TERMINOS = [];

// ===============================================
// 2. INICIALIZACIÓN
// ===============================================
function initTerminos() {
    console.log("Iniciando módulo Términos V3...");
    cargarDatosIniciales();
    loadTerminos(); 
    setupSearchAndFilters();
    initModalTerminosJS();      
    initModalPresentar();       
    initModalReasignar();       
    setupFileUploads();
    setupActionMenuListener();
    cargarAsuntosEnSelectorJS();
    cargarAbogadosSelector();

    // Reemplazo de botón Nuevo con clonado para evitar duplicados
    const btnNuevo = document.getElementById('add-termino');
    if (btnNuevo) {
        const newBtn = btnNuevo.cloneNode(true);
        btnNuevo.parentNode.replaceChild(newBtn, btnNuevo);
        newBtn.addEventListener('click', () => openTerminoModalJS());
    }

    const btnExportar = document.getElementById('export-terminos');
    if (btnExportar) {
        const newBtnExp = btnExportar.cloneNode(true);
        btnExportar.parentNode.replaceChild(newBtnExp, btnExportar);
        newBtnExp.addEventListener('click', () => {
             if(typeof XLSX !== 'undefined') exportarTablaExcel(); 
             else alert('Librería de exportación no cargada.');
        });
    }
}

function cargarDatosIniciales() {
    const localData = JSON.parse(localStorage.getItem('terminos'));
    if (localData && localData.length > 0) {
        TERMINOS = localData;
    } else {
        TERMINOS = [
            { id: 1, expediente: '2375/2025', actor: 'Juan Perez', asunto: 'Despido', prestacion: 'Reinstalación', abogado: 'Lic. Martínez', estatus: 'Proyectista', fechaIngreso: '2025-11-01', fechaVencimiento: '2025-12-02', acuseDocumento: '' },
            { id: 2, expediente: '1090/2024', actor: 'Maria Lopez', asunto: 'Amparo', prestacion: 'Constitucional', abogado: 'Lic. González', estatus: 'Revisión', fechaIngreso: '2025-10-14', fechaVencimiento: '2025-12-08', acuseDocumento: '' },
            { id: 3, expediente: '2189/2025', actor: 'Rodrigo Paz', asunto: 'Despido', prestacion: 'Reinstalación', abogado: 'Lic. Martínez', estatus: 'Gerencia', fechaIngreso: '2025-11-11', fechaVencimiento: '2025-12-25', acuseDocumento: '' },
            { id: 4, expediente: '1000/2024', actor: 'Alam Ramses', asunto: 'Deespido', prestacion: 'Reinstalación', abogado: 'Lic. González', estatus: 'Dirección', fechaIngreso: '2025-10-30', fechaVencimiento: '2025-11-18', acuseDocumento: '' },
            { id: 5, expediente: '2274/2025', actor: 'Ricardo Dominguez', asunto: 'Despido', prestacion: 'Reinstalación', abogado: 'Lic. Martínez', estatus: 'Liberado', fechaIngreso: '2025-11-20', fechaVencimiento: '2025-11-12', acuseDocumento: '' },
            { id: 6, expediente: '1200/2024', actor: 'Aurora', asunto: 'Amparo', prestacion: 'Constitucional', abogado: 'Lic. González', estatus: 'Liberado', fechaIngreso: '2025-09-15', fechaVencimiento: '2025-10-22', acuseDocumento: '' },
            { id: 7, expediente: '1201/2024', actor: 'Ricardo Villalobos', asunto: 'Amparo', prestacion: 'Constitucional', abogado: 'Lic. González', estatus: 'Proyectista', fechaIngreso: '2025-11-25', fechaVencimiento: '2025-12-22', acuseDocumento: '' },
            {id: 8, expediente: '1200/2024', actor: 'Aurora', asunto: 'Amparo', prestacion: 'Constitucional', abogado: 'Lic. González', estatus: 'Liberado', fechaIngreso: '2025-09-15', fechaVencimiento: '2025-10-22', acuseDocumento: '' },
            { id: 9, expediente: '1201/2024', actor: 'Ricardo Villalobos', asunto: 'Amparo', prestacion: 'Constitucional', abogado: 'Lic. González', estatus: 'Proyectista', fechaIngreso: '2025-10-25', fechaVencimiento: '2025-11-25', acuseDocumento: '' }
        ];
        localStorage.setItem('terminos', JSON.stringify(TERMINOS));
    }
}

// ===============================================
// 3. RENDERIZADO (ACTUALIZADO A TAILWIND)
// ===============================================
function loadTerminos() {
    const tbody = document.getElementById('terminos-body');
    if(!tbody) return;

    // Filtros (igual lógica)
    const filtros = {
        tribunal: document.getElementById('filter-tribunal-termino')?.value.toLowerCase() || '',
        estado: document.getElementById('filter-estado-termino')?.value.toLowerCase() || '',
        estatus: document.getElementById('filter-estatus-termino')?.value || '',
        prioridad: document.getElementById('filter-prioridad-termino')?.value || '',
        materia: document.getElementById('filter-materia-termino')?.value || '',
        search: document.getElementById('search-terminos')?.value.toLowerCase() || ''
    };

    const listaFiltrada = TERMINOS.filter(t => {
        const textoCompleto = `${t.expediente} ${t.actor} ${t.asunto} ${t.abogado}`.toLowerCase();
        if (filtros.search && !textoCompleto.includes(filtros.search)) return false;
        if (filtros.estatus && !filtros.estatus.includes('todos') && t.estatus !== filtros.estatus) return false;
        if (filtros.prioridad && !filtros.prioridad.includes('todos') && t.prioridad !== filtros.prioridad) return false;
        return true;
    });

    let html = '';
    listaFiltrada.forEach(t => {
        // Clases Tailwind dinámicas
        const semaforoColor = getSemaforoColor(t.fechaVencimiento); 
        const badgeClass = getBadgeClass(t.estatus);
        
        // CALCULO DE TEXTO PARA EL TOOLTIP (Nuevo)
        const diasRestantes = calcularDiasRestantes(t.fechaVencimiento);
        let tooltipTexto = "";
        if (diasRestantes < 0) tooltipTexto = `Vencido hace ${Math.abs(diasRestantes)} días`;
        else if (diasRestantes === 0) tooltipTexto = "Vence HOY";
        else tooltipTexto = `Faltan ${diasRestantes} días`;
        
        html += `
        <tr class="bg-white hover:bg-gray-50 transition-colors group" data-id="${t.id}">
            <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center">
                    <div class="w-2.5 h-2.5 rounded-full mr-2 ${semaforoColor}" title="Estatus Vencimiento"></div>
                    <span class="text-sm font-medium text-gray-900">${formatDate(t.fechaIngreso)}</span>
                </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500 font-bold">${formatDate(t.fechaVencimiento)}</td>
            <td class="px-4 py-3 text-sm font-bold text-gob-guinda">${t.expediente}</td>
            <td class="px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate" title="${t.actor}">${t.actor}</td>
            <td class="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title="${t.asunto}">${t.asunto}</td> 
            <td class="px-4 py-3 text-sm text-gray-500">${t.prestacion || 'N/A'}</td> 
            <td class="px-4 py-3 text-sm text-gray-500">${t.abogado}</td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${badgeClass}">
                    ${t.estatus}
                </span>
            </td>
            
            <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-2 relative">
                    <button class="text-gray-400 hover:text-gob-oro action-edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    
                    <div class="relative action-menu-container">
                        <button class="text-gray-400 hover:text-gob-guinda action-menu-toggle px-2" title="Más Acciones">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="action-menu hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100 ring-1 ring-black ring-opacity-5">
                            ${generarAccionesRapidas(t, USER_ROLE)}
                        </div>
                    </div>
                    <input type="file" class="input-acuse-hidden hidden" data-id="${t.id}">
                </div>
            </td>
        </tr>
        `;
    });

    tbody.innerHTML = html;
}

function setupSearchAndFilters() {
    const ids = ['search-terminos', 'filter-tribunal-termino', 'filter-estado-termino', 'filter-estatus-termino', 'filter-prioridad-termino', 'filter-materia-termino'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', loadTerminos);
    });
}

// ===============================================
// 4. GENERACIÓN DE MENÚ (HTML ACTUALIZADO)
// ===============================================
function generarAccionesRapidas(termino, rol) {
    let html = '';
    const etapa = termino.estatus;
    const rolesPermitidos = PERMISOS_ETAPAS[etapa] || [];
    const puedeActuar = rolesPermitidos.includes(rol);

    const itemClass = "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center gap-2";

    html += `<button class="${itemClass} action-view-asunto"><i class="fas fa-briefcase text-gray-400"></i> Ver Asunto</button>`;
    html += `<button class="${itemClass} action-history"><i class="fas fa-eye text-gray-400"></i> Ver Historial</button>`;

    if (puedeActuar) {
        html += `<div class="border-t border-gray-100 my-1"></div>`;
        const config = FLUJO_ETAPAS[etapa];

        if (config) {
            if (config.accion === 'enviarRevision' || config.accion === 'aprobar') {
                html += `<button class="${itemClass} action-advance text-green-700"><i class="fas fa-check"></i> ${config.label}</button>`;
            }
            if (config.accion === 'subirAcuse') {
                html += `<button class="${itemClass} action-upload-acuse text-blue-700"><i class="fas fa-file-upload"></i> ${config.label}</button>`;
            }
            if (config.accion === 'concluir') {
                html += `<button class="${itemClass} action-conclude text-gob-guinda font-bold"><i class="fas fa-flag-checkered"></i> ${config.label}</button>`;
            }
            if (config.anterior) {
                html += `<button class="${itemClass} action-reject text-red-600"><i class="fas fa-times"></i> Rechazar</button>`;
            }
        }
    }

    if (rol === 'Gerente' || rol === 'Direccion') {
        html += `<div class="border-t border-gray-100 my-1"></div>`;
        //html += `<button class="${itemClass} action-reasignar"><i class="fas fa-user-friends"></i> Reasignar</button>`;
        if (rol === 'Direccion') {
            html += `<button class="${itemClass} action-delete text-red-600 font-bold"><i class="fas fa-trash-alt"></i> Eliminar</button>`;
        }
    }

    return html;
}

// Listener para el menú (Toggle de clase 'hidden' en lugar de 'show')
function setupActionMenuListener() {
    const tbody = document.getElementById('terminos-body');
    if(!tbody) return;

    tbody.addEventListener('click', function(e) {
        const target = e.target.closest('button');
        if (!target) return;

        const row = target.closest('tr');
        if (!row) return;
        const id = row.getAttribute('data-id');
        const termino = TERMINOS.find(t => t.id == id);

        // Toggle Menú
        if (target.classList.contains('action-menu-toggle')) {
            e.preventDefault();
            e.stopPropagation();

            const menu = target.nextElementSibling; 
            
            // Si ya está abierto, cerrar
            if (!menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
                menu.style.cssText = ''; // Limpiar estilos inline
                return;
            }

            // 1. Cerrar otros menús
            document.querySelectorAll('.action-menu').forEach(m => {
                m.classList.add('hidden');
                m.style.cssText = '';
            });

            // 2. Mostrar para poder medir su altura
            menu.classList.remove('hidden');

            // 3. CÁLCULOS DE POSICIÓN
            const rect = target.getBoundingClientRect(); // Posición del botón
            const menuHeight = menu.offsetHeight || 220; // Altura del menú (o estimado)
            const viewportHeight = window.innerHeight; // Altura de la pantalla
            const spaceBelow = viewportHeight - rect.bottom; // Espacio disponible abajo

            // 4. APLICAR ESTILOS
            menu.style.position = 'fixed';
            menu.style.left = (rect.left - 140) + 'px'; // Alineación horizontal
            menu.style.zIndex = '99999';
            menu.style.width = '12rem';

            // 5. DECISIÓN: ¿ARRIBA O ABAJO?
            if (spaceBelow < menuHeight) {
                // NO CABE ABAJO -> ABRIR HACIA ARRIBA
                menu.style.top = 'auto'; 
                // Calculamos la distancia desde el fondo de la pantalla hasta el tope del botón
                menu.style.bottom = (viewportHeight - rect.top + 5) + 'px';
                // Opcional: Agregar clase para estilizar la puntita del menú si tuviera
                menu.classList.add('open-upwards'); 
            } else {
                // SÍ CABE ABAJO -> ABRIR HACIA ABAJO (Normal)
                menu.style.bottom = 'auto';
                menu.style.top = (rect.bottom + 5) + 'px';
                menu.classList.remove('open-upwards');
            }
            
            return;
        }

        // Acciones
        if (target.classList.contains('action-edit')) openTerminoModalJS(termino);
        else if (target.classList.contains('action-advance')) avanzarEtapa(id);
        else if (target.classList.contains('action-reject')) regresarEtapa(id);
        else if (target.classList.contains('action-upload-acuse')) row.querySelector('.input-acuse-hidden').click();
        else if (target.classList.contains('action-conclude')) abrirModalPresentar(id, 'Concluir Término', 'Se marcará como finalizado.');
        //else if (target.classList.contains('action-reasignar')) abrirModalReasignar(id);
        else if (target.classList.contains('action-delete')) {
            if(confirm('¿Eliminar término permanentemente?')) {
                TERMINOS = TERMINOS.filter(t => t.id != id);
                guardarYRecargar();
            }
        }
        
      document.querySelectorAll('.action-menu').forEach(m => m.classList.add('hidden'));
    });
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.action-menu-toggle') && !e.target.closest('.action-menu')) {
            document.querySelectorAll('.action-menu').forEach(m => {
                m.classList.add('hidden');
                m.style.position = ''; // Limpiar estilos al cerrar
            });
        }
    });
    window.addEventListener('scroll', function() {
            document.querySelectorAll('.action-menu:not(.hidden)').forEach(m => {
                m.classList.add('hidden');
            });
        }, true);

}

// ===============================================
// 5. TRANSICIÓN DE ESTADOS (INTACTO)
// ===============================================
function avanzarEtapa(id) {
    const idx = TERMINOS.findIndex(t => t.id == id);
    if (idx === -1) return;
    const actual = TERMINOS[idx].estatus;
    const config = FLUJO_ETAPAS[actual];
    
    if(config && config.siguiente) {
        if (actual === 'Dirección') {
             abrirModalPresentar(id, 'Liberar Término', 'El término pasará a estado "Liberado".');
             return;
        }
        if(confirm(`¿Avanzar de ${actual} a ${config.siguiente}?`)) {
            TERMINOS[idx].estatus = config.siguiente;
            guardarYRecargar();
            mostrarMensajeGlobal(`Avanzado a ${config.siguiente}`, 'success');
        }
    }
}

function regresarEtapa(id) {
    const idx = TERMINOS.findIndex(t => t.id == id);
    if (idx === -1) return;
    const actual = TERMINOS[idx].estatus;
    const config = FLUJO_ETAPAS[actual];
    if(config && config.anterior) {
        const motivo = prompt("Motivo del rechazo:");
        if(motivo) {
            TERMINOS[idx].estatus = config.anterior;
            guardarYRecargar();
            mostrarMensajeGlobal(`Regresado a ${config.anterior}`, 'warning');
        }
    }
}

function guardarYRecargar() {
    localStorage.setItem('terminos', JSON.stringify(TERMINOS));
    loadTerminos();
}

// ===============================================
// 6. MODALES (SOLO ESTILOS DISPLAY FLEX/NONE)
// ===============================================
function initModalTerminosJS() {
   const modal = document.getElementById('modal-termino');
   const btnSave = document.getElementById('save-termino');
   document.querySelectorAll('#close-modal-termino, #cancel-termino').forEach(btn => {
       if(btn) btn.onclick = () => modal.style.display = 'none';
   });
   if(btnSave) {
       const newBtn = btnSave.cloneNode(true);
       btnSave.parentNode.replaceChild(newBtn, btnSave);
       newBtn.onclick = (e) => { e.preventDefault(); guardarTermino(); };
   }
}

function openTerminoModalJS(termino = null) {
    const modal = document.getElementById('modal-termino');
    const form = document.getElementById('form-termino');
    const title = document.getElementById('modal-termino-title');
    form.reset();
    cargarAsuntosEnSelectorJS();
    
    if (termino) {
        title.textContent = 'Editar Datos del Término';
        document.getElementById('termino-id').value = termino.id;
        if(document.getElementById('asunto-selector')) document.getElementById('asunto-selector').value = termino.asuntoId || '';
        document.getElementById('fecha-ingreso').value = termino.fechaIngreso || '';
        document.getElementById('fecha-vencimiento').value = termino.fechaVencimiento || '';
        document.getElementById('actuacion').value = termino.asunto || '';
        if(termino.asuntoId) cargarDatosAsuntoEnModalJS(termino.asuntoId);
    } else {
        title.textContent = 'Nuevo Término';
        document.getElementById('termino-id').value = '';
    }
    modal.style.display = 'flex';
}

function guardarTermino() {
    const id = document.getElementById('termino-id').value;
    const data = {
        asuntoId: document.getElementById('asunto-selector').value,
        fechaIngreso: document.getElementById('fecha-ingreso').value,
        fechaVencimiento: document.getElementById('fecha-vencimiento').value,
        asunto: document.getElementById('actuacion').value,
    };
    if(!data.asuntoId || !data.fechaVencimiento) return mostrarMensajeGlobal('Faltan campos obligatorios', 'danger');

    if(id) {
        const idx = TERMINOS.findIndex(t => t.id == id);
        if(idx !== -1) TERMINOS[idx] = { ...TERMINOS[idx], ...data };
    } else {
        TERMINOS.push({
            id: Date.now(),
            estatus: 'Proyectista',
            ...data,
            acuseDocumento: '',
            expediente: document.getElementById('termino-expediente').value,
            actor: document.getElementById('termino-partes').value,
            abogado: document.getElementById('termino-abogado').value
        });
    }
    guardarYRecargar();
    document.getElementById('modal-termino').style.display = 'none';
}

// --- Otros Modales (Reasignar, Presentar) ---
function initModalReasignar() {
    const modal = document.getElementById('modal-reasignar');
    const btnSave = document.getElementById('save-reasignar');
    document.querySelectorAll('#close-modal-reasignar, #cancel-reasignar').forEach(btn => btn.onclick = () => modal.style.display = 'none');
    if(btnSave) {
        const newBtn = btnSave.cloneNode(true);
        btnSave.parentNode.replaceChild(newBtn, btnSave);
        newBtn.onclick = () => {
            const id = document.getElementById('reasignar-termino-id').value;
            const sel = document.getElementById('select-nuevo-abogado');
            const idx = TERMINOS.findIndex(t => t.id == id);
            if(idx !== -1 && sel.value) {
                TERMINOS[idx].abogado = sel.options[sel.selectedIndex].text;
                guardarYRecargar();
                modal.style.display = 'none';
            }
        };
    }
}
function abrirModalReasignar(id) {
    const modal = document.getElementById('modal-reasignar');
    const termino = TERMINOS.find(t => t.id == id);
    if(!termino) return;
    document.getElementById('reasignar-termino-id').value = id;
    document.getElementById('reasignar-actuacion').value = termino.asunto;
    document.getElementById('reasignar-abogado-actual').value = termino.abogado;
    cargarAbogadosSelector();
    modal.style.display = 'flex';
}

function initModalPresentar() {
    const modal = document.getElementById('modal-presentar-termino');
    const btnConfirm = document.getElementById('confirmar-presentar');
    document.querySelectorAll('#close-modal-presentar, #cancel-presentar').forEach(btn => btn.onclick = () => modal.style.display = 'none');
    if(btnConfirm) {
        const newBtn = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);
        newBtn.onclick = () => {
            const id = document.getElementById('presentar-termino-id').value;
            const idx = TERMINOS.findIndex(t => t.id == id);
            if(idx !== -1) {
                const siguiente = FLUJO_ETAPAS[TERMINOS[idx].estatus]?.siguiente;
                if(siguiente) {
                    TERMINOS[idx].estatus = siguiente;
                    guardarYRecargar();
                    modal.style.display = 'none';
                }
            }
        };
    }
}
function abrirModalPresentar(id, titulo, mensaje) {
    const modal = document.getElementById('modal-presentar-termino');
    document.getElementById('presentar-termino-id').value = id;
    modal.style.display = 'flex';
}

// ===============================================
// 7. HELPERS VISUALES (TAILWIND MAPPINGS)
// ===============================================
function setupFileUploads() {
    const tbody = document.getElementById('terminos-body');
    if(tbody) {
        tbody.addEventListener('change', function(e) {
            if (e.target.classList.contains('input-acuse-hidden') && e.target.files.length > 0) {
                const id = e.target.getAttribute('data-id');
                const idx = TERMINOS.findIndex(t => t.id == id);
                if(idx !== -1) {
                    TERMINOS[idx].acuseDocumento = e.target.files[0].name;
                    if(TERMINOS[idx].estatus === 'Liberado') TERMINOS[idx].estatus = 'Presentado';
                    guardarYRecargar();
                    mostrarMensajeGlobal('Acuse subido', 'success');
                }
            }
        });
    }
}

function calcularDiasRestantes(fechaVencimiento) {
    if (!fechaVencimiento) return null;

    // Crear fechas asegurando que sean a las 00:00 horas para comparar solo días
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Parsear la fecha string (YYYY-MM-DD) para evitar problemas de zona horaria
    const [year, month, day] = fechaVencimiento.split('-').map(Number);
    const vencimiento = new Date(year, month - 1, day); // Mes es base 0 en JS

    // Diferencia en milisegundos
    const diferenciaMs = vencimiento - hoy;
    
    // Convertir a días (redondeando hacia arriba)
    return Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
}

function getSemaforoColor(fecha) {
  const dias = calcularDiasRestantes(fecha);
    
    if (dias === null) return 'bg-gray-300'; // Sin fecha

    if (dias < 0) return 'bg-red-700';      // Vencido (Rojo oscuro)
    if (dias === 0) return 'bg-red-500 animate-pulse'; // Vence HOY (Rojo parpadeante)
    if (dias <= 3) return 'bg-orange-500';  // Urgente (1-3 días) (Naranja)
    if (dias <= 7) return 'bg-yellow-400';  // Advertencia (4-7 días) (Amarillo)
    
    return 'bg-green-500';
}

function getBadgeClass(estatus) {
    switch(estatus) {
        case 'Proyectista': return 'bg-gray-100 text-gray-700 border-gray-200';
        case 'Liberado': return 'bg-green-100 text-green-800 border-green-200';
        case 'Concluido': return 'bg-gob-verde text-white border-gob-verdeDark';
        default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // Revisión, Gerencia, etc.
    }
}

function mostrarMensajeGlobal(msg, type) {
    const div = document.createElement('div');
    const color = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    div.className = `fixed top-5 right-5 px-6 py-3 text-white rounded shadow-lg z-50 ${color} animate-bounce`;
    div.innerText = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function exportarTablaExcel() {
    const ws = XLSX.utils.json_to_sheet(TERMINOS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Terminos");
    XLSX.writeFile(wb, "Terminos_Legales.xlsx");
}

function cargarAsuntosEnSelectorJS() {
    const sel = document.getElementById('asunto-selector');
    if(!sel) return;
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [{id:101, expediente:'Demo 1'}];
    sel.innerHTML = '<option value="">Seleccionar...</option>';
    asuntos.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.text = `${a.expediente} - ${a.descripcion || 'Sin desc.'}`;
        sel.appendChild(opt);
    });
}
function cargarDatosAsuntoEnModalJS(asuntoId) {
    const asuntos = JSON.parse(localStorage.getItem('asuntos')) || [];
    const a = asuntos.find(x => x.id == asuntoId);
    if(a) {
        document.getElementById('termino-expediente').value = a.expediente || '';
        document.getElementById('termino-materia').value = a.materia || '';
    }
}
function cargarAbogadosSelector() {
    const sel = document.getElementById('select-nuevo-abogado');
    if(!sel) return;
    sel.innerHTML = '<option value="">Seleccionar...</option><option value="Lic. A">Lic. A</option><option value="Lic. B">Lic. B</option>';
}
function formatDate(date) { return date; }