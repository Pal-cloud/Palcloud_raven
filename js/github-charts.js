/**
 * github-charts.js — Gráficas GitHub con datos reales de Pal-cloud
 * Usa Chart.js (cargado vía CDN en el HTML)
 */
'use strict';

(function initGithubCharts() {

  // ── Paleta coherente con el diseño ─────
  const GOLD   = 'rgba(201, 168, 76,';
  const CREAM  = 'rgba(240, 230, 200,';
  const MUTED  = 'rgba(139, 122, 101,';
  const BG     = 'rgba(19, 16, 9,';

  // Colores de lenguajes (extraídos de la imagen)
  const LANG_COLORS = {
    Python:          '#5b8dd9',  // azul
    JavaScript:      '#f0d060',  // amarillo
    HTML:            '#d9604e',  // rojo
    TypeScript:      '#7baad9',  // azul claro
    'Jupyter Notebook': '#e8894e' // naranja
  };

  // ── Defaults globales de Chart.js ─────
  function setChartDefaults() {
    Chart.defaults.color = '#8b7a65';
    Chart.defaults.font.family = "'Space Mono', monospace";
    Chart.defaults.font.size   = 11;
    Chart.defaults.borderColor = 'rgba(201,168,76,0.1)';
  }

  // ── Gráfica 1: Actividad anual (área) ─
  function buildActivityChart() {
    const canvas = document.getElementById('chart-activity');
    if (!canvas || !window.Chart) return;

    // Datos aproximados de la imagen (contribuciones mensuales)
    // Pico en Oct-Nov, bajada en Feb-Mar, remontada en Jun
    const labels  = ['Jun\'25','Jul','Ago','Sep','Oct','Nov','Dic','Ene\'26','Feb','Mar','Abr','May','Jun\'26'];
    const data    = [30, 45, 75, 95, 108, 100, 72, 50, 18, 8, 22, 55, 80];

    new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Contribuciones',
          data,
          fill: true,
          tension: 0.45,
          borderColor: `${GOLD} 0.9)`,
          borderWidth: 2,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, ctx.chart.height);
            g.addColorStop(0, `${GOLD} 0.35)`);
            g.addColorStop(1, `${GOLD} 0)`);
            return g;
          },
          pointBackgroundColor: `${GOLD} 1)`,
          pointBorderColor: 'transparent',
          pointRadius: 4,
          pointHoverRadius: 7,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(13,11,7,0.95)',
            borderColor: `${GOLD} 0.3)`,
            borderWidth: 1,
            titleColor: `${CREAM} 0.9)`,
            bodyColor: `${MUTED} 0.9)`,
            padding: 12,
            callbacks: {
              label: (ctx) => `  ${ctx.parsed.y} contribuciones`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(201,168,76,0.05)', drawBorder: false },
            ticks: { color: '#4a3f32', maxRotation: 0 }
          },
          y: {
            grid: { color: 'rgba(201,168,76,0.05)', drawBorder: false },
            ticks: { color: '#4a3f32' },
            beginAtZero: true,
            max: 120
          }
        }
      }
    });
  }

  // ── Gráfica 2: Lenguajes (donut) ──────
  function buildLangsChart() {
    const canvas = document.getElementById('chart-langs');
    const legend = document.getElementById('chart-langs-legend');
    if (!canvas || !window.Chart) return;

    // Porcentajes aproximados de la imagen
    const langs = [
      { name: 'Python',          pct: 42 },
      { name: 'JavaScript',      pct: 30 },
      { name: 'HTML',            pct: 10 },
      { name: 'TypeScript',      pct: 13 },
      { name: 'Jupyter Notebook', pct: 5 },
    ];

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: langs.map(l => l.name),
        datasets: [{
          data: langs.map(l => l.pct),
          backgroundColor: langs.map(l => LANG_COLORS[l.name] + 'cc'),
          borderColor:     langs.map(l => LANG_COLORS[l.name]),
          borderWidth: 2,
          hoverOffset: 12,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(13,11,7,0.95)',
            borderColor: `${GOLD} 0.3)`,
            borderWidth: 1,
            titleColor: `${CREAM} 0.9)`,
            bodyColor: `${MUTED} 0.9)`,
            padding: 12,
            callbacks: {
              label: (ctx) => `  ${ctx.parsed}%`
            }
          }
        }
      }
    });

    // Leyenda manual con estilos del portfolio
    if (legend) {
      legend.innerHTML = langs.map(l => `
        <li>
          <span class="gh-legend__dot" style="background:${LANG_COLORS[l.name]}"></span>
          <span class="gh-legend__name">${l.name}</span>
          <span class="gh-legend__pct">${l.pct}%</span>
        </li>
      `).join('');
    }
  }

  // ── Gráfica 3: Stats (barras horiz.) ──
  function buildStatsChart() {
    const canvas = document.getElementById('chart-stats');
    if (!canvas || !window.Chart) return;

    const labels = ['Total Stars', 'Commits 2026', 'Total PRs', 'Total Issues', 'Repos contrib.'];
    const data   = [9, 209, 39, 30, 51];
    const maxVal = Math.max(...data);

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '',
          data,
          backgroundColor: data.map(v => {
            const ratio = v / maxVal;
            return `rgba(201, 168, ${Math.round(76 + (200-76)*(1-ratio))}, ${0.3 + ratio * 0.6})`;
          }),
          borderColor: data.map(() => `${GOLD} 0.7)`),
          borderWidth: 1,
          borderRadius: 2,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(13,11,7,0.95)',
            borderColor: `${GOLD} 0.3)`,
            borderWidth: 1,
            titleColor: `${CREAM} 0.9)`,
            bodyColor: `${MUTED} 0.9)`,
            padding: 12,
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(201,168,76,0.06)', drawBorder: false },
            ticks: { color: '#4a3f32' },
            beginAtZero: true,
          },
          y: {
            grid: { display: false, drawBorder: false },
            ticks: {
              color: '#8b7a65',
              font: { size: 10, family: "'Space Mono', monospace" }
            }
          }
        }
      }
    });
  }

  // ── Arrancar cuando el DOM esté listo ─
  function init() {
    if (typeof Chart === 'undefined') {
      // Reintentar si Chart.js aún no cargó
      setTimeout(init, 300);
      return;
    }
    setChartDefaults();
    buildActivityChart();
    buildLangsChart();
    buildStatsChart();
  }

  // Observar cuando la sección entra en viewport (lazy render)
  const section = document.getElementById('github-stats');
  if (section) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          init();
          observer.disconnect();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(section);
  } else {
    // fallback si no hay sección
    document.addEventListener('DOMContentLoaded', init);
  }

})();
