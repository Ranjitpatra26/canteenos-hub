import { createFileRoute } from "@tanstack/react-router";
import { BarSeries, ChartPanel, DonutChart, RevenueArea } from "@/components/shared/charts";
import { DataTable, type Column } from "@/components/shared/data-table";
import { SectionCard } from "@/components/shared/panels";
import { StatCard } from "@/components/shared/stat-card";
import { Heatmap, Meter } from "@/components/monitoring/monitoring-ui";
import {
  activityMetrics,
  activityTrend,
  funnelSteps,
  heatHours,
  orderHeatmap,
  peakWindows,
  salesByChannel,
  salesTrend,
  topEvents,
} from "@/data/monitoring";
import { compactNumber, inr } from "@/lib/format";

export const Route = createFileRoute("/admin/monitoring/activity")({
  head: () => ({
    meta: [
      { title: "User activity & order heatmaps — CanteenOS monitoring" },
      {
        name: "description",
        content:
          "Active users, event volume, conversion funnel, order heatmaps and sales trends for CanteenOS.",
      },
      { property: "og:title", content: "User activity & order heatmaps — CanteenOS monitoring" },
      { property: "og:description", content: "Activity analytics, heatmaps and sales trends." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ActivityAnalytics,
});

type EventRow = (typeof topEvents)[number];

function ActivityAnalytics() {
  const columns: Column<EventRow>[] = [
    {
      key: "event",
      header: "Event",
      sortable: true,
      sortValue: (r) => r.event,
      cell: (r) => <span className="numeric text-sm font-medium">{r.event}</span>,
    },
    {
      key: "count",
      header: "Occurrences",
      align: "right",
      sortable: true,
      sortValue: (r) => r.count,
      cell: (r) => <span className="numeric text-sm">{compactNumber(r.count)}</span>,
    },
    {
      key: "users",
      header: "Unique users",
      align: "right",
      sortable: true,
      sortValue: (r) => r.users,
      cell: (r) => <span className="numeric text-sm">{compactNumber(r.users)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {activityMetrics.map((m, i) => (
          <StatCard
            key={m.id}
            label={m.label}
            value={`${m.suffix ? m.value.toFixed(1) : compactNumber(m.value)}${m.suffix ?? ""}`}
            delta={{ value: `${m.delta > 0 ? "+" : ""}${m.delta}%`, positive: m.delta > 0 }}
            hint="vs previous period"
            index={i}
          />
        ))}
      </div>

      <ChartPanel
        title="Active users, last 30 days"
        description="Returning activity against newly registered accounts."
        height={300}
      >
        <RevenueArea data={activityTrend} xKey="day" yKey="active" secondKey="new" />
      </ChartPanel>

      <SectionCard
        title="Order heatmap"
        description="Orders per weekday and hour — the darkest cells are where kitchen capacity is tightest."
      >
        <Heatmap rows={orderHeatmap} hours={heatHours} />
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Peak windows" description="Highest-pressure service slots this week.">
          <div className="space-y-5">
            {peakWindows.map((p) => (
              <Meter
                key={p.window}
                label={p.window}
                value={p.share}
                max={25}
                display={`${p.orders} orders · ${p.share}%`}
              />
            ))}
          </div>
        </SectionCard>

        <ChartPanel
          title="Sales trend"
          description="Revenue over the last 30 days."
          className="xl:col-span-2"
          height={300}
          index={1}
        >
          <RevenueArea data={salesTrend} xKey="day" yKey="revenue" />
        </ChartPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartPanel
          title="Conversion funnel"
          description="Share of sessions reaching each step."
          className="xl:col-span-2"
          height={300}
        >
          <BarSeries
            data={funnelSteps}
            xKey="name"
            horizontal
            bars={[{ key: "value", name: "Sessions %" }]}
            formatter={(v) => `${v}%`}
          />
        </ChartPanel>
        <ChartPanel title="Sales by channel" description="Where orders originate." height={300} index={1}>
          <DonutChart data={salesByChannel} />
        </ChartPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard
          title="Top product events"
          description="The analytics events the app already emits through the monitoring facade."
          className="xl:col-span-2"
        >
          <DataTable
            rows={topEvents}
            columns={columns}
            searchKeys={(r) => r.event}
            searchPlaceholder="Search events…"
            pageSize={6}
          />
        </SectionCard>

        <SectionCard title="Order economics" description="Rolling 30-day averages.">
          <div className="space-y-5">
            <Meter
              label="Average order value"
              value={salesTrend[salesTrend.length - 1].aov}
              max={200}
              display={inr(salesTrend[salesTrend.length - 1].aov)}
            />
            <Meter
              label="Orders per day"
              value={salesTrend[salesTrend.length - 1].orders}
              max={600}
              display={String(salesTrend[salesTrend.length - 1].orders)}
              tone="accent"
            />
            <Meter label="Repeat customer share" value={62} max={100} display="62%" tone="success" />
            <Meter label="Coupon-attached orders" value={18} max={100} display="18%" tone="warning" />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
