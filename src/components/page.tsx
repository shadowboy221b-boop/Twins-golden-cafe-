import { motion } from "motion/react";
import type { ReactNode } from "react";
import { MaskReveal } from "./bits";

/** A page section with the site's standard rhythm and ground. */
export function Section({
  id,
  tone = "paper",
  className = "",
  children,
}: {
  id?: string;
  tone?: "paper" | "warm" | "ink";
  className?: string;
  children: ReactNode;
}) {
  const ground = tone === "ink" ? "grain bg-ink" : tone === "warm" ? "bg-paper-warm" : "bg-paper";

  return (
    <section
      id={id}
      className={`relative overflow-hidden px-5 py-20 md:px-12 md:py-28 ${ground} ${className}`}
    >
      <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

/** Eyebrow + two-line display heading + optional lede, used to open a section. */
export function SectionHead({
  eyebrow,
  title,
  accent,
  lede,
  dark = false,
  align = "left",
  inkAccent = false,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  lede?: string;
  dark?: boolean;
  align?: "left" | "center";
  /** Set the accent line in the body colour instead of orange. */
  inkAccent?: boolean;
}) {
  const accentTone = inkAccent
    ? dark
      ? "text-paper"
      : "text-ink"
    : dark
      ? "text-orange"
      : "text-orange-ink";
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && (
        <MaskReveal>
          {/* the wide letter-spacing leaves a gap after the last letter, which
              throws a centred eyebrow visibly off-axis — pull it back */}
          <p
            className={`eyebrow ${dark ? "!text-orange" : ""} ${
              align === "center" ? "-me-[0.36em]" : ""
            }`}
          >
            {eyebrow}
          </p>
        </MaskReveal>
      )}
      <h2 className={`mt-5 display-lg ${dark ? "text-paper" : "text-ink"}`}>
        <MaskReveal>{title}</MaskReveal>
        {accent && (
          <MaskReveal delay={0.09}>
            <span className={`block ${accentTone}`}>{accent}</span>
          </MaskReveal>
        )}
      </h2>
      {lede && (
        <MaskReveal delay={0.16}>
          <p
            className={`serif-accent mt-6 text-lg md:text-xl ${
              dark ? "text-paper/65" : "text-ink/65"
            } ${align === "center" ? "mx-auto" : ""}`}
          >
            {lede}
          </p>
        </MaskReveal>
      )}
    </div>
  );
}

/** A dark masthead for the inner pages. */
export function PageHero({
  eyebrow,
  title,
  accent,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  lede?: string;
  children?: ReactNode;
}) {
  return (
    <header className="grain relative overflow-hidden bg-ink px-5 pb-20 pt-32 md:px-12 md:pb-24 md:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] top-[-25%] size-[60vw] rounded-full opacity-35"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <MaskReveal>
          <p className="eyebrow !text-orange">{eyebrow}</p>
        </MaskReveal>
        <h1 className="mt-5 display-xl text-paper">
          <MaskReveal delay={0.06}>{title}</MaskReveal>
          <MaskReveal delay={0.14}>
            <span className="block text-orange">{accent}</span>
          </MaskReveal>
        </h1>
        {lede && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="serif-accent mt-7 max-w-2xl text-lg text-paper/65 md:text-xl"
          >
            {lede}
          </motion.p>
        )}
        {children}
      </div>
    </header>
  );
}

/** A simple reveal-on-scroll card used across the marketing pages. */
export function RevealCard({
  index = 0,
  className = "",
  children,
}: {
  index?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.07, 0.35),
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
