import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
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
/**
 * The trail above a page's title: Home › Menu. Search engines like the visible
 * trail to match the breadcrumb data in the page's head, and on a phone it is
 * the quickest way back.
 */
export function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  const last = trail.length - 1;
  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex flex-wrap items-center gap-2 text-[0.58rem] font-extrabold uppercase tracking-[0.22em] text-paper/50">
        {trail.map((step, i) => (
          <li key={step.path} className="flex items-center gap-2">
            {i === last ? (
              <span aria-current="page" className="text-paper/80">
                {step.name}
              </span>
            ) : (
              <>
                <Link to={step.path} className="transition-colors hover:text-orange">
                  {step.name}
                </Link>
                <span aria-hidden>›</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  accent,
  lede,
  trail,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  lede?: string;
  /** the page's place in the site, shown above the eyebrow */
  trail?: { name: string; path: string }[];
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
        {trail && <Breadcrumbs trail={trail} />}
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
          <p
            className="rise-in serif-accent mt-7 max-w-2xl text-lg text-paper/65 md:text-xl"
            style={{ animationDelay: "0.35s" }}
          >
            {lede}
          </p>
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
  as = "div",
  children,
}: {
  index?: number;
  className?: string;
  /** "li" when the card is itself an item of a list, so no wrapper sits between the ul and its li */
  as?: "div" | "li";
  children: ReactNode;
}) {
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag
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
    </Tag>
  );
}
