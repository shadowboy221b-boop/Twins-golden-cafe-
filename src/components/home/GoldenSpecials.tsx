import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "@tanstack/react-router";
import { motion, type Variants } from "motion/react";
import {
  heroProducts as allHeroProducts,
  specialGroups as allGroups,
  type SpecialGroup,
} from "@/data/specials";
import { MaskReveal, useSpinAllowed } from "@/components/bits";
import { FloatingFood } from "@/components/FloatingFood";
import { Section, SectionHead } from "@/components/page";
import wrapPhoto from "@/assets/wrap.webp";

/** how long each category holds before the showcase moves on */
const SLIDE_MS = 5000;

/**
 * Fried chicken and kunafa each have a section of their own on the home page,
 * so the showcase leaves them out instead of repeating them. The chicken group
 * also carries the signature wraps, which appear nowhere else on the page, so
 * those stay as a wraps-only group. The shared data is untouched — the menu
 * page's board still lists everything.
 */
const specialGroups: SpecialGroup[] = allGroups
  .filter((g) => g.id !== "signature-kunafa")
  .map((g) =>
    g.id === "signature-chicken"
      ? {
          ...g,
          id: "signature-wraps",
          title: "Signature Wraps",
          tagline: "Rolled and loaded",
          items: g.items.filter((item) => /wrap/i.test(item)),
          src: wrapPhoto,
          w: 600,
          h: 1200,
        }
      : g,
  );

/** groups whose photograph is a cut-out, shown whole over a warm light */
const CUTOUTS = new Set(["signature-pizzas"]);

const EASE = [0.16, 1, 0.3, 1] as const;

const pad = (n: number) => String(n).padStart(2, "0");

const itemsOf = (g: SpecialGroup) => [...g.items, ...(g.lists?.flatMap((l) => l.items) ?? [])];

/** Which group a headline product belongs to. The headline names can run
 *  longer than the board's ("…Brownie Milkshake" vs "…Brownie"), so a prefix
 *  either way counts. */
const groupOf = (product: string) =>
  specialGroups.findIndex((g) =>
    itemsOf(g).some((i) => product === i || product.startsWith(i) || i.startsWith(product)),
  );

/** the headline products, minus any whose category was left out above */
const heroProducts = allHeroProducts.filter((h) => groupOf(h) >= 0);

/** What an open panel lists: sub-list names become labels among the chips. */
const chipsOf = (g: SpecialGroup) =>
  g.lists
    ? g.lists.flatMap((l) => [
        { text: l.label, label: true },
        ...l.items.map((text) => ({ text, label: false })),
      ])
    : g.items.map((text) => ({ text, label: false }));

/* the open panel's copy comes up in sequence once the panel has widened */
const reveal: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const draw: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.8, ease: EASE } },
};
const chipList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
};
const chip: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
};

/**
 * The signature board as a row of tall photographic panels. One stands open —
 * wide, lit, with its dishes listed — while the rest fold down to slim strips
 * with their names running up the side. The open panel moves along by itself,
 * holds still while a mouse is over the row or the row is off screen, and
 * never moves at all for anyone who has asked for reduced motion.
 *
 * On phones the row becomes a stack: the open panel is tall and the others are
 * short bars. Exactly one panel is ever open, so the stack's total height never
 * changes and the page doesn't jump as it advances.
 *
 * Names only — this is a showcase, and `menu.ts` stays the single place a price
 * is ever written.
 */
export function GoldenSpecials() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const row = useRef<HTMLDivElement>(null);
  const moving = useSpinAllowed();

  // only run the timer while the panels are actually on screen
  useEffect(() => {
    const el = row.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(Boolean(e?.isIntersecting)), {
      threshold: 0.25,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const count = specialGroups.length;
  const go = (i: number) => setActive(((i % count) + count) % count);
  const autoplay = moving && inView && !hovered;

  const onKey = (e: KeyboardEvent<HTMLDivElement>, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go(i);
      return;
    }
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (i + step + count) % count;
    go(next);
    (row.current?.children[next] as HTMLElement | undefined)?.focus();
  };

  return (
    <Section id="golden-specials" tone="warm">
      <FloatingFood opacity={0.08} count={3} />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 size-[55vw] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      {/* the floaters are absolute, so everything after them needs its own
          stacking context or the type ends up underneath */}
      <div className="relative">
        <SectionHead
          align="center"
          eyebrow="The Golden Specials"
          title="SIGNATURE"
          accent="CREATIONS"
          lede="Our signature creations, premium favourites and customer-loved treats."
        />
      </div>

      {/* the headline products — each one opens its category */}
      <ul className="relative z-10 mt-10 flex flex-wrap justify-center gap-2.5">
        {heroProducts.map((h, i) => {
          const target = groupOf(h);
          const on = target === active;
          return (
            <motion.li
              key={h}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.35), ease: EASE }}
            >
              <button
                type="button"
                onClick={() => go(target)}
                data-cursor="view"
                className={`rounded-full border px-4 py-2 text-[0.6rem] font-extrabold uppercase tracking-[0.16em] transition-all duration-300 hover:-translate-y-0.5 ${
                  on
                    ? "border-orange bg-orange text-ink"
                    : "border-orange/50 bg-orange/10 text-orange-ink hover:border-orange hover:bg-orange hover:text-ink"
                }`}
              >
                {h}
              </button>
            </motion.li>
          );
        })}
      </ul>

      {/* ------------------------------------------------------- the panels */}
      <motion.div
        ref={row}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1, ease: EASE }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
        className="relative z-10 mt-14 flex flex-col gap-3 lg:h-[36rem] lg:flex-row"
      >
        {specialGroups.map((s, i) => {
          const on = i === active;
          const cut = CUTOUTS.has(s.id);
          return (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              aria-expanded={on}
              aria-label={s.title}
              onClick={() => go(i)}
              onKeyDown={(e) => onKey(e, i)}
              data-cursor={on ? "food" : "view"}
              style={{ flexGrow: on ? 7 : 1 }}
              className={`group relative isolate cursor-pointer overflow-hidden rounded-[1.75rem] bg-ink outline-none transition-[height,flex-grow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-4 focus-visible:ring-offset-paper-warm lg:h-auto lg:min-w-0 lg:basis-0 ${
                on ? "h-[28rem] sm:h-[32rem]" : "h-[4.75rem]"
              }`}
            >
              {/* the photograph — a cut-out sits whole on a warm light */}
              {cut && (
                <span
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 42%, oklch(0.677 0.196 46 / 55%) 0%, transparent 60%)",
                  }}
                />
              )}
              <img
                src={s.src}
                alt=""
                aria-hidden
                width={s.w}
                height={s.h}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 size-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  cut ? "object-contain p-8 pb-40 lg:p-14 lg:pb-52" : "object-cover"
                } ${on ? "scale-100" : "scale-110 group-hover:scale-100"}`}
              />

              {/* a folded panel sits in shadow; the open one is lit */}
              <span
                aria-hidden
                className={`absolute inset-0 transition-colors duration-700 ${
                  on ? "bg-ink/0" : "bg-ink/60 group-hover:bg-ink/40"
                }`}
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink via-ink/65 to-transparent"
              />
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-0 rounded-[1.75rem] border transition-colors duration-700 ${
                  on ? "border-orange/60" : "border-paper/10 group-hover:border-orange/40"
                }`}
              />

              {/* the timer across the top of the open panel */}
              {on && moving && (
                <span aria-hidden className="absolute inset-x-0 top-0 z-10 h-1 bg-paper/10">
                  <span
                    key={s.id}
                    onAnimationEnd={() => go(active + 1)}
                    className="block h-full origin-left bg-orange"
                    style={{
                      animation: `grow-x ${SLIDE_MS}ms linear forwards`,
                      animationPlayState: autoplay ? "running" : "paused",
                    }}
                  />
                </span>
              )}

              <span
                className={`absolute left-5 top-5 z-10 font-display text-xs font-black tabular-nums tracking-[0.2em] transition-colors duration-500 lg:left-1/2 lg:-translate-x-1/2 ${
                  on ? "text-orange lg:left-7 lg:translate-x-0" : "text-paper/60"
                }`}
              >
                {pad(i + 1)}
              </span>

              {/* folded: the name, running up the strip on wide screens */}
              <span
                aria-hidden={on}
                className={`absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-sm font-extrabold uppercase tracking-[0.1em] text-paper transition-opacity lg:bottom-7 lg:left-1/2 lg:top-auto lg:-translate-x-1/2 lg:translate-y-0 lg:rotate-180 lg:[writing-mode:vertical-rl] ${
                  on ? "opacity-0 duration-200" : "opacity-100 delay-300 duration-500"
                }`}
              >
                {s.title}
              </span>

              {/* open: the big number, the name and everything in it */}
              {on && (
                <>
                  <motion.span
                    aria-hidden
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
                    className="pointer-events-none absolute right-6 top-3 hidden font-display text-[7rem] font-black leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.28)] sm:block lg:right-8 lg:text-[9rem]"
                  >
                    {pad(i + 1)}
                  </motion.span>

                  <motion.div
                    variants={reveal}
                    initial="hidden"
                    animate="show"
                    className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-9"
                  >
                    <motion.p
                      variants={rise}
                      className="text-[0.6rem] font-extrabold uppercase tracking-[0.3em] text-orange"
                    >
                      {pad(i + 1)} / {pad(count)} · {s.tagline}
                    </motion.p>
                    <motion.h3
                      variants={rise}
                      className="mt-3 font-display text-3xl font-black uppercase leading-[0.95] tracking-[-0.02em] text-paper sm:text-4xl lg:text-5xl"
                    >
                      {s.title}
                    </motion.h3>
                    <motion.span
                      aria-hidden
                      variants={draw}
                      className="mt-5 block h-[2px] w-20 origin-left bg-orange"
                    />
                    {/* A phone-width panel only has room for a few chips: it
                        shows the first six and a count of the rest, and drops
                        the sub-list labels. Wide screens list everything. */}
                    <motion.ul
                      variants={chipList}
                      className="mt-5 flex max-h-44 flex-wrap items-center gap-2 overflow-hidden lg:max-h-56"
                    >
                      {chipsOf(s).map((c, j, list) => {
                        const before = list.slice(0, j).filter((x) => !x.label).length;
                        const phoneHidden = c.label || before >= 6;
                        return (
                          <motion.li
                            key={c.text}
                            variants={chip}
                            className={`${phoneHidden ? "hidden lg:block" : ""} ${
                              c.label
                                ? "mr-1 text-[0.58rem] font-extrabold uppercase tracking-[0.24em] text-orange"
                                : "rounded-full border border-paper/25 bg-ink/45 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.08em] text-paper/90"
                            }`}
                          >
                            {c.text}
                          </motion.li>
                        );
                      })}
                      {itemsOf(s).length > 6 && (
                        <motion.li
                          variants={chip}
                          className="rounded-full bg-orange px-3 py-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-ink lg:hidden"
                        >
                          +{itemsOf(s).length - 6} more
                        </motion.li>
                      )}
                    </motion.ul>
                  </motion.div>
                </>
              )}
            </div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative z-10 mt-12 flex justify-center"
      >
        <Link
          to="/menu"
          data-cursor="cta"
          className="inline-flex items-center rounded-full bg-orange px-8 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
        >
          See the full menu
        </Link>
      </motion.div>

      <MaskReveal className="relative z-10 mt-8">
        <p className="text-center text-[0.55rem] font-extrabold uppercase tracking-[0.3em] text-ink/65">
          Ask the counter for today&apos;s specials pricing
        </p>
      </MaskReveal>
    </Section>
  );
}
