# Mona Tatt — Sitio de reservas

Aplicación Next.js 15 + TypeScript + Tailwind para agendar sesiones de tatuaje
con un flujo público de reserva y un módulo administrativo.

Estado actual: **Fase 1 — scaffold, landing y flujo de reserva público**.
Autenticación admin, dashboard, agenda, configuración y correos reales vienen
en las Fases 2 y 3.

---

## Stack

- Next.js 15 (App Router) + TypeScript estricto
- Tailwind CSS con design tokens (`src/styles/design-tokens.css`)
- Radix UI primitives + componentes propios en `src/components/ui`
- Framer Motion para transiciones
- Zod + React Hook Form para validación
- Prisma (schema listo, migraciones pendientes de correr contra Postgres)
- Resend / Supabase Storage (integraciones pendientes — Fase 2)

## Requisitos

- Node.js ≥ 20
- pnpm o npm
- Postgres (local o Supabase) — opcional en Fase 1

## Instalación

```bash
npm install
cp .env.example .env        # edita con tus valores
```

### Correr en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Base de datos (Fase 2 en adelante)

```bash
npm run db:generate        # genera Prisma Client
npm run db:push            # aplica el schema a la DB
npm run db:seed            # crea admin, payment settings, matriz y precios
```

El seed crea:

- Admin con credenciales tomadas de `ADMIN_EMAIL` / `ADMIN_INITIAL_PASSWORD`.
- Payment settings default con los datos de transferencia.
- Matriz de horas y tabla de precios demo.
- 1 cliente y 1 booking `CONFIRMED` de ejemplo.

---

## Estructura

```
src/
  app/
    (public)/                # landing + flujo de reserva
      page.tsx               # landing
      reservar/page.tsx      # stepper de 5 pasos
      reserva-enviada/[id]/  # pantalla post-submit
    api/
      reservas/              # stub — crea reserva
      horario-especial/      # stub — solicitud fuera de agenda
    layout.tsx               # fuentes + metadata global
    globals.css              # import de tokens + tailwind
  components/
    ui/                      # primitives (Button, Input, Select, etc.)
    layout/                  # Navbar, Footer
    marketing/               # secciones de landing
    booking/                 # steps + context + modal horario especial
  lib/
    utils.ts                 # cn(), formatCLP, formatDateLong
    validations/booking.ts   # Zod schemas
    pricing/mock.ts          # estimador de precios y horas (fase 1)
    scheduling/mock.ts       # availability mockeada
  styles/design-tokens.css   # única fuente de verdad visual
prisma/
  schema.prisma
  seed.ts
```

## Diseño

Todo color, fuente y espaciado proviene de
[`src/styles/design-tokens.css`](src/styles/design-tokens.css). Si necesitas un
color nuevo, agrégalo ahí — nunca hardcodees hex dentro de componentes.

Ver notas de diseño en [`DESIGN_NOTES.md`](DESIGN_NOTES.md).

## Desplegar en Vercel

1. Crea un repo en GitHub (vacío, sin README).
2. Conecta este directorio al repo y pushea:

   ```bash
   git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
   git push -u origin main
   ```

3. En [vercel.com/new](https://vercel.com/new) importa el repo. Vercel detecta
   Next.js automáticamente (no hace falta tocar build command ni output).
4. Antes del primer deploy, agrega estas **variables de entorno** en Vercel
   (Settings → Environment Variables):

   | Variable | Requerida | Valor |
   |---|---|---|
   | `ADMIN_EMAIL` | sí | correo con el que entras al admin |
   | `ADMIN_INITIAL_PASSWORD` | sí | contraseña para el admin (larga, única) |
   | `NEXTAUTH_SECRET` | recomendada | `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | recomendada | URL del deploy (ej. `https://monatatt.vercel.app`) |
   | `DATABASE_URL` | opcional | solo cuando conectes DB en Fase 2 |
   | `RESEND_API_KEY` | opcional | solo cuando actives correos |

   ⚠️ **Importante**: si `ADMIN_EMAIL` o `ADMIN_INITIAL_PASSWORD` no están
   seteados, el endpoint de login rechaza cualquier intento (no hay fallback
   por defecto). Esto es intencional para evitar credenciales conocidas en
   producción.

5. Dale "Deploy". En 1-2 minutos tienes la URL pública.

## Siguiente fase

- Módulo 3: auth admin (NextAuth credenciales + middleware).
- Módulo 4: dashboard con banda de pendientes.
- Módulo 5: agenda semanal con panel lateral y acciones confirmar/rechazar.
- Conectar `/api/reservas` a Prisma + Resend.
- Cron para liberar slots `QUOTED` vencidos.
