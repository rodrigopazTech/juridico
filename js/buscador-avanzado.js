// Búsqueda full-text avanzada
class BuscadorFullText {
    constructor() {
        this.indices = new Map();
        this.stopWords = new Set([
            'el', 'la', 'los', 'las', 'de', 'del', 'y', 'e', 'o', 'u', 
            'a', 'en', 'un', 'una', 'unos', 'unas', 'con', 'por', 'para',
            'al', 'lo', 'se', 'su', 'sus', 'que', 'es', 'son', 'como'
        ]);
    }

    indexarExpediente(expediente) {
        // Indexar documentos
        if (expediente.documentos) {
            Object.values(expediente.documentos).flat().forEach(doc => {
                this.indexarDocumento(doc, expediente.id, 'documento');
            });
        }

        // Indexar timeline
        if (expediente.timeline) {
            expediente.timeline.forEach(evento => {
                this.indexarContenido(evento.titulo + ' ' + evento.descripcion, expediente.id, 'evento');
            });
        }

        // Indexar información general
        const contenidoGeneral = `
            ${expediente.expediente} 
            ${expediente.nombre} 
            ${expediente.demandado} 
            ${expediente.descripcion} 
            ${expediente.materia}
        `;
        this.indexarContenido(contenidoGeneral, expediente.id, 'expediente');
    }

    indexarDocumento(documento, expedienteId, tipo) {
        const contenido = documento.nombre.toLowerCase();
        this.indexarContenido(contenido, expedienteId, tipo, documento);
    }

    indexarContenido(contenido, expedienteId, tipo, metadata = null) {
        const palabras = this.tokenizar(contenido);
        
        palabras.forEach(palabra => {
            if (!this.indices.has(palabra)) {
                this.indices.set(palabra, []);
            }
            
            this.indices.get(palabra).push({
                expedienteId,
                tipo,
                metadata,
                relevancia: this.calcularRelevancia(palabra, contenido)
            });
        });
    }

    tokenizar(texto) {
        return texto.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(palabra => 
                palabra.length > 2 && 
                !this.stopWords.has(palabra)
            );
    }

    calcularRelevancia(palabra, contenido) {
        const frecuencia = (contenido.toLowerCase().split(palabra).length - 1);
        const longitud = contenido.length;
        return (frecuencia / longitud) * 100;
    }

    buscar(query, expedienteId = null) {
        const terminos = this.tokenizar(query);
        const resultados = {
            documentos: [],
            eventos: [],
            expedientes: []
        };

        terminos.forEach(termino => {
            if (this.indices.has(termino)) {
                this.indices.get(termino).forEach(item => {
                    if (!expedienteId || item.expedienteId === expedienteId) {
                        resultados[item.tipo + 's'].push({
                            ...item,
                            terminoBuscado: termino
                        });
                    }
                });
            }
        });

        // Ordenar por relevancia
        Object.keys(resultados).forEach(tipo => {
            resultados[tipo].sort((a, b) => b.relevancia - a.relevancia);
        });

        return resultados;
    }

    buscarEnTiempoReal(query) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(this.buscar(query));
            }, 300);
        });
    }

    buscarEnExpediente(query, expedienteId) {
        return this.buscar(query, expedienteId);
    }

    sugerirBusquedas(query) {
        const sugerencias = [];
        const terminos = this.tokenizar(query);
        
        if (terminos.length === 0) return sugerencias;

        const ultimoTermino = terminos[terminos.length - 1];
        
        for (let palabra of this.indices.keys()) {
            if (palabra.startsWith(ultimoTermino)) {
                sugerencias.push(palabra);
                if (sugerencias.length >= 5) break;
            }
        }

        return sugerencias;
    }
}