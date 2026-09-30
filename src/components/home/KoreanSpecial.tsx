import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { chickenWraps, koreanItems, loadedFries } from "@/data/menu";
import { MaskReveal, useLoopInView } from "@/components/bits";
import { AddButton } from "@/components/cart/AddButton";
import { itemKey } from "@/lib/cart";
import { RevealCard } from "@/components/page";
import koreanChicken from "@/assets/korean-chicken.webp";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The section's own colour: gochujang. Deep chilli red, so the counter is not
 * mistaken for the cream-coloured one that follows it, and so the glaze on the
 * photograph reads as the same thing the section is made of.
 */
const RED = "oklch(0.245 0.095 25)";
const RED_GLOW = "oklch(0.55 0.21 28)";

/** The Korean glazes, and the dishes on other counters that share them. */
const ALSO = [
  ...loadedFries.filter((f) => /gochujang|teriyaki/i.test(f.name)),
  ...chickenWraps.filter((w) => /korean/i.test(w.name)),
];

const PRICES = koreanItems.map((i) => i.price);
const FROM = Math.min(...PRICES);
const TO = Math.max(...PRICES);

/** The glaze name without the words that repeat on every line. */
const glaze = (name: string) => name.replace(/\s*(crispy\s*)?fried\s*chicken\s*/i, "").trim();

/** What runs along the bottom: the glazes themselves. */
const TICKER = [...koreanItems.map((i) => i.name), ...ALSO.map((i) => i.name)];

/**
 * The Korean counter, given a section of its own — built like the kunafa's,
 * because that is the one on this page that reads best: copy on the left, the
 * dish on the right turning inside two rings, and the counter itself priced
 * underneath it.
 *
 * The ground is gochujang red. Ink above it, green above that, cream below:
 * four sections, four colours, none of them mistakable for its neighbour.
 */
export function KoreanSpecial() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.4 });

  const dishY = useTransform(p, [0, 1], ["14%", "-14%"]);
  const dishScale = useTransform(p, [0, 0.5, 1], [0.94, 1.06, 0.94]);
  const wordY = useTransform(p, [0, 1], ["30%", "-30%"]);

  const spin = useLoopInView(ref);

  return (
    <section
      ref={ref}
      id="korean"
      className="grain relative overflow-hidden px-5 pt-24 text-paper md:px-12 md:pt-32"
      style={{ background: RED }}
    >
      {/* two glows on different clocks, so the room never sits still */}
      <div
        aria-hidden
        className="blob-a pointer-events-none absolute -right-[10vw] top-[2%] size-[60vw] rounded-full opacity-45"
        style={{ background: `radial-gradient(circle, ${RED_GLOW} 0%, transparent 65%)` }}
      />
      <div
        aria-hidden
        className="blob-b pointer-events-none absolute -left-[16vw] bottom-[-12%] size-[48vw] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      {/* the word behind everything, drifting against the scroll */}
      <motion.p
        aria-hidden
        style={{ y: wordY }}
        className="pointer-events-none absolute inset-x-0 top-1/2 select-none text-center font-display text-[22vw] font-black leading-none tracking-[-0.06em] text-paper/[0.045]"
      >
        KOREAN
      </motion.p>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        {/* ---------------------------------------------------------- copy */}
        <div>
          <MaskReveal>
            <p className="eyebrow flex items-center gap-2.5 !text-orange-bright">
              {/* a light that says the pan is on right now */}
              {spin && (
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange-bright opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-orange-bright" />
                </span>
              )}
              New at the counter
            </p>
          </MaskReveal>

          <h2 className="mt-5 text-paper">
            <MaskReveal>
              <span className="block font-display text-[clamp(2.6rem,7vw,5rem)] font-black uppercase leading-[0.88] tracking-[-0.04em]">
                Korean
              </span>
            </MaskReveal>
            <MaskReveal delay={0.08}>
              {/* the glaze itself, poured through the letters */}
              <span
                className="block bg-clip-text font-display text-[clamp(2.6rem,7vw,5rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] text-transparent"
                style={{
                  backgroundImage: `linear-gradient(100deg, var(--orange-bright) 0%, var(--orange) 45%, ${RED_GLOW} 100%)`,
                }}
              >
                Fried Chicken
              </span>
            </MaskReveal>
          </h2>

          <MaskReveal delay={0.16}>
            <p className="serif-accent mt-6 text-xl italic leading-snug text-orange-bright md:text-2xl">
              Sticky, glossy, still crackling.
            </p>
          </MaskReveal>

          <MaskReveal delay={0.24}>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-paper/70">
              Fried twice so the crust holds under the sauce, then tossed by hand in gochujang, soy
              and honey, or smoked barbecue — sesame over the top, and eaten straight from the
              basket.
            </p>
          </MaskReveal>

          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.28, ease: EASE }}
            className="mt-10 flex flex-wrap gap-x-12 gap-y-6"
          >
            {[
              { v: String(koreanItems.length), l: "Glazes" },
              { v: `₹${FROM}–₹${TO}`, l: "Price range" },
              { v: "2×", l: "Double fried" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-3xl font-extrabold tracking-[-0.03em] text-orange-bright md:text-4xl">
                  {s.v}
                </dt>
                <dd className="mt-1 text-[0.55rem] font-extrabold uppercase tracking-[0.26em] text-paper/55">
                  {s.l}
                </dd>
              </div>
            ))}
          </motion.dl>

          <p className="mt-9 max-w-md text-sm leading-relaxed text-paper/55">
            The same glazes turn up elsewhere on the board: {ALSO.map((d) => d.name).join(", ")}.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.36, ease: EASE }}
            className="mt-10"
          >
            <Link
              to="/menu"
              hash="korean"
              data-cursor="cta"
              className="group inline-flex items-center gap-4 rounded-full bg-orange px-8 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              See the Korean counter
              <span
                aria-hidden
                className="h-px w-6 bg-ink transition-all duration-500 group-hover:w-12"
              />
            </Link>
          </motion.div>
        </div>

        {/* --------------------------------------------------------- dish */}
        <div className="relative">
          <motion.div style={{ y: dishY, scale: dishScale }} className="relative">
            {/* two rings turning against each other behind the dish */}
            <motion.span
              aria-hidden
              animate={spin ? { rotate: 360 } : { rotate: 0 }}
              transition={
                spin ? { duration: 48, repeat: Infinity, ease: "linear" } : { duration: 0 }
              }
              className="absolute left-1/2 top-1/2 aspect-square w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-orange/35"
            />
            <motion.span
              aria-hidden
              animate={spin ? { rotate: -360 } : { rotate: 0 }}
              transition={
                spin ? { duration: 72, repeat: Infinity, ease: "linear" } : { duration: 0 }
              }
              className="absolute left-1/2 top-1/2 aspect-square w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/12"
            />

            {/* the float sits on the wrapper, never on the shadowed element */}
            <div className="floaty relative mx-auto w-[80vw] max-w-[30rem] sm:w-[58vw] lg:w-full">
              <figure
                data-cursor="food"
                className="relative overflow-hidden rounded-full border-2 border-orange/30 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"
              >
                <img
                  src={koreanChicken}
                  alt="Korean fried chicken wings glazed in gochujang and sesame at Twin's Golden Cafe, Arani"
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square size-full object-cover"
                />
              </figure>

              {/* the stamp, clear of the photograph's edge */}
              <div className="absolute -bottom-2 -right-2 flex size-24 rotate-6 items-center justify-center rounded-full bg-orange text-center md:size-28">
                <motion.span
                  aria-hidden
                  animate={spin ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    spin ? { duration: 26, repeat: Infinity, ease: "linear" } : { duration: 0 }
                  }
                  className="absolute inset-1.5 rounded-full border border-dashed border-ink/40"
                />
                <span className="relative font-display text-[0.7rem] font-black uppercase leading-tight tracking-[0.08em] text-ink md:text-xs">
                  Double
                  <br />
                  Fried
                </span>
              </div>
            </div>
          </motion.div>

          {/* the counter itself, each glaze with its price and its button */}
          <ul className="relative mt-12 grid grid-cols-2 gap-3">
            {koreanItems.map((dish, i) => (
              <RevealCard
                as="li"
                key={dish.name}
                index={i}
                className={`group relative flex h-full items-center gap-3 overflow-hidden rounded-2xl border border-paper/15 px-4 py-3.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-orange ${
                  // five glazes in two columns: the last runs the full width
                  i === koreanItems.length - 1 ? "col-span-2" : ""
                }`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-orange/25 to-transparent transition-all duration-500 group-hover:h-full"
                />
                <span className="relative min-w-0 flex-1">
                  <span className="block font-display text-sm font-extrabold uppercase leading-tight tracking-[-0.01em] text-paper md:text-base">
                    {glaze(dish.name)}
                  </span>
                  <span className="mt-1 block font-display text-lg font-extrabold text-orange-bright">
                    ₹{dish.price}
                    {dish.hot && (
                      <span className="ml-2 align-middle text-[0.5rem] font-extrabold uppercase tracking-[0.18em] text-paper/45">
                        Spicy
                      </span>
                    )}
                  </span>
                </span>

                <AddButton
                  item={{
                    key: itemKey("korean", dish.name),
                    name: dish.name,
                    price: dish.price,
                  }}
                />
              </RevealCard>
            ))}
          </ul>
        </div>
      </div>

      {/* ---------------------------------------------------- glaze ticker */}
      {/* closes the section edge to edge, the way the kunafa's does */}
      <div className="relative z-10 -mx-5 mt-16 overflow-hidden border-t border-paper/12 py-6 md:-mx-12">
        <div className="marquee flex w-max" style={{ ["--marquee-dur" as string]: "52s" }}>
          {[0, 1].map((half) => (
            <div key={half} aria-hidden={half === 1} className="flex shrink-0 items-center pr-10">
              {TICKER.map((name) => (
                <span key={name} className="flex items-center">
                  <span className="whitespace-nowrap font-display text-lg font-extrabold uppercase tracking-[-0.01em] text-paper/70 md:text-2xl">
                    {name}
                  </span>
                  <span aria-hidden className="mx-6 size-1.5 shrink-0 rounded-full bg-orange" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
