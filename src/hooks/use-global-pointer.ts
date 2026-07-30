import { useEffect, useRef } from "react";

export type PointerRef = React.MutableRefObject<{ x: number; y: number }>;

/**
 * Tracks the cursor across the whole window (normalised to -1..1).
 *
 * R3F's built-in `pointer` only updates when the cursor is over the canvas —
 * and the hero canvas is `pointer-events-none`, so it never received events.
 * Listening on the window keeps the 3D scene locked to the real cursor.
 */
export function useGlobalPointer(): PointerRef {
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return pointer;
}
