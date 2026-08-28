ALTER TABLE public.readings
  ADD COLUMN IF NOT EXISTS tension text,
  ADD COLUMN IF NOT EXISTS method text,
  ADD COLUMN IF NOT EXISTS grounding text,
  ADD COLUMN IF NOT EXISTS challenge text,
  ADD COLUMN IF NOT EXISTS limits text,
  ADD COLUMN IF NOT EXISTS return_prompt text;