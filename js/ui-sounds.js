/**
 * ui-sounds.js — Micro-sonidos de interfaz + sistema de Toasts
 *
 * SONIDOS:
 *   · hover  → suave tick agudo casi imperceptible
 *   · click  → tap mini percusivo
 *   · open   → acorde ascendente breve (abrir menú)
 *   · close  → acorde descendente (cerrar menú)
 *   · success → campana cristalina
 *   · error   → disonancia suave
 *   · notify  → ping etéreo
 *
 * TOASTS:
 *   window.PalToast.show(msg, { type, duration, icon })
 *   type: 'info' | 'success' | 'warning' | 'error'
 */
'use strict';

// ═══════════════════════════════════════════
//  AUDIO ENGINE
// ═══════════════════════════════════════════
const PalSound = (() => {
  let ctx = null;
  let enabled = true;          // sincronizado con el botón de sonido
  const MASTER_VOL = 0.22;     // volumen global de UI (sutil)

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Reverb cortísimo para crisp pero con aire
  let _reverb = null;
  function getReverb() {
    if (_reverb) return _reverb;
    const ac  = getCtx();
    const len = ac.sampleRate * 0.6;
    const buf = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++)
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4.5);
    }
    _reverb = ac.createConvolver();
    _reverb.buffer = buf;
    return _reverb;
  }

  // Envuelve una nota con ganancia y reverb opcional
  function play(osc, vol, dur, wet = 0.25) {
    const ac = getCtx();
    const now = ac.currentTime;

    const masterG = ac.createGain();
    masterG.gain.value = MASTER_VOL;
    masterG.connect(ac.destination);

    const dry  = ac.createGain();
    dry.gain.value = 1 - wet;
    dry.connect(masterG);

    const reverbG = ac.createGain();
    reverbG.gain.value = wet;
    getReverb().connect(reverbG);
    reverbG.connect(masterG);

    const env = ac.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(vol, now + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(env);
    env.connect(dry);
    env.connect(getReverb());

    osc.start(now);
    osc.stop(now + dur + 0.05);
  }

  // ─── Sonidos concretos ──────────────────

  function hover() {
    if (!enabled) return;
    try {
      const ac = getCtx();
      const o  = ac.createOscillator();
      o.type = 'sine';
      o.frequency.value = 1380;
      play(o, 0.055, 0.065, 0.15);
    } catch(_) {}
  }

  function click() {
    if (!enabled) return;
    try {
      const ac = getCtx();
      // Mezcla ruido + tono para un click orgánico
      const o  = ac.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(900, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(300, ac.currentTime + 0.08);
      play(o, 0.14, 0.11, 0.2);
    } catch(_) {}
  }

  function menuOpen() {
    if (!enabled) return;
    try {
      const ac  = getCtx();
      const now = ac.currentTime;
      [[880, 0], [1108, 0.05], [1320, 0.10]].forEach(([f, t]) => {
        const o = ac.createOscillator();
        o.type  = 'sine';
        o.frequency.value = f;
        const env = ac.createGain();
        const mg  = ac.createGain();
        mg.gain.value = MASTER_VOL;
        env.gain.setValueAtTime(0.0001, now + t);
        env.gain.linearRampToValueAtTime(0.12, now + t + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.22);
        o.connect(env); env.connect(mg); mg.connect(ac.destination);
        o.start(now + t); o.stop(now + t + 0.28);
      });
    } catch(_) {}
  }

  function menuClose() {
    if (!enabled) return;
    try {
      const ac  = getCtx();
      const now = ac.currentTime;
      [[1320, 0], [1108, 0.05], [880, 0.10]].forEach(([f, t]) => {
        const o = ac.createOscillator();
        o.type  = 'sine';
        o.frequency.value = f;
        const env = ac.createGain();
        const mg  = ac.createGain();
        mg.gain.value = MASTER_VOL;
        env.gain.setValueAtTime(0.0001, now + t);
        env.gain.linearRampToValueAtTime(0.09, now + t + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.18);
        o.connect(env); env.connect(mg); mg.connect(ac.destination);
        o.start(now + t); o.stop(now + t + 0.25);
      });
    } catch(_) {}
  }

  function success() {
    if (!enabled) return;
    try {
      const ac  = getCtx();
      const now = ac.currentTime;
      [[1047, 0], [1319, 0.07], [1568, 0.14]].forEach(([f, t]) => {
        const o = ac.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        const env = ac.createGain();
        const mg  = ac.createGain();
        mg.gain.value = MASTER_VOL;
        env.gain.setValueAtTime(0.0001, now + t);
        env.gain.linearRampToValueAtTime(0.13, now + t + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.35);
        o.connect(env); env.connect(mg); mg.connect(ac.destination);
        o.start(now + t); o.stop(now + t + 0.4);
      });
    } catch(_) {}
  }

  function error() {
    if (!enabled) return;
    try {
      const ac  = getCtx();
      const now = ac.currentTime;
      [[330, 0], [311, 0.09]].forEach(([f, t]) => {
        const o = ac.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 600;
        const env = ac.createGain();
        const mg  = ac.createGain();
        mg.gain.value = MASTER_VOL * 0.6;
        env.gain.setValueAtTime(0.0001, now + t);
        env.gain.linearRampToValueAtTime(0.18, now + t + 0.015);
        env.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.22);
        o.connect(lp); lp.connect(env); env.connect(mg); mg.connect(ac.destination);
        o.start(now + t); o.stop(now + t + 0.28);
      });
    } catch(_) {}
  }

  function notify() {
    if (!enabled) return;
    try {
      const ac  = getCtx();
      const now = ac.currentTime;
      const o   = ac.createOscillator();
      o.type    = 'sine';
      o.frequency.setValueAtTime(880, now);
      o.frequency.linearRampToValueAtTime(1320, now + 0.12);
      o.frequency.setValueAtTime(1100, now + 0.13);
      play(o, 0.13, 0.28, 0.35);
    } catch(_) {}
  }

  function setEnabled(val) { enabled = val; }

  return { hover, click, menuOpen, menuClose, success, error, notify, setEnabled };
})();

// Exponer globalmente
window.PalSound = PalSound;


// ═══════════════════════════════════════════
//  HOVER / CLICK LISTENERS GLOBALES
// ═══════════════════════════════════════════
(function attachInteractionSounds() {
  // Throttle para hover (no disparar en cada pixel del mouse)
  let hoverTimer = null;

  // Elementos interactivos que reciben hover-sound
  const HOVER_SELECTORS = [
    '.mobile-menu__link',
    '.navbar__link',
    '.btn',
    '.btn-icon',
    '.tab',
    '.filter-btn',
    '.project-card',
    '.contact-item',
    '.back-to-top',
    '.footer__social a',
    '.mobile-menu__footer a',
  ].join(', ');

  // Delegación en document para capturar elementos dinámicos
  document.addEventListener('mouseover', (e) => {
    const el = e.target.closest(HOVER_SELECTORS);
    if (!el) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => PalSound.hover(), 40);
  }, { passive: true });

  // Click sound en botones y links (excluye el botón de sonido para no doble-disparar)
  document.addEventListener('click', (e) => {
    const el = e.target.closest('.btn, .btn-icon, .tab, .filter-btn, .hamburger, .back-to-top');
    if (!el || el.id === 'sound-toggle') return;
    PalSound.click();
  }, { passive: true });

  // Sonido al abrir/cerrar menú hamburguesa
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      // isOpen ya se actualizó en navbar.js ANTES de este listener (usa capture=false)
      // Pero lo sincronizamos en el siguiente tick
      setTimeout(() => {
        if (hamburger.getAttribute('aria-expanded') === 'true') {
          PalSound.menuOpen();
        } else {
          PalSound.menuClose();
        }
      }, 0);
    }, { passive: true });
  }

  // Sincronizar con el botón de sonido principal
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      // Enabled si el icono pasa a dove (sonido activado)
      const icon = document.getElementById('sound-icon');
      setTimeout(() => {
        PalSound.setEnabled(icon?.classList.contains('fa-dove') ?? true);
      }, 50);
    }, { passive: true });
  }
})();


// ═══════════════════════════════════════════
//  SISTEMA DE TOASTS
// ═══════════════════════════════════════════
const PalToast = (() => {

  let container = null;

  const ICONS = {
    info:    'fa-circle-info',
    success: 'fa-circle-check',
    warning: 'fa-triangle-exclamation',
    error:   'fa-circle-xmark',
  };

  const SOUNDS = {
    info:    () => PalSound.notify(),
    success: () => PalSound.success(),
    warning: () => PalSound.notify(),
    error:   () => PalSound.error(),
  };

  function getContainer() {
    if (container) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
    return container;
  }

  /**
   * Muestra un toast.
   * @param {string} message
   * @param {{ type?: 'info'|'success'|'warning'|'error', duration?: number, icon?: string }} opts
   */
  function show(message, opts = {}) {
    const { type = 'info', duration = 4200, icon } = opts;

    // Sonido asociado
    SOUNDS[type]?.();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');

    const ic = icon || ICONS[type];
    toast.innerHTML = `
      <span class="toast__icon"><i class="fa-solid ${ic}"></i></span>
      <span class="toast__msg">${message}</span>
      <button class="toast__close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
    `;

    const c = getContainer();
    c.appendChild(toast);

    // Forzar reflow para la animación de entrada
    void toast.offsetWidth;
    toast.classList.add('toast--visible');

    // Botón de cierre
    toast.querySelector('.toast__close').addEventListener('click', () => dismiss(toast));

    // Auto-dismiss
    const timer = setTimeout(() => dismiss(toast), duration);
    toast._timer = timer;

    return toast;
  }

  function dismiss(toast) {
    if (!toast || toast._dismissed) return;
    toast._dismissed = true;
    clearTimeout(toast._timer);
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    // Fallback
    setTimeout(() => toast.remove(), 500);
  }

  return { show };
})();

window.PalToast = PalToast;


// ═══════════════════════════════════════════
//  TOASTS CONTEXTUALES AUTOMÁTICOS
// ═══════════════════════════════════════════
(function contextualToasts() {

  // 1 · Bienvenida al cargar (discreta, sin molestar)
  window.addEventListener('load', () => {
    setTimeout(() => {
      PalToast.show('Bienvenida a mi portfolio · Activa el sonido 🎵', {
        type: 'info',
        duration: 5500,
        icon: 'fa-dove',
      });
    }, 2800);
  });

  // 2 · Primer hover en la sección GitHub
  const ghSection = document.getElementById('github-stats');
  if (ghSection) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          PalToast.show('Datos cargados en tiempo real desde GitHub 🐙', {
            type: 'success',
            duration: 4000,
          });
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(ghSection);
  }

  // 3 · Formulario: éxito y error (hook en el evento custom de form.js si existe)
  document.addEventListener('pal:form:success', () => {
    PalToast.show('¡Mensaje enviado con éxito! Te contesto pronto ✨', { type: 'success' });
  });
  document.addEventListener('pal:form:error', (e) => {
    PalToast.show(e.detail?.msg || 'Algo salió mal. Inténtalo de nuevo.', { type: 'error' });
  });

  // 4 · Aviso al activar sonido
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const icon = document.getElementById('sound-icon');
      setTimeout(() => {
        if (icon?.classList.contains('fa-dove')) {
          PalToast.show('Canto de pájaros activado 🐦', { type: 'info', duration: 2800, icon: 'fa-dove' });
        }
      }, 100);
    }, { passive: true });
  }

})();
