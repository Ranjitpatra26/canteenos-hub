import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Gift, CheckCircle2, Sparkles, UserCheck, PhoneCall, Heart, Calendar, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useTopUpWallet, useMyOrders } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import { celebrate } from "@/lib/fx";
import { inr } from "@/lib/format";
import { toast } from "sonner";

interface BonusTask {
  id: string;
  title: string;
  desc: string;
  reward: number;
  icon: React.ElementType;
  isEligible: boolean;
}

export function EarnBonusCard() {
  const { user, profile } = useAuth();
  const topUpWallet = useTopUpWallet();
  const { data: orders = [] } = useMyOrders();
  const { favorites } = useCart();

  const storageKey = user ? `canteenos.claimed_tasks.${user.id}` : "canteenos.claimed_tasks.guest";
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setClaimed(JSON.parse(raw));
      else setClaimed({});
    } catch {
      setClaimed({});
    }
  }, [storageKey]);

  const saveClaimed = (next: Record<string, boolean>) => {
    setClaimed(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(next));
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  const tasks: BonusTask[] = [
    {
      id: "profile_complete",
      title: "Complete Student Profile",
      desc: "Add your Student ID and Department to your profile",
      reward: 25,
      icon: UserCheck,
      isEligible: Boolean(profile?.student_id && profile?.department),
    },
    {
      id: "phone_added",
      title: "Add Phone Number",
      desc: "Save your contact number for instant pickup notifications",
      reward: 25,
      icon: PhoneCall,
      isEligible: Boolean(profile?.phone),
    },
    {
      id: "favorite_saved",
      title: "Save Favorite Dish",
      desc: "Star at least 1 dish in the canteen menu",
      reward: 15,
      icon: Heart,
      isEligible: favorites.length > 0,
    },
    {
      id: `daily_checkin_${todayStr}`,
      title: "Daily Canteen Check-in",
      desc: "Claim your daily student attendance reward",
      reward: 10,
      icon: Calendar,
      isEligible: true,
    },
    {
      id: "first_order",
      title: "Place 1st Canteen Order",
      desc: "Order any item from today's menu",
      reward: 50,
      icon: ShoppingBag,
      isEligible: orders.length > 0,
    },
  ];

  const claimedCount = Object.keys(claimed).filter((k) => claimed[k]).length;
  const totalEarnable = tasks.reduce((sum, t) => sum + t.reward, 0);
  const totalEarned = tasks.filter((t) => claimed[t.id]).reduce((sum, t) => sum + t.reward, 0);

  const handleClaim = (task: BonusTask) => {
    if (claimed[task.id] || topUpWallet.isPending) return;

    topUpWallet.mutate(task.reward, {
      onSuccess: () => {
        celebrate();
        const next = { ...claimed, [task.id]: true };
        saveClaimed(next);
        toast.success(`🎉 +${inr(task.reward)} Bonus Claimed!`, {
          description: `Added directly to your campus wallet balance.`,
        });
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Claim failed");
      },
    });
  };

  return (
    <div className="surface-card relative overflow-hidden rounded-3xl p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
            <Gift className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight">Earn Bonus Wallet Money</h3>
              <Badge variant="secondary" className="rounded-full text-xs font-semibold text-primary">
                +₹100 Signup Bonus Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Complete simple campus micro-tasks to earn extra wallet cash.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total Bonus Earned</p>
          <p className="text-lg font-bold text-success">+{inr(totalEarned)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
        <span>Task Progress ({claimedCount}/{tasks.length})</span>
        <span>{Math.round((claimedCount / tasks.length) * 100)}% Complete</span>
      </div>
      <Progress value={(claimedCount / tasks.length) * 100} className="mt-1.5 h-2" />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {tasks.map((task) => {
          const isDone = Boolean(claimed[task.id]);
          const Icon = task.icon;

          return (
            <motion.div
              key={task.id}
              whileHover={{ y: -2 }}
              className={`flex items-start justify-between gap-3 rounded-2xl border p-4 transition-all ${
                isDone
                  ? "border-success/30 bg-success/5"
                  : task.isEligible
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/60 bg-muted/30"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${
                    isDone
                      ? "bg-success/20 text-success"
                      : task.isEligible
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{task.title}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      +{inr(task.reward)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{task.desc}</p>
                </div>
              </div>

              <div className="shrink-0">
                {isDone ? (
                  <Badge variant="secondary" className="gap-1 rounded-lg text-success border-success/30">
                    <CheckCircle2 className="size-3" /> Done
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    disabled={!task.isEligible || topUpWallet.isPending}
                    onClick={() => handleClaim(task)}
                    className="h-8 rounded-lg text-xs"
                    variant={task.isEligible ? "default" : "outline"}
                  >
                    {task.isEligible ? "Claim" : "Locked"}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
