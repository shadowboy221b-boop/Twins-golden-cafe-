import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { categories } from "@/data/menu";
import { ADDRESS_READY, CAFE, CONTACT_DETAILS_READY } from "@/data/site";
import { MaskReveal, useLoopInView, useOpenNow } from "@/components/bits";
import { FloatingFood } from "@/components/FloatingFood";
import { VegMark } from "@/components/VegMark";
import shopFront from "@/assets/shop-front.webp";
import shopFrontSm from "@/assets/shop-front-600.webp";

const EASE = [0.16, 1, 0.3, 1] as const;

const ITEMS = categories.flatMap((c) => c.items);
const VEG = ITEMS.filter((i) => i.veg).length;
const FROM = Math.min(...ITEMS.map((i) => i.price));
const TO = Math.max(...ITEMS.map((i) => i.price));

const TEL = `tel:${CAFE.phone.replace(/\s/g, "")}`;

/**
 * The plain facts, in words: where the cafe is, when it is open, and what is on
 * the board. The rest of the page is photographs and movement; someone deciding
 * where to eat — and every search engine — wants this part written down.
 *
 * It still moves, quietly: food drifting behind, the three cards dealt out as
 * the section arrives, a route walking towards the directions link, and a light
 * that says whether the kitchen is open right now.
 */
export function FindUs() {
  const ref = useRef<HTMLElement>(null);
  const looping = useLoopInView(ref);
  const openNow = useOpenNow(CAFE.openMinutes, CAFE.closeMinutes);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.4 });
  const cardsY = useTransform(p, [0, 1], [30, -30]);
  const photoScale = useTransform(p, [0, 1], [1.12, 1]);

  const card = "relative overflow-hidden bg-paper p-6";

  return (
    <section
      ref={ref}
      id="find-us"
      className="relative overflow-hidden border-t border-ink/10 bg-paper-warm px-5 py-20 md:px-12 md:py-24"
    >
      {/* the food drifts through here too, just faintly */}
      <FloatingFood opacity={0.04} count={4} />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <MaskReveal>
            <p className="eyebrow">Find us</p>
          </MaskReveal>
          <h2 className="mt-5 display-lg text-ink">
            <MaskReveal delay={0.06}>A CAFE IN</MaskReveal>
            <MaskReveal delay={0.14}>
              <span className="block text-orange-ink">ARANI</span>
            </MaskReveal>
          </h2>

          {/* the rule draws itself across as the section comes up */}
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="mt-6 block h-[3px] w-24 origin-left bg-orange"
          />

          <MaskReveal delay={0.22}>
            <p className="serif-accent mt-7 max-w-md text-lg leading-relaxed text-ink/70">
              {CAFE.name} is at {CAFE.shortAddress}, open every day, {CAFE.hoursShort}. Sit in or
              take it away — pizzas, burgers, fried chicken, momos, kunafa, shakes and juices, all
              cooked to order.
            </p>
          </MaskReveal>

          {/* a light that tells you, right now, whether the counter is on */}
          {openNow !== null && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="mt-7 inline-flex items-center gap-3 rounded-full border border-ink/12 bg-paper px-4 py-2"
            >
              <span className="relative flex size-2.5">
                {looping && openNow && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-leaf opacity-60" />
                )}
                <span
                  className={`relative inline-flex size-2.5 rounded-full ${
                    openNow ? "bg-leaf" : "bg-ink/30"
                  }`}
                />
              </span>
              <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-ink/75">
                {openNow
                  ? `Open now · until ${CAFE.closesLabel}`
                  : `Closed now · opens ${CAFE.opensLabel}`}
              </span>
            </motion.p>
          )}
        </div>

        {/* the three questions a hungry stranger actually asks */}
        <motion.div style={{ y: cardsY }} className="flex flex-col gap-4">
          <dl className="grid gap-px overflow-hidden rounded-3xl bg-ink/10 sm:grid-cols-3">
            {ADDRESS_READY && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: EASE }}
                className={`group ${card}`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-orange/12 to-transparent transition-all duration-500 group-hover:h-full"
                />
                <dt className="relative rule-label text-ink/60">Where</dt>
                <dd className="relative mt-4 text-sm leading-relaxed text-ink/75">
                  {CAFE.address}
                </dd>
                <dd className="relative mt-4">
                  <a
                    href={CAFE.directionsUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="cta"
                    className="group/dir inline-flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-orange-ink"
                  >
                    Get directions
                    {/* a route that keeps walking towards the pin */}
                    <svg aria-hidden viewBox="0 0 44 12" className="h-3 w-11 overflow-visible">
                      <path
                        d="M1 6h30"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="4 6"
                        className={looping ? "route-march" : ""}
                      />
                      <circle
                        cx="37"
                        cy="6"
                        r="4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <circle cx="37" cy="6" r="1.4" fill="currentColor" />
                    </svg>
                  </a>
                </dd>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
              className={`group ${card}`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-orange/12 to-transparent transition-all duration-500 group-hover:h-full"
              />
              <dt className="relative rule-label text-ink/60">When</dt>
              <dd className="relative mt-4 font-display text-2xl font-black text-ink">
                {CAFE.hoursShort}
              </dd>
              <dd className="relative mt-2 text-sm text-ink/70">Every day, Monday to Sunday</dd>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
              className={`group ${card}`}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-orange/12 to-transparent transition-all duration-500 group-hover:h-full"
              />
              <dt className="relative rule-label text-ink/60">What</dt>
              <dd className="relative mt-4 font-display text-2xl font-black text-ink">
                {ITEMS.length} dishes
              </dd>
              <dd className="relative mt-2 flex items-center gap-2 text-sm text-ink/70">
                <VegMark className="size-3.5" />
                {VEG} vegetarian
              </dd>
              <dd className="relative mt-1 text-sm text-ink/70">
                ₹{FROM} to ₹{TO}
              </dd>
              <dd className="relative mt-4">
                <Link
                  to="/menu"
                  data-cursor="cta"
                  className="group/menu inline-flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-orange-ink"
                >
                  See the menu
                  <span
                    aria-hidden
                    className="h-px w-5 bg-current transition-all duration-500 group-hover/menu:w-9"
                  />
                </Link>
              </dd>
            </motion.div>
          </dl>

          {/* the shop front itself, so the address has a face to look for */}
          <div className="group relative overflow-hidden rounded-3xl bg-ink">
            <motion.img
              src={shopFront}
              srcSet={`${shopFrontSm} 600w, ${shopFront} 900w`}
              sizes="(min-width: 1024px) 45vw, 90vw"
              alt={`The ${CAFE.name} shop front at ${CAFE.shortAddress}`}
              width={900}
              height={1200}
              loading="lazy"
              decoding="async"
              data-cursor="view"
              style={{ scale: photoScale }}
              className="h-52 w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:h-64 lg:h-[17rem]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent"
            />
            <span className="pointer-events-none absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
              <span className="font-display text-sm font-black uppercase leading-tight tracking-[-0.01em] text-paper md:text-base">
                Look for the golden board
                <span className="mt-1 block text-[0.58rem] font-extrabold tracking-[0.2em] text-paper/70">
                  {CAFE.shortAddress}
                </span>
              </span>
            </span>
          </div>
        </motion.div>
      </div>

      {CONTACT_DETAILS_READY && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.24, ease: EASE }}
          className="relative z-10 mx-auto mt-10 flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3"
        >
          <a
            href={TEL}
            data-cursor="cta"
            className="inline-flex items-center rounded-full bg-ink px-7 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-paper transition-transform duration-300 hover:-translate-y-0.5"
          >
            Call {CAFE.phone}
          </a>
          <Link
            to="/contact"
            data-cursor="cta"
            className="text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-ink/70 underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Hours, map and enquiries
          </Link>
        </motion.div>
      )}
    </section>
  );
}
