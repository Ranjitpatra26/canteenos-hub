import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/components/shared/stat-card";
import { BarSeries, ChartPanel, LineSeries } from "@/components/shared/charts";
import { SectionCard, MetricRow, Pill } from "@/components/shared/panels";
import { inr } from "@/lib/format";
import { inventory } from "@/data/operations";
import { inventoryTrend, inventoryValue, lowStock } from "@/data/admin";

export const Route = createFileRoute("/admin/analytics/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory analytics — CanteenOS" },
      {
        name: "description",
        content:
          "Stock valuation, wastage trend, turnover ratio and category-level inventory health.",
      },
      { property: "og:title", content: "Inventory analytics — CanteenOS" },
      {
        property: "og:description",
        content: "Stock value, wastage and turnover analytics for the canteen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InventoryAnalytics,
});

function InventoryAnalytics() {
  const byCategory = Object.values(
    inventory.reduce<Record<string, { name: string; value: number; items: number }>>((acc, i) => {
      acc[i.category] ??= { name: i.category, value: 0, items: 0 };
      acc[i.category].value += i.stock * i.costPerUnit;
      acc[i.category].items += 1;
      return acc;
    }, {}),
  ).sort((a, b) => b.value - a.value);

  const maxCat = Math.max(...byCategory.map((c) => c.value));
  const waste = inventoryTrend.reduce((s, w) => s + w.waste, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Stock on hand"
          value={inr(inventoryValue)}
          delta={{ value: "+4.8%" }}
          index={0}
        />
        <StatCard
          label="Wastage (6 wks)"
          value={inr(waste)}
          delta={{ value: "-14.2%" }}
          index={1}
        />
        <StatCard label="Turnover ratio" value="3.5×" delta={{ value: "+0.4×" }} index={2} />
        <StatCard
          label="Below reorder"
          value={String(lowStock.length)}
          delta={{ value: "+2", positive: false }}
          index={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartPanel
          title="Inventory value trend"
          description="Weekly closing value"
          className="lg:col-span-2"
          index={0}
        >
          <LineSeries
            data={inventoryTrend}
            xKey="week"
            lines={[
              { key: "value", name: "Stock value" },
              { key: "waste", name: "Wastage", color: "var(--destructive)" },
            ]}
            formatter={inr}
          />
        </ChartPanel>
        <ChartPanel title="Turnover" description="Times stock cycled per week" index={1}>
          <BarSeries
            data={inventoryTrend}
            xKey="week"
            bars={[{ key: "turnover", name: "Turnover" }]}
          />
        </ChartPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Value by category" index={2}>
          <ul className="space-y-4">
            {byCategory.map((c) => (
              <MetricRow
                key={c.name}
                label={`${c.name} · ${c.items} SKUs`}
                value={inr(c.value)}
                pct={(c.value / maxCat) * 100}
              />
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Reorder watchlist" description="Items at or under threshold" index={3}>
          <ul className="divide-y divide-border">
            {lowStock.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{i.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {i.sku} · {i.supplier}
                  </span>
                </span>
                <Pill tone={i.stock < i.reorderAt * 0.6 ? "danger" : "warning"}>
                  {i.stock} / {i.reorderAt} {i.unit}
                </Pill>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
