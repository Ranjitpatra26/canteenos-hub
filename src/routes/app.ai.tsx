import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Bot, Calendar, Flame, History, Key, Sparkles, Star, TrendingUp, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/panels";
import { FoodCard } from "@/components/shared/food-card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState, CardSkeletonGrid } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useMenuItems, useMyOrders } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/hooks/use-auth";
import { inr } from "@/lib/format";
import {
  AI_FAQ,
  askGrokAi,
  frequentlyOrdered,
  getGrokApiKey,
  mealWindow,
  orderInsights,
  popularMeals,
  recommendFor,
  setGrokApiKey,
  trendingItems,
} from "@/lib/canteen-ai";
import { toast } from "sonner";
import { foodImage } from "@/lib/food-images";

export const Route = createFileRoute("/app/ai")({
  head: () => ({
    meta: [
      { title: "Canteen AI — smart food recommendations" },
      {
        name: "description",
        content:
          "Canteen AI recommends dishes from your order history, surfaces trending campus meals and answers canteen questions instantly.",
      },
      { property: "og:title", content: "Canteen AI — smart food recommendations" },
      {
        property: "og:description",
        content: "Personalised dish picks, trending meals and order insights.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CanteenAiPage,
});

function CanteenAiPage() {
  const { data: items = [], isLoading } = useMenuItems();
  const { data: orders = [] } = useMyOrders();
  const { add, favorites, isFavorite, toggleFavorite } = useCart();
  const { profile } = useAuth();
  const firstName = (profile?.full_name ?? "there").split(" ")[0];
  const window = mealWindow();

  const [plannerLoading, setPlannerLoading] = useState(false);
  const [mealPlanResult, setMealPlanResult] = useState<string | null>(null);

  const suggestions = useMemo(
    () => recommendFor(items, orders, { favorites, limit: 4 }),
    [items, orders, favorites],
  );
  const trending = useMemo(() => trendingItems(orders, items, 4), [orders, items]);
  const popular = useMemo(() => popularMeals(items, 4), [items]);
  const frequent = useMemo(() => frequentlyOrdered(orders, items, 5), [orders, items]);
  const insights = useMemo(() => orderInsights(orders, items), [orders, items]);

  const addItem = (id: string, name: string) => {
    add(id, 1);
    toast.success(`${name} added to cart`);
  };

  const handleGenerateMealPlan = async () => {
    setPlannerLoading(true);
    try {
      const res = await askGrokAi(
        "Generate a balanced 3-day canteen meal plan (Breakfast, Lunch, Dinner) from the live menu for a campus student with calorie estimates and total cost.",
        { items, orders, favorites, name: firstName },
      );
      setMealPlanResult(res.text);
      toast.success("AI 3-Day Meal Plan generated!");
    } catch {
      toast.error("Could not generate meal plan.");
    } finally {
      setPlannerLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Canteen AI"
        description={`Personalised picks for ${firstName}, tuned for ${window} on campus.`}
        crumbs={[{ label: "Student", to: "/app" }, { label: "Canteen AI" }]}
        actions={
          <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
            <Zap className="mr-1.5 size-3.5 fill-amber-400 text-amber-400" /> Grok AI Active
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {insights.slice(0, 4).map((i, idx) => (
          <StatCard key={i.label} label={i.label} value={i.value} hint={i.hint} index={idx} />
        ))}
      </div>

      <SectionCard
        className="mt-6"
        title="Recommended for you"
        description="Blends your taste history, saved dishes and the current meal window."
        actions={
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link to="/app/menu">
              Full menu <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
        padded={false}
      >
        <div className="p-5 pt-0">
          {isLoading ? (
            <CardSkeletonGrid count={4} />
          ) : suggestions.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {suggestions.map((s, i) => (
                <div key={s.item.id} className="space-y-2">
                  <FoodCard
                    item={s.item}
                    index={i}
                    onAdd={(it) => addItem(it.id, it.name)}
                    isFavorite={isFavorite(s.item.id)}
                    onToggleFavorite={(it) => toggleFavorite(it.id)}
                  />
                  <p className="flex items-start gap-1.5 px-1 text-[11px] text-muted-foreground">
                    <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
                    {s.reason}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Sparkles className="size-6" />}
              title="Not enough signal yet"
              description="Place your first order and Canteen AI will start personalising your menu."
              action={
                <Button asChild className="rounded-xl">
                  <Link to="/app/menu">Browse the menu</Link>
                </Button>
              }
            />
          )}
        </div>
      </SectionCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Trending this week"
          description="Fastest-moving dishes across campus."
          index={1}
        >
          <ul className="space-y-2">
            {trending.map((t, i) => (
              <li
                key={t.item.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 transition-colors hover:border-primary/40"
              >
                <img
                  src={foodImage(t.item)}
                  alt={t.item.name}
                  loading="lazy"
                  width={72}
                  height={72}
                  className="size-9 shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{t.item.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {inr(t.item.price)} ·{" "}
                    {t.velocity > 0 ? `${t.velocity} ordered recently` : "rising"}
                  </span>
                </span>
                <Badge variant="outline" className="rounded-full text-[10px]">
                  <TrendingUp className="mr-1 size-3" /> #{i + 1}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-lg"
                  onClick={() => addItem(t.item.id, t.item.name)}
                >
                  Add
                </Button>
              </li>
            ))}
            {!trending.length ? (
              <EmptyState
                title="Nothing trending yet"
                description="Check back after the lunch rush."
              />
            ) : null}
          </ul>
        </SectionCard>

        <SectionCard
          title="Frequently ordered by you"
          description="One tap to reorder your regulars."
          index={2}
        >
          {frequent.length ? (
            <ul className="space-y-2">
              {frequent.map((f) => (
                <li
                  key={f.item.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 transition-colors hover:border-primary/40"
                >
                  <img
                    src={foodImage(f.item)}
                    alt={f.item.name}
                    loading="lazy"
                    width={72}
                    height={72}
                    className="size-9 shrink-0 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{f.item.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      ordered {f.times} {f.times === 1 ? "time" : "times"}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() => addItem(f.item.id, f.item.name)}
                  >
                    <History className="size-3.5" /> Reorder
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<History className="size-6" />}
              title="No repeat orders yet"
              description="Your regulars will appear here once you order a dish more than once."
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        className="mt-6"
        title="Popular meals on campus"
        description="What everyone else is eating today."
        index={3}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {popular.map((item) => (
            <motion.button
              key={item.id}
              type="button"
              whileHover={{ y: -4 }}
              onClick={() => addItem(item.id, item.name)}
              className="glass-reflect flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3 text-left transition-colors hover:border-primary/40"
            >
              <img
                src={foodImage(item)}
                alt={item.name}
                loading="lazy"
                width={88}
                height={88}
                className="size-11 shrink-0 rounded-xl object-cover"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{item.name}</span>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Star className="size-3 fill-amber-400 text-amber-400" /> {item.rating.toFixed(1)}{" "}
                  · {inr(item.price)}
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        className="mt-6"
        title="3-Day AI Meal & Calorie Planner"
        description="Let Grok 2 build a balanced 3-day meal plan tuned to your taste and budget."
        index={4}
        actions={
          <Button
            size="sm"
            className="rounded-xl gap-1.5"
            onClick={handleGenerateMealPlan}
            disabled={plannerLoading}
          >
            <Calendar className="size-3.5" />
            {plannerLoading ? "Generating Plan…" : "Generate 3-Day Plan"}
          </Button>
        }
      >
        {mealPlanResult ? (
          <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {mealPlanResult}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground border border-dashed border-border rounded-2xl">
            <Zap className="size-8 text-amber-400 mb-2" />
            <p className="font-medium text-foreground">Generate your personalized student meal plan</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              Grok 2 analyzes calories, prices, and prep times across the entire campus catalogue to create a 3-day breakfast, lunch, and dinner itinerary.
            </p>
          </div>
        )}
      </SectionCard>

      <SectionCard
        className="mt-6"
        title="Smart FAQ assistant"
        description="Instant answers to the questions students ask most."
        index={5}
        actions={<Flame className="size-4 text-primary" />}
      >
        <Accordion type="single" collapsible className="w-full">
          {AI_FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {f.a.split("**").map((chunk, idx) =>
                  idx % 2 ? (
                    <strong key={idx} className="font-semibold text-foreground">
                      {chunk}
                    </strong>
                  ) : (
                    <span key={idx}>{chunk}</span>
                  ),
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionCard>
    </div>
  );
}
