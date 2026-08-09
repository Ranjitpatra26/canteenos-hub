import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Award, Flame, Leaf, Receipt, Star, Trophy, Wallet, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard, Timeline } from "@/components/shared/panels";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { inr, shortDate, timeAgo } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useMenuItems, useMyOrders, useTopUpWallet, useUpdateProfile } from "@/lib/api";
import { useCart } from "@/contexts/cart-context";
import { frequentlyOrdered } from "@/lib/canteen-ai";
import { toast } from "sonner";
import { foodImageById } from "@/lib/food-images";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — CanteenOS" },
      {
        name: "description",
        content:
          "Manage your campus profile, review canteen activity, orders, achievements and badges earned on CanteenOS.",
      },
      { property: "og:title", content: "Your profile — CanteenOS" },
      {
        property: "og:description",
        content: "Profile, activity, orders, achievements and badges.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { profile, user, role } = useAuth();
  const updateProfile = useUpdateProfile();
  const topUpWallet = useTopUpWallet();
  const { data: orders = [] } = useMyOrders();
  const { data: items = [] } = useMenuItems();
  const { favorites } = useCart();

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [topUpAmount, setTopUpAmount] = useState("500");

  useEffect(() => {
    setName(profile?.full_name ?? "");
    setStudentId(profile?.student_id ?? "");
    setPhone(profile?.phone ?? "");
    setDepartment(profile?.department ?? "");
    setYear(profile?.year ?? "");
  }, [profile]);

  const done = orders.filter((o) => o.status !== "cancelled");
  const spend = done.reduce((s, o) => s + o.total, 0);
  const avg = done.length ? Math.round(spend / done.length) : 0;
  const vegCount = useMemo(() => {
    let veg = 0;
    done.forEach((o) =>
      o.lines.forEach((l) => {
        if (items.find((i) => i.id === l.itemId)?.veg) veg += l.qty;
      }),
    );
    return veg;
  }, [done, items]);
  const top = frequentlyOrdered(done, items, 3);

  const initials =
    (profile?.full_name ?? "CanteenOS user")
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "CO";

  const achievements = [
    {
      id: "a1",
      title: "First bite",
      hint: "Place your first order",
      icon: Zap,
      goal: 1,
      value: Math.min(done.length, 1),
    },
    {
      id: "a2",
      title: "Regular",
      hint: "10 completed orders",
      icon: Receipt,
      goal: 10,
      value: done.length,
    },
    {
      id: "a3",
      title: "Big spender",
      hint: `${inr(5000)} lifetime spend`,
      icon: Wallet,
      goal: 5000,
      value: spend,
    },
    {
      id: "a4",
      title: "Green plate",
      hint: "25 vegetarian items",
      icon: Leaf,
      goal: 25,
      value: vegCount,
    },
    {
      id: "a5",
      title: "Curator",
      hint: "5 saved favourites",
      icon: Star,
      goal: 5,
      value: favorites.length,
    },
    {
      id: "a6",
      title: "Streak starter",
      hint: "Order 3 days in a row",
      icon: Flame,
      goal: 3,
      value: Math.min(done.length, 3),
    },
  ];

  const badges = achievements
    .filter((a) => a.value >= a.goal)
    .map((a) => ({ id: a.id, label: a.title, icon: a.icon }));

  const activity = done.slice(0, 6).map((o) => ({
    id: o.id,
    title: `Order ${o.code} · ${o.status}`,
    time: timeAgo(o.placedAt),
    detail: `${o.lines.length} item${o.lines.length === 1 ? "" : "s"} · ${inr(o.total)} · ${o.counter}`,
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Profile"
        description="Your campus identity, canteen activity and rewards."
        crumbs={[{ label: "Student", to: "/app" }, { label: "Profile" }]}
        actions={
          <Badge variant="outline" className="rounded-full capitalize">
            {role ?? "student"}
          </Badge>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="surface-raised glass-reflect mb-6 flex flex-wrap items-center gap-5 overflow-hidden rounded-3xl p-6 sm:p-7"
      >
        <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-xl font-semibold">
            {profile?.full_name ?? "CanteenOS user"}
          </h2>
          <p className="truncate text-sm text-muted-foreground">{profile?.email ?? user?.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile?.student_id ? (
              <Badge variant="outline" className="rounded-full text-[11px]">
                {profile.student_id}
              </Badge>
            ) : null}
            {profile?.department ? (
              <Badge variant="outline" className="rounded-full text-[11px]">
                {profile.department}
              </Badge>
            ) : null}
            {badges.slice(0, 3).map((b) => (
              <Badge key={b.id} className="rounded-full text-[11px]">
                <b.icon className="mr-1 size-3" /> {b.label}
              </Badge>
            ))}
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/app/settings">Settings</Link>
        </Button>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Lifetime orders"
          value={String(done.length)}
          hint="completed & active"
          index={0}
        />
        <StatCard
          label="Lifetime spend"
          value={inr(spend)}
          hint={`avg ${inr(avg)} / order`}
          index={1}
        />
        <StatCard
          label="Saved dishes"
          value={String(favorites.length)}
          hint="quick reorder"
          index={2}
        />
        <StatCard
          label="Badges earned"
          value={String(badges.length)}
          hint={`of ${achievements.length}`}
          index={3}
        />
      </div>

      <Tabs defaultValue="profile" className="mt-6 w-full">
        <TabsList className="mb-5 flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-muted/50 p-1.5">
          {[
            { v: "profile", label: "Profile" },
            { v: "activity", label: "Activity" },
            { v: "orders", label: "Orders" },
            { v: "achievements", label: "Achievements" },
            { v: "badges", label: "Badges" },
            { v: "preferences", label: "Preferences" },
          ].map((t) => (
            <TabsTrigger key={t.v} value={t.v} className="rounded-xl px-3 py-1.5 text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <SectionCard title="Campus Wallet" description="Manage your campus balance and instant top-ups.">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Current balance</p>
                <p className="text-3xl font-bold tracking-tight text-primary">{inr(profile?.wallet_balance ?? 0)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[100, 200, 500, 1000].map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={topUpWallet.isPending}
                    onClick={() => {
                      topUpWallet.mutate(amt, {
                        onSuccess: () => toast.success(`Added ${inr(amt)} to campus wallet`),
                        onError: (err) => toast.error(err instanceof Error ? err.message : "Top up failed"),
                      });
                    }}
                  >
                    +{inr(amt)}
                  </Button>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Personal details" description="Keep your campus record up to date.">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateProfile.mutate(
                  { full_name: name, student_id: studentId, phone, department, year },
                  {
                    onSuccess: () => toast.success("Profile updated"),
                    onError: (err: unknown) =>
                      toast.error(err instanceof Error ? err.message : "Could not update profile"),
                  },
                );
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Full name</Label>
                  <Input
                    id="p-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-id">Student ID</Label>
                  <Input
                    id="p-id"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. STU202601"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-dept">Department</Label>
                  <Input
                    id="p-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-year">Year</Label>
                  <Input
                    id="p-year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g. 3rd Year"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-email">Campus email</Label>
                  <Input
                    id="p-email"
                    value={profile?.email ?? user?.email ?? ""}
                    readOnly
                    disabled
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-phone">Phone</Label>
                  <Input
                    id="p-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <Button type="submit" className="rounded-xl" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </SectionCard>
        </TabsContent>

        <TabsContent value="activity">
          <SectionCard
            title="Recent activity"
            description="Everything you've done in CanteenOS lately."
          >
            {activity.length ? (
              <Timeline items={activity} />
            ) : (
              <EmptyState
                title="No activity yet"
                description="Your canteen story starts with your first order."
                action={
                  <Button asChild className="rounded-xl">
                    <Link to="/app/menu">Browse menu</Link>
                  </Button>
                }
              />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="orders">
          <SectionCard
            title="Order history"
            description="Your last orders with status and totals."
            actions={
              <Button asChild variant="ghost" size="sm" className="rounded-xl">
                <Link to="/app/orders">View all</Link>
              </Button>
            }
          >
            {done.length ? (
              <ul className="space-y-2">
                {done.slice(0, 8).map((o) => (
                  <li key={o.id}>
                    <Link
                      to="/app/orders/$orderId"
                      params={{ orderId: o.id }}
                      className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 transition-colors hover:border-primary/40"
                    >
                      <img
                        src={foodImageById(o.lines[0]?.itemId ?? "", o.lines[0]?.name)}
                        alt={o.lines[0]?.name ?? "Order"}
                        loading="lazy"
                        width={72}
                        height={72}
                        className="size-9 shrink-0 rounded-lg object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{o.code}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {shortDate(o.placedAt)} · {o.lines.length} items
                        </span>
                      </span>
                      <StatusBadge status={o.status} />
                      <span className="text-sm font-medium">{inr(o.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No orders yet" description="Once you order, receipts land here." />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="achievements">
          <SectionCard title="Achievements" description="Progress towards your next campus badge.">
            <div className="grid gap-4 sm:grid-cols-2">
              {achievements.map((a) => {
                const pct = Math.min(100, Math.round((a.value / a.goal) * 100));
                const unlocked = pct >= 100;
                return (
                  <div
                    key={a.id}
                    className={cn(
                      "rounded-2xl border p-4 transition-colors",
                      unlocked
                        ? "border-primary/40 bg-primary/5"
                        : "border-border bg-background/40",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid size-10 place-items-center rounded-xl",
                          unlocked
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <a.icon className="size-[18px]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{a.hint}</p>
                      </div>
                      {unlocked ? <Trophy className="size-4 text-primary" /> : null}
                    </div>
                    <Progress value={pct} className="mt-3 h-1.5" />
                    <p className="mt-1.5 text-[11px] text-muted-foreground">{pct}% complete</p>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="badges">
          <SectionCard title="Badges" description="Earned rewards shown on your campus profile.">
            {badges.length ? (
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {badges.map((b) => (
                  <motion.div
                    key={b.id}
                    whileHover={{ y: -5, rotate: -1 }}
                    className="glass-reflect flex flex-col items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center"
                  >
                    <span className="grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary">
                      <b.icon className="size-6" />
                    </span>
                    <p className="text-sm font-medium">{b.label}</p>
                    <p className="text-[11px] text-muted-foreground">Unlocked</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Award className="size-6" />}
                title="No badges yet"
                description="Complete achievements to unlock badges for your profile."
              />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="preferences">
          <SectionCard
            title="Food preferences"
            description="Canteen AI uses these to personalise your menu."
          >
            {[
              {
                id: "pref-veg",
                label: "Vegetarian first",
                hint: "Prioritise veg dishes in recommendations.",
              },
              {
                id: "pref-spice",
                label: "Spicy food",
                hint: "Include high-heat dishes in suggestions.",
              },
              {
                id: "pref-light",
                label: "Low-calorie bias",
                hint: "Prefer dishes under 450 kcal.",
              },
              {
                id: "pref-reorder",
                label: "Suggest reorders",
                hint: "Surface my regulars at the top.",
              },
            ].map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 border-b border-border py-4 first:pt-0 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Label htmlFor={p.id} className="text-sm font-medium">
                    {p.label}
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.hint}</p>
                </div>
                <Switch id={p.id} defaultChecked={i !== 1} />
              </div>
            ))}
            {top.length ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Canteen AI currently thinks your favourites are{" "}
                <span className="text-foreground">{top.map((t) => t.item.name).join(", ")}</span>.
              </p>
            ) : null}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
