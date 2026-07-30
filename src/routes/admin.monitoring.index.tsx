import { createFileRoute } from "@tanstack/react-router";
import { Activity, CheckCircle2, Gauge, ShieldAlert } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard, Pill } from "@/components/shared/panels";
import { ChartPanel, LineSeries } from "@/components/shared/charts";
import { ServiceRow, StatusDot, stateMeta } from "@/components/monitoring/monitoring-ui";
import { services, incidents, apiThroughput } from "@/data/monitoring";
import { timeAgo } from "@/lib/format";

export const Route = createFileRoute("/admin/monitoring/")({
  head: () => ({
    meta: [
      { title: "Application health — CanteenOS monitoring" },
      {
        name: "description",
        content: "System status, service uptime and open incidents across the CanteenOS platform.",
      },
      { property: "og:title", content: "Application health — CanteenOS monitoring" },
      { property: "og:description", content: "System status, uptime and incident history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HealthOverview,
});

const groups = ["Application", "API", "Database", "Infrastructure"] as const;

function HealthOverview() {
  const degraded = services.filter((s) => s.state !== "operational");
  const overall: keyof typeof stateMeta = services.some((s) => s.state === "outage")
    ? "outage"
    : services.some((s) => s.state === "degraded")
      ? "degraded"
      : "operational";
  const avgUptime = (
    services.reduce((s, x) => s + x.uptime90d, 0) / services.length
  ).toFixed(2);
  const avgLatency = Math.round(
    services.filter((s) => s.latencyMs > 0).reduce((s, x) => s + x.latencyMs, 0) /
      services.filter((s) => s.latencyMs > 0).length,
  );
  const open = incidents.filter((i) => i.state !== "resolved");

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusDot state={overall} />
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {overall === "operational"
                  ? "All systems operational"
                  : overall === "degraded"
                    ? "Partial degradation"
                    : "Service disruption"}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {degraded.length === 0
                  ? "Every monitored service is reporting healthy."
                  : `${degraded.length} service${degraded.length > 1 ? "s" : ""} need attention.`}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["operational", "degraded", "outage", "maintenance"] as const).map((s) => (
              <Pill key={s} tone={stateMeta[s].tone}>
                {services.filter((x) => x.state === s).length} {stateMeta[s].label.toLowerCase()}
              </Pill>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="90-day uptime"
          value={`${avgUptime}%`}
          delta={{ value: "+0.04%", positive: true }}
          hint="all services"
          icon={<CheckCircle2 className="size-4" />}
          index={0}
        />
        <StatCard
          label="Median latency"
          value={`${avgLatency} ms`}
          delta={{ value: "-12 ms", positive: true }}
          hint="edge to origin"
          icon={<Gauge className="size-4" />}
          index={1}
        />
        <StatCard
          label="Open incidents"
          value={String(open.length)}
          delta={{ value: open.length ? "1 monitoring" : "clear", positive: open.length === 0 }}
          hint="last 7 days"
          icon={<ShieldAlert className="size-4" />}
          index={2}
        />
        <StatCard
          label="Requests / 24h"
          value={`${(apiThroughput.reduce((s, h) => s + h.requests, 0) / 1000).toFixed(1)}k`}
          delta={{ value: "+8.2%", positive: true }}
          hint="across all endpoints"
          icon={<Activity className="size-4" />}
          index={3}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {groups.map((g, gi) => (
            <SectionCard
              key={g}
              title={g}
              description={`Live state and 90-day history for ${g.toLowerCase()} services.`}
              index={gi}
            >
              <div className="space-y-2.5">
                {services
                  .filter((s) => s.group === g)
                  .map((s, i) => (
                    <ServiceRow key={s.id} service={s} index={i} />
                  ))}
              </div>
            </SectionCard>
          ))}
        </div>

        <SectionCard title="Incident history" description="Newest first." index={1}>
          <ol className="space-y-4">
            {incidents.map((inc) => (
              <li key={inc.id} className="rounded-xl border border-border/70 bg-card/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 text-sm font-medium leading-tight">{inc.title}</p>
                  <Pill
                    tone={
                      inc.state === "resolved"
                        ? "success"
                        : inc.impact === "critical"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {inc.state}
                  </Pill>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {inc.summary}
                </p>
                <p className="numeric mt-2 text-[11px] text-muted-foreground">
                  {timeAgo(inc.startedAt)} · {inc.durationMins} min · {inc.services.join(", ")}
                </p>
              </li>
            ))}
          </ol>
        </SectionCard>
      </div>

      <ChartPanel
        title="Traffic and errors, last 24 hours"
        description="Requests plotted against failed responses to spot correlated spikes."
        height={300}
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
    </div>
  );
}
