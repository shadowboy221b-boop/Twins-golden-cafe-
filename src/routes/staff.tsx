import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

/**
 * The office: attendance and the customer book.
 *
 * Kept out of the sitemap, out of the navigation and out of Google, and it
 * shows nothing at all until somebody signs in — the database's own rules,
 * not this page, decide who may read what.
 *
 * The whole thing is a lazy chunk. Firebase is a quarter of a megabyte and no
 * guest reading the menu should ever download it.
 */

const Office = lazy(() =>
  import("@/components/office/Office").then((m) => ({ default: m.Office })),
);

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff — Twin's Golden Cafe" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  return (
    <main className="min-h-dvh bg-ink text-paper">
      <Suspense
        fallback={
          <p className="px-6 py-24 text-center text-[0.6rem] font-extrabold uppercase tracking-[0.28em] text-paper/50">
            Loading…
          </p>
        }
      >
        <Office />
      </Suspense>
    </main>
  );
}
