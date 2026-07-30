import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatCard } from "@/components/shared/stat-card";
import { BarSeries, ChartPanel, DonutChart, RevenueArea } from "@/components/shared/charts";
import { SectionCard, SegmentedControl, MetricRow } from "@/components/shared/panels";
import { inr } from "@/lib/format";
import { revenueSeries } from "@/data/operations";
import { monthlyRevenue, yearlyRevenue, salesByCounter, paymentSplit } from "@/data/admin";

export const Route = createFileRoute("/admin/analytics/revenue")({
  head: () => ({
    meta: [
      { title: "Revenue analytics — CanteenOS" },
      {
        name: "description",
        content:
          "Weekly, monthly and yearly canteen revenue with margin, counter and payment breakdowns.",
      },
      { property: "og:title", content: "Revenue analytics — CanteenOS" },
      {
        property: "og:description",
        content: "Track canteen revenue, margin and payment mix over time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RevenueAnalytics,
});

type Range = "week" | "month" | "year";

function RevenueAnalytics() {
  const [range, setRange] = useState<Range>("month");

  const data =
    range === "week"
      ? revenueSeries.map((d) => ({ label: d.day, revenue: d.revenue, orders: d.orders }))
      : range === "month"
        ? monthlyRevenue.map((m) => ({
            label: m.month,
            revenue: m.revenue,
            orders: m.orders,
            cost: m.cost,
          }))
        : yearlyRevenue.map((y) => ({ label: y.year, revenue: y.revenue, orders: y.orders }));

  const total = data.reduce((s, d) => s + d.revenue, 0);
  const orders = data.reduce((s, d) => s + d.orders, 0);
  const cost = monthlyRevenue.reduce((s, m) => s + m.cost, 0);
  const maxCounter = Math.max(...salesByCounter.map((c) => c.revenue));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Gross revenue, contribution margin and settlement mix.
        </p>
        <SegmentedControl
          value={range}
          onChange={setRange}
          options={[
            { value: "week", label: "Weekly" },
            { value: "month", label: "Monthly" },
            { value: "year", label: "Yearly" },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross revenue" value={inr(total)} delta={{ value: "+14.2%" }} index={0} />
        <StatCard
          label="Orders"
          value={orders.toLocaleString("en-IN")}
          delta={{ value: "+9.4%" }}
          index={1}
        />
        <StatCard
          label="Avg. order value"
          value={inr(Math.round(total / orders))}
          delta={{ value: "+4.1%" }}
          index={2}
        />
        <StatCard
          label="Gross margin"
          value={`${Math.round(((monthlyRevenue.reduce((s, m) => s + m.revenue, 0) - cost) / monthlyRevenue.reduce((s, m) => s + m.revenue, 0)) * 100)}%`}
          delta={{ value: "+1.8pp" }}
          index={3}
        />
      </div>

      <ChartPanel
        title="Revenue over time"
        description="Net of refunds and cancellations"
        height={320}
        index={0}
      >
        <RevenueArea data={data} xKey="label" yKey="revenue" />
      </ChartPanel>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Revenue vs food cost"
          description="Monthly contribution"
          className="lg:col-span-2"
          index={1}
        >
          <BarSeries
            data={monthlyRevenue}
            xKey="month"
            bars={[
              { key: "revenue", name: "Revenue" },
              { key: "cost", name: "Food cost", color: "var(--warning)" },
            ]}
            formatter={inr}
          />
        </ChartPanel>
        <ChartPanel title="Settlement mix" description="Share of value collected" index={2}>
          <DonutChart data={paymentSplit} />
        </ChartPanel>
      </div>

      <SectionCard title="Revenue by counter" description="Rolling 30 days" index={3}>
        <ul className="space-y-4">
          {salesByCounter.map((c) => (
            <MetricRow
              key={c.counter}
              label={c.counter}
              value={inr(c.revenue)}
              pct={(c.revenue / maxCounter) * 100}
            />
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
