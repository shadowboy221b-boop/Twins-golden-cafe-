import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs, RevealCard, Section, SectionHead } from "@/components/page";
import { MaskReveal, useLoopInView, useOpenNow } from "@/components/bits";
import { SocialIcons } from "@/components/SocialIcons";
import { ADDRESS_READY, CAFE, CONTACT_DETAILS_READY, SOCIAL } from "@/data/site";
import { breadcrumbSchema, faqSchema, ld, restaurantSchema } from "@/data/seo";
import heroPhoto from "@/assets/shop-front.webp";
import heroPhotoSm from "@/assets/shop-front-600.webp";

const title = "Contact & Location — Twin's Golden Cafe, Arani";
const description =
  "Call or WhatsApp Twin's Golden Cafe, Old Bus Stand, Arani. Opening hours 9 AM to 9 PM daily, directions on the map, social links and an enquiry form.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://twinsgoldencafe.com/contact" },
      { name: "twitter:card", content: "summary_large_image" },
      // this page's own picture, so a link shared on WhatsApp shows what it is about
      { property: "og:image", content: "https://twinsgoldencafe.com/share/contact.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "The shop front of Twin's Golden Cafe at Old Bus Stand, Arani",
      },
      { name: "twitter:image", content: "https://twinsgoldencafe.com/share/contact.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://twinsgoldencafe.com/contact" }],
    // the same place as on the home page, so the two entries are read as one
    scripts: [
      ld(restaurantSchema),
      ld(
        breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ]),
      ),
      // only the questions that have a real answer on the page
      ...(FAQ.length > 0 ? [ld(faqSchema(FAQ))] : []),
    ],
  }),
  component: ContactPage,
});

const EASE = [0.16, 1, 0.3, 1] as const;

const TEL = `tel:${CAFE.phone.replace(/\s/g, "")}`;
const WHATSAPP = `https://wa.me/${CAFE.whatsapp}`;

const FAQ = [
  {
    q: "Is parking available?",
    a: "Roadside parking, right outside on Market Road by the Old Bus Stand — two-wheelers and cars both park along there.",
  },
  {
    q: "Can we dine in?",
    a: "Yes. The cafe is built to sit in, not just collect from.",
  },
  {
    q: "Do you do takeaway?",
    a: "Yes — everything on the menu is packed for takeaway.",
  },
  {
    q: "Do you take online orders?",
    a: `Yes. Order from this site and it reaches us on WhatsApp, or order through Swiggy — on Swiggy the kitchen is still listed under its older name, ${CAFE.swiggyName}.`,
  },
  {
    q: "Do you deliver?",
    a: `Yes — we deliver across ${CAFE.deliveryTown} town, from the Old Bus Stand and Market Road out to Kilarani, Pudur and the Fort side, and up to about ${CAFE.deliveryRadiusKm} km around the town: ${CAFE.deliveryPlaces.join(", ")} and the villages along those roads. Swiggy delivers for us as well (listed there as ${CAFE.swiggyName}). Tell us where you are when you order and we confirm the delivery charge on WhatsApp.`,
  },
  // An answer still marked TODO stays off the page: visitors should never see a
  // note to the owner. It appears as soon as the real answer replaces it.
].filter((f) => !f.a.startsWith("TODO"));

/* ------------------------------------------------------------------ icons */

type IconName =
  "phone" | "whatsapp" | "pin" | "clock" | "instagram" | "facebook" | "send" | "arrow";

const PATHS: Record<IconName, ReactNode> = {
  phone: (
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  ),
  whatsapp: (
    <>
      <path d="M3.5 20.5l1.3-4A8.5 8.5 0 1 1 8 19.3l-4.5 1.2Z" />
      <path d="M9 9.2c.4 2.2 2.4 4.3 4.8 4.8l1-1.2 2 .9c-.3 1.2-1.4 2-2.6 1.8-3-.5-5.7-3.2-6.2-6.2-.2-1.2.6-2.3 1.8-2.6l.9 2-1.1 1Z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <path d="M14 8h3V4.5h-3a4 4 0 0 0-4 4V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V8.9c0-.5.4-.9.9-.9Z" />
  ),
  send: <path d="M4 12 20 4l-4 16-4-6-8-2Z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

/* ------------------------------------------------------------------ hours */

const WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** "Monday – Thursday" style rows spread out into one line per day. */
const WEEK_HOURS = WEEK.map((day, i) => {
  const row = CAFE.hoursRows.find((r) => {
    const [from = "", to] = r.days.split(/\s*[–-]\s*/);
    const a = WEEK.indexOf(from);
    const b = WEEK.indexOf(to ?? from);
    return a >= 0 && b >= 0 && i >= a && i <= b;
  });
  return { day, time: row?.time ?? "—" };
});

/**
 * Today's weekday, worked out in the browser after the page loads — the page
 * is built ahead of time, so the build machine's clock must never decide it.
 */
function useToday() {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    const d = new Date().getDay(); // 0 = Sunday
    setToday(WEEK[(d + 6) % 7] ?? null);
  }, []);
  return today;
}

/* ------------------------------------------------------------------- page */

function ContactPage() {
  return (
    <>
      <Cursor />
      <SiteHeader overDark />

      <main className="relative">
        <ContactHero />

        {/* development only: the live site must never show this to visitors */}
        {import.meta.env.DEV && !CONTACT_DETAILS_READY && (
          <div className="border-b border-orange/30 bg-orange/10 px-5 py-3 md:px-12">
            <p className="mx-auto max-w-7xl text-[0.7rem] font-bold text-orange-ink">
              Setup note (visible to you only until it&apos;s fixed): the phone number and WhatsApp
              in <code className="font-mono">src/data/site.ts</code> are placeholders.
            </p>
          </div>
        )}

        <VisitUs />
        <HowOrdering />
        {CONTACT_DETAILS_READY && <EnquiryForm />}
        {FAQ.length > 0 && <Questions />}
      </main>

      <SiteFooter />
    </>
  );
}

/* ------------------------------------------------------------------- hero */

/**
 * A masthead that is also the fastest way in: the number itself, big enough to
 * tap, with call, WhatsApp and directions right under it — and a photograph of
 * the food carrying a pin for where to find it.
 */
function ContactHero() {
  /** a CSS entrance, so the hero paints at once instead of after the script loads */
  const rise = (delay: number) => ({ animationDelay: `${delay}s` });

  return (
    <header className="grain relative overflow-hidden bg-ink px-5 pb-24 pt-32 md:px-12 md:pb-28 md:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] top-[-20%] size-[60vw] rounded-full opacity-35"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <Breadcrumbs
            trail={[
              { name: "Home", path: "/" },
              { name: "Contact", path: "/contact" },
            ]}
          />
          <MaskReveal>
            <p className="eyebrow !text-orange">Say hello</p>
          </MaskReveal>
          <h1 className="mt-5 display-xl text-paper">
            <MaskReveal delay={0.06}>LET&apos;S</MaskReveal>
            <MaskReveal delay={0.14}>
              <span className="block text-orange">CONNECT</span>
            </MaskReveal>
          </h1>

          <p
            style={rise(0.3)}
            className="rise-in serif-accent mt-7 max-w-xl text-lg text-paper/65 md:text-xl"
          >
            Booking a table, ordering for a crowd, or just want to tell us how the kunafa was —
            call, message or drop in.
          </p>

          {/* the hours, with a light that keeps pulsing */}
          <div
            style={rise(0.4)}
            className="rise-in mt-8 inline-flex items-center gap-3 rounded-full border border-paper/15 bg-paper/5 px-4 py-2"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-orange" />
            </span>
            <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-paper/80">
              {CAFE.hours}
            </span>
          </div>

          {CONTACT_DETAILS_READY && (
            <>
              <a
                style={rise(0.5)}
                href={TEL}
                data-cursor="cta"
                className="rise-in group mt-8 block w-fit font-display text-4xl font-black tabular-nums tracking-[-0.03em] text-paper transition-colors hover:text-orange md:text-6xl"
              >
                {CAFE.phone}
                <span className="mt-2 block h-[3px] w-12 bg-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
              </a>

              <div style={rise(0.6)} className="rise-in mt-9 flex flex-wrap gap-3">
                <a
                  href={TEL}
                  data-cursor="cta"
                  className="inline-flex items-center gap-2.5 rounded-full bg-orange px-6 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <Icon name="phone" className="size-4" />
                  Call now
                </a>
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-cursor="cta"
                  className="inline-flex items-center gap-2.5 rounded-full border border-paper/25 px-6 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-paper transition-colors hover:border-orange hover:text-orange"
                >
                  <Icon name="whatsapp" className="size-4" />
                  WhatsApp
                </a>
                {ADDRESS_READY && (
                  <a
                    href={CAFE.directionsUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="cta"
                    className="inline-flex items-center gap-2.5 rounded-full border border-paper/25 px-6 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-paper transition-colors hover:border-orange hover:text-orange"
                  >
                    <Icon name="pin" className="size-4" />
                    Directions
                  </a>
                )}
              </div>
            </>
          )}
        </div>

        {/* the photograph, set at a slight angle, with the pin on it */}
        <div style={rise(0.25)} className="tilt-in relative mx-auto w-full max-w-sm lg:max-w-md">
          {/* corner brackets set just outside the frame — top left and bottom
              right, clear of the address badge */}
          <span
            aria-hidden
            className="pointer-events-none absolute -left-4 -top-4 z-10 size-14 rounded-tl-[1.6rem] border-l-[3px] border-t-[3px] border-orange"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-4 -right-4 z-10 size-14 rounded-br-[1.6rem] border-b-[3px] border-r-[3px] border-orange"
          />

          {/* The border is a conic gradient whose angle turns, so a band of
              golden light keeps running round the frame. */}
          <div
            className="border-spin relative rounded-[2.2rem] p-[3px] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8),0_0_70px_-25px_oklch(0.677_0.196_46/0.7)]"
            style={{
              background:
                "conic-gradient(from var(--border-angle), oklch(0.677 0.196 46 / 0.25) 0deg, oklch(0.677 0.196 46 / 0.25) 210deg, #f76b0a 265deg, #ffdca8 300deg, #f76b0a 335deg, oklch(0.677 0.196 46 / 0.25) 360deg)",
            }}
          >
            {/* the shop front at its own 3:4, so neither the sign nor the steps
                are cropped away */}
            <div
              data-cursor="view"
              className="relative overflow-hidden rounded-[2rem] bg-ink"
              style={{ aspectRatio: "3 / 4" }}
            >
              <img
                src={heroPhoto}
                srcSet={`${heroPhotoSm} 600w, ${heroPhoto} 900w`}
                sizes="(min-width: 1024px) 28rem, 90vw"
                fetchPriority="high"
                alt="The Twin's Golden Cafe shop front at Old Bus Stand, Arani"
                width={900}
                height={1200}
                decoding="async"
                className="size-full object-cover"
              />
              {/* a band of light that crosses the photo every few seconds */}
              <span
                aria-hidden
                className="photo-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
              />
            </div>
          </div>

          {ADDRESS_READY && (
            <div
              style={rise(0.9)}
              className="badge-in absolute -bottom-6 -left-3 max-w-[15rem] rounded-2xl bg-orange p-4 text-ink shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] md:-left-10"
            >
              <Icon name="pin" className="size-5" />
              <p className="mt-2 text-[0.55rem] font-extrabold uppercase tracking-[0.24em] text-ink/70">
                Find us at
              </p>
              <p className="mt-1 font-display text-base font-black uppercase leading-tight">
                {CAFE.shortAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- visit us */

/** The map with the address laid over it, and the week's hours beside it. */
/**
 * The Google map, fetched only once its box is nearly on screen. The browser's
 * own lazy loading starts more than a screen early on a phone, which pulled
 * about 440KB of Maps code into every visit to this page, scrolled or not.
 */
function MapEmbed() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: "200px 0px" });

  return (
    <div ref={ref} className="block aspect-[4/3] w-full md:aspect-[16/10] lg:aspect-auto lg:h-full">
      {near ? (
        <iframe
          src={CAFE.mapEmbedSrc}
          title={`Map showing ${CAFE.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block size-full border-0"
        />
      ) : (
        <div
          aria-hidden
          className="grid size-full place-items-center bg-ink/5 text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-ink/45"
        >
          Loading map…
        </div>
      )}
    </div>
  );
}

function VisitUs() {
  const today = useToday();

  return (
    <Section tone="warm">
      {/* One heading for the whole section. Two headings of different lengths
          wrapped to different heights and left the map and the hours starting
          at different levels; with small labels instead, both start level. */}
      <SectionHead align="center" eyebrow="Visit us" title="FIND US" accent="HERE" />

      {/* The two columns stretch to one height and the map fills its column,
          so the map and the opening hours end level as well as start level. */}
      <div
        className={`mt-14 grid items-stretch gap-10 ${
          CAFE.mapEmbedSrc ? "lg:grid-cols-[1.25fr_0.75fr] lg:gap-12" : ""
        }`}
      >
        {CAFE.mapEmbedSrc && (
          <div className="flex flex-col">
            <p className="rule-label text-ink/70">Location</p>

            <RevealCard className="relative mt-5 flex-1">
              <div className="h-full overflow-hidden rounded-[2rem] border border-ink/10 bg-paper shadow-[0_30px_70px_-40px_oklch(0.175_0.008_60/0.5)]">
                <MapEmbed />
              </div>

              {ADDRESS_READY && (
                <div className="relative mx-4 -mt-16 rounded-2xl bg-ink p-6 text-paper shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)] md:absolute md:bottom-6 md:left-6 md:mx-0 md:mt-0 md:max-w-sm">
                  <div className="flex items-start gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-orange text-ink">
                      <Icon name="pin" className="size-5" />
                    </span>
                    <div>
                      <p className="font-display text-lg font-black uppercase leading-tight">
                        {CAFE.name}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-paper/70">{CAFE.address}</p>
                    </div>
                  </div>
                  <a
                    href={CAFE.directionsUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    data-cursor="cta"
                    className="group mt-5 inline-flex items-center gap-3 rounded-full bg-orange px-5 py-3 text-[0.62rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Get directions
                    <Icon
                      name="arrow"
                      className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                    />
                  </a>
                </div>
              )}
            </RevealCard>
          </div>
        )}

        <div>
          <p className="rule-label text-ink/70">Opening hours</p>

          <ul className="mt-5 overflow-hidden rounded-3xl border border-ink/10 bg-paper shadow-[0_24px_60px_-40px_oklch(0.175_0.008_60/0.45)]">
            {WEEK_HOURS.map((h, i) => {
              const isToday = h.day === today;
              return (
                <RevealCard
                  as="li"
                  key={h.day}
                  index={i}
                  className={`relative flex items-center justify-between gap-4 border-b border-ink/8 px-5 py-5 last:border-b-0 sm:px-7 md:px-8 md:py-6 ${
                    isToday ? "bg-orange text-ink" : "text-ink"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {/* three letters on a phone, so the day and its hours share one line */}
                    <span className="text-sm font-bold uppercase tracking-[0.08em] sm:text-base md:text-lg">
                      <span className="sm:hidden">{h.day.slice(0, 3)}</span>
                      <span className="hidden sm:inline">{h.day}</span>
                    </span>
                    {isToday && (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 420, damping: 18 }}
                        className="rounded-full bg-ink px-3 py-1 text-[0.55rem] font-extrabold uppercase tracking-[0.2em] text-orange"
                      >
                        Today
                      </motion.span>
                    )}
                  </span>
                  <span
                    className={`whitespace-nowrap font-display text-sm font-extrabold tabular-nums sm:text-base md:text-xl ${
                      isToday ? "text-ink" : "text-orange-ink"
                    }`}
                  >
                    {h.time}
                  </span>
                </RevealCard>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Follow us sits under both cards rather than in the hours column, so it
          doesn't make one column taller than the other. */}
      {SOCIAL.length > 0 && (
        <div className="mt-14">
          <MaskReveal>
            <p className="rule-label text-ink/70">Follow us</p>
          </MaskReveal>
          <SocialIcons className="mt-6 justify-center" />
        </div>
      )}
    </Section>
  );
}

/* ----------------------------------------------------------------- enquiry */

const REASONS = ["Table booking", "Party order", "Feedback", "Something else"];

/**
 * Enquiry form. There is no backend on this project, so rather than pretending
 * to send and dropping the message, it hands the enquiry to WhatsApp — which
 * the cafe already reads. Picking a reason puts it at the top of the message.
 */
/**
 * What happens between "I want that" and food in a bag. The page had the phone
 * number and the map but never said how ordering works, which is the question
 * most first-time visitors actually arrive with.
 */
function HowOrdering() {
  return (
    <Section tone="paper">
      <SectionHead
        align="center"
        eyebrow="Ordering"
        title="HOW TO"
        accent="ORDER"
        lede="Three ways to get your food, all ending at the same counter."
      />

      <div className="relative z-10 mt-14 grid gap-6 md:grid-cols-3">
        {[
          {
            step: "01",
            title: "Order on the site",
            body: (
              <>
                Add what you want from the{" "}
                <Link
                  to="/menu"
                  className="font-bold text-orange-ink underline-offset-4 hover:underline"
                >
                  menu
                </Link>{" "}
                or the{" "}
                <Link
                  to="/combos"
                  className="font-bold text-orange-ink underline-offset-4 hover:underline"
                >
                  combos
                </Link>
                , fill in your name and number, and the order opens in WhatsApp ready to send. We
                confirm it in that same chat. Prefer an app?{" "}
                <a
                  href={CAFE.swiggy}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-bold text-orange-ink underline-offset-4 hover:underline"
                >
                  Order on Swiggy
                </a>{" "}
                — the kitchen is listed there as {CAFE.swiggyName}.
              </>
            ),
          },
          {
            step: "02",
            title: "Pay cash or UPI",
            body: (
              <>
                Pay by UPI while you order, or with cash when you collect. A UPI payment comes with
                a screenshot in the chat, and we check it against our account before confirming.
              </>
            ),
          },
          {
            step: "03",
            title: "Collect or delivered",
            body: (
              <>
                Collect it at {CAFE.shortAddress}, or ask for delivery — we come to you anywhere in{" "}
                {CAFE.deliveryTown} town and up to about {CAFE.deliveryRadiusKm} km around it —{" "}
                {CAFE.deliveryPlaces.join(", ")} included — and confirm the charge in the chat. For
                a big order, call{" "}
                <a
                  href={TEL}
                  className="font-bold text-orange-ink underline-offset-4 hover:underline"
                >
                  {CAFE.phone}
                </a>{" "}
                for a big order — family feasts and party trays are easier to plan on a call.
              </>
            ),
          },
        ].map((s, i) => (
          <RevealCard key={s.step} index={i}>
            <div className="h-full rounded-3xl border border-ink/10 bg-paper-warm p-7">
              <p className="font-display text-3xl font-black text-orange">{s.step}</p>
              <h3 className="mt-4 font-display text-lg font-black uppercase tracking-[-0.01em] text-ink">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{s.body}</p>
            </div>
          </RevealCard>
        ))}
      </div>
    </Section>
  );
}

function EnquiryForm() {
  const [reason, setReason] = useState(REASONS[0] ?? "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = [
      "Hi Twin's Golden Cafe!",
      "",
      `Reason: ${reason}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      "",
      message,
    ].join("\n");
    window.open(`${WHATSAPP}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const field =
    "peer w-full rounded-2xl border border-paper/15 bg-paper/5 px-4 pb-3 pt-6 text-sm text-paper outline-none transition-colors placeholder:text-transparent focus:border-orange focus:bg-paper/10";
  const label =
    "pointer-events-none absolute left-4 top-4 text-sm text-paper/50 transition-all duration-300 peer-focus:top-2 peer-focus:text-[0.6rem] peer-focus:uppercase peer-focus:tracking-[0.2em] peer-focus:text-orange peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[0.6rem] peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.2em]";

  return (
    <Section tone="ink">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10vw] bottom-[-20%] size-[50vw] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <SectionHead
            dark
            eyebrow="Contact form"
            title="SEND US"
            accent="A MESSAGE"
            lede="Fill this in and it opens WhatsApp with your message ready to send — the fastest way to reach the counter."
          />
          <div className="mt-10 flex items-center gap-4 text-paper/60">
            <span className="grid size-12 place-items-center rounded-2xl border border-paper/15 text-orange">
              <Icon name="whatsapp" className="size-6" />
            </span>
            <span className="text-sm leading-relaxed">
              Messages go straight to the cafe&apos;s WhatsApp on{" "}
              <span className="font-bold text-paper">{CAFE.phone}</span>
            </span>
          </div>
        </div>

        <RevealCard>
          <form
            onSubmit={send}
            className="rounded-[2rem] border border-paper/12 bg-paper/[0.04] p-6 md:p-8"
          >
            {/* what the message is about — the pill slides to the chosen one */}
            <fieldset>
              <legend className="text-[0.58rem] font-extrabold uppercase tracking-[0.28em] text-paper/55">
                What&apos;s it about?
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {REASONS.map((r) => {
                  const on = r === reason;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      aria-pressed={on}
                      data-cursor="cta"
                      className={`relative rounded-full px-4 py-2 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] transition-colors duration-300 ${
                        on ? "text-ink" : "text-paper/70 hover:text-paper"
                      }`}
                    >
                      {on && (
                        <motion.span
                          layoutId="enquiry-reason"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          className="absolute inset-0 rounded-full bg-orange"
                        />
                      )}
                      {!on && (
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full border border-paper/15"
                        />
                      )}
                      <span className="relative">{r}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <input
                  id="cf-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={field}
                />
                <label htmlFor="cf-name" className={label}>
                  Your name
                </label>
              </div>
              <div className="relative">
                <input
                  id="cf-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  // a phone keypad on a phone, and enough digits to be a real number
                  pattern="[0-9+ ()-]{10,16}"
                  title="Your mobile number, at least 10 digits"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className={field}
                />
                <label htmlFor="cf-phone" className={label}>
                  Phone number
                </label>
              </div>
            </div>

            <div className="relative mt-4">
              <textarea
                id="cf-msg"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message"
                className={`${field} resize-y`}
              />
              <label htmlFor="cf-msg" className={label}>
                Your message
              </label>
            </div>

            <button
              type="submit"
              data-cursor="cta"
              className="group mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-orange px-8 py-4 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
            >
              <Icon name="send" className="size-4" />
              Send on WhatsApp
              <Icon
                name="arrow"
                className="size-4 transition-transform duration-500 group-hover:translate-x-1"
              />
            </button>
          </form>
        </RevealCard>
      </div>
    </Section>
  );
}

/* --------------------------------------------------------------------- faq */

/**
 * The way to ask a question the list does not answer, beside the list itself.
 *
 * It keeps a little life: warmth washing slowly behind the card, the three
 * facts dealt in one after another, a light that says whether the counter is on
 * right now, and the WhatsApp mark waving every few seconds — all of it frozen
 * for anyone who asks for less motion, and paused while the card is off screen.
 */
function AskCard() {
  const ref = useRef<HTMLDivElement>(null);
  const looping = useLoopInView(ref);
  const openNow = useOpenNow();

  const facts = [
    { t: "9–9", d: "Every day", live: true },
    { t: `${CAFE.deliveryRadiusKm} km`, d: "Delivery", live: false },
    { t: "UPI", d: "Or cash", live: false },
  ];

  return (
    <RevealCard className="mt-10 max-w-sm">
      <div
        ref={ref}
        className="relative overflow-hidden rounded-3xl border border-ink/10 bg-paper-warm p-7"
      >
        {looping && (
          <span
            aria-hidden
            className="card-wash pointer-events-none absolute -inset-1/4"
            style={{
              background: "radial-gradient(circle at 30% 30%, var(--orange) 0%, transparent 62%)",
              opacity: 0.1,
            }}
          />
        )}

        <div className="relative z-10">
          <p className="text-sm leading-relaxed text-ink/70">
            Not answered here? Ask on WhatsApp — someone is at the counter every day from 9 in the
            morning to 9 at night, and that is the quickest way to get us.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="cta"
              className="group inline-flex items-center gap-2.5 rounded-full bg-orange px-6 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Icon
                name="whatsapp"
                className={`size-4 ${looping ? "nudge" : ""} group-hover:[animation-play-state:paused]`}
              />
              Ask on WhatsApp
            </a>
            <a
              href={TEL}
              data-cursor="cta"
              className="inline-flex items-center gap-2.5 rounded-full border border-ink/15 px-6 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-colors hover:border-orange hover:text-orange-ink"
            >
              <Icon name="phone" className="size-4" />
              Call
            </a>
          </div>

          {/* the three facts people ask for before they ask anything else */}
          <dl className="mt-7 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-ink/10 text-center">
            {facts.map((f, i) => (
              <motion.div
                key={f.d}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: EASE }}
                className="bg-paper-warm px-2 py-4"
              >
                <dt className="font-display text-base font-black tracking-[-0.01em] text-ink">
                  {f.t}
                </dt>
                <dd className="mt-1 flex items-center justify-center gap-1.5 text-[0.5rem] font-extrabold uppercase tracking-[0.18em] text-ink/50">
                  {/* the first cell says whether that 9–9 is happening now */}
                  {f.live && openNow !== null && (
                    <span className="relative flex size-1.5">
                      {looping && openNow && (
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-leaf opacity-70" />
                      )}
                      <span
                        className={`relative inline-flex size-1.5 rounded-full ${
                          openNow ? "bg-leaf" : "bg-ink/30"
                        }`}
                      />
                    </span>
                  )}
                  {f.live && openNow !== null ? (openNow ? "Open now" : "Closed now") : f.d}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </RevealCard>
  );
}

/** Questions as an accordion — one open at a time, the + turning into a ×. */
function Questions() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section tone="paper">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        {/* the heading left a tall empty column beside five questions: the way
            to ask a sixth one belongs in it */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHead eyebrow="Good to know" title="COMMON" accent="QUESTIONS" />

          <AskCard />
        </div>

        <ul className="border-t border-ink/12">
          {FAQ.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className="border-b border-ink/12">
                <button
                  type="button"
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  aria-controls={`faq-${i}`}
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
                {/* Every answer stays in the page and folds shut, rather than
                    being built when it opens: a closed answer is still an
                    answer, and a crawler that never clicks should read all
                    five — which is also what the FAQ data in the head claims. */}
                <motion.div
                  id={`faq-${i}`}
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
