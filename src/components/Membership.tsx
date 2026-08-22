import { MEMBERSHIP } from "@/config/membership";
import { SectionLabel } from "./SectionLabel";

export function Membership({ onStart }: { onStart: () => void }) {
  return (
    <section id="membership" aria-labelledby="membership-heading" className="shell py-20 lg:py-28">
      <div className="relative overflow-hidden bg-oxblood px-6 py-16 text-papyrus sm:px-12 lg:px-16 lg:py-24">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 right-4 select-none text-[22vw] leading-none text-papyrus/[0.07]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          VI
        </span>

        <div className="relative max-w-3xl">
          <SectionLabel numeral="VI" tone="papyrus">
            Continue with the Lyceum
          </SectionLabel>
          <h2 id="membership-heading" className="display-lg mt-8 text-papyrus-light">
            One question can have
            <br />
            more than one honest answer.
          </h2>
          <p className="mt-7 max-w-xl leading-relaxed text-papyrus/85">
            Your first reading with Aristotle is free. Membership opens the full Lyceum, so you can
            compare how different philosophers would approach the same decision.
          </p>

          {MEMBERSHIP.priceLabel ? (
            <p className="label mt-8 text-papyrus-light">{MEMBERSHIP.priceLabel}</p>
          ) : null}

          <div className="mt-10">
            <button type="button" onClick={onStart} className="btn-papyrus">
              Get my free reading
            </button>
          </div>

          <p className="label mt-7 text-papyrus/70">
            No card required. Your answers stay private.
          </p>
        </div>
      </div>
    </section>
  );
}
