REVOKE ALL ON FUNCTION public.claim_free_reading(text, integer) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.ai_spend_today() FROM anon, authenticated;

CREATE POLICY "No client access to free reading quota" ON public.free_reading_quota FOR SELECT TO authenticated USING (false);