import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useLoopInView } from "./bits";
import { CutleryDisc } from "@/components/Logo";
import burger from "@/assets/burger-hero.webp";
import burgerSm from "@/assets/burger-hero-600.webp";
import pizza from "@/assets/pizza.webp";
import pizzaSm from "@/assets/pizza-600.webp";
import momoPlate from "@/assets/momo-plate.webp";
import chocoShake from "@/assets/choco-shake.webp";
import pizzaSlice from "@/assets/pizza-slice.webp";
import chicken from "@/assets/chicken.webp";
import chickenSm from "@/assets/chicken-sm.webp";
import drumstick from "@/assets/drumstick.webp";
import drumstickSm from "@/assets/drumstick-sm.webp";
import chickenBurger from "@/assets/chicken-burger.webp";
import chickenBurgerSm from "@/assets/chicken-burger-sm.webp";
import kunafa from "@/assets/kunafa.webp";
import kunafaSm from "@/assets/kunafa-sm.webp";
import koreanPot from "@/assets/korean-pot.webp";
import koreanPotSm from "@/assets/korean-pot-sm.webp";
import strawberryShake from "@/assets/shake-strawberry.webp";
import strawberryShakeSm from "@/assets/shake-strawberry-sm.webp";
import mojito from "@/assets/mojito.webp";
import mojitoSm from "@/assets/mojito-sm.webp";

/** What rides the turntable, in order. The burger stays first — it's the shot
 *  the page loads with, so it's the one that has to be there instantly, and
 *  the rest run roughly counter by counter after it.
 *
 *  Only true cut-outs belong here: a photo carrying its own background would
 *  spin as a visible square. That rules out the Korean wings, the shop front
 *  and the loaded fries shot, whatever else they'd add.
 *
 *  The small file beside each one is the phone's copy — at 78vw a phone needs
 *  about 320px, not 900. */
const HERO_DISHES = [
  { src: burger, sm: burgerSm, smW: 600, alt: "Twin's Golden Cafe signature burger" },
  { src: pizza, sm: pizzaSm, smW: 600, alt: "A stone-baked pizza, loaded with toppings" },
  { src: chicken, sm: chickenSm, alt: "A bucket of golden fried chicken" },
  {
    src: koreanPot,
    sm: koreanPotSm,
    alt: "Korean glazed drumsticks in a pan, sesame and spring onion over the top",
  },
  { src: momoPlate, alt: "A plate of steamed momos with red chutney" },
  { src: chocoShake, alt: "A chocolate milkshake topped with cream" },
  { src: drumstick, sm: drumstickSm, alt: "A crispy fried chicken drumstick" },
  { src: kunafa, sm: kunafaSm, alt: "A slice of golden kunafa with pistachio" },
  { src: chickenBurger, sm: chickenBurgerSm, alt: "A crispy chicken burger" },
  { src: strawberryShake, sm: strawberryShakeSm, alt: "A strawberry shake topped with cream" },
  { src: mojito, sm: mojitoSm, alt: "A fresh mint mojito over ice" },
];

/** how long each dish holds before the next fades in */
const DISH_MS = 2200;

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 32, mass: 0.4 });

  const burgerY = useTransform(p, [0, 1], ["0%", "18%"]);
  const burgerScale = useTransform(p, [0, 1], [1, 1.12]);
  const copyY = useTransform(p, [0, 1], ["0%", "-18%"]);
  const copyOpacity = useTransform(p, [0, 0.8], [1, 0]);
  const sliceY = useTransform(p, [0, 1], [0, -180]);

  const spin = useLoopInView(ref);

  // Which dish is on the turntable. Starts at 0 and the first image is opaque
  // by default, so the hero is never blank if this timer never runs.
  const [dish, setDish] = useState(0);
  // How many plates exist in the page at all. Ten shots downloaded at
  // once would cost more than the rest of the page put together, so each one
  // is added a turn before it is needed — by the time it shows, it is decoded,
  // and a reader who scrolls straight past never pays for the last ten.
  const [loaded, setLoaded] = useState(2);
  useEffect(() => {
    if (!spin) return; // reduce-motion: hold the first plate
    const id = window.setInterval(() => {
      setDish((d) => (d + 1) % HERO_DISHES.length);
      setLoaded((n) => Math.min(n + 1, HERO_DISHES.length));
    }, DISH_MS);
    return () => window.clearInterval(id);
  }, [spin]);

  // Both counts are wrapped where they are read, never trusted raw. If the
  // list of plates is ever shortened while a page is already running — an edit
  // during development, a shot dropped in a later build — an index left over
  // from the longer list would match no image and the turntable would stand
  // empty. Wrapped, the worst case is the wrong plate, never no plate.
  const shown = dish % HERO_DISHES.length;
  // …and the plate on show is always one of the ones in the page.
  const upTo = Math.min(Math.max(loaded, shown + 1), HERO_DISHES.length);

  // Motion values, not React state: the pointer moves many times a second, and
  // state here re-rendered the whole hero on every one of those events.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      tiltX.set((e.clientX / window.innerWidth - 0.5) * -28);
      tiltY.set((e.clientY / window.innerHeight - 0.5) * -20);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [tiltX, tiltY]);

  return (
    <div
      id="top"
      ref={ref}
      className="grain relative flex min-h-[100svh] items-center overflow-hidden bg-ink pt-28 pb-16 md:pt-24"
    >
      {/* a single warm glow behind the food, the only light in the room */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-1/2 size-[70vw] -translate-y-1/2 rounded-full opacity-45"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 md:px-12 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-20">
          <p className="rise-in eyebrow !text-orange">Fresh · Hot · Made to love</p>

          {/* The lockup from the header, drawn at hero size: the spoon-and-fork
              disc standing in for the O of GOLDEN, and CAFE ruled on both
              sides. The letters are hidden from assistive tech — the heading
              says the name once, in words. */}
          <h1 className="mt-6">
            <span className="sr-only">Twin&apos;s Golden Cafe</span>

            {/* shrink-to-fit, so the ruled CAFE below can stretch to exactly
                the width of the word above it, the way the logo sets it */}
            <span aria-hidden className="inline-flex flex-col items-stretch">
              <span className="block overflow-hidden pb-[0.06em]">
                <span
                  className="line-in block display-xl text-paper"
                  style={{ animationDelay: "0.12s" }}
                >
                  TWIN&apos;S
                </span>
              </span>

              <span className="block overflow-hidden pb-[0.06em]">
                <span
                  className="line-in flex items-center display-xl text-orange"
                  style={{ animationDelay: "0.22s" }}
                >
                  G
                  <CutleryDisc onDark />
                  LDEN
                </span>
              </span>

              <span className="block overflow-hidden pb-[0.06em]">
                {/* sized on its own rather than in em: an em here would be read
                    against the paragraph size, not the display type above */}
                <span
                  className="line-in mt-[0.35em] flex w-full items-center gap-[0.5em] text-[clamp(0.85rem,2.6vw,2rem)] font-extrabold leading-none tracking-[0.42em] text-paper/80"
                  style={{ animationDelay: "0.32s" }}
                >
                  <span className="h-px flex-1 bg-current opacity-70" />
                  <span className="-me-[0.42em]">CAFE</span>
                  <span className="h-px flex-1 bg-current opacity-70" />
                </span>
              </span>
            </span>
          </h1>

          <p
            className="rise-in serif-accent mt-7 max-w-md text-lg text-paper/65 md:text-xl"
            style={{ animationDelay: "0.5s" }}
          >
            A café that behaves like a studio — every plate art-directed, fried to order, at Old Bus
            Stand, Arani.
          </p>

          <div
            className="rise-in mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
            style={{ animationDelay: "0.62s" }}
          >
            <Link
              to="/menu"
              data-cursor="cta"
              className="inline-flex items-center rounded-full bg-orange px-8 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              Explore the menu
            </Link>
            <a
              href="#best-combos"
              data-cursor="cta"
              className="group inline-flex items-center gap-3 text-[0.68rem] font-extrabold uppercase tracking-[0.26em] text-paper/70 transition-colors hover:text-orange"
            >
              See what&apos;s cooking
              <span className="h-px w-8 bg-current transition-all duration-500 group-hover:w-14" />
            </a>
          </div>
        </motion.div>

        <div className="pop-in relative z-10" style={{ animationDelay: "0.25s" }}>
          {/* The slice sits behind the burger and drifts on its own clock —
              depth, not clutter. Rendered first and pushed back so the burger
              always reads in front of it. */}
          <motion.img
            src={pizzaSlice}
            alt=""
            aria-hidden
            loading="lazy"
            width={1280}
            height={1024}
            style={{ y: sliceY }}
            className="floaty pointer-events-none absolute -right-[8%] top-[-4%] -z-10 w-36 opacity-40 md:w-56"
          />

          {/* scroll + mouse live on the wrapper so the spin below never fights them */}
          <motion.div
            className="relative z-10"
            style={{
              y: burgerY,
              scale: burgerScale,
              translateX: tiltX,
              translateY: tiltY,
            }}
          >
            {/* One turntable, and the dish on it changes. The rotation lives on
                this wrapper and never remounts, so swapping the plate doesn't
                restart the spin — the next item simply fades in already
                turning. */}
            <motion.div
              animate={spin ? { rotate: 360 } : { rotate: 0 }}
              transition={
                spin ? { duration: 12, repeat: Infinity, ease: "linear" } : { duration: 0 }
              }
              data-cursor="food"
              className="relative mx-auto aspect-square w-[78vw] max-w-none sm:w-[58vw] lg:w-full"
            >
              {HERO_DISHES.slice(0, upTo).map((d, i) => (
                <img
                  key={d.src}
                  src={d.src}
                  srcSet={d.sm ? `${d.sm} ${d.smW ?? 320}w, ${d.src} 900w` : undefined}
                  sizes="(min-width: 1024px) 45vw, 78vw"
                  alt={i === shown ? d.alt : ""}
                  aria-hidden={i === shown ? undefined : true}
                  width={1200}
                  height={1200}
                  // There is no time to fetch on demand once a plate's turn
                  // comes, so the one after the current plate is already in the
                  // page; only the first competes for LCP priority.
                  loading="eager"
                  fetchPriority={i === 0 ? "high" : "low"}
                  decoding="async"
                  className={`food-shadow-dark absolute inset-0 size-full object-contain transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.33,1,0.68,1)] ${
                    i === shown ? "scale-100 opacity-100" : "scale-95 opacity-0"
                  }`}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
