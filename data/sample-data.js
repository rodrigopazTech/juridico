// Datos de ejemplo para la aplicación
const sampleData = {
    audiencias: [
        {
            id: 1,
            fecha: '15/01/2025',
            hora: '10:00 AM',
            tribunal: 'Primer Tribunal Colegiado',
            expediente: '2375/2025',
            actor: 'Ortega Ibarra',
            tipo: 'Inicial',
            materia: 'Laboral',
            prioridad: 'Alta',
            estado: 'Programada'
        },
        {
            id: 2,
            fecha: '22/01/2025',
            hora: '2:00 PM',
            tribunal: 'Segundo Tribunal Colegiado',
            expediente: '1595/2025',
            actor: 'Sosa Uc',
            tipo: 'Intermedia',
            materia: 'Penal',
            prioridad: 'Media',
            estado: 'Programada'
        }
    ],
    terminos: [
        {
            id: 1,
            fIngreso: '10/01/2025',
            fVencimiento: '18/01/2025',
            expediente: '2375/2025',
            actor: 'Ortega Ibarra',
            asunto: 'Contestación de demanda',
            prestacion: 'Reinstalación',
            partes: 'Juan Carlos Ortega Ibarra vs. Empresa Constructora S.A. de C.V.',
            procedimiento: 'Procedimiento ordinario laboral según artículos 873-884 de la Ley Federal del Trabajo.',
            abogado: 'Lic. Martínez',
            acuse: 'AC-2025-001',
            estatus: 'Presentado',
            prioridad: 'Alta'
        },
        {
            id: 2,
            fIngreso: '12/01/2025',
            fVencimiento: '20/01/2025',
            expediente: '2012/2025',
            actor: 'Valdez Sánchez',
            asunto: 'Ofrecimiento de pruebas',
            prestacion: 'Indemnización',
            partes: 'Mario Valdez Sánchez vs. Transportes Unidos S.A.',
            procedimiento: 'Procedimiento especial de ofrecimiento y admisión de pruebas en juicio mercantil.',
            abogado: 'Lic. González',
            acuse: 'AC-2025-002',
            estatus: 'Liberado',
            prioridad: 'Media'
        }
    ]
};