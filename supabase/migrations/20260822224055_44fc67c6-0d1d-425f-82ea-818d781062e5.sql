REVOKE INSERT, UPDATE, DELETE ON public.ai_usage FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.memberships FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated, anon;
GRANT SELECT ON public.ai_usage TO authenticated;
GRANT SELECT ON public.memberships TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.ai_usage TO service_role;
GRANT ALL ON public.memberships TO service_role;
GRANT ALL ON public.subscriptions TO service_role;

DROP POLICY IF EXISTS "No client writes to ai_usage" ON public.ai_usage;
CREATE POLICY "No client writes to ai_usage" ON public.ai_usage FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No client writes to memberships" ON public.memberships;
CREATE POLICY "No client writes to memberships" ON public.memberships FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "No client writes to subscriptions" ON public.subscriptions;
CREATE POLICY "No client writes to subscriptions" ON public.subscriptions FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);