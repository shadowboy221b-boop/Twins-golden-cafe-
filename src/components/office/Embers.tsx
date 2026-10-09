/**
 * Sparks off a fryer, drifting up the back of the office.
 *
 * The public pages have food floating across them; the office is not a page a
 * guest lands on, so it gets weather of its own. Every spark is one span with
 * a CSS animation on it — no canvas, no timer, no React re-render. They are
 * laid out from a fixed table rather than Math.random so the page looks the
 * same every time it is opened, and so nothing differs between what the
 * server wrote and what the browser draws.
 *
 * The global prefers-reduced-motion rule freezes all of it.
 */

type Spark = {
  /** where it starts across the page */
  left: number;
  /** how far it wanders sideways on the way up */
  dx: number;
  size: number;
  dur: number;
  /** negative, so the screen is already full of them on arrival */
  delay: number;
  warm: boolean;
};

const SPARKS: Spark[] = [
  { left: 6, dx: 3, size: 3, dur: 21, delay: -2, warm: true },
  { left: 14, dx: -2, size: 2, dur: 27, delay: -14, warm: false },
  { left: 23, dx: 4, size: 4, dur: 18, delay: -8, warm: true },
  { left: 31, dx: -3, size: 2, dur: 30, delay: -21, warm: true },
  { left: 39, dx: 2, size: 3, dur: 24, delay: -5, warm: false },
  { left: 47, dx: -4, size: 2, dur: 33, delay: -17, warm: true },
  { left: 55, dx: 3, size: 4, dur: 19, delay: -11, warm: true },
  { left: 62, dx: -2, size: 2, dur: 28, delay: -3, warm: false },
  { left: 70, dx: 4, size: 3, dur: 23, delay: -19, warm: true },
  { left: 78, dx: -3, size: 2, dur: 31, delay: -7, warm: true },
  { left: 86, dx: 2, size: 4, dur: 20, delay: -24, warm: false },
  { left: 94, dx: -4, size: 3, dur: 26, delay: -12, warm: true },
];

export function Embers() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="ember absolute bottom-[-6vh] rounded-full"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            background: s.warm ? "var(--orange)" : "color-mix(in oklab, var(--orange) 40%, white)",
            opacity: 0.55,
            ["--ember-dx" as string]: `${s.dx}vw`,
            ["--ember-dur" as string]: `${s.dur}s`,
            ["--ember-delay" as string]: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
