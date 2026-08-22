import { useState } from "react";
import { Modal } from "./Modal";
import { Seal, Wordmark } from "./Seal";

const questions = [
  {
    title: "What's on your mind?",
    help: "Describe the decision, pattern, relationship, or worry you want to think through.",
    placeholder:
      "Work is going well, but I am not sure the life around it still feels like mine…",
  },
  {
    title: "What have you tried so far?",
    help: "Tell us what you did and why it did not settle the issue.",
    placeholder: "I tried taking time off and setting better boundaries, but…",
  },
  {
    title: "What feels at stake?",
    help: "What are you afraid you could lose, disappoint, or get wrong?",
    placeholder: "If I change course, I worry that…",
  },
];

export function InquiryModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave?: (answers: string[]) => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  const isResult = step === questions.length;
  const progress = ((step + (isResult ? 0 : 0.35)) / questions.length) * 100;

  const close = () => {
    onClose();
    setStep(0);
    setSaved(false);
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
          style={{ width: `${isResult ? 100 : progress}%` }}
        />
      </div>

      <div className="px-5 py-10 sm:px-9 sm:py-14">
        {isResult ? (
          <div>
            <p className="label text-oxblood">Your reading · Aristotle</p>
            <h2 id="inquiry-title" className="display-lg mt-6 text-ink">
              Aristotle would start with your habits.
            </h2>
            <p className="mt-7 leading-relaxed text-ink-soft">
              Your answer points to a gap between what you say matters and what your week rewards.
              Aristotle would not start by looking for a perfect decision. He would look for the
              smallest action you could repeat until it becomes part of your character.
            </p>

            <div className="mt-9 border border-ink/25 bg-papyrus-light/60 p-6">
              <p className="label text-ink-soft">Practice</p>
              <p className="mt-3 leading-relaxed text-ink">
                Notice each moment when your actions and stated priorities split. Write down what
                you chose and why. Look for the pattern before you try to fix it.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6">
              <button
                type="button"
                className="btn-ink"
                onClick={() => {
                  onSave?.(answers);
                  setSaved(true);
                }}
              >
                Save this reading
              </button>
              <button type="button" onClick={() => setStep(questions.length - 1)} className="link-underline">
                Back
              </button>
            </div>
            {saved ? (
              <p className="label mt-6 text-oxblood" role="status">
                Saved to this session. Create an account to keep your reading history.
              </p>
            ) : null}

            <p className="mt-10 border-t border-ink/20 pt-5 text-sm leading-relaxed text-ink-soft">
              This reading is an interpretation of your situation through Aristotle's ideas. It is
              for reflection, not clinical, legal, medical, or financial advice.
            </p>
          </div>
        ) : (
          <div>
            <p className="label text-ink-soft">
              Question {step + 1} of {questions.length}
            </p>
            <h2 id="inquiry-title" className="display-lg mt-6 text-ink">
              {questions[step].title}
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">{questions[step].help}</p>

            <label className="mt-8 block">
              <span className="sr-only">{questions[step].title}</span>
              <textarea
                value={answers[step]}
                onChange={(event) => {
                  const next = [...answers];
                  next[step] = event.target.value;
                  setAnswers(next);
                }}
                placeholder={questions[step].placeholder}
                rows={7}
                className="w-full border border-ink/40 bg-papyrus-light/70 p-5 text-lg leading-relaxed text-ink placeholder:text-ink-soft/60"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </label>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <button
                type="button"
                className="btn-ink"
                disabled={answers[step].trim().length === 0}
                onClick={() => setStep(step + 1)}
                style={answers[step].trim().length === 0 ? { opacity: 0.45 } : undefined}
              >
                {step === questions.length - 1 ? "See my reading" : "Continue"}{" "}
                <span aria-hidden="true">→</span>
              </button>
              {step > 0 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="link-underline">
                  Back
                </button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
