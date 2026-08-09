import { createFileRoute, Outlet } from "@tanstack/react-router";
import {
  Bell,
  BotMessageSquare,
  Gift,
  Heart,
  LayoutGrid,
  Receipt,
  Settings,
  ShoppingCart,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { DashboardLayout, type NavSection } from "@/components/layout/dashboard-layout";
import { RequireRole } from "@/components/auth/require-role";

const sections: NavSection[] = [
  {
    title: "Order",
    items: [
      { label: "Overview", to: "/app", icon: LayoutGrid, exact: true },
      { label: "Browse menu", to: "/app/menu", icon: UtensilsCrossed },
      { label: "Cart", to: "/app/cart", icon: ShoppingCart },
      { label: "Favorites", to: "/app/favorites", icon: Heart },
      { label: "Canteen AI", to: "/app/ai", icon: BotMessageSquare, badge: "AI" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Earn & Refer", to: "/app/rewards", icon: Gift, badge: "Bonus" },
      { label: "My orders", to: "/app/orders", icon: Receipt },
      { label: "Notifications", to: "/app/notifications", icon: Bell },
      { label: "Profile", to: "/app/profile", icon: User },
      { label: "Settings", to: "/app/settings", icon: Settings },
    ],
  },
];

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Student workspace — CanteenOS" },
      {
        name: "description",
        content: "Order campus meals, track pickup and manage your CanteenOS account.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Student workspace — CanteenOS" },
      {
        property: "og:description",
        content: "Order campus meals, track pickup and manage your CanteenOS account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentShell,
});

function StudentShell() {
  return (
    <RequireRole roles={["student", "kitchen", "admin"]}>
      <DashboardLayout
        sections={sections}
        workspace="Student workspace"
        showCart
        mobileNav={[
          { label: "Home", to: "/app", icon: LayoutGrid, exact: true },
          { label: "Menu", to: "/app/menu", icon: UtensilsCrossed },
          { label: "Cart", to: "/app/cart", icon: ShoppingCart },
          { label: "Orders", to: "/app/orders", icon: Receipt },
          { label: "Profile", to: "/app/profile", icon: User },
        ]}
      >
        <Outlet />
      </DashboardLayout>
    </RequireRole>
  );
}
