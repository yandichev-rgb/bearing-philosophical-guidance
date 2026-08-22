import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Modal } from "./Modal";
import { Seal, Wordmark } from "./Seal";
import { useAuth } from "@/hooks/useAuth";
import {
  emptyAnswers,
  useInquiryDraft,
  type InquiryAnswers,
} from "@/hooks/useInquiryDraft";

import { readingHeading } from "@/lib/reading-heading";
import { MEMBERSHIP } from "@/config/membership";
import {
  generateFreeReading,
  generateMemberReading,
  saveReading,
} from "@/lib/readings.functions";



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

type ChipGroup = {
  question: string;
  answerKey: "kind" | "duration";
  options: string[];
};

type Step = {
  key: "situation" | "tried" | "stakes";
  title: string;
  help: string;
  placeholder: string;
  optional?: boolean;
  chips?: ChipGroup;
};

const questions: Step[] = [
  {
    key: "situation" as const,
    title: "What's on your mind?",
    help: "Describe the decision, pattern, relationship, or worry you want to think through.",
    placeholder:
      "Work is going well, but I am not sure the life around it still feels like mine…",
    chips: {
      question:
        "Is this a decision to make, a pattern that repeats, a relationship, or a fear you keep meeting?",
      answerKey: "kind" as const,
      options: [
        "A decision to make",
        "A pattern that repeats",
        "A relationship",
        "A fear I keep meeting",
      ],
    },
  },
  {
    key: "tried" as const,
    title: "What have you already tried, and why did it not settle?",
    help: "Optional. Tell us what you did and why it did not settle the issue.",
    placeholder: "I tried taking time off and setting better boundaries, but…",
    optional: true,
  },
  {
    key: "stakes" as const,
    title: "What do you stand to lose, and what would a good outcome look like?",
    help: "Optional. What are you afraid you could lose, and what would settling actually look like?",
    placeholder: "If I change course, I worry that…",
    optional: true,
    chips: {
      question: "How long has this been with you?",
      answerKey: "duration" as const,
      options: ["Days", "Months", "Years"],
    },
  },
];

const PROTOTYPE: Reading = {
  philosopherSlug: "aristotle",
  headline: "Your habits are already choosing a direction.",
  noticed:
    "You describe a gap between what you say matters and what your week repeatedly rewards. The problem may not be a lack of clarity. Your routine is already reinforcing one answer through repetition.",
  assumption: "What kind of person is your current schedule training you to become?",
  principle:
    "Character is built by repeated action rather than by single decisions, and the right amount of any effort is measured against this situation, not a fixed rule. In Aristotle's account, you become what you practice.",
  exercise:
    "For one week, write down each moment your actions and your stated priorities split. Note what you chose and why. Look for the pattern before you try to fix it.",
  question: "Which habit is this choice quietly building?",
  note: "This reading applies Aristotle's method to what you described. It is for reflection, not clinical, legal, medical, or financial advice.",
};

export function InquiryModal({
  open,
  onClose,
  philosopherSlug = "aristotle",
}: {
  open: boolean;
  onClose: () => void;
  philosopherSlug?: string;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<InquiryAnswers>(emptyAnswers);
  const [reading, setReading] = useState<Reading | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsMembership, setNeedsMembership] = useState(false);
  const [saved, setSaved] = useState(false);

  const { session } = useAuth();
  const generate = useServerFn(generateFreeReading);
  const generateAs = useServerFn(generateMemberReading);
  const save = useServerFn(saveReading);
  const draft = useInquiryDraft(answers, step, { active: open && reading === null });

  if (!open) return null;

  const isResult = reading !== null;
  const current = questions[step]!;
  const value = answers[current?.key ?? "situation"];
  const chips = current.chips;
  const requiredEmpty = !current.optional && value.trim().length === 0;
  const slug = reading?.philosopherSlug ?? philosopherSlug;
  const untouched = [answers.situation, answers.tried, answers.stakes].every(
    (field) => field.trim().length === 0,
  );
  const offerResume = draft.restored !== null && untouched && !isResult && !needsMembership;

  const resumeDraft = () => {
    if (!draft.restored) return;
    setAnswers(draft.restored.answers);
    setStep(Math.min(draft.restored.step, questions.length - 1));
    draft.dismissRestored();
  };

  const startFresh = () => {
    setAnswers(emptyAnswers);
    setStep(0);
    draft.clear();
  };

  const close = () => {
    onClose();
    setStep(0);
    setReading(null);
    setSaved(false);
    setError(null);
    setNeedsMembership(false);
  };


  const advance = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }
    setPending(true);
    setError(null);
    setNeedsMembership(false);

    const memberPath = Boolean(session) && philosopherSlug !== "aristotle";
    try {
      const result = memberPath
        ? await generateAs({ data: { ...answers, philosopherSlug } })
        : await generate({ data: answers });
      if (result && (result as { needsMembership?: boolean }).needsMembership) {
        setNeedsMembership(true);
        setPending(false);
        return;
      }
      setReading(result as Reading);

    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      if (philosopherSlug !== "aristotle" && (!session || /membership/i.test(message))) {
        setNeedsMembership(true);
        setError(null);
        setPending(false);
        return;
      }
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
            <p className="label text-oxblood">{readingHeading(reading.philosopherSlug)}</p>
            <h2 id="inquiry-title" className="display-lg mt-6 text-ink">
              {reading.headline}
            </h2>

            <p className="label mt-9 text-ink-soft">What stands out</p>
            <p className="mt-3 leading-relaxed text-ink-soft">{reading.noticed}</p>

            <div className="mt-9 grid gap-px border border-ink/25 bg-ink/25 sm:grid-cols-2">
              <div className="bg-papyrus-light/70 p-6">
                <p className="label text-oxblood">The question</p>
                <p className="mt-3 leading-relaxed text-ink">{reading.assumption}</p>
              </div>
              <div className="bg-papyrus-light/70 p-6">
                <p className="label text-ink-soft">The principle</p>
                <p className="mt-3 leading-relaxed text-ink">{reading.principle}</p>
              </div>
            </div>

            <div className="mt-6 border border-ink/25 bg-papyrus-light/60 p-6">
              <p className="label text-ink-soft">The practice</p>
              <p className="mt-3 leading-relaxed text-ink">{reading.exercise}</p>
            </div>

            <div className="mt-6 border border-ink/25 p-6">
              <p className="label text-oxblood">Sit with this</p>
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
        ) : needsMembership ? (
          <div>
            <p className="label text-oxblood">{readingHeading(slug)}</p>
            <h2 id="inquiry-title" className="display-lg mt-6 text-ink">
              Your reading is written. Membership opens it.
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-ink-soft">
              You have asked a real question, and this mind is the one suited to answer it. Your
              answers are kept exactly as you wrote them. Join the Lyceum and the reading is yours,
              along with every other thinker in the collection.
            </p>

            <ul className="mt-9 grid gap-px border border-ink/25 bg-ink/25">
              {MEMBERSHIP.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className="flex items-start gap-4 bg-papyrus-light/70 p-5 leading-relaxed text-ink"
                >
                  <span aria-hidden="true" className="mt-1 text-oxblood">
                    ✦
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
              <li className="flex items-start gap-4 bg-papyrus-light/70 p-5 leading-relaxed text-ink">
                <span aria-hidden="true" className="mt-1 text-oxblood">
                  ✦
                </span>
                <span>Readings you can return to, written in plain language you can act on.</span>
              </li>
            </ul>

            <div className="mt-6 grid gap-px border border-ink/25 bg-ink/25 sm:grid-cols-2">
              {MEMBERSHIP.plans.map((plan) => (
                <div key={plan.priceId} className="bg-papyrus-light/60 p-6">
                  <p className="label text-ink-soft">{plan.label}</p>
                  <p className="mt-3 text-2xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
                    {plan.price}{" "}
                    <span className="text-base font-normal text-ink-soft">{plan.cadence}</span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{plan.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link to="/membership" className="btn-ink">
                Join the Lyceum <span aria-hidden="true">→</span>
              </Link>
              <button
                type="button"
                onClick={() => setNeedsMembership(false)}
                className="link-underline"
              >
                Back to my answers
              </button>
            </div>

            <p className="mt-8 border-t border-ink/20 pt-5 text-sm leading-relaxed text-ink-soft">
              Prefer to read first? Aristotle stays free for everyone, up to{" "}
              {MEMBERSHIP.freeReadingsPerDay} readings a day.
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

            {chips ? (
              <fieldset className="mt-8">
                <legend className="label text-ink-soft">{chips.question}</legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {chips.options.map((option) => {
                    const active = answers[chips.answerKey] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            [chips.answerKey]: active ? "" : option,
                          })
                        }
                        className={
                          active
                            ? "border border-oxblood bg-oxblood px-4 py-2 text-sm text-papyrus"
                            : "border border-ink/40 bg-papyrus-light/70 px-4 py-2 text-sm text-ink hover:border-oxblood"
                        }
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button
                type="button"
                className="btn-ink"
                disabled={requiredEmpty || pending}
                onClick={advance}
                style={requiredEmpty || pending ? { opacity: 0.45 } : undefined}
              >
                {pending
                  ? "Preparing your reading"
                  : step === questions.length - 1
                    ? "See my reading"
                    : "Continue"}{" "}
                <span aria-hidden="true">→</span>
              </button>
              {current.optional ? (
                <button type="button" onClick={advance} className="link-underline">
                  Skip this question
                </button>
              ) : null}
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
