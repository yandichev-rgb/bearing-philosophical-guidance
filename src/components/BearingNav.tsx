import { useState } from "react";
import { Seal, Wordmark } from "./Seal";

const links = [
  { href: "#lyceum", label: "The Lyceum" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#membership", label: "Membership" },
];

export function BearingNav({ onStart }: { onStart: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/25 bg-papyrus-light/90 shadow-rail backdrop-blur-[2px]">
      <div className="shell flex h-[68px] items-center justify-between gap-4">
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label="Bearing home">
          <Seal size={36} className="shrink-0" />
          <Wordmark />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
          <button type="button" onClick={onStart} className="btn-outline-ink">
            Start free
          </button>
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center gap-[6px] border border-ink/50 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="block h-px w-5 bg-ink" />
          <span className="block h-px w-5 bg-ink" />
        </button>
      </div>

      {open ? (
        <div id="mobile-nav" className="border-t border-ink/20 bg-papyrus-light md:hidden">
          <nav aria-label="Mobile" className="shell flex flex-col py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="label border-b border-ink/15 py-4 text-ink"
              >
                {link.label}
              </a>
            ))}
            <button
              type="button"
              className="btn-ink mt-5"
              onClick={() => {
                setOpen(false);
                onStart();
              }}
            >
              Start free
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
