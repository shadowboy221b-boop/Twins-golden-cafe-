import { db, firebaseAuth } from "@/lib/firebase";

/**
 * The counter's own records: who worked today, and who has been ordering.
 *
 * Everything here needs somebody signed in — the rules on the database itself
 * enforce that, not this file. Two kinds of account are expected:
 *
 *  - the owner, who can see and change everything;
 *  - the counter device, which can mark attendance and read the staff list,
 *    and cannot see a customer's number at all.
 *
 * Dates are kept as plain "2026-09-29" strings in the cafe's own day, not as
 * timestamps, because a shift belongs to a date and nobody should have to
 * think about time zones to read a month's attendance.
 */

export type Staff = {
  id: string;
  name: string;
  role: string;
  phone: string;
  active: boolean;
};

export type Mark = "present" | "half" | "leave" | "absent";

export type Attendance = {
  /** "<date>_<staffId>" */
  id: string;
  staffId: string;
  date: string;
  mark: Mark;
  /** "09:05", the cafe's own clock */
  inAt?: string;
  outAt?: string;
  note?: string;
  /** "staff" when the counter device marked it, "owner" when it was edited */
  by: string;
};

export type Order = {
  orderNo: string;
  name: string;
  phone: string;
  type: "pickup" | "delivery";
  total: number;
  itemCount: number;
  items: { name: string; qty: number; price: number }[];
  payment: string;
  paid: boolean;
  address?: string;
  notes?: string;
  createdAt: Date | null;
};

/** A customer, worked out from the orders they have placed. */
export type Customer = {
  phone: string;
  name: string;
  orders: number;
  spent: number;
  firstAt: Date | null;
  lastAt: Date | null;
  favourite: string;
};

/* ----------------------------------------------------------------- dates */

/** Today in the cafe's own day, as "2026-09-29". */
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "2026-09" — the month an attendance sheet covers. */
export function monthKey(d = new Date()): string {
  return todayKey(d).slice(0, 7);
}

/** "09:05" on the clock in the room. */
export function clockNow(d = new Date()): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Hours between two "09:05" times, to one decimal. Returns 0 if either is missing. */
export function hoursBetween(inAt?: string, outAt?: string): number {
  if (!inAt || !outAt) return 0;
  const mins = (t: string) => {
    const [h = "0", m = "0"] = t.split(":");
    return Number(h) * 60 + Number(m);
  };
  const diff = mins(outAt) - mins(inAt);
  return diff > 0 ? Math.round((diff / 60) * 10) / 10 : 0;
}

/* ------------------------------------------------------------------ auth */

export async function signIn(email: string, password: string) {
  const { auth, lib } = await firebaseAuth();
  await lib.signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signOutOffice() {
  const { auth, lib } = await firebaseAuth();
  await lib.signOut(auth);
}

/** Calls back with who is signed in, or null. Returns the unsubscribe. */
export async function watchUser(cb: (who: { uid: string; email: string } | null) => void) {
  const { auth, lib } = await firebaseAuth();
  return lib.onAuthStateChanged(auth, (user) =>
    cb(user ? { uid: user.uid, email: user.email ?? "" } : null),
  );
}

/* ----------------------------------------------------------------- staff */

export async function listStaff(): Promise<Staff[]> {
  const { store, lib } = await db();
  const snap = await lib.getDocs(lib.query(lib.collection(store, "staff"), lib.orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Staff, "id">) }));
}

export async function saveStaff(person: Omit<Staff, "id"> & { id?: string }) {
  const { store, lib } = await db();
  const id = person.id ?? lib.doc(lib.collection(store, "staff")).id;
  await lib.setDoc(
    lib.doc(store, "staff", id),
    {
      name: person.name.trim(),
      role: person.role.trim(),
      phone: person.phone.trim(),
      active: person.active,
    },
    { merge: true },
  );
  return id;
}

export async function removeStaff(id: string) {
  const { store, lib } = await db();
  await lib.deleteDoc(lib.doc(store, "staff", id));
}

/* ------------------------------------------------------------ attendance */

/** Every mark for one date. */
export async function attendanceFor(date: string): Promise<Attendance[]> {
  const { store, lib } = await db();
  const snap = await lib.getDocs(
    lib.query(lib.collection(store, "attendance"), lib.where("date", "==", date)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Attendance, "id">) }));
}

/** Every mark in a month, for the sheet and the totals. */
export async function attendanceForMonth(month: string): Promise<Attendance[]> {
  const { store, lib } = await db();
  const snap = await lib.getDocs(
    lib.query(
      lib.collection(store, "attendance"),
      lib.where("date", ">=", `${month}-01`),
      lib.where("date", "<=", `${month}-31`),
    ),
  );
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Attendance, "id">) }));
}

export async function setAttendance(
  entry: Omit<Attendance, "id"> & { id?: string },
): Promise<string> {
  const { store, lib } = await db();
  const id = entry.id ?? `${entry.date}_${entry.staffId}`;
  await lib.setDoc(
    lib.doc(store, "attendance", id),
    {
      staffId: entry.staffId,
      date: entry.date,
      mark: entry.mark,
      ...(entry.inAt ? { inAt: entry.inAt } : {}),
      ...(entry.outAt ? { outAt: entry.outAt } : {}),
      ...(entry.note ? { note: entry.note } : {}),
      by: entry.by,
    },
    { merge: true },
  );
  return id;
}

/* ------------------------------------------------------- orders and people */

/** The most recent orders, newest first. */
export async function recentOrders(max = 200): Promise<Order[]> {
  const { store, lib } = await db();
  const snap = await lib.getDocs(
    lib.query(lib.collection(store, "orders"), lib.orderBy("createdAt", "desc"), lib.limit(max)),
  );
  return snap.docs.map((d) => {
    const raw = d.data() as Record<string, unknown>;
    const at = raw["createdAt"] as { toDate?: () => Date } | undefined;
    return {
      orderNo: String(raw["orderNo"] ?? d.id),
      name: String(raw["name"] ?? ""),
      phone: String(raw["phone"] ?? ""),
      type: raw["type"] === "delivery" ? "delivery" : "pickup",
      total: Number(raw["total"] ?? 0),
      itemCount: Number(raw["itemCount"] ?? 0),
      items: Array.isArray(raw["items"]) ? (raw["items"] as Order["items"]) : [],
      payment: String(raw["payment"] ?? ""),
      paid: Boolean(raw["paid"]),
      ...(raw["address"] ? { address: String(raw["address"]) } : {}),
      ...(raw["notes"] ? { notes: String(raw["notes"]) } : {}),
      createdAt: at?.toDate ? at.toDate() : null,
    };
  });
}

/**
 * The customer list, built from the orders rather than kept separately: one
 * row per phone number, so it can never disagree with what was actually
 * ordered.
 */
export function customersFrom(orders: Order[]): Customer[] {
  const by = new Map<string, Customer & { dishes: Map<string, number> }>();

  for (const o of orders) {
    if (!o.phone) continue;
    const row = by.get(o.phone) ?? {
      phone: o.phone,
      name: o.name,
      orders: 0,
      spent: 0,
      firstAt: o.createdAt,
      lastAt: o.createdAt,
      favourite: "",
      dishes: new Map<string, number>(),
    };

    row.orders += 1;
    row.spent += o.total;
    if (o.name)
      row.name = row.lastAt && o.createdAt && o.createdAt >= row.lastAt ? o.name : row.name;
    if (o.createdAt) {
      if (!row.firstAt || o.createdAt < row.firstAt) row.firstAt = o.createdAt;
      if (!row.lastAt || o.createdAt > row.lastAt) row.lastAt = o.createdAt;
    }
    for (const item of o.items) {
      row.dishes.set(item.name, (row.dishes.get(item.name) ?? 0) + item.qty);
    }
    by.set(o.phone, row);
  }

  return [...by.values()]
    .map(({ dishes, ...row }) => ({
      ...row,
      favourite: [...dishes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "",
    }))
    .sort((a, b) => (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0));
}
