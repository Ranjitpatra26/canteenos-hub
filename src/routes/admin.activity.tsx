import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard, SegmentedControl, Timeline, Pill } from "@/components/shared/panels";
import { timeAgo } from "@/lib/format";
import { activityTimeline } from "@/data/admin";

export const Route = createFileRoute("/admin/activity")({
  head: () => ({
    meta: [
      { title: "Activity feed — CanteenOS" },
      {
        name: "description",
        content:
          "A live chronological feed of orders, payments, stock and menu activity across the canteen.",
      },
      { property: "og:title", content: "Activity feed — CanteenOS" },
      { property: "og:description", content: "Live chronological feed of canteen operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ActivityPage,
});

type Kind = "all" | "order" | "payment" | "stock" | "menu" | "user" | "system";

function ActivityPage() {
  const [kind, setKind] = useState<Kind>("all");
  const rows = activityTimeline.filter((a) => kind === "all" || a.kind === kind);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Activity"
        description="Everything happening across the canteen, newest first."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Activity" }]}
      />

      <SegmentedControl
        className="mb-4"
        value={kind}
        onChange={setKind}
        options={[
          { value: "all", label: "All" },
          { value: "order", label: "Orders" },
          { value: "payment", label: "Payments" },
          { value: "stock", label: "Stock" },
          { value: "menu", label: "Menu" },
          { value: "user", label: "Users" },
          { value: "system", label: "System" },
        ]}
      />

      <SectionCard title={`${rows.length} events`} description="Rolling 24 hours">
        {rows.length ? (
          <Timeline
            items={rows.map((a) => ({
              id: a.id,
              title: a.title,
              detail: a.detail,
              time: timeAgo(a.at),
              icon: <Pill>{a.kind}</Pill>,
            }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            No activity of this type in the last 24 hours.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
