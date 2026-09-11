/**
 * Cafe details used across the footer and the contact page.
 *
 * Taken from the cafe's Google Business Profile. A value left empty (or still
 * marked TODO) is kept off the page rather than shown as a placeholder —
 * publishing a wrong phone number, address or map pin costs the business
 * customers.
 */
const ADDRESS = "251, Market Rd, Arani Palayam, Old Bus Stand, Arani, Tamil Nadu 632301";

export const CAFE = {
  name: "Twin's Golden Cafe",
  founder: "Yuvaraj Venkatesan",

  phone: "+91 78717 87143",
  whatsapp: "917871787143", // digits only, with the country code
  email: "", // none published yet — the email card and footer link stay hidden

  address: ADDRESS,
  /** the part people navigate by, for badges where the full address won't fit */
  shortAddress: "Old Bus Stand, Arani",
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `Twin's Golden Cafe, ${ADDRESS}`,
  )}`,
  // Google Maps' keyless embed, pointed at the cafe by name and address
  mapEmbedSrc: `https://maps.google.com/maps?q=${encodeURIComponent(
    `Twin's Golden Cafe, ${ADDRESS}`,
  )}&z=17&output=embed`,

  hours: "Open daily · 9 AM – 9 PM",
  hoursRows: [{ days: "Monday – Sunday", time: "9:00 AM – 9:00 PM" }],

  social: [
    { label: "Instagram", href: "https://www.instagram.com/twins_golden_cafe/" },
    { label: "Facebook", href: "https://www.facebook.com/Twinsgoldencafe/" },
    { label: "WhatsApp", href: "https://wa.me/917871787143" },
  ],
} as const;

/** True once the contact details have actually been filled in. */
export const CONTACT_DETAILS_READY = !CAFE.phone.includes("00000 00000");

/** True once the address is a real one rather than the TODO note. */
export const ADDRESS_READY = !CAFE.address.startsWith("TODO");

/** Only the social profiles that have a real link — "#" goes nowhere. */
export const SOCIAL = CAFE.social.filter((s: { label: string; href: string }) => s.href !== "#");
