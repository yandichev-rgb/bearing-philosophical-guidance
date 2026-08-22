import { SectionLabel } from "./SectionLabel";

const steps = [
  {
    numeral: "I",
    title: "Tell us what is going on",
    body: "Answer a few short questions about the situation, what you have tried, and what feels at stake.",
  },
  {
    numeral: "II",
    title: "Choose a philosopher",
    body: "Start free with Aristotle. Members can ask the same question of every mind in the Lyceum.",
  },
  {
    numeral: "III",
    title: "Get a reading you can use",
    body: "See how their ideas apply to your life, what they would question, and one thing to try next.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="shell py-20 lg:py-28">
      <SectionLabel numeral="IV">How it works</SectionLabel>
      <h2 id="how-heading" className="display-lg mt-8 max-w-2xl text-ink">
        Bring one real question.
        <br />
        Leave with a clearer next step.
      </h2>

      <ol className="mt-14 grid gap-10 border-t border-ink/25 pt-10 md:grid-cols-3 md:gap-0">
        {steps.map((step, index) => (
          <li
            key={step.numeral}
            className={index === 0 ? "md:pr-10" : "md:rule-v md:px-10 last:md:pr-0"}
          >
            <p className="label text-oxblood">Step {step.numeral}</p>
            <h3 className="mt-4 text-2xl text-ink">{step.title}</h3>
            <p className="mt-4 leading-relaxed text-ink-soft">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
