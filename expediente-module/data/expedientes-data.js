const EXPEDIENTES_STORAGE_KEY = 'expedientesData';

function seedExpedientes() {
  if (!localStorage.getItem(EXPEDIENTES_STORAGE_KEY)) {
    // En expedientes-data.js, dentro de la función seedExpedientes()
  const seed = [
    {
      id: "exp-101",
      numero: '2375/2025',
      descripcion: 'Juicio Ordinario Civil - Acción Reivindicatoria de inmueble en zona centro.',
      materia: 'Civil',
      prioridad: 'Alta',
      estado: 'TRAMITE',
      abogado: 'Lic. Martínez',
      gerenciaId: "1", 
      gerencia: 'Civil, Mercantil, Fiscal y Administrativo',
      sede: 'CDMX',
      organo: 'Juzgado Primero de Distrito',
      partes: 'Juan Pérez vs Inmobiliaria Global S.A.',
      ultimaActividad: '17 dic 2025',
      actualizaciones: 1
    },
    {
      id: "exp-102",
      numero: '1090/2024',
      descripcion: 'Amparo Indirecto contra leyes fiscales (Reforma al Código Fiscal).',
      materia: 'Amparo',
      prioridad: 'Media',
      estado: 'TRAMITE',
      abogado: 'Lic. González',
      gerenciaId: "3", 
      gerencia: 'Transparencia y Amparo',
      sede: 'CDMX',
      organo: 'Tribunal Colegiado en Materia Administrativa',
      partes: 'Comercializadora del Norte vs SAT',
      ultimaActividad: '10 dic 2025',
      actualizaciones: 4
    },
    {
      id: "exp-103",
      numero: '552/2025',
      descripcion: 'Demanda Laboral por despido injustificado y pago de horas extras.',
      materia: 'Laboral',
      prioridad: 'Alta',
      estado: 'LAUDO',
      abogado: 'Lic. Gómez',
      gerenciaId: "2", 
      gerencia: 'Laboral y Penal',
      sede: 'Jalisco',
      organo: 'Junta Local de Conciliación y Arbitraje No. 3',
      partes: 'Roberto Casillas vs Refresquera del Sur',
      ultimaActividad: '15 dic 2025',
      actualizaciones: 2
    }
  ];
    localStorage.setItem(EXPEDIENTES_STORAGE_KEY, JSON.stringify(seed));
  }
}

function loadExpedientes() {
  seedExpedientes();
  return JSON.parse(localStorage.getItem(EXPEDIENTES_STORAGE_KEY) || '[]');
}

function saveExpedientes(data) {
  localStorage.setItem(EXPEDIENTES_STORAGE_KEY, JSON.stringify(data));
}

function createExpediente(payload) {
  const all = loadExpedientes();
  
  const gerenciasMap = {
    '1': 'Civil, Mercantil, Fiscal y Administrativo',
    '2': 'Laboral y Penal',
    '3': 'Transparencia y Amparo'
  };

  // Fecha legible para la tarjeta (Ej: 10 dic 2025)
  const fechaHoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });

  const expediente = {
    id: crypto.randomUUID(),
    // IMPORTANTE: ...payload copia todos los campos del formulario (organo, sede, partes, etc.)
    ...payload, 
    
    // Sobrescribimos/Aseguramos campos calculados
    numero: payload.numero.trim(),
    descripcion: payload.descripcion.trim(),
    materia: payload.materia,
    prioridad: payload.prioridad,
    
    // REGLA: Todo nuevo expediente inicia en TRAMITE
    estado: 'TRAMITE', 
    
    abogado: payload.abogado,
    gerenciaId: payload.gerenciaId, 
    gerencia: gerenciasMap[payload.gerenciaId] || 'Desconocida',
    ultimaActividad: fechaHoy,
    actualizaciones: 0
  };
  
  all.unshift(expediente);
  saveExpedientes(all);
  return expediente;
}

function filterExpedientes(criteria) {
  let data = loadExpedientes();
  if (criteria.search) {
    const q = criteria.search.toLowerCase();
    data = data.filter(e => e.numero.toLowerCase().includes(q) || e.descripcion.toLowerCase().includes(q));
  }
  ['materia','prioridad','estado','abogado'].forEach(key => {
    if (criteria[key]) data = data.filter(e => e[key] === criteria[key]);
  });
  return data;
}

function expedienteById(id) {
  return loadExpedientes().find(e => e.id === id) || null;
}

function updateExpediente(id, changes) {
  const all = loadExpedientes();
  const idx = all.findIndex(e => e.id === id);
  if (idx === -1) return null;
  
  // Actualizar fecha al editar
  const fechaHoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  
  all[idx] = { 
      ...all[idx], 
      ...changes, 
      ultimaActividad: fechaHoy, 
      actualizaciones: (all[idx].actualizaciones || 0) + 1 
  };
  saveExpedientes(all);
  return all[idx];
}

function removeExpediente(id) {
  const all = loadExpedientes();
  const next = all.filter(e => e.id !== id);
  saveExpedientes(next);
}

export {
  loadExpedientes,
  saveExpedientes,
  createExpediente,
  filterExpedientes,
  expedienteById,
  updateExpediente,
  removeExpediente
};