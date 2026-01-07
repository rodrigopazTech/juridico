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
        this.expandedFolders = new Set(['root']);
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
        const btnNewFolder = document.getElementById('btn-new-folder'); 
        const btnGrid = document.getElementById('view-grid');
        const btnList = document.getElementById('view-list');
        const searchInput = document.getElementById('explorer-search');

        if (btnGrid) btnGrid.onclick = () => { this.currentView = 'grid'; this.updateViewButtons(); if(this.currentFolderId) this.loadFolder(this.currentFolderId, this.currentLabel); };
        if (btnList) btnList.onclick = () => { this.currentView = 'list'; this.updateViewButtons(); if(this.currentFolderId) this.loadFolder(this.currentFolderId, this.currentLabel); };

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                document.querySelectorAll('#explorer-content > div').forEach(card => {
                    const name = card.querySelector('span[title], .truncate')?.textContent.toLowerCase() || '';
                    card.style.display = name.includes(term) ? '' : 'none'; 
                });
            });
        }

        if (btnNewFolder) {
            btnNewFolder.onclick = () => {
                // Ahora permitimos crear subcarpetas infinitas en 'anexos' o dentro de 'custom-'
                if (this.currentFolderId === 'anexos' || this.currentFolderId.startsWith('custom-')) {
                    this.promptNewFolder();
                } else if (this.currentFolderId === 'terminos' || this.currentFolderId === 'audiencias') {
                    Swal.fire('Estructura Protegida', 'Estas carpetas se gestionan automáticamente desde sus módulos.', 'info');
                } else {
                    Swal.fire('Acción no permitida', 'No puedes crear carpetas en la raíz.', 'warning');
                }
            };
        }

        if (btnOpen) btnOpen.onclick = () => { modal.classList.remove('hidden'); modal.classList.add('flex'); this.renderTree(); this.updateViewButtons(); };
        if (btnClose) btnClose.onclick = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };

        if (btnUpload && inputFile) {
            btnUpload.onclick = () => inputFile.click();
            inputFile.onchange = (e) => { if (e.target.files.length > 0) this.handleExplorerUpload(e.target.files[0]); };
        }
    }

    // --- FUNCIÓN PARA CREAR CARPETA PERSONALIZADA ---
    async promptNewFolder() {
        const { value: folderName } = await Swal.fire({
            title: 'Nueva Carpeta',
            input: 'text',
            inputLabel: 'Nombre de la carpeta',
            inputPlaceholder: 'Ej: Pruebas Periciales',
            showCancelButton: true,
            confirmButtonColor: '#691c32',
            confirmButtonText: 'Crear',
            inputValidator: (value) => {
                if (!value) return 'Debes escribir un nombre';
            }
        });

        if (folderName) {
            this.createCustomFolder(folderName);
        }
    }

    createCustomFolder(name) {
        const customFolders = JSON.parse(localStorage.getItem('custom_folders')) || [];
        const parentId = (this.currentFolderId.startsWith('custom-')) ? this.currentFolderId : 'anexos';

        const newFolder = {
            id: `custom-${Date.now()}`,
            expedienteId: this.id,
            parentId: parentId, 
            name: name,
            date: new Date().toLocaleDateString('es-MX')
        };
        customFolders.push(newFolder);
        localStorage.setItem('custom_folders', JSON.stringify(customFolders));
        
        // Al crear, expandimos el padre para ver la nueva carpeta
        this.expandedFolders.add(parentId);
        
        this.loadFolder(this.currentFolderId, this.currentLabel); 
        this.renderTree(); 
        
        const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        Toast.fire({ icon: 'success', title: 'Carpeta creada' });
    }

    // --- LÓGICA DE ÁRBOL "UNITY" (TOGGLE) ---
    toggleTreeNode(nodeId) {
        if (this.expandedFolders.has(nodeId)) {
            this.expandedFolders.delete(nodeId); // Desacoplar (Cerrar)
        } else {
            this.expandedFolders.add(nodeId); // Acoplar (Abrir)
        }
        this.renderTree(); // Redibujar árbol
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

        // 1. Construir la estructura completa de datos
        let structure = [
            { id: 'root', label: 'EXP-' + (this.expediente.numero || this.id), icon: 'fa-folder', color: 'text-gob-oro', type: 'folder' },
            { id: 'audiencias', label: 'Audiencias', icon: 'fa-folder', parent: 'root', type: 'folder' },
            { id: 'terminos', label: 'Términos Legales', icon: 'fa-folder', parent: 'root', type: 'folder' },
            { id: 'anexos', label: 'Anexos y Pruebas', icon: 'fa-file-import', parent: 'root', type: 'folder' }
        ];

        // Términos
        const allTerminos = JSON.parse(localStorage.getItem('terminos')) || [];
        const misTerminos = allTerminos.filter(t => String(t.asuntoId) === String(this.id));
        misTerminos.forEach((t, i) => {
            const folderId = `term-${t.id}`;
            structure.push({ id: folderId, label: `${String(i+1).padStart(3,'0')} - ${(t.asunto||'').substring(0,15)}...`, icon: 'fa-folder', parent: 'terminos', color: 'text-yellow-500', type: 'folder' });
            // Archivos de término
            if(t.archivoWord) structure.push({ id: `f-t-w-${t.id}`, label: t.archivoWord, icon: 'fa-file-word', parent: folderId, type: 'file', color: 'text-blue-600' });
            if(t.acuseDocumento) structure.push({ id: `f-t-a-${t.id}`, label: t.acuseDocumento, icon: 'fa-file-pdf', parent: folderId, type: 'file', color: 'text-red-500' });
            if(t.historialArchivos) t.historialArchivos.forEach((h, hi) => {
                if(h.nombre !== t.archivoWord && h.nombre !== t.acuseDocumento) structure.push({ id: `f-t-h-${t.id}-${hi}`, label: h.nombre, icon: h.nombre.endsWith('pdf')?'fa-file-pdf':'fa-file-word', parent: folderId, type: 'file', color: 'text-gray-400' });
            });
        });

        // Audiencias
        const audAct = JSON.parse(localStorage.getItem('audiencias')) || [];
        const audHist = JSON.parse(localStorage.getItem('audienciasDesahogadas')) || [];
        const misAud = [...audAct, ...audHist].filter(a => String(a.asuntoId) === String(this.id)).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha));
        misAud.forEach((a, i) => {
            const folderId = `aud-${a.id}`;
            structure.push({ id: folderId, label: `${String(i+1).padStart(3,'0')} - ${(a.tipo||'').substring(0,15)}...`, icon: a.atendida?'fa-check-circle':'fa-folder', parent: 'audiencias', color: a.atendida?'text-green-600':'text-indigo-500', type: 'folder' });
            if(a.actaDocumento) structure.push({ id: `f-a-${a.id}`, label: a.actaDocumento, icon: 'fa-file-pdf', parent: folderId, type: 'file', color: 'text-red-500' });
        });

        // Custom Folders
        const customFolders = JSON.parse(localStorage.getItem('custom_folders')) || [];
        const misCustom = customFolders.filter(f => String(f.expedienteId) === String(this.id));
        misCustom.forEach(f => {
            structure.push({ id: f.id, label: f.name, icon: 'fa-folder', parent: f.parentId, type: 'folder', color: 'text-gray-500' });
        });

        // Archivos sueltos
        if(this.expediente.documentos) {
            this.expediente.documentos.forEach((d, i) => {
                let parent = d.folderId ? d.folderId : (d.tipo==='Anexo' ? 'anexos' : 'root');
                structure.push({ id: `doc-${i}`, label: d.nombre, icon: d.nombre.endsWith('pdf')?'fa-file-pdf':'fa-file-word', parent: parent, type: 'file', color: d.nombre.endsWith('pdf')?'text-red-500':'text-blue-600' });
            });
        }

        // Renderizado Recursivo
        let html = '';
        const renderNode = (node, level = 0) => {
            const children = structure.filter(item => item.parent === node.id);
            const hasChildren = children.length > 0;
            const padding = 8 + (level * 12);
            
            // Estado Unity
            const isExpanded = this.expandedFolders.has(node.id);
            const isSelected = this.currentFolderId === node.id;
            
            // Iconos dinámicos
            let iconToRender = node.icon;
            if (node.type === 'folder') {
                if (node.id === 'root') iconToRender = 'fa-folder-open'; // Root siempre abierto visualmente
                else if (isExpanded) iconToRender = 'fa-folder-open';
            }

            // Flecha (Click -> Toggle)
            // Si es carpeta, mostrar flecha. Si está vacía, mostrar punto transparente o nada.
            let arrow = '<span class="w-4 inline-block"></span>';
            if (node.type === 'folder' && hasChildren) {
                arrow = `<span class="w-4 inline-flex items-center justify-center cursor-pointer hover:text-gob-guinda transition-colors" 
                               onclick="window.detalleModule.toggleTreeNode('${node.id}'); event.stopPropagation();">
                            <i class="fas ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'} text-[10px] text-gray-400"></i>
                         </span>`;
            }

            // Fondo de selección
            const bgClass = isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100';

            // Acción principal (Click en nombre/icono)
            const mainAction = node.type === 'folder' 
                ? `window.detalleModule.loadFolder('${node.id}', '${node.label.replace(/'/g, "\\'")}')`
                : `window.detalleModule.previewFile('${node.label.replace(/'/g, "\\'")}')`;

            html += `
            <div class="flex items-center gap-1 p-1 rounded cursor-pointer transition-all text-xs group select-none ${bgClass}" 
                 style="padding-left: ${padding}px" 
                 onclick="${mainAction}">
                ${arrow}
                <i class="fas ${iconToRender} ${node.color || 'text-gray-400'} min-w-[16px] text-center"></i>
                <span class="truncate ${node.type==='file'?'text-gray-500':'font-medium'} ml-1">${node.label}</span>
            </div>`;

            // RECURSIÓN: Solo si está expandido
            if (isExpanded && hasChildren) {
                children.forEach(child => renderNode(child, level + 1));
            }
        };

        const root = structure.find(s => s.id === 'root');
        if(root) renderNode(root);
        treeContainer.innerHTML = html;
        window.detalleModule = this; 
    }

    loadFolder(folderId, label) {
        this.currentFolderId = folderId; 
        this.currentLabel = label; 
        
        // Al dar clic en una carpeta para cargarla, nos aseguramos que se expanda en el árbol
        if (!this.expandedFolders.has(folderId)) {
            this.expandedFolders.add(folderId);
            this.renderTree();
        }

        const content = document.getElementById('explorer-content');
        const breadcrumb = document.getElementById('explorer-breadcrumb');
        const btnUpload = document.getElementById('btn-upload-explorer');
        
        breadcrumb.innerHTML = `<i class="fas fa-folder-open text-[10px]"></i> <span class="ml-1 text-gob-guinda">${label}</span>`;
        content.innerHTML = '';
        content.className = "flex-1 p-4 overflow-y-auto bg-white relative"; 

        if (this.currentView === 'grid') {
            content.style.display = 'grid';
            content.style.gridTemplateColumns = 'repeat(auto-fill, minmax(130px, 1fr))';
            content.style.gap = '1rem';
            content.style.alignContent = 'start';
        } else {
            content.classList.add('flex', 'flex-col', 'gap-1');
        }

        const esPermitido = folderId.startsWith('term-') || folderId.startsWith('aud-') || folderId === 'anexos' || folderId.startsWith('custom-');
        btnUpload.classList.toggle('hidden', !esPermitido);

        let items = []; 

        // Lógica de Contenido (Igual que antes)
        if (folderId === 'root') {
            items.push(
                { isFolder: true, id: 'audiencias', name: 'Audiencias', date: 'Sistema' },
                { isFolder: true, id: 'terminos', name: 'Términos Legales', date: 'Sistema' },
                { isFolder: true, id: 'anexos', name: 'Anexos y Pruebas', date: 'Sistema' }
            );
        }
        else if (folderId === 'terminos') {
            const all = JSON.parse(localStorage.getItem('terminos')) || [];
            all.filter(t => String(t.asuntoId) === String(this.id)).forEach((t, i) => {
                items.push({ isFolder: true, id: `term-${t.id}`, name: `${String(i+1).padStart(3,'0')} - ${t.asunto}`, date: t.fechaIngreso || 'N/A' });
            });
        }
        else if (folderId === 'audiencias') {
            const act = JSON.parse(localStorage.getItem('audiencias')) || [];
            const hist = JSON.parse(localStorage.getItem('audienciasDesahogadas')) || [];
            [...act, ...hist].filter(a => String(a.asuntoId) === String(this.id)).sort((a,b)=>new Date(a.fecha)-new Date(b.fecha)).forEach((a, i) => {
                items.push({ isFolder: true, id: `aud-${a.id}`, name: `${String(i+1).padStart(3,'0')} - ${a.tipo}`, date: a.fecha });
            });
        }
        else if (folderId.startsWith('term-')) {
            const realId = folderId.replace('term-', '');
            const term = (JSON.parse(localStorage.getItem('terminos'))||[]).find(t => String(t.id) === String(realId));
            if (term) {
                if(term.historialArchivos) term.historialArchivos.forEach(d => items.push({ name: d.nombre, type: d.nombre.endsWith('pdf')?'pdf':'word', date: this.formatDateShort(d.fecha) }));
                else {
                    if(term.archivoWord) items.push({ name: term.archivoWord, type: 'word', date: term.fechaIngreso });
                    if(term.acuseDocumento) items.push({ name: term.acuseDocumento, type: 'pdf', date: term.fechaVencimiento });
                }
            }
        }
        else if (folderId.startsWith('aud-')) {
            const realId = folderId.replace('aud-', '');
            const act = JSON.parse(localStorage.getItem('audiencias')) || [];
            const hist = JSON.parse(localStorage.getItem('audienciasDesahogadas')) || [];
            const aud = [...act, ...hist].find(a => String(a.id) === String(realId));
            if (aud && aud.actaDocumento) items.push({ name: aud.actaDocumento, type: 'pdf', date: aud.fecha });
        }
        else {
            const customFolders = JSON.parse(localStorage.getItem('custom_folders')) || [];
            customFolders.filter(f => String(f.expedienteId) === String(this.id) && f.parentId === folderId).forEach(f => {
                items.push({ isFolder: true, id: f.id, name: f.name, date: f.date });
            });
            const docs = this.expediente.documentos || [];
            docs.filter(d => {
                if (folderId === 'anexos') return d.tipo === 'Anexo' && (!d.folderId || d.folderId === 'anexos');
                return d.tipo === 'Anexo' && d.folderId === folderId;
            }).forEach(d => {
                items.push({ name: d.nombre, type: d.nombre.endsWith('pdf')?'pdf':'word', date: d.fecha });
            });
        }

        if (items.length === 0) {
            content.style.display = 'flex'; content.className = "flex-1 flex items-center justify-center p-4"; 
            content.innerHTML = `<div class="text-center text-gray-400 italic text-xs">Carpeta vacía</div>`;
            document.getElementById('explorer-stats').textContent = `0 Elementos`;
            return;
        }

        const canDelete = this.canUserDelete();

        items.forEach(item => {
            const el = document.createElement('div');
            let iconClass = item.isFolder ? 'fa-folder' : ((item.name.endsWith('.pdf')||item.type==='pdf')?'fa-file-pdf':'fa-file-word');
            let iconColor = item.isFolder ? 'text-yellow-400' : ((item.name.endsWith('.pdf')||item.type==='pdf')?'text-red-500':'text-blue-600');
            
            if (this.currentView === 'grid') {
                el.className = "group relative flex flex-col items-center justify-start pt-4 gap-2 border border-gray-200 rounded-lg bg-white transition-all cursor-pointer overflow-hidden";
                el.style.height = '140px'; 
                el.onmouseenter = () => { el.style.borderColor = '#b91c1c'; el.style.backgroundColor = '#fef2f2'; const overlay = el.querySelector('.overlay-actions'); if(overlay) overlay.style.opacity = '1'; };
                el.onmouseleave = () => { el.style.borderColor = '#e5e7eb'; el.style.backgroundColor = 'white'; const overlay = el.querySelector('.overlay-actions'); if(overlay) overlay.style.opacity = '0'; };
                
                let actions = item.isFolder 
                    ? `${ canDelete && item.id.startsWith('custom-') ? `<button class="btn-delete-folder absolute top-2 right-2 w-6 h-6 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"><i class="fas fa-trash-alt text-xs"></i></button>` : '' }<button class="btn-open-folder w-8 h-8 rounded-full bg-gob-guinda text-white flex items-center justify-center hover:scale-110 shadow-md"><i class="fas fa-folder-open text-xs"></i></button>`
                    : `${ canDelete ? `<button class="btn-delete absolute top-2 right-2 w-6 h-6 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"><i class="fas fa-times text-xs"></i></button>` : '' }<div class="flex gap-2"><button class="btn-preview-file w-8 h-8 rounded-full bg-gob-guinda text-white flex items-center justify-center hover:scale-110"><i class="fas fa-eye text-xs"></i></button><button class="btn-download-file w-8 h-8 rounded-full bg-white text-gray-600 border border-gray-200 flex items-center justify-center hover:text-gob-guinda shadow-md hover:scale-110"><i class="fas fa-download text-xs"></i></button></div>`;

                el.innerHTML = `<i class="fas ${iconClass} ${iconColor} text-4xl transition-transform duration-300"></i><div class="w-full text-center px-2"><span class="block text-[11px] font-bold text-gray-700 leading-tight line-clamp-2 break-words" title="${item.name}">${item.name}</span><span class="block text-[9px] text-gray-400 mt-1">${item.date}</span></div><div class="overlay-actions absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 transition-opacity duration-200" style="background-color: rgba(255,255,255,0.95); opacity: 0; backdrop-filter: blur(1px);">${actions}</div>`;
            } else {
                // === CORRECCIÓN VISTA LISTA: NOMBRE COMPLETO ===
                el.className = "flex items-center justify-between p-2 border-b border-gray-100 transition-colors rounded text-xs cursor-pointer";
                el.onmouseenter = () => { el.style.backgroundColor = '#f8fafc'; const actions = el.querySelector('.list-actions'); if(actions) actions.style.opacity = '1'; };
                el.onmouseleave = () => { el.style.backgroundColor = 'transparent'; const actions = el.querySelector('.list-actions'); if(actions) actions.style.opacity = '0'; };
                
                let actions = item.isFolder 
                    ? `${ canDelete && item.id.startsWith('custom-') ? `<button class="btn-delete-folder p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded"><i class="fas fa-trash-alt"></i></button>` : '' }<button class="btn-open-folder p-1.5 text-gray-500 hover:text-gob-guinda hover:bg-white rounded"><i class="fas fa-folder-open"></i></button>`
                    : `<button class="btn-preview-file p-1.5 text-gray-500 hover:text-gob-guinda hover:bg-white rounded"><i class="fas fa-eye"></i></button><button class="btn-download-file p-1.5 text-gray-500 hover:text-blue-600 hover:bg-white rounded"><i class="fas fa-download"></i></button>${ canDelete ? `<button class="btn-delete p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded"><i class="fas fa-times"></i></button>` : '' }`;

                // Aquí quitamos 'truncate' y usamos 'flex-1 break-words' para que ocupe espacio y baje línea si es necesario
                el.innerHTML = `
                    <div class="flex items-center gap-3 flex-1">
                        <div class="w-8 flex-shrink-0 flex justify-center"><i class="fas ${iconClass} ${iconColor} text-lg"></i></div>
                        <span class="font-medium text-gray-700 break-words pr-2">${item.name}</span>
                    </div>
                    <div class="flex items-center gap-4 flex-shrink-0">
                        <span class="text-gray-400 text-[10px] hidden sm:block w-20 text-right">${item.date}</span>
                        <div class="list-actions flex items-center gap-1 transition-opacity duration-200" style="opacity: 0;">${actions}</div>
                    </div>`;
            }

            // Eventos (Igual que antes)
            if(item.isFolder) {
                el.onclick = (e) => { e.stopPropagation(); this.loadFolder(item.id, item.name); };
                const btnOpen = el.querySelector('.btn-open-folder');
                const btnDel = el.querySelector('.btn-delete-folder');
                if(btnOpen) btnOpen.onclick = (e) => { e.stopPropagation(); this.loadFolder(item.id, item.name); };
                if(btnDel) btnDel.onclick = (e) => { e.stopPropagation(); this.deleteCustomFolder(item.id, item.name); };
            } else {
                const btnPreview = el.querySelector('.btn-preview-file'); if(btnPreview) btnPreview.onclick = (e) => { e.stopPropagation(); this.previewFile(item.name); };
                const btnDownload = el.querySelector('.btn-download-file'); if(btnDownload) btnDownload.onclick = (e) => { e.stopPropagation(); this.downloadFile(item.name); };
                const btnDelete = el.querySelector('.btn-delete'); if(btnDelete) btnDelete.onclick = (e) => { e.stopPropagation(); this.deleteFile(item.name); }; 
                el.onclick = (e) => { if(!e.target.closest('button')) this.previewFile(item.name); };
            }
            content.appendChild(el);
        });
        document.getElementById('explorer-stats').textContent = `${items.length} Elementos`;
    }

    // --- ELIMINAR CARPETA PERSONALIZADA ---
    deleteCustomFolder(folderId, name) {
        Swal.fire({
            title: '¿Eliminar Carpeta?',
            text: `Se borrará la carpeta "${name}". Si tiene archivos, estos se eliminarán también.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Sí, borrar todo'
        }).then((result) => {
            if (result.isConfirmed) {
                // 1. Borrar la carpeta del localStorage
                let customFolders = JSON.parse(localStorage.getItem('custom_folders')) || [];
                customFolders = customFolders.filter(f => f.id !== folderId);
                localStorage.setItem('custom_folders', JSON.stringify(customFolders));

                // 2. Borrar (o mover) los archivos que estaban dentro
                // En este caso, optamos por borrar para mantener la limpieza, como advierte el mensaje.
                if (this.expediente.documentos) {
                    this.expediente.documentos = this.expediente.documentos.filter(d => d.folderId !== folderId);
                    updateExpediente(this.id, { documentos: this.expediente.documentos });
                }

                this.loadFolder('anexos', 'Anexos y Pruebas');
                Swal.fire('Eliminado', 'La carpeta ha sido eliminada', 'success');
            }
        });
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

        if (this.currentFolderId === 'anexos' || this.currentFolderId.startsWith('custom-')) {
            const index = this.expediente.documentos.findIndex(d => d.nombre === fileName);
            if (index !== -1) {
                this.expediente.documentos.splice(index, 1);
                updateExpediente(this.id, { documentos: this.expediente.documentos });
                eliminado = true;
            }
        } 
        else if (this.currentFolderId.startsWith('term-')) {
            const realId = this.currentFolderId.replace('term-', '');
            const terminos = JSON.parse(localStorage.getItem('terminos')) || [];
            const idx = terminos.findIndex(t => String(t.id) === String(realId));
            if (idx !== -1) {
                // Borrar del Historial
                if (terminos[idx].historialArchivos) {
                    terminos[idx].historialArchivos = terminos[idx].historialArchivos.filter(d => d.nombre !== fileName);
                }
                
                // Si el archivo borrado es el "actual", lo limpiamos también
                if (terminos[idx].archivoWord === fileName) terminos[idx].archivoWord = null; 
                if (terminos[idx].acuseDocumento === fileName) terminos[idx].acuseDocumento = null; 
                
                localStorage.setItem('terminos', JSON.stringify(terminos));
                eliminado = true;
            }
        }
        else if (this.currentFolderId.startsWith('aud-')) {
            const realId = this.currentFolderId.replace('aud-', '');
            let activas = JSON.parse(localStorage.getItem('audiencias')) || [];
            let idx = activas.findIndex(a => String(a.id) === String(realId));
            if (idx !== -1) {
                if(activas[idx].actaDocumento === fileName) { activas[idx].actaDocumento = ""; localStorage.setItem('audiencias', JSON.stringify(activas)); eliminado = true; }
            } else {
                let historicas = JSON.parse(localStorage.getItem('audienciasDesahogadas')) || [];
                idx = historicas.findIndex(a => String(a.id) === String(realId));
                if (idx !== -1) { if(historicas[idx].actaDocumento === fileName) { historicas[idx].actaDocumento = ""; localStorage.setItem('audienciasDesahogadas', JSON.stringify(historicas)); eliminado = true; } }
            }
        }

        if (eliminado) {
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Archivo eliminado', showConfirmButton: false, timer: 2000 });
            this.loadFolder(this.currentFolderId, this.currentLabel);
            this.renderDocumentsTable(); 
        } else {
            Swal.fire('Error', 'No se pudo localizar el archivo.', 'error');
        }
    }

   handleExplorerUpload(file) {
        if (!this.currentFolderId) return;
        if (this.currentFolderId.startsWith('term-')) {
            const realId = this.currentFolderId.replace('term-', '');
            const terminos = JSON.parse(localStorage.getItem('terminos')) || [];
            const idx = terminos.findIndex(t => String(t.id) === String(realId));
            if (idx !== -1) {
                if (file.name.endsWith('.pdf')) { terminos[idx].acuseDocumento = file.name; if(terminos[idx].estatus === 'Liberado') terminos[idx].estatus = 'Presentado'; } else { terminos[idx].archivoWord = file.name; }
                if(!terminos[idx].historialArchivos) terminos[idx].historialArchivos = [];
                terminos[idx].historialArchivos.push({ nombre: file.name, fecha: new Date().toISOString(), tipo: file.name.endsWith('.pdf') ? 'Acuse' : 'Borrador' });
                localStorage.setItem('terminos', JSON.stringify(terminos));
                this.loadFolder(this.currentFolderId, document.getElementById('explorer-breadcrumb').innerText);
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Archivo guardado en Historial', showConfirmButton: false, timer: 2000 });
            }
        } 
        else if (this.currentFolderId.startsWith('aud-')) {
            const realId = this.currentFolderId.replace('aud-', '');
            let activas = JSON.parse(localStorage.getItem('audiencias')) || [];
            let idx = activas.findIndex(a => String(a.id) === String(realId));
            if (idx !== -1) {
                activas[idx].actaDocumento = file.name; localStorage.setItem('audiencias', JSON.stringify(activas));
                this.loadFolder(this.currentFolderId, document.getElementById('explorer-breadcrumb').innerText);
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Archivo guardado en Audiencia', showConfirmButton: false, timer: 2000 });
                return;
            }
            let historicas = JSON.parse(localStorage.getItem('audienciasDesahogadas')) || [];
            idx = historicas.findIndex(a => String(a.id) === String(realId));
            if (idx !== -1) {
                historicas[idx].actaDocumento = file.name; localStorage.setItem('audienciasDesahogadas', JSON.stringify(historicas));
                this.loadFolder(this.currentFolderId, document.getElementById('explorer-breadcrumb').innerText);
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Archivo guardado en Histórico', showConfirmButton: false, timer: 2000 });
            }
        }
        else if (this.currentFolderId === 'anexos' || this.currentFolderId.startsWith('custom-')) {
            const newDoc = { nombre: file.name, tipo: 'Anexo', comentario: 'Subido desde Gestor', fecha: new Date().toLocaleDateString('es-MX'), folderId: this.currentFolderId.startsWith('custom-') ? this.currentFolderId : null };
            if (!this.expediente.documentos) this.expediente.documentos = [];
            this.expediente.documentos.push(newDoc);
            updateExpediente(this.id, { documentos: this.expediente.documentos });
            this.loadFolder(this.currentFolderId, this.currentLabel);
            this.renderDocumentsTable(); 
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Archivo subido', showConfirmButton: false, timer: 2000 });
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