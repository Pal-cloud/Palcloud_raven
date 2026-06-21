/**
 * cursor.js — Cursor personalizado con seguimiento suavizado
 */
'use strict';

(function initCursor() {
  const { supportsHover, lerp } = window.PalcloudUtils;

  // Solo activar en dispositivos con hover real
  if (!supportsHover()) return;

  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');

  if (!cursor || !follower) return;

  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;
  let rafId;

  // ── Seguimiento del mouse ───────────────
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursor.style.left = `${mouseX}px`;
    cursor.style.top  = `${mouseY}px`;
  });

  // ── Animación suavizada del follower ───
  const animate = () => {
    followerX = lerp(followerX, mouseX, 0.14);
    followerY = lerp(followerY, mouseY, 0.14);

    follower.style.left = `${followerX}px`;
    follower.style.top  = `${followerY}px`;

    rafId = requestAnimationFrame(animate);
  };

  animate();

  // ── Hover sobre elementos interactivos ─
  const interactives = 'a, button, [role="button"], input, textarea, select, label, .project-card, .skill-card';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    }
  });

  // ── Click feedback ─────────────────────
  document.addEventListener('mousedown', () => cursor.classList.add('click'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('click'));

  // ── Salida / entrada del viewport ──────
  document.addEventListener('mouseleave', () => {
    cursor.classList.add('hidden');
    follower.classList.add('hidden');
  });

  document.addEventListener('mouseenter', () => {
    cursor.classList.remove('hidden');
    follower.classList.remove('hidden');
  });

  // Cleanup al desmontar (SPA-friendly)
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
  });
})();
