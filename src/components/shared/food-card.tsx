import { useRef, memo } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Clock, Heart, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/fx/motion-fx";
import { cn } from "@/lib/utils";
import { inr, tintGradient } from "@/lib/format";
import { foodImage } from "@/lib/food-images";

import { flyToCart } from "@/lib/fx";
import type { MenuItem } from "@/types";

export function estimateProtein(item: MenuItem): number {
  const name = item.name.toLowerCase();
  const tags = item.tags.map((t) => t.toLowerCase());
  if (name.includes("paneer") || tags.includes("paneer")) return 26;
  if (name.includes("egg") || tags.includes("egg")) return 22;
  if (name.includes("chicken") || tags.includes("chicken")) return 32;
  if (name.includes("chole") || name.includes("rajma") || name.includes("dal")) return 18;
  if (name.includes("shake") || name.includes("milk") || name.includes("curd")) return 14;
  if (name.includes("sprouts") || name.includes("salad")) return 12;
  if (item.veg) return 8;
  return 12;
}

function FoodCardBase({
  item,
  onAdd,
  isFavorite,
  onToggleFavorite,
  index = 0,
}: {
  item: MenuItem;
  onAdd?: (item: MenuItem) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (item: MenuItem) => void;
  index?: number;
}) {
  const emojiRef = useRef<HTMLSpanElement>(null);
  const protein = estimateProtein(item);

  function handleAdd() {
    flyToCart(emojiRef.current, item.emoji);
    onAdd?.(item);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3), ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard intensity={9} className="group h-full rounded-2xl">
        <article className="glass-reflect flex h-full flex-col overflow-hidden surface-card transition-colors duration-300 group-hover:border-primary/40 group-hover:shadow-[var(--shadow-glow)]">
          <Link
            to="/app/menu/$itemId"
            params={{ itemId: item.id }}
            className="relative block aspect-[16/10] overflow-hidden"
            style={tintGradient(item.tint)}
            aria-label={item.name}
          >
            <img
              src={foodImage(item)}
              alt={item.name}
              loading="lazy"
              width={1024}
              height={640}
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-background/25 to-transparent" />
            <span
              ref={emojiRef}
              className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full border border-border/60 bg-background/70 text-xl backdrop-blur transition-transform duration-500 [transform:translateZ(40px)] group-hover:scale-110"
            >
              {item.emoji}
            </span>

            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 [transform:translateZ(28px)]">
              <Badge
                variant="outline"
                className="rounded-full border-border/60 bg-background/70 text-[11px] backdrop-blur"
              >
                <span
                  className={cn(
                    "mr-1 inline-block size-1.5 rounded-full",
                    item.veg ? "bg-success" : "bg-destructive",
                  )}
                />
                {item.veg ? "Veg" : "Non-veg"}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-primary/40 bg-primary/20 font-bold text-primary text-[11px] backdrop-blur shadow-sm"
              >
                💪 {protein}g Protein
              </Badge>
              {!item.available ? (
                <Badge
                  variant="outline"
                  className="rounded-full bg-background/80 text-[11px] backdrop-blur"
                >
                  Sold out
                </Badge>
              ) : null}
            </div>
          </Link>

          <div className="flex flex-1 flex-col p-4 [transform:translateZ(20px)]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Link
                  to="/app/menu/$itemId"
                  params={{ itemId: item.id }}
                  className="line-clamp-1 font-semibold transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
              {onToggleFavorite ? (
                <button
                  type="button"
                  aria-label={isFavorite ? "Remove from favourites" : "Add to favourites"}
                  onClick={() => onToggleFavorite(item)}
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:scale-110 hover:text-primary"
                >
                  <Heart className={cn("size-4", isFavorite && "fill-primary text-primary")} />
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Star className="size-3.5 fill-primary text-primary" />
                {item.rating}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {item.prepTimeMins}m
              </span>
              <span>{item.calories} cal</span>
              <span className="font-semibold text-primary">· 💪 {protein}g protein</span>
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 pt-4">
              <span className="text-lg font-semibold">{inr(item.price)}</span>
              <Button
                size="sm"
                className="rounded-full"
                disabled={!item.available}
                onClick={handleAdd}
              >
                <Plus className="size-4" />
                Add
              </Button>
            </div>
          </div>
        </article>
      </TiltCard>
    </motion.div>
  );
}

/** Memoised: these render in long lists and re-render on every parent update. */
export const FoodCard = memo(FoodCardBase);
