import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useSpinAllowed } from "./bits";
import burger from "@/assets/burger-hero.webp";
import kunafa from "@/assets/kunafa.webp";
import chicken from "@/assets/chicken.webp";
import milkshake from "@/assets/milkshake.webp";
import pizzaSlice from "@/assets/pizza-slice.webp";

/** What rides the turntable, in order. The burger stays first — it's the shot
 *  the page loads with, so it's the one that has to be there instantly. */
const HERO_DISHES = [
  { src: burger, alt: "Twin's Golden Cafe signature burger" },
  { src: kunafa, alt: "The Golden Kunafa" },
  { src: chicken, alt: "Crispy fried chicken" },
  { src: milkshake, alt: "A loaded milkshake" },
];

/** how long each dish holds before the next fades in */
const DISH_MS = 2000;

const lines = [
  { text: "TWIN'S", tone: "text-paper" },
  { text: "GOLDEN", tone: "text-orange" },
  { text: "CAFE", tone: "text-hollow-cream" },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 32, mass: 0.4 });

  const burgerY = useTransform(p, [0, 1], ["0%", "18%"]);
  const burgerScale = useTransform(p, [0, 1], [1, 1.12]);
  const copyY = useTransform(p, [0, 1], ["0%", "-18%"]);
  const copyOpacity = useTransform(p, [0, 0.8], [1, 0]);
  const sliceY = useTransform(p, [0, 1], [0, -180]);

  const spin = useSpinAllowed();

  // Which dish is on the turntable. Starts at 0 and the first image is opaque
  // by default, so the hero is never blank if this timer never runs.
  const [dish, setDish] = useState(0);
  useEffect(() => {
    if (!spin) return; // reduce-motion: hold the first plate
    const id = window.setInterval(
      () => setDish((d) => (d + 1) % HERO_DISHES.length),
      DISH_MS,
    );
    return () => window.clearInterval(id);
  }, [spin]);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      setTilt({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      id="top"
      ref={ref}
      className="grain relative flex min-h-[100svh] items-center overflow-hidden bg-ink pt-28 pb-16 md:pt-24"
    >
      {/* a single warm glow behind the food, the only light in the room */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-1/2 size-[70vw] -translate-y-1/2 rounded-full opacity-45 blur-[100px]"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 md:px-12 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
        <motion.div style={{ y: copyY, opacity: copyOpacity }} className="relative z-20">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="eyebrow !text-orange"
          >
            Fresh · Hot · Made to love
          </motion.p>

          <h1 className="mt-6">
            {lines.map((line, i) => (
              <span key={line.text} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  initial={{ y: "112%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, delay: 0.12 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`block display-xl ${line.tone}`}
                >
                  {line.text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="serif-accent mt-7 max-w-md text-lg text-paper/65 md:text-xl"
          >
            A café that behaves like a studio — every plate art-directed, fried to order.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
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
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10"
        >
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
            className="floaty pointer-events-none absolute -right-[8%] top-[-4%] -z-10 w-36 opacity-40 blur-[2px] md:w-56"
          />

          {/* scroll + mouse live on the wrapper so the spin below never fights them */}
          <motion.div
            className="relative z-10"
            style={{
              y: burgerY,
              scale: burgerScale,
              translateX: tilt.x * -14,
              translateY: tilt.y * -10,
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
              {HERO_DISHES.map((d, i) => (
                <img
                  key={d.src}
                  src={d.src}
                  alt={i === dish ? d.alt : ""}
                  aria-hidden={i === dish ? undefined : true}
                  width={1200}
                  height={1200}
                  // At a 2s cycle there is no time to fetch on demand — the
                  // next plate has to be decoded before its turn. They all load
                  // up front, but only the first competes for LCP priority.
                  loading="eager"
                  fetchPriority={i === 0 ? "high" : "low"}
                  decoding="async"
                  className={`food-shadow-dark absolute inset-0 size-full object-contain transition-[opacity,transform] duration-[700ms] ease-[cubic-bezier(0.33,1,0.68,1)] ${
                    i === dish ? "scale-100 opacity-100" : "scale-95 opacity-0"
                  }`}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
