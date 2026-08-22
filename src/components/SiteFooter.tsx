import { Seal, Wordmark } from "./Seal";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/25">
      <div className="shell grid gap-8 py-12 md:grid-cols-3 md:items-center">
        <div className="flex min-w-0 items-center gap-3">
          <Seal size={32} className="shrink-0" />
          <Wordmark />
        </div>
        <p className="text-center text-sm italic text-ink-soft md:text-center">
          Clear thinking for real life.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-6 md:justify-end">
          <a href="#lyceum" className="nav-link">
            The Lyceum
          </a>
          <a href="#how-it-works" className="nav-link">
            How it works
          </a>
          <a href="/privacy" className="nav-link">
            Privacy
          </a>
        </nav>
      </div>
      <div className="shell border-t border-ink/15 py-6">
        <p className="label text-ink-soft">
          MMXXVI · Bearing is for reflection, not professional or clinical advice.
        </p>
      </div>
    </footer>
  );
}
