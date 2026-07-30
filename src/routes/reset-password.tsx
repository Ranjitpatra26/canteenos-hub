import { useEffect, useState } from "react";
import { validate, resetPasswordSchema } from "@/lib/validation";
import { friendlyError, toastSuccess } from "@/lib/errors";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordStrength } from "@/components/auth/auth-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — CanteenOS" },
      {
        name: "description",
        content: "Choose a new password for your CanteenOS account and get back to ordering.",
      },
      { property: "og:title", content: "Set a new password — CanteenOS" },
      { property: "og:description", content: "Choose a new CanteenOS password." },
      { property: "og:url", content: "/reset-password" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "/reset-password" }],
  }),

  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  /** Recovery link state: we can only change a password with a recovery session. */
  const [linkState, setLinkState] = useState<"checking" | "ready" | "invalid">("checking");
  const [linkError, setLinkError] = useState<string | null>(null);

  // The email button lands here carrying the recovery credential in one of a
  // few shapes depending on the link format. Redeem whichever is present, then
  // scrub it from the URL so a refresh doesn't retry a spent token.
  useEffect(() => {
    let cancelled = false;

    const finish = (ok: boolean, message?: string) => {
      if (cancelled) return;
      setLinkState(ok ? "ready" : "invalid");
      if (message) setLinkError(message);
    };

    void (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const q = url.searchParams;

      const errorDescription = hash.get("error_description") ?? q.get("error_description");
      const errorCode = hash.get("error_code") ?? q.get("error_code");
      if (errorDescription || errorCode) {
        finish(
          false,
          errorCode === "otp_expired"
            ? "That reset link has expired. Request a fresh one below."
            : (errorDescription ?? "That reset link is no longer valid."),
        );
        return;
      }

      const clean = () =>
        window.history.replaceState({}, "", `${url.origin}${url.pathname}`);

      // 1. Implicit flow: tokens arrive in the URL fragment.
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        clean();
        finish(!error, error ? "That reset link is no longer valid." : undefined);
        return;
      }

      // 2. Token-hash flow: verify the one-time recovery code.
      const tokenHash = q.get("token_hash") ?? q.get("token");
      if (tokenHash) {
        const { error } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: tokenHash,
        });
        clean();
        finish(!error, error ? "That reset link has expired or was already used." : undefined);
        return;
      }

      // 3. PKCE flow: exchange the code for a session.
      const code = q.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        clean();
        finish(!error, error ? "That reset link has expired or was already used." : undefined);
        return;
      }

      // 4. No credential in the URL — only allow it if a session already exists
      // (the client may have consumed the fragment before this ran).
      const { data } = await supabase.auth.getSession();
      finish(
        Boolean(data.session),
        data.session ? undefined : "Open the reset link from your email to set a new password.",
      );
    })();

    return () => {
      cancelled = true;
    };
  }, []);


  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validate(resetPasswordSchema, { password, confirm });
    setErrors(result.errors);
    if (!result.ok) return;

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: result.data.password });
    setLoading(false);
    if (error) {
      setErrors({ password: friendlyError(error, "We couldn't update your password.") });
      return;
    }
    setDone(true);
    toastSuccess("Password updated", "Sign in with your new password.");
    // Secure logout: the recovery session must not persist after a reset.
    await supabase.auth.signOut();
    setTimeout(() => navigate({ to: "/login" }), 1200);
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in instead
          </Link>
        </>
      }
    >
      {linkState === "checking" ? (
        <div className="surface-card flex items-center justify-center gap-3 p-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          Verifying your reset link…
        </div>
      ) : linkState === "invalid" ? (
        <div className="surface-card p-6 text-center">
          <h2 className="font-semibold">This reset link isn&apos;t valid</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {linkError ?? "Request a new password reset email and try again."}
          </p>
          <Button asChild className="mt-5 w-full rounded-xl">
            <Link to="/forgot-password">Send a new reset link</Link>
          </Button>
        </div>
      ) : done ? (

        <div className="surface-card p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-success/12 text-success">
            <CheckCircle2 className="size-6" />
          </span>
          <h2 className="mt-4 font-semibold">Password updated</h2>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting you to sign in…</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-pass">New password</Label>
            <div className="relative">
              <Input
                id="new-pass"
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
            <PasswordStrength value={password} />
            {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-pass">Confirm password</Label>
            <Input
              id="confirm-pass"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-xl"
            />
            {errors.confirm ? <p className="text-xs text-destructive">{errors.confirm}</p> : null}
          </div>

          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Update password
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
