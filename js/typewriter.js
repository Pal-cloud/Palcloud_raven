/**
 * typewriter.js — Efecto typewriter con palabras rotativas
 */
'use strict';

(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const words = [
    'Apasionado.',
    'Innovador.',
    'Full Stack.',
    'Open Source.',
    'Detallista.',
    'Palcloud Raven.'
  ];

  let wordIndex   = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  let isPaused    = false;

  const TYPING_SPEED  = 80;
  const DELETE_SPEED  = 45;
  const PAUSE_AFTER   = 1800;
  const PAUSE_BEFORE  = 350;

  function type() {
    if (isPaused) return;

    const currentWord = words[wordIndex];

    if (!isDeleting) {
      // Escribiendo
      el.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentWord.length) {
        // Pausa antes de borrar
        isPaused = true;
        setTimeout(() => {
          isPaused = false;
          isDeleting = true;
          scheduleNext();
        }, PAUSE_AFTER);
        return;
      }
    } else {
      // Borrando
      el.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;

        // Pausa antes de escribir siguiente palabra
        isPaused = true;
        setTimeout(() => {
          isPaused = false;
          scheduleNext();
        }, PAUSE_BEFORE);
        return;
      }
    }

    scheduleNext();
  }

  function scheduleNext() {
    const speed = isDeleting ? DELETE_SPEED : TYPING_SPEED;
    // Pequeña variación aleatoria para naturalidad
    const jitter = Math.random() * 30 - 15;
    setTimeout(type, speed + jitter);
  }

  // Cursor parpadeante via CSS pseudo-elemento
  el.style.cssText = `
    border-right: 3px solid var(--accent);
    padding-right: 4px;
    animation: typewriterCursor 1s step-end infinite;
  `;

  // Arrancar tras un pequeño delay
  setTimeout(type, 800);
})();
