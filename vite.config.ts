// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },

  // Build the server for Node rather than Cloudflare. Hostinger Premium Web
  // Hosting can't run it — scripts/export-static.mjs starts it once after the
  // build, saves every page as plain HTML, and only that folder is uploaded.
  // (TanStack's built-in prerender step returns 500 through this config's
  // preview shim, while the standalone Node server renders every page fine.)
  nitro: { preset: "node" },
});
