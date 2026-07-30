import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { SceneLoader } from "@/components/fx/loading-screen";
import { usePerfTier } from "@/hooks/use-perf-tier";
import { useMotionReduced } from "@/hooks/use-motion-preference";

const HeroScene = lazy(() => import("@/components/three/hero-scene"));

/**
 * Client-only, lazily-loaded and viewport-gated wrapper for the WebGL hero.
 * Never imported during SSR; unmounts the renderer once scrolled far away.
 */
export function HeroCanvas({ className }: { className?: string }) {
  const tier = usePerfTier();
  const reducedMotion = useMotionReduced();
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(true);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const canvas = document.createElement("canvas");
      setSupported(Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl")));
    } catch {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "200px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {mounted && supported && inView ? (
        <Suspense fallback={<SceneLoader />}>
          <HeroScene tier={tier} reducedMotion={reducedMotion} />
        </Suspense>
      ) : null}
    </div>
  );
}
