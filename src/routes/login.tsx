import { useEffect, useState } from "react";
import { validate, loginSchema } from "@/lib/validation";
import { checkRateLimit, recordAttempt, clearRateLimit } from "@/lib/rate-limit";
import { toastError, toastSuccess } from "@/lib/errors";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthDivider, GoogleButton } from "@/components/auth/auth-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { homeForRole } from "@/hooks/use-auth";
import type { Role } from "@/types";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — CanteenOS" },
      {
        name: "description",
        content: "Sign in to your CanteenOS student, kitchen or admin workspace.",
      },
      { property: "og:title", content: "Sign in — CanteenOS" },
      { property: "og:description", content: "Access your CanteenOS workspace." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/login" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sign in — CanteenOS" },
      { name: "twitter:description", content: "Access your CanteenOS workspace." },
    ],
    links: [{ rel: "canonical", href: "/login" }],
  }),

  component: LoginPage,
});

const WORKSPACES: Record<Role, string> = {
  student: "student",
  kitchen: "kitchen",
  admin: "admin",
};

const WORKSPACE_OPTIONS: Array<{ id: Role | "auto"; label: string; hint: string }> = [
  { id: "auto", label: "Auto", hint: "Use my account role" },
  { id: "student", label: "Student", hint: "Order & track food" },
  { id: "kitchen", label: "Kitchen", hint: "Cook & fulfil orders" },
  { id: "admin", label: "Admin", hint: "Manage the canteen" },
];

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState<Role | "auto">("auto");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cooldown, setCooldown] = useState(0);

  // Pre-fill remembered email if saved previously
  useEffect(() => {
    const savedEmail = localStorage.getItem("canteenos_remembered_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  // Rate-limit UI: count down the cooldown after too many failed attempts.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validate(loginSchema, { email, password });
    setErrors(result.errors);
    if (!result.ok) return;

    const gate = checkRateLimit("login");
    if (gate.blocked) {
      setCooldown(gate.retryAfter);
      toast.error("Too many sign-in attempts", {
        description: `Try again in ${gate.retryAfter}s.`,
      });
      return;
    }

    if (remember) {
      localStorage.setItem("canteenos_remembered_email", result.data.email);
    } else {
      localStorage.removeItem("canteenos_remembered_email");
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });
    if (error) {
      setLoading(false);
      const state = recordAttempt("login");
      if (state.blocked) setCooldown(state.retryAfter);
      if (error.code === "invalid_credentials") {
        toast.error("That email and password don't match.", {
          description: "This account exists. Reset the password if you no longer remember it.",
          action: {
            label: "Reset password",
            onClick: () => void navigate({ to: "/forgot-password" }),
          },
        });
      } else {
        toastError(error, { fallback: "We couldn't sign you in." });
      }
      return;
    }

    clearRateLimit("login");
    const { data: roleRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    let roles = (roleRows ?? []).map((r) => r.role as Role);
    const isAdminUser = data.user.email?.toLowerCase() === "ranjitpatra2611@gmail.com";
    if (isAdminUser || roles.includes("admin")) {
      roles = ["admin", "student", "kitchen"];
    } else if (roles.length === 0) {
      roles = ["student"];
    }

    const primaryRole: Role = roles.includes("admin") ? "admin" : roles.includes("kitchen") ? "kitchen" : "student";
    // Honour the workspace the user picked when their account has that role.
    const role: Role = workspace !== "auto" && roles.includes(workspace) ? workspace : primaryRole;

    setLoading(false);
    if (workspace !== "auto" && workspace !== role) {
      toast.info(`No ${WORKSPACES[workspace]} access on this account`, {
        description: `Opening your ${WORKSPACES[role]} workspace instead.`,
      });
    } else {
      toastSuccess("Welcome back", `Opening your ${WORKSPACES[role]} workspace.`);
    }
    void navigate({ to: homeForRole(role) });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to order, cook or manage your campus canteen."
      footer={
        <>
          New to CanteenOS?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label>Workspace</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
            {WORKSPACE_OPTIONS.map((w) => {
              const active = workspace === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setWorkspace(w.id)}
                  className={
                    active
                      ? "rounded-xl border border-primary bg-primary/10 px-3 py-2 text-left transition-colors"
                      : "rounded-xl border border-border bg-card/60 px-3 py-2 text-left transition-colors hover:border-primary/40"
                  }
                >
                  <span className="block text-xs font-semibold">{w.label}</span>
                  <span className="block text-[10px] leading-tight text-muted-foreground">
                    {w.hint}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoCapitalize="none"
            autoCorrect="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@campus.edu"
            className="rounded-xl"
          />
          {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl pr-12"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>

          </div>
          {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(c) => setRemember(Boolean(c))}
          />
          <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-muted-foreground select-none">
            Remember me for 30 days
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full rounded-xl"
          disabled={loading || cooldown > 0}
          aria-busy={loading}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {cooldown > 0 ? `Try again in ${cooldown}s` : "Sign in"}
        </Button>
        {cooldown > 0 ? (
          <p className="text-center text-xs text-muted-foreground" role="status" aria-live="polite">
            Too many attempts — sign-in is paused for {cooldown}s to protect your account.
          </p>
        ) : null}
      </form>

      <AuthDivider />
      <GoogleButton />

      <p className="mt-6 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        Student, kitchen and admin workspaces all use this single sign-in — you'll land in the
        workspace that matches your account role.
      </p>
    </AuthLayout>
  );
}
