// Persistencia de timeline y actividad para Expediente
// Claves localStorage: expedienteTimeline:<id>, expedienteActividad:<id>

function timelineKey(id){ return `expedienteTimeline:${id}`; }
function actividadKey(id){ return `expedienteActividad:${id}`; }

function loadTimeline(id){
  return JSON.parse(localStorage.getItem(timelineKey(id)) || '[]');
}

function saveTimeline(id, items){
  localStorage.setItem(timelineKey(id), JSON.stringify(items));
}

function addTimelineEntry(id, entry){
  const list = loadTimeline(id);
  const item = {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    tipo: entry.tipo || 'Evento',
    titulo: entry.titulo || 'Actualización',
    descripcion: entry.descripcion || '',
    documentos: entry.documentos || []
  };
  list.unshift(item);
  saveTimeline(id, list);
  return item;
}

function loadActividad(id){
  return JSON.parse(localStorage.getItem(actividadKey(id)) || '[]');
}

function saveActividad(id, items){
  localStorage.setItem(actividadKey(id), JSON.stringify(items));
}

function addActividadEntry(id, entry){
  const list = loadActividad(id);
  const item = {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    descripcion: entry.descripcion || 'Actualización',
    usuario: entry.usuario || 'Sistema'
  };
  list.unshift(item);
  saveActividad(id, list);
  return item;
}

export { loadTimeline, addTimelineEntry, loadActividad, addActividadEntry };