/**
 * sound.js — Lluvia nocturna bohemia
 * Técnica: ruido blanco filtrado para lluvia + gotas individuales
 *          + pad drone muy suave de fondo + reverb de sala
 * Sin síntesis de cuervo, sin pad estridente — solo agua y noche.
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
