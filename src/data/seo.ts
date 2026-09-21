import { categories } from "@/data/menu";
import { CAFE, SOCIAL } from "@/data/site";

/**
 * What search engines are told about the cafe, in schema.org form.
 *
 * Google reads this to show the cafe as a place — address, phone, opening
 * hours, the menu — rather than as an ordinary web page, which is what local
 * searches like "cafe in Arani" go looking for. Everything here comes from the
 * same data the pages themselves use, so nothing can drift out of step.
 */

export const SITE_URL = "https://twinsgoldencafe.com";

const ITEMS = categories.flatMap((c) => c.items);
const PRICE_MIN = Math.min(...ITEMS.map((i) => i.price));
const PRICE_MAX = Math.max(...ITEMS.map((i) => i.price));

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** "9:00 AM" → "09:00", the 24-hour form schema.org asks for. */
function to24(time: string): string | null {
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i.exec(time.trim());
  if (!m) return null;
  const [, rawHour, rawMinute = "00", meridiem] = m;
  let hour = Number(rawHour);
  if (/pm/i.test(meridiem ?? "") && hour !== 12) hour += 12;
  if (/am/i.test(meridiem ?? "") && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${rawMinute}`;
}

/** The cafe's hours rows ("Monday – Sunday", "9:00 AM – 9:00 PM") as opening-hours entries. */
function openingHours() {
  return CAFE.hoursRows.flatMap((row) => {
    const [from = "", to] = row.days.split(/\s*[–-]\s*/);
    const start = DAYS.indexOf(from.trim() as (typeof DAYS)[number]);
    const end = DAYS.indexOf((to ?? from).trim() as (typeof DAYS)[number]);
    const [openRaw = "", closeRaw = ""] = row.time.split(/\s*[–-]\s*/);
    const opens = to24(openRaw);
    const closes = to24(closeRaw);
    if (start < 0 || end < 0 || !opens || !closes) return [];
    return [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAYS.slice(start, end + 1).map((d) => `https://schema.org/${d}`),
        opens,
        closes,
      },
    ];
  });
}

/** The cafe itself: one place, referred to by the same id from every page. */
export const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${SITE_URL}/#restaurant`,
  name: CAFE.name,
  url: SITE_URL,
  image: [`${SITE_URL}/og-image.jpg`, `${SITE_URL}/shop-front.jpg`],
  logo: `${SITE_URL}/apple-touch-icon.png`,
  telephone: CAFE.phone.replace(/\s/g, ""),
  address: {
    "@type": "PostalAddress",
    streetAddress: "251, Market Rd, Arani Palayam, Old Bus Stand",
    addressLocality: "Arani",
    addressRegion: "Tamil Nadu",
    postalCode: "632301",
    addressCountry: "IN",
  },
  servesCuisine: ["Pizza", "Burgers", "Fried Chicken", "Momos", "Desserts", "Juices & Shakes"],
  priceRange: `₹${PRICE_MIN}–₹${PRICE_MAX}`,
  currenciesAccepted: "INR",
  paymentAccepted: "Cash, UPI",
  openingHoursSpecification: openingHours(),
  hasMenu: `${SITE_URL}/menu`,
  hasMap: CAFE.directionsUrl,
  founder: { "@type": "Person", name: CAFE.founder },
  // an order placed on the site starts on the menu and finishes on WhatsApp
  potentialAction: {
    "@type": "OrderAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/menu`,
      inLanguage: "en-IN",
      actionPlatform: [
        "https://schema.org/DesktopWebPlatform",
        "https://schema.org/MobileWebPlatform",
      ],
    },
  },
  sameAs: SOCIAL.map((s) => s.href),
};

/** The board itself: every counter, every dish, with its price. */
export const menuSchema = {
  "@context": "https://schema.org",
  "@type": "Menu",
  "@id": `${SITE_URL}/menu#menu`,
  name: `${CAFE.name} menu`,
  url: `${SITE_URL}/menu`,
  inLanguage: "en-IN",
  hasMenuSection: categories.map((c) => ({
    "@type": "MenuSection",
    name: c.title,
    description: c.tagline,
    hasMenuItem: c.items.map((item) => ({
      "@type": "MenuItem",
      name: item.name,
      ...(item.note ? { description: item.note } : {}),
      ...(item.veg ? { suitableForDiet: "https://schema.org/VegetarianDiet" } : {}),
      offers: {
        "@type": "Offer",
        price: item.price,
        priceCurrency: "INR",
      },
    })),
  })),
};

/** The questions answered on the contact page, for the "People also ask" style result. */
export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** The trail Google prints under a result: Home › Menu. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: `${SITE_URL}${step.path}`,
    })),
  };
}

/** A page's head entry for one piece of structured data. */
export const ld = (data: unknown) => ({
  type: "application/ld+json",
  children: JSON.stringify(data),
});
