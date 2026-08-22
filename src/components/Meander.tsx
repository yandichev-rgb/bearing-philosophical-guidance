/** Greek meander inspired divider drawn from thin repeating ink lines. */
export function Meander({ className = "" }: { className?: string }) {
  return (
    <div className={`shell ${className}`} aria-hidden="true">
      <div className="h-[18px] w-full overflow-hidden border-y border-ink/20">
        <svg
          className="h-[18px] w-full text-ink/45"
          viewBox="0 0 96 18"
          preserveAspectRatio="xMidYMid repeat"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M0 14h6V4h10v10h6V8h4v6h6V4h10v10h6V4h4" />
          <path d="M24 4h-6M48 14h6V4h10v10h6V8h4v6h6V4h10v10h6" />
        </svg>
      </div>
    </div>
  );
}
