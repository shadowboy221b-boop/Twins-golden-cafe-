/**
 * The running offer — the band at the top of every page, and the free gift in
 * the cart.
 *
 * Everything the counter might want to change lives here. Set `live` to false
 * and the band disappears, the cart stops offering a gift, and nothing else in
 * the site has to be touched.
 *
 * The two are deliberately one setting. A band that promises a free drink and
 * a cart that never gives one is worse than no band at all, so the same
 * `minSpend` and the same `gifts` drive both.
 */
export const OFFER = {
  /** the whole thing, on or off */
  live: true,

  /** what the food has to come to, before packing, for the gift to unlock */
  minSpend: 299,

  /**
   * The last day the offer runs, as YYYY-MM-DD. The band says so, which is
   * what makes somebody order tonight rather than think about it. Leave it
   * empty for an offer with no end date.
   *
   * The date is read in the guest's own browser, so the offer switches itself
   * off at midnight without anybody deploying anything.
   */
  endsOn: "2026-11-30",

  /**
   * What the guest may pick, and what it costs the cafe. `worth` is only ever
   * shown to the guest as the value of the gift — it is never added to the
   * bill — but it is here so the counter can see at a glance what the offer
   * is giving away.
   */
  gifts: [
    { name: "Lemon Juice", emoji: "🍋", worth: 30 },
    { name: "Popcorn", emoji: "🍿", worth: 60 },
  ],

  /**
   * The band itself. The first line is the offer; the rest are the reasons
   * somebody who arrived from an ad keeps reading. Five is the ceiling — a
   * longer strip is one nobody finishes.
   */
  lines: [
    "🎉 WEBSITE EXCLUSIVE — ₹299+ Order பண்ணா Lemon Juice 🍋 or Popcorn 🍿 FREE!",
    "🛵 3 km-க்குள்ள FREE Delivery",
    "📍 Paiyur • Sevur • Kalambur • Kannamangalam — வீட்டுக்கே Delivery",
    "💳 UPI / Cash on Delivery",
    "⏰ Open daily 9 AM – 10:30 PM",
  ],
} as const;

export type Gift = (typeof OFFER.gifts)[number];

/**
 * Whether the offer is running at all, read against the guest's own clock.
 *
 * Called on every render rather than worked out once, so a tab left open
 * overnight stops promising yesterday's offer.
 */
export function offerLive(now: Date = new Date()): boolean {
  if (!OFFER.live) return false;
  if (!OFFER.endsOn) return true;
  // the last day counts in full: the offer ends as that day ends
  const end = new Date(`${OFFER.endsOn}T23:59:59`);
  return Number.isNaN(end.getTime()) ? true : now <= end;
}

/** "Nov 30" — how the band says the last day, short enough to scroll past. */
export function offerEndLabel(): string {
  if (!OFFER.endsOn) return "";
  const d = new Date(`${OFFER.endsOn}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** What the guest still has to add before the gift unlocks. */
export function giftProgress(subtotal: number) {
  const unlocked = subtotal >= OFFER.minSpend;
  return {
    unlocked,
    left: Math.max(0, OFFER.minSpend - subtotal),
    pct: Math.min(100, Math.round((subtotal / OFFER.minSpend) * 100)),
  };
}
