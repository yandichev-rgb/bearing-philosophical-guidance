import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";

const steps = [
  {
    numeral: "I",
    title: "Orient",
    body: "Describe the situation in your own words. Two optional answers add context when it would help.",
  },
  {
    numeral: "II",
    title: "Examine",
    body: "One method is applied to what you wrote, grounded in the works its ideas come from.",
  },
  {
    numeral: "III",
    title: "Challenge",
    body: "The reading tests how you have framed the situation, and states plainly what that lens may miss.",
  },
  {
    numeral: "IV",
    title: "Practise",
    body: "You leave with one better question and one specific experiment to run in real life.",
  },
  {
    numeral: "V",
    title: "Return",
    body: "A return prompt tells you when to come back and what to report. Members may press further with follow up questions.",
  },
];


export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="sheet-dark border-y border-ink/20 py-20 lg:py-28">
      <div className="shell">
        <Reveal>
          <SectionLabel numeral="IV">The Bearing method</SectionLabel>
        </Reveal>
        <Reveal>
          <h2 id="how-heading" className="display-lg mt-8 max-w-2xl text-ink">
            One real question.
            <br />
            One method.
            <br />
            One clearer next step.
          </h2>
        </Reveal>


        <ol className="mt-14 grid gap-10 border-t border-ink/25 pt-10 md:grid-cols-3 lg:grid-cols-5 md:gap-0">
          {steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.numeral}
              delay={index * 0.08}
              className={index === 0 ? "md:pr-8" : "md:rule-v md:px-8 last:md:pr-0"}
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
