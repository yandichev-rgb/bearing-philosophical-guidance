export function SectionLabel({
  numeral,
  children,
  tone = "ink",
}: {
  numeral: string;
  children: string;
  tone?: "ink" | "papyrus";
}) {
  return (
    <p
      className={`label flex items-center gap-2 ${
        tone === "ink" ? "text-ink-soft" : "text-gold"
      }`}
    >
      <span>{numeral}</span>
      <span aria-hidden="true">·</span>
      <span>{children}</span>
    </p>
  );
}
