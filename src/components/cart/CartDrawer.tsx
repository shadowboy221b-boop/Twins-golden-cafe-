import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { useCart, type CartLine } from "@/lib/cart";
import { AddButton, BagIcon } from "@/components/cart/AddButton";
import { CAFE } from "@/data/site";
import { ORDERING, UPI_READY } from "@/data/ordering";

type Step = "cart" | "details" | "pay" | "done";

type Details = {
  name: string;
  phone: string;
  type: "pickup" | "delivery";
  when: string;
  address: string;
  landmark: string;
  payment: "upi" | "cash";
  notes: string;
};

type Errors = Partial<Record<keyof Details, string>>;

const DETAILS_KEY = "tgc-details-v1";

const EMPTY: Details = {
  name: "",
  phone: "",
  type: "pickup",
  when: ORDERING.times[0],
  address: "",
  landmark: "",
  payment: "upi",
  notes: "",
};

const PAYMENTS = [
  {
    id: "upi",
    label: "UPI",
    hint: UPI_READY
      ? "Pay now — GPay, PhonePe, Paytm or any UPI app"
      : "GPay, PhonePe or Paytm — pay on pickup or delivery",
  },
  { id: "cash", label: "Cash", hint: "Pay when you collect, or on delivery" },
] as const;

const WHATSAPP_GREEN = "#1faa53";

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** 10 digits, with a +91 or leading 0 taken off */
const phoneDigits = (phone: string) => phone.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");

function validate(d: Details): Errors {
  const e: Errors = {};
  if (d.name.trim().length < 2) e.name = "Please enter your name";
  if (!/^[6-9]\d{9}$/.test(phoneDigits(d.phone))) e.phone = "Enter a 10-digit mobile number";
  if (d.type === "delivery" && d.address.trim().length < 8)
    e.address = "Please enter the full delivery address";
  return e;
}

/** A UPI pay link: opens the guest's UPI app with the payee, amount and order filled in. */
const upiLink = (amount: number, orderNo: string) =>
  `upi://pay?${[
    ["pa", ORDERING.upiId.trim()],
    ["pn", ORDERING.upiName],
    ["am", amount.toFixed(2)],
    ["cu", "INR"],
    ["tn", `Order ${orderNo}`],
  ]
    .map(([k, v]) => `${k}=${encodeURIComponent(v ?? "")}`)
    .join("&")}`;

function orderMessage(
  lines: CartLine[],
  total: number,
  d: Details,
  orderNo: string,
  payment: string,
) {
  const delivery = d.type === "delivery";
  return [
    `*New order — ${CAFE.name}*`,
    `Order no: ${orderNo}`,
    "",
    "*Items*",
    ...lines.map(
      (l) =>
        `• ${l.qty} × ${l.name}${l.variant ? ` (${l.variant})` : ""} — ${money(l.qty * l.price)}`,
    ),
    "",
    `*Total: ${money(total)}*`,
    delivery ? "_Delivery charge, if any, to be confirmed_" : null,
    "",
    `*Order type:* ${delivery ? "Delivery" : "Pickup at the cafe"}`,
    `*Time:* ${d.when}`,
    `*Name:* ${d.name.trim()}`,
    `*Phone:* ${phoneDigits(d.phone)}`,
    delivery ? `*Address:* ${d.address.trim()}` : null,
    delivery && d.landmark.trim() ? `*Landmark:* ${d.landmark.trim()}` : null,
    `*Payment:* ${payment}`,
    d.notes.trim() ? `*Notes:* ${d.notes.trim()}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

const INPUT =
  "w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink/45 focus-visible:border-orange focus-visible:ring-2 focus-visible:ring-orange/30 aria-[invalid=true]:border-red-600";

const LABEL = "text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-ink/70";

function Field({
  id,
  label,
  error,
  hint,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className={`mb-1.5 block ${LABEL}`}>
        {label}
        {optional && (
          <span className="ml-1.5 normal-case tracking-normal text-ink/45">optional</span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-red-700">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ink/55">{hint}</p>
      )}
    </div>
  );
}

/** A radio set drawn as cards, with the native input kept for keyboard and screen readers. */
function Choice({
  name,
  value,
  checked,
  onChange,
  title,
  hint,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  hint: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
        checked ? "border-orange bg-orange/10" : "border-ink/15 hover:border-ink/35"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="mt-1 accent-orange"
      />
      <span>
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-ink/60">{hint}</span>
      </span>
    </label>
  );
}

function WhatsAppGlyph({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.86 9.86 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.69 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-1.99-1.23 7.5 7.5 0 0 1-1.38-1.72c-.14-.25 0-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.66.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.16 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.29Z" />
    </svg>
  );
}

/**
 * The UPI QR code for the pay link. The library is only fetched when the pay
 * step opens, so it adds nothing to the pages themselves.
 */
function UpiQr({ value, amount }: { value: string; amount: number }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setSrc(null);
    import("qrcode")
      .then(({ toDataURL }) =>
        toDataURL(value, {
          margin: 1,
          width: 480,
          errorCorrectionLevel: "M",
          color: { dark: "#1a1410", light: "#ffffff" },
        }),
      )
      .then((url) => {
        if (live) setSrc(url);
      })
      .catch(() => {
        // no QR: the UPI ID and the app button below still work
      });
    return () => {
      live = false;
    };
  }, [value]);

  return (
    <div className="mx-auto w-52 rounded-2xl bg-white p-3 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)] ring-1 ring-ink/10">
      {src ? (
        <img
          src={src}
          alt={`UPI QR code to pay ${money(amount)}`}
          width={480}
          height={480}
          className="size-full"
        />
      ) : (
        <div aria-hidden className="aspect-square w-full animate-pulse rounded-lg bg-ink/5" />
      )}
    </div>
  );
}

/**
 * The cart, the checkout, UPI payment and the hand-off to WhatsApp, in one drawer.
 *
 * A floating button shows the cart once something is in it. The drawer walks
 * through the order (change counts, remove lines), the guest's details (name,
 * phone, pickup or delivery, time, payment, notes), and — for UPI, once the
 * cafe's UPI ID is set — a pay step: a button that opens the guest's UPI app
 * with the amount filled in, a QR code to scan from another phone, and the UPI
 * ID to copy. Then WhatsApp opens with the whole order written out, addressed
 * to the cafe; the guest presses Send and the cafe confirms in that chat.
 *
 * The site can't see a UPI payment land, so a paid order says so in the
 * message, with the transaction number if the guest adds it, for the cafe to
 * check in its UPI app before confirming.
 */
export function CartDrawer() {
  const { lines, count, total, clear, open, setOpen, bumps } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [details, setDetails] = useState<Details>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [orderNo, setOrderNo] = useState("");
  const [utr, setUtr] = useState("");
  const [utrError, setUtrError] = useState("");
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState<{
    url: string;
    orderNo: string;
    total: number;
    paid: boolean;
  } | null>(null);

  // bring back the name, number and address from the guest's last order
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DETAILS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Details>;
      setDetails((d) => ({
        ...d,
        name: typeof saved.name === "string" ? saved.name : "",
        phone: typeof saved.phone === "string" ? saved.phone : "",
        address: typeof saved.address === "string" ? saved.address : "",
        landmark: typeof saved.landmark === "string" ? saved.landmark : "",
      }));
    } catch {
      // nothing saved, or storage blocked
    }
  }, []);

  const set = <K extends keyof Details>(key: K, value: Details[K]) => {
    setDetails((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const openCart = () => {
    if (step === "done") setStep("cart");
    setOpen(true);
  };

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && step === "done") setStep("cart");
  };

  /** Write the order into WhatsApp, open it, and finish. */
  const sendToWhatsApp = (no: string, payment: string, paid: boolean) => {
    const url = `https://wa.me/${CAFE.whatsapp}?text=${encodeURIComponent(
      orderMessage(lines, total, details, no, payment),
    )}`;

    // a new tab where the browser allows it; the same tab if pop-ups are blocked
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;

    setSent({ url, orderNo: no, total, paid });
    clear();
    setUtr("");
    setStep("done");
  };

  const submitDetails = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(details);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`order-${first}`)?.focus();
      return;
    }

    try {
      const { name, phone, address, landmark } = details;
      window.localStorage.setItem(DETAILS_KEY, JSON.stringify({ name, phone, address, landmark }));
    } catch {
      // storage blocked: the order still goes through
    }

    const no = `TGC-${Date.now().toString(36).slice(-5).toUpperCase()}`;
    setOrderNo(no);

    if (details.payment === "upi" && UPI_READY) {
      setCopied(false);
      setUtrError("");
      setStep("pay");
      return;
    }

    sendToWhatsApp(
      no,
      details.payment === "upi" ? "UPI — on pickup/delivery" : "Cash — on pickup/delivery",
      false,
    );
  };

  const confirmPaid = () => {
    const ref = utr.replace(/\s/g, "");
    if (ref && !/^\d{12}$/.test(ref)) {
      setUtrError("A UPI transaction ID has 12 digits");
      document.getElementById("order-utr")?.focus();
      return;
    }
    sendToWhatsApp(
      orderNo,
      `UPI — paid ${money(total)} to ${ORDERING.upiId.trim()}${
        ref ? `, UTR ${ref}` : ""
      } (please check before confirming)`,
      true,
    );
  };

  const payInCash = () => {
    set("payment", "cash");
    sendToWhatsApp(orderNo, "Cash — on pickup/delivery", false);
  };

  const copyUpiId = () => {
    navigator.clipboard
      ?.writeText(ORDERING.upiId.trim())
      .then(() => setCopied(true))
      .catch(() => {
        // clipboard blocked: the ID is on screen to type in
      });
  };

  const delivery = details.type === "delivery";
  const payNow = details.payment === "upi" && UPI_READY;
  const steps = payNow ? 3 : 2;
  const stepNo = { cart: 1, details: 2, pay: 3, done: steps }[step];

  const titles: Record<Step, string> = {
    cart: "Your order",
    details: "Your details",
    pay: "Pay with UPI",
    done: "Order sent",
  };

  const totalRow = (
    <div className="flex items-baseline justify-between">
      <span className="text-[0.6rem] font-extrabold uppercase tracking-[0.24em] text-ink/65">
        Total · {count} {count === 1 ? "item" : "items"}
      </span>
      <span className="font-display text-2xl font-black tabular-nums">{money(total)}</span>
    </div>
  );

  const quietButton =
    "mt-3 w-full text-[0.58rem] font-extrabold uppercase tracking-[0.22em] text-ink/55 hover:text-ink";

  return (
    <>
      <AnimatePresence>
        {count > 0 && !open && (
          <motion.button
            key="cart-button"
            type="button"
            onClick={openCart}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            data-cursor="cta"
            aria-label={`Open cart: ${count} ${count === 1 ? "item" : "items"}, ${money(total)}`}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-orange py-3 pl-4 pr-5 text-ink shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:-translate-y-0.5 md:bottom-8 md:right-8"
          >
            <motion.span
              key={bumps}
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <BagIcon className="size-5" />
              <span className="absolute -right-2.5 -top-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.6rem] font-black text-paper">
                {count}
              </span>
            </motion.span>
            <span className="font-display text-sm font-black tabular-nums">{money(total)}</span>
            <span className="text-[0.58rem] font-extrabold uppercase tracking-[0.2em]">
              View cart
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-paper text-ink shadow-2xl outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-500">
            {/* ---------------------------------------------------- header */}
            <div className="flex items-center justify-between gap-4 bg-ink px-6 py-5 text-paper">
              <div>
                <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.28em] text-orange">
                  {step === "done" ? "Thank you" : `Step ${stepNo} of ${steps}`}
                </p>
                <Dialog.Title className="mt-1 font-display text-xl font-black uppercase tracking-[-0.01em]">
                  {titles[step]}
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  Review your order, add your details, pay by UPI or cash, and send the order to the
                  cafe on WhatsApp.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Close"
                className="grid size-10 place-items-center rounded-full border border-paper/20 transition-colors hover:border-orange hover:text-orange"
              >
                <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-4">
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </Dialog.Close>
            </div>

            {/* ------------------------------------------------ 1. the cart */}
            {step === "cart" &&
              (lines.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                  <BagIcon className="size-12 text-ink/25" />
                  <p className="mt-4 font-display text-lg font-black uppercase">
                    Your cart is empty
                  </p>
                  <p className="mt-1 text-sm text-ink/60">Tap + next to any dish to add it.</p>
                  <Link
                    to="/menu"
                    onClick={() => setOpen(false)}
                    className="mt-6 rounded-full bg-orange px-7 py-3.5 text-[0.62rem] font-extrabold uppercase tracking-[0.22em] text-ink"
                  >
                    Browse the menu
                  </Link>
                </div>
              ) : (
                <>
                  <ul className="flex-1 overflow-y-auto overscroll-contain px-6 py-2">
                    {lines.map((l) => (
                      <li
                        key={l.key}
                        className="flex items-center gap-4 border-b border-ink/10 py-4"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-2 text-[0.95rem] font-semibold leading-snug">
                            {l.veg && (
                              <span
                                title="Vegetarian"
                                className="inline-flex size-3 shrink-0 items-center justify-center rounded-[2px] border border-leaf"
                              >
                                <span className="size-1 rounded-full bg-leaf" />
                              </span>
                            )}
                            <span className="min-w-0">{l.name}</span>
                          </p>
                          <p className="mt-0.5 text-xs text-ink/55">
                            {l.variant ? `${l.variant} · ` : ""}
                            {money(l.price)} each
                          </p>
                        </div>
                        <AddButton item={l} />
                        <span className="w-16 shrink-0 text-right font-display text-sm font-black tabular-nums">
                          {money(l.qty * l.price)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-ink/10 px-6 py-5">
                    {totalRow}
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="mt-4 w-full rounded-full bg-orange px-6 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.24em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Checkout
                    </button>
                    <button type="button" onClick={clear} className={quietButton}>
                      Clear cart
                    </button>
                  </div>
                </>
              ))}

            {/* --------------------------------------------- 2. the details */}
            {step === "details" && (
              <>
                <form
                  id="order-form"
                  noValidate
                  onSubmit={submitDetails}
                  className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-6"
                >
                  <Field id="order-name" label="Your name" error={errors.name}>
                    <input
                      id="order-name"
                      autoComplete="name"
                      value={details.name}
                      onChange={(e) => set("name", e.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "order-name-error" : undefined}
                      className={INPUT}
                    />
                  </Field>

                  <Field id="order-phone" label="Mobile number" error={errors.phone}>
                    <input
                      id="order-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="98765 43210"
                      value={details.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "order-phone-error" : undefined}
                      className={INPUT}
                    />
                  </Field>

                  {ORDERING.delivery && (
                    <fieldset>
                      <legend className={`mb-1.5 ${LABEL}`}>Pickup or delivery</legend>
                      <div className="grid grid-cols-2 gap-2">
                        <Choice
                          name="order-type"
                          value="pickup"
                          checked={!delivery}
                          onChange={() => set("type", "pickup")}
                          title="Pickup"
                          hint={CAFE.shortAddress}
                        />
                        <Choice
                          name="order-type"
                          value="delivery"
                          checked={delivery}
                          onChange={() => set("type", "delivery")}
                          title="Delivery"
                          hint="Charge confirmed on WhatsApp"
                        />
                      </div>
                    </fieldset>
                  )}

                  {delivery && (
                    <>
                      <Field id="order-address" label="Delivery address" error={errors.address}>
                        <textarea
                          id="order-address"
                          rows={3}
                          autoComplete="street-address"
                          value={details.address}
                          onChange={(e) => set("address", e.target.value)}
                          aria-invalid={Boolean(errors.address)}
                          aria-describedby={errors.address ? "order-address-error" : undefined}
                          className={INPUT}
                        />
                      </Field>
                      <Field id="order-landmark" label="Landmark" optional>
                        <input
                          id="order-landmark"
                          value={details.landmark}
                          onChange={(e) => set("landmark", e.target.value)}
                          className={INPUT}
                        />
                      </Field>
                    </>
                  )}

                  <Field id="order-when" label={delivery ? "Delivery time" : "Pickup time"}>
                    <select
                      id="order-when"
                      value={details.when}
                      onChange={(e) => set("when", e.target.value)}
                      className={INPUT}
                    >
                      {ORDERING.times.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>

                  <fieldset>
                    <legend className={`mb-1.5 ${LABEL}`}>Payment method</legend>
                    <div className="space-y-2">
                      {PAYMENTS.map((p) => (
                        <Choice
                          key={p.id}
                          name="order-payment"
                          value={p.id}
                          checked={details.payment === p.id}
                          onChange={() => set("payment", p.id)}
                          title={p.label}
                          hint={p.hint}
                        />
                      ))}
                    </div>
                  </fieldset>

                  <Field id="order-notes" label="Anything else?" optional>
                    <textarea
                      id="order-notes"
                      rows={2}
                      placeholder="Less spicy, extra dip…"
                      value={details.notes}
                      onChange={(e) => set("notes", e.target.value)}
                      className={INPUT}
                    />
                  </Field>
                </form>

                <div className="border-t border-ink/10 px-6 py-5">
                  {totalRow}
                  {payNow ? (
                    <button
                      type="submit"
                      form="order-form"
                      className="mt-4 w-full rounded-full bg-orange px-6 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-ink transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Continue to payment
                    </button>
                  ) : (
                    <button
                      type="submit"
                      form="order-form"
                      className="mt-4 flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-white transition-transform duration-300 hover:-translate-y-0.5"
                      style={{ background: WHATSAPP_GREEN }}
                    >
                      <WhatsAppGlyph />
                      Confirm order on WhatsApp
                    </button>
                  )}
                  <button type="button" onClick={() => setStep("cart")} className={quietButton}>
                    ← Back to the order
                  </button>
                </div>
              </>
            )}

            {/* ---------------------------------------------------- 3. pay */}
            {step === "pay" && (
              <>
                <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 text-center">
                  <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.26em] text-ink/55">
                    Order {orderNo} · pay to {ORDERING.upiName}
                  </p>
                  <p className="mt-2 font-display text-5xl font-black tabular-nums">
                    {money(total)}
                  </p>

                  {/* on a phone, straight into the guest's UPI app */}
                  <a
                    href={upiLink(total, orderNo)}
                    className="mt-6 hidden w-full items-center justify-center gap-3 rounded-full bg-ink px-6 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-paper pointer-coarse:flex"
                  >
                    Pay {money(total)} with a UPI app
                  </a>

                  <p className={`mt-6 ${LABEL}`}>
                    <span className="pointer-coarse:hidden">Scan with any UPI app</span>
                    <span className="hidden pointer-coarse:inline">Or scan from another phone</span>
                  </p>
                  <div className="mt-3">
                    <UpiQr value={upiLink(total, orderNo)} amount={total} />
                  </div>
                  <p className="mt-3 text-xs text-ink/55">GPay · PhonePe · Paytm · BHIM</p>

                  <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-ink/15 bg-white px-4 py-3 text-left">
                    <span className="min-w-0">
                      <span className={`block ${LABEL}`}>UPI ID</span>
                      <span className="mt-0.5 block truncate font-mono text-sm font-semibold">
                        {ORDERING.upiId.trim()}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="shrink-0 rounded-full border border-ink/20 px-4 py-2 text-[0.58rem] font-extrabold uppercase tracking-[0.18em] transition-colors hover:border-orange hover:bg-orange"
                    >
                      {copied ? "Copied ✓" : "Copy"}
                    </button>
                  </div>

                  <div className="mt-5 text-left">
                    <Field
                      id="order-utr"
                      label="UPI transaction ID (UTR)"
                      optional
                      error={utrError || undefined}
                      hint="The 12-digit number your UPI app shows after paying — it helps the cafe find your payment."
                    >
                      <input
                        id="order-utr"
                        inputMode="numeric"
                        autoComplete="off"
                        value={utr}
                        onChange={(e) => {
                          setUtr(e.target.value);
                          if (utrError) setUtrError("");
                        }}
                        aria-invalid={Boolean(utrError)}
                        aria-describedby={utrError ? "order-utr-error" : undefined}
                        className={INPUT}
                      />
                    </Field>
                  </div>
                </div>

                <div className="border-t border-ink/10 px-6 py-5">
                  <button
                    type="button"
                    onClick={confirmPaid}
                    className="flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-white transition-transform duration-300 hover:-translate-y-0.5"
                    style={{ background: WHATSAPP_GREEN }}
                  >
                    <WhatsAppGlyph />
                    I've paid — send order
                  </button>
                  <button type="button" onClick={payInCash} className={quietButton}>
                    Pay in cash instead
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("details")}
                    className="mt-2 w-full text-[0.58rem] font-extrabold uppercase tracking-[0.22em] text-ink/55 hover:text-ink"
                  >
                    ← Back to details
                  </button>
                </div>
              </>
            )}

            {/* ----------------------------------------------- 4. confirmed */}
            {step === "done" && sent && (
              <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-8 text-center">
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  className="grid size-20 place-items-center rounded-full text-white"
                  style={{ background: WHATSAPP_GREEN }}
                >
                  <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-10">
                    <path
                      d="m5 12.5 4.5 4.5L19 7.5"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.span>
                <p className="mt-6 font-display text-2xl font-black uppercase">Almost there!</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {sent.paid
                    ? "Your order and payment details are written out in WhatsApp. Tap Send there — the cafe will check the payment and confirm your order in the same chat."
                    : "Your order is written out in WhatsApp. Tap Send there, and the cafe will confirm it in the same chat."}
                </p>
                <dl className="mt-6 flex gap-10">
                  <div>
                    <dt className="text-[0.55rem] font-extrabold uppercase tracking-[0.24em] text-ink/55">
                      Order no.
                    </dt>
                    <dd className="mt-1 font-display text-lg font-black">{sent.orderNo}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.55rem] font-extrabold uppercase tracking-[0.24em] text-ink/55">
                      {sent.paid ? "Paid" : "Total"}
                    </dt>
                    <dd className="mt-1 font-display text-lg font-black">{money(sent.total)}</dd>
                  </div>
                </dl>
                <a
                  href={sent.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-white"
                  style={{ background: WHATSAPP_GREEN }}
                >
                  <WhatsAppGlyph />
                  WhatsApp didn't open? Tap here
                </a>
                <Dialog.Close className="mt-4 text-[0.6rem] font-extrabold uppercase tracking-[0.22em] text-ink/60 hover:text-ink">
                  Done
                </Dialog.Close>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
