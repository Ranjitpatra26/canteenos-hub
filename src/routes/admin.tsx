import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  Activity,
  BadgePercent,
  Bell,
  BellRing,
  ClipboardCheck,
  BarChart3,
  Boxes,
  Building2,
  CalendarClock,
  ChefHat,
  FileBarChart,
  HeartPulse,
  LayoutGrid,
  ListTree,
  ScrollText,
  Settings,
  ShieldCheck,
  Stamp,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";
import { DashboardLayout, type NavSection } from "@/components/layout/dashboard-layout";
import { RequireRole } from "@/components/auth/require-role";
import { OrgProvider } from "@/contexts/org-context";

const sections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutGrid, exact: true },
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
      { label: "Monitoring", to: "/admin/monitoring", icon: HeartPulse },
      { label: "Reports", to: "/admin/reports", icon: FileBarChart },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { label: "Menu management", to: "/admin/menu", icon: UtensilsCrossed },
      { label: "Categories", to: "/admin/categories", icon: ListTree },
      { label: "Coupons", to: "/admin/coupons", icon: BadgePercent },
    ],
  },
  {
    title: "Organisation",
    items: [
      { label: "Organisation", to: "/admin/organization", icon: Building2 },
      { label: "Workforce", to: "/admin/workforce", icon: CalendarClock },
      { label: "Approvals", to: "/admin/approvals", icon: Stamp },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Inventory", to: "/admin/inventory", icon: Boxes },
      { label: "Kitchen staff", to: "/admin/staff", icon: ChefHat },
      { label: "Customers", to: "/admin/customers", icon: UsersRound },
      { label: "Users", to: "/admin/users", icon: UsersRound },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Notifications", to: "/admin/notifications", icon: Bell },
      { label: "Notification lab", to: "/admin/notification-lab", icon: BellRing },
      { label: "QA checklist", to: "/admin/qa", icon: ClipboardCheck },
      { label: "Activity", to: "/admin/activity", icon: Activity },
      { label: "Audit logs", to: "/admin/audit", icon: ScrollText },
      { label: "Roles & access", to: "/admin/roles", icon: ShieldCheck },
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — CanteenOS" },
      {
        name: "description",
        content: "Analytics, menu, inventory, staff and reporting controls for CanteenOS.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin console — CanteenOS" },
      {
        property: "og:description",
        content: "Analytics, menu, inventory, staff and reporting controls for CanteenOS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminShell,
});

function AdminShell() {
  return (
    <RequireRole roles={["admin"]}>
      <OrgProvider>
        <DashboardLayout sections={sections} workspace="Admin workspace">
          <Outlet />
        </DashboardLayout>
      </OrgProvider>
    </RequireRole>
  );
}
