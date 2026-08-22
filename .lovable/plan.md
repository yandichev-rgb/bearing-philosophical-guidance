# New Bearing logo: engraved compass rose

Replacing the current circular "B" seal with the first compass direction (Scholastic compass rose), with the center letter removed.

## The mark

A circular engraved instrument dial in oxblood on papyrus:

- Two outer hairlines: a solid bronze ring and an inner dotted oxblood ring.
- A four-point rose: a filled oxblood north needle, three slightly lighter needles for south, east, west.
- Four thin bronze hairlines on the diagonals as the ordinal points.
- Four small serif initials sitting on the cardinal points, reading as philosophers on the compass: P (Plato) north, A (Aristotle) east, K north is replaced only if needed, S (Seneca) south, E (Epictetus) west. Initials are drawn from the six philosophers already in the Lyceum, not from names outside the collection.
- Center: no letter. The needles converge on a small engraved pivot, a filled oxblood dot with a bronze hairline ring around it, so the eye reads a settled needle instead of a crowded letter.
- The bead at twelve o'clock is kept as a small filled dot on the outer ring, so the existing bead detail carries over.

Identity is carried by the BEARING wordmark next to the mark, in classical serif with wide letterspacing, exactly as now.

## Sizes

- Hero and large use: full rose with initials and diagonals.
- 36px nav: initials and diagonals drop out; only the outer ring, four needles, pivot, and twelve o'clock bead remain, so it stays crisp.
- 24px and favicon: outer ring, north needle, pivot dot only.

This is handled by a `detail` prop on the component, chosen automatically from `size`, so every existing usage keeps working without changes.

## Where it appears

The same `Seal` component is used across the nav, hero, footer, membership page, auth page, and modals, so replacing it updates every surface at once. The wordmark is untouched.

## Technical notes

- Rewrite `src/components/Seal.tsx` as an SVG on a 64 unit grid, keeping the current props (`size`, `className`, `tone`) plus an optional `detail` override, so the ink and papyrus tones on dark sections keep working.
- Colors continue to come from the existing tokens (`--color-ink`, `--color-papyrus`, `--color-bronze`, `--color-gold`); no new hex values.
- No text element in the center means no more font side bearing and baseline nudging, which is what made the old B hard to center.
- `public/og-bearing.jpg` and any favicon still show the old seal; I will note this and can regenerate them in a follow up if you want.

## Check before finishing

Render the mark at 220px, 36px, and 24px, screenshot each, and confirm the rose reads clearly and the pivot sits dead center at every size.
