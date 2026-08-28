# Fix the reading wait, and stop showing "we couldn't prepare" for a quota block

## What is actually happening

Two separate problems, both confirmed from the logs and the database.

1. **The generation itself is working.** Every recent pipeline run finished successfully in roughly 14–25 seconds (context check ~0.5s, analysis ~8s, writing ~7s) with zero validation failures. Nothing is timing out.

2. **Your last real attempts were blocked by the free-reading cap, not by a failure.** The free tier allows 3 readings per visitor per day, and this browser reached 3 today at 20:32 UTC. The cap is checked *after* the reading is generated, and the modal's failure screen ignores the real message and always prints "We couldn't prepare your reading." So a used-up daily allowance looks identical to a broken generator.

3. **There is no waiting state.** During the 15–25 second generation the modal stays on the last intake question and only the button label changes to "Preparing your reading" — so it reads as if nothing is happening, and then it appears to "give up".

## What I will change

### A real preparing screen
- While a reading is being prepared, the modal switches to its own centred "preparing" panel in the existing papyrus/serif style: the compass seal with a slow, quiet rotation (no spinners, no gradients), a heading such as "Preparing your reading", and staged reassurance lines that advance with the actual pipeline stages ("Reading your answers" → "Choosing the philosophical lens" → "Writing your reading"), plus a note that this usually takes 20–30 seconds.
- The intake answers stay untouched behind it; the panel cannot be dismissed by accident, and closing still preserves the draft.
- Respect reduced-motion preferences: the seal fades gently instead of rotating.
- The same panel is used when retrying and when continuing after clarifying questions.

### Check the free allowance before spending a call
- The free-reading allowance is checked *before* the pipeline runs, so an exhausted allowance no longer waits 25 seconds and no longer burns an AI call. The reading is still only counted once a real reading exists.

### Distinguish "out of free readings" from "generation failed"
- A quota block gets its own screen: "You've used today's free readings", the reset timing, and the actions "Join Bearing" (membership), "Edit my answers", "Return to the Lyceum" — no "Try again", since retrying cannot succeed today.
- A genuine generation failure keeps the existing wording and the Try again / Edit my answers / Return to the Lyceum actions.
- Any specific server message (safety boundary, daily service ceiling, membership) is shown as written instead of being replaced by the generic failure text.

## Technical notes

- `src/components/InquiryModal.tsx`: add an explicit view state (`intake | preparing | clarify | reading | quota | failed`) driven by the discriminated `ReadingResult`, render the new preparing panel and quota panel, and surface `result.message` in the failure view. `retryable` from the error result decides whether "Try again" is offered.
- `src/lib/readings.functions.ts`: move the free-tier allowance check ahead of `runReadingPipeline` (a non-consuming peek), keep `claimFreeReading` as the post-success consume, and return `{ kind: "quota" }` so the client can present it distinctly. Add a small read-only quota peek helper in `src/lib/ai-budget.server.ts`.
- `src/lib/reading-types.ts`: add the `quota` variant to `ReadingResult`.
- Stage progress in the preparing panel is client-side timed against measured stage durations — no extra requests, no streaming changes.
- Tests: extend `src/lib/readings.test.ts` for the pre-check returning the quota result without any model call, and for error results preserving their own message.

Unchanged: visual system, layout of the reading itself, auth, membership, Stripe, privacy behaviour, saving, follow-ups, and the pipeline's reasoning stages.
