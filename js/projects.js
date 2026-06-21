/**
 * projects.js — Filtrado de proyectos con animación
 */
'use strict';

(function initProjects() {
  const { $$ } = window.PalcloudUtils;

  const filterBtns = $$('.filter-btn[data-filter]');
  const projectCards = $$('.project-card[data-category]');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Actualizar botones activos
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Filtrar tarjetas con animación
      projectCards.forEach((card, i) => {
        const matches = filter === 'all' || card.dataset.category === filter;

        if (matches) {
          card.classList.remove('hidden');
          // Stagger entrance
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            setTimeout(() => {
              card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, i * 60);
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => card.classList.add('hidden'), 300);
        }
      });
    });
  });
})();
