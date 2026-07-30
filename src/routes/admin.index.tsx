import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Boxes,
  IndianRupee,
  ReceiptText,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard, MetricRow, Pill, ExportActions } from "@/components/shared/panels";
import { BarSeries, ChartPanel, DonutChart, RevenueArea } from "@/components/shared/charts";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { inr, timeAgo } from "@/lib/format";
import { categorySplit, mostOrdered, peakHours, revenueSeries } from "@/data/operations";
import { orders, customers } from "@/data/orders";
import { activityTimeline, lowStock, inventoryValue, liveOrders } from "@/data/admin";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — CanteenOS" },
      {
        name: "description",
        content:
          "Revenue, order volume, live kitchen load and top-selling dishes across the campus canteen.",
      },
      { property: "og:title", content: "Admin dashboard — CanteenOS" },
      {
        property: "og:description",
        content: "Campus canteen revenue and performance at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const weekRevenue = revenueSeries.reduce((s, d) => s + d.revenue, 0);
  const weekOrders = revenueSeries.reduce((s, d) => s + d.orders, 0);
  const maxOrders = Math.max(...mostOrdered.map((m) => m.orders));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Canteen overview"
        description="Performance across all counters this week."
        crumbs={[{ label: "Admin" }, { label: "Overview" }]}
        actions={<ExportActions name="Weekly overview" />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue this week"
          value={inr(weekRevenue)}
          delta={{ value: "+12.4%" }}
          hint="vs last week"
          icon={<IndianRupee className="size-4" />}
          index={0}
        />
        <StatCard
          label="Orders"
          value={String(weekOrders)}
          delta={{ value: "+8.1%" }}
          hint="1,656 items"
          icon={<ReceiptText className="size-4" />}
          index={1}
        />
        <StatCard
          label="Avg. order value"
          value={inr(Math.round(weekRevenue / weekOrders))}
          delta={{ value: "+3.2%" }}
          icon={<TrendingUp className="size-4" />}
          index={2}
        />
        <StatCard
          label="Live orders"
          value={String(liveOrders.length)}
          hint="across 4 counters"
          icon={<Boxes className="size-4" />}
          index={3}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Revenue by day"
          description="Gross sales across every counter"
          className="lg:col-span-2"
          index={0}
          actions={
            <Button asChild variant="ghost" size="sm" className="rounded-xl">
              <Link to="/admin/analytics/revenue">
                Details <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          }
        >
          <RevenueArea data={revenueSeries} xKey="day" yKey="revenue" />
        </ChartPanel>

        <ChartPanel title="Category mix" description="Share of orders" index={1}>
          <DonutChart data={categorySplit} />
        </ChartPanel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Peak hours"
          description="Orders per hour today"
          className="lg:col-span-2"
          index={2}
        >
          <BarSeries data={peakHours} xKey="hour" bars={[{ key: "orders" }]} />
        </ChartPanel>

        <SectionCard
          title="Top selling dishes"
          description="This week"
          index={3}
          actions={
            <Button asChild variant="ghost" size="sm" className="rounded-xl">
              <Link to="/admin/analytics/sales">All</Link>
            </Button>
          }
        >
          <ul className="space-y-4">
            {mostOrdered.map((m) => (
              <MetricRow
                key={m.name}
                label={m.name}
                value={inr(m.revenue)}
                pct={(m.orders / maxOrders) * 100}
              />
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <SectionCard
          title="Latest orders"
          description="Newest tickets across counters"
          className="lg:col-span-2"
          index={4}
        >
          <ul className="divide-y divide-border">
            {orders.slice(0, 6).map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-muted text-sm font-semibold">
                  {o.customerName.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {o.code} · {o.customerName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {o.lines.length} items · {o.counter} · {timeAgo(o.placedAt)}
                  </span>
                </span>
                <StatusBadge status={o.status} />
                <span className="w-20 text-right text-sm font-semibold">{inr(o.total)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Operations pulse" index={5}>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Inventory value</span>
                <span className="font-semibold">{inr(inventoryValue)}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Low stock items</span>
                <Pill tone={lowStock.length > 3 ? "danger" : "warning"}>
                  {lowStock.length} items
                </Pill>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Registered students</span>
                <span className="font-semibold">{customers.length * 187}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Avg. prep time</span>
                <Pill tone="success">11.4 min</Pill>
              </li>
            </ul>
            <Button asChild variant="outline" className="mt-4 w-full rounded-xl">
              <Link to="/admin/inventory">
                <UsersRound className="size-4" /> Review low stock
              </Link>
            </Button>
          </SectionCard>

          <SectionCard title="Recent activity" index={6}>
            <ul className="space-y-3">
              {activityTimeline.slice(0, 5).map((a) => (
                <li key={a.id} className="text-sm">
                  <p className="font-medium leading-tight">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(a.at)}</p>
                </li>
              ))}
            </ul>
            <Button asChild variant="ghost" className="mt-3 w-full rounded-xl">
              <Link to="/admin/activity">View timeline</Link>
            </Button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
