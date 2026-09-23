/**
 * The Meta (Facebook) pixel.
 *
 * Paste the pixel id from Events Manager between the quotes and the site starts
 * reporting; leave it empty and nothing about Meta is loaded at all — no
 * script, no cookie, no request. That is the default, so the site never sends a
 * visitor to Meta by accident.
 */
export const META_PIXEL_ID = "1024483573885901";

/** A real pixel id is 15 or 16 digits; anything else is treated as "not set". */
export const PIXEL_READY = /^\d{15,16}$/.test(META_PIXEL_ID);
