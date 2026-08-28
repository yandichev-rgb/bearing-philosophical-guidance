# Deepening the philosophical analysis

The current pipeline (`src/lib/readings.server.ts` + `src/lib/philosopher-profiles.server.ts`) generates a reading in a single pass with gemini-2.5-flash, one or two concepts, and a 350–500 word cap. Those are the four levers that bound depth today. Here is what can be done, roughly in order of impact per unit of effort.

## 1. Two-pass generation: draft, then adversarial critique (highest impact)

Add a second model call after the first draft:
- Pass 1 generates the reading as today.
- Pass 2 receives the draft plus the reader's intake and acts as the philosopher's own sharpest critic: "Attack this interpretation. What did it miss? What did it assume? What would this philosopher object to in it?"
- Pass 3 (or a single revise call) rewrites the reading incorporating the critique, keeping the same schema.

This is the standard way to get noticeably deeper output without touching anything else. Cost roughly triples per reading, so it pairs naturally with making deep mode a member-only feature or a per-reading "Go deeper" action.

## 2. Upgrade the model for generation

`READING_MODEL` is `google/gemini-2.5-flash`. Switching to `google/gemini-3.1-pro-preview` (or an OpenAI reasoning model via the Responses API) gives a clear quality jump on interpretive reasoning. This is a one-line change and can be combined with, or used as a cheap first step before, two-pass generation.

## 3. Loosen the constraints that cap depth

In `SHARED_RULES`:
- Raise the word budget from 350–500 to, say, 500–750 for a "deep reading" variant.
- Allow two or three concepts instead of one or two, with the rule that each must earn its place in the argument.
- Require a counter-reading field: one paragraph naming the strongest alternative interpretation and why it was set aside. This is the single most depth-adding structural field, and it fits the existing "Limits of this interpretation" slot naturally.

## 4. Per-philosopher depth upgrades

Each profile in `philosopher-profiles.server.ts` can be deepened with:
- A "first moves" section: the two or three diagnostic questions the method always asks of a situation, so the model runs them in order rather than improvising.
- A small worked-example fragment (one short abstract case, clearly marked as not reusable copy) so the model sees the target register of rigour.
- More granular source mapping (already done for Aristotle; extend to Plato, Jung, Nietzsche) so concepts are tied to specific passages the explanation can lean on.

## 5. Always-clarify for thin intake

Today clarifying questions trigger only when intake is judged vague. Raising that bar (or always asking one follow-up before the full reading) gives the model more concrete material, which is what depth mostly comes from.

## Recommendation

Do (2) first as a quick win, then (1) as the real step change, then (3) and (4) as refinement. Tell me which of these you want and I will plan the concrete edits for that subset — or approve this plan and I will implement 1–3, leaving per-philosopher profile deepening (4) as a follow-up.

## Technical notes

- Two-pass generation lives in `src/lib/readings.server.ts` (`generateReading`); the critique pass reuses the existing strict schema and validation.
- Any schema additions (e.g. `counterReading`) need a migration for a new `readings` column plus mapping in `readings.functions.ts` and `ReadingBody.tsx`.
- Cost: readings are already budget-guarded via `ai-budget.server.ts`; deeper readings will consume budget faster, so the member gating decision matters.
