/**
 * Monitoring mock data.
 *
 * Every export here mirrors the shape a real provider (Sentry issues,
 * PostHog insights, Supabase health) would return, so swapping the source
 * later is a data-layer change only — no UI rewrites.
 */

export type ServiceState = "operational" | "degraded" | "outage" | "maintenance";

export interface ServiceStatus {
  id: string;
  name: string;
  group: "Application" | "API" | "Database" | "Infrastructure";
  state: ServiceState;
  uptime90d: number;
  latencyMs: number;
  description: string;
  /** 90 daily buckets, newest last. 0 = ok, 1 = degraded, 2 = outage. */
  history: number[];
}

const seededHistory = (seed: number, incidents: number[] = []) =>
  Array.from({ length: 90 }, (_, i) => {
    if (incidents.includes(i)) return 2;
    return (i * seed) % 37 === 0 ? 1 : 0;
  });

export const services: ServiceStatus[] = [
  {
    id: "svc-web",
    name: "Web application",
    group: "Application",
    state: "operational",
    uptime90d: 99.98,
    latencyMs: 214,
    description: "Student, kitchen and admin workspaces served from the edge.",
    history: seededHistory(7),
  },
  {
    id: "svc-ssr",
    name: "SSR renderer",
    group: "Application",
    state: "operational",
    uptime90d: 99.94,
    latencyMs: 168,
    description: "Server rendering and route loaders.",
    history: seededHistory(11),
  },
  {
    id: "svc-rest",
    name: "REST API",
    group: "API",
    state: "operational",
    uptime90d: 99.96,
    latencyMs: 92,
    description: "Menu, orders, inventory and coupon endpoints.",
    history: seededHistory(5),
  },
  {
    id: "svc-realtime",
    name: "Realtime channel",
    group: "API",
    state: "degraded",
    uptime90d: 99.42,
    latencyMs: 310,
    description: "Live order status broadcast to students and kitchen boards.",
    history: seededHistory(13, [3, 4]),
  },
  {
    id: "svc-auth",
    name: "Authentication",
    group: "API",
    state: "operational",
    uptime90d: 99.99,
    latencyMs: 121,
    description: "Sessions, role claims and password recovery.",
    history: seededHistory(17),
  },
  {
    id: "svc-db",
    name: "Primary database",
    group: "Database",
    state: "operational",
    uptime90d: 99.99,
    latencyMs: 14,
    description: "Postgres primary with row level security enforced.",
    history: seededHistory(19),
  },
  {
    id: "svc-pooler",
    name: "Connection pooler",
    group: "Database",
    state: "operational",
    uptime90d: 99.97,
    latencyMs: 9,
    description: "Transaction pooling in front of the primary.",
    history: seededHistory(23),
  },
  {
    id: "svc-storage",
    name: "Object storage",
    group: "Infrastructure",
    state: "operational",
    uptime90d: 99.95,
    latencyMs: 143,
    description: "Menu imagery and avatar buckets.",
    history: seededHistory(29),
  },
  {
    id: "svc-cdn",
    name: "CDN & assets",
    group: "Infrastructure",
    state: "operational",
    uptime90d: 100,
    latencyMs: 38,
    description: "Static bundles, fonts and PWA shell.",
    history: seededHistory(31),
  },
  {
    id: "svc-jobs",
    name: "Scheduled jobs",
    group: "Infrastructure",
    state: "maintenance",
    uptime90d: 99.8,
    latencyMs: 0,
    description: "Nightly reporting rollups and inventory reconciliation.",
    history: seededHistory(37),
  },
];

export interface Incident {
  id: string;
  title: string;
  state: "investigating" | "identified" | "monitoring" | "resolved";
  impact: "minor" | "major" | "critical";
  startedAt: string;
  durationMins: number;
  services: string[];
  summary: string;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const incidents: Incident[] = [
  {
    id: "inc-1041",
    title: "Realtime order updates delayed",
    state: "monitoring",
    impact: "minor",
    startedAt: hoursAgo(3),
    durationMins: 42,
    services: ["Realtime channel"],
    summary:
      "Broadcast fan-out queued behind a lunch-hour spike. Kitchen boards refreshed up to 25s late.",
  },
  {
    id: "inc-1038",
    title: "Elevated checkout error rate",
    state: "resolved",
    impact: "major",
    startedAt: hoursAgo(52),
    durationMins: 18,
    services: ["REST API", "Primary database"],
    summary: "A slow coupon lookup query saturated the pooler during peak checkout traffic.",
  },
  {
    id: "inc-1033",
    title: "Image uploads failing for large files",
    state: "resolved",
    impact: "minor",
    startedAt: hoursAgo(140),
    durationMins: 96,
    services: ["Object storage"],
    summary: "Uploads above 4 MB rejected after a bucket policy change. Limit restored to 8 MB.",
  },
];

export interface ApiEndpointStat {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  requests24h: number;
  p50: number;
  p95: number;
  p99: number;
  errorRate: number;
}

export const apiEndpoints: ApiEndpointStat[] = [
  {
    id: "ep-1",
    method: "GET",
    path: "/api/menu-items",
    requests24h: 48_210,
    p50: 42,
    p95: 118,
    p99: 240,
    errorRate: 0.04,
  },
  {
    id: "ep-2",
    method: "GET",
    path: "/api/orders",
    requests24h: 31_884,
    p50: 58,
    p95: 164,
    p99: 402,
    errorRate: 0.11,
  },
  {
    id: "ep-3",
    method: "POST",
    path: "/api/orders",
    requests24h: 9_140,
    p50: 121,
    p95: 386,
    p99: 812,
    errorRate: 0.42,
  },
  {
    id: "ep-4",
    method: "POST",
    path: "/api/checkout",
    requests24h: 8_902,
    p50: 168,
    p95: 512,
    p99: 1_140,
    errorRate: 0.68,
  },
  {
    id: "ep-5",
    method: "PATCH",
    path: "/api/orders/:id/status",
    requests24h: 27_460,
    p50: 49,
    p95: 132,
    p99: 288,
    errorRate: 0.09,
  },
  {
    id: "ep-6",
    method: "GET",
    path: "/api/inventory",
    requests24h: 6_318,
    p50: 66,
    p95: 190,
    p99: 430,
    errorRate: 0.02,
  },
  {
    id: "ep-7",
    method: "POST",
    path: "/api/auth/session",
    requests24h: 12_774,
    p50: 88,
    p95: 214,
    p99: 466,
    errorRate: 0.21,
  },
  {
    id: "ep-8",
    method: "GET",
    path: "/api/coupons",
    requests24h: 4_106,
    p50: 37,
    p95: 96,
    p99: 188,
    errorRate: 0.01,
  },
  {
    id: "ep-9",
    method: "DELETE",
    path: "/api/cart/:id",
    requests24h: 2_940,
    p50: 44,
    p95: 108,
    p99: 202,
    errorRate: 0.06,
  },
];

/** Request volume + latency by hour for the last 24 hours. */
export const apiThroughput = Array.from({ length: 24 }, (_, h) => {
  const peak = h >= 11 && h <= 14 ? 3.1 : h >= 18 && h <= 20 ? 2.2 : 1;
  return {
    hour: `${String(h).padStart(2, "0")}:00`,
    requests: Math.round((900 + ((h * 137) % 420)) * peak),
    errors: Math.round((3 + ((h * 7) % 9)) * peak),
    p95: Math.round((110 + ((h * 23) % 70)) * (peak > 2 ? 1.7 : 1)),
  };
});

export const statusCodeSplit = [
  { name: "2xx", value: 96.8 },
  { name: "3xx", value: 1.6 },
  { name: "4xx", value: 1.3 },
  { name: "5xx", value: 0.3 },
];

export interface DbTableStat {
  id: string;
  table: string;
  rows: number;
  sizeMb: number;
  indexHitPct: number;
  seqScans: number;
}

export const dbTables: DbTableStat[] = [
  { id: "t1", table: "orders", rows: 184_302, sizeMb: 412, indexHitPct: 99.6, seqScans: 128 },
  { id: "t2", table: "order_items", rows: 612_884, sizeMb: 906, indexHitPct: 99.4, seqScans: 96 },
  { id: "t3", table: "menu_items", rows: 486, sizeMb: 12, indexHitPct: 99.9, seqScans: 1_204 },
  { id: "t4", table: "profiles", rows: 21_460, sizeMb: 54, indexHitPct: 99.8, seqScans: 42 },
  { id: "t5", table: "inventory_items", rows: 1_842, sizeMb: 26, indexHitPct: 99.1, seqScans: 318 },
  { id: "t6", table: "notifications", rows: 342_118, sizeMb: 288, indexHitPct: 98.4, seqScans: 612 },
  { id: "t7", table: "coupons", rows: 214, sizeMb: 4, indexHitPct: 99.9, seqScans: 806 },
  { id: "t8", table: "audit_logs", rows: 96_204, sizeMb: 174, indexHitPct: 97.9, seqScans: 240 },
];

export interface SlowQuery {
  id: string;
  statement: string;
  calls: number;
  meanMs: number;
  totalMs: number;
}

export const slowQueries: SlowQuery[] = [
  {
    id: "q1",
    statement: "select * from orders join order_items on … where placed_at > $1",
    calls: 1_842,
    meanMs: 412,
    totalMs: 758_904,
  },
  {
    id: "q2",
    statement: "select coupon_id, count(*) from coupon_redemptions group by 1",
    calls: 604,
    meanMs: 288,
    totalMs: 173_952,
  },
  {
    id: "q3",
    statement: "select * from notifications where user_id = $1 order by created_at desc",
    calls: 24_106,
    meanMs: 46,
    totalMs: 1_108_876,
  },
  {
    id: "q4",
    statement: "update inventory_items set stock = stock - $1 where id = $2",
    calls: 9_884,
    meanMs: 22,
    totalMs: 217_448,
  },
  {
    id: "q5",
    statement: "select date_trunc('hour', placed_at), sum(total) from orders group by 1",
    calls: 288,
    meanMs: 604,
    totalMs: 173_952,
  },
];

export const dbConnections = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, "0")}:00`,
  active: 8 + ((h * 5) % 22) + (h >= 11 && h <= 14 ? 26 : 0),
  idle: 12 + ((h * 3) % 14),
}));

export const dbHealth = {
  sizeGb: 1.94,
  sizeLimitGb: 8,
  connections: 34,
  connectionLimit: 90,
  cacheHitPct: 99.3,
  walSizeMb: 148,
  replicationLagMs: 22,
  deadlocks24h: 0,
  rollbacks24h: 6,
  lastBackup: hoursAgo(5),
};

export type ErrorLevel = "fatal" | "error" | "warning";

export interface ErrorEvent {
  id: string;
  level: ErrorLevel;
  title: string;
  culprit: string;
  count24h: number;
  users: number;
  firstSeen: string;
  lastSeen: string;
  release: string;
  environment: "production" | "preview";
  status: "unresolved" | "investigating" | "resolved" | "ignored";
}

export const errorEvents: ErrorEvent[] = [
  {
    id: "err-9001",
    level: "fatal",
    title: "TypeError: Cannot read properties of undefined (reading 'total')",
    culprit: "app.checkout · buildSummary",
    count24h: 41,
    users: 28,
    firstSeen: hoursAgo(30),
    lastSeen: hoursAgo(1),
    release: "1.6.2",
    environment: "production",
    status: "unresolved",
  },
  {
    id: "err-9002",
    level: "error",
    title: "NetworkError: realtime channel closed before ack",
    culprit: "hooks/use-order-stream",
    count24h: 186,
    users: 94,
    firstSeen: hoursAgo(72),
    lastSeen: hoursAgo(0.3),
    release: "1.6.2",
    environment: "production",
    status: "investigating",
  },
  {
    id: "err-9003",
    level: "error",
    title: "PostgrestError: new row violates row-level security policy",
    culprit: "lib/api · createOrder",
    count24h: 22,
    users: 19,
    firstSeen: hoursAgo(96),
    lastSeen: hoursAgo(4),
    release: "1.6.1",
    environment: "production",
    status: "unresolved",
  },
  {
    id: "err-9004",
    level: "warning",
    title: "Slow resource: hero-scene chunk exceeded 1.5s on 3G",
    culprit: "components/three/hero-scene",
    count24h: 312,
    users: 240,
    firstSeen: hoursAgo(190),
    lastSeen: hoursAgo(0.6),
    release: "1.6.2",
    environment: "production",
    status: "ignored",
  },
  {
    id: "err-9005",
    level: "error",
    title: "AbortError: image upload aborted by user",
    culprit: "admin.menu · uploadImage",
    count24h: 14,
    users: 6,
    firstSeen: hoursAgo(58),
    lastSeen: hoursAgo(7),
    release: "1.6.2",
    environment: "production",
    status: "resolved",
  },
  {
    id: "err-9006",
    level: "warning",
    title: "Hydration mismatch in <OfflineBanner />",
    culprit: "components/pwa/offline-banner",
    count24h: 58,
    users: 52,
    firstSeen: hoursAgo(20),
    lastSeen: hoursAgo(2),
    release: "1.6.2",
    environment: "preview",
    status: "unresolved",
  },
  {
    id: "err-9007",
    level: "fatal",
    title: "RangeError: Maximum call stack size exceeded",
    culprit: "lib/canteen-ai · rankSuggestions",
    count24h: 3,
    users: 3,
    firstSeen: hoursAgo(11),
    lastSeen: hoursAgo(9),
    release: "1.6.2",
    environment: "production",
    status: "investigating",
  },
];

export const errorTrend = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  errors: 40 + ((i * 37) % 90) - (i > 9 ? 22 : 0),
  fatal: 1 + ((i * 5) % 6),
}));

export interface WebVital {
  id: string;
  metric: string;
  abbr: string;
  value: number;
  unit: string;
  budget: number;
  good: boolean;
  description: string;
}

export const webVitals: WebVital[] = [
  {
    id: "lcp",
    metric: "Largest Contentful Paint",
    abbr: "LCP",
    value: 1.9,
    unit: "s",
    budget: 2.5,
    good: true,
    description: "Time until the largest hero element paints.",
  },
  {
    id: "inp",
    metric: "Interaction to Next Paint",
    abbr: "INP",
    value: 148,
    unit: "ms",
    budget: 200,
    good: true,
    description: "Responsiveness across all interactions.",
  },
  {
    id: "cls",
    metric: "Cumulative Layout Shift",
    abbr: "CLS",
    value: 0.04,
    unit: "",
    budget: 0.1,
    good: true,
    description: "Visual stability during load.",
  },
  {
    id: "ttfb",
    metric: "Time to First Byte",
    abbr: "TTFB",
    value: 384,
    unit: "ms",
    budget: 800,
    good: true,
    description: "Edge response latency for the document.",
  },
  {
    id: "fcp",
    metric: "First Contentful Paint",
    abbr: "FCP",
    value: 1.2,
    unit: "s",
    budget: 1.8,
    good: true,
    description: "First text or image painted.",
  },
  {
    id: "tbt",
    metric: "Total Blocking Time",
    abbr: "TBT",
    value: 240,
    unit: "ms",
    budget: 200,
    good: false,
    description: "Main-thread blocking from hydration and 3D scene setup.",
  },
];

export const performanceTrend = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  lcp: 2.6 - i * 0.05 + ((i % 3) * 0.06),
  inp: 210 - i * 4 + ((i % 4) * 7),
  ttfb: 460 - i * 5 + ((i % 5) * 9),
}));

export const bundleBudgets = [
  { name: "App shell", value: 182, budget: 220 },
  { name: "Charts", value: 148, budget: 180 },
  { name: "3D hero", value: 396, budget: 420 },
  { name: "Vendor", value: 264, budget: 300 },
];

export const deviceSplit = [
  { name: "Mobile", value: 68 },
  { name: "Desktop", value: 24 },
  { name: "Tablet", value: 8 },
];

export interface ActivityMetric {
  id: string;
  label: string;
  value: number;
  delta: number;
  suffix?: string;
}

export const activityMetrics: ActivityMetric[] = [
  { id: "dau", label: "Daily active users", value: 4_218, delta: 6.4 },
  { id: "wau", label: "Weekly active users", value: 11_940, delta: 3.1 },
  { id: "sessions", label: "Sessions today", value: 7_806, delta: 8.2 },
  { id: "session-len", label: "Avg session length", value: 4.6, delta: 2.3, suffix: " min" },
];

export const activityTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `D-${29 - i}`,
  active: 3_200 + ((i * 211) % 1_400) + i * 22,
  new: 120 + ((i * 37) % 180),
}));

export const funnelSteps = [
  { name: "Opened menu", value: 100 },
  { name: "Viewed a dish", value: 74 },
  { name: "Added to cart", value: 48 },
  { name: "Started checkout", value: 36 },
  { name: "Order placed", value: 31 },
];

export const topEvents = [
  { id: "e1", event: "menu_item_viewed", count: 84_210, users: 6_140 },
  { id: "e2", event: "cart_item_added", count: 41_884, users: 4_206 },
  { id: "e3", event: "order_placed", count: 9_140, users: 3_882 },
  { id: "e4", event: "coupon_applied", count: 5_318, users: 2_104 },
  { id: "e5", event: "ai_suggestion_clicked", count: 3_902, users: 1_640 },
  { id: "e6", event: "order_tracked", count: 22_460, users: 3_770 },
];

export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const heatHours = Array.from({ length: 15 }, (_, i) => i + 7); // 07:00 → 21:00

/** Orders per weekday × hour. Deterministic so SSR and client agree. */
export const orderHeatmap = days.map((day, d) => ({
  day,
  cells: heatHours.map((hour) => {
    const lunch = hour >= 12 && hour <= 14 ? 3.4 : 1;
    const dinner = hour >= 18 && hour <= 20 ? 2.3 : 1;
    const breakfast = hour >= 8 && hour <= 9 ? 1.8 : 1;
    const weekend = d >= 5 ? 0.55 : 1;
    const jitter = ((d * 13 + hour * 7) % 11) / 22 + 0.75;
    return {
      hour,
      value: Math.round(26 * lunch * dinner * breakfast * weekend * jitter),
    };
  }),
}));

export const peakWindows = [
  { window: "12:30 – 13:30", orders: 512, share: 22 },
  { window: "13:30 – 14:00", orders: 318, share: 14 },
  { window: "19:00 – 20:00", orders: 286, share: 12 },
  { window: "08:30 – 09:15", orders: 194, share: 8 },
];

export const salesTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `D-${29 - i}`,
  revenue: 42_000 + ((i * 3_137) % 22_000) + i * 640,
  orders: 340 + ((i * 29) % 160),
  aov: 118 + ((i * 7) % 26),
}));

export const salesByChannel = [
  { name: "Mobile app", value: 54 },
  { name: "Web", value: 31 },
  { name: "Counter kiosk", value: 15 },
];

export interface LiveKpi {
  id: string;
  label: string;
  value: number;
  unit: "inr" | "count" | "ms" | "pct";
  drift: number;
  hint: string;
}

export const liveKpis: LiveKpi[] = [
  { id: "k1", label: "Revenue today", value: 184_620, unit: "inr", drift: 900, hint: "vs ₹1.71L yesterday" },
  { id: "k2", label: "Orders in flight", value: 34, unit: "count", drift: 3, hint: "across 4 stations" },
  { id: "k3", label: "Avg prep time", value: 402, unit: "ms", drift: 12, hint: "seconds, rolling 30 min" },
  { id: "k4", label: "Success rate", value: 99.4, unit: "pct", drift: 0.2, hint: "checkout completion" },
  { id: "k5", label: "Active users", value: 812, unit: "count", drift: 24, hint: "last 5 minutes" },
  { id: "k6", label: "API error rate", value: 0.3, unit: "pct", drift: 0.05, hint: "5xx over 5 min" },
];
