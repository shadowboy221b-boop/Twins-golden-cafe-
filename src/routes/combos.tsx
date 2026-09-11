import { Fragment } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { combos, happyTreats, wraps } from "@/data/menu";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FeatureBanner } from "@/components/FeatureBanner";
import { SoloCombo } from "@/components/SoloCombo";
import { PhotoTile } from "@/components/PhotoTile";
import { ComboTicket } from "@/components/ComboTicket";
import { SidesBuilder } from "@/components/SidesBuilder";
import wrapPhoto from "@/assets/wrap.webp";
import friedChickenPhoto from "@/assets/fried-chicken.webp";
import loadedFriesPhoto from "@/assets/loaded-fries.webp";
import { PageHero, Section, SectionHead } from "@/components/page";
import burgerSplash from "@/assets/burger-splash.webp";
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
      { property: "og:url", content: "https://twinsgoldencafe.com/combos" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://twinsgoldencafe.com/combos" }],
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
    photo: null,
  },
  {
    id: "chicken",
    title: "Chicken Combos",
    tagline: "Crispy, popcorn, wings — pick your cut",
    items: by("Chicken Lover Combo", "Wings Combo"),
    art: { src: chicken, w: 1104, h: 1104 },
    // Groups short of a full row get a photograph: beside a single combo, or
    // in the empty third column next to two.
    photo: {
      src: friedChickenPhoto,
      w: 1119,
      h: 1405,
      alt: "Crispy fried chicken drumsticks",
      caption: "Fried to order",
    },
  },
  {
    id: "wraps",
    title: "Wrap & Roll Combos",
    tagline: "Twelve inches, rolled and loaded",
    items: by("Wrap Combo"),
    art: null,
    photo: {
      src: wrapPhoto,
      w: 600,
      h: 1200,
      alt: "A loaded wrap, cut to show the filling",
      caption: "12 inch",
    },
  },
  {
    id: "family",
    title: "Family Combos",
    tagline: "Sharing platters built for a table",
    items: by("Family Combo 1", "Family Combo 2"),
    art: { src: fries, w: 900, h: 900 },
    photo: {
      src: loadedFriesPhoto,
      w: 1024,
      h: 1024,
      alt: "Loaded fries with cheese sauce and crispy chicken",
      caption: "Built for the table",
    },
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
          <Fragment key={g.id}>
            <Section id={g.id} tone={gi % 2 ? "warm" : "paper"}>
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
                  className={`pointer-events-none absolute top-[-8%] w-[45vw] md:w-[22vw] ${
                    gi % 2 ? "left-[-8vw]" : "right-[-6vw]"
                  }`}
                />
              )}

              <SectionHead align="center" eyebrow={g.tagline} title={g.title} />

              {"photo" in g && g.photo && g.items.length === 1 && g.items[0] ? (
                <SoloCombo
                  combo={g.items[0]}
                  photo={g.photo}
                  related={wraps}
                  relatedLabel="Also rolled to order"
                  menuHash="wraps"
                />
              ) : (
                <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {/* each combo prints in as an order ticket */}
                  {g.items.map((c, i) => (
                    <ComboTicket key={c.name} combo={c} index={i} />
                  ))}

                  {/* two combos leave the third column empty: the food fills it */}
                  {"photo" in g && g.photo && g.items.length === 2 && (
                    <PhotoTile photo={g.photo} caption={g.photo.caption} index={2} />
                  )}
                </div>
              )}
            </Section>

            {/* the burger banner sits straight after the signature combos */}
            {g.id === "signature" && (
              <FeatureBanner
                src={burgerSplash}
                width={1254}
                height={1254}
                eyebrow="Built for big bites"
                title="STACKED,"
                accent="SAUCED, SERVED."
                lede="Fried chicken fillet, cheese, crisp lettuce and the signature sauce — assembled the moment you order."
                cta={{ to: "/menu", label: "See the burgers" }}
              />
            )}
          </Fragment>
        ))}

        {/* Sides from Happy Treats — priced on their own, not combo-priced */}
        <SidesBuilder id="sides" sides={sides} />
      </main>

      <SiteFooter />
    </>
  );
}
