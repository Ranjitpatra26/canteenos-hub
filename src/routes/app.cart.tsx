import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bike, Minus, Plus, ShoppingCart, Store, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { inr, tintGradient } from "@/lib/format";
import { foodImage } from "@/lib/food-images";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — CanteenOS" },
      {
        name: "description",
        content:
          "Review your canteen order, apply a promo code and choose pickup or hostel delivery.",
      },
      { property: "og:title", content: "Your cart — CanteenOS" },
      { property: "og:description", content: "Review your order and check out in seconds." },
    ],
  }),
  component: CartPage,
});

export function OrderSummary({ cta }: { cta?: React.ReactNode }) {
  const { totals, promo, promoError, applyPromo, clearPromo, method, setMethod } = useCart();
  const [code, setCode] = useState("");

  return (
    <div className="surface-card p-5">
      <h2 className="font-semibold">Order summary</h2>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {(
          [
            { key: "pickup", label: "Counter pickup", icon: Store, hint: "Free" },
            { key: "delivery", label: "Hostel delivery", icon: Bike, hint: "₹20" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setMethod(opt.key)}
            className={cn(
              "rounded-xl border p-3 text-left transition-colors",
              method === opt.key
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40",
            )}
          >
            <opt.icon className="size-4 text-primary" />
            <p className="mt-2 text-sm font-medium">{opt.label}</p>
            <p className="text-xs text-muted-foreground">{opt.hint}</p>
          </button>
        ))}
      </div>

      <div className="mt-5">
        {promo ? (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-sm">
              <Tag className="size-4 shrink-0 text-success" />
              <span className="truncate">
                <span className="font-semibold">{promo.code}</span> · {promo.label}
              </span>
            </span>
            <button onClick={clearPromo} aria-label="Remove promo">
              <X className="size-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Promo code"
              className="rounded-xl uppercase"
            />
            <Button
              variant="secondary"
              className="rounded-xl"
              onClick={() => {
                if (applyPromo(code)) {
                  toast.success("Promo applied");
                  setCode("");
                }
              }}
            >
              Apply
            </Button>
          </div>
        )}
        {promoError ? <p className="mt-2 text-xs text-destructive">{promoError}</p> : null}
        {!promo ? (
          <p className="mt-2 text-xs text-muted-foreground">Try CAMPUS20, CHAI49 or EXAMFUEL.</p>
        ) : null}
      </div>

      <Separator className="my-5" />

      <dl className="space-y-2.5 text-sm">
        <Row label="Subtotal" value={inr(totals.subtotal)} />
        {totals.discount ? (
          <Row label="Promo discount" value={`− ${inr(totals.discount)}`} accent />
        ) : null}
        <Row label="GST (5%)" value={inr(totals.gst)} />
        <Row label="Packaging" value={inr(totals.packaging)} />
        {totals.fee ? <Row label="Delivery" value={inr(totals.fee)} /> : null}
      </dl>

      <Separator className="my-5" />

      <div className="flex items-baseline justify-between">
        <span className="font-semibold">Total payable</span>
        <span className="text-2xl font-semibold tracking-tight">{inr(totals.total)}</span>
      </div>

      {cta ? <div className="mt-5">{cta}</div> : null}
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("font-medium", accent && "text-success")}>{value}</dd>
    </div>
  );
}

function CartPage() {
  const { detailed, setQty, remove, clear, count } = useCart();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Your cart"
        description={
          count ? `${count} item${count > 1 ? "s" : ""} ready to order.` : "Nothing here yet."
        }
        crumbs={[{ label: "Student", to: "/app" }, { label: "Cart" }]}
        actions={
          detailed.length ? (
            <Button variant="ghost" className="rounded-xl text-muted-foreground" onClick={clear}>
              <Trash2 className="size-4" /> Clear cart
            </Button>
          ) : null
        }
      />

      {detailed.length === 0 ? (
        <EmptyState
          icon={<ShoppingCart className="size-6" />}
          title="Your cart is empty"
          description="Add something from today's menu — most dishes are ready in under 12 minutes."
          action={
            <Button asChild className="rounded-xl">
              <Link to="/app/menu">Browse the menu</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <ul className="space-y-3">
            <AnimatePresence initial={false}>
              {detailed.map(({ item, qty }) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="flex items-center gap-4 surface-card p-4"
                >
                  <span
                    className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl text-xl"
                    style={tintGradient(item.tint)}
                  >
                    <img
                      src={foodImage(item)}
                      alt={item.name}
                      loading="lazy"
                      width={128}
                      height={128}
                      className="absolute inset-0 size-full object-cover"
                    />
                    <span className="relative rounded-full bg-background/70 px-1 backdrop-blur">
                      {item.emoji}
                    </span>
                  </span>

                  <div className="min-w-0 flex-1">
                    <Link
                      to="/app/menu/$itemId"
                      params={{ itemId: item.id }}
                      className="truncate font-medium hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {inr(item.price)} · {item.prepTimeMins} min
                    </p>
                    <Badge variant="secondary" className="mt-2 rounded-full text-[11px]">
                      {item.veg ? "Veg" : "Non-veg"}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <p className="font-semibold">{inr(item.price * qty)}</p>
                    <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-md"
                        aria-label="Decrease"
                        onClick={() => setQty(item.id, qty - 1)}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-md"
                        aria-label="Increase"
                        onClick={() => setQty(item.id, qty + 1)}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                    <button
                      onClick={() => remove(item.id)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <OrderSummary
              cta={
                <Button asChild className="w-full rounded-xl">
                  <Link to="/app/checkout">Proceed to checkout</Link>
                </Button>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
