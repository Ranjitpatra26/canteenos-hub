import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/shared/stat-card";
import {
  BarSeries,
  ChartPanel,
  DonutChart,
  LineSeries,
  RevenueArea,
} from "@/components/shared/charts";
import { RANGES, useAnalyticsRange } from "@/components/shared/analytics-range";
import { inr } from "@/lib/format";
import { categorySplit, peakHours, revenueSeries } from "@/data/operations";
import { monthlyRevenue, paymentSplit, kitchenPerformance } from "@/data/admin";

export const Route = createFileRoute("/admin/analytics/")({
  head: () => ({
    meta: [
      { title: "Analytics overview — CanteenOS" },
      {
        name: "description",
        content:
          "Cross-functional canteen analytics: revenue, demand curves, payment mix and kitchen throughput.",
      },
      { property: "og:title", content: "Analytics overview — CanteenOS" },
      {
        property: "og:description",
        content: "Cross-functional canteen analytics in one dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsOverview,
});

function AnalyticsOverview() {
  const { slice, refreshKey, range } = useAnalyticsRange();

  const months = slice(monthlyRevenue);
  const days = slice(revenueSeries, "days");
  const kitchen = slice(kitchenPerformance, "days");

  const week = days.reduce((s, d) => s + d.revenue, 0);
  const windowed = months.reduce((s, m) => s + m.revenue, 0);
  const orders = months.reduce((s, m) => s + m.orders, 0);
  const rangeLabel = RANGES.find((r) => r.id === range)?.label ?? "";

  return (
    <div className="space-y-6" key={refreshKey}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue (week)" value={inr(week)} delta={{ value: "+12.4%" }} index={0} />
        <StatCard
          label={`Revenue (${rangeLabel})`}
          value={inr(windowed)}
          delta={{ value: "+18.9%" }}
          index={1}
        />
        <StatCard
          label={`Orders (${rangeLabel})`}
          value={orders.toLocaleString("en-IN")}
          delta={{ value: "+6.1%" }}
          index={2}
        />
        <StatCard label="Avg. prep time" value="11.4 min" delta={{ value: "-0.8 min" }} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Revenue trend"
          description={`Last ${rangeLabel}`}
          className="lg:col-span-2"
          index={0}
        >
          <RevenueArea data={months} xKey="month" yKey="revenue" />
        </ChartPanel>
        <ChartPanel title="Payment mix" description="Share of settled value" index={1}>
          <DonutChart data={paymentSplit} />
        </ChartPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Peak hours" description="Order density through the day" index={2}>
          <BarSeries data={peakHours} xKey="hour" bars={[{ key: "orders" }]} />
        </ChartPanel>
        <ChartPanel title="Kitchen throughput" description="Output vs on-time rate" index={3}>
          <LineSeries
            data={kitchen}
            xKey="day"
            lines={[
              { key: "output", name: "Orders" },
              { key: "onTime", name: "On time %", color: "var(--success)" },
            ]}
          />
        </ChartPanel>
      </div>

      <ChartPanel title="Category demand" description="Share of total orders by cuisine" index={4}>
        <BarSeries data={categorySplit} xKey="name" bars={[{ key: "value", name: "Share %" }]} />
      </ChartPanel>
    </div>
  );
}
