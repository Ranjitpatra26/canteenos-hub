import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/components/layout/dashboard-layout";
import { useCart } from "@/contexts/cart-context";

/**
 * Native-style bottom tab bar shown on phones. Sits above the iOS home
 * indicator via safe-area padding.
 */
export function MobileBottomNav({ items, showCart }: { items: NavItem[]; showCart?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul
        className="grid"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.to
            : pathname === item.to || pathname.startsWith(`${item.to}/`);
          const badge = showCart && item.to.endsWith("/cart") ? count : 0;
          return (
            <li key={item.to} className="min-w-0">
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-12 flex-col items-center justify-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="mobile-tab-active"
                    className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className="relative overflow-visible">
                  <item.icon className="size-[20px]" />
                  {badge > 0 ? (
                    <span className="absolute -right-2 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-black leading-none text-primary-foreground shadow-lg ring-2 ring-background z-30">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span className="w-full truncate text-center">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
