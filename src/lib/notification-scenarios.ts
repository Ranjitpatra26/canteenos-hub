import type { AppNotification } from "@/types";

export type ScenarioId =
  | "new-order"
  | "order-preparing"
  | "order-ready"
  | "order-completed"
  | "order-cancelled"
  | "payment-captured"
  | "low-stock"
  | "out-of-stock"
  | "offer";

export interface NotificationScenario {
  id: ScenarioId;
  group: "Orders" | "Payments" | "Inventory" | "Marketing";
  label: string;
  /** Who normally receives this in production. */
  audience: string;
  /** What triggers it for real. */
  trigger: string;
  /** Builds the notification payload with a fresh timestamp/order code. */
  build: () => Pick<AppNotification, "title" | "body" | "kind">;
}

function code() {
  return `CO-${1000 + Math.floor(Math.random() * 9000)}`;
}

export const NOTIFICATION_SCENARIOS: NotificationScenario[] = [
  {
    id: "new-order",
    group: "Orders",
    label: "New order received",
    audience: "Kitchen + admin",
    trigger: "A student completes checkout",
    build: () => ({
      title: `New order ${code()} — 3 items`,
      body: "2× Masala Dosa, 1× Cold Coffee Frappe · Counter 3 pickup · ETA 14 min.",
      kind: "order",
    }),
  },
  {
    id: "order-preparing",
    group: "Orders",
    label: "Order moved to preparing",
    audience: "Student",
    trigger: "Kitchen drags the ticket into Preparing",
    build: () => ({
      title: `Order ${code()} is preparing`,
      body: "The kitchen has started cooking your order.",
      kind: "order",
    }),
  },
  {
    id: "order-ready",
    group: "Orders",
    label: "Order ready for pickup",
    audience: "Student",
    trigger: "Kitchen marks the ticket ready",
    build: () => ({
      title: `Order ${code()} is ready`,
      body: "Your order is ready — show your QR code at Counter 3.",
      kind: "order",
    }),
  },
  {
    id: "order-completed",
    group: "Orders",
    label: "Order handed over",
    audience: "Student",
    trigger: "Counter scans the pickup QR",
    build: () => ({
      title: `Order ${code()} completed`,
      body: "Order handed over. Enjoy your meal — rate it from your order history.",
      kind: "order",
    }),
  },
  {
    id: "order-cancelled",
    group: "Orders",
    label: "Order cancelled",
    audience: "Student + admin",
    trigger: "Staff or student cancels an active order",
    build: () => ({
      title: `Order ${code()} was cancelled`,
      body: "Your order was cancelled and the amount will be refunded to your campus wallet.",
      kind: "order",
    }),
  },
  {
    id: "payment-captured",
    group: "Payments",
    label: "Payment captured",
    audience: "Student",
    trigger: "Checkout payment settles",
    build: () => ({
      title: "Payment of ₹482 received",
      body: `We've captured your payment for order ${code()} via UPI. Receipt saved to your profile.`,
      kind: "system",
    }),
  },
  {
    id: "low-stock",
    group: "Inventory",
    label: "Low stock warning",
    audience: "Admin + kitchen",
    trigger: "Stock drops below the reorder level",
    build: () => ({
      title: "Low stock: Paneer (4.2 kg left)",
      body: "Below the 6 kg reorder level. At today's pace this runs out in about 3 hours.",
      kind: "stock",
    }),
  },
  {
    id: "out-of-stock",
    group: "Inventory",
    label: "Item out of stock",
    audience: "Admin + kitchen",
    trigger: "An ingredient hits zero and dishes auto-disable",
    build: () => ({
      title: "Out of stock: Cold coffee mix",
      body: "3 menu items were switched to unavailable automatically. Restock to re-enable them.",
      kind: "stock",
    }),
  },
  {
    id: "offer",
    group: "Marketing",
    label: "Coupon / offer broadcast",
    audience: "All students",
    trigger: "Admin publishes a campaign",
    build: () => ({
      title: "20% off evening snacks till 7 PM",
      body: "Use code SNACK20 at checkout. Valid on beverages and snacks only.",
      kind: "offer",
    }),
  },
];

/** A preview-only notification object (never written to the database). */
export function previewNotification(scenario: NotificationScenario): AppNotification {
  const built = scenario.build();
  return {
    id: `preview-${scenario.id}`,
    time: new Date().toISOString(),
    read: false,
    ...built,
  };
}
