import { useRef, type PointerEvent } from "react";
import { AddButton } from "@/components/cart/AddButton";
import { itemKey } from "@/lib/cart";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import type { Combo } from "@/data/menu";
import { useSpinAllowed } from "@/components/bits";

const EASE = [0.16, 1, 0.3, 1] as const;

/** height of the price stub below the tear line */
const TEAR = "5.75rem";

/* Two round bites out of the sides at the tear line, like a paper ticket. A
   mask rather than circles painted in the page colour, so the ticket works on
   any section background. */
const NOTCHES = [
  `radial-gradient(circle at 0 calc(100% - ${TEAR}), transparent 12px, #000 12.5px)`,
  `radial-gradient(circle at 100% calc(100% - ${TEAR}), transparent 12px, #000 12.5px)`,
].join(", ");

/* The ticket's paper: a fine orange dot print over a warm gradient — cream to
   peach on a regular ticket, deep brown to ink on the hero one. */
const DOTS = "radial-gradient(oklch(0.677 0.196 46 / 0.16) 1px, transparent 1.4px) 0 0 / 14px 14px";
const PAPER = `${DOTS}, linear-gradient(160deg, oklch(0.99 0.012 80) 0%, oklch(0.93 0.055 62) 100%)`;
const PAPER_HERO = `${DOTS}, linear-gradient(160deg, oklch(0.27 0.03 50) 0%, oklch(0.16 0.01 60) 100%)`;

/* the stub: orange running into amber, with a faint diagonal stripe */
const STUB =
  "repeating-linear-gradient(135deg, oklch(1 0 0 / 0.1) 0 8px, transparent 8px 16px), linear-gradient(90deg, var(--orange), oklch(0.78 0.16 70))";

const pad = (n: number) => String(n).padStart(2, "0");

/** "2 Crispy Chicken" → quantity 2; a line with no number is a single item */
const splitLine = (line: string) => {
  const m = line.match(/^(\d+)\s+(.*)$/);
  return m ? { qty: m[1], label: m[2] } : { qty: "1", label: line };
};

/**
 * A combo as an order ticket: a dark header with its number, the tray listed
 * like a bill on warm printed paper, and the price stamped on an orange stub
 * below a tear line. The hero combo inverts — orange header, dark paper.
 *
 * It prints itself onto the page as it scrolls into view — the ticket feeds out
 * top to bottom, the lines follow, and the price stamp lands last. With a mouse
 * over it, the ticket tilts toward the pointer and a sheen follows it across.
 * All of it is skipped for anyone who has asked for reduced motion.
 */
export function ComboTicket({ combo: c, index }: { combo: Combo; index: number }) {
  const ref = useRef<HTMLElement>(null);
  const moving = useSpinAllowed();
  const hero = Boolean(c.hero);
  const delay = Math.min(index * 0.12, 0.4);

  // pointer position across the ticket, 0–1 on each axis
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(py, [0, 1], [7, -7]), { stiffness: 220, damping: 20 });
  const tiltY = useSpring(useTransform(px, [0, 1], [-9, 9]), { stiffness: 220, damping: 20 });
  const sheenX = useTransform(px, (v) => `${v * 100}%`);
  const sheenY = useTransform(py, (v) => `${v * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.4), transparent 55%)`;

  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || !moving) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  const lines: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: delay + 0.35 } },
  };
  const line: Variants = {
    hidden: { opacity: 0, x: -14 },
    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
  };

  return (
    <div className="h-full" style={{ perspective: 900 }}>
      <motion.article
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        data-cursor="view"
        initial={moving ? { clipPath: "inset(0 0 100% 0)" } : false}
        whileInView={{ clipPath: "inset(0 0 0% 0)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          background: hero ? PAPER_HERO : PAPER,
          maskImage: NOTCHES,
          WebkitMaskImage: NOTCHES,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
        className={`group relative flex h-full flex-col overflow-hidden rounded-2xl ${
          hero ? "text-paper" : "text-ink"
        }`}
      >
        {/* ------------------------------------------------------- header */}
        <div
          className={`relative flex items-center justify-between gap-3 px-7 py-3.5 ${
            hero ? "bg-orange text-ink" : "bg-ink text-paper"
          }`}
        >
          <span className="text-[0.55rem] font-extrabold uppercase tracking-[0.3em]">
            Order No. <span className={hero ? "text-ink" : "text-orange"}>{pad(index + 1)}</span>
          </span>
          <span className="text-[0.5rem] font-extrabold uppercase tracking-[0.24em] opacity-75">
            {hero ? "★ Family feast" : "Twin's Golden"}
          </span>
        </div>

        {/* --------------------------------------------------------- body */}
        <div className="relative flex-1 px-7 pt-6">
          <h3 className="relative font-display text-xl font-black uppercase leading-tight tracking-[-0.01em] md:text-2xl">
            {c.name}
          </h3>

          {/* the tray, set out like a bill */}
          <motion.ul
            variants={lines}
            initial={moving ? "hidden" : false}
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="relative mt-5 space-y-2.5 pb-7"
          >
            {c.contents.map((text) => {
              const { qty, label } = splitLine(text);
              return (
                <motion.li key={text} variants={line} className="flex items-center gap-3 text-sm">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-orange font-display text-[0.65rem] font-black tabular-nums text-ink">
                    {qty}
                  </span>
                  <span className="min-w-0 font-medium opacity-85">{label}</span>
                  <span
                    aria-hidden
                    className="min-w-4 flex-1 border-b border-dotted border-current opacity-25"
                  />
                </motion.li>
              );
            })}
          </motion.ul>

          {/* into the cart; once it's in, the bar turns into a − count + stepper */}
          <AddButton
            wide
            tone={hero ? "orange" : "ink"}
            item={{ key: itemKey("combo", c.name), name: c.name, price: c.price }}
            className="relative mb-6"
          />
        </div>

        {/* --------------------------------------------------------- stub */}
        <div
          className="relative flex items-center justify-between px-7 text-ink"
          style={{ height: TEAR, background: STUB }}
        >
          {/* the tear line, level with the notches */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-5 top-0 -translate-y-1/2 border-t-2 border-dashed border-ink/35"
          />
          <span className="text-[0.55rem] font-extrabold uppercase tracking-[0.3em] text-ink/75">
            Total
          </span>
          {/* the price is stamped on last, landing with a bit of bounce */}
          <motion.span
            initial={moving ? { scale: 1.8, rotate: -18, opacity: 0 } : false}
            whileInView={{ scale: 1, rotate: -5, opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ type: "spring", stiffness: 420, damping: 14, delay: delay + 0.75 }}
            className="inline-block rounded-lg border-2 border-ink bg-ink px-3 py-1 font-display text-3xl font-black tabular-nums tracking-[-0.03em] text-orange shadow-[0_8px_18px_-8px_oklch(0.175_0.008_60/0.7)] md:text-4xl"
          >
            ₹{c.price}
          </motion.span>
        </div>

        {/* the sheen that follows the pointer, over everything */}
        <motion.span
          aria-hidden
          style={{ background: sheen }}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </motion.article>
    </div>
  );
}
