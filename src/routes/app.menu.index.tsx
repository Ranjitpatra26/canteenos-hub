import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Filter, Leaf, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { FoodCard } from "@/components/shared/food-card";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories, useMenuItems } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/app/menu/")({
  // Optional so plain <Link to="/app/menu"> stays valid everywhere in the app.
  validateSearch: (search: Record<string, unknown>): { category?: string } => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse the canteen menu — CanteenOS" },
      {
        name: "description",
        content:
          "Search 40+ freshly prepared campus dishes, filter by category, diet and price, and add them to your cart.",
      },
      { property: "og:title", content: "Browse the canteen menu — CanteenOS" },
      { property: "og:description", content: "Search, filter and order from today's campus menu." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { category = "all" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { add, isFavorite, toggleFavorite } = useCart();

  const [query, setQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(true);
  const [maxPrice, setMaxPrice] = useState(400);
  const [sort, setSort] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const { data: menuItems = [] } = useMenuItems();
  const { data: categories = [] } = useCategories();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = menuItems.filter((m) => {
      if (category !== "all" && m.categorySlug !== category) return false;
      if (vegOnly && !m.veg) return false;
      if (availableOnly && !m.available) return false;
      if (m.price > maxPrice) return false;
      if (q && !`${m.name} ${m.description} ${m.tags.join(" ")}`.toLowerCase().includes(q))
        return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "fastest") return a.prepTimeMins - b.prepTimeMins;
      return b.popularity - a.popularity;
    });
    return list;
  }, [menuItems, category, query, vegOnly, availableOnly, maxPrice, sort]);

  const setCategory = (slug: string) => navigate({ to: ".", search: { category: slug } });

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Today's menu"
        description={`${menuItems.filter((m) => m.available).length} dishes cooking across 4 counters.`}
        crumbs={[{ label: "Student", to: "/app" }, { label: "Menu" }]}
        actions={
          <Button asChild variant="secondary" className="rounded-xl">
            <Link to="/app/cart">Go to cart</Link>
          </Button>
        }
      />

      <div className="sticky top-16 z-20 -mx-4 mb-6 bg-background/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dosa, burger, cold coffee…"
              className="rounded-xl pl-9 pr-12"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" />
              </button>

            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[150px] rounded-xl">
                <SlidersHorizontal className="size-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most popular</SelectItem>
                <SelectItem value="rating">Top rated</SelectItem>
                <SelectItem value="fastest">Fastest first</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setShowFilters((s) => !s)}
            >
              <Filter className="size-4" /> Filters
            </Button>
          </div>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <CategoryChip active={category === "all"} onClick={() => setCategory("all")}>
            All items
          </CategoryChip>
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              active={category === c.slug}
              onClick={() => setCategory(c.slug)}
            >
              <span className="mr-1">{c.emoji}</span>
              {c.name}
            </CategoryChip>
          ))}
        </div>

        {showFilters ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 overflow-hidden"
          >
            <div className="grid gap-5 surface-card p-4 sm:grid-cols-3">
              <div>
                <Label className="text-xs text-muted-foreground">Max price · {inr(maxPrice)}</Label>
                <Slider
                  value={[maxPrice]}
                  onValueChange={([v]) => setMaxPrice(v)}
                  min={50}
                  max={400}
                  step={10}
                  className="mt-3"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="veg" className="flex items-center gap-2 text-sm font-normal">
                  <Leaf className="size-4 text-success" /> Vegetarian only
                </Label>
                <Switch id="veg" checked={vegOnly} onCheckedChange={setVegOnly} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="avail" className="text-sm font-normal">
                  Hide sold out
                </Label>
                <Switch id="avail" checked={availableOnly} onCheckedChange={setAvailableOnly} />
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary" className="rounded-full">
          {results.length} dishes
        </Badge>
        {category !== "all" ? (
          <button onClick={() => setCategory("all")} className="hover:text-foreground">
            Clear category
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <EmptyState
          title="No dishes match those filters"
          description="Try widening your price range or clearing the vegetarian filter."
          action={
            <Button
              className="rounded-xl"
              onClick={() => {
                setQuery("");
                setVegOnly(false);
                setMaxPrice(400);
                setCategory("all");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {results.map((item, i) => (
            <FoodCard
              key={item.id}
              item={item}
              index={i}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={(m) => toggleFavorite(m.id)}
              onAdd={(m) => {
                add(m.id);
                toast.success(`${m.name} added to cart`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
