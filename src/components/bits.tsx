import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Mask reveal — content slides out from under a clip.
 *
 * The reveal is driven by our own observer rather than `whileInView` so that
 * copy can never be left stranded off-screen: if the observer never reports
 * (a background tab, a jump straight to an anchor, an unsupported browser) a
 * safety timer shows the content anyway. Text going missing is far worse than
 * an animation that occasionally plays without being watched.
 */
export function MaskReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  // starts "open": the server sends readable markup, and anything already on
  // screen simply stays put. Only copy we can see is below the fold gets
  // tucked away to be revealed on scroll.
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) return; // already in view — no reveal

    setHidden(true);

    const show = () => setHidden(false);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) show();
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    io.observe(el);

    // last resort: never leave the copy hidden
    const safety = window.setTimeout(show, 4000);
    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <span ref={ref} className={`block overflow-hidden pb-[0.08em] ${className}`}>
      <motion.span
        animate={{ y: hidden ? "108%" : 0 }}
        transition={{ duration: 0.95, delay, ease: [0.16, 1, 0.3, 1] }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Gentle background parallax — a few dozen pixels of drift, never a scroll hijack. */
export function useParallax(
  ref: React.RefObject<HTMLElement | null>,
  distance = 80,
) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 34,
    mass: 0.4,
  });
  return useTransform(smooth, [0, 1], [distance, -distance]);
}

/** Price row shared by every menu list — reveals itself as it scrolls in. */
export function PriceRow({
  name,
  price,
  note,
  light = false,
  delay = 0,
}: {
  name: string;
  price: number;
  note?: string | undefined;
  light?: boolean | undefined;
  delay?: number | undefined;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      data-cursor="view"
      className={`group flex items-baseline gap-3 border-b py-3 transition-colors ${
        light ? "border-ink/10 hover:border-orange" : "border-paper/12 hover:border-orange"
      }`}
    >
      <span className="min-w-0">
        <span
          className={`block text-[0.82rem] font-bold uppercase tracking-[0.1em] transition-transform duration-500 group-hover:translate-x-1.5 ${
            light ? "text-ink/85" : "text-paper/85"
          }`}
        >
          {name}
        </span>
        {note && (
          <span className={`mt-0.5 block text-xs ${light ? "text-ink/45" : "text-paper/45"}`}>
            {note}
          </span>
        )}
      </span>
      <span className={`h-px flex-1 ${light ? "bg-ink/10" : "bg-paper/12"}`} />
      <span className={`font-display text-lg font-extrabold ${light ? "text-orange-ink" : "text-orange"}`}>₹{price}</span>
    </motion.li>
  );
}

/** Premium image entrance: the frame wipes open while the food settles into place. */
export function FoodReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 28 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** A short stat / proof point — fills editorial space with something worth reading. */
export function StatRow({
  items,
  light = false,
}: {
  items: { value: string; label: string }[];
  light?: boolean;
}) {
  return (
    <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
      {items.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
        >
          <dt className={`font-display text-3xl font-extrabold tracking-[-0.03em] md:text-4xl ${light ? "text-orange-ink" : "text-orange"}`}>
            {s.value}
          </dt>
          <dd
            className={`mt-1 text-[0.55rem] font-extrabold uppercase tracking-[0.26em] ${
              light ? "text-ink/50" : "text-paper/50"
            }`}
          >
            {s.label}
          </dd>
        </motion.div>
      ))}
    </dl>
  );
}

/**
 * Whether a perpetual spin is welcome. A never-ending rotation is exactly what
 * "reduce motion" asks us not to do, so the food stops turning for anyone who
 * has that set — and reacts if they change it while the page is open.
 */
export function useSpinAllowed() {
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowed(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return allowed;
}
