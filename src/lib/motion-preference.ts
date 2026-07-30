/**
 * Central motion/accessibility preference store.
 *
 * `auto`    — follow the OS `prefers-reduced-motion` setting (default)
 * `full`    — always allow 3D cursor effects, parallax and ambient animation
 * `reduced` — always soften: no cursor tilt/magnetics, no camera tracking,
 *             no parallax, no confetti and no ripples
 *
 * Everything imperative (button ripples, confetti, Lenis) reads
 * `isMotionReduced()`; React reads the store through `useMotionPreference()`.
 * The resolved value is mirrored onto `<html data-motion="reduced|full">` so
 * CSS can opt out of keyframes even when the OS setting says otherwise.
 */

export type MotionPreference = "auto" | "full" | "reduced";

export interface MotionState {
  /** What the user picked in Settings. */
  preference: MotionPreference;
  /** Resolved answer: should motion be softened right now? */
  reduced: boolean;
  /** Whether the OS itself asks for reduced motion. */
  systemReduced: boolean;
}

const STORAGE_KEY = "canteenos.motion";
const SERVER_STATE: MotionState = { preference: "auto", reduced: false, systemReduced: false };

let state: MotionState = SERVER_STATE;
let initialised = false;
const listeners = new Set<() => void>();

function resolve(preference: MotionPreference, systemReduced: boolean) {
  return preference === "reduced" || (preference === "auto" && systemReduced);
}

function commit(preference: MotionPreference, systemReduced: boolean, force = false) {
  const reduced = resolve(preference, systemReduced);
  if (
    !force &&
    state.preference === preference &&
    state.systemReduced === systemReduced &&
    state.reduced === reduced
  ) {
    return;
  }
  state = { preference, reduced, systemReduced };
  if (typeof document !== "undefined") {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  }
  listeners.forEach((listener) => listener());
}

function readStored(): MotionPreference {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "full" || raw === "reduced" || raw === "auto" ? raw : "auto";
  } catch {
    return "auto";
  }
}

/** Idempotent client bootstrap — safe to call from anywhere. */
export function initMotionPreference() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;

  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sync = () => commit(state.preference, mq.matches);
  mq.addEventListener("change", sync);

  commit(readStored(), mq.matches, true);
}

export function setMotionPreference(preference: MotionPreference) {
  initMotionPreference();
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    /* storage unavailable — keep the in-memory preference */
  }
  commit(preference, state.systemReduced);
}

/** Synchronous read for imperative effects (ripples, confetti, Lenis). */
export function isMotionReduced() {
  initMotionPreference();
  return state.reduced;
}

export function getMotionState(): MotionState {
  return state;
}

export function getServerMotionState(): MotionState {
  return SERVER_STATE;
}

export function subscribeMotion(listener: () => void) {
  initMotionPreference();
  listeners.add(listener);
  return () => listeners.delete(listener);
}
