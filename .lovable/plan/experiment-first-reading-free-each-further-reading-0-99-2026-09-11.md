# Experiment: first reading free, each further reading $0.99

Small and reversible. Nothing changes inside a reading — every reading anyone receives is complete. What changes is how many readings are free.

## What the reader experiences

**First reading — free, exactly as today.** Same questions, same waiting screen, same complete reading: bearing, lens, better question, practice, when you return, sources, limits. No preview, no blur, no card, no checkout anywhere in it.

**At the end of that reading**, a quiet panel in the existing visual language:

- "Have another question?"
- "Your first reading was free. A second reading is $0.99."
- Button: "Get another reading — $0.99"
- Under it: "One-time purchase. No subscription."
- Below that, one restrained line: membership for ongoing access to all six approaches, unlimited readings, saved history and follow-up questions.

**Second and later readings.** The reader writes their new question as usual. When they ask for the reading, the page shows the $0.99 panel, headed "Ready for another question?" with "Your first Bearing was free. Your next reading is $0.99." Payment happens inline on the page using the payment setup already in the app (test mode). Once payment is confirmed the reading is generated and shown in full, with their question kept. Refreshing keeps that purchased reading. A cancelled or failed payment leaves the question intact, nothing marked as bought, and the button available to try again.

Wording never suggests unlocking or continuing a reading — each purchase is a new, whole reading.

**Members** are untouched: unlimited readings, saved history, follow-ups, and both plans ($8.99/month, $89.90/year) unchanged.

## Homepage

Unchanged, including "your first Aristotle reading is free" and "no account or card to begin". Only exact-count wording is corrected if any line implies more than one free reading.

## Technical notes

- **First-vs-later.** A new table `reading_entitlements` records, per visitor (the existing server-side visitor fingerprint) and per signed-in account, that the one free reading has been used. The decision is made server-side inside the reading server function, so refreshing, clearing browser storage, or editing client state cannot produce a second free reading. The current 3-per-day free allowance becomes one free reading. No account is forced.
- **Paid readings.** New table `reading_credits`: one row per $0.99 purchase, holding a random token, the payment session id, the environment, a status, and the generated reading once produced. The reading server function accepts a credit token and generates only when that credit is confirmed paid and unused; it then stores the reading on the credit so the reader can return to it. The token is kept in the browser, but it is only a pointer — authorisation is the server-side paid status.
- **Payment.** New one-time product `individual_reading` / price `individual_reading_once` at $0.99 USD, alongside the untouched membership products. Embedded checkout in one-time payment mode with the credit token in metadata. Confirmation comes from Stripe two ways: the existing webhook gains a completed-checkout branch, and the return path verifies the session server-side for instant access. No card data touches the app.
- **When the reading is generated.** Payment precedes generation for paid readings — the cleanest fit for the current architecture — and the panel states plainly that the first reading is free and the next is $0.99, so there is no ambiguity about what is being bought.
- **Analytics.** No analytics system exists, so add a minimal one: table `analytics_events` (event name, session id, optional user id, small non-sensitive JSON) plus a `track` server function. Events: `reading_started`, `reading_completed`, `first_reading_completed`, `second_reading_started`, `second_reading_paywall_viewed`, `second_reading_checkout_started`, `second_reading_purchase_completed`, `second_reading_purchase_failed`, `second_reading_unlocked`. Purchase events carry `product: individual_reading`, `price: 0.99`, `currency: USD`, `reading_number`, `reading_id`, session id. No situations, stakes or reading text is stored. Only confirmed payment counts as a purchase. No dashboard; events stay queryable for the four ratios you named.
- **Files touched:** `src/lib/readings.functions.ts`, `src/lib/ai-budget.server.ts` (entitlement logic), new `src/lib/reading-credits.functions.ts` and `src/lib/analytics.functions.ts`, `src/components/InquiryModal.tsx` (end-of-reading invitation and the paid-reading panel), new `src/components/AnotherReading.tsx`, `src/routes/api/public/payments/webhook.ts`, and one migration. Reading generation, prompts, sections and layout are not changed.
- **Assumptions:** purchases stay anonymous, tied to the stored credit token, keeping the low-friction path; clearing browser storage loses the pointer to a purchased reading unless signed in. Free-reading entitlement is per visitor fingerprint, so people sharing one network may occasionally share the free allowance.
