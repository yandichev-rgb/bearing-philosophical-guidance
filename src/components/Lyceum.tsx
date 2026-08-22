import { philosophers, romanNumerals, type Philosopher } from "@/data/philosophers";
import { SectionLabel } from "./SectionLabel";

export function Lyceum({ onSelect }: { onSelect: (p: Philosopher) => void }) {
  return (
    <section
      id="lyceum"
      aria-labelledby="lyceum-heading"
      className="relative overflow-hidden bg-lyceum py-20 text-papyrus lg:py-28"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 right-4 select-none text-[26vw] leading-none text-papyrus/[0.035]"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "0.04em" }}
      >
        LYCEVM
      </span>

      <div className="shell relative">
        <SectionLabel numeral="III" tone="papyrus">
          The Lyceum
        </SectionLabel>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <h2 id="lyceum-heading" className="display-lg text-papyrus-light">
            Choose a mind
            <br />
            to think beside.
          </h2>
          <p className="max-w-md leading-relaxed text-gold/85">
            Start with the philosopher who feels useful. Or choose the one most likely to disagree
            with you.
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-1 border border-papyrus/25 sm:grid-cols-2 xl:grid-cols-3">
          {philosophers.map((p, index) => (
            <li key={p.slug} className="border-b border-r border-papyrus/25 last:border-b-0">
              <button
                type="button"
                onClick={() => onSelect(p)}
                className="group flex h-full w-full flex-col items-start p-7 text-left transition-colors duration-200 hover:bg-papyrus focus-visible:bg-papyrus"
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <span className="label text-gold/80 transition-colors group-hover:text-ink-soft">
                    {romanNumerals[index]}
                  </span>
                  {p.free ? (
                    <span className="label border border-oxblood px-2 py-1 text-oxblood group-hover:border-oxblood">
                      Begin here
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 border border-ink/70 p-[3px] shadow-engraved">
                  <img
                    src={p.portrait}
                    alt={p.portraitAlt}
                    loading="lazy"
                    width={186}
                    height={186}
                    className="block h-[186px] w-[186px] border border-ink/40 object-cover"
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
                <p className="mt-3 text-sm leading-relaxed text-papyrus/60 transition-colors group-hover:text-ink-soft">
                  {p.summary}
                </p>

                <span className="label mt-8 text-gold transition-colors group-hover:text-oxblood">
                  View teachings <span aria-hidden="true">↗</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
