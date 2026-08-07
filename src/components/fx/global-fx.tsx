import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { usePerfTier } from "@/hooks/use-perf-tier";
import { useMotionReduced } from "@/hooks/use-motion-preference";
import { MouseCursor3DFX } from "@/components/fx/cursor-3d-fx";

/** Canvas particle field — lightweight, tier-aware, DPR-capped. */
function Particles({ count }: { count: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.4 + 0.4,
      vy: -(Math.random() * 0.00016 + 0.00004),
      vx: (Math.random() - 0.5) * 0.00008,
      a: Math.random() * 0.45 + 0.12,
    }));

    let frame = 0;
    let last = 0;
    // Cap the particle field at ~30fps: it is ambient, and leaving the other
    // half of every frame free keeps pointer-driven motion smooth.
    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      if (time - last < 33) return;
      const dt = Math.min(48, time - last || 16);
      last = time;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        d.y += d.vy * dt;
        d.x += d.vx * dt;
        if (d.y < -0.05) d.y = 1.05;
        if (d.x < -0.05) d.x = 1.05;
        if (d.x > 1.05) d.x = -0.05;
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(190, 245, 120, ${d.a})`;
        ctx.fill();
      }
    };
    const start = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
    };
  }, [count]);

  return <canvas ref={ref} className="absolute inset-0 size-full" aria-hidden />;
}

/**
 * Site-wide ambient layer: soft aurora orbs, a drifting gradient mesh and a
 * noise texture. Kept deliberately cheap — the large blurred orbs are static
 * (blur repaint per frame is the single most expensive ambient effect), only
 * a light parallax translate runs on scroll.
 */
export function GlobalFx() {
  const tier = usePerfTier();
  const reducedMotion = useMotionReduced();
  const { scrollYProgress } = useScroll();
  const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -90]), {
    stiffness: 80,
    damping: 26,
    restDelta: 0.5,
  });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, 70]), {
    stiffness: 80,
    damping: 26,
    restDelta: 0.5,
  });

  return (
    <>
      <MouseCursor3DFX />
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 gradient-mesh animate-mesh-drift" />
        {!reducedMotion && (
          <>
            <motion.span
              style={{ y: y1, willChange: "transform" }}
              className="absolute -left-32 top-[8%] size-[34rem] rounded-full bg-[color-mix(in_oklab,var(--primary)_16%,transparent)] blur-[90px]"
            />
            <motion.span
              style={{ y: y2, willChange: "transform" }}
              className="absolute -right-40 top-[44%] size-[30rem] rounded-full bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] blur-[100px]"
            />
          </>
        )}
        {!reducedMotion ? <Particles count={tier === "high" ? 44 : 24} /> : null}
        <div className="absolute inset-0 noise-overlay" />
      </div>
    </>
  );
}

/** Scroll-linked parallax wrapper for any block of content. */
export function Parallax({
  children,
  distance = 60,
  className,
}: {
  children: React.ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useMotionReduced();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [distance, -distance]), {
    stiffness: 90,
    damping: 28,
    restDelta: 0.5,
  });
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y: mounted && !reducedMotion ? y : 0 }}>{children}</motion.div>
    </div>
  );
}
