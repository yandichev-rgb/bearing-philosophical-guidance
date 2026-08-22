type SealProps = {
  size?: number;
  className?: string;
  tone?: "ink" | "papyrus";
};

/**
 * Bearing's printer's mark: a circular seal with an optically centered B,
 * a lighter inner ring, and a bead at twelve o'clock.
 */
export function Seal({ size = 36, className = "", tone = "ink" }: SealProps) {
  const ink = tone === "ink" ? "var(--color-ink)" : "var(--color-papyrus-light)";
  const face = tone === "ink" ? "var(--color-papyrus)" : "transparent";
  const inner = tone === "ink" ? "var(--color-bronze)" : "var(--color-gold)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="32" cy="32" r="29.5" fill={face} stroke={ink} strokeWidth="2" />
      <circle cx="32" cy="32" r="24.5" fill="none" stroke={inner} strokeWidth="1" />
      <circle cx="32" cy="3.6" r="3.4" fill={ink} />
      <text
        x="32"
        y="34"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={ink}
        style={{ fontFamily: "var(--font-seal)", fontSize: 33, letterSpacing: "0.01em" }}
      >
        B
      </text>
    </svg>
  );
}

export function Wordmark({ tone = "ink" }: { tone?: "ink" | "papyrus" }) {
  return (
    <span
      className={tone === "ink" ? "text-ink" : "text-papyrus-light"}
      style={{
        fontFamily: "var(--font-display)",
        fontSize: 17,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        lineHeight: 1,
      }}
    >
      Bearing
    </span>
  );
}
