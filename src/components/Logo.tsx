/**
 * The Twin's Golden Cafe lockup, rebuilt in type so it stays crisp at any size
 * and inherits the surrounding colour: orange wordmark, the "O" of GOLDEN
 * replaced by the spoon-and-fork disc, and rule-flanked CAFE beneath.
 */
export function Logo({ className = "", onDark = false }: { className?: string; onDark?: boolean }) {
  const sub = onDark ? "text-paper" : "text-ink";

  return (
    // the "O" is drawn, not typed, so the lockup carries its own accessible
    // name and the letters themselves are hidden from assistive tech
    <span
      role="img"
      aria-label="Twin's Golden Cafe"
      className={`inline-flex flex-col items-center leading-none ${className}`}
    >
      <span
        aria-hidden
        className="font-display text-[1.1em] font-black tracking-[-0.04em] text-orange"
      >
        TWIN&apos;S
      </span>

      <span
        aria-hidden
        className="mt-[0.08em] inline-flex items-center font-display text-[1.1em] font-black tracking-[-0.04em] text-orange"
      >
        G
        <CutleryDisc onDark={onDark} />
        LDEN
      </span>

      <span
        aria-hidden
        className={`mt-[0.32em] flex w-full items-center gap-[0.4em] text-[0.34em] font-extrabold tracking-[0.42em] ${sub}`}
      >
        <span className="h-px flex-1 bg-current opacity-70" />
        CAFE
        <span className="h-px flex-1 bg-current opacity-70" />
      </span>
    </span>
  );
}

/** The dark disc with a spoon and fork that stands in for the letter O. */
function CutleryDisc({ onDark }: { onDark: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      focusable="false"
      className="mx-[0.02em] inline-block size-[0.92em] shrink-0 translate-y-[0.04em]"
    >
      <circle cx="50" cy="50" r="50" fill={onDark ? "#ffffff" : "#111111"} />
      {/* spoon */}
      <ellipse cx="38" cy="36" rx="11" ry="15" fill={onDark ? "#111111" : "#ffffff"} />
      <rect x="34.5" y="48" width="7" height="34" rx="3.5" fill={onDark ? "#111111" : "#ffffff"} />
      {/* fork */}
      <rect x="57" y="20" width="4.5" height="26" rx="2.2" fill={onDark ? "#111111" : "#ffffff"} />
      <rect x="65" y="20" width="4.5" height="26" rx="2.2" fill={onDark ? "#111111" : "#ffffff"} />
      <rect x="73" y="20" width="4.5" height="26" rx="2.2" fill={onDark ? "#111111" : "#ffffff"} />
      <path
        d="M55 44h25c0 7-5 12-10.5 13v25a4 4 0 0 1-8 0V57C56 56 55 51 55 44Z"
        fill={onDark ? "#111111" : "#ffffff"}
      />
    </svg>
  );
}
