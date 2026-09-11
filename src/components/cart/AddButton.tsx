import { useCart, type CartItem } from "@/lib/cart";

export function BagIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6 8h12l-1.2 12H7.2L6 8Zm3 0V7a3 3 0 0 1 6 0v1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Plus() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-3.5">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function Minus() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-3.5">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Add a dish to the cart. Until it's in, a small plus (or, `wide`, a full
 * "Add to cart" bar); once it is, a − count + stepper in its place, so the
 * guest can see and change what they've already added without opening the cart.
 */
export function AddButton({
  item,
  wide = false,
  tone = "ink",
  className = "",
}: {
  item: CartItem;
  wide?: boolean;
  /** the colour of the filled states: ink on light grounds, orange on dark */
  tone?: "ink" | "orange";
  className?: string;
}) {
  const { qtyOf, add, setQty } = useCart();
  const qty = qtyOf(item.key);
  const what = item.variant ? `${item.name} (${item.variant})` : item.name;
  const fill = tone === "orange" ? "bg-orange text-ink" : "bg-ink text-paper";

  if (qty === 0) {
    return wide ? (
      <button
        type="button"
        onClick={() => add(item)}
        data-cursor="cta"
        className={`inline-flex w-full items-center justify-center gap-3 rounded-full px-5 py-3 text-[0.62rem] font-extrabold uppercase tracking-[0.22em] transition-transform duration-300 hover:-translate-y-0.5 ${fill} ${className}`}
      >
        <BagIcon />
        Add to cart
      </button>
    ) : (
      <button
        type="button"
        onClick={() => add(item)}
        aria-label={`Add ${what} to cart`}
        data-cursor="cta"
        className={`grid size-7 shrink-0 place-items-center rounded-full border border-ink/20 text-ink transition-colors duration-200 hover:border-orange hover:bg-orange ${className}`}
      >
        <Plus />
      </button>
    );
  }

  const step = `grid shrink-0 place-items-center rounded-full transition-colors duration-200 hover:bg-white/20 ${
    wide ? "size-8" : "size-6"
  }`;

  return (
    <span
      role="group"
      aria-label={`${what} in cart`}
      className={`inline-flex shrink-0 items-center rounded-full ${fill} ${
        wide ? "w-full justify-between px-2 py-1.5" : "p-0.5"
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setQty(item.key, qty - 1)}
        aria-label={qty === 1 ? `Remove ${what}` : `One less ${what}`}
        className={step}
      >
        <Minus />
      </button>
      <span
        aria-live="polite"
        className={`text-center font-display font-black tabular-nums ${
          wide ? "text-[0.65rem] uppercase tracking-[0.18em]" : "min-w-5 text-xs"
        }`}
      >
        {wide ? `${qty} in cart` : qty}
      </span>
      <button
        type="button"
        onClick={() => add(item)}
        aria-label={`One more ${what}`}
        className={step}
      >
        <Plus />
      </button>
    </span>
  );
}
