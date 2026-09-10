import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Cursor } from "@/components/Cursor";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CtaBand, PageHero, RevealCard, Section, SectionHead } from "@/components/page";
import { MaskReveal } from "@/components/bits";
import { CAFE, CONTACT_DETAILS_READY } from "@/data/site";

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
      { property: "og:url", content: "/contact" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

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
];

function ContactPage() {
  return (
    <>
      <Cursor />
      <SiteHeader overDark />

      <main className="relative">
        <PageHero
          eyebrow="Say hello"
          title="LET'S"
          accent="CONNECT"
          lede="Booking a table, ordering for a crowd, or just want to tell us how the kunafa was — here's how to reach us."
        />

        {!CONTACT_DETAILS_READY && (
          <div className="border-b border-orange/30 bg-orange/10 px-5 py-3 md:px-12">
            <p className="mx-auto max-w-7xl text-[0.7rem] font-bold text-orange-ink">
              Setup note (visible to you only until it&apos;s fixed): the phone number, email,
              address, map and social links on this page are placeholders in{" "}
              <code className="font-mono">src/data/site.ts</code>. Replace them before going live.
            </p>
          </div>
        )}

        {/* contact details */}
        <Section tone="paper">
          <SectionHead eyebrow="Contact information" title="REACH" accent="THE COUNTER" />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { label: "Phone", value: CAFE.phone, href: `tel:${CAFE.phone.replace(/\s/g, "")}` },
              {
                label: "WhatsApp",
                value: "Message us",
                href: `https://wa.me/${CAFE.whatsapp}`,
              },
              { label: "Email", value: CAFE.email, href: `mailto:${CAFE.email}` },
            ].map((c, i) => (
              <RevealCard key={c.label} index={i}>
                <a
                  href={c.href}
                  data-cursor="cta"
                  className="group flex h-full flex-col rounded-2xl border border-ink/10 bg-paper p-7 transition-all duration-500 hover:-translate-y-1 hover:border-orange"
                >
                  <span className="text-[0.55rem] font-extrabold uppercase tracking-[0.3em] text-orange-ink">
                    {c.label}
                  </span>
                  <span className="mt-3 font-display text-lg font-extrabold tracking-[-0.02em] text-ink transition-transform duration-500 group-hover:translate-x-1 md:text-xl">
                    {c.value}
                  </span>
                </a>
              </RevealCard>
            ))}
          </div>
        </Section>

        {/* location + hours */}
        <Section tone="warm">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <SectionHead eyebrow="Location" title="FIND" accent="US HERE" />
              <MaskReveal delay={0.16}>
                <p className="serif-accent mt-6 max-w-md text-lg text-ink/70">{CAFE.address}</p>
              </MaskReveal>

              <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10 bg-paper">
                {CAFE.mapEmbedSrc ? (
                  <iframe
                    src={CAFE.mapEmbedSrc}
                    title={`Map showing ${CAFE.name}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="aspect-[16/10] w-full border-0"
                  />
                ) : (
                  <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 text-center">
                    <span aria-hidden className="font-display text-2xl font-extrabold text-ink/25">MAP</span>
                    <span className="max-w-xs px-6 text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-ink/65">
                      Add the Google Maps embed URL to site.ts
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <SectionHead eyebrow="Opening hours" title="WHEN" accent="WE'RE OPEN" />
              <ul className="mt-8">
                {CAFE.hoursRows.map((h, i) => (
                  <RevealCard key={h.days} index={i}>
                    <li className="flex items-baseline justify-between gap-4 border-b border-ink/10 py-4">
                      <span className="text-sm font-bold uppercase tracking-[0.08em] text-ink/80">
                        {h.days}
                      </span>
                      <span className="shrink-0 font-display text-sm font-extrabold text-orange-ink">
                        {h.time}
                      </span>
                    </li>
                  </RevealCard>
                ))}
              </ul>

              <MaskReveal className="mt-10">
                <p className="rule-label text-ink/70">Follow us</p>
              </MaskReveal>
              <ul className="mt-5 flex flex-wrap gap-3">
                {CAFE.social.map((s, i) => (
                  <RevealCard key={s.label} index={i}>
                    <li>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        data-cursor="cta"
                        className="inline-flex rounded-full border border-ink/15 px-5 py-2.5 text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-ink/70 transition-colors hover:border-orange hover:text-orange-ink"
                      >
                        {s.label}
                      </a>
                    </li>
                  </RevealCard>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <EnquiryForm />

        {/* faq */}
        <Section tone="warm">
          <SectionHead eyebrow="Good to know" title="COMMON" accent="QUESTIONS" />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {FAQ.map((f, i) => (
              <RevealCard key={f.q} index={i}>
                <article className="h-full rounded-2xl border border-ink/10 bg-paper p-7">
                  <h3 className="font-display text-lg font-extrabold uppercase tracking-[-0.02em] text-ink">
                    {f.q}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">{f.a}</p>
                </article>
              </RevealCard>
            ))}
          </div>
        </Section>

        <CtaBand
          title="VISIT TWIN'S"
          accent="GOLDEN CAFE TODAY"
          primary={{ to: "/menu", label: "Explore the menu" }}
          secondary={{ to: "/combos", label: "See best combos" }}
        />
      </main>

      <SiteFooter />
    </>
  );
}

/**
 * Enquiry form. There is no backend on this project yet, so rather than
 * pretending to send and dropping the message, it hands the enquiry to
 * WhatsApp — which the cafe already reads.
 */
function EnquiryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hi Twin's Golden Cafe!%0A%0AName: ${encodeURIComponent(
      name,
    )}%0APhone: ${encodeURIComponent(phone)}%0A%0A${encodeURIComponent(message)}`;
    window.open(`https://wa.me/${CAFE.whatsapp}?text=${text}`, "_blank", "noopener");
  };

  const field =
    "w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/65 focus-visible:border-orange focus-visible:ring-2 focus-visible:ring-orange/30";

  return (
    <Section tone="paper">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHead
          eyebrow="Contact form"
          title="SEND US"
          accent="A MESSAGE"
          lede="Fill this in and it opens WhatsApp with your message ready to send — the fastest way to reach the counter."
        />

        <form onSubmit={send} className="grid gap-4">
          <div>
            <label htmlFor="cf-name" className="sr-only">
              Your name
            </label>
            <input
              id="cf-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="cf-phone" className="sr-only">
              Phone number
            </label>
            <input
              id="cf-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className={field}
            />
          </div>
          <div>
            <label htmlFor="cf-msg" className="sr-only">
              Message
            </label>
            <textarea
              id="cf-msg"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What would you like to tell us?"
              className={`${field} resize-y`}
            />
          </div>
          <button
            type="submit"
            data-cursor="cta"
            className="justify-self-start rounded-full bg-orange px-8 py-3.5 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
          >
            Send on WhatsApp
          </button>
        </form>
      </div>
    </Section>
  );
}
