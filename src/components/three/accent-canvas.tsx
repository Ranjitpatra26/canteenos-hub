import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { usePerfTier } from "@/hooks/use-perf-tier";
import { useMotionReduced } from "@/hooks/use-motion-preference";

const AccentScene = lazy(() => import("@/components/three/accent-scene"));

export type AccentVariant = "knot" | "orbit" | "cube";

/**
 * Small, client-only 3D accent used to sprinkle depth into marketing sections
 * beyond the hero. Mounts only when scrolled into view and unmounts after.
 */
export function AccentCanvas({
  className,
  variant = "knot",
  color = "#c8f24a",
}: {
  className?: string;
  variant?: AccentVariant;
  color?: string;
}) {
  const tier = usePerfTier();
  const reducedMotion = useMotionReduced();
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} aria-hidden>
      {mounted && inView && !reducedMotion ? (
        <Suspense fallback={null}>
          <AccentScene variant={variant} color={color} />
        </Suspense>
      ) : null}
    </div>
  );
}
