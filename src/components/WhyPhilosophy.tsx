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
    line: "Which definition here have you never tested?",
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
              Advice gives you an answer.
              <br />
              Philosophy changes what you can see.
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="drop-initial leading-relaxed text-ink-soft">
              Generic advice begins with what you should do. Bearing begins by deciding what the
              problem actually is, and the methods disagree about that. Aristotle looks at habit and
              character. Socratic inquiry tests the definition you are relying on. Stoicism divides
              what is yours to act on from what is not. Nietzsche asks where your standard came from
              and whose interest it served.
            </p>
            <p className="mt-5 italic text-oxblood">
              Every reading names the work its ideas come from, and says plainly what that lens may
              miss.
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
