/**
 * Builds one share picture per page.
 *
 * A link pasted into WhatsApp shows a picture, and until now every page of the
 * site showed the same one — the menu, the combos and the address all looked
 * like the same message. Each page now gets a photograph of what it is about,
 * cropped to the 1200x630 that WhatsApp, Facebook and X all expect.
 *
 * Run with `node scripts/share-images.mjs`. Sources are the photographs the
 * site already ships, so nothing new has to be shot or licensed.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const OUT = "public/share";

/** page → the photograph that says what the page is */
const IMAGES = [
  { name: "menu", src: "src/assets/pizza.webp", focus: "centre" },
  { name: "combos", src: "src/assets/loaded-fries.webp", focus: "centre" },
  { name: "about", src: "src/assets/founder-cafe.webp", focus: "attention" },
  { name: "contact", src: "public/shop-front.jpg", focus: "attention" },
];

await mkdir(OUT, { recursive: true });

for (const img of IMAGES) {
  const out = `${OUT}/${img.name}.jpg`;
  const info = await sharp(img.src)
    .resize(1200, 630, { fit: "cover", position: img.focus })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toFile(out);
  console.log(`${out.padEnd(26)} ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB`);
}
