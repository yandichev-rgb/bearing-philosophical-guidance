import { philosophers, romanNumerals, type Philosopher } from "@/data/philosophers";
import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";

const prompts: Record<string, string> = {
  aristotle: "Bring a habit you cannot break.",
  socrates: "Bring a belief you have never argued with.",
  "marcus-aurelius": "Bring what you cannot control.",

  plato: "Bring a fear with no shape yet.",
  nietzsche: "Bring the standard you are afraid of failing.",
  "carl-jung": "Bring a reaction that felt larger than the situation.",
};

export function Lyceum({ onSelect }: { onSelect: (p: Philosopher) => void }) {
  return (
    <section
      id="lyceum"
      aria-labelledby="lyceum-heading"
      className="relative overflow-hidden bg-lyceum py-20 text-papyrus lg:py-28"
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-bronze/60" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-2 select-none text-[15vw] leading-none text-papyrus/[0.032]"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}
      >
        LYCEVM
      </span>

      <div className="shell relative">
        <Reveal>
          <SectionLabel numeral="III" tone="papyrus">
            The Lyceum
          </SectionLabel>
        </Reveal>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <Reveal>
            <h2 id="lyceum-heading" className="display-lg text-papyrus-light">
              Six ways to see what
              <br />
              one perspective might miss.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="max-w-md leading-relaxed text-gold/85">
              The Lyceum brings together six distinct approaches to examining a situation. Ask the same question
              through more than one lens and different parts of the situation come into view.
            </p>
          </Reveal>
        </div>


        <ul className="mt-14 grid grid-cols-1 gap-px bg-papyrus/20 sm:grid-cols-2 xl:grid-cols-3">
          {philosophers.map((p, index) => (
            <Reveal as="li" key={p.slug} delay={(index % 3) * 0.06} className="bg-lyceum">
              <button
                type="button"
                onClick={() => onSelect(p)}
                className="group relative flex h-full w-full flex-col items-start p-7 text-left transition-colors duration-300 hover:bg-papyrus focus-visible:bg-papyrus"
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <span className="label text-gold/80 transition-colors group-hover:text-ink-soft">
                    {romanNumerals[index]}
                  </span>
                  {p.free ? (
                    <span className="label border border-oxblood px-2 py-1 text-oxblood">
                      Begin here
                    </span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-bronze text-[10px] leading-none text-bronze"
                      title="Members"
                    >
                      ◆
                    </span>
                  )}
                </div>

                <div className="mt-6 w-full border border-ink/70 bg-papyrus-light p-[3px] shadow-engraved transition-transform duration-300 group-hover:-translate-y-1">
                  <img
                    src={p.portrait}
                    alt={p.portraitAlt}
                    loading="lazy"
                    width={520}
                    height={520}
                    className="block aspect-square w-full border border-ink/40 object-cover"
                  />
                </div>

                <p className="label mt-7 text-gold/80 transition-colors group-hover:text-oxblood">
                  {p.school}
                </p>
                <h3 className="mt-2 text-3xl text-papyrus-light transition-colors group-hover:text-ink">
                  {p.name}
                </h3>
                <p className="label mt-1 text-papyrus/50 transition-colors group-hover:text-ink-soft">
                  {p.dates}
                </p>

                <span aria-hidden="true" className="mt-5 block h-px w-12 bg-bronze" />

                <p className="mt-5 text-[1.0625rem] italic text-papyrus/90 transition-colors group-hover:text-ink">
                  {p.principle}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-papyrus/60 transition-colors group-hover:text-ink-soft">
                  {prompts[p.slug] ?? p.summary}
                </p>

                <span className="label mt-8 inline-block border-b border-transparent text-gold transition-colors group-hover:border-oxblood group-hover:text-oxblood">
                  Explore this approach <span aria-hidden="true">↗</span>
                </span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-bronze/60" />
    </section>
  );
}
