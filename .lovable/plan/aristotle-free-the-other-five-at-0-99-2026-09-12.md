# Aristotle free, the other five at $0.99

Only Aristotle is offered without payment. The other five approaches always cost $0.99 for one complete reading. Membership is unchanged: members keep unlimited readings with every approach.

## What a reader experiences

**Aristotle.** Unchanged. "Get my free reading" on the homepage (top bar, hero, concern strip, membership panel) starts an Aristotle reading, free and complete, once per visitor. Nothing about that reading changes.

**The other five.** Their cards in the six-approach list are marked as paid rather than free. Opening one shows the same profile, but its button reads "Ask Nietzsche — $0.99" (the thinker's own name) instead of "Get my free reading". Choosing it opens the usual questions; when the reader asks for the reading, the existing $0.99 panel appears with wording for that thinker, payment happens inline, and the complete reading follows. A cancelled payment keeps the answers intact and the button available.

**Second Aristotle reading.** Still $0.99, exactly as today.

**After a reading.** "Examine this through another lens" / "Compare another lens" closes the reading and returns to the homepage scrolled to the six-approach list, rather than the top of the page.

**Free-reading wording.** Lines that promise a free reading stay only where Aristotle is what's being offered; the five paid approaches never carry that phrase.

## Technical notes

- The `free` flag already exists per approach in `src/data/philosophers.ts` (true for Aristotle only), so it drives the card badge and the profile button label — no data change needed.
- Server-side gate in `src/lib/reading-access.server.ts`: `resolveReadingAccess` gains the requested slug. Free access is granted only when the slug is `aristotle` and the visitor's one free reading is unused. Any other slug without a paid credit or membership returns payment-required. `src/lib/readings.functions.ts` passes the slug through and keeps returning `kind: "payment_required"` before any model call, so client state cannot bypass it.
- `READING_PAYMENT_MESSAGE` in `src/lib/reading-types.ts` becomes two messages: one for a further Aristotle reading (as today) and one for a locked approach ("Readings with <name> are $0.99 each…"). The server picks the right one; `ReadingPurchase.tsx` just renders it.
- `PhilosopherModal.tsx` already branches on `p.free` for its button text — the paid label becomes "Ask <name> — $0.99".
- Lyceum card badge in `src/components/Lyceum.tsx` shows "$0.99" for the paid five.
- "Another lens" actions in `InquiryModal.tsx` and `ReadingBody.tsx` close the reading and navigate to `/#lyceum`.
- Untouched: reading generation, prompts, sections, layout, membership products and pricing, auth, saved readings, follow-ups.
