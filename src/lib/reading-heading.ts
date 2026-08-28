/**
 * Heading text for a reading. The philosopher is named here so the reading body
 * can speak directly to the reader without third person framing.
 */
const HEADINGS: Record<string, string> = {
  aristotle: "An Aristotelian Reading",
  socrates: "A Socratic Reading",
  plato: "A Platonic Reading",
  "marcus-aurelius": "Through Marcus Aurelius",
  "carl-jung": "Through Jung",
  nietzsche: "Through Nietzsche",
  seneca: "Through Seneca",
};

export function readingHeading(slug: string): string {
  return HEADINGS[slug] ?? "Your reading";
}
