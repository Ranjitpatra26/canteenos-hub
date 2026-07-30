import { isMotionReduced } from "@/lib/motion-preference";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { UtensilsCrossed } from "lucide-react";

/**
 * Premium intro loader: animated logo mark, progress bar and drifting particles.
 * Shown once per browser session.
 */
export function IntroLoader() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("canteenos:intro") === "done") return;
    // Never block first paint for users who asked for less motion.
    if (isMotionReduced()) {
      sessionStorage.setItem("canteenos:intro", "done");
      return;
    }
    // The intro is a landing-page flourish, not an app-wide gate: showing it on
    // /login (or any deep link) covers a page the user can already interact with.
    if (window.location.pathname !== "/") {
      sessionStorage.setItem("canteenos:intro", "done");
      return;
    }
    // Hydration can land long after first paint on slow devices. Slamming a
    // full-screen overlay over live content swallows the user's first click.
    if (performance.now() > 800) {
      sessionStorage.setItem("canteenos:intro", "done");
      return;
    }

    setVisible(true);
    document.documentElement.style.overflow = "hidden";


    const DURATION = 900;
    const start = performance.now();
    let raf = 0;
    let done = 0;

    const step = (now: number) => {
      const pct = Math.min(100, 8 + ((now - start) / DURATION) * 92);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(step);
        return;
      }
      done = window.setTimeout(() => {
        sessionStorage.setItem("canteenos:intro", "done");
        document.documentElement.style.overflow = "";
        setVisible(false);
      }, 220);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(done);
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="intro"
          exit={{ opacity: 0, filter: "blur(12px)", scale: 1.04, pointerEvents: "none" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] grid place-items-center bg-background"
        >
          <div className="pointer-events-none absolute inset-0 gradient-mesh animate-mesh-drift opacity-80" />
          <div className="pointer-events-none absolute inset-0 noise-overlay" />
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute size-1 rounded-full bg-primary/70"
              initial={{
                x: `${((i * 53) % 100) - 50}vw`,
                y: "40vh",
                opacity: 0,
              }}
              animate={{ y: "-40vh", opacity: [0, 1, 0] }}
              transition={{
                duration: 3.2 + (i % 5) * 0.4,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeOut",
              }}
            />
          ))}

          <div className="relative flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative grid size-20 place-items-center rounded-3xl border border-primary/40 bg-card shadow-[var(--shadow-glow)]"
            >
              <motion.span
                className="absolute inset-0 rounded-3xl border border-primary/40"
                animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
              <UtensilsCrossed className="size-9 text-primary" />
            </motion.div>

            <div className="text-center">
              <p className="text-lg font-semibold tracking-tight">CanteenOS</p>
              <p className="mt-1 text-xs text-muted-foreground">Warming the kitchen…</p>
            </div>

            <div className="h-1 w-56 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.35 }}
              />
            </div>
            <p className="text-[11px] tabular-nums text-muted-foreground">
              {Math.round(progress)}%
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Inline loader used as Suspense fallback for heavy 3D scenes. */
export function SceneLoader() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="flex flex-col items-center gap-3">
        <span className="size-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <span className="text-xs text-muted-foreground">Loading scene…</span>
      </div>
    </div>
  );
}
