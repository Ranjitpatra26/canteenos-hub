import { lazy, Suspense, useState, type ReactNode } from "react";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  ChefHat,
  Home,

  LogOut,
  Menu as MenuIcon,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShoppingBag,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/lib/api";
import {
  GlobalSearchDialog,
  SearchTrigger,
  useGlobalSearch,
} from "@/components/search/global-search";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { WorkspaceSwitcher } from "@/components/layout/workspace-switcher";

import { OfflineBanner } from "@/components/pwa/offline-banner";
import { useSwipe } from "@/hooks/use-gestures";

const CanteenAiWidget = lazy(() =>
  import("@/components/ai/canteen-ai-widget").then((m) => ({ default: m.CanteenAiWidget })),
);

export interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

function Brand({ collapsed, workspace }: { collapsed: boolean; workspace: string }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2.5 px-1">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
        <ChefHat className="size-5" />
      </span>
      {!collapsed ? (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold leading-tight">CanteenOS</span>
          <span className="block truncate text-[11px] text-muted-foreground">{workspace}</span>
        </span>
      ) : null}
    </Link>
  );
}

function SidebarNav({
  sections,
  collapsed,
  onNavigate,
}: {
  sections: NavSection[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-5">
      {sections.map((section) => (
        <div key={section.title}>
          {!collapsed ? <p className="label-micro mb-2 px-3">{section.title}</p> : null}
          <ul className="space-y-1">
            {section.items.map((item) => {
              const active = item.exact
                ? pathname === item.to
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                      />
                    ) : null}
                    <item.icon
                      className={cn(
                        "size-[18px] shrink-0 transition-colors",
                        active
                          ? "text-primary"
                          : "text-muted-foreground/80 group-hover:text-foreground",
                      )}
                    />
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    {!collapsed && item.badge ? (
                      <Badge className="ml-auto rounded-full px-1.5 py-0 text-[10px]">
                        {item.badge}
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DashboardLayout({
  sections,
  workspace,
  user,
  showCart = false,
  mobileNav,
  notificationsTo,
  children,
}: {
  sections: NavSection[];
  workspace: string;
  user?: { name: string; role: string; initials: string };
  showCart?: boolean;
  /** Where the header bell links to; defaults to the student/admin feed. */
  notificationsTo?: string;
  /** Tabs for the phone bottom bar; defaults to the first four nav items. */
  mobileNav?: NavItem[];
  children?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Edge-swipe right opens the drawer, swipe left closes it — native feel on phones.
  useSwipe<HTMLDivElement>({ onSwipeRight: () => setMobileOpen(true), edgeOnly: true });
  const tabs = (mobileNav ?? sections.flatMap((s) => s.items).slice(0, 4)).slice(0, 5);

  const { open: searchOpen, setOpen: setSearchOpen } = useGlobalSearch();
  const { theme, toggle } = useTheme();
  const { count } = useCart();
  const { profile, role: appRole, roles, signOut } = useAuth();
  const { data: notifications } = useNotifications();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const unread = (notifications ?? []).filter((n) => !n.read).length;

  const displayName = profile?.full_name ?? user?.name ?? "CanteenOS user";
  const displayRole =
    user?.role ??
    (appRole === "admin"
      ? "Canteen admin"
      : appRole === "kitchen"
        ? "Kitchen staff"
        : profile?.student_id
          ? `Student · ${profile.student_id}`
          : "Student");
  const initials =
    displayName
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CO";

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    void navigate({ to: "/login", replace: true });
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <motion.aside
        animate={{ width: collapsed ? 76 : 264 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex"
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-sidebar-border px-4">
          <Brand collapsed={collapsed} workspace={workspace} />
        </div>
        <SidebarNav sections={sections} collapsed={collapsed} />
        <div className="border-t border-sidebar-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center rounded-xl text-muted-foreground"
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
            {!collapsed ? <span className="ml-2">Collapse</span> : null}
          </Button>
        </div>
      </motion.aside>

      <div className="flex h-dvh min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-background/70 px-4 backdrop-blur-xl backdrop-saturate-150 sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center border-b border-sidebar-border px-4">
                <Brand collapsed={false} workspace={workspace} />
              </div>
              <SidebarNav
                sections={sections}
                collapsed={false}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <WorkspaceSwitcher />

          <div className="hidden min-w-0 flex-1 md:block md:max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open global search"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-5" />
          </Button>

          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" asChild aria-label="Go to website home">
              <Link to="/">
                <Home className="size-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">

              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -60 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 60 }}
                  transition={{ duration: 0.18 }}
                >
                  {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
                </motion.span>
              </AnimatePresence>
            </Button>

            {showCart ? (
              <Button variant="ghost" size="icon" className="overflow-visible" asChild aria-label="Cart">
                <Link to="/app/cart" className="relative flex items-center justify-center overflow-visible" data-cart-target>
                  <ShoppingBag className="size-5" />
                  {count > 0 ? (
                    <span className="absolute -right-2 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-black leading-none text-primary-foreground shadow-lg ring-2 ring-background z-30">
                      {count}
                    </span>
                  ) : null}
                </Link>
              </Button>
            ) : null}

            <Button variant="ghost" size="icon" asChild aria-label="Notifications">
              <Link
                to={notificationsTo ?? (showCart ? "/app/notifications" : "/admin/notifications")}
                className="relative"
              >
                <Bell className="size-5" />
                {unread > 0 ? (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
                ) : null}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card/60 py-1 pl-1 pr-3 shadow-[var(--shadow-xs)] transition-colors hover:border-primary/30 hover:bg-secondary">
                  <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-xs font-medium leading-tight">{displayName}</span>
                    <span className="block text-[10px] leading-tight text-muted-foreground">
                      {displayRole}
                    </span>
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/profile">
                    <User className="size-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {roles.length > 1 ? (
                  <>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Switch workspace
                    </DropdownMenuLabel>
                    {roles.includes("student") ? (
                      <DropdownMenuItem asChild>
                        <Link to="/app">Student workspace</Link>
                      </DropdownMenuItem>
                    ) : null}
                    {roles.includes("kitchen") ? (
                      <DropdownMenuItem asChild>
                        <Link to="/kitchen">Kitchen display</Link>
                      </DropdownMenuItem>
                    ) : null}
                    {roles.includes("admin") ? (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin console</Link>
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem onSelect={() => void handleSignOut()}>
                  <LogOut className="size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <OfflineBanner />

        <main
          id="main-content"
          className="min-w-0 flex-1 overflow-y-auto px-4 py-8 pb-28 sm:px-6 lg:px-10 lg:pb-12"
        >
          <ErrorBoundary label="This workspace page">{children ?? <Outlet />}</ErrorBoundary>
        </main>
      </div>

      <MobileBottomNav items={tabs} showCart={showCart} />
      <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <Suspense fallback={null}>
        <CanteenAiWidget />
      </Suspense>
    </div>
  );
}
