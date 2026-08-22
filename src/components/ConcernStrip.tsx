import { specimens, type Specimen } from "@/data/specimens";

/**
 * A tap-first entry: the six common concerns as pressable chips that open the
 * inquiry with the kind already set, so the first action is not a paragraph.
 */
export function ConcernStrip({ onPick }: { onPick: (kind: Specimen["kind"]) => void }) {
  return (
    <section aria-labelledby="concerns-heading" className="sheet-dark border-y border-ink/20">
      <div className="shell flex flex-col gap-5 py-7 lg:flex-row lg:items-center lg:gap-9">
        <h2 id="concerns-heading" className="label shrink-0 text-ink-soft">
          Bring one of these
        </h2>
        <ul className="flex flex-wrap gap-2">
          {specimens.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => onPick(item.kind)} className="chip">
                {item.chip}
              </button>
            </li>
          ))}
          <li>
            <span className="chip pointer-events-none border-dashed">or something else</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
