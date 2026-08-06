import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Clock, Flame, Heart, Loader2, Minus, Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { FoodCard } from "@/components/shared/food-card";
import { PageHeader } from "@/components/shared/page-header";
import { useCategories, useMenuItems } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import { inr, tintGradient } from "@/lib/format";
import { foodImage } from "@/lib/food-images";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/menu/$itemId")({
  head: () => ({
    meta: [
      { title: "Dish details — CanteenOS" },
      {
        name: "description",
        content: "Dish details, nutrition, reviews and one-tap ordering on CanteenOS.",
      },
      { property: "og:title", content: "Dish details — CanteenOS" },
      { property: "og:description", content: "Dish details and one-tap ordering on CanteenOS." },
    ],
  }),
  component: ItemDetail,
  notFoundComponent: DishNotFound,
});

function DishNotFound() {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <h1 className="text-xl font-semibold">We couldn't find that dish</h1>
      <p className="mt-2 text-sm text-muted-foreground">It may have been taken off today's menu.</p>
      <Button asChild className="mt-6 rounded-xl">
        <Link to="/app/menu">Back to menu</Link>
      </Button>
    </div>
  );
}

const reviews = [
  {
    name: "Ishaan Kapoor",
    rating: 5,
    body: "Consistently the best thing on campus. Ready in under 10 minutes every time.",
    when: "2 days ago",
  },
  {
    name: "Meera Iyer",
    rating: 4,
    body: "Great flavour, could use a little more chutney on the side.",
    when: "5 days ago",
  },
  {
    name: "Rohit Sharma",
    rating: 5,
    body: "Ordered it three times this week. Pickup QR makes it effortless.",
    when: "1 week ago",
  },
];

function ItemDetail() {
  const { itemId } = Route.useParams();
  const { data: menuItems = [], isLoading } = useMenuItems();
  const { data: categories = [] } = useCategories();
  const { add, isFavorite, toggleFavorite } = useCart();
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const item = menuItems.find((m) => m.id === itemId);
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!item) return <DishNotFound />;

  const category = categories.find((c) => c.slug === item.categorySlug);
  const related = menuItems
    .filter((m) => m.categorySlug === item.categorySlug && m.id !== item.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={item.name}
        crumbs={[
          { label: "Student", to: "/app" },
          { label: "Menu", to: "/app/menu" },
          { label: item.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border"
          style={tintGradient(item.tint)}
        >
          <img
            src={foodImage(item)}
            alt={item.name}
            width={1024}
            height={640}
            className="absolute inset-0 size-full object-cover"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-background/30" />
          <span className="absolute bottom-4 right-4 grid size-14 place-items-center rounded-2xl border border-border/60 bg-background/70 text-3xl backdrop-blur">
            {item.emoji}
          </span>

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full bg-background/70 backdrop-blur">
              <span
                className={cn(
                  "mr-1.5 inline-block size-1.5 rounded-full",
                  item.veg ? "bg-success" : "bg-destructive",
                )}
              />
              {item.veg ? "Vegetarian" : "Non-vegetarian"}
            </Badge>
            {category ? (
              <Badge variant="outline" className="rounded-full bg-background/70 backdrop-blur">
                {category.emoji} {category.name}
              </Badge>
            ) : null}
          </div>
        </motion.div>

        <div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Star className="size-4 fill-primary text-primary" /> {item.rating}
            </span>
            <span>{item.reviews} reviews</span>
            <span className="flex items-center gap-1">
              <Clock className="size-4" /> {item.prepTimeMins} min
            </span>
            <span className="flex items-center gap-1">
              <Flame className="size-4 text-amber-400" /> {item.calories} kcal
            </span>
            <Badge variant="outline" className="rounded-full border-primary/40 bg-primary/10 font-bold text-primary text-xs">
              💪 {item.veg ? 16 : 28}g Protein per serving
            </Badge>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((t: string) => (
              <Badge key={t} variant="secondary" className="rounded-full">
                {t}
              </Badge>
            ))}
          </div>

          <p className="mt-6 text-3xl font-semibold tracking-tight">{inr(item.price)}</p>

          <div className="mt-6 space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Instructions for the kitchen
            </label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Less spicy, extra chutney, no onion…"
              className="rounded-xl"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-xl border border-border p-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>

            <Button
              className="flex-1 rounded-xl"
              disabled={!item.available}
              onClick={() => {
                add(item.id, qty);
                toast.success(`${qty}× ${item.name} added to cart`);
              }}
            >
              {item.available ? `Add ${qty} · ${inr(item.price * qty)}` : "Sold out today"}
            </Button>

            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle favorite"
              className="size-11 rounded-xl"
              onClick={() => toggleFavorite(item.id)}
            >
              <Heart className={cn("size-4", isFavorite(item.id) && "fill-primary text-primary")} />
            </Button>
          </div>

          <Separator className="my-8" />

          <h2 className="font-semibold">What students say</h2>
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <li key={r.name} className="surface-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{r.name}</p>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-primary text-primary" />
                    ))}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">{r.when}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {related.length ? (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">More from {category?.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((m, i) => (
              <FoodCard
                key={m.id}
                item={m}
                index={i}
                isFavorite={isFavorite(m.id)}
                onToggleFavorite={(x) => toggleFavorite(x.id)}
                onAdd={(x) => {
                  add(x.id);
                  toast.success(`${x.name} added to cart`);
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
