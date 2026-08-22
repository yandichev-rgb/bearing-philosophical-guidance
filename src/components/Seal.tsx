type Detail = "full" | "medium" | "minimal";

type SealProps = {
  size?: number;
  className?: string;
  tone?: "ink" | "papyrus";
  detail?: Detail;
};

function detailFor(size: number): Detail {
  if (size >= 96) return "full";
  if (size >= 30) return "medium";
  return "minimal";
}

/**
 * Bearing's mark: an engraved compass rose. The needles converge on a small
 * pivot, and at large sizes the cardinal points carry philosopher initials.
 */
export function Seal({ size = 36, className = "", tone = "ink", detail }: SealProps) {
  const ink = tone === "ink" ? "var(--color-ink)" : "var(--color-papyrus-light)";
  const face = tone === "ink" ? "var(--color-papyrus)" : "transparent";
  const hair = tone === "ink" ? "var(--color-bronze)" : "var(--color-gold)";
  const level = detail ?? detailFor(size);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <circle cx="32" cy="32" r="29.5" fill={face} stroke={ink} strokeWidth={level === "minimal" ? 2.5 : 2} />

      {level !== "minimal" && (
        <circle cx="32" cy="32" r="25" fill="none" stroke={hair} strokeWidth="0.7" strokeDasharray="1 2.4" />
      )}

      {level === "full" && (
        <g stroke={hair} strokeWidth="0.7" opacity="0.85">
          <line x1="32" y1="32" x2="47" y2="17" />
          <line x1="32" y1="32" x2="47" y2="47" />
          <line x1="32" y1="32" x2="17" y2="47" />
          <line x1="32" y1="32" x2="17" y2="17" />
        </g>
      )}

      {/* North needle */}
      <path d="M32 8 L34.6 30.4 L32 32 L29.4 30.4 Z" fill={ink} />

      {level !== "minimal" && (
        <g fill={ink} opacity="0.62">
          <path d="M32 56 L34.6 33.6 L32 32 L29.4 33.6 Z" />
          <path d="M56 32 L33.6 34.6 L32 32 L33.6 29.4 Z" />
          <path d="M8 32 L30.4 34.6 L32 32 L30.4 29.4 Z" />
        </g>
      )}

      {level === "full" && (
        <g
          fill={ink}
          textAnchor="middle"
          style={{ fontFamily: "var(--font-seal)", fontSize: 6.4, letterSpacing: "0.02em" }}
        >
          <text x="32" y="5.4" dominantBaseline="middle">A</text>
          <text x="59.2" y="32" dominantBaseline="middle">P</text>
          <text x="32" y="59.2" dominantBaseline="middle">S</text>
          <text x="4.8" y="32" dominantBaseline="middle">M</text>
        </g>
      )}

      {/* Pivot */}
      {level !== "minimal" && <circle cx="32" cy="32" r="4.2" fill="none" stroke={hair} strokeWidth="0.8" />}
      <circle cx="32" cy="32" r={level === "minimal" ? 3 : 2.2} fill={ink} />

      {/* Bead at twelve o'clock */}
      {level !== "minimal" && <circle cx="32" cy="2.6" r={level === "full" ? 2 : 2.4} fill={ink} />}
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
