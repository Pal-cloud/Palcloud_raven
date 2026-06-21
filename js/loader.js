/**
 * loader.js — Pantalla de carga con barra de progreso
 */
'use strict';

(function initLoader() {
  const loader     = document.getElementById('loader');
  const loaderFill = document.getElementById('loader-fill');
  const loaderText = document.getElementById('loader-text');

  if (!loader) return;

  const messages = [
    'Iniciando...',
    'Cargando recursos...',
    'Preparando el vuelo...',
    '¡Listo para volar!'
  ];

  let progress = 0;

  const setProgress = (value, msg) => {
    progress = value;
    if (loaderFill) loaderFill.style.width = `${value}%`;
    if (loaderText && msg) loaderText.textContent = msg;
  };

  const hide = () => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    // Disparar evento global para que otros módulos arranquen
    document.dispatchEvent(new CustomEvent('portfolio:ready'));
  };

  // Bloquear scroll mientras carga
  document.body.style.overflow = 'hidden';

  // Simular carga progresiva
  const steps = [
    { pct: 20, msg: messages[0], delay: 100 },
    { pct: 50, msg: messages[1], delay: 400 },
    { pct: 80, msg: messages[2], delay: 800 },
    { pct: 100, msg: messages[3], delay: 1200 }
  ];

  steps.forEach(({ pct, msg, delay }) => {
    setTimeout(() => setProgress(pct, msg), delay);
  });

  // Ocultar loader tras completar
  setTimeout(hide, 1800);

  // Safety: ocultar si la página ya cargó antes del timer
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!loader.classList.contains('hidden')) {
        setProgress(100, messages[3]);
        setTimeout(hide, 300);
      }
    }, 200);
  });
})();
