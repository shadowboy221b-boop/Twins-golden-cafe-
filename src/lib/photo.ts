/**
 * The photograph taken at check-in, made small enough to keep.
 *
 * A phone camera hands back three or four megabytes. What the cafe actually
 * needs is proof that a particular person stood at the counter at a
 * particular minute, and 480 pixels of JPEG says that as well as 4000 do — at
 * about a fiftieth of the size. Small matters here: these are kept in the
 * database itself rather than in file storage, which the free plan does not
 * include, and a document there has to stay under a megabyte.
 *
 * The work happens on the phone, before anything is sent.
 */

const MAX_EDGE = 480;
const QUALITY = 0.62;

/** A camera file, shrunk and encoded as a data URL. Rejects if it cannot be read. */
export async function shrinkPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("photo/no-canvas");
    ctx.drawImage(bitmap, 0, 0, width, height);

    const url = canvas.toDataURL("image/jpeg", QUALITY);
    // a document has to stay under a megabyte, and base64 adds a third
    if (url.length > 700_000) throw new Error("photo/too-large");
    return url;
  } finally {
    bitmap.close();
  }
}
