/**
 * skills.js — Tabs de skills + animación de barras de progreso
 */
'use strict';

(function initSkills() {
  const { $$ } = window.PalcloudUtils;

  const tabs   = $$('.tab[data-tab]');
  const panels = $$('.skills__panel[data-panel]');

  if (!tabs.length || !panels.length) return;

  // ── Cambio de tab ──────────────────────
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetPanel = tab.dataset.tab;

      // Actualizar tabs
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Mostrar panel correspondiente
      panels.forEach((panel) => {
        const isActive = panel.dataset.panel === targetPanel;
        panel.classList.toggle('active', isActive);

        if (isActive) {
          // Re-observar las nuevas skill rows del panel activo
          panel.querySelectorAll('.reveal-up').forEach((el) => {
            el.classList.remove('visible');
          });
          // Forzar reflow para que la transición se re-dispare
          requestAnimationFrame(() => {
            panel.querySelectorAll('.reveal-up').forEach((el) => {
              el.classList.add('visible');
            });
            animateBars(panel);
          });
        }
      });
    });
  });

  // ── Animación de barras de progreso ───
  function animateBars(container) {
    container.querySelectorAll('.skill-row__fill[data-pct], .skill-card__fill[data-pct]').forEach((bar) => {
      const pct = bar.dataset.pct || 0;
      bar.style.width = '0%';
      // Pequeño delay para que se vea la animación
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = `${pct}%`;
        });
      });
    });
  }

  // ── Observar cuando skills entra en viewport ──
  const skillsSection = document.getElementById('skills');

  if (skillsSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animar el panel activo
            const activePanel = skillsSection.querySelector('.skills__panel.active');
            if (activePanel) animateBars(activePanel);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(skillsSection);
  }
})();
