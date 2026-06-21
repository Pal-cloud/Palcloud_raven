/**
 * animations.js — Intersection Observer para reveals
 */
'use strict';

(function initAnimations() {
  const { prefersReducedMotion } = window.PalcloudUtils;

  // Si prefiere menos movimiento, mostrar todo inmediatamente
  if (prefersReducedMotion()) {
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-fade')
      .forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Animar solo una vez
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  const observe = () => {
    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-fade')
      .forEach((el) => observer.observe(el));
  };

  // Observar en carga inicial y tras el loader
  document.addEventListener('portfolio:ready', observe);
  observe();
})();
