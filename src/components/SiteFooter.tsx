import { Seal, Wordmark } from "./Seal";

export function SiteFooter() {
  return (
    <footer className="sheet-dark border-t border-ink/25">
      <div className="shell grid gap-8 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:items-start">
        <div>
          <div className="flex min-w-0 items-center gap-3">
            <Seal size={40} className="shrink-0" />
            <Wordmark />
          </div>
          <p className="mt-5 max-w-xs italic leading-relaxed text-ink-soft">
            Clear thinking for real life.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-4">
          <p className="label text-oxblood">The site</p>
          <a href="/#lyceum" className="nav-link self-start">
            The Lyceum
          </a>
          <a href="/#how-it-works" className="nav-link self-start">
            How it works
          </a>
          <a href="/#membership" className="nav-link self-start">
            Membership
          </a>
          <a href="/privacy" className="nav-link self-start">
            Privacy
          </a>
        </nav>

        <div>
          <p className="label text-oxblood">Colophon</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
            Set in Palatino and Georgia. Printed on papyrus by lamplight. Six methods, one question
            at a time.
          </p>
        </div>
      </div>
      <div className="shell hairline-bronze py-6">
        <p className="label text-ink-soft">
          MMXXVI · Bearing is for reflection, not professional or clinical advice.
        </p>
      </div>
    </footer>
  );
}
