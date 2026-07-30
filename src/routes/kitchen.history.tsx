import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { History, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/states";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAllOrders } from "@/lib/api";
import { foodImageById } from "@/lib/food-images";
import { clockTime, inr } from "@/lib/format";

export const Route = createFileRoute("/kitchen/history")({
  head: () => ({
    meta: [
      { title: "Served history — CanteenOS kitchen" },
      { name: "description", content: "Orders the kitchen has already handed over today." },
      { property: "og:title", content: "Served history — CanteenOS kitchen" },
      { property: "og:description", content: "Completed canteen orders for kitchen staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: KitchenHistoryPage,
});

function KitchenHistoryPage() {
  const { data: orders = [], isLoading } = useAllOrders();
  const done = useMemo(
    () => orders.filter((o) => o.status === "completed" || o.status === "cancelled"),
    [orders],
  );
  const revenue = done.reduce((s, o) => s + (o.status === "completed" ? o.total : 0), 0);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Served history"
        description={`${done.length} orders closed · ${inr(revenue)} served`}
        crumbs={[{ label: "Kitchen", to: "/kitchen" }, { label: "History" }]}
      />
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : done.length === 0 ? (
        <EmptyState
          icon={<History className="size-6" />}
          title="No closed orders yet"
          description="Orders you hand over will be listed here with their totals."
        />
      ) : (
        <ul className="grid gap-3">
          {done.map((o) => (
            <li key={o.id} className="surface-card flex flex-wrap items-center gap-3 rounded-2xl p-4">
              <img
                src={foodImageById(o.lines[0]?.itemId ?? "", o.lines[0]?.name)}
                alt={o.lines[0]?.name ?? "Order"}
                loading="lazy"
                className="size-12 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{o.code}</p>
                  <StatusBadge status={o.status} />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {o.customerName} · {o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">{inr(o.total)}</p>
                <p className="text-[11px] text-muted-foreground">{clockTime(o.placedAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
