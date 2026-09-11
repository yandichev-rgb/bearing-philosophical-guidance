# Experiment: $0.99 for one full reading

A small, reversible test. The reading is generated first, a substantial free preview is shown, then a quiet paywall in Bearing's own voice unlocks the rest for a one-time $0.99.

## What changes for the reader

1. They answer the questions exactly as today and wait through the same preparing screen.
2. They see: their own situation, the personal **Bearing** section, and **A better question**.
3Beneath that, a continuation panel: "Your reading continues." with one button, "Read the full reading — $0.99", and the line "One-time purchase. No subscription."
4. Payment happens inline on the page (same payment setup as membership, still in test mode).
5. On success the full reading appears in place — same page, same reading, nothing to redo — with a short confirmation that it is unlocked. Refreshing keeps access.
6. After they have read it, one quiet line offers membership as the ongoing option ("Want to examine this from another angle?").

Signed-in members are unaffected: they keep full readings, saved history, follow-ups, and both membership plans.

Cancelled or failed payment leaves the preview and the button in place, and nothing is marked as bought.

## Homepage

Unchanged positioning ("first Aristotle reading is free", "no account or card to begin"). Only the wording of one line adjusts if needed so it matches the preview-then-continue flow.

## Technical notes

- **Storage of the reading.** New table `single_readings` holding the generated reading, a random unlock token, a `paid` flag and the payment session id. Reachable only by the server (no client policies, service-role plus server functions).
- **Preview vs. protected content.** `generateFreeReading` stores the full reading server-side and returns only the preview fields (title, bearing, better question) plus `readingId` and `unlockToken`. The remaining sections never reach the browser before payment, so page inspection or client state cannot reveal them.
- **Unlock.** New server function `getPurchasedReading({ readingId, unlockToken })` returns the full reading only when the row is paid (or the caller is an active member). The browser keeps `readingId`/`unlockToken` in local storage so a refresh restores access.
- **Payment.** New one-time product `single_reading` / price `single_reading_once` at $0.99 USD, created alongside the untouched membership products. Embedded checkout in `mode: "payment"` with `readingId` in metadata. Unlock is confirmed two ways: the existing webhook gains a `checkout.session.completed` branch, and the return path verifies the session server-side (`payment_status === "paid"`) for instant access.
- **Analytics.** No analytics system exists, so add a minimal one: table `analytics_events` (event, session id, optional user id, non-sensitive JSON props) plus a `track` server function. Events: `reading_started`, `reading_completed`, `reading_preview_viewed`, `paywall_viewed`, `unlock_clicked`, `checkout_started`, `purchase_completed`, `purchase_failed`, `full_reading_unlocked`. Purchase events carry `product: single_reading`, `price: 0.99`, `currency: USD`, `reading_id`. No situations, stakes or reading text is recorded. Conversion counts only on confirmed payment. No dashboard; the events are queryable.
- **Files touched:** `src/lib/readings.functions.ts`, `src/lib/readings.server.ts` (storage helper only), new `src/lib/single-reading.functions.ts`, `src/lib/analytics.functions.ts`, `src/components/InquiryModal.tsx`, `src/components/ReadingBody.tsx` (a `preview` mode flag), new `src/components/ReadingPaywall.tsx`, `src/routes/api/public/payments/webhook.ts`, one migration.
- **Assumptions:** the $0.99 purchase stays anonymous (no account required), tied to the browser's stored token, matching the low-friction acquisition path; clearing browser storage loses the link unless signed in.
