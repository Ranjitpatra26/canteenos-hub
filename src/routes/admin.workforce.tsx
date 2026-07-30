import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { PageHeader } from "@/components/shared/page-header";
import { ExportActions } from "@/components/shared/panels";
import { BranchSwitcher } from "@/components/org/branch-switcher";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Schedule", to: "/admin/workforce" },
  { label: "Shifts", to: "/admin/workforce/shifts" },
  { label: "Attendance", to: "/admin/workforce/attendance" },
];

export const Route = createFileRoute("/admin/workforce")({
  head: () => ({
    meta: [
      { title: "Workforce — CanteenOS admin" },
      {
        name: "description",
        content:
          "Staff scheduling, shift templates and attendance management across every CanteenOS canteen.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Workforce — CanteenOS admin" },
      {
        property: "og:description",
        content: "Rotas, shift templates and attendance in one workforce console.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WorkforceShell,
});

function WorkforceShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Workforce"
        description="Rotas, shift templates and attendance for every canteen in the selected scope."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Workforce" }]}
        actions={
          <>
            <BranchSwitcher />
            <ExportActions name="Workforce" />
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
                  layoutId="workforce-tab"
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
