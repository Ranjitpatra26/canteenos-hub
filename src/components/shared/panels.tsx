import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { collectPageData, exportExcel, exportPdf, printPage } from "@/lib/export";

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  index = 0,
  padded = true,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  index?: number;
  padded?: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={cn("surface-card", padded && "p-5 sm:p-6", className)}
    >
      {title ? (
        <div
          className={cn(
            "mb-4 flex flex-wrap items-start justify-between gap-3",
            !padded && "p-5 pb-0",
          )}
        >
          <div className="min-w-0">
            <h2 className="text-[0.9375rem] font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </motion.section>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-border bg-secondary/50 p-1 shadow-[var(--shadow-xs)]",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            value === o.value
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {value === o.value ? (
            <motion.span
              layoutId={`seg-${options.map((x) => x.value).join("-")}`}
              className="absolute inset-0 rounded-lg bg-primary"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          ) : null}
          <span className="relative z-10">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export function ExportActions({ name = "report" }: { name?: string }) {
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (kind: "PDF" | "Excel") => {
    setBusy(kind);
    try {
      const payload = collectPageData(name);
      if (kind === "PDF") await exportPdf(payload);
      else await exportExcel(payload);
      toast.success(`${kind} downloaded`, { description: `${name} saved to your device.` });
    } catch (e) {
      toast.error(`${kind} export failed`, {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl"
        disabled={busy !== null}
        onClick={() => void run("PDF")}
      >
        {busy === "PDF" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}{" "}
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl"
        disabled={busy !== null}
        onClick={() => void run("Excel")}
      >
        {busy === "Excel" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="size-4" />
        )}{" "}
        Excel
      </Button>
      <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => printPage()}>
        <Printer className="size-4" /> Print
      </Button>
    </div>
  );
}


export function MetricRow({
  label,
  value,
  pct,
  tone = "primary",
}: {
  label: string;
  value: string;
  pct: number;
  tone?: "primary" | "accent" | "warning" | "success" | "destructive";
}) {
  const bar = {
    primary: "bg-primary",
    accent: "bg-accent",
    warning: "bg-warning",
    success: "bg-success",
    destructive: "bg-destructive",
  }[tone];
  return (
    <li className="space-y-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate">{label}</span>
        <span className="numeric shrink-0 font-medium">{value}</span>
      </div>
      <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.span
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={cn("block h-full rounded-full", bar)}
        />
      </span>
    </li>
  );
}

export function Timeline({
  items,
}: {
  items: Array<{
    id: string;
    title: string;
    detail?: string;
    time: string;
    icon?: ReactNode;
    tone?: string;
  }>;
}) {
  return (
    <ol className="relative space-y-5 pl-6">
      <span className="absolute left-[9px] top-2 bottom-2 w-px bg-border" aria-hidden />
      {items.map((it, i) => (
        <motion.li
          key={it.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
          className="relative"
        >
          <span className="absolute -left-6 top-0.5 grid size-[19px] place-items-center rounded-full border border-border bg-card text-primary">
            {it.icon ?? <span className="size-1.5 rounded-full bg-primary" />}
          </span>
          <p className="text-sm font-medium leading-tight">{it.title}</p>
          {it.detail ? <p className="mt-0.5 text-xs text-muted-foreground">{it.detail}</p> : null}
          <p className="mt-1 text-[11px] text-muted-foreground">{it.time}</p>
        </motion.li>
      ))}
    </ol>
  );
}

export function Pill({
  children,
  tone = "muted",
  className,
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/15 text-destructive",
    info: "bg-info/15 text-info",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
