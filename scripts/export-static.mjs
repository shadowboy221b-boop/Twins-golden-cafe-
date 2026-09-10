/**
 * Turns the production build into a plain static website.
 *
 * Hostinger Premium Web Hosting serves files only — it can't run Node. So after
 * `npm run build`, this starts the built server once, visits every page (found
 * by following links from the home page), and saves each one as HTML next to
 * the client assets:
 *
 *   dist-static/index.html
 *   dist-static/menu/index.html
 *   dist-static/404.html
 *   dist-static/.htaccess
 *   dist-static/assets/…
 *
 * That folder is exactly what goes into public_html. Every page must come back
 * 200 or the export fails — a broken page never gets published.
 *
 *   npm run build && node scripts/export-static.mjs
 */
import { spawn } from "node:child_process";
import { cp, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const SERVER_ENTRY = join(ROOT, ".output/server/index.mjs");
const CLIENT_DIR = join(ROOT, ".output/public");
const OUT = join(ROOT, "dist-static");
const PORT = Number(process.env.EXPORT_PORT ?? 4790);
const ORIGIN = `http://127.0.0.1:${PORT}`;

const exists = (p) =>
  stat(p).then(
    () => true,
    () => false,
  );

function fail(message) {
  console.error(`\n✖ ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

async function waitForServer(timeoutMs = 60_000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    try {
      const res = await fetch(`${ORIGIN}/`);
      if (res.ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  fail(`server did not answer on ${ORIGIN} within ${timeoutMs / 1000}s`);
}

/** Internal page links only: "/menu", "/about" — not assets, anchors or other sites. */
function pageLinks(html) {
  const found = new Set();
  for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/g)) {
    const href = m[1];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    const path = href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
    if (/\.[a-z0-9]+$/i.test(path)) continue; // a file, not a page
    found.add(path);
  }
  return found;
}

function fileFor(path) {
  return path === "/" ? join(OUT, "index.html") : join(OUT, path.slice(1), "index.html");
}

async function main() {
  if (!(await exists(SERVER_ENTRY))) fail("no server build found — run `npm run build` first");
  if (!(await exists(CLIENT_DIR))) fail("no client build found at .output/public");

  await rm(OUT, { recursive: true, force: true });
  await cp(CLIENT_DIR, OUT, { recursive: true });

  const server = spawn(process.execPath, [SERVER_ENTRY], {
    env: { ...process.env, PORT: String(PORT), HOST: "127.0.0.1", NITRO_PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverLog = "";
  server.stdout.on("data", (d) => (serverLog += d));
  server.stderr.on("data", (d) => (serverLog += d));

  try {
    await waitForServer();

    const queue = ["/"];
    const seen = new Set(queue);
    const written = [];

    while (queue.length) {
      const path = queue.shift();
      const res = await fetch(ORIGIN + path, { redirect: "follow" });
      const type = res.headers.get("content-type") ?? "";
      if (res.status !== 200 || !type.includes("text/html")) {
        fail(`${path} returned ${res.status} (${type || "no content-type"})\n${serverLog}`);
      }
      const html = await res.text();
      if (html.includes(`127.0.0.1:${PORT}`) || html.includes(`localhost:${PORT}`)) {
        fail(`${path} contains a link back to the local export server`);
      }

      const file = fileFor(path);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, html);
      written.push(path);

      for (const link of pageLinks(html)) {
        if (!seen.has(link)) {
          seen.add(link);
          queue.push(link);
        }
      }
    }

    // The site's own "page not found" screen, for addresses that don't exist.
    const missing = await fetch(`${ORIGIN}/__page-that-does-not-exist__`);
    if (missing.status !== 404) fail(`not-found page returned ${missing.status}, expected 404`);
    await writeFile(join(OUT, "404.html"), await missing.text());

    // Hostinger rules. Vite normally copies this from public/, but it is a
    // dotfile and the site depends on it, so make sure it is there.
    if (!(await exists(join(OUT, ".htaccess")))) {
      await cp(join(ROOT, "public/.htaccess"), join(OUT, ".htaccess"));
    }

    console.log(`\n✔ Exported ${written.length} pages to dist-static/`);
    for (const p of written) console.log(`  ${p.padEnd(10)} → ${fileFor(p).slice(OUT.length + 1)}`);
    console.log("  404        → 404.html");
    console.log("  rules      → .htaccess");
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  if (!process.exitCode) {
    console.error(err);
    process.exitCode = 1;
  }
});
