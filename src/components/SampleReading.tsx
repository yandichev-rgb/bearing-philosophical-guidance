import { useState } from "react";
import { Seal } from "./Seal";
import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";

const tabs = [
  {
    id: "aristotle",
    tab: "Aristotle",
    label: "An Aristotelian reading",
    margin: "Habit",
    stands:
      "You say you want a life with room for more than work, but your week practises the opposite every day. The gap is not confusion. It is repetition.",
    question: "What kind of person is your current schedule training you to become?",
    principle:
      "Character is the sum of what you repeat. The right amount of effort is measured against this life, not against a rule you inherited.",
    practice:
      "Choose a hard stopping time for one week. Keep it even on the evenings when the work could continue.",
    sit: "You are not deciding once. You are deciding every Tuesday.",
  },
  {
    id: "socrates",
    tab: "Socrates",
    label: "A Socratic reading",
    margin: "Belief",
    stands:
      "You treat slowing down and being unambitious as the same thing. That equation is doing a great deal of work here, and you have never made it defend itself.",
    question: "Where did you learn that rest is a cost rather than part of the work?",
    principle:
      "An untested belief governs more firmly than one you have argued with. Define the word before you let it judge you.",
    practice:
      "Write what ambition means to you in one sentence. Cross out anything that depends on impressing someone.",
    sit: "You may be obeying a rule nobody ever gave you.",
  },
  {
    id: "stoic",
    tab: "Stoic",
    label: "A Stoic reading",
    margin: "Control",
    stands:
      "Much of your worry sits with how others will read your limits. That was never yours to arrange. The quality of your work, and the calm you keep, are.",
    question: "Which outcome here have you been trying to manage on someone else's behalf?",
    principle:
      "Separate what is yours from what is not, then spend yourself entirely on the first. The rest is weather.",
    practice:
      "Name one outcome to stop managing, and one action today that is fully within your hands.",
    sit: "A boundary held quietly says more than one explained at length.",
  },
];

export function SampleReading() {
  const [active, setActive] = useState(tabs[0]!.id);
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0]!;

  return (
    <section aria-labelledby="sample-heading" className="bg-sample vignette relative py-20 lg:py-28">
      <div className="shell relative grid gap-14 lg:grid-cols-[1fr_1.12fr] lg:items-start lg:gap-16">
        <div>
          <Reveal>
            <SectionLabel numeral="V">A sample reading</SectionLabel>
          </Reveal>
          <Reveal>
            <h2 id="sample-heading" className="display-lg mt-8 text-ink">
              One problem.
              <br />
              Three ways to see it.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-6 max-w-md leading-relaxed text-ink-soft">
              The same person read three ways: doing well at work, worn thin, and afraid that
              slowing down would cost them everything they built.
            </p>
          </Reveal>

          <div role="tablist" aria-label="Sample readings" className="mt-9 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={active === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActive(tab.id)}
                className={`label border border-ink px-5 py-3 transition-colors duration-200 ${
                  active === tab.id
                    ? "bg-ink text-papyrus-light"
                    : "bg-transparent text-ink hover:bg-ink/10"
                }`}
              >
                {tab.tab}
              </button>
            ))}
          </div>

          <p className="label mt-10 max-w-xs leading-relaxed text-ink-soft">
            Every reading is written to you directly, never in the voice of the philosopher.
          </p>
        </div>

        <Reveal delay={0.06}>
          <div
            role="tabpanel"
            id={`panel-${current.id}`}
            aria-labelledby={`tab-${current.id}`}
            className="plate grain"
            style={{ transform: "rotate(-0.4deg)" }}
          >
            <div className="relative flex items-center justify-between gap-4 border-b border-ink/25 px-6 py-4 sm:px-9">
              <div className="flex min-w-0 items-center gap-3">
                <Seal size={28} className="shrink-0" />
                <div className="min-w-0">
                  <p className="label text-ink-soft">{current.label}</p>
                  <p className="truncate text-lg text-ink">Your Bearing</p>
                </div>
              </div>
              <span className="folio hidden shrink-0 sm:block">{current.margin}</span>
            </div>

            <div className="relative px-6 py-9 sm:px-10 sm:py-11">
              <p className="label text-oxblood">What stands out</p>
              <p className="drop-initial mt-3 text-[1.0625rem] leading-relaxed text-ink">
                {current.stands}
              </p>

              <div className="mt-7 border-t border-ink/20 pt-6">
                <p className="label text-oxblood">The question</p>
                <p
                  className="mt-3 text-[1.2rem] leading-snug text-ink"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {current.question}
                </p>
              </div>

              <div className="mt-7 border-t border-ink/20 pt-6">
                <p className="label text-oxblood">The principle</p>
                <p className="mt-3 leading-relaxed text-ink-soft">{current.principle}</p>
              </div>

              <div className="mt-7 border-t border-ink/20 pt-6">
                <p className="label text-oxblood">The practice</p>
                <p className="mt-3 leading-relaxed text-ink">{current.practice}</p>
              </div>

              <div className="mt-7 border-t border-ink/20 pt-6">
                <p className="label text-oxblood">Sit with this</p>
                <p className="mt-3 italic leading-relaxed text-ink-soft">{current.sit}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-ink/25 px-6 py-4 sm:px-9">
              <span className="folio">Bearing · Specimen V</span>
              <span aria-hidden="true" className="h-px w-12 bg-bronze" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
