import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ExportActions, Pill } from "@/components/shared/panels";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { timeAgo } from "@/lib/format";
import { auditLogs, type AuditLog } from "@/data/admin";

export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit logs — CanteenOS" },
      {
        name: "description",
        content:
          "Immutable record of every administrative action, permission change and system event in CanteenOS.",
      },
      { property: "og:title", content: "Audit logs — CanteenOS" },
      { property: "og:description", content: "Traceable history of admin and system actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuditPage,
});

function AuditPage() {
  const [severity, setSeverity] = useState("all");
  const rows = auditLogs.filter((l) => severity === "all" || l.severity === severity);

  const columns: Column<AuditLog>[] = [
    {
      key: "actor",
      header: "Actor",
      sortable: true,
      sortValue: (r) => r.actor,
      cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{r.actor}</span>
          <span className="block text-xs text-muted-foreground">{r.actorRole}</span>
        </span>
      ),
    },
    { key: "action", header: "Action", cell: (r) => <span className="text-sm">{r.action}</span> },
    {
      key: "entity",
      header: "Entity",
      cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.entity}</span>,
    },
    {
      key: "ip",
      header: "IP",
      cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.ip}</span>,
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      sortValue: (r) => ({ critical: 3, warning: 2, info: 1 })[r.severity],
      cell: (r) => (
        <Pill
          tone={
            r.severity === "critical" ? "danger" : r.severity === "warning" ? "warning" : "info"
          }
        >
          {r.severity}
        </Pill>
      ),
    },
    {
      key: "at",
      header: "When",
      align: "right",
      sortable: true,
      sortValue: (r) => r.at,
      cell: (r) => <span className="text-xs text-muted-foreground">{timeAgo(r.at)}</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Audit logs"
        description="Who changed what, from where, and when."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Audit logs" }]}
        actions={<ExportActions name="Audit log" />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Events logged"
          value={auditLogs.length.toLocaleString("en-IN")}
          index={0}
        />
        <StatCard
          label="Critical events"
          value={String(auditLogs.filter((l) => l.severity === "critical").length)}
          icon={<ShieldAlert className="size-4" />}
          index={1}
        />
        <StatCard
          label="Warnings"
          value={String(auditLogs.filter((l) => l.severity === "warning").length)}
          index={2}
        />
        <StatCard
          label="Unique actors"
          value={String(new Set(auditLogs.map((l) => l.actor)).size)}
          index={3}
        />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        pageSize={12}
        searchKeys={(r) => `${r.actor} ${r.action} ${r.entity} ${r.ip}`}
        searchPlaceholder="Search audit trail…"
        emptyTitle="No audit events"
        toolbar={
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-[160px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        }
      />
    </div>
  );
}
