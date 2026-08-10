import { useState } from "react";
import { validate, registerSchema } from "@/lib/validation";
import { checkRateLimit, recordAttempt, clearRateLimit } from "@/lib/rate-limit";
import { toastError, toastSuccess } from "@/lib/errors";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthDivider, GoogleButton, PasswordStrength } from "@/components/auth/auth-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { homeForRole } from "@/hooks/use-auth";
import type { Role } from "@/types";

import { processReferralRedemption } from "@/lib/api";
import { z } from "zod";
import { Check } from "lucide-react";

const registerSearchSchema = z.object({
  plan: z.string().optional(),
  ref: z.string().optional(),
  referral: z.string().optional(),
});

export const Route = createFileRoute("/register")({
  validateSearch: (search) => registerSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Create your account — CanteenOS" },
      {
        name: "description",
        content:
          "Create a CanteenOS account to order campus meals, skip queues and track every pickup.",
      },
      { property: "og:title", content: "Create your account — CanteenOS" },
      { property: "og:description", content: "Join CanteenOS and skip the canteen queue." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/register" },
      { property: "og:image", content: "https://canteenos-hub.vercel.app/referral-banner.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Create your account — CanteenOS" },
      { name: "twitter:description", content: "Join CanteenOS and skip the canteen queue." },
      { name: "twitter:image", content: "https://canteenos-hub.vercel.app/referral-banner.png" },
    ],
    links: [{ rel: "canonical", href: "/register" }],
  }),

  component: RegisterPage,
});

const PLAN_DETAILS: Record<string, { name: string; price: string; desc: string; badge: string }> = {
  starter: {
    name: "Starter Plan",
    price: "₹0 / first term",
    desc: "One counter, one kitchen display. Up to 300 orders/day with QR pickup.",
    badge: "Free Pilot",
  },
  campus: {
    name: "Campus Plan",
    price: "₹18,000 / month",
    desc: "Full operating system with live inventory, analytics suite, coupons & 4h SLA support.",
    badge: "Most Popular",
  },
  enterprise: {
    name: "Enterprise Plan",
    price: "Custom Pricing",
    desc: "Multi-campus group deployment with SAML SSO, custom SLA and dedicated success manager.",
    badge: "Enterprise Scale",
  },
};

function RegisterPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const planKey = (search?.plan ?? "starter").toLowerCase();
  const selectedPlan = PLAN_DETAILS[planKey] ?? PLAN_DETAILS.starter;

  const initialRef = (search?.ref ?? search?.referral ?? "").trim().toUpperCase();

  const [form, setForm] = useState({ name: "", email: "", studentId: "", password: "" });
  const [refCode, setRefCode] = useState(initialRef);
  const [role, setRole] = useState(planKey === "campus" || planKey === "enterprise" ? "admin" : "student");
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validate(registerSchema, { ...form, agree });
    setErrors(result.errors);
    if (!result.ok) return;

    const gate = checkRateLimit("register", { limit: 3, blockMs: 120_000 });
    if (gate.blocked) {
      toast.error("Too many sign-up attempts", {
        description: `Try again in ${gate.retryAfter}s.`,
      });
      return;
    }

    const cleanRef = refCode.trim().toUpperCase();

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: result.data.name,
          student_id: result.data.studentId,
          role,
          referred_by: cleanRef || undefined,
        },
      },
    });
    setLoading(false);

    if (error) {
      recordAttempt("register", { limit: 3, blockMs: 120_000 });
      toastError(error, { fallback: "We couldn't create your account." });
      return;
    }

    if (data.user && data.user.identities?.length === 0) {
      clearRateLimit("register");
      toast.info("This email is already registered", {
        description: "Sign in with your existing password, or reset it if you forgot it.",
        action: {
          label: "Reset password",
          onClick: () => void navigate({ to: "/forgot-password" }),
        },
      });
      void navigate({ to: "/login" });
      return;
    }

    clearRateLimit("register");
    if (!data.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      });
      if (signInError) {
        toastSuccess("Account created", "Sign in to continue.");
        void navigate({ to: "/login" });
        return;
      }
    }

    const currentUserId = data.user?.id ?? (await supabase.auth.getUser()).data.user?.id;
    if (currentUserId && cleanRef && role === "student") {
      try {
        await processReferralRedemption(currentUserId, cleanRef);
        toast.success("🎉 Referral Bonus Claimed!", {
          description: "+₹25 welcome bonus added to your campus wallet balance.",
        });
      } catch (err) {
        console.warn("Auto-apply referral code on signup error:", err);
      }
    }

    toastSuccess("Account created", "Welcome to CanteenOS.");
    void navigate({ to: homeForRole(role as Role) });
  };

  return (
    <AuthLayout
      title={`Set up your ${selectedPlan.name}`}
      subtitle="One account for ordering, kitchen operations and campus analytics."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in to your account
          </Link>
        </>
      }
    >
      {/* Selected Plan Summary Banner */}
      <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/8 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              <Check className="size-3" />
            </span>
            <span className="text-sm font-semibold text-foreground">{selectedPlan.name}</span>
          </div>
          <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {selectedPlan.price}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{selectedPlan.desc}</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={set("name")}
            placeholder="Ananya Nair"
            className="rounded-xl"
          />
          {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reg-email">Campus email</Label>
            <Input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@campus.edu"
              className="rounded-xl"
            />
            {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sid">Student / staff ID</Label>
            <Input
              id="sid"
              value={form.studentId}
              onChange={set("studentId")}
              placeholder="CS21B045"
              className="rounded-xl"
            />
            {errors.studentId ? (
              <p className="text-xs text-destructive">{errors.studentId}</p>
            ) : null}
          </div>
        </div>

        {role === "student" ? (
          <div className="space-y-2">
            <Label htmlFor="ref-code">Referral code (Optional)</Label>
            <Input
              id="ref-code"
              value={refCode}
              onChange={(e) => setRefCode(e.target.value.toUpperCase())}
              placeholder="e.g. CAMPUS-3EDF1B"
              className="rounded-xl font-mono uppercase text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Enter a friend's referral code to get +₹25 welcome bonus in your campus wallet.
            </p>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="role">I am joining as</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role" className="w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="kitchen">Kitchen staff</SelectItem>
              <SelectItem value="admin">Canteen admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reg-pass">Password</Label>
          <div className="relative">
            <Input
              id="reg-pass"
              type={show ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
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
          <PasswordStrength value={form.password} />
          {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
        </div>

        <div className="flex items-start gap-2">
          <Checkbox id="agree" checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} />
          <Label htmlFor="agree" className="text-sm font-normal leading-snug text-muted-foreground">
            I agree to the campus food service terms and the CanteenOS privacy policy.
          </Label>
        </div>
        {errors.agree ? <p className="text-xs text-destructive">{errors.agree}</p> : null}

        <Button type="submit" className="w-full rounded-xl" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          Create account
        </Button>
      </form>

      <AuthDivider />
      <GoogleButton label="Sign up with Google" />
    </AuthLayout>
  );
}
