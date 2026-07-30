import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Accessibility,
  Bell,
  Globe,
  Lock,
  Monitor,
  Moon,
  Palette,
  Shield,
  Sun,
  UserCog,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/panels";
import { Label } from "@/components/ui/label";
import { PushSettings } from "@/components/pwa/push-settings";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useMotionPreference, type MotionPreference } from "@/hooks/use-motion-preference";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile } from "@/lib/api";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { changePasswordSchema, validate } from "@/lib/validation";
import { friendlyError } from "@/lib/errors";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CanteenOS" },
      {
        name: "description",
        content:
          "Control appearance, notifications, language, account, security, privacy and accessibility preferences in CanteenOS.",
      },
      { property: "og:title", content: "Settings — CanteenOS" },
      {
        property: "og:description",
        content: "Appearance, notifications, security and accessibility preferences.",
      },
    ],
  }),
  component: SettingsPage,
});

const PREFS_KEY = "canteenos.preferences";

interface Prefs {
  notifications: Record<string, boolean>;
  language: string;
  currency: string;
  timezone: string;
  privacy: Record<string, boolean>;
  a11y: { highContrast: boolean; reduceMotion: boolean; largeText: boolean; fontScale: number };
}

const DEFAULTS: Prefs = {
  notifications: {
    orderStatus: true,
    orderReady: true,
    promos: true,
    lowStock: false,
    systemUpdates: true,
    email: false,
  },
  language: "en-IN",
  currency: "INR",
  timezone: "Asia/Kolkata",
  privacy: {
    profileVisible: true,
    shareOrderHistory: false,
    personalisedAi: true,
    analytics: true,
  },
  a11y: { highContrast: false, reduceMotion: false, largeText: false, fontScale: 100 },
};

function readPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Prefs) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function Row({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0 last:pb-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const NOTIFICATION_ROWS: Array<{ key: string; label: string; hint: string }> = [
  {
    key: "orderStatus",
    label: "Order status updates",
    hint: "Placed, accepted and preparing events.",
  },
  {
    key: "orderReady",
    label: "Order ready alerts",
    hint: "Ping the moment your food hits the counter.",
  },
  { key: "promos", label: "Coupon & promo alerts", hint: "Campus offers and combo deals." },
  { key: "lowStock", label: "Sold-out warnings", hint: "Tell me when a favourite dish runs out." },
  { key: "systemUpdates", label: "System updates", hint: "Maintenance windows and new features." },
  { key: "email", label: "Email digest", hint: "Weekly summary of orders and spend." },
];

const PRIVACY_ROWS: Array<{ key: string; label: string; hint: string }> = [
  {
    key: "profileVisible",
    label: "Show my name on leaderboards",
    hint: "Appear in campus top-orderer boards.",
  },
  {
    key: "shareOrderHistory",
    label: "Share order history with canteen staff",
    hint: "Helps staff resolve issues faster.",
  },
  {
    key: "personalisedAi",
    label: "Personalised Canteen AI",
    hint: "Use my order history for recommendations.",
  },
  {
    key: "analytics",
    label: "Product analytics",
    hint: "Anonymous usage data to improve CanteenOS.",
  },
];

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const motion = useMotionPreference();
  const { profile, user } = useAuth();
  const updateProfile = useUpdateProfile();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => setPrefs(readPrefs()), []);
  useEffect(() => {
    setName(profile?.full_name ?? "");
    setPhone(profile?.phone ?? "");
  }, [profile]);

  const save = (next: Prefs, message = "Preference saved") => {
    setPrefs(next);
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    toast.success(message);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("high-contrast", prefs.a11y.highContrast);
    root.style.fontSize = prefs.a11y.largeText ? "17px" : `${prefs.a11y.fontScale}%`;
  }, [prefs.a11y]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Settings"
        description="Tune how CanteenOS looks, notifies and protects you."
        crumbs={[{ label: "Student", to: "/app" }, { label: "Settings" }]}
      />

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="mb-5 flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted/50 p-1.5">
          {[
            { v: "appearance", label: "Appearance", icon: Palette },
            { v: "notifications", label: "Notifications", icon: Bell },
            { v: "language", label: "Language", icon: Globe },
            { v: "account", label: "Account", icon: UserCog },
            { v: "security", label: "Security", icon: Lock },
            { v: "privacy", label: "Privacy", icon: Shield },
            { v: "accessibility", label: "Accessibility", icon: Accessibility },
          ].map((t) => (
            <TabsTrigger key={t.v} value={t.v} className="gap-1.5 rounded-xl px-3 py-1.5 text-xs">
              <t.icon className="size-3.5" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="appearance">
          <SectionCard title="Theme" description="CanteenOS ships dark-first; switch any time.">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { id: "dark", label: "Dark", icon: Moon },
                { id: "light", label: "Light", icon: Sun },
                { id: "system", label: "System", icon: Monitor },
              ].map((opt) => {
                const active = opt.id === theme || (opt.id === "system" && false);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      if (opt.id === "system") {
                        toast.info("Following your device theme");
                        return;
                      }
                      if (opt.id !== theme) toggle();
                    }}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5",
                      active
                        ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]"
                        : "border-border bg-card",
                    )}
                  >
                    <opt.icon className="size-5 text-primary" />
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {opt.id === "dark"
                        ? "Default premium look"
                        : opt.id === "light"
                          ? "Bright canteen mode"
                          : "Match device"}
                    </span>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          <SectionCard className="mt-4" title="Density & motion" index={1}>
            <Row title="Glass effects" hint="Blur and reflection layers across cards.">
              <Switch defaultChecked aria-label="Toggle glass effects" />
            </Row>
            <Row title="Animated background" hint="Aurora gradient and floating orbs.">
              <Switch defaultChecked aria-label="Toggle animated background" />
            </Row>
          </SectionCard>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <PushSettings />
          <SectionCard
            title="Notification channels"
            description="Choose what reaches you and when."
          >
            {NOTIFICATION_ROWS.map((r) => (
              <Row key={r.key} title={r.label} hint={r.hint}>
                <Switch
                  checked={prefs.notifications[r.key]}
                  aria-label={r.label}
                  onCheckedChange={(v) =>
                    save(
                      { ...prefs, notifications: { ...prefs.notifications, [r.key]: v } },
                      `${r.label} ${v ? "enabled" : "disabled"}`,
                    )
                  }
                />
              </Row>
            ))}
          </SectionCard>
        </TabsContent>

        <TabsContent value="language">
          <SectionCard
            title="Language & region"
            description="Formatting for dates, currency and copy."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={prefs.language}
                  onValueChange={(v) => save({ ...prefs, language: v }, "Language updated")}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-IN">English (India)</SelectItem>
                    <SelectItem value="hi-IN">हिन्दी</SelectItem>
                    <SelectItem value="ta-IN">தமிழ்</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={prefs.currency}
                  onValueChange={(v) => save({ ...prefs, currency: v }, "Currency updated")}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ Indian Rupee</SelectItem>
                    <SelectItem value="USD">$ US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Time zone</Label>
                <Select
                  value={prefs.timezone}
                  onValueChange={(v) => save({ ...prefs, timezone: v }, "Time zone updated")}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="account">
          <SectionCard title="Account details" description="Your campus identity across CanteenOS.">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProfile.mutate(
                  { full_name: name, phone },
                  {
                    onSuccess: () => toast.success("Account updated"),
                    onError: (err: unknown) =>
                      toast.error(err instanceof Error ? err.message : "Could not update account"),
                  },
                );
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="acct-name">Full name</Label>
                  <Input
                    id="acct-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acct-phone">Phone</Label>
                  <Input
                    id="acct-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acct-email">Campus email</Label>
                  <Input
                    id="acct-email"
                    value={profile?.email ?? user?.email ?? ""}
                    readOnly
                    disabled
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acct-sid">Student ID</Label>
                  <Input
                    id="acct-sid"
                    value={profile?.student_id ?? "—"}
                    readOnly
                    disabled
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button type="submit" className="rounded-xl" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </SectionCard>
        </TabsContent>

        <TabsContent value="security">
          <SectionCard
            title="Security"
            description="Protect your canteen wallet and order history."
          >
            <form
              className="space-y-4 border-b border-border pb-5"
              onSubmit={async (event) => {
                event.preventDefault();
                const result = validate(changePasswordSchema, {
                  currentPassword,
                  password: newPassword,
                  confirm: confirmPassword,
                });
                setPasswordErrors(result.errors);
                if (!result.ok) return;
                if (!user?.email) {
                  setPasswordErrors({ form: "Your account email is unavailable. Sign in again." });
                  return;
                }

                setChangingPassword(true);
                const { error: verifyError } = await supabase.auth.signInWithPassword({
                  email: user.email,
                  password: result.data.currentPassword,
                });
                if (verifyError) {
                  setChangingPassword(false);
                  setPasswordErrors({ currentPassword: "Your current password is incorrect." });
                  return;
                }

                const { error: updateError } = await supabase.auth.updateUser({
                  password: result.data.password,
                });
                setChangingPassword(false);
                if (updateError) {
                  setPasswordErrors({
                    form: friendlyError(updateError, "We couldn't change your password."),
                  });
                  return;
                }

                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setPasswordErrors({});
                toast.success("Password changed successfully");
              }}
            >
              <div>
                <p className="text-sm font-medium">Change password</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Confirm your current password, then choose a new one.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="rounded-xl"
                  />
                  {passwordErrors.currentPassword ? (
                    <p className="text-xs text-destructive">{passwordErrors.currentPassword}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-new-password">New password</Label>
                  <Input
                    id="settings-new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="rounded-xl"
                  />
                  {passwordErrors.password ? (
                    <p className="text-xs text-destructive">{passwordErrors.password}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-confirm-password">Confirm new password</Label>
                  <Input
                    id="settings-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="rounded-xl"
                  />
                  {passwordErrors.confirm ? (
                    <p className="text-xs text-destructive">{passwordErrors.confirm}</p>
                  ) : null}
                </div>
              </div>
              {passwordErrors.form ? (
                <p className="text-xs text-destructive">{passwordErrors.form}</p>
              ) : null}
              <Button type="submit" className="rounded-xl" disabled={changingPassword}>
                {changingPassword ? <Loader2 className="size-4 animate-spin" /> : null}
                {changingPassword ? "Changing…" : "Change password"}
              </Button>
            </form>
            <Row title="Two-factor authentication" hint="Require a one-time code at sign-in.">
              <Switch
                aria-label="Two-factor authentication"
                onCheckedChange={(v) => toast.success(v ? "2FA enabled" : "2FA disabled")}
              />
            </Row>
            <Row title="Active sessions" hint="This device · Chrome · campus network">
              <Badge variant="outline" className="rounded-full">
                1 active
              </Badge>
            </Row>
            <Row title="Sign out everywhere" hint="Ends every other session immediately.">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => toast.success("All other sessions signed out")}
              >
                Sign out others
              </Button>
            </Row>
          </SectionCard>
        </TabsContent>

        <TabsContent value="privacy">
          <SectionCard title="Privacy" description="You decide what CanteenOS remembers.">
            {PRIVACY_ROWS.map((r) => (
              <Row key={r.key} title={r.label} hint={r.hint}>
                <Switch
                  checked={prefs.privacy[r.key]}
                  aria-label={r.label}
                  onCheckedChange={(v) =>
                    save(
                      { ...prefs, privacy: { ...prefs.privacy, [r.key]: v } },
                      "Privacy preference saved",
                    )
                  }
                />
              </Row>
            ))}
            <Row title="Download my data" hint="Export orders, profile and preferences as JSON.">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => toast.success("Export queued — we'll email your archive")}
              >
                Request export
              </Button>
            </Row>
          </SectionCard>
        </TabsContent>

        <TabsContent value="accessibility">
          <SectionCard title="Accessibility" description="Make CanteenOS comfortable for you.">
            <Row title="High contrast" hint="Boost borders and text contrast site-wide.">
              <Switch
                checked={prefs.a11y.highContrast}
                aria-label="High contrast"
                onCheckedChange={(v) =>
                  save({ ...prefs, a11y: { ...prefs.a11y, highContrast: v } }, "Contrast updated")
                }
              />
            </Row>
            <Row
              title="Motion"
              hint={
                motion.preference === "auto"
                  ? `Following your device — currently ${motion.systemReduced ? "reduced" : "full motion"}.`
                  : "Disables 3D cursor tilt, magnetic buttons, parallax and camera tracking."
              }
            >
              <Select
                value={motion.preference}
                onValueChange={(v) => {
                  const next = v as MotionPreference;
                  motion.setPreference(next);
                  save(
                    { ...prefs, a11y: { ...prefs.a11y, reduceMotion: next === "reduced" } },
                    next === "auto"
                      ? "Following your device motion setting"
                      : next === "reduced"
                        ? "Motion reduced"
                        : "Full motion enabled",
                  );
                }}
              >
                <SelectTrigger className="w-44 rounded-xl" aria-label="Motion preference">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (device)</SelectItem>
                  <SelectItem value="full">Full motion</SelectItem>
                  <SelectItem value="reduced">Reduced motion</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row title="Larger text" hint="Increase base font size for readability.">
              <Switch
                checked={prefs.a11y.largeText}
                aria-label="Larger text"
                onCheckedChange={(v) =>
                  save({ ...prefs, a11y: { ...prefs.a11y, largeText: v } }, "Text size updated")
                }
              />
            </Row>
            <div className="pt-4">
              <Label htmlFor="font-scale" className="text-sm font-medium">
                Interface scale — {prefs.a11y.fontScale}%
              </Label>
              <Slider
                id="font-scale"
                className="mt-3"
                min={90}
                max={120}
                step={5}
                value={[prefs.a11y.fontScale]}
                onValueChange={([v]) =>
                  setPrefs((p) => ({ ...p, a11y: { ...p.a11y, fontScale: v } }))
                }
                onValueCommit={([v]) =>
                  save({ ...prefs, a11y: { ...prefs.a11y, fontScale: v } }, "Interface scale saved")
                }
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Keyboard users: press{" "}
                <kbd className="rounded border border-border bg-muted px-1">⌘K</kbd> anywhere to
                open global search.
              </p>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
