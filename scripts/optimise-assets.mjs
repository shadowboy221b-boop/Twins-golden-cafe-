/**
 * One-off: re-encode everything in src/assets as WebP.
 *
 * The source art is 1000–2700px PNG (18 MB in total) but nothing on the site
 * renders larger than about 660 CSS px, and the drifting background food is
 * only ~130px wide. Shipping the originals is what makes the site feel heavy,
 * so each image gets a display-sized WebP and a tiny one for the background
 * layer.
 *
 * Run with: node scripts/optimise-assets.mjs
 */
import { readdir, stat, writeFile } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const DIR = "src/assets";
/** longest side for the normal build of an image */
const MAX = 1200;
/** longest side for the "-sm" build used by the drifting background food */
const SMALL = 320;

const files = (await readdir(DIR)).filter((f) => /\.(png|jpe?g)$/i.test(f));

let before = 0;
let after = 0;

for (const file of files) {
  const src = join(DIR, file);
  before += (await stat(src)).size;

  const name = basename(file, extname(file));
  const img = sharp(src);
  const meta = await img.metadata();
  const longest = Math.max(meta.width ?? 0, meta.height ?? 0);

  const full = await sharp(src)
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toBuffer();
  await writeFile(join(DIR, `${name}.webp`), full);
  after += full.length;

  const small = await sharp(src)
    .resize({ width: SMALL, height: SMALL, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72, effort: 6 })
    .toBuffer();
  await writeFile(join(DIR, `${name}-sm.webp`), small);
  after += small.length;

  console.log(
    `${file.padEnd(26)} ${String(longest).padStart(5)}px  ->  ` +
      `${(full.length / 1024).toFixed(0)}kb + ${(small.length / 1024).toFixed(0)}kb`,
  );
}

console.log(
  `\ntotal ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(1)}MB`,
);
