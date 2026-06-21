/**
 * form.js — Validación y envío del formulario de contacto
 */
'use strict';

(function initForm() {
  const form        = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('submit-btn');
  const successMsg  = document.getElementById('form-success');

  if (!form) return;

  // ── Validadores ────────────────────────
  const validators = {
    name: (v) => {
      if (!v.trim()) return 'El nombre es obligatorio.';
      if (v.trim().length < 2) return 'Mínimo 2 caracteres.';
      return '';
    },
    email: (v) => {
      if (!v.trim()) return 'El email es obligatorio.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Introduce un email válido.';
      return '';
    },
    message: (v) => {
      if (!v.trim()) return 'El mensaje es obligatorio.';
      if (v.trim().length < 10) return 'Mínimo 10 caracteres.';
      return '';
    }
  };

  // ── Validar campo individual ───────────
  function validateField(name, value) {
    const validator = validators[name];
    if (!validator) return '';
    const error = validator(value);
    const input  = form.querySelector(`[name="${name}"]`);
    const errEl  = document.getElementById(`${name}-error`);

    if (input) {
      input.classList.toggle('invalid', !!error);
      input.classList.toggle('valid', !error && value.trim() !== '');
    }
    if (errEl) errEl.textContent = error;
    return error;
  }

  // ── Validación en tiempo real (blur) ───
  ['name', 'email', 'message'].forEach((fieldName) => {
    const input = form.querySelector(`[name="${fieldName}"]`);
    if (!input) return;

    input.addEventListener('blur', () => validateField(fieldName, input.value));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) {
        validateField(fieldName, input.value);
      }
    });
  });

  // ── Submit ─────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const fields = ['name', 'email', 'message'];

    // Validar todos los campos
    const errors = fields.map((f) => validateField(f, data.get(f) || ''));
    const hasErrors = errors.some(Boolean);

    if (hasErrors) {
      // Focus en el primer campo con error
      const firstError = form.querySelector('.invalid');
      firstError?.focus();
      return;
    }

    // Estado de carga
    submitBtn.classList.add('btn--loading');
    submitBtn.disabled = true;

    try {
      /**
       * Aquí conectas con tu servicio de email:
       * - Formspree: fetch('https://formspree.io/f/YOUR_ID', { method:'POST', body: data })
       * - EmailJS, Netlify Forms, etc.
       */
      await simulateSend();

      // Éxito
      form.reset();
      fields.forEach((f) => {
        const input = form.querySelector(`[name="${f}"]`);
        input?.classList.remove('valid', 'invalid');
      });

      if (successMsg) {
        successMsg.textContent = '¡Mensaje enviado! Te responderé en menos de 24h. 🪶';
        successMsg.classList.add('show');
        setTimeout(() => successMsg.classList.remove('show'), 6000);
      }

    } catch (err) {
      console.error('Error al enviar el formulario:', err);
      if (successMsg) {
        successMsg.textContent = 'Error al enviar. Escríbeme directamente a hola@palcloudraven.dev';
        successMsg.style.borderColor = 'var(--error)';
        successMsg.style.color = 'var(--error)';
        successMsg.style.background = 'rgba(239,68,68,0.1)';
        successMsg.classList.add('show');
      }
    } finally {
      submitBtn.classList.remove('btn--loading');
      submitBtn.disabled = false;
    }
  });

  // ── Simulación de envío (reemplaza con fetch real) ──
  function simulateSend() {
    return new Promise((resolve) => setTimeout(resolve, 1500));
  }
})();
