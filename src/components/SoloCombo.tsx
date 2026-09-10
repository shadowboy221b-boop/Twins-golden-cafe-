import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { Combo, MenuItem } from "@/data/menu";
import { ComboTicket } from "@/components/ComboTicket";

/**
 * A combo group with only one combo in it, laid out as a feature: a photograph
 * on one side, the combo on the other, and the rest of that category from the
 * board underneath — so a single card never sits alone in an empty grid.
 *
 * Every price here comes from the menu data; nothing is typed in by hand.
 */
export function SoloCombo({
  combo,
  photo,
  related,
  relatedLabel,
  menuHash,
}: {
  combo: Combo;
  photo: { src: string; w: number; h: number; alt: string };
  /** the category this combo is built from, listed with its own prices */
  related: MenuItem[];
  relatedLabel: string;
  /** the menu section the button jumps to */
  menuHash: string;
}) {
  return (
    <div className="mx-auto mt-12 grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-12">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        data-cursor="food"
        className="relative mx-auto w-full max-w-sm overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-30px_oklch(0.175_0.008_60/0.5)] md:max-w-none"
        style={{ aspectRatio: "4 / 5" }}
      >
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.w}
          height={photo.h}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
        <span className="absolute left-4 top-4 rounded-full bg-orange px-4 py-2 text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-ink">
          12 inch
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* the same order ticket as every other combo on the page */}
        <ComboTicket combo={combo} index={0} />

        <div className="mt-6">
          <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.3em] text-ink/50">
            {relatedLabel}
          </p>
          <ul className="mt-3 divide-y divide-ink/10">
            {related.map((item) => (
              <li key={item.name} className="flex items-baseline gap-3 py-2.5">
                <span className="min-w-0 flex-1 text-sm font-bold uppercase tracking-[0.08em] text-ink/80">
                  {item.name}
                  {item.veg && (
                    <span className="ml-2 text-[0.55rem] tracking-[0.2em] text-green-700">VEG</span>
                  )}
                </span>
                <span className="font-display text-lg font-extrabold text-orange-ink">
                  ₹{item.price}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          to="/menu"
          hash={menuHash}
          data-cursor="cta"
          className="group mt-7 inline-flex items-center gap-4 rounded-full bg-ink px-7 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.24em] text-paper transition-transform duration-300 hover:-translate-y-0.5"
        >
          See all wraps on the menu
          <span
            aria-hidden
            className="h-px w-6 bg-orange transition-all duration-500 group-hover:w-12"
          />
        </Link>
      </motion.div>
    </div>
  );
}
