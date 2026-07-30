import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Bell, History, Home, LayoutGrid, UtensilsCrossed } from "lucide-react";
import { RequireRole } from "@/components/auth/require-role";
import { DashboardLayout, type NavSection } from "@/components/layout/dashboard-layout";

export const Route = createFileRoute("/kitchen")({
  head: () => ({
    meta: [
      { title: "Kitchen workspace — CanteenOS" },
      {
        name: "description",
        content: "Live order board, dish availability and alerts for canteen kitchen staff.",
      },
      { property: "og:title", content: "Kitchen workspace — CanteenOS" },
      { property: "og:description", content: "Live order kanban for canteen kitchen staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: KitchenLayout,
});

const sections: NavSection[] = [
  {
    title: "Kitchen",
    items: [
      { label: "Order board", to: "/kitchen", icon: LayoutGrid, exact: true },
      { label: "Today's dishes", to: "/kitchen/menu", icon: UtensilsCrossed },
      { label: "Served history", to: "/kitchen/history", icon: History },
      { label: "Notifications", to: "/kitchen/notifications", icon: Bell },
    ],
  },
  {
    title: "Site",
    items: [{ label: "Website home", to: "/", icon: Home, exact: true }],
  },
];

function KitchenLayout() {
  return (
    <RequireRole roles={["kitchen", "admin"]}>
      <DashboardLayout
        sections={sections}
        workspace="Kitchen workspace"
        notificationsTo="/kitchen/notifications"
      >
        <Outlet />
      </DashboardLayout>
    </RequireRole>
  );
}
