import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Clock, Flame, IndianRupee, Receipt, Sparkles, Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { FoodCard } from "@/components/shared/food-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCategories, useMenuItems, useMyOrders, useRealtimeOrders } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { inr, clockTime, tintGradient } from "@/lib/format";
import { toast } from "sonner";
import { foodImageById } from "@/lib/food-images";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Your canteen dashboard — CanteenOS" },
      {
        name: "description",
        content:
          "Track live orders, reorder favourites and browse today's campus menu from one dashboard.",
      },
      { property: "og:title", content: "Your canteen dashboard — CanteenOS" },
      {
        property: "og:description",
        content: "Live orders, quick reorders and today's campus menu.",
      },
    ],
  }),
  component: StudentHome,
});

const statusProgress: Record<string, number> = {
  placed: 25,
  preparing: 60,
  ready: 90,
  completed: 100,
  cancelled: 100,
};

function StudentHome() {
  const { add, isFavorite, toggleFavorite } = useCart();
  const { profile } = useAuth();
  useRealtimeOrders();
  const { data: orders = [] } = useMyOrders();
  const { data: menuItems = [] } = useMenuItems();
  const { data: categories = [] } = useCategories();
  const firstName = (profile?.full_name ?? "there").split(" ")[0];
  const live = orders
    .filter((o) => ["placed", "preparing", "ready"].includes(o.status))
    .slice(0, 2);
  const recommended = [...menuItems]
    .filter((m) => m.available)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);
  const recent = orders.filter((o) => o.status === "completed").slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={`Good afternoon, ${firstName}`}
        description="Lunch service is live until 3:30 PM · Counter 3 queue is short right now."
        crumbs={[{ label: "Student", to: "/app" }, { label: "Overview" }]}
        actions={
          <Button asChild className="rounded-xl">
            <Link to="/app/menu">
              Browse menu <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Wallet balance"
          value={inr(1840)}
          delta={{ value: "+₹500" }}
          hint="topped up Monday"
          icon={<Wallet className="size-4" />}
          index={0}
        />
        <StatCard
          label="Orders this month"
          value="18"
          delta={{ value: "+4" }}
          hint="vs last month"
          icon={<Receipt className="size-4" />}
          index={1}
        />
        <StatCard
          label="Spent this month"
          value={inr(3465)}
          delta={{ value: "-8%", positive: false }}
          hint="under your budget"
          icon={<IndianRupee className="size-4" />}
          index={2}
        />
        <StatCard
          label="Avg. pickup wait"
          value="6m 20s"
          delta={{ value: "-2m" }}
          hint="faster than campus avg"
          icon={<Clock className="size-4" />}
          index={3}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Live orders</h2>
            <Button asChild variant="ghost" size="sm" className="rounded-lg">
              <Link to="/app/orders">View all</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {live.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="surface-card p-5"
              >
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{order.code}</p>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {order.lines.map((l) => `${l.qty}× ${l.name}`).join(" · ")}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold">{inr(order.total)}</p>
                    <p className="text-xs text-muted-foreground">{order.counter}</p>
                  </div>
                </div>
                <Progress value={statusProgress[order.status]} className="mt-4 h-1.5" />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>
                    Placed {clockTime(order.placedAt)} · ETA {order.etaMins} min
                  </span>
                  <Button asChild size="sm" variant="secondary" className="rounded-lg">
                    <Link to="/app/orders/$orderId" params={{ orderId: order.id }}>
                      Track order
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Picked for you</h2>
            <Badge variant="outline" className="rounded-full">
              <Sparkles className="mr-1 size-3" /> Based on 18 orders
            </Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recommended.map((item, i) => (
              <FoodCard
                key={item.id}
                item={item}
                index={i}
                isFavorite={isFavorite(item.id)}
                onToggleFavorite={(m) => toggleFavorite(m.id)}
                onAdd={(m) => {
                  add(m.id);
                  toast.success(`${m.name} added to cart`);
                }}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="surface-card p-5">
            <h3 className="font-semibold">Quick categories</h3>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c.id}
                  to="/app/menu"
                  search={{ category: c.slug }}
                  className="hover-lift flex items-center gap-2 rounded-xl border border-border p-3 text-sm"
                  style={tintGradient(c.tint)}
                >
                  <span className="text-lg">{c.emoji}</span>
                  <span className="truncate font-medium">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-primary" />
              <h3 className="font-semibold">Reorder in one tap</h3>
            </div>
            <ul className="mt-4 space-y-3">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center gap-3">
                  <img
                    src={foodImageById(o.lines[0]?.itemId ?? "", o.lines[0]?.name)}
                    alt={o.lines[0]?.name ?? "Order"}
                    loading="lazy"
                    width={80}
                    height={80}
                    className="size-10 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{o.lines[0]?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {inr(o.total)} · {o.code}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-lg"
                    onClick={() => {
                      o.lines.forEach((l) => add(l.itemId, l.qty));
                      toast.success(`Reordered ${o.code}`);
                    }}
                  >
                    Reorder
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="aurora rounded-2xl border border-border p-5">
            <p className="text-sm font-semibold">Use CAMPUS20</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Get 20% off any lunch order above ₹200 until Friday.
            </p>
            <Button asChild size="sm" className="mt-4 rounded-lg">
              <Link to="/app/menu">Start an order</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
