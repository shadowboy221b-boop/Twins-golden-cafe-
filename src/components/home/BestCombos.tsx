import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { combos, type Combo } from "@/data/menu";
import { RevealCard, Section, SectionHead } from "@/components/page";
import { FloatingFood } from "@/components/FloatingFood";
import friesExplosion from "@/assets/fries-explosion.webp";

export function BestCombos() {
  return (
    <Section id="best-combos" tone="paper">
      <FloatingFood opacity={0.11} count={4} />

      <div className="relative flex flex-wrap items-end justify-between gap-6">
        <SectionHead
          eyebrow="Most ordered"
          title="BEST"
          accent="COMBOS"
          lede="Tap any combo to see exactly what lands on the tray."
        />
        <Link
          to="/combos"
          data-cursor="cta"
          className="group inline-flex items-center gap-3 text-[0.65rem] font-extrabold uppercase tracking-[0.24em] text-ink transition-colors hover:text-orange-ink"
        >
          View all combos
          <span className="h-px w-8 bg-current transition-all duration-500 group-hover:w-14" />
        </Link>
      </div>

      {/* photograph on the left, the combos on the right */}
      <div className="relative mt-12 grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
        <RevealCard className="lg:sticky lg:top-28">
          <figure
            data-cursor="food"
            className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-ink sm:aspect-[16/10] lg:aspect-[736/1030]"
          >
            <img
              src={friesExplosion}
              alt="Golden fries bursting up in a cloud of spice"
              width={736}
              height={1030}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full object-cover"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/60 to-transparent"
            />
            <figcaption className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <span className="block h-px w-10 bg-orange" />
              <span className="mt-4 block font-display text-4xl font-black uppercase leading-none tracking-[-0.03em] text-paper md:text-5xl">
                {combos.length} <span className="text-orange">combos</span>
              </span>
              <span className="mt-3 block text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-paper/70">
                One tray · everything on it · tap a card to see inside
              </span>
            </figcaption>
          </figure>
        </RevealCard>

        <ul className="grid items-start gap-4 sm:grid-cols-2">
          {combos.map((c, i) => (
            <RevealCard key={c.name} index={i}>
              <li>
                <ComboCard combo={c} />
              </li>
            </RevealCard>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/**
 * Colours for each state, written out in full so Tailwind can see every class.
 * Most combos are orange and flood with ink when opened; the combo the board
 * marks as the hero is the reverse — ink that floods with orange — so the
 * tiles don't read as one flat orange wall.
 */
const TONES = {
  orange: {
    base: "bg-orange",
    flood: "bg-ink",
    name: {
      closed: "text-ink",
      open: "text-orange",
      hover: "group-hover:text-orange group-focus-visible:text-orange",
    },
    meta: {
      closed: "text-ink/60",
      open: "text-paper/55",
      hover: "group-hover:text-paper/55 group-focus-visible:text-paper/55",
    },
    rule: "bg-orange/50",
    line: "text-paper/80",
    chevron: {
      closed: "border-ink/35 text-ink",
      open: "rotate-180 border-orange bg-orange text-ink",
      hover:
        "group-hover:border-orange group-hover:bg-orange group-hover:text-ink group-focus-visible:border-orange group-focus-visible:bg-orange group-focus-visible:text-ink",
    },
  },
  ink: {
    base: "bg-ink",
    flood: "bg-orange",
    name: {
      closed: "text-orange",
      open: "text-ink",
      hover: "group-hover:text-ink group-focus-visible:text-ink",
    },
    meta: {
      closed: "text-paper/55",
      open: "text-ink/60",
      hover: "group-hover:text-ink/60 group-focus-visible:text-ink/60",
    },
    rule: "bg-ink/40",
    line: "text-ink/80",
    chevron: {
      closed: "border-orange/50 text-orange",
      open: "rotate-180 border-ink bg-ink text-orange",
      hover:
        "group-hover:border-ink group-hover:bg-ink group-hover:text-orange group-focus-visible:border-ink group-focus-visible:bg-ink group-focus-visible:text-orange",
    },
  },
} as const;

/**
 * A combo tile that floods with the opposite colour and unpacks its contents.
 * Prices are left to the combos page; the tile only says how much is on the
 * tray, and opening it shows what.
 *
 * Opening is driven two ways on purpose: `group-hover` handles the mouse in
 * pure CSS (no state churn on every pointer move), while the `open` state
 * covers taps and keyboard focus, where hover never fires. It is a real
 * <button> with aria-expanded so the disclosure is announced either way.
 */
function ComboCard({ combo: c }: { combo: Combo }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const t = TONES[c.hero ? "ink" : "orange"];
  const pick = (s: { closed: string; open: string; hover: string }) =>
    `${s.hover} ${open ? s.open : s.closed}`;

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      aria-controls={panelId}
      data-cursor="view"
      className={`group relative flex w-full flex-col items-center overflow-hidden rounded-[1.25rem] px-5 py-6 text-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_oklch(0.677_0.196_46/0.75)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${t.base}`}
    >
      {/* the opposite colour floods up from the base while the card is open */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 origin-bottom transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100 ${t.flood} ${
          open ? "scale-y-100" : "scale-y-0"
        }`}
      />

      {/* Two lines are always reserved, whether the name needs them or not.
          Without it a one-line name makes a shorter card, and the chevrons
          across a row stop lining up. */}
      <span
        className={`relative flex min-h-[2.3em] w-full items-center justify-center font-display text-[1.05rem] font-black uppercase leading-[1.15] tracking-[0.01em] transition-colors duration-500 md:text-xl ${pick(t.name)}`}
      >
        {c.name}
      </span>

      <span
        className={`relative mt-2 text-[0.58rem] font-extrabold uppercase tracking-[0.2em] transition-colors duration-500 ${pick(t.meta)}`}
      >
        {c.contents.length} items
      </span>

      {/* What the tray holds stays folded away until the card opens. The reveal
          is a grid-row transition rather than a JS height animation or a
          max-height cap: 1fr resolves to the real content height, so nothing
          can be clipped no matter how many lines a combo grows to. */}
      <span
        id={panelId}
        className={`relative grid w-full transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <span className="overflow-hidden">
          <span className={`mx-auto mt-4 block h-px w-10 ${t.rule}`} aria-hidden />

          <span className="mt-4 block space-y-1.5">
            {c.contents.map((line) => (
              <span
                key={line}
                className={`block text-[0.68rem] font-bold uppercase leading-snug tracking-[0.08em] ${t.line}`}
              >
                {line}
              </span>
            ))}
          </span>
        </span>
      </span>

      {/* the chevron points down, and turns to point back up once open */}
      <span
        aria-hidden
        className={`relative mt-5 grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-500 group-hover:rotate-180 group-focus-visible:rotate-180 ${pick(t.chevron)}`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="size-3.5">
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
