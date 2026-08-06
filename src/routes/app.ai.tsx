import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bot,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  History,
  Mic,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Wallet,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/panels";
import { FoodCard } from "@/components/shared/food-card";
import { StatCard } from "@/components/shared/stat-card";
import { EmptyState, CardSkeletonGrid } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  buildBudgetCombo,
  frequentlyOrdered,
  mealWindow,
  orderInsights,
  popularMeals,
  predictQueueWait,
  recommendFor,
  trendingItems,
} from "@/lib/canteen-ai";
import { toast } from "sonner";
import { foodImage } from "@/lib/food-images";
import type { MenuItem } from "@/types";

export const Route = createFileRoute("/app/ai")({
  head: () => ({
    meta: [
      { title: "Canteen AI — Nutrition, Protein & Fitness Assistant" },
      {
        name: "description",
        content:
          "Track daily protein, get student fitness meal picks, calculate canteen macros, and generate AI gym diet plans.",
      },
      { property: "og:title", content: "Canteen AI — Student Nutrition & Gym Companion" },
      {
        property: "og:description",
        content: "Track protein intake, bulk/cut meal picks, and 3-day AI student diet plans.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CanteenAiPage,
});

type FitnessGoal = "all" | "bulk" | "cut" | "study";

function estimateProtein(item: MenuItem): number {
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

export function CanteenAiPage() {
  const { data: items = [], isLoading } = useMenuItems();
  const { data: orders = [] } = useMyOrders();
  const { lines, add, favorites, isFavorite, toggleFavorite } = useCart();
  const { profile } = useAuth();
  const firstName = (profile?.full_name ?? "there").split(" ")[0];
  const window = mealWindow();

  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>("bulk");
  const [plannerGoal, setPlannerGoal] = useState<"bulk" | "cut" | "budget">("bulk");
  const [selectedBudget, setSelectedBudget] = useState<number>(120);
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [mealPlanResult, setMealPlanResult] = useState<string | null>(null);

  // Queue wait prediction
  const queueInfo = useMemo(() => predictQueueWait(orders), [orders]);

  // Budget Combo Optimizer
  const budgetCombo = useMemo(
    () => buildBudgetCombo(items, selectedBudget),
    [items, selectedBudget],
  );
  const comboTotalPrice = budgetCombo.reduce((acc, i) => acc + i.price, 0);
  const comboTotalProtein = budgetCombo.reduce((acc, i) => acc + estimateProtein(i), 0);

  // Compute total calories & estimated protein logged today (from today's completed/placed orders + cart)
  const todayMacros = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => o.placedAt.startsWith(todayStr));

    let calories = 0;
    let proteinGrams = 0;

    // From today's orders
    todayOrders.forEach((order) => {
      order.lines.forEach((line) => {
        const item = items.find((i) => i.id === line.itemId);
        if (item) {
          calories += item.calories * line.qty;
          proteinGrams += estimateProtein(item) * line.qty;
        }
      });
    });

    // From active cart
    lines.forEach((line: { itemId: string; qty: number }) => {
      const item = items.find((i) => i.id === line.itemId);
      if (item) {
        calories += item.calories * line.qty;
        proteinGrams += estimateProtein(item) * line.qty;
      }
    });

    return { calories, proteinGrams };
  }, [orders, lines, items]);

  const proteinTarget = 65; // grams
  const calorieTarget = 2200; // kcal
  const proteinPercent = Math.min(100, Math.round((todayMacros.proteinGrams / proteinTarget) * 100));
  const caloriePercent = Math.min(100, Math.round((todayMacros.calories / calorieTarget) * 100));

  const suggestions = useMemo(
    () => recommendFor(items, orders, { favorites, limit: 4 }),
    [items, orders, favorites],
  );
  const trending = useMemo(() => trendingItems(orders, items, 4), [orders, items]);
  const popular = useMemo(() => popularMeals(items, 4), [items]);
  const frequent = useMemo(() => frequentlyOrdered(orders, items, 5), [orders, items]);
  const insights = useMemo(() => orderInsights(orders, items), [orders, items]);

  // Fitness Goal Meal Filter
  const fitnessPicks = useMemo(() => {
    return items
      .filter((item) => {
        if (!item.available) return false;
        if (fitnessGoal === "bulk") {
          return estimateProtein(item) >= 15;
        }
        if (fitnessGoal === "cut") {
          return item.calories <= 350;
        }
        if (fitnessGoal === "study") {
          return (
            item.calories <= 450 ||
            item.name.toLowerCase().includes("tea") ||
            item.name.toLowerCase().includes("coffee") ||
            item.name.toLowerCase().includes("juice") ||
            item.name.toLowerCase().includes("oats")
          );
        }
        return true;
      })
      .slice(0, 4);
  }, [items, fitnessGoal]);

  const addItem = (id: string, name: string) => {
    add(id, 1);
    toast.success(`${name} added to cart! Macros updated 📊`);
  };

  const addFullCombo = () => {
    if (!budgetCombo.length) return;
    budgetCombo.forEach((item) => add(item.id, 1));
    toast.success(`Full ₹${selectedBudget} AI Combo added to cart! 🛍️`);
  };

  const handleGenerateMealPlan = async () => {
    setPlannerLoading(true);
    try {
      const goalPrompt =
        plannerGoal === "bulk"
          ? "high-protein muscle bulk diet (aim for 70g+ protein daily with dishes like Paneer Tikka, Eggs, Chole, Dal, Milkshakes)"
          : plannerGoal === "cut"
            ? "lean fat-loss diet (under 1500 kcal daily with clean salads, sprouts, light soups, and oats)"
            : "budget-friendly student diet (affordable campus meals under ₹150/day)";

      const res = await askGrokAi(
        `Generate a structured 3-Day Canteen Meal Plan (Breakfast, Lunch, Dinner, Snack) for a campus student focusing on a ${goalPrompt}. Include dish names from the menu, protein & calorie estimates per meal, total daily cost in INR, and 2 gym motivation tips.`,
        { items, orders, favorites, name: firstName },
      );
      setMealPlanResult(res.text);
      toast.success("AI Student Diet & Gym Plan generated!");
    } catch {
      toast.error("Could not generate diet plan.");
    } finally {
      setPlannerLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Canteen AI — Nutrition, Protein & Voice Assistant"
        description={`Personalised meal picks, protein tracker, voice ordering, and gym companion for ${firstName}.`}
        crumbs={[{ label: "Student", to: "/app" }, { label: "Canteen AI & Nutrition" }]}
        actions={
          <Badge variant="outline" className="rounded-full border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Dumbbell className="mr-1.5 size-3.5" /> Grok 2 & Voice Active
          </Badge>
        }
      />

      {/* Fitness Motivation & Live Queue Prediction Banner */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/15 via-background to-secondary/30 p-5 backdrop-blur-xl shadow-lg"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xs">
                  🔥
                </span>
                <h3 className="font-bold text-base text-foreground">3-Day Campus Gym Streak Active!</h3>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                  <Trophy className="mr-1 size-3" /> Protein Champion
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                "Fuel your study & gains! Use voice commands 🎙️ or tap the bot to order high-protein dishes instantly."
              </p>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <Button
                size="sm"
                className="rounded-xl font-semibold gap-1.5"
                onClick={() => {
                  const el = document.getElementById("diet-planner-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Calendar className="size-3.5" /> AI Diet Plan
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Live Kitchen Queue & Wait Time Predictor Widget */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-xl shadow-md flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Clock className="size-4 text-primary" /> Live Kitchen Traffic
            </span>
            <Badge variant="outline" className={`rounded-full text-[10px] ${queueInfo.status === "fast" ? "border-green-500/40 text-green-400" : "border-amber-500/40 text-amber-400"}`}>
              {queueInfo.status === "fast" ? "⚡ Fast Lane" : "🔥 Lunch Rush"}
            </Badge>
          </div>

          <div className="my-2">
            <p className="text-2xl font-extrabold tracking-tight text-foreground">
              ~{queueInfo.estimatedWaitMins} mins <span className="text-xs font-medium text-muted-foreground">est. pickup</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{queueInfo.advice}</p>
          </div>

          <div className="text-[10px] text-muted-foreground flex items-center justify-between border-t border-border pt-2">
            <span>Active orders: <strong>{queueInfo.activeOrdersCount}</strong></span>
            <span className="text-primary font-medium">Pre-cook available</span>
          </div>
        </motion.div>
      </div>

      {/* Student Budget Combo Optimizer */}
      <SectionCard
        title="Student Budget Combo Optimizer 💰"
        description="Select your budget and let Canteen AI construct the highest protein & calorie combo available."
        actions={
          <div className="flex items-center gap-1 rounded-xl border border-border bg-background/60 p-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedBudget(80)}
              className={`rounded-lg px-2.5 py-1 font-bold transition-colors ${selectedBudget === 80 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              ₹80 Budget
            </button>
            <button
              type="button"
              onClick={() => setSelectedBudget(120)}
              className={`rounded-lg px-2.5 py-1 font-bold transition-colors ${selectedBudget === 120 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              ₹120 Budget
            </button>
            <button
              type="button"
              onClick={() => setSelectedBudget(150)}
              className={`rounded-lg px-2.5 py-1 font-bold transition-colors ${selectedBudget === 150 ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              ₹150 Budget
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div>
              <p className="text-sm font-bold text-foreground">
                Optimized ₹{selectedBudget} Campus Combo ({budgetCombo.length} dishes)
              </p>
              <p className="text-xs text-muted-foreground">
                Total Price: <strong className="text-foreground">{inr(comboTotalPrice)}</strong> · Total Protein: <strong className="text-primary">{comboTotalProtein}g Protein</strong>
              </p>
            </div>
            {budgetCombo.length ? (
              <Button size="sm" className="rounded-xl font-bold gap-1.5" onClick={addFullCombo}>
                <Wallet className="size-3.5" /> Add Full Combo ({inr(comboTotalPrice)})
              </Button>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {budgetCombo.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background/50 p-3 transition-colors hover:border-primary/40"
              >
                <img
                  src={foodImage(item)}
                  alt={item.name}
                  width={64}
                  height={64}
                  className="size-11 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{item.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {inr(item.price)} · {item.calories} cal · ~{estimateProtein(item)}g Protein
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl h-8 text-xs font-semibold"
                  onClick={() => addItem(item.id, item.name)}
                >
                  + Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Daily Student Macro & Protein Tracker Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard
          title="Daily Protein & Macro Tracker"
          description="Live calculation from today's orders & active cart items."
          actions={
            <Badge variant="outline" className="rounded-full text-xs">
              Today's Fuel 📊
            </Badge>
          }
        >
          <div className="space-y-4">
            {/* Protein Progress */}
            <div className="space-y-2 rounded-2xl border border-border bg-card/60 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Dumbbell className="size-4 text-primary" /> Daily Protein Goal
                </span>
                <span className="font-bold text-primary">
                  {todayMacros.proteinGrams}g / {proteinTarget}g ({proteinPercent}%)
                </span>
              </div>
              <Progress value={proteinPercent} className="h-2.5 rounded-full bg-secondary" />
              <p className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                <span>{proteinTarget - todayMacros.proteinGrams > 0 ? `${proteinTarget - todayMacros.proteinGrams}g remaining to hit goal` : "🎉 Daily protein target reached!"}</span>
                <span className="font-medium text-foreground">Target: 65g</span>
              </p>
            </div>

            {/* Calorie Progress */}
            <div className="space-y-2 rounded-2xl border border-border bg-card/60 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Flame className="size-4 text-amber-400" /> Daily Calorie Budget
                </span>
                <span className="font-bold text-amber-400">
                  {todayMacros.calories} / {calorieTarget} kcal ({caloriePercent}%)
                </span>
              </div>
              <Progress value={caloriePercent} className="h-2.5 rounded-full bg-secondary" />
              <p className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                <span>{calorieTarget - todayMacros.calories > 0 ? `${calorieTarget - todayMacros.calories} kcal remaining` : "Calorie budget reached"}</span>
                <span className="font-medium text-foreground">Target: 2,200 kcal</span>
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Fitness Goal Recommender Selector */}
        <SectionCard
          title="Student Gym & Goal Selector"
          description="Filter canteen meals engineered for your workout targets."
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={fitnessGoal === "bulk" ? "default" : "outline"}
                size="sm"
                className="rounded-xl text-xs flex flex-col h-auto py-2.5 gap-1"
                onClick={() => setFitnessGoal("bulk")}
              >
                <span className="text-base">🥩</span>
                <span className="font-bold">Muscle Bulk</span>
                <span className="text-[9px] opacity-80">High Protein</span>
              </Button>

              <Button
                type="button"
                variant={fitnessGoal === "cut" ? "default" : "outline"}
                size="sm"
                className="rounded-xl text-xs flex flex-col h-auto py-2.5 gap-1"
                onClick={() => setFitnessGoal("cut")}
              >
                <span className="text-base">🥗</span>
                <span className="font-bold">Lean Cut</span>
                <span className="text-[9px] opacity-80">Low Calorie</span>
              </Button>

              <Button
                type="button"
                variant={fitnessGoal === "study" ? "default" : "outline"}
                size="sm"
                className="rounded-xl text-xs flex flex-col h-auto py-2.5 gap-1"
                onClick={() => setFitnessGoal("study")}
              >
                <span className="text-base">⚡</span>
                <span className="font-bold">Exam Focus</span>
                <span className="text-[9px] opacity-80">Brain Fuel</span>
              </Button>
            </div>

            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                <span>Recommended for {fitnessGoal === "bulk" ? "Muscle Gains 🥩" : fitnessGoal === "cut" ? "Fat Loss 🥗" : "Brain Focus ⚡"}:</span>
                <span className="text-[10px] text-primary">{fitnessPicks.length} items found</span>
              </p>

              <div className="space-y-2">
                {fitnessPicks.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-2.5 transition-colors hover:border-primary/40"
                  >
                    <img
                      src={foodImage(item)}
                      alt={item.name}
                      width={60}
                      height={60}
                      className="size-9 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">{item.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {inr(item.price)} · {item.calories} cal · ~{estimateProtein(item)}g Protein
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg h-8 text-xs font-semibold"
                      onClick={() => addItem(item.id, item.name)}
                    >
                      + Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Insights Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {insights.slice(0, 4).map((i, idx) => (
          <StatCard key={i.label} label={i.label} value={i.value} hint={i.hint} index={idx} />
        ))}
      </div>

      {/* Recommended for You Section */}
      <SectionCard
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
                    {s.reason} · ~{estimateProtein(s.item)}g protein
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

      <div className="grid gap-6 lg:grid-cols-2">
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
                    {inr(t.item.price)} · {t.item.calories} cal · ~{estimateProtein(t.item)}g protein
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
                      ordered {f.times} {f.times === 1 ? "time" : "times"} · ~{estimateProtein(f.item)}g protein
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

      {/* Interactive 3-Day Student AI Diet Planner */}
      <div id="diet-planner-section">
        <SectionCard
          title="3-Day AI Student Gym & Diet Planner"
          description="Let Grok AI build a custom campus diet itinerary based on your fitness target."
          actions={
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-border bg-background/60 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPlannerGoal("bulk")}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${plannerGoal === "bulk" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  🥩 Muscle Bulk
                </button>
                <button
                  type="button"
                  onClick={() => setPlannerGoal("cut")}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${plannerGoal === "cut" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  🥗 Lean Cut
                </button>
                <button
                  type="button"
                  onClick={() => setPlannerGoal("budget")}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${plannerGoal === "budget" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                >
                  💳 Budget Student
                </button>
              </div>

              <Button
                size="sm"
                className="rounded-xl gap-1.5 font-bold"
                onClick={handleGenerateMealPlan}
                disabled={plannerLoading}
              >
                <Calendar className="size-3.5" />
                {plannerLoading ? "Generating Plan…" : "Generate AI Diet Plan"}
              </Button>
            </div>
          }
        >
          {mealPlanResult ? (
            <div className="rounded-2xl border border-primary/30 bg-card/80 p-5 text-sm leading-relaxed whitespace-pre-wrap font-sans shadow-inner">
              {mealPlanResult}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground border border-dashed border-border rounded-2xl bg-card/30">
              <Dumbbell className="size-8 text-primary mb-2" />
              <p className="font-semibold text-foreground">Personalized Student Diet & Protein Itinerary</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-md">
                Select your fitness goal (Muscle Bulk, Lean Cut, or Budget Student) and click <strong>Generate AI Diet Plan</strong> to create your 3-day meal breakdown.
              </p>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Smart FAQ Assistant */}
      <SectionCard
        title="Smart FAQ & Nutrition assistant"
        description="Instant answers to questions students ask about calories, protein, and ordering."
        actions={<Flame className="size-4 text-primary" />}
      >
        <Accordion type="single" collapsible className="w-full">
          {AI_FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
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
