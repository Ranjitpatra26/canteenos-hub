import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, PackagePlus, Truck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ExportActions, Pill, SectionCard, SegmentedControl } from "@/components/shared/panels";
import { ChartPanel, LineSeries } from "@/components/shared/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { inr, shortDate, timeAgo } from "@/lib/format";
import { useInventory, useUpdateInventory } from "@/lib/api";
import {
  inventoryTrend,
  purchaseOrders,
  restockRequests as seedRestock,
  stockMovements,
  suppliers,
  type PurchaseOrder,
  type RestockRequest,
  type StockMovement,
  type Supplier,
} from "@/data/admin";
import type { InventoryItem } from "@/types";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory control — CanteenOS" },
      {
        name: "description",
        content:
          "Track stock levels, movements, suppliers, purchase orders and restock requests for the campus canteen.",
      },
      { property: "og:title", content: "Inventory control — CanteenOS" },
      {
        property: "og:description",
        content: "Live stock levels, suppliers and purchase order tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InventoryPage,
});

type Tab = "stock" | "movements" | "suppliers" | "orders" | "restock";

function InventoryPage() {
  const [tab, setTab] = useState<Tab>("stock");
  const { data: items = [], isLoading } = useInventory();
  const updateInventory = useUpdateInventory();
  const [restock, setRestock] = useState<RestockRequest[]>(seedRestock);
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);
  const [delta, setDelta] = useState("0");

  const low = items.filter((i) => i.stock <= i.reorderAt);
  const value = items.reduce((s, i) => s + i.stock * i.costPerUnit, 0);
  const pendingPOs = purchaseOrders.filter((p) => p.status === "sent").length;

  const stockCols: Column<InventoryItem>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Item",
        sortable: true,
        sortValue: (r) => r.name,
        cell: (r) => (
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{r.name}</span>
            <span className="block font-mono text-xs text-muted-foreground">{r.sku}</span>
          </span>
        ),
      },
      { key: "cat", header: "Category", cell: (r) => <Pill>{r.category}</Pill> },
      {
        key: "level",
        header: "Level",
        sortable: true,
        sortValue: (r) => r.stock / Math.max(1, r.reorderAt * 2),
        cell: (r) => {
          const pct = Math.min(100, (r.stock / Math.max(1, r.reorderAt * 2)) * 100);
          return (
            <span className="block w-40">
              <span className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium">
                  {r.stock} {r.unit}
                </span>
                <span className="text-muted-foreground">reorder {r.reorderAt}</span>
              </span>
              <Progress value={pct} className="h-1.5" />
            </span>
          );
        },
      },
      {
        key: "cost",
        header: "Unit cost",
        align: "right",
        sortable: true,
        sortValue: (r) => r.costPerUnit,
        cell: (r) => inr(r.costPerUnit),
      },
      {
        key: "value",
        header: "Stock value",
        align: "right",
        sortable: true,
        sortValue: (r) => r.stock * r.costPerUnit,
        cell: (r) => <span className="font-medium">{inr(r.stock * r.costPerUnit)}</span>,
      },
      {
        key: "supplier",
        header: "Supplier",
        cell: (r) => <span className="text-sm">{r.supplier}</span>,
      },
      {
        key: "status",
        header: "Status",
        cell: (r) =>
          r.stock <= r.reorderAt ? (
            <Pill tone="danger">Reorder</Pill>
          ) : r.stock <= r.reorderAt * 1.4 ? (
            <Pill tone="warning">Low</Pill>
          ) : (
            <Pill tone="success">Healthy</Pill>
          ),
      },
      {
        key: "actions",
        header: "",
        align: "right",
        cell: (r) => (
          <span onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                setAdjusting(r);
                setDelta("0");
              }}
            >
              Adjust
            </Button>
          </span>
        ),
      },
    ],
    [],
  );

  const movementCols: Column<StockMovement>[] = [
    {
      key: "item",
      header: "Item",
      sortable: true,
      sortValue: (r) => r.item,
      cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{r.item}</span>
          <span className="block font-mono text-xs text-muted-foreground">{r.sku}</span>
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (r) => (
        <Pill
          tone={
            r.type === "in"
              ? "success"
              : r.type === "out"
                ? "info"
                : r.type === "waste"
                  ? "danger"
                  : "warning"
          }
        >
          {r.type === "in"
            ? "Stock in"
            : r.type === "out"
              ? "Consumed"
              : r.type === "waste"
                ? "Waste"
                : "Adjusted"}
        </Pill>
      ),
    },
    {
      key: "qty",
      header: "Qty",
      align: "right",
      sortable: true,
      sortValue: (r) => r.qty,
      cell: (r) => (
        <span
          className={`inline-flex items-center gap-1 font-medium ${r.type === "in" ? "text-success" : "text-foreground"}`}
        >
          {r.type === "in" ? (
            <ArrowUpRight className="size-3.5" />
          ) : (
            <ArrowDownRight className="size-3.5" />
          )}
          {r.qty} {r.unit}
        </span>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      cell: (r) => <span className="text-sm text-muted-foreground">{r.reason}</span>,
    },
    { key: "by", header: "By", cell: (r) => r.by },
    {
      key: "at",
      header: "When",
      align: "right",
      sortable: true,
      sortValue: (r) => r.at,
      cell: (r) => <span className="text-xs text-muted-foreground">{timeAgo(r.at)}</span>,
    },
  ];

  const supplierCols: Column<Supplier>[] = [
    {
      key: "name",
      header: "Supplier",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{r.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {r.contact} · {r.phone}
          </span>
        </span>
      ),
    },
    { key: "cat", header: "Category", cell: (r) => <Pill>{r.category}</Pill> },
    {
      key: "lead",
      header: "Lead time",
      align: "right",
      sortable: true,
      sortValue: (r) => r.leadTimeDays,
      cell: (r) => `${r.leadTimeDays} d`,
    },
    {
      key: "skus",
      header: "SKUs",
      align: "right",
      sortable: true,
      sortValue: (r) => r.activeSkus,
      cell: (r) => r.activeSkus,
    },
    {
      key: "ontime",
      header: "On time",
      align: "right",
      sortable: true,
      sortValue: (r) => r.onTimePct,
      cell: (r) => (
        <Pill tone={r.onTimePct >= 92 ? "success" : r.onTimePct >= 85 ? "warning" : "danger"}>
          {r.onTimePct}%
        </Pill>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      align: "right",
      sortable: true,
      sortValue: (r) => r.rating,
      cell: (r) => `★ ${r.rating}`,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => <Pill tone={r.status === "active" ? "success" : "muted"}>{r.status}</Pill>,
    },
  ];

  const poCols: Column<PurchaseOrder>[] = [
    {
      key: "code",
      header: "PO",
      sortable: true,
      sortValue: (r) => r.code,
      cell: (r) => <span className="font-mono text-sm font-semibold">{r.code}</span>,
    },
    { key: "supplier", header: "Supplier", cell: (r) => r.supplier },
    {
      key: "items",
      header: "Items",
      align: "right",
      sortable: true,
      sortValue: (r) => r.items,
      cell: (r) => r.items,
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      sortable: true,
      sortValue: (r) => r.amount,
      cell: (r) => <span className="font-medium">{inr(r.amount)}</span>,
    },
    {
      key: "placed",
      header: "Placed",
      sortable: true,
      sortValue: (r) => r.placedAt,
      cell: (r) => shortDate(r.placedAt),
    },
    { key: "expected", header: "Expected", cell: (r) => shortDate(r.expectedAt) },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <Pill
          tone={
            r.status === "received"
              ? "success"
              : r.status === "sent"
                ? "info"
                : r.status === "draft"
                  ? "muted"
                  : "danger"
          }
        >
          {r.status}
        </Pill>
      ),
    },
  ];

  const restockCols: Column<RestockRequest>[] = [
    {
      key: "item",
      header: "Item",
      sortable: true,
      sortValue: (r) => r.item,
      cell: (r) => (
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{r.item}</span>
          <span className="block font-mono text-xs text-muted-foreground">{r.sku}</span>
        </span>
      ),
    },
    { key: "qty", header: "Qty", align: "right", cell: (r) => `${r.qty} ${r.unit}` },
    {
      key: "urgency",
      header: "Urgency",
      sortable: true,
      sortValue: (r) => ({ high: 3, medium: 2, low: 1 })[r.urgency],
      cell: (r) => (
        <Pill tone={r.urgency === "high" ? "danger" : r.urgency === "medium" ? "warning" : "muted"}>
          {r.urgency}
        </Pill>
      ),
    },
    { key: "by", header: "Requested by", cell: (r) => r.requestedBy },
    {
      key: "at",
      header: "When",
      cell: (r) => <span className="text-xs text-muted-foreground">{timeAgo(r.requestedAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <Pill
          tone={
            r.status === "approved"
              ? "success"
              : r.status === "ordered"
                ? "info"
                : r.status === "rejected"
                  ? "danger"
                  : "warning"
          }
        >
          {r.status}
        </Pill>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) =>
        r.status === "pending" ? (
          <span className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              className="rounded-lg"
              onClick={() => {
                setRestock((p) => p.map((x) => (x.id === r.id ? { ...x, status: "approved" } : x)));
                toast.success(`${r.item} restock approved`);
              }}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                setRestock((p) => p.map((x) => (x.id === r.id ? { ...x, status: "rejected" } : x)));
                toast.info(`${r.item} restock rejected`);
              }}
            >
              Reject
            </Button>
          </span>
        ) : null,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Inventory control"
        description="Stock levels, movement history, suppliers and procurement in one place."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Inventory" }]}
        actions={
          <>
            <ExportActions name="Inventory" />
            <Button className="rounded-xl" onClick={() => toast.success("Purchase order drafted")}>
              <PackagePlus className="size-4" /> New purchase order
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Stock value" value={inr(value)} delta={{ value: "+4.1%" }} index={0} />
        <StatCard label="Tracked SKUs" value={String(items.length)} index={1} />
        <StatCard
          label="Below reorder"
          value={String(low.length)}
          delta={{ value: "needs action", positive: false }}
          index={2}
        />
        <StatCard
          label="Open POs"
          value={String(pendingPOs)}
          hint={`${purchaseOrders.length} total`}
          icon={<Truck className="size-4" />}
          index={3}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ChartPanel title="Stock value trend" description="Opening value versus wastage" index={0}>
          <LineSeries
            data={inventoryTrend}
            xKey="month"
            lines={[
              { key: "value", name: "Stock value" },
              { key: "waste", name: "Wastage" },
            ]}
            formatter={inr}
          />
        </ChartPanel>
        <SectionCard title="Reorder alerts" description="Items at or below threshold" index={1}>
          <ul className="space-y-3">
            {low.slice(0, 6).map((i) => (
              <li
                key={i.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 px-3 py-2"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{i.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {i.stock} {i.unit} left · reorder at {i.reorderAt}
                  </span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => toast.success(`Restock requested for ${i.name}`)}
                >
                  Restock
                </Button>
              </li>
            ))}
            {low.length === 0 ? (
              <li className="text-sm text-muted-foreground">Everything is above threshold.</li>
            ) : null}
          </ul>
        </SectionCard>
      </div>

      <SegmentedControl
        className="mb-4"
        value={tab}
        onChange={setTab}
        options={[
          { value: "stock", label: "Stock" },
          { value: "movements", label: "Movements" },
          { value: "suppliers", label: "Suppliers" },
          { value: "orders", label: "Purchase orders" },
          { value: "restock", label: "Restock requests" },
        ]}
      />

      {tab === "stock" ? (
        <DataTable
          rows={items}
          columns={stockCols}
          pageSize={10}
          searchKeys={(r) => `${r.name} ${r.sku} ${r.category} ${r.supplier}`}
          searchPlaceholder="Search stock…"
          emptyTitle="No stock items"
        />
      ) : null}
      {tab === "movements" ? (
        <DataTable
          rows={stockMovements}
          columns={movementCols}
          pageSize={10}
          searchKeys={(r) => `${r.item} ${r.sku} ${r.reason} ${r.by}`}
          searchPlaceholder="Search movements…"
          emptyTitle="No movements"
        />
      ) : null}
      {tab === "suppliers" ? (
        <DataTable
          rows={suppliers}
          columns={supplierCols}
          pageSize={10}
          searchKeys={(r) => `${r.name} ${r.contact} ${r.category}`}
          searchPlaceholder="Search suppliers…"
          emptyTitle="No suppliers"
        />
      ) : null}
      {tab === "orders" ? (
        <DataTable
          rows={purchaseOrders}
          columns={poCols}
          pageSize={10}
          searchKeys={(r) => `${r.code} ${r.supplier} ${r.status}`}
          searchPlaceholder="Search purchase orders…"
          emptyTitle="No purchase orders"
        />
      ) : null}
      {tab === "restock" ? (
        <DataTable
          rows={restock}
          columns={restockCols}
          pageSize={10}
          searchKeys={(r) => `${r.item} ${r.requestedBy} ${r.status}`}
          searchPlaceholder="Search requests…"
          emptyTitle="No restock requests"
        />
      ) : null}

      <Dialog open={!!adjusting} onOpenChange={(o) => !o && setAdjusting(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust {adjusting?.name}</DialogTitle>
            <DialogDescription>
              Current level: {adjusting?.stock} {adjusting?.unit}. Use a negative value to record
              consumption or waste.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="adj">Adjustment ({adjusting?.unit})</Label>
            <Input
              id="adj"
              type="number"
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setAdjusting(null)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              onClick={() => {
                if (!adjusting) return;
                const n = Number(delta) || 0;
                updateInventory.mutate(
                  { id: adjusting.id, stock: Math.max(0, adjusting.stock + n) },
                  {
                    onSuccess: () => {
                      toast.success(`${adjusting.name} stock updated`);
                      setAdjusting(null);
                    },
                    onError: (e) =>
                      toast.error(e instanceof Error ? e.message : "Could not update stock"),
                  },
                );
              }}
            >
              Save adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
