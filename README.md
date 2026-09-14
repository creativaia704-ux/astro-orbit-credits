# Cosmic Compass

Nuevo proyecto con Supabase habilitado.
FASE 1 DE 8 — FUNDACIÓN: MODELO DE DATOS + SISTEMA DE DISEÑO DARK-TECH

Vamos a construir "AstroCréditos", una web app de compra de créditos para generar estudios astrológicos (Carta Astral, sinastría, revolución solar, tránsitos, Carta numerológica). Esta fase SOLO cubre: migraciones SQL completas, seeds de datos, sistema de diseño (tokens) aplicado, y una landing pública estática de showcase. NO implementes autenticación, NO implementes compra real ni Stripe, NO generes estudios reales, NO actives RLS todavía (déjala pendiente, documentada como TODO).

BACKEND: Supabase (Postgres + Auth, se configurarán en fases posteriores).

ESQUEMA SQL A CREAR (con constraints exactos):

1. profiles

- id uuid PK, references auth.users(id) on delete cascade

- full_name text

- email text not null

- birth_date date

- birth_time time

- birth_place text

- credits_balance integer not null default 0 check (credits_balance >= 0)

- created_at timestamptz not null default now()

2. credit_packages

- id uuid PK default gen_random_uuid()

- name text not null

- credits integer not null check (credits > 0)

- price_usd numeric(10,2) not null check (price_usd > 0)

- stripe_payment_link text

- active boolean not null default true

- sort_order integer not null default 0

3. purchases

- id uuid PK default gen_random_uuid()

- user_id uuid references profiles(id) on delete cascade

- package_id uuid references credit_packages(id)

- amount_usd numeric(10,2) not null

- credits_purchased integer not null

- stripe_session_id text unique

- status text not null check (status in ('pending','completed','failed')) default 'pending'

- created_at timestamptz not null default now()

4. credit_transactions

- id uuid PK default gen_random_uuid()

- user_id uuid references profiles(id) on delete cascade

- type text not null check (type in ('purchase','consumption','refund'))

- amount integer not null

- reference_id uuid

- description text

- created_at timestamptz not null default now()

5. study_types

- id uuid PK default gen_random_uuid()

- code text unique not null check (code in ('carta_natal','sinastria','revolucion_solar'))

- name text not null

- description text

- credit_cost integer not null default 5 check (credit_cost > 0)

6. studies

- id uuid PK default gen_random_uuid()

- user_id uuid references profiles(id) on delete cascade

- study_type_id uuid references study_types(id)

- title text not null

- status text not null check (status in ('pending','completed','failed')) default 'pending'

- input_data jsonb not null

- result_data jsonb

- credits_spent integer not null

- created_at timestamptz not null default now()

SEEDS OBLIGATORIOS:

credit_packages (3 filas):

- "Iniciación", credits=10, price_usd=10.00, stripe_payment_link='https://buy.stripe.com/cNi4gzfxz02j59t0po2kw12', sort_order=1

- "Estándar", credits=20, price_usd=20.00, stripe_payment_link='https://buy.stripe.com/cNi4gzfxz02j59t0po2kw12', sort_order=2

- "Premium", credits=50, price_usd=50.00, stripe_payment_link='https://buy.stripe.com/cNi4gzfxz02j59t0po2kw12', sort_order=3

study_types (3 filas):

- code='carta_natal', name='Carta astral', description='Conoce el mapa natal de una persona', credit_cost=5

- code='sinastria', name='Sinastría', description='Explora la conexión entre dos personas', credit_cost=5

- code='revolucion_solar', name='Revolución solar', description='Descubre la energía de un nuevo ciclo solar', credit_cost=5

IMPORTANTE: deja un comentario TODO en el código señalando que RLS se implementará en la Fase 7 y que por ahora las tablas están sin políticas restrictivas (acceso solo desde backend/desarrollo).

SISTEMA DE DISEÑO — TOKENS DARK-TECH:

Colores (hex exactos):

- --bg-base: #0A0A0F

- --bg-surface: #12121A

- --bg-surface-elevated: #1A1A24

- --accent-primary: #00E5FF (cian eléctrico)

- --accent-secondary: #7C3AED (púrpura)

- --text-primary: #F5F5F7

- --text-secondary: #A1A1AA

- --color-success: #10B981

- --color-error: #EF4444

- --border-default: #2A2A35

Tipografía:

- Headings: "Space Grotesk", fallback sans-serif

- Body: "Inter", fallback sans-serif

- Escala: 12px, 14px, 16px (base), 18px, 24px, 32px, 48px

Radios: sm=8px, md=12px, lg=20px, full=9999px

Sombras: botón primario con glow `0 0 20px rgba(0,229,255,0.3)`; tarjetas con sombra suave `0 4px 24px rgba(0,0,0,0.4)`

Espaciado: escala base 4px (4,8,12,16,24,32,48,64)

Motion: transición estándar 200ms ease-out; hover en tarjetas con `scale(1.02)`; respetar que en fases futuras se añadirá `prefers-reduced-motion`

LANDING DE SHOWCASE (contenido estático, sin lógica de backend conectada):

Hero:

- Título: "Descubre lo que el cosmos tiene para ti"

- Subtítulo: "Genera tu carta astral, tu sinastría o tu revolución solar en minutos"

- Botón primario: "Crear cuenta gratis" (sin acción todavía, solo estilo)

Sección "¿Qué quieres crear hoy?" — 3 tarjetas con icono, título y descripción (usar los mismos textos de study_types):

1. Carta astral — "Conoce el mapa natal de una persona"

2. Sinastría — "Explora la conexión entre dos personas"

3. Revolución solar — "Descubre la energía de un nuevo ciclo solar"

Sección "Paquetes de créditos" — 3 tarjetas (usar los mismos datos de credit_packages):

- Iniciación: "10 créditos por 10 $"

- Estándar: "20 créditos por 20 $"

- Premium: "50 créditos por 50 $"

Nota visual bajo las tarjetas: "Cada estudio cuesta 5 créditos"

Footer simple: "AstroCréditos © 2024 · España"

NO TOCAR: no crees páginas de login/registro, no crees dashboard, no implementes ninguna llamada a Stripe, no actives RLS.

Al terminar, devuelve exactamente este bloque:

HANDOFF FASE 1

- Hecho: [qué construiste realmente]

- Tablas/columnas creadas o modificadas (tipos y constraints)

- Políticas RLS / Edge Functions / server functions activas (debe decir "ninguna, planificada para Fase 7")

- Rutas/pantallas nuevas

- Errores o warnings de build (estado de tsc/lint)

- Supuestos tomados o pendientes

- URL de preview con pasos para probar

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://astro-orbit-credits.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8ebabf01-1193-46b2-8e17-8e51bbeeb367).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
