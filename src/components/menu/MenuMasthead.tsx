import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { categories } from "@/data/menu";
import { MaskReveal, useLoopInView, useSpinAllowed } from "@/components/bits";
import { VegMark } from "@/components/VegMark";
import burger from "@/assets/burger-hero.webp";
import pizza from "@/assets/pizza.webp";
import chocoShake from "@/assets/choco-shake.webp";
import momoPlate from "@/assets/momo-plate.webp";
import freshJuice from "@/assets/fresh-juice.webp";

const EASE = [0.16, 1, 0.3, 1] as const;

const ALL_ITEMS = categories.flatMap((c) => c.items);
const PRICE_MIN = Math.min(...ALL_ITEMS.map((i) => i.price));
const PRICE_MAX = Math.max(...ALL_ITEMS.map((i) => i.price));

const countOf = (ids: readonly string[]) =>
  categories.filter((c) => ids.includes(c.id)).reduce((n, c) => n + c.items.length, 0);

const vegOf = (ids: readonly string[]) =>
  categories
    .filter((c) => ids.includes(c.id))
    .reduce((n, c) => n + c.items.filter((i) => i.veg).length, 0);

const VEG_TOTAL = ALL_ITEMS.filter((i) => i.veg).length;

/** the green that marks everything vegetarian on this dark ground */
const GREEN_LIGHT = "oklch(0.72 0.17 145)";

/** The ring of golden light that runs round the framed photo. */
const RING =
  "conic-gradient(from var(--border-angle), oklch(0.677 0.196 46 / 0.25) 0deg, oklch(0.677 0.196 46 / 0.25) 210deg, #f76b0a 265deg, #ffdca8 300deg, #f76b0a 335deg, oklch(0.677 0.196 46 / 0.25) 360deg)";

/**
 * The line-up under the title, left to right; pizza takes the middle. Each one
 * jumps to its counter on the board. `spin` is seconds per turn, the sign the
 * direction. The juice shot has its own background, so it turns inside a round
 * frame, with a band of light running round the frame.
 */
const STARS = [
  {
    label: "Momos",
    ids: ["momos-veg", "momos-nonveg"],
    src: momoPlate,
    w: 500,
    h: 500,
    spin: 22,
    framed: false,
  },
  {
    label: "Burgers",
    ids: ["burgers-veg", "burgers-nonveg"],
    src: burger,
    w: 900,
    h: 900,
    spin: -18,
    framed: false,
  },
  { label: "Pizza", ids: ["pizza"], src: pizza, w: 900, h: 900, spin: 26, framed: false },
  {
    label: "Milkshakes",
    ids: ["milkshakes"],
    src: chocoShake,
    w: 620,
    h: 620,
    spin: -20,
    framed: false,
  },
  {
    label: "Fresh Juices",
    ids: ["fresh-juices", "special-blends", "detox-juices"],
    src: freshJuice,
    w: 450,
    h: 800,
    spin: 24,
    framed: true,
  },
].map((s) => ({ ...s, count: countOf(s.ids), veg: vegOf(s.ids) }));

/** a gentle bow, so the middle dish sits highest without the ends sinking */
const ARC = ["md:mt-10", "md:mt-4", "md:mt-0", "md:mt-4", "md:mt-10"];

function Star({
  star,
  index,
  progress,
  moving,
  looping,
}: {
  star: (typeof STARS)[number];
  index: number;
  progress: MotionValue<number>;
  /** motion is welcome at all: the drop-in plays */
  moving: boolean;
  /** …and the masthead is on screen: the spin and the bob run */
  looping: boolean;
}) {
  const middle = index === 2;
  // on the way out the outer dishes rise faster, so the arc flattens as it goes
  const lift = useTransform(progress, [0, 1], [0, -(60 + Math.abs(index - 2) * 45)]);

  const turning = {
    animate: looping ? { rotate: star.spin > 0 ? 360 : -360 } : { rotate: 0 },
    transition: looping
      ? { duration: Math.abs(star.spin), repeat: Infinity, ease: "linear" as const }
      : { duration: 0 },
  };

  return (
    <motion.li style={{ y: lift }} className={`w-1/3 md:w-1/5 ${ARC[index] ?? ""}`}>
      <a
        href={`#${star.ids[0]}`}
        data-cursor="view"
        className="group flex flex-col items-center text-center"
      >
        {/* each dish drops onto the page and lands with a bounce, one after another */}
        <motion.span
          initial={moving ? { opacity: 0, y: -160, scale: 0.4, rotate: -120 } : false}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 80, damping: 13, delay: 0.5 + index * 0.12 }}
          className={`relative block aspect-square ${middle ? "w-[92%] md:w-full" : "w-[82%] md:w-[84%]"}`}
        >
          {/* a warm light and a shadow to stand on; neither of them turns */}
          <span
            aria-hidden
            className="absolute inset-[4%] rounded-full opacity-35"
            style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 66%)" }}
          />
          <span
            aria-hidden
            className="absolute inset-x-[18%] -bottom-[4%] h-[12%] rounded-[50%] bg-black/60"
          />

          {/* the line-up bobs in a slow wave, one dish after the next */}
          <motion.span
            className="absolute inset-0"
            animate={looping ? { y: [0, -14, 0] } : { y: 0 }}
            transition={
              looping
                ? {
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.6 + index * 0.35,
                  }
                : { duration: 0 }
            }
          >
            <span className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-3 group-hover:scale-105">
              {star.framed ? (
                <span
                  className="border-spin absolute inset-[9%] rounded-full p-[3px]"
                  style={{ background: RING }}
                >
                  <motion.img
                    src={star.src}
                    alt={star.label}
                    width={star.w}
                    height={star.h}
                    loading="eager"
                    decoding="async"
                    {...turning}
                    className="size-full rounded-full object-cover"
                  />
                </span>
              ) : (
                <motion.img
                  src={star.src}
                  alt={star.label}
                  width={star.w}
                  height={star.h}
                  loading="eager"
                  fetchPriority={middle ? "high" : "auto"}
                  decoding="async"
                  {...turning}
                  className="relative size-full object-contain"
                />
              )}
            </span>
          </motion.span>
        </motion.span>

        <motion.span
          initial={moving ? { opacity: 0, y: 14 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.95 + index * 0.12, ease: EASE }}
          className="mt-4 block"
        >
          <span className="block font-display text-sm font-black uppercase tracking-[0.02em] text-paper transition-colors group-hover:text-orange md:text-lg">
            {star.label}
          </span>
          <span className="mt-1 block text-[0.52rem] font-extrabold uppercase tracking-[0.24em] text-paper/50 md:text-[0.58rem]">
            {star.count} dishes
          </span>
          {star.veg > 0 && (
            <span
              className="mt-2 inline-flex items-center gap-1.5 text-[0.52rem] font-extrabold uppercase tracking-[0.2em] md:text-[0.58rem]"
              style={{ color: GREEN_LIGHT }}
            >
              <VegMark className="size-3" />
              {star.veg} veg
            </span>
          )}
        </motion.span>
      </a>
    </motion.li>
  );
}

/**
 * The menu's opening screen: the title, and the house favourites dropping in
 * underneath it in a bowed line-up the moment the page arrives — momos,
 * burgers, pizza, shakes and fresh juice, each one a shortcut to its counter.
 * As the page scrolls on, the line-up lifts away at staggered speeds.
 *
 * Vegetarian guests get their own way in: every dish shows its veg count, and
 * the green veg total beside the numbers switches the board to veg only.
 */
export function MenuMasthead({
  vegOnly,
  onVegOnly,
}: {
  vegOnly: boolean;
  onVegOnly: (on: boolean) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const moving = useSpinAllowed();
  const looping = useLoopInView(ref);

  // switching veg on takes the guest straight down to the filtered board
  const toggleVeg = () => {
    const next = !vegOnly;
    onVegOnly(next);
    const el = ref.current;
    if (!next || !el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().bottom + window.scrollY - 80,
      behavior: moving ? "smooth" : "auto",
    });
  };

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 32, mass: 0.4 });
  const titleY = useTransform(progress, [0, 1], ["0%", "-30%"]);

  return (
    <header
      ref={ref}
      className="grain relative overflow-hidden bg-ink px-5 pb-16 pt-28 md:px-12 md:pb-20 md:pt-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[55%] size-[75vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 62%)" }}
      />

      <motion.div style={{ y: titleY }} className="relative z-10 text-center">
        <MaskReveal>
          <p className="eyebrow !text-orange">Everything we cook</p>
        </MaskReveal>
        <h1 className="mt-5 display-xl text-paper">
          <MaskReveal delay={0.06}>THE FULL</MaskReveal>
          <MaskReveal delay={0.14}>
            <span className="block text-orange">MENU</span>
          </MaskReveal>
        </h1>
      </motion.div>

      <ul className="relative z-10 mx-auto mt-10 flex max-w-6xl flex-wrap items-start justify-center gap-y-8 md:mt-4 md:flex-nowrap">
        {STARS.map((s, i) => (
          <Star
            key={s.label}
            star={s}
            index={i}
            progress={progress}
            moving={moving}
            looping={looping}
          />
        ))}
      </ul>

      <motion.div
        initial={moving ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.5, ease: EASE }}
        className="relative z-10 mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-center"
      >
        <dl className="contents">
          {[
            { v: String(categories.length), l: "Categories" },
            { v: String(ALL_ITEMS.length), l: "Dishes" },
            { v: `₹${PRICE_MIN}–₹${PRICE_MAX}`, l: "Price range" },
          ].map((s) => (
            <div key={s.l}>
              <dt className="font-display text-2xl font-extrabold tracking-[-0.03em] text-orange md:text-4xl">
                {s.v}
              </dt>
              <dd className="mt-1 text-[0.55rem] font-extrabold uppercase tracking-[0.26em] text-paper/50">
                {s.l}
              </dd>
            </div>
          ))}
        </dl>

        {/* the veg total is the one number you can press */}
        <button
          type="button"
          onClick={toggleVeg}
          aria-pressed={vegOnly}
          data-cursor="cta"
          className="flex items-center gap-4 rounded-2xl border px-5 py-3 text-left transition-transform duration-300 hover:-translate-y-0.5"
          style={{
            borderColor: "oklch(0.72 0.17 145 / 0.55)",
            background: vegOnly ? "oklch(0.6 0.12 142)" : "oklch(0.72 0.17 145 / 0.1)",
          }}
        >
          <VegMark className="size-7" pulse={moving && !vegOnly} />
          <span>
            <span
              className="block font-display text-2xl font-extrabold tracking-[-0.03em] md:text-4xl"
              style={{ color: vegOnly ? "var(--paper)" : GREEN_LIGHT }}
            >
              {VEG_TOTAL} Veg
            </span>
            <span className="mt-1 block text-[0.55rem] font-extrabold uppercase tracking-[0.22em] text-paper/75">
              {vegOnly ? "Showing veg only · tap for all" : "Tap to show veg only"}
            </span>
          </span>
        </button>
      </motion.div>
    </header>
  );
}
