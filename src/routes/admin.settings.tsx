import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard, Pill } from "@/components/shared/panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePaymentMode } from "@/lib/payment-mode";
import { STRIPE_CONNECTED } from "@/lib/payments";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Workspace settings — CanteenOS" },
      {
        name: "description",
        content:
          "Configure canteen hours, tax rates, fees and notification defaults for the CanteenOS workspace.",
      },
      { property: "og:title", content: "Workspace settings — CanteenOS" },
      {
        property: "og:description",
        content: "Operating hours, tax, fees and workspace preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [form, setForm] = useState({
    name: "Campus Central Canteen",
    open: "07:30",
    close: "23:00",
    gst: "5",
    packaging: "8",
    delivery: "20",
    autoAccept: true,
    lowStockAlerts: true,
    dailyDigest: false,
  });
  const [paymentMode, setPaymentMode] = usePaymentMode();



  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Workspace settings"
        description="Defaults that apply across ordering, billing and alerts."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Settings" }]}
        actions={
          <Button className="rounded-xl" onClick={() => toast.success("Settings saved")}>
            Save changes
          </Button>
        }
      />

      <div className="grid gap-4">
        <SectionCard title="Canteen profile" index={0}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="s-name">Canteen name</Label>
              <Input
                id="s-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-open">Opens at</Label>
              <Input
                id="s-open"
                type="time"
                value={form.open}
                onChange={(e) => setForm({ ...form, open: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-close">Closes at</Label>
              <Input
                id="s-close"
                type="time"
                value={form.close}
                onChange={(e) => setForm({ ...form, close: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Billing defaults" index={1}>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="s-gst">GST rate (%)</Label>
              <Input
                id="s-gst"
                type="number"
                value={form.gst}
                onChange={(e) => setForm({ ...form, gst: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-pack">Packaging fee (₹)</Label>
              <Input
                id="s-pack"
                type="number"
                value={form.packaging}
                onChange={(e) => setForm({ ...form, packaging: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-del">Delivery fee (₹)</Label>
              <Input
                id="s-del"
                type="number"
                value={form.delivery}
                onChange={(e) => setForm({ ...form, delivery: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Payments" index={2}>
          <p className="text-sm text-muted-foreground">
            Choose how checkout settles. Switch to Stripe once the payments integration is
            connected — students immediately start paying through a real hosted checkout.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              {
                id: "simulated" as const,
                label: "Simulated payments",
                hint: "Demo mode — orders are confirmed instantly and a pickup QR is issued. No money moves.",
                icon: FlaskConical,
                ready: true,
              },
              {
                id: "stripe" as const,
                label: "Stripe checkout",
                hint: STRIPE_CONNECTED
                  ? "Live — checkout redirects to a Stripe hosted session."
                  : "Not connected yet. Selecting this makes checkout ask for Stripe before placing orders.",
                icon: CreditCard,
                ready: STRIPE_CONNECTED,
              },
            ].map((opt) => {
              const active = paymentMode === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setPaymentMode(opt.id);
                    toast.success(
                      opt.id === "simulated"
                        ? "Checkout is using simulated payments"
                        : "Checkout will use the Stripe flow",
                    );
                  }}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors",
                    active ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="size-4 text-primary" /> {opt.label}
                    {active ? <Pill tone="primary">Active</Pill> : null}
                    {!opt.ready ? <Pill tone="warning">Setup needed</Pill> : null}
                  </span>
                  <span className="mt-2 block text-xs text-muted-foreground">{opt.hint}</span>
                </button>
              );
            })}
          </div>
        </SectionCard>



        <SectionCard title="Automation & alerts" index={2}>
          <div className="grid gap-3">
            {[
              {
                key: "autoAccept" as const,
                label: "Auto-accept paid orders into the kitchen queue",
              },
              {
                key: "lowStockAlerts" as const,
                label: "Alert managers when stock drops below reorder level",
              },
              { key: "dailyDigest" as const, label: "Email a daily performance digest at 9 PM" },
            ].map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3"
              >
                <Label htmlFor={row.key} className="text-sm font-normal">
                  {row.label}
                </Label>
                <Switch
                  id={row.key}
                  checked={form[row.key]}
                  onCheckedChange={(v) => setForm({ ...form, [row.key]: v })}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
