# Refining the inquiry questions

## What Bearing asks today

Three required open text questions, one per screen:

1. What's on your mind? (situation)
2. What have you tried so far? (tried)
3. What feels at stake? (stakes)

All three are passed to the reading prompt as free text. `tried` and `stakes` are already optional on the server (they default to empty), but the interface presents them as required-feeling steps.

## What the research says about adding more

Form data is consistent on one point: typed fields, not steps, drive abandonment. Reported completion holds near 23 percent at three fields, slips to about 17 percent at five, and collapses near 11 percent at seven. Splitting fields across screens recovers only about 14 percent of that loss. Open-ended text costs several times more effort than a tap, so a fourth and fifth essay box would measurably cut readings started to readings finished, which is the top of Bearing's membership funnel.

Conclusion: do not add more typing. Add signal that costs a tap.

## Is three answers enough for a real philosophical reading?

Mostly, with two real gaps. The current three give the situation, the attempted remedies, and the felt risk. A philosopher's method also needs:

- The direction the person actually wants, so the reading can name the gap between stated value and practice rather than guess at it.
- Whether the matter is a single decision, a repeating pattern, or a relationship, since Aristotle on habit, Marcus on control, and Plato on desire each apply differently.

Without these, readings drift toward generic character advice. Both can be captured without a new essay box.

## The change

Keep three typed questions. Sharpen their wording, make the optional ones visibly optional, and add tap-only context.

1. Question 1 stays required and becomes: "What are you turning over?" with a short prompt line naming decision, pattern, relationship, or worry.
2. Directly under question 1, add a single row of tap chips: "Is this a decision to make, a pattern that repeats, a relationship, or a fear you keep meeting?" One tap, no typing.
3. Question 2 becomes "What have you already tried, and why did it not settle?" and is labeled Optional, with a Skip control.
4. Question 3 becomes "What do you stand to lose, and what would a good outcome look like?" This merges the stakes question with the missing desired-direction signal in one box, still one field. Also optional with Skip.
5. Add a second tap row on the last step: "How long has this been with you?" (days, months, years). One tap, sharpens the habit-versus-crisis reading.

Net effect: same three text fields, two extra taps, two new analytic dimensions for the prompt.

## Technical notes

- `src/components/InquiryModal.tsx`: extend the `questions` array with `optional` and `chips` metadata, render a chip row when present, add a Skip button when `optional` is true, and hold the two new values (`kind`, `duration`) in the existing `answers` state.
- `src/lib/readings.functions.ts`: add `kind` and `duration` to the Zod input schema as optional enums, and pass them through both the free and member paths.
- `src/lib/readings.server.ts`: add the two values to the prompt block and instruct the model to use `kind` to select the emphasis (habit, judgment, desire, control) and `duration` to judge whether to treat it as a formed pattern or a fresh disturbance. Also instruct it to use the stated good outcome as the measure the reading tests against.
- `src/lib/philosopher-profiles.server.ts`: no change to the voice rules; the section headings and direct address stay as they are.
- Persisted inquiries: store the two new values alongside the existing answers so saved readings remain reproducible.

## Not doing

- No fourth or fifth text box.
- No sliders or scored self-assessment, which would read as a self help app rather than a philosophical publication.
