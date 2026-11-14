import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@tanstack/react-router";

import { OFFER, offerEndLabel, offerLive, soleGift } from "@/data/offer";
import { CAFE } from "@/data/site";
import { trackCustom } from "@/lib/pixel";

const SEEN_KEY = "tgc-offer-popup-v1";
/** long enough that the page has drawn and somebody has seen where they are */
const DELAY_MS = 2200;

/** today, as the browser reckons it — the popup is shown once a day at most */
const today = () => new Date().toISOString().slice(0, 10);

function seenToday(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === today();
  } catch {
    // storage blocked: show it, which is better than never showing it
    return false;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, today());
  } catch {
    // storage blocked: it will be shown again, which is the kinder failure
  }
}

/**
 * The offer, said once.
 *
 * The band along the top is for somebody already reading. This is for somebody
 * who has just arrived from an advertisement and has not looked up yet — it
 * states the offer, gives them the way to take it, and gets out of the way.
 *
 * Three rules, because a popup that breaks any of them is the kind everybody
 * hates. It waits until the page has drawn rather than landing on top of a
 * half-loaded screen. It is shown once a day per browser, not once per page.
 * And the way out is a real labelled button, not a grey cross in a corner —
 * somebody who does not want the offer should be able to say so in one tap.
 */
export function OfferPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!offerLive() || seenToday()) return;
    const t = window.setTimeout(() => {
      setOpen(true);
      trackCustom("OfferPopupShown");
    }, DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const close = () => {
    markSeen();
    setOpen(false);
  };

  const ends = offerEndLabel();
  const gift = soleGift ?? OFFER.gifts[0];
  if (!gift) return null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[70] bg-ink/70 backdrop-blur-[2px]"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="fixed left-1/2 top-1/2 z-[71] w-[min(24rem,calc(100vw-2.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.75rem] bg-offer text-offer-fg shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
              >
                {/* a warm corner light, so the card is not a flat block of colour */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-offer-fg/15 blur-2xl"
                />

                <div className="relative px-7 pb-6 pt-7 text-center">
                  <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.26em] text-offer-fg/70">
                    Website exclusive
                  </p>

                  <Dialog.Title asChild>
                    <h2 className="mt-3 font-display text-[1.7rem] font-black leading-[1.08] tracking-[-0.01em]">
                      Free {gift.name}
                      <span aria-hidden className="ml-1.5">
                        {gift.emoji}
                      </span>
                    </h2>
                  </Dialog.Title>

                  <Dialog.Description asChild>
                    <p className="mt-2.5 text-sm leading-relaxed text-offer-fg/85">
                      Order ₹{OFFER.minSpend} or more on this site and one goes in the bag — worth ₹
                      {gift.worth}, nothing added to the bill.
                    </p>
                  </Dialog.Description>

                  <ul className="mt-5 space-y-1.5 border-y border-offer-fg/15 py-4 text-[0.78rem] text-offer-fg/80">
                    <li>
                      🛵 Free delivery over ₹{CAFE.freeDeliveryOver} — and always inside{" "}
                      {CAFE.freeDeliveryKm} km
                    </li>
                    <li>💳 UPI or cash on delivery</li>
                    {ends ? <li>⏰ Offer runs until {ends}</li> : null}
                  </ul>

                  <Link
                    to="/menu"
                    onClick={() => {
                      trackCustom("OfferPopupClick");
                      close();
                    }}
                    className="mt-5 block w-full rounded-full bg-offer-fg px-6 py-3.5 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-offer transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Order now
                  </Link>

                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="mt-3 w-full py-1 text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-offer-fg/55 transition-colors hover:text-offer-fg"
                    >
                      Venam
                    </button>
                  </Dialog.Close>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
