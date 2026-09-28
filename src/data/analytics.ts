/**
 * Who the site reports to.
 *
 * Both ids below are empty by default, and an empty id means that service is
 * not loaded at all — no script, no cookie, no request. Paste an id in and it
 * starts reporting; take it out and every trace of it leaves the page.
 */

/** The Meta (Facebook) pixel, from Events Manager. */
export const META_PIXEL_ID = "1024483573885901";

/** A real pixel id is 15 or 16 digits; anything else is treated as "not set". */
export const PIXEL_READY = /^\d{15,16}$/.test(META_PIXEL_ID);

/**
 * The Google Analytics 4 measurement id, from Admin → Data streams → Web.
 * It looks like G-XXXXXXXXXX.
 */
export const GA4_ID = "G-Y4JE93DCJZ";

/** A real GA4 id is "G-" and at least eight characters of the stream's code. */
export const GA4_READY = /^G-[A-Z0-9]{8,}$/.test(GA4_ID);
