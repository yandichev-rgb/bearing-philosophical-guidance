import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { Seal, Wordmark } from "./Seal";
import { SiteFooter } from "./SiteFooter";

/**
 * The shared page frame for every page beyond the landing page.
 * Lamplit papyrus: a warm light pool at the top, an edge vignette, a dark
 * sheet header with a bronze hairline, and the colophon footer.
 */
export function PageFrame({
  children,
  actions,
  folio,
  banner,
}: {
  children: ReactNode;
  actions?: ReactNode;
  /** Small register mark set in the header margin, e.g. "Fol. II". */
  folio?: string;
  /** Rendered above the header, for notices such as test mode. */
  banner?: ReactNode;
}) {
  return (
    <div className="paper grain flex min-h-screen flex-col">
      {banner}
      <header className="sheet-dark relative z-20 border-b border-ink/25">
        <div className="shell flex h-[72px] items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Bearing home">
            <Seal size={34} className="shrink-0" />
            <Wordmark />
          </Link>
          <div className="flex items-center gap-6">
            {folio ? <span className="folio hidden sm:block">{folio}</span> : null}
            {actions}
          </div>
        </div>
        <div className="hairline-bronze" />
      </header>

      <main className="lamplight vignette relative flex-1">
        <div className="relative z-[2]">{children}</div>
      </main>

      <SiteFooter />
    </div>
  );
}

/**
 * A pressed plate sheet: how page content sits on the papyrus.
 */
export function Sheet({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`plate grain p-7 sm:p-10 ${className}`}>{children}</div>;
}
