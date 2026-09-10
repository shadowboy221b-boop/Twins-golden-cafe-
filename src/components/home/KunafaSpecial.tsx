import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { kunafas } from "@/data/menu";
import { MaskReveal, useSpinAllowed } from "@/components/bits";
import { RevealCard } from "@/components/page";
import kunafa from "@/assets/kunafa.webp";

const PRICES = kunafas.map((k) => k.price);
const FROM = Math.min(...PRICES);
const TO = Math.max(...PRICES);

/** The flavour name without the word Kunafa, for the ticker and the tiles. */
const flavour = (name: string) => name.replace(/\s*Kunafa\s*/i, "").trim() || "Classic";

/** The four the counter leads with, priced from the board. */
const HERO_FLAVOURS = ["Nutella Kunafa", "Lotus Biscoff Kunafa", "Oreo Kunafa", "Kitkat Kunafa"];
const HERO = HERO_FLAVOURS.flatMap((n) => {
  const item = kunafas.find((k) => k.name === n);
  return item ? [item] : [];
});

/**
 * The house dessert, given a section of its own.
 *
 * Everything here is layered on purpose: the ring turns, the kunafa floats and
 * rides the scroll, the flavour ticker runs, the glow drifts. All of it is
 * transform-only, so the global prefers-reduced-motion rule stops the lot —
 * and none of the content depends on an animation running to be visible.
 */
export function KunafaSpecial() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.4 });

  const dishY = useTransform(p, [0, 1], ["14%", "-14%"]);
  const dishScale = useTransform(p, [0, 0.5, 1], [0.94, 1.06, 0.94]);
  const wordY = useTransform(p, [0, 1], ["30%", "-30%"]);

  const spin = useSpinAllowed();

  return (
    <section
      ref={ref}
      id="kunafa-special"
      className="grain relative overflow-hidden bg-ink px-5 py-24 md:px-12 md:py-32"
    >
      {/* two glows on different clocks, so the room never sits still */}
      <div
        aria-hidden
        className="blob-a pointer-events-none absolute left-1/2 top-0 size-[70vw] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-40 blur-[130px]"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />
      <div
        aria-hidden
        className="blob-b pointer-events-none absolute -right-[15vw] bottom-[-10%] size-[50vw] rounded-full opacity-25 blur-[140px]"
        style={{ background: "radial-gradient(circle, var(--orange-bright) 0%, transparent 65%)" }}
      />

      {/* the word behind everything, drifting against the scroll */}
      <motion.p
        aria-hidden
        style={{ y: wordY }}
        className="pointer-events-none absolute inset-x-0 top-1/2 select-none text-center font-display text-[22vw] font-black leading-none tracking-[-0.06em] text-paper/[0.035]"
      >
        KUNAFA
      </motion.p>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        {/* ---------------------------------------------------------- copy */}
        <div>
          <MaskReveal>
            <p className="eyebrow !text-orange">The house signature</p>
          </MaskReveal>

          <h2 className="mt-5 display-lg text-paper">
            <MaskReveal delay={0.06}>THE GOLDEN</MaskReveal>
            <MaskReveal delay={0.14}>
              <span className="block text-orange">KUNAFA</span>
            </MaskReveal>
          </h2>

          <MaskReveal delay={0.22}>
            <p className="serif-accent mt-7 max-w-md text-lg leading-relaxed text-paper/70 md:text-xl">
              Shredded pastry baked crisp, a molten centre, and a finish that changes with every
              flavour. Eleven of them, pulled fresh at the counter.
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
              { v: String(kunafas.length), l: "Flavours" },
              { v: `₹${FROM}–₹${TO}`, l: "Price range" },
              { v: "Fresh", l: "Made to order" },
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10"
          >
            <Link
              to="/menu"
              hash="kunafa"
              data-cursor="cta"
              className="group inline-flex items-center gap-4 rounded-full bg-orange px-8 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              See all {kunafas.length} kunafas
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
            {/* a dashed ring turning slowly behind the dish */}
            <motion.span
              aria-hidden
              animate={spin ? { rotate: 360 } : { rotate: 0 }}
              transition={spin ? { duration: 48, repeat: Infinity, ease: "linear" } : { duration: 0 }}
              className="absolute left-1/2 top-1/2 aspect-square w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-orange/25"
            />
            <motion.span
              aria-hidden
              animate={spin ? { rotate: -360 } : { rotate: 0 }}
              transition={spin ? { duration: 72, repeat: Infinity, ease: "linear" } : { duration: 0 }}
              className="absolute left-1/2 top-1/2 aspect-square w-[104%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-paper/10"
            />

            <img
              src={kunafa}
              alt="The Golden Kunafa at Twin's Golden Cafe"
              width={1200}
              height={1008}
              data-cursor="food"
              className="floaty food-shadow-dark relative mx-auto w-[82vw] max-w-none sm:w-[62vw] lg:w-full"
            />
          </motion.div>

          {/* the flavour tiles, priced straight off the board */}
          <ul className="relative mt-10 grid grid-cols-2 gap-3">
            {HERO.map((k, i) => (
              <RevealCard key={k.name} index={i}>
                <li className="group relative overflow-hidden rounded-2xl border border-paper/12 px-4 py-3.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-orange">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-orange/20 to-transparent transition-all duration-500 group-hover:h-full"
                  />
                  <span className="relative block font-display text-sm font-extrabold uppercase tracking-[-0.01em] text-paper md:text-base">
                    {flavour(k.name)}
                  </span>
                  <span className="relative mt-1 block font-display text-lg font-extrabold text-orange">
                    ₹{k.price}
                  </span>
                </li>
              </RevealCard>
            ))}
          </ul>
        </div>
      </div>

      {/* ------------------------------------------------- flavour ticker */}
      <div
        className="relative z-10 mt-16 overflow-hidden border-y border-paper/12 py-5"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%)",
        }}
      >
        <div
          className="marquee flex w-max"
          style={{ ["--marquee-dur" as string]: "64s" }}
        >
          {[0, 1].map((half) => (
            <div key={half} aria-hidden={half === 1} className="flex shrink-0 items-center pr-10">
              {kunafas.map((k) => (
                <span key={k.name} className="flex items-center">
                  <span className="whitespace-nowrap font-display text-lg font-extrabold uppercase tracking-[-0.01em] text-paper/70 md:text-2xl">
                    {flavour(k.name)}
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
