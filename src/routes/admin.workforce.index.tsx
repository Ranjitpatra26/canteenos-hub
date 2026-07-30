import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock, Clock, UsersRound, Wand2 } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard, Pill, SegmentedControl } from "@/components/shared/panels";
import { ScheduleGrid } from "@/components/org/org-ui";
import { ScopeNotice } from "@/components/org/branch-switcher";
import { Button } from "@/components/ui/button";
import { useOrg } from "@/contexts/org-context";
import { scheduleAssignments, shiftMeta, shiftTemplates } from "@/data/organization";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/workforce/")({
  component: SchedulePage,
});

function SchedulePage() {
  const { branches, branch, allBranches } = useOrg();
  const [view, setView] = useState<"week" | "coverage">("week");

  const rows = useMemo(() => {
    const ids = branch ? [branch.id] : branches.map((b) => b.id);
    return scheduleAssignments.filter((a) => ids.includes(a.branchId));
  }, [branches, branch]);

  const branchName = (id: string) => allBranches.find((b) => b.id === id)?.code ?? id;
  const totalHours = rows.reduce((s, r) => s + r.hours, 0);
  const overtime = rows.reduce((s, r) => s + r.overtime, 0);
  const uncovered = rows.length ? Math.max(0, 7 - new Set(rows.flatMap((r) => r.week)).size) : 0;

  const coverage = ["morning", "afternoon", "evening", "night"].map((code) => {
    const count = rows.reduce(
      (s, r) => s + r.week.filter((d) => d === code).length,
      0,
    );
    return { code: code as keyof typeof shiftMeta, count };
  });
  const maxCover = Math.max(1, ...coverage.map((c) => c.count));

  return (
    <div className="space-y-6">
      <ScopeNotice count={rows.length} noun="rostered staff" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Rostered staff"
          value={String(rows.length)}
          icon={<UsersRound className="size-4" />}
          hint="this week"
          index={0}
        />
        <StatCard
          label="Scheduled hours"
          value={`${totalHours}h`}
          icon={<Clock className="size-4" />}
          delta={{ value: "-3.5% vs last week", positive: true }}
          index={1}
        />
        <StatCard
          label="Overtime"
          value={`${overtime}h`}
          icon={<CalendarClock className="size-4" />}
          delta={{ value: overtime > 10 ? "+2h" : "on budget", positive: overtime <= 10 }}
          index={2}
        />
        <StatCard
          label="Coverage gaps"
          value={String(uncovered)}
          hint={uncovered ? "needs attention" : "all shifts covered"}
          icon={<Wand2 className="size-4" />}
          index={3}
        />
      </div>

      <SectionCard
        title="Weekly rota"
        description="Monday-first roster for the selected scope. M = morning, A = afternoon, E = evening, N = night."
        index={0}
        actions={
          <>
            <SegmentedControl
              value={view}
              onChange={setView}
              options={[
                { value: "week", label: "Grid" },
                { value: "coverage", label: "Coverage" },
              ]}
            />
            <Button
              size="sm"
              className="rounded-xl"
              onClick={() =>
                toast.success("Auto-scheduler queued", {
                  description: "Balances hours, honours leave and respects overtime caps.",
                })
              }
            >
              <Wand2 className="size-4" /> Auto-fill
            </Button>
          </>
        }
      >
        {view === "week" ? (
          <ScheduleGrid rows={rows} branchName={branchName} />
        ) : (
          <ul className="space-y-4">
            {coverage.map((c) => (
              <li key={c.code} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <Pill tone="muted">{shiftMeta[c.code].short}</Pill>
                    {shiftMeta[c.code].label}
                  </span>
                  <span className="numeric font-medium">{c.count} slots</span>
                </div>
                <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${(c.count / maxCover) * 100}%` }}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <span>Legend:</span>
          {Object.entries(shiftMeta).map(([code, meta]) => (
            <span key={code} className="flex items-center gap-1.5">
              <span className={`grid size-5 place-items-center rounded ${meta.className}`}>
                {meta.short}
              </span>
              {meta.label}
            </span>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Shift templates in use"
        description="Templates applied to the canteens in this scope."
        index={1}
      >
        <ul className="grid gap-3 md:grid-cols-2">
          {shiftTemplates.map((t) => (
            <li
              key={t.id}
              className="rounded-xl border border-border bg-secondary/30 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="numeric text-xs text-muted-foreground">
                    {t.start} – {t.end} · {t.breakMins} min break
                  </p>
                </div>
                <Pill tone="primary">{t.headcount} staff</Pill>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t.branchIds.length} canteens
                {t.premium ? ` · +${t.premium}% shift premium` : " · standard rate"}
              </p>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
