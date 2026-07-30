import { cloneElement, isValidElement, useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { motion } from "motion/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { compactNumber, inr } from "@/lib/format";

export const chartPalette = [
  "var(--primary)",
  "var(--accent)",
  "var(--info)",
  "var(--warning)",
  "var(--success)",
  "var(--destructive)",
];

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  tickMargin: 10,
  style: { fontVariantNumeric: "tabular-nums" as const },
};

/** One grid treatment for every chart in the app. */
const grid = {
  stroke: "color-mix(in oklab, var(--border) 85%, transparent)",
  strokeDasharray: "2 6",
} as const;

function TooltipBox({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string; dataKey?: string }>;
  label?: string | number;
  formatter?: (v: number, key: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="numeric min-w-[9rem] rounded-xl border border-border bg-popover/95 px-3 py-2.5 text-xs shadow-[var(--shadow-lg),var(--shadow-hairline)] backdrop-blur-xl">
      {label !== undefined ? (
        <p className="mb-2 font-semibold tracking-tight text-foreground">{label}</p>
      ) : null}
      <ul className="space-y-1">
        {payload.map((p, i) => (
          <li key={i} className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            <span className="capitalize">{p.name}</span>
            <span className="ml-auto font-medium text-foreground">
              {typeof p.value === "number"
                ? formatter
                  ? formatter(p.value, String(p.dataKey ?? p.name))
                  : compactNumber(p.value)
                : p.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Measures its own box and hands explicit pixel dimensions to the chart.
 * Recharts' own ResponsiveContainer never resolved a width in this app, which
 * left every panel blank — this keeps charts responsive without relying on it.
 */
export function AutoSize({ height, children }: { height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth || el.getBoundingClientRect().width || el.parentElement?.clientWidth || 0;
      if (w > 0) setWidth(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const effectiveWidth =
    width || (typeof window !== "undefined" ? Math.min(window.innerWidth - 64, 750) : 500);

  return (
    <div ref={ref} className="w-full" style={{ height }}>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<{ width?: number; height?: number }>, {
            width: effectiveWidth,
            height,
          })
        : null}
    </div>
  );
}


export function ChartPanel({
  title,
  description,
  actions,
  children,
  className,
  height = 280,
  index = 0,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  height?: number;
  index?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn("surface-card p-5 sm:p-6", className)}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[0.9375rem] font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <AutoSize height={height}>{children}</AutoSize>

    </motion.section>
  );
}

const money = (v: number) => inr(v);

export function RevenueArea({
  data,
  xKey = "day",
  yKey = "revenue",
  secondKey,
  width,
  height,
}: {
  data: object[];
  xKey?: string;
  yKey?: string;
  secondKey?: string;
  width?: number;
  height?: number;
}) {
  return (
    <ResponsiveContainer width={width ?? "100%"} height={height ?? "100%"} minWidth={100} minHeight={100}>
      <AreaChart width={width} height={height} data={data} margin={{ left: -14, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gRev2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...grid} vertical={false} />
        <XAxis dataKey={xKey} {...axis} />
        <YAxis {...axis} tickFormatter={(v: number) => compactNumber(v)} width={52} />
        <Tooltip content={<TooltipBox formatter={money} />} cursor={{ stroke: "var(--border)" }} />
        {secondKey ? (
          <Area
            type="monotone"
            dataKey={secondKey}
            stroke="var(--accent)"
            strokeWidth={2}
            fill="url(#gRev2)"
          />
        ) : null}
        <Area
          type="monotone"
          dataKey={yKey}
          stroke="var(--primary)"
          strokeWidth={2.4}
          fill="url(#gRev)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarSeries({
  data,
  xKey,
  bars,
  stacked,
  horizontal,
  formatter,
  width,
  height,
}: {
  data: object[];
  xKey: string;
  bars: Array<{ key: string; color?: string; name?: string }>;
  stacked?: boolean;
  horizontal?: boolean;
  formatter?: (v: number) => string;
  width?: number;
  height?: number;
}) {
  return (
    <ResponsiveContainer width={width ?? "100%"} height={height ?? "100%"} minWidth={100} minHeight={100}>
      <BarChart
        width={width}
        height={height}
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ left: horizontal ? 24 : -14, right: 8, top: 8 }}
      >
        <CartesianGrid {...grid} vertical={horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" {...axis} tickFormatter={(v: number) => compactNumber(v)} />
            <YAxis type="category" dataKey={xKey} {...axis} width={120} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...axis} />
            <YAxis {...axis} tickFormatter={(v: number) => compactNumber(v)} width={48} />
          </>
        )}
        <Tooltip
          content={<TooltipBox formatter={formatter ? (v) => formatter(v) : undefined} />}
          cursor={{ fill: "color-mix(in oklab, var(--muted) 50%, transparent)" }}
        />
        {bars.length > 1 ? (
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        ) : null}
        {bars.map((b, i) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            name={b.name ?? b.key}
            stackId={stacked ? "a" : undefined}
            fill={b.color ?? chartPalette[i % chartPalette.length]}
            radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]}
            maxBarSize={horizontal ? 20 : 44}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineSeries({
  data,
  xKey,
  lines,
  formatter,
  width,
  height,
}: {
  data: object[];
  xKey: string;
  lines: Array<{ key: string; color?: string; name?: string }>;
  formatter?: (v: number) => string;
  width?: number;
  height?: number;
}) {
  return (
    <ResponsiveContainer width={width ?? "100%"} height={height ?? "100%"} minWidth={100} minHeight={100}>
      <LineChart width={width} height={height} data={data} margin={{ left: -14, right: 8, top: 8 }}>
        <CartesianGrid {...grid} vertical={false} />
        <XAxis dataKey={xKey} {...axis} />
        <YAxis {...axis} tickFormatter={(v: number) => compactNumber(v)} width={48} />
        <Tooltip content={<TooltipBox formatter={formatter ? (v) => formatter(v) : undefined} />} />
        {lines.length > 1 ? (
          <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        ) : null}
        {lines.map((l, i) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name ?? l.key}
            stroke={l.color ?? chartPalette[i % chartPalette.length]}
            strokeWidth={2.4}
            dot={{ r: 2.5, strokeWidth: 0, fill: l.color ?? chartPalette[i % chartPalette.length] }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({
  data,
  unit = "%",
  width,
  height,
}: {
  data: Array<{ name: string; value: number }>;
  unit?: string;
  width?: number;
  height?: number;
}) {
  return (
    <ResponsiveContainer width={width ?? "100%"} height={height ?? "100%"} minWidth={100} minHeight={100}>
      <PieChart width={width} height={height}>
        <Tooltip content={<TooltipBox formatter={(v) => `${v}${unit}`} />} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={3}
          stroke="var(--card)"
          strokeWidth={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={chartPalette[i % chartPalette.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function RadarSeries({
  data,
  angleKey,
  valueKey,
  width,
  height,
}: {
  data: object[];
  angleKey: string;
  valueKey: string;
  width?: number;
  height?: number;
}) {
  return (
    <ResponsiveContainer width={width ?? "100%"} height={height ?? "100%"} minWidth={100} minHeight={100}>
      <RadarChart width={width} height={height} data={data} outerRadius="72%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey={angleKey} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <Tooltip content={<TooltipBox />} />
        <Radar
          dataKey={valueKey}
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
