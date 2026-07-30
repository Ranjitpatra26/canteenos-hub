import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BarSeries, ChartPanel } from "@/components/shared/charts";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Pill, SectionCard } from "@/components/shared/panels";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/states";
import { errorEvents, errorTrend, type ErrorEvent } from "@/data/monitoring";
import { captureError, getBreadcrumbs, subscribeBreadcrumbs, type BreadcrumbRecord } from "@/lib/monitoring";
import { compactNumber, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/admin/monitoring/errors")({
  head: () => ({
    meta: [
      { title: "Error logs — CanteenOS monitoring" },
      {
        name: "description",
        content: "Grouped exceptions, impacted users, release attribution and live client breadcrumbs.",
      },
      { property: "og:title", content: "Error logs — CanteenOS monitoring" },
      { property: "og:description", content: "Grouped exceptions, releases and live breadcrumbs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ErrorLogs,
});

const levelTone = { fatal: "danger", error: "warning", warning: "info" } as const;
const statusTone = {
  unresolved: "danger",
  investigating: "warning",
  resolved: "success",
  ignored: "muted",
} as const;

function ErrorLogs() {
  const [crumbs, setCrumbs] = useState<BreadcrumbRecord[]>(() => getBreadcrumbs());

  useEffect(() => {
    const unsubscribe = subscribeBreadcrumbs(setCrumbs);
    return () => {
      unsubscribe();
    };
  }, []);

  const total = errorEvents.reduce((s, e) => s + e.count24h, 0);
  const users = errorEvents.reduce((s, e) => s + e.users, 0);
  const unresolved = errorEvents.filter((e) => e.status === "unresolved").length;

  const columns: Column<ErrorEvent>[] = [
    {
      key: "title",
      header: "Issue",
      sortable: true,
      sortValue: (r) => r.title,
      cell: (r) => (
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <Pill tone={levelTone[r.level]}>{r.level}</Pill>
            <span className="block truncate text-sm font-medium">{r.title}</span>
          </span>
          <span className="numeric mt-1 block truncate text-xs text-muted-foreground">
            {r.culprit} · {r.environment} · v{r.release}
          </span>
        </span>
      ),
    },
    {
      key: "count24h",
      header: "Events",
      align: "right",
      sortable: true,
      sortValue: (r) => r.count24h,
      cell: (r) => <span className="numeric text-sm">{compactNumber(r.count24h)}</span>,
    },
    {
      key: "users",
      header: "Users",
      align: "right",
      sortable: true,
      sortValue: (r) => r.users,
      cell: (r) => <span className="numeric text-sm">{compactNumber(r.users)}</span>,
    },
    {
      key: "lastSeen",
      header: "Last seen",
      align: "right",
      sortable: true,
      sortValue: (r) => r.lastSeen,
      cell: (r) => <span className="text-xs text-muted-foreground">{timeAgo(r.lastSeen)}</span>,
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      sortable: true,
      sortValue: (r) => r.status,
      cell: (r) => <Pill tone={statusTone[r.status]}>{r.status}</Pill>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Events / 24h" value={compactNumber(total)} delta={{ value: "-11%", positive: true }} index={0} />
        <StatCard label="Users impacted" value={compactNumber(users)} delta={{ value: "-6%", positive: true }} index={1} />
        <StatCard label="Unresolved issues" value={String(unresolved)} delta={{ value: "needs triage", positive: false }} index={2} />
        <StatCard label="Crash-free sessions" value="99.7%" delta={{ value: "+0.1%", positive: true }} index={3} />
      </div>

      <ChartPanel
        title="Error volume, last 14 days"
        description="All levels stacked against fatal crashes."
        height={280}
      >
        <BarSeries
          data={errorTrend}
          xKey="day"
          bars={[
            { key: "errors", name: "Errors" },
            { key: "fatal", name: "Fatal", color: "var(--destructive)" },
          ]}
        />
      </ChartPanel>

      <SectionCard title="Issues" description="Grouped by fingerprint, newest activity first.">
        <DataTable
          rows={errorEvents}
          columns={columns}
          searchKeys={(r) => `${r.title} ${r.culprit} ${r.release} ${r.status}`}
          searchPlaceholder="Search issues…"
          pageSize={8}
        />
      </SectionCard>

      <SectionCard
        title="Live client breadcrumbs"
        description="In-memory telemetry buffer captured by the monitoring facade — the same stream a Sentry transport would forward."
        actions={
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() =>
              captureError(new Error("Test exception from monitoring console"), {
                source: "admin.monitoring.errors",
              })
            }
          >
            Send test event
          </Button>
        }
      >
        {crumbs.length === 0 ? (
          <EmptyState
            title="No breadcrumbs yet"
            description="Navigate the app or send a test event to populate the buffer."
          />
        ) : (
          <ol className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
            {crumbs.map((c) => (
              <li
                key={c.id}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2"
              >
                <Pill
                  tone={c.level === "error" ? "danger" : c.level === "warning" ? "warning" : "muted"}
                >
                  {c.category}
                </Pill>
                <span className="min-w-0 flex-1 truncate text-xs">{c.message}</span>
                <span className="numeric shrink-0 text-[11px] text-muted-foreground">
                  {timeAgo(c.at)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>
    </div>
  );
}
