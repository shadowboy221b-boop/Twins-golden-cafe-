import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "motion/react";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PageHero, RevealCard, Section, SectionHead } from "@/components/page";
import { MaskReveal } from "@/components/bits";
import { FloatingFood } from "@/components/FloatingFood";
import { CAFE } from "@/data/site";
import { categories } from "@/data/menu";
import { GOOGLE } from "@/data/reviews";
import { breadcrumbSchema, faqSchema, ld, SITE_URL } from "@/data/seo";
import founderPortrait from "@/assets/founder-portrait.webp";

const title = "Food Business Consulting, Tamil Nadu — Cafe Setup & Menus";
const description =
  "Practical help to open a cafe or food brand in Tamil Nadu: setup, menu planning, costing, branding and kitchen operations — from a kitchen that runs daily in Arani.";

const PATH = "/food-business-consulting";

const EASE = [0.16, 1, 0.3, 1] as const;

const TEL = `tel:${CAFE.phone.replace(/\s/g, "")}`;
const ENQUIRY = `https://wa.me/${CAFE.whatsapp}?text=${encodeURIComponent(
  "Hi, I am planning a food business and would like help with it.",
)}`;

const ALL_ITEMS = categories.flatMap((c) => c.items);

/**
 * What the help actually covers, in the words somebody planning a shop would
 * use. The eight headings are the ones the cafe already lists on its about
 * page; this page is where each of them is explained.
 */
const WORK = [
  {
    t: "Cafe setup",
    d: "What the room needs before it can serve anybody: the counter, the flow from order to pass, what equipment earns its place and what can wait until the shop is paying for itself.",
  },
  {
    t: "Menu planning",
    d: "What to sell, and what to leave off. A board the kitchen can actually cook during a rush, built around the ingredients that are already in the fridge for something else.",
  },
  {
    t: "Costing & pricing",
    d: "What each plate costs to make once wastage, gas, packaging and labour are counted, and what it has to sell for — the number most new shops get wrong until the third month.",
  },
  {
    t: "Food preparation",
    d: "Prep that holds through a busy evening: what to make ahead, how to store it, and how to keep the tenth plate identical to the first.",
  },
  {
    t: "Branding",
    d: "A name, a look and a board that reads from across the road — and photographs of the food that make somebody stop scrolling.",
  },
  {
    t: "Social media marketing",
    d: "What to post, how often, and what to stop paying for. Reels of the food being made, and the local pages worth being listed on.",
  },
  {
    t: "Kitchen operations",
    d: "Shifts, stock, and the checks that catch a problem before a customer does. Systems small enough that a five-person kitchen will keep using them.",
  },
  {
    t: "Customer growth",
    d: "Getting found — Google, Maps, the delivery apps — and getting people back: reviews, regulars, and offers that do not cut the margin to nothing.",
  },
];

/** The questions a first message on WhatsApp usually asks. */
const FAQ = [
  {
    q: "Who is this for?",
    a: "Anyone planning to open a cafe, juice bar, bakery or small restaurant in Tamil Nadu — and anyone already running one that is not making the money it should. Some of it is useful before you have signed a lease; some of it only matters once the kitchen is open.",
  },
  {
    q: "Where do you work?",
    a: `Across Tamil Nadu. The kitchen behind this is in ${CAFE.deliveryTown}, and most of the work happens on calls and messages; if you want somebody standing in your kitchen, say so when you get in touch and we will work out what that takes.`,
  },
  {
    q: "What does it cost?",
    a: "It depends on what you need — a menu and a costing sheet is not the same job as setting a shop up from an empty room. Tell us what you are planning and you will get a number before anything starts, not after.",
  },
  {
    q: "What makes you qualified?",
    a: `A cafe that opens every day. ${CAFE.name} runs ${categories.length} counters and ${ALL_ITEMS.length} dishes at ${CAFE.shortAddress}, rated ${GOOGLE.rating} by ${GOOGLE.count} people on Google. Everything on this page is something the kitchen does, not something read in a book.`,
  },
  {
    q: "How do we start?",
    a: "Send one message on WhatsApp saying what you are planning and where. You will get questions back, and from those a straight answer on whether we can help and what it would cost.",
  },
];

export const Route = createFileRoute("/food-business-consulting")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}${PATH}` },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: `${SITE_URL}/share/about.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Inside Twin's Golden Cafe in Arani, the kitchen behind the consulting",
      },
      { name: "twitter:image", content: `${SITE_URL}/share/about.jpg` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}${PATH}` }],
    scripts: [
      // a service, offered by the person who runs the cafe, across one state
      ld({
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${SITE_URL}${PATH}#service`,
        name: "Food business consulting",
        serviceType: "Cafe and restaurant consulting",
        description,
        url: `${SITE_URL}${PATH}`,
        provider: {
          "@type": "Person",
          name: CAFE.founder,
          worksFor: { "@id": `${SITE_URL}/#restaurant` },
        },
        areaServed: {
          "@type": "State",
          name: "Tamil Nadu",
          addressCountry: "IN",
        },
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: `${SITE_URL}${PATH}`,
          servicePhone: CAFE.phone.replace(/\s/g, ""),
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "What the work covers",
          itemListElement: WORK.map((w) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: w.t, description: w.d },
          })),
        },
      }),
      ld(
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Food Business Consulting", path: PATH },
        ]),
      ),
      ld(faqSchema(FAQ)),
    ],
  }),
  component: ConsultingPage,
});

/**
 * A number that climbs into place the first time the panel is seen.
 *
 * It starts at the real figure rather than at zero, so the page as built —
 * which is what a crawler reads and what somebody with scripts off sees —
 * already says 191 and 4.4. The climb begins the moment the panel scrolls in,
 * which is the only time anybody is looking at it.
 */
function useCountUp(to: number, run: boolean, decimals = 0) {
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!run) return;
    // "reduce motion" gets the number, not the climb
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }
    const start = performance.now();
    const DURATION = 1100;
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      setValue(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [to, run]);

  return value.toFixed(decimals);
}

/**
 * The credential, which is a shop rather than a certificate.
 *
 * The portrait rises as the section passes and the three numbers count
 * themselves up, so the panel has something happening in it — the page is
 * asking a stranger to trust the person in the photograph, and a still slab of
 * text was not doing that work.
 */
function WhyThisKitchen() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-120px" });

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.4 });
  const photoY = useTransform(p, [0, 1], [26, -26]);
  const photoScale = useTransform(p, [0, 1], [1.1, 1]);

  const dishes = useCountUp(ALL_ITEMS.length, seen);
  const rating = useCountUp(GOOGLE.rating, seen, 1);
  const reviews = useCountUp(GOOGLE.count, seen);

  return (
    <Section tone="ink">
      <FloatingFood opacity={0.06} count={4} />

      <div ref={ref} className="relative grid items-center gap-12 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <MaskReveal>
            <p className="eyebrow !text-orange">Why this kitchen</p>
          </MaskReveal>
          <h2 className="mt-5 display-lg text-paper">
            <MaskReveal delay={0.06}>ADVICE FROM</MaskReveal>
            <MaskReveal delay={0.14}>
              <span className="block text-orange">A SHOP THAT OPENS</span>
            </MaskReveal>
          </h2>

          {/* the rule draws itself across as the section arrives */}
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="mt-6 block h-[3px] w-24 origin-left bg-orange"
          />

          <MaskReveal delay={0.24}>
            <p className="serif-accent mt-7 max-w-xl text-lg leading-relaxed text-paper/75">
              Plenty of advice about food businesses comes from people who have never had to price a
              plate of momos against the shop across the road. This comes from a counter in{" "}
              {CAFE.deliveryTown} that has to do it every morning.
            </p>
          </MaskReveal>

          <dl className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-3xl bg-paper/12 text-center">
            {[
              { v: dishes, l: "Dishes on one board" },
              { v: `${rating}★`, l: `${reviews} Google reviews` },
              { v: CAFE.hoursCompact, l: "Open every day" },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: EASE }}
                className="grain bg-ink px-3 py-6"
              >
                <dt className="font-display text-2xl font-black tabular-nums tracking-[-0.03em] text-orange">
                  {s.v}
                </dt>
                <dd className="mt-2 text-[0.5rem] font-extrabold uppercase tracking-[0.18em] text-paper/55">
                  {s.l}
                </dd>
              </motion.div>
            ))}
          </dl>

          <p className="mt-8 max-w-xl text-sm leading-relaxed text-paper/60">
            See the board it is talking about:{" "}
            <Link to="/menu" className="font-bold text-orange underline-offset-4 hover:underline">
              the full menu
            </Link>
            , or{" "}
            <Link to="/about" className="font-bold text-orange underline-offset-4 hover:underline">
              the story behind the cafe
            </Link>
            .
          </p>
        </div>

        <motion.div style={{ y: photoY }}>
          <RevealCard>
            <figure className="group relative overflow-hidden rounded-3xl border border-paper/12">
              <motion.img
                style={{ scale: photoScale }}
                src={founderPortrait}
                alt={`${CAFE.founder}, founder of ${CAFE.name}`}
                width={1019}
                height={1280}
                loading="lazy"
                decoding="async"
                className="h-80 w-full object-cover object-top sm:h-[26rem] lg:h-[32rem]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-6">
                <span className="block text-[0.5rem] font-extrabold uppercase tracking-[0.28em] text-orange">
                  Who you would be talking to
                </span>
                <span className="mt-1 block font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-paper">
                  {CAFE.founder}
                </span>
                <span className="mt-1 block text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-paper/60">
                  Founder · {CAFE.name}, {CAFE.deliveryTown}
                </span>
              </figcaption>
            </figure>
          </RevealCard>
        </motion.div>
      </div>
    </Section>
  );
}

function ConsultingPage() {
  return (
    <>
      <Cursor />
      <SiteHeader overDark />

      <main className="relative">
        <PageHero
          trail={[
            { name: "Home", path: "/" },
            { name: "Consulting", path: PATH },
          ]}
          eyebrow="For people opening a shop"
          title="FOOD BUSINESS"
          accent="CONSULTING"
          lede="Starting a cafe in Tamil Nadu is not a recipe problem. It is a costing, menu and operations problem — and those are learnable."
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <a
              href={ENQUIRY}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="cta"
              className="inline-flex items-center rounded-full bg-orange px-7 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              Tell us what you are planning
            </a>
            <a
              href={TEL}
              data-cursor="cta"
              className="inline-flex items-center rounded-full border border-paper/25 px-7 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-paper transition-colors hover:border-orange hover:text-orange"
            >
              Call {CAFE.phone}
            </a>
          </motion.div>

          <p className="mt-9 max-w-2xl text-sm leading-relaxed text-paper/60">
            {CAFE.founder} runs {CAFE.name} at {CAFE.shortAddress} — {categories.length} counters,{" "}
            {ALL_ITEMS.length} dishes, open every day. The same work that keeps that kitchen running
            is what is offered here to anyone building a food business anywhere in Tamil Nadu:
            setting a cafe up, planning a menu, costing it, branding it, and keeping customers
            coming back.
          </p>
        </PageHero>

        {/* what the work covers */}
        <Section tone="paper">
          <FloatingFood opacity={0.05} count={4} />
          <SectionHead
            align="center"
            eyebrow="What it covers"
            title="EIGHT THINGS"
            accent="THAT DECIDE IT"
            lede="Not a course. The parts of a food business that are usually learnt the expensive way."
          />

          <div className="relative z-10 mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {WORK.map((w, i) => (
              <RevealCard key={w.t} index={i}>
                <div className="h-full rounded-3xl border border-ink/10 bg-paper-warm p-7">
                  <p className="font-display text-2xl font-black text-orange">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-4 font-display text-base font-black uppercase tracking-[-0.01em] text-ink">
                    {w.t}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{w.d}</p>
                </div>
              </RevealCard>
            ))}
          </div>
        </Section>

        <WhyThisKitchen />

        {/* how it starts */}
        <Section tone="warm">
          <SectionHead
            align="center"
            eyebrow="How it starts"
            title="ONE MESSAGE,"
            accent="THEN A PLAN"
            lede="No form to fill in, no package to buy before anyone has understood what you are building."
          />

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Tell us the plan",
                d: "Where the shop is, or where you want it. What you want to sell, and what you have already spent.",
              },
              {
                n: "02",
                t: "We ask the hard questions",
                d: "Rent, footfall, staff, the dishes you are set on. Most of the cost of a food business is decided here.",
              },
              {
                n: "03",
                t: "You get a straight answer",
                d: "What we can help with, what it would cost, and what you should not spend money on yet. Then you decide.",
              },
            ].map((s, i) => (
              <RevealCard key={s.n} index={i}>
                <div className="h-full rounded-3xl border border-ink/10 bg-paper p-7">
                  <p className="font-display text-3xl font-black text-orange">{s.n}</p>
                  <h2 className="mt-4 font-display text-lg font-black uppercase tracking-[-0.01em] text-ink">
                    {s.t}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{s.d}</p>
                </div>
              </RevealCard>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <a
              href={ENQUIRY}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="cta"
              className="inline-flex items-center rounded-full bg-ink px-7 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-paper transition-transform duration-300 hover:-translate-y-0.5"
            >
              Start on WhatsApp
            </a>
            <p className="text-sm text-ink/60">
              Or call {CAFE.phone} — {CAFE.hoursShort}, any day.
            </p>
          </div>
        </Section>

        <ConsultingQuestions />
      </main>

      <SiteFooter />
    </>
  );
}

/** The same accordion the contact page uses, with this page's own questions. */
function ConsultingQuestions() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section tone="paper">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHead eyebrow="Before you ask" title="COMMON" accent="QUESTIONS" />

        <ul className="border-t border-ink/12">
          {FAQ.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className="border-b border-ink/12">
                <button
                  type="button"
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  aria-controls={`consult-faq-${i}`}
                  data-cursor="view"
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span
                    className={`font-display text-lg font-extrabold uppercase tracking-[-0.02em] transition-colors duration-300 md:text-xl ${
                      on ? "text-orange-ink" : "text-ink group-hover:text-orange-ink"
                    }`}
                  >
                    {f.q}
                  </span>
                  <span
                    aria-hidden
                    className={`grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                      on ? "rotate-45 border-orange bg-orange text-ink" : "border-ink/15 text-ink"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="size-4">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>
                {/* every answer stays in the page and folds shut, so a crawler
                    that never clicks still reads all five */}
                <motion.div
                  id={`consult-faq-${i}`}
                  initial={false}
                  animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  aria-hidden={!on}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 text-base leading-relaxed text-ink/65">{f.a}</p>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
