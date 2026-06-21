/**
 * counter.js — Animación de contadores numéricos del hero
 */
'use strict';

(function initCounter() {
  const { prefersReducedMotion } = window.PalcloudUtils;

  const counterEls = document.querySelectorAll('.stat-card__number[data-target]');
  if (!counterEls.length) return;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    // Sin animación si el usuario lo prefiere
    if (prefersReducedMotion()) {
      el.textContent = target + (el.closest('.stat-card')?.textContent.includes('%') ? '' : '+');
      return;
    }

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
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
    { threshold: 0.5 }
  );

  counterEls.forEach((el) => observer.observe(el));
})();
