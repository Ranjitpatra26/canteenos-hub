import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { FoodCard } from "@/components/shared/food-card";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { useMenuItems } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";

export const Route = createFileRoute("/app/favorites")({
  head: () => ({
    meta: [
      { title: "Saved dishes — CanteenOS" },
      {
        name: "description",
        content: "Your saved canteen dishes, ready to reorder in a single tap.",
      },
      { property: "og:title", content: "Saved dishes — CanteenOS" },
      { property: "og:description", content: "Reorder your favourite campus meals instantly." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites, isFavorite, toggleFavorite, add } = useCart();
  const { data: menuItems = [] } = useMenuItems();
  const items = menuItems.filter((m) => favorites.includes(m.id));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Saved dishes"
        description={`${items.length} dish${items.length === 1 ? "" : "es"} you keep coming back to.`}
        crumbs={[{ label: "Student", to: "/app" }, { label: "Favorites" }]}
      />
      {items.length === 0 ? (
        <EmptyState
          icon={<Heart className="size-6" />}
          title="No saved dishes yet"
          description="Tap the heart on any dish to keep it here for quick reordering."
          action={
            <Button asChild className="rounded-xl">
              <Link to="/app/menu">Browse the menu</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((item, i) => (
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
