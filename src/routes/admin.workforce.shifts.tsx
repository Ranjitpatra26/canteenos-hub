import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { DataTable, type Column } from "@/components/shared/data-table";
import { SectionCard, Pill } from "@/components/shared/panels";
import { ChartPanel, BarSeries } from "@/components/shared/charts";
import { Button } from "@/components/ui/button";
import { useOrg } from "@/contexts/org-context";
import { shiftMeta, shiftTemplates, type ShiftTemplate } from "@/data/organization";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/workforce/shifts")({
  component: ShiftsPage,
});

function ShiftsPage() {
  const { allBranches, branch } = useOrg();
  const rows = branch
    ? shiftTemplates.filter((t) => t.branchIds.includes(branch.id))
    : shiftTemplates;

  const columns: Column<ShiftTemplate>[] = [
    {
      key: "name",
      header: "Shift",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={`grid size-7 shrink-0 place-items-center rounded-lg text-[11px] font-semibold ${shiftMeta[r.code].className}`}
          >
            {shiftMeta[r.code].short}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{r.name}</span>
            <span className="block text-xs text-muted-foreground">{shiftMeta[r.code].label}</span>
          </span>
        </span>
      ),
    },
    {
      key: "window",
      header: "Window",
      cell: (r) => (
        <span className="numeric text-sm">
          {r.start} – {r.end}
        </span>
      ),
    },
    {
      key: "break",
      header: "Break",
      align: "right",
      sortable: true,
      sortValue: (r) => r.breakMins,
      cell: (r) => <span className="numeric text-sm">{r.breakMins} min</span>,
    },
    {
      key: "headcount",
      header: "Headcount",
      align: "right",
      sortable: true,
      sortValue: (r) => r.headcount,
      cell: (r) => <span className="numeric text-sm font-medium">{r.headcount}</span>,
    },
    {
      key: "premium",
      header: "Premium",
      align: "right",
      cell: (r) =>
        r.premium ? (
          <Pill tone="warning">+{r.premium}%</Pill>
        ) : (
          <span className="text-xs text-muted-foreground">Standard</span>
        ),
    },
    {
      key: "branches",
      header: "Canteens",
      cell: (r) => (
        <span className="flex flex-wrap gap-1">
          {r.branchIds.slice(0, 3).map((id) => (
            <Pill key={id} tone="muted">
              {allBranches.find((b) => b.id === id)?.code ?? id}
            </Pill>
          ))}
          {r.branchIds.length > 3 ? <Pill tone="muted">+{r.branchIds.length - 3}</Pill> : null}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl"
          onClick={(e) => {
            e.stopPropagation();
            toast.info(`Editing ${r.name}`, {
              description: "Adjust window, break, headcount and premium, then publish to canteens.",
            });
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const chart = shiftTemplates.map((t) => ({
    shift: shiftMeta[t.code].label,
    headcount: t.headcount,
  }));

  return (
    <div className="space-y-6">
      <SectionCard
        title="Shift templates"
        description="Reusable shift definitions published to canteens. Editing a template updates future rotas only."
        index={0}
        actions={
          <Button
            size="sm"
            className="rounded-xl"
            onClick={() =>
              toast.info("New shift template", {
                description: "Define window, break, minimum headcount and pay premium.",
              })
            }
          >
            <Plus className="size-4" /> New shift
          </Button>
        }
      >
        <DataTable
          rows={rows}
          columns={columns}
          searchKeys={(r) => `${r.name} ${r.code}`}
          searchPlaceholder="Search shifts…"
          pageSize={10}
        />
      </SectionCard>

      <ChartPanel
        title="Headcount by shift"
        description="Planned staffing across the group for each shift window."
        index={1}
      >
        <BarSeries data={chart} xKey="shift" bars={[{ key: "headcount", name: "Staff" }]} />
      </ChartPanel>
    </div>
  );
}
