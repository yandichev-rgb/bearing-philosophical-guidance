import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";

const methods = [
  {
    numeral: "i",
    school: "Virtue",
    line: "What is this habit making of you?",
  },
  {
    numeral: "ii",
    school: "Socratic",
    line: "Which belief here have you never tested?",
  },
  {
    numeral: "iii",
    school: "Stoic",
    line: "What part of this is actually yours?",
  },
];

export function WhyPhilosophy() {
  return (
    <section aria-labelledby="why-heading" className="relative py-20 lg:py-28">
      <div className="shell">
        <Reveal>
          <SectionLabel numeral="II">Why philosophy</SectionLabel>
        </Reveal>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <Reveal>
            <h2 id="why-heading" className="display-lg text-ink">
              Most problems look different once you ask a better question.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="italic text-oxblood">That is the work philosophy has always done.</p>
            <p className="drop-initial mt-5 leading-relaxed text-ink-soft">
              Bearing does not hand every problem the same advice. Aristotle looks at habit and
              character. Socrates tests the assumption you did not notice you were holding. The
              Stoics separate what is yours from what never was. You get a clearer view of the
              situation, and one thing worth trying.
            </p>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-px border border-ink/20 bg-ink/20 sm:grid-cols-3">
          {methods.map((method, index) => (
            <Reveal as="li" key={method.school} delay={index * 0.07} className="sheet-dark p-7">
              <p
                className="text-3xl text-oxblood"
                style={{ fontFamily: "var(--font-display)" }}
                aria-hidden="true"
              >
                {method.numeral}
              </p>
              <p className="label mt-4 text-ink-soft">{method.school}</p>
              <p
                className="mt-3 text-[1.15rem] leading-snug text-ink"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {method.line}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
