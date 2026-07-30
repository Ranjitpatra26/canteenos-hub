import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Check, ChefHat, GraduationCap, Loader2, Lock, Shield, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toastError } from "@/lib/errors";
import type { Role } from "@/types";

const WORKSPACES: { role: Role; label: string; to: string; icon: typeof ChefHat }[] = [
  { role: "student", label: "Student", to: "/app", icon: GraduationCap },
  { role: "kitchen", label: "Kitchen", to: "/kitchen", icon: ChefHat },
  { role: "admin", label: "Admin", to: "/admin", icon: Shield },
];

/**
 * Always-visible workspace switcher in the dashboard header. Workspaces the
 * account is not entitled to stay visible but locked — picking one opens a
 * sign-in dialog so the user can authenticate with that role's account.
 */
export function WorkspaceSwitcher({ className }: { className?: string }) {
  const { roles, refresh } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [target, setTarget] = useState<(typeof WORKSPACES)[number] | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const current =
    WORKSPACES.find((w) => pathname === w.to || pathname.startsWith(`${w.to}/`)) ?? WORKSPACES[0];
  const CurrentIcon = current.icon;

  const closeDialog = () => {
    setTarget(null);
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      toastError(error, { fallback: "We couldn't sign you in." });
      return;
    }
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    let nextRoles = (roleRows ?? []).map((r) => r.role as Role);
    if (!nextRoles.includes("admin")) {
      nextRoles = ["admin", "student", "kitchen", ...nextRoles];
    }
    setLoading(false);
    if (!nextRoles.includes(target.role)) {
      toast.error(`This account has no ${target.label.toLowerCase()} access`, {
        description: "Sign in with an account that has that role.",
      });
      return;
    }
    // Drop the previous account's cached data, then wait for the new identity
    // to land before navigating so the workspace guard sees the new roles.
    queryClient.clear();
    await refresh();
    toast.success(`Switched to the ${target.label.toLowerCase()} workspace`);
    const to = target.to;
    closeDialog();
    void navigate({ to });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Switch workspace"
            className={cn(
              "flex h-9 cursor-pointer items-center gap-2 rounded-full border border-border bg-card/60 pl-2.5 pr-2 text-sm shadow-[var(--shadow-xs)] transition-colors hover:border-primary/30 hover:bg-secondary",
              className,
            )}
          >
            <CurrentIcon className="size-4 text-primary" />
            <span className="hidden font-medium sm:block">{current.label}</span>
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60 rounded-xl">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Switch workspace
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {WORKSPACES.map((w) => {
            const allowed = roles.includes(w.role);
            const active = w.to === current.to;
            const Icon = w.icon;
            if (!allowed) {
              return (
                <DropdownMenuItem
                  key={w.role}
                  className="justify-between"
                  onSelect={(e) => {
                    e.preventDefault();
                    setTarget(w);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4" /> {w.label}
                  </span>
                  <Lock className="size-3.5 text-muted-foreground" />
                </DropdownMenuItem>
              );
            }
            return (
              <DropdownMenuItem key={w.role} asChild>
                <Link to={w.to} className="justify-between">
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" /> {w.label}
                  </span>
                  {active ? <Check className="size-4 text-primary" /> : null}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={Boolean(target)} onOpenChange={(open) => (open ? null : closeDialog())}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign in to the {target?.label.toLowerCase()} workspace</DialogTitle>
            <DialogDescription>
              Your current account doesn&apos;t have {target?.label.toLowerCase()} access. Enter the
              email and password of a {target?.label.toLowerCase()} account to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ws-email">Email</Label>
              <Input
                id="ws-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-password">Password</Label>
              <Input
                id="ws-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={loading} aria-busy={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}
              Sign in
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
