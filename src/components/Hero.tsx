import { motion, useReducedMotion } from "motion/react";

import type { Specimen } from "@/data/specimens";
import { SpecimenPanel } from "./SpecimenPanel";

export function Hero({
  onStart,
  onStartWithKind,
}: {
  onStart: () => void;
  onStartWithKind: (kind: Specimen["kind"]) => void;
}) {
  const still = useReducedMotion();

  return (
    <section id="top" className="lamplight vignette relative overflow-hidden">
      {/* Engraved plate marks: register circles and margin ticks, drifting slowly. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -right-28 h-[560px] w-[560px] opacity-[0.14]"
        animate={still ? { y: 0 } : { y: [0, -14, 0], rotate: [0, 1.2, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 400 400" fill="none" stroke="var(--color-ink)" strokeWidth="1">
          <circle cx="240" cy="240" r="80" />
          <circle cx="240" cy="240" r="130" />
          <circle cx="240" cy="240" r="180" />
          <circle cx="240" cy="240" r="4" fill="var(--color-oxblood)" stroke="none" />
          <path d="M240 20v440M20 240h440" strokeDasharray="3 8" />
          <path d="M240 60L240 40M240 440L240 420M60 240H40M440 240H420" />
        </svg>
      </motion.div>

      <div className="shell relative z-[2] grid items-center gap-14 pt-14 pb-16 md:pt-20 lg:grid-cols-[1fr_1.02fr] lg:gap-16 lg:pb-24">
        <div>
          <motion.p
            className="label flex items-center gap-3 text-ink-soft"
            initial={still ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <span
              aria-hidden="true"
              className="flex h-6 w-6 items-center justify-center rounded-full border border-oxblood text-[11px] leading-none text-oxblood"
            >
              <span style={{ transform: "translate(1.25px, 0.6px)" }}>I</span>
            </span>
            <span>Philosophy for real life</span>
          </motion.p>

          <motion.h1
            className="display-hero mt-6 text-ink"
            style={{ fontSize: "clamp(2.6rem, 5.4vw, 4.6rem)" }}
            initial={still ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 0.68, 0.3, 1] }}
          >
            You don't need more advice.
            <br />
            You need <em className="italic text-oxblood">a better question.</em>
          </motion.h1>

          <p className="mt-8 max-w-lg text-[1.0625rem] leading-relaxed text-ink-soft">
            Bring a decision, recurring pattern, relationship, or fear. Bearing examines it through a
            philosophical lens, reveals the question underneath, and gives you one practical thing to
            try next.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-6">
            <button type="button" onClick={onStart} className="btn-ink">
              Get my free reading <span aria-hidden="true">→</span>
            </button>
            <a href="#sample" className="link-underline">
              See a sample reading
            </a>
          </div>

          <p className="label mt-9 text-ink-soft">
            First Aristotle reading free <span aria-hidden="true">·</span> No account or card to begin
          </p>
        </div>

        <motion.div
          initial={still ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 0.68, 0.3, 1] }}
        >
          <p className="label text-ink-soft">See what a reading does</p>
          <p className="mb-5 mt-3 max-w-md leading-relaxed text-ink-soft">
            One situation becomes a sharper question, a relevant philosophical principle, and one
            action you can take in real life.
          </p>
          <SpecimenPanel onStart={onStartWithKind} />
        </motion.div>

      </div>

      <div className="shell relative z-[2] flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink/20 py-5">
        <p className="label flex items-center gap-2 text-ink-soft">
          <span aria-hidden="true" className="text-oxblood">
            ◆
          </span>
          Six ways of examining a situation
        </p>
        <span aria-hidden="true" className="h-px w-6 bg-bronze" />
        <p className="label text-ink-soft">First Aristotle reading free</p>
        <span aria-hidden="true" className="h-px w-6 bg-bronze" />
        <p className="label text-ink-soft">No account or card to begin</p>
      </div>

    </section>
  );
}
