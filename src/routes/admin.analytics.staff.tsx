import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/shared/stat-card";
import { BarSeries, ChartPanel, RadarSeries } from "@/components/shared/charts";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Pill } from "@/components/shared/panels";
import { staffPerformance, kitchenPerformance, type StaffPerformance } from "@/data/admin";

export const Route = createFileRoute("/admin/analytics/staff")({
  head: () => ({
    meta: [
      { title: "Staff performance — CanteenOS" },
      {
        name: "description",
        content:
          "Prep speed, on-time rate, output and ratings for every kitchen and counter staff member.",
      },
      { property: "og:title", content: "Staff performance — CanteenOS" },
      { property: "og:description", content: "Kitchen and counter staff productivity analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StaffAnalytics,
});

function StaffAnalytics() {
  const avgPrep = (
    staffPerformance.reduce((s, p) => s + p.avgPrepMins, 0) / staffPerformance.length
  ).toFixed(1);
  const avgOnTime = Math.round(
    staffPerformance.reduce((s, p) => s + p.onTimePct, 0) / staffPerformance.length,
  );
  const totalOrders = staffPerformance.reduce((s, p) => s + p.orders, 0);

  const columns: Column<StaffPerformance>[] = [
    {
      key: "name",
      header: "Staff",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{r.name}</span>
          <span className="block text-xs text-muted-foreground">{r.station}</span>
        </span>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      align: "right",
      sortable: true,
      sortValue: (r) => r.orders,
      cell: (r) => r.orders,
    },
    {
      key: "prep",
      header: "Avg prep",
      align: "right",
      sortable: true,
      sortValue: (r) => r.avgPrepMins,
      cell: (r) => `${r.avgPrepMins} min`,
    },
    {
      key: "onTime",
      header: "On time",
      align: "right",
      sortable: true,
      sortValue: (r) => r.onTimePct,
      cell: (r) => (
        <Pill tone={r.onTimePct >= 92 ? "success" : r.onTimePct >= 85 ? "warning" : "danger"}>
          {r.onTimePct}%
        </Pill>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      align: "right",
      sortable: true,
      sortValue: (r) => r.rating,
      cell: (r) => `★ ${r.rating}`,
    },
    {
      key: "hours",
      header: "Shift hrs",
      align: "right",
      sortable: true,
      sortValue: (r) => r.shiftHours,
      cell: (r) => `${r.shiftHours} h`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders handled"
          value={totalOrders.toLocaleString("en-IN")}
          delta={{ value: "+6.9%" }}
          index={0}
        />
        <StatCard
          label="Avg. prep time"
          value={`${avgPrep} min`}
          delta={{ value: "-0.6 min" }}
          index={1}
        />
        <StatCard
          label="On-time rate"
          value={`${avgOnTime}%`}
          delta={{ value: "+1.4pp" }}
          index={2}
        />
        <StatCard
          label="Staff on shift"
          value={String(staffPerformance.length)}
          hint="across 4 stations"
          index={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Output by staff member"
          description="Orders handled this week"
          className="lg:col-span-2"
          index={0}
        >
          <BarSeries
            data={staffPerformance}
            xKey="name"
            bars={[{ key: "orders", name: "Orders" }]}
            horizontal
          />
        </ChartPanel>
        <ChartPanel title="Daily on-time rate" description="Team wide" index={1}>
          <RadarSeries data={kitchenPerformance} angleKey="day" valueKey="onTime" />
        </ChartPanel>
      </div>

      <DataTable
        rows={staffPerformance}
        columns={columns}
        pageSize={8}
        searchKeys={(r) => `${r.name} ${r.station}`}
        searchPlaceholder="Search staff…"
        emptyTitle="No staff match"
      />
    </div>
  );
}
