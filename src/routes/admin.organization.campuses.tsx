import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/data-table";
import { SectionCard, Pill } from "@/components/shared/panels";
import { Button } from "@/components/ui/button";
import { useOrg } from "@/contexts/org-context";
import { campuses, branchesForCampus, type Campus } from "@/data/organization";
import { compactNumber, inr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/organization/campuses")({
  component: CampusesPage,
});

function CampusesPage() {
  const { campusId, setCampus } = useOrg();

  const columns: Column<Campus>[] = [
    {
      key: "name",
      header: "Campus",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {r.name}
            {r.id === campusId ? (
              <Pill tone="primary" className="ml-2">
                Active
              </Pill>
            ) : null}
          </span>
          <span className="block text-xs text-muted-foreground">
            {r.code} · {r.city} · {r.timezone}
          </span>
        </span>
      ),
    },
    {
      key: "manager",
      header: "Director",
      cell: (r) => <span className="text-sm">{r.manager}</span>,
    },
    {
      key: "canteens",
      header: "Canteens",
      align: "right",
      sortable: true,
      sortValue: (r) => r.canteens,
      cell: (r) => (
        <span className="numeric text-sm">{branchesForCampus(r.id).length || r.canteens}</span>
      ),
    },
    {
      key: "students",
      header: "Students",
      align: "right",
      sortable: true,
      sortValue: (r) => r.students,
      cell: (r) => <span className="numeric text-sm">{r.students.toLocaleString("en-IN")}</span>,
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
      header: "Orders · 30d",
      align: "right",
      sortable: true,
      sortValue: (r) => r.orders30d,
      cell: (r) => <span className="numeric text-sm">{compactNumber(r.orders30d)}</span>,
    },
    {
      key: "state",
      header: "State",
      cell: (r) => (
        <Pill
          tone={r.state === "active" ? "success" : r.state === "onboarding" ? "info" : "muted"}
        >
          {r.state}
        </Pill>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) => (
        <Button
          size="sm"
          variant={r.id === campusId ? "secondary" : "outline"}
          className="rounded-xl"
          onClick={(e) => {
            e.stopPropagation();
            setCampus(r.id);
            toast.success(`Switched to ${r.name}`, {
              description: "Every admin page is now scoped to this campus.",
            });
          }}
        >
          {r.id === campusId ? "Current" : "Switch"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <SectionCard
        title="Campuses"
        description="Every physical site in the organization. Switching a campus re-scopes the whole console."
        index={0}
        actions={
          <Button
            size="sm"
            className="rounded-xl"
            onClick={() =>
              toast.info("Campus onboarding", {
                description: "The onboarding wizard collects site, tax and manager details.",
              })
            }
          >
            <Building2 className="size-4" /> Add campus
          </Button>
        }
      >
        <DataTable
          rows={campuses}
          columns={columns}
          searchKeys={(r) => `${r.name} ${r.code} ${r.city} ${r.manager}`}
          searchPlaceholder="Search campuses…"
          onRowClick={(r) => setCampus(r.id)}
          pageSize={10}
        />
      </SectionCard>
    </div>
  );
}
