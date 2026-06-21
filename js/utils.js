/**
 * utils.js — Funciones de utilidad reutilizables
 */
'use strict';

/**
 * Selector helper: retorna un elemento o lista
 * @param {string} selector
 * @param {Document|Element} context
 * @returns {Element|null}
 */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/**
 * Clamp numérico
 */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Lerp (linear interpolation)
 */
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Debounce
 */
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle
 */
const throttle = (fn, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};

/**
 * Detecta si el dispositivo soporta hover (no es touch-only)
 */
const supportsHover = () => window.matchMedia('(hover: hover)').matches;

/**
 * Detecta preferencia de reducción de movimiento
 */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Formatea número con separador de miles
 */
const formatNumber = (n) => n.toLocaleString('es-ES');

/**
 * Exporta al scope global para que otros scripts puedan usarlo
 */
window.PalcloudUtils = {
  $, $$, clamp, lerp, debounce, throttle,
  supportsHover, prefersReducedMotion, formatNumber
};
