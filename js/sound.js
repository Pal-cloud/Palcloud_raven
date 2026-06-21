/**
 * sound.js — Amanecer forestal · Canto de pájaros sintético
 * Técnica: síntesis FM para gorjeos, trinos y silbidos
 *          + ambiente de bosque (ruido filtrado) + reverb natural
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

  function build() {
    ctx    = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.connect(ctx.destination);

    const reverb = makeReverb(ctx, 3.5, 2.2);

    const dryBus = ctx.createGain();
    dryBus.gain.value = 0.50;
    dryBus.connect(master);

    const wetBus = ctx.createGain();
    wetBus.gain.value = 0.50;
    reverb.connect(wetBus);
    wetBus.connect(master);

    // 1 · Ambiente forestal suave (viento entre hojas)
    const forestStop = buildForest(dryBus);

    // 2 · Cuatro "pájaros" distintos a intervalos aleatorios
    const stops = [
      buildBirdScheduler(dryBus, wetBus, 2500,  7000, 'chirp'),
      buildBirdScheduler(dryBus, wetBus, 3500, 10000, 'warble'),
      buildBirdScheduler(dryBus, wetBus, 1800,  6500, 'call'),
      buildBirdScheduler(dryBus, wetBus, 4000, 12000, 'whistle'),
    ];

    stopFns = [forestStop, ...stops];
  }

  // ─── Ambiente: viento entre hojas ──────────
  function buildForest(out) {
    const buf = makeNoiseBuf(ctx, 5);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop   = true;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1600;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 5500;

    // LFO muy lento → ráfaga de viento
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.035;
    const lfoG = ctx.createGain();
    lfoG.gain.value = 900;
    lfo.connect(lfoG);
    lfoG.connect(lp.frequency);
    lfo.start();

    const vol = ctx.createGain();
    vol.gain.value = 0.028;

    src.connect(hp); hp.connect(lp); lp.connect(vol); vol.connect(out);
    src.start();

    return () => { try { src.stop(); lfo.stop(); } catch(_){} };
  }

  // ─── Planificador de pájaros ────────────────
  function buildBirdScheduler(dry, wet, minMs, maxMs, type) {
    let timer = null;
    function schedule() {
      if (!isPlaying) return;
      const delay = minMs + Math.random() * (maxMs - minMs);
      timer = setTimeout(() => {
        if (isPlaying && ctx) { playBird(dry, wet, type); schedule(); }
      }, delay);
    }
    schedule();
    return () => { clearTimeout(timer); timer = null; };
  }

  // ─── Cantos sintéticos ──────────────────────
  function playBird(dry, wet, type) {
    if (!ctx) return;
    const now = ctx.currentTime;
    switch (type) {
      case 'chirp':   // gorjeo rápido doble
        chirp(dry, wet, 2400, 3600, 0.09, now);
        chirp(dry, wet, 2100, 3200, 0.07, now + 0.14);
        break;
      case 'warble':  // trino de canario — vibrato rápido
        warble(dry, wet, 2900 + Math.random() * 400, 0.14, now);
        break;
      case 'call':    // llamada de dos notas descendente
        chirp(dry, wet, 1700, 1200, 0.13, now, 0.22);
        chirp(dry, wet, 1900, 1400, 0.09, now + 0.32, 0.18);
        break;
      case 'whistle': // silbido ascendente largo
        chirp(dry, wet, 900, 1900, 0.11, now, 0.38);
        break;
    }
  }

  // Barrido de frecuencia (chirp individual)
  function chirp(dry, wet, fStart, fEnd, vol, when, dur = 0.13) {
    const osc  = ctx.createOscillator();
    const osc2 = ctx.createOscillator(); // armónico suave

    osc.type  = 'sine';
    osc2.type = 'sine';
    osc.frequency.setValueAtTime(fStart, when);
    osc.frequency.exponentialRampToValueAtTime(fEnd, when + dur);
    osc2.frequency.setValueAtTime(fStart * 2.01, when);
    osc2.frequency.exponentialRampToValueAtTime(fEnd * 2.01, when + dur);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(vol,    when + 0.012);
    env.gain.setValueAtTime(vol,             when + dur * 0.65);
    env.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.025);

    const hGain = ctx.createGain();
    hGain.gain.value = 0.18;

    osc.connect(env);
    osc2.connect(hGain); hGain.connect(env);
    env.connect(dry); env.connect(wet);

    osc.start(when);  osc2.start(when);
    osc.stop(when + dur + 0.05); osc2.stop(when + dur + 0.05);
  }

  // Vibrato rápido tipo canario
  function warble(dry, wet, centerFreq, vol, when) {
    const dur = 0.22 + Math.random() * 0.18;
    const osc = ctx.createOscillator();
    osc.type  = 'sine';
    osc.frequency.value = centerFreq;

    const lfo  = ctx.createOscillator();
    lfo.type   = 'sine';
    lfo.frequency.value = 13 + Math.random() * 9;
    const lfoG = ctx.createGain();
    lfoG.gain.value = centerFreq * 0.07;
    lfo.connect(lfoG); lfoG.connect(osc.frequency);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, when);
    env.gain.linearRampToValueAtTime(vol,    when + 0.025);
    env.gain.setValueAtTime(vol,             when + dur - 0.04);
    env.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.03);

    osc.connect(env); env.connect(dry); env.connect(wet);
    osc.start(when); lfo.start(when);
    osc.stop(when + dur + 0.05); lfo.stop(when + dur + 0.05);
  }

  // ─── Utilidades ─────────────────────────────
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
    master.gain.linearRampToValueAtTime(0.60, ctx.currentTime + 3.5);
  }

  function fadeOut() {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.2);
    setTimeout(() => {
      stopFns.forEach(f => f()); stopFns = [];
      if (ctx) { ctx.close(); ctx = null; master = null; }
    }, 2500);
  }

  // ─── Toggle ─────────────────────────────────
  btn.addEventListener('click', async () => {
    if (!isPlaying) {
      if (!ctx) build();
      if (ctx.state === 'suspended') await ctx.resume();
      fadeIn();
      isPlaying = true;
      icon.className = 'fa-solid fa-dove';
      btn.title = 'Silenciar canto';
      btn.setAttribute('aria-label', 'Silenciar');
    } else {
      isPlaying = false;
      icon.className = 'fa-solid fa-volume-xmark';
      btn.title = 'Activar canto de pájaros';
      btn.setAttribute('aria-label', 'Activar sonido');
      fadeOut();
    }
  });

})();


(function initSound() {
  const btn  = document.getElementById('sound-toggle');
  const icon = document.getElementById('sound-icon');
  if (!btn) return;

  let ctx       = null;
  let master    = null;
  let isPlaying = false;
  let stopFns   = [];

  // ─── Construir el grafo de audio ───────────
  function build() {
    ctx    = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.connect(ctx.destination);

    const reverb = makeReverb(ctx, 4, 2.8, 0.3);

    // Bus seco y húmedo compartidos
    const dryBus = ctx.createGain();
    dryBus.gain.value = 0.6;
    dryBus.connect(master);

    const wetBus = ctx.createGain();
    wetBus.gain.value = 0.4;
    reverb.connect(wetBus);
    wetBus.connect(master);

    // 1 · LLUVIA: ruido blanco filtrado en bandas
    const rainStop = buildRain(dryBus, wetBus);

    // 2 · GOTAS: pings aleatorios de resonancia
    const dropStop = buildDrops(wetBus);

    // 3 · DRONE: pad de fondo muy suave (La menor, p=0.02)
    const droneStop = buildDrone(wetBus);

    stopFns = [rainStop, dropStop, droneStop];
  }

  // ─── LLUVIA: varias capas de ruido filtrado ──
  function buildRain(dry, wet) {
    const buffers = [
      { freq: 800,  q: 1.5,  gain: 0.18 },   // lluvia fina
      { freq: 2200, q: 0.8,  gain: 0.10 },   // salpicaduras
      { freq: 320,  q: 2.0,  gain: 0.08 },   // graves de fondo
    ];

    const nodes = buffers.map(({ freq, q, gain: g }) => {
      const buf = makeNoiseBuffer(ctx, 4);    // 4s de ruido blanco
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      const filt = ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.value = freq;
      filt.Q.value = q;

      // LFO muy lento sobre el filtro → sensación de ráfaga
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.08 + Math.random() * 0.06;
      const lfoG = ctx.createGain();
      lfoG.gain.value = freq * 0.15;
      lfo.connect(lfoG);
      lfoG.connect(filt.frequency);
      lfo.start();

      const vol = ctx.createGain();
      vol.gain.value = g;

      src.connect(filt);
      filt.connect(vol);
      vol.connect(dry);
      vol.connect(wet);

      src.start();

      return () => { try { src.stop(); lfo.stop(); } catch(_){} };
    });

    return () => nodes.forEach(f => f());
  }

  // ─── GOTAS: impulsos resonantes aleatorios ──
  function buildDrops(wet) {
    let timer = null;

    function scheduleNext() {
      const delay = 80 + Math.random() * 600;  // entre 80ms y 680ms
      timer = setTimeout(playDrop, delay);
    }

    function playDrop() {
      if (!isPlaying) return;

      // Frecuencia de la gota: alta, random
      const freq = 900 + Math.random() * 1800;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.25);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, ctx.currentTime);
      env.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.005);
      env.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);

      osc.connect(env);
      env.connect(wet);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);

      scheduleNext();
    }

    scheduleNext();
    return () => { clearTimeout(timer); timer = null; };
  }

  // ─── DRONE: pad sine muy suave de fondo ─────
  function buildDrone(wet) {
    const CHORD = [110, 130.8, 164.8, 220];  // La menor, muy bajo
    const oscs = CHORD.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const ampLFO = ctx.createOscillator();
      ampLFO.type = 'sine';
      ampLFO.frequency.value = 0.03 + i * 0.005;
      const lfoG = ctx.createGain();
      lfoG.gain.value = 0.008;
      ampLFO.connect(lfoG);

      const vol = ctx.createGain();
      vol.gain.value = 0.015 - i * 0.002;
      lfoG.connect(vol.gain);

      osc.connect(vol);
      vol.connect(wet);

      osc.start();
      ampLFO.start();

      return () => { try { osc.stop(); ampLFO.stop(); } catch(_){} };
    });

    return () => oscs.forEach(f => f());
  }

  // ─── Reverb de placa ────────────────────────
  function makeReverb(ctx, seconds, decay, wet) {
    const conv = ctx.createConvolver();
    const len  = ctx.sampleRate * seconds;
    const ir   = ctx.createBuffer(2, len, ctx.sampleRate);

    for (let c = 0; c < 2; c++) {
      const chan = ir.getChannelData(c);
      for (let i = 0; i < len; i++) {
        chan[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    conv.buffer = ir;
    return conv;
  }

  // ─── Buffer de ruido blanco ─────────────────
  function makeNoiseBuffer(ctx, seconds) {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch  = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
    return buf;
  }

  // ─── Fade in / out ──────────────────────────
  function fadeIn() {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.72, ctx.currentTime + 2.5);
  }

  function fadeOut(cb) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
    setTimeout(() => {
      stopFns.forEach(f => f());
      stopFns = [];
      ctx.close();
      ctx = null;
      master = null;
      cb?.();
    }, 2000);
  }

  // ─── Toggle ─────────────────────────────────
  btn.addEventListener('click', async () => {
    if (!isPlaying) {
      // Primer click: construir y arrancar
      if (!ctx) build();

      // Reanudar si el contexto está suspendido (autoplay policy)
      if (ctx.state === 'suspended') await ctx.resume();

      fadeIn();
      isPlaying = true;
      icon.className = 'fa-solid fa-volume-high';
      btn.title = 'Silenciar sonido';
      btn.setAttribute('aria-label', 'Silenciar sonido');
    } else {
      isPlaying = false;
      icon.className = 'fa-solid fa-volume-xmark';
      btn.title = 'Activar sonido';
      btn.setAttribute('aria-label', 'Activar sonido');
      fadeOut();
    }
  });

})();
