import { createFileRoute } from "@tanstack/react-router";
import { BarSeries, ChartPanel } from "@/components/shared/charts";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Pill, SectionCard } from "@/components/shared/panels";
import { StatCard } from "@/components/shared/stat-card";
import { KeyValue, Meter } from "@/components/monitoring/monitoring-ui";
import {
  dbConnections,
  dbHealth,
  dbTables,
  slowQueries,
  type DbTableStat,
  type SlowQuery,
} from "@/data/monitoring";
import { compactNumber, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/admin/monitoring/database")({
  head: () => ({
    meta: [
      { title: "Database status — CanteenOS monitoring" },
      {
        name: "description",
        content:
          "Connection saturation, storage, cache hit ratio, table sizes and slow queries for the CanteenOS database.",
      },
      { property: "og:title", content: "Database status — CanteenOS monitoring" },
      { property: "og:description", content: "Connections, storage, cache hits and slow queries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DatabaseStatus,
});

function DatabaseStatus() {
  const tableColumns: Column<DbTableStat>[] = [
    {
      key: "table",
      header: "Table",
      sortable: true,
      sortValue: (r) => r.table,
      cell: (r) => <span className="numeric text-sm font-medium">{r.table}</span>,
    },
    {
      key: "rows",
      header: "Rows",
      align: "right",
      sortable: true,
      sortValue: (r) => r.rows,
      cell: (r) => <span className="numeric text-sm">{compactNumber(r.rows)}</span>,
    },
    {
      key: "sizeMb",
      header: "Size",
      align: "right",
      sortable: true,
      sortValue: (r) => r.sizeMb,
      cell: (r) => <span className="numeric text-sm">{r.sizeMb} MB</span>,
    },
    {
      key: "indexHitPct",
      header: "Index hits",
      align: "right",
      sortable: true,
      sortValue: (r) => r.indexHitPct,
      cell: (r) => (
        <Pill tone={r.indexHitPct >= 99 ? "success" : "warning"}>{r.indexHitPct.toFixed(1)}%</Pill>
      ),
    },
    {
      key: "seqScans",
      header: "Seq scans",
      align: "right",
      sortable: true,
      sortValue: (r) => r.seqScans,
      cell: (r) => <span className="numeric text-sm">{compactNumber(r.seqScans)}</span>,
    },
  ];

  const queryColumns: Column<SlowQuery>[] = [
    {
      key: "statement",
      header: "Statement",
      cell: (r) => (
        <span className="numeric block max-w-[42ch] truncate text-xs">{r.statement}</span>
      ),
    },
    {
      key: "calls",
      header: "Calls",
      align: "right",
      sortable: true,
      sortValue: (r) => r.calls,
      cell: (r) => <span className="numeric text-sm">{compactNumber(r.calls)}</span>,
    },
    {
      key: "meanMs",
      header: "Mean",
      align: "right",
      sortable: true,
      sortValue: (r) => r.meanMs,
      cell: (r) => (
        <Pill tone={r.meanMs > 300 ? "danger" : r.meanMs > 100 ? "warning" : "success"}>
          {r.meanMs} ms
        </Pill>
      ),
    },
    {
      key: "totalMs",
      header: "Total time",
      align: "right",
      sortable: true,
      sortValue: (r) => r.totalMs,
      cell: (r) => <span className="numeric text-sm">{(r.totalMs / 1000).toFixed(1)} s</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Database size"
          value={`${dbHealth.sizeGb} GB`}
          hint={`of ${dbHealth.sizeLimitGb} GB disk`}
          index={0}
        />
        <StatCard
          label="Active connections"
          value={String(dbHealth.connections)}
          hint={`limit ${dbHealth.connectionLimit}`}
          index={1}
        />
        <StatCard
          label="Cache hit ratio"
          value={`${dbHealth.cacheHitPct}%`}
          delta={{ value: "+0.2%", positive: true }}
          index={2}
        />
        <StatCard
          label="Replication lag"
          value={`${dbHealth.replicationLagMs} ms`}
          delta={{ value: "healthy", positive: true }}
          index={3}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Saturation" description="Headroom before a resize is required.">
          <div className="space-y-5">
            <Meter
              label="Disk usage"
              value={dbHealth.sizeGb}
              max={dbHealth.sizeLimitGb}
              display={`${dbHealth.sizeGb} / ${dbHealth.sizeLimitGb} GB`}
            />
            <Meter
              label="Connections"
              value={dbHealth.connections}
              max={dbHealth.connectionLimit}
              display={`${dbHealth.connections} / ${dbHealth.connectionLimit}`}
              tone="accent"
            />
            <Meter
              label="Write-ahead log"
              value={dbHealth.walSizeMb}
              max={512}
              display={`${dbHealth.walSizeMb} MB`}
              tone="warning"
            />
          </div>
          <div className="mt-5 grid gap-x-8">
            <KeyValue label="Deadlocks (24h)">{dbHealth.deadlocks24h}</KeyValue>
            <KeyValue label="Rolled back (24h)">{dbHealth.rollbacks24h}</KeyValue>
            <KeyValue label="Last backup">{timeAgo(dbHealth.lastBackup)}</KeyValue>
            <KeyValue label="Row level security">Enforced</KeyValue>
          </div>
        </SectionCard>

        <ChartPanel
          title="Connections by hour"
          description="Active versus idle pooled connections."
          className="xl:col-span-2"
          height={320}
          index={1}
        >
          <BarSeries
            data={dbConnections}
            xKey="hour"
            stacked
            bars={[
              { key: "active", name: "Active" },
              { key: "idle", name: "Idle", color: "var(--muted-foreground)" },
            ]}
          />
        </ChartPanel>
      </div>

      <SectionCard title="Tables" description="Row counts, storage and index efficiency.">
        <DataTable
          rows={dbTables}
          columns={tableColumns}
          searchKeys={(r) => r.table}
          searchPlaceholder="Search tables…"
          pageSize={8}
        />
      </SectionCard>

      <SectionCard title="Slow queries" description="Highest total execution time over the last 24 hours.">
        <DataTable
          rows={slowQueries}
          columns={queryColumns}
          searchKeys={(r) => r.statement}
          searchPlaceholder="Search statements…"
          pageSize={6}
        />
      </SectionCard>
    </div>
  );
}
