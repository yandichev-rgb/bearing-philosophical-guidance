/**
 * Shapes shared between the reading pipeline and the browser. Client safe: no
 * prompts, no profiles, no secrets. The server modules import these so the two
 * sides can never drift.
 */

export type Clarification = { question: string; answer: string };

export type ReadingAnswers = {
  situation: string;
  tried: string;
  stakes: string;
  kind?: string;
  duration?: string;
  clarifications?: Clarification[];
};

export type ReadingSource = { work: string; location: string };

export type GeneratedReading = {
  philosopherSlug: string;
  title: string;
  bearing: string;
  throughLens: string;
  conceptsUsed: string[];
  sources: ReadingSource[];
  betterQuestion: string;
  practice: {
    title: string;
    duration: string;
    steps: string[];
    whatToObserve: string;
  };
  alternativeReading: string;
  returnPrompt: string;
  limitation: string;
  /** Internal validation material. Never rendered. */
  intakeEvidenceUsed: string[];
  /** The single rendered citation line, built from the sources above. */
  citation: string;
  /** The named approach, for the lens heading. */
  lensName: string;
  /** The standing reflection notice shown under every reading. */
  note: string;
};

/** The explicit outcomes of a reading request. Never inferred from missing fields. */
export type ReadingResult =
  | { kind: "clarification"; questions: string[] }
  | { kind: "reading"; reading: GeneratedReading }
  | { kind: "safety"; message: string }
  | { kind: "quota"; message: string }
  /** A further reading, which needs one paid reading credit or a membership. */
  | { kind: "payment_required"; readingNumber: number; message: string }
  | { kind: "error"; message: string; retryable: boolean };

export const READING_ERROR_MESSAGE =
  "We couldn't prepare your reading. Your answers have been preserved. Please try again.";

export const READING_QUOTA_MESSAGE =
  "You have used today's free readings. Your answers have been preserved. Membership opens the full Lyceum, or you may return tomorrow.";

/** Shown when a reader asks a further question after their free Aristotle reading. */
export const READING_PAYMENT_MESSAGE =
  "Your Aristotle reading was free. Each further reading is $0.99, prepared in full, for this question alone.";

/** Shown when a reader chooses one of the five approaches that are not free. */
export function lockedReadingMessage(name: string): string {
  return `Readings with ${name} are $0.99 each, prepared in full, for this question alone. Aristotle remains free.`;
}


/** The price of one further reading, for display and for Stripe. */
export const SINGLE_READING = {
  priceId: "individual_reading_once",
  display: "$0.99",
} as const;


export const READING_SAFETY_MESSAGE =
  "What you have described asks for more than a philosophical reading can responsibly give. Bearing is for reflection, not for crisis support, medical, legal, or financial advice. If you are in danger or in crisis, please contact your local emergency services or a crisis line. You are welcome to bring a different question here.";
