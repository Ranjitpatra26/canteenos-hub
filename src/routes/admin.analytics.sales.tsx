import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/shared/stat-card";
import { BarSeries, ChartPanel, DonutChart } from "@/components/shared/charts";
import { SectionCard, MetricRow } from "@/components/shared/panels";
import { DataTable, type Column } from "@/components/shared/data-table";
import { inr } from "@/lib/format";
import { categorySplit, mostOrdered } from "@/data/operations";
import { salesByCounter, fulfilmentSplit } from "@/data/admin";
import { menuItems } from "@/data/menu";
import { categoryImage } from "@/lib/food-images";

export const Route = createFileRoute("/admin/analytics/sales")({
  head: () => ({
    meta: [
      { title: "Sales analytics — CanteenOS" },
      {
        name: "description",
        content:
          "Dish-level sales performance, category mix, counter split and fulfilment breakdown.",
      },
      { property: "og:title", content: "Sales analytics — CanteenOS" },
      { property: "og:description", content: "See which dishes and counters drive canteen sales." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SalesAnalytics,
});

interface SalesRow {
  id: string;
  name: string;
  emoji: string;
  category: string;
  units: number;
  revenue: number;
  rating: number;
}

function SalesAnalytics() {
  const rows: SalesRow[] = menuItems.map((m, i) => ({
    id: m.id,
    name: m.name,
    emoji: m.emoji,
    category: m.categorySlug,
    units: Math.round(m.popularity * (6 + (i % 7))),
    revenue: Math.round(m.popularity * (6 + (i % 7)) * m.price),
    rating: m.rating,
  }));

  const totalUnits = rows.reduce((s, r) => s + r.units, 0);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const maxCounter = Math.max(...salesByCounter.map((c) => c.orders));

  const columns: Column<SalesRow>[] = [
    {
      key: "name",
      header: "Dish",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="flex items-center gap-2.5">
          <img
            src={categoryImage(r.category)}
            alt={r.name}
            loading="lazy"
            width={64}
            height={64}
            className="size-8 shrink-0 rounded-lg object-cover"
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{r.name}</span>
            <span className="block text-xs capitalize text-muted-foreground">
              {r.category.replace("-", " ")}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: "units",
      header: "Units",
      align: "right",
      sortable: true,
      sortValue: (r) => r.units,
      cell: (r) => r.units.toLocaleString("en-IN"),
    },
    {
      key: "revenue",
      header: "Revenue",
      align: "right",
      sortable: true,
      sortValue: (r) => r.revenue,
      cell: (r) => <span className="font-medium">{inr(r.revenue)}</span>,
    },
    {
      key: "share",
      header: "Share",
      align: "right",
      cell: (r) => `${((r.revenue / totalRevenue) * 100).toFixed(1)}%`,
    },
    {
      key: "rating",
      header: "Rating",
      align: "right",
      sortable: true,
      sortValue: (r) => r.rating,
      cell: (r) => `★ ${r.rating}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Units sold"
          value={totalUnits.toLocaleString("en-IN")}
          delta={{ value: "+7.8%" }}
          index={0}
        />
        <StatCard
          label="Sales value"
          value={inr(totalRevenue)}
          delta={{ value: "+11.2%" }}
          index={1}
        />
        <StatCard label="Best seller" value="Masala Chai" hint="1,284 units" index={2} />
        <StatCard
          label="Menu items live"
          value={String(menuItems.filter((m) => m.available).length)}
          hint={`of ${menuItems.length}`}
          index={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Top dishes by revenue"
          description="Rolling 30 days"
          className="lg:col-span-2"
          index={0}
        >
          <BarSeries
            data={mostOrdered}
            xKey="name"
            bars={[{ key: "revenue", name: "Revenue" }]}
            horizontal
            formatter={inr}
          />
        </ChartPanel>
        <div className="space-y-6">
          <ChartPanel title="Category mix" height={200} index={1}>
            <DonutChart data={categorySplit} />
          </ChartPanel>
          <ChartPanel title="Fulfilment" height={200} index={2}>
            <DonutChart data={fulfilmentSplit} />
          </ChartPanel>
        </div>
      </div>

      <SectionCard title="Sales by counter" description="Order volume distribution" index={3}>
        <ul className="space-y-4">
          {salesByCounter.map((c) => (
            <MetricRow
              key={c.counter}
              label={c.counter}
              value={`${c.orders} orders`}
              pct={(c.orders / maxCounter) * 100}
              tone="accent"
            />
          ))}
        </ul>
      </SectionCard>

      <DataTable
        rows={rows}
        columns={columns}
        pageSize={10}
        searchKeys={(r) => `${r.name} ${r.category}`}
        searchPlaceholder="Search dishes…"
        emptyTitle="No dishes match"
      />
    </div>
  );
}
