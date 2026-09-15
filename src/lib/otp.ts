import type { Auth, ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { ORDERING } from "@/data/ordering";

/**
 * Proving a guest owns the number they typed, with a one-time SMS code sent by
 * Firebase. Firebase is fetched only when the first code is asked for, so none
 * of it weighs on the pages themselves. Once the code checks out the Firebase
 * sign-in is ended straight away: the site only needed the proof, not an account.
 */

let verifier: RecaptchaVerifier | null = null;
let pending: ConfirmationResult | null = null;

async function firebaseAuth(): Promise<{ auth: Auth; lib: typeof import("firebase/auth") }> {
  const [{ getApps, initializeApp }, lib] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);
  const app = getApps()[0] ?? initializeApp({ ...ORDERING.firebase });
  const auth = lib.getAuth(app);
  auth.languageCode = "en";
  return { auth, lib };
}

/** Text a code to a 10-digit Indian mobile number. `containerId` holds Firebase's invisible reCAPTCHA. */
export async function sendOtp(phone10: string, containerId: string) {
  const { auth, lib } = await firebaseAuth();
  verifier?.clear();
  verifier = new lib.RecaptchaVerifier(auth, containerId, { size: "invisible" });
  // reCAPTCHA can hang for good (a blocker, a flaky connection), and a guest
  // must never be left on "Sending…" — past the wait it counts as unavailable.
  let timer = 0;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error("otp/timeout")), SEND_TIMEOUT_MS);
  });
  try {
    pending = await Promise.race([
      lib.signInWithPhoneNumber(auth, `+91${phone10}`, verifier),
      timeout,
    ]);
  } finally {
    window.clearTimeout(timer);
  }
}

/** how long a code may take to go out before the order carries on without one */
const SEND_TIMEOUT_MS = 25_000;

/** Check the code the guest typed against the last one sent. */
export async function confirmOtp(code: string) {
  if (!pending) throw new Error("otp/no-code-sent");
  await pending.confirm(code);
  pending = null;
  const { auth, lib } = await firebaseAuth();
  await lib.signOut(auth);
}

const errorCode = (err: unknown) =>
  typeof err === "object" && err !== null && "code" in err ? String(err.code) : String(err);

/**
 * Failures on the cafe's side rather than the guest's: no billing on the
 * Firebase project, the day's free SMS used up, phone sign-in switched off.
 * The guest can't fix any of these, so the order goes ahead unverified instead
 * of being stuck. A wrong code, a bad number or no connection are not in here.
 */
export function isOtpUnavailable(err: unknown): boolean {
  const code = errorCode(err);
  return [
    "billing-not-enabled",
    "quota-exceeded",
    "operation-not-allowed",
    "admin-restricted-operation",
    "internal-error",
    "otp/timeout",
  ].some((c) => code.includes(c));
}

/** What went wrong, in words a guest can act on. */
export function otpErrorMessage(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err ? String(err.code) : String(err);
  // the raw Firebase error, for whoever is looking at the console
  console.error("[otp]", code, err);
  if (code.includes("invalid-verification-code")) return "That code isn't right — check the SMS.";
  if (code.includes("code-expired")) return "That code has expired. Send a new one.";
  if (code.includes("too-many-requests"))
    return "Too many tries from this phone. Please wait a few minutes.";
  if (code.includes("invalid-phone-number")) return "That mobile number doesn't look right.";
  if (code.includes("quota-exceeded")) return "Codes can't be sent right now. Please try later.";
  if (code.includes("network")) return "No connection. Check your internet and try again.";
  if (code.includes("no-code-sent")) return "Send a code first.";
  const generic = "The code couldn't be sent or checked. Please try again.";
  // while building the site, show which Firebase error it was
  return import.meta.env.DEV ? `${generic} (${code})` : generic;
}
