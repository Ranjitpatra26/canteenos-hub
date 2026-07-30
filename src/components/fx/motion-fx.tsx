import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { usePerfTier } from "@/hooks/use-perf-tier";
import { useMotionReduced } from "@/hooks/use-motion-preference";

/**
 * Perspective 3D tilt with hover depth + optional idle float.
 * Pointer reads are throttled to one rAF so fast mouse movement never queues
 * up layout work (the main source of "laggy / delayed" feeling tilt).
 */
export function TiltCard({
  children,
  className,
  intensity = 10,
  float = false,
  glare = true,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  float?: boolean;
  glare?: boolean;
  style?: React.CSSProperties;
}) {
  const tier = usePerfTier();
  const reducedMotion = useMotionReduced();
  const ref = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect | null>(null);
  const raf = useRef(0);
  const next = useRef({ x: 0.5, y: 0.5 });
  const [hovered, setHovered] = useState(false);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const spring = { stiffness: 320, damping: 30, mass: 0.35 } as const;
  const rx = useSpring(useTransform(my, [0, 1], [intensity, -intensity]), spring);
  const ry = useSpring(useTransform(mx, [0, 1], [-intensity, intensity]), spring);
  const glareX = useTransform(mx, (v) => `${v * 100}%`);
  const glareY = useTransform(my, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(240px circle at ${glareX} ${glareY}, color-mix(in oklab, var(--primary) 14%, transparent), transparent 65%)`;

  // Reduced motion kills the pointer-driven tilt, depth float and glare.
  const disabled = tier === "low" || reducedMotion;

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  function onMove(e: React.PointerEvent) {
    if (disabled || !ref.current) return;
    // Cache the rect on enter; reading it per move forces layout on every event.
    if (!rect.current) rect.current = ref.current.getBoundingClientRect();
    const r = rect.current;
    next.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      mx.set(next.current.x);
      my.set(next.current.y);
    });
  }

  function onEnter() {
    rect.current = ref.current?.getBoundingClientRect() ?? null;
    setHovered(true);
  }

  function onLeave() {
    setHovered(false);
    rect.current = null;
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{
        perspective: 1000,
        rotateX: disabled ? 0 : rx,
        rotateY: disabled ? 0 : ry,
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...style,
      }}
      animate={
        float && !disabled
          ? { y: hovered ? -8 : [0, -6, 0], scale: hovered ? 1.015 : 1 }
          : { y: hovered && !disabled ? -6 : 0, scale: hovered && !disabled ? 1.012 : 1 }
      }
      transition={
        float && !hovered
          ? { y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }
          : { type: "spring", stiffness: 300, damping: 26 }
      }
      className={cn("relative [transform-style:preserve-3d]", className)}
    >
      {children}
      {glare && !disabled ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-300"
          style={{ opacity: hovered ? 1 : 0, background: glareBg }}
        />
      ) : null}
    </motion.div>
  );
}

/** Magnetic hover — element drifts toward the cursor. */
export function Magnetic({
  children,
  className,
  strength = 0.35,
  as: Tag = "span",
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  as?: "span" | "div";
}) {
  const tier = usePerfTier();
  const reducedMotion = useMotionReduced();
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 320, damping: 22, mass: 0.3, restDelta: 0.1 });
  const y = useSpring(0, { stiffness: 320, damping: 22, mass: 0.3, restDelta: 0.1 });

  useEffect(() => {
    if (tier === "low" || reducedMotion) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Element-scoped listeners + a cached rect: a window-level pointermove per
    // magnetic element re-measured layout on every mouse move, which is what
    // made the cursor feel like it was dragging the UI behind it.
    let rect: DOMRect | null = null;
    let raf = 0;
    let target = { x: 0, y: 0 };

    const apply = () => {
      raf = 0;
      x.set(target.x);
      y.set(target.y);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const enter = () => {
      rect = el.getBoundingClientRect();
    };
    const move = (e: PointerEvent) => {
      if (!rect) rect = el.getBoundingClientRect();
      target = {
        x: (e.clientX - (rect.left + rect.width / 2)) * strength,
        y: (e.clientY - (rect.top + rect.height / 2)) * strength,
      };
      schedule();
    };
    const leave = () => {
      rect = null;
      target = { x: 0, y: 0 };
      schedule();
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [reducedMotion, strength, tier, x, y]);

  const MotionTag = Tag === "div" ? motion.div : motion.span;
  return (
    <MotionTag
      ref={ref as never}
      style={{ x, y, display: "inline-flex", willChange: "transform" }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
