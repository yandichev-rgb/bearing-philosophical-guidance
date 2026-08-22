import { useState } from "react";
import { Seal } from "./Seal";
import { SectionLabel } from "./SectionLabel";

const tabs = [
  {
    id: "aristotle",
    tab: "Aristotle",
    label: "What your habits are building",
    reading:
      "You say you want a life with room for more than work. But your schedule practices the opposite every day. Aristotle would ask which version of you your routine is training.",
    practice:
      "Choose a hard stopping time for one week. Keep it even when the work could continue.",
  },
  {
    id: "socrates",
    tab: "Socrates",
    label: "Question the belief",
    reading:
      "You seem to believe that slowing down means you are less ambitious. Is that true, or is it a rule you picked up from someone else?",
    practice:
      "Write down what ambition means to you. Cross out anything that depends on impressing other people.",
  },
  {
    id: "stoic",
    tab: "Stoic",
    label: "What you control",
    reading:
      "You cannot control whether people see your limits as weakness. You can control the quality of your work, the boundary you set, and how calmly you keep it.",
    practice: "Name one outcome to stop managing and one action that is fully yours today.",
  },
];

export function SampleReading() {
  const [active, setActive] = useState(tabs[0]!.id);
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0]!;

  return (
    <section aria-labelledby="sample-heading" className="bg-sample py-20 lg:py-28">
      <div className="shell grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-20">
        <div>
          <SectionLabel numeral="V">A sample reading</SectionLabel>
          <h2 id="sample-heading" className="display-lg mt-8 text-ink">
            One problem.
            <br />
            Three ways to see it.
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-ink-soft">
            Here is how three philosophers might respond to the same person: successful at work,
            worn out, and afraid to slow down.
          </p>

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
        </div>

        <div
          role="tabpanel"
          id={`panel-${current.id}`}
          aria-labelledby={`tab-${current.id}`}
          className="paper grain border border-ink/60 shadow-sheet"
          style={{ transform: "rotate(-0.5deg)" }}
        >
          <div className="relative flex items-center justify-between gap-4 border-b border-ink/25 px-6 py-4 sm:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Seal size={28} className="shrink-0" />
              <div className="min-w-0">
                <p className="label text-ink-soft">Sample reading</p>
                <p className="truncate text-lg text-ink">Your Bearing</p>
              </div>
            </div>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="shrink-0 text-bronze"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 1v3M12 20v3M1 12h3M20 12h3M4.4 4.4l2.1 2.1M17.5 17.5l2.1 2.1M19.6 4.4l-2.1 2.1M6.5 17.5l-2.1 2.1" />
            </svg>
          </div>

          <div className="relative px-6 py-9 sm:px-10 sm:py-11">
            <p className="label text-oxblood">{current.label}</p>
            <p className="mt-6 text-xl leading-relaxed text-ink">{current.reading}</p>
            <div className="mt-9 border-t border-ink/25 pt-6">
              <p className="label text-ink-soft">Practice</p>
              <p className="mt-3 leading-relaxed text-ink">{current.practice}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
