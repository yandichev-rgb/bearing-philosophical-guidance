-- One free reading per visitor / per account, decided server side.
CREATE TABLE public.reading_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_hash text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  free_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX reading_entitlements_visitor_key ON public.reading_entitlements(visitor_hash) WHERE visitor_hash IS NOT NULL;
CREATE UNIQUE INDEX reading_entitlements_user_key ON public.reading_entitlements(user_id) WHERE user_id IS NOT NULL;

GRANT ALL ON public.reading_entitlements TO service_role;
ALTER TABLE public.reading_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No client access to reading entitlements"
  ON public.reading_entitlements FOR SELECT TO authenticated USING (false);

-- One row per $0.99 purchase of a single complete reading.
CREATE TABLE public.reading_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  visitor_hash text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  stripe_session_id text,
  stripe_payment_intent_id text,
  environment text NOT NULL DEFAULT 'sandbox',
  status text NOT NULL DEFAULT 'pending',
  reading_number integer NOT NULL DEFAULT 2,
  philosopher_slug text,
  answers jsonb,
  reading jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reading_credits_session_idx ON public.reading_credits(stripe_session_id);
CREATE INDEX reading_credits_visitor_idx ON public.reading_credits(visitor_hash);

GRANT ALL ON public.reading_credits TO service_role;
ALTER TABLE public.reading_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No client access to reading credits"
  ON public.reading_credits FOR SELECT TO authenticated USING (false);

CREATE TRIGGER reading_credits_set_updated_at
  BEFORE UPDATE ON public.reading_credits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Minimal, non-sensitive experiment analytics.
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event text NOT NULL,
  session_id text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_event_idx ON public.analytics_events(event, created_at DESC);

GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No client access to analytics events"
  ON public.analytics_events FOR SELECT TO authenticated USING (false);