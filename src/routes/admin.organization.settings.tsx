import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, ShieldCheck } from "lucide-react";
import { SectionCard, Pill } from "@/components/shared/panels";
import { KeyValueRow } from "@/components/org/org-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { organization } from "@/data/organization";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/organization/settings")({
  component: OrgSettings,
});

function OrgSettings() {
  const [form, setForm] = useState({
    legalName: organization.legalName,
    displayName: organization.displayName,
    domain: organization.domain,
    supportEmail: organization.supportEmail,
    gstin: organization.gstin,
  });
  const [sso, setSso] = useState(organization.ssoEnforced);
  const [mfa, setMfa] = useState(organization.mfaRequired);
  const [autoProvision, setAutoProvision] = useState(true);
  const [crossCampus, setCrossCampus] = useState(false);

  const field = (key: keyof typeof form, label: string, hint?: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <SectionCard
          title="Organization profile"
          description="Identity used on invoices, receipts and outbound email across every campus."
          index={0}
          actions={
            <Button
              size="sm"
              className="rounded-xl"
              onClick={() =>
                toast.success("Organization profile saved", {
                  description: "Changes propagate to all campuses within a minute.",
                })
              }
            >
              <Save className="size-4" /> Save
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {field("legalName", "Legal entity name")}
            {field("displayName", "Display name", "Shown in the app header and receipts.")}
            {field("domain", "Primary domain")}
            {field("supportEmail", "Support email")}
            {field("gstin", "GSTIN")}
          </div>
        </SectionCard>

        <SectionCard
          title="Security & access"
          description="Organization-wide identity rules. Branch managers cannot override these."
          index={1}
        >
          <div className="space-y-1">
            <ToggleRow
              label="Enforce SSO"
              hint="Staff must sign in through the campus identity provider."
              checked={sso}
              onChange={setSso}
            />
            <ToggleRow
              label="Require MFA for staff"
              hint="Applies to every kitchen, manager and admin account."
              checked={mfa}
              onChange={setMfa}
            />
            <ToggleRow
              label="Auto-provision staff accounts"
              hint="Create accounts from the HR directory on first sign-in."
              checked={autoProvision}
              onChange={setAutoProvision}
            />
            <ToggleRow
              label="Allow cross-campus roles"
              hint="Let a single account hold roles at more than one campus."
              checked={crossCampus}
              onChange={setCrossCampus}
            />
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard title="Plan & seats" index={2}>
          <div className="mb-4 flex items-center gap-2">
            <Pill tone="primary">{organization.billingPlan}</Pill>
            <span className="numeric text-xs text-muted-foreground">
              {organization.seatsUsed}/{organization.seatsTotal} seats
            </span>
          </div>
          <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary"
              style={{ width: `${(organization.seatsUsed / organization.seatsTotal) * 100}%` }}
            />
          </span>
          <Button
            variant="outline"
            size="sm"
            className="mt-5 w-full rounded-xl"
            onClick={() => toast.info("Seat request sent to billing")}
          >
            Request more seats
          </Button>
        </SectionCard>

        <SectionCard title="Regional & compliance" index={3}>
          <div className="space-y-0">
            <KeyValueRow label="Currency">{organization.currency}</KeyValueRow>
            <KeyValueRow label="Locale">{organization.locale}</KeyValueRow>
            <KeyValueRow label="Fiscal year starts">{organization.fiscalStart}</KeyValueRow>
            <KeyValueRow label="Data residency">{organization.dataResidency}</KeyValueRow>
            <KeyValueRow label="Audit retention">{organization.retentionDays} days</KeyValueRow>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" />
            Audit trails are append-only and retained for the full window before archival.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3.5 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={(v) => {
          onChange(v);
          toast.success(`${label} ${v ? "enabled" : "disabled"}`);
        }}
      />
    </div>
  );
}
