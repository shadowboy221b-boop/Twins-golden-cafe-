import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Logo } from "./Logo";
import { MaskReveal } from "./bits";
import { FloatingFood } from "./FloatingFood";
import { ADDRESS_READY, CAFE, CONTACT_DETAILS_READY } from "@/data/site";
import { SocialIcons } from "@/components/SocialIcons";
import { categories } from "@/data/menu";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/combos", label: "Best Combos" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
] as const;

/** A handful of counters worth linking straight into. */
const QUICK_LINKS = ["pizza", "burgers-nonveg", "kunafa", "milkshakes", "combos"];

/** A footer row that slides in as the footer comes up. */
function Rise({
  delay = 0,
  className = "",
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** A footer link with the rule that draws itself on hover. */
function FooterLink({ to, hash, label }: { to: string; hash?: string; label: string }) {
  return (
    <Link
      to={to}
      {...(hash ? { hash } : {})}
      className="group inline-flex items-center gap-2.5 text-sm font-semibold text-paper/65 transition-colors duration-300 hover:text-orange"
    >
      <span
        aria-hidden
        className="h-px w-0 bg-orange transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-5"
      />
      <span className="transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1">
        {label}
      </span>
    </Link>
  );
}

export function SiteFooter() {
  const quick = QUICK_LINKS.flatMap((id) => {
    const c = categories.find((x) => x.id === id);
    return c ? [c] : [];
  });

  return (
    <footer className="grain relative overflow-hidden bg-ink">
      {/* Two floaters, no more: at this size the drifting art reads as smudges
          behind the type rather than as food, and the footer wants to be the
          quietest part of the page. */}
      <FloatingFood opacity={0.05} count={2} />

      <div
        aria-hidden
        className="blob-a pointer-events-none absolute left-1/2 top-0 size-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, var(--orange) 0%, transparent 65%)" }}
      />

      {/* ------------------------------------------------------ sign-off

          One tight row, not a second hero. A display-size heading down here
          competed with the page's last banner and left a screen of empty dark
          around it; the footer's job is to close the page, so the line and the
          two actions sit on one band. */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-14 md:px-12 md:pt-16">
        <Rise className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <MaskReveal>
              <p className="eyebrow !text-orange">Come and eat</p>
            </MaskReveal>
            <p className="mt-4 font-display text-2xl font-extrabold uppercase leading-[1.1] tracking-[-0.02em] text-paper md:text-3xl">
              What&apos;s your craving today?
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/menu"
              data-cursor="cta"
              className="group inline-flex items-center gap-4 rounded-full bg-orange px-7 py-3.5 text-[0.64rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              Explore the menu
              <span
                aria-hidden
                className="h-px w-5 bg-ink transition-all duration-500 group-hover:w-10"
              />
            </Link>
            <Link
              to="/contact"
              data-cursor="cta"
              className="group inline-flex items-center gap-3 rounded-full border border-paper/25 px-7 py-3.5 text-[0.64rem] font-extrabold uppercase tracking-[0.22em] text-paper transition-colors duration-300 hover:border-orange hover:text-orange"
            >
              Contact us
              <span
                aria-hidden
                className="h-px w-5 bg-current transition-all duration-500 group-hover:w-10"
              />
            </Link>
          </div>
        </Rise>
      </div>

      {/* --------------------------------------------------------- columns */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-12 md:py-20">
        <div className="grid gap-12 border-t border-paper/12 pt-14 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1fr]">
          <Rise>
            <Logo className="text-[1.9rem]" onDark />
            <p className="serif-accent mt-6 max-w-sm text-base leading-relaxed text-paper/60">
              A café that treats fast food like a craft. Golden every single time.
            </p>
            <p className="mt-6 text-[0.55rem] font-extrabold uppercase tracking-[0.26em] text-paper/60">
              Founded by {CAFE.founder}
            </p>
          </Rise>

          <Rise delay={0.06}>
            <nav aria-label="Footer">
              <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.3em] text-orange">
                Explore
              </p>
              <ul className="mt-5 space-y-3">
                {NAV.map((n) => (
                  <li key={n.to}>
                    <FooterLink to={n.to} label={n.label} />
                  </li>
                ))}
              </ul>
            </nav>
          </Rise>

          <Rise delay={0.12}>
            <nav aria-label="Menu sections">
              <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.3em] text-orange">
                On the board
              </p>
              <ul className="mt-5 space-y-3">
                {quick.map((c) => (
                  <li key={c.id}>
                    <FooterLink to="/menu" hash={c.id} label={c.title} />
                  </li>
                ))}
              </ul>
            </nav>
          </Rise>

          <Rise delay={0.18}>
            <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.3em] text-orange">
              Visit
            </p>
            <address className="mt-5 space-y-3 not-italic">
              {/* Never print a placeholder phone or address as if it were real
                  — a wrong number costs the business a customer — and never
                  show visitors a note about it either. Until `site.ts` carries
                  the real details, the footer just gives the hours. */}
              {CONTACT_DETAILS_READY && (
                <>
                  <a
                    href={`tel:${CAFE.phone.replace(/\s/g, "")}`}
                    className="block text-sm font-semibold text-paper/65 transition-colors hover:text-orange"
                  >
                    {CAFE.phone}
                  </a>
                  {CAFE.email && (
                    <a
                      href={`mailto:${CAFE.email}`}
                      className="block text-sm font-semibold text-paper/65 transition-colors hover:text-orange"
                    >
                      {CAFE.email}
                    </a>
                  )}
                </>
              )}
              {ADDRESS_READY && (
                <p className="max-w-xs text-sm leading-relaxed text-paper/55">{CAFE.address}</p>
              )}
              <p className="text-sm text-paper/55">{CAFE.hours}</p>
            </address>
          </Rise>
        </div>

        {/* ------------------------------------------------------- bottom */}
        <div className="mt-14 flex flex-col gap-4 border-t border-paper/12 pt-7 md:flex-row md:items-center md:justify-between">
          <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.3em] text-paper/60">
            © {new Date().getFullYear()} Twin&apos;s Golden Cafe
          </p>

          {/* the platforms' own marks, no text — same icons as the contact page */}
          <SocialIcons size="sm" className="gap-3" />

          <a
            href="#top"
            className="group inline-flex items-center gap-3 self-start text-[0.55rem] font-extrabold uppercase tracking-[0.28em] text-paper/55 transition-colors duration-300 hover:text-orange md:self-auto"
          >
            Back to top
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-full border border-paper/25 transition-all duration-500 group-hover:-translate-y-1 group-hover:border-orange"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-3">
                <path
                  d="M18 15l-6-6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
