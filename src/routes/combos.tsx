import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { combos, happyTreats } from "@/data/menu";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CtaBand, PageHero, RevealCard, Section, SectionHead } from "@/components/page";
import { MaskReveal } from "@/components/bits";
import chicken from "@/assets/chicken.webp";
import chickenBurger from "@/assets/chicken-burger.webp";
import fries from "@/assets/fries.webp";

const title = "Best Combos — Twin's Golden Cafe";
const description =
  "Every combo at Twin's Golden Cafe: snack combos, chicken lover, burger combos, wings, wraps and family feasts — with what's inside and what it costs.";

export const Route = createFileRoute("/combos")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/combos" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/combos" }],
  }),
  component: CombosPage,
});

const by = (...names: string[]) => combos.filter((c) => names.includes(c.name));

const CURATED = [
  {
    id: "signature",
    title: "Signature Combos",
    tagline: "The three people come back for",
    items: by("Snack Combo", "Burger Combo", "Premium Burger Combo"),
    art: { src: chickenBurger, w: 1000, h: 1000 },
  },
  {
    id: "chicken",
    title: "Chicken Combos",
    tagline: "Crispy, popcorn, wings — pick your cut",
    items: by("Chicken Lover Combo", "Wings Combo"),
    art: { src: chicken, w: 1104, h: 1104 },
  },
  {
    id: "wraps",
    title: "Wrap & Roll Combos",
    tagline: "Twelve inches, rolled and loaded",
    items: by("Wrap Combo"),
    art: null,
  },
  {
    id: "family",
    title: "Family Combos",
    tagline: "Sharing platters built for a table",
    items: by("Family Combo 1", "Family Combo 2"),
    art: { src: fries, w: 900, h: 900 },
  },
];

// The groups above are curated by name, so renaming or adding a combo could
// silently drop it off the page. Anything unclaimed gets its own group rather
// than disappearing — a combo the kitchen sells must always be listed.
const claimed = new Set(CURATED.flatMap((g) => g.items.map((i) => i.name)));
const unclaimed = combos.filter((c) => !claimed.has(c.name));

const GROUPS = [
  ...CURATED.filter((g) => g.items.length > 0),
  ...(unclaimed.length
    ? [
        {
          id: "more",
          title: "More Combos",
          tagline: "Also on the counter",
          items: unclaimed,
          art: null,
        },
      ]
    : []),
];

// Sides worth adding to a combo. Named rather than sliced so the list stays
// meaningful if Happy Treats is reordered — and it comes straight from the
// printed menu, so the prices can never drift from the board.
const SIDE_NAMES = [
  "French Fries",
  "Peri Peri Fries",
  "Cheesey Fries",
  "Popcorn Chicken",
  "Chicken Nuggets",
  "Chicken Roll",
];
const sides = SIDE_NAMES.map((n) => happyTreats.find((t) => t.name === n)).filter(
  (t): t is (typeof happyTreats)[number] => Boolean(t),
);

const PRICES = combos.map((c) => c.price);

function CombosPage() {
  return (
    <>
      <Cursor />
      <SiteHeader overDark />

      <main className="relative">
        <PageHero
          eyebrow="Better together"
          title="BEST COMBOS"
          accent="FOR EVERY CRAVING"
          lede="One plate, one price, nothing missing. Every combo below is on the counter today."
        >
          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap gap-x-12 gap-y-6"
          >
            {[
              { v: String(combos.length), l: "Combos" },
              { v: `₹${Math.min(...PRICES)}–₹${Math.max(...PRICES)}`, l: "Price range" },
              { v: "₹25", l: "Extra dip" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="font-display text-3xl font-extrabold tracking-[-0.03em] text-orange md:text-4xl">
                  {s.v}
                </dt>
                <dd className="mt-1 text-[0.55rem] font-extrabold uppercase tracking-[0.26em] text-paper/55">
                  {s.l}
                </dd>
              </div>
            ))}
          </motion.dl>
        </PageHero>

        {GROUPS.map((g, gi) => (
          <Section key={g.id} id={g.id} tone={gi % 2 ? "warm" : "paper"}>
            {g.art && (
              <motion.img
                src={g.art.src}
                alt=""
                aria-hidden
                loading="lazy"
                width={g.art.w}
                height={g.art.h}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 0.12, scale: 1 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-none absolute top-[-8%] w-[45vw] blur-[2px] md:w-[22vw] ${
                  gi % 2 ? "left-[-8vw]" : "right-[-6vw]"
                }`}
              />
            )}

            <SectionHead align="center" eyebrow={g.tagline} title={g.title} />

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {g.items.map((c, i) => (
                <RevealCard key={c.name} index={i}>
                  <article
                    data-cursor="view"
                    className={`group flex h-full flex-col rounded-2xl border p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_26px_55px_-30px_oklch(0.175_0.008_60/0.45)] ${
                      c.hero
                        ? "border-orange bg-orange"
                        : "border-ink/10 bg-paper hover:border-orange"
                    }`}
                  >
                    <h3
                      className="font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-ink md:text-2xl"
                    >
                      {c.name}
                    </h3>

                    <ul className="mt-4 space-y-1.5">
                      {c.contents.map((line) => (
                        <li
                          key={line}
                          className={`flex gap-2.5 text-sm ${c.hero ? "text-ink/80" : "text-ink/65"}`}
                        >
                          <span
                            aria-hidden
                            className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                              c.hero ? "bg-ink/50" : "bg-orange"
                            }`}
                          />
                          {line}
                        </li>
                      ))}
                    </ul>

                    <p
                      className={`mt-auto pt-6 font-display text-3xl font-extrabold md:text-4xl ${
                        c.hero ? "text-ink" : "text-orange-ink"
                      }`}
                    >
                      ₹{c.price}
                    </p>
                  </article>
                </RevealCard>
              ))}
            </div>
          </Section>
        ))}

        {/* Sides from Happy Treats — priced on their own, not combo-priced */}
        <Section id="sides" tone="ink">
          <SectionHead
            align="center"
            dark
            eyebrow="Make it bigger"
            title="SIDES TO"
            accent="ADD ON"
            lede="Straight from Happy Treats. Add any of these to a combo for the table."
          />
          <ul className="mt-12 grid gap-5 md:grid-cols-3">
            {sides.map((k, i) => (
              <RevealCard key={k.name} index={i}>
                <li className="group flex h-full items-baseline gap-4 rounded-2xl border border-paper/12 p-6 transition-colors duration-500 hover:border-orange">
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-extrabold uppercase tracking-[-0.02em] text-paper md:text-xl">
                      {k.name}
                    </span>
                    {k.note && (
                      <span className="mt-1.5 block text-[0.55rem] font-extrabold uppercase tracking-[0.24em] text-paper/50">
                        {k.note}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-display text-2xl font-extrabold text-orange">
                    ₹{k.price}
                  </span>
                </li>
              </RevealCard>
            ))}
          </ul>

          <MaskReveal className="mt-10">
            <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.34em] text-paper/45">
              Extra dip ₹25 · prices in INR
            </p>
          </MaskReveal>
        </Section>

        <CtaBand
          title="ORDER YOUR"
          accent="FAVOURITE COMBO"
          primary={{ to: "/contact", label: "Order Now" }}
          secondary={{ to: "/menu", label: "See the full menu" }}
        />
      </main>

      <SiteFooter />
    </>
  );
}
