import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { combos, type Combo } from "@/data/menu";
import { RevealCard, Section, SectionHead } from "@/components/page";
import { FloatingFood } from "@/components/FloatingFood";

const PRICES = combos.map((c) => c.price);

export function BestCombos() {
  return (
    <Section id="best-combos" tone="paper">
      <FloatingFood opacity={0.11} />

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

      <ul className="relative mt-12 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {combos.map((c, i) => (
          <RevealCard key={c.name} index={i}>
            <li>
              <ComboCard combo={c} />
            </li>
          </RevealCard>
        ))}
      </ul>

      <p className="relative mt-8 text-center text-[0.58rem] font-extrabold uppercase tracking-[0.3em] text-ink/65">
        Extra dip ₹25 · {combos.length} combos · ₹{Math.min(...PRICES)}–₹{Math.max(...PRICES)}
      </p>
    </Section>
  );
}

/**
 * An orange combo tile that flips to ink and unpacks its contents.
 *
 * Opening is driven two ways on purpose: `group-hover` handles the mouse in
 * pure CSS (no state churn on every pointer move), while the `open` state
 * covers taps and keyboard focus, where hover never fires. It is a real
 * <button> with aria-expanded so the disclosure is announced either way.
 */
function ComboCard({ combo: c }: { combo: Combo }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      aria-controls={panelId}
      data-cursor="view"
      className="group relative flex w-full flex-col items-center overflow-hidden rounded-[1.25rem] bg-orange px-5 py-6 text-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_28px_60px_-30px_oklch(0.677_0.196_46/0.75)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
    >
      {/* ink floods up from the base while the card is open */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 origin-bottom bg-ink transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100 ${
          open ? "scale-y-100" : "scale-y-0"
        }`}
      />

      {/* Two lines are always reserved, whether the name needs them or not.
          Without it a one-line name makes a shorter card, and the chevrons
          across a row stop lining up. */}
      <span
        className={`relative flex min-h-[2.3em] w-full items-center justify-center font-display text-[1.05rem] font-black uppercase leading-[1.15] tracking-[0.01em] transition-colors duration-500 group-hover:text-orange group-focus-visible:text-orange md:text-xl ${
          open ? "text-orange" : "text-ink"
        }`}
      >
        {c.name}
      </span>

      {/* Everything the tray holds — including the price — stays folded away
          until the card opens. The reveal is a grid-row transition rather than
          a JS height animation or a max-height cap: 1fr resolves to the real
          content height (measured: the row lands exactly on it), so nothing can
          be clipped no matter how many lines a combo grows to. */}
      <span
        id={panelId}
        className={`relative grid w-full transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <span className="overflow-hidden">
          <span className="mx-auto mt-4 block h-px w-10 bg-orange/50" aria-hidden />

          <span className="mt-4 block space-y-1.5">
            {c.contents.map((line) => (
              <span
                key={line}
                className="block text-[0.68rem] font-bold uppercase leading-snug tracking-[0.08em] text-paper/80"
              >
                {line}
              </span>
            ))}
          </span>

          <span className="mt-5 block font-display text-3xl font-black leading-none tracking-[-0.04em] text-orange md:text-4xl">
            ₹{c.price}
          </span>
        </span>
      </span>

      {/* the chevron points down, and turns to point back up once open */}
      <span
        aria-hidden
        className={`relative mt-5 grid size-8 shrink-0 place-items-center rounded-full border text-ink transition-all duration-500 group-hover:rotate-180 group-hover:border-orange group-hover:bg-orange group-focus-visible:rotate-180 group-focus-visible:border-orange group-focus-visible:bg-orange ${
          open ? "rotate-180 border-orange bg-orange" : "border-ink/35"
        }`}
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
