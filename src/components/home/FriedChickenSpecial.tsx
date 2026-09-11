import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { combos, happyTreats } from "@/data/menu";
import { MaskReveal, useSpinAllowed } from "@/components/bits";
import { RevealCard } from "@/components/page";
import friedChicken from "@/assets/fried-chicken.webp";

/** Every combo built around crispy chicken or wings, priced straight off the board. */
const CHICKEN_COMBOS = combos.filter((c) =>
  c.contents.some((item) => /crispy chicken|wings/i.test(item)),
);
const PRICES = CHICKEN_COMBOS.map((c) => c.price);
const FROM = Math.min(...PRICES);
const TO = Math.max(...PRICES);

/** The four the counter leads with. */
const TILES = CHICKEN_COMBOS.slice(0, 4);

/** What runs along the ticker: the fried chicken on the board, combos and snacks. */
const TICKER = [
  "Crispy Chicken",
  "Chicken Wings",
  ...happyTreats.filter((t) => /chicken/i.test(t.name)).map((t) => t.name),
];

/**
 * Fried chicken, given a section of its own — the Golden Kunafa's counterpart,
 * mirrored so the dish sits on the left and the two sections don't read as one.
 *
 * The photograph is a full-bleed shot rather than a cut-out, so it sits in a
 * frame instead of floating free. Everything that moves is transform-only, with
 * no blur or drop-shadow filters: those were what made the page lag.
 */
export function FriedChickenSpecial() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.4 });

  const frameY = useTransform(p, [0, 1], ["5%", "-5%"]);
  const wordY = useTransform(p, [0, 1], ["30%", "-30%"]);

  const spin = useSpinAllowed();

  return (
    <section
      ref={ref}
      id="fried-chicken"
      className="grain relative overflow-hidden bg-ink px-5 pt-24 md:px-12 md:pt-32"
    >
      <div
        aria-hidden
        className="blob-b pointer-events-none absolute -left-[15vw] top-[10%] size-[60vw] rounded-full opacity-35"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      {/* the word behind everything, drifting against the scroll */}
      <motion.p
        aria-hidden
        style={{ y: wordY }}
        className="pointer-events-none absolute inset-x-0 top-1/2 select-none text-center font-display text-[22vw] font-black leading-none tracking-[-0.06em] text-paper/[0.035]"
      >
        CRISPY
      </motion.p>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
        {/* --------------------------------------------------------- dish */}
        <div className="relative order-2 lg:order-1">
          {/* Sized so the whole photograph fits on one laptop screen, and shown
              uncropped at its own aspect ratio — no zoom, so nothing at the
              edges of the shot is cut away. */}
          <motion.div
            style={{ y: frameY }}
            className="relative mx-auto w-[84vw] max-w-[32rem] sm:w-[64vw] lg:w-full"
          >
            <div
              data-cursor="food"
              className="relative overflow-hidden rounded-[2rem] border-2 border-orange/30 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]"
              style={{ aspectRatio: "1119 / 1405" }}
            >
              <img
                src={friedChicken}
                alt="Crispy fried chicken at Twin's Golden Cafe"
                width={1119}
                height={1405}
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            </div>

            {/* The sticker holds still so its words stay the right way up; only
                the dashed ring around it turns. */}
            <div
              aria-hidden
              className="absolute -right-6 -top-6 flex size-24 rotate-12 items-center justify-center rounded-full bg-orange text-center md:size-28"
            >
              <motion.span
                animate={spin ? { rotate: 360 } : { rotate: 0 }}
                transition={
                  spin ? { duration: 24, repeat: Infinity, ease: "linear" } : { duration: 0 }
                }
                className="absolute inset-1.5 rounded-full border border-dashed border-ink/40"
              />
              <span className="relative font-display text-[0.7rem] font-black uppercase leading-tight tracking-[0.08em] text-ink md:text-xs">
                Hot &amp;
                <br />
                Crispy
              </span>
            </div>
          </motion.div>
        </div>

        {/* ---------------------------------------------------------- copy */}
        <div className="order-1 lg:order-2">
          <MaskReveal>
            <p className="eyebrow !text-orange">Fried to order</p>
          </MaskReveal>

          <h2 className="mt-5 display-lg text-paper">
            <MaskReveal delay={0.06}>THE GOLDEN</MaskReveal>
            <MaskReveal delay={0.14}>
              <span className="block text-orange">FRIED CHICKEN</span>
            </MaskReveal>
          </h2>

          <MaskReveal delay={0.22}>
            <p className="serif-accent mt-7 max-w-md text-lg leading-relaxed text-paper/70 md:text-xl">
              Marinated, double-coated and fried the moment you order — a crunch you can hear, and
              juicy all the way to the bone.
            </p>
          </MaskReveal>

          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap gap-x-12 gap-y-6"
          >
            {[
              { v: String(CHICKEN_COMBOS.length), l: "Chicken combos" },
              { v: `₹${FROM}–₹${TO}`, l: "Price range" },
              { v: "Hot", l: "Fried to order" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-3xl font-extrabold tracking-[-0.03em] text-orange md:text-4xl">
                  {s.v}
                </dt>
                <dd className="mt-1 text-[0.55rem] font-extrabold uppercase tracking-[0.26em] text-paper/55">
                  {s.l}
                </dd>
              </div>
            ))}
          </motion.dl>

          {/* the combos, priced straight off the board */}
          <ul className="relative mt-10 grid grid-cols-2 gap-3">
            {TILES.map((c, i) => (
              <RevealCard key={c.name} index={i}>
                <li className="group relative h-full overflow-hidden rounded-2xl border border-paper/12 px-4 py-3.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-orange">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-orange/20 to-transparent transition-all duration-500 group-hover:h-full"
                  />
                  <span className="relative block font-display text-sm font-extrabold uppercase tracking-[-0.01em] text-paper md:text-base">
                    {c.name.replace(/\s+Combo$/i, "")}
                  </span>
                  <span className="relative mt-0.5 block text-xs text-paper/50">
                    {c.contents[0]}
                  </span>
                  <span className="relative mt-1 block font-display text-lg font-extrabold text-orange">
                    ₹{c.price}
                  </span>
                </li>
              </RevealCard>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10"
          >
            <Link
              to="/menu"
              hash="combos"
              data-cursor="cta"
              className="group inline-flex items-center gap-4 rounded-full bg-orange px-8 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              See the chicken combos
              <span
                aria-hidden
                className="h-px w-6 bg-ink transition-all duration-500 group-hover:w-12"
              />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* --------------------------------------------------- chicken ticker */}
      {/* The ticker closes the section: it runs edge to edge and sits on the
          section's bottom edge, so there is no empty band beneath it. */}
      <div className="relative z-10 -mx-5 mt-16 overflow-hidden border-t border-paper/12 py-6 md:-mx-12">
        <div className="marquee flex w-max" style={{ ["--marquee-dur" as string]: "56s" }}>
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
