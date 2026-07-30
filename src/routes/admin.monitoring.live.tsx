import { createFileRoute } from "@tanstack/react-router";
import { ChartPanel, LineSeries, RevenueArea } from "@/components/shared/charts";
import { Pill, SectionCard } from "@/components/shared/panels";
import { Heatmap, LiveKpiTile, StatusDot } from "@/components/monitoring/monitoring-ui";
import {
  apiThroughput,
  heatHours,
  liveKpis,
  orderHeatmap,
  salesTrend,
  services,
} from "@/data/monitoring";

export const Route = createFileRoute("/admin/monitoring/live")({
  head: () => ({
    meta: [
      { title: "Real-time KPIs — CanteenOS monitoring" },
      {
        name: "description",
        content:
          "Live revenue, orders in flight, prep time, success rate and platform health on one board.",
      },
      { property: "og:title", content: "Real-time KPIs — CanteenOS monitoring" },
      { property: "og:description", content: "A wallboard-ready live KPI dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LiveDashboard,
});

function LiveDashboard() {
  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="size-2 animate-pulse rounded-full bg-success" aria-hidden />
            <p className="text-sm font-medium">Streaming live</p>
            <span className="text-xs text-muted-foreground">
              Values refresh continuously and pause when the tab is hidden.
            </span>
          </div>
          <Pill tone="primary">Wallboard ready</Pill>
        </div>
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {liveKpis.map((k, i) => (
          <LiveKpiTile key={k.id} kpi={k} index={i} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartPanel
          title="Revenue momentum"
          description="Rolling 30-day revenue with today's pace projected onto trend."
          className="xl:col-span-2"
          height={300}
        >
          <RevenueArea data={salesTrend} xKey="day" yKey="revenue" />
        </ChartPanel>

        <SectionCard title="Service pulse" description="Condensed status for the wallboard." index={1}>
          <ul className="space-y-2.5">
            {services.map((s) => (
              <li key={s.id} className="flex items-center gap-2.5">
                <StatusDot state={s.state} />
                <span className="min-w-0 flex-1 truncate text-sm">{s.name}</span>
                <span className="numeric shrink-0 text-xs text-muted-foreground">
                  {s.latencyMs > 0 ? `${s.latencyMs} ms` : "—"}
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <ChartPanel
        title="Live request throughput"
        description="Requests and failures over the trailing 24 hours."
        height={260}
      >
        <LineSeries
          data={apiThroughput}
          xKey="hour"
          lines={[
            { key: "requests", name: "Requests" },
            { key: "errors", name: "Errors", color: "var(--destructive)" },
          ]}
        />
      </ChartPanel>

      <SectionCard
        title="Demand heatmap"
        description="Where the next rush is likely to land, by weekday and hour."
      >
        <Heatmap rows={orderHeatmap} hours={heatHours} />
      </SectionCard>
    </div>
  );
}
