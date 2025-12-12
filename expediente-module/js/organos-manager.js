// js/organos-manager.js

export class OrganosManager {
    constructor() {
        this.STORAGE_KEY = 'catalogo_organos_jurisdiccionales';
        this.organos = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [
            'Juzgado Primero de Distrito',
            'Tribunal Colegiado en Materia Civil',
            'Juzgado Quinto de lo Familiar',
            'Junta Local de Conciliación y Arbitraje'
        ];
        this.modal = null;
    }

    init() {
        // Buscamos el modal aquí, no en el constructor, para dar tiempo al DOM
        this.modal = document.getElementById('modal-manage-organos');
        
        if (!this.modal) {
            console.warn('OrganosManager: No se encontró el modal #modal-manage-organos en el DOM.');
        }

        this.renderList();
        this.updateDatalists();
        this.bindEvents();
    }

    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.organos));
        this.updateDatalists();
    }

    updateDatalists() {
        const ids = ['datalist-organos-create', 'datalist-organos-edit'];
        
        ids.forEach(id => {
            const datalist = document.getElementById(id);
            if (!datalist) {
                // console.log(`OrganosManager: No se encontró #${id} (Aún no cargado o no existe en esta página)`);
                return;
            }
            
            datalist.innerHTML = '';
            this.organos.sort().forEach(org => {
                const opt = document.createElement('option');
                opt.value = org;
                datalist.appendChild(opt);
            });
            // console.log(`OrganosManager: Lista actualizada para #${id}`);
        });
    }

    bindEvents() {
        const btnCreate = document.getElementById('btn-manage-organos-create');
        const btnEdit = document.getElementById('btn-manage-organos-edit');
        
        // Usamos ?. para evitar errores si el botón no existe en la página actual
        btnCreate?.addEventListener('click', (e) => { e.preventDefault(); this.openModal(); });
        btnEdit?.addEventListener('click', (e) => { e.preventDefault(); this.openModal(); });

        const btnClose = document.getElementById('close-manage-organos');
        btnClose?.addEventListener('click', () => this.closeModal());

        const btnSave = document.getElementById('btn-save-organo');
        btnSave?.addEventListener('click', () => this.handleSave());

        const btnCancel = document.getElementById('btn-cancel-edit-organo');
        btnCancel?.addEventListener('click', () => this.resetForm());
    }

    openModal() {
        if(this.modal) {
            this.renderList();
            this.modal.classList.remove('hidden');
            this.modal.classList.add('flex');
        } else {
            console.error('Intentando abrir modal de órganos, pero no se encontró en el DOM.');
        }
    }

    closeModal() {
        if(this.modal) {
            this.modal.classList.add('hidden');
            this.modal.classList.remove('flex');
            this.resetForm();
        }
    }

    handleSave() {
        const input = document.getElementById('input-nuevo-organo');
        const indexInput = document.getElementById('organo-edit-index');
        
        if(!input) return;

        const valor = input.value.trim();
        const index = indexInput.value;

        if (!valor) return alert("Escriba un nombre.");

        if (index !== "") {
            this.organos[index] = valor;
        } else {
            if (this.organos.includes(valor)) return alert("Este órgano ya existe.");
            this.organos.push(valor);
        }

        this.save();
        this.renderList();
        this.resetForm();
    }

    deleteOrgano(index) {
        if(confirm(`¿Eliminar "${this.organos[index]}" de la lista?`)) {
            this.organos.splice(index, 1);
            this.save();
            this.renderList();
        }
    }

    prepareEdit(index) {
        const input = document.getElementById('input-nuevo-organo');
        const indexInput = document.getElementById('organo-edit-index');
        const btnSave = document.getElementById('btn-save-organo');
        const btnCancel = document.getElementById('btn-cancel-edit-organo');

        if(!input) return;

        input.value = this.organos[index];
        indexInput.value = index;
        
        btnSave.innerHTML = '<i class="fas fa-save"></i>';
        btnCancel.classList.remove('hidden');
    }

    resetForm() {
        const input = document.getElementById('input-nuevo-organo');
        const indexInput = document.getElementById('organo-edit-index');
        const btnSave = document.getElementById('btn-save-organo');
        const btnCancel = document.getElementById('btn-cancel-edit-organo');

        if(input) input.value = '';
        if(indexInput) indexInput.value = '';
        if(btnSave) btnSave.innerHTML = '<i class="fas fa-plus"></i>';
        if(btnCancel) btnCancel.classList.add('hidden');
    }

    renderList() {
        const lista = document.getElementById('lista-organos');
        if(!lista) return;

        lista.innerHTML = '';
        this.organos.sort().forEach((org, index) => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center p-3 hover:bg-gray-100 transition-colors border-b last:border-0";
            li.innerHTML = `
                <span class="text-sm text-gray-700 font-medium">${org}</span>
                <div class="flex gap-2">
                    <button type="button" class="text-blue-600 hover:text-blue-800 btn-edit-org px-1" data-index="${index}">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button type="button" class="text-red-600 hover:text-red-800 btn-del-org px-1" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            lista.appendChild(li);
        });

        lista.querySelectorAll('.btn-del-org').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); this.deleteOrgano(btn.dataset.index); };
        });
        lista.querySelectorAll('.btn-edit-org').forEach(btn => {
            btn.onclick = (e) => { e.stopPropagation(); this.prepareEdit(btn.dataset.index); };
        });
    }
}