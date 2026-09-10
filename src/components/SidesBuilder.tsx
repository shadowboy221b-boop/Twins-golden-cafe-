import { useEffect, useState } from "react";
import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import type { MenuItem } from "@/data/menu";
import { MaskReveal } from "@/components/bits";
import { RevealCard, Section, SectionHead } from "@/components/page";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The sides as a tray you fill: tap a side to add it, and it drops into the
 * tray below while the add-on total counts up to the new amount. Tap it again,
 * or its × in the tray, to take it back out.
 *
 * Nothing is ordered from here — it's a way to see what a few extras come to.
 * Every price is the one on the board.
 */
export function SidesBuilder({ id, sides }: { id: string; sides: MenuItem[] }) {
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (name: string) =>
    setPicked((p) => (p.includes(name) ? p.filter((n) => n !== name) : [...p, name]));

  const total = picked.reduce((sum, n) => sum + (sides.find((s) => s.name === n)?.price ?? 0), 0);

  // the total rolls to its new value instead of jumping
  const rolling = useSpring(0, { stiffness: 110, damping: 20 });
  useEffect(() => rolling.set(total), [rolling, total]);
  const shownTotal = useTransform(rolling, (v) => `₹${Math.round(v)}`);

  return (
    <Section id={id} tone="ink">
      <SectionHead
        align="center"
        dark
        eyebrow="Make it bigger"
        title="SIDES TO"
        accent="ADD ON"
        lede="Tap a side to put it on your tray — the total adds up as you go."
      />

      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {sides.map((s, i) => {
          const on = picked.includes(s.name);
          return (
            <RevealCard key={s.name} index={i}>
              <li className="h-full">
                <motion.button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s.name)}
                  whileTap={{ scale: 0.97 }}
                  data-cursor="cta"
                  className={`group relative flex h-full w-full items-center gap-4 overflow-hidden rounded-2xl border p-6 text-left transition-colors duration-500 ${
                    on ? "border-orange" : "border-paper/12 hover:border-orange/60"
                  }`}
                >
                  {/* orange sweeps across a side once it's on the tray */}
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute inset-y-0 left-0 bg-orange/15 transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      on ? "w-full" : "w-0"
                    }`}
                  />

                  <span className="relative min-w-0 flex-1">
                    <span className="block font-display text-lg font-extrabold uppercase tracking-[-0.02em] text-paper md:text-xl">
                      {s.name}
                    </span>
                    {s.note && (
                      <span className="mt-1.5 block text-[0.55rem] font-extrabold uppercase tracking-[0.24em] text-paper/50">
                        {s.note}
                      </span>
                    )}
                  </span>

                  <span className="relative shrink-0 font-display text-2xl font-extrabold text-orange">
                    ₹{s.price}
                  </span>

                  <span
                    aria-hidden
                    className={`relative grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-500 ${
                      on
                        ? "border-orange bg-orange text-ink"
                        : "border-paper/25 text-paper group-hover:border-orange"
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.svg
                        key={on ? "on" : "off"}
                        viewBox="0 0 24 24"
                        fill="none"
                        className="size-4"
                        initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                      >
                        <path
                          d={on ? "M5 12.5l4.5 4.5L19 7.5" : "M12 5v14M5 12h14"}
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.svg>
                    </AnimatePresence>
                  </span>
                </motion.button>
              </li>
            </RevealCard>
          );
        })}
      </ul>

      {/* ------------------------------------------------------- the tray */}
      <motion.div
        layout
        transition={{ duration: 0.5, ease: EASE }}
        className="mt-6 flex flex-col gap-5 rounded-2xl border border-paper/12 bg-paper/[0.04] p-5 md:flex-row md:items-center md:gap-8 md:p-6"
        aria-live="polite"
      >
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.3em] text-paper/60">
            Your tray
          </span>
          <motion.span
            key={picked.length}
            initial={{ scale: 1.6 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="grid size-6 place-items-center rounded-full bg-orange font-display text-[0.7rem] font-black text-ink"
          >
            {picked.length}
          </motion.span>
        </div>

        <ul className="flex min-h-9 flex-1 flex-wrap items-center gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {picked.length === 0 ? (
              <motion.li
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-paper/45"
              >
                Nothing on the tray yet
              </motion.li>
            ) : (
              picked.map((n) => (
                <motion.li
                  key={n}
                  layout
                  initial={{ opacity: 0, y: -28, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 420, damping: 24 }}
                  className="flex items-center gap-2 rounded-full bg-orange py-1.5 pl-3.5 pr-1.5 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-ink"
                >
                  {n}
                  <button
                    type="button"
                    onClick={() => toggle(n)}
                    aria-label={`Remove ${n}`}
                    className="grid size-5 place-items-center rounded-full bg-ink/15 transition-colors hover:bg-ink hover:text-orange"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="size-3">
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>

        <div className="flex shrink-0 items-end justify-between gap-5 md:flex-col md:items-end md:gap-1">
          <span className="text-[0.55rem] font-extrabold uppercase tracking-[0.3em] text-paper/55">
            Add-ons
          </span>
          <div className="flex items-center gap-4">
            <AnimatePresence initial={false}>
              {picked.length > 0 && (
                <motion.button
                  type="button"
                  onClick={() => setPicked([])}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="text-[0.55rem] font-extrabold uppercase tracking-[0.24em] text-paper/55 underline-offset-4 hover:text-orange hover:underline"
                >
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
            <motion.span className="font-display text-4xl font-black tabular-nums tracking-[-0.03em] text-orange">
              {shownTotal}
            </motion.span>
          </div>
        </div>
      </motion.div>

      <MaskReveal className="mt-8">
        <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.34em] text-paper/45">
          Extra dip ₹25 · prices in INR
        </p>
      </MaskReveal>
    </Section>
  );
}
