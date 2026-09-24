import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero, RevealCard, Section, SectionHead } from "@/components/page";
import { breadcrumbSchema, ld, restaurantSchema } from "@/data/seo";
import { MaskReveal } from "@/components/bits";
import { CAFE } from "@/data/site";
import { categories, combos } from "@/data/menu";
import { FloatingFood } from "@/components/FloatingFood";
import kunafa from "@/assets/kunafa.webp";
import chicken from "@/assets/chicken.webp";
import founderPortrait from "@/assets/founder-portrait.webp";
import founderCafe from "@/assets/founder-cafe.webp";

const title = "About Us — Twin's Golden Cafe, Arani";
const description =
  "The story behind Twin's Golden Cafe in Arani: founder Yuvaraj Venkatesan, the food philosophy, and the plan to help other food entrepreneurs build.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://twinsgoldencafe.com/about" },
      { name: "twitter:card", content: "summary_large_image" },
      // this page's own picture, so a link shared on WhatsApp shows what it is about
      { property: "og:image", content: "https://twinsgoldencafe.com/share/about.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Inside Twin's Golden Cafe in Arani" },
      { name: "twitter:image", content: "https://twinsgoldencafe.com/share/about.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://twinsgoldencafe.com/about" }],
    scripts: [
      ld(restaurantSchema),
      ld(
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ]),
      ),
    ],
  }),
  component: AboutPage,
});

/** the board, counted once: the facts below must always match the menu page */
const ALL_ITEMS = categories.flatMap((c) => c.items);
const VEG_TOTAL = ALL_ITEMS.filter((i) => i.veg).length;
const PRICE_MIN = Math.min(...ALL_ITEMS.map((i) => i.price));
const PRICE_MAX = Math.max(...ALL_ITEMS.map((i) => i.price));

const MISSION = [
  { t: "Quality Food", d: "Nothing leaves the pass that we wouldn't eat ourselves." },
  { t: "Great Experience", d: "The room, the service and the plate all count as the meal." },
  { t: "Customer Satisfaction", d: "You should want to come back before you've finished." },
];

const PHILOSOPHY = [
  { n: "01", t: "Taste", d: "Seasoned properly, cooked to order, served hot." },
  { n: "02", t: "Quality", d: "Good ingredients in, good food out. No shortcuts." },
  { n: "03", t: "Consistency", d: "The same plate on a Tuesday as on a Saturday." },
  { n: "04", t: "Presentation", d: "It should look like someone cared. Because they did." },
];

const BELIEFS = [
  "Learn Continuously",
  "Build With Purpose",
  "Serve With Quality",
  "Market With Creativity",
  "Grow With Consistency",
];

/** The consulting platform, broken into what it will actually cover. */
const PLATFORM = [
  "Café setup",
  "Menu planning",
  "Food preparation",
  "Costing & pricing",
  "Branding",
  "Social media marketing",
  "Customer growth",
  "Kitchen operations",
];

/** A soft orange field behind a section, so no panel reads as flat white. */
function Glow({ side = "center" }: { side?: "center" | "left" | "right" }) {
  const place =
    side === "left"
      ? "left-[-15vw] top-[10%]"
      : side === "right"
        ? "right-[-15vw] top-[10%]"
        : "left-1/2 top-0 -translate-x-1/2 -translate-y-1/3";
  return (
    <div
      aria-hidden
      className={`blob-a pointer-events-none absolute ${place} size-[55vw] rounded-full opacity-25`}
      style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
    />
  );
}

/** The wash every light card on this page carries. */
function CardWash({ index = 0 }: { index?: number }) {
  return (
    <span
      aria-hidden
      className="card-wash pointer-events-none absolute -inset-1/4"
      style={{
        background: "radial-gradient(circle at 30% 30%, var(--orange) 0%, transparent 62%)",
        opacity: 0.08,
        animationDelay: `${index * -2.6}s`,
      }}
    />
  );
}

/**
 * The cafe as a place, not as a philosophy.
 *
 * Everything above this is what the cafe believes; somebody reading the page
 * to decide whether to walk in still needs the plain facts — what is cooked,
 * how much of it is vegetarian, where the door is, and how to get food out of
 * it. The counts come from the menu itself, so they cannot go stale.
 */
function TheCafeItself() {
  const facts = [
    { v: String(categories.length), l: "Counters on the board" },
    { v: String(ALL_ITEMS.length), l: "Dishes" },
    { v: String(VEG_TOTAL), l: "Of them vegetarian" },
    { v: `₹${PRICE_MIN}–₹${PRICE_MAX}`, l: "Price range" },
  ];

  return (
    <Section tone="warm">
      <FloatingFood opacity={0.06} count={4} />
      <Glow side="right" />

      <div className="relative">
        <SectionHead
          align="center"
          eyebrow="The cafe itself"
          title="WHAT WE"
          accent="ACTUALLY COOK"
          lede={`One kitchen in ${CAFE.deliveryTown}, open every day of the week, cooking to order rather than to a warming shelf.`}
        />
      </div>

      <dl className="relative z-10 mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-3xl bg-ink/10 text-center md:grid-cols-4">
        {facts.map((f) => (
          <div key={f.l} className="bg-paper px-4 py-7">
            <dt className="font-display text-2xl font-black tracking-[-0.03em] text-orange-ink md:text-3xl">
              {f.v}
            </dt>
            <dd className="mt-2 text-[0.5rem] font-extrabold uppercase tracking-[0.18em] text-ink/55">
              {f.l}
            </dd>
          </div>
        ))}
      </dl>

      <div className="relative z-10 mt-8 grid gap-6 lg:grid-cols-3">
        {[
          {
            t: "The board",
            b: (
              <>
                Stone-baked pizzas, veg and non-veg burgers, popcorn chicken, nuggets and fish
                fillet, twelve-inch wraps and rolls, steamed and fried momos, pasta, sandwiches,
                bread omelettes, loaded fries, kunafa, falooda, fruit salad, milkshakes, lassi,
                mojitos and juices pressed when you order them. It is a long board on purpose: a
                table of four rarely wants the same thing.{" "}
                <Link
                  to="/menu"
                  className="font-bold text-orange-ink underline-offset-4 hover:underline"
                >
                  See every dish and price
                </Link>
                .
              </>
            ),
          },
          {
            t: "Mostly vegetarian",
            b: (
              <>
                {VEG_TOTAL} of the {ALL_ITEMS.length} dishes are vegetarian, and they are not an
                afterthought — the veg counters are the ones with the most on them. Anything veg
                carries the green mark on the menu, and the menu page has a switch that hides
                everything else. The {combos.length} combo trays are the exception: those are all
                built on fried chicken.
              </>
            ),
          },
          {
            t: "How food leaves here",
            b: (
              <>
                Sit in, collect at the counter, or have it delivered across {CAFE.deliveryTown} town
                and about {CAFE.deliveryRadiusKm} km around it. Order on this site and it reaches us
                on WhatsApp; pay by UPI while you order or in cash when you collect. Swiggy carries
                us too, still listed under the older name, {CAFE.swiggyName}. Parking is the kerb
                outside on Market Road.
              </>
            ),
          },
        ].map((c, i) => (
          <RevealCard key={c.t} index={i}>
            <div className="relative h-full overflow-hidden rounded-3xl border border-ink/10 bg-paper p-7">
              <CardWash index={i} />
              <h3 className="relative font-display text-base font-black uppercase tracking-[-0.01em] text-ink">
                {c.t}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-ink/70">{c.b}</p>
            </div>
          </RevealCard>
        ))}
      </div>

      <p className="relative z-10 mx-auto mt-10 max-w-3xl text-center text-sm leading-relaxed text-ink/60">
        You will find us at {CAFE.address}, open {CAFE.hoursRows[0]?.time.toLowerCase()} every day.
        Call {CAFE.phone}, or{" "}
        <Link
          to="/contact"
          className="font-bold text-orange-ink underline-offset-4 hover:underline"
        >
          find the map and the answers to the usual questions
        </Link>
        .
      </p>
    </Section>
  );
}

function AboutPage() {
  return (
    <>
      <Cursor />
      <SiteHeader overDark />

      <main className="relative">
        <PageHero
          trail={[
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]}
          eyebrow="Who we are"
          title="MORE THAN"
          accent="JUST A CAFE"
          lede="A counter, a fryer and a standard we refuse to drop."
        />

        {/* our story */}
        <Section tone="paper">
          <FloatingFood opacity={0.07} count={4} />
          <Glow />

          <motion.img
            src={kunafa}
            alt=""
            aria-hidden
            loading="lazy"
            width={1200}
            height={1008}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 0.12, scale: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="floaty pointer-events-none absolute right-[-8vw] top-[-6%] w-[45vw] md:w-[22vw]"
          />

          {/* Centred, like every head that sits above a full-width body. The
              two heads that stay left are the ones inside a column — the
              founder block and the vision block — where left is the edge the
              eye actually reads from. */}
          <div className="relative">
            <SectionHead
              align="center"
              eyebrow="Our story"
              title="HOW IT"
              accent="STARTED"
              lede="It started with one belief: great food is not just about taste. It's about quality, consistency, presentation — and the experience made for every customer."
            />
          </div>

          <div className="relative z-10 mt-12 grid gap-6 lg:grid-cols-2">
            {[
              "Twin's Golden Cafe is a modern food brand built around that belief — delicious food, refreshing beverages, innovative menu concepts and a café you actually want to sit in.",
              "It was made for students, families and food lovers alike: one counter, a board deep enough to keep finding something new, and the same standard behind every plate that leaves it.",
            ].map((para, i) => (
              <RevealCard key={i} index={i}>
                <article className="group relative h-full overflow-hidden rounded-3xl border border-ink/10 bg-paper-warm p-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-orange hover:shadow-[0_30px_65px_-36px_oklch(0.175_0.008_60/0.45)]">
                  <span
                    aria-hidden
                    className="card-wash pointer-events-none absolute -inset-1/4"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 30%, var(--orange) 0%, transparent 62%)",
                      opacity: 0.08,
                      animationDelay: `${i * -4}s`,
                    }}
                  />
                  <span
                    aria-hidden
                    className="relative block h-[3px] w-10 bg-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-24"
                  />
                  <p className="serif-accent relative mt-6 text-lg leading-relaxed text-ink/75">
                    {para}
                  </p>
                </article>
              </RevealCard>
            ))}
          </div>
        </Section>

        {/* founder */}
        <Section tone="ink">
          <FloatingFood opacity={0.07} count={4} />

          <div className="relative grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            {/* the portrait leads, with the second shot tucked in behind it */}
            <RevealCard>
              <div className="group relative">
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
                  <img
                    src={founderPortrait}
                    alt="Yuvaraj Venkatesan, founder of Twin's Golden Cafe"
                    width={1019}
                    height={1280}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent"
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-3xl border border-paper/15 transition-colors duration-500 group-hover:border-orange"
                  />

                  <span className="absolute inset-x-0 bottom-0 p-5">
                    <span className="block text-[0.5rem] font-extrabold uppercase tracking-[0.28em] text-orange">
                      Founder
                    </span>
                    <span className="mt-1 block font-display text-lg font-extrabold uppercase tracking-[-0.02em] text-paper">
                      {CAFE.founder}
                    </span>
                  </span>
                </div>

                <div className="floaty absolute -bottom-8 -right-4 hidden w-28 overflow-hidden rounded-2xl border-2 border-ink md:block lg:w-32">
                  <img
                    src={founderCafe}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    width={1066}
                    height={1600}
                    className="aspect-[3/4] w-full object-cover"
                  />
                </div>
              </div>
            </RevealCard>

            <div>
              <MaskReveal>
                <p className="eyebrow !text-orange">Meet the founder</p>
              </MaskReveal>
              <h2 className="mt-5 display-lg text-paper">
                <MaskReveal>{CAFE.founder.toUpperCase()}</MaskReveal>
              </h2>
              <MaskReveal delay={0.1}>
                <p className="mt-4 text-[0.6rem] font-extrabold uppercase tracking-[0.26em] text-paper/55">
                  Building food brands · Creating experiences · Empowering entrepreneurs
                </p>
              </MaskReveal>

              <MaskReveal delay={0.16}>
                <p className="serif-accent mt-7 max-w-xl text-lg leading-relaxed text-paper/75">
                  “My journey began with a simple belief — great food is not just about taste;
                  it&apos;s about quality, consistency, presentation, and the experience we create
                  for every customer.”
                </p>
              </MaskReveal>

              <MaskReveal delay={0.22}>
                <p className="mt-6 max-w-xl text-sm leading-relaxed text-paper/60">
                  An entrepreneur with a passion for the food, café, branding and business industry.
                  Through Twin&apos;s Golden Cafe he is building a modern food brand that brings
                  together delicious food, refreshing beverages, innovative menu concepts and a
                  welcoming café experience for students, families and food lovers.
                </p>
              </MaskReveal>

              <MaskReveal delay={0.28}>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-paper/60">
                  But the vision goes beyond running a café — it runs through every side of the food
                  business: recipe development, kitchen operations, menu pricing, branding, digital
                  marketing, customer acquisition and growth.
                </p>
              </MaskReveal>
            </div>
          </div>
        </Section>

        {/* mission */}
        <Section tone="warm">
          <FloatingFood opacity={0.07} count={4} />
          <Glow side="left" />

          <div className="relative">
            <SectionHead
              align="center"
              eyebrow="Our mission"
              title="WHAT WE'RE"
              accent="HERE TO DO"
            />
          </div>

          <div className="relative z-10 mt-12 grid gap-5 md:grid-cols-3">
            {MISSION.map((m, i) => (
              <RevealCard key={m.t} index={i}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-ink/10 bg-paper p-7 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-orange hover:shadow-[0_28px_60px_-34px_oklch(0.175_0.008_60/0.45)]">
                  <CardWash index={i} />
                  <span
                    aria-hidden
                    className="relative block h-[3px] w-8 bg-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-20"
                  />
                  <h3 className="relative mt-5 font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-ink">
                    {m.t}
                  </h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-ink/65">{m.d}</p>
                </article>
              </RevealCard>
            ))}
          </div>
        </Section>

        {/* philosophy */}
        <Section tone="paper">
          <FloatingFood opacity={0.07} count={4} />
          <Glow side="right" />

          <motion.img
            src={chicken}
            alt=""
            aria-hidden
            loading="lazy"
            width={1104}
            height={1104}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 0.1, scale: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="floaty pointer-events-none absolute left-[-8vw] top-[10%] w-[45vw] md:w-[20vw]"
          />

          <div className="relative">
            <SectionHead
              align="center"
              eyebrow="Our food philosophy"
              title="FOUR THINGS"
              accent="ON EVERY PLATE"
            />
          </div>

          <div className="relative z-10 mt-12 grid gap-x-12 gap-y-8 md:grid-cols-2">
            {PHILOSOPHY.map((p, i) => (
              <RevealCard key={p.t} index={i}>
                <div className="group relative flex gap-6 pt-6">
                  {/* the top rule fills orange as the row is hovered */}
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-ink/10" />
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 h-px w-0 bg-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
                  />
                  <span
                    aria-hidden
                    className="font-display text-3xl font-extrabold text-orange/35 transition-all duration-500 group-hover:text-orange/70"
                  >
                    {p.n}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-ink transition-transform duration-500 group-hover:translate-x-1">
                      {p.t}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.d}</p>
                  </div>
                </div>
              </RevealCard>
            ))}
          </div>
        </Section>

        {/* vision + beliefs */}
        <Section tone="ink">
          <FloatingFood opacity={0.06} count={4} />

          <div className="relative grid gap-14 lg:grid-cols-2">
            <div>
              <SectionHead
                dark
                eyebrow="Our bigger vision"
                title="BEYOND"
                accent="THE COUNTER"
                lede="Many aspiring entrepreneurs have the passion to start a food business, but not always the right practical guidance. That's the gap we're working to close."
              />
              <ul className="mt-10 space-y-4">
                {["Building Food Brands", "Helping Entrepreneurs"].map((v, i) => (
                  <RevealCard
                    as="li"
                    key={v}
                    index={i}
                    className="flex items-center gap-4 border-b border-paper/12 pb-4"
                  >
                    <span aria-hidden className="size-2 shrink-0 rounded-full bg-orange" />
                    <span className="font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-paper md:text-2xl">
                      {v}
                    </span>
                  </RevealCard>
                ))}
              </ul>

              {/* what the training platform is meant to cover */}
              <ul className="mt-8 flex flex-wrap gap-2">
                {PLATFORM.map((p, i) => (
                  <RevealCard
                    as="li"
                    key={p}
                    index={i}
                    className="rounded-full border border-orange/45 bg-orange/10 px-3.5 py-2 text-[0.55rem] font-extrabold uppercase tracking-[0.16em] text-orange transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange hover:text-ink"
                  >
                    {p}
                  </RevealCard>
                ))}
              </ul>
            </div>

            <div>
              <MaskReveal>
                <p className="rule-label text-paper/60">What we believe</p>
              </MaskReveal>
              <ul className="mt-8 space-y-3">
                {BELIEFS.map((b, i) => (
                  <RevealCard
                    as="li"
                    key={b}
                    index={i}
                    className="group flex items-baseline gap-4 rounded-xl px-4 py-3 transition-colors duration-500 hover:bg-paper/5"
                  >
                    <span className="font-display text-sm font-extrabold text-orange">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base font-semibold text-paper/80 transition-transform duration-500 group-hover:translate-x-1">
                      {b}
                    </span>
                  </RevealCard>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <TheCafeItself />

        {/* The founder's closing line, given the space it deserves. On a light
            ground, so it doesn't run together with the dark vision section
            above and the dark call to action below. */}
        <Section tone="paper">
          <FloatingFood opacity={0.06} count={4} />

          <div className="relative mx-auto max-w-3xl text-center">
            <MaskReveal>
              <p className="eyebrow !text-orange-ink -me-[0.36em]">In his words</p>
            </MaskReveal>
            <MaskReveal delay={0.08}>
              <p className="serif-accent mt-7 text-2xl leading-snug text-ink md:text-3xl">
                “This is more than a business journey. It&apos;s a journey of building, learning,
                and helping others build too.”
              </p>
            </MaskReveal>
            <MaskReveal delay={0.16}>
              <p className="mt-7 text-[0.55rem] font-extrabold uppercase tracking-[0.3em] text-ink/55">
                {CAFE.founder} · Founder
              </p>
            </MaskReveal>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
