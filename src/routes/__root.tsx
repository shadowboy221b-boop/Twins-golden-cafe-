import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider, useCart } from "../lib/cart";

// The cart drawer — dialog, checkout form, payment step — is fetched once the
// page has settled, or at once if something is already in the cart. None of
// it is needed to show a page, so it stays out of the first download.
const CartDrawer = lazy(() =>
  import("../components/cart/CartDrawer").then((m) => ({ default: m.CartDrawer })),
);

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Site-wide defaults. Each page sets its own title and description; these
      // only show on a page that doesn't, and in link previews.
      { title: "Twin's Golden Cafe" },
      {
        name: "description",
        content:
          "Twin's Golden Cafe, Arani — pizza, burgers, momos, kunafa, shakes and fresh juices, cooked to order.",
      },
      { name: "author", content: "Twin's Golden Cafe" },
      // proves to Search Console that the cafe owns this domain; safe to publish
      {
        name: "google-site-verification",
        content: "b8HaQmi_waXgSACdPdUtgvKuXE1Flzl2u_TRIDVoASk",
      },
      { property: "og:site_name", content: "Twin's Golden Cafe" },
      { property: "og:title", content: "Twin's Golden Cafe" },
      {
        property: "og:description",
        content: "Pizza, burgers, momos, kunafa, shakes and fresh juices, cooked to order.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      // the picture WhatsApp, Facebook and Instagram show when the link is shared
      { property: "og:image", content: "https://twinsgoldencafe.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://twinsgoldencafe.com/og-image.jpg" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      // the spoon-and-fork disc from the logo: SVG where supported, ICO as the
      // fallback, and a PNG for phones saving the site to their home screen
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    // the cart lives above the pages, so an order survives moving between them
    <CartProvider>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <LazyCart />
    </CartProvider>
  );
}

/** Loads the cart drawer when the browser is idle, or straight away once the cart has something in it. */
function LazyCart() {
  const { count } = useCart();
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout: 3000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setIdle(true), 1500);
    return () => window.clearTimeout(id);
  }, []);

  if (!idle && count === 0) return null;
  return (
    <Suspense fallback={null}>
      <CartDrawer />
    </Suspense>
  );
}
