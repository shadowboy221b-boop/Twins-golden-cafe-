import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { categories, type MenuItem } from "@/data/menu";
import { Cursor } from "@/components/Cursor";
import { MenuBackdrop } from "@/components/MenuBackdrop";
import { FloatingFood } from "@/components/FloatingFood";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CtaBand, RevealCard, Section, SectionHead } from "@/components/page";
import { specialGroups } from "@/data/specials";
import drumstick from "@/assets/drumstick.webp";
import chickenBurger from "@/assets/chicken-burger.webp";
import kunafaImg from "@/assets/kunafa.webp";
import milkshakeImg from "@/assets/milkshake.webp";
import { MaskReveal } from "@/components/bits";

const title = "The Full Menu — Twin's Golden Cafe";
const description =
  "Every category and price at Twin's Golden Cafe: pizza, fried chicken, wings, burgers, wraps, combos, family feasts, kunafa, momos, pasta, sandwiches, shakes, lassi, mojito and falooda.";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://twinsgoldencafe.com/menu" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://twinsgoldencafe.com/menu" }],
  }),
  component: MenuPage,
});

const ALL_ITEMS = categories.flatMap((c) => c.items);
const PRICE_MIN = Math.min(...ALL_ITEMS.map((i) => i.price));
const PRICE_MAX = Math.max(...ALL_ITEMS.map((i) => i.price));

function MenuPage() {
  const [active, setActive] = useState(categories[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);

  const filtering = query.trim().length > 0 || vegOnly;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (it) =>
            (!vegOnly || it.veg) &&
            (!q ||
              it.name.toLowerCase().includes(q) ||
              c.title.toLowerCase().includes(q) ||
              (it.note ?? "").toLowerCase().includes(q)),
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [query, vegOnly]);

  const resultCount = shown.reduce((n, c) => n + c.items.length, 0);

  // track the category in view — only meaningful while the full list is shown
  useEffect(() => {
    if (filtering) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.3, 0.8] },
    );
    categories.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [filtering]);

  return (
    <>
      <Cursor />
      <SiteHeader overDark />

      <main className="relative">
        <MenuBackdrop />

        {/* ---------- masthead ---------- */}
        <header className="grain relative overflow-hidden bg-ink px-5 pb-16 pt-32 md:px-12 md:pb-20 md:pt-36">
          <div
            aria-hidden
            className="pointer-events-none absolute right-[-12%] top-[-20%] size-[60vw] rounded-full opacity-35"
            style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
          />

          <div className="relative z-10 mx-auto max-w-7xl">
            <div>
              <MaskReveal>
                <p className="eyebrow !text-orange">Everything we cook</p>
              </MaskReveal>
              <h1 className="mt-5 display-xl text-paper">
                <MaskReveal delay={0.06}>THE FULL</MaskReveal>
                <MaskReveal delay={0.14}>
                  <span className="block text-orange">MENU</span>
                </MaskReveal>
              </h1>

              <motion.dl
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-10 flex flex-wrap gap-x-12 gap-y-6"
              >
                {[
                  { v: String(categories.length), l: "Categories" },
                  { v: String(ALL_ITEMS.length), l: "Dishes" },
                  { v: `₹${PRICE_MIN}–₹${PRICE_MAX}`, l: "Price range" },
                ].map((s) => (
                  <div key={s.l}>
                    <dt className="font-display text-3xl font-extrabold tracking-[-0.03em] text-orange md:text-4xl">
                      {s.v}
                    </dt>
                    <dd className="mt-1 text-[0.55rem] font-extrabold uppercase tracking-[0.26em] text-paper/50">
                      {s.l}
                    </dd>
                  </div>
                ))}
              </motion.dl>
            </div>
          </div>
        </header>

        {/* ---------- sticky toolbar ---------- */}
        <div className="sticky top-[5.1rem] z-30 border-b border-ink/10 bg-paper/95">
          {/* on phones the field takes its own row; from sm up it shares one */}
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5 md:px-12">
            <div className="relative w-full min-w-0 sm:w-auto sm:flex-1">
              <label htmlFor="menu-search" className="sr-only">
                Search the menu
              </label>
              <input
                id="menu-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a dish…"
                className="w-full rounded-full border border-ink/15 bg-paper/90 px-5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/70 focus-visible:border-orange focus-visible:ring-2 focus-visible:ring-orange/30"
              />
            </div>

            <button
              type="button"
              onClick={() => setVegOnly((v) => !v)}
              aria-pressed={vegOnly}
              data-cursor="cta"
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-[0.6rem] font-extrabold uppercase tracking-[0.2em] transition-colors ${
                vegOnly
                  ? "border-leaf bg-leaf text-paper"
                  : "border-ink/15 text-ink/70 hover:border-ink/40 hover:text-ink"
              }`}
            >
              <span
                className={`size-2 rounded-full ${vegOnly ? "bg-paper" : "bg-leaf"}`}
                aria-hidden
              />
              Veg only
            </button>

            <p
              aria-live="polite"
              className="shrink-0 text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-ink/65"
            >
              {resultCount} {resultCount === 1 ? "dish" : "dishes"}
            </p>
          </div>

          {/* category chips — the mobile stand-in for the sidebar */}
          <div className="scrollbar-none overflow-x-auto lg:hidden">
            <ul className="flex w-max gap-2 px-5 pb-3 md:px-12">
              {shown.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    className={`inline-block whitespace-nowrap rounded-full border px-4 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.18em] transition-colors ${
                      active === c.id && !filtering
                        ? "border-orange bg-orange text-ink"
                        : "border-ink/15 text-ink/70"
                    }`}
                  >
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---------- body ---------- */}
        {/* grid-cols-1 on phones: an unset track sizes to the longest nowrap dish
          name and pushed the page wider than the screen */}
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 px-5 pb-24 pt-12 md:px-12 lg:grid-cols-[16rem_minmax(0,1fr)]">
          {/* food drifting behind the board — very faint, the list has to stay
            the loudest thing on the page */}
          <FloatingFood opacity={0.06} />

          {/* sticky category rail */}
          <nav aria-label="Menu categories" className="sticky top-52 hidden h-max lg:block">
            <p className="rule-label text-ink/70">Categories</p>
            <ul className="mt-5">
              {categories.map((c) => {
                const count = shown.find((s) => s.id === c.id)?.items.length ?? 0;
                const isActive = active === c.id && !filtering;
                return (
                  <li key={c.id}>
                    <a
                      href={`#${c.id}`}
                      data-cursor="view"
                      aria-current={isActive ? "true" : undefined}
                      className={`group relative flex items-baseline justify-between gap-3 py-2 pl-4 text-[0.82rem] font-extrabold uppercase tracking-[0.06em] transition-colors duration-300 ${
                        count === 0
                          ? "text-ink/40"
                          : isActive
                            ? "text-orange-ink"
                            : "text-ink/70 hover:text-ink"
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="menu-rail"
                          className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-orange"
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                      <span className="min-w-0">{c.title}</span>
                      <span className="shrink-0 font-display text-xs text-ink/70">{count}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative">
            {/* rendered directly, never gated behind an exit animation — a stalled
              transition must not be able to hide the whole menu */}
            {shown.length === 0 ? (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="serif-accent py-20 text-center text-lg text-ink/70"
              >
                Nothing matches “{query.trim()}”{vegOnly && " in the veg selection"}. Try another
                dish.
              </motion.p>
            ) : (
              <div className="space-y-14 md:space-y-16">
                {shown.map((c) => (
                  <Category
                    key={c.id}
                    id={c.id}
                    title={c.title}
                    tagline={c.tagline}
                    items={c.items}
                    priceColumns={c.priceColumns}
                    extras={c.extras}
                    filtering={filtering}
                  />
                ))}
              </div>
            )}

            <p className="mt-24 rule-label text-ink/65">Extra dip ₹25 · prices in INR</p>
          </div>
        </div>

        <SpecialsBoard />

        <MustTry />

        <CtaBand
          title="VISIT TWIN'S"
          accent="GOLDEN CAFE TODAY"
          primary={{ to: "/combos", label: "See best combos" }}
          secondary={{ to: "/contact", label: "Contact us" }}
        />
      </main>

      <SiteFooter />
    </>
  );
}

/**
 * Four dishes worth ordering on a first visit. The price is looked up from the
 * board rather than typed here, so it can never drift from the printed menu —
 * and a dish that leaves the menu drops off this list instead of going stale.
 */
const MUST_TRY = [
  { name: "Popcorn Chicken", src: drumstick, w: 1024, h: 1024 },
  { name: "Classic Chicken Mayo Burger", src: chickenBurger, w: 1000, h: 1000 },
  { name: "Nutella Kunafa", src: kunafaImg, w: 1200, h: 1008 },
  { name: "Oreo Blast Brownie Milkshake", src: milkshakeImg, w: 1000, h: 1000 },
].flatMap((m) => {
  const item = ALL_ITEMS.find((i) => i.name === m.name);
  return item ? [{ ...m, price: item.price }] : [];
});

function MustTry() {
  return (
    <Section tone="ink">
      <FloatingFood opacity={0.08} />

      {/* the floaters are absolute, so anything after them needs its own
          stacking context or the type ends up underneath */}
      <div className="relative">
        <SectionHead
          align="center"
          dark
          eyebrow="First time here?"
          title="MUST"
          accent="TRY"
          lede="If you order nothing else, order these four."
        />
      </div>

      <ul className="relative z-10 mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {MUST_TRY.map((m, i) => (
          <RevealCard key={m.name} index={i}>
            <li className="group flex h-full flex-col items-center rounded-2xl border border-paper/12 p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-orange">
              <img
                src={m.src}
                alt=""
                aria-hidden
                loading="lazy"
                width={m.w}
                height={m.h}
                className="w-24 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 md:w-28"
              />
              <h3 className="mt-5 font-display text-base font-extrabold uppercase tracking-[-0.02em] text-paper md:text-lg">
                {m.name}
              </h3>
              <p className="mt-2 font-display text-2xl font-extrabold text-orange">₹{m.price}</p>
            </li>
          </RevealCard>
        ))}
      </ul>
    </Section>
  );
}

/** One price with the way it is served printed above it (steam / fried). */
function PriceCol({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex w-16 shrink-0 flex-col items-end">
      <span className="text-[0.55rem] font-extrabold uppercase tracking-[0.16em] text-ink/70">
        {label}
      </span>
      <span className="font-display text-[0.95rem] font-extrabold tabular-nums text-ink transition-colors duration-300 group-hover:text-orange-ink">
        ₹{value}
      </span>
    </span>
  );
}

function Category({
  id,
  title: catTitle,
  tagline,
  items,
  priceColumns,
  extras,
  filtering,
}: {
  id: string;
  title: string;
  tagline: string;
  items: MenuItem[];
  priceColumns?: [string, string] | undefined;
  extras?: { label: string; price: number }[] | undefined;
  filtering: boolean;
}) {
  return (
    <section id={id} className="relative scroll-mt-40">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 border-ink pb-3">
        <MaskReveal>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-[-0.02em] text-ink md:text-3xl">
            {catTitle}
          </h2>
        </MaskReveal>
        <MaskReveal delay={0.06}>
          <p className="text-[0.6rem] font-extrabold uppercase tracking-[0.24em] text-ink/65">
            {tagline}
          </p>
        </MaskReveal>
      </div>

      {/* two tight columns, the way a printed menu sets a long list */}
      <ul className="relative z-10 mt-5 grid grid-cols-1 gap-x-14 lg:grid-cols-2">
        {items.map((it, i) => {
          // while filtering the rows are already on screen, so they fade in
          // straight away instead of waiting for a scroll that never comes
          const reveal = filtering
            ? { animate: { opacity: 1, y: 0 } }
            : {
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: "-40px" },
              };

          return (
            <motion.li
              key={`${id}-${it.name}`}
              initial={{ opacity: 0, y: 12 }}
              {...reveal}
              transition={{
                duration: 0.45,
                delay: Math.min(i * 0.025, 0.25),
                ease: [0.16, 1, 0.3, 1],
              }}
              data-cursor="view"
              className="group border-b border-ink/8 py-2.5 transition-colors duration-300 hover:border-orange/50"
            >
              <span className="flex items-baseline gap-2.5">
                {/* wraps rather than truncates: on a phone a two-price row
                    would otherwise cut the dish name off mid-word */}
                <span className="min-w-0 text-[0.95rem] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-orange-ink">
                  {it.name}
                </span>

                {it.veg && (
                  <span
                    className="inline-flex size-3 shrink-0 translate-y-[-1px] items-center justify-center rounded-[2px] border border-leaf"
                    title="Vegetarian"
                  >
                    <span className="size-1 rounded-full bg-leaf" />
                    <span className="sr-only">Vegetarian</span>
                  </span>
                )}
                {it.hot && (
                  <span className="shrink-0 text-[0.5rem] font-extrabold uppercase tracking-[0.16em] text-orange-ink">
                    Spicy
                  </span>
                )}

                {/* dotted leader, the printed-menu device */}
                <span
                  aria-hidden
                  className="min-w-4 flex-1 translate-y-[-3px] border-b border-dotted border-ink/25 transition-colors duration-300 group-hover:border-orange/60"
                />

                {it.altPrice != null && priceColumns ? (
                  <span className="flex shrink-0 items-start gap-3">
                    <PriceCol label={priceColumns[0]} value={it.price} />
                    <PriceCol label={priceColumns[1]} value={it.altPrice} />
                  </span>
                ) : (
                  <span className="shrink-0 font-display text-[0.95rem] font-extrabold tabular-nums text-ink transition-colors duration-300 group-hover:text-orange-ink">
                    ₹{it.price}
                  </span>
                )}
              </span>

              {it.note && (
                <span className="mt-0.5 block pr-16 text-[0.72rem] leading-snug text-ink/70">
                  {it.note}
                </span>
              )}
            </motion.li>
          );
        })}
      </ul>

      {/* counter add-ons, exactly as they are printed under the section */}
      {extras && extras.length > 0 && (
        <ul className="relative z-10 mt-4 flex flex-wrap gap-2">
          {extras.map((e) => (
            <li
              key={e.label}
              className="rounded-full border border-orange/45 bg-orange/10 px-3.5 py-1.5 text-[0.55rem] font-extrabold uppercase tracking-[0.16em] text-orange-ink"
            >
              {e.label} ₹{e.price}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * The signature board, repeated on the menu page. Names only — every price on
 * this page comes from `menu.ts`, and these specials do not carry one yet.
 */
/** One line on a specials card, revealed as the card comes up. */
function SpecialLine({ label, index }: { label: string; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group/line flex items-center gap-3 border-b border-paper/10 py-2 last:border-0"
    >
      <span
        aria-hidden
        className="size-1 shrink-0 rounded-full bg-orange transition-all duration-300 group-hover/line:scale-[2]"
      />
      <span className="text-[0.82rem] font-semibold leading-snug text-paper/80 transition-colors duration-300 group-hover/line:text-paper">
        {label}
      </span>
    </motion.li>
  );
}

function SpecialsBoard() {
  return (
    <Section tone="warm">
      <FloatingFood opacity={0.1} />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 size-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      <div className="relative">
        <SectionHead
          align="center"
          eyebrow="The Golden Specials"
          title="SIGNATURE"
          accent="CREATIONS"
          lede="Premium favourites and customer-loved treats, alongside the board above."
        />
      </div>

      {/* Masonry columns, not a grid: these lists are wildly different lengths,
          and a row-aligned grid stretches the short cards into dead white space.
          Columns let each card end where its content ends. */}
      <div className="relative z-10 mt-14 columns-1 gap-6 md:columns-2 xl:columns-3">
        {specialGroups.map((g, gi) => (
          <RevealCard key={g.id} index={gi} className="mb-6 break-inside-avoid">
            <section className="group relative flex flex-col overflow-hidden rounded-3xl bg-ink transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_34px_70px_-38px_oklch(0.175_0.008_60/0.6)]">
              {/* an orange wash drifting inside the card, so the dark ground
                  keeps moving instead of sitting there as a flat block */}
              <span
                aria-hidden
                className="card-wash pointer-events-none absolute -inset-1/4"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, var(--orange) 0%, transparent 62%)",
                  opacity: 0.22,
                  animationDelay: `${gi * -2.4}s`,
                }}
              />

              {/* hairline that lights up orange on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-3xl border border-paper/12 transition-colors duration-500 group-hover:border-orange"
              />
              {/* photo band: the shot leans in as the card is hovered */}
              <div className="relative h-40 overflow-hidden bg-ink md:h-44">
                <img
                  src={g.src}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  width={g.w}
                  height={g.h}
                  className="size-full scale-105 object-cover opacity-80 transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-115"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10"
                />

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[0.5rem] font-extrabold uppercase tracking-[0.28em] text-orange">
                    {g.tagline}
                  </p>
                  <h3 className="mt-1.5 font-display text-lg font-extrabold uppercase leading-tight tracking-[-0.02em] text-paper md:text-xl">
                    {g.title}
                  </h3>
                </div>

                {/* the rule draws itself across the card on hover */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[3px] w-0 bg-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
                />
              </div>

              <div className="relative p-5">
                {g.lists ? (
                  <div className="space-y-4">
                    {g.lists.map((l) => (
                      <div key={l.label}>
                        <p className="flex items-center gap-2.5 text-[0.55rem] font-extrabold uppercase tracking-[0.28em] text-orange">
                          <span aria-hidden className="h-px w-5 shrink-0 bg-orange" />
                          {l.label}
                        </p>
                        <ul className="mt-2">
                          {l.items.map((it, i) => (
                            <SpecialLine key={it} label={it} index={i} />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul>
                    {g.items.map((it, i) => (
                      <SpecialLine key={it} label={it} index={i} />
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </RevealCard>
        ))}
      </div>

      <p className="relative z-10 mt-12 rule-label text-ink/65">
        Ask the counter for specials pricing
      </p>
    </Section>
  );
}
