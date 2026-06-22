/**
 * ui-sounds.js — Micro-sonidos de interfaz + Toasts
 * Los sonidos de UI solo se activan tras el primer gesto del usuario
 * (política de autoplay de los navegadores modernos).
 */
'use strict';

// ═══════════════════════════════════════════
//  AUDIO ENGINE — se inicializa con el primer gesto
// ═══════════════════════════════════════════
const PalSound = (() => {
  let _ctx     = null;
  let _reverb  = null;
  let _enabled = true;
  const VOL    = 0.18;   // volumen global de UI — sutil

  // Obtiene (o crea) el AudioContext tras un gesto real
  function ctx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  // Reverb corto — se construye la primera vez que se necesita
  function reverb() {
    if (_reverb) return _reverb;
    const ac  = ctx();
    const len = ac.sampleRate * 0.55;
    const ir  = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = ir.getChannelData(c);
      for (let i = 0; i < len; i++)
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 5);
    }
    _reverb = ac.createConvolver();
    _reverb.buffer = ir;
    return _reverb;
  }

  // Reproduce un oscilador con envolvente y reverb opcional
  function tone(freq, vol, dur, type = 'sine', wetAmt = 0.25) {
    if (!_enabled) return;
    try {
      const ac  = ctx();
      const now = ac.currentTime;

      const osc = ac.createOscillator();
      osc.type  = type;
      if (typeof freq === 'function') freq(osc, now);
      else osc.frequency.value = freq;

      const env = ac.createGain();
      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(vol, now + 0.010);
      env.gain.exponentialRampToValueAtTime(0.0001, now + dur);

      const dryG = ac.createGain(); dryG.gain.value = (1 - wetAmt) * VOL;
      const wetG = ac.createGain(); wetG.gain.value = wetAmt * VOL;

      const out = ac.createGain(); out.connect(ac.destination);
      dryG.connect(out);
      reverb().connect(wetG); wetG.connect(out);

      osc.connect(env);
      env.connect(dryG);
      env.connect(reverb());

      osc.start(now);
      osc.stop(now + dur + 0.06);
    } catch (_) {}
  }

  // ── Sonidos concretos ──────────────────────

  /** Hover: tick agudo muy suave */
  function hover() {
    tone(1450, 0.5, 0.055, 'sine', 0.1);
  }

  /** Click: tap percusivo orgánico */
  function click() {
    tone((osc, now) => {
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.09);
    }, 0.65, 0.12, 'sine', 0.18);
  }

  /** Abrir menú: acorde ascendente */
  function menuOpen() {
    if (!_enabled) return;
    try {
      const ac  = ctx();
      const now = ac.currentTime;
      [[880, 0], [1108, 0.055], [1320, 0.11]].forEach(([f, t]) => {
        const o = ac.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const e = ac.createGain();
        e.gain.setValueAtTime(0.0001, now + t);
        e.gain.linearRampToValueAtTime(0.55 * VOL, now + t + 0.012);
        e.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.24);
        const out = ac.createGain(); out.connect(ac.destination);
        o.connect(e); e.connect(out);
        o.start(now + t); o.stop(now + t + 0.30);
      });
    } catch (_) {}
  }

  /** Cerrar menú: acorde descendente */
  function menuClose() {
    if (!_enabled) return;
    try {
      const ac  = ctx();
      const now = ac.currentTime;
      [[1320, 0], [1108, 0.055], [880, 0.11]].forEach(([f, t]) => {
        const o = ac.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const e = ac.createGain();
        e.gain.setValueAtTime(0.0001, now + t);
        e.gain.linearRampToValueAtTime(0.42 * VOL, now + t + 0.012);
        e.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.20);
        const out = ac.createGain(); out.connect(ac.destination);
        o.connect(e); e.connect(out);
        o.start(now + t); o.stop(now + t + 0.26);
      });
    } catch (_) {}
  }

  /** Éxito: campana Do mayor */
  function success() {
    if (!_enabled) return;
    try {
      const ac  = ctx();
      const now = ac.currentTime;
      [[1047, 0], [1319, 0.07], [1568, 0.14]].forEach(([f, t]) => {
        const o = ac.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const e = ac.createGain();
        e.gain.setValueAtTime(0.0001, now + t);
        e.gain.linearRampToValueAtTime(0.55 * VOL, now + t + 0.012);
        e.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.4);
        const rev = reverb();
        const rG  = ac.createGain(); rG.gain.value = 0.3 * VOL;
        const out = ac.createGain(); out.connect(ac.destination);
        rev.connect(rG); rG.connect(out);
        o.connect(e); e.connect(out); e.connect(rev);
        o.start(now + t); o.stop(now + t + 0.5);
      });
    } catch (_) {}
  }

  /** Error: disonancia baja filtrada */
  function error() {
    if (!_enabled) return;
    try {
      const ac  = ctx();
      const now = ac.currentTime;
      [[330, 0], [311, 0.08]].forEach(([f, t]) => {
        const o  = ac.createOscillator();
        o.type   = 'sawtooth'; o.frequency.value = f;
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 520;
        const e  = ac.createGain();
        e.gain.setValueAtTime(0.0001, now + t);
        e.gain.linearRampToValueAtTime(0.5 * VOL, now + t + 0.015);
        e.gain.exponentialRampToValueAtTime(0.0001, now + t + 0.22);
        const out = ac.createGain(); out.connect(ac.destination);
        o.connect(lp); lp.connect(e); e.connect(out);
        o.start(now + t); o.stop(now + t + 0.28);
      });
    } catch (_) {}
  }

  /** Notificación: ping etéreo ascendente */
  function notify() {
    tone((osc, now) => {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(1320, now + 0.14);
      osc.frequency.setValueAtTime(1100, now + 0.15);
    }, 0.55, 0.30, 'sine', 0.35);
  }

  function setEnabled(v) { _enabled = v; }
  function isEnabled()   { return _enabled; }

  /**
   * Pájaro sintético — gorjeo breve y natural (dos silbidos ascendentes)
   * Técnica: oscilador seno con barrido de frecuencia suave +
   *          vibrato rápido para dar "aleteo" y un toque de reverb corto.
   */
  function raven() {
    if (!_enabled) return;
    try {
      const ac  = ctx();
      const now = ac.currentTime;

      const masterOut = ac.createGain();
      masterOut.gain.value = VOL * 1.1;
      masterOut.connect(ac.destination);

      // Reverb muy corto — sala pequeña
      const revBuf = ac.createBuffer(2, ac.sampleRate * 0.35, ac.sampleRate);
      for (let c = 0; c < 2; c++) {
        const ch = revBuf.getChannelData(c);
        for (let i = 0; i < ch.length; i++)
          ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 4);
      }
      const conv = ac.createConvolver();
      conv.buffer = revBuf;
      const revG = ac.createGain();
      revG.gain.value = 0.18;
      conv.connect(revG);
      revG.connect(ac.destination);

      /**
       * Un único silbido de pájaro
       * @param {number} t        - tiempo de inicio
       * @param {number} f0       - frecuencia inicial (Hz)
       * @param {number} f1       - frecuencia pico
       * @param {number} f2       - frecuencia final (descenso)
       * @param {number} dur      - duración total (s)
       * @param {number} vol      - amplitud (0-1)
       */
      function chirp(t, f0, f1, f2, dur, vol) {
        // Portador — sine puro para timbre limpio
        const osc = ac.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f0, t);
        osc.frequency.linearRampToValueAtTime(f1, t + dur * 0.45);
        osc.frequency.linearRampToValueAtTime(f2, t + dur);

        // Vibrato sutil (≈ 18 Hz, depth pequeño) — da "vida" al sonido
        const vibLfo = ac.createOscillator();
        vibLfo.type = 'sine';
        vibLfo.frequency.value = 18;
        const vibGain = ac.createGain();
        vibGain.gain.value = f1 * 0.018;
        vibLfo.connect(vibGain);
        vibGain.connect(osc.frequency);

        // Filtro bandpass centrado en el pico — recorta armónicos extraños
        const bp = ac.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = f1;
        bp.Q.value = 0.8;

        // Envolvente: ataque muy rápido, caída suave
        const env = ac.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(vol,    t + 0.012);
        env.gain.setValueAtTime(vol * 0.85,      t + dur * 0.55);
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(bp);
        bp.connect(env);
        env.connect(masterOut);
        env.connect(conv);

        osc.start(t);   vibLfo.start(t);
        osc.stop(t + dur + 0.04);
        vibLfo.stop(t + dur + 0.04);
      }

      // Primer gorjeo: ascendente y brillante
      chirp(now,        2400, 3800, 2800, 0.13, 0.80);
      // Segundo gorjeo: ligeramente más agudo y muy breve — eco natural
      chirp(now + 0.17, 2700, 4100, 3100, 0.10, 0.55);

    } catch (_) {}
  }

  return { hover, click, menuOpen, menuClose, success, error, notify, raven, setEnabled, isEnabled };
})();

window.PalSound = PalSound;


// ═══════════════════════════════════════════
//  INTERACCIONES — hover / click / menú
//  Se registran en DOMContentLoaded para que
//  todos los elementos ya existan.
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // ── Hover: delegación en body ──────────────
  // Captura cualquier cosa interactiva: botón, link, input, select, tabindex, rol...
  let hoverLast = null;

  function isInteractive(el) {
    if (!el || el === document.body) return false;
    const tag = el.tagName;
    if (['BUTTON','A','INPUT','SELECT','TEXTAREA','LABEL'].includes(tag)) return true;
    if (el.getAttribute('tabindex') !== null) return true;
    const role = el.getAttribute('role');
    if (role && ['button','link','menuitem','tab','checkbox','radio','option','switch'].includes(role)) return true;
    if (el.classList && [
      'btn','btn-icon','tab','filter-btn','hamburger','project-card',
      'contact-item','back-to-top','mobile-menu__link','navbar__link',
      'footer__social','mobile-menu__footer','process__step','chip',
      'skill-row','gh-metric','gh-chart-card',
    ].some(c => el.classList.contains(c))) return true;
    return false;
  }

  // ── Hover cuervo en logos (.js-logo) ─────────
  // Se usa un Set para evitar disparar el graznido repetidamente
  // mientras el cursor permanece sobre el mismo logo.
  const ravenActiveLogos = new WeakSet();

  document.body.addEventListener('mouseover', (e) => {
    const logo = e.target.closest('.js-logo');
    if (logo && !ravenActiveLogos.has(logo)) {
      ravenActiveLogos.add(logo);
      PalSound.raven();
    }
  }, { passive: true });

  document.body.addEventListener('mouseout', (e) => {
    const logo = e.target.closest('.js-logo');
    if (logo) ravenActiveLogos.delete(logo);
  }, { passive: true });

  document.body.addEventListener('mouseover', (e) => {
    // Busca el elemento interactivo más cercano en la cadena de ancestors
    let el = e.target;
    while (el && el !== document.body) {
      if (isInteractive(el)) {
        if (el !== hoverLast) { hoverLast = el; PalSound.hover(); }
        return;
      }
      el = el.parentElement;
    }
  }, { passive: true });

  document.body.addEventListener('mouseout', (e) => {
    let el = e.target;
    while (el && el !== document.body) {
      if (isInteractive(el)) { hoverLast = null; return; }
      el = el.parentElement;
    }
  }, { passive: true });

  // ── Click ──────────────────────────────────
  document.body.addEventListener('click', (e) => {
    const el = e.target.closest('.btn, .btn-icon, .tab, .filter-btn, .back-to-top');
    if (!el || el.id === 'sound-toggle') return;
    PalSound.click();
  }, { passive: true });

  // ── Menú hamburger — sonidos open/close ─────
  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    // Usamos MutationObserver para detectar cambio de clase
    const obs = new MutationObserver(() => {
      if (hamburger.classList.contains('open')) {
        PalSound.menuOpen();
      } else {
        PalSound.menuClose();
      }
    });
    obs.observe(hamburger, { attributes: true, attributeFilter: ['class'] });
  }

  // ── Botón de sonido principal → sync enabled + volumen ─
  const soundBtn  = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const volCtrl   = document.getElementById('vol-control');
  const volRange  = document.getElementById('vol-range');
  const volFill   = document.getElementById('vol-fill');
  const volDown   = document.getElementById('vol-down');
  const volUp     = document.getElementById('vol-up');

  function updateVolUI(val) {
    const pct = Math.round(val * 100);
    if (volRange) volRange.value = pct;
    if (volFill)  volFill.style.width = pct + '%';
  }

  function applyVolume(val) {
    const v = Math.max(0, Math.min(1, val));
    updateVolUI(v);
    window.PalAmbient?.setVolume(v);
    PalSound.setEnabled(v > 0.01);
  }

  if (soundBtn && soundIcon) {
    soundBtn.addEventListener('click', () => {
      setTimeout(() => {
        const active = soundIcon.classList.contains('fa-tree');
        PalSound.setEnabled(active);
        // Mostrar/ocultar control de volumen
        if (volCtrl) volCtrl.classList.toggle('visible', active);
        if (active) {
          updateVolUI(window.PalAmbient?.getVolume() ?? 0.68);
        }
      }, 80);
    }, { passive: true });
  }

  // Slider de volumen
  if (volRange) {
    volRange.addEventListener('input', () => {
      applyVolume(parseInt(volRange.value, 10) / 100);
    });
  }

  // Botones − y +
  if (volDown) {
    volDown.addEventListener('click', () => {
      const cur = parseInt(volRange?.value ?? '68', 10);
      applyVolume((cur - 10) / 100);
    });
  }
  if (volUp) {
    volUp.addEventListener('click', () => {
      const cur = parseInt(volRange?.value ?? '68', 10);
      applyVolume((cur + 10) / 100);
    });
  }

});


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

  function getContainer() {
    if (container) return container;
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
    return container;
  }

  function show(message, opts = {}) {
    const { type = 'info', duration = 4200, icon } = opts;

    // Sonido del toast (solo si hay gesto previo)
    try {
      if (type === 'success') PalSound.success();
      else if (type === 'error') PalSound.error();
      else PalSound.notify();
    } catch (_) {}

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');
    toast.innerHTML = `
      <span class="toast__icon"><i class="fa-solid ${icon || ICONS[type]}"></i></span>
      <span class="toast__msg">${message}</span>
      <button class="toast__close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
    `;

    getContainer().appendChild(toast);
    void toast.offsetWidth;
    toast.classList.add('toast--visible');

    toast.querySelector('.toast__close').addEventListener('click', () => dismiss(toast));
    toast._timer = setTimeout(() => dismiss(toast), duration);
    return toast;
  }

  function dismiss(toast) {
    if (!toast || toast._dismissed) return;
    toast._dismissed = true;
    clearTimeout(toast._timer);
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 600);
  }

  return { show };
})();

window.PalToast = PalToast;


// ═══════════════════════════════════════════
//  TOASTS CONTEXTUALES
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // Bienvenida — solo si el usuario no lo ha visto ya (sessionStorage)
  if (!sessionStorage.getItem('pal_welcomed')) {
    setTimeout(() => {
      PalToast.show('Bienvenida · activa el sonido 🌿 para una experiencia completa', {
        type: 'info', duration: 5500, icon: 'fa-tree',
      });
      sessionStorage.setItem('pal_welcomed', '1');
    }, 2600);
  }

  // GitHub stats en vista
  const ghSection = document.getElementById('github-stats');
  if (ghSection) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          PalToast.show('Datos GitHub cargados en tiempo real 🐙', {
            type: 'success', duration: 3500,
          });
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    obs.observe(ghSection);
  }

  // Éxito / error del formulario
  document.addEventListener('pal:form:success', () => {
    PalToast.show('¡Mensaje enviado! Te respondo pronto ✨', { type: 'success' });
  });
  document.addEventListener('pal:form:error', (e) => {
    PalToast.show(e.detail?.msg || 'Algo salió mal. Inténtalo de nuevo.', { type: 'error' });
  });

});


// ═══════════════════════════════════════════
//  AUDIO ENGINE
// ═══════════════════════════════════════════
