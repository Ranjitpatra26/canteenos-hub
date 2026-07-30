import { useEffect } from "react";
import Lenis from "lenis";
import { useMotionReduced } from "@/hooks/use-motion-preference";

let lenisInstance: Lenis | null = null;

export function getLenis() {
  return lenisInstance;
}

/** Mounts a single global Lenis smooth-scroll instance (disabled for reduced motion). */
export function useSmoothScroll() {
  const reduced = useMotionReduced();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduced) return;

    const lenis = new Lenis({
      // Shorter duration + a snappier easing: the previous 1.1s ramp is what
      // made scroll feel like it lagged behind the wheel/pointer.
      duration: 0.75,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenisInstance = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [reduced]);
}
