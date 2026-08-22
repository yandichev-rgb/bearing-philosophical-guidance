import { SectionLabel } from "./SectionLabel";

export function WhyPhilosophy() {
  return (
    <section aria-labelledby="why-heading" className="shell py-20 lg:py-28">
      <SectionLabel numeral="II">Why philosophy</SectionLabel>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <h2 id="why-heading" className="display-lg max-w-xl text-ink">
          Most problems look different once you ask a better question.
        </h2>
        <div className="max-w-lg">
          <p className="text-lg italic text-oxblood">That is what philosophy is good at.</p>
          <p className="mt-6 leading-relaxed text-ink-soft">
            Bearing does not hand every problem the same advice. Aristotle looks at habit and
            character. Socrates tests your assumptions. The Stoics separate what you control from
            what you do not. You get a clearer view, plus something useful to try.
          </p>
        </div>
      </div>
    </section>
  );
}
