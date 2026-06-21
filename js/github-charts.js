/**
 * github-charts.js — Gráficas GitHub con datos REALES de Pal-cloud
 * API pública de GitHub (sin auth, rate-limit 60req/h).
 * Fallback a datos estáticos si la API no responde.
 */
'use strict';

(function initGithubCharts() {

  const GH_USER = 'Pal-cloud';      // ← nombre exacto del perfil
  const API     = 'https://api.github.com';

  // ── Paleta coherente con el diseño ─────
  const GOLD   = 'rgba(201, 168, 76,';
  const CREAM  = 'rgba(240, 230, 200,';
  const MUTED  = 'rgba(139, 122, 101,';

  // Colores de lenguajes
  const LANG_COLORS = {
    Python:              '#5b8dd9',
    JavaScript:          '#f0d060',
    HTML:                '#d9604e',
    TypeScript:          '#7baad9',
    'Jupyter Notebook':  '#e8894e',
    CSS:                 '#9b72e8',
    Shell:               '#6dab7a',
    'C++':               '#c96d6d',
    Go:                  '#79c0c6',
    Rust:                '#e8824e',
    Other:               '#6b6a67',
  };

  // Datos de respaldo
  const FALLBACK = {
    langPcts: [
      { name: 'Python',          pct: 42 },
      { name: 'JavaScript',      pct: 30 },
      { name: 'HTML',            pct: 10 },
      { name: 'TypeScript',      pct: 13 },
      { name: 'Jupyter Notebook', pct: 5 },
    ],
    activity: [30, 45, 75, 95, 108, 100, 72, 50, 18, 8, 22, 55],
    stats: { stars: 9, commits: 209, prs: 39, issues: 30, repos_contrib: 51, repos: 31 },
  };

  // ── Defaults globales de Chart.js ─────
  function setChartDefaults() {
    Chart.defaults.color = '#8b7a65';
    Chart.defaults.font.family = "'Space Mono', monospace";
    Chart.defaults.font.size   = 11;
    Chart.defaults.borderColor = 'rgba(201,168,76,0.1)';
  }

  // ── Etiquetas últimos 12 meses ─────────
  function getLast12Months() {
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const now = new Date();
    const labels = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(months[d.getMonth()] + ' \'' + String(d.getFullYear()).slice(-2));
    }
    return labels;
  }

  // ─────────────────────────────────────────
  // FETCH DE DATOS REALES
  // GitHub REST API pública — no requiere token
  // ─────────────────────────────────────────

  async function fetchUserData() {
    const res = await fetch(`${API}/users/${GH_USER}`);
    if (!res.ok) throw new Error('user');
    return res.json();
  }

  async function fetchRepos() {
    // Hasta 100 repos públicos
    const res = await fetch(`${API}/users/${GH_USER}/repos?per_page=100&type=owner`);
    if (!res.ok) throw new Error('repos');
    return res.json();
  }

  /**
   * Suma bytes de lenguajes en todos los repos.
   * Usa Promise.allSettled para no fallar si algún repo es privado.
   */
  async function fetchLanguages(repos) {
    const results = await Promise.allSettled(
      repos.slice(0, 30).map(repo =>   // limitamos a 30 para no sobrepasar rate-limit
        fetch(`${API}/repos/${GH_USER}/${repo.name}/languages`).then(r => r.json())
      )
    );

    const totals = {};
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value && !r.value.message) {
        Object.entries(r.value).forEach(([lang, bytes]) => {
          totals[lang] = (totals[lang] || 0) + bytes;
        });
      }
    });

    const total = Object.values(totals).reduce((a, b) => a + b, 0) || 1;

    // Top 6 lenguajes + otros
    const sorted = Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const topTotal = sorted.reduce((a, [,b]) => a + b, 0);
    const otherPct = Math.round(((total - topTotal) / total) * 100);

    const langs = sorted.map(([name, bytes]) => ({
      name,
      pct: Math.round((bytes / total) * 100),
    }));

    if (otherPct > 1) langs.push({ name: 'Other', pct: otherPct });
    return langs;
  }

  /**
   * Estima actividad mensual contando repos creados/actualizados por mes.
   * (La API pública no expone el calendario de contribuciones sin auth.)
   */
  function buildActivityFromRepos(repos) {
    const now = new Date();
    const counts = Array(12).fill(0);

    repos.forEach(repo => {
      const updated = new Date(repo.pushed_at || repo.updated_at);
      const diffMonths = (now.getFullYear() - updated.getFullYear()) * 12
                       + (now.getMonth() - updated.getMonth());
      if (diffMonths >= 0 && diffMonths < 12) {
        counts[11 - diffMonths]++;
      }
    });

    // Escalar a rango 5-100 para que se vea bien
    const max = Math.max(...counts, 1);
    return counts.map(c => Math.max(Math.round((c / max) * 100), c > 0 ? 5 : 0));
  }

  // ── Gráfica 1: Actividad anual (área) ─────
  function buildActivityChart(data) {
    const canvas = document.getElementById('chart-activity');
    if (!canvas) return;

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: getLast12Months(),
        datasets: [{
          label: 'Actividad',
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
            callbacks: { label: (ctx) => `  ${ctx.parsed.y} pushes` }
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
          }
        }
      }
    });
  }

  // ── Gráfica 2: Lenguajes (donut) ───────────
  function buildLangsChart(langs) {
    const canvas = document.getElementById('chart-langs');
    const legend = document.getElementById('chart-langs-legend');
    if (!canvas) return;

    const colors = langs.map(l => LANG_COLORS[l.name] || LANG_COLORS.Other);

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: langs.map(l => l.name),
        datasets: [{
          data: langs.map(l => l.pct),
          backgroundColor: colors.map(c => c + 'cc'),
          borderColor:     colors,
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
            callbacks: { label: (ctx) => `  ${ctx.parsed}%` }
          }
        }
      }
    });

    if (legend) {
      legend.innerHTML = langs.map((l, i) => `
        <li>
          <span class="gh-legend__dot" style="background:${colors[i]}"></span>
          <span class="gh-legend__name">${l.name}</span>
          <span class="gh-legend__pct">${l.pct}%</span>
        </li>
      `).join('');
    }
  }

  // ── Gráfica 3: Stats (barras horiz.) ───────
  function buildStatsChart(stats) {
    const canvas = document.getElementById('chart-stats');
    if (!canvas) return;

    const labels = ['Estrellas', 'Commits 2026', 'Pull Requests', 'Issues', 'Repos contrib.'];
    const data   = [
      stats.stars,
      stats.commits,
      stats.prs,
      stats.issues,
      stats.repos_contrib,
    ];
    const maxVal = Math.max(...data, 1);

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
            ticks: { color: '#8b7a65', font: { size: 10, family: "'Space Mono', monospace" } }
          }
        }
      }
    });
  }

  // ── Actualizar contadores del DOM ───────────
  function updateMetrics(userData, repos, stats) {
    const metricMap = {
      // data-target → valor real
      repos_pub:    userData?.public_repos ?? stats.repos,
    };

    // Actualizar nodos con data-gh
    document.querySelectorAll('[data-gh]').forEach(el => {
      const key = el.dataset.gh;
      if (metricMap[key] !== undefined) {
        el.dataset.target = metricMap[key];
        el.textContent = '0';
      }
    });

    // Recount: sumar estrellas de todos los repos
    const totalStars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);
    document.querySelectorAll('.gh-metric__n').forEach(el => {
      const label = el.nextElementSibling?.textContent?.toLowerCase() ?? '';
      if (label.includes('repos') && label.includes('público')) {
        el.dataset.target = userData?.public_repos ?? stats.repos;
      }
      if (label.includes('estrella')) {
        el.dataset.target = totalStars || stats.stars;
      }
    });
  }

  // ── Añadir badge "en vivo" si la API respondió ──
  function markAsLive() {
    const tag = document.querySelector('#github-stats .section-tag');
    if (tag && !tag.querySelector('.gh-live')) {
      const badge = document.createElement('span');
      badge.className = 'gh-live';
      badge.innerHTML = '<span class="dot dot--green" style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#6dab7a;margin-right:5px;vertical-align:middle;"></span>en vivo';
      badge.style.cssText = 'font-size:0.6rem;letter-spacing:0.15em;opacity:0.7;margin-left:var(--space-4);';
      tag.appendChild(badge);
    }
  }

  // ── Orquestador principal ───────────────────
  async function init() {
    if (typeof Chart === 'undefined') {
      setTimeout(init, 300);
      return;
    }
    setChartDefaults();

    let activityData = FALLBACK.activity;
    let langsData    = FALLBACK.langPcts;
    let statsData    = { ...FALLBACK.stats };
    let isLive       = false;
    let reposData    = [];

    try {
      const [userData, repos] = await Promise.all([fetchUserData(), fetchRepos()]);
      statsData.repos = userData.public_repos;

      const langs  = await fetchLanguages(repos);
      activityData = buildActivityFromRepos(repos);

      if (langs.length > 0) langsData = langs;
      statsData.stars = repos.reduce((acc, r) => acc + (r.stargazers_count || 0), 0);

      updateMetrics(userData, repos, statsData);
      reposData = repos;
      isLive    = true;
    } catch (err) {
      console.warn('[PalCloud] GitHub API fallback →', err.message ?? err);
    }

    buildActivityChart(activityData);
    buildLangsChart(langsData);
    buildStatsChart(statsData);
    buildReposGrid(reposData);

    if (isLive) markAsLive();
  }

  // ── Cuadrícula de repos reales ──────────────
  function buildReposGrid(repos) {
    const grid = document.getElementById('gh-repos-grid');
    if (!grid) return;

    // Ordenar: primero los más recientes con más estrellas
    const sorted = [...repos]
      .filter(r => !r.fork)
      .sort((a, b) => {
        const stars = (b.stargazers_count - a.stargazers_count);
        if (stars !== 0) return stars;
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      })
      .slice(0, 6);

    if (sorted.length === 0) {
      grid.innerHTML = '<p style="color:var(--text-muted);font-family:var(--font-mono);font-size:var(--text-xs);text-align:center;padding:var(--space-8)">No se pudieron cargar los repositorios.</p>';
      return;
    }

    grid.innerHTML = sorted.map(repo => {
      const lang  = repo.language || 'Otros';
      const color = LANG_COLORS[lang] || LANG_COLORS.Other || '#6b6a67';
      const desc  = repo.description ? repo.description.slice(0, 90) + (repo.description.length > 90 ? '…' : '') : 'Sin descripción';
      const date  = new Date(repo.pushed_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });

      return `
        <a href="${repo.html_url}" target="_blank" rel="noopener" class="gh-repo-card" tabindex="0">
          <div class="gh-repo-card__head">
            <i class="fa-solid fa-code-branch gh-repo-card__icon"></i>
            <span class="gh-repo-card__name">${repo.name}</span>
          </div>
          <p class="gh-repo-card__desc">${desc}</p>
          <div class="gh-repo-card__foot">
            <span class="gh-repo-card__lang">
              <span class="gh-repo-card__dot" style="background:${color}"></span>${lang}
            </span>
            <span class="gh-repo-card__star"><i class="fa-regular fa-star"></i> ${repo.stargazers_count}</span>
            <span class="gh-repo-card__date">${date}</span>
          </div>
        </a>
      `;
    }).join('');
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
    document.addEventListener('DOMContentLoaded', init);
  }

})();
