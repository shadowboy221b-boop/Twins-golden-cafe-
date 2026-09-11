import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { detoxJuices, freshJuices, kulukkiSarbath, specialBlends } from "@/data/menu";
import { MaskReveal, useLoopInView } from "@/components/bits";
import freshJuice from "@/assets/fresh-juice.webp";

const EASE = [0.16, 1, 0.3, 1] as const;

/** the four juice counters, each one a tab; `id` is its section on the menu */
const TABS = [
  { id: "fresh-juices", label: "Classic", items: freshJuices },
  { id: "special-blends", label: "Blends", items: specialBlends },
  { id: "detox-juices", label: "Detox", items: detoxJuices },
  { id: "kulukki", label: "Kulukki", items: kulukkiSarbath },
];

const ALL = TABS.flatMap((t) => t.items);
const FROM = Math.min(...ALL.map((i) => i.price));
const ALL_VEG = ALL.every((i) => i.veg);

/** how many rows a tab shows before pointing on to the menu */
const SHOW = 8;

/** fruit names for the ticker, straight off the classic list */
const FRUITS = freshJuices.map((j) => j.name.replace(/\s*Juice$/i, ""));

/** bubbles rising through the glass: left in %, size in px, seconds, delay */
const BUBBLES = [
  { x: 18, size: 10, dur: 4.2, delay: 0 },
  { x: 34, size: 6, dur: 3.4, delay: 1.1 },
  { x: 52, size: 12, dur: 5, delay: 0.6 },
  { x: 66, size: 7, dur: 3.8, delay: 2 },
  { x: 80, size: 9, dur: 4.6, delay: 1.6 },
  { x: 44, size: 5, dur: 3.1, delay: 2.6 },
];

/** A cut citrus wheel, drawn rather than photographed so it stays crisp. */
function CitrusSlice({
  rind,
  flesh,
  className = "",
}: {
  rind: string;
  flesh: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={className}>
      <circle cx="50" cy="50" r="48" fill={rind} />
      <circle cx="50" cy="50" r="42" fill="#fff6dc" />
      <circle cx="50" cy="50" r="38.5" fill={flesh} />
      {Array.from({ length: 10 }, (_, i) => (
        <line
          key={i}
          x1="50"
          y1="50"
          // rounded, so the server and the browser print the same number
          x2={(50 + 38.5 * Math.cos((i * Math.PI) / 5)).toFixed(2)}
          y2={(50 + 38.5 * Math.sin((i * Math.PI) / 5)).toFixed(2)}
          stroke="#fff6dc"
          strokeWidth="2.6"
        />
      ))}
      <circle cx="50" cy="50" r="5" fill="#fff6dc" />
    </svg>
  );
}

/** a slice that drifts with the scroll and turns slowly on its own */
function FloatingSlice({
  y,
  spin,
  turn,
  className,
  rind,
  flesh,
}: {
  y: MotionValue<number>;
  spin: boolean;
  turn: number;
  className: string;
  rind: string;
  flesh: string;
}) {
  return (
    <motion.div aria-hidden style={{ y }} className={`pointer-events-none absolute ${className}`}>
      <motion.div
        animate={spin ? { rotate: turn > 0 ? 360 : -360 } : { rotate: 0 }}
        transition={
          spin ? { duration: Math.abs(turn), repeat: Infinity, ease: "linear" } : { duration: 0 }
        }
      >
        <CitrusSlice rind={rind} flesh={flesh} className="size-full" />
      </motion.div>
    </motion.div>
  );
}

/**
 * The juice counter, given a section of its own and a colour to match: the
 * whole band is poured in mango and orange so it can't be mistaken for any
 * other part of the page.
 *
 * On the left, the counters as tabs, each listing its juices with prices off
 * the board. On the right, the glass in an arched frame with bubbles rising
 * through it, cut citrus drifting past, and a stamp turning in the corner.
 */
export function JuiceBar() {
  const ref = useRef<HTMLElement>(null);
  const spin = useLoopInView(ref);
  const [tab, setTab] = useState(0);
  const active = TABS[tab];

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.4 });
  const glassY = useTransform(p, [0, 1], ["8%", "-8%"]);
  const sliceUp = useTransform(p, [0, 1], [90, -90]);
  const sliceDown = useTransform(p, [0, 1], [-70, 70]);
  const wordY = useTransform(p, [0, 1], ["30%", "-30%"]);

  return (
    <section
      ref={ref}
      id="juice-bar"
      className="relative overflow-hidden px-5 pt-24 text-ink md:px-12 md:pt-32"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.86 0.15 85) 0%, oklch(0.78 0.17 62) 50%, oklch(0.7 0.19 45) 100%)",
      }}
    >
      {/* the word behind everything, drifting against the scroll */}
      <motion.p
        aria-hidden
        style={{ y: wordY }}
        className="pointer-events-none absolute inset-x-0 top-1/3 select-none text-center font-display text-[24vw] font-black leading-none tracking-[-0.06em] text-white/[0.14]"
      >
        FRESH
      </motion.p>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
        {/* ---------------------------------------------------------- copy */}
        <div>
          <MaskReveal>
            <p className="eyebrow !text-ink/70">Pressed to order</p>
          </MaskReveal>

          <h2 className="mt-5 display-lg text-ink">
            <MaskReveal delay={0.06}>FRESH</MaskReveal>
            <MaskReveal delay={0.14}>
              <span className="block text-paper">JUICE BAR</span>
            </MaskReveal>
          </h2>

          <MaskReveal delay={0.22}>
            <p className="serif-accent mt-7 max-w-md text-lg leading-relaxed text-ink/75 md:text-xl">
              Pressed the moment you order — classic fruit juices, house blends, detox juices and
              shaken kulukki sarbath.
            </p>
          </MaskReveal>

          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
            className="mt-9 flex flex-wrap gap-x-12 gap-y-5"
          >
            {[
              { v: String(ALL.length), l: "Juices & sarbaths" },
              { v: `₹${FROM}`, l: "Starting from" },
              ...(ALL_VEG ? [{ v: "100%", l: "Vegetarian" }] : []),
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-3xl font-extrabold tracking-[-0.03em] text-ink md:text-4xl">
                  {s.v}
                </dt>
                <dd className="mt-1 text-[0.55rem] font-extrabold uppercase tracking-[0.26em] text-ink/60">
                  {s.l}
                </dd>
              </div>
            ))}
          </motion.dl>

          {/* ------------------------------------------------------ tabs */}
          <div role="tablist" aria-label="Juice counters" className="mt-10 flex flex-wrap gap-2">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === tab}
                onClick={() => setTab(i)}
                data-cursor="cta"
                className={`rounded-full border px-5 py-2.5 text-[0.62rem] font-extrabold uppercase tracking-[0.2em] transition-colors duration-300 ${
                  i === tab
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/25 text-ink/80 hover:border-ink hover:text-ink"
                }`}
              >
                {t.label}
                <span className={`ml-2 ${i === tab ? "text-orange" : "text-ink/50"}`}>
                  {t.items.length}
                </span>
              </button>
            ))}
          </div>

          <div role="tabpanel" className="mt-6 min-h-[17rem]">
            <AnimatePresence mode="wait" initial={false}>
              {active && (
                <motion.ul
                  key={active.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="grid gap-x-8 sm:grid-cols-2"
                >
                  {active.items.slice(0, SHOW).map((it) => (
                    <li key={it.name} className="border-b border-ink/15 py-2.5">
                      <div className="flex items-baseline gap-3">
                        <span className="font-display text-sm font-extrabold uppercase tracking-[-0.01em]">
                          {it.name}
                        </span>
                        <span aria-hidden className="flex-1 border-b border-dotted border-ink/30" />
                        <span className="font-display text-base font-black">₹{it.price}</span>
                      </div>
                      {it.note && <p className="mt-0.5 text-[0.72rem] text-ink/60">{it.note}</p>}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              to="/menu"
              hash={active?.id ?? "fresh-juices"}
              data-cursor="cta"
              className="group inline-flex items-center gap-4 rounded-full bg-ink px-8 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-paper transition-transform duration-300 hover:-translate-y-0.5"
            >
              See all juices
              <span
                aria-hidden
                className="h-px w-6 bg-paper transition-all duration-500 group-hover:w-12"
              />
            </Link>
            {active && active.items.length > SHOW && (
              <p className="text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-ink/65">
                +{active.items.length - SHOW} more {active.label.toLowerCase()} on the menu
              </p>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------- glass */}
        <div className="relative mx-auto w-full max-w-md py-6">
          <FloatingSlice
            y={sliceUp}
            spin={spin}
            turn={22}
            rind="#f08a00"
            flesh="#ffb627"
            className="-right-2 top-2 z-20 w-28 md:-right-8 md:w-36"
          />
          <FloatingSlice
            y={sliceDown}
            spin={spin}
            turn={-28}
            rind="#4f9d1f"
            flesh="#b5e05a"
            className="-left-4 bottom-16 z-20 w-24 md:-left-10 md:w-28"
          />
          <FloatingSlice
            y={sliceUp}
            spin={spin}
            turn={-34}
            rind="#e9c400"
            flesh="#fff07a"
            className="left-6 top-0 z-0 w-16 opacity-80"
          />

          <motion.div
            style={{ y: glassY }}
            className="relative z-10 mx-auto aspect-[3/4] w-[80%] overflow-hidden rounded-b-[2.2rem] rounded-t-full border-[6px] border-paper/85 bg-ink shadow-[0_40px_80px_-30px_oklch(0.35_0.12_40/0.7)]"
          >
            <img
              src={freshJuice}
              alt="A tall glass of fresh orange juice"
              width={450}
              height={800}
              loading="lazy"
              decoding="async"
              data-cursor="food"
              className="size-full object-cover"
            />

            {/* bubbles rising through the glass */}
            {spin &&
              BUBBLES.map((b, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 rounded-full border border-white/70 bg-white/25"
                  style={{ left: `${b.x}%`, width: b.size, height: b.size }}
                  animate={{ y: [0, -420], opacity: [0, 0.9, 0] }}
                  transition={{
                    duration: b.dur,
                    delay: b.delay,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              ))}

            {/* a band of light that crosses the glass every few seconds */}
            <span
              aria-hidden
              className="photo-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />
          </motion.div>

          {/* the stamp: its words turn round a price that stays put */}
          <div className="absolute -bottom-2 right-0 z-30 size-28 md:-right-4 md:size-32">
            <motion.svg
              viewBox="0 0 120 120"
              aria-hidden
              animate={spin ? { rotate: 360 } : { rotate: 0 }}
              transition={
                spin ? { duration: 18, repeat: Infinity, ease: "linear" } : { duration: 0 }
              }
              className="absolute inset-0 size-full"
            >
              <defs>
                <path
                  id="juice-stamp-ring"
                  d="M60,60 m-45,0 a45,45 0 1,1 90,0 a45,45 0 1,1 -90,0"
                />
              </defs>
              <circle cx="60" cy="60" r="59" className="fill-ink" />
              <text className="fill-paper" fontSize="10.5" fontWeight="800" letterSpacing="2.4">
                <textPath href="#juice-stamp-ring" textLength="280">
                  PRESSED TO ORDER • FROM ₹{FROM} •
                </textPath>
              </text>
            </motion.svg>
            <span className="absolute inset-0 grid place-items-center font-display text-2xl font-black text-orange md:text-3xl">
              ₹{FROM}
            </span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- fruit ticker */}
      <div className="relative z-10 -mx-5 mt-20 overflow-hidden border-t border-ink/15 py-6 md:-mx-12">
        <div className="marquee flex w-max" style={{ ["--marquee-dur" as string]: "60s" }}>
          {[0, 1].map((half) => (
            <div key={half} aria-hidden={half === 1} className="flex shrink-0 items-center pr-10">
              {FRUITS.map((f) => (
                <span key={f} className="flex items-center">
                  <span className="whitespace-nowrap font-display text-lg font-extrabold uppercase tracking-[-0.01em] text-ink/80 md:text-2xl">
                    {f}
                  </span>
                  <span aria-hidden className="mx-6 size-1.5 shrink-0 rounded-full bg-paper" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
