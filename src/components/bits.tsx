import { motion } from "motion/react";
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
