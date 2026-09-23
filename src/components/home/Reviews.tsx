import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { GOOGLE, REVIEWS } from "@/data/reviews";
import { MaskReveal } from "@/components/bits";
import { FloatingFood } from "@/components/FloatingFood";
import { RevealCard } from "@/components/page";

const EASE = [0.16, 1, 0.3, 1] as const;

function Stars({ n, className = "" }: { n: number; className?: string }) {
  return (
    // a label needs a role to go with it, or a screen reader is told to ignore it
    <span
      role="img"
      className={`inline-flex gap-0.5 ${className}`}
      aria-label={`${n} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 20 20" aria-hidden className="size-4 fill-current">
          <path
            d="M10 1.6l2.5 5.3 5.6.8-4 4 1 5.7L10 14.7 4.9 17.4l1-5.7-4-4 5.6-.8z"
            opacity={i < n ? 1 : 0.22}
          />
        </svg>
      ))}
    </span>
  );
}

/** The rating climbs to 4.4 as the band arrives, then sits still. */
function useCountUp(to: number, run: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!run) return;
    // a phone that asks for less movement gets the number, not the climb
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }
    const start = performance.now();
    const DURATION = 900;
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      // ease out, so it settles rather than stops
      setValue(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [to, run]);

  return value;
}

/**
 * What guests say, in their own words.
 *
 * The page is the cafe talking about itself; this is the one section where
 * somebody else does. Every quote is a real Google review, named and dated, and
 * the button goes to the listing so anyone can check — including the ones that
 * are not flattering.
 */
export function Reviews() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const rating = useCountUp(GOOGLE.rating, inView);

  if (REVIEWS.length === 0) return null;

  return (
    <section
      ref={ref}
      id="reviews"
      className="grain relative overflow-hidden bg-ink px-5 py-20 md:px-12 md:py-28"
    >
      <FloatingFood opacity={0.05} count={4} />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-end lg:gap-16">
          <div>
            <MaskReveal>
              <p className="eyebrow !text-orange">From the counter</p>
            </MaskReveal>
            <h2 className="mt-5 display-lg text-paper">
              <MaskReveal delay={0.06}>WHAT PEOPLE</MaskReveal>
              <MaskReveal delay={0.14}>
                <span className="block text-orange">ACTUALLY SAY</span>
              </MaskReveal>
            </h2>
          </div>

          {/* the listing's own score, climbing into place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
            className="flex items-center gap-5 lg:justify-end"
          >
            <p
              className="font-display text-6xl font-black leading-none tracking-[-0.04em] text-paper tabular-nums md:text-7xl"
              aria-hidden
            >
              {rating.toFixed(1)}
            </p>
            <div>
              <Stars n={5} className="text-orange" />
              <p className="mt-2 text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-paper/55">
                {GOOGLE.rating} average · {GOOGLE.count} Google reviews
              </p>
            </div>
          </motion.div>
        </div>

        {/* six cards is a long scroll on a phone: three there, the rest a tap away */}
        <ul className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <RevealCard
              key={r.name}
              index={i}
              as="li"
              className={`h-full ${i >= 3 ? "hidden md:block" : ""}`}
            >
              <figure className="flex h-full flex-col rounded-3xl border border-paper/12 bg-paper/[0.04] p-7">
                <Stars n={r.stars} className="text-orange" />
                <blockquote className="serif-accent mt-5 flex-1 text-lg leading-relaxed text-paper/85">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-end justify-between gap-4 border-t border-paper/10 pt-5">
                  <div>
                    <p className="font-display text-sm font-black uppercase tracking-[-0.01em] text-paper">
                      {r.name}
                    </p>
                    <p className="mt-1 text-[0.58rem] font-extrabold uppercase tracking-[0.2em] text-paper/45">
                      {r.when} · on Google
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-orange/40 px-3 py-1 text-[0.55rem] font-extrabold uppercase tracking-[0.18em] text-orange">
                    {r.about}
                  </span>
                </figcaption>
              </figure>
            </RevealCard>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          <a
            href={GOOGLE.url}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="cta"
            className="inline-flex items-center rounded-full bg-orange px-7 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
            // the reviews are on Google, not here: nothing on this page can be edited by us
          >
            Read all {GOOGLE.count} on Google
          </a>
          <p className="text-sm text-paper/50">
            Every quote above is from that listing, good months and bad ones alike.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
