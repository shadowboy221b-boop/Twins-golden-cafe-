/**
 * The backdrop behind the menu: a warm paper ground with two very slow colour
 * fields drifting across it. Deliberately quiet — the menu is the content, so
 * nothing here competes with the type. Fixed, non-interactive, and frozen by
 * the global prefers-reduced-motion rule.
 */
export function MenuBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, oklch(0.993 0.005 80) 0%, oklch(0.978 0.014 72) 50%, oklch(0.962 0.024 64) 100%)",
        }}
      />

      <div
        className="blob-a absolute -left-[18vw] top-[-12vh] size-[60vw] rounded-full opacity-[0.13]"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 70%)" }}
      />
      <div
        className="blob-b absolute -right-[15vw] top-[45vh] size-[55vw] rounded-full opacity-[0.10]"
        style={{ background: "radial-gradient(circle, var(--orange-bright) 0%, transparent 70%)" }}
      />
    </div>
  );
}
