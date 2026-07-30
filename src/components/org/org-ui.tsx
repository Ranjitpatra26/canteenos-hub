import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Pill } from "@/components/shared/panels";
import { cn } from "@/lib/utils";
import {
  approvalStateMeta,
  grantMeta,
  shiftMeta,
  weekDays,
  type ApprovalRequest,
  type ApprovalState,
  type AttendanceState,
  type ScheduleAssignment,
  type ShiftCode,
} from "@/data/organization";

export function ShiftChip({ code, className }: { code: ShiftCode; className?: string }) {
  const meta = shiftMeta[code];
  return (
    <span
      title={meta.label}
      className={cn(
        "grid h-8 w-full min-w-8 place-items-center rounded-lg text-[11px] font-semibold",
        meta.className,
        className,
      )}
    >
      {meta.short}
    </span>
  );
}

/** Weekly rota grid: one row per staff member, one cell per weekday. */
export function ScheduleGrid({
  rows,
  branchName,
}: {
  rows: ScheduleAssignment[];
  branchName: (branchId: string) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[46rem] border-separate border-spacing-y-1.5">
        <thead>
          <tr className="text-left">
            <th className="label-micro pb-2 pl-1">Staff</th>
            {weekDays.map((d) => (
              <th key={d} className="label-micro w-[9%] pb-2 text-center">
                {d}
              </th>
            ))}
            <th className="label-micro pb-2 text-right">Hours</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <motion.tr
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="rounded-xl"
            >
              <td className="rounded-l-xl bg-secondary/40 px-3 py-2">
                <span className="block truncate text-sm font-medium">{r.staffName}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {r.role} · {branchName(r.branchId)}
                </span>
              </td>
              {r.week.map((code, di) => (
                <td key={`${r.id}-${di}`} className="bg-secondary/40 px-1 py-2">
                  <ShiftChip code={code} />
                </td>
              ))}
              <td className="rounded-r-xl bg-secondary/40 px-3 py-2 text-right">
                <span className="numeric block text-sm font-medium">{r.hours}h</span>
                {r.overtime ? (
                  <span className="numeric block text-[11px] text-warning">+{r.overtime}h OT</span>
                ) : (
                  <span className="block text-[11px] text-muted-foreground">no OT</span>
                )}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const attendanceMeta: Record<
  AttendanceState,
  { label: string; tone: "success" | "warning" | "danger" | "info" | "muted" }
> = {
  present: { label: "Present", tone: "success" },
  late: { label: "Late", tone: "warning" },
  absent: { label: "Absent", tone: "danger" },
  leave: { label: "On leave", tone: "info" },
  holiday: { label: "Holiday", tone: "muted" },
};

/** Circular completion gauge used for attendance rate. */
export function AttendanceRing({
  value,
  label,
  sublabel,
}: {
  value: number;
  label: string;
  sublabel?: string;
}) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-[110px] shrink-0">
        <svg viewBox="0 0 110 110" className="size-full -rotate-90">
          <circle cx="55" cy="55" r={r} className="fill-none stroke-muted" strokeWidth="9" />
          <motion.circle
            cx="55"
            cy="55"
            r={r}
            className="fill-none stroke-primary"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c - (Math.min(100, value) / 100) * c }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <span className="numeric absolute inset-0 grid place-items-center text-lg font-semibold">
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {sublabel ? <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p> : null}
      </div>
    </div>
  );
}

/** Horizontal approval chain with per-step state. */
export function ApprovalChain({ chain }: { chain: ApprovalRequest["chain"] }) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {chain.map((step, i) => {
        const meta = approvalStateMeta[step.state];
        return (
          <li key={`${step.role}-${i}`} className="flex items-center gap-2">
            <span className="rounded-xl border border-border bg-secondary/40 px-2.5 py-1.5">
              <span className="block text-[11px] font-medium leading-tight">{step.role}</span>
              <span className="block text-[10px] leading-tight text-muted-foreground">
                {step.approver}
                {step.at ? ` · ${step.at}` : ""}
              </span>
            </span>
            <Pill tone={meta.tone}>{meta.label}</Pill>
            {i < chain.length - 1 ? (
              <span className="text-muted-foreground" aria-hidden>
                →
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function StateBadge({ state }: { state: ApprovalState }) {
  const meta = approvalStateMeta[state];
  return <Pill tone={meta.tone}>{meta.label}</Pill>;
}

export function GrantCell({ level }: { level: "full" | "write" | "read" | "none" }) {
  const meta = grantMeta[level];
  return <Pill tone={meta.tone}>{meta.label}</Pill>;
}

export function KeyValueRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}
