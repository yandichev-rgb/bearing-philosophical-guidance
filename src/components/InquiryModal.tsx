import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Modal } from "./Modal";
import { Seal, Wordmark } from "./Seal";
import { useAuth } from "@/hooks/useAuth";
import { generateFreeReading, saveReading } from "@/lib/readings.functions";

type Reading = {
  philosopherSlug: string;
  headline: string;
  noticed: string;
  assumption: string;
  principle: string;
  exercise: string;
  question: string;
  note: string;
};

const questions = [
  {
    key: "situation" as const,
    title: "What's on your mind?",
    help: "Describe the decision, pattern, relationship, or worry you want to think through.",
    placeholder:
      "Work is going well, but I am not sure the life around it still feels like mine…",
  },
  {
    key: "tried" as const,
    title: "What have you tried so far?",
    help: "Tell us what you did and why it did not settle the issue.",
    placeholder: "I tried taking time off and setting better boundaries, but…",
  },
  {
    key: "stakes" as const,
    title: "What feels at stake?",
    help: "What are you afraid you could lose, disappoint, or get wrong?",
    placeholder: "If I change course, I worry that…",
  },
];

const PROTOTYPE: Reading = {
  philosopherSlug: "aristotle",
  headline: "Aristotle would start with your habits.",
  noticed:
    "Your answer points to a gap between what you say matters and what your week rewards. Aristotle would not start by looking for a perfect decision. He would look for the smallest action you could repeat until it becomes part of your character.",
  assumption: "That the right decision has to arrive before the right routine can.",
  principle: "Character is built by repeated action, judged by the right measure for this moment.",
  exercise:
    "Notice each moment when your actions and stated priorities split. Write down what you chose and why. Look for the pattern before you try to fix it.",
  question: "What habit is this choice building?",
  note: "This reading interprets your situation through Aristotle's ideas. It is for reflection, not clinical, legal, medical, or financial advice.",
};

export function InquiryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ situation: "", tried: "", stakes: "" });
  const [reading, setReading] = useState<Reading | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { session } = useAuth();
  const generate = useServerFn(generateFreeReading);
  const save = useServerFn(saveReading);

  if (!open) return null;

  const isResult = reading !== null;
  const current = questions[step]!;
  const value = answers[current?.key ?? "situation"];

  const close = () => {
    onClose();
    setStep(0);
    setReading(null);
    setSaved(false);
    setError(null);
  };

  const advance = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = (await generate({ data: answers })) as Reading;
      setReading(result);
    } catch {
      setError("The reading could not be prepared right now. Here is the sample reading instead.");
      setReading(PROTOTYPE);
    } finally {
      setPending(false);
    }
  };

  const persist = async () => {
    if (!reading) return;
    setError(null);
    try {
      await save({ data: { answers, reading } });
      setSaved(true);
    } catch {
      setError("Your reading could not be saved. Try again in a moment.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      labelledBy="inquiry-title"
      className="min-h-screen max-w-3xl sm:min-h-0"
    >
      <div className="flex items-center justify-between gap-4 border-b border-ink/25 px-5 py-4 sm:px-9">
        <div className="flex min-w-0 items-center gap-3">
          <Seal size={30} className="shrink-0" />
          <Wordmark />
        </div>
        <button type="button" onClick={close} className="label text-ink hover:text-oxblood">
          Close <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="h-[3px] w-full bg-ink/15">
        <div
          className="h-full bg-oxblood transition-[width] duration-300"
          style={{ width: isResult ? "100%" : `${((step + 0.4) / questions.length) * 100}%` }}
        />
      </div>

      <div className="px-5 py-10 sm:px-9 sm:py-14">
        {isResult ? (
          <div>
            <p className="label text-oxblood">Your reading · Aristotle</p>
            <h2 id="inquiry-title" className="display-lg mt-6 text-ink">
              {reading.headline}
            </h2>

            <p className="mt-7 leading-relaxed text-ink-soft">{reading.noticed}</p>

            <div className="mt-9 grid gap-px border border-ink/25 bg-ink/25 sm:grid-cols-2">
              <div className="bg-papyrus-light/70 p-6">
                <p className="label text-ink-soft">The assumption to question</p>
                <p className="mt-3 leading-relaxed text-ink">{reading.assumption}</p>
              </div>
              <div className="bg-papyrus-light/70 p-6">
                <p className="label text-ink-soft">The principle that applies</p>
                <p className="mt-3 leading-relaxed text-ink">{reading.principle}</p>
              </div>
            </div>

            <div className="mt-6 border border-ink/25 bg-papyrus-light/60 p-6">
              <p className="label text-ink-soft">Practice</p>
              <p className="mt-3 leading-relaxed text-ink">{reading.exercise}</p>
            </div>

            <div className="mt-6 border border-ink/25 p-6">
              <p className="label text-oxblood">The question to sit with</p>
              <p className="mt-3 text-lg italic text-ink">{reading.question}</p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              {session ? (
                <button type="button" className="btn-ink" onClick={persist} disabled={saved}>
                  {saved ? "Saved" : "Save this reading"}
                </button>
              ) : (
                <Link to="/auth" className="btn-ink">
                  Save this reading
                </Link>
              )}
              <button type="button" onClick={() => setReading(null)} className="link-underline">
                Back
              </button>
            </div>

            {saved ? (
              <p className="label mt-6 text-oxblood" role="status">
                Saved.{" "}
                <Link to="/readings" className="link-underline">
                  View your readings
                </Link>
              </p>
            ) : null}
            {!session ? (
              <p className="label mt-6 text-ink-soft">
                Sign in to keep this reading. No card required.
              </p>
            ) : null}
            {error ? (
              <p className="mt-5 text-sm text-oxblood" role="status">
                {error}
              </p>
            ) : null}

            <p className="mt-10 border-t border-ink/20 pt-5 text-sm leading-relaxed text-ink-soft">
              {reading.note}
            </p>
          </div>
        ) : (
          <div>
            <p className="label text-ink-soft">
              Question {step + 1} of {questions.length}
            </p>
            <h2 id="inquiry-title" className="display-lg mt-6 text-ink">
              {current.title}
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">{current.help}</p>

            <label className="mt-8 block">
              <span className="sr-only">{current.title}</span>
              <textarea
                value={value}
                onChange={(event) =>
                  setAnswers({ ...answers, [current.key]: event.target.value })
                }
                placeholder={current.placeholder}
                rows={7}
                className="w-full border border-ink/40 bg-papyrus-light/70 p-5 text-lg leading-relaxed text-ink placeholder:text-ink-soft/60"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </label>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button
                type="button"
                className="btn-ink"
                disabled={value.trim().length === 0 || pending}
                onClick={advance}
                style={
                  value.trim().length === 0 || pending ? { opacity: 0.45 } : undefined
                }
              >
                {pending
                  ? "Preparing your reading"
                  : step === questions.length - 1
                    ? "See my reading"
                    : "Continue"}{" "}
                <span aria-hidden="true">→</span>
              </button>
              {step > 0 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="link-underline">
                  Back
                </button>
              ) : null}
            </div>

            {error ? (
              <p className="mt-5 text-sm text-oxblood" role="status">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </Modal>
  );
}
