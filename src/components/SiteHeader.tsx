import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, useScroll, useSpring } from "motion/react";
import { Logo } from "./Logo";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/combos", label: "Best Combos" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
] as const;

/**
 * Site-wide navigation. Over a dark hero it rides transparent with light type;
 * once it lifts off, it becomes a white sheet. The switch is driven by a
 * sentinel rather than a scroll listener, so nothing runs on every frame.
 */
export function SiteHeader({ overDark = false }: { overDark?: boolean }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sentinel = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setScrolled(!e?.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // close the drawer whenever the route changes
  useEffect(() => setOpen(false), [pathname]);

  const onDark = overDark && !scrolled;

  return (
    <>
      <div
        ref={sentinel}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-12"
      />

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          onDark ? "" : "bg-paper/97 shadow-[0_1px_0_rgba(17,17,17,0.08)]"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3.5 md:px-12">
          <Link
            to="/"
            aria-label="Twin's Golden Cafe — home"
            data-cursor="cta"
            className="shrink-0"
          >
            <Logo className="text-[1.05rem] md:text-[1.15rem]" onDark={onDark} />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {NAV.map((n) => {
                const active = pathname === n.to;
                return (
                  <li key={n.to}>
                    <Link
                      to={n.to}
                      data-cursor="view"
                      aria-current={active ? "page" : undefined}
                      className={`relative text-[0.62rem] font-extrabold uppercase tracking-[0.24em] transition-colors duration-300 ${
                        active
                          ? onDark
                            ? "text-orange"
                            : "text-orange-ink"
                          : onDark
                            ? "text-paper/65 hover:text-paper"
                            : "text-ink/60 hover:text-ink"
                      }`}
                    >
                      {n.label}
                      {active && (
                        <motion.span
                          layoutId="site-nav-underline"
                          className="absolute -bottom-1.5 left-0 h-[2px] w-full bg-orange"
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              to="/contact"
              data-cursor="cta"
              className="hidden rounded-full bg-orange px-5 py-2.5 text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5 sm:inline-flex"
            >
              Order Now
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`inline-flex size-10 items-center justify-center rounded-full border transition-colors lg:hidden ${
                onDark ? "border-paper/25 text-paper" : "border-ink/15 text-ink"
              }`}
            >
              <span className="relative block h-3 w-4" aria-hidden>
                <span
                  className={`absolute inset-x-0 h-[2px] bg-current transition-all duration-300 ${
                    open ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute inset-x-0 top-1.5 h-[2px] bg-current transition-opacity duration-300 ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute inset-x-0 h-[2px] bg-current transition-all duration-300 ${
                    open ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        <motion.div style={{ scaleX: progress }} className="h-[2px] origin-left bg-orange" />

        {/* mobile drawer */}
        <motion.div
          id="site-menu"
          initial={false}
          animate={{ height: open ? "auto" : 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-t border-ink/10 bg-paper lg:hidden"
        >
          <ul className="mx-auto max-w-7xl px-5 py-4 md:px-12">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className={`block border-b border-ink/8 py-3 font-display text-lg font-extrabold uppercase tracking-[-0.02em] transition-colors ${
                    pathname === n.to ? "text-orange-ink" : "text-ink hover:text-orange-ink"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/contact"
                className="mt-4 inline-flex rounded-full bg-orange px-6 py-3 text-[0.62rem] font-extrabold uppercase tracking-[0.22em] text-ink"
              >
                Order Now
              </Link>
            </li>
          </ul>
        </motion.div>
      </header>
    </>
  );
}
