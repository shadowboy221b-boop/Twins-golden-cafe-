import { SOCIAL } from "@/data/site";

type Brand = "instagram" | "facebook" | "whatsapp";

const brandOf = (label: string): Brand =>
  /insta/i.test(label) ? "instagram" : /face/i.test(label) ? "facebook" : "whatsapp";

/** each platform's own colour behind its mark */
const BACKGROUND: Record<Brand, string> = {
  instagram:
    "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%)",
  facebook: "#1877f2",
  whatsapp: "#25d366",
};

function Glyph({ brand, className }: { brand: Brand; className: string }) {
  if (brand === "instagram") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (brand === "facebook") {
    return (
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 21v-7.5h2.6l.4-3.1h-3V8.5c0-.9.3-1.5 1.6-1.5h1.6V4.2c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.3H7.9v3.1h2.6V21h3Z" />
      </svg>
    );
  }
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1.3 4.8 4.9-1.3A9.8 9.8 0 1 0 12 2.2Zm0 17.9a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.1 8.1 0 1 1 12 20.1Z" />
      <path d="M16.5 14.3c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1.1 2.7.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}

/**
 * The cafe's social profiles as the platforms' own marks, in their own colours,
 * with no text beside them. The name is still there for screen readers (and as
 * a tooltip on hover). One component, so the contact page and the footer can
 * never drift apart.
 *
 * Only profiles with a real link are shown — see `SOCIAL` in site.ts.
 */
export function SocialIcons({
  size = "lg",
  className = "",
}: {
  /** "lg" for the contact page, "sm" for the footer */
  size?: "sm" | "lg";
  className?: string;
}) {
  if (SOCIAL.length === 0) return null;

  const box = size === "sm" ? "size-10" : "size-14 md:size-16";
  const glyph = size === "sm" ? "size-5" : "size-7 md:size-8";

  return (
    <ul className={`flex flex-wrap items-center gap-4 ${className}`}>
      {SOCIAL.map((s) => {
        const brand = brandOf(s.label);
        return (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Twin's Golden Cafe on ${s.label}`}
              title={s.label}
              data-cursor="cta"
              className={`grid ${box} place-items-center rounded-full text-white shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_18px_30px_-14px_rgba(0,0,0,0.55)]`}
              style={{ background: BACKGROUND[brand] }}
            >
              <Glyph brand={brand} className={glyph} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
