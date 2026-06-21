# 🪶 Palcloud Raven — Portfolio

> *Donde el código se convierte en arte.*

Portfolio personal de **Paloma (Pal-cloud)** — desarrolladora y diseñadora digital.  
Diseño editorial bohemio, oscuro y cálido, construido íntegramente con HTML, CSS y JavaScript vanilla.

🌐 **Demo:** [palcloudraven.dev](https://palcloudraven.dev) *(próximamente)*  
👤 **GitHub:** [github.com/Pal-cloud](https://github.com/Pal-cloud)

---

## ✨ Características

### Diseño
- Estética **editorial bohemia** — tipografía Cormorant Garamond + Space Mono
- Paleta oscuro-cálida: negros cálidos, oro antiguo y crema
- Layout tipo revista con grid asimétrico
- Grano de película SVG y efectos de profundidad
- Cursor personalizado animado
- Totalmente **responsive** — mobile first

### Experiencia de usuario
- **Menú hamburguesa** siempre visible con panel lateral overlay fullscreen
  - Links con numeración, descripción y barra animada
  - Overlay con blur de fondo
  - Indicador de sección activa sincronizado con el scroll
- **Loader** animado con barra de progreso
- **Reveals** de scroll con animaciones staggered
- **Cursor personalizado** con efecto magnético

### Audio
- 🌿 **Sonido ambiente** generativo — bosque + oleaje + grillos (Web Audio API pura)
- 🔊 **Control de volumen** con slider y botones `−` / `+` en la navbar
- 🎵 **Micro-sonidos de UI** en todos los elementos interactivos:
  - Hover: tick agudo suave
  - Click: tap percusivo orgánico
  - Abrir/cerrar menú: acorde ascendente/descendente
  - Éxito, error y notificación con timbres distintos
- Todo activado **solo tras gesto del usuario** (cumple política de autoplay)

### GitHub en tiempo real
- Datos cargados desde la **API pública de GitHub** (`api.github.com/users/Pal-cloud`)
- Gráfico de **actividad mensual** (área)
- Gráfico de **lenguajes** por bytes (donut con leyenda)
- Gráfico de **stats** (barras horizontales)
- **Cuadrícula de repos** reales — ordenados por estrellas y actividad reciente
- Badge 🟢 *en vivo* cuando la API responde correctamente
- Fallback a datos estáticos si hay error de red o rate-limit

### Toasts informativos
- Sistema de notificaciones emergentes propio (sin dependencias)
- Tipos: `info`, `success`, `warning`, `error`
- Auto-dismiss, botón de cierre, sonido asociado a cada tipo
- Toasts contextuales: bienvenida, GitHub cargado, formulario enviado

---

## 🗂 Estructura del proyecto

```
Palcloud_raven/
├── index.html
├── css/
│   ├── reset.css
│   ├── variables.css      ← tokens de diseño
│   ├── main.css           ← layout, navbar, menú, repos, volumen…
│   ├── components.css     ← botones, forms, cursor
│   ├── animations.css     ← keyframes y reveals
│   └── responsive.css     ← breakpoints
├── js/
│   ├── utils.js           ← helpers ($, $$, throttle…)
│   ├── loader.js          ← pantalla de carga
│   ├── navbar.js          ← hamburger overlay
│   ├── cursor.js          ← cursor personalizado
│   ├── canvas.js          ← partículas hero
│   ├── animations.js      ← IntersectionObserver reveals
│   ├── skills.js          ← tabs de habilidades + barras
│   ├── projects.js        ← filtro de proyectos
│   ├── counter.js         ← contadores animados
│   ├── form.js            ← validación y envío
│   ├── sound.js           ← ambiente forestal (Web Audio)
│   ├── ui-sounds.js       ← micro-sonidos + toasts + vol control
│   ├── github-charts.js   ← API GitHub + Chart.js + repos
│   └── main.js            ← inicialización global
└── assets/
    └── images/
        └── logo-pal.png   ← logo y favicon
```

---

## 🛠 Tecnologías

| Área | Tecnología |
|---|---|
| Estructura | HTML5 semántico |
| Estilos | CSS3 puro — custom properties, grid, clamp |
| Scripts | JavaScript ES2022 vanilla — sin frameworks |
| Gráficas | [Chart.js 4](https://www.chartjs.org/) vía CDN |
| Iconos | [Font Awesome 6](https://fontawesome.com/) vía CDN |
| Fuentes | Google Fonts — Cormorant Garamond + Space Mono |
| Audio | Web Audio API nativa |
| Datos | GitHub REST API pública |

---

## 🚀 Desarrollo local

```bash
# Clonar el repo
git clone https://github.com/Pal-cloud/Palcloud_raven.git
cd Palcloud_raven

# Cualquier servidor estático sirve — ejemplo con npx
npx live-server --port=5501
```

No hay dependencias npm — todo funciona directamente en el navegador.

---

## 📊 GitHub Stats (datos reales)

Los datos se cargan en tiempo real desde:
```
https://api.github.com/users/Pal-cloud
https://api.github.com/users/Pal-cloud/repos
```
La API pública permite 60 peticiones/hora sin autenticación.  
Si se alcanza el límite, el portfolio muestra datos de respaldo sin interrupciones.

---

## 🎨 Paleta de colores

| Token | Valor | Uso |
|---|---|---|
| `--bg-primary` | `#0d0b07` | Fondo principal |
| `--accent` | `#c9a84c` | Oro antiguo — acento |
| `--accent-light` | `#e8c96d` | Oro claro — hover |
| `--text-primary` | `#e8d5b7` | Texto principal |
| `--text-secondary` | `#8b7a65` | Texto secundario |

---

## 📝 Licencia

© 2026 Palcloud Raven — Todos los derechos reservados.

---

*Código que vuela · Diseño que perdura* 🪶
