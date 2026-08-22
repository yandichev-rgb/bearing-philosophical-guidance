import { useEffect, useState } from "react";

const KEY = "bearing.inquiry.draft";

export type InquiryAnswers = {
  situation: string;
  tried: string;
  stakes: string;
  kind: string;
  duration: string;
};

export const emptyAnswers: InquiryAnswers = {
  situation: "",
  tried: "",
  stakes: "",
  kind: "",
  duration: "",
};

type Draft = { answers: InquiryAnswers; step: number; savedAt: string };

function read(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    const answers = { ...emptyAnswers, ...(parsed.answers ?? {}) };
    const written = [answers.situation, answers.tried, answers.stakes].some(
      (field) => field.trim().length > 0,
    );
    if (!written) return null;
    return {
      answers,
      step: typeof parsed.step === "number" ? parsed.step : 0,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
    };
  } catch {
    return null;
  }
}

export function clearInquiryDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}

/**
 * Keeps the in-progress inquiry in this browser so a visitor can close the
 * modal, leave, and come back to exactly what they had written.
 */
export function useInquiryDraft(
  answers: InquiryAnswers,
  step: number,
  options: { active: boolean },
) {
  const [restored, setRestored] = useState<Draft | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setRestored(read());
  }, []);

  useEffect(() => {
    if (!options.active) return;
    const written = [answers.situation, answers.tried, answers.stakes].some(
      (field) => field.trim().length > 0,
    );
    if (!written) return;
    const stamp = new Date().toISOString();
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ answers, step, savedAt: stamp }));
        setSavedAt(stamp);
      } catch {
        /* storage unavailable */
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [answers, step, options.active]);

  return {
    restored,
    savedAt,
    dismissRestored: () => setRestored(null),
    clear: () => {
      clearInquiryDraft();
      setSavedAt(null);
      setRestored(null);
    },
  };
}
