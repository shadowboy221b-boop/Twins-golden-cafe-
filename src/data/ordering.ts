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
  upiId: "" as string,
  /** the payee name the guest sees in their UPI app */
  upiName: "Twin's Golden Cafe",

  times: ["As soon as possible", "In 30 minutes", "In 1 hour"],
} as const;

/** True once there is a UPI ID to pay into. */
export const UPI_READY = ORDERING.upiId.trim().length > 0;
