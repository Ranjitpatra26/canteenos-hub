import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useOrder, useRealtimeOrders } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { clockTime, inr, shortDate } from "@/lib/format";
import { foodImageById } from "@/lib/food-images";

export const Route = createFileRoute("/app/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order tracking — CanteenOS" },
      {
        name: "description",
        content: "Track your canteen order status, items, pickup counter and total in real time.",
      },
      { property: "og:title", content: "Order tracking — CanteenOS" },
      { property: "og:description", content: "Track your canteen order in real time." },
    ],
  }),
  component: OrderDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h1 className="text-xl font-semibold">Order not found</h1>
      <Button asChild className="mt-6 rounded-xl">
        <Link to="/app/orders">Back to orders</Link>
      </Button>
    </div>
  ),
});

const steps = ["placed", "preparing", "ready", "completed"] as const;

function OrderDetail() {
  const { orderId } = Route.useParams();
  useRealtimeOrders();
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-xl font-semibold">Order not found</h1>
        <Button asChild className="mt-6 rounded-xl">
          <Link to="/app/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const activeIndex = steps.indexOf(order.status as (typeof steps)[number]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={`Order ${order.code}`}
        description={`${shortDate(order.placedAt)} · ${order.counter} · ${order.method === "pickup" ? "Counter pickup" : "Hostel delivery"}`}
        crumbs={[
          { label: "Student", to: "/app" },
          { label: "Orders", to: "/app/orders" },
          { label: order.code },
        ]}
        actions={<StatusBadge status={order.status} />}
      />

      <div className="surface-card p-5">
        <Progress value={((activeIndex + 1) / steps.length) * 100} className="h-1.5" />
        <ol className="mt-4 grid grid-cols-4 gap-2 text-xs">
          {steps.map((s, i) => (
            <li key={s} className={i <= activeIndex ? "text-foreground" : "text-muted-foreground"}>
              <span className="block font-medium capitalize">{s}</span>
              {i === 0 ? <span>{clockTime(order.placedAt)}</span> : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 surface-card p-5">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {order.lines.map((l: (typeof order.lines)[number]) => (
            <li key={l.itemId} className="flex items-center gap-3">
              <img
                src={foodImageById(l.itemId, l.name)}
                alt={l.name}
                loading="lazy"
                width={80}
                height={80}
                className="size-10 shrink-0 rounded-lg object-cover"
              />
              <span className="min-w-0 flex-1 truncate">
                {l.qty}× {l.name}
              </span>
              <span className="shrink-0 font-medium">{inr(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <Separator className="my-5" />
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{inr(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">GST</dt>
            <dd>{inr(order.gst)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Fees</dt>
            <dd>{inr(order.fee)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{inr(order.total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">Paid via {order.paymentMethod}</p>
      </div>
    </div>
  );
}
