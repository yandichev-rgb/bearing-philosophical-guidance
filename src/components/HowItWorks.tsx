import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";

const steps = [
  {
    numeral: "I",
    title: "Tell us what is going on",
    body: "Three short questions about the situation, what you have tried, and what is at stake. Two of them can be skipped.",
  },
  {
    numeral: "II",
    title: "Choose a philosopher",
    body: "Start free with Aristotle. Members can put the same question to every mind in the Lyceum.",
  },
  {
    numeral: "III",
    title: "Get a reading you can use",
    body: "What stands out, the question underneath it, the principle at work, and one thing to practise next.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="sheet-dark border-y border-ink/20 py-20 lg:py-28">
      <div className="shell">
        <Reveal>
          <SectionLabel numeral="IV">How it works</SectionLabel>
        </Reveal>
        <Reveal>
          <h2 id="how-heading" className="display-lg mt-8 max-w-2xl text-ink">
            Bring one real question.
            <br />
            Leave with a clearer next step.
          </h2>
        </Reveal>

        <ol className="mt-14 grid gap-10 border-t border-ink/25 pt-10 md:grid-cols-3 md:gap-0">
          {steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.numeral}
              delay={index * 0.08}
              className={index === 0 ? "md:pr-10" : "md:rule-v md:px-10 last:md:pr-0"}
            >
              <p
                className="text-4xl text-oxblood"
                style={{ fontFamily: "var(--font-display)" }}
                aria-hidden="true"
              >
                {step.numeral}
              </p>
              <span aria-hidden="true" className="mt-4 block h-px w-10 bg-bronze" />
              <h3 className="mt-5 text-2xl text-ink">{step.title}</h3>
              <p className="mt-4 leading-relaxed text-ink-soft">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
