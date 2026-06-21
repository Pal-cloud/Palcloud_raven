# 🪶 Palcloud Raven — Portfolio Personal

> Portfolio personal diseñado y construido con HTML5, CSS3 vanilla y JavaScript ES6+ puro.  
> Sin frameworks. Sin dependencias. Solo código limpio y rápido.

---

## ✨ Características

- **Diseño Mobile-First** — responsivo en todos los dispositivos
- **Tema oscuro/claro** — persiste la preferencia del usuario
- **Cursor personalizado** — animado con lerp suavizado
- **Canvas de partículas** — red neuronal interactiva en el hero
- **Typewriter effect** — palabras rotativas con velocidad natural
- **Intersection Observer** — reveals animados al hacer scroll
- **Tabs de skills** — con animación de barras de progreso
- **Filtrado de proyectos** — con transiciones fluidas
- **Contadores animados** — estadísticas con easing
- **Formulario validado** — con feedback en tiempo real
- **Accesibilidad** — ARIA, focus visible, reduced motion
- **Performance** — lazy loading, zero blocking scripts

---

## 📁 Estructura del proyecto

```
Palcloud_raven/
├── index.html                  # Estructura semántica HTML5
├── css/
│   ├── reset.css               # Normalización cross-browser
│   ├── variables.css           # Design tokens (colores, fuentes, spacing)
│   ├── main.css                # Estilos globales y secciones
│   ├── components.css          # Botones, formulario, cursor
│   ├── animations.css          # Keyframes y clases reveal
│   └── responsive.css          # Breakpoints mobile-first
├── js/
│   ├── utils.js                # Helpers reutilizables ($, debounce, lerp...)
│   ├── loader.js               # Pantalla de carga
│   ├── navbar.js               # Navegación + menú móvil
│   ├── cursor.js               # Cursor custom animado
│   ├── canvas.js               # Partículas hero (Canvas API)
│   ├── typewriter.js           # Efecto de escritura
│   ├── animations.js           # Intersection Observer reveals
│   ├── skills.js               # Tabs + barras de progreso
│   ├── projects.js             # Filtrado de proyectos
│   ├── counter.js              # Contadores animados
│   ├── form.js                 # Validación + envío formulario
│   ├── theme.js                # Toggle claro/oscuro
│   └── main.js                 # Init global
└── assets/
    └── images/
        ├── raven-logo.svg      # ← COLOCA TU LOGO AQUÍ
        ├── avatar.jpg          # ← COLOCA TU FOTO AQUÍ
        └── project-*.jpg      # ← CAPTURAS DE TUS PROYECTOS
```

---

## 🖼️ Cómo añadir tu logo (el cuervo)

1. Guarda tu logo en `assets/images/raven-logo.svg`
2. El logo aparece automáticamente en:
   - Pantalla de carga (loader)
   - Navbar
   - Badge de la foto (about)
   - Footer
3. Formatos aceptados: `.svg` (recomendado), `.png`, `.webp`
4. Si el archivo no existe, se muestra un fallback elegante

---

## 🎨 Personalización

### Colores
Edita las variables en `css/variables.css`:
```css
--accent:       #9b5de5;  /* Color principal (púrpura) */
--accent-light: #b87eff;  /* Variante clara */
--bg-primary:   #0a0a0f;  /* Fondo oscuro */
```

### Typewriter words
En `js/typewriter.js`:
```js
const words = ['Apasionado.', 'Innovador.', 'Full Stack.', ...];
```

### Skills y proyectos
Edita directamente el HTML en `index.html` —  
cada tarjeta está comentada y estructurada claramente.

---

## 📧 Conectar el formulario de contacto

En `js/form.js`, reemplaza `simulateSend()` con:

**Formspree (gratis):**
```js
await fetch('https://formspree.io/f/TU_ID', {
  method: 'POST',
  body: data,
  headers: { 'Accept': 'application/json' }
});
```

**EmailJS:**
```js
await emailjs.sendForm('SERVICE_ID', 'TEMPLATE_ID', form);
```

---

## 🚀 Deploy

Este portfolio es HTML estático — funciona en cualquier hosting:

- **GitHub Pages** — gratis, dominio `usuario.github.io`
- **Netlify** — drag & drop de la carpeta, dominio personalizado
- **Vercel** — similar a Netlify, excelente velocidad
- **Servidor propio** — Apache/Nginx, copia la carpeta

---

## 🛠️ Tecnologías demostradas

| Área | Tecnologías |
|------|-------------|
| Markup | HTML5 semántico, ARIA, Open Graph |
| Estilos | CSS Custom Properties, Grid, Flexbox, animations |
| Scripts | JavaScript ES6+, Canvas API, Intersection Observer, ResizeObserver |
| UX | Mobile-first, reduced-motion, lazy loading, focus management |
| Patrones | IIFE, módulos, Observer Pattern, Event-driven architecture |

---

*Construido con 🪶 y mucho café — Palcloud Raven 2026*
