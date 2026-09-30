import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  attendanceForMonth,
  attendancePhoto,
  canSeeTheBooks,
  clockNow,
  customersFrom,
  deletePhotosBefore,
  hoursBetween,
  listStaff,
  monthKey,
  photoCounts,
  recentOrders,
  removeStaff,
  saveAttendancePhoto,
  saveStaff,
  setAttendance,
  signIn,
  signOutOffice,
  todayKey,
  watchUser,
  type Attendance,
  type Customer,
  type Mark,
  type Order,
  type PhotoKind,
  type Staff,
} from "@/lib/office";
import { CAFE } from "@/data/site";
import { Camera } from "@/components/office/Camera";

/**
 * The counter's office, in one page: who is working today, the month's sheet,
 * and the people who have been ordering.
 *
 * It is built for a phone on the counter as much as for a laptop — the
 * check-in buttons are the size of a thumb, and the month sheet scrolls
 * sideways rather than shrinking to nothing.
 */

const COUNTER_TABS = ["Today", "Month"] as const;
const OWNER_TABS = ["Today", "Month", "Customers", "Orders", "Staff"] as const;
type Tab = (typeof OWNER_TABS)[number];

const MARKS: { id: Mark; label: string; tone: string }[] = [
  { id: "present", label: "Present", tone: "bg-leaf text-paper" },
  { id: "half", label: "Half day", tone: "bg-orange text-ink" },
  { id: "leave", label: "Leave", tone: "bg-paper/25 text-paper" },
  { id: "absent", label: "Absent", tone: "bg-red-700 text-paper" },
];

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const card = "rounded-2xl border border-paper/12 bg-paper/[0.04] p-4";
const btn =
  "rounded-full px-4 py-2.5 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] transition-transform duration-200 active:scale-95";
const input =
  "w-full rounded-xl border border-paper/15 bg-ink px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-paper/35 focus-visible:border-orange";

export function Office() {
  const [who, setWho] = useState<{ uid: string; email: string } | null | undefined>(undefined);
  /** undefined while the database is being asked what this account may see */
  const [owner, setOwner] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let stop: (() => void) | undefined;
    void watchUser(setWho).then((unsub) => {
      stop = unsub;
    });
    return () => stop?.();
  }, []);

  useEffect(() => {
    if (!who) {
      setOwner(undefined);
      return;
    }
    let live = true;
    void canSeeTheBooks().then((can) => {
      if (live) setOwner(can);
    });
    return () => {
      live = false;
    };
  }, [who]);

  if (who === undefined) return <Centre>Checking…</Centre>;
  if (who === null) return <SignIn />;
  if (owner === undefined) return <Centre>Opening the office…</Centre>;
  return <Desk email={who.email} owner={owner} />;
}

function Centre({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-6 py-24 text-center text-[0.6rem] font-extrabold uppercase tracking-[0.28em] text-paper/50">
      {children}
    </p>
  );
}

/* ------------------------------------------------------------- sign in */

function SignIn() {
  const [who, setWho] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(who, pass);
    } catch {
      // the same message either way: never tell a stranger which half was wrong
      setError("That email and password did not work.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.28em] text-orange">
        {CAFE.name}
      </p>
      <h1 className="mt-3 font-display text-3xl font-black uppercase tracking-[-0.02em]">
        Staff sign in
      </h1>
      <p className="mt-2 text-sm text-paper/55">
        For the counter and the office. Nothing here is public.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <input
          type="email"
          autoComplete="username"
          required
          value={who}
          onChange={(e) => setWho(e.target.value)}
          placeholder="Email"
          className={input}
        />
        <input
          type="password"
          autoComplete="current-password"
          required
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Password"
          className={input}
        />
        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className={`${btn} w-full bg-orange py-3.5 text-ink disabled:opacity-60`}
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

/* ---------------------------------------------------------------- desk */

function Desk({ email, owner }: { email: string; owner: boolean }) {
  const tabs = owner ? OWNER_TABS : COUNTER_TABS;
  const [tab, setTab] = useState<Tab>("Today");
  const [staff, setStaff] = useState<Staff[]>([]);
  const [month, setMonth] = useState(monthKey());
  const [marks, setMarks] = useState<Attendance[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  /** whose mark is being written right now, so the row can say so */
  const [busy, setBusy] = useState<string | null>(null);
  /** the photograph being looked at, if any */
  const [photo, setPhoto] = useState<{ name: string; kind: PhotoKind; image: string } | null>(null);

  const today = todayKey();

  const loadCore = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [people, sheet] = await Promise.all([listStaff(), attendanceForMonth(month)]);
      setStaff(people);
      setMarks(sheet);
    } catch {
      setError("Could not reach the database. Check the connection and the Firebase rules.");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  // the customer book is only fetched when it is opened: it is the heaviest
  // read, and the counter device is not allowed to make it at all
  useEffect(() => {
    if (!owner) return;
    if (tab !== "Customers" && tab !== "Orders") return;
    if (orders.length) return;
    void recentOrders()
      .then(setOrders)
      .catch(() => setError("Orders are not readable by this account."));
  }, [tab, orders.length, owner]);

  const todaysMarks = useMemo(() => marks.filter((m) => m.date === today), [marks, today]);
  const customers = useMemo(() => customersFrom(orders), [orders]);

  const mark = async (entry: Omit<Attendance, "id">) => {
    const id = `${entry.date}_${entry.staffId}`;
    // shown at once, then written: a counter with a slow connection should
    // never look like it lost the tap
    setMarks((prev) => [...prev.filter((m) => m.id !== id), { ...entry, id }]);
    try {
      await setAttendance(entry);
    } catch (err) {
      // "permission-denied" means the rules refused it, which is worth saying
      // plainly: it is a setting to fix, not a tap to repeat.
      const denied = err instanceof Error && /permission|insufficient/i.test(err.message);
      setError(
        denied
          ? "The database refused that. Check the Firestore rules are the current ones."
          : "That did not save — check the connection and try again.",
      );
      void loadCore();
    }
  };

  /**
   * A check-in or check-out, with the photograph that proves it.
   *
   * The mark is written first and the picture after: if the photograph fails
   * to save, the shift is still recorded — the record of who worked matters
   * more than the proof of it.
   */
  const shift = async (
    staffId: string,
    entry: Omit<Attendance, "id">,
    kind: PhotoKind,
    image: string | null,
  ) => {
    setBusy(staffId);
    try {
      await mark(entry);
      if (image) {
        await saveAttendancePhoto(`${entry.date}_${staffId}`, kind, image, staffId, entry.date);
      }
    } catch (err) {
      // the usual reason is rules that do not know about photographs yet, and
      // saying so beats "something went wrong"
      const denied = err instanceof Error && /permission|insufficient/i.test(err.message);
      setError(
        denied
          ? "The check-in saved, but the photograph was refused — the Firestore rules do not allow attendancePhotos yet."
          : "The check-in saved, but the photograph did not.",
      );
    } finally {
      setBusy(null);
    }
  };

  /** Fetch a stored photograph and put it on screen. */
  const seePhoto = (attendanceId: string, kind: PhotoKind, name: string) => {
    void attendancePhoto(attendanceId, kind)
      .then((image) => {
        if (image) setPhoto({ name, kind, image });
        else setError("That photograph is not there any more.");
      })
      .catch(() => setError("Could not open that photograph."));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-8">
      {photo && (
        <div
          role="dialog"
          aria-label={`${photo.name}, checked ${photo.kind}`}
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-6"
          onClick={() => setPhoto(null)}
        >
          <figure className="max-w-sm">
            <img
              src={photo.image}
              alt={`${photo.name} at check ${photo.kind}`}
              className="w-full rounded-2xl"
            />
            <figcaption className="mt-3 text-center text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-paper/60">
              {photo.name} · checked {photo.kind} · tap to close
            </figcaption>
          </figure>
        </div>
      )}

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.28em] text-orange">
            {CAFE.name} · office
          </p>
          <h1 className="mt-1 font-display text-2xl font-black uppercase tracking-[-0.02em]">
            {tab}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-paper/45 sm:inline">{email}</span>
          <button
            type="button"
            onClick={() => void signOutOffice()}
            className={`${btn} border border-paper/20`}
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="scrollbar-none mt-5 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              // a message about the last tab must not follow you to the next
              setError("");
              setTab(t);
            }}
            className={`${btn} shrink-0 ${
              tab === t ? "bg-orange text-ink" : "border border-paper/15 text-paper/70"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {error && (
        <p className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <Centre>Loading…</Centre>
      ) : (
        <div className="mt-6">
          {tab === "Today" && (
            <TodaySheet
              staff={staff}
              marks={todaysMarks}
              date={today}
              owner={owner}
              busy={busy}
              onShift={shift}
              onSeePhoto={seePhoto}
              onMark={mark}
            />
          )}
          {tab === "Month" && (
            <MonthSheet staff={staff} marks={marks} month={month} onMonth={setMonth} />
          )}
          {tab === "Customers" && <Customers rows={customers} />}
          {tab === "Orders" && <Orders rows={orders} />}
          {tab === "Staff" && <StaffList staff={staff} onChanged={() => void loadCore()} />}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- today */

/**
 * A button that opens the camera and hands back the photograph.
 *
 * On a phone this is the camera itself, because of `capture`; on a laptop it
 * is the file picker, which is the honest fallback. Backing out of the camera
 * is not a check-in: nothing is written until there is a picture.
 */
function PhotoButton({
  label,
  title,
  className,
  onPhoto,
}: {
  label: string;
  /** what the camera sheet says it is for: "Karthik · checking in" */
  title: string;
  className: string;
  onPhoto: (image: string | null) => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <Camera
          title={title}
          onShot={(image) => {
            setOpen(false);
            void onPhoto(image);
          }}
          // a camera that will not open must not cost somebody their shift
          onSkip={() => {
            setOpen(false);
            void onPhoto(null);
          }}
          onClose={() => setOpen(false)}
        />
      )}
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
    </>
  );
}

function TodaySheet({
  staff,
  marks,
  date,
  owner,
  busy,
  onShift,
  onSeePhoto,
  onMark,
}: {
  staff: Staff[];
  marks: Attendance[];
  date: string;
  /** the owner can correct a mark; the counter can only check in and out */
  owner: boolean;
  /** the person whose mark is being written right now */
  busy: string | null;
  onShift: (
    staffId: string,
    entry: Omit<Attendance, "id">,
    kind: PhotoKind,
    image: string | null,
  ) => Promise<void>;
  onSeePhoto: (attendanceId: string, kind: PhotoKind, name: string) => void;
  onMark: (entry: Omit<Attendance, "id">) => Promise<void>;
}) {
  const active = staff.filter((s) => s.active);
  if (active.length === 0) {
    return (
      <p className="text-sm text-paper/60">
        {owner ? (
          <>
            No staff yet. Add them on the <strong className="text-paper">Staff</strong> tab, then
            they can check in here.
          </>
        ) : (
          // the counter cannot add anyone, so it is not told to
          <>Nobody on the list yet. The owner adds the team, then it appears here.</>
        )}
      </p>
    );
  }

  const present = marks.filter((m) => m.mark === "present" || m.mark === "half").length;

  return (
    <>
      <p className="text-sm text-paper/55">
        {new Date(date).toLocaleDateString("en-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}{" "}
        · {present} of {active.length} in
      </p>

      <ul className="mt-5 space-y-3">
        {active.map((person) => {
          const entry = marks.find((m) => m.staffId === person.id);
          const hours = hoursBetween(entry?.inAt, entry?.outAt);

          return (
            <li key={person.id} className={card}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-black uppercase tracking-[-0.01em]">
                    {person.name}
                  </p>
                  <p className="mt-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-paper/45">
                    {person.role || "Staff"}
                    {entry?.inAt && ` · in ${entry.inAt}`}
                    {entry?.outAt && ` · out ${entry.outAt}`}
                    {hours > 0 && ` · ${hours} h`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {busy === person.id && (
                    <span className="text-[0.55rem] font-extrabold uppercase tracking-[0.18em] text-paper/45">
                      Saving…
                    </span>
                  )}

                  {!entry?.inAt ? (
                    <PhotoButton
                      label="Check in"
                      title={`${person.name} · checking in`}
                      className={`${btn} bg-leaf px-6 text-paper`}
                      onPhoto={(image) =>
                        onShift(
                          person.id,
                          {
                            staffId: person.id,
                            date,
                            mark: "present",
                            inAt: clockNow(),
                            photoIn: Boolean(image),
                            by: "staff",
                          },
                          "in",
                          image,
                        )
                      }
                    />
                  ) : !entry.outAt ? (
                    <PhotoButton
                      label="Check out"
                      title={`${person.name} · checking out`}
                      className={`${btn} bg-orange px-6 text-ink`}
                      onPhoto={(image) =>
                        onShift(
                          person.id,
                          {
                            ...entry,
                            outAt: clockNow(),
                            photoOut: Boolean(image),
                            by: "staff",
                          },
                          "out",
                          image,
                        )
                      }
                    />
                  ) : (
                    <span className="rounded-full border border-leaf/40 px-4 py-2.5 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-leaf">
                      Done · {hours} h
                    </span>
                  )}
                </div>
              </div>

              {/* the proof, for the owner only: the rules do not let the
                  counter read back a photograph it just took */}
              {owner && (entry?.photoIn || entry?.photoOut) && (
                <div className="mt-3 flex gap-2">
                  {entry.photoIn && (
                    <button
                      type="button"
                      onClick={() => onSeePhoto(`${date}_${person.id}`, "in", person.name)}
                      className="rounded-full border border-paper/15 px-3 py-1.5 text-[0.55rem] font-extrabold uppercase tracking-[0.16em] text-paper/60 transition-colors hover:border-orange hover:text-orange"
                    >
                      Photo · in
                    </button>
                  )}
                  {entry.photoOut && (
                    <button
                      type="button"
                      onClick={() => onSeePhoto(`${date}_${person.id}`, "out", person.name)}
                      className="rounded-full border border-paper/15 px-3 py-1.5 text-[0.55rem] font-extrabold uppercase tracking-[0.16em] text-paper/60 transition-colors hover:border-orange hover:text-orange"
                    >
                      Photo · out
                    </button>
                  )}
                </div>
              )}

              {/* The override, which is the owner's: a tap fixes a forgotten
                  or wrong mark. The counter is not shown buttons the database
                  would refuse it. */}
              {owner && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-paper/10 pt-3">
                  {MARKS.map((m) => {
                    const on = entry?.mark === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          void onMark({
                            staffId: person.id,
                            date,
                            mark: m.id,
                            ...(entry?.inAt ? { inAt: entry.inAt } : {}),
                            ...(entry?.outAt ? { outAt: entry.outAt } : {}),
                            by: "owner",
                          })
                        }
                        className={`rounded-full px-3 py-1.5 text-[0.55rem] font-extrabold uppercase tracking-[0.16em] transition-colors ${
                          on ? m.tone : "border border-paper/15 text-paper/55"
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* --------------------------------------------------------------- month */

function MonthSheet({
  staff,
  marks,
  month,
  onMonth,
}: {
  staff: Staff[];
  marks: Attendance[];
  month: string;
  onMonth: (m: string) => void;
}) {
  const days = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
  const cols = Array.from({ length: days }, (_, i) => String(i + 1).padStart(2, "0"));

  const letter: Record<Mark, string> = { present: "P", half: "½", leave: "L", absent: "A" };
  const tint: Record<Mark, string> = {
    present: "text-leaf",
    half: "text-orange",
    leave: "text-paper/45",
    absent: "text-red-400",
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="month"
          value={month}
          onChange={(e) => onMonth(e.target.value)}
          className={`${input} w-auto`}
        />
        <p className="text-xs text-paper/45">P present · ½ half day · L leave · A absent</p>
      </div>

      <div className="scrollbar-none mt-5 overflow-x-auto">
        <table className="w-max border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-ink px-3 py-2 text-left text-[0.55rem] font-extrabold uppercase tracking-[0.18em] text-paper/45">
                Staff
              </th>
              {cols.map((d) => (
                <th
                  key={d}
                  className="px-1.5 py-2 text-center text-[0.55rem] font-extrabold text-paper/40"
                >
                  {Number(d)}
                </th>
              ))}
              <th className="px-3 py-2 text-[0.55rem] font-extrabold uppercase tracking-[0.18em] text-orange">
                Days
              </th>
              <th className="px-3 py-2 text-[0.55rem] font-extrabold uppercase tracking-[0.18em] text-orange">
                Hours
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.map((person) => {
              const mine = marks.filter((m) => m.staffId === person.id);
              const worked = mine.reduce(
                (n, m) => n + (m.mark === "present" ? 1 : m.mark === "half" ? 0.5 : 0),
                0,
              );
              const hours = mine.reduce((n, m) => n + hoursBetween(m.inAt, m.outAt), 0);

              return (
                <tr key={person.id} className="border-t border-paper/10">
                  <td className="sticky left-0 z-10 whitespace-nowrap bg-ink px-3 py-2 font-semibold">
                    {person.name}
                  </td>
                  {cols.map((d) => {
                    const entry = mine.find((m) => m.date === `${month}-${d}`);
                    return (
                      <td
                        key={d}
                        title={entry?.inAt ? `${entry.inAt}–${entry.outAt ?? "…"}` : undefined}
                        className={`px-1.5 py-2 text-center font-bold ${
                          entry ? tint[entry.mark] : "text-paper/15"
                        }`}
                      >
                        {entry ? letter[entry.mark] : "·"}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center font-display font-black text-orange">
                    {worked}
                  </td>
                  <td className="px-3 py-2 text-center font-display font-black text-orange">
                    {Math.round(hours * 10) / 10}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ----------------------------------------------------------- customers */

function Customers({ rows }: { rows: Customer[] }) {
  const [q, setQ] = useState("");
  const shown = rows.filter(
    (c) => !q.trim() || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q),
  );

  if (rows.length === 0) {
    return (
      <p className="text-sm text-paper/60">
        No orders have come through the website yet. Every order placed on the site lands here, with
        the dishes and the total.
      </p>
    );
  }

  return (
    <>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a name or number…"
        className={input}
      />
      <p className="mt-3 text-xs text-paper/45">
        {shown.length} {shown.length === 1 ? "customer" : "customers"} · repeat customers first
        marked with a star
      </p>

      <ul className="mt-4 space-y-3">
        {shown.map((c) => (
          <li key={c.phone} className={card}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-display text-lg font-black uppercase tracking-[-0.01em]">
                {c.orders > 1 && <span className="mr-1.5 text-orange">★</span>}
                {c.name || "Guest"}
              </p>
              <a
                href={`https://wa.me/91${c.phone}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-bold text-orange underline-offset-4 hover:underline"
              >
                {c.phone}
              </a>
            </div>
            <p className="mt-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-paper/45">
              {c.orders} {c.orders === 1 ? "order" : "orders"} · {money(c.spent)} total
              {c.favourite && ` · likes ${c.favourite}`}
            </p>
            {c.lastAt && (
              <p className="mt-1 text-xs text-paper/40">
                Last ordered {c.lastAt.toLocaleDateString("en-IN")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

/* -------------------------------------------------------------- orders */

/**
 * What the orders add up to, over a window of days.
 *
 * Everything is counted from the orders themselves — there is no second place
 * a total is written down, so a figure here can never disagree with the list
 * underneath it. An order with no date is left out of the windows rather than
 * guessed at; it still shows in the list below.
 */
function summarise(rows: Order[], days: number) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const inWindow = rows.filter((o) => o.createdAt && o.createdAt >= since);
  const revenue = inWindow.reduce((n, o) => n + o.total, 0);

  // how many of each dish went out, by name
  const dishes = new Map<string, { qty: number; value: number }>();
  for (const o of inWindow) {
    for (const i of o.items) {
      const at = dishes.get(i.name) ?? { qty: 0, value: 0 };
      at.qty += i.qty;
      at.value += i.qty * i.price;
      dishes.set(i.name, at);
    }
  }

  return {
    orders: inWindow.length,
    revenue,
    average: inWindow.length ? Math.round(revenue / inWindow.length) : 0,
    delivery: inWindow.filter((o) => o.type === "delivery").length,
    unpaid: inWindow.filter((o) => !o.paid).length,
    top: [...dishes.entries()]
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10),
  };
}

const WINDOWS = [
  { label: "Today", days: 1 },
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
] as const;

function Orders({ rows }: { rows: Order[] }) {
  const [days, setDays] = useState<number>(1);

  if (rows.length === 0) {
    return <p className="text-sm text-paper/60">No orders yet.</p>;
  }

  const s = summarise(rows, days);
  const undated = rows.filter((o) => !o.createdAt).length;
  const busiest = Math.max(1, ...s.top.map((t) => t.qty));

  return (
    <>
      {/* ------------------------------------------------- the numbers */}
      <div className="flex flex-wrap gap-2">
        {WINDOWS.map((w) => (
          <button
            key={w.days}
            type="button"
            onClick={() => setDays(w.days)}
            className={`rounded-full px-4 py-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] transition-colors ${
              days === w.days
                ? "bg-orange text-ink"
                : "border border-paper/15 text-paper/70 hover:text-paper"
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { v: money(s.revenue), l: "Taken" },
          { v: String(s.orders), l: "Orders" },
          { v: s.orders ? money(s.average) : "—", l: "Average bill" },
          { v: `${s.delivery}/${s.orders}`, l: "Delivery" },
        ].map((k) => (
          <div key={k.l} className={card}>
            <dt className="font-display text-2xl font-black tracking-[-0.02em] text-orange">
              {k.v}
            </dt>
            <dd className="mt-1 text-[0.55rem] font-extrabold uppercase tracking-[0.2em] text-paper/45">
              {k.l}
            </dd>
          </div>
        ))}
      </dl>

      {s.unpaid > 0 && (
        <p className="mt-3 text-xs font-bold text-orange">
          {s.unpaid} {s.unpaid === 1 ? "order is" : "orders are"} still marked unpaid.
        </p>
      )}
      {undated > 0 && (
        <p className="mt-1 text-xs text-paper/40">
          {undated} older {undated === 1 ? "order has" : "orders have"} no date and are counted only
          in the list below.
        </p>
      )}

      {/* ------------------------------------------------ what sold */}
      {s.top.length > 0 && (
        <div className="mt-8">
          <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.24em] text-paper/45">
            What sold · {WINDOWS.find((w) => w.days === days)?.label.toLowerCase()}
          </p>
          <ul className="mt-3 space-y-1.5">
            {s.top.map((t) => (
              <li key={t.name} className="flex items-center gap-3">
                <span className="w-7 shrink-0 text-right font-display text-sm font-extrabold tabular-nums text-orange">
                  {t.qty}
                </span>
                {/* the bar is the count against the day's best seller */}
                <span className="relative h-5 min-w-0 flex-1 overflow-hidden rounded-md bg-paper/[0.06]">
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 rounded-md bg-orange/25"
                    style={{ width: `${(t.qty / busiest) * 100}%` }}
                  />
                  <span className="relative block truncate px-2 py-0.5 text-xs text-paper/80">
                    {t.name}
                  </span>
                </span>
                <span className="shrink-0 text-xs tabular-nums text-paper/50">
                  {money(t.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-9 text-[0.55rem] font-extrabold uppercase tracking-[0.24em] text-paper/45">
        Every order
      </p>

      <ul className="mt-3 space-y-3">
        {rows.map((o) => (
          <li key={o.orderNo} className={card}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <p className="font-display text-base font-black uppercase tracking-[-0.01em]">
                {o.name || "Guest"} · {money(o.total)}
              </p>
              <p className="text-[0.55rem] font-extrabold uppercase tracking-[0.18em] text-paper/45">
                {o.orderNo} · {o.createdAt ? o.createdAt.toLocaleString("en-IN") : "—"}
              </p>
            </div>
            <p className="mt-1.5 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-orange">
              {o.type === "delivery" ? "Delivery" : "Pickup"} · {o.payment}
              {o.paid ? " · paid" : ""}
            </p>
            <ul className="mt-2 space-y-0.5 text-sm text-paper/70">
              {o.items.map((i, n) => (
                <li key={`${o.orderNo}-${n}`}>
                  {i.qty} × {i.name} — {money(i.qty * i.price)}
                </li>
              ))}
            </ul>
            {o.address && <p className="mt-2 text-xs text-paper/50">{o.address}</p>}
            {o.notes && <p className="mt-1 text-xs italic text-paper/50">“{o.notes}”</p>}
            <a
              href={`https://wa.me/91${o.phone}`}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-block text-sm font-bold text-orange underline-offset-4 hover:underline"
            >
              WhatsApp {o.phone}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/* --------------------------------------------------------------- staff */

function StaffList({ staff, onChanged }: { staff: Staff[]; onChanged: () => void }) {
  const [draft, setDraft] = useState({ name: "", role: "", phone: "" });
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setBusy(true);
    try {
      await saveStaff({ ...draft, active: true });
      setDraft({ name: "", role: "", phone: "" });
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <form onSubmit={add} className={`${card} space-y-3`}>
        <p className="font-display text-sm font-black uppercase tracking-[0.02em]">Add someone</p>
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Name"
          className={input}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={draft.role}
            onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            placeholder="Kitchen, counter, delivery…"
            className={input}
          />
          <input
            value={draft.phone}
            onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            inputMode="tel"
            placeholder="Phone (optional)"
            className={input}
          />
        </div>
        <button type="submit" disabled={busy} className={`${btn} bg-orange text-ink`}>
          {busy ? "Saving…" : "Add to the team"}
        </button>
      </form>

      <ul className="mt-5 space-y-3">
        {staff.map((person) => (
          <li
            key={person.id}
            className={`${card} flex flex-wrap items-center justify-between gap-3`}
          >
            <div>
              <p className="font-display text-base font-black uppercase tracking-[-0.01em]">
                {person.name}
              </p>
              <p className="mt-0.5 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-paper/45">
                {person.role || "Staff"}
                {person.phone && ` · ${person.phone}`}
                {!person.active && " · not working"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  await saveStaff({ ...person, active: !person.active });
                  onChanged();
                }}
                className={`${btn} border border-paper/20`}
              >
                {person.active ? "Set inactive" : "Set active"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  // attendance already written stays: this only takes them off the list
                  if (!window.confirm(`Remove ${person.name} from the staff list?`)) return;
                  await removeStaff(person.id);
                  onChanged();
                }}
                className={`${btn} border border-red-500/40 text-red-300`}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <PhotoStore />
    </>
  );
}

/* --------------------------------------------------------- photo store */

/** A date some months back, as "2026-04-01". */
function monthsAgo(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return todayKey(d);
}

/**
 * What the check-in photographs are taking up, and how to be rid of the old
 * ones.
 *
 * Attendance itself is never touched — the hours, the marks and the month's
 * totals stay whatever they were. This clears out the pictures, which are
 * proof for the weeks somebody might still argue about and dead weight after
 * that. About forty kilobytes each, and the free plan holds a gigabyte, so
 * this is housekeeping rather than an emergency.
 */
function PhotoStore() {
  const [counts, setCounts] = useState<{ total: number; before: (d: string) => number } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  const load = useCallback(() => {
    void photoCounts()
      .then(setCounts)
      .catch(() => setCounts(null));
  }, []);

  useEffect(load, [load]);

  if (!counts || counts.total === 0) return null;

  const mb = (n: number) => `${Math.round((n * 40) / 102.4) / 10} MB`;

  const clear = async (label: string, cutoff: string) => {
    const n = counts.before(cutoff);
    if (n === 0) {
      setDone(`Nothing older than ${label}.`);
      return;
    }
    if (
      !window.confirm(
        `Delete ${n} ${n === 1 ? "photograph" : "photographs"} older than ${label}? The attendance itself stays.`,
      )
    )
      return;

    setBusy(true);
    setDone("");
    try {
      const removed = await deletePhotosBefore(cutoff);
      setDone(`${removed} ${removed === 1 ? "photograph" : "photographs"} deleted.`);
      load();
    } catch {
      setDone("Could not delete them. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const options = [
    { label: "3 months", cutoff: monthsAgo(3) },
    { label: "6 months", cutoff: monthsAgo(6) },
    { label: "a year", cutoff: monthsAgo(12) },
  ];

  return (
    <div className={`${card} mt-6`}>
      <p className="font-display text-sm font-black uppercase tracking-[0.02em]">
        Check-in photographs
      </p>
      <p className="mt-2 text-sm text-paper/60">
        {counts.total} kept · about {mb(counts.total)} of the free gigabyte. Deleting them leaves
        every hour and every mark exactly where it is.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.label}
            type="button"
            disabled={busy}
            onClick={() => void clear(o.label, o.cutoff)}
            className={`${btn} border border-paper/20 disabled:opacity-50`}
          >
            Delete older than {o.label}
          </button>
        ))}
      </div>

      {(busy || done) && <p className="mt-3 text-xs text-paper/55">{busy ? "Deleting…" : done}</p>}
    </div>
  );
}
