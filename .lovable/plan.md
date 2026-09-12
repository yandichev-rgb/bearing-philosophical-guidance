# Verify all six philosophers produce their own readings

## Goal
Confirm that selecting any of the six thinkers — Aristotle, Socrates, Marcus Aurelius, Plato, Nietzsche, Carl Jung — produces a reading in that thinker's lens, not a fallback Aristotle reading.

## Steps
1. Drive the preview with Playwright. For each of the six philosophers: select the thinker, submit a substantive intake, and wait for the result (generation takes ~15–25s each).
2. For each result, confirm the reading's `philosopherSlug` and displayed thinker name match the selection, and the content reflects that thinker's concepts (e.g. Jung uses analytical-psychology language, Nietzsche genealogy, etc.).
3. Note: only the first reading per browser is free — subsequent ones hit the $0.99 paywall. Work around this by clearing the visitor id in localStorage between runs (test-only; does not change app behavior) or by invoking the server function directly with distinct visitor ids.
4. Report a per-philosopher pass/fail summary. If any thinker fails, diagnose and fix before reporting.

## Out of scope
- No copy or design changes.
- No changes to pricing or the paywall behavior.

## Technical details
- `src/lib/readings.functions.ts` — `generateFreeReading` accepts `philosopherSlug` + `visitorId`.
- `src/lib/philosopher-profiles.server.ts` — six profiles; validation via `isProfileSlug`/`isRetiredSlug`.
- Verification via Playwright script under `/tmp/browser/`, viewport 1280x1800, screenshots per thinker.
