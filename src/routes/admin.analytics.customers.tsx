import { createFileRoute, Link } from "@tanstack/react-router";
import { StatCard } from "@/components/shared/stat-card";
import { BarSeries, ChartPanel, LineSeries, RadarSeries } from "@/components/shared/charts";
import { SectionCard } from "@/components/shared/panels";
import { inr } from "@/lib/format";
import { customerGrowth } from "@/data/operations";
import { cohortRetention, monthlyRevenue } from "@/data/admin";
import { customers } from "@/data/orders";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/analytics/customers")({
  head: () => ({
    meta: [
      { title: "Customer analytics — CanteenOS" },
      {
        name: "description",
        content: "Student growth, retention cohorts, spend distribution and top canteen customers.",
      },
      { property: "og:title", content: "Customer analytics — CanteenOS" },
      {
        property: "og:description",
        content: "Understand who eats at the canteen and how often they return.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomerAnalytics,
});

function CustomerAnalytics() {
  const top = [...customers].sort((a, b) => b.spend - a.spend).slice(0, 6);
  const avgSpend = Math.round(customers.reduce((s, c) => s + c.spend, 0) / customers.length);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active students"
          value="2,240"
          delta={{ value: "+23.7%" }}
          hint="vs last month"
          index={0}
        />
        <StatCard label="New this month" value="428" delta={{ value: "+12.1%" }} index={1} />
        <StatCard
          label="Avg. lifetime spend"
          value={inr(avgSpend)}
          delta={{ value: "+6.4%" }}
          index={2}
        />
        <StatCard
          label="Churn risk"
          value="118"
          delta={{ value: "+4.2%", positive: false }}
          hint="no order in 21 days"
          index={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Customer growth"
          description="Monthly active students"
          className="lg:col-span-2"
          index={0}
        >
          <LineSeries
            data={customerGrowth}
            xKey="month"
            lines={[{ key: "students", name: "Active students" }]}
          />
        </ChartPanel>
        <ChartPanel title="Retention by cohort" description="% returning within 30 days" index={1}>
          <RadarSeries data={cohortRetention} angleKey="cohort" valueKey="returning" />
        </ChartPanel>
      </div>

      <ChartPanel title="Customers vs revenue" description="Monthly correlation" index={2}>
        <BarSeries
          data={monthlyRevenue}
          xKey="month"
          bars={[
            { key: "customers", name: "Customers" },
            { key: "orders", name: "Orders", color: "var(--info)" },
          ]}
        />
      </ChartPanel>

      <SectionCard
        title="Highest spending students"
        description="Lifetime value leaders"
        index={3}
        actions={
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/admin/customers">All customers</Link>
          </Button>
        }
      >
        <ul className="divide-y divide-border">
          {top.map((c) => (
            <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span
                className="grid size-9 place-items-center rounded-xl text-sm font-semibold"
                style={{ backgroundColor: `hsl(${c.tint} / 0.18)`, color: `hsl(${c.tint})` }}
              >
                {c.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{c.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {c.department} · {c.year}
                </span>
              </span>
              <span className="text-right text-sm">
                <span className="block font-semibold">{inr(c.spend)}</span>
                <span className="block text-xs text-muted-foreground">{c.orders} orders</span>
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
