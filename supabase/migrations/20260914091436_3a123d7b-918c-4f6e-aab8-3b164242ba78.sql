-- TODO (Fase 7): habilitar RLS y definir políticas para todas las tablas.
-- Por ahora las tablas quedan SIN RLS y sin acceso para anon/authenticated.

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text NOT NULL,
  birth_date date,
  birth_time time,
  birth_place text,
  credits_balance integer NOT NULL DEFAULT 0 CHECK (credits_balance >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL CHECK (credits > 0),
  price_usd numeric(10,2) NOT NULL CHECK (price_usd > 0),
  stripe_payment_link text,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id uuid REFERENCES public.credit_packages(id),
  amount_usd numeric(10,2) NOT NULL,
  credits_purchased integer NOT NULL,
  stripe_session_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('purchase','consumption','refund')),
  amount integer NOT NULL,
  reference_id uuid,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.study_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL CHECK (code IN ('carta_natal','sinastria','revolucion_solar')),
  name text NOT NULL,
  description text,
  credit_cost integer NOT NULL DEFAULT 5 CHECK (credit_cost > 0)
);

CREATE TABLE public.studies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  study_type_id uuid REFERENCES public.study_types(id),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  input_data jsonb NOT NULL,
  result_data jsonb,
  credits_spent integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.credit_packages TO service_role;
GRANT ALL ON public.purchases TO service_role;
GRANT ALL ON public.credit_transactions TO service_role;
GRANT ALL ON public.study_types TO service_role;
GRANT ALL ON public.studies TO service_role;

INSERT INTO public.credit_packages (name, credits, price_usd, stripe_payment_link, sort_order) VALUES
  ('Iniciación', 10, 10.00, 'https://buy.stripe.com/cNi4gzfxz02j59t0po2kw12', 1),
  ('Estándar', 20, 20.00, 'https://buy.stripe.com/cNi4gzfxz02j59t0po2kw12', 2),
  ('Premium', 50, 50.00, 'https://buy.stripe.com/cNi4gzfxz02j59t0po2kw12', 3);

INSERT INTO public.study_types (code, name, description, credit_cost) VALUES
  ('carta_natal', 'Carta astral', 'Conoce el mapa natal de una persona', 5),
  ('sinastria', 'Sinastría', 'Explora la conexión entre dos personas', 5),
  ('revolucion_solar', 'Revolución solar', 'Descubre la energía de un nuevo ciclo solar', 5);