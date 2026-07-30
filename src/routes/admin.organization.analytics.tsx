import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard, MetricRow } from "@/components/shared/panels";
import { ChartPanel, LineSeries, DonutChart, RadarSeries } from "@/components/shared/charts";
import { Building2, Store, TrendingUp, UsersRound } from "lucide-react";
import {
  branches,
  campuses,
  orgKpis,
  orgRevenueTrend,
} from "@/data/organization";
import { compactNumber, inr } from "@/lib/format";

export const Route = createFileRoute("/admin/organization/analytics")({
  component: OrgAnalytics,
});

function OrgAnalytics() {
  const revenueShare = campuses.map((c) => ({ name: c.code, value: c.revenue30d }));
  const radar = campuses.map((c) => ({
    campus: c.code,
    score: Math.round(c.satisfaction * 20),
  }));
  const topBranches = [...branches].sort((a, b) => b.revenue30d - a.revenue30d).slice(0, 6);
  const max = topBranches[0]?.revenue30d ?? 1;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Trailing 12m revenue"
          value={inr(orgRevenueTrend.reduce((s, r) => s + r.north + r.south + r.tech + r.coastal, 0))}
          delta={{ value: "+18.4% YoY", positive: true }}
          icon={<TrendingUp className="size-4" />}
          index={0}
        />
        <StatCard
          label="Revenue per student"
          value={inr(Math.round(orgKpis.revenue30d / orgKpis.students))}
          hint="30-day average"
          icon={<UsersRound className="size-4" />}
          index={1}
        />
        <StatCard
          label="Revenue per canteen"
          value={inr(Math.round(orgKpis.revenue30d / orgKpis.totalBranches))}
          delta={{ value: "+6.1%", positive: true }}
          icon={<Store className="size-4" />}
          index={2}
        />
        <StatCard
          label="Campuses live"
          value={String(campuses.filter((c) => c.state === "active").length)}
          hint="1 onboarding"
          icon={<Building2 className="size-4" />}
          index={3}
        />
      </div>

      <ChartPanel
        title="Revenue by campus · 12 months"
        description="Group revenue split across every campus, month by month."
        height={320}
        index={0}
      >
        <LineSeries
          data={orgRevenueTrend}
          xKey="month"
          lines={[
            { key: "north", name: "North" },
            { key: "south", name: "South" },
            { key: "tech", name: "Tech Park" },
            { key: "coastal", name: "Coastal" },
          ]}
          formatter={inr}
        />
      </ChartPanel>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Revenue share"
          description="Contribution of each campus over the last 30 days."
          index={1}
        >
          <DonutChart data={revenueShare} />
        </ChartPanel>

        <ChartPanel
          title="Satisfaction index"
          description="Normalised CSAT score per campus."
          index={2}
        >
          <RadarSeries data={radar} angleKey="campus" valueKey="score" />
        </ChartPanel>

        <SectionCard
          title="Top canteens"
          description="Highest grossing outlets group-wide."
          index={3}
        >
          <ul className="space-y-4">
            {topBranches.map((b) => (
              <MetricRow
                key={b.id}
                label={`${b.name} · ${b.code}`}
                value={inr(b.revenue30d)}
                pct={(b.revenue30d / max) * 100}
                tone="primary"
              />
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Campus scorecard"
        description="Side-by-side operating metrics for the leadership review."
        index={4}
        padded={false}
      >
        <div className="overflow-x-auto p-5 pt-0">
          <table className="w-full min-w-[42rem] text-sm">
            <thead>
              <tr className="text-left">
                <th className="label-micro pb-3">Campus</th>
                <th className="label-micro pb-3 text-right">Students</th>
                <th className="label-micro pb-3 text-right">Canteens</th>
                <th className="label-micro pb-3 text-right">Orders</th>
                <th className="label-micro pb-3 text-right">Revenue</th>
                <th className="label-micro pb-3 text-right">ARPU</th>
                <th className="label-micro pb-3 text-right">CSAT</th>
              </tr>
            </thead>
            <tbody>
              {campuses.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="py-3">
                    <span className="block font-medium">{c.name}</span>
                    <span className="block text-xs text-muted-foreground">{c.city}</span>
                  </td>
                  <td className="numeric py-3 text-right">
                    {c.students.toLocaleString("en-IN")}
                  </td>
                  <td className="numeric py-3 text-right">{c.canteens}</td>
                  <td className="numeric py-3 text-right">{compactNumber(c.orders30d)}</td>
                  <td className="numeric py-3 text-right font-medium">{inr(c.revenue30d)}</td>
                  <td className="numeric py-3 text-right">
                    {inr(Math.round(c.revenue30d / c.students))}
                  </td>
                  <td className="numeric py-3 text-right">{c.satisfaction.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
