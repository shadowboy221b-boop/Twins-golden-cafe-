import type { FirebaseApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import { ORDERING } from "@/data/ordering";

/**
 * The one Firebase app the site uses, and the database behind the counter.
 *
 * Everything here is fetched only when something actually needs it — the
 * library is a quarter of a megabyte, and a guest reading the menu must never
 * pay for the office. The public pages touch this at exactly one moment: when
 * an order is handed to WhatsApp, a copy is filed so the cafe has a record of
 * it. The staff pages load it on purpose, behind a sign-in.
 */

/** Started once and reused; two apps with the same config would be a waste. */
export async function firebaseApp(): Promise<FirebaseApp> {
  const { getApps, initializeApp } = await import("firebase/app");
  return getApps()[0] ?? initializeApp({ ...ORDERING.firebase });
}

export async function db(): Promise<{
  store: Firestore;
  lib: typeof import("firebase/firestore");
}> {
  const [app, lib] = await Promise.all([firebaseApp(), import("firebase/firestore")]);
  return { store: lib.getFirestore(app), lib };
}

export async function firebaseAuth() {
  const [app, lib] = await Promise.all([firebaseApp(), import("firebase/auth")]);
  return { auth: lib.getAuth(app), lib };
}
