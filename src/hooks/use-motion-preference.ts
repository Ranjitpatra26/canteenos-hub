import { useSyncExternalStore } from "react";
import {
  getMotionState,
  getServerMotionState,
  setMotionPreference,
  subscribeMotion,
  type MotionPreference,
  type MotionState,
} from "@/lib/motion-preference";

export type { MotionPreference, MotionState };

/** Reactive access to the user's motion preference + the resolved value. */
export function useMotionPreference() {
  const state = useSyncExternalStore(subscribeMotion, getMotionState, getServerMotionState);
  return { ...state, setPreference: setMotionPreference };
}

/** `true` when 3D cursor effects, parallax and ambient motion should be off. */
export function useMotionReduced(): boolean {
  return useMotionPreference().reduced;
}
