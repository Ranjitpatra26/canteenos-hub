import { useCallback, useSyncExternalStore } from "react";

/**
 * Payment integration mode.
 *
 * - `simulated` — the built-in demo flow: the order is written straight to the
 *   database and a pickup QR is issued (no money moves).
 * - `stripe` — hand the checkout off to a real Stripe session. Requires the
 *   Stripe payments integration to be connected first (see `src/lib/payments.ts`).
 */
export type PaymentMode = "simulated" | "stripe";

const KEY = "canteenos.payment-mode";
const listeners = new Set<() => void>();

function read(): PaymentMode {
  if (typeof window === "undefined") return "simulated";
  return window.localStorage.getItem(KEY) === "stripe" ? "stripe" : "simulated";
}

let current: PaymentMode = "simulated";
if (typeof window !== "undefined") current = read();

export function getPaymentMode() {
  return current;
}

export function setPaymentMode(mode: PaymentMode) {
  current = mode;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, mode);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Reactive access to the workspace payment mode. */
export function usePaymentMode(): [PaymentMode, (mode: PaymentMode) => void] {
  const mode = useSyncExternalStore(
    subscribe,
    () => current,
    () => "simulated" as PaymentMode,
  );
  const set = useCallback((next: PaymentMode) => setPaymentMode(next), []);
  return [mode, set];
}
