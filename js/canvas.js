/**
 * canvas.js — Partículas flotantes en el hero
 */
'use strict';

(function initCanvas() {
  const { prefersReducedMotion } = window.PalcloudUtils;

  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Si el usuario prefiere movimiento reducido, salir
  if (prefersReducedMotion()) {
    canvas.style.display = 'none';
    return;
  }

  // ── Configuración ──────────────────────
  const CONFIG = {
    particleCount:  60,
    minRadius:      1,
    maxRadius:      2.5,
    minSpeed:       0.15,
    maxSpeed:       0.45,
    connectionDist: 130,
    colorAccent:    [155, 93, 229],   // purple
    colorSecondary: [255, 121, 198],  // pink
    opacity:        0.55
  };

  let particles = [];
  let width = 0;
  let height = 0;
  let rafId;
  let mouse = { x: null, y: null };

  // ── Resize ─────────────────────────────
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width  = rect.width  * devicePixelRatio;
    height = rect.height * devicePixelRatio;
    canvas.width  = width;
    canvas.height = height;
    canvas.style.width  = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    initParticles();
  }

  // ── Partícula ──────────────────────────
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      const logicalW = width  / devicePixelRatio;
      const logicalH = height / devicePixelRatio;

      this.x  = Math.random() * logicalW;
      this.y  = Math.random() * logicalH;
      this.r  = CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius);
      this.vx = (Math.random() - 0.5) * CONFIG.maxSpeed * 2;
      this.vy = -CONFIG.minSpeed - Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed);

      // Alterna entre color acento y secundario
      this.color = Math.random() > 0.5
        ? CONFIG.colorAccent
        : CONFIG.colorSecondary;
      this.alpha = 0.3 + Math.random() * 0.6;
    }

    update() {
      const logicalW = width  / devicePixelRatio;
      const logicalH = height / devicePixelRatio;

      // Atracción suave al mouse
      if (mouse.x !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (200 - dist) / 200 * 0.004;
          this.vx += dx * force;
          this.vy += dy * force;
        }
      }

      // Fricción
      this.vx *= 0.995;
      this.vy *= 0.995;

      this.x += this.vx;
      this.y += this.vy;

      // Envolver bordes
      if (this.x < -10) this.x = logicalW + 10;
      if (this.x > logicalW + 10) this.x = -10;
      if (this.y < -10) this.y = logicalH + 10;
      if (this.y > logicalH + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.alpha})`;
      ctx.fill();
    }
  }

  // ── Init partículas ────────────────────
  function initParticles() {
    particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
  }

  // ── Conexiones entre partículas ────────
  function drawConnections() {
    const count = particles.length;
    for (let i = 0; i < count - 1; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectionDist) {
          const alpha = (1 - dist / CONFIG.connectionDist) * CONFIG.opacity * 0.4;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${CONFIG.colorAccent[0]}, ${CONFIG.colorAccent[1]}, ${CONFIG.colorAccent[2]}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }

  // ── Loop de animación ──────────────────
  function animate() {
    const logicalW = width  / devicePixelRatio;
    const logicalH = height / devicePixelRatio;

    ctx.clearRect(0, 0, logicalW, logicalH);
    particles.forEach((p) => { p.update(); p.draw(); });
    drawConnections();

    rafId = requestAnimationFrame(animate);
  }

  // ── Mouse tracking ─────────────────────
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.parentElement.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // ── Iniciar ────────────────────────────
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(rafId);
    resize();
    animate();
  });

  ro.observe(canvas.parentElement);

  resize();
  animate();

  // Cleanup
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
  });
})();
