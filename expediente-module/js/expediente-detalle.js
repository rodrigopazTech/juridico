import { expedienteById, updateExpediente } from '../data/expedientes-data.js';
import { OrganosManager } from './organos-manager.js';

export class ExpedienteDetalleModule {
    constructor() {
        this.id = null;
        this.expediente = null;
        this.currentPath = []; 
        this.currentView = 'grid'; // Nuevo: 'grid' | 'list'
        this.currentFolderId = null; // Guardamos esto para recargar al cambiar vista
        this.currentLabel = 'Inicio'; // Guardamos el nombre actual
    }
    get userRole() {
        // Obtenemos el rol guardado (o 'Abogado' por defecto si no existe)
        return localStorage.getItem('rol') || 'DIRECCION';
    }

    canUserDelete() {
        // Normalizamos a mayúsculas para evitar errores (Dirección, direccion, DIRECCION)
        const rol = this.userRole.toUpperCase();
        // Solo retorna TRUE si el rol es DIRECCIÓN (o DIRECTOR)
        return rol === 'DIRECCIÓN' || rol === 'DIRECCION' || rol === 'DIRECTOR';
    }

    init() {
        this.parseId();
        if (!this.id) { this.renderError('ID inválido.'); return; }
        
        this.loadData();
        if (!this.expediente) { this.renderError('Expediente no encontrado.'); return; }
        
        this.populateVista360();
        
        setTimeout(() => { 
            this.renderTimeline();
            this.setupModals(); 
            this.setupDocumentsModule(); // Carga la lista corta
            this.setupObservacionesModule();
            this.setupHistoricoLegalModule(); 
            this.setupExplorer(); 
            const manager = new OrganosManager();
            manager.init();
        }, 500);
    }
    parseId() {
        const params = new URLSearchParams(window.location.search);
        this.id = params.get('id');
    }

    loadData() {
        this.expediente = expedienteById(this.id);
        
        if (!this.expediente.documentos) this.expediente.documentos = [];
        if (!this.expediente.observaciones) this.expediente.observaciones = [];
        
        if (!this.expediente.actividad) {
            this.expediente.actividad = [{ fecha: new Date().toISOString(), titulo: 'Expediente Consultado', descripcion: 'Acceso al detalle.', tipo: 'info' }];
        }
    }

    setupDocumentsModule() {
        this.renderDocumentsTable();
        
    }
    renderDocumentsTable() {
        const tbody = document.getElementById('tabla-documentos-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        const allDocs = this.expediente.documentos || [];
        
        // 1. Clonar y Ordenar (El más nuevo al principio)
        // Asumimos que los nuevos se agregan al final (push), así que reverse() basta.
        const recentDocs = [...allDocs].reverse().slice(0, 5); // SOLO LOS 5 ÚLTIMOS

        if (recentDocs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400 italic text-xs">Sin actividad reciente en documentos.</td></tr>`;
            return;
        }

        recentDocs.forEach((doc) => {
            // TRUCO IMPORTANTE: Encontrar el índice REAL en el array original
            // para que los botones de eliminar/ver funcionen correctamente.
            const realIndex = this.expediente.documentos.indexOf(doc);

            const row = document.createElement('tr');
            row.className = 'bg-white border-b hover:bg-gray-50 transition-colors group';
            
            let iconClass = 'fa-file-alt text-gray-400';
            if (doc.nombre.endsWith('.pdf')) iconClass = 'fa-file-pdf text-red-500';
            else if (doc.nombre.endsWith('.doc') || doc.nombre.endsWith('.docx')) iconClass = 'fa-file-word text-blue-600';
            
            row.innerHTML = `
                <td class="px-6 py-3">
                    <div class="flex items-center gap-3">
                        <div class="p-1.5 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                            <i class="fas ${iconClass} text-lg"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="font-bold text-gray-700 text-xs truncate max-w-[200px]" title="${doc.nombre}">${doc.nombre}</div>
                            <div class="text-[9px] text-gray-400 font-medium uppercase">${doc.tipo}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-3 hidden sm:table-cell">
                    <p class="text-gray-500 italic text-[10px] max-w-xs truncate" title="${doc.comentario}">${doc.comentario}</p>
                </td>
                <td class="px-6 py-3 text-gray-400 text-[10px] font-mono whitespace-nowrap">${doc.fecha}</td>
                <td class="px-6 py-3 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button class="btn-preview-doc w-7 h-7 rounded bg-gray-100 text-gray-600 hover:bg-gob-guinda hover:text-white transition-all" data-index="${realIndex}" title="Ver"><i class="fas fa-eye text-xs"></i></button>
                        <button class="btn-download-doc w-7 h-7 rounded bg-gray-100 text-gray-600 hover:bg-blue-600 hover:text-white transition-all" data-index="${realIndex}" title="Descargar"><i class="fas fa-download text-xs"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.asignarListenersDocumentos();
    }

    // ==========================================
    // 2. VISTA 360 Y DATOS GENERALES
    // ==========================================
    populateVista360() {
        const e = this.expediente;
        const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text || '—'; };

        setText('v360-numero', e.numero);
        setText('v360-materia', e.materia);
        setText('v360-gerencia', e.gerencia);
        setText('v360-abogado', e.abogado);
        setText('v360-sede', e.sede);
        setText('v360-partes', e.partes);
        setText('v360-organo', e.organo);
        
        const elPrio = document.getElementById('v360-prioridad');
        if (elPrio) {
            elPrio.textContent = e.prioridad || 'Media';
            elPrio.className = `text-sm font-bold ${e.prioridad === 'Alta' ? 'text-red-700' : (e.prioridad === 'Baja' ? 'text-gray-600' : 'text-orange-600')}`;
        }

        const elEstado = document.getElementById('v360-estado');
        if (elEstado) {
            const st = (e.estado || 'TRAMITE').toUpperCase();
            elEstado.textContent = st;
            
            let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
            if (st === 'TRAMITE') colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
            else if (st === 'LAUDO') colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
            else if (st === 'FIRME') colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
            
            elEstado.className = `px-3 py-1 rounded-full text-sm font-bold border uppercase tracking-wide font-headings ${colorClass}`;
        }

        const descContainer = document.getElementById('v360-descripcion-container');
        const descText = document.getElementById('v360-descripcion');
        if (e.descripcion && descContainer) {
            descText.textContent = e.descripcion;
            descContainer.classList.remove('hidden');
        }

        this.actualizarHeader();
    }

    actualizarHeader() {
        const tituloEl = document.getElementById('detalle-titulo');
        if (tituloEl && this.expediente) {
            tituloEl.innerHTML = `<i class="fas fa-folder-open text-gob-oro mr-2"></i> ${this.expediente.numero}`;
        }
    }

    // ==========================================
    // 3. NUEVO EXPLORADOR (GESTOR DOCUMENTAL)
    // ==========================================
    setupExplorer() {
        const modal = document.getElementById('modal-explorer');
        const btnOpen = document.getElementById('btn-open-explorer'); 
        const btnClose = document.getElementById('close-explorer');
        const inputFile = document.getElementById('input-explorer-upload');
        const btnUpload = document.getElementById('btn-upload-explorer');
        const btnNewFolder = document.getElementById('btn-new-folder'); // NUEVO

        // Botones de Vista
        const btnGrid = document.getElementById('view-grid');
        const btnList = document.getElementById('view-list');

        if (btnGrid) {
            btnGrid.onclick = () => {
                this.currentView = 'grid';
                this.updateViewButtons();
                if(this.currentFolderId) this.loadFolder(this.currentFolderId, this.currentLabel);
            };
        }
        if (btnList) {
            btnList.onclick = () => {
                this.currentView = 'list';
                this.updateViewButtons();
                if(this.currentFolderId) this.loadFolder(this.currentFolderId, this.currentLabel);
            };
        }

        // BUSCADOR EN TIEMPO REAL
        const searchInput = document.getElementById('explorer-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('#explorer-content > div');
                
                cards.forEach(card => {
                    const nameSpan = card.querySelector('span[title], .truncate'); 
                    const name = nameSpan ? nameSpan.textContent.toLowerCase() : '';
                    
                    if (name.includes(term)) {
                        card.style.display = ''; 
                    } else {
                        card.style.display = 'none'; 
                    }
                });
            });
        }

        // ACCIÓN: NUEVA CARPETA
        if (btnNewFolder) {
            btnNewFolder.onclick = () => {
                if (this.currentFolderId === 'terminos') {
                    Swal.fire('Gestión de Términos', 'Para agregar una carpeta aquí, debes registrar un nuevo Término Legal desde el módulo correspondiente.', 'info');
                } else if (this.currentFolderId === 'audiencias') {
                    Swal.fire('Gestión de Audiencias', 'Para agregar una carpeta aquí, debes agendar una nueva Audiencia.', 'info');
                } else if (this.currentFolderId === 'anexos') {
                    // Aquí sí podríamos permitir crear carpetas lógicas en el futuro
                    Swal.fire('Nueva Carpeta', 'Función para crear sub-carpetas en Anexos (Próximamente).', 'success');
                } else {
                    Swal.fire('Acción no permitida', 'No puedes crear carpetas en la raíz o dentro de un expediente cerrado.', 'warning');
                }
            };
        }

        // Abrir Modal
        if (btnOpen) btnOpen.onclick = () => {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            this.renderTree(); 
            this.updateViewButtons(); 
        };

        // Cerrar Modal
        if (btnClose) btnClose.onclick = () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        };

        // Subir Archivo
        if (btnUpload && inputFile) {
            btnUpload.onclick = () => inputFile.click();
            inputFile.onchange = (e) => {
                if (e.target.files.length > 0) {
                    this.handleExplorerUpload(e.target.files[0]);
                }
            };
        }
    }

    // Helper visual para resaltar el botón activo
    updateViewButtons() {
        const btnGrid = document.getElementById('view-grid');
        const btnList = document.getElementById('view-list');
        
        if (this.currentView === 'grid') {
            btnGrid.className = "p-1.5 rounded bg-white shadow-sm text-gob-guinda text-xs transition-all";
            btnList.className = "p-1.5 rounded hover:bg-white hover:shadow-sm text-gray-400 hover:text-gob-guinda text-xs transition-all";
        } else {
            btnGrid.className = "p-1.5 rounded hover:bg-white hover:shadow-sm text-gray-400 hover:text-gob-guinda text-xs transition-all";
            btnList.className = "p-1.5 rounded bg-white shadow-sm text-gob-guinda text-xs transition-all";
        }
    }

   renderTree() {
        const treeContainer = document.getElementById('explorer-tree');
        if(!treeContainer) return;

        // 1. Estructura Base
        let structure = [
            { id: 'root', label: 'EXP-' + (this.expediente.numero || this.id), icon: 'fa-folder-open', color: 'text-gob-oro' },
            { id: 'audiencias', label: 'Audiencias', icon: 'fa-folder', parent: 'root' },
            { id: 'terminos', label: 'Términos Legales', icon: 'fa-folder', parent: 'root' },
            { id: 'anexos', label: 'Anexos y Pruebas', icon: 'fa-file-import', parent: 'root' }
        ];

        // 2. GENERACIÓN DINÁMICA DE SUB-CARPETAS (001, 002...)
        // Obtenemos los términos reales de este expediente
        const allTerminos = JSON.parse(localStorage.getItem('terminos')) || [];
        const misTerminos = allTerminos.filter(t => String(t.asuntoId) === String(this.id));

        misTerminos.forEach((t, index) => {
            // Formato: "001 - Contestación..."
            const numCarpeta = String(index + 1).padStart(3, '0');
            const nombreCorto = (t.asunto || 'Sin Asunto').substring(0, 18) + '...';
            
            structure.push({
                id: `term-${t.id}`, // ID especial para identificarlo
                label: `${numCarpeta} - ${nombreCorto}`,
                icon: 'fa-folder',
                parent: 'terminos', // Esto lo hace hijo de "Términos Legales"
                color: 'text-yellow-500'
            });
        });
      
        const allAudiencias = JSON.parse(localStorage.getItem('audiencias')) || [];
        const misAudiencias = allAudiencias.filter(a => String(a.expedienteId) === String(this.id)); // Asegúrate que tu objeto audiencia tenga 'expedienteId' o similar

        misAudiencias.forEach((aud, index) => {
            const numAud = String(index + 1).padStart(3, '0');
            // Asumimos que la audiencia tiene un campo 'tipo' o 'descripcion'
            const nombreAud = (aud.tipo || 'Audiencia').substring(0, 18); 

            structure.push({
                id: `aud-${aud.id}`,     // ID único para la carpeta
                label: `${numAud} - ${nombreAud}`,
                icon: 'fa-folder',        // Icono de mazo
                parent: 'audiencias',    // Hijo de la carpeta "Audiencias"
                color: 'text-indigo-500'
            });
        });

        // 3. Renderizado Recursivo (Para que se vea la jerarquía)
        let html = '';
        
        const renderNode = (node, level = 0) => {
            // Padding para simular anidación visual
            const paddingLeft = 8 + (level * 12);
            
            // Icono de flechita si tiene hijos (opcional, visual)
            const hasChildren = structure.some(s => s.parent === node.id);
            const arrow = hasChildren ? '<i class="fas fa-caret-down text-gray-300 mr-1 text-[10px]"></i>' : '<span class="w-3 inline-block"></span>';

            html += `
            <div class="flex items-center gap-1.5 p-1.5 hover:bg-blue-50 hover:text-blue-700 rounded cursor-pointer transition-all text-xs group" 
                 style="padding-left: ${paddingLeft}px"
                 onclick="window.detalleModule.loadFolder('${node.id}', '${node.label}')">
                ${arrow}
                <i class="fas ${node.icon} ${node.color || 'text-gray-400'} group-hover:text-blue-500"></i>
                <span class="truncate font-medium">${node.label}</span>
            </div>`;

            // Buscar y renderizar hijos
            const children = structure.filter(item => item.parent === node.id);
            children.forEach(child => renderNode(child, level + 1));
        };

        // Iniciar renderizado desde la raíz
        const root = structure.find(s => s.id === 'root');
        if(root) renderNode(root);

        treeContainer.innerHTML = html;
        window.detalleModule = this; // Exponer para el onclick del HTML
        
        // Cargar carpeta raíz por defecto
        if(!this.currentFolderId) this.loadFolder('root', 'Inicio');
    }


    loadFolder(folderId, label) {
        this.currentFolderId = folderId; 
        this.currentLabel = label; 
        
        const content = document.getElementById('explorer-content');
        const breadcrumb = document.getElementById('explorer-breadcrumb');
        const btnUpload = document.getElementById('btn-upload-explorer');
        
        breadcrumb.innerHTML = `<i class="fas fa-folder-open text-[10px]"></i> <span class="ml-1 text-gob-guinda">${label}</span>`;
        content.innerHTML = '';
        
        content.removeAttribute('style');
        content.className = "flex-1 p-4 overflow-y-auto bg-white relative"; 

        if (this.currentView === 'grid') {
            content.style.display = 'grid';
            content.style.gridTemplateColumns = 'repeat(auto-fill, minmax(130px, 1fr))';
            content.style.gap = '1rem';
            content.style.alignContent = 'start';
        } else {
            content.classList.add('flex', 'flex-col', 'gap-1');
        }

        const esCarpetaTermino = folderId.startsWith('term-');
        const esCarpetaAudiencia = folderId.startsWith('aud-');
        const esAnexos = folderId === 'anexos';
        
        if (esCarpetaTermino || esCarpetaAudiencia || esAnexos) {
            btnUpload.classList.remove('hidden');
        } else {
            btnUpload.classList.add('hidden');
        }

        let files = [];

        if (esCarpetaTermino) {
            const realId = folderId.replace('term-', '');
            const terminos = JSON.parse(localStorage.getItem('terminos')) || [];
            const term = terminos.find(t => String(t.id) === String(realId));
            if (term) {
                if(term.archivoWord) files.push({ name: term.archivoWord, type: 'word', date: term.fechaIngreso || 'N/A' });
                if(term.acuseDocumento) files.push({ name: term.acuseDocumento, type: 'pdf', date: term.fechaVencimiento || 'N/A' });
            }
        } 
        else if (folderId === 'terminos' || folderId === 'audiencias') {
            content.style.display = 'flex';
            content.className = "flex-1 flex flex-col items-center justify-center p-4"; 
            content.innerHTML = `<div class="text-gray-300 text-center"><i class="fas fa-level-down-alt text-4xl mb-2"></i><p class="text-xs italic">Selecciona una subcarpeta del menú.</p></div>`;
            return;
        }
        else if (esAnexos) {
            const anexos = (this.expediente.documentos || []).filter(d => d.tipo === 'Anexo');
            files = anexos.map(d => ({ name: d.nombre, type: d.nombre.endsWith('pdf')?'pdf':'word', date: d.fecha }));
        }

        if (files.length === 0) {
            content.style.display = 'flex';
            content.className = "flex-1 flex items-center justify-center p-4"; 
            content.innerHTML = `<div class="text-center text-gray-400 italic text-xs">Carpeta vacía</div>`;
            document.getElementById('explorer-stats').textContent = `0 Elementos`;
            return;
        }

        // VERIFICAMOS PERMISO
        const canDelete = this.canUserDelete();

        files.forEach(file => {
            const el = document.createElement('div');
            const iconClass = file.type === 'pdf' ? 'fa-file-pdf text-red-500' : 'fa-file-word text-blue-600';
            
            if (this.currentView === 'grid') {
                el.className = "group relative flex flex-col items-center justify-start pt-4 gap-2 border border-gray-200 rounded-lg bg-white transition-all cursor-pointer overflow-hidden";
                el.style.height = '140px'; 

                el.onmouseenter = () => { 
                    el.style.borderColor = '#b91c1c'; 
                    el.style.backgroundColor = '#fef2f2'; 
                    const overlay = el.querySelector('.overlay-actions');
                    if(overlay) overlay.style.opacity = '1';
                };
                el.onmouseleave = () => { 
                    el.style.borderColor = '#e5e7eb'; 
                    el.style.backgroundColor = 'white';
                    const overlay = el.querySelector('.overlay-actions');
                    if(overlay) overlay.style.opacity = '0';
                };
                
               // Renderizamos el botón eliminar SOLO si tiene permisos (canDelete)
               el.innerHTML = `
                <i class="fas ${iconClass} text-4xl transition-transform duration-300"></i>
                <div class="w-full text-center px-2">
                    <span class="block text-[11px] font-bold text-gray-700 leading-tight line-clamp-2 break-words" title="${file.name}">${file.name}</span>
                    <span class="block text-[9px] text-gray-400 mt-1">${file.date}</span>
                </div>

                <div class="overlay-actions absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 transition-opacity duration-200" 
                     style="background-color: rgba(255,255,255,0.95); opacity: 0; backdrop-filter: blur(1px);">
                    
                    ${ canDelete ? `
                    <button class="btn-delete absolute top-2 right-2 w-6 h-6 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors" title="Eliminar">
                        <i class="fas fa-times text-xs"></i>
                    </button>
                    ` : '' }

                    <div class="flex gap-2">
                        <button class="btn-preview-file w-8 h-8 rounded-full bg-gob-guinda text-white flex items-center justify-center hover:scale-110 transition-transform" title="Ver">
                            <i class="fas fa-eye text-xs"></i>
                        </button>
                        <button class="btn-download-file w-8 h-8 rounded-full bg-white text-gray-600 border border-gray-200 flex items-center justify-center hover:text-gob-guinda shadow-md hover:scale-110 transition-transform" title="Descargar">
                            <i class="fas fa-download text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
            } else {
                // VISTA LISTA
                el.className = "flex items-center justify-between p-2 border-b border-gray-100 transition-colors rounded text-xs cursor-pointer";
                el.onmouseenter = () => { el.style.backgroundColor = '#f8fafc'; const actions = el.querySelector('.list-actions'); if(actions) actions.style.opacity = '1'; };
                el.onmouseleave = () => { el.style.backgroundColor = 'transparent'; const actions = el.querySelector('.list-actions'); if(actions) actions.style.opacity = '0'; };

                el.innerHTML = `
                    <div class="flex items-center gap-3 flex-1 min-w-0">
                        <div class="w-8 flex justify-center"><i class="fas ${iconClass} text-lg"></i></div>
                        <span class="truncate font-medium text-gray-700">${file.name}</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <span class="text-gray-400 text-[10px] hidden sm:block w-20 text-right">${file.date}</span>
                        <div class="list-actions flex items-center gap-1 transition-opacity duration-200" style="opacity: 0;">
                            <button class="btn-preview-file p-1.5 text-gray-500 hover:text-gob-guinda hover:bg-white rounded" title="Ver"><i class="fas fa-eye"></i></button>
                            <button class="btn-download-file p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded" title="Descargar"><i class="fas fa-download"></i></button>
                            ${ canDelete ? `<button class="btn-delete p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded" title="Eliminar"><i class="fas fa-times"></i></button>` : '' }
                        </div>
                    </div>
                `;
            }

            const btnPreview = el.querySelector('.btn-preview-file');
            const btnDownload = el.querySelector('.btn-download-file');
            const btnDelete = el.querySelector('.btn-delete');
            
            if(btnPreview) btnPreview.onclick = (e) => { e.stopPropagation(); this.previewFile(file.name); };
            if(btnDownload) btnDownload.onclick = (e) => { e.stopPropagation(); this.downloadFile(file.name); };
            // Solo asignamos el evento si el botón existe (es decir, si tiene permiso)
            if(btnDelete) btnDelete.onclick = (e) => { e.stopPropagation(); this.deleteFile(file.name); }; 

            el.onclick = (e) => { if(!e.target.closest('button')) this.previewFile(file.name); };
            content.appendChild(el);
        });

        document.getElementById('explorer-stats').textContent = `${files.length} Documentos`;
    }

    deleteFile(fileName) {
        event.stopPropagation(); 

        // VALIDACIÓN DE SEGURIDAD
        if (!this.canUserDelete()) {
            Swal.fire('Acceso Restringido', 'Solo el personal de Dirección puede eliminar archivos.', 'error');
            return;
        }

        Swal.fire({
            title: '¿Eliminar archivo?',
            text: `Se borrará "${fileName}" de esta carpeta.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.performDelete(fileName);
            }
        });
    }

    performDelete(fileName) {
            if (!this.currentFolderId) return;
            let eliminado = false;

            // 1. Borrar de ANEXOS
            if (this.currentFolderId === 'anexos') {
                const index = this.expediente.documentos.findIndex(d => d.nombre === fileName);
                if (index !== -1) {
                    this.expediente.documentos.splice(index, 1);
                    updateExpediente(this.id, { documentos: this.expediente.documentos });
                    eliminado = true;
                }
            } 
            // 2. Borrar de TÉRMINOS
            else if (this.currentFolderId.startsWith('term-')) {
                const realId = this.currentFolderId.replace('term-', '');
                const terminos = JSON.parse(localStorage.getItem('terminos')) || [];
                const idx = terminos.findIndex(t => String(t.id) === String(realId));

                if (idx !== -1) {
                    const term = terminos[idx];
                    if (term.archivoWord === fileName) {
                        term.archivoWord = null; 
                        eliminado = true;
                    } else if (term.acuseDocumento === fileName) {
                        term.acuseDocumento = null; 
                        eliminado = true;
                    }
                    if (eliminado) localStorage.setItem('terminos', JSON.stringify(terminos));
                }
            }

            if (eliminado) {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Archivo eliminado', showConfirmButton: false, timer: 2000 });
                this.loadFolder(this.currentFolderId, this.currentLabel);
                this.renderDocumentsTable(); 
            } else {
                Swal.fire('Error', 'No se pudo localizar el archivo para eliminar.', 'error');
            }
    }

   handleExplorerUpload(file) {
        if (!this.currentFolderId) return;

        // Subida a una carpeta de Término Específico
        if (this.currentFolderId.startsWith('term-')) {
            const realId = this.currentFolderId.replace('term-', '');
            const terminos = JSON.parse(localStorage.getItem('terminos')) || [];
            const idx = terminos.findIndex(t => String(t.id) === String(realId));

            if (idx !== -1) {
                // Decidir si es Word o PDF basado en extensión (lógica simple)
                if (file.name.endsWith('.pdf')) {
                    terminos[idx].acuseDocumento = file.name;
                    // Auto-cambio de estado si aplica
                    if(terminos[idx].estatus === 'Liberado') terminos[idx].estatus = 'Presentado';
                } else {
                    terminos[idx].archivoWord = file.name;
                }

                localStorage.setItem('terminos', JSON.stringify(terminos));
                
                // Recargar carpeta visualmente
                this.loadFolder(this.currentFolderId, document.getElementById('explorer-breadcrumb').innerText);
                
                // Notificación
                const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
                Toast.fire({ icon: 'success', title: 'Archivo subido correctamente' });
            }
        } // CASO 2: Subida a Anexos (NUEVO)
        else if (this.currentFolderId === 'anexos') {
            const newDoc = {
                nombre: file.name,
                tipo: 'Anexo',
                comentario: 'Subido desde Gestor',
                fecha: new Date().toLocaleDateString('es-MX')
            };
            
            if (!this.expediente.documentos) this.expediente.documentos = [];
            this.expediente.documentos.push(newDoc);
            updateExpediente(this.id, { documentos: this.expediente.documentos });
            
            // Refrescar vista
            this.loadFolder('anexos', 'Anexos y Pruebas');
            this.renderDocumentsTable(); // También actualizar la lista simple si la usas
            
            const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
            Toast.fire({ icon: 'success', title: 'Anexo subido correctamente' });
        }
    }

    previewFile(name) {
        Swal.fire({
            title: 'Vista Previa',
            text: `Simulando visor para: ${name}`,
            icon: 'info',
            confirmButtonColor: '#691c32'
        });
    }

    downloadFile(name) {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Descargando ${name}...`,
            showConfirmButton: false,
            timer: 2000
        });
    }

    // ==========================================
    // 4. MODALES DE EDICIÓN Y ESTADO
    // ==========================================
    setupModals() {
        this.setupEditModal();
        this.setupEstadoModal();
    }

    setupEditModal() {
        const modal = document.getElementById('modal-edit-expediente');
        const btnOpen = document.getElementById('btn-editar-expediente');
        
        if (!modal) return;
        if (btnOpen) {
            btnOpen.onclick = () => {
                this.populateEditForm();
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            };
        }
        
        const close = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };
        const btnClose = document.getElementById('close-edit-expediente');
        const btnCancel = document.getElementById('cancel-edit-expediente');
        if (btnClose) btnClose.onclick = close;
        if (btnCancel) btnCancel.onclick = close;

        const btnSave = document.getElementById('save-edit-expediente');
        if (btnSave) {
            const newBtn = btnSave.cloneNode(true);
            btnSave.parentNode.replaceChild(newBtn, btnSave);
            newBtn.onclick = () => { this.saveEditForm(); close(); };
        }
    }

    populateEditForm() {
        const e = this.expediente;
        const setValue = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        
        setValue('edit-id', e.id);
        setValue('edit-numero', e.numero);
        setValue('edit-materia', e.materia);
        setValue('edit-gerencia', e.gerenciaId);
        setValue('edit-sede', e.sede);
        setValue('edit-abogado', e.abogado);
        setValue('edit-partes', e.partes);
        setValue('edit-organo', e.organo);
        setValue('edit-prioridad', e.prioridad);
        setValue('edit-descripcion', e.descripcion);
    }

    saveEditForm() {
        const getVal = (id) => document.getElementById(id)?.value?.trim() || '';
        const getText = (id) => { const el = document.getElementById(id); return el && el.options ? el.options[el.selectedIndex].text : ''; };

        const changes = {
            numero: getVal('edit-numero'),
            materia: getVal('edit-materia'),
            gerenciaId: getVal('edit-gerencia'),
            gerencia: getText('edit-gerencia'),
            sede: getVal('edit-sede'),
            abogado: getVal('edit-abogado'),
            partes: getVal('edit-partes'),
            organo: getVal('edit-organo'),
            prioridad: getVal('edit-prioridad'),
            descripcion: getVal('edit-descripcion')
        };

        const cambiosDetectados = [];
        const original = this.expediente;
        const labels = { numero: 'No. Expediente', materia: 'Materia', gerenciaId: 'Gerencia', sede: 'Estado/Sede', abogado: 'Abogado Responsable', partes: 'Partes Procesales', organo: 'Órgano Jurisdiccional', prioridad: 'Prioridad', descripcion: 'Descripción' };

        Object.keys(labels).forEach(key => {
            const valOriginal = String(original[key] || '').trim();
            const valNuevo = String(changes[key] || '').trim();
            if (valOriginal !== valNuevo) cambiosDetectados.push(labels[key]);
        });

        let mensajeActividad = 'Se actualizaron los datos generales del expediente.';
        if (cambiosDetectados.length > 0) {
            mensajeActividad = `Se modificó: ${cambiosDetectados.join(', ')}.`;
        }

        updateExpediente(this.id, changes);
        this.registrarActividad('Edición de Datos', mensajeActividad, 'edit');
        this.loadData();
        this.populateVista360();
    }

    setupEstadoModal() {
        const modal = document.getElementById('modal-cambio-estado');
        const btnOpen = document.getElementById('btn-cambiar-estado-expediente');
        
        if (!modal || !btnOpen) return;

        btnOpen.onclick = () => {
            const display = document.getElementById('estado-actual-display');
            if (display) display.textContent = this.expediente.estado;
            
            const select = document.getElementById('nuevo-estado-select');
            const razonInput = document.getElementById('razon-cambio');
            
            if (select) select.value = ""; 
            if (razonInput) razonInput.value = ''; 

            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        const close = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };
        const btnClose = document.getElementById('close-cambio-estado');
        const btnCancel = document.getElementById('cancel-cambio-estado');
        if (btnClose) btnClose.onclick = close;
        if (btnCancel) btnCancel.onclick = close;

        const btnConfirm = document.getElementById('confirm-cambio-estado');
        if (btnConfirm) {
            const newBtn = btnConfirm.cloneNode(true);
            btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);
            newBtn.onclick = () => {
                const nuevo = document.getElementById('nuevo-estado-select').value;
                const razon = document.getElementById('razon-cambio').value; 

                if (nuevo) {
                    updateExpediente(this.id, { estado: nuevo });
                    this.registrarActividad('Cambio de Estado', `Estado cambiado a ${nuevo}. ${razon ? 'Motivo: '+razon : ''}`, 'status');
                    this.loadData();
                    this.populateVista360();
                    close();
                } else {
                    alert('Seleccione un nuevo estado.');
                }
            };
        }
    }

    // ==========================================
    // 5. MÓDULO DE DOCUMENTOS (LISTA SIMPLE)
    // ==========================================
    setupDocumentsModule() {
        this.renderDocumentsTable();
        this.setupUploadModal();
        this.setupSearch();
    }

  
    asignarListenersDocumentos() {
        document.querySelectorAll('.btn-preview-doc').forEach(btn => btn.addEventListener('click', (e) => this.previewDocument(e.currentTarget.getAttribute('data-index'))));
        document.querySelectorAll('.btn-download-doc').forEach(btn => btn.addEventListener('click', (e) => this.downloadDocument(e.currentTarget.getAttribute('data-index'))));
        document.querySelectorAll('.btn-delete-doc').forEach(btn => btn.addEventListener('click', (e) => this.confirmDeleteDocument(e.currentTarget.getAttribute('data-index'))));
    }

    previewDocument(index) {
        const doc = this.expediente.documentos[index];
        Swal.fire({
            title: `<span class="text-gob-guinda">${doc.nombre}</span>`,
            html: `<div class="text-left bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm"><p><strong>Tipo:</strong> ${doc.tipo}</p><p><strong>Fecha:</strong> ${doc.fecha}</p><p class="mt-2"><strong>Comentario:</strong><br><span class="italic text-gray-600">${doc.comentario}</span></p></div>`,
            icon: 'info',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#545454'
        });
    }

    downloadDocument(index) {
        const doc = this.expediente.documentos[index];
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
        Toast.fire({ icon: 'success', title: 'Descarga iniciada', text: `Bajando: ${doc.nombre}` });
    }

    confirmDeleteDocument(index) {
        const docName = this.expediente.documentos[index].nombre;
        Swal.fire({
            title: '¿Eliminar documento?',
            text: `Se eliminará permanentemente "${docName}".`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#9D2449',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteDocument(index);
                Swal.fire({ title: '¡Eliminado!', text: 'El documento ha sido borrado.', icon: 'success', confirmButtonColor: '#B38E5D' });
            }
        });
    }

    setupUploadModal() {
        const modal = document.getElementById('modal-subir-documento');
        const btnOpen = document.getElementById('btn-nuevo-documento');
        
        if (!modal) return;

        const open = () => { document.getElementById('form-subir-documento').reset(); modal.classList.remove('hidden'); modal.classList.add('flex'); };
        const close = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };

        if (btnOpen) btnOpen.onclick = open;
        document.getElementById('close-subir-documento').onclick = close;
        document.getElementById('cancel-subir-documento').onclick = close;

        const btnSave = document.getElementById('save-subir-documento');
        if (btnSave) {
            const newBtn = btnSave.cloneNode(true);
            btnSave.parentNode.replaceChild(newBtn, btnSave);
            
            newBtn.onclick = () => {
                const fileInput = document.getElementById('doc-file');
                const tipo = document.getElementById('doc-tipo').value;
                const comentario = document.getElementById('doc-comentario').value;

                if (fileInput.files.length === 0) { alert('Seleccione un archivo.'); return; }
                if (!tipo) { alert('Seleccione un tipo de documento.'); return; }
                if (!comentario) { alert('Escriba un comentario.'); return; }

                const file = fileInput.files[0];
                const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour:'2-digit', minute:'2-digit'});

                const newDoc = { nombre: file.name, tipo: tipo, comentario: comentario, fecha: fecha };

                if (!this.expediente.documentos) this.expediente.documentos = [];
                this.expediente.documentos.push(newDoc);
                
                updateExpediente(this.id, { documentos: this.expediente.documentos });
                this.registrarActividad('Documento Adjuntado', `Se subió el documento "${file.name}" (${tipo}).`, 'upload');
                this.loadData(); 
                this.renderDocumentsTable();
                close();
            };
        }
    }

    setupSearch() {
        const input = document.getElementById('search-documentos');
        if (input) input.addEventListener('input', (e) => this.renderDocumentsTable(e.target.value));
    }

    deleteDocument(index) {      
        const docName = this.expediente.documentos[index].nombre;     
        this.expediente.documentos.splice(index, 1);     
        updateExpediente(this.id, { documentos: this.expediente.documentos });     
        this.registrarActividad('Documento Eliminado', `Se eliminó el documento "${docName}" del expediente.`, 'delete');
        this.loadData();
        this.renderDocumentsTable();
    }

    // ==========================================
    // 6. MÓDULO DE OBSERVACIONES (NOTAS)
    // ==========================================
    setupObservacionesModule() {
        const modal = document.getElementById('modal-observaciones-expediente');
        const btnOpen = document.getElementById('btn-observaciones-expediente');
        const btnClose = document.getElementById('close-observaciones-expediente');
        const btnSave = document.getElementById('btn-guardar-observacion');

        if (!modal || !btnOpen) return;

        btnOpen.onclick = () => {
            this.renderObservacionesList();
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            const container = document.getElementById('lista-observaciones-container');
            if (container) container.scrollTop = container.scrollHeight;
        };

        const closeObs = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };
        if (btnClose) btnClose.onclick = closeObs;

        if (btnSave) {
            const newBtn = btnSave.cloneNode(true);
            btnSave.parentNode.replaceChild(newBtn, btnSave);
            
            newBtn.onclick = () => {
                const input = document.getElementById('texto-nueva-observacion');
                const texto = input.value.trim();
                if (!texto) return;

                const nuevaObs = {
                    fecha: new Date().toISOString(),
                    texto: texto,
                    usuario: 'Usuario Actual'
                };

                if (!this.expediente.observaciones) this.expediente.observaciones = [];
                this.expediente.observaciones.push(nuevaObs);

                updateExpediente(this.id, { observaciones: this.expediente.observaciones });
                this.registrarActividad('Nota Agregada', 'Se agregó una nueva observación al expediente.', 'edit');

                input.value = '';
                this.renderObservacionesList();
                
                const container = document.getElementById('lista-observaciones-container');
                setTimeout(() => { container.scrollTop = container.scrollHeight; }, 100);
            };
        }
    }

    renderObservacionesList() {
        const container = document.getElementById('lista-observaciones-container');
        if (!container) return;

        const obsList = this.expediente.observaciones || [];
        container.innerHTML = '';

        if (obsList.length === 0) {
            container.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-gray-400 opacity-60"><i class="far fa-comment-dots text-4xl mb-2"></i><p class="text-sm italic">No hay observaciones registradas.</p></div>`;
            return;
        }

        obsList.forEach(obs => {
            const date = new Date(obs.fecha);
            const fechaStr = date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year:'numeric' });
            const horaStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

            const item = document.createElement('div');
            item.className = 'mb-4 bg-white p-3 rounded-lg border border-gray-200 shadow-sm';
            item.innerHTML = `
                <div class="flex justify-between items-start mb-2 border-b border-gray-100 pb-1">
                    <span class="text-xs font-bold text-blue-600 uppercase">${obs.usuario || 'Usuario'}</span>
                    <span class="text-[10px] text-gray-400">${fechaStr} ${horaStr}</span>
                </div>
                <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">${obs.texto}</p>
            `;
            container.appendChild(item);
        });
    }

    // ==========================================
    // 7. HISTORIAL (TIMELINE Y ACTIVIDAD)
    // ==========================================
    registrarActividad(titulo, descripcion, tipo) {
        const nuevaActividad = {
            fecha: new Date().toISOString(),
            titulo: titulo,
            descripcion: descripcion,
            tipo: tipo 
        };

        if (!this.expediente.actividad) this.expediente.actividad = [];
        this.expediente.actividad.unshift(nuevaActividad);
        updateExpediente(this.id, { actividad: this.expediente.actividad });
        this.renderTimeline();
    }

    renderTimeline() {
        const container = document.getElementById('actividad-reciente-list');
        if (!container) return;

        container.innerHTML = '';
        const actividades = this.expediente.actividad || [];

        if (actividades.length === 0) {
            container.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Sin actividad reciente.</p>';
            return;
        }

        actividades.forEach(act => {
            const date = new Date(act.fecha);
            const fechaStr = date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
            const horaStr = date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
            
            let icon = 'fa-info-circle';
            let colorBg = 'bg-gray-100';
            let colorIcon = 'text-gray-500';

            switch (act.tipo) {
                case 'upload': icon='fa-file-upload'; colorBg='bg-blue-50'; colorIcon='text-blue-600'; break;
                case 'delete': icon='fa-trash-alt'; colorBg='bg-red-50'; colorIcon='text-red-600'; break;
                case 'edit': icon='fa-pen'; colorBg='bg-yellow-50'; colorIcon='text-yellow-600'; break;
                case 'status': icon='fa-exchange-alt'; colorBg='bg-green-50'; colorIcon='text-green-600'; break;
            }

            const item = document.createElement('div');
            item.className = 'relative pl-4 pb-6 border-l border-gray-200 last:pb-0 last:border-0';
            item.innerHTML = `
                <div class="absolute -left-1.5 top-0 w-3 h-3 rounded-full border border-white ${colorBg.replace('50', '400')}"></div>
                <div class="flex flex-col gap-1">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">${fechaStr} • ${horaStr}</span>
                    <div class="flex items-start gap-2">
                        <div class="mt-0.5 p-1 rounded ${colorBg}"><i class="fas ${icon} ${colorIcon} text-xs"></i></div>
                        <div><h4 class="text-xs font-bold text-gray-800">${act.titulo}</h4><p class="text-xs text-gray-500 leading-relaxed">${act.descripcion}</p></div>
                    </div>
                </div>`;
            container.appendChild(item);
        });
    }

    renderError(msg){ console.error(msg); }

    // ==========================================
    // 8. MÓDULO: HISTÓRICO LEGAL (CONSULTA ACUSES)
    // ==========================================
    setupHistoricoLegalModule() {
        const container = document.getElementById('historico-legal-container');
        if (!container) return;

        // 1. Obtener TODAS las listas (Activas e Históricas)
        const audienciasActivas = JSON.parse(localStorage.getItem('audiencias')) || [];
        const audienciasHistoricas = JSON.parse(localStorage.getItem('audienciasDesahogadas')) || [];
        const terminosActivos = JSON.parse(localStorage.getItem('terminos')) || [];
        const terminosHistoricos = JSON.parse(localStorage.getItem('terminosPresentados')) || [];

        // Unificar listas para búsqueda global
        const todasAudiencias = [...audienciasActivas, ...audienciasHistoricas];
        const todosTerminos = [...terminosActivos, ...terminosHistoricos];

        // Función de filtrado robusta
        const esDeEsteExpediente = (item) => {
            if (item.asuntoId && String(item.asuntoId) === String(this.id)) return true;
            if (item.expediente && this.expediente.numero && item.expediente.trim() === this.expediente.numero.trim()) return true;
            return false;
        };

        // 2. Procesar Audiencias
        const actas = todasAudiencias
            .filter(a => esDeEsteExpediente(a) && a.actaDocumento)
            .map(a => ({
                tipo: 'Audiencia',
                subtipo: a.tipo || a.tipoAudiencia || 'General',
                nombreDoc: a.actaDocumento,
                fecha: a.fecha || a.fechaAudiencia,
                icono: 'fa-gavel',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                idRef: a.id
            }));

        // 3. Procesar Términos
        const acuses = todosTerminos
            .filter(t => esDeEsteExpediente(t) && t.acuseDocumento)
            .map(t => ({
                tipo: 'Término',
                subtipo: 'Acuse Recibido',
                nombreDoc: t.acuseDocumento,
                fecha: t.fechaVencimiento || t.fechaPresentacion,
                icono: 'fa-clock',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
                idRef: t.id
            }));

        // 4. Unificar y Ordenar
        const documentos = [...actas, ...acuses].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // 5. Renderizar
        container.innerHTML = '';

        if (documentos.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-8 text-gray-400">
                    <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <i class="fas fa-folder-open text-xl"></i>
                    </div>
                    <p class="text-xs italic">Sin actas ni acuses registrados.</p>
                </div>`;
            return;
        }

        const lista = document.createElement('ul');
        lista.className = 'divide-y divide-gray-100';

        documentos.forEach(doc => {
            const li = document.createElement('li');
            li.className = 'p-3 hover:bg-gray-50 transition-colors group flex items-center gap-3';
            
            li.innerHTML = `
                <div class="flex-shrink-0 w-8 h-8 rounded-lg ${doc.bg} flex items-center justify-center">
                    <i class="fas ${doc.icono} ${doc.color} text-xs"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <p class="text-xs font-bold text-gray-700 truncate cursor-help" title="${doc.nombreDoc}">
                            ${doc.nombreDoc}
                        </p>
                        <span class="text-[10px] text-gray-400 ml-2 whitespace-nowrap">${this.formatDateShort(doc.fecha)}</span>
                    </div>
                    <p class="text-[10px] text-gray-500 flex items-center gap-1">
                        <span class="font-semibold ${doc.color}">${doc.tipo}</span> 
                        <span class="text-gray-300">•</span> 
                        ${doc.subtipo}
                    </p>
                </div>
                <div class="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button class="btn-preview-historico w-7 h-7 rounded border border-gray-200 bg-white text-gray-500 hover:text-gob-guinda hover:border-gob-guinda flex items-center justify-center transition-all shadow-sm" 
                            data-doc="${doc.nombreDoc}" title="Previsualizar">
                        <i class="fas fa-eye text-xs"></i>
                    </button>
                    <button class="btn-download-historico w-7 h-7 rounded border border-gray-200 bg-white text-gray-500 hover:text-blue-600 hover:border-blue-600 flex items-center justify-center transition-all shadow-sm" 
                            data-doc="${doc.nombreDoc}" title="Descargar">
                        <i class="fas fa-download text-xs"></i>
                    </button>
                </div>
            `;
            lista.appendChild(li);
        });

        container.appendChild(lista);

        // Listeners
        container.querySelectorAll('.btn-preview-historico').forEach(btn => {
            btn.addEventListener('click', (e) => this.previewHistorico(e.currentTarget.dataset.doc));
        });
        container.querySelectorAll('.btn-download-historico').forEach(btn => {
            btn.addEventListener('click', (e) => this.downloadHistorico(e.currentTarget.dataset.doc));
        });
    }

    formatDateShort(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    previewHistorico(nombreDoc) {
        Swal.fire({
            title: '<span class="text-sm font-bold text-gray-700">Vista Previa</span>',
            html: `
                <div class="flex flex-col items-center gap-4 py-4">
                    <i class="fas fa-file-pdf text-5xl text-red-500"></i>
                    <p class="text-gob-guinda font-bold text-lg">${nombreDoc}</p>
                    <p class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Simulación de visor PDF</p>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: false,
            width: '400px'
        });
    }

    downloadHistorico(nombreDoc) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'success',
            title: 'Descargando...',
            text: nombreDoc
        });
    }
}