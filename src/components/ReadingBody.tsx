import { useState } from "react";

/**
 * The reading itself. New readings carry the full source-grounded structure;
 * readings saved before that change carry only the legacy fields, so every new
 * field is optional and simply omitted when absent.
 */
export type ReadingLike = {
  headline: string;
  noticed: string;
  assumption: string;
  principle: string;
  exercise: string;
  question: string;
  note?: string | null;
  tension?: string | null;
  method?: string | null;
  grounding?: string | null;
  challenge?: string | null;
  limits?: string | null;
  returnPrompt?: string | null;
};

function Section({
  label,
  children,
  tone = "ink",
}: {
  label: string;
  children: React.ReactNode;
  tone?: "ink" | "oxblood";
}) {
  return (
    <div className="mt-7 border-t border-ink/20 pt-6">
      <p className={`label ${tone === "oxblood" ? "text-oxblood" : "text-ink-soft"}`}>{label}</p>
      {children}
    </div>
  );
}

/** Citations are inspectable without interrupting the reading. */
export function SourceDrawer({ grounding }: { grounding: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-7 border-t border-ink/20 pt-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="label inline-flex items-center gap-2 text-ink-soft hover:text-oxblood"
      >
        <span aria-hidden="true" className="text-oxblood">
          ◆
        </span>
        Sources and grounding
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="mt-4 border-l-2 border-bronze/70 bg-papyrus-light/60 p-5">
          <p className="text-sm leading-relaxed text-ink-soft">{grounding}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">
            Bearing applies philosophical methods without pretending to speak as historical thinkers.
            Ideas are presented as interpretation unless a quotation is given verbatim.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function ReadingBody({ reading }: { reading: ReadingLike }) {
  return (
    <div>
      <p className="label text-oxblood">What stands out</p>
      <p className="drop-initial mt-3 text-[1.0625rem] leading-relaxed text-ink">
        {reading.noticed}
      </p>

      <Section label="The tension underneath" tone="oxblood">
        <p className="mt-3 leading-relaxed text-ink">{reading.tension || reading.assumption}</p>
      </Section>

      <Section label="The method">
        <p className="mt-3 leading-relaxed text-ink-soft">{reading.method || reading.principle}</p>
      </Section>

      {reading.challenge ? (
        <Section label="The challenge" tone="oxblood">
          <p className="mt-3 leading-relaxed text-ink">{reading.challenge}</p>
        </Section>
      ) : null}

      <Section label="One better question" tone="oxblood">
        <p
          className="mt-3 text-[1.2rem] leading-snug text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {reading.question}
        </p>
      </Section>

      <Section label="One experiment">
        <p className="mt-3 leading-relaxed text-ink">{reading.exercise}</p>
      </Section>

      {reading.returnPrompt ? (
        <Section label="Return">
          <p className="mt-3 leading-relaxed text-ink">{reading.returnPrompt}</p>
        </Section>
      ) : null}

      {reading.limits ? (
        <Section label="What this lens may miss">
          <p className="mt-3 text-sm italic leading-relaxed text-ink-soft">{reading.limits}</p>
        </Section>
      ) : null}

      {reading.grounding ? <SourceDrawer grounding={reading.grounding} /> : null}
    </div>
  );
}
