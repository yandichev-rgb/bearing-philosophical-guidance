import type { Philosopher } from "@/data/philosophers";
import { Modal } from "./Modal";

export function PhilosopherModal({
  philosopher,
  onClose,
  onStart,
}: {
  philosopher: Philosopher | null;
  onClose: () => void;
  onStart: () => void;
}) {
  if (!philosopher) return null;
  const p = philosopher;

  return (
    <Modal
      open
      onClose={onClose}
      labelledBy="philosopher-name"
      className="my-0 max-w-4xl sm:my-6"
    >
      <div className="flex items-center justify-between border-b border-ink/25 px-6 py-4 sm:px-10">
        <p className="label text-ink-soft">{p.school}</p>
        <button type="button" onClick={onClose} className="label text-ink hover:text-oxblood">
          Close <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="grid gap-10 px-6 py-9 sm:px-10 sm:py-12 md:grid-cols-[186px_1fr] md:gap-12">
        <div>
          <div className="border border-ink/70 p-[3px] shadow-engraved">
            <img
              src={p.portrait}
              alt={p.portraitAlt}
              loading="lazy"
              width={186}
              height={186}
              className="block h-[186px] w-[186px] border border-ink/40 object-cover"
            />
          </div>
          <p className="label mt-5 text-ink-soft">{p.dates}</p>
        </div>

        <div>
          <h2 id="philosopher-name" className="display-lg text-ink">
            {p.name}
          </h2>
          <p className="mt-4 text-xl italic text-oxblood">{p.principle}</p>
          <p className="mt-6 leading-relaxed text-ink-soft">{p.overview}</p>

          <h3 className="label mt-12 text-ink">The method</h3>
          <p className="mt-4 leading-relaxed text-ink-soft">{p.method}</p>

          <h3 className="label mt-10 text-ink">Concepts used in readings</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {p.concepts.map((concept) => (
              <li key={concept} className="label border border-ink/30 px-3 py-2 text-ink-soft">
                {concept}
              </li>
            ))}
          </ul>

          <h3 className="label mt-10 text-ink">Primary works</h3>
          <ul className="mt-4 border-t border-ink/20">
            {p.works.map((work) => (
              <li key={work} className="border-b border-ink/15 py-3 text-sm italic text-ink-soft">
                {work}
              </li>
            ))}
          </ul>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="border border-ink/25 p-6">
              <p className="label text-oxblood">What this approach notices</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.notices}</p>
            </div>
            <div className="border border-ink/25 p-6">
              <p className="label text-ink-soft">What this approach may miss</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.misses}</p>
            </div>
          </div>

          <h3 className="label mt-12 text-ink">Four central principles</h3>
          <div className="mt-5 grid gap-px border border-ink/25 bg-ink/25 sm:grid-cols-2">
            {p.principles.map((principle) => (
              <div key={principle.title} className="bg-papyrus-light/70 p-6">
                <h4 className="text-lg text-ink">{principle.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{principle.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="border border-ink/25 p-6">
              <p className="label text-oxblood">Best for thinking about</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{p.bestFor}</p>
            </div>
            <div className="border border-ink/25 bg-papyrus-light/60 p-6">
              <p className="label text-oxblood">The question to sit with</p>
              <p className="mt-3 text-lg italic text-ink">{p.question}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => {
                onClose();
                onStart();
              }}
              className="btn-ink"
            >
              {p.free ? "Get my free reading" : `Ask ${p.name}`}
            </button>
            <a
              href="#sample"
              onClick={onClose}
              className="link-underline"
            >
              See this method applied
            </a>
          </div>

        </div>
      </div>
    </Modal>
  );
}
