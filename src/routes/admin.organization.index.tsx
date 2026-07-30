import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, MapPin, Store, UsersRound } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard, MetricRow, Pill } from "@/components/shared/panels";
import { ChartPanel, BarSeries } from "@/components/shared/charts";
import { useOrg } from "@/contexts/org-context";
import { branchStateMeta, campusComparison, orgKpis } from "@/data/organization";
import { compactNumber, inr } from "@/lib/format";

export const Route = createFileRoute("/admin/organization/")({
  component: OrgOverview,
});

function OrgOverview() {
  const { campus, branches, branch, scopeLabel } = useOrg();
  const scoped = branch ? [branch] : branches;
  const scopedRevenue = scoped.reduce((s, b) => s + b.revenue30d, 0);
  const scopedOrders = scoped.reduce((s, b) => s + b.orders30d, 0);
  const scopedStaff = scoped.reduce((s, b) => s + b.staffCount, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Group revenue · 30d"
          value={inr(orgKpis.revenue30d)}
          delta={{ value: "+14.2%", positive: true }}
          hint="all campuses"
          icon={<Building2 className="size-4" />}
          index={0}
        />
        <StatCard
          label="Group orders · 30d"
          value={compactNumber(orgKpis.orders30d)}
          delta={{ value: "+9.6%", positive: true }}
          hint={`${orgKpis.students.toLocaleString("en-IN")} students served`}
          icon={<UsersRound className="size-4" />}
          index={1}
        />
        <StatCard
          label="Canteens live"
          value={`${orgKpis.activeBranches}/${orgKpis.totalBranches}`}
          hint="1 in maintenance · 1 closed"
          icon={<Store className="size-4" />}
          index={2}
        />
        <StatCard
          label="Avg satisfaction"
          value={orgKpis.avgSatisfaction.toFixed(2)}
          delta={{ value: "+0.1", positive: true }}
          hint={`${orgKpis.staff} staff on payroll`}
          icon={<MapPin className="size-4" />}
          index={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Campus comparison"
          description="30-day revenue by campus. Switch scope from the header to drill into one canteen."
          className="lg:col-span-2"
          index={0}
        >
          <BarSeries
            data={campusComparison}
            xKey="campus"
            bars={[{ key: "revenue", name: "Revenue" }]}
            formatter={inr}
          />
        </ChartPanel>

        <SectionCard
          title="Current scope"
          description={scopeLabel}
          index={1}
          actions={<Pill tone="primary">{campus.code}</Pill>}
        >
          <ul className="space-y-4">
            <MetricRow
              label="Revenue in scope"
              value={inr(scopedRevenue)}
              pct={(scopedRevenue / orgKpis.revenue30d) * 100}
            />
            <MetricRow
              label="Orders in scope"
              value={compactNumber(scopedOrders)}
              pct={(scopedOrders / orgKpis.orders30d) * 100}
              tone="accent"
            />
            <MetricRow
              label="Staff in scope"
              value={String(scopedStaff)}
              pct={(scopedStaff / orgKpis.staff) * 100}
              tone="success"
            />
          </ul>
          <p className="mt-5 text-xs text-muted-foreground">
            Managed by {campus.manager} · {campus.timezone}
          </p>
        </SectionCard>
      </div>

      <SectionCard
        title={`Canteens in ${campus.name}`}
        description="Live state, throughput and utilisation for every outlet in the selected campus."
        index={2}
      >
        <ul className="grid gap-3 md:grid-cols-2">
          {branches.map((b) => {
            const meta = branchStateMeta[b.state];
            return (
              <li key={b.id}>
                <Link
                  to="/admin/organization/canteens"
                  className="block rounded-xl border border-border bg-secondary/30 p-4 transition-colors hover:border-primary/30 hover:bg-secondary/60"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{b.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {b.code} · {b.block}
                      </p>
                    </div>
                    <Pill tone={meta.tone}>{meta.label}</Pill>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <span>
                      <span className="numeric block font-medium">{inr(b.revenue30d)}</span>
                      <span className="text-muted-foreground">revenue</span>
                    </span>
                    <span>
                      <span className="numeric block font-medium">
                        {compactNumber(b.orders30d)}
                      </span>
                      <span className="text-muted-foreground">orders</span>
                    </span>
                    <span>
                      <span className="numeric block font-medium">{b.utilisation}%</span>
                      <span className="text-muted-foreground">utilisation</span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </SectionCard>
    </div>
  );
}
