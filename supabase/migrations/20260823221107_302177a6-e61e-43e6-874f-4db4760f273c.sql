CREATE TABLE public.reading_followups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reading_id UUID NOT NULL REFERENCES public.readings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.reading_followups TO authenticated;
GRANT ALL ON public.reading_followups TO service_role;

ALTER TABLE public.reading_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read their own follow ups" ON public.reading_followups
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users create their own follow ups" ON public.reading_followups
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX reading_followups_reading_idx ON public.reading_followups (reading_id, created_at);