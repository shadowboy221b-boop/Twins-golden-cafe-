import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { MaskReveal } from "./bits";

/**
 * A full-bleed photograph band. The shot drifts slower than the page and
 * settles closer as it passes, so the section reads with depth rather than as
 * a flat picture. Sized in svh so mobile browser chrome can't crop it.
 */
export function FeatureBanner({
  src,
  width,
  height,
  eyebrow,
  title,
  accent,
  lede,
  cta,
  align = "left",
  focal = "center",
}: {
  src: string;
  width: number;
  height: number;
  eyebrow: string;
  title: string;
  accent: string;
  lede?: string;
  cta?: { to: string; label: string };
  align?: "left" | "right";
  /** object-position for the photo, so the subject never gets cropped out */
  focal?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 32, mass: 0.4 });

  // the photo travels less than the section: classic parallax depth
  const imgY = useTransform(p, [0, 1], ["-12%", "12%"]);
  const imgScale = useTransform(p, [0, 0.5, 1], [1.18, 1.08, 1.18]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[62svh] items-center overflow-hidden bg-ink px-5 py-24 md:min-h-[70svh] md:px-12"
    >
      <motion.img
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        width={width}
        height={height}
        style={{ y: imgY, scale: imgScale, objectPosition: focal }}
        className="absolute inset-0 size-full object-cover"
      />

      {/* the photo is dark already; this just guarantees the type holds up */}
      <span
        aria-hidden
        className={`absolute inset-0 ${
          align === "right"
            ? "bg-gradient-to-l from-ink/95 via-ink/88 to-ink/35"
            : "bg-gradient-to-r from-ink/95 via-ink/88 to-ink/35"
        }`}
      />

      <div
        className={`relative z-10 mx-auto w-full max-w-7xl ${
          align === "right" ? "flex justify-end text-right" : ""
        }`}
      >
        <div className="max-w-xl">
          <MaskReveal>
            <p className="eyebrow !text-orange">{eyebrow}</p>
          </MaskReveal>

          <h2 className="mt-5 display-lg text-paper">
            <MaskReveal delay={0.06}>{title}</MaskReveal>
            <MaskReveal delay={0.14}>
              <span className="block text-orange">{accent}</span>
            </MaskReveal>
          </h2>

          {lede && (
            <MaskReveal delay={0.22}>
              <p className="serif-accent mt-6 text-lg text-paper/75 md:text-xl">{lede}</p>
            </MaskReveal>
          )}

          {cta && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9"
            >
              <Link
                to={cta.to}
                data-cursor="cta"
                className="inline-flex items-center rounded-full bg-orange px-8 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
              >
                {cta.label}
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
