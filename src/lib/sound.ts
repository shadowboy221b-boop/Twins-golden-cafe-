/**
 * The small sounds the counter makes.
 *
 * A dish going into the cart gets a short "ting", and an order reaching
 * WhatsApp gets two notes. They are made with the browser's own oscillator, so
 * nothing is downloaded and there is no audio file to keep.
 *
 * Three rules, because sound on a web page is easy to get wrong:
 *
 *  - It only ever follows a tap. Browsers refuse to make noise before the
 *    visitor has touched the page, and so do we.
 *  - It is quiet and short — under a fifth of a second, well below the volume
 *    of a notification — and it never plays twice for one action.
 *  - It can be switched off, and the choice is remembered on that phone.
 *    Anyone who has asked their system for less motion starts muted.
 */

const STORAGE_KEY = "tgc-sound-v1";

let ctx: AudioContext | null = null;
let muted: boolean | null = null;

/** Whether sound is on, remembering what this phone chose last time. */
export function soundOn(): boolean {
  if (muted !== null) return !muted;
  if (typeof window === "undefined") return false;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "off") muted = true;
    else if (saved === "on") muted = false;
    else muted = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    // storage blocked: on for this visit, forgotten afterwards
    muted = false;
  }
  return !muted;
}

/** Turn the sounds on or off, and remember it. */
export function setSoundOn(on: boolean) {
  muted = !on;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // nothing to remember it with; the choice holds for this visit
  }
}

/** The audio engine, built on the first tap and reused after that. */
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  try {
    ctx ??= new Ctor();
    // Safari hands back a suspended context until a gesture resumes it
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** One note: a soft bell that fades rather than stops. */
function note(freq: number, startAt: number, duration = 0.16, gain = 0.06) {
  const c = audio();
  if (!c) return;

  const t = c.currentTime + startAt;
  const osc = c.createOscillator();
  const vol = c.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, t);

  vol.gain.setValueAtTime(0.0001, t);
  vol.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(vol).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

/** A dish going into the cart. */
export function pingAdd() {
  if (!soundOn()) return;
  note(1320, 0, 0.13);
}

/** The order leaving for WhatsApp: two notes, up. */
export function pingSent() {
  if (!soundOn()) return;
  note(880, 0, 0.14);
  note(1320, 0.11, 0.22);
}
