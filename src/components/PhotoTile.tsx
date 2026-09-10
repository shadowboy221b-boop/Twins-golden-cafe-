import { motion } from "motion/react";

/**
 * A photograph that takes a card's place in a combo grid. A group with two
 * combos in a three-column grid would otherwise leave the last column empty;
 * this fills it with the food instead.
 *
 * Beside the cards on wide screens it matches their height; on narrower
 * screens, where the grid is two columns, it runs the full width underneath.
 */
export function PhotoTile({
  photo,
  caption,
  index = 0,
}: {
  photo: { src: string; w: number; h: number; alt: string };
  caption: string;
  index?: number;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.07, 0.35), ease: [0.16, 1, 0.3, 1] }}
      data-cursor="food"
      className="relative min-h-64 overflow-hidden rounded-2xl md:col-span-2 xl:col-span-1"
    >
      <img
        src={photo.src}
        alt={photo.alt}
        width={photo.w}
        height={photo.h}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/85 to-transparent"
      />
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
        <span className="block h-px w-10 bg-orange" />
        <span className="mt-3 block font-display text-2xl font-extrabold uppercase tracking-[-0.02em] text-paper md:text-3xl">
          {caption}
        </span>
      </figcaption>
    </motion.figure>
  );
}
