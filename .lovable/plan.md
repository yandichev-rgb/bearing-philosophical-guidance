# Replace cryptic "Fol." register marks with plain page labels

## Goal

The "Fol." register marks (Fol. I · Entry, Fol. II · Membership, etc.) rely on an
obscure manuscript reference that most visitors won't parse. Keep the archival
Roman-study styling — the letter-spaced small-caps look reads as deliberate and
elegant — but replace the cryptic abbreviation with plain, recognizable labels
so the header communicates instantly without the reader needing to decode it.

## What changes

The `folio` utility class stays (it is purely presentational). Only the label
text changes. The uppercase letter-spaced styling, Oxblood/Dark Lyceum palette,
and decorative hairline are untouched, so the pages keep their private-study
character.

### 1. Page header register marks (`src/components/PageFrame.tsx` callers)

Replace the `folio="Fol. I · Entry"` style values with plain labels in the five
routes that pass a `folio` prop:

- `src/routes/auth.tsx` — `Fol. I · Entry`  →  `Entry`
- `src/routes/membership.tsx` — `Fol. II · Membership`  →  `Membership`
- `src/routes/membership.return.tsx` — `Fol. II · Membership`  →  `Membership`
- `src/routes/readings.tsx` — `Fol. III · Your readings`  →  `Your readings`
- `src/routes/privacy.tsx` — `Fol. IV · Privacy`  →  `Privacy`

The `folio` utility class is retained on each `span`, so the typography is
unchanged; only the wording drops the unexplained "Fol." abbreviation. The
`PageFrame.tsx` prop and doc comment stay as-is (the prop remains a small
register label).

### 2. Specimen panel progress mark (`src/components/SpecimenPanel.tsx`)

`Fol. {index + 1} / {specimens.length}` is a "which reading of how many"
indicator. Replace with an equally clear count that needs no glossary:

- `Fol. 1 / 3`  →  `1 of 3`

Keeps the same `folio` span styling.

### 3. Sample reading (`src/components/SampleReading.tsx`)

- Footer `Bearing · Sample reading` is already self-explanatory — no change.
- The header `{current.margin}` values are already plain theme labels
  ("Habit", "Belief", "Control") — no change.

## Out of scope

- No change to the `folio` utility in `src/styles.css` (visual treatment is fine).
- No changes to the compass logo, palette, or other archive motifs (those read
  as design, not unexplained abbreviations).
