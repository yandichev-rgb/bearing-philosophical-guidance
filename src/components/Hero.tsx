export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 h-[420px] w-[420px] opacity-[0.13]"
      >
        <svg viewBox="0 0 400 400" fill="none" stroke="var(--color-ink)" strokeWidth="1">
          <circle cx="240" cy="240" r="80" />
          <circle cx="240" cy="240" r="130" />
          <circle cx="240" cy="240" r="180" />
          <path d="M240 20v440M20 240h440" strokeDasharray="3 8" />
        </svg>
      </div>

      <div className="shell relative grid gap-12 pt-16 pb-20 md:pt-24 lg:grid-cols-[1.35fr_1fr] lg:gap-14 lg:pb-28">
        <div>
          <p className="label flex items-center gap-3 text-ink-soft">
            <span
              aria-hidden="true"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-oxblood text-[10px] text-oxblood"
            >
              I
            </span>
            <span>Know thyself</span>
          </p>

          <h1 className="display-hero mt-7 text-ink">
            Find your
            <br />
            <em className="italic text-oxblood">bearing.</em>
          </h1>
        </div>

        <div className="flex flex-col justify-end lg:rule-v lg:pl-12">
          <p className="max-w-md text-[1.0625rem] leading-relaxed text-ink-soft">
            Tell us what you're facing. Bearing looks at it through the ideas of Aristotle,
            Socrates, the Stoics, and others. Then it helps you decide what to do next.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <button type="button" onClick={onStart} className="btn-ink">
              Begin with Aristotle <span aria-hidden="true">→</span>
            </button>
            <a href="#lyceum" className="link-underline">
              Enter the Lyceum
            </a>
          </div>

          <p className="label mt-8 flex items-center gap-2 text-ink-soft">
            <span aria-hidden="true" className="text-oxblood">
              ◆
            </span>
            Your first reading, with Aristotle, is free.
          </p>
        </div>
      </div>
    </section>
  );
}
