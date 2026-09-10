import { useEffect, useRef, useState } from "react";
import chicken from "@/assets/chicken-sm.webp";
import chickenBurger from "@/assets/chicken-burger-sm.webp";
import drumstick from "@/assets/drumstick-sm.webp";
import fries from "@/assets/fries-sm.webp";
import kunafa from "@/assets/kunafa-sm.webp";
import milkshake from "@/assets/milkshake-sm.webp";
import mojito from "@/assets/mojito-sm.webp";
import momos from "@/assets/momos-sm.webp";
import pizzaSlice from "@/assets/pizza-slice-sm.webp";

/**
 * left/top in %, size in vw, each with its own tempo so nothing marches in step.
 *
 * These render at 5–9vw — about 130px on a laptop — so they load the "-sm"
 * builds, not the display-sized art. The layer repeats in most sections, and
 * pulling the full-size files here was most of the page weight.
 */
const FLOATERS = [
  { src: drumstick, x: 3, y: 12, size: 8, dur: 44, delay: 0, sway: false },
  { src: fries, x: 90, y: 8, size: 7, dur: 53, delay: -9, sway: true },
  { src: chickenBurger, x: 14, y: 62, size: 8, dur: 61, delay: -21, sway: true },
  { src: chicken, x: 82, y: 55, size: 9, dur: 48, delay: -13, sway: false },
  { src: pizzaSlice, x: 46, y: 6, size: 7, dur: 57, delay: -33, sway: true },
  { src: kunafa, x: 60, y: 78, size: 8, dur: 66, delay: -6, sway: false },
  { src: momos, x: 26, y: 88, size: 6, dur: 50, delay: -27, sway: true },
  { src: milkshake, x: 95, y: 34, size: 5, dur: 63, delay: -41, sway: false },
  { src: mojito, x: 8, y: 36, size: 5, dur: 58, delay: -17, sway: true },
];

/**
 * A field of food drifting behind a section. Absolutely positioned, so it needs
 * a `relative overflow-hidden` parent — every `Section` already is one.
 * Transform-only animation; the global reduce-motion rule freezes it.
 *
 * `count` trims the field: a section that only needs a hint of movement should
 * ask for fewer rather than fading nine layers down to almost nothing, since
 * every one of them is a composited layer the browser animates on each frame.
 */
export function FloatingFood({ opacity = 0.14, count = 6 }: { opacity?: number; count?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  // Only the sections near the viewport keep their layer. Every floater is a
  // composited layer the browser animates on every frame, and a page carrying
  // eight of these fields was running ~80 of them at once — which is what made
  // scrolling feel heavy.
  //
  // It starts mounted and the observer only ever takes layers away: if the
  // observer never runs, the worst case is the old behaviour rather than a
  // background that never appears.
  const [near, setNear] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Watch the section this layer sits in, not the layer itself: with no
    // floaters mounted the wrapper can collapse to zero width, and a
    // zero-area element never reports as intersecting — so it would never
    // get its children back.
    const target = el.parentElement ?? el;
    const io = new IntersectionObserver(
      (entries) => setNear(entries.some((e) => e.isIntersecting)),
      { rootMargin: "300px 0px 300px 0px" },
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0">
      {near &&
        FLOATERS.slice(0, count).map((f, i) => (
          <img
            key={i}
            src={f.src}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className={`${f.sway ? "float-sway" : "float-rise"} absolute h-auto`}
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              width: `${f.size}vw`,
              opacity,
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
            }}
          />
        ))}
    </div>
  );
}
