import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import burger from "@/assets/burger-hero-sm.webp";

export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 700, damping: 40, mass: 0.25 });
  const sy = useSpring(y, { stiffness: 700, damping: 40, mass: 0.25 });

  // The burger sits upright and leans into the direction of travel, settling
  // back level when the pointer stops. A pointer that spins on its own is hard
  // to aim with; the movement should come from how you move it, not a loop.
  const vx = useVelocity(sx);
  const vy = useVelocity(sy);
  const lean = useSpring(useTransform(vx, [-2200, 2200], [20, -20]), {
    stiffness: 260,
    damping: 24,
    mass: 0.4,
  });
  const drop = useSpring(useTransform(vy, [-2200, 2200], [-8, 8]), {
    stiffness: 260,
    damping: 24,
    mass: 0.4,
  });

  const [mode, setMode] = useState<"idle" | "food" | "cta" | "view">("idle");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("cursor-none-desktop");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = (e.target as HTMLElement | null)?.closest?.("[data-cursor]");
      const v = el?.getAttribute("data-cursor");
      setMode(v === "food" || v === "cta" || v === "view" ? v : "idle");
    };
    window.addEventListener("mousemove", move);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.classList.remove("cursor-none-desktop");
    };
  }, [x, y]);

  if (!enabled) return null;

  const idle = mode === "idle";
  const size = mode === "food" ? 84 : mode === "cta" ? 60 : 72;

  return (
    <motion.div
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden lg:block"
      aria-hidden
    >
      {/* The burger — the pointer's resting state. Motion only carries the
          velocity lean; the show/hide is a plain CSS transition whose default
          state is visible, so the pointer can't end up invisible if an
          animation frame never lands. */}
      {/* the wrapper carries the size: an auto-width absolute box collapses,
          and the global `img { max-width: 100% }` would then squash the
          burger to a few pixels */}
      <motion.div
        style={{ rotate: lean, y: drop }}
        className="absolute size-9 -translate-x-1/2 -translate-y-1/2"
      >
        {/* show/hide lives here, so the lean above stays untouched by it */}
        <div
          className={`size-full transition-[transform,opacity] duration-300 ease-out ${
            idle ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        >
          <img
            src={burger}
            alt=""
            aria-hidden
            width={320}
            height={320}
            className="size-full drop-shadow-[0_4px_10px_oklch(0.175_0.008_60/0.45)]"
          />
        </div>
      </motion.div>

      {/* the ring, for anything the pointer can act on */}
      <div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-orange transition-[width,height,opacity] duration-300 ease-out"
        style={{
          width: idle ? 0 : size,
          height: idle ? 0 : size,
          opacity: idle ? 0 : 1,
          background: "oklch(0.677 0.196 46 / 12%)",
          backdropFilter: "blur(2px)",
        }}
      >
        <span className="text-[0.55rem] font-extrabold uppercase tracking-[0.28em] text-orange">
          {mode === "view" ? "View" : mode === "cta" ? "Go" : ""}
        </span>
      </div>
    </motion.div>
  );
}
