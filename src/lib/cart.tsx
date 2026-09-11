import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** One thing you can put in the cart. `variant` is the way it's served (steam / fried). */
export type CartItem = {
  key: string;
  name: string;
  variant?: string | undefined;
  price: number;
  veg?: boolean | undefined;
};

export type CartLine = CartItem & { qty: number };

type Cart = {
  lines: CartLine[];
  count: number;
  total: number;
  qtyOf: (key: string) => number;
  add: (item: CartItem) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  /** goes up by one on every add, so the cart button can give a little bounce */
  bumps: number;
};

const STORAGE_KEY = "tgc-cart-v1";
const MAX_QTY = 50;

const CartContext = createContext<Cart | null>(null);

/** A stable id for a dish: its counter, its name, and how it's served. */
export const itemKey = (group: string, name: string, variant?: string) =>
  [group, name, variant ?? ""].join("|");

function isLine(v: unknown): v is CartLine {
  if (!v || typeof v !== "object") return false;
  const l = v as Record<string, unknown>;
  return (
    typeof l["key"] === "string" &&
    typeof l["name"] === "string" &&
    typeof l["price"] === "number" &&
    typeof l["qty"] === "number" &&
    l["qty"] > 0
  );
}

/**
 * The order being built, shared by every page. It is kept in the browser, so a
 * guest can wander from the menu to the combos and back without losing it.
 * The cart starts empty on the server and fills in once the page is running,
 * which keeps the first render identical on both sides.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [bumps, setBumps] = useState(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setLines(parsed.filter(isLine));
    } catch {
      // storage blocked or unreadable: start with an empty cart
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage blocked: the cart still works for this visit
    }
  }, [lines, loaded]);

  const add = useCallback((item: CartItem) => {
    setLines((prev) =>
      prev.some((l) => l.key === item.key)
        ? prev.map((l) => (l.key === item.key ? { ...l, qty: Math.min(l.qty + 1, MAX_QTY) } : l))
        : [...prev, { ...item, qty: 1 }],
    );
    setBumps((b) => b + 1);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, MAX_QTY) } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<Cart>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      total: lines.reduce((n, l) => n + l.qty * l.price, 0),
      qtyOf: (key) => lines.find((l) => l.key === key)?.qty ?? 0,
      add,
      setQty,
      clear,
      open,
      setOpen,
      bumps,
    }),
    [lines, open, bumps, add, setQty, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside <CartProvider>");
  return cart;
}
