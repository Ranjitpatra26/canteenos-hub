import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/shared/stat-card";
import { BarSeries, ChartPanel, DonutChart, LineSeries } from "@/components/shared/charts";
import { SectionCard, MetricRow } from "@/components/shared/panels";
import { peakHours, revenueSeries } from "@/data/operations";
import { fulfilmentSplit, kitchenPerformance, salesByCounter } from "@/data/admin";
import { orders } from "@/data/orders";

export const Route = createFileRoute("/admin/analytics/orders")({
  head: () => ({
    meta: [
      { title: "Order analytics — CanteenOS" },
      {
        name: "description",
        content:
          "Order volume, fulfilment split, cancellation rate and hourly demand for the campus canteen.",
      },
      { property: "og:title", content: "Order analytics — CanteenOS" },
      { property: "og:description", content: "Order volume and fulfilment performance analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrderAnalytics,
});

function OrderAnalytics() {
  const statuses = ["placed", "preparing", "ready", "completed", "cancelled"] as const;
  const statusData = statuses.map((s) => ({
    name: s[0].toUpperCase() + s.slice(1),
    value: orders.filter((o) => o.status === s).length || 1,
  }));
  const weekOrders = revenueSeries.reduce((s, d) => s + d.orders, 0);
  const maxHour = Math.max(...peakHours.map((h) => h.orders));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders this week"
          value={String(weekOrders)}
          delta={{ value: "+8.1%" }}
          index={0}
        />
        <StatCard label="Completion rate" value="97.2%" delta={{ value: "+0.9pp" }} index={1} />
        <StatCard label="Cancellations" value="43" delta={{ value: "-11.4%" }} index={2} />
        <StatCard
          label="Avg. fulfilment"
          value="12.6 min"
          delta={{ value: "-1.2 min" }}
          index={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Order volume"
          description="Daily tickets this week"
          className="lg:col-span-2"
          index={0}
        >
          <BarSeries data={revenueSeries} xKey="day" bars={[{ key: "orders", name: "Orders" }]} />
        </ChartPanel>
        <ChartPanel title="Status distribution" description="Live snapshot" index={1}>
          <DonutChart data={statusData} unit="" />
        </ChartPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Hourly demand" description="Where the rush lands" index={2}>
          <LineSeries data={peakHours} xKey="hour" lines={[{ key: "orders", name: "Orders" }]} />
        </ChartPanel>
        <ChartPanel title="On-time vs delayed" description="Last 7 days" index={3}>
          <BarSeries
            data={kitchenPerformance}
            xKey="day"
            stacked
            bars={[
              { key: "onTime", name: "On time %", color: "var(--success)" },
              { key: "delayed", name: "Delayed", color: "var(--destructive)" },
            ]}
          />
        </ChartPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Busiest hours" description="Top 5 demand windows" index={4}>
          <ul className="space-y-4">
            {[...peakHours]
              .sort((a, b) => b.orders - a.orders)
              .slice(0, 5)
              .map((h) => (
                <MetricRow
                  key={h.hour}
                  label={h.hour}
                  value={`${h.orders} orders`}
                  pct={(h.orders / maxHour) * 100}
                />
              ))}
          </ul>
        </SectionCard>
        <SectionCard title="Counter load" description="Share of tickets handled" index={5}>
          <ul className="space-y-4">
            {salesByCounter.map((c) => (
              <MetricRow
                key={c.counter}
                label={c.counter}
                value={`${c.orders}`}
                pct={(c.orders / Math.max(...salesByCounter.map((x) => x.orders))) * 100}
                tone="accent"
              />
            ))}
          </ul>
          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fulfilment split
            </p>
            <ul className="space-y-4">
              {fulfilmentSplit.map((f) => (
                <MetricRow
                  key={f.name}
                  label={f.name}
                  value={`${f.value}%`}
                  pct={f.value}
                  tone="success"
                />
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
