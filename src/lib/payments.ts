/**
 * Stripe checkout boundary.
 *
 * The app ships with the simulated flow enabled. When the Stripe payments
 * integration is connected, `STRIPE_CONNECTED` flips to true and
 * `startStripeCheckout` redirects to the hosted checkout session instead of
 * writing the order immediately.
 */
export const STRIPE_CONNECTED = false;

export interface StripeCheckoutInput {
  /** Order value in rupees (converted to the smallest currency unit downstream). */
  amount: number;
  currency?: string;
  description: string;
  /** Line items so the hosted checkout can show a real basket. */
  lines: { name: string; qty: number; price: number }[];
}

export type StripeCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; reason: "not-connected" | "failed"; message: string };

export async function startStripeCheckout(
  _input: StripeCheckoutInput,
): Promise<StripeCheckoutResult> {
  if (!STRIPE_CONNECTED) {
    return {
      ok: false,
      reason: "not-connected",
      message:
        "Stripe isn't connected yet. Switch back to simulated payments, or connect Stripe to take live card payments.",
    };
  }
  // Once Stripe is connected this calls the checkout-session server function
  // and returns the hosted checkout URL.
  return { ok: false, reason: "failed", message: "Could not start the Stripe checkout session." };
}
