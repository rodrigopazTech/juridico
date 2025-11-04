// Sistema de compartición controlada
class ComparticionControlada {
    constructor() {
        this.permisos = {
            'lectura': ['ver', 'descargar'],
            'escritura': ['ver', 'editar', 'comentar'],
            'completo': ['ver', 'editar', 'eliminar', 'compartir']
        };
        
        this.comparticiones = this.cargarComparticiones();
    }

    compartirExpediente(expedienteId, usuarios, nivelPermiso, opciones = {}) {
        const comparticion = {
            id: this.generarId(),
            expedienteId,
            usuarios: usuarios.map(user => ({
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                permisos: this.permisos[nivelPermiso],
                fechaComparticion: new Date(),
                expiracion: opciones.expiracion || this.calcularExpiracion(30) // 30 días por defecto
            })),
            nivelPermiso,
            activo: true,
            fechaCreacion: new Date()
        };

        this.comparticiones.push(comparticion);
        this.guardarComparticiones();
        this.notificarUsuarios(usuarios, expedienteId);

        return comparticion;
    }

    verificarPermiso(usuarioId, expedienteId, accion) {
        const comparticion = this.obtenerComparticion(expedienteId, usuarioId);
        return comparticion && 
               comparticion.activo && 
               comparticion.permisos.includes(accion) &&
               new Date() < comparticion.expiracion;
    }

    generarEnlacePublico(expedienteId, opciones = {}) {
        const token = this.generarTokenSeguro();
        const enlace = {
            token,
            expedienteId,
            permisos: opciones.permisos || ['lectura'],
            expiracion: opciones.expiracion || this.calcularExpiracion(7), // 7 días por defecto
            maxUsos: opciones.maxUsos || null,
            usos: 0,
            activo: true
        };

        this.guardarEnlacePublico(enlace);
        return `${window.location.origin}/compartido/${token}`;
    }

    validarEnlacePublico(token) {
        const enlace = this.obtenerEnlacePublico(token);
        return enlace && 
               enlace.activo && 
               new Date() < enlace.expiracion &&
               (!enlace.maxUsos || enlace.usos < enlace.maxUsos);
    }

    obtenerComparticion(expedienteId, usuarioId) {
        return this.comparticiones.find(comp => 
            comp.expedienteId === expedienteId && 
            comp.usuarios.some(user => user.id === usuarioId) &&
            comp.activo
        );
    }

    obtenerEnlacePublico(token) {
        const enlaces = JSON.parse(localStorage.getItem('enlacesPublicos') || '[]');
        return enlaces.find(enlace => enlace.token === token);
    }

    guardarEnlacePublico(enlace) {
        const enlaces = JSON.parse(localStorage.getItem('enlacesPublicos') || '[]');
        enlaces.push(enlace);
        localStorage.setItem('enlacesPublicos', JSON.stringify(enlaces));
    }

    notificarUsuarios(usuarios, expedienteId) {
        // En producción, esto enviaría emails reales
        usuarios.forEach(usuario => {
            console.log(`Notificando a ${usuario.email} sobre el expediente ${expedienteId}`);
        });
    }

    generarTokenSeguro() {
        return 'token_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    generarId() {
        return 'comp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    calcularExpiracion(dias) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + dias);
        return fecha;
    }

    cargarComparticiones() {
        return JSON.parse(localStorage.getItem('comparticiones') || '[]');
    }

    guardarComparticiones() {
        localStorage.setItem('comparticiones', JSON.stringify(this.comparticiones));
    }

    // Métodos para la interfaz de usuario
    generarModalComparticion(expedienteId) {
        return `
            <div class="modal-comparticion">
                <h3>Compartir Expediente ${expedienteId}</h3>
                <div class="form-group">
                    <label>Usuarios:</label>
                    <input type="email" multiple placeholder="Ingresa emails separados por coma">
                </div>
                <div class="form-group">
                    <label>Nivel de permiso:</label>
                    <select>
                        <option value="lectura">Solo lectura</option>
                        <option value="escritura">Lectura y escritura</option>
                        <option value="completo">Acceso completo</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Expiración:</label>
                    <select>
                        <option value="7">7 días</option>
                        <option value="30" selected>30 días</option>
                        <option value="90">90 días</option>
                        <option value="365">1 año</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="comparticion.confirmarComparticion('${expedienteId}')">
                        Compartir
                    </button>
                    <button class="btn btn-danger" onclick="comparticion.cerrarModal()">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
    }

    confirmarComparticion(expedienteId) {
        // Implementar lógica de confirmación
        alert(`Expediente ${expedienteId} compartido exitosamente`);
        this.cerrarModal();
    }

    cerrarModal() {
        const modal = document.querySelector('.modal-comparticion');
        if (modal) modal.remove();
    }
}

// Inicializar instancia global
const comparticion = new ComparticionControlada();