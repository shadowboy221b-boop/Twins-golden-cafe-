/**
 * The brand statement, running edge to edge.
 *
 * The strip is duplicated and the keyframe travels exactly -50%, so the second
 * copy lands where the first began and the loop is seamless. Marked aria-hidden
 * because it is decoration — the same words are already in the page heading.
 */
export function BrandMarquee({
  tone = "ink",
}: {
  /** "orange" for a loud band between sections, "ink" for the quiet footer rule. */
  tone?: "ink" | "orange";
}) {
  const loud = tone === "orange";

  const band = loud ? "bg-orange" : "border-y border-paper/12 bg-ink";
  const text = loud ? "text-ink" : "text-paper/45";
  const dot = loud ? "text-paper" : "text-orange";

  // The footer strip is a quiet rule under the page, not a headline: smaller,
  // wider-set type at a walking pace. The orange band between sections is the
  // loud one, and even that is slower than it was — a fast marquee reads as
  // noise rather than as motion.
  const size = loud
    ? "text-xl tracking-[-0.01em] md:text-3xl"
    : "text-sm tracking-[0.16em] md:text-base";
  const duration = loud ? "48s" : "70s";
  const pad = loud ? "py-4 md:py-5" : "py-5 md:py-6";

  return (
    // Solid edge to edge: the words run straight off the screen, with no fade
    // at either end.
    <div aria-hidden className={`relative overflow-hidden ${pad} ${band}`}>
      {/* No gap between the halves: the trailing pr-14 lives inside each one, so
          the two are exactly equal and the -50% shift lands seamlessly. */}
      <div
        className="marquee flex w-max whitespace-nowrap"
        style={{ ["--marquee-dur" as string]: duration }}
      >
        {Array.from({ length: 2 }).map((_, half) => (
          <div key={half} className="flex shrink-0 gap-14 pr-14">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`font-display font-extrabold uppercase ${size} ${text}`}>
                TWIN&apos;S GOLDEN CAFE <span className={dot}>·</span> FRESH HOT &amp; MADE TO LOVE{" "}
                <span className={dot}>·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
