import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "@/components/shared/page-header";
import { ExportActions } from "@/components/shared/panels";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Health", to: "/admin/monitoring" },
  { label: "Live KPIs", to: "/admin/monitoring/live" },
  { label: "API", to: "/admin/monitoring/api" },
  { label: "Database", to: "/admin/monitoring/database" },
  { label: "Errors", to: "/admin/monitoring/errors" },
  { label: "Performance", to: "/admin/monitoring/performance" },
  { label: "Activity", to: "/admin/monitoring/activity" },
  { label: "Integrations", to: "/admin/monitoring/integrations" },
];

export const Route = createFileRoute("/admin/monitoring")({
  head: () => ({
    meta: [
      { title: "Monitoring — CanteenOS admin" },
      {
        name: "description",
        content:
          "Application health, API and database status, error logs, performance metrics and live KPIs for CanteenOS.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Monitoring — CanteenOS admin" },
      {
        property: "og:description",
        content: "Health, status, errors, performance and real-time KPIs in one console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MonitoringShell,
});

function MonitoringShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Monitoring"
        description="Uptime, latency, errors, performance and product telemetry for every CanteenOS surface."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Monitoring" }]}
        actions={<ExportActions name="Monitoring" />}
      />

      <nav className="mb-6 flex gap-1 overflow-x-auto surface-card p-1.5">
        {tabs.map((t) => {
          const active = pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                "relative shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="monitoring-tab"
                  className="absolute inset-0 rounded-xl bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <span className="relative z-10">{t.label}</span>
            </Link>
          );
        })}
      </nav>

      <Outlet />
    </div>
  );
}
