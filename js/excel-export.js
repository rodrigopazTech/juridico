// Librería para exportación a Excel
// Requiere la librería XLSX.js para funcionar

/**
 * Exporta datos de audiencias a Excel
 */
function exportarAudienciasAExcel() {
    console.log('Iniciando exportación de audiencias a Excel...');
    
    try {
        // Obtener datos de audiencias (del array global o localStorage)
        let audiencias = [];
        
        if (typeof AUDIENCIAS !== 'undefined' && AUDIENCIAS.length > 0) {
            audiencias = AUDIENCIAS;
        } else {
            audiencias = JSON.parse(localStorage.getItem('audiencias')) || [];
        }
        
        if (audiencias.length === 0) {
            alert('No hay datos de audiencias para exportar.');
            return;
        }
        
        // Preparar datos para Excel con columnas específicas
        const datosExcel = audiencias.map(audiencia => ({
            'Fecha': formatearFecha(audiencia.fechaAudiencia || audiencia.fecha),
            'Hora': audiencia.horaAudiencia || audiencia.hora || '',
            'Tribunal': audiencia.tribunal || '',
            'Expediente': audiencia.expediente || '',
            'Actor/Quejoso': audiencia.actor || '',
            'Tipo de Audiencia': audiencia.tipoAudiencia || audiencia.tipo || '',
            'Materia': audiencia.materia || '',
            'Gerencia': audiencia.gerencia || '',
            'Abogado Encargado': audiencia.abogadoEncargado || '',
            'Abogado que Comparece': audiencia.abogadoComparece || '',
            'Prioridad': audiencia.prioridad || '',
            'Observaciones': audiencia.observaciones || '',
            'Atendida': audiencia.atendida ? 'Sí' : 'No',
            'Acta Documento': audiencia.actaDocumento || audiencia.actaNombre || '',
            'Recordatorio Días': audiencia.recordatorioDias || '',
            'Recordatorio Horas': audiencia.recordatorioHoras || '',
            'Fecha Creación': formatearFecha(audiencia.fechaCreacion),
            'Fecha Modificación': formatearFecha(audiencia.fechaModificacion)
        }));
        
        // Generar archivo Excel
        const nombreArchivo = `audiencias_${obtenerFechaHoyFormateada()}.xlsx`;
        generarArchivoExcel(datosExcel, nombreArchivo, 'Audiencias');
        
        console.log(`Exportación completada: ${nombreArchivo}`);
        
    } catch (error) {
        console.error('Error al exportar audiencias:', error);
        alert('Error al exportar audiencias a Excel. Ver consola para detalles.');
    }
}

/**
 * Exporta datos de términos a Excel
 */
function exportarTerminosAExcel() {
    console.log('Iniciando exportación de términos a Excel...');
    
    try {
        // Obtener datos de términos (del array global o localStorage)
        let terminos = [];
        
        if (typeof TERMINOS !== 'undefined' && TERMINOS.length > 0) {
            terminos = TERMINOS;
        } else {
            terminos = JSON.parse(localStorage.getItem('terminos')) || [];
        }
        
        if (terminos.length === 0) {
            alert('No hay datos de términos para exportar.');
            return;
        }
        
        // Preparar datos para Excel con columnas específicas
        const datosExcel = terminos.map(termino => ({
            'Fecha Ingreso': formatearFecha(termino.fechaIngreso),
            'Fecha Vencimiento': formatearFecha(termino.fechaVencimiento),
            'Expediente': termino.expediente || '',
            'Actor/Quejoso': termino.actor || '',
            'Asunto/Actuación': termino.actuacion || termino.asunto || '',
            'Prestación': termino.prestacion || termino.tipoAsunto || '',
            'Tribunal': termino.tribunal || '',
            'Abogado': termino.abogado || '',
            'Estado/Gerencia': termino.estado || termino.gerencia || '',
            'Prioridad': termino.prioridad || '',
            'Estatus/Etapa': termino.estatus || termino.etapaRevision || '',
            'Materia': termino.materia || '',
            'Observaciones': termino.observaciones || '',
            'Atendido': termino.atendido ? 'Sí' : 'No',
            'Acuse Documento': termino.acuseDocumento || '',
            'Recordatorio Días': termino.recordatorioDias || '',
            'Recordatorio Horas': termino.recordatorioHoras || '',
            'Fecha Creación': formatearFecha(termino.fechaCreacion),
            'Fecha Modificación': formatearFecha(termino.fechaModificacion)
        }));
        
        // Generar archivo Excel
        const nombreArchivo = `terminos_${obtenerFechaHoyFormateada()}.xlsx`;
        generarArchivoExcel(datosExcel, nombreArchivo, 'Términos');
        
        console.log(`Exportación completada: ${nombreArchivo}`);
        
    } catch (error) {
        console.error('Error al exportar términos:', error);
        alert('Error al exportar términos a Excel. Ver consola para detalles.');
    }
}

/**
 * Genera y descarga un archivo Excel
 */
function generarArchivoExcel(datos, nombreArchivo, nombreHoja) {
    try {
        // Verificar si XLSX está disponible
        if (typeof XLSX === 'undefined') {
            console.error('La librería XLSX no está cargada');
            alert('Error: La librería de exportación no está disponible. Contacte al administrador.');
            return;
        }
        
        // Crear workbook
        const wb = XLSX.utils.book_new();
        
        // Crear worksheet con los datos
        const ws = XLSX.utils.json_to_sheet(datos);
        
        // Ajustar ancho de columnas automáticamente
        const colWidths = calcularAnchoColumnas(datos);
        ws['!cols'] = colWidths;
        
        // Agregar worksheet al workbook
        XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
        
        // Generar y descargar archivo
        XLSX.writeFile(wb, nombreArchivo);
        
        // Mostrar mensaje de éxito
        mostrarMensajeExito(`Archivo ${nombreArchivo} descargado exitosamente`);
        
    } catch (error) {
        console.error('Error al generar archivo Excel:', error);
        throw error;
    }
}

/**
 * Calcula el ancho óptimo de columnas basado en el contenido
 */
function calcularAnchoColumnas(datos) {
    if (!datos || datos.length === 0) return [];
    
    const columnas = Object.keys(datos[0]);
    const anchos = columnas.map(columna => {
        // Calcular ancho basado en el header
        let maxAncho = columna.length;
        
        // Verificar contenido de cada fila
        datos.forEach(fila => {
            const valor = String(fila[columna] || '');
            if (valor.length > maxAncho) {
                maxAncho = valor.length;
            }
        });
        
        // Limitar ancho máximo y mínimo
        return { wch: Math.min(Math.max(maxAncho, 10), 50) };
    });
    
    return anchos;
}

/**
 * Formatea una fecha para mostrar en Excel
 */
function formatearFecha(fecha) {
    if (!fecha) return '';
    
    try {
        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj.getTime())) return fecha; // Si no es una fecha válida, retornar tal como está
        
        return fechaObj.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return fecha;
    }
}

/**
 * Obtiene la fecha actual formateada para nombres de archivo
 */
function obtenerFechaHoyFormateada() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const hora = String(hoy.getHours()).padStart(2, '0');
    const minuto = String(hoy.getMinutes()).padStart(2, '0');
    
    return `${año}${mes}${dia}_${hora}${minuto}`;
}

/**
 * Muestra un mensaje de éxito temporal
 */
function mostrarMensajeExito(mensaje) {
    // Crear elemento de mensaje
    const mensajeElement = document.createElement('div');
    mensajeElement.className = 'alert alert-success export-success-message';
    mensajeElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        padding: 15px 20px;
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-size: 14px;
        max-width: 400px;
    `;
    mensajeElement.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-check-circle"></i>
            <span>${mensaje}</span>
        </div>
    `;
    
    document.body.appendChild(mensajeElement);
    
    // Remover mensaje después de 4 segundos
    setTimeout(() => {
        if (mensajeElement.parentNode) {
            mensajeElement.parentNode.removeChild(mensajeElement);
        }
    }, 4000);
}

/**
 * Exporta datos filtrados actualmente visibles
 */
function exportarDatosFiltrados(tipo) {
    if (tipo === 'audiencias') {
        // Obtener filas visibles de la tabla de audiencias
        const filasVisibles = obtenerFilasVisibles('tabla-audiencias');
        if (filasVisibles.length === 0) {
            alert('No hay datos visibles para exportar. Verifique los filtros aplicados.');
            return;
        }
        exportarAudienciasAExcel();
    } else if (tipo === 'terminos') {
        // Obtener filas visibles de la tabla de términos
        const filasVisibles = obtenerFilasVisibles('tabla-terminos');
        if (filasVisibles.length === 0) {
            alert('No hay datos visibles para exportar. Verifique los filtros aplicados.');
            return;
        }
        exportarTerminosAExcel();
    }
}

/**
 * Obtiene las filas visibles de una tabla (no ocultas por filtros)
 */
function obtenerFilasVisibles(idTabla) {
    const tabla = document.getElementById(idTabla);
    if (!tabla) return [];
    
    const tbody = tabla.querySelector('tbody');
    if (!tbody) return [];
    
    const filas = Array.from(tbody.querySelectorAll('tr'));
    return filas.filter(fila => fila.style.display !== 'none');
}