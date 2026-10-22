import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { desserts, waffles } from "@/data/menu";
import { MaskReveal, useLoopInView, useParallaxAllowed } from "@/components/bits";
import { AddButton } from "@/components/cart/AddButton";
import { itemKey } from "@/lib/cart";
import { RevealCard } from "@/components/page";
import waffleFilled from "@/assets/waffle-hero.webp";
import waffleStack from "@/assets/waffle-stack.webp";
import waffleChips from "@/assets/waffle-chips.webp";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The section's own colour, taken off the printed card: the pale green the
 * waffle menu is set on. The kunafa above it is near-black and the juice bar
 * below it is too, so this is the light between them.
 */
const CREAM = "oklch(0.963 0.022 145)";
const LEAF_DEEP = "oklch(0.45 0.11 150)";

/**
 * What sits in the ring. One photograph could only show one waffle, and the
 * counter sells nineteen — so it changes, the way the plate on the hero's
 * turntable does. Only while the section is on screen: a picture nobody is
 * looking at has no reason to be cross-fading.
 */
const SHOTS = [
  {
    src: waffleFilled,
    w: 800,
    h: 800,
    alt: "A chocolate waffle filled with cream and chocolate sauce",
  },
  { src: waffleStack, w: 800, h: 800, alt: "A stack of golden waffles, crisp at the edges" },
  { src: waffleChips, w: 480, h: 480, alt: "A chocolate waffle under a heap of chocolate chips" },
];

/** how long each waffle holds before the next fades in */
const SHOT_MS = 3400;

const PRICES = waffles.map((w) => w.price);
const FROM = Math.min(...PRICES);
const TO = Math.max(...PRICES);

/** A scoop pressed between two waffles, rather than a topping on one. */
const ICE_WICHES = waffles.filter((w) => /ice-wich/i.test(w.name));

/** The six the counter leads with — the ones people ask for by name. */
const LEAD_NAMES = [
  "Butter Honey",
  "Red Velvet Waffle",
  "Brownie Overloaded",
  "Oreo Blast",
  "Nutella Hazelnut",
  "Lotus Bissoff Waffle",
];
const LEAD = LEAD_NAMES.flatMap((n) => waffles.filter((w) => w.name === n));

/** What runs along the bottom. */
const TICKER = waffles.map((w) => w.name);

/**
 * The waffle counter, given a section of its own.
 *
 * Nineteen of them and nine desserts arrived on one printed card, and a panel
 * on the signature board was not enough for a counter that size. Built like
 * the Korean one — copy on the left, the waffle turning inside two rings on
 * the right, six of them priced underneath — because that is the shape of
 * this page the owner liked.
 */
export function WaffleSpecial() {
  const ref = useRef<HTMLElement>(null);
  const drift = useParallaxAllowed();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.4 });

  const dishY = useTransform(p, [0, 1], ["14%", "-14%"]);
  const dishScale = useTransform(p, [0, 0.5, 1], [0.94, 1.06, 0.94]);
  const wordY = useTransform(p, [0, 1], ["30%", "-30%"]);

  const spin = useLoopInView(ref);

  const [shot, setShot] = useState(0);
  useEffect(() => {
    if (!spin) return; // off screen, or reduce-motion: hold the first one
    const id = window.setInterval(() => setShot((n) => (n + 1) % SHOTS.length), SHOT_MS);
    return () => window.clearInterval(id);
  }, [spin]);

  return (
    <section
      ref={ref}
      id="waffles"
      className="relative overflow-hidden px-5 pt-24 text-ink md:px-12 md:pt-32"
      style={{ background: CREAM }}
    >
      <div
        aria-hidden
        className="blob-a pointer-events-none absolute -left-[12vw] top-[4%] size-[56vw] rounded-full opacity-40"
        style={{ background: `radial-gradient(circle, ${LEAF_DEEP} 0%, transparent 65%)` }}
      />
      <div
        aria-hidden
        className="blob-b pointer-events-none absolute -right-[14vw] bottom-[-12%] size-[46vw] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      {/* the word behind everything, drifting against the scroll */}
      <motion.p
        aria-hidden
        style={drift ? { y: wordY } : {}}
        className="pointer-events-none absolute inset-x-0 top-1/2 select-none text-center font-display text-[22vw] font-black leading-none tracking-[-0.06em] text-ink/[0.05]"
      >
        WAFFLES
      </motion.p>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        {/* ---------------------------------------------------------- copy */}
        <div>
          <MaskReveal>
            <p className="eyebrow !text-orange-ink">Straight off the iron</p>
          </MaskReveal>

          <h2 className="mt-5 text-ink">
            <MaskReveal>
              <span className="block font-display text-[clamp(2.6rem,7vw,5rem)] font-black uppercase leading-[0.88] tracking-[-0.04em]">
                Waffles
              </span>
            </MaskReveal>
            <MaskReveal delay={0.08}>
              <span
                className="block bg-clip-text font-display text-[clamp(2.6rem,7vw,5rem)] font-black uppercase leading-[0.88] tracking-[-0.04em] text-transparent"
                style={{
                  backgroundImage: `linear-gradient(100deg, var(--orange) 0%, var(--orange-deep) 55%, ${LEAF_DEEP} 100%)`,
                }}
              >
                &amp; Desserts
              </span>
            </MaskReveal>
          </h2>

          <MaskReveal delay={0.16}>
            <p className="serif-accent mt-6 text-xl italic leading-snug text-orange-ink md:text-2xl">
              Crisp at the edge, soft in the squares.
            </p>
          </MaskReveal>

          <MaskReveal delay={0.24}>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink/70">
              Pressed to order and loaded while they are still hot — honey and butter at one end, a
              brownie under three chocolates at the other. Four of them come as ice-wiches: a scoop
              pressed between two waffles rather than a scoop sitting on one.
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
              { v: String(waffles.length), l: "Waffles" },
              { v: `₹${FROM}–₹${TO}`, l: "Price range" },
              { v: String(ICE_WICHES.length), l: "Ice-wiches" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-3xl font-extrabold tracking-[-0.03em] text-orange-ink md:text-4xl">
                  {s.v}
                </dt>
                <dd className="mt-1 text-[0.55rem] font-extrabold uppercase tracking-[0.26em] text-ink/55">
                  {s.l}
                </dd>
              </div>
            ))}
          </motion.dl>

          <p className="mt-9 max-w-md text-sm leading-relaxed text-ink/60">
            Beside them, the dessert counter: {desserts.length} of them, from bun with palkhova at ₹
            {Math.min(...desserts.map((d) => d.price))} to the hot sizzling brownie.{" "}
            <Link
              to="/menu"
              hash="desserts"
              className="font-semibold text-orange-ink underline-offset-4 hover:underline"
            >
              See the desserts
            </Link>
            .
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
              hash="waffles"
              data-cursor="cta"
              className="group inline-flex items-center gap-4 rounded-full bg-ink px-8 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-paper transition-transform duration-300 hover:-translate-y-0.5"
            >
              See all {waffles.length} waffles
              <span
                aria-hidden
                className="h-px w-6 bg-paper transition-all duration-500 group-hover:w-12"
              />
            </Link>
          </motion.div>
        </div>

        {/* --------------------------------------------------------- dish */}
        <div className="relative">
          <motion.div style={drift ? { y: dishY, scale: dishScale } : {}} className="relative">
            <motion.span
              aria-hidden
              animate={spin ? { rotate: 360 } : { rotate: 0 }}
              transition={
                spin ? { duration: 48, repeat: Infinity, ease: "linear" } : { duration: 0 }
              }
              className="absolute left-1/2 top-1/2 aspect-square w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed"
              style={{ borderColor: `color-mix(in oklab, ${LEAF_DEEP} 35%, transparent)` }}
            />
            <motion.span
              aria-hidden
              animate={spin ? { rotate: -360 } : { rotate: 0 }}
              transition={
                spin ? { duration: 72, repeat: Infinity, ease: "linear" } : { duration: 0 }
              }
              className="absolute left-1/2 top-1/2 aspect-square w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/10"
            />

            <div className="floaty relative mx-auto w-[80vw] max-w-[30rem] sm:w-[58vw] lg:w-full">
              <figure
                data-cursor="food"
                className="relative aspect-square overflow-hidden rounded-full border-2 border-orange/30 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.5)]"
              >
                {SHOTS.map((s, i) => (
                  <img
                    key={s.src}
                    src={s.src}
                    alt={i === shot ? `${s.alt} at Twin's Golden Cafe, Arani` : ""}
                    aria-hidden={i === shot ? undefined : true}
                    width={s.w}
                    height={s.h}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] ${
                      i === shot ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
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
                  Pressed
                  <br />
                  To Order
                </span>
              </div>
            </div>
          </motion.div>

          {/* six of them, priced, with a button each */}
          <ul className="relative mt-12 grid grid-cols-2 gap-3">
            {LEAD.map((dish, i) => (
              <RevealCard
                as="li"
                key={dish.name}
                index={i}
                className="group relative flex h-full items-center gap-3 overflow-hidden rounded-2xl border border-ink/10 bg-paper px-4 py-3.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-orange"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-orange/20 to-transparent transition-all duration-500 group-hover:h-full"
                />
                <span className="relative min-w-0 flex-1">
                  <span className="block font-display text-sm font-extrabold uppercase leading-tight tracking-[-0.01em] text-ink md:text-base">
                    {dish.name}
                  </span>
                  <span className="mt-1 block font-display text-lg font-extrabold text-orange-ink">
                    ₹{dish.price}
                  </span>
                </span>

                <AddButton
                  item={{
                    key: itemKey("waffles", dish.name),
                    name: dish.name,
                    price: dish.price,
                    veg: true,
                  }}
                />
              </RevealCard>
            ))}
          </ul>
        </div>
      </div>

      {/* ---------------------------------------------------- waffle ticker */}
      <div className="relative z-10 -mx-5 mt-16 overflow-hidden border-t border-ink/10 py-6 md:-mx-12">
        <div className="marquee flex w-max" style={{ ["--marquee-dur" as string]: "58s" }}>
          {[0, 1].map((half) => (
            <div key={half} aria-hidden={half === 1} className="flex shrink-0 items-center pr-10">
              {TICKER.map((name) => (
                <span key={name} className="flex items-center">
                  <span className="whitespace-nowrap font-display text-lg font-extrabold uppercase tracking-[-0.01em] text-ink/55 md:text-2xl">
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
