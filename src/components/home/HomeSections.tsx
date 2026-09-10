import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { categories } from "@/data/menu";
import { RevealCard, Section, SectionHead } from "@/components/page";
import { FloatingFood } from "@/components/FloatingFood";
import pizza from "@/assets/pizza.webp";
import chickenBurger from "@/assets/chicken-burger.webp";

/* ---------------------------------------------------------------- categories */

/**
 * Two counters, shown properly, and a way into the rest.
 *
 * Both shots are cut-outs, so the pair carries the same visual weight — mixing
 * cut-outs with full photographs is what made the old grid look cluttered.
 * Name, count and price come from the board, never typed here.
 */
const FEATURED = [
  { id: "pizza", src: pizza, w: 1200, h: 1200 },
  { id: "burgers-nonveg", src: chickenBurger, w: 1000, h: 1000 },
];

export function CategoriesPreview() {
  const featured = FEATURED.flatMap((f) => {
    const c = categories.find((x) => x.id === f.id);
    return c ? [{ ...f, c, from: Math.min(...c.items.map((it) => it.price)) }] : [];
  });

  return (
    <Section id="categories" tone="ink">
      <FloatingFood opacity={0.06} count={4} />

      <div
        aria-hidden
        className="blob-a pointer-events-none absolute left-1/2 top-0 size-[55vw] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-30 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      <div className="relative">
        <SectionHead
          align="center"
          dark
          eyebrow="The board"
          title="EVERY"
          accent="SECTION"
          lede={`${categories.length} counters under one roof. Every one of them cooked to order.`}
        />
      </div>

      <ul className="relative z-10 mt-14 grid gap-6 md:grid-cols-2">
        {featured.map(({ c, src, w, h, from }, i) => (
          <RevealCard key={c.id} index={i} className="h-full">
            <li className="h-full">
              <Link
                to="/menu"
                hash={c.id}
                data-cursor="view"
                className="group relative flex h-full items-center gap-6 overflow-hidden rounded-3xl border border-paper/12 bg-paper/[0.03] p-7 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-orange md:p-9"
              >
                {/* orange light rises from the base of the card on hover */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-orange/20 to-transparent transition-all duration-700 group-hover:h-full"
                />

                <span className="relative min-w-0 flex-1">
                  <span className="block font-display text-sm font-extrabold tabular-nums text-orange/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-3 block font-display text-2xl font-extrabold uppercase leading-tight tracking-[-0.02em] text-paper md:text-3xl">
                    {c.title}
                  </span>
                  <span className="mt-2 block text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-paper/55">
                    {c.items.length} dishes · {c.tagline}
                  </span>
                  <span className="mt-6 block font-display text-2xl font-extrabold text-orange">
                    from ₹{from}
                  </span>
                  <span className="mt-5 inline-flex items-center gap-3 text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-paper/80 transition-colors duration-300 group-hover:text-orange">
                    Explore
                    <span
                      aria-hidden
                      className="h-px w-6 bg-current transition-all duration-500 group-hover:w-12"
                    />
                  </span>
                </span>

                {/* the dish floats on its own, and leans in on hover */}
                <span className="relative grid size-36 shrink-0 place-items-center sm:size-44 md:size-48">
                  <span
                    aria-hidden
                    className="absolute inset-4 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
                    style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 70%)" }}
                  />
                  <motion.img
                    src={src}
                    alt={c.title}
                    width={w}
                    height={h}
                    loading="lazy"
                    animate={{ y: [0, -10, 0], rotate: [0, i ? -4 : 4, 0] }}
                    transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                    className="food-shadow-dark relative size-full object-contain transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                  />
                </span>
              </Link>
            </li>
          </RevealCard>
        ))}
      </ul>

      <div className="relative z-10 mt-12 flex justify-center">
        <Link
          to="/menu"
          data-cursor="cta"
          className="group inline-flex items-center gap-4 rounded-full bg-orange px-8 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
        >
          View all {categories.length} sections
          <span
            aria-hidden
            className="h-px w-6 bg-ink transition-all duration-500 group-hover:w-12"
          />
        </Link>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ why us */

const REASONS = [
  { t: "Quality Ingredients", d: "Good stuff in. There's no other way to get good stuff out." },
  { t: "Fresh Preparation", d: "The fryer starts when your order does. Nothing waits under a lamp." },
  { t: "Affordable Pricing", d: "Counter food prices for kitchen-standard cooking." },
  { t: "Great Taste", d: "Seasoned properly, served hot, the same way every time." },
];

export function WhyChooseUs() {
  return (
    <Section id="why-us" tone="warm">
      <SectionHead eyebrow="Why choose us" title="WHAT YOU GET" accent="EVERY TIME" />

      <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {REASONS.map((r, i) => (
          <RevealCard key={r.t} index={i}>
            <article className="group h-full rounded-2xl border border-ink/10 bg-paper p-6 transition-all duration-500 hover:-translate-y-1 hover:border-orange">
              <span aria-hidden className="font-display text-3xl font-extrabold text-orange/35">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-lg font-extrabold uppercase tracking-[-0.02em] text-ink">
                {r.t}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">{r.d}</p>
            </article>
          </RevealCard>
        ))}
      </div>
    </Section>
  );
}

