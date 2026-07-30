import { useState } from "react";
import { validate, forgotPasswordSchema } from "@/lib/validation";
import { checkRateLimit, recordAttempt } from "@/lib/rate-limit";
import { friendlyError, toastSuccess } from "@/lib/errors";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — CanteenOS" },
      {
        name: "description",
        content: "Request a secure password reset link for your CanteenOS account.",
      },
      { property: "og:title", content: "Reset your password — CanteenOS" },
      { property: "og:description", content: "Request a CanteenOS password reset link." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/forgot-password" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Reset your password — CanteenOS" },
      { name: "twitter:description", content: "Request a CanteenOS password reset link." },
    ],
    links: [{ rel: "canonical", href: "/forgot-password" }],
  }),

  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validate(forgotPasswordSchema, { email });
    if (!result.ok) {
      setError(result.errors.email ?? "Enter the email you registered with.");
      return;
    }
    const gate = checkRateLimit("reset", { limit: 3, blockMs: 120_000 });
    if (gate.blocked) {
      setError(`Too many requests. Try again in ${gate.retryAfter}s.`);
      return;
    }
    setError(null);
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(result.data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    recordAttempt("reset", { limit: 3, blockMs: 120_000 });
    if (resetError) {
      setError(friendlyError(resetError, "We couldn't send that reset link."));
      return;
    }
    setSent(true);
    toastSuccess("Reset link sent", "Check your inbox for the secure link.");
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="We'll email you a secure link to set a new one."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-3.5" /> Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="surface-card p-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary">
            <MailCheck className="size-6" />
          </span>
          <h2 className="mt-4 font-semibold">Check your inbox</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a reset link to <span className="text-foreground">{email}</span>. It expires in
            30 minutes.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Open the link from that email to choose a new password.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fp-email">Registered email</Label>
            <Input
              id="fp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
              className="rounded-xl"
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>
          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Send reset link
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
