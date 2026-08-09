import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Copy, Gift, Share2, Users, Wallet, Check, Sparkles, IndianRupee, ArrowRight, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/panels";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useTopUpWallet, useReferrals, useRedeemReferralCode } from "@/lib/api";
import { EarnBonusCard } from "@/components/shared/earn-bonus-card";
import { celebrate } from "@/lib/fx";
import { inr } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/app/rewards")({
  head: () => ({
    meta: [
      { title: "Earn & Refer — CanteenOS" },
      {
        name: "description",
        content: "Earn campus wallet bonus money by completing tasks or inviting friends to CanteenOS.",
      },
      { property: "og:title", content: "Earn & Refer — CanteenOS" },
      { property: "og:description", content: "Complete micro-tasks or invite friends to get wallet cash." },
    ],
  }),
  component: RewardsPage,
});

function RewardsPage() {
  const { profile, user, roles } = useAuth();
  const isStudent = roles.includes("student");
  const topUpWallet = useTopUpWallet();
  const { data: referrals = [] } = useReferrals();
  const redeemCode = useRedeemReferralCode();

  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);

  const refCode = profile?.referral_code ?? `CAMPUS-${user?.id?.slice(0, 6).toUpperCase() ?? "REWARDS"}`;
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${refCode}` : `https://canteenos.vercel.app/register?ref=${refCode}`;

  const totalReferralEarned = referrals.reduce((sum, r) => sum + Number(r.reward_amount ?? 50), 0);

  const copyRefLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Referral link copied!", { description: "Share it with your friends to earn +₹50." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsapp = () => {
    const text = `Hey! Use my referral code ${refCode} or click ${shareUrl} to join CanteenOS and skip canteen queues. We both get bonus wallet money! 🍔🚀`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    redeemCode.mutate(inputCode, {
      onSuccess: () => {
        celebrate();
        setInputCode("");
        toast.success("🎉 Referral Code Redeemed!", {
          description: "+₹25 bonus added to your campus wallet balance.",
        });
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Could not redeem referral code");
      },
    });
  };

  if (!isStudent) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 text-center py-12">
        <PageHeader
          title="Earn & Refer"
          description="Student Referral & Micro-task Bonus Rewards"
          crumbs={[{ label: "Workspace", to: "/app" }, { label: "Earn & Refer" }]}
        />
        <div className="surface-card p-8 rounded-3xl space-y-3 max-w-lg mx-auto border border-amber-500/30">
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Student Exclusive</Badge>
          <h2 className="text-xl font-bold">Student Only Program</h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            The student referral program and bonus wallet tasks are exclusively reserved for registered student accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        title="Earn & Refer"
        description="Complete campus micro-tasks or invite your friends to earn wallet bonus money."
        crumbs={[{ label: "Student", to: "/app" }, { label: "Earn & Refer" }]}
        actions={
          <Badge variant="secondary" className="rounded-full gap-1.5 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" /> ₹100 Welcome Bonus Active
          </Badge>
        }
      />

      {/* Stats Summary Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Campus Wallet Balance"
          value={inr(profile?.wallet_balance ?? 100)}
          hint="Available to order"
          icon={<Wallet className="size-4" />}
          index={0}
        />
        <StatCard
          label="Friends Referred"
          value={String(referrals.length)}
          hint="Completed referrals"
          icon={<Users className="size-4" />}
          index={1}
        />
        <StatCard
          label="Referral Bonus Earned"
          value={inr(totalReferralEarned)}
          hint="+₹50 per successful friend order"
          icon={<Gift className="size-4" />}
          index={2}
        />
      </div>

      {/* Refer & Earn Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="surface-raised glass-reflect relative overflow-hidden rounded-3xl p-6 sm:p-8"
      >
        <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 gradient-mesh opacity-40" />

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <Badge className="mb-2 rounded-full bg-primary/20 text-primary hover:bg-primary/25 border-primary/30">
              <Gift className="mr-1 size-3" /> Invite Friends
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight">Refer a Friend, You Both Get Bonus Money!</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xl">
              Share your personal referral code. When your friend signs up and orders their first meal, both of you get <strong className="text-primary">+₹50</strong> added directly to your campus wallets!
            </p>
          </div>
          <Button onClick={shareWhatsapp} className="rounded-xl gap-2 bg-success text-success-foreground hover:bg-success/90">
            <Share2 className="size-4" /> Share on WhatsApp
          </Button>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Your Unique Code Card */}
          <div className="surface-card rounded-2xl p-5 border border-primary/20">
            <p className="text-xs font-medium text-muted-foreground">Your Referral Code</p>
            <div className="mt-2 flex items-center justify-between rounded-xl bg-muted/60 p-3 border border-border">
              <span className="font-mono text-lg font-bold tracking-wider text-primary">{refCode}</span>
              <Button size="sm" variant="secondary" onClick={copyRefLink} className="rounded-lg gap-1.5 text-xs">
                {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Link: <code className="truncate text-foreground select-all">{shareUrl}</code>
            </p>
          </div>

          {/* Redeem Code Form */}
          <div className="surface-card rounded-2xl p-5 border border-border">
            <p className="text-xs font-medium text-muted-foreground">Have a Friend's Referral Code?</p>
            <form onSubmit={handleRedeem} className="mt-2 flex gap-2">
              <Input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Enter referral code (e.g. CAMPUS-9X42)"
                className="rounded-xl font-mono text-xs uppercase"
              />
              <Button type="submit" disabled={redeemCode.isPending || !inputCode.trim()} className="rounded-xl shrink-0 text-xs gap-1">
                {redeemCode.isPending ? "Redeeming…" : "Redeem +₹25"}
              </Button>
            </form>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Get an instant +₹25 welcome bonus when you enter a friend's valid referral code.
            </p>
          </div>
        </div>

        {/* Referrals History List */}
        {referrals.length > 0 ? (
          <div className="mt-6 border-t border-border/60 pt-5">
            <h3 className="text-sm font-semibold mb-3">Referred Friends History</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {referrals.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-border/60 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <UserPlus className="size-4 text-primary" />
                    <div>
                      <p className="font-medium">{r.referee_name || "Campus Friend"}</p>
                      <p className="text-[10px] text-muted-foreground">{r.referee_email ?? "Joined via your link"}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-success border-success/30">
                    +{inr(r.reward_amount ?? 50)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </motion.div>

      {/* Campus Micro-Tasks Rewards Card */}
      <EarnBonusCard />
    </div>
  );
}
