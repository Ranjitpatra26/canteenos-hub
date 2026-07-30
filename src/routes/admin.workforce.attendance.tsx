import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarCheck2, Clock3, UserMinus, UserX } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard, SegmentedControl } from "@/components/shared/panels";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ChartPanel, BarSeries } from "@/components/shared/charts";
import { AttendanceRing, attendanceMeta } from "@/components/org/org-ui";
import { ScopeNotice } from "@/components/org/branch-switcher";
import { Pill } from "@/components/shared/panels";
import { useOrg } from "@/contexts/org-context";
import {
  attendanceRecords,
  attendanceTrend,
  type AttendanceRecord,
  type AttendanceState,
} from "@/data/organization";
import { shortDate } from "@/lib/format";

export const Route = createFileRoute("/admin/workforce/attendance")({
  component: AttendancePage,
});

const filters: Array<{ value: AttendanceState | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "present", label: "Present" },
  { value: "late", label: "Late" },
  { value: "absent", label: "Absent" },
  { value: "leave", label: "Leave" },
];

function AttendancePage() {
  const { branches, branch, allBranches } = useOrg();
  const [filter, setFilter] = useState<AttendanceState | "all">("all");

  const scoped = useMemo(() => {
    const ids = branch ? [branch.id] : branches.map((b) => b.id);
    return attendanceRecords.filter((r) => ids.includes(r.branchId));
  }, [branches, branch]);

  const rows = scoped.filter((r) => filter === "all" || r.state === filter);
  const present = scoped.filter((r) => r.state === "present" || r.state === "late").length;
  const late = scoped.filter((r) => r.state === "late").length;
  const absent = scoped.filter((r) => r.state === "absent").length;
  const leave = scoped.filter((r) => r.state === "leave").length;
  const rate = scoped.length ? (present / scoped.length) * 100 : 0;
  const hours = scoped.reduce((s, r) => s + r.hours, 0);

  const columns: Column<AttendanceRecord>[] = [
    {
      key: "staff",
      header: "Staff",
      sortable: true,
      sortValue: (r) => r.staffName,
      cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{r.staffName}</span>
          <span className="block text-xs text-muted-foreground">
            {allBranches.find((b) => b.id === r.branchId)?.name ?? r.branchId}
          </span>
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      sortValue: (r) => r.date,
      cell: (r) => <span className="numeric text-sm">{shortDate(r.date)}</span>,
    },
    {
      key: "state",
      header: "State",
      cell: (r) => <Pill tone={attendanceMeta[r.state].tone}>{attendanceMeta[r.state].label}</Pill>,
    },
    {
      key: "clock",
      header: "Clock in / out",
      cell: (r) => (
        <span className="numeric text-sm text-muted-foreground">
          {r.clockIn ? `${r.clockIn} – ${r.clockOut}` : "—"}
        </span>
      ),
    },
    {
      key: "late",
      header: "Late by",
      align: "right",
      sortable: true,
      sortValue: (r) => r.lateMins,
      cell: (r) =>
        r.lateMins ? (
          <span className="numeric text-sm text-warning">{r.lateMins} min</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "hours",
      header: "Hours",
      align: "right",
      sortable: true,
      sortValue: (r) => r.hours,
      cell: (r) => <span className="numeric text-sm font-medium">{r.hours.toFixed(1)}h</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <ScopeNotice count={scoped.length} noun="attendance records" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Attendance rate"
          value={`${rate.toFixed(1)}%`}
          delta={{ value: "+1.4pp", positive: true }}
          hint="last 5 working days"
          icon={<CalendarCheck2 className="size-4" />}
          index={0}
        />
        <StatCard
          label="Late arrivals"
          value={String(late)}
          icon={<Clock3 className="size-4" />}
          delta={{ value: late > 8 ? "+3" : "-2", positive: late <= 8 }}
          index={1}
        />
        <StatCard
          label="Absences"
          value={String(absent)}
          icon={<UserX className="size-4" />}
          hint="unplanned"
          index={2}
        />
        <StatCard
          label="Approved leave"
          value={String(leave)}
          icon={<UserMinus className="size-4" />}
          hint={`${hours.toFixed(0)}h worked in scope`}
          index={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard title="Attendance health" index={0}>
          <AttendanceRing
            value={rate}
            label="On-shift compliance"
            sublabel={`${present} of ${scoped.length} scheduled shifts attended, ${late} with a late clock-in.`}
          />
        </SectionCard>

        <ChartPanel
          title="Attendance trend · 14 days"
          description="Present, late and absent counts group-wide."
          className="lg:col-span-2"
          index={1}
        >
          <BarSeries
            data={attendanceTrend}
            xKey="day"
            stacked
            bars={[
              { key: "present", name: "Present" },
              { key: "late", name: "Late" },
              { key: "absent", name: "Absent" },
            ]}
          />
        </ChartPanel>
      </div>

      <SectionCard
        title="Attendance register"
        description="Clock-in records for the selected scope, newest first."
        index={2}
        actions={
          <SegmentedControl
            value={filter}
            onChange={setFilter}
            options={filters}
          />
        }
      >
        <DataTable
          rows={rows}
          columns={columns}
          searchKeys={(r) => `${r.staffName} ${r.state} ${r.date}`}
          searchPlaceholder="Search staff…"
          pageSize={10}
          emptyTitle="No attendance records"
          emptyDescription="Change the filter or switch to another canteen."
        />
      </SectionCard>
    </div>
  );
}
