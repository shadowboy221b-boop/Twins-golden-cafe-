import { useEffect, useRef, useState } from "react";

/**
 * The camera, live, inside the page.
 *
 * A file input with `capture` opens the camera on most phones but still lets
 * somebody reach into the gallery and hand over a photograph taken last week
 * — which is exactly what attendance proof must not allow. This takes the
 * frame itself: what is saved is what the lens saw when the button was
 * pressed, and there is no way to hand it anything else.
 *
 * The stream is stopped whenever this closes, so the camera light never stays
 * on after a check-in.
 */

const MAX_EDGE = 480;
const QUALITY = 0.62;

export function Camera({
  title,
  onShot,
  onSkip,
  onClose,
}: {
  title: string;
  /** the captured frame, as a small JPEG data URL */
  onShot: (image: string) => void;
  /** a way through when the camera will not open at all */
  onSkip: () => void;
  onClose: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;

    const open = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        if (!live) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.current = media;
        if (video.current) {
          video.current.srcObject = media;
          await video.current.play();
        }
        setReady(true);
      } catch {
        // refused, in use, or a laptop with no camera at all
        setError("The camera did not open. Allow camera access for this site, then try again.");
      }
    };

    void open();

    return () => {
      live = false;
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
    };
  }, []);

  const shoot = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;

    const scale = Math.min(1, MAX_EDGE / Math.max(v.videoWidth, v.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(v.videoWidth * scale);
    canvas.height = Math.round(v.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

    onShot(canvas.toDataURL("image/jpeg", QUALITY));
  };

  return (
    <div
      role="dialog"
      aria-label={title}
      className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-5"
    >
      <div className="w-full max-w-sm">
        <p className="text-center text-[0.6rem] font-extrabold uppercase tracking-[0.24em] text-orange">
          {title}
        </p>

        <div className="mt-4 aspect-square w-full overflow-hidden rounded-3xl border border-paper/15 bg-ink">
          {/* mirrored, because a face that moves the wrong way is unnerving */}
          <video ref={video} playsInline muted className="size-full -scale-x-100 object-cover" />
        </div>

        {error ? (
          <>
            <p className="mt-4 text-center text-sm text-red-300">{error}</p>
            <button
              type="button"
              onClick={onSkip}
              className="mt-4 w-full rounded-full bg-orange px-6 py-3.5 text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-ink"
            >
              Check in without a photo
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={shoot}
            disabled={!ready}
            className="mt-5 w-full rounded-full bg-leaf px-6 py-4 text-[0.65rem] font-extrabold uppercase tracking-[0.22em] text-paper transition-transform duration-200 active:scale-95 disabled:opacity-50"
          >
            {ready ? "Take the photo" : "Opening the camera…"}
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-3 text-[0.58rem] font-extrabold uppercase tracking-[0.2em] text-paper/45"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
