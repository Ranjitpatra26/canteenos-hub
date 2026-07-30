/**
 * Monitoring / telemetry facade.
 *
 * The app never talks to Sentry or PostHog directly — it calls these helpers.
 * When the real SDKs are added, implement `MonitoringProvider` and register it
 * in `initMonitoring()`; every existing call site keeps working unchanged.
 */

export type Severity = "fatal" | "error" | "warning" | "info" | "debug";

export interface MonitoringUser {
  id: string;
  email?: string;
  role?: string;
}

export interface BreadcrumbRecord {
  id: string;
  category: string;
  message: string;
  level: Severity;
  at: string;
  data?: Record<string, unknown>;
}

export interface MonitoringProvider {
  name: string;
  captureException?(error: unknown, context?: Record<string, unknown>): void;
  captureMessage?(message: string, level: Severity, context?: Record<string, unknown>): void;
  trackEvent?(event: string, properties?: Record<string, unknown>): void;
  identify?(user: MonitoringUser | null): void;
  addBreadcrumb?(crumb: BreadcrumbRecord): void;
  trackPageView?(path: string): void;
}

const MAX_BUFFER = 100;

const providers: MonitoringProvider[] = [];
const breadcrumbs: BreadcrumbRecord[] = [];
const listeners = new Set<(crumbs: BreadcrumbRecord[]) => void>();

let currentUser: MonitoringUser | null = null;
let started = false;

export const monitoringConfig = {
  /** Wire these up in `.env` when the real SDKs land. */
  get sentryDsn() {
    return import.meta.env.VITE_SENTRY_DSN as string | undefined;
  },
  get posthogKey() {
    return import.meta.env.VITE_POSTHOG_KEY as string | undefined;
  },
  get posthogHost() {
    return (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? "https://eu.i.posthog.com";
  },
  get environment() {
    return import.meta.env.DEV ? "development" : "production";
  },
  get release() {
    return (import.meta.env.VITE_APP_RELEASE as string | undefined) ?? "dev";
  },
};

/** Console provider — always on, so telemetry is inspectable before SDKs exist. */
const consoleProvider: MonitoringProvider = {
  name: "console",
  captureException(error, context) {
    if (import.meta.env.DEV) console.error("[monitoring] exception", error, context);
  },
  captureMessage(message, level, context) {
    if (import.meta.env.DEV) console.info(`[monitoring] ${level}`, message, context);
  },
};

export function registerProvider(provider: MonitoringProvider) {
  if (!providers.some((p) => p.name === provider.name)) providers.push(provider);
  if (currentUser) provider.identify?.(currentUser);
}

export function listProviders() {
  return providers.map((p) => p.name);
}

/**
 * Called once at app start. Real integration point:
 *
 *   if (monitoringConfig.sentryDsn) {
 *     const Sentry = await import("@sentry/react");
 *     Sentry.init({ dsn: monitoringConfig.sentryDsn, environment, release });
 *     registerProvider({ name: "sentry", captureException: Sentry.captureException, … });
 *   }
 */
export function initMonitoring() {
  if (started) return;
  started = true;
  registerProvider(consoleProvider);
}

function emit() {
  const snapshot = [...breadcrumbs];
  listeners.forEach((fn) => fn(snapshot));
}

export function addBreadcrumb(
  category: string,
  message: string,
  level: Severity = "info",
  data?: Record<string, unknown>,
) {
  const crumb: BreadcrumbRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    category,
    message,
    level,
    at: new Date().toISOString(),
    data,
  };
  breadcrumbs.unshift(crumb);
  if (breadcrumbs.length > MAX_BUFFER) breadcrumbs.length = MAX_BUFFER;
  providers.forEach((p) => p.addBreadcrumb?.(crumb));
  emit();
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  const message = error instanceof Error ? error.message : String(error);
  addBreadcrumb("exception", message, "error", context);
  providers.forEach((p) => p.captureException?.(error, context));
}

export function captureMessage(
  message: string,
  level: Severity = "info",
  context?: Record<string, unknown>,
) {
  addBreadcrumb("message", message, level, context);
  providers.forEach((p) => p.captureMessage?.(message, level, context));
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  addBreadcrumb("event", event, "info", properties);
  providers.forEach((p) => p.trackEvent?.(event, properties));
}

export function trackPageView(path: string) {
  addBreadcrumb("navigation", path, "debug");
  providers.forEach((p) => p.trackPageView?.(path));
}

export function identifyUser(user: MonitoringUser | null) {
  currentUser = user;
  providers.forEach((p) => p.identify?.(user));
}

export function getBreadcrumbs() {
  return [...breadcrumbs];
}

export function subscribeBreadcrumbs(fn: (crumbs: BreadcrumbRecord[]) => void) {
  listeners.add(fn);
  fn([...breadcrumbs]);
  return () => listeners.delete(fn);
}

/** Integration readiness, surfaced in the monitoring settings panel. */
export function integrationStatus() {
  return [
    {
      id: "sentry",
      name: "Sentry",
      purpose: "Error tracking, release health and performance traces.",
      envVar: "VITE_SENTRY_DSN",
      configured: Boolean(monitoringConfig.sentryDsn),
      active: providers.some((p) => p.name === "sentry"),
    },
    {
      id: "posthog",
      name: "PostHog",
      purpose: "Product analytics, funnels, session replay and feature flags.",
      envVar: "VITE_POSTHOG_KEY",
      configured: Boolean(monitoringConfig.posthogKey),
      active: providers.some((p) => p.name === "posthog"),
    },
  ];
}
