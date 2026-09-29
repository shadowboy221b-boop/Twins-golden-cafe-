import type { CartLine } from "@/lib/cart";
import { db } from "@/lib/firebase";

/**
 * Filing a copy of an order.
 *
 * The order itself goes to WhatsApp, as it always has. This writes the same
 * thing to the cafe's own database so the office pages can show who ordered
 * what, and so a regular customer can be recognised as one.
 *
 * Three rules hold here:
 *
 *  - It never blocks the order. The write is started and forgotten; if
 *    Firebase is slow, blocked or misconfigured, WhatsApp still opens with the
 *    order in it. A failed write costs the cafe a record, not a sale.
 *  - It runs after the guest has pressed send, and only then — so no page load
 *    ever pays for the database library.
 *  - It stores what the cafe already receives on WhatsApp and nothing more: a
 *    name, a number, an address if it is being delivered to, the dishes, and
 *    the money. No payment details ever touch it.
 */

export type LoggedOrder = {
  orderNo: string;
  name: string;
  /** ten digits, the way the cafe dials it */
  phone: string;
  type: "pickup" | "delivery";
  when: string;
  address?: string;
  landmark?: string;
  notes?: string;
  payment: string;
  paid: boolean;
  total: number;
  lines: CartLine[];
};

export function logOrder(order: LoggedOrder) {
  void write(order).catch(() => {
    // deliberately silent: the order is already on its way to WhatsApp
  });
}

async function write(order: LoggedOrder) {
  if (typeof window === "undefined") return;
  const { store, lib } = await db();

  await lib.setDoc(lib.doc(store, "orders", order.orderNo), {
    orderNo: order.orderNo,
    name: order.name.trim().slice(0, 80),
    phone: order.phone,
    type: order.type,
    when: order.when,
    ...(order.address ? { address: order.address.trim().slice(0, 300) } : {}),
    ...(order.landmark ? { landmark: order.landmark.trim().slice(0, 120) } : {}),
    ...(order.notes ? { notes: order.notes.trim().slice(0, 300) } : {}),
    payment: order.payment,
    paid: order.paid,
    total: order.total,
    itemCount: order.lines.reduce((n, l) => n + l.qty, 0),
    items: order.lines.slice(0, 60).map((l) => ({
      name: l.variant ? `${l.name} (${l.variant})` : l.name,
      qty: l.qty,
      price: l.price,
    })),
    // the server's clock, not the guest's phone, which may be set to anything
    createdAt: lib.serverTimestamp(),
    source: "website",
  });
}
