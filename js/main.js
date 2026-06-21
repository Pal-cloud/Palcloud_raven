/**
 * main.js — Inicialización global y utilidades de página
 */
'use strict';

(function initMain() {
  // ── Año en el footer ───────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Back to top ────────────────────────
  const backBtn = document.getElementById('back-to-top');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Lazy loading imágenes (fallback para navegadores sin soporte nativo) ──
  if ('loading' in HTMLImageElement.prototype === false) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          io.unobserve(img);
        }
      });
    });
    images.forEach((img) => io.observe(img));
  }

  // ── Prevenir FOUC en el tema ───────────
  // (ya manejado por theme.js, aquí como safety)
  if (!document.documentElement.dataset.theme) {
    document.documentElement.dataset.theme = 'dark';
  }

  // ── Keyboard navigation: cerrar menú con Escape ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (typeof window._navCloseMenu === 'function') {
        window._navCloseMenu();
      }
    }
  });

  // ── Texto de copyright legible ─────────
  console.log(
    '%c🪶 Palcloud Raven Portfolio',
    'color: #9b5de5; font-size: 16px; font-weight: bold; font-family: monospace;'
  );
  console.log(
    '%cDiseñado y construido con código limpio. ¿Curioso/a? github.com/palcloudraven',
    'color: #8888aa; font-size: 12px; font-family: monospace;'
  );
})();
