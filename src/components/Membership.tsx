import { Link } from "@tanstack/react-router";

import { MEMBERSHIP } from "@/config/membership";
import { SectionLabel } from "./SectionLabel";
import { Reveal } from "./Reveal";

export function Membership({ onStart }: { onStart: () => void }) {
  return (
    <section id="membership" aria-labelledby="membership-heading" className="shell py-20 lg:py-28">
      <Reveal>
        <div className="relative overflow-hidden bg-oxblood px-6 py-16 text-papyrus sm:px-12 lg:px-16 lg:py-20">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 right-4 select-none text-[22vw] leading-none text-papyrus/[0.07]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            VI
          </span>
          <span aria-hidden="true" className="pointer-events-none absolute inset-4 border border-papyrus/20" />

          <div className="relative grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <SectionLabel numeral="VI" tone="papyrus">
                Continue with the Lyceum
              </SectionLabel>
              <h2 id="membership-heading" className="display-lg mt-8 text-papyrus-light">
                One question can have
                <br />
                more than one honest answer.
              </h2>
              <p className="mt-7 max-w-xl leading-relaxed text-papyrus/85">
                Your first reading with Aristotle is free. Membership opens the full Lyceum, so the
                same decision can be read through several different methods.
              </p>

              <ul className="mt-9 grid gap-3">
                {MEMBERSHIP.benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 text-papyrus/90">
                    <span aria-hidden="true" className="text-gold">
                      ✦
                    </span>
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap items-center gap-6">
                <button type="button" onClick={onStart} className="btn-papyrus">
                  Get my free reading
                </button>
                <Link to="/membership" className="link-underline text-papyrus-light">
                  See membership
                </Link>
              </div>

              <p className="label mt-7 text-papyrus/70">
                No card required to begin. Your answers stay private.
              </p>
            </div>

            {/* The ledger: prices set as entries with a bronze rule. */}
            <div className="relative self-start border border-papyrus/25 p-7">
              <p className="label text-gold">The ledger</p>
              <ul className="mt-6 grid gap-6">
                {MEMBERSHIP.plans.map((plan, index) => (
                  <li key={plan.priceId} className={index === 0 ? "" : "border-t border-papyrus/20 pt-6"}>
                    <p className="label text-papyrus/70">{plan.label}</p>
                    <p
                      className="mt-2 flex items-baseline gap-2 text-papyrus-light"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      <span className="text-4xl">{plan.price}</span>
                      <span className="text-sm text-papyrus/70">{plan.cadence}</span>
                    </p>
                    <span aria-hidden="true" className="mt-4 block h-px w-14 bg-gold/70" />
                    <p className="mt-3 text-sm leading-relaxed text-papyrus/70">{plan.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
