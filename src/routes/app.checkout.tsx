import { useEffect, useState } from "react";
import { celebrate } from "@/lib/fx";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  QrCode,
  Smartphone,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { OrderSummary } from "@/routes/app.cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/cart-context";
import { useCreateOrder } from "@/lib/api";
import { enqueueOrder } from "@/lib/offline-queue";
import { usePaymentMode } from "@/lib/payment-mode";
import { startStripeCheckout } from "@/lib/payments";

import { inr } from "@/lib/format";
import { foodImage } from "@/lib/food-images";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — CanteenOS" },
      {
        name: "description",
        content:
          "Confirm your canteen order, pick a payment method and get a pickup QR code instantly.",
      },
      { property: "og:title", content: "Checkout — CanteenOS" },
      { property: "og:description", content: "Pay and get your pickup QR in seconds." },
    ],
  }),
  component: CheckoutPage,
});

const payments = [
  { id: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "wallet", label: "Campus wallet", hint: "Balance ₹1,840", icon: Wallet },
  { id: "card", label: "Card", hint: "Visa •••• 4412", icon: CreditCard },
  { id: "mess", label: "Mess account", hint: "Billed monthly", icon: Building2 },
];

function QrTile({ code }: { code: string }) {
  const cells = Array.from({ length: 169 }, (_, i) => {
    const seed = (i * 37 + code.charCodeAt(i % code.length) * 13) % 100;
    return seed > 48;
  });
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotateX: 55, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, rotateX: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 800 }}
      className="relative mx-auto w-44"
    >
      <span
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-3xl bg-primary/25 blur-2xl animate-pulse"
      />
      <div className="grid w-44 grid-cols-[repeat(13,minmax(0,1fr))] gap-px rounded-xl bg-foreground p-2">
        {cells.map((on, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.25,
              delay: 0.5 + (i % 13) * 0.012 + Math.floor(i / 13) * 0.02,
            }}
            className={cn("aspect-square rounded-[1px]", on ? "bg-background" : "bg-foreground")}
          />
        ))}
      </div>
    </motion.div>
  );
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { detailed, totals, method, promo, clear } = useCart();
  const createOrder = useCreateOrder();
  const [payment, setPayment] = useState("upi");
  const [slot, setSlot] = useState("asap");
  const [note, setNote] = useState("");
  const [phone, setPhone] = useState("98765 43210");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);
  const [paymentMode] = usePaymentMode();

  useEffect(() => {
    if (placed) celebrate();
  }, [placed]);

  if (detailed.length === 0 && !placed) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add a dish before checking out.</p>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/app/menu">Browse the menu</Link>
        </Button>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-xl py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="surface-raised glass-reflect relative overflow-hidden rounded-3xl p-8 text-center sm:p-10"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 gradient-mesh opacity-50"
          />
          <motion.span
            initial={{ scale: 0.4, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.1 }}
            className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-success/12 text-success"
          >
            <motion.span
              className="absolute inset-0 rounded-2xl border border-success/50"
              animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
            <CheckCircle2 className="size-7" />
          </motion.span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">Order confirmed</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {method === "pickup"
              ? "Show this QR at Counter 3 when your order turns ready."
              : "Our runner will bring it to your hostel block — keep this QR handy."}
          </p>

          <div className="mt-7">
            <QrTile code={placed} />
            <p className="mt-4 font-mono text-lg font-semibold tracking-widest">{placed}</p>
            <p className="text-xs text-muted-foreground">Valid for 30 minutes</p>
          </div>

          <Separator className="my-7" />

          <div className="grid grid-cols-3 gap-4 text-left">
            <div>
              <p className="text-xs text-muted-foreground">Amount paid</p>
              <p className="font-semibold">{inr(totals.total)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Method</p>
              <p className="font-semibold capitalize">{payment}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ETA</p>
              <p className="font-semibold">14 min</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <Button asChild className="rounded-xl">
              <Link to="/app/orders">Track my orders</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/app/menu">Order something else</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const placeOrder = async () => {
    const payload = {
      method,
      counter: method === "pickup" ? "Counter 3" : "Hostel delivery",
      note: note.trim() || undefined,
      subtotal: totals.subtotal,
      gst: totals.gst,
      fee: totals.fee,
      packaging: totals.packaging,
      discount: totals.discount,
      total: totals.total,
      etaMins: Math.max(...detailed.map((l) => l.item.prepTimeMins), 8),
      paymentMethod: payment,
      couponCode: promo?.code ?? null,
      lines: detailed.map((l) => ({
        menuItemId: l.item.id,
        name: l.item.name,
        emoji: l.item.emoji,
        qty: l.qty,
        price: l.item.price,
      })),
    };

    // Offline: park the order locally and let the queue sync it automatically.
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueOrder({
        summary: detailed.map((l) => `${l.qty}× ${l.item.name}`).join(", "),
        total: totals.total,
        payload,
      });
      clear();
      toast.success("Saved offline — we'll send it the moment you reconnect.");
      void navigate({ to: "/app/orders" });
      return;
    }

    setPlacing(true);

    // Stripe mode: hand off to the hosted checkout before the order is written.
    if (paymentMode === "stripe") {
      const session = await startStripeCheckout({
        amount: totals.total,
        description: `CanteenOS order · ${detailed.length} item(s)`,
        lines: detailed.map((l) => ({ name: l.item.name, qty: l.qty, price: l.item.price })),
      });
      if (!session.ok) {
        setPlacing(false);
        toast.error("Stripe checkout unavailable", { description: session.message });
        return;
      }
      window.location.href = session.url;
      return;
    }


    createOrder.mutate(payload, {
      onSuccess: (order) => {
        setPlacing(false);
        setPlaced(order.code);
        clear();
        toast.success(`Order ${order.code} placed`);
      },
      onError: (e) => {
        setPlacing(false);
        toast.error(e instanceof Error ? e.message : "Could not place your order");
      },
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Checkout"
        description="Pay now and collect with a QR — no queue, no cash."
        crumbs={[
          { label: "Student", to: "/app" },
          { label: "Cart", to: "/app/cart" },
          { label: "Checkout" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <section className="surface-card p-5">
            <h2 className="font-semibold">Pickup details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Contact number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slot">Pickup time</Label>
                <RadioGroup value={slot} onValueChange={setSlot} className="flex gap-2" id="slot">
                  {[
                    { v: "asap", l: "ASAP" },
                    { v: "1230", l: "12:30 PM" },
                    { v: "1330", l: "1:30 PM" },
                  ].map((s) => (
                    <Label
                      key={s.v}
                      className={cn(
                        "flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-2 py-2 text-sm font-normal transition-colors",
                        slot === s.v ? "border-primary bg-primary/10" : "border-border",
                      )}
                    >
                      <RadioGroupItem value={s.v} className="sr-only" />
                      {s.l}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="order-note">Note for the kitchen</Label>
              <Textarea
                id="order-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Pack separately, no cutlery needed…"
                className="rounded-xl"
              />
            </div>
          </section>

          <section className="surface-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">Payment method</h2>
              <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">
                {paymentMode === "stripe" ? "Stripe checkout" : "Simulated payments"}
              </span>
            </div>
            <RadioGroup
              value={payment}
              onValueChange={setPayment}
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >
              {payments.map((p) => (
                <Label
                  key={p.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-4 font-normal transition-colors",
                    payment === p.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <RadioGroupItem value={p.id} />
                  <p.icon className="size-4 text-primary" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{p.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">{p.hint}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </section>

          <section className="surface-card p-5">
            <h2 className="font-semibold">Items ({detailed.length})</h2>
            <ul className="mt-4 space-y-3">
              {detailed.map(({ item, qty }) => (
                <li key={item.id} className="flex items-center gap-3 text-sm">
                  <img
                    src={foodImage(item)}
                    alt={item.name}
                    loading="lazy"
                    width={80}
                    height={80}
                    className="size-10 shrink-0 rounded-lg object-cover"
                  />

                  <span className="min-w-0 flex-1 truncate">
                    {qty}× {item.name}
                  </span>
                  <span className="shrink-0 font-medium">{inr(item.price * qty)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary
            cta={
              <Button
                className="w-full rounded-xl"
                onClick={() => void placeOrder()}
                disabled={placing}
              >
                {placing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : paymentMode === "stripe" ? (
                  <CreditCard className="size-4" />
                ) : (
                  <QrCode className="size-4" />
                )}
                {paymentMode === "stripe" ? "Pay with Stripe" : "Pay"} {inr(totals.total)}
              </Button>
            }
          />
        </div>
      </div>

      <AnimatePresence>
        {placing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-5">
              <div className="relative grid size-24 place-items-center">
                <motion.span
                  className="absolute inset-0 rounded-full border-2 border-primary/25 border-t-primary"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                />
                <motion.span
                  className="absolute inset-3 rounded-full border-2 border-accent/25 border-b-accent"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                />
                <CreditCard className="size-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Processing payment…</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Securing your pickup slot at the counter
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
