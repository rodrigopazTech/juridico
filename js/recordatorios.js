// Sistema de recordatorios automáticos
class RecordatoriosAutomaticos {
    constructor() {
        this.plazosLegales = {
            'laboral': {
                'contestacion': 15,
                'pruebas': 10,
                'alegatos': 5,
                'apelacion': 3
            },
            'penal': {
                'apelacion': 3,
                'pruebas': 8,
                'alegatos': 5
            },
            'mercantil': {
                'contestacion': 9,
                'pruebas': 6,
                'alegatos': 3
            },
            'civil': {
                'contestacion': 9,
                'pruebas': 6,
                'alegatos': 3
            }
        };
    }

    calcularRecordatorios(asuntos) {
        const recordatorios = [];
        const hoy = new Date();
        
        asuntos.forEach(asunto => {
            // Recordatorios basados en términos
            asunto.timeline.forEach(evento => {
                if (evento.estado === 'pendiente') {
                    const fechaVencimiento = new Date(evento.fecha);
                    const diasRestantes = Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24));
                    
                    if (diasRestantes <= 3 && diasRestantes >= 0) {
                        recordatorios.push({
                            tipo: 'URGENTE',
                            mensaje: `Término "${evento.titulo}" vence en ${diasRestantes} días`,
                            expediente: asunto.expediente,
                            fecha: evento.fecha
                        });
                    } else if (diasRestantes <= 7 && diasRestantes > 3) {
                        recordatorios.push({
                            tipo: 'PROXIMO',
                            mensaje: `Término "${evento.titulo}" vence en ${diasRestantes} días`,
                            expediente: asunto.expediente,
                            fecha: evento.fecha
                        });
                    }
                }
            });

            // Recordatorios basados en checklists pendientes
            asunto.checklist.forEach(item => {
                if (!item.completado && item.obligatorio) {
                    recordatorios.push({
                        tipo: 'PENDIENTE',
                        mensaje: `Tarea pendiente: ${item.tarea}`,
                        expediente: asunto.expediente,
                        fecha: null
                    });
                }
            });
        });

        return recordatorios;
    }

    calcularPlazosLegales(materia, fechaInicio) {
        const plazos = this.plazosLegales[materia.toLowerCase()];
        if (!plazos) return [];

        const resultados = [];
        const fechaBase = new Date(fechaInicio);

        Object.entries(plazos).forEach(([tipo, dias]) => {
            const fechaVencimiento = new Date(fechaBase);
            fechaVencimiento.setDate(fechaVencimiento.getDate() + dias);
            
            resultados.push({
                tipo: this.capitalize(tipo),
                dias: dias,
                fechaVencimiento: fechaVencimiento.toISOString().split('T')[0]
            });
        });

        return resultados;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}