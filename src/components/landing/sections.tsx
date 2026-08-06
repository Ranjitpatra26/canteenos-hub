import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowRight,
  BarChart3,
  Bell,
  ChefHat,
  Clock,
  CreditCard,
  Github,
  Linkedin,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Twitter,
  Utensils,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Burger3D } from "@/components/landing/burger-3d";
import { MiniFood3D } from "@/components/landing/mini-food-3d";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { inr, tintGradient } from "@/lib/format";
import studentAppShot from "@/assets/screens/student-app.jpg";
import kitchenShot from "@/assets/screens/kitchen-display.jpg";
import adminShot from "@/assets/screens/admin-console.jpg";
import { foodImage } from "@/lib/food-images";

import { menuItems } from "@/data/menu";
import { revenueSeries } from "@/data/operations";
import { HeroCanvas } from "@/components/three/hero-canvas";
import { AccentCanvas } from "@/components/three/accent-canvas";
import { Parallax } from "@/components/fx/global-fx";
import { TiltCard } from "@/components/fx/motion-fx";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className="rounded-full border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
    >
      {children}
    </Badge>
  );
}

export function Hero() {
  return (
    <section className="aurora relative min-h-[100svh] overflow-hidden pb-24 pt-32 sm:pt-36">
      <HeroCanvas className="pointer-events-none absolute inset-0 z-0 h-[100svh] w-full" />
      
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-64 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <SectionLabel>
            <Sparkles className="mr-1 inline size-3" /> Now serving 42 campuses
          </SectionLabel>
          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            The operating system for your <span className="text-gradient">campus canteen</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Students order in seconds, the kitchen runs a live kanban, and admins see revenue,
            inventory and peak hours in real time. No queues. No paper tokens. No guesswork.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/app">
                Start ordering <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-7">
              <Link to="/admin">View admin console</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Average pickup time on CanteenOS campuses: 6 min 40 s
          </p>
        </motion.div>

        <Parallax distance={40}>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel glass-reflect mt-16 overflow-hidden p-2 sm:p-3"
          >
            <TiltCard intensity={6} glare={false}>
              <DashboardPreview />
            </TiltCard>
          </motion.div>
        </Parallax>
      </div>
    </section>
  );
}

function DashboardPreview() {
  const max = Math.max(...revenueSeries.map((r) => r.revenue));
  return (
    <div className="surface-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-warning/60" />
        <span className="size-2.5 rounded-full bg-success/60" />
        <span className="ml-3 text-xs text-muted-foreground">canteenos.app / admin / overview</span>
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { l: "Revenue today", v: "₹63.2k" },
              { l: "Orders", v: "341" },
              { l: "Avg. prep", v: "6m 40s" },
              { l: "Rating", v: "4.8" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border bg-background/50 p-3">
                <p className="text-[11px] text-muted-foreground">{s.l}</p>
                <p className="mt-1 text-lg font-semibold">{s.v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border bg-background/50 p-4">
            <p className="text-xs font-medium text-muted-foreground">Revenue this week</p>
            <div className="mt-5 flex h-40 items-end gap-2 sm:gap-3">
              {revenueSeries.map((r, i) => (
                <motion.div
                  key={r.day}
                  initial={{ height: 0 }}
                  animate={{ height: `${(r.revenue / max) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 rounded-t-lg bg-primary/70"
                />
              ))}
            </div>
            <div className="mt-2 flex gap-2 text-[10px] text-muted-foreground sm:gap-3">
              {revenueSeries.map((r) => (
                <span key={r.day} className="flex-1 text-center">
                  {r.day}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Live kitchen queue</p>
          {menuItems.slice(0, 4).map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3"
            >
              <span
                className="grid size-9 place-items-center rounded-lg text-lg"
                style={tintGradient(m.tint)}
              >
                {m.emoji}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">{m.name}</span>
                <span className="block text-[10px] text-muted-foreground">
                  CO-84{10 + i} · {m.prepTimeMins} min
                </span>
              </span>
              <span className="text-[10px] font-medium text-primary">Preparing</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LogoMarquee() {
  const names = [
    "IIT Bombay",
    "BITS Pilani",
    "Christ University",
    "VIT Vellore",
    "SRM Chennai",
    "NIT Trichy",
    "Ashoka University",
    "Manipal",
  ];
  return (
    <section className="border-y border-border py-8">
      <div className="mx-auto max-w-6xl overflow-hidden px-4">
        <p className="mb-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
          Serving 180,000+ meals a month across
        </p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
          <div className="animate-marquee flex w-max gap-12">
            {[...names, ...names].map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="whitespace-nowrap text-sm font-semibold text-muted-foreground"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Zap,
    title: "Sub-second ordering",
    body: "Pre-loaded favourites, one-tap reorder and saved payment methods get a student from open to paid in under 10 seconds.",
  },
  {
    icon: ChefHat,
    title: "Kitchen kanban",
    body: "Incoming, preparing, ready and completed lanes with live timers so no ticket ever gets lost behind the counter.",
  },
  {
    icon: QrCode,
    title: "QR pickup",
    body: "A rotating pickup code replaces paper tokens and shouted names. Scan, hand over, done.",
  },
  {
    icon: BarChart3,
    title: "Revenue intelligence",
    body: "Peak hour heatmaps, best-selling dishes and margin per category, refreshed every minute.",
  },
  {
    icon: Bell,
    title: "Smart notifications",
    body: "Students get status pings, kitchen gets rush alerts, admins get low-stock warnings before it hurts.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    body: "Student, kitchen and admin workspaces with separate navigation, data scope and permissions.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
          <motion.div {...fadeUp} className="lg:col-span-7">
            <SectionLabel>Platform</SectionLabel>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything a canteen needs, nothing it doesn't
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              One codebase covers the entire service loop — from the student's phone to the pass, to
              the monthly P&amp;L review.
            </p>
          </motion.div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <Burger3D />
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="hover-lift surface-card p-6"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Stats() {
  const stats = [
    { v: "180k+", l: "Meals served monthly" },
    { v: "6m 40s", l: "Average pickup time" },
    { v: "42", l: "Campuses live" },
    { v: "4.8/5", l: "Student satisfaction" },
  ];
  return (
    <section className="border-y border-border bg-card/40 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.l}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="text-center"
          >
            <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{s.v}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.l}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      icon: Utensils,
      title: "Browse & order",
      body: "Students filter by category, diet or prep time and pay from the campus wallet.",
    },
    {
      icon: ChefHat,
      title: "Kitchen prepares",
      body: "The ticket lands on the kanban board with a live SLA timer and station routing.",
    },
    {
      icon: QrCode,
      title: "Scan & collect",
      body: "A push notification and QR code turn pickup into a five second handover.",
    },
  ];
  return (
    <section id="how" className="relative overflow-hidden py-24">
      <AccentCanvas
        variant="orbit"
        className="pointer-events-none absolute right-4 top-4 hidden h-48 w-48 opacity-45 xl:block"
      />
      <div className="relative mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps from hungry to handed over
          </h2>
        </motion.div>
        <div className="relative mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              className="relative surface-card p-7"
            >
              <span className="absolute -top-3 right-6 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                0{i + 1}
              </span>
              <span className="grid size-12 place-items-center rounded-2xl bg-accent/12 text-accent">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Showcase() {
  const picks = useMemo(() => {
    const categoriesSeen = new Set<string>();
    const list: typeof menuItems = [];
    const sorted = [...menuItems].sort((a, b) => b.popularity - a.popularity);
    for (const item of sorted) {
      if (!categoriesSeen.has(item.categorySlug)) {
        categoriesSeen.add(item.categorySlug);
        list.push(item);
        if (list.length === 4) break;
      }
    }
    return list;
  }, []);

  return (
    <section id="showcase" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="grid gap-4 sm:flex sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <SectionLabel>Product showcase</SectionLabel>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              A menu that sells itself
            </h2>
            <p className="mt-4 text-muted-foreground">
              Rich dish pages with ratings, prep time, nutrition and live availability — synced with
              the kitchen the moment something runs out.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/app/menu">
              Explore the full menu <ArrowRight className="size-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {picks.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Link
                to="/app/menu"
                className="hover-lift block overflow-hidden surface-card group"
              >
                <div
                  className="relative aspect-[4/3] overflow-hidden"
                  style={tintGradient(m.tint)}
                >
                  <img
                    src={foodImage(m)}
                    alt={m.name}
                    loading="lazy"
                    width={1024}
                    height={640}
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                  <span className="absolute bottom-2 right-2 grid size-9 place-items-center rounded-full border border-border/60 bg-background/70 text-lg backdrop-blur">
                    {m.emoji}
                  </span>
                </div>

                <div className="p-4">
                  <p className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                    {m.name}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="size-3 fill-primary text-primary" /> {m.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {m.prepTimeMins}m
                    </span>
                    <span className="font-semibold text-foreground">{inr(m.price)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Screens() {
  const screens = [
    {
      title: "Student app",
      body: "Menu, cart, live order tracking and QR pickup.",
      to: "/app",
      tint: "124 70% 55%",
      icon: Utensils,
      shot: studentAppShot,
    },
    {
      title: "Kitchen display",
      body: "Kanban lanes with SLA timers and station routing.",
      to: "/kitchen",
      tint: "38 92% 58%",
      icon: ChefHat,
      shot: kitchenShot,
    },
    {
      title: "Admin console",
      body: "Revenue, inventory, staff, coupons and reports.",
      to: "/admin",
      tint: "202 80% 55%",
      icon: BarChart3,
      shot: adminShot,
    },
  ];
  return (
    <section className="border-y border-border bg-card/40 py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <SectionLabel>Workspaces</SectionLabel>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Three workspaces, one system
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {screens.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
            >
              <Link to={s.to} className="hover-lift group block overflow-hidden surface-card">
                <div className="relative h-44 overflow-hidden" style={tintGradient(s.tint)}>
                  <img
                    src={s.shot}
                    alt={`${s.title} interface preview`}
                    loading="lazy"
                    width={1024}
                    height={640}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 opacity-45 mix-blend-soft-light"
                    style={tintGradient(s.tint)}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/90 via-card/10 to-transparent" />
                  <span className="absolute bottom-3 left-3 grid size-9 place-items-center rounded-xl border border-border bg-background/70 backdrop-blur-md">
                    <s.icon className="size-4.5 text-primary" />
                  </span>
                </div>
                <div className="p-5">
                  <p className="font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Open workspace <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const quotes = [
    {
      name: "Ananya Sharma",
      role: "Student Council President, SRM Chennai",
      body: "Lunch rush queues went from 22 minutes to under 7. The kanban board alone changed how our kitchen works.",
    },
    {
      name: "Chef Rajesh Kulkarni",
      role: "Head Kitchen Manager, Ashoka University",
      body: "We finally know which dishes actually make money. Wastage is down 31% since we started following the inventory alerts.",
    },
    {
      name: "Aarav Mehta",
      role: "3rd year CS student, IIT Bombay",
      body: "I order between lectures and pick up on the way. The QR handover takes five seconds, no tokens, no shouting names.",
    },
  ];
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <SectionLabel>Testimonials</SectionLabel>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by kitchens and students alike
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {quotes.map((q, i) => (
            <motion.figure
              key={q.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="hover-lift flex h-full flex-col surface-card p-6"
            >
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                “{q.body}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {q.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{q.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{q.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const faqs = [
    {
      q: "How long does it take to roll out on a new campus?",
      a: "Most campuses go live in under two weeks. We import your existing menu, map counters to kitchen stations and run a pilot service before the full switch.",
    },
    {
      q: "Can students pay with their existing meal plan?",
      a: "Yes. CanteenOS supports campus wallets, meal plan deductions, UPI and cards. Payment rules are configurable per canteen.",
    },
    {
      q: "Does the kitchen need special hardware?",
      a: "No. The kitchen display runs in any browser on a tablet or TV. A thermal printer is optional if you still want paper tickets.",
    },
    {
      q: "What happens when an item runs out?",
      a: "The kitchen marks it unavailable on the board and it disappears from the student menu instantly, with in-cart items flagged before checkout.",
    },
    {
      q: "Can we run offers and coupons?",
      a: "Coupons support percentage or flat discounts, minimum order values, usage caps and expiry dates, all managed from the admin console.",
    },
    {
      q: "Is our data exportable?",
      a: "Every report — revenue, inventory movement, customer history — can be exported to CSV, and the API is available on the campus plan.",
    },
  ];
  return (
    <section id="faq" className="border-t border-border py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.div {...fadeUp}>
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Questions, answered
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Still curious? Our team replies to campus enquiries within one working day.
          </p>
        </motion.div>
        <motion.div {...fadeUp}>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`i${i}`} className="border-border">
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

export function CtaContact() {
  const [name, setName] = useState("");
  const [campus, setCampus] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in your name and campus work email.");
      return;
    }
    toast.success(
      "Sandbox request sent successfully! Owner Ranjit Patra (ranjitpatra2611@gmail.com) will connect with you within 48 hours.",
      { duration: 6000 }
    );
    setName("");
    setCampus("");
    setEmail("");
    setMsg("");
  };

  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          {...fadeUp}
          className="aurora glass-panel relative grid gap-10 overflow-hidden p-8 sm:p-12 lg:grid-cols-2"
        >
          <AccentCanvas
            variant="knot"
            color="#6fe3e1"
            className="pointer-events-none absolute -left-10 bottom-[-3rem] hidden h-56 w-56 opacity-40 lg:block"
          />
          <div className="relative">
            <SectionLabel>Get started</SectionLabel>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Bring CanteenOS to your campus
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Tell us about your canteen and we'll set up a custom sandbox with your menu inside 48 hours.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                { icon: CreditCard, t: "No setup fee for the first term" },
                { icon: ShieldCheck, t: "Role-based access for staff and admins" },
                { icon: Zap, t: "Live in under two weeks" },
              ].map((r) => (
                <li key={r.t} className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/12 text-primary">
                    <r.icon className="size-4" />
                  </span>
                  {r.t}
                </li>
              ))}
            </ul>
          </div>

          <form className="space-y-4 surface-card p-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="c-name" className="text-xs font-medium text-muted-foreground">
                  Full name
                </label>
                <Input
                  id="c-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ananya Nair"
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="c-campus" className="text-xs font-medium text-muted-foreground">
                  Campus
                </label>
                <Input
                  id="c-campus"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  placeholder="VIT Vellore"
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="c-email" className="text-xs font-medium text-muted-foreground">
                Work email
              </label>
              <Input
                id="c-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campus.edu"
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="c-msg" className="text-xs font-medium text-muted-foreground">
                How many meals do you serve daily / inquiry message?
              </label>
              <Textarea
                id="c-msg"
                rows={4}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Around 1,200 meals across two counters…"
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl">
              Request a sandbox
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  const cols = [
    {
      title: "Product",
      links: [
        ["Features", "/#features"],
        ["Student app", "/app"],
        ["Kitchen display", "/kitchen"],
        ["Admin console", "/admin"],
      ],
    },
    {
      title: "Company",
      links: [
        ["How it works", "/#how"],
        ["Testimonials", "/#showcase"],
        ["FAQ", "/#faq"],
        ["Contact", "/#contact"],
      ],
    },
    {
      title: "Account",
      links: [
        ["Sign in", "/login"],
        ["Create account", "/register"],
        ["Forgot password", "/forgot-password"],
        ["Reset password", "/reset-password"],
      ],
    },
  ];
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <ChefHat className="size-5" />
            </span>
            <span className="text-base font-semibold">CanteenOS</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Smart canteen ordering, kitchen operations and analytics for modern campuses.
          </p>
          <div className="mt-5 flex gap-2">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <span
                key={i}
                aria-hidden
                className="grid size-9 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:text-primary"
              >
                <Icon className="size-4" />
              </span>
            ))}
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, href]) => {
                const cls =
                  "inline-flex min-h-9 items-center text-sm text-muted-foreground transition-colors hover:text-primary";
                return (
                  <li key={label}>
                    {href.startsWith("/#") ? (
                      <Link to="/" hash={href.slice(2)} className={cls}>
                        {label}
                      </Link>
                    ) : (
                      <Link to={href} className={cls}>
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-4 py-6">
        <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
          © {new Date().getFullYear()} CanteenOS. Built for campus food service teams.
        </p>
      </div>
    </footer>
  );
}
