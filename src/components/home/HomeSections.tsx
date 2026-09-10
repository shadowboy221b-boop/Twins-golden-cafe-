import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { categories } from "@/data/menu";
import { MaskReveal } from "@/components/bits";
import { Section, SectionHead } from "@/components/page";
import { FloatingFood } from "@/components/FloatingFood";
import pizza from "@/assets/pizza.webp";
import chickenBurger from "@/assets/chicken-burger.webp";
import wrap from "@/assets/wrap.webp";
import loadedFries from "@/assets/loaded-fries.webp";
import momos from "@/assets/momos.webp";
import sandwich from "@/assets/sandwich-grilled.webp";
import oreoShake from "@/assets/oreo-shake.webp";
import mojito from "@/assets/mojito-fresh.webp";

/* ---------------------------------------------------------------- categories */

const EASE = [0.16, 1, 0.3, 1] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The rows of the index. A row can gather several board sections (veg and
 * non-veg burgers are one row here), and it links to the first of them. Kunafa
 * and combos have sections of their own on the home page, so they aren't
 * repeated in this list.
 */
const INDEX = [
  { name: "Pizza", ids: ["pizza"], src: pizza, w: 1200, h: 1200, cutout: true },
  {
    name: "Burgers",
    ids: ["burgers-veg", "burgers-nonveg"],
    src: chickenBurger,
    w: 1000,
    h: 1000,
    cutout: true,
  },
  { name: "Wraps & Rolls", ids: ["wraps"], src: wrap, w: 600, h: 1200, cutout: false },
  {
    name: "Fries & Treats",
    ids: ["happy-treats"],
    src: loadedFries,
    w: 1024,
    h: 1024,
    cutout: false,
  },
  { name: "Momos", ids: ["momos-veg", "momos-nonveg"], src: momos, w: 900, h: 900, cutout: true },
  {
    name: "Sandwiches",
    ids: ["sandwiches", "sweet-sandwiches"],
    src: sandwich,
    w: 736,
    h: 1104,
    cutout: false,
  },
  { name: "Milkshakes", ids: ["milkshakes"], src: oreoShake, w: 675, h: 1200, cutout: false },
  {
    name: "Mojitos & Juices",
    ids: ["mojito", "fresh-juices"],
    src: mojito,
    w: 675,
    h: 1200,
    cutout: false,
  },
];

/** Count, starting price and tagline are read off the board, never typed here. */
const ROWS = INDEX.flatMap((row) => {
  const cats = row.ids.flatMap((id) => categories.filter((c) => c.id === id));
  const first = cats[0];
  if (!first) return [];
  const items = cats.flatMap((c) => c.items);
  return [
    {
      ...row,
      hash: first.id,
      tagline: first.tagline,
      dishes: items.length,
      from: Math.min(...items.map((it) => it.price)),
    },
  ];
});

/**
 * The board as an editorial index: big type, one row per section, no cards.
 *
 * With a mouse, the row under the pointer lights up while the others fall back,
 * and a photograph of that section trails the pointer behind the type — sprung,
 * so it lags a touch and leans into the direction it's moving. The pointer
 * position lives in motion values, so moving the mouse never re-renders
 * anything; only changing rows does.
 *
 * On touch screens there is no pointer to follow, so each row carries a small
 * photograph of its own instead.
 */
export function CategoriesPreview() {
  const list = useRef<HTMLUListElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 170, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 170, damping: 22, mass: 0.6 });
  const lean = useSpring(useTransform(useVelocity(sx), [-1600, 1600], [-14, 14]), {
    stiffness: 200,
    damping: 25,
  });

  const pointer = (e: ReactPointerEvent) => {
    const r = list.current?.getBoundingClientRect();
    return r ? { px: e.clientX - r.left, py: e.clientY - r.top } : null;
  };

  const onMove = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const p = pointer(e);
    if (!p) return;
    x.set(p.px);
    y.set(p.py);
  };

  // on the way in, put the photograph under the pointer at once rather than
  // letting it fly over from wherever it was last
  const onEnter = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const p = pointer(e);
    if (!p) return;
    x.jump(p.px);
    y.jump(p.py);
    sx.jump(p.px);
    sy.jump(p.py);
  };

  const shown = hover === null ? undefined : ROWS[hover];

  return (
    <Section id="categories" tone="ink">
      <FloatingFood opacity={0.06} count={3} />

      <div
        aria-hidden
        className="blob-a pointer-events-none absolute left-1/2 top-0 size-[55vw] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      <div className="relative">
        <SectionHead
          align="center"
          dark
          eyebrow="The board"
          title="EVERY"
          accent="SECTION"
          lede={`${categories.length} counters under one roof. Every one of them cooked to order.`}
        />
      </div>

      <ul
        ref={list}
        onPointerMove={onMove}
        onPointerEnter={onEnter}
        onPointerLeave={() => setHover(null)}
        className="relative z-10 mx-auto mt-14 max-w-6xl border-t border-paper/12"
      >
        {/* the photograph that trails the pointer, behind the type */}
        <motion.li
          aria-hidden
          style={{ x: sx, y: sy, rotate: lean }}
          className="pointer-events-none absolute left-0 top-0 z-0 hidden lg:block"
        >
          <motion.div
            initial={false}
            animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.7 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="relative -ml-[8.5rem] -mt-[10.5rem] h-[21rem] w-[17rem] overflow-hidden rounded-[1.5rem] bg-ink shadow-[0_40px_80px_-20px_rgba(0,0,0,0.75)] ring-1 ring-orange/40"
          >
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 50% 45%, oklch(0.677 0.196 46 / 45%) 0%, transparent 65%)",
              }}
            />
            <AnimatePresence initial={false}>
              {shown && (
                <motion.img
                  key={shown.name}
                  src={shown.src}
                  alt=""
                  width={shown.w}
                  height={shown.h}
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className={`absolute inset-0 size-full ${
                    shown.cutout ? "object-contain p-6" : "object-cover"
                  }`}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.li>

        {ROWS.map((r, i) => {
          const on = hover === i;
          const dim = hover !== null && !on;
          return (
            <li key={r.name} className="relative z-10 border-b border-paper/12">
              <Link
                to="/menu"
                hash={r.hash}
                data-cursor="view"
                onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
                className={`group relative flex items-center gap-4 py-5 transition-opacity duration-500 md:gap-6 md:py-6 lg:py-7 ${
                  dim ? "lg:opacity-30" : ""
                }`}
              >
                {/* an orange rule draws itself along the row */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-orange transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                />

                <span
                  className={`w-7 shrink-0 font-display text-xs font-black tabular-nums transition-colors duration-300 md:w-9 md:text-sm ${
                    on ? "text-orange" : "text-paper/40"
                  }`}
                >
                  {pad(i + 1)}
                </span>

                {/* touch screens: the photograph sits in the row */}
                <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-paper/5 lg:hidden">
                  <img
                    src={r.src}
                    alt=""
                    aria-hidden
                    width={r.w}
                    height={r.h}
                    loading="lazy"
                    decoding="async"
                    className={`size-full ${r.cutout ? "object-contain p-1" : "object-cover"}`}
                  />
                </span>

                <span className="min-w-0 flex-1">
                  {/* the slide lives outside the mask, so a long name never gets clipped */}
                  <span
                    className={`block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      on ? "translate-x-3 lg:translate-x-6" : ""
                    }`}
                  >
                    <MaskReveal delay={Math.min(i * 0.05, 0.3)}>
                      <span
                        className={`block font-display text-3xl font-black uppercase leading-[0.95] tracking-[-0.03em] transition-colors duration-500 sm:text-5xl lg:text-6xl ${
                          on ? "text-orange" : "text-paper"
                        }`}
                      >
                        {r.name}
                      </span>
                    </MaskReveal>
                  </span>
                  <span className="mt-1.5 block text-[0.55rem] font-extrabold uppercase tracking-[0.22em] text-paper/50 md:hidden">
                    {r.dishes} dishes · from ₹{r.from}
                  </span>
                </span>

                <span className="hidden shrink-0 text-right md:block">
                  <span className="block text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-paper/65">
                    {r.dishes} dishes · from ₹{r.from}
                  </span>
                  <span className="mt-1 block text-[0.55rem] font-extrabold uppercase tracking-[0.22em] text-paper/35">
                    {r.tagline}
                  </span>
                </span>

                <span
                  aria-hidden
                  className={`grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500 md:size-12 ${
                    on
                      ? "rotate-0 border-orange bg-orange text-ink"
                      : "-rotate-45 border-paper/25 text-paper group-hover:border-orange"
                  }`}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="size-4">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="relative z-10 mt-12 flex justify-center">
        <Link
          to="/menu"
          data-cursor="cta"
          className="group inline-flex items-center gap-4 rounded-full bg-orange px-8 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
        >
          View all {categories.length} sections
          <span
            aria-hidden
            className="h-px w-6 bg-ink transition-all duration-500 group-hover:w-12"
          />
        </Link>
      </div>
    </Section>
  );
}
