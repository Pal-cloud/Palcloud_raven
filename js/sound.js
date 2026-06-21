/**
 * sound.js — Bosque al atardecer / Oleaje suave
 * Expone window.PalAmbient para control externo de volumen
 */
'use strict';

(function initSound() {
  const btn  = document.getElementById('sound-toggle');
  const icon = document.getElementById('sound-icon');
  if (!btn) return;

  let ctx       = null;
  let master    = null;
  let isPlaying = false;
  let stopFns   = [];
  let _vol      = 0.68;   // volumen actual (0–1)

  function build() {
    ctx    = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.connect(ctx.destination);

    const rev = makeReverb(ctx, 5, 2.0);
    const dry = ctx.createGain(); dry.gain.value = 0.55; dry.connect(master);
    const wet = ctx.createGain(); wet.gain.value = 0.45;
    rev.connect(wet); wet.connect(master);

    stopFns = [
      buildWind(dry, wet),
      buildOcean(dry, wet),
      buildCrickets(wet),
    ];
  }

  function buildWind(dry, wet) {
    const buf = makeNoiseBuf(ctx, 6);
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;

    const bp1 = ctx.createBiquadFilter();
    bp1.type = 'bandpass'; bp1.frequency.value = 700; bp1.Q.value = 1.2;
    const bp2 = ctx.createBiquadFilter();
    bp2.type = 'bandpass'; bp2.frequency.value = 1800; bp2.Q.value = 0.7;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.04;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.022;
    lfo.connect(lfoG);

    const vol = ctx.createGain(); vol.gain.value = 0.18;
    lfoG.connect(vol.gain);

    const buf2 = makeNoiseBuf(ctx, 4);
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2; src2.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2800;
    const vol2 = ctx.createGain(); vol2.gain.value = 0.06;

    src.connect(bp1); bp1.connect(bp2); bp2.connect(vol);
    vol.connect(dry); vol.connect(wet);
    src2.connect(hp); hp.connect(vol2); vol2.connect(wet);
    src.start(); src2.start(); lfo.start();
    return () => { try { src.stop(); src2.stop(); lfo.stop(); } catch(_){} };
  }

  function buildOcean(dry, wet) {
    const buf = makeNoiseBuf(ctx, 8);
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 500;

    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.13;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.11;
    lfo.connect(lfoG);
    const vol = ctx.createGain(); vol.gain.value = 0.13;
    lfoG.connect(vol.gain);

    const buf2 = makeNoiseBuf(ctx, 5);
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2; src2.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'bandpass'; hp.frequency.value = 3200; hp.Q.value = 0.5;
    const lfo2 = ctx.createOscillator();
    lfo2.type = 'sine'; lfo2.frequency.value = 0.13;
    const lfoG2 = ctx.createGain(); lfoG2.gain.value = 0.03;
    lfo2.connect(lfoG2);
    const vol2 = ctx.createGain(); vol2.gain.value = 0.04;
    lfoG2.connect(vol2.gain);

    src.connect(lp); lp.connect(vol); vol.connect(dry); vol.connect(wet);
    src2.connect(hp); hp.connect(vol2); vol2.connect(wet);
    src.start(); src2.start(); lfo.start(); lfo2.start();
    return () => { try { src.stop(); src2.stop(); lfo.stop(); lfo2.stop(); } catch(_){} };
  }

  function buildCrickets(wet) {
    let timer = null;
    function chirp() {
      if (!isPlaying || !ctx) return;
      const now = ctx.currentTime;
      const f   = 3800 + Math.random() * 600;
      for (let i = 0; i < 3; i++) {
        const o = ctx.createOscillator();
        o.type = 'sine'; o.frequency.value = f;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, now + i * 0.04);
        env.gain.linearRampToValueAtTime(0.028, now + i * 0.04 + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.06);
        o.connect(env); env.connect(wet);
        o.start(now + i * 0.04); o.stop(now + i * 0.04 + 0.08);
      }
      timer = setTimeout(chirp, 900 + Math.random() * 2800);
    }
    chirp();
    return () => { clearTimeout(timer); timer = null; };
  }

  function makeReverb(ctx, secs, decay) {
    const conv = ctx.createConvolver();
    const len  = ctx.sampleRate * secs;
    const ir   = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = ir.getChannelData(c);
      for (let i = 0; i < len; i++)
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    conv.buffer = ir; return conv;
  }

  function makeNoiseBuf(ctx, secs) {
    const len = ctx.sampleRate * secs;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch  = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    return buf;
  }

  function fadeIn() {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(_vol, ctx.currentTime + 3.5);
  }

  function fadeOut() {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
    setTimeout(() => {
      stopFns.forEach(f => f()); stopFns = [];
      if (ctx) { ctx.close(); ctx = null; master = null; }
    }, 3000);
  }

  // ── Toggle ────────────────────────────────────
  btn.addEventListener('click', async () => {
    if (!isPlaying) {
      if (!ctx) build();
      if (ctx.state === 'suspended') await ctx.resume();
      fadeIn();
      isPlaying = true;
      icon.className = 'fa-solid fa-tree';
      btn.title = 'Silenciar naturaleza';
      btn.setAttribute('aria-label', 'Silenciar');
    } else {
      isPlaying = false;
      icon.className = 'fa-solid fa-volume-xmark';
      btn.title = 'Activar sonido de naturaleza';
      btn.setAttribute('aria-label', 'Activar sonido');
      fadeOut();
    }
  });

  // ── API pública para control de volumen ───────
  window.PalAmbient = {
    setVolume(v) {
      _vol = Math.max(0, Math.min(1, v));
      if (master && isPlaying) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(_vol, ctx.currentTime + 0.3);
      }
    },
    getVolume() { return _vol; },
    isPlaying()  { return isPlaying; },
  };

})();


(function initSound() {
  const btn  = document.getElementById('sound-toggle');
  const icon = document.getElementById('sound-icon');
  if (!btn) return;

  let ctx       = null;
  let master    = null;
  let isPlaying = false;
  let stopFns   = [];

  function build() {
    ctx    = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.connect(ctx.destination);

    const rev = makeReverb(ctx, 5, 2.0);
    const dry = ctx.createGain(); dry.gain.value = 0.55; dry.connect(master);
    const wet = ctx.createGain(); wet.gain.value = 0.45;
    rev.connect(wet); wet.connect(master);

    stopFns = [
      buildWind(dry, wet),       // viento suave entre hojas
      buildOcean(dry, wet),      // oleaje rítmico
      buildCrickets(wet),        // grillos nocturnos suaves
    ];
  }

  // ─── VIENTO: ruido filtrado con LFO de ráfagas ───
  function buildWind(dry, wet) {
    const buf = makeNoiseBuf(ctx, 6);
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;

    // Dos filtros en cascada → textura de hojas
    const bp1 = ctx.createBiquadFilter();
    bp1.type = 'bandpass'; bp1.frequency.value = 700; bp1.Q.value = 1.2;

    const bp2 = ctx.createBiquadFilter();
    bp2.type = 'bandpass'; bp2.frequency.value = 1800; bp2.Q.value = 0.7;

    // LFO lento de ráfaga
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.04;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.022;
    lfo.connect(lfoG);

    const vol = ctx.createGain(); vol.gain.value = 0.18;
    lfoG.connect(vol.gain);

    // Segunda capa muy suave de hojas
    const buf2 = makeNoiseBuf(ctx, 4);
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2; src2.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 2800;
    const vol2 = ctx.createGain(); vol2.gain.value = 0.06;

    src.connect(bp1); bp1.connect(bp2); bp2.connect(vol);
    vol.connect(dry); vol.connect(wet);
    src2.connect(hp); hp.connect(vol2); vol2.connect(wet);

    src.start(); src2.start(); lfo.start();
    return () => { try { src.stop(); src2.stop(); lfo.stop(); } catch(_){} };
  }

  // ─── OCÉANO: oleaje rítmico suave ────────────
  function buildOcean(dry, wet) {
    // Ruido filtrado + LFO lento sinusoidal que simula la ola
    const buf = makeNoiseBuf(ctx, 8);
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 500;

    // LFO de ola — sube y baja cada ~7s
    const lfo = ctx.createOscillator();
    lfo.type = 'sine'; lfo.frequency.value = 0.13;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.11;
    lfo.connect(lfoG);

    const vol = ctx.createGain(); vol.gain.value = 0.13;
    lfoG.connect(vol.gain);

    // Espuma: capa de ruido de alta frecuencia muy suave
    const buf2 = makeNoiseBuf(ctx, 5);
    const src2 = ctx.createBufferSource();
    src2.buffer = buf2; src2.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'bandpass'; hp.frequency.value = 3200; hp.Q.value = 0.5;
    const lfo2 = ctx.createOscillator();
    lfo2.type = 'sine'; lfo2.frequency.value = 0.13;
    const lfoG2 = ctx.createGain(); lfoG2.gain.value = 0.03;
    lfo2.connect(lfoG2);
    const vol2 = ctx.createGain(); vol2.gain.value = 0.04;
    lfoG2.connect(vol2.gain);

    src.connect(lp); lp.connect(vol); vol.connect(dry); vol.connect(wet);
    src2.connect(hp); hp.connect(vol2); vol2.connect(wet);

    src.start(); src2.start(); lfo.start(); lfo2.start();
    return () => { try { src.stop(); src2.stop(); lfo.stop(); lfo2.stop(); } catch(_){} };
  }

  // ─── GRILLOS: chirp suave y periódico ────────
  function buildCrickets(wet) {
    let timer = null;
    function chirp() {
      if (!isPlaying || !ctx) return;
      const now = ctx.currentTime;
      const f   = 3800 + Math.random() * 600;
      for (let i = 0; i < 3; i++) {
        const o   = ctx.createOscillator();
        o.type    = 'sine';
        o.frequency.value = f;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, now + i * 0.04);
        env.gain.linearRampToValueAtTime(0.028, now + i * 0.04 + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.06);
        o.connect(env); env.connect(wet);
        o.start(now + i * 0.04);
        o.stop(now + i * 0.04 + 0.08);
      }
      timer = setTimeout(chirp, 900 + Math.random() * 2800);
    }
    chirp();
    return () => { clearTimeout(timer); timer = null; };
  }

  // ─── Utilidades ──────────────────────────────
  function makeReverb(ctx, secs, decay) {
    const conv = ctx.createConvolver();
    const len  = ctx.sampleRate * secs;
    const ir   = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = ir.getChannelData(c);
      for (let i = 0; i < len; i++)
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    conv.buffer = ir;
    return conv;
  }

  function makeNoiseBuf(ctx, secs) {
    const len = ctx.sampleRate * secs;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch  = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    return buf;
  }

  function fadeIn() {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.68, ctx.currentTime + 3.5);
  }

  function fadeOut() {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
    setTimeout(() => {
      stopFns.forEach(f => f()); stopFns = [];
      if (ctx) { ctx.close(); ctx = null; master = null; }
    }, 3000);
  }

  // ─── Toggle ──────────────────────────────────
  btn.addEventListener('click', async () => {
    if (!isPlaying) {
      if (!ctx) build();
      if (ctx.state === 'suspended') await ctx.resume();
      fadeIn();
      isPlaying = true;
      icon.className = 'fa-solid fa-tree';
      btn.title = 'Silenciar naturaleza';
      btn.setAttribute('aria-label', 'Silenciar');
    } else {
      isPlaying = false;
      icon.className = 'fa-solid fa-volume-xmark';
      btn.title = 'Activar sonido de naturaleza';
      btn.setAttribute('aria-label', 'Activar sonido');
      fadeOut();
    }
  });

})();
