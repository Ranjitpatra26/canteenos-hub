import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  Gift,
  CheckCircle2,
  UserCheck,
  ShoppingBag,
  Flame,
  Award,
  Users,
  Heart,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useMyOrders, useClaimedRewards, useClaimBonusReward, useReferrals } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import { celebrate } from "@/lib/fx";
import { inr } from "@/lib/format";
import { toast } from "sonner";

interface BonusTask {
  id: string;
  title: string;
  desc: string;
  reward: number;
  icon: React.ComponentType<{ className?: string }>;
  isEligible: boolean;
  progressText?: string;
  progressPercent?: number;
}

export function EarnBonusCard() {
  const { user, profile } = useAuth();
  const { data: orders = [] } = useMyOrders();
  const { favorites } = useCart();
  const { data: dbClaimedIds = [] } = useClaimedRewards();
  const { data: referrals = [] } = useReferrals();
  const claimReward = useClaimBonusReward();

  const storageKey = user ? `canteenos.claimed_tasks.${user.id}` : "canteenos.claimed_tasks.guest";
  const [localClaimed, setLocalClaimed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setLocalClaimed(JSON.parse(raw));
      else setLocalClaimed({});
    } catch {
      setLocalClaimed({});
    }
  }, [storageKey]);

  const claimed = useMemo(() => {
    const map = { ...localClaimed };
    for (const id of dbClaimedIds) {
      map[id] = true;
    }
    return map;
  }, [localClaimed, dbClaimedIds]);

  const validOrders = useMemo(() => orders.filter((o) => o.status !== "cancelled"), [orders]);
  const totalSpend = useMemo(() => validOrders.reduce((sum, o) => sum + o.total, 0), [validOrders]);

  const weeklyOrders = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return validOrders.filter((o) => new Date(o.placedAt).getTime() >= sevenDaysAgo);
  }, [validOrders]);

  const tasks: BonusTask[] = [
    {
      id: "orders_5_completed",
      title: "Campus Regular — 5 Orders",
      desc: "Place and complete at least 5 canteen orders",
      reward: 30,
      icon: ShoppingBag,
      isEligible: validOrders.length >= 5,
      progressText: `${Math.min(validOrders.length, 5)}/5 Orders`,
      progressPercent: Math.min(100, (validOrders.length / 5) * 100),
    },
    {
      id: "weekly_streak_3",
      title: "Weekly Streak — 3 Orders in 7 Days",
      desc: "Order 3 times within a single week",
      reward: 20,
      icon: Flame,
      isEligible: weeklyOrders.length >= 3,
      progressText: `${Math.min(weeklyOrders.length, 3)}/3 Orders this week`,
      progressPercent: Math.min(100, (weeklyOrders.length / 3) * 100),
    },
    {
      id: "spend_500_milestone",
      title: "Canteen Foodie — Spend ₹500",
      desc: "Reach ₹500 total lifetime spend on canteen meals",
      reward: 40,
      icon: TrendingUp,
      isEligible: totalSpend >= 500,
      progressText: `${inr(Math.min(totalSpend, 500))} / ${inr(500)}`,
      progressPercent: Math.min(100, (totalSpend / 500) * 100),
    },
    {
      id: "refer_2_friends",
      title: "Campus Ambassador — Invite 2 Friends",
      desc: "Invite 2 campus friends using your referral code",
      reward: 50,
      icon: Users,
      isEligible: referrals.length >= 2,
      progressText: `${Math.min(referrals.length, 2)}/2 Friends Joined`,
      progressPercent: Math.min(100, (referrals.length / 2) * 100),
    },
    {
      id: "favorites_3_saved",
      title: "Curate Menu — Save 3 Favorites",
      desc: "Star at least 3 favorite dishes on the canteen menu",
      reward: 15,
      icon: Heart,
      isEligible: favorites.length >= 3,
      progressText: `${Math.min(favorites.length, 3)}/3 Dishes Starred`,
      progressPercent: Math.min(100, (favorites.length / 3) * 100),
    },
    {
      id: "profile_verification_full",
      title: "Verified Student Profile Record",
      desc: "Complete Student Roll No, Department, and Contact Number",
      reward: 25,
      icon: UserCheck,
      isEligible: Boolean(profile?.student_id && profile?.department && profile?.phone),
      progressText: profile?.student_id && profile?.department && profile?.phone ? "Profile Verified" : "Incomplete Info",
      progressPercent: profile?.student_id && profile?.department && profile?.phone ? 100 : 33,
    },
  ];

  const claimedCount = tasks.filter((t) => claimed[t.id]).length;
  const totalEarned = tasks.filter((t) => claimed[t.id]).reduce((sum, t) => sum + t.reward, 0);

  const handleClaim = (task: BonusTask) => {
    if (claimed[task.id] || claimReward.isPending) return;

    claimReward.mutate(
      { taskId: task.id, amount: task.reward },
      {
        onSuccess: () => {
          celebrate();
          const next = { ...localClaimed, [task.id]: true };
          setLocalClaimed(next);
          if (typeof window !== "undefined") {
            localStorage.setItem(storageKey, JSON.stringify(next));
          }
          toast.success(`🎉 +${inr(task.reward)} Milestone Reward Claimed!`, {
            description: `Credited directly to your campus wallet balance.`,
          });
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Claim failed");
        },
      },
    );
  };

  return (
    <div className="surface-card relative overflow-hidden rounded-3xl p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/12 text-primary">
            <Award className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight">Campus Milestone Bonus Rewards</h3>
              <Badge variant="secondary" className="rounded-full text-xs font-semibold text-primary">
                Real Milestones
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Complete real campus dining milestones and invite friends to earn wallet money.
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Milestones Earned</p>
          <p className="text-lg font-bold text-success">+{inr(totalEarned)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
        <span>Milestones Completed ({claimedCount}/{tasks.length})</span>
        <span>{Math.round((claimedCount / tasks.length) * 100)}% Overall Progress</span>
      </div>
      <Progress value={(claimedCount / tasks.length) * 100} className="mt-1.5 h-2" />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {tasks.map((task) => {
          const isDone = Boolean(claimed[task.id]);
          const Icon = task.icon;

          return (
            <motion.div
              key={task.id}
              whileHover={{ y: -2 }}
              className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 transition-all ${
                isDone
                  ? "border-success/30 bg-success/5"
                  : task.isEligible
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/60 bg-muted/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
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
                      <CheckCircle2 className="size-3" /> Claimed
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      disabled={!task.isEligible || claimReward.isPending}
                      onClick={() => handleClaim(task)}
                      className="h-8 rounded-lg text-xs font-semibold"
                      variant={task.isEligible ? "default" : "outline"}
                    >
                      {claimReward.isPending ? "Claiming…" : task.isEligible ? "Claim" : "Locked"}
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress bar per milestone */}
              {task.progressText && !isDone && (
                <div className="space-y-1 pt-1 border-t border-border/40">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                    <span>Progress</span>
                    <span>{task.progressText}</span>
                  </div>
                  <Progress value={task.progressPercent ?? 0} className="h-1.5" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
