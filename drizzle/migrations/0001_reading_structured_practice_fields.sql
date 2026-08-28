ALTER TABLE public.readings
  ADD COLUMN IF NOT EXISTS lens_name text,
  ADD COLUMN IF NOT EXISTS concepts_used text[],
  ADD COLUMN IF NOT EXISTS practice_title text,
  ADD COLUMN IF NOT EXISTS practice_duration text,
  ADD COLUMN IF NOT EXISTS practice_steps text[],
  ADD COLUMN IF NOT EXISTS what_to_observe text;