const meander = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="18" viewBox="0 0 48 18" fill="none" stroke="%23000" stroke-opacity="0.45" stroke-width="1"><path d="M0 15h5V5h9v10h5V9h4v6h5V5h9v10h5V5h5"/><path d="M14 5h-5M33 9h4"/></svg>`,
);

/** Greek meander inspired divider drawn from thin repeating ink lines. */
export function Meander({ className = "" }: { className?: string }) {
  return (
    <div className={`shell ${className}`} aria-hidden="true">
      <div
        className="h-[18px] w-full border-y border-ink/20"
        style={{
          backgroundImage: `url("data:image/svg+xml,${meander}")`,
          backgroundRepeat: "repeat-x",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}
