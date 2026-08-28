import type { GeneratedReading } from "./reading-types";

/**
 * Maps a generated reading onto the fields the reading surface renders. Pure and
 * client safe. intakeEvidenceUsed is deliberately not carried across.
 */
export function toReadingView(reading: GeneratedReading) {
  return {
    headline: reading.title,
    noticed: reading.bearing,
    method: reading.throughLens,
    grounding: reading.citation,
    question: reading.betterQuestion,
    limits: reading.limitation,
    returnPrompt: reading.returnPrompt,
    alternativeReading: reading.alternativeReading,
    lensName: reading.lensName,
    conceptsUsed: reading.conceptsUsed,
    practiceTitle: reading.practice.title,
    practiceDuration: reading.practice.duration,
    practiceSteps: reading.practice.steps,
    whatToObserve: reading.practice.whatToObserve,
    sources: reading.sources,
    note: reading.note,
    // Retired sections. Kept empty so the surface never renders them again.
    assumption: "",
    principle: "",
    exercise: "",
    tension: "",
    challenge: "",
  };
}
