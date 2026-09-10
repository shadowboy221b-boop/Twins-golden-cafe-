import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { heroProducts, specialGroups } from "@/data/specials";
import { MaskReveal, useSpinAllowed } from "@/components/bits";
import { FloatingFood } from "@/components/FloatingFood";
import { RevealCard, Section, SectionHead } from "@/components/page";

/**
 * The signature board. Names only — this is a showcase, and `menu.ts` stays
 * the single place a price is ever written.
 */
export function GoldenSpecials() {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.4 });

  // The two columns travel at slightly different speeds, so the grid reads with
  // depth as it passes. Transform only — it never changes the cards' heights,
  // so the rows stay aligned with each other.
  const slow = useTransform(p, [0, 1], [16, -16]);
  const fast = useTransform(p, [0, 1], [-16, 16]);

  const moving = useSpinAllowed();

  return (
    <Section id="golden-specials" tone="warm">
      <FloatingFood opacity={0.09} />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 size-[55vw] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-30 blur-[120px]"
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

      {/* the eight the kitchen leads with */}
      <ul className="relative z-10 mt-10 flex flex-wrap justify-center gap-2.5">
        {heroProducts.map((h, i) => (
          <RevealCard key={h} index={i}>
            <li className="rounded-full border border-orange/50 bg-orange/10 px-4 py-2 text-[0.6rem] font-extrabold uppercase tracking-[0.16em] text-orange-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-orange hover:bg-orange hover:text-ink">
              {h}
            </li>
          </RevealCard>
        ))}
      </ul>

      {/* A real grid, so the cards sit on shared rows and line up across the
          two columns. `h-full` on the card makes both cells in a row match —
          the height spread here is small, so nothing gains dead space. */}
      <div ref={gridRef} className="relative z-10 mt-14 grid items-stretch gap-6 md:grid-cols-2">
        {specialGroups.map((g, gi) => (
          <motion.div
            key={g.id}
            style={{ y: moving ? (gi % 2 ? fast : slow) : 0 }}
            className="h-full will-change-transform"
          >
            <RevealCard index={gi} className="h-full">
              <article className="group relative flex h-full gap-5 overflow-hidden rounded-2xl border border-ink/10 bg-paper p-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-orange hover:shadow-[0_26px_55px_-30px_oklch(0.175_0.008_60/0.4)]">
                {/* a slow orange wash so the card surface keeps moving */}
                <span
                  aria-hidden
                  className="card-wash pointer-events-none absolute -inset-1/4"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, var(--orange) 0%, transparent 62%)",
                    opacity: 0.07,
                    animationDelay: `${gi * -2.4}s`,
                  }}
                />

                <span className="relative block size-24 shrink-0 overflow-hidden rounded-xl bg-paper-warm md:size-28">
                  <img
                    src={g.src}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    width={g.w}
                    height={g.h}
                    className="size-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-115"
                  />
                  {/* light sweeps across the shot on hover */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 -left-full w-full skew-x-12 bg-gradient-to-r from-transparent via-paper/45 to-transparent transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:left-full"
                  />
                </span>

                <div className="relative min-w-0 flex-1">
                  <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.28em] text-orange-ink">
                    {g.tagline}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg font-extrabold uppercase leading-tight tracking-[-0.02em] text-ink md:text-xl">
                    {g.title}
                  </h3>

                  {/* the rule draws itself out as the card is hovered */}
                  <span
                    aria-hidden
                    className="mt-2.5 block h-[2px] w-8 bg-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
                  />

                  {g.lists ? (
                    <div className="mt-3 space-y-2.5">
                      {g.lists.map((l) => (
                        <div key={l.label}>
                          <p className="flex items-center gap-2 text-[0.5rem] font-extrabold uppercase tracking-[0.24em] text-orange-ink">
                            <span aria-hidden className="h-px w-4 shrink-0 bg-orange/60" />
                            {l.label}
                          </p>
                          <p className="mt-1 text-[0.76rem] leading-relaxed text-ink/70">
                            {l.items.join(" · ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-[0.76rem] leading-relaxed text-ink/70">
                      {g.items.join(" · ")}
                    </p>
                  )}
                </div>
              </article>
            </RevealCard>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
