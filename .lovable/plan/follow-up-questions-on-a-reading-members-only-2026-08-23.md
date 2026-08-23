# Follow-up questions on a reading (members only)

Short answer: yes, this is worth building, but as a tightly bounded feature rather than an open chat. A reading that cannot be questioned feels like a verdict. One or two follow-ups turn it into counsel, which is exactly the difference between Bearing and generic advice. The risk is that an unlimited thread turns the product into a chatbot, which the brand explicitly rejects, and it makes cost per member unpredictable.

## The shape I recommend

- Members only. Free Aristotle readings stay single-shot, with the follow-up affordance visible but locked as another reason to join.
- Up to 3 follow-ups per reading. After that, the panel invites a fresh inquiry instead.
- Each follow-up returns a short, focused response in the same voice as the reading: no new five-part structure, just two or three tight paragraphs answering the question and, where useful, one revised practice.
- Presented as marginalia, not chat: stacked entries in the reading page under a heading like "Further questions", each with the question in italic display type and the answer in body serif. No bubbles, no avatars, no typing dots.
- The philosopher stays the same as the original reading, so the method stays consistent.

## User flow

1. Member opens a saved reading (or finishes a new one).
2. Below the reading: a single line prompt, "Ask a further question", with a text field and a submit control.
3. Answer appears beneath the reading. Counter shows how many follow-ups remain.
4. Non-members see the prompt with a lock note pointing to membership.

## Technical notes

- New table `reading_followups`: id, reading_id (FK to readings), user_id, question, answer, created_at. Owner-only RLS policies plus explicit GRANTs for authenticated and service_role, matching the existing tables.
- New server function `askFollowUp` in `src/lib/readings.functions.ts` with `requireSupabaseAuth`: verifies membership using the existing membership/subscription check, loads the reading and prior follow-ups, enforces the 3-per-reading cap server side, calls a new `generateFollowUpWithAI` in `src/lib/readings.server.ts`, logs into `ai_usage`, and respects the existing daily spend ceiling.
- Prompting reuses the philosopher profile plus shared voice rules, with the original inquiry, the reading, and prior follow-ups as context, and a rule to stay brief and never restate the five sections.
- UI additions: a `ReadingFollowUps.tsx` component used on the readings route and in the post-reading view inside `InquiryModal.tsx`.
- Membership copy gains one benefit line about asking further questions.

## Out of scope for now

Open-ended chat, switching philosophers mid-thread, follow-ups on the free reading, and voice or streaming output.
