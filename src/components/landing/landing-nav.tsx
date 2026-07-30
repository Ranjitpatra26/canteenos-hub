import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ChefHat, Menu, Moon, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useAuth, homeForRole } from "@/hooks/use-auth";

const links = [
  { label: "Features", href: "#features" },
  { label: "Why us", href: "#why" },
  { label: "Pricing", href: "#pricing" },
  { label: "Security", href: "#security" },
  { label: "Enterprise", href: "#enterprise" },
  { label: "FAQ", href: "#faq" },
];


export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, profile, role, loading, authenticated } = useAuth();

  const displayName = profile?.full_name ?? user?.email?.split("@")[0] ?? "Your workspace";
  const initials =
    displayName
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CO";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300",
          scrolled ? "glass" : "border border-transparent",
        )}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ChefHat className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">CanteenOS</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          {authenticated ? (
            <Button asChild className="hidden rounded-full pl-1.5 sm:inline-flex">
              <Link to={homeForRole(role)}>
                <span className="grid size-7 place-items-center rounded-full bg-primary-foreground/15 text-[11px] font-semibold">
                  {initials}
                </span>
                <span className="max-w-[10rem] truncate">{displayName}</span>
                <span className="rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                  {role ?? "student"}
                </span>
              </Link>
            </Button>
          ) : loading ? (
            // Placeholder while the session rehydrates — never flash "Sign in".
            <span
              aria-hidden
              className="hidden h-9 w-40 animate-pulse rounded-full bg-secondary sm:inline-flex"
            />
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden rounded-full sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild className="hidden rounded-full sm:inline-flex">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass mx-auto mt-2 max-w-6xl rounded-2xl p-3 lg:hidden"
          >
            <nav className="grid gap-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              {authenticated ? (
                <Button asChild className="mt-2 rounded-xl">
                  <Link to={homeForRole(role)}>
                    Open {role ?? "student"} workspace — {displayName}
                  </Link>
                </Button>
              ) : loading ? (
                <span aria-hidden className="mt-2 h-10 animate-pulse rounded-xl bg-secondary" />
              ) : (

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button asChild className="rounded-xl">
                    <Link to="/register">Get started</Link>
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
