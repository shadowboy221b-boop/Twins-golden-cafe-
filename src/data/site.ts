/**
 * Cafe details used across the footer and the contact page.
 *
 * ⚠️ EVERY VALUE MARKED "TODO" IS A PLACEHOLDER, NOT REAL DATA.
 * Publishing a wrong phone number, address or map pin actively costs the
 * business customers, so these are deliberately obvious rather than
 * plausible-looking. Replace them before the site goes live.
 */
export const CAFE = {
  name: "Twin's Golden Cafe",
  founder: "Yuvaraj Venkatesan",

  phone: "+91 00000 00000", // TODO: real phone number
  whatsapp: "910000000000", // TODO: real WhatsApp number, digits only with country code
  email: "hello@example.com", // TODO: real email

  address: "TODO — add the full street address, city and PIN code",
  // TODO: paste the embed URL from Google Maps → Share → Embed a map
  mapEmbedSrc: "",

  hours: "Open daily · 11 AM – 11 PM", // TODO: confirm real opening hours
  hoursRows: [
    { days: "Monday – Thursday", time: "11:00 AM – 11:00 PM" },
    { days: "Friday – Sunday", time: "11:00 AM – 11:30 PM" },
  ], // TODO: confirm

  social: [
    { label: "Instagram", href: "#" }, // TODO: real profile URL
    { label: "Facebook", href: "#" }, // TODO: real profile URL
    { label: "WhatsApp", href: "#" }, // TODO: https://wa.me/<number>
  ],
} as const;

/** True once the contact details have actually been filled in. */
export const CONTACT_DETAILS_READY = !CAFE.phone.includes("00000 00000");

/** True once the address is a real one rather than the TODO note. */
export const ADDRESS_READY = !CAFE.address.startsWith("TODO");

/** Only the social profiles that have a real link — "#" goes nowhere. */
export const SOCIAL = CAFE.social.filter((s) => s.href !== "#");
