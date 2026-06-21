/**
 * theme.js — Toggle entre tema oscuro y claro
 */
'use strict';

(function initTheme() {
  const STORAGE_KEY  = 'palcloud-theme';
  const toggleBtn    = document.getElementById('theme-toggle');
  const themeIcon    = document.getElementById('theme-icon');
  const html         = document.documentElement;

  if (!toggleBtn) return;

  // ── Obtener tema guardado o preferencia del sistema ──
  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // ── Aplicar tema ───────────────────────
  function applyTheme(theme) {
    html.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);

    if (themeIcon) {
      themeIcon.className = theme === 'dark'
        ? 'fa-solid fa-moon'
        : 'fa-solid fa-sun';
    }

    toggleBtn.setAttribute('aria-label',
      theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'
    );
  }

  // ── Toggle ─────────────────────────────
  toggleBtn.addEventListener('click', () => {
    const current = html.dataset.theme || 'dark';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ── Escuchar cambios del sistema ───────
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      // Solo actualizar si el usuario no tiene preferencia guardada
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });

  // ── Iniciar ────────────────────────────
  applyTheme(getPreferredTheme());
})();
