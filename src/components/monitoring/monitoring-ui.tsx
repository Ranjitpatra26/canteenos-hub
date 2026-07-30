import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { compactNumber, inr } from "@/lib/format";
import { Pill } from "@/components/shared/panels";
import type { ServiceState, ServiceStatus, LiveKpi } from "@/data/monitoring";

export const stateMeta: Record<
  ServiceState,
  { label: string; dot: string; text: string; tone: "success" | "warning" | "danger" | "info" }
> = {
  operational: { label: "Operational", dot: "bg-success", text: "text-success", tone: "success" },
  degraded: { label: "Degraded", dot: "bg-warning", text: "text-warning", tone: "warning" },
  outage: { label: "Outage", dot: "bg-destructive", text: "text-destructive", tone: "danger" },
  maintenance: { label: "Maintenance", dot: "bg-info", text: "text-info", tone: "info" },
};

export function StatusDot({ state, pulse = true }: { state: ServiceState; pulse?: boolean }) {
  const meta = stateMeta[state];
  return (
    <span className="relative grid size-2.5 shrink-0 place-items-center" aria-hidden>
      {pulse && state !== "operational" ? (
        <span className={cn("absolute size-2.5 animate-ping rounded-full opacity-60", meta.dot)} />
      ) : null}
      <span className={cn("size-2.5 rounded-full", meta.dot)} />
    </span>
  );
}

export function UptimeBars({ history, className }: { history: number[]; className?: string }) {
  return (
    <div className={cn("flex items-end gap-[2px]", className)} aria-hidden>
      {history.map((v, i) => (
        <span
          key={i}
          className={cn(
            "h-6 flex-1 rounded-[2px] transition-opacity hover:opacity-70",
            v === 0 && "bg-success/70",
            v === 1 && "bg-warning/80",
            v === 2 && "bg-destructive/85",
          )}
        />
      ))}
    </div>
  );
}

export function ServiceRow({ service, index = 0 }: { service: ServiceStatus; index?: number }) {
  const meta = stateMeta[service.state];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="rounded-xl border border-border/70 bg-card/40 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="mt-1.5">
            <StatusDot state={service.state} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{service.name}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {service.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {service.latencyMs > 0 ? (
            <span className="numeric text-xs text-muted-foreground">{service.latencyMs} ms</span>
          ) : null}
          <Pill tone={meta.tone}>{meta.label}</Pill>
        </div>
      </div>
      <div className="mt-3.5 flex items-center gap-3">
        <UptimeBars history={service.history} className="min-w-0 flex-1" />
        <span className="numeric shrink-0 text-xs text-muted-foreground">
          {service.uptime90d.toFixed(2)}%
        </span>
      </div>
    </motion.div>
  );
}

export function Meter({
  label,
  value,
  max,
  display,
  tone = "primary",
}: {
  label: string;
  value: number;
  max: number;
  display?: string;
  tone?: "primary" | "accent" | "warning" | "success" | "destructive";
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const bar = {
    primary: "bg-primary",
    accent: "bg-accent",
    warning: "bg-warning",
    success: "bg-success",
    destructive: "bg-destructive",
  }[tone];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="numeric text-xs font-medium">{display ?? `${pct}%`}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full rounded-full", bar)}
        />
      </div>
    </div>
  );
}

const formatKpi = (v: number, unit: LiveKpi["unit"]) => {
  if (unit === "inr") return inr(Math.round(v));
  if (unit === "pct") return `${v.toFixed(1)}%`;
  if (unit === "ms") return `${Math.round(v / 60)}m ${Math.round(v % 60)}s`;
  return compactNumber(Math.round(v));
};

/** Ticks a KPI around its baseline so the board feels live. Pauses when hidden. */
export function LiveKpiTile({ kpi, index = 0 }: { kpi: LiveKpi; index?: number }) {
  const [value, setValue] = useState(kpi.value);
  const [up, setUp] = useState(true);
  const base = useRef(kpi.value);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      timer = setInterval(() => {
        setValue((prev) => {
          const step = (Math.random() - 0.45) * kpi.drift;
          const next = Math.max(0, prev + step);
          setUp(step >= 0);
          const drift = Math.abs(next - base.current) / (base.current || 1);
          return drift > 0.06 ? base.current : next;
        });
      }, 2600 + index * 240);
    };
    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [kpi.drift, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="surface-card p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="label-micro min-w-0 truncate">{kpi.label}</p>
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            up ? "bg-success" : "bg-warning",
            "animate-pulse",
          )}
          aria-hidden
        />
      </div>
      <p className="numeric mt-3 text-2xl font-semibold leading-none tracking-[-0.02em]">
        {formatKpi(value, kpi.unit)}
      </p>
      <p className="mt-2 text-[11px] text-muted-foreground">{kpi.hint}</p>
    </motion.div>
  );
}

export function Heatmap({
  rows,
  hours,
  legend = "orders",
}: {
  rows: Array<{ day: string; cells: Array<{ hour: number; value: number }> }>;
  hours: number[];
  legend?: string;
}) {
  const max = Math.max(...rows.flatMap((r) => r.cells.map((c) => c.value)), 1);
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="flex gap-1 pl-11">
          {hours.map((h) => (
            <span
              key={h}
              className="numeric flex-1 text-center text-[10px] text-muted-foreground"
            >
              {String(h).padStart(2, "0")}
            </span>
          ))}
        </div>
        <div className="mt-1.5 space-y-1">
          {rows.map((row, r) => (
            <div key={row.day} className="flex items-center gap-1">
              <span className="w-10 shrink-0 text-[11px] text-muted-foreground">{row.day}</span>
              {row.cells.map((cell, c) => {
                const ratio = cell.value / max;
                return (
                  <motion.span
                    key={cell.hour}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: (r * 3 + c) * 0.004 }}
                    title={`${row.day} ${String(cell.hour).padStart(2, "0")}:00 — ${cell.value} ${legend}`}
                    className="h-7 flex-1 rounded-[5px] ring-1 ring-inset ring-border/40"
                    style={{
                      background: `color-mix(in oklab, var(--primary) ${Math.round(
                        8 + ratio * 88,
                      )}%, transparent)`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 pl-11">
          <span className="text-[11px] text-muted-foreground">Low</span>
          {[10, 30, 50, 70, 92].map((s) => (
            <span
              key={s}
              className="h-3 w-7 rounded-[4px] ring-1 ring-inset ring-border/40"
              style={{ background: `color-mix(in oklab, var(--primary) ${s}%, transparent)` }}
            />
          ))}
          <span className="text-[11px] text-muted-foreground">High</span>
        </div>
      </div>
    </div>
  );
}

export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="numeric text-sm font-medium">{children}</span>
    </div>
  );
}
