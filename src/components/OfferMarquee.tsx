import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

import { OFFER, offerEndLabel, offerLive } from "@/data/offer";
import { trackCustom } from "@/lib/pixel";

/**
 * The offer band, across the top of every page.
 *
 * Somebody who arrives from an ad has already been promised something. This is
 * the band that repeats the promise before they have scrolled anywhere, which
 * is why it sits above the navigation rather than inside the page.
 *
 * Built the same way as the brand strip lower down: the row is written twice
 * and the keyframe travels exactly -50%, so the second copy lands where the
 * first began and the loop never shows a seam. It holds still while a finger
 * or a cursor is on it, because a moving line is one nobody can finish
 * reading, and the site-wide reduced-motion rule freezes it outright.
 *
 * The whole band is one link to the menu, and the tap is reported to Meta as
 * `OfferBarClick` so the ad can be judged on what it actually sent here.
 *
 * Two things it has to do quietly. The end date is read against the guest's own
 * clock, which the page the server built knows nothing about, so the band is
 * drawn as the server drew it and only then checks whether the offer has run
 * out — nothing shifts under anybody on the way in. And because it makes the
 * fixed header taller, it publishes its own height as `--offer-h`, which is
 * what anything that sticks below the header measures itself against.
 */
export function OfferMarquee() {
  const bar = useRef<HTMLAnchorElement>(null);
  // starts as the page was built, then tells the truth once the clock is known
  const [live, setLive] = useState<boolean>(OFFER.live);
  useEffect(() => setLive(offerLive()), []);

  useEffect(() => {
    const el = bar.current;
    const root = document.documentElement;
    if (!live || !el) {
      root.style.setProperty("--offer-h", "0px");
      return;
    }
    const measure = () => root.style.setProperty("--offer-h", `${el.offsetHeight}px`);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.setProperty("--offer-h", "0px");
    };
  }, [live]);

  if (!live) return null;

  const ends = offerEndLabel();
  const lines = [
    // the end date belongs on the offer itself, not on its own slide: it is
    // the reason to order tonight rather than think about it
    ends ? `${OFFER.lines[0]} — ${ends} வரை மட்டும்` : OFFER.lines[0],
    ...OFFER.lines.slice(1),
  ];

  // The strip is written twice. The second copy is scenery that happens to be
  // made of words, so it is hidden from anything that reads the page aloud.
  const row = (copy: number) => (
    <div
      key={copy}
      aria-hidden={copy > 0 ? true : undefined}
      className="flex shrink-0 items-center"
    >
      {lines.map((line) => (
        <span key={line} className="flex items-center whitespace-nowrap">
          <span className="px-5 text-[0.72rem] font-bold tracking-[0.01em] text-offer-fg md:text-[0.8rem]">
            {line}
          </span>
          <span aria-hidden className="text-offer-fg/40">
            •
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <Link
      ref={bar}
      to="/menu"
      aria-label={`${lines[0]} — see the menu`}
      onClick={() => trackCustom("OfferBarClick")}
      className="offer-bar group relative block overflow-hidden bg-offer leading-[2.3rem] md:leading-[2.5rem]"
    >
      <div className="marquee flex w-max" style={{ ["--marquee-dur" as string]: "44s" }}>
        {row(0)}
        {row(1)}
      </div>
    </Link>
  );
}
