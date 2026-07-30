import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgePercent, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Pill, MetricRow, SectionCard } from "@/components/shared/panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inr } from "@/lib/format";
import { useCoupons, useDeleteCoupon, useSaveCoupon } from "@/lib/api";
import type { Coupon } from "@/types";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({
    meta: [
      { title: "Coupons & offers — CanteenOS" },
      {
        name: "description",
        content:
          "Create discount codes, cap redemptions and track coupon performance across the campus canteen.",
      },
      { property: "og:title", content: "Coupons & offers — CanteenOS" },
      { property: "og:description", content: "Discount code management and redemption analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CouponsPage,
});

const blank = (): Coupon => ({
  id: "",
  code: "",
  description: "",
  type: "percent",
  value: 10,
  minOrder: 149,
  uses: 0,
  maxUses: 500,
  expiresAt: "2026-12-31",
  active: true,
});

function CouponsPage() {
  const { data: rows = [], isLoading } = useCoupons();
  const saveCoupon = useSaveCoupon();
  const deleteCoupon = useDeleteCoupon();
  const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Coupon | null>(null);

  const filtered = useMemo(
    () => rows.filter((c) => status === "all" || (status === "active" ? c.active : !c.active)),
    [rows, status],
  );

  const totalRedemptions = rows.reduce((s, c) => s + c.uses, 0);

  const columns: Column<Coupon>[] = [
    {
      key: "code",
      header: "Code",
      sortable: true,
      sortValue: (r) => r.code,
      cell: (r) => (
        <span className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
            <BadgePercent className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block font-mono text-sm font-semibold">{r.code || "NEWCODE"}</span>
            <span className="block max-w-[260px] truncate text-xs text-muted-foreground">
              {r.description}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: "value",
      header: "Discount",
      align: "right",
      sortable: true,
      sortValue: (r) => r.value,
      cell: (r) => (
        <span className="font-medium">{r.type === "percent" ? `${r.value}%` : inr(r.value)}</span>
      ),
    },
    {
      key: "min",
      header: "Min order",
      align: "right",
      sortable: true,
      sortValue: (r) => r.minOrder,
      cell: (r) => inr(r.minOrder),
    },
    {
      key: "uses",
      header: "Redeemed",
      align: "right",
      sortable: true,
      sortValue: (r) => r.uses / Math.max(1, r.maxUses),
      cell: (r) => (
        <span className="text-sm">
          {r.uses.toLocaleString("en-IN")}
          <span className="text-muted-foreground"> / {r.maxUses.toLocaleString("en-IN")}</span>
        </span>
      ),
    },
    {
      key: "exp",
      header: "Expires",
      sortable: true,
      sortValue: (r) => r.expiresAt,
      cell: (r) => r.expiresAt,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <Pill tone={r.active ? "success" : "muted"}>{r.active ? "Active" : "Paused"}</Pill>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) => (
        <span className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Copy code"
            onClick={() => {
              navigator.clipboard?.writeText(r.code);
              toast.success(`${r.code} copied`);
            }}
          >
            <Copy className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Edit coupon"
            onClick={() => setEditing(r)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive"
            aria-label="Delete coupon"
            onClick={() =>
              deleteCoupon.mutate(r.id, {
                onSuccess: () => toast.success(`${r.code} deleted`),
                onError: fail,
              })
            }
          >
            <Trash2 className="size-4" />
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Coupons & offers"
        description="Run targeted discounts without denting the margin."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Coupons" }]}
        actions={
          <Button className="rounded-xl" onClick={() => setEditing(blank())}>
            <Plus className="size-4" /> New coupon
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active coupons"
          value={String(rows.filter((c) => c.active).length)}
          index={0}
        />
        <StatCard
          label="Total redemptions"
          value={totalRedemptions.toLocaleString("en-IN")}
          delta={{ value: "+12.4%" }}
          index={1}
        />
        <StatCard
          label="Discount given"
          value={inr(totalRedemptions * 34)}
          hint="estimated this month"
          index={2}
        />
        <StatCard label="Avg. uplift" value="+18%" delta={{ value: "order value" }} index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <DataTable
          rows={filtered}
          columns={columns}
          pageSize={8}
          searchKeys={(r) => `${r.code} ${r.description}`}
          searchPlaceholder="Search coupon codes…"
          emptyTitle="No coupons"
          toolbar={
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All coupons</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          }
        />

        <SectionCard title="Redemption progress" description="Usage against each cap" index={1}>
          <div className="space-y-4">
            {rows.slice(0, 6).map((c) => (
              <MetricRow
                key={c.id}
                label={c.code}
                value={`${Math.round((c.uses / Math.max(1, c.maxUses)) * 100)}%`}
                pct={(c.uses / Math.max(1, c.maxUses)) * 100}
                tone={c.uses / Math.max(1, c.maxUses) > 0.85 ? "warning" : "primary"}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.code ? "Edit coupon" : "Create coupon"}</DialogTitle>
            <DialogDescription>Codes are case-insensitive at checkout.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="cp-code">Code</Label>
                <Input
                  id="cp-code"
                  value={editing.code}
                  onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
                  placeholder="MONSOON20"
                  className="rounded-xl font-mono"
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="cp-desc">Description</Label>
                <Input
                  id="cp-desc"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  placeholder="20% off on all beverages"
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={editing.type}
                  onValueChange={(v: "percent" | "flat") => setEditing({ ...editing, type: v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentage</SelectItem>
                    <SelectItem value="flat">Flat amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cp-val">Value</Label>
                <Input
                  id="cp-val"
                  type="number"
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cp-min">Min order (₹)</Label>
                <Input
                  id="cp-min"
                  type="number"
                  value={editing.minOrder}
                  onChange={(e) => setEditing({ ...editing, minOrder: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cp-max">Max redemptions</Label>
                <Input
                  id="cp-max"
                  type="number"
                  value={editing.maxUses}
                  onChange={(e) => setEditing({ ...editing, maxUses: Number(e.target.value) })}
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="cp-exp">Expires on</Label>
                <Input
                  id="cp-exp"
                  type="date"
                  value={editing.expiresAt}
                  onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 sm:col-span-2">
                <Label htmlFor="cp-active" className="text-sm">
                  Active immediately
                </Label>
                <Switch
                  id="cp-active"
                  checked={editing.active}
                  onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              disabled={!editing?.code}
              onClick={() => {
                if (!editing) return;
                const payload = {
                  code: editing.code.toUpperCase(),
                  description: editing.description,
                  type: editing.type,
                  value: editing.value,
                  min_order: editing.minOrder,
                  max_uses: editing.maxUses,
                  expires_at: editing.expiresAt || null,
                  active: editing.active,
                };
                saveCoupon.mutate(editing.id ? { id: editing.id, ...payload } : payload, {
                  onSuccess: () => {
                    toast.success("Coupon saved");
                    setEditing(null);
                  },
                  onError: fail,
                });
              }}
            >
              Save coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
