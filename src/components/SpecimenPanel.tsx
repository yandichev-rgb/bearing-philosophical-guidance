import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { specimens, type Specimen } from "@/data/specimens";
import { Seal } from "./Seal";

const TYPE_SPEED = 34;
const COMPOSE_PAUSE = 900;
const SECTION_GAP = 620;
const HOLD = 4200;

type Phase = "typing" | "composing" | "reading" | "holding";

/**
 * The hero specimen: a framed sheet that demonstrates a real Bearing reading.
 * A concern is chosen, the question types itself, then the reading unfolds
 * section by section. Fixed copy, no server call.
 */
export function SpecimenPanel({ onStart }: { onStart: (kind: Specimen["kind"]) => void }) {
  const still = useReducedMotion();
  const [index, setIndex] = useState(0);
  // Nothing animates until a reader chooses a specimen; the first one sits finished.
  const [run, setRun] = useState(0);
  const [typed, setTyped] = useState(specimens[0]!.question);
  const [revealed, setRevealed] = useState(specimens[0]!.sections.length);
  const [phase, setPhase] = useState<Phase>("holding");
  const paused = useRef(false);
  const current = specimens[index]!;

  const select = (i: number) => {
    setIndex(i);
    setRun((value) => value + 1);
  };

  useEffect(() => {
    if (still || run === 0) {
      setTyped(current.question);
      setRevealed(current.sections.length);
      setPhase("holding");
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, run: () => void) => {
      timers.push(setTimeout(run, ms));
    };

    setTyped("");
    setRevealed(0);
    setPhase("typing");

    const question = current.question;
    let cursor = 0;
    const tick = () => {
      if (cancelled || paused.current) {
        if (!cancelled) timers.push(setTimeout(tick, 240));
        return;
      }
      cursor += 1;
      setTyped(question.slice(0, cursor));
      if (cursor < question.length) {
        timers.push(setTimeout(tick, TYPE_SPEED));
        return;
      }
      setPhase("composing");
      at(COMPOSE_PAUSE, () => {
        setPhase("reading");
        current.sections.forEach((_, i) => {
          at(COMPOSE_PAUSE + i * SECTION_GAP, () => setRevealed(i + 1));
        });
        at(COMPOSE_PAUSE + current.sections.length * SECTION_GAP, () => setPhase("holding"));
      });
    };
    timers.push(setTimeout(tick, 300));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [run, still, current]);


  return (
    <div
      className="plate grain relative"
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
    >
      {/* Header: seal, folio, register mark */}
      <div className="relative flex items-center justify-between gap-4 border-b border-ink/25 px-5 py-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <Seal size={30} className="shrink-0" />
          <div className="min-w-0">
            <p className="label text-ink-soft">A reading in progress</p>
            <p className="truncate text-[1.0625rem] text-ink">
              {current.philosopher}
              <span className="text-ink-soft"> · {current.method}</span>
            </p>
          </div>
        </div>
        <span className="folio hidden shrink-0 sm:block">Fol. {index + 1} / {specimens.length}</span>
      </div>

      {/* Concern chips */}
      <div className="flex flex-wrap gap-2 border-b border-ink/20 px-5 py-4 sm:px-7">
        {specimens.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-pressed={i === index}
            className={`chip ${i === index ? "chip-active" : ""}`}
          >
            {item.chip}
          </button>
        ))}
      </div>

      {/* Question line */}
      <div className="px-5 pt-6 sm:px-7">
        <p className="label text-ink-soft">The question brought in</p>
        <p
          className="mt-3 border-b border-ink/25 pb-3 text-[1.15rem] leading-snug text-ink"
          style={{ fontFamily: "var(--font-display)", minHeight: "3.2rem" }}
        >
          {typed}
          {phase === "typing" && !still ? (
            <span aria-hidden="true" className="caret">
              &nbsp;
            </span>
          ) : null}
        </p>
      </div>

      {/* Reading body */}
      <div className="relative min-h-[260px] px-5 pb-6 pt-6 sm:min-h-[300px] sm:px-7">
        {phase === "composing" ? (
          <p className="label flex items-center gap-2 text-oxblood">
            Composing the reading
            <span aria-hidden="true" className="flex gap-1">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="block h-[3px] w-[3px] bg-oxblood"
                  animate={still ? { opacity: 1 } : { opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: dot * 0.18 }}
                />
              ))}
            </span>
          </p>
        ) : null}

        <AnimatePresence mode="popLayout">
          {current.sections.slice(0, revealed).map((section, i) => (
            <motion.div
              key={`${current.id}-${section.heading}`}
              initial={still ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 0.68, 0.3, 1] }}
              className={i === 0 ? "" : "mt-5 border-t border-ink/15 pt-5"}
            >
              <p className="label text-oxblood">{section.heading}</p>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-soft">{section.body}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/25 px-5 py-4 sm:px-7">
        <p className="label text-ink-soft">Specimen · fixed text</p>
        <button type="button" onClick={() => onStart(current.kind)} className="btn-outline-ink">
          Bring my own question <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
