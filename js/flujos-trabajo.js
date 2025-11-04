// Flujos de trabajo predefinidos
class FlujosTrabajo {
    constructor() {
        this.flujos = {
            'laboral': {
                nombre: 'Proceso Laboral',
                etapas: [
                    { 
                        nombre: 'Fase Inicial', 
                        orden: 1, 
                        tareas: ['demanda', 'emplazamiento'],
                        documentos: ['Demanda', 'Poder'],
                        plazoEstimado: '15 días'
                    },
                    { 
                        nombre: 'Fase de Pruebas', 
                        orden: 2, 
                        tareas: ['pruebas', 'testigos'],
                        documentos: ['Pruebas Documentales', 'Dictámenes'],
                        plazoEstimado: '30 días'
                    },
                    { 
                        nombre: 'Fase de Alegatos', 
                        orden: 3, 
                        tareas: ['alegatos', 'sentencia'],
                        documentos: ['Alegatos', 'Recursos'],
                        plazoEstimado: '15 días'
                    }
                ],
                duracionEstimada: '60 días'
            },
            'penal': {
                nombre: 'Proceso Penal',
                etapas: [
                    { 
                        nombre: 'Fase de Investigación', 
                        orden: 1, 
                        tareas: ['acusación', 'pruebas'],
                        documentos: ['Escrito de Acusación'],
                        plazoEstimado: '30 días'
                    },
                    { 
                        nombre: 'Fase de Juicio', 
                        orden: 2, 
                        tareas: ['vista', 'alegatos'],
                        documentos: ['Pruebas', 'Alegatos'],
                        plazoEstimado: '45 días'
                    }
                ],
                duracionEstimada: '75 días'
            }
        };
    }

    obtenerProximaEtapa(caso) {
        const flujo = this.flujos[caso.materia];
        if (!flujo) return null;

        const etapaActual = this.determinarEtapaActual(caso, flujo);
        return flujo.etapas.find(etapa => etapa.orden === etapaActual.orden + 1);
    }

    determinarEtapaActual(caso, flujo) {
        // Determinar etapa actual basándose en documentos y eventos
        for (let i = flujo.etapas.length - 1; i >= 0; i--) {
            const etapa = flujo.etapas[i];
            if (this.etapaCompletada(etapa, caso)) {
                return etapa;
            }
        }
        return flujo.etapas[0]; // Primera etapa por defecto
    }

    etapaCompletada(etapa, caso) {
        // Verificar si los documentos de la etapa están presentes
        return etapa.documentos.every(docRequerido => 
            Object.values(caso.documentos).flat().some(docCaso => 
                docCaso.nombre.toLowerCase().includes(docRequerido.toLowerCase())
            )
        );
    }

    sugerirAcciones(caso) {
        const proximaEtapa = this.obtenerProximaEtapa(caso);
        if (!proximaEtapa) return null;

        return {
            proximaEtapa: proximaEtapa.nombre,
            acciones: proximaEtapa.tareas,
            documentos: proximaEtapa.documentos,
            plazoEstimado: proximaEtapa.plazoEstimado,
            recomendaciones: this.generarRecomendaciones(proximaEtapa, caso)
        };
    }

    generarRecomendaciones(etapa, caso) {
        const recomendaciones = [];
        
        if (etapa.nombre.includes('Pruebas')) {
            recomendaciones.push('Recopilar toda la documentación probatoria');
            recomendaciones.push('Preparar testigos si es necesario');
        }
        
        if (etapa.nombre.includes('Alegatos')) {
            recomendaciones.push('Elaborar argumentación jurídica sólida');
            recomendaciones.push('Revisar jurisprudencia aplicable');
        }

        return recomendaciones;
    }

    calcularProgreso(caso) {
        const flujo = this.flujos[caso.materia];
        if (!flujo) return 0;

        const etapasCompletadas = flujo.etapas.filter(etapa => 
            this.etapaCompletada(etapa, caso)
        ).length;

        return Math.round((etapasCompletadas / flujo.etapas.length) * 100);
    }
}