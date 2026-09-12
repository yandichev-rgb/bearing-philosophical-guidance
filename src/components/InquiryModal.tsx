import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
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
import { toReadingView } from "@/lib/reading-view";
import type { GeneratedReading } from "@/lib/reading-types";
import { ReadingFollowUps } from "./ReadingFollowUps";
import { ReadingBody, ReadingLayout } from "./ReadingBody";
import { useMembership } from "@/hooks/useMembership";
import { MEMBERSHIP } from "@/config/membership";
import {
  generateFreeReading,
  generateMemberReading,
  saveReading,
} from "@/lib/readings.functions";
import { ReadingPurchase } from "./ReadingPurchase";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics.functions";
import {
  analyticsSessionId,
  clearCreditToken,
  readCreditToken,
  visitorId,
} from "@/lib/reading-credit-token";




type Reading = GeneratedReading;

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
    title: "What's been circling in your mind?",
    help: "Describe what happened and what still feels unresolved. One natural paragraph is enough.",
    placeholder:
      "Work is going well, but I am not sure the life around it still feels like mine…",
    chips: {
      question: "Which kind of question is this?",
      answerKey: "kind" as const,
      options: ["A decision", "A recurring pattern", "A relationship", "A persistent fear"],
    },
  },
  {
    key: "tried" as const,
    title: "What have you already tried?",
    help: "Optional. What did you do, and why did it not settle the issue?",
    placeholder: "I tried taking time off and setting better boundaries, but…",
    optional: true,
  },
  {
    key: "stakes" as const,
    title: "What feels most at stake?",
    help: "Optional. What are you afraid you could lose? What would a good outcome make possible?",
    placeholder: "If I change course, I worry that…",
    optional: true,
    chips: {
      question: "How long has this been with you?",
      answerKey: "duration" as const,
      options: ["Days", "Months", "Years"],
    },
  },
];

const PREPARING_STAGES = [
  "Reading your answers closely.",
  "Choosing the philosophical lens and the concepts it turns on.",
  "Writing your reading, and checking every citation against the source.",
];

const GENERATION_ERROR =
  "We couldn't prepare your reading. Your answers have been preserved. Please try again.";

/** Fire-and-forget experiment event. Carries no situation, stakes or reading text. */
function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>) {
  void trackEvent({
    data: {
      event,
      ...(analyticsSessionId() ? { sessionId: analyticsSessionId()! } : {}),
      ...(props ? { props } : {}),
    },
  }).catch(() => {});
}




export function InquiryModal({
  open,
  onClose,
  philosopherSlug = "aristotle",
  initialKind,
}: {
  open: boolean;
  onClose: () => void;
  philosopherSlug?: string;
  initialKind?: string;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<InquiryAnswers>(emptyAnswers);
  const [reading, setReading] = useState<Reading | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsMembership, setNeedsMembership] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedReadingId, setSavedReadingId] = useState<string | null>(null);
  const [clarify, setClarify] = useState<{ question: string; answer: string }[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [retryable, setRetryable] = useState(true);
  const [quota, setQuota] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<string | null>(null);

  const [stage, setStage] = useState(0);
  const [lastClarifications, setLastClarifications] = useState<
    { question: string; answer: string }[]
  >([]);

  const navigate = useNavigate();
  const { session } = useAuth();
  const { isMember } = useMembership();
  const generate = useServerFn(generateFreeReading);
  const generateAs = useServerFn(generateMemberReading);
  const save = useServerFn(saveReading);
  const draft = useInquiryDraft(answers, step, { active: open && reading === null });

  // A concern chosen on the landing page arrives preselected.
  useEffect(() => {
    if (!open || !initialKind) return;
    setAnswers((current) => (current.kind ? current : { ...current, kind: initialKind }));
  }, [open, initialKind]);

  // Staged reassurance while the pipeline works. Timed against measured stage
  // durations; it makes no extra requests.
  useEffect(() => {
    if (!pending) return;
    const timers = [
      window.setTimeout(() => setStage(1), 2500),
      window.setTimeout(() => setStage(2), 11000),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [pending]);

  if (!open) return null;


  const isResult = reading !== null;
  const readingDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const current = questions[step]!;
  const value = answers[current?.key ?? "situation"];
  const chips = current.chips;
  const requiredEmpty = !current.optional && value.trim().length === 0;
  const slug = reading?.philosopherSlug ?? philosopherSlug;
  const untouched = [answers.situation, answers.tried, answers.stakes].every(
    (field) => field.trim().length === 0,
  );
  const offerResume =
    draft.restored !== null &&
    untouched &&
    !isResult &&
    !needsMembership &&
    !failed &&
    !pending &&
    quota === null &&
    paywall === null;


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

  /** Closes the reading and lands the reader on the list of six approaches. */
  const toLyceum = () => {
    close();
    void navigate({ to: "/", hash: "lyceum" });
  };

  const close = () => {
    onClose();
    setStep(0);
    setReading(null);
    setSaved(false);
    setSavedReadingId(null);
    setError(null);
    setNeedsMembership(false);
    setClarify(null);
    setFailed(false);
    setQuota(null);
    setPaywall(null);

  };


  const runReading = async (clarifications: { question: string; answer: string }[]) => {
    setPending(true);
    setStage(0);
    setError(null);
    setNeedsMembership(false);
    setFailed(false);
    setQuota(null);
    setPaywall(null);
    setRetryable(true);
    setLastClarifications(clarifications);
    track("reading_started", { philosopher: philosopherSlug });

    const creditToken = readCreditToken();
    const payload = { ...answers, clarifications };
    // Members read with any thinker without a gate. Everyone else goes through the
    // free/paid gate, still in the lens of the thinker they chose.
    const memberPath = Boolean(session) && isMember;
    try {
      const result = memberPath
        ? await generateAs({ data: { ...payload, philosopherSlug } })
        : await generate({
            data: {
              ...payload,
              philosopherSlug,
              ...(visitorId() ? { visitorId: visitorId()! } : {}),
              ...(creditToken ? { creditToken } : {}),
            },
          });

      if (result.kind === "membership") {
        setNeedsMembership(true);
        return;
      }
      // The outcome is explicit. Nothing is inferred from missing fields, and a
      // failure is never filled in with example content.
      if (result.kind === "reading") {
        setReading(result.reading);
        setClarify(null);
        track("reading_completed", { philosopher: result.reading.philosopherSlug });
        if (creditToken) {
          // The credit is spent; the reading now belongs to it.
          clearCreditToken();
          track("second_reading_unlocked");
        } else {
          track("first_reading_completed");
        }
        return;
      }
      if (result.kind === "clarification") {
        setClarify(result.questions.map((question) => ({ question, answer: "" })));
        return;
      }
      if (result.kind === "payment_required") {
        // The first reading is always free. This is only reached for a further one.
        setPaywall(result.message);
        track("second_reading_started", { readingNumber: result.readingNumber });
        track("second_reading_paywall_viewed", { readingNumber: result.readingNumber });
        return;
      }
      if (result.kind === "quota") {
        setQuota(result.message);
        return;
      }

      if (result.kind === "safety") {
        setFailed(true);
        setRetryable(false);
        setError(result.message);
        return;
      }
      setFailed(true);
      setRetryable(result.retryable);
      setError(result.message || GENERATION_ERROR);

    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      if (/membership/i.test(message)) {
        setNeedsMembership(true);
        setError(null);
        setPending(false);
        return;
      }
      // A failed generation is never replaced with example content. The answers
      // stay exactly as written so the reader can retry or edit them.
      setFailed(true);
      setError(GENERATION_ERROR);
    } finally {
      setPending(false);
    }
  };


  const advance = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }
    // Sufficiency is decided by the reading pipeline itself, which returns
    // clarifying questions instead of a reading when the intake is too thin.
    await runReading([]);
  };


  const persist = async () => {
    if (!reading) return;
    setError(null);
    try {
      const result = await save({ data: { answers, reading } });
      setSaved(true);
      setSavedReadingId(result.readingId);
      draft.clear();

    } catch {
      setError("Your reading could not be saved. Try again in a moment.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      labelledBy="inquiry-title"
      className={
        isResult ? "min-h-screen max-w-[1120px] sm:min-h-0" : "min-h-screen max-w-3xl sm:min-h-0"
      }
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
          style={{
            width: isResult || pending ? "100%" : `${((step + 0.4) / questions.length) * 100}%`,
          }}
        />
      </div>

      <div className={isResult ? "py-6 sm:py-8" : "px-5 py-10 sm:px-9 sm:py-14"}>
        {pending ? (
          <div className="flex min-h-[52vh] flex-col items-center justify-center text-center">
            <Seal
              size={96}
              className="animate-[spin_14s_linear_infinite] motion-reduce:animate-none"
            />
            <p className="label mt-8 text-oxblood">{readingHeading(slug)}</p>
            <h2 id="inquiry-title" className="display-lg mt-5 text-ink">
              Preparing your reading.
            </h2>
            <p
              className="mt-6 max-w-md leading-relaxed text-ink-soft"
              role="status"
              aria-live="polite"
            >
              {PREPARING_STAGES[Math.min(stage, PREPARING_STAGES.length - 1)]}
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-soft">
              This usually takes twenty to thirty seconds. Your answers are kept exactly as you
              wrote them.
            </p>
          </div>
        ) : paywall ? (
          <ReadingPurchase
            message={paywall}
            philosopherSlug={philosopherSlug}
            onEditAnswers={() => {
              setPaywall(null);
              setClarify(null);
              setStep(0);
            }}
            onClose={close}
            onCheckoutStarted={() => track("second_reading_checkout_started")}
          />
        ) : quota ? (

          <div>
            <p className="label text-oxblood">{readingHeading(slug)}</p>
            <h2 id="inquiry-title" className="display-lg mt-6 text-ink">
              You've used today's free readings.
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-ink-soft" role="status">
              {quota}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link to="/membership" className="btn-ink">
                Join Bearing <span aria-hidden="true">→</span>
              </Link>
              <button
                type="button"
                className="link-underline"
                onClick={() => {
                  setQuota(null);
                  setClarify(null);
                  setStep(0);
                }}
              >
                Edit my answers
              </button>
              <button type="button" className="link-underline" onClick={close}>
                Return to the Lyceum
              </button>
            </div>
          </div>
        ) : isResult ? (
          <div>
            <h2 id="inquiry-title" className="sr-only">
              {reading.title}
            </h2>
            <ReadingLayout
              slug={reading.philosopherSlug}
              onAnotherLens={close}
              utility={
                <>
                  <button type="button" onClick={close} className="nav-link">
                    <span aria-hidden="true">←</span> Back to the Lyceum
                  </button>
                  <span className="folio">{readingDate}</span>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    {session ? (
                      <button
                        type="button"
                        onClick={persist}
                        disabled={saved}
                        className="nav-link"
                        style={saved ? { opacity: 0.5 } : undefined}
                      >
                        {saved ? "Saved" : "Save reading"}
                      </button>
                    ) : (
                      <Link to="/auth" className="nav-link">
                        Save reading
                      </Link>
                    )}
                    <button type="button" onClick={close} className="nav-link">
                      Compare another lens
                    </button>
                  </div>
                </>
              }
            >
              <ReadingBody reading={toReadingView(reading)} slug={reading.philosopherSlug} />

              <div className="mt-10 border-t border-ink/15 pt-8">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                  {session ? (
                    <button type="button" className="btn-ink" onClick={persist} disabled={saved}>
                      {saved ? "Saved" : "Save this reading"}
                    </button>
                  ) : (
                    <Link to="/auth" className="btn-ink">
                      Save this reading
                    </Link>
                  )}
                  <button type="button" onClick={close} className="link-underline">
                    Examine this through another lens
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReading(null);
                      setSaved(false);
                      setSavedReadingId(null);
                      setStep(0);
                      setAnswers(emptyAnswers);
                    }}
                    className="link-underline"
                  >
                    Start a new inquiry
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
                  <p className="mt-6 text-sm text-ink-soft">
                    Sign in to keep this reading. No card required.
                  </p>
                ) : null}
                {error ? (
                  <p className="mt-5 text-sm text-oxblood" role="status">
                    {error}
                  </p>
                ) : null}

                {isMember ? (
                  savedReadingId ? (
                    <ReadingFollowUps readingId={savedReadingId} isMember />
                  ) : (
                    <p className="mt-6 text-sm text-ink-soft">
                      Save this reading to ask further questions about it.
                    </p>
                  )
                ) : (
                  <p className="mt-6 max-w-[62ch] text-sm leading-relaxed text-ink-soft">
                    Members may ask up to {MEMBERSHIP.followUpsPerReading} further questions on a
                    reading and consult every thinker in the Lyceum.{" "}
                    <Link to="/membership" className="link-underline">
                      Membership
                    </Link>
                  </p>
                )}

                <p className="mt-8 text-sm leading-relaxed text-ink-soft">{reading.note}</p>
              </div>
            </ReadingLayout>
          </div>
        ) : failed ? (
          <div>
            <p className="label text-oxblood">{readingHeading(slug)}</p>
            <h2 id="inquiry-title" className="display-lg mt-6 text-ink">
              We couldn't prepare your reading.
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-ink-soft" role="status">
              {error || GENERATION_ERROR}
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">
              Nothing has been written in your place. Bearing will not show you an example reading
              as though it were yours.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              {retryable ? (
                <button
                  type="button"
                  className="btn-ink"
                  onClick={() => runReading(lastClarifications)}
                >
                  Try again <span aria-hidden="true">→</span>
                </button>
              ) : null}
              <button
                type="button"
                className="link-underline"
                onClick={() => {
                  setFailed(false);
                  setError(null);
                  setClarify(null);
                  setStep(0);
                }}
              >
                Edit my answers
              </button>
              <button type="button" className="link-underline" onClick={close}>
                Return to the Lyceum
              </button>
            </div>
          </div>
        ) : clarify ? (


          <div>
            <p className="label text-oxblood">Before the reading</p>
            <h2 id="inquiry-title" className="display-lg mt-6 text-ink">
              A few particulars first.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">
              What you wrote is broad enough that any reading of it would be guesswork. Answer these
              and the reading can work from your actual situation rather than a general one.
            </p>

            {clarify.map((item, index) => (
              <label key={item.question} className="mt-8 block">
                <span className="block leading-relaxed text-ink">{item.question}</span>
                <textarea
                  value={item.answer}
                  onChange={(event) =>
                    setClarify((current) =>
                      (current ?? []).map((entry, position) =>
                        position === index ? { ...entry, answer: event.target.value } : entry,
                      ),
                    )
                  }
                  rows={3}
                  className="mt-3 w-full border border-ink/40 bg-papyrus-light/70 p-4 text-lg leading-relaxed text-ink placeholder:text-ink-soft/60"
                  style={{ fontFamily: "var(--font-body)" }}
                />
              </label>
            ))}

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button
                type="button"
                className="btn-ink"
                disabled={pending || clarify.every((item) => item.answer.trim().length === 0)}
                style={
                  pending || clarify.every((item) => item.answer.trim().length === 0)
                    ? { opacity: 0.45 }
                    : undefined
                }
                onClick={() => runReading(clarify.filter((item) => item.answer.trim().length > 0))}
              >
                {pending ? "Preparing your reading" : "Create my reading"}{" "}
                <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                onClick={() => setClarify(null)}
                className="link-underline"
              >
                Back to my answers
              </button>
            </div>

            {error ? (
              <p className="mt-5 text-sm text-oxblood" role="status">
                {error}
              </p>
            ) : null}
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
                    ◆
                  </span>
                  <span>{benefit}</span>
                </li>
              ))}
              <li className="flex items-start gap-4 bg-papyrus-light/70 p-5 leading-relaxed text-ink">
                <span aria-hidden="true" className="mt-1 text-oxblood">
                  ◆
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
            {offerResume ? (
              <div className="mb-8 border border-ink/25 bg-papyrus-light/70 p-5">
                <p className="label text-oxblood">Unfinished inquiry</p>
                <p className="mt-3 leading-relaxed text-ink-soft">
                  You left answers here on this device. Pick them up where you stopped, or begin
                  again.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-6">
                  <button type="button" className="btn-ink" onClick={resumeDraft}>
                    Resume my answers <span aria-hidden="true">→</span>
                  </button>
                  <button type="button" onClick={startFresh} className="link-underline">
                    Start fresh
                  </button>
                </div>
              </div>
            ) : null}
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
                    ? "Create my reading"
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

            <p className="mt-6 text-sm leading-relaxed text-ink-soft">
              Draft answers are kept on this device. When you request a reading, your answers are
              processed on Bearing's servers to generate it. Learn more in{" "}
              <a href="/privacy" className="link-underline">
                Privacy
              </a>
              .
            </p>



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
