/**
 * theme.js — Toggle oscuro/claro con icono sincronizado
 */
'use strict';

(function initTheme() {
  const STORAGE_KEY = 'palcloud-theme';
  const toggleBtn   = document.getElementById('theme-toggle');
  const themeIcon   = document.getElementById('theme-icon');
  const html        = document.documentElement;

  if (!toggleBtn) return;

  // ── Aplica el tema y sincroniza el icono ──
  function applyTheme(theme) {
    html.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
    syncIcon(theme);
    toggleBtn.setAttribute('aria-label',
      theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'
    );
  }

  function syncIcon(theme) {
    if (!themeIcon) return;
    // Animación suave de cambio
    themeIcon.style.transform = 'scale(0) rotate(180deg)';
    themeIcon.style.transition = 'transform 0.2s ease';
    setTimeout(() => {
      themeIcon.className = theme === 'dark'
        ? 'fa-solid fa-moon'
        : 'fa-solid fa-sun';
      themeIcon.style.transform = 'scale(1) rotate(0deg)';
    }, 200);
  }

  // ── Toggle al hacer click ──
  toggleBtn.addEventListener('click', () => {
    const current = html.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(current);
  });

  // ── Seguir cambios del sistema si no hay preferencia guardada ──
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ── Sincronizar icono con el tema ya aplicado en el <head> ──
  // (el inline script ya aplicó el data-theme correcto)
  const currentTheme = html.dataset.theme || 'dark';
  if (themeIcon) {
    themeIcon.className = currentTheme === 'dark'
      ? 'fa-solid fa-moon'
      : 'fa-solid fa-sun';
  }
  toggleBtn.setAttribute('aria-label',
    currentTheme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'
  );
})();
