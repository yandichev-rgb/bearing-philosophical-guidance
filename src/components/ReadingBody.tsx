import { useState, type ReactNode } from "react";

import { philosophers } from "@/data/philosophers";
import { readingHeading } from "@/lib/reading-heading";

/**
 * The reading as the surface renders it. New readings carry the full structure;
 * readings saved before this pipeline carry only the legacy prose fields, so
 * every added field is optional and simply omitted when absent.
 */
export type ReadingLike = {
  headline: string;
  noticed: string;
  question: string;
  method?: string | null;
  grounding?: string | null;
  limits?: string | null;
  returnPrompt?: string | null;
  alternativeReading?: string | null;
  lensName?: string | null;
  conceptsUsed?: string[] | null;
  practiceTitle?: string | null;
  practiceDuration?: string | null;
  practiceSteps?: string[] | null;
  whatToObserve?: string | null;
  sources?: { work: string; location: string }[] | null;
  note?: string | null;
  /** Legacy fields on readings saved before the structured pipeline. */
  exercise?: string | null;
  principle?: string | null;
};

const PROSE = "max-w-[68ch] text-[1.0625rem] leading-[1.7] text-ink sm:text-[1.1875rem]";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p
      className="mb-3 text-[0.8125rem] tracking-[0.16em] text-ink-soft uppercase"
      style={{ fontFamily: "var(--font-display)" }}
    >
      {children}
    </p>
  );
}

/** Split prose into sentences so a legacy practice can still be shown as steps. */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z“"])/)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** A quiet collapsed disclosure for secondary material. */
export function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-ink/15 py-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left text-[0.9375rem] text-ink-soft hover:text-oxblood"
        style={{ fontFamily: "var(--font-display)" }}
      >
        <span>{title}</span>
        <span aria-hidden="true" className="text-oxblood">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? <div className="pt-4">{children}</div> : null}
    </div>
  );
}

/** Detailed citations and the standing interpretation notice. */
export function SourceDrawer({
  citation,
  sources,
}: {
  citation?: string | null;
  sources?: { work: string; location: string }[] | null;
}) {
  const list = (sources ?? []).filter((source) => source?.work && source?.location);
  return (
    <Disclosure title="Sources and further reading">
      {citation ? (
        <p className="max-w-[68ch] text-[0.9375rem] leading-[1.7] text-ink-soft">{citation}</p>
      ) : null}
      {list.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {list.map((source) => (
            <li
              key={`${source.work} ${source.location}`}
              className="text-[0.9375rem] leading-snug text-ink"
            >
              {source.work}, {source.location}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-4 max-w-[68ch] text-[0.9375rem] leading-[1.7] text-ink-soft">
        Bearing applies each thinker's method without pretending to speak as them. Ideas are
        presented as interpretation, and nothing here is quoted.
      </p>
    </Disclosure>
  );
}

/**
 * The compact philosopher rail: portrait, tradition, method note, and the
 * primary sources a reading in this lens draws on.
 */
export function PhilosopherRail({
  slug,
  onAnotherLens,
}: {
  slug: string;
  onAnotherLens?: (() => void) | undefined;
}) {
  const philosopher = philosophers.find((entry) => entry.slug === slug) ?? philosophers[0]!;
  const sources = philosopher.works.slice(0, 3);

  return (
    <aside className="lg:sticky lg:top-8">
      <div className="flex items-start gap-4 lg:block">
        <img
          src={philosopher.portrait}
          alt={philosopher.portraitAlt}
          className="h-16 w-16 shrink-0 border border-ink/25 object-cover lg:h-20 lg:w-20"
          loading="lazy"
        />
        <div className="lg:mt-4">
          <p
            className="text-[1.375rem] leading-tight text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {philosopher.name}
          </p>
          <p className="mt-1 text-[0.9375rem] text-ink-soft">{philosopher.school}</p>
          <p
            className="mt-2 inline-flex items-center gap-2 text-[0.6875rem] tracking-[0.18em] text-oxblood uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span aria-hidden="true">◆</span> Source-grounded method
          </p>
        </div>
      </div>

      <p className="mt-4 max-w-[42ch] text-[0.9375rem] leading-[1.65] text-ink-soft">
        {philosopher.summary}
      </p>

      <div className="mt-5 border-t border-ink/15 pt-4">
        <p
          className="text-[0.6875rem] tracking-[0.18em] text-ink-soft uppercase"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Primary sources
        </p>
        <ul className="mt-3 space-y-2">
          {sources.map((source) => (
            <li key={source} className="text-[0.9375rem] leading-snug text-ink">
              {source}
            </li>
          ))}
        </ul>
      </div>

      {onAnotherLens ? (
        <button
          type="button"
          onClick={onAnotherLens}
          className="link-underline mt-5 inline-block text-[0.75rem]"
        >
          Try another lens
        </button>
      ) : null}
    </aside>
  );
}

/**
 * The experiment, shown as a practical action card. Numbering comes from the
 * native ordered list marker only, so steps read 1, 2, 3 exactly once.
 */
function PracticeCard({
  title,
  steps,
  observe,
  duration,
  onSave,
  saveLabel,
}: {
  title: string;
  steps: string[];
  observe?: string | null;
  duration?: string | null;
  onSave?: (() => void) | undefined;
  saveLabel?: string | undefined;
}) {
  if (steps.length === 0) return null;

  return (
    <div className="border border-ink/25 bg-papyrus/40 p-6 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p
          className="text-[1.25rem] leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </p>
        {duration ? (
          <p
            className="text-[0.6875rem] tracking-[0.18em] text-ink-soft uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {duration}
          </p>
        ) : null}
      </div>

      <ol className="mt-5 ml-6 list-decimal space-y-4 marker:text-[0.9375rem] marker:text-oxblood">
        {steps.map((step) => (
          <li key={step} className="pl-2 text-[1.0625rem] leading-[1.65] text-ink">
            {step}
          </li>
        ))}
      </ol>

      {observe ? (
        <div className="mt-6 border-t border-ink/15 pt-4">
          <p
            className="text-[0.6875rem] tracking-[0.18em] text-ink-soft uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            What to observe
          </p>
          <p className="mt-2 text-[1.0625rem] leading-[1.65] text-ink-soft">{observe}</p>
        </div>
      ) : null}

      {onSave ? (
        <button type="button" onClick={onSave} className="btn-outline-ink mt-6">
          {saveLabel ?? "Save this practice"}
        </button>
      ) : null}
    </div>
  );
}

/**
 * The reading surface: one continuous argument in five movements, with the
 * alternative reading in a compact block and the limits and citations collapsed.
 */
export function ReadingBody({
  reading,
  slug,
  hideHeader = false,
  onSavePractice,
}: {
  reading: ReadingLike;
  slug?: string;
  hideHeader?: boolean;
  onSavePractice?: () => void;
}) {
  const bearing = sentences(reading.noticed);
  const half = Math.ceil(bearing.length / 2);
  const paragraphs =
    bearing.length > 2
      ? [bearing.slice(0, half).join(" "), bearing.slice(half).join(" ")]
      : [reading.noticed];
  const lens = reading.method || reading.principle;
  const philosopher = slug ? philosophers.find((entry) => entry.slug === slug) : undefined;
  const citation = reading.grounding?.trim() || null;
  const concepts = (reading.conceptsUsed ?? []).filter(Boolean);

  // Structured practice when the reading has one, sentence split for older rows.
  const legacy = sentences(reading.exercise || "");
  const legacyObserve = legacy.length > 2 ? legacy[legacy.length - 1]! : null;
  const practiceSteps = (reading.practiceSteps ?? []).filter(Boolean);
  const steps = practiceSteps.length > 0 ? practiceSteps : legacyObserve ? legacy.slice(0, -1) : legacy;
  const observe = reading.whatToObserve?.trim() || (practiceSteps.length > 0 ? null : legacyObserve);

  return (
    <div>
      {hideHeader ? null : (
        <header className="max-w-[34ch] sm:max-w-[36ch]">
          <p
            className="text-[0.75rem] tracking-[0.22em] text-oxblood uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {readingHeading(slug ?? "").toUpperCase()}
          </p>
          <h2
            className="mt-4 text-[2.125rem] leading-[1.08] tracking-[-0.015em] text-ink sm:text-[2.75rem] lg:text-[3rem]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {reading.headline}
          </h2>
        </header>
      )}

      <div className={hideHeader ? "" : "mt-9"}>
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className={`${PROSE} mt-5 first:mt-0`}>
            {paragraph}
          </p>
        ))}
      </div>

      {lens ? (
        <section className="mt-10 border border-ink/15 bg-papyrus-light/70 p-6 sm:p-7">
          <SectionLabel>Through {philosopher?.name ?? reading.lensName ?? "this lens"}</SectionLabel>
          {concepts.length > 0 ? (
            <p
              className="mb-3 text-[0.9375rem] text-ink"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {concepts.join(" · ")}
            </p>
          ) : null}
          <p className="max-w-[66ch] text-[1.0625rem] leading-[1.7] text-ink">{lens}</p>
          {citation ? (
            <p className="mt-5 border-t border-ink/15 pt-4 text-[0.875rem] leading-snug text-ink-soft">
              {citation}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="mt-10 border-l-2 border-oxblood bg-oxblood/[0.04] py-5 pr-5 pl-6 sm:py-6 sm:pr-7 sm:pl-8">
        <SectionLabel>A better question</SectionLabel>
        <p
          className="max-w-[46ch] text-[1.375rem] leading-[1.35] text-ink italic sm:text-[1.625rem]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {reading.question}
        </p>
      </section>

      {steps.length > 0 ? (
        <section className="mt-10">
          <PracticeCard
            title={reading.practiceTitle?.trim() || "A practice to test this"}
            steps={steps}
            observe={observe}
            duration={reading.practiceDuration?.trim() || null}
            onSave={onSavePractice}
          />
        </section>
      ) : null}

      {reading.returnPrompt ? (
        <section className="mt-10 bg-papyrus/50 p-6 sm:p-7">
          <SectionLabel>When you return</SectionLabel>
          <p className="max-w-[66ch] text-[1.0625rem] leading-[1.7] text-ink-soft">
            {reading.returnPrompt}
          </p>
        </section>
      ) : null}

      {reading.alternativeReading ? (
        <section className="mt-8 border border-dashed border-ink/30 p-5 sm:p-6">
          <SectionLabel>Another possibility</SectionLabel>
          <p className="max-w-[66ch] text-[1rem] leading-[1.7] text-ink-soft">
            {reading.alternativeReading}
          </p>
        </section>
      ) : null}

      <div className="mt-10">
        {reading.limits ? (
          <Disclosure title="Limits of this interpretation">
            <p className="max-w-[68ch] text-[0.9375rem] leading-[1.7] text-ink-soft">
              {reading.limits}
            </p>
          </Disclosure>
        ) : null}
        <SourceDrawer citation={citation} sources={reading.sources} />
      </div>
    </div>
  );
}

/**
 * The centred two column composition: a narrow philosopher rail and the
 * reading column, stacked below the large breakpoint.
 */
export function ReadingLayout({
  slug,
  utility,
  children,
  onAnotherLens,
}: {
  slug: string;
  utility?: ReactNode;
  children: ReactNode;
  onAnotherLens?: (() => void) | undefined;
}) {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-6">
      {utility ? (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-ink/15 py-4">
          {utility}
        </div>
      ) : null}
      <div className="grid gap-10 py-8 lg:grid-cols-[210px_minmax(0,760px)] lg:gap-14 lg:py-10">
        <PhilosopherRail slug={slug} onAnotherLens={onAnotherLens} />
        <div className="border border-ink/20 bg-papyrus-light/85 p-6 shadow-sheet sm:p-9 lg:p-11">
          {children}
        </div>
      </div>
    </div>
  );
}
