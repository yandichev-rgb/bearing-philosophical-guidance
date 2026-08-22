CREATE TABLE public.ai_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  philosopher_slug text NOT NULL,
  model text NOT NULL,
  tier text NOT NULL DEFAULT 'free',
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  cost_usd numeric(10,6) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ai_usage TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own usage" ON public.ai_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX ai_usage_created_at_idx ON public.ai_usage (created_at DESC);

CREATE TABLE public.free_reading_quota (
  visitor_hash text NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  used integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (visitor_hash, day)
);
GRANT ALL ON public.free_reading_quota TO service_role;
ALTER TABLE public.free_reading_quota ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.claim_free_reading(_visitor_hash text, _daily_limit integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _used integer;
BEGIN
  INSERT INTO public.free_reading_quota (visitor_hash, used)
  VALUES (_visitor_hash, 1)
  ON CONFLICT (visitor_hash, day) DO UPDATE
    SET used = public.free_reading_quota.used + 1, updated_at = now()
    WHERE public.free_reading_quota.used < _daily_limit
  RETURNING used INTO _used;

  RETURN _used IS NOT NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_free_reading(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_free_reading(text, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.ai_spend_today()
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(cost_usd), 0)
  FROM public.ai_usage
  WHERE created_at >= date_trunc('day', now());
$$;
REVOKE ALL ON FUNCTION public.ai_spend_today() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ai_spend_today() TO service_role;