import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RangeId = "7d" | "30d" | "90d" | "12m";

export const RANGES: { id: RangeId; label: string; months: number; days: number }[] = [
  { id: "7d", label: "7 days", months: 1, days: 7 },
  { id: "30d", label: "30 days", months: 2, days: 30 },
  { id: "90d", label: "90 days", months: 3, days: 90 },
  { id: "12m", label: "12 months", months: 12, days: 365 },
];

interface RangeState {
  range: RangeId;
  setRange: (r: RangeId) => void;
  /** Bumped by the refresh button — include it in keys/deps to force a re-read. */
  refreshKey: number;
  refresh: () => void;
  refreshedAt: Date;
  /** Trims a monthly series down to the selected window. */
  slice: <T>(rows: T[], unit?: "months" | "days") => T[];
}

const Ctx = createContext<RangeState | null>(null);

export function AnalyticsRangeProvider({ children }: { children: React.ReactNode }) {
  const [range, setRange] = useState<RangeId>("12m");
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setRefreshedAt(new Date());
  }, []);

  const value = useMemo<RangeState>(() => {
    const cfg = RANGES.find((r) => r.id === range) ?? RANGES[3];
    return {
      range,
      setRange,
      refreshKey,
      refresh,
      refreshedAt,
      slice: <T,>(rows: T[], unit: "months" | "days" = "months") => {
        const take = unit === "months" ? cfg.months : cfg.days;
        return rows.slice(Math.max(0, rows.length - take));
      },
    };
  }, [range, refreshKey, refresh, refreshedAt]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAnalyticsRange() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAnalyticsRange must be used inside AnalyticsRangeProvider");
  return ctx;
}

/** Range chips + manual refresh, rendered in the analytics header. */
export function AnalyticsRangeControls({ className }: { className?: string }) {
  const { range, setRange, refresh, refreshedAt } = useAnalyticsRange();
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <div
        role="radiogroup"
        aria-label="Time range"
        className="flex gap-1 rounded-xl border border-border bg-card/60 p-1"
      >
        {RANGES.map((r) => (
          <button
            key={r.id}
            role="radio"
            aria-checked={range === r.id}
            onClick={() => setRange(r.id)}
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              range === r.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
      <Button variant="outline" size="sm" className="rounded-xl" onClick={refresh}>
        <RefreshCw className="size-3.5" /> Refresh
      </Button>
      <span className="text-[11px] text-muted-foreground" aria-live="polite">
        Updated{" "}
        {refreshedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </span>
    </div>
  );
}
