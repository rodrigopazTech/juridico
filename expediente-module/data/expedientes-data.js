// Datos de ejemplo y utilidades para Expedientes
// Estructura base de un expediente:
// {
//   id: string,
//   numero: string,
//   descripcion: string,
//   materia: string,
//   prioridad: string,
//   estado: string,
//   abogado: string,
//   ultimaActividad: string (ISO date),
//   actualizaciones: number
// }

// expediente-module/data/expedientes-data.js

const EXPEDIENTES_STORAGE_KEY = 'expedientesData';

function seedExpedientes() {
  // Solo crear datos si no existen
  if (!localStorage.getItem(EXPEDIENTES_STORAGE_KEY)) {
    const seed = [
      {
        id: crypto.randomUUID(),
        numero: 'EXP-0001',
        descripcion: 'Conflicto contractual con proveedor estratégico.',
        materia: 'Civil',
        prioridad: 'Alta',
        estado: 'Activo',
        abogado: 'Lic. González',
        // NUEVOS CAMPOS PARA INTEGRACIÓN CON DASHBOARD
        gerenciaId: 1, 
        gerencia: 'Civil, Mercantil, Fiscal y Administrativo',
        ultimaActividad: '2025-01-15',
        actualizaciones: 3
      },
      {
        id: crypto.randomUUID(),
        numero: 'EXP-0002',
        descripcion: 'Revisión de cumplimiento normativo ambiental.',
        materia: 'Administrativo',
        prioridad: 'Media',
        estado: 'En Revisión',
        abogado: 'Lic. Martínez',
        gerenciaId: 1,
        gerencia: 'Civil, Mercantil, Fiscal y Administrativo',
        ultimaActividad: '2025-01-14',
        actualizaciones: 5
      },
      {
        id: crypto.randomUUID(),
        numero: 'EXP-0003',
        descripcion: 'Demanda laboral por despido injustificado.',
        materia: 'Laboral',
        prioridad: 'Alta',
        estado: 'Activo',
        abogado: 'Lic. Morales',
        gerenciaId: 2,
        gerencia: 'Laboral y Penal',
        ultimaActividad: '2025-01-13',
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
  
  // Mapeo simple de ID a Nombre de Gerencia (Podrías traer esto de localStorage 'gerencias' idealmente)
  const gerenciasMap = {
    '1': 'Civil, Mercantil, Fiscal y Administrativo',
    '2': 'Laboral y Penal',
    '3': 'Transparencia y Amparo'
  };

  const expediente = {
    id: crypto.randomUUID(),
    numero: payload.numero.trim(),
    descripcion: payload.descripcion.trim(),
    materia: payload.materia,
    prioridad: payload.prioridad,
    estado: payload.estado || 'Activo',
    abogado: payload.abogado,
    // Guardamos ambos datos: ID para gráficas, Nombre para visualización
    gerenciaId: parseInt(payload.gerenciaId), 
    gerencia: gerenciasMap[payload.gerenciaId] || 'Desconocida',
    ultimaActividad: new Date().toISOString().slice(0,10),
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
  all[idx] = { ...all[idx], ...changes, ultimaActividad: new Date().toISOString().slice(0,10), actualizaciones: (all[idx].actualizaciones || 0) + 1 };
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