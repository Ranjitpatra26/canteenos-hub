import { useEffect, useRef, useState } from "react";

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  /** Minimum horizontal travel in px before the gesture fires. */
  threshold?: number;
  /** Only start the gesture within this many px of the left screen edge. */
  edgeOnly?: boolean;
}

/** Attaches horizontal swipe detection to any element ref. */
export function useSwipe<T extends HTMLElement>({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  edgeOnly = false,
}: SwipeOptions) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current ?? (typeof document !== "undefined" ? document.body : null);
    if (!node) return;
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (edgeOnly && t.clientX > 28) return;
      startX = t.clientX;
      startY = t.clientY;
      tracking = true;
    };
    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      // Ignore mostly-vertical drags so scrolling still feels natural.
      if (Math.abs(dx) < threshold || Math.abs(dy) > Math.abs(dx)) return;
      if (dx > 0) onSwipeRight?.();
      else onSwipeLeft?.();
    };

    node.addEventListener("touchstart", onStart, { passive: true });
    node.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      node.removeEventListener("touchstart", onStart);
      node.removeEventListener("touchend", onEnd);
    };
  }, [edgeOnly, onSwipeLeft, onSwipeRight, threshold]);

  return ref;
}

/** Pull-to-refresh for the main scroll container (touch devices only). */
export function usePullToRefresh(onRefresh: () => void | Promise<void>, enabled = true) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    let startY = 0;
    let active = false;
    const MAX = 90;

    const onStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || refreshing) return;
      startY = e.touches[0]?.clientY ?? 0;
      active = true;
    };
    const onMove = (e: TouchEvent) => {
      if (!active) return;
      const dy = (e.touches[0]?.clientY ?? 0) - startY;
      if (dy <= 0) {
        setPull(0);
        return;
      }
      setPull(Math.min(MAX, dy * 0.45));
    };
    const onEnd = async () => {
      if (!active) return;
      active = false;
      if (pull >= MAX * 0.8) {
        setRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
        }
      }
      setPull(0);
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [enabled, onRefresh, pull, refreshing]);

  return { pull, refreshing };
}
