import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMenuItems } from "@/lib/api";
import { foodImage } from "@/lib/food-images";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/kitchen/menu")({
  head: () => ({
    meta: [
      { title: "Today's dishes — CanteenOS kitchen" },
      { name: "description", content: "Dishes the kitchen is cooking today with prep times." },
      { property: "og:title", content: "Today's dishes — CanteenOS kitchen" },
      { property: "og:description", content: "Live dish list and prep times for kitchen staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: KitchenMenuPage,
});

function KitchenMenuPage() {
  const { data: items = [], isLoading } = useMenuItems();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items;
  }, [items, query]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Today's dishes"
        description="Everything on the counter right now, with prep times and availability."
        crumbs={[{ label: "Kitchen", to: "/kitchen" }, { label: "Dishes" }]}
      />
      <div className="mb-4 max-w-sm">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes…"
          className="rounded-xl"
          aria-label="Search dishes"
        />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <li key={item.id} className="surface-card flex gap-3 rounded-2xl p-3">
              <img
                src={foodImage(item)}
                alt={item.name}
                loading="lazy"
                className="size-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <Badge variant={item.available ? "default" : "secondary"} className="shrink-0">
                    {item.available ? "Available" : "Sold out"}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {inr(item.price)} · {item.prepTimeMins} min prep · {item.veg ? "Veg" : "Non-veg"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
