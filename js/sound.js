/**
 * sound.js — Ambiente sonoro generado con Web Audio API
 * Sonido: viento suave + lluvia tenue + nota dron oscura
 * Todo sintetizado, sin archivos externos
 */
'use strict';

(function initSound() {
  const btn  = document.getElementById('sound-toggle');
  const icon = document.getElementById('sound-icon');

  if (!btn) return;

  let audioCtx   = null;
  let masterGain = null;
  let nodes      = [];
  let isPlaying  = false;
  let fadeTimer  = null;

  // ── Crear contexto y sonidos ────────────
  function buildAudio() {
    audioCtx   = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
    masterGain.connect(audioCtx.destination);

    nodes = [
      createWind(),
      createRain(),
      createDrone(55),   // La1 grave — misterioso
      createDrone(82.4), // Mi2 — tensión
    ];
  }

  // ── Viento: ruido blanco filtrado ──────
  function createWind() {
    const bufferSize = audioCtx.sampleRate * 4;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data   = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop   = true;

    // Filtro pasa-bajas → suaviza el viento
    const low = audioCtx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = 400;
    low.Q.value = 0.5;

    // Filtro pasa-altas → quita el DC
    const high = audioCtx.createBiquadFilter();
    high.type = 'highpass';
    high.frequency.value = 80;

    // Ganancia suave
    const g = audioCtx.createGain();
    g.gain.value = 0.12;

    // LFO para variación de viento
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.08; // muy lento
    lfo.type = 'sine';
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    lfo.start();

    src.connect(high);
    high.connect(low);
    low.connect(g);
    g.connect(masterGain);
    src.start();

    return { src, lfo };
  }

  // ── Lluvia: ruido rosa ─────────────────
  function createRain() {
    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data   = buffer.getChannelData(0);

    // Ruido rosa (aproximado)
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886*b0 + white*0.0555179;
      b1 = 0.99332*b1 + white*0.0750759;
      b2 = 0.96900*b2 + white*0.1538520;
      b3 = 0.86650*b3 + white*0.3104856;
      b4 = 0.55000*b4 + white*0.5329522;
      b5 = -0.7616*b5 - white*0.0168980;
      data[i] = (b0+b1+b2+b3+b4+b5+b6+white*0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    src.loop   = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.3;

    const g = audioCtx.createGain();
    g.gain.value = 0.06;

    src.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    src.start();

    return { src };
  }

  // ── Dron: oscilador de baja frecuencia ─
  function createDrone(freq) {
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    // Reverb simple via convolución
    const convolver = audioCtx.createConvolver();
    convolver.buffer = makeReverb(audioCtx, 3, 2);

    const g = audioCtx.createGain();
    g.gain.value = 0.018;

    // Filtro para suavizar el sawtooth
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    filter.Q.value = 1;

    // Vibrato muy sutil
    const vib = audioCtx.createOscillator();
    vib.frequency.value = 0.3;
    const vibGain = audioCtx.createGain();
    vibGain.gain.value = 0.5;
    vib.connect(vibGain);
    vibGain.connect(osc.frequency);
    vib.start();

    osc.connect(filter);
    filter.connect(convolver);
    convolver.connect(g);
    g.connect(masterGain);
    osc.start();

    return { osc, vib };
  }

  // ── Reverb sintético ───────────────────
  function makeReverb(ctx, duration, decay) {
    const sampleRate = ctx.sampleRate;
    const length     = sampleRate * duration;
    const impulse    = ctx.createBuffer(2, length, sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  // ── Fade in / out ─────────────────────
  function fadeIn() {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 2.5);
  }

  function fadeOut(cb) {
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(cb, 1600);
  }

  // ── Toggle ─────────────────────────────
  btn.addEventListener('click', () => {
    // Primera interacción: construir audio
    if (!audioCtx) buildAudio();

    // Reanudar contexto suspendido (política de autoplay)
    if (audioCtx.state === 'suspended') audioCtx.resume();

    if (!isPlaying) {
      isPlaying = true;
      icon.className = 'fa-solid fa-volume-high';
      btn.setAttribute('aria-label', 'Silenciar');
      btn.classList.add('sound-active');
      fadeIn();
    } else {
      isPlaying = false;
      icon.className = 'fa-solid fa-volume-xmark';
      btn.setAttribute('aria-label', 'Activar sonido');
      btn.classList.remove('sound-active');
      fadeOut(() => {});
    }
  });

  // Icono de tooltip pulsante cuando está silenciado
  setTimeout(() => {
    if (!isPlaying && btn) {
      btn.title = 'Activar ambiente sonoro';
    }
  }, 3000);
})();
