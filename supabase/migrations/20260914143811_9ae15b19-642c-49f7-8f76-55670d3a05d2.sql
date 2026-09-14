-- RLS activada en Fase 7. Todas las escrituras sensibles (credits_balance,
-- purchases.status, studies, credit_transactions) quedan reservadas al rol de
-- servicio usado por las server functions y el webhook.

-- ---------- profiles ----------
REVOKE ALL ON public.profiles FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, birth_date, birth_time, birth_place) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ---------- credit_packages (catálogo público) ----------
REVOKE ALL ON public.credit_packages FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.credit_packages TO anon, authenticated;
GRANT ALL ON public.credit_packages TO service_role;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "packages_select_active_public" ON public.credit_packages
  FOR SELECT TO anon, authenticated USING (active = true);

-- ---------- study_types (catálogo público) ----------
REVOKE ALL ON public.study_types FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.study_types TO anon, authenticated;
GRANT ALL ON public.study_types TO service_role;
ALTER TABLE public.study_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "study_types_select_all_public" ON public.study_types
  FOR SELECT TO anon, authenticated USING (true);

-- ---------- purchases ----------
REVOKE ALL ON public.purchases FROM anon, authenticated, PUBLIC;
GRANT SELECT, INSERT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchases_select_own" ON public.purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "purchases_insert_own_pending" ON public.purchases
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- ---------- credit_transactions ----------
REVOKE ALL ON public.credit_transactions FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_select_own" ON public.credit_transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ---------- studies ----------
REVOKE ALL ON public.studies FROM anon, authenticated, PUBLIC;
GRANT SELECT ON public.studies TO authenticated;
GRANT ALL ON public.studies TO service_role;
ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "studies_select_own" ON public.studies
  FOR SELECT TO authenticated USING (auth.uid() = user_id);