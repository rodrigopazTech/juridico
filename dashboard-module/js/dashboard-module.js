/**
 * Dashboard Module
 * Displays analytics and charts for expedientes, usuarios, and gerencias
 */
export class DashboardModule {
  constructor() {
    this.charts = {};
    
    this.currentFilters = {
        gerenciaId: null,
        workloadMetric: 'expedientes'
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
      '#9D2449', '#B38E5D', '#13322B', '#3B82F6', '#10B981', 
      '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899'
    ];
  }

  init() {
    console.log('Initializing Dashboard Module...');
    
    if (typeof Chart === 'undefined') {
        console.error('Chart.js no está cargado.');
        return;
    }

    this.loadData();
    this.renderKPIs();
    this.initCharts();
    this.setupFilters();
  }

  loadData() {
      const storedGerencias = localStorage.getItem('catalogo_gerencias');
      this.gerencias = storedGerencias ? JSON.parse(storedGerencias) : [];

      const storedExp = localStorage.getItem('expedientesData');
      this.expedientes = storedExp ? JSON.parse(storedExp) : [];

      const storedAud = localStorage.getItem('audiencias');
      this.audiencias = storedAud ? JSON.parse(storedAud) : [];

      const storedTerm = localStorage.getItem('terminos');
      this.terminos = storedTerm ? JSON.parse(storedTerm) : [];

      const storedUsers = localStorage.getItem('usuarios');
      this.usuarios = storedUsers ? JSON.parse(storedUsers) : [];
  }

  renderKPIs() {
      const totalExp = this.expedientes.length;
      const activeExp = this.expedientes.filter(e => e.estado !== 'CONCLUIDO').length;
      const pendingAud = this.audiencias.filter(a => !a.atendida).length;
      const activeTerm = this.terminos.filter(t => t.estatus !== 'Concluido').length;

      this.updateKPI('kpi-total-expedientes', totalExp);
      this.updateKPI('kpi-expedientes-activos', activeExp);
      this.updateKPI('kpi-audiencias-programadas', pendingAud);
      this.updateKPI('kpi-terminos-activos', activeTerm);
  }

  updateKPI(elementId, value) {
      const el = document.getElementById(elementId);
      if (el) el.textContent = value;
  }

  initCharts() {
      Object.values(this.charts).forEach(chart => chart.destroy());

      this.createChartEstatusExpedientes();
      this.createChartUsuarios(this.currentFilters.gerenciaId, this.currentFilters.workloadMetric);
      this.createChartEstatusAudiencias();
      this.createChartTrabajoCompletado(this.currentFilters.gerenciaId);
      // NUEVA GRÁFICA
      this.createChartEstatusTerminos(); 
  }

  // 1. ESTATUS EXPEDIENTES (DONA MÁS GORDITA)
  createChartEstatusExpedientes() {
      const ctx = document.getElementById('chartEstatusExpedientes');
      if (!ctx) return;

      const counts = {};
      this.expedientes.forEach(e => {
          const st = e.estado || 'SIN CLASIFICAR';
          counts[st] = (counts[st] || 0) + 1;
      });
      
      if(Object.keys(counts).length === 0) counts['EN TRAMITE'] = 1; 

      const labels = Object.keys(counts);
      const data = Object.values(counts);

      this.charts.estatusExpedientes = new Chart(ctx, {
          type: 'doughnut',
          data: {
              labels: labels,
              datasets: [{
                  data: data,
                  backgroundColor: this.chartColors,
                  borderWidth: 0
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                  legend: { position: 'right', labels: { font: { family: 'Montserrat' } } }
              },
              cutout: '40%' // CAMBIO: 40% hace la dona más gruesa (gordita)
          }
      });
  }

  // 2. CARGA DE TRABAJO (DATOS FICTICIOS)
  createChartUsuarios(filterGerenciaId = null, metric = 'expedientes') {
      const ctx = document.getElementById('chartCargaTrabajo');
      if (!ctx) return;

      if (this.charts.cargaTrabajo) this.charts.cargaTrabajo.destroy();

      const nombresFicticios = ['Lic. Roberto González', 'Lic. María Fernández', 'Lic. Juan Pérez', 'Lic. Ana López', 'Lic. Carlos Ruiz'];
      const datosFicticios = [15, 22, 8, 19, 12]; 

      let datosFinales = datosFicticios;
      if (metric === 'audiencias') {
          datosFinales = [5, 8, 2, 6, 4];
      }

      this.charts.cargaTrabajo = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: nombresFicticios,
              datasets: [{
                  label: metric === 'expedientes' ? 'Expedientes Asignados' : 'Audiencias Pendientes',
                  data: datosFinales,
                  backgroundColor: this.gobColors.guinda,
                  borderRadius: 4
              }]
          },
          options: {
              indexAxis: 'y', 
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  x: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                  y: { grid: { display: false } }
              }
          }
      });
  }

  // 3. ESTATUS AUDIENCIAS
  createChartEstatusAudiencias() {
      const ctx = document.getElementById('chartEstatusAudiencias');
      if (!ctx) return;

      let counts = { 'Pendiente': 0, 'Concluida': 0 };

      if (this.audiencias.length > 0) {
          this.audiencias.forEach(a => {
              if (a.atendida) counts['Concluida']++;
              else counts['Pendiente']++;
          });
      } else {
          counts = { 'Pendiente': 8, 'Concluida': 12 };
      }

      this.charts.estatusAudiencias = new Chart(ctx, {
          type: 'bar', 
          data: {
              labels: ['Estado de Audiencias'],
              datasets: [
                  {
                      label: 'Pendientes',
                      data: [counts['Pendiente']],
                      backgroundColor: this.gobColors.oro,
                  },
                  {
                      label: 'Concluidas',
                      data: [counts['Concluida']],
                      backgroundColor: this.gobColors.verde,
                  }
              ]
          },
          options: {
              indexAxis: 'y', 
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  x: { stacked: true },
                  y: { stacked: true }
              }
          }
      });
  }

  // 4. NUEVA GRÁFICA: ESTATUS DE TÉRMINOS (DATOS REALES)
  createChartEstatusTerminos() {
      const ctx = document.getElementById('chartEstatusTerminos');
      if (!ctx) return;

      // 1. Contar datos REALES
      const counts = {};
      
      // Si hay términos, los contamos
      if (this.terminos.length > 0) {
          this.terminos.forEach(t => {
              const etapa = t.estatus || 'Sin estatus';
              counts[etapa] = (counts[etapa] || 0) + 1;
          });
      } else {
          // Si no hay términos creados, mostramos mensaje vacío
          // Pero para que la gráfica no se rompa, iniciamos en 0
          counts['Sin términos'] = 0;
      }

      const labels = Object.keys(counts);
      const data = Object.values(counts);

      this.charts.estatusTerminos = new Chart(ctx, {
          type: 'bar',
          data: {
              labels: labels,
              datasets: [{
                  label: 'Cantidad de Términos',
                  data: data,
                  backgroundColor: this.gobColors.verde, // Color verde institucional
                  borderRadius: 4
              }]
          },
          options: {
              indexAxis: 'y', // Barras horizontales
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                  x: { 
                      beginAtZero: true, 
                      ticks: { stepSize: 1 }, // Solo mostrar enteros
                      grid: { color: '#f3f4f6' }
                  },
                  y: { grid: { display: false } }
              },
              plugins: {
                  legend: { display: false } // Ocultar leyenda si solo es una serie
              }
          }
      });
  }

  // 5. TRABAJO COMPLETADO
  createChartTrabajoCompletado(filterGerenciaId = null) {
      const ctx = document.getElementById('chartTrabajoCompletado');
      if (!ctx) return;
      if (this.charts.trabajoCompletado) this.charts.trabajoCompletado.destroy();

      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const dataAudiencias = [4, 6, 8, 5, 9, 12, 10, 15, 12, 18, 14, 20];
      const dataTerminos =   [2, 4, 3, 8, 6,  9,  8, 10,  9, 12, 11, 15];

      this.charts.trabajoCompletado = new Chart(ctx, {
          type: 'line',
          data: {
              labels: meses,
              datasets: [
                  {
                      label: 'Audiencias Desahogadas',
                      data: dataAudiencias,
                      borderColor: this.gobColors.guinda,
                      backgroundColor: this.gobColors.guinda,
                      tension: 0.4,
                      fill: false
                  },
                  {
                      label: 'Términos Concluidos',
                      data: dataTerminos,
                      borderColor: this.gobColors.oro,
                      backgroundColor: this.gobColors.oro,
                      tension: 0.4,
                      fill: false
                  }
              ]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                  mode: 'index',
                  intersect: false,
              },
              scales: {
                  y: { beginAtZero: true }
              }
          }
      });
  }

  setupFilters() {
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
        this.createChartUsuarios(this.currentFilters.gerenciaId, this.currentFilters.workloadMetric);
        this.createChartTrabajoCompletado(this.currentFilters.gerenciaId);
      });
    }

    const filterMetric = document.getElementById('filterCargaTrabajoMetric');
    if (filterMetric) {
        filterMetric.addEventListener('change', (e) => {
            this.currentFilters.workloadMetric = e.target.value;
            this.createChartUsuarios(this.currentFilters.gerenciaId, this.currentFilters.workloadMetric);
        });
    }
  }

  truncateLabel(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}