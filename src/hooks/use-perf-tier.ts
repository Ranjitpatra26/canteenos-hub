import { useEffect, useState } from "react";
import { useMotionReduced } from "@/hooks/use-motion-preference";

export type PerfTier = "high" | "medium" | "low";

function detectTier(): PerfTier {
  if (typeof window === "undefined") return "medium";

  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;

  let hasWebGL = true;
  try {
    const canvas = document.createElement("canvas");
    hasWebGL = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    hasWebGL = false;
  }

  if (!hasWebGL || cores < 2 || memory < 2) return "low";
  if (cores <= 4 || memory <= 4) return "medium";
  return "high";
}

/**
 * Device capability tier — used to scale down 3D/effects automatically.
 * A reduced-motion preference (OS-detected or chosen in Settings) always
 * pins the tier to "low".
 */
export function usePerfTier(): PerfTier {
  const reduced = useMotionReduced();
  const [tier, setTier] = useState<PerfTier>("medium");

  useEffect(() => {
    setTier(detectTier());
  }, []);

  return reduced ? "low" : tier;
}

/** @deprecated prefer `useMotionReduced` — kept for existing call sites. */
export function useReducedMotion(): boolean {
  return useMotionReduced();
}
