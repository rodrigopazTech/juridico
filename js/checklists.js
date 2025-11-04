// Checklists inteligentes por materia
class ChecklistsInteligentes {
    constructor() {
        this.plantillas = {
            'laboral': [
                { 
                    tarea: 'Presentar demanda inicial', 
                    obligatorio: true, 
                    etapa: 'inicial',
                    documentos: ['Demanda', 'Poder notarial']
                },
                { 
                    tarea: 'Ofrecer pruebas documentales', 
                    obligatorio: true, 
                    etapa: 'pruebas',
                    documentos: ['Pruebas documentales', 'Dictámenes']
                },
                { 
                    tarea: 'Audiencia de conciliación', 
                    obligatorio: false, 
                    etapa: 'audiencias',
                    documentos: ['Acta de audiencia']
                },
                { 
                    tarea: 'Presentar alegatos', 
                    obligatorio: true, 
                    etapa: 'alegatos',
                    documentos: ['Alegatos', 'Recursos']
                }
            ],
            'penal': [
                { 
                    tarea: 'Presentar escrito de acusación', 
                    obligatorio: true, 
                    etapa: 'inicial',
                    documentos: ['Escrito de acusación']
                },
                { 
                    tarea: 'Ofrecer pruebas periciales', 
                    obligatorio: false, 
                    etapa: 'pruebas',
                    documentos: ['Pruebas periciales']
                },
                { 
                    tarea: 'Audiencia de vista', 
                    obligatorio: true, 
                    etapa: 'audiencias',
                    documentos: ['Acta de vista']
                }
            ],
            'mercantil': [
                { 
                    tarea: 'Presentar demanda mercantil', 
                    obligatorio: true, 
                    etapa: 'inicial',
                    documentos: ['Demanda mercantil']
                },
                { 
                    tarea: 'Anexar documentos comerciales', 
                    obligatorio: true, 
                    etapa: 'pruebas',
                    documentos: ['Contratos', 'Facturas']
                }
            ]
        };
    }

    generarChecklist(materia, caso) {
        const plantilla = this.plantillas[materia.toLowerCase()] || [];
        return plantilla.map(tarea => ({
            ...tarea,
            completado: this.verificarCompletado(tarea, caso),
            fechaCompletado: null,
            responsable: caso.abogado
        }));
    }

    verificarCompletado(tarea, caso) {
        // Verificar si existen documentos relacionados con la tarea
        const documentosRequeridos = tarea.documentos || [];
        const documentosCaso = caso.documentos ? Object.values(caso.documentos).flat() : [];
        
        return documentosRequeridos.some(docRequerido => 
            documentosCaso.some(docCaso => 
                docCaso.nombre.toLowerCase().includes(docRequerido.toLowerCase())
            )
        );
    }

    obtenerProgreso(checklist) {
        const total = checklist.length;
        const completados = checklist.filter(item => item.completado).length;
        return {
            completados,
            total,
            porcentaje: total > 0 ? Math.round((completados / total) * 100) : 0
        };
    }

    sugerirProximaTarea(checklist) {
        return checklist.find(item => !item.completado && item.obligatorio) || 
               checklist.find(item => !item.completado);
    }
}