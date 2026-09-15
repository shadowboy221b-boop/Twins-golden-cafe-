/**
 * How ordering from the website works. There is no payment gateway: the order
 * is sent to the cafe on WhatsApp. A guest paying by UPI pays the cafe's UPI ID
 * straight from their own UPI app before sending, and the cafe checks the
 * payment in its app; a guest paying cash pays on pickup or delivery.
 */
export const ORDERING = {
  /** false hides delivery, and the form offers pickup only */
  delivery: true,

  /**
   * The cafe's UPI ID, e.g. "twinsgoldencafe@okaxis". While it's empty, a guest
   * can still choose UPI but pays on pickup or delivery; once it's filled in,
   * choosing UPI adds a pay-now step with a QR code and a button that opens
   * their UPI app. A business UPI ID works best — some apps refuse pay links
   * to a personal ID.
   */
  upiId: "paytm.s1r5ob1@pty" as string,
  /** the name we ask the guest's UPI app to show */
  upiName: "Twin's Golden Cafe",
  /**
   * The name the account is actually registered under. A UPI app shows the
   * registered merchant name, not the one a pay link asks for, so the guest
   * sees this — saying so up front stops it looking like the wrong shop.
   * Empty when the account is registered in the cafe's own name.
   */
  upiAccountName: "Village Milk",

  /**
   * The Firebase web app that texts the one-time codes (Firebase console →
   * Project settings → Your apps → Web app). While apiKey is empty there is no
   * code step and orders go through as before. These values are public by
   * design: Firebase only accepts them from the site's authorised domains.
   */
  /**
   * The one-time code step at checkout. Off until the Firebase project has
   * billing: without it Firebase sends no SMS at all, and with it every SMS
   * past the free ten a day is charged. The config below stays ready.
   */
  otpEnabled: false as boolean,

  firebase: {
    apiKey: "AIzaSyCnl-7cgq_NU8IsXFOP2YT-y3lB4x9uDqE" as string,
    authDomain: "twins-golden-cafe.firebaseapp.com" as string,
    projectId: "twins-golden-cafe" as string,
    appId: "1:538228193697:web:0ff617c9c0b6dfeca633e0" as string,
  },

  times: ["As soon as possible", "In 30 minutes", "In 1 hour"],
} as const;

/** True once there is a UPI ID to pay into. */
export const UPI_READY = ORDERING.upiId.trim().length > 0;

/** True once Firebase is set up to send the one-time codes. */
export const OTP_READY =
  ORDERING.otpEnabled &&
  ORDERING.firebase.apiKey.trim().length > 0 &&
  ORDERING.firebase.appId.trim().length > 0;
