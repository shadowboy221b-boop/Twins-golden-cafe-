import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useSpring, useTransform } from "motion/react";
import { categories, type MenuItem } from "@/data/menu";
import { MaskReveal, useSpinAllowed } from "@/components/bits";
import { VegMark } from "@/components/VegMark";
import pizzaVeg from "@/assets/pizza-veg.webp";

const EASE = [0.16, 1, 0.3, 1] as const;

/** a section's own deep green — it speaks to vegetarian guests at a glance */
const GREEN = "oklch(0.24 0.05 155)";
const GREEN_LIGHT = "oklch(0.72 0.17 145)";

const vegOf = (ids: string[]): MenuItem[] =>
  categories.filter((c) => ids.includes(c.id)).flatMap((c) => c.items.filter((i) => i.veg));

/** every vegetarian dish on the board — counted, never typed */
const VEG_TOTAL = categories.reduce((n, c) => n + c.items.filter((i) => i.veg).length, 0);

/** the vegetarian side of each counter, for the chips */
const CHIPS = [
  { label: "Pizza", ids: ["pizza"] },
  { label: "Burgers", ids: ["burgers-veg"] },
  { label: "Momos", ids: ["momos-veg"] },
  { label: "Pasta", ids: ["pasta"] },
  { label: "Sandwiches", ids: ["sandwiches", "sweet-sandwiches"] },
  { label: "Wraps", ids: ["wraps"] },
  { label: "Fries & Treats", ids: ["happy-treats"] },
  { label: "Kunafa", ids: ["kunafa"] },
  { label: "Falooda", ids: ["falooda", "spl-falooda"] },
  { label: "Shakes & Drinks", ids: ["milkshakes", "spl-drinks", "lassi", "mojito"] },
  { label: "Juices", ids: ["fresh-juices", "special-blends", "detox-juices", "kulukki"] },
]
  .map((c) => ({ ...c, count: vegOf(c.ids).length }))
  .filter((c) => c.count > 0);

/**
 * One photograph, the way every other section on the page carries one. Six
 * tiles fought with the chips beside them; the pizza on its own says the same
 * thing and gives the copy room to breathe. It is vegetarian in the shot too —
 * no photograph with meat in it stands in for a veg counter.
 */
const PHOTO = (() => {
  const items = vegOf(["pizza"]);
  return {
    label: "Veg Pizzas",
    src: pizzaVeg,
    w: 700,
    h: 1050,
    count: items.length,
    from: Math.min(...items.map((i) => i.price)),
  };
})();

/**
 * The veg total. The page is built with the real number in it, so it reads
 * correctly with no script, to search engines and before anything animates;
 * only once the section comes into view does it drop to zero and roll back up.
 */
function CountUp({ to }: { to: number }) {
  const [started, setStarted] = useState(false);
  const moving = useSpinAllowed();
  const value = useSpring(to, { stiffness: 40, damping: 18 });
  const shown = useTransform(value, (v) => String(Math.round(v)));

  useEffect(() => {
    if (!started || !moving) return;
    value.jump(0);
    value.set(to);
  }, [started, moving, to, value]);

  return (
    <motion.span
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true }}
      className="tabular-nums"
    >
      {shown}
    </motion.span>
  );
}

/**
 * Tells vegetarian guests there is plenty here for them: how many veg dishes
 * the board carries, which counters they're on, and a grid of vegetarian
 * plates that flip up into place as the section scrolls in.
 *
 * It never claims the cafe is pure veg — it isn't — only what's true: most of
 * the menu is.
 */
export function VegSpecial() {
  const moving = useSpinAllowed();

  return (
    <section
      id="veg"
      className="relative overflow-hidden px-5 py-24 text-paper md:px-12 md:py-32"
      style={{ background: GREEN }}
    >
      {/* a soft green light behind the grid, and a warm one to tie it to the brand */}
      <div
        aria-hidden
        className="blob-a pointer-events-none absolute -right-[10vw] top-[5%] size-[55vw] rounded-full opacity-40"
        style={{ background: `radial-gradient(circle, ${GREEN_LIGHT} 0%, transparent 62%)` }}
      />
      <div
        aria-hidden
        className="blob-b pointer-events-none absolute -left-[15vw] bottom-[-20%] size-[45vw] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 62%)" }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        {/* ---------------------------------------------------------- copy */}
        <div>
          <MaskReveal>
            <p className="eyebrow flex items-center gap-3" style={{ color: GREEN_LIGHT }}>
              <VegMark className="size-4" />
              For our vegetarian guests
            </p>
          </MaskReveal>

          <h2 className="mt-5 display-lg text-paper">
            <MaskReveal delay={0.06}>THE GREEN SIDE</MaskReveal>
            <MaskReveal delay={0.14}>
              <span className="block" style={{ color: GREEN_LIGHT }}>
                OF GOLDEN
              </span>
            </MaskReveal>
          </h2>

          <MaskReveal delay={0.22}>
            <p className="serif-accent mt-7 max-w-md text-lg leading-relaxed text-paper/70 md:text-xl">
              Cheesy pizzas, paneer momos, loaded shakes and fresh-pressed juices — most of the
              board is vegetarian, cooked just as golden.
            </p>
          </MaskReveal>

          {/* the headline number */}
          <div className="mt-10 flex items-center gap-5">
            <VegMark className="size-12" pulse={moving} />
            <div>
              <p className="font-display text-6xl font-black leading-none tracking-[-0.04em] text-paper md:text-7xl">
                <CountUp to={VEG_TOTAL} />
              </p>
              <p className="mt-2 text-[0.6rem] font-extrabold uppercase tracking-[0.26em] text-paper/60">
                Vegetarian dishes on the menu
              </p>
            </div>
          </div>

          {/* where they are */}
          <ul className="mt-9 flex flex-wrap gap-2">
            {CHIPS.map((c, i) => (
              <motion.li
                key={c.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.4), ease: EASE }}
                className="flex items-center gap-2 rounded-full border border-paper/15 bg-paper/5 px-3.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-paper/85"
              >
                {c.label}
                <span
                  className="rounded-full px-1.5 text-[0.58rem] font-extrabold text-ink"
                  style={{ background: GREEN_LIGHT }}
                >
                  {c.count}
                </span>
              </motion.li>
            ))}
          </ul>

          <Link
            to="/menu"
            data-cursor="cta"
            className="group mt-10 inline-flex items-center gap-4 rounded-full bg-orange px-8 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
          >
            Explore the menu
            <span
              aria-hidden
              className="h-px w-6 bg-ink transition-all duration-500 group-hover:w-12"
            />
          </Link>
        </div>

        {/* ---------------------------------------------------------- photo */}
        <motion.div
          initial={moving ? { opacity: 0, rotateX: -45, y: 50 } : false}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, ease: EASE }}
          style={{ perspective: 1200, transformOrigin: "50% 100%" }}
          className="relative"
        >
          {/* a ring turning slowly behind it, as the other sections have */}
          <motion.span
            aria-hidden
            animate={moving ? { rotate: 360 } : { rotate: 0 }}
            transition={
              moving ? { duration: 60, repeat: Infinity, ease: "linear" } : { duration: 0 }
            }
            className="absolute left-1/2 top-1/2 aspect-square w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed"
            style={{ borderColor: `color-mix(in oklab, ${GREEN_LIGHT} 30%, transparent)` }}
          />

          <Link
            to="/menu"
            data-cursor="view"
            className="group relative mx-auto block aspect-[4/5] w-[84vw] max-w-[32rem] overflow-hidden rounded-[2rem] ring-1 ring-paper/15 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 sm:w-[62vw] lg:w-full"
            style={{ background: "oklch(0.3 0.06 155)" }}
          >
            <img
              src={PHOTO.src}
              alt={`${PHOTO.label} at Twin's Golden Cafe, Arani`}
              width={PHOTO.w}
              height={PHOTO.h}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
            />

            <VegMark className="absolute left-4 top-4 size-7" />

            <span className="absolute inset-x-0 bottom-0 p-6 md:p-7">
              <span className="block font-display text-3xl font-black uppercase leading-tight tracking-[-0.01em] text-paper md:text-4xl">
                {PHOTO.label}
              </span>
              <span className="mt-1.5 block text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-paper/70">
                {PHOTO.count} veg · from ₹{PHOTO.from}
              </span>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
