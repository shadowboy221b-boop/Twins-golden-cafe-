import { META_PIXEL_ID, PIXEL_READY } from "@/data/analytics";

/**
 * Talking to the Meta pixel.
 *
 * The pixel itself is Meta's own snippet, inline in the head of every page —
 * see `pixelSnippet` below. It has to run that early because Meta's own checks
 * (Events Manager, the Pixel Helper extension) look for the pixel the moment
 * the page loads and call it "not connected" if it arrives later.
 *
 * Everything here is what the site says to it afterwards, and nothing here is
 * allowed to break the page: the shop must still take an order if Meta is
 * blocked, slow or down, so every call is wrapped and every failure is silent.
 */

type Fbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: unknown;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/**
 * Meta's snippet, exactly as Events Manager gives it, with the cafe's id.
 *
 * Kept as one string so it can go in the head of the document itself rather
 * than being added by React after the page is interactive.
 */
export const pixelSnippet = PIXEL_READY
  ? `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`
  : "";

/** One event, with whatever Meta calls its parameters. Silent when there is no pixel. */
export function track(event: string, params?: Record<string, unknown>) {
  if (!PIXEL_READY || typeof window === "undefined" || !window.fbq) return;
  try {
    window.fbq("track", event, params);
  } catch {
    // ignored on purpose: see the note at the top
  }
}

/** A page view for a route the visitor moved to without a reload. */
export function trackPageView() {
  track("PageView");
}
