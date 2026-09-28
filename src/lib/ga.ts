import { GA4_ID, GA4_READY } from "@/data/analytics";

/**
 * Talking to Google Analytics.
 *
 * The same shape as the Meta pixel next door, and for the same reasons. The
 * snippet sits inline in the head of every page, because Google's own checks —
 * and Search Console's linking — look for it as the page loads. Google's
 * script itself waits for the first sign of a real visitor, since loading it
 * with the page costs more than it is worth; gtag queues everything until it
 * arrives.
 *
 * Nothing here may break the page. If Analytics is blocked, slow or down, the
 * shop still takes the order.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google's snippet, with the loading changed: the tag is configured straight
 * away, the 90KB script is fetched on the first tap, key, scroll — or after
 * eight seconds, whichever comes first.
 */
export const gaSnippet = GA4_READY
  ? `window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments)}
gtag('js',new Date());
gtag('config','${GA4_ID}');
(function(){var d=0,l=function(){if(d)return;d=1;
var s=document.createElement('script');s.async=1;
s.src='https://www.googletagmanager.com/gtag/js?id=${GA4_ID}';
document.head.appendChild(s)};
['pointerdown','keydown','touchstart','scroll'].forEach(function(e){
window.addEventListener(e,l,{once:true,passive:true})});setTimeout(l,8000)})();`
  : "";

/** One event, with whatever parameters it carries. Silent when there is no id. */
export function gaEvent(name: string, params?: Record<string, unknown>) {
  if (!GA4_READY || typeof window === "undefined" || !window.gtag) return;
  try {
    window.gtag("event", name, params);
  } catch {
    // ignored on purpose: see the note at the top
  }
}

/** A page the visitor moved to without a reload. */
export function gaPageView(path: string, title: string) {
  gaEvent("page_view", { page_path: path, page_title: title, page_location: window.location.href });
}
