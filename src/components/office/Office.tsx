import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  attendanceForMonth,
  attendancePhoto,
  seatFor,
  attendanceForStaff,
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
  type Seat,
  type PhotoKind,
  type Staff,
} from "@/lib/office";
import { CAFE } from "@/data/site";
import { useOpenNow } from "@/components/bits";
import { Camera } from "@/components/office/Camera";
import { Embers } from "@/components/office/Embers";

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
/** a card that answers to the pointer — rows a hand actually goes for */
const liveCard =
  "rounded-2xl border border-paper/12 bg-paper/[0.04] p-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-paper/25 hover:bg-paper/[0.07]";
const eyebrow = "text-[0.55rem] font-extrabold uppercase tracking-[0.24em]";

/**
 * The clock on the wall of the office.
 *
 * It ticks because a page that records the minute somebody arrived should be
 * showing the minute it is now — a frozen time next to a Check in button
 * invites the wrong one to be written down.
 */
function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 10_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="font-display text-sm font-extrabold tabular-nums tracking-[-0.01em] text-paper/80">
      {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
    </span>
  );
}

/** Open or closed, said the same way the public header says it. */
function ShopState() {
  const open = useOpenNow(CAFE.openMinutes, CAFE.closeMinutes);
  if (open === null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${eyebrow} ${
        open ? "border-leaf/40 text-leaf" : "border-paper/20 text-paper/50"
      }`}
    >
      <span className={`size-1.5 rounded-full ${open ? "bg-leaf" : "bg-paper/40"}`} />
      {open ? `Open · till ${CAFE.closesLabel}` : `Closed · opens ${CAFE.opensLabel}`}
    </span>
  );
}
const btn =
  "rounded-full px-4 py-2.5 text-[0.6rem] font-extrabold uppercase tracking-[0.18em] transition-transform duration-200 active:scale-95";
const input =
  "w-full rounded-xl border border-paper/15 bg-ink px-4 py-3 text-sm text-paper outline-none transition-colors placeholder:text-paper/35 focus-visible:border-orange";

export function Office() {
  const [who, setWho] = useState<{ uid: string; email: string } | null | undefined>(undefined);
  /** undefined while the database is being asked which seat this account has */
  const [seat, setSeat] = useState<Seat | undefined>(undefined);

  useEffect(() => {
    let stop: (() => void) | undefined;
    void watchUser(setWho).then((unsub) => {
      stop = unsub;
    });
    return () => stop?.();
  }, []);

  useEffect(() => {
    if (!who) {
      setSeat(undefined);
      return;
    }
    let live = true;
    void seatFor(who.uid).then((s) => {
      if (live) setSeat(s);
    });
    return () => {
      live = false;
    };
  }, [who]);

  if (who === undefined) return <Centre>Checking…</Centre>;
  if (who === null) return <SignIn />;
  if (seat === undefined) return <Centre>Opening the office…</Centre>;
  // a member of staff on their own phone gets their own sheet and nothing else
  if (seat.kind === "self") return <MyShift email={who.email} me={seat.staff} />;
  return <Desk email={who.email} owner={seat.kind === "owner"} />;
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
    // the same room, lit the same way as the office behind it
    <div className="grain relative grid min-h-dvh place-items-center px-6">
      <Embers />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(50% 55% at 50% 30%, color-mix(in oklab, var(--orange) 20%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm rounded-3xl border border-paper/12 bg-paper/[0.04] p-8">
        <p className={`${eyebrow} text-orange`}>{CAFE.name}</p>
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
    // The office used to be a flat black page with two grey boxes on it. It is
    // the same room as the rest of the site, so it is lit the same way: one
    // warm glow behind the top of it, and the paper grain over everything.
    <div className="grain relative min-h-screen">
      <Embers />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-50"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--orange) 22%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-6 md:px-8">
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

        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className={`${eyebrow} text-orange`}>{CAFE.name} · office</p>
            <h1 className="mt-1.5 font-display text-3xl font-black uppercase tracking-[-0.03em] md:text-4xl">
              {tab}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <ShopState />
              <span className="inline-flex items-center gap-2 rounded-full border border-paper/15 px-2.5 py-1">
                <Clock />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden text-right text-xs leading-tight text-paper/45 sm:block">
              {/* which seat this is matters: the counter and the owner see
                  different tabs, and a wrong sign-in should be obvious */}
              <span className={`block ${eyebrow} text-paper/35`}>
                {owner ? "Owner" : "Counter"}
              </span>
              {email}
            </span>
            <button
              type="button"
              onClick={() => void signOutOffice()}
              className={`${btn} border border-paper/20 hover:border-paper/40`}
            >
              Sign out
            </button>
          </div>
        </header>

        <nav className="scrollbar-none mt-6 flex gap-2 overflow-x-auto border-b border-paper/10 pb-4">
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
                tab === t
                  ? "bg-orange text-ink shadow-[0_8px_24px_-10px_var(--orange)]"
                  : "border border-paper/15 text-paper/60 hover:border-paper/30 hover:text-paper"
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

        {/* the page used to simply stop; this closes it the way the site does */}
        <p className={`mt-16 text-center ${eyebrow} text-paper/25`}>
          {CAFE.name} · {CAFE.hoursShort} · nothing on this page is public
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ my shift */

/**
 * One member of staff, on their own phone.
 *
 * They see themselves and nobody else: today's shift with the two buttons
 * that start and end it, and the month so far so they can check their own
 * days without asking. There is no override here — a mark they got wrong is
 * the owner's to fix, which is the point of giving them their own sign-in.
 */
function MyShift({ email, me }: { email: string; me: Staff }) {
  const today = todayKey();
  const month = monthKey();

  const [marks, setMarks] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMarks(await attendanceForStaff(me.id, month));
      setError("");
    } catch {
      setError("Could not reach the database. Check the connection.");
    } finally {
      setLoading(false);
    }
  }, [me.id, month]);

  useEffect(() => {
    void load();
  }, [load]);

  const entry = marks.find((m) => m.date === today);
  const hours = hoursBetween(entry?.inAt, entry?.outAt);

  /** days worked this month, a half day counting as half */
  const worked = marks.reduce(
    (n, m) => n + (m.mark === "present" ? 1 : m.mark === "half" ? 0.5 : 0),
    0,
  );
  const monthHours = marks.reduce((n, m) => n + hoursBetween(m.inAt, m.outAt), 0);

  const punch = async (kind: PhotoKind, image: string | null) => {
    setBusy(true);
    setError("");
    const next: Omit<Attendance, "id"> = {
      staffId: me.id,
      date: today,
      mark: entry?.mark ?? "present",
      ...(kind === "in" ? { inAt: clockNow() } : { inAt: entry?.inAt ?? clockNow() }),
      ...(kind === "out" ? { outAt: clockNow() } : entry?.outAt ? { outAt: entry.outAt } : {}),
      ...(kind === "in" ? { photoIn: Boolean(image) } : { photoOut: Boolean(image) }),
      by: "staff",
    };

    try {
      await setAttendance(next);
      setMarks((prev) => [
        ...prev.filter((m) => m.date !== today),
        { ...next, id: `${today}_${me.id}` },
      ]);
      // the shift is recorded; the photograph is the extra, so it is saved
      // after and its failure is said separately
      if (image) {
        try {
          await saveAttendancePhoto(`${today}_${me.id}`, kind, image, me.id, today);
        } catch {
          setError("Your time was saved, but the photograph was not.");
        }
      }
    } catch (err) {
      const denied = err instanceof Error && /permission|insufficient/i.test(err.message);
      setError(
        denied
          ? "The database refused that. Ask the owner to publish the current Firestore rules."
          : "That did not save — check the connection and try again.",
      );
      void load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grain relative min-h-screen">
      <Embers />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] opacity-50"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--orange) 22%, transparent) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-lg px-5 pb-24 pt-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className={`${eyebrow} text-orange`}>{CAFE.name} · my shift</p>
            <h1 className="mt-1.5 font-display text-3xl font-black uppercase tracking-[-0.03em]">
              {me.name}
            </h1>
            <p className={`mt-2 ${eyebrow} text-paper/45`}>{me.role || "Staff"}</p>
          </div>
          <button
            type="button"
            onClick={() => void signOutOffice()}
            className={`${btn} border border-paper/20`}
          >
            Sign out
          </button>
        </header>

        <div className="mt-5 flex flex-wrap items-center gap-2.5">
          <ShopState />
          <span className="inline-flex items-center rounded-full border border-paper/15 px-2.5 py-1">
            <Clock />
          </span>
        </div>

        {error && (
          <p className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <Centre>Loading…</Centre>
        ) : (
          <>
            {/* ------------------------------------------------- today */}
            <section className={`mt-6 ${card} p-5`}>
              <p className={`${eyebrow} text-paper/45`}>
                {new Date(today).toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>

              <p className="mt-3 font-display text-2xl font-black uppercase tracking-[-0.02em]">
                {entry?.outAt ? "Shift done" : entry?.inAt ? "You are in" : "Not checked in yet"}
              </p>

              <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                {[
                  { v: entry?.inAt ?? "—", l: "In", tone: "text-leaf" },
                  { v: entry?.outAt ?? "—", l: "Out", tone: "text-orange" },
                  { v: hours > 0 ? `${hours} h` : "—", l: "Today", tone: "text-paper" },
                ].map((s) => (
                  <div key={s.l}>
                    <dt
                      className={`font-display text-xl font-extrabold tabular-nums ${
                        s.v === "—" ? "text-paper/25" : s.tone
                      }`}
                    >
                      {s.v}
                    </dt>
                    <dd className={`mt-0.5 ${eyebrow} text-paper/40`}>{s.l}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5">
                {busy ? (
                  <p className={`${eyebrow} text-paper/45`}>Saving…</p>
                ) : !entry?.inAt ? (
                  <PhotoButton
                    label="Check in"
                    title={`${me.name} · checking in`}
                    className={`${btn} ready-ring w-full bg-leaf py-4 text-paper`}
                    onPhoto={(image) => punch("in", image)}
                  />
                ) : !entry.outAt ? (
                  <PhotoButton
                    label="Check out"
                    title={`${me.name} · checking out`}
                    className={`${btn} w-full border border-orange py-4 text-orange`}
                    onPhoto={(image) => punch("out", image)}
                  />
                ) : (
                  <p className={`${eyebrow} text-paper/40`}>
                    Both times are in. The owner can change them if something is wrong.
                  </p>
                )}
              </div>
            </section>

            {/* ------------------------------------------------- month */}
            <section className="mt-5">
              <p className={`${eyebrow} text-paper/45`}>
                This month ·{" "}
                {new Date(`${month}-01`).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <dl className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { v: String(worked).replace(/\.0$/, ""), l: "Days worked" },
                  { v: monthHours > 0 ? `${Math.round(monthHours)} h` : "—", l: "Hours" },
                ].map((s) => (
                  <div key={s.l} className={card}>
                    <dt className="font-display text-2xl font-black text-orange">{s.v}</dt>
                    <dd className={`mt-1 ${eyebrow} text-paper/40`}>{s.l}</dd>
                  </div>
                ))}
              </dl>

              {marks.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {[...marks]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((m) => (
                      <li
                        key={m.id}
                        className="flex items-center justify-between rounded-xl border border-paper/10 px-4 py-2.5 text-sm"
                      >
                        <span className="text-paper/70">
                          {new Date(m.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span className="flex items-center gap-3 text-paper/50">
                          <span className="tabular-nums">
                            {m.inAt ?? "—"} – {m.outAt ?? "—"}
                          </span>
                          <span
                            className={`${eyebrow} ${
                              m.mark === "present"
                                ? "text-leaf"
                                : m.mark === "half"
                                  ? "text-orange"
                                  : "text-paper/40"
                            }`}
                          >
                            {m.mark}
                          </span>
                        </span>
                      </li>
                    ))}
                </ul>
              )}
            </section>
          </>
        )}

        <p className={`mt-14 text-center ${eyebrow} text-paper/25`}>{email}</p>
      </div>
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
      {/* The day, and how much of the team is in it — a count said in words
          and again as one pip per person, so a glance at the top of the page
          answers the only question the counter opens it to ask. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-sm font-extrabold uppercase tracking-[0.02em] text-paper/70">
          {new Date(date).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>

        <div className="flex items-center gap-2.5">
          <span aria-hidden className="flex items-center gap-1">
            {active.map((p, i) => (
              <span
                key={p.id}
                className={`h-1.5 w-5 rounded-full ${i < present ? "bg-leaf" : "bg-paper/15"}`}
              />
            ))}
          </span>
          <span className={`${eyebrow} ${present ? "text-leaf" : "text-paper/45"}`}>
            {present} of {active.length} in
          </span>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {active.map((person) => {
          const entry = marks.find((m) => m.staffId === person.id);
          const hours = hoursBetween(entry?.inAt, entry?.outAt);

          return (
            <li key={person.id} className={liveCard}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3.5">
                  {/* The initial, ringed in the colour of where they stand:
                      green while they are in, orange once they have gone
                      home, plain while the shift has not started. */}
                  <span
                    aria-hidden
                    className={`grid size-11 shrink-0 place-items-center rounded-full border-2 font-display text-base font-black ${
                      entry?.outAt
                        ? "border-orange/50 text-orange"
                        : entry?.inAt
                          ? "border-leaf text-leaf"
                          : "border-paper/20 text-paper/40"
                    }`}
                  >
                    {person.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-black uppercase tracking-[-0.01em]">
                      {person.name}
                    </p>
                    <p className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 ${eyebrow}`}>
                      <span className="rounded-full bg-paper/10 px-2 py-0.5 text-paper/60">
                        {person.role || "Staff"}
                      </span>
                      {entry?.inAt && <span className="text-leaf">in {entry.inAt}</span>}
                      {entry?.outAt && <span className="text-orange">out {entry.outAt}</span>}
                      {hours > 0 && <span className="text-paper/45">{hours} h</span>}
                      {!entry?.inAt && <span className="text-paper/35">not in yet</span>}
                    </p>
                  </div>
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
                      // the one thing the counter opened the page to press,
                      // breathing a ring so a glance finds it across a kitchen
                      className={`${btn} ready-ring bg-leaf px-6 text-paper`}
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

/**
 * Attaching somebody's own sign-in to their row.
 *
 * The account itself is made in the Firebase console — a browser cannot
 * create one for somebody else without signing in as them, and the owner
 * being thrown out of their own session to add a cook would be worse than
 * one trip to a console. What is pasted here is the user id that console
 * shows, which is what the database checks when that person signs in.
 */
function LoginLink({ person, onDone }: { person: Staff; onDone: () => void }) {
  const [uid, setUid] = useState(person.uid ?? "");
  const [email, setEmail] = useState(person.email ?? "");
  const [busy, setBusy] = useState(false);

  const save = async (next: { uid: string; email: string }) => {
    setBusy(true);
    try {
      await saveStaff({ ...person, ...next });
      onDone();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 w-full border-t border-paper/10 pt-4">
      <p className={`${eyebrow} text-paper/45`}>{person.name}&rsquo;s own sign-in</p>
      <p className="mt-2 text-xs leading-relaxed text-paper/50">
        Make the account in the Firebase console under{" "}
        <strong className="text-paper/70">Authentication → Users → Add user</strong>, then paste the{" "}
        <strong className="text-paper/70">User UID</strong> it shows into the second box.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Their email"
          className={input}
        />
        <input
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          placeholder="User UID from Firebase"
          className={input}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !uid.trim()}
          onClick={() => void save({ uid: uid.trim(), email: email.trim() })}
          className={`${btn} bg-orange text-ink disabled:opacity-50`}
        >
          {busy ? "Saving…" : "Save login"}
        </button>
        {person.uid && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              // the account stays in Firebase; it simply stops being this
              // person's, so their phone falls back to the counter's view
              if (!window.confirm(`Take away ${person.name}'s own sign-in?`)) return;
              void save({ uid: "", email: "" });
            }}
            className={`${btn} border border-red-500/40 text-red-300`}
          >
            Remove login
          </button>
        )}
        <button type="button" onClick={onDone} className={`${btn} border border-paper/20`}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function StaffList({ staff, onChanged }: { staff: Staff[]; onChanged: () => void }) {
  const [draft, setDraft] = useState({ name: "", role: "", phone: "" });
  const [busy, setBusy] = useState(false);
  /** whose sign-in is open for editing, if any */
  const [linking, setLinking] = useState<string | null>(null);

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
              {/* whether this person can sign in on their own phone */}
              <p className={`mt-1.5 ${eyebrow}`}>
                {person.uid ? (
                  <span className="text-leaf">Own login · {person.email || "linked"}</span>
                ) : (
                  <span className="text-paper/30">No login · counter checks them in</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setLinking(linking === person.id ? null : person.id)}
                className={`${btn} border ${
                  person.uid ? "border-leaf/40 text-leaf" : "border-paper/20"
                }`}
              >
                {person.uid ? "Change login" : "Give a login"}
              </button>
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

            {linking === person.id && (
              <LoginLink
                person={person}
                onDone={() => {
                  setLinking(null);
                  onChanged();
                }}
              />
            )}
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
