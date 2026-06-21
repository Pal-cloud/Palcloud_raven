/**
 * navbar.js — Hamburger overlay fullscreen (siempre visible)
 */
'use strict';

(function initNavbar() {
  const { $, $$, throttle } = window.PalcloudUtils;

  const navbar      = $('#navbar');
  const hamburger   = $('#hamburger');
  const mobileMenu  = $('#mobile-menu');
  const navOverlay  = $('#nav-overlay');
  const navLinks    = $$('.navbar__link');
  const mobileLinks = $$('.mobile-menu__link');

  if (!navbar) return;

  // ── Scroll ──────────────────────────────────
  const onScroll = throttle(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  }, 80);
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Active link ──────────────────────────────
  const sections = $$('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 140;
    let current = '';
    sections.forEach((s) => { if (scrollY >= s.offsetTop) current = s.id; });

    navLinks.forEach((l) => l.classList.toggle('active', l.dataset.section === current));
    mobileLinks.forEach((l) => {
      const sec = l.dataset.menuSection || l.getAttribute('href')?.replace('#', '');
      l.classList.toggle('is-active', sec === current);
    });
  }

  // ── Toggle hamburger ────────────────────────
  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    navOverlay?.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => mobileMenu.querySelector('.mobile-menu__link')?.focus(), 120);
  }

  function closeMenu() {
    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    navOverlay?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
    });
    mobileLinks.forEach((l) => l.addEventListener('click', closeMenu));
    navOverlay?.addEventListener('click', closeMenu);
  }

  window._navCloseMenu = closeMenu;

  // ── Smooth scroll ────────────────────────────
  [...navLinks, ...mobileLinks].forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  updateActiveLink();
})();
