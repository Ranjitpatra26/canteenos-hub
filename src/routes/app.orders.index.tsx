import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type Column } from "@/components/shared/data-table";
import { OfflineQueuePanel } from "@/components/pwa/offline-queue-panel";

import { Button } from "@/components/ui/button";
import { useMyOrders, useRealtimeOrders } from "@/lib/api";
import { inr, shortDate } from "@/lib/format";
import type { Order } from "@/types";

export const Route = createFileRoute("/app/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — CanteenOS" },
      {
        name: "description",
        content:
          "Every canteen order you've placed, with live status, totals and reorder in one tap.",
      },
      { property: "og:title", content: "My orders — CanteenOS" },
      { property: "og:description", content: "Live status and history for every canteen order." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const [filter, setFilter] = useState<string>("all");
  useRealtimeOrders();
  const { data: orders = [], isLoading } = useMyOrders();
  const rows = orders.filter((o) => (filter === "all" ? true : o.status === filter));

  const columns: Column<Order>[] = [
    {
      key: "code",
      header: "Order",
      sortable: true,
      sortValue: (r) => r.code,
      cell: (r) => (
        <Link
          to="/app/orders/$orderId"
          params={{ orderId: r.id }}
          className="font-medium hover:text-primary"
        >
          {r.code}
        </Link>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (r) => (
        <span className="block max-w-[280px] truncate text-muted-foreground">
          {r.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}
        </span>
      ),
    },
    {
      key: "date",
      header: "Placed",
      sortable: true,
      sortValue: (r) => r.placedAt,
      cell: (r) => shortDate(r.placedAt),
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortable: true,
      sortValue: (r) => r.total,
      cell: (r) => <span className="font-medium">{inr(r.total)}</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <PageHeader
        title="My orders"
        description="Track live orders and revisit everything you've eaten this term."
        crumbs={[{ label: "Student", to: "/app" }, { label: "Orders" }]}
      />
      <OfflineQueuePanel />
      <DataTable
        rows={rows}
        loading={isLoading}
        columns={columns}
        searchKeys={(r) => `${r.code} ${r.lines.map((l) => l.name).join(" ")}`}
        searchPlaceholder="Search by order code or dish…"
        toolbar={
          <div className="flex flex-wrap gap-2">
            {["all", "placed", "preparing", "ready", "completed", "cancelled"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={filter === s ? "default" : "secondary"}
                className="rounded-lg capitalize"
                onClick={() => setFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        }
      />
    </div>
  );
}
