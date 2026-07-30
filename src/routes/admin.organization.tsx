import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "@/components/shared/page-header";
import { ExportActions } from "@/components/shared/panels";
import { BranchSwitcher } from "@/components/org/branch-switcher";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Overview", to: "/admin/organization" },
  { label: "Campuses", to: "/admin/organization/campuses" },
  { label: "Canteens", to: "/admin/organization/canteens" },
  { label: "Analytics", to: "/admin/organization/analytics" },
  { label: "Settings", to: "/admin/organization/settings" },
];

export const Route = createFileRoute("/admin/organization")({
  head: () => ({
    meta: [
      { title: "Organization — CanteenOS admin" },
      {
        name: "description",
        content:
          "Multi-campus and multi-canteen management, organization settings and group-wide analytics for CanteenOS.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Organization — CanteenOS admin" },
      {
        property: "og:description",
        content: "Campuses, canteens, org settings and cross-campus analytics in one console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrganizationShell,
});

function OrganizationShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Organization"
        description="Every campus, canteen, policy and seat across the CanteenOS group."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Organization" }]}
        actions={
          <>
            <BranchSwitcher />
            <ExportActions name="Organization" />
          </>
        }
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
                  layoutId="organization-tab"
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
