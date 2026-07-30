import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Ban, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ExportActions, Pill, SectionCard, Timeline } from "@/components/shared/panels";
import { ChartPanel, BarSeries } from "@/components/shared/charts";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inr, shortDate, tintStyle, timeAgo } from "@/lib/format";
import { orders } from "@/data/orders";
import { useDirectory, useSetUserStatus } from "@/lib/api";
import { customerGrowth } from "@/data/operations";
import type { Customer } from "@/types";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers — CanteenOS" },
      {
        name: "description",
        content:
          "Student customer directory with spend, order history, departments and account status controls.",
      },
      { property: "og:title", content: "Customers — CanteenOS" },
      {
        property: "og:description",
        content: "Student directory, spend and lifetime order history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { data: directory = [] } = useDirectory();
  const setUserStatus = useSetUserStatus();
  const rows: Customer[] = directory.filter((u) => u.role === "student");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState<Customer | null>(null);

  const filtered = rows.filter((r) => status === "all" || r.status === status);
  const spend = rows.reduce((s, c) => s + c.spend, 0);

  const columns: Column<Customer>[] = [
    {
      key: "name",
      header: "Student",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="flex items-center gap-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
            style={tintStyle(r.tint)}
          >
            {r.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{r.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{r.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: "sid",
      header: "Student ID",
      cell: (r) => <span className="font-mono text-xs">{r.studentId}</span>,
    },
    {
      key: "dept",
      header: "Department",
      sortable: true,
      sortValue: (r) => r.department,
      cell: (r) => <Pill>{r.department}</Pill>,
    },
    { key: "year", header: "Year", cell: (r) => r.year },
    {
      key: "orders",
      header: "Orders",
      align: "right",
      sortable: true,
      sortValue: (r) => r.orders,
      cell: (r) => r.orders,
    },
    {
      key: "spend",
      header: "Lifetime spend",
      align: "right",
      sortable: true,
      sortValue: (r) => r.spend,
      cell: (r) => <span className="font-medium">{inr(r.spend)}</span>,
    },
    {
      key: "joined",
      header: "Joined",
      sortable: true,
      sortValue: (r) => r.joinedAt,
      cell: (r) => shortDate(r.joinedAt),
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <Pill
          tone={r.status === "active" ? "success" : r.status === "inactive" ? "muted" : "danger"}
        >
          {r.status}
        </Pill>
      ),
    },
  ];

  const topSpenders = [...rows]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 8)
    .map((c) => ({ name: c.name, spend: c.spend }));
  const history = open ? orders.filter((o) => o.customerId === open.id) : [];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Customers"
        description="Every student account, their spend and their order history."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Customers" }]}
        actions={<ExportActions name="Customer directory" />}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Registered students"
          value={rows.length.toLocaleString("en-IN")}
          delta={{ value: "+8.2%" }}
          index={0}
        />
        <StatCard
          label="Active this month"
          value={String(rows.filter((r) => r.status === "active").length)}
          index={1}
        />
        <StatCard label="Lifetime spend" value={inr(spend)} delta={{ value: "+11.6%" }} index={2} />
        <StatCard
          label="Avg. spend / student"
          value={inr(Math.round(spend / Math.max(1, rows.length)))}
          index={3}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartPanel title="Top spenders" description="Lifetime value" height={340} index={0}>
          <BarSeries
            data={topSpenders}
            xKey="name"
            bars={[{ key: "spend", name: "Spend" }]}
            horizontal
            formatter={inr}
          />
        </ChartPanel>
        <ChartPanel title="Customer growth" description="New versus returning" height={340} index={1}>
          <BarSeries
            data={customerGrowth}
            xKey="month"
            bars={[
              { key: "new", name: "New" },
              { key: "returning", name: "Returning" },
            ]}
            stacked
          />
        </ChartPanel>
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        pageSize={10}
        onRowClick={setOpen}
        searchKeys={(r) => `${r.name} ${r.email} ${r.studentId} ${r.department}`}
        searchPlaceholder="Search students…"
        emptyTitle="No customers found"
        toolbar={
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{open?.name}</SheetTitle>
            <SheetDescription>
              {open?.studentId} · {open?.department} · {open?.year}
            </SheetDescription>
          </SheetHeader>

          {open ? (
            <div className="space-y-6 px-4 pb-8">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="mt-1 text-xl font-semibold">{open.orders}</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground">Lifetime spend</p>
                  <p className="mt-1 text-xl font-semibold">{inr(open.spend)}</p>
                </div>
              </div>

              <SectionCard title="Recent orders" padded={false}>
                {history.length ? (
                  <Timeline
                    items={history.map((o) => ({
                      id: o.id,
                      title: `${o.code} · ${inr(o.total)}`,
                      detail: `${o.lines.length} items from ${o.counter}`,
                      time: timeAgo(o.placedAt),
                    }))}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No orders recorded for this student yet.
                  </p>
                )}
              </SectionCard>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => toast.success(`Email drafted to ${open.email}`)}
                >
                  <Mail className="size-4" /> Email student
                </Button>
                <Button
                  variant={open.status === "blocked" ? "outline" : "destructive"}
                  className="rounded-xl"
                  onClick={() => {
                    const next = open.status === "blocked" ? "active" : "blocked";
                    setUserStatus.mutate(
                      { userId: open.id, status: next },
                      {
                        onSuccess: () => {
                          setOpen({ ...open, status: next });
                          toast.success(
                            `${open.name} ${next === "blocked" ? "blocked" : "reinstated"}`,
                          );
                        },
                        onError: (e) =>
                          toast.error(e instanceof Error ? e.message : "Could not update account"),
                      },
                    );
                  }}
                >
                  {open.status === "blocked" ? (
                    <ShieldCheck className="size-4" />
                  ) : (
                    <Ban className="size-4" />
                  )}
                  {open.status === "blocked" ? "Unblock account" : "Block account"}
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
