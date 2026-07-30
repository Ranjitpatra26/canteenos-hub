import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "@/components/shared/page-header";
import { ExportActions } from "@/components/shared/panels";
import {
  AnalyticsRangeControls,
  AnalyticsRangeProvider,
} from "@/components/shared/analytics-range";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Overview", to: "/admin/analytics" },
  { label: "Revenue", to: "/admin/analytics/revenue" },
  { label: "Sales", to: "/admin/analytics/sales" },
  { label: "Orders", to: "/admin/analytics/orders" },
  { label: "Customers", to: "/admin/analytics/customers" },
  { label: "Inventory", to: "/admin/analytics/inventory" },
  { label: "Staff", to: "/admin/analytics/staff" },
];

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — CanteenOS admin" },
      {
        name: "description",
        content: "Revenue, sales, order, customer, inventory and staff analytics for CanteenOS.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Analytics — CanteenOS admin" },
      {
        property: "og:description",
        content: "Revenue, sales, order, customer, inventory and staff analytics for CanteenOS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsShell,
});

function AnalyticsShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <AnalyticsRangeProvider>
      <div className="mx-auto max-w-7xl">
        <PageHeader
          title="Analytics"
          description="Every revenue, demand and operations signal in one workspace."
          crumbs={[{ label: "Admin", to: "/admin" }, { label: "Analytics" }]}
          actions={<ExportActions name="Analytics" />}
        />

        <AnalyticsRangeControls className="mb-4" />

        <nav className="mb-6 flex gap-1 overflow-x-auto surface-card p-1.5">
          {tabs.map((t) => {
            const active = pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "relative shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="analytics-tab"
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
    </AnalyticsRangeProvider>
  );
}
