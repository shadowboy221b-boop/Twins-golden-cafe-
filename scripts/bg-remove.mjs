/**
 * Background removal for the new product photos.
 *
 * The native ONNX runtime won't load on this machine (missing system DLL), so
 * the model runs in the browser instead: this server hands a page the source
 * images, the page cuts them out with WebAssembly, and posts the PNGs back
 * here to be written into src/assets.
 *
 *   node scripts/bg-remove.mjs      then open http://localhost:8099
 */
import { createServer } from "node:http";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, extname } from "node:path";

const DIR = "src/assets";
const PORT = 8099;

const sources = (await readdir(DIR)).filter((f) => /\.jpe?g$/i.test(f));
console.log(`${sources.length} source images:`);
sources.forEach((s) => console.log("  " + s));

const PAGE = `<!doctype html>
<meta charset="utf-8">
<title>Cutting out</title>
<style>
  body { font: 14px system-ui; background: #111; color: #eee; padding: 24px; }
  li { margin: 6px 0; }
  .done { color: #7bd88f; }
  .err { color: #ff6b6b; }
</style>
<h1>Removing backgrounds…</h1>
<ol id="log"></ol>
<script type="module">
  import { removeBackground } from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm";

  const files = ${JSON.stringify(sources)};
  const log = document.getElementById("log");
  const line = (t) => { const li = document.createElement("li"); li.textContent = t; log.appendChild(li); return li; };

  window.__done = 0;
  window.__failed = [];

  for (const f of files) {
    const li = line(f + " — working…");
    try {
      const blob = await removeBackground("/img/" + encodeURIComponent(f), {
        // Left unset, the library looks for its model next to the page — i.e.
        // on this server, which answers with HTML. Point it at imgly's own
        // data host, pinned to the same version as the script.
        publicPath: "https://staticimgly.com/@imgly/background-removal-data/1.5.5/dist/",
        output: { format: "image/png", quality: 1 },
      });
      const buf = await blob.arrayBuffer();
      await fetch("/save/" + encodeURIComponent(f), { method: "POST", body: buf });
      li.textContent = f + " — done (" + Math.round(buf.byteLength / 1024) + " kb)";
      li.className = "done";
      window.__done++;
    } catch (e) {
      li.textContent = f + " — FAILED: " + e.message;
      li.className = "err";
      window.__failed.push(f + ": " + e.message);
    }
  }
  line("ALL FINISHED");
  window.__finished = true;
</script>`;

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url ?? "/");

  if (url === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(PAGE);
  }

  if (url.startsWith("/img/")) {
    const name = url.slice("/img/".length);
    if (!sources.includes(name)) return res.writeHead(404).end();
    const body = await readFile(join(DIR, name));
    res.writeHead(200, { "content-type": "image/jpeg" });
    return res.end(body);
  }

  if (url.startsWith("/save/") && req.method === "POST") {
    const name = url.slice("/save/".length);
    if (!sources.includes(name)) return res.writeHead(404).end();
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const out = join(DIR, "cut-" + name.replace(extname(name), "") + ".png");
    await writeFile(out, Buffer.concat(chunks));
    console.log("wrote " + out);
    res.writeHead(200).end("ok");
    return;
  }

  res.writeHead(404).end();
}).listen(PORT, () => console.log(`\nopen http://localhost:${PORT}`));
