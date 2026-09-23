import { META_PIXEL_ID, PIXEL_READY } from "@/data/analytics";

/**
 * Talking to the Meta pixel, if there is one.
 *
 * Two rules hold everywhere in this file. Nothing happens unless a pixel id is
 * set — with no id the script is never fetched and no event is sent. And
 * nothing here is allowed to break the page: the shop must still take an order
 * if Meta is blocked, slow, or down, so every call is wrapped and every failure
 * is silent.
 *
 * The queue is Meta's own: the small stub below collects events straight away
 * and fbevents.js replays them when it arrives, which is what lets the script
 * itself wait for an idle moment instead of competing with the food photos.
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

const SCRIPT_SRC = "https://connect.facebook.net/en_US/fbevents.js";

let started = false;

/** Meta's stub: queues calls until the real script loads. */
function stub(): Fbq | null {
  if (typeof window === "undefined") return null;
  if (window.fbq) return window.fbq;

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  }) as Fbq;
  fbq.queue = [];
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";

  window.fbq = fbq;
  window._fbq = fbq;
  return fbq;
}

/**
 * Start the pixel: queue the first page view now, fetch the script when the
 * browser has a spare moment. Calling it twice does nothing the second time.
 */
export function startPixel() {
  if (started || !PIXEL_READY || typeof window === "undefined") return;
  started = true;

  const fbq = stub();
  if (!fbq) return;

  try {
    fbq("init", META_PIXEL_ID);
    fbq("track", "PageView");
  } catch {
    // a blocked pixel is not a broken page
  }

  const load = () => {
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
    const el = document.createElement("script");
    el.async = true;
    el.src = SCRIPT_SRC;
    document.head.appendChild(el);
  };

  // the script waits for a gap, so it never delays the first paint
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(load, { timeout: 4000 });
  } else {
    window.setTimeout(load, 2500);
  }
}

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
