/**
 * Dashboard Module
 * Displays analytics and charts for expedientes, usuarios, and gerencias
 */
export class DashboardModule {
  constructor() {
    this.charts = {};
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
    this.loadData();
    console.log('Data loaded:', {
      expedientes: this.expedientes.length,
      usuarios: this.usuarios.length,
      gerencias: this.gerencias.length
    });
    this.updateStats();
    this.initCharts();
    this.setupFilters();
    console.log('Dashboard Module initialized successfully');
  }

  // ==================== DATA LOADING ====================
  loadData() {
    let storedExpedientes = JSON.parse(localStorage.getItem('expedientesData'));

    if (!storedExpedientes || storedExpedientes.length === 0) {
        this.expedientes = this.getSampleExpedientes();
        localStorage.setItem('expedientesData', JSON.stringify(this.expedientes));
    } else {
        this.expedientes = storedExpedientes;
    }
    
    this.usuarios = JSON.parse(localStorage.getItem('usuarios')) || this.getSampleUsuarios();

    this.gerencias = JSON.parse(localStorage.getItem('gerencias')) || this.getSampleGerencias();

    // Load audiencias
    this.audiencias = JSON.parse(localStorage.getItem('audiencias')) || this.getSampleAudiencias();
    
    // Load terminos
    this.terminos = JSON.parse(localStorage.getItem('terminos')) || this.getSampleTerminos();
  }

  getSampleExpedientes() {
    return [
      // Gerencia 1: Civil, Mercantil, Fiscal y Administrativo (15 expedientes)
      { id: 1, numero: 'EXP-0001', descripcion: 'Conflicto contractual', materia: 'Civil', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. González', gerenciaId: 1, ultimaActividad: '2025-01-15' },
      { id: 2, numero: 'EXP-0002', descripcion: 'Revisión normativa', materia: 'Administrativo', prioridad: 'Media', estado: 'En Revisión', abogado: 'Lic. Martínez', gerenciaId: 1, ultimaActividad: '2025-01-14' },
      { id: 4, numero: 'EXP-0004', descripcion: 'Fraude fiscal', materia: 'Fiscal', prioridad: 'Urgente', estado: 'Urgente', abogado: 'Lic. Hernández', gerenciaId: 1, ultimaActividad: '2025-01-12' },
      { id: 7, numero: 'EXP-0007', descripcion: 'Litigio mercantil', materia: 'Mercantil', prioridad: 'Media', estado: 'Activo', abogado: 'Lic. Hernández', gerenciaId: 1, ultimaActividad: '2025-01-09' },
      { id: 9, numero: 'EXP-0009', descripcion: 'Juicio ejecutivo mercantil', materia: 'Mercantil', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. González', gerenciaId: 1, ultimaActividad: '2025-01-08' },
      { id: 10, numero: 'EXP-0010', descripcion: 'Recurso de revocación fiscal', materia: 'Fiscal', prioridad: 'Media', estado: 'En Revisión', abogado: 'Lic. Hernández', gerenciaId: 1, ultimaActividad: '2025-01-07' },
      { id: 11, numero: 'EXP-0011', descripcion: 'Demanda civil divorcio', materia: 'Civil', prioridad: 'Baja', estado: 'Activo', abogado: 'Lic. González', gerenciaId: 1, ultimaActividad: '2025-01-06' },
      { id: 12, numero: 'EXP-0012', descripcion: 'Nulidad de contrato', materia: 'Civil', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Martínez', gerenciaId: 1, ultimaActividad: '2025-01-05' },
      { id: 13, numero: 'EXP-0013', descripcion: 'Cobro de pesos y costas', materia: 'Mercantil', prioridad: 'Media', estado: 'En Revisión', abogado: 'Lic. Hernández', gerenciaId: 1, ultimaActividad: '2025-01-04' },
      { id: 14, numero: 'EXP-0014', descripcion: 'Juicio contencioso administrativo', materia: 'Administrativo', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. González', gerenciaId: 1, ultimaActividad: '2025-01-03' },
      { id: 15, numero: 'EXP-0015', descripcion: 'Recurso de inconformidad', materia: 'Administrativo', prioridad: 'Media', estado: 'Concluido', abogado: 'Lic. Martínez', gerenciaId: 1, ultimaActividad: '2024-12-20' },
      { id: 16, numero: 'EXP-0016', descripcion: 'Dictamen fiscal SAT', materia: 'Fiscal', prioridad: 'Urgente', estado: 'Urgente', abogado: 'Lic. Hernández', gerenciaId: 1, ultimaActividad: '2025-01-16' },
      { id: 17, numero: 'EXP-0017', descripcion: 'Prescripción adquisitiva', materia: 'Civil', prioridad: 'Media', estado: 'Activo', abogado: 'Lic. González', gerenciaId: 1, ultimaActividad: '2025-01-02' },
      { id: 18, numero: 'EXP-0018', descripcion: 'Quiebra mercantil', materia: 'Mercantil', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Hernández', gerenciaId: 1, ultimaActividad: '2024-12-28' },
      { id: 19, numero: 'EXP-0019', descripcion: 'Devolución de impuestos', materia: 'Fiscal', prioridad: 'Media', estado: 'En Revisión', abogado: 'Lic. Martínez', gerenciaId: 1, ultimaActividad: '2024-12-15' },

      // Gerencia 2: Laboral y Penal (12 expedientes)
      { id: 3, numero: 'EXP-0003', descripcion: 'Demanda laboral', materia: 'Laboral', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Morales', gerenciaId: 2, ultimaActividad: '2025-01-13' },
      { id: 5, numero: 'EXP-0005', descripcion: 'Procedimiento penal', materia: 'Penal', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Silva', gerenciaId: 2, ultimaActividad: '2025-01-11' },
      { id: 20, numero: 'EXP-0020', descripcion: 'Despido injustificado', materia: 'Laboral', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Morales', gerenciaId: 2, ultimaActividad: '2025-01-14' },
      { id: 21, numero: 'EXP-0021', descripcion: 'Defensa penal robo', materia: 'Penal', prioridad: 'Urgente', estado: 'Urgente', abogado: 'Lic. Silva', gerenciaId: 2, ultimaActividad: '2025-01-13' },
      { id: 22, numero: 'EXP-0022', descripcion: 'Horas extras no pagadas', materia: 'Laboral', prioridad: 'Media', estado: 'En Revisión', abogado: 'Lic. Morales', gerenciaId: 2, ultimaActividad: '2025-01-10' },
      { id: 23, numero: 'EXP-0023', descripcion: 'Proceso penal fraude', materia: 'Penal', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Silva', gerenciaId: 2, ultimaActividad: '2025-01-09' },
      { id: 24, numero: 'EXP-0024', descripcion: 'Indemnización laboral', materia: 'Laboral', prioridad: 'Media', estado: 'Activo', abogado: 'Lic. Morales', gerenciaId: 2, ultimaActividad: '2025-01-08' },
      { id: 25, numero: 'EXP-0025', descripcion: 'Defensa penal lesiones', materia: 'Penal', prioridad: 'Media', estado: 'Activo', abogado: 'Lic. Silva', gerenciaId: 2, ultimaActividad: '2025-01-07' },
      { id: 26, numero: 'EXP-0026', descripcion: 'Reinstalación laboral', materia: 'Laboral', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Morales', gerenciaId: 2, ultimaActividad: '2025-01-06' },
      { id: 27, numero: 'EXP-0027', descripcion: 'Amparo en penal', materia: 'Penal', prioridad: 'Urgente', estado: 'Urgente', abogado: 'Lic. Silva', gerenciaId: 2, ultimaActividad: '2025-01-15' },
      { id: 28, numero: 'EXP-0028', descripcion: 'Acoso laboral', materia: 'Laboral', prioridad: 'Alta', estado: 'En Revisión', abogado: 'Lic. Morales', gerenciaId: 2, ultimaActividad: '2025-01-05' },
      { id: 29, numero: 'EXP-0029', descripcion: 'Delito fiscal penal', materia: 'Penal', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Silva', gerenciaId: 2, ultimaActividad: '2025-01-04' },

      // Gerencia 3: Transparencia y Amparo (8 expedientes)
      { id: 6, numero: 'EXP-0006', descripcion: 'Amparo constitucional', materia: 'Amparo', prioridad: 'Media', estado: 'En Revisión', abogado: 'Lic. Jiménez', gerenciaId: 3, ultimaActividad: '2025-01-10' },
      { id: 8, numero: 'EXP-0008', descripcion: 'Solicitud transparencia', materia: 'Transparencia', prioridad: 'Baja', estado: 'Concluido', abogado: 'Lic. Jiménez', gerenciaId: 3, ultimaActividad: '2024-12-28' },
      { id: 30, numero: 'EXP-0030', descripcion: 'Amparo indirecto', materia: 'Amparo', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Jiménez', gerenciaId: 3, ultimaActividad: '2025-01-12' },
      { id: 31, numero: 'EXP-0031', descripcion: 'Recurso de revisión INAI', materia: 'Transparencia', prioridad: 'Media', estado: 'En Revisión', abogado: 'Lic. Jiménez', gerenciaId: 3, ultimaActividad: '2025-01-11' },
      { id: 32, numero: 'EXP-0032', descripcion: 'Amparo directo', materia: 'Amparo', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Jiménez', gerenciaId: 3, ultimaActividad: '2025-01-09' },
      { id: 33, numero: 'EXP-0033', descripcion: 'Acceso a la información', materia: 'Transparencia', prioridad: 'Media', estado: 'Activo', abogado: 'Lic. Jiménez', gerenciaId: 3, ultimaActividad: '2025-01-08' },
      { id: 34, numero: 'EXP-0034', descripcion: 'Amparo adhesivo', materia: 'Amparo', prioridad: 'Media', estado: 'En Revisión', abogado: 'Lic. Jiménez', gerenciaId: 3, ultimaActividad: '2025-01-07' },
      { id: 35, numero: 'EXP-0035', descripcion: 'Protección de datos personales', materia: 'Transparencia', prioridad: 'Alta', estado: 'Activo', abogado: 'Lic. Jiménez', gerenciaId: 3, ultimaActividad: '2025-01-06' }
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
      { id: 1, fecha: '2024-09-15', estado: 'Desahogada', gerenciaId: 1 },
      { id: 2, fecha: '2024-09-20', estado: 'Desahogada', gerenciaId: 2 },
      { id: 3, fecha: '2024-10-05', estado: 'Desahogada', gerenciaId: 1 },
      { id: 4, fecha: '2024-10-12', estado: 'Pendiente', gerenciaId: 3 },
      { id: 5, fecha: '2024-10-18', estado: 'Desahogada', gerenciaId: 2 },
      { id: 6, fecha: '2024-10-25', estado: 'Desahogada', gerenciaId: 1 },
      { id: 7, fecha: '2024-11-02', estado: 'Desahogada', gerenciaId: 3 },
      { id: 8, fecha: '2024-11-08', estado: 'Desahogada', gerenciaId: 1 },
      { id: 9, fecha: '2024-11-15', estado: 'Desahogada', gerenciaId: 2 },
      { id: 10, fecha: '2024-11-22', estado: 'Desahogada', gerenciaId: 1 },
      { id: 11, fecha: '2024-12-03', estado: 'Desahogada', gerenciaId: 3 },
      { id: 12, fecha: '2024-12-10', estado: 'Desahogada', gerenciaId: 2 },
      { id: 13, fecha: '2024-12-18', estado: 'Desahogada', gerenciaId: 1 },
      { id: 14, fecha: '2025-01-05', estado: 'Desahogada', gerenciaId: 2 },
      { id: 15, fecha: '2025-01-12', estado: 'Desahogada', gerenciaId: 3 },
      { id: 16, fecha: '2025-01-20', estado: 'Desahogada', gerenciaId: 1 }
    ];
  }

  getSampleTerminos() {
    return [
      { id: 1, fecha: '2024-09-10', estado: 'Concluido', gerenciaId: 1 },
      { id: 2, fecha: '2024-09-18', estado: 'Concluido', gerenciaId: 2 },
      { id: 3, fecha: '2024-09-25', estado: 'Pendiente', gerenciaId: 3 },
      { id: 4, fecha: '2024-10-08', estado: 'Concluido', gerenciaId: 1 },
      { id: 5, fecha: '2024-10-15', estado: 'Concluido', gerenciaId: 2 },
      { id: 6, fecha: '2024-10-22', estado: 'Concluido', gerenciaId: 3 },
      { id: 7, fecha: '2024-10-28', estado: 'Concluido', gerenciaId: 1 },
      { id: 8, fecha: '2024-11-05', estado: 'Concluido', gerenciaId: 2 },
      { id: 9, fecha: '2024-11-12', estado: 'Concluido', gerenciaId: 1 },
      { id: 10, fecha: '2024-11-19', estado: 'Concluido', gerenciaId: 3 },
      { id: 11, fecha: '2024-11-26', estado: 'Concluido', gerenciaId: 2 },
      { id: 12, fecha: '2024-12-05', estado: 'Concluido', gerenciaId: 1 },
      { id: 13, fecha: '2024-12-12', estado: 'Concluido', gerenciaId: 3 },
      { id: 14, fecha: '2024-12-20', estado: 'Concluido', gerenciaId: 2 },
      { id: 15, fecha: '2025-01-08', estado: 'Concluido', gerenciaId: 1 },
      { id: 16, fecha: '2025-01-15', estado: 'Concluido', gerenciaId: 2 },
      { id: 17, fecha: '2025-01-22', estado: 'Concluido', gerenciaId: 3 }
    ];
  }

  // ==================== STATS UPDATE ====================
  updateStats() {
    const totalExpedientes = this.expedientes.length;
    const expedientesActivos = this.expedientes.filter(e => e.estado === 'Activo').length;
    const usuariosActivos = this.usuarios.filter(u => u.activo).length;
    const totalGerencias = this.gerencias.length;

    document.getElementById('stat-total-expedientes').textContent = totalExpedientes;
    document.getElementById('stat-activos').textContent = expedientesActivos;
    document.getElementById('stat-usuarios').textContent = usuariosActivos;
    document.getElementById('stat-gerencias').textContent = totalGerencias;
  }

  // ==================== CHART INITIALIZATION ====================
  initCharts() {
    this.createChartGerencias();
    this.createChartUsuarios();
    this.createChartTrabajoCompletado();
    this.createChartEstados();
  }

  // Chart 1: Estados de Expedientes (Doughnut Chart)
  createChartEstados() {
    const ctx = document.getElementById('chartEstados');
    if (!ctx) return;

    const estados = {};
    this.expedientes.forEach(e => {
      estados[e.estado] = (estados[e.estado] || 0) + 1;
    });

    const labels = Object.keys(estados);
    const data = Object.values(estados);

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
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }

  // Chart 3: Carga de Trabajo por Usuario (Horizontal Bar Chart)
  createChartUsuarios(gerenciaId = null) {
    const ctx = document.getElementById('chartUsuarios');
    if (!ctx) return;

    // Destroy existing chart if exists
    if (this.charts.usuarios) {
      this.charts.usuarios.destroy();
    }

    let usuariosFiltrados = this.usuarios.filter(u => u.activo);
    if (gerenciaId) {
      usuariosFiltrados = usuariosFiltrados.filter(u => u.gerenciaId == gerenciaId);
    }

    const data = usuariosFiltrados.map(usuario => {
      const count = this.expedientes.filter(e => {
        const nombreAbogado = e.abogado || '';
        return nombreAbogado.includes(usuario.nombre.split(' ')[1]) || 
               nombreAbogado.includes(usuario.nombre.split(' ')[2]);
      }).length;
      return { nombre: usuario.nombre, count };
    });

    this.charts.usuarios = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.nombre),
        datasets: [{
          label: 'Expedientes Asignados',
          data: data.map(d => d.count),
          backgroundColor: this.gobColors.oro,
          borderColor: this.gobColors.oro,
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  // Chart 3: Trabajo Completado por Gerencia (Multi-line with colored points)
  createChartTrabajoCompletado(gerenciaId = null) {
    const ctx = document.getElementById('chartTrabajoCompletado');
    if (!ctx) return;

    // Destroy existing chart if exists
    if (this.charts.trabajoCompletado) {
      this.charts.trabajoCompletado.destroy();
    }

    // Get last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        key,
        label: d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
      });
    }

    // Filter gerencias if specific one is selected
    let gerenciasFiltradas = this.gerencias;
    if (gerenciaId) {
      gerenciasFiltradas = this.gerencias.filter(g => g.id == gerenciaId);
    }

    // Prepare datasets for each gerencia
    const datasets = [];
    const gerenciaColors = [
      { line: '#9D2449', point: '#9D2449' },  // guinda
      { line: '#B38E5D', point: '#B38E5D' },  // oro
      { line: '#13322B', point: '#13322B' }   // verde
    ];

    gerenciasFiltradas.forEach((gerencia, index) => {
      // Count Audiencias Desahogadas per month
      const audienciasData = months.map(month => {
        return this.audiencias.filter(a => {
          if (a.gerenciaId !== gerencia.id || a.estado !== 'Desahogada') return false;
          const fechaKey = a.fecha.substring(0, 7); // YYYY-MM
          return fechaKey === month.key;
        }).length;
      });

      // Count Términos Concluidos per month
      const terminosData = months.map(month => {
        return this.terminos.filter(t => {
          if (t.gerenciaId !== gerencia.id || t.estado !== 'Concluido') return false;
          const fechaKey = t.fecha.substring(0, 7); // YYYY-MM
          return fechaKey === month.key;
        }).length;
      });

      const color = gerenciaColors[index] || gerenciaColors[0];

      // Add Audiencias dataset
      datasets.push({
        label: `${this.truncateLabel(gerencia.nombre, 25)} - Audiencias`,
        data: audienciasData,
        borderColor: color.line,
        backgroundColor: 'transparent',
        pointBackgroundColor: '#3B82F6', // Blue for Audiencias
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
        borderWidth: 2
      });

      // Add Términos dataset
      datasets.push({
        label: `${this.truncateLabel(gerencia.nombre, 25)} - Términos`,
        data: terminosData,
        borderColor: color.line,
        backgroundColor: 'transparent',
        pointBackgroundColor: '#10B981', // Green for Términos
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.3,
        borderWidth: 2,
        borderDash: [5, 5] // Dashed line for Términos
      });
    });

    this.charts.trabajoCompletado = new Chart(ctx, {
      type: 'line',
      data: {
        labels: months.map(m => m.label),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 11
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              title: (items) => {
                return items[0].label;
              },
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            title: {
              display: true,
              text: 'Cantidad'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Mes'
            }
          }
        }
      }
    });
  }

  // Chart 4: Distribución por Gerencia (Doughnut Chart)
  createChartGerencias() {
    const ctx = document.getElementById('chartGerencias');
    if (!ctx) {
      console.error('Canvas element chartGerencias not found');
      return;
    }

    // Count expedientes by gerencia
    const gerenciaData = this.gerencias.map(gerencia => {
      const count = this.expedientes.filter(e => e.gerenciaId == gerencia.id).length;
      return {
        nombre: gerencia.nombre,
        count: count
      };
    });
    // Sort by count descending
    const sorted = gerenciaData.sort((a, b) => b.count - a.count);

    console.log('Gerencia data for chart:', sorted);

    this.charts.gerencias = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: sorted.map(g => g.nombre),
        datasets: [{
          data: sorted.map(g => g.count),
          backgroundColor: [
            this.gobColors.guinda,
            this.gobColors.oro,
            this.gobColors.verde,
            this.gobColors.gris
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} expedientes (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // ==================== FILTERS ====================
  setupFilters() {
    // Unified filter for both Carga de Trabajo and Trabajo Completado
    const filterGerenciaUnificado = document.getElementById('filterGerenciaUnificado');
    if (filterGerenciaUnificado) {
      // Populate gerencias dropdown
      this.gerencias.forEach(gerencia => {
        const option = document.createElement('option');
        option.value = gerencia.id;
        option.textContent = gerencia.nombre;
        filterGerenciaUnificado.appendChild(option);
      });

      // Listen for changes and update both charts
      filterGerenciaUnificado.addEventListener('change', (e) => {
        const gerenciaId = e.target.value;
        // Update both charts simultaneously
        this.createChartUsuarios(gerenciaId || null);
        this.createChartTrabajoCompletado(gerenciaId || null);
      });
    }
  }

  // ==================== UTILITIES ====================
  truncateLabel(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}
