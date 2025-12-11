/**
 * Dashboard Module
 * Displays analytics and charts for expedientes, usuarios, and gerencias
 * MODO OFFLINE: Requiere chart.min.js cargado en el HTML
 */
export class DashboardModule {
  constructor() {
    this.charts = {};
    
    // Estado para los filtros activos
    this.currentFilters = {
        gerenciaId: null,
        workloadMetric: 'expedientes' // Valor por defecto
    };

    this.gobColors = {
      guinda: '#9D2449',
      guindaDark: '#611232',
      oro: '#B38E5D',
      oroLight: '#DDC9A3',
      gris: '#545454',
      plata: '#98989A',
      verde: '#13322B',
      verdeDark: '#0C231E'
    };
    
    this.chartColors = [
      '#9D2449', // guinda
      '#B38E5D', // oro
      '#13322B', // verde
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // amber
      '#8B5CF6', // purple
      '#EF4444', // red
      '#06B6D4', // cyan
      '#EC4899'  // pink
    ];
  }

  init() {
    console.log('Initializing Dashboard Module...');
    
    // VERIFICACIÓN: Asegurar que la librería Chart.js esté cargada
    if (typeof Chart === 'undefined') {
        console.error("Chart.js no está definido. Asegúrate de incluir <script src='../js/chart.min.js'></script> en tu HTML.");
        return;
    }

    this.loadData();
    
    // Validación básica de datos
    if (!this.expedientes || !this.usuarios || !this.gerencias) {
        console.warn("Datos incompletos. Inicializando arrays vacíos para evitar errores.");
        this.expedientes = this.expedientes || [];
        this.usuarios = this.usuarios || [];
        this.gerencias = this.gerencias || [];
        this.audiencias = this.audiencias || [];
        this.terminos = this.terminos || [];
    }
    
    console.log('Data loaded:', {
      expedientes: this.expedientes.length,
      usuarios: this.usuarios.length,
      gerencias: this.gerencias.length
    });

    this.updateStats();
    
    // Retardo leve para asegurar que el DOM (canvas) esté listo
    setTimeout(() => {
        this.initCharts();
    }, 100);
    
    this.setupFilters();
    console.log('Dashboard Module initialized successfully');
  }

  // ==================== DATA LOADING ====================
  loadData() {
    // 1. Expedientes
    try {
        this.expedientes = JSON.parse(localStorage.getItem('expedientesData')) || [];
        if (this.expedientes.length === 0) {
             this.expedientes = this.getSampleExpedientes();
             localStorage.setItem('expedientesData', JSON.stringify(this.expedientes));
        }
    } catch(e) { this.expedientes = []; }

    // 2. Usuarios
    try { 
        this.usuarios = JSON.parse(localStorage.getItem('usuarios')) || this.getSampleUsuarios(); 
    } catch(e) { this.usuarios = []; }

    // 3. Gerencias
    try { 
        this.gerencias = JSON.parse(localStorage.getItem('gerencias')) || this.getSampleGerencias(); 
    } catch(e) { this.gerencias = []; }

    // 4. Audiencias
    try { 
        this.audiencias = JSON.parse(localStorage.getItem('audiencias')) || this.getSampleAudiencias(); 
    } catch(e) { this.audiencias = []; }

    // 5. Términos
    try { 
        this.terminos = JSON.parse(localStorage.getItem('terminos')) || this.getSampleTerminos(); 
    } catch(e) { this.terminos = []; }
  }

  // --- DATOS DE EJEMPLO ---
  getSampleExpedientes() {
    return [
      { id: 1, numero: 'EXP-0001', descripcion: 'Conflicto contractual', materia: 'Civil', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. González', gerenciaId: 1, ultimaActividad: '2025-01-15' },
      { id: 2, numero: 'EXP-0002', descripcion: 'Revisión normativa', materia: 'Administrativo', prioridad: 'Media', estado: 'En Revisión', abogado: 'Lic. Martínez', gerenciaId: 1, ultimaActividad: '2025-01-14' },
      { id: 3, numero: 'EXP-0003', descripcion: 'Demanda laboral', materia: 'Laboral', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Morales', gerenciaId: 2, ultimaActividad: '2025-01-13' },
      { id: 4, numero: 'EXP-0004', descripcion: 'Fraude fiscal', materia: 'Fiscal', prioridad: 'Urgente', estado: 'Urgente', abogado: 'Lic. Hernández', gerenciaId: 1, ultimaActividad: '2025-01-12' },
      { id: 5, numero: 'EXP-0005', descripcion: 'Procedimiento penal', materia: 'Penal', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Silva', gerenciaId: 2, ultimaActividad: '2025-01-11' },
      { id: 6, numero: 'EXP-0006', descripcion: 'Amparo constitucional', materia: 'Amparo', prioridad: 'Media', estado: 'En Revisión', abogado: 'Lic. Jiménez', gerenciaId: 3, ultimaActividad: '2025-01-10' }
    ];
  }

  getSampleUsuarios() {
    return [
      { id: 1, nombre: 'Lic. María González Ruiz', correo: 'maria.gonzalez@juridico.com', rol: 'SUBDIRECTOR', activo: true, gerenciaId: 1 },
      { id: 2, nombre: 'Lic. Carlos Hernández López', correo: 'carlos.hernandez@juridico.com', rol: 'GERENTE', activo: true, gerenciaId: 1 },
      { id: 3, nombre: 'Lic. Ana Patricia Morales', correo: 'ana.morales@juridico.com', rol: 'ABOGADO', activo: true, gerenciaId: 2 },
      { id: 4, nombre: 'Lic. Roberto Silva Martínez', correo: 'roberto.silva@juridico.com', rol: 'ABOGADO', activo: true, gerenciaId: 2 },
      { id: 5, nombre: 'Lic. Sandra Jiménez Castro', correo: 'sandra.jimenez@juridico.com', rol: 'ABOGADO', activo: true, gerenciaId: 3 }
    ];
  }

  getSampleGerencias() {
    return [
      { id: 1, nombre: 'Gerencia de Civil, Mercantil, Fiscal y Administrativo' },
      { id: 2, nombre: 'Gerencia Laboral y Penal' },
      { id: 3, nombre: 'Gerencia de Transparencia y Amparo' }
    ];
  }

  getSampleAudiencias() {
    return [
      { id: 1, fecha: '2024-09-15', estado: 'Desahogada', gerenciaId: 1, usuarioId: 1 },
      { id: 2, fecha: '2024-10-20', estado: 'Desahogada', gerenciaId: 2, usuarioId: 3 },
      { id: 3, fecha: '2024-11-05', estado: 'Desahogada', gerenciaId: 1, usuarioId: 2 },
      { id: 4, fecha: '2024-12-12', estado: 'Pendiente', gerenciaId: 3, usuarioId: 5 }
    ];
  }

  getSampleTerminos() {
    return [
      { id: 1, fecha: '2024-09-10', estado: 'Concluido', gerenciaId: 1, usuarioId: 1 },
      { id: 2, fecha: '2024-10-18', estado: 'Concluido', gerenciaId: 2, usuarioId: 4 },
      { id: 3, fecha: '2024-11-25', estado: 'Pendiente', gerenciaId: 3, usuarioId: 5 }
    ];
  }

  // ==================== STATS UPDATE ====================
  updateStats() {
    const totalExpedientes = this.expedientes.length;
    const expedientesActivos = this.expedientes.filter(e => e.estado === 'Activo').length;
    const usuariosActivos = this.usuarios.filter(u => u.activo).length;
    const totalGerencias = this.gerencias.length;

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if(el) el.textContent = val;
    };

    setVal('stat-total-expedientes', totalExpedientes);
    setVal('stat-activos', expedientesActivos);
    setVal('stat-usuarios', usuariosActivos);
    setVal('stat-gerencias', totalGerencias);
  }

  // ==================== CHART INITIALIZATION ====================
  initCharts() {
    this.createChartGerencias();
    // Inicializar gráficas con los filtros actuales (por defecto null / 'expedientes')
    this.createChartUsuarios(this.currentFilters.gerenciaId, this.currentFilters.workloadMetric);
    this.createChartTrabajoCompletado(this.currentFilters.gerenciaId);
    this.createChartEstados();
  }

  // 1. GRÁFICA DE ESTADOS (Doughnut)
  createChartEstados() {
    const ctx = document.getElementById('chartEstados');
    if (!ctx) return;

    const estados = {};
    this.expedientes.forEach(e => { estados[e.estado] = (estados[e.estado] || 0) + 1; });
    const labels = Object.keys(estados);
    const data = Object.values(estados);

    if(this.charts.estados) this.charts.estados.destroy();

    this.charts.estados = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: this.chartColors,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { padding: 15, font: { size: 12 } } } }
      }
    });
  }

  // 2. GRÁFICA CARGA DE TRABAJO (Bar Horizontal) - Con soporte de Métricas
  createChartUsuarios(gerenciaId = null, metric = 'expedientes') {
    const ctx = document.getElementById('chartUsuarios');
    if (!ctx) return;

    if (this.charts.usuarios) {
      this.charts.usuarios.destroy();
    }

    // Filtrar usuarios
    let usuariosFiltrados = this.usuarios.filter(u => u.activo);
    if (gerenciaId) {
      usuariosFiltrados = usuariosFiltrados.filter(u => u.gerenciaId == gerenciaId);
    }

    // Configurar datos según métrica
    let labelChart = '';
    let barColor = '';
    let dataCounts = [];

    if (metric === 'audiencias') {
        labelChart = 'Audiencias Asignadas';
        barColor = '#3B82F6'; // Azul
        dataCounts = usuariosFiltrados.map(u => {
            // Nota: Esto asume que en tus datos de audiencia hay un campo usuarioId o similar
            // Si no lo tienes, puedes usar la lógica de coincidencia de nombres como en expedientes
            return this.audiencias.filter(a => String(a.usuarioId) === String(u.id)).length; 
        });
    } else if (metric === 'terminos') {
        labelChart = 'Términos Asignados';
        barColor = '#10B981'; // Verde
        dataCounts = usuariosFiltrados.map(u => {
            return this.terminos.filter(t => String(t.usuarioId) === String(u.id)).length;
        });
    } else {
        // Default: Expedientes
        labelChart = 'Expedientes Asignados';
        barColor = this.gobColors.oro;
        dataCounts = usuariosFiltrados.map(u => {
            return this.expedientes.filter(e => {
                const nombreAbogado = e.abogado || '';
                const parts = u.nombre.split(' ');
                // Coincidencia simple por nombre
                return parts.some(p => p.length > 3 && nombreAbogado.includes(p));
            }).length;
        });
    }

    this.charts.usuarios = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: usuariosFiltrados.map(u => u.nombre),
        datasets: [{
          label: labelChart,
          data: dataCounts,
          backgroundColor: barColor,
          borderColor: barColor,
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
              callbacks: {
                  label: function(context) {
                      return `${context.dataset.label}: ${context.raw}`;
                  }
              }
          }
        },
        scales: {
          x: { 
            beginAtZero: true, 
            ticks: { stepSize: 1 },
            grid: { display: false }
          },
          y: { grid: { display: false } }
        }
      }
    });
  }

  // 3. GRÁFICA TRABAJO COMPLETADO (Line)
  createChartTrabajoCompletado(gerenciaId = null) {
    const ctx = document.getElementById('chartTrabajoCompletado');
    if (!ctx) return;
    if (this.charts.trabajoCompletado) this.charts.trabajoCompletado.destroy();

    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({ key, label: d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) });
    }

    let gerenciasFiltradas = this.gerencias;
    if (gerenciaId) gerenciasFiltradas = this.gerencias.filter(g => g.id == gerenciaId);

    const datasets = [];
    const gerenciaColors = [{ line: '#9D2449' }, { line: '#B38E5D' }, { line: '#13322B' }];

    gerenciasFiltradas.forEach((gerencia, index) => {
      const audienciasData = months.map(month => {
        return this.audiencias.filter(a => {
          if (a.gerenciaId != gerencia.id || a.estado !== 'Desahogada') return false;
          const fechaKey = a.fecha.substring(0, 7); 
          return fechaKey === month.key;
        }).length;
      });

      const terminosData = months.map(month => {
        return this.terminos.filter(t => {
          if (t.gerenciaId != gerencia.id || t.estado !== 'Concluido') return false;
          const fechaKey = t.fecha.substring(0, 7); 
          return fechaKey === month.key;
        }).length;
      });

      const color = gerenciaColors[index % gerenciaColors.length];

      datasets.push({
        label: `${this.truncateLabel(gerencia.nombre, 15)} - Aud.`,
        data: audienciasData,
        borderColor: color.line,
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.3
      });

      datasets.push({
        label: `${this.truncateLabel(gerencia.nombre, 15)} - Térm.`,
        data: terminosData,
        borderColor: color.line,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.3
      });
    });

    this.charts.trabajoCompletado = new Chart(ctx, {
      type: 'line',
      data: { labels: months.map(m => m.label), datasets: datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { padding: 10, boxWidth: 10, font: { size: 9 } } } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  }

  // 4. GRÁFICA GERENCIAS (Doughnut)
  createChartGerencias() {
    const ctx = document.getElementById('chartGerencias');
    if (!ctx) return;

    const gerenciaData = this.gerencias.map(gerencia => {
      const count = this.expedientes.filter(e => e.gerenciaId == gerencia.id).length;
      return { nombre: gerencia.nombre, count: count };
    });
    const sorted = gerenciaData.sort((a, b) => b.count - a.count);

    if(this.charts.gerencias) this.charts.gerencias.destroy();

    this.charts.gerencias = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: sorted.map(g => g.nombre),
        datasets: [{
          data: sorted.map(g => g.count),
          backgroundColor: [ this.gobColors.guinda, this.gobColors.oro, this.gobColors.verde, this.gobColors.gris ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'right', labels: { padding: 15, font: { size: 12 } } } }
      }
    });
  }

  // ==================== FILTERS ====================
  setupFilters() {
    // 1. Filtro General de Gerencia (Afecta a todo el dashboard)
    const filterGerenciaUnificado = document.getElementById('filterGerenciaUnificado');
    if (filterGerenciaUnificado) {
      filterGerenciaUnificado.innerHTML = '<option value="">📊 Todas las gerencias</option>';
      this.gerencias.forEach(gerencia => {
        const option = document.createElement('option');
        option.value = gerencia.id;
        option.textContent = gerencia.nombre;
        filterGerenciaUnificado.appendChild(option);
      });

      filterGerenciaUnificado.addEventListener('change', (e) => {
        this.currentFilters.gerenciaId = e.target.value || null;
        // Actualizar gráficas dependientes
        this.createChartUsuarios(this.currentFilters.gerenciaId, this.currentFilters.workloadMetric);
        this.createChartTrabajoCompletado(this.currentFilters.gerenciaId);
      });
    }

    // 2. Filtro Específico para Carga de Trabajo (Expedientes / Audiencias / Términos)
    const filterMetric = document.getElementById('filterCargaTrabajoMetric');
    if (filterMetric) {
        filterMetric.addEventListener('change', (e) => {
            this.currentFilters.workloadMetric = e.target.value;
            // Solo actualizamos la gráfica de usuarios
            this.createChartUsuarios(this.currentFilters.gerenciaId, this.currentFilters.workloadMetric);
        });
    }
  }

  // ==================== UTILITIES ====================
  truncateLabel(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}