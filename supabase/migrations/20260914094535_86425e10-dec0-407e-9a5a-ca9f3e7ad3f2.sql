-- TODO (Fase 7): RLS sigue desactivada en todas las tablas; se activará con políticas
-- por usuario. Esta función es SECURITY DEFINER de forma intencional para operar de
-- forma atómica sobre profiles/studies/credit_transactions y quedará protegida en Fase 7.
CREATE OR REPLACE FUNCTION public.create_study_tx(
  _user_id uuid,
  _type_code text,
  _title text,
  _input jsonb,
  _result jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _type_id uuid;
  _cost integer;
  _updated integer;
  _study_id uuid;
  _balance integer;
BEGIN
  SELECT id, credit_cost INTO _type_id, _cost
  FROM public.study_types WHERE code = _type_code;

  IF _type_id IS NULL THEN
    RAISE EXCEPTION 'unknown_study_type';
  END IF;

  UPDATE public.profiles
  SET credits_balance = credits_balance - _cost
  WHERE id = _user_id AND credits_balance >= _cost
  RETURNING credits_balance INTO _balance;

  GET DIAGNOSTICS _updated = ROW_COUNT;
  IF _updated = 0 THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  INSERT INTO public.studies (user_id, study_type_id, title, status, input_data, credits_spent)
  VALUES (_user_id, _type_id, _title, 'pending', _input, _cost)
  RETURNING id INTO _study_id;

  INSERT INTO public.credit_transactions (user_id, type, amount, reference_id, description)
  VALUES (_user_id, 'consumption', -_cost, _study_id, 'Estudio: ' || _title);

  UPDATE public.studies
  SET status = 'completed', result_data = _result
  WHERE id = _study_id;

  RETURN jsonb_build_object(
    'study_id', _study_id,
    'credits_spent', _cost,
    'new_credits_balance', _balance
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_study_tx(uuid, text, text, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_study_tx(uuid, text, text, jsonb, jsonb) TO service_role;