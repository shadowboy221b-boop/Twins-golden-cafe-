import { createFileRoute, Link } from "@tanstack/react-router";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero, RevealCard, Section, SectionHead } from "@/components/page";
import { AddButton } from "@/components/cart/AddButton";
import { itemKey } from "@/lib/cart";
import { CAFE } from "@/data/site";
import { chickenWraps, koreanItems, loadedFries } from "@/data/menu";
import {
  breadcrumbSchema,
  faqSchema,
  ld,
  pageSchema,
  restaurantSchema,
  SITE_URL,
} from "@/data/seo";
import koreanChicken from "@/assets/korean-chicken.webp";

const title = "Korean Fried Chicken in Arani — Twin's Golden Cafe";
const description =
  "Double-fried Korean chicken tossed to order in gochujang, teriyaki, malai or smokey BBQ — ₹159 to ₹189 at Twin's Golden Cafe, Old Bus Stand, Arani.";

const PATH = "/korean-fried-chicken";

const PRICES = koreanItems.map((i) => i.price);
const FROM = Math.min(...PRICES);
const TO = Math.max(...PRICES);

/** The same glazes, on the counters either side of this one. */
const ALSO = [
  ...loadedFries.filter((f) => /gochujang|teriyaki/i.test(f.name)),
  ...chickenWraps.filter((w) => /korean/i.test(w.name)),
];

/**
 * What each glaze tastes of. Written from what goes into it — nothing here
 * claims anything the kitchen does not actually do.
 */
const GLAZES: Record<string, string> = {
  "Korean Crispy Fried Chicken":
    "The original: gochujang, garlic and a little sweetness, hot enough to notice and sticky enough to need a napkin.",
  "Dragon Crispy Fried Chicken": "The hottest of the five — the same glaze, taken further.",
  "Teriyaki Crispy Fried Chicken":
    "Soy and honey cooked down until it glosses. No chilli, so it is the one children finish.",
  "Malai Crispy Fried Chicken":
    "Cream and mild spice instead of chilli — the gentlest on the board.",
  "Smokey BBQ Chicken": "Smoked barbecue, closer to a grill than to a sauce.",
};

/** Said plainly, because these are the questions that get asked at the counter. */
const FAQ = [
  {
    q: "What makes it Korean fried chicken and not ordinary fried chicken?",
    a: "Two things. It is fried twice — once to cook it, once to drive the moisture out of the crust — and it is tossed in its glaze only after it comes out of the second fry, so the coating stays crisp under the sauce instead of going soft in it.",
  },
  {
    q: "Which ones are spicy?",
    a: `${koreanItems
      .filter((i) => i.hot)
      .map((i) => i.name)
      .join(" and ")} are the hot ones. ${koreanItems
      .filter((i) => !i.hot)
      .map((i) => i.name)
      .join(
        ", ",
      )} are not — teriyaki is sweet, malai is creamy and the barbecue is smoked rather than hot.`,
  },
  {
    q: "What does it cost?",
    a: `From ₹${FROM} to ₹${TO}. Every price is on the menu page, and the counter does not add anything to it.`,
  },
  {
    q: "Do you deliver Korean fried chicken in Arani?",
    a: `Yes — across ${CAFE.deliveryTown} town and up to about ${CAFE.deliveryRadiusKm} km around it, ${CAFE.deliveryPlaces.join(", ")} included. Order on this site and it reaches the kitchen on WhatsApp, or order through Swiggy.`,
  },
  {
    q: "Where do I eat it?",
    a: `${CAFE.name}, ${CAFE.shortAddress} — by the Old Bus Stand. Open every day, ${CAFE.hoursShort}. It is fried when you order, so it reaches the table hot.`,
  },
  {
    q: "Is the glaze on anything else?",
    a: `Yes: ${ALSO.map((d) => `${d.name} (₹${d.price})`).join(", ")}.`,
  },
];

/** The five dishes as a list search engines can read, each with its price. */
const listSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Korean fried chicken at Twin's Golden Cafe, Arani",
  itemListElement: koreanItems.map((dish, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "MenuItem",
      name: dish.name,
      description: GLAZES[dish.name],
      offers: { "@type": "Offer", price: dish.price, priceCurrency: "INR" },
    },
  })),
};

export const Route = createFileRoute("/korean-fried-chicken")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}${PATH}` },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE_URL}/share/korean-fried-chicken.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Korean fried chicken glazed in gochujang at Twin's Golden Cafe, Arani",
      },
      { name: "twitter:image", content: `${SITE_URL}/share/korean-fried-chicken.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}${PATH}` }],
    scripts: [
      ld(pageSchema({ path: "/korean-fried-chicken", name: title, description })),
      ld(restaurantSchema),
      ld(listSchema),
      ld(faqSchema(FAQ)),
      ld(
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Korean Fried Chicken", path: PATH },
        ]),
      ),
    ],
  }),
  component: KoreanPage,
});

function KoreanPage() {
  return (
    <>
      <Cursor />
      <SiteHeader overDark />

      <main>
        <PageHero
          eyebrow="New at the counter"
          title="KOREAN FRIED"
          accent="CHICKEN IN ARANI"
          lede={`Fried twice, tossed by hand the moment it comes out, and eaten with your fingers. Five glazes, ₹${FROM} to ₹${TO}, at the Old Bus Stand.`}
          trail={[
            { name: "Home", path: "/" },
            { name: "Korean Fried Chicken", path: PATH },
          ]}
        />

        {/* ------------------------------------------------------- the dish */}
        <Section tone="warm">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <SectionHead eyebrow="How it is made" title="TWICE IN THE" accent="FRYER" inkAccent />

              <div className="serif-accent mt-7 space-y-4 text-lg leading-relaxed text-ink/70">
                <p>
                  Ordinary fried chicken is fried once. This goes in twice — the first time to cook
                  it through, the second, hotter, to drive the last of the moisture out of the
                  coating. That is the whole trick: a crust dry enough to stay crisp after something
                  wet is poured over it.
                </p>
                <p>
                  The glaze goes on last, in a bowl, tossed by hand while the chicken is still too
                  hot to hold. Sesame over the top. It is not sauced in advance and it is not held
                  under a lamp, which is why it is cooked only once you order it.
                </p>
              </div>

              <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
                {[
                  { v: String(koreanItems.length), l: "Glazes" },
                  { v: `₹${FROM}–₹${TO}`, l: "Price range" },
                  { v: "2×", l: "Fried" },
                ].map((s) => (
                  <div key={s.l}>
                    <dt className="font-display text-3xl font-extrabold tracking-[-0.03em] text-orange-ink md:text-4xl">
                      {s.v}
                    </dt>
                    <dd className="mt-1 text-[0.55rem] font-extrabold uppercase tracking-[0.26em] text-ink/55">
                      {s.l}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <figure className="relative mx-auto w-[84vw] max-w-[28rem] sm:w-[60vw] lg:w-full">
              <img
                src={koreanChicken}
                alt="Korean fried chicken wings glazed in gochujang and sesame at Twin's Golden Cafe, Arani"
                width={800}
                height={800}
                loading="lazy"
                decoding="async"
                className="aspect-square size-full rounded-[2rem] border-2 border-orange/25 object-cover"
              />
            </figure>
          </div>
        </Section>

        {/* ----------------------------------------------------- the glazes */}
        <Section id="glazes">
          <SectionHead
            eyebrow="The counter"
            title="FIVE"
            accent="GLAZES"
            lede="Every one is the same chicken, fried the same way. What changes is what it is tossed in."
            inkAccent
          />

          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {koreanItems.map((dish, i) => (
              <RevealCard
                as="li"
                key={dish.name}
                index={i}
                className="flex h-full flex-col rounded-2xl border border-ink/10 bg-paper-warm p-6 transition-colors duration-300 hover:border-orange"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-lg font-extrabold uppercase tracking-[-0.01em] text-ink">
                    {dish.name}
                  </h3>
                  <span className="shrink-0 font-display text-xl font-extrabold tabular-nums text-orange-ink">
                    ₹{dish.price}
                  </span>
                </div>

                {dish.hot && (
                  <p className="mt-1.5 text-[0.5rem] font-extrabold uppercase tracking-[0.2em] text-orange-ink">
                    Spicy
                  </p>
                )}

                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/65">
                  {GLAZES[dish.name]}
                </p>

                <div className="mt-5">
                  <AddButton
                    item={{
                      key: itemKey("korean", dish.name),
                      name: dish.name,
                      price: dish.price,
                    }}
                  />
                </div>
              </RevealCard>
            ))}
          </ul>

          <p className="mt-8 text-sm leading-relaxed text-ink/60">
            The same glazes turn up elsewhere on the board:{" "}
            {ALSO.map((d, i) => (
              <span key={d.name}>
                {i > 0 && ", "}
                {d.name} (₹{d.price})
              </span>
            ))}
            . The whole board is on the{" "}
            <Link
              to="/menu"
              className="font-semibold text-orange-ink underline-offset-4 hover:underline"
            >
              menu page
            </Link>
            .
          </p>
        </Section>

        {/* --------------------------------------------------------- the FAQ */}
        <Section tone="ink">
          <SectionHead eyebrow="Asked at the counter" title="GOOD TO" accent="KNOW" dark />

          {/* The questions run in two columns under the heading rather than in
              one column beside it. Beside it, the heading is short and the
              answers are long, so whichever side held the heading emptied out
              as the other scrolled on. */}
          <dl className="mt-10 grid gap-x-14 gap-y-6 lg:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q} className="border-b border-paper/12 pb-6">
                <dt className="font-display text-base font-extrabold uppercase tracking-[-0.01em] text-paper md:text-lg">
                  {item.q}
                </dt>
                <dd className="mt-2.5 text-sm leading-relaxed text-paper/65 md:text-base">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/menu"
              hash="korean"
              data-cursor="cta"
              className="inline-flex items-center rounded-full bg-orange px-7 py-3.5 text-[0.64rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              See it on the menu
            </Link>
            <Link
              to="/contact"
              data-cursor="cta"
              className="inline-flex items-center rounded-full border border-paper/25 px-7 py-3.5 text-[0.64rem] font-extrabold uppercase tracking-[0.22em] text-paper transition-colors duration-300 hover:border-orange hover:text-orange"
            >
              Find the cafe
            </Link>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
