import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RevealCard, Section, SectionHead } from "@/components/page";
import { MaskReveal } from "@/components/bits";
import { SocialIcons } from "@/components/SocialIcons";
import { ADDRESS_READY, CAFE, CONTACT_DETAILS_READY, SOCIAL } from "@/data/site";
import heroPhoto from "@/assets/burger-splash.webp";

const title = "Contact Us — Twin's Golden Cafe";
const description =
  "Call, message or visit Twin's Golden Cafe. Opening hours, location, social links and an enquiry form.";

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
    ],
    links: [{ rel: "canonical", href: "https://twinsgoldencafe.com/contact" }],
  }),
  component: ContactPage,
});

const EASE = [0.16, 1, 0.3, 1] as const;

const TEL = `tel:${CAFE.phone.replace(/\s/g, "")}`;
const WHATSAPP = `https://wa.me/${CAFE.whatsapp}`;

const FAQ = [
  {
    q: "Is parking available?",
    a: "TODO — confirm parking details for the cafe.",
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
    a: "TODO — confirm which delivery platforms you're listed on.",
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
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <header className="grain relative overflow-hidden bg-ink px-5 pb-24 pt-32 md:px-12 md:pb-28 md:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] top-[-20%] size-[60vw] rounded-full opacity-35"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <MaskReveal>
            <p className="eyebrow !text-orange">Say hello</p>
          </MaskReveal>
          <h1 className="mt-5 display-xl text-paper">
            <MaskReveal delay={0.06}>LET&apos;S</MaskReveal>
            <MaskReveal delay={0.14}>
              <span className="block text-orange">CONNECT</span>
            </MaskReveal>
          </h1>

          <motion.p
            {...rise(0.3)}
            className="serif-accent mt-7 max-w-xl text-lg text-paper/65 md:text-xl"
          >
            Booking a table, ordering for a crowd, or just want to tell us how the kunafa was —
            call, message or drop in.
          </motion.p>

          {/* the hours, with a light that keeps pulsing */}
          <motion.div
            {...rise(0.4)}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-paper/15 bg-paper/5 px-4 py-2"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-orange opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-orange" />
            </span>
            <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-paper/80">
              {CAFE.hours}
            </span>
          </motion.div>

          {CONTACT_DETAILS_READY && (
            <>
              <motion.a
                {...rise(0.5)}
                href={TEL}
                data-cursor="cta"
                className="group mt-8 block w-fit font-display text-4xl font-black tabular-nums tracking-[-0.03em] text-paper transition-colors hover:text-orange md:text-6xl"
              >
                {CAFE.phone}
                <span className="mt-2 block h-[3px] w-12 bg-orange transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
              </motion.a>

              <motion.div {...rise(0.6)} className="mt-9 flex flex-wrap gap-3">
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
              </motion.div>
            </>
          )}
        </div>

        {/* the photograph, set at a slight angle, with the pin on it */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 4 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 1.2, delay: 0.25, ease: EASE }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          <div
            data-cursor="food"
            className="overflow-hidden rounded-[2rem] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)] ring-1 ring-orange/30"
            style={{ aspectRatio: "4 / 5" }}
          >
            <img
              src={heroPhoto}
              alt="A crispy chicken burger at Twin's Golden Cafe"
              width={1100}
              height={1100}
              decoding="async"
              className="size-full object-cover"
            />
          </div>

          {ADDRESS_READY && (
            <motion.div
              initial={{ opacity: 0, x: -24, rotate: -6 }}
              animate={{ opacity: 1, x: 0, rotate: 2 }}
              transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
              className="absolute -bottom-6 -left-3 max-w-[15rem] rounded-2xl bg-orange p-4 text-ink shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] md:-left-10"
            >
              <Icon name="pin" className="size-5" />
              <p className="mt-2 text-[0.55rem] font-extrabold uppercase tracking-[0.24em] text-ink/70">
                Find us at
              </p>
              <p className="mt-1 font-display text-base font-black uppercase leading-tight">
                {CAFE.shortAddress}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- visit us */

/** The map with the address laid over it, and the week's hours beside it. */
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
                <iframe
                  src={CAFE.mapEmbedSrc}
                  title={`Map showing ${CAFE.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block aspect-[4/3] w-full border-0 md:aspect-[16/10] lg:aspect-auto lg:h-full"
                />
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
                <RevealCard key={h.day} index={i}>
                  <li
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
                  </li>
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

/** Questions as an accordion — one open at a time, the + turning into a ×. */
function Questions() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section tone="paper">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHead eyebrow="Good to know" title="COMMON" accent="QUESTIONS" />

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
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      id={`faq-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-6 text-base leading-relaxed text-ink/65">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </Section>
  );
}
