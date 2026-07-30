import { createFileRoute } from "@tanstack/react-router";
import { BarSeries, ChartPanel, DonutChart, LineSeries } from "@/components/shared/charts";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Pill, SectionCard } from "@/components/shared/panels";
import { StatCard } from "@/components/shared/stat-card";
import { KeyValue } from "@/components/monitoring/monitoring-ui";
import { apiEndpoints, apiThroughput, statusCodeSplit, type ApiEndpointStat } from "@/data/monitoring";
import { compactNumber } from "@/lib/format";

export const Route = createFileRoute("/admin/monitoring/api")({
  head: () => ({
    meta: [
      { title: "API status — CanteenOS monitoring" },
      {
        name: "description",
        content: "Endpoint throughput, latency percentiles and error rates for the CanteenOS API.",
      },
      { property: "og:title", content: "API status — CanteenOS monitoring" },
      { property: "og:description", content: "Throughput, p95 latency and error rates by endpoint." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApiStatus,
});

const methodTone = {
  GET: "info",
  POST: "primary",
  PATCH: "warning",
  DELETE: "danger",
} as const;

function ApiStatus() {
  const total = apiEndpoints.reduce((s, e) => s + e.requests24h, 0);
  const weightedErr =
    apiEndpoints.reduce((s, e) => s + e.errorRate * e.requests24h, 0) / total;
  const p95 = Math.round(
    apiEndpoints.reduce((s, e) => s + e.p95 * e.requests24h, 0) / total,
  );

  const columns: Column<ApiEndpointStat>[] = [
    {
      key: "path",
      header: "Endpoint",
      sortable: true,
      sortValue: (r) => r.path,
      cell: (r) => (
        <span className="flex min-w-0 items-center gap-2">
          <Pill tone={methodTone[r.method]}>{r.method}</Pill>
          <span className="numeric truncate text-sm">{r.path}</span>
        </span>
      ),
    },
    {
      key: "requests24h",
      header: "Requests",
      align: "right",
      sortable: true,
      sortValue: (r) => r.requests24h,
      cell: (r) => <span className="numeric text-sm">{compactNumber(r.requests24h)}</span>,
    },
    {
      key: "p50",
      header: "p50",
      align: "right",
      sortable: true,
      sortValue: (r) => r.p50,
      cell: (r) => <span className="numeric text-sm">{r.p50} ms</span>,
    },
    {
      key: "p95",
      header: "p95",
      align: "right",
      sortable: true,
      sortValue: (r) => r.p95,
      cell: (r) => <span className="numeric text-sm">{r.p95} ms</span>,
    },
    {
      key: "p99",
      header: "p99",
      align: "right",
      sortable: true,
      sortValue: (r) => r.p99,
      cell: (r) => <span className="numeric text-sm">{r.p99} ms</span>,
    },
    {
      key: "errorRate",
      header: "Error rate",
      align: "right",
      sortable: true,
      sortValue: (r) => r.errorRate,
      cell: (r) => (
        <Pill tone={r.errorRate > 0.5 ? "danger" : r.errorRate > 0.2 ? "warning" : "success"}>
          {r.errorRate.toFixed(2)}%
        </Pill>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Requests / 24h" value={compactNumber(total)} delta={{ value: "+8.2%", positive: true }} index={0} />
        <StatCard label="Weighted p95" value={`${p95} ms`} delta={{ value: "-9 ms", positive: true }} index={1} />
        <StatCard label="Error rate" value={`${weightedErr.toFixed(2)}%`} delta={{ value: "-0.04%", positive: true }} index={2} />
        <StatCard label="Endpoints monitored" value={String(apiEndpoints.length)} hint="public + internal" index={3} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartPanel
          title="Requests per hour"
          description="Rolling 24 hours with lunch and dinner peaks."
          className="xl:col-span-2"
          height={280}
        >
          <BarSeries data={apiThroughput} xKey="hour" bars={[{ key: "requests", name: "Requests" }]} />
        </ChartPanel>
        <ChartPanel title="Response codes" description="Share of all responses." height={280} index={1}>
          <DonutChart data={statusCodeSplit} />
        </ChartPanel>
      </div>

      <ChartPanel
        title="p95 latency"
        description="Percentile latency tracks demand — watch the midday shoulder."
        height={260}
      >
        <LineSeries
          data={apiThroughput}
          xKey="hour"
          lines={[{ key: "p95", name: "p95 (ms)", color: "var(--accent)" }]}
          formatter={(v) => `${v} ms`}
        />
      </ChartPanel>

      <SectionCard title="Endpoint breakdown" description="Sorted and searchable across all monitored routes.">
        <DataTable
          rows={apiEndpoints}
          columns={columns}
          searchKeys={(r) => `${r.method} ${r.path}`}
          searchPlaceholder="Search endpoints…"
          pageSize={10}
        />
      </SectionCard>

      <SectionCard title="Service level objectives" description="Targets the platform is measured against.">
        <div className="grid gap-x-8 sm:grid-cols-2">
          <KeyValue label="Availability target">99.9%</KeyValue>
          <KeyValue label="p95 latency target">≤ 300 ms</KeyValue>
          <KeyValue label="Error budget used">18%</KeyValue>
          <KeyValue label="Budget window">30 days</KeyValue>
        </div>
      </SectionCard>
    </div>
  );
}
