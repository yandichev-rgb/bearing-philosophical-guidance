# Fix the "access denied" verification link

## What is happening

Her verification email is working correctly, but the link sends her back to the same address she signed up from. She signed up on the editor preview address (`id-preview--...lovable.app`), and that address is only viewable by your Lovable workspace. So the link lands on a Lovable access-denied page rather than Bearing.

Confirmed in the sign-up code: the confirmation link is built from whatever address the browser was on at sign-up time.

## The fix

1. Publish Bearing. Publishing creates a public address that anyone can open.
2. Send her the published address and have her sign up there. The verification link will then return her to Bearing itself.
3. Her existing pending account can either be confirmed by signing up again from the published site, or I can confirm her email directly on the backend so the account she already made works.

## Optional hardening

So this cannot happen again for anyone:

- Send verification links to a fixed public address instead of "whatever address the visitor happens to be on", falling back to the current address only in local development.
- After confirmation, land people on their readings page.

## Technical notes

- `src/routes/auth.tsx` sets `emailRedirectTo: ${window.location.origin}/readings`. On the preview host, `window.location.origin` is the gated preview domain.
- Hardening means resolving the redirect base from the published site URL (an environment value) with `window.location.origin` as a dev fallback, and confirming the published domain is present in the backend auth redirect allow list.
- No database schema changes. Nothing about content safety or account blocking is involved here.

## What I need from you

Confirm whether you want me to (a) just do the optional hardening now so you can publish and share, and/or (b) directly confirm her email address so her existing account works immediately.
