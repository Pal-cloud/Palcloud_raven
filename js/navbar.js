/**
 * navbar.js — Comportamiento de la barra de navegación
 */
'use strict';

(function initNavbar() {
  const { $, $$, throttle } = window.PalcloudUtils;

  const navbar      = $('#navbar');
  const hamburger   = $('#hamburger');
  const mobileMenu  = $('#mobile-menu');
  const navLinks    = $$('.navbar__link');
  const mobileLinks = $$('.mobile-menu__link');

  if (!navbar) return;

  // ── Scroll: añadir clase scrolled ──────────
  const onScroll = throttle(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveLink();
  }, 80);

  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Active link por sección visible ────────
  const sections = $$('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 120;
    let current = '';

    sections.forEach((section) => {
      if (scrollY >= section.offsetTop) {
        current = section.id;
      }
    });

    navLinks.forEach((link) => {
      const isActive = link.dataset.section === current;
      link.classList.toggle('active', isActive);
    });
  }

  // ── Hamburger / Mobile menu ─────────────
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cerrar al hacer click en un link del menú móvil
    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) closeMenu();
    });
  }

  function closeMenu() {
    hamburger?.classList.remove('open');
    mobileMenu?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    mobileMenu?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // ── Smooth scroll para links internos ──────
  const allNavLinks = [...navLinks, ...mobileLinks];

  allNavLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Inicial
  updateActiveLink();
})();
