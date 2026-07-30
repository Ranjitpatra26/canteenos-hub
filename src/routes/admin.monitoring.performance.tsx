import { createFileRoute } from "@tanstack/react-router";
import { BarSeries, ChartPanel, DonutChart, LineSeries } from "@/components/shared/charts";
import { Pill, SectionCard } from "@/components/shared/panels";
import { Meter } from "@/components/monitoring/monitoring-ui";
import {
  bundleBudgets,
  deviceSplit,
  performanceTrend,
  webVitals,
} from "@/data/monitoring";

export const Route = createFileRoute("/admin/monitoring/performance")({
  head: () => ({
    meta: [
      { title: "Performance metrics — CanteenOS monitoring" },
      {
        name: "description",
        content: "Core Web Vitals, latency trends, bundle budgets and device mix for CanteenOS.",
      },
      { property: "og:title", content: "Performance metrics — CanteenOS monitoring" },
      { property: "og:description", content: "Core Web Vitals, trends and bundle budgets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerformanceMetrics,
});

function PerformanceMetrics() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {webVitals.map((v, i) => (
          <SectionCard key={v.id} index={i}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="label-micro">{v.abbr}</p>
                <p className="numeric mt-3 text-[1.75rem] font-semibold leading-none tracking-[-0.02em]">
                  {v.value}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">{v.unit}</span>
                </p>
              </div>
              <Pill tone={v.good ? "success" : "warning"}>
                {v.good ? "Within budget" : "Over budget"}
              </Pill>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{v.description}</p>
            <div className="mt-4">
              <Meter
                label={`Budget ${v.budget}${v.unit}`}
                value={v.value}
                max={v.budget}
                display={`${Math.round((v.value / v.budget) * 100)}% of budget`}
                tone={v.good ? "success" : "warning"}
              />
            </div>
          </SectionCard>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartPanel
          title="Field data trend"
          description="Field-measured vitals over the last 14 days."
          className="xl:col-span-2"
          height={300}
        >
          <LineSeries
            data={performanceTrend}
            xKey="day"
            lines={[
              { key: "inp", name: "INP (ms)" },
              { key: "ttfb", name: "TTFB (ms)", color: "var(--accent)" },
            ]}
            formatter={(v) => `${Math.round(v)} ms`}
          />
        </ChartPanel>
        <ChartPanel title="Device mix" description="Share of measured sessions." height={300} index={1}>
          <DonutChart data={deviceSplit} />
        </ChartPanel>
      </div>

      <ChartPanel
        title="Bundle budgets"
        description="Gzipped kilobytes shipped per chunk against the agreed ceiling."
        height={280}
      >
        <BarSeries
          data={bundleBudgets}
          xKey="name"
          bars={[
            { key: "value", name: "Shipped (KB)" },
            { key: "budget", name: "Budget (KB)", color: "var(--muted-foreground)" },
          ]}
          formatter={(v) => `${v} KB`}
        />
      </ChartPanel>

      <SectionCard
        title="Optimisation notes"
        description="Standing actions tracked against the performance budget."
      >
        <ul className="space-y-3 text-sm">
          <li className="flex gap-3">
            <Pill tone="warning">TBT</Pill>
            <span className="text-muted-foreground">
              Hydration of the 3D hero still blocks the main thread on low-tier devices — the
              capability tier already downgrades the scene, next step is deferring post-processing.
            </span>
          </li>
          <li className="flex gap-3">
            <Pill tone="success">Charts</Pill>
            <span className="text-muted-foreground">
              Recharts is code-split per analytics route and stays inside its budget.
            </span>
          </li>
          <li className="flex gap-3">
            <Pill tone="info">Cache</Pill>
            <span className="text-muted-foreground">
              Static assets are immutable-cached at the edge; the PWA shell serves offline routes.
            </span>
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}
