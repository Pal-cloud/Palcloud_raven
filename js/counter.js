/**
 * counter.js — Animación de contadores numéricos
 * Selectors: .hero__stat-n y .gh-metric__n (ambos con data_target)
 */
'use strict';

(function initCounter() {
  const { prefersReducedMotion } = window.PalcloudUtils;

  // Recoge TODOS los contadores del hero y de la sección GitHub
  const counterEls = document.querySelectorAll(
    '.hero__stat-n[data-target], .gh-metric__n[data-target]'
  );
  if (!counterEls.length) return;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start    = performance.now();

    if (prefersReducedMotion()) {
      el.textContent = target + (el.dataset.suffix || '');
      return;
    }

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quart — más espectacular en números grandes
      const ease    = 1 - Math.pow(1 - progress, 4);
      const val     = Math.round(ease * target);
      el.textContent = val + (progress < 1 ? '' : (el.dataset.suffix || ''));
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target + (el.dataset.suffix || '');
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  counterEls.forEach((el) => observer.observe(el));
})();
