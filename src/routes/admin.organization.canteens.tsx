import { createFileRoute } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/data-table";
import { SectionCard, Pill } from "@/components/shared/panels";
import { ChartPanel, BarSeries } from "@/components/shared/charts";
import { Button } from "@/components/ui/button";
import { ScopeNotice } from "@/components/org/branch-switcher";
import { useOrg } from "@/contexts/org-context";
import { branchStateMeta, branchUtilisation, type Branch } from "@/data/organization";
import { compactNumber, inr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/organization/canteens")({
  component: CanteensPage,
});

function CanteensPage() {
  const { branches, branch, setBranch, campus } = useOrg();
  const rows = branch ? branches.filter((b) => b.id === branch.id) : branches;

  const columns: Column<Branch>[] = [
    {
      key: "name",
      header: "Canteen",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{r.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {r.code} · {r.block}
          </span>
        </span>
      ),
    },
    {
      key: "state",
      header: "State",
      cell: (r) => (
        <Pill tone={branchStateMeta[r.state].tone}>{branchStateMeta[r.state].label}</Pill>
      ),
    },
    { key: "hours", header: "Hours", cell: (r) => <span className="text-sm">{r.openHours}</span> },
    {
      key: "manager",
      header: "Manager",
      cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate text-sm">{r.manager}</span>
          <span className="block text-xs text-muted-foreground">{r.staffCount} staff</span>
        </span>
      ),
    },
    {
      key: "capacity",
      header: "Capacity",
      align: "right",
      sortable: true,
      sortValue: (r) => r.seats,
      cell: (r) => (
        <span className="numeric text-sm">
          {r.seats} seats · {r.counters} counters
        </span>
      ),
    },
    {
      key: "revenue",
      header: "Revenue · 30d",
      align: "right",
      sortable: true,
      sortValue: (r) => r.revenue30d,
      cell: (r) => <span className="numeric text-sm font-medium">{inr(r.revenue30d)}</span>,
    },
    {
      key: "orders",
      header: "Orders",
      align: "right",
      sortable: true,
      sortValue: (r) => r.orders30d,
      cell: (r) => <span className="numeric text-sm">{compactNumber(r.orders30d)}</span>,
    },
    {
      key: "prep",
      header: "Avg prep",
      align: "right",
      sortable: true,
      sortValue: (r) => r.avgPrepMins,
      cell: (r) => <span className="numeric text-sm">{r.avgPrepMins.toFixed(1)} min</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) => (
        <Button
          size="sm"
          variant={r.id === branch?.id ? "secondary" : "outline"}
          className="rounded-xl"
          onClick={(e) => {
            e.stopPropagation();
            setBranch(r.id === branch?.id ? null : r.id);
          }}
        >
          {r.id === branch?.id ? "Clear" : "Focus"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <ScopeNotice count={rows.length} noun="canteens" />

      <SectionCard
        title={`Canteens · ${campus.name}`}
        description="Outlet register with capacity, throughput and service performance."
        index={0}
        actions={
          <Button
            size="sm"
            className="rounded-xl"
            onClick={() =>
              toast.info("New canteen", {
                description: "Create an outlet, assign counters and clone a menu template.",
              })
            }
          >
            <Store className="size-4" /> Add canteen
          </Button>
        }
      >
        <DataTable
          rows={rows}
          columns={columns}
          searchKeys={(r) => `${r.name} ${r.code} ${r.block} ${r.manager}`}
          searchPlaceholder="Search canteens…"
          onRowClick={(r) => setBranch(r.id)}
          selectable
          bulkActions={(selected, clear) => (
            <>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  toast.success(`${selected.length} canteens opened`);
                  clear();
                }}
              >
                Mark open
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  toast.success(`${selected.length} canteens set to maintenance`);
                  clear();
                }}
              >
                Maintenance
              </Button>
            </>
          )}
          pageSize={10}
        />
      </SectionCard>

      <ChartPanel
        title="Utilisation across the group"
        description="Seat and counter utilisation for every canteen, regardless of the active scope."
        index={1}
      >
        <BarSeries
          data={branchUtilisation}
          xKey="branch"
          bars={[{ key: "utilisation", name: "Utilisation %" }]}
          formatter={(v) => `${v}%`}
        />
      </ChartPanel>
    </div>
  );
}
