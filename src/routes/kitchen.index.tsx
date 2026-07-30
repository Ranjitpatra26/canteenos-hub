import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChefHat, Clock, Flame, Loader2, Package, Timer } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllOrders, useRealtimeOrders, useUpdateOrderStatus } from "@/lib/api";
import { foodImageById } from "@/lib/food-images";
import { clockTime, inr } from "@/lib/format";
import type { Order, OrderStatus } from "@/types";

export const Route = createFileRoute("/kitchen/")({
  head: () => ({
    meta: [
      { title: "Kitchen board — CanteenOS" },
      {
        name: "description",
        content:
          "Live kanban board of incoming, cooking and ready canteen orders for kitchen staff.",
      },
      { property: "og:title", content: "Kitchen board — CanteenOS" },
      { property: "og:description", content: "Live order kanban for canteen kitchen staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: KitchenBoard,
});

const columns: {
  status: OrderStatus;
  title: string;
  next?: OrderStatus;
  cta?: string;
  accent: string;
}[] = [
  {
    status: "placed",
    title: "Incoming",
    next: "preparing",
    cta: "Start cooking",
    accent: "bg-sky-500",
  },
  {
    status: "preparing",
    title: "Cooking",
    next: "ready",
    cta: "Mark ready",
    accent: "bg-amber-500",
  },
  {
    status: "ready",
    title: "Ready for pickup",
    next: "completed",
    cta: "Hand over",
    accent: "bg-primary",
  },
  { status: "completed", title: "Handed over", accent: "bg-muted-foreground" },
];

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "ST";

export const minutesAgo = (iso: string) =>
  Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));

function KitchenStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="surface-card flex items-center gap-3 rounded-2xl p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="label-micro truncate">{label}</p>
        <p className="text-xl font-semibold tabular-nums">{value}</p>
        {hint ? <p className="truncate text-[11px] text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  cta,
  next,
  pending,
  onAdvance,
}: {
  order: Order;
  cta?: string;
  next?: OrderStatus;
  pending: boolean;
  onAdvance: (id: string, status: OrderStatus) => void;
}) {
  const waited = minutesAgo(order.placedAt);
  const late = waited > order.etaMins && order.status !== "completed";
  const units = order.lines.reduce((s, l) => s + l.qty, 0);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="surface-card rounded-2xl p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-semibold">{order.code}</p>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex items-center gap-2.5">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-primary-foreground"
          style={{ background: `hsl(${order.customerAvatarTint})` }}
        >
          {initialsOf(order.customerName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{order.customerName}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {order.method === "delivery" ? "Delivery" : "Pickup"} · {order.counter}
          </p>
        </div>
      </div>

      <ul className="mt-3 space-y-2">
        {order.lines.map((l) => (
          <li key={`${order.id}-${l.itemId}`} className="flex items-center gap-2.5">
            <img
              src={foodImageById(l.itemId, l.name)}
              alt={l.name}
              loading="lazy"
              className="size-9 shrink-0 rounded-lg object-cover"
            />
            <span className="min-w-0 flex-1 truncate text-xs">{l.name}</span>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums">
              ×{l.qty}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
        <span>{clockTime(order.placedAt)}</span>
        <span>·</span>
        <span className={late ? "font-semibold text-destructive" : ""}>{waited}m waiting</span>
        <span>·</span>
        <span>
          {units} item{units === 1 ? "" : "s"}
        </span>
        <span className="ml-auto font-semibold text-foreground tabular-nums">
          {inr(order.total)}
        </span>
      </div>

      {next ? (
        <Button
          size="sm"
          className="mt-3 w-full rounded-lg"
          disabled={pending}
          onClick={() => onAdvance(order.id, next)}
        >
          {cta}
        </Button>
      ) : null}
    </motion.li>
  );
}

function KitchenBoard() {
  useRealtimeOrders();
  const { data: orders = [], isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.code.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.lines.some((l) => l.name.toLowerCase().includes(q)),
    );
  }, [orders, query]);

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.status === "placed" || o.status === "preparing");
    const ready = orders.filter((o) => o.status === "ready");
    const done = orders.filter((o) => o.status === "completed");
    const revenue = done.reduce((s, o) => s + o.total, 0);
    const wait = active.length
      ? Math.round(active.reduce((s, o) => s + minutesAgo(o.placedAt), 0) / active.length)
      : 0;
    return { active: active.length, ready: ready.length, done: done.length, revenue, wait };
  }, [orders]);

  const advance = (id: string, status: OrderStatus) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(`Order moved to ${status}`),
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not update order"),
      },
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Kitchen board"
        description="Live queue across all counters — updated in real time as students order."
        crumbs={[{ label: "Kitchen" }, { label: "Board" }]}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KitchenStat
          icon={Flame}
          label="In the queue"
          value={String(stats.active)}
          hint="Placed + cooking"
        />
        <KitchenStat
          icon={Package}
          label="Ready"
          value={String(stats.ready)}
          hint="Waiting at counter"
        />
        <KitchenStat icon={ChefHat} label="Handed over" value={String(stats.done)} />
        <KitchenStat icon={Timer} label="Avg wait" value={`${stats.wait}m`} hint="Active orders" />
        <KitchenStat icon={Clock} label="Revenue served" value={inr(stats.revenue)} />
      </div>

      <div className="mt-6 max-w-sm">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search order code, student or dish…"
          className="rounded-xl"
          aria-label="Search orders"
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          {columns.map((col) => {
            const list = filtered.filter((o) => o.status === col.status);
            return (
              <section
                key={col.status}
                className="rounded-2xl border border-border/70 bg-card/40 p-3"
              >
                <header className="flex items-center justify-between px-1 pb-3">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <span className={`size-2 rounded-full ${col.accent}`} />
                    {col.title}
                  </h2>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums">
                    {list.length}
                  </span>
                </header>
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {list.map((o) => (
                      <OrderCard
                        key={o.id}
                        order={o}
                        cta={col.cta}
                        next={col.next}
                        pending={updateStatus.isPending}
                        onAdvance={advance}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
                {list.length === 0 ? (
                  <p className="px-1 pb-2 text-xs text-muted-foreground">Nothing here right now.</p>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
