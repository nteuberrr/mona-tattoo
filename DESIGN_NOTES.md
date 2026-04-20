# Design Notes — Mona Tatt

Este documento reemplaza el ritual de "5 iteraciones con screenshots"
propuesto originalmente. No tengo acceso a navegador ni Playwright en este
entorno, así que en lugar de medir contra `asyatattoo.com` con capturas,
documenté las decisiones visuales clave para que sea fácil auditarlas
abriendo el dev server.

## Referencia de estilo

- asyatattoo.com — minimalista, editorial, serif display grande, mucho
  whitespace, galería en grilla.

## Sistema

- **Tokens únicos** en `src/styles/design-tokens.css`. Todo componente
  referencia variables CSS vía Tailwind (`bg-ink`, `text-ink-soft`, etc.).
  Si alguien necesita un color que no existe, se agrega al token primero.

- **Tipografía**:
  - Display: `Fraunces` (vía `next/font/google`, pesos 300/400/500, cursiva
    soportada). Se usa para h1–h3 y clases `display-xl/lg/md`.
  - Body: `Inter`. Tamaño base 16px, line-height 1.6.
  - `eyebrow`: 12px, uppercase, tracking 0.18em — usado como etiqueta de
    sección arriba de cada display heading.

- **Botones** (todos vienen del mismo `Button` con CVA):
  - `primary`: fondo `ink`, texto `bg`, borde `ink`, altura 48px, uppercase,
    tracking 0.12em, hover opacidad 0.9.
  - `secondary`: outline 1px `ink`, mismo sizing, hover invierte.
  - `ghost`: sin borde, hover con `line/50`.
  - `link`: subrayado al hover, sin tracking.
  - `danger`: para rechazar reservas (Fase 2).

- **Inputs**: borde inferior 1px `line`, sin bordes laterales. Al foco el
  borde inferior pasa a 2px y color `ink` (estilo editorial).

- **Radios**:
  - `sm: 2px` / `md: 4px` / `lg: 8px`. No usar `rounded-full` excepto en
    swatches de color, puntos de radio y avatars pequeños.

- **Animaciones**: 200–700ms ease-out, sutiles. `framer-motion` solo con
  `initial/animate/whileInView` + `viewport={{ once: true }}` para no
  re-disparar. Nada de spring bouncy.

## Decisiones por sección

### Hero
- Altura 92vh para que respire. No ocupa 100vh porque se ve pesado en
  mobile — dejamos un pequeño vacío abajo con la label "Desliza para
  explorar".
- Display en 2 líneas con cursiva en "Tatt" y un `✦` gris como acento.
- Imagen lateral en aspect 3/4, ocupa 5/12 del grid. En mobile pasa abajo.
- Dos CTAs: primario "Quiero reservar" y secundario "Ver trabajos".

### Gallery
- Grilla 1/2/3 columnas (mobile/tablet/desktop).
- Algunas imágenes alternan aspect 4/5 y 3/4 para dar ritmo editorial, no
  todas iguales.
- Hover: scale sutil (1.05) en 700ms — más lento que típico para sentirse
  premium.
- Bordes cero. Solo la imagen y el bg `line/40` por si la imagen tarda.

### HowToBook
- Sección en `surface` con bordes verticales top/bottom para separar.
- 4 pasos con número display grande, borde top 1px y ritmo de 48px.

### About
- Split 5/7 columnas. Quote en display italic como "pull quote" editorial.

### Guidelines
- Dos columnas: "Antes de tu cita" y "Políticas". El ✦ reemplaza bullets.

### Pricing
- Sección invertida (ink background + bg text) para romper el flujo blanco
  hueso. Crea un corte editorial antes del FAQ.

### FAQ
- Radix Accordion. Trigger con ícono `Plus` que rota a ×. Pregunta en
  display serif 20–24px.

### Navbar
- Fixed top, transparente hasta scroll ≥ 8px, ahí se pone `bg/90 + blur`
  con borde inferior. CTA primario siempre visible en desktop.

### Footer
- 3 columnas: marca + descripción / navegación / contacto. Subline con
  volver-arriba.

## Flujo de reserva

- **Stepper sticky** debajo del navbar. Muestra progreso + paso actual
  textualmente. En desktop muestra los 5 pasos en línea, en mobile solo la
  barra.

- **Transición entre pasos**: framer-motion `AnimatePresence` con fade
  vertical de 12px, 350ms. Suficiente para dar sensación de movimiento sin
  marear.

- **Paso 2 (Tatuajes)**: cada tatuaje es una card con borde. El botón
  "Agregar otro" es `secondary` para no competir con el primary de "Continuar".

- **Swatches de color**: botones pills con círculo + label. El círculo del
  blanco tiene borde sutil para que se lea sobre fondo hueso.

- **Paso 3 (Horario)**: diseño como ribbon de días horizontal scrollable.
  El día activo se invierte (ink bg). Slots en grid de chips. Slots ocupados
  se ven tachados y muted — no ocultos, para que se sienta la ocupación.

- **Paso 4 (Cotización)**: 3 bloques separados por border `line`. El total
  en bloque invertido ink/bg para darle peso. Abono aparece como línea
  secundaria dentro del mismo bloque.

- **Paso 5 (Transferencia)**: bloque con borde ink completo (más peso que
  `line`) porque es la información crítica. Botones de copiar en cada
  campo para reducir fricción.

## Accesibilidad

- Focus visible custom (2px outline ink con offset 3px).
- Contrastes: `ink` sobre `bg` >= 16:1. `muted` sobre `bg` ~ 4.5:1 (límite
  AA — reservado para metadata).
- Labels explícitos en todos los inputs. aria-label en íconos-botón
  ("Quitar imagen", "Copiar").

## Pendientes de revisión visual

- Fuentes Fraunces/Inter se cargan vía next/font — si no corres con internet
  la primera vez, Next cachea y ya. Si falla, verificar variable CSS.
- Imágenes del hero y gallery son placeholders de Unsplash. Reemplazar por
  fotos reales (portfolio).
- Modo oscuro queda definido en tokens pero no expuesto como toggle todavía.
