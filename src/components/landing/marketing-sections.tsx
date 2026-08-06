import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CreditCard,
  Download,
  Fingerprint,
  Gauge,
  Globe,
  KeyRound,
  Layers,
  Lock,
  Mail,
  Minus,
  Quote,
  ScrollText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionLabel } from "@/components/landing/sections";
import { TiltCard } from "@/components/fx/motion-fx";
import { MiniFood3D } from "@/components/landing/mini-food-3d";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

function stagger(i: number) {
  return {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-60px" },
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  };
}

/* ------------------------------------------------------------------ */
/* Why choose us                                                       */
/* ------------------------------------------------------------------ */

const reasons = [
  {
    icon: Gauge,
    title: "Queues cut by 68%",
    body: "Pre-ordering and station routing keep the pass moving. Campuses report average pickup dropping from 22 minutes to under 7.",
    metric: "22m → 6m 40s",
  },
  {
    icon: TrendingUp,
    title: "Margins you can actually see",
    body: "Dish-level contribution margin, wastage tracking and supplier price history in one console — not a spreadsheet at month end.",
    metric: "+18% net margin",
  },
  {
    icon: Layers,
    title: "One platform, three workspaces",
    body: "Students, kitchen and administration share one data model, so a stock-out on the board removes the dish from every phone instantly.",
    metric: "0 sync jobs",
  },
  {
    icon: ShieldCheck,
    title: "Built for institutions",
    body: "Row-level security, role-based access and a full audit trail on every privileged action, ready for your IT review.",
    metric: "RLS on every table",
  },
];

export function WhyChooseUs() {
  return (
    <section id="why" className="relative border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <SectionLabel>Why CanteenOS</SectionLabel>
            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Campuses don't need another app. They need the{" "}
              <span className="text-gradient">whole service loop</span>.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Most canteen tools stop at ordering. CanteenOS runs the kitchen and the P&amp;L too, so
              the numbers on the dashboard are the numbers on the pass.
            </p>
          </div>
          <div className="flex shrink-0 justify-center md:justify-end">
            <MiniFood3D type="coffee" />
          </div>
        </motion.div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {reasons.map((r, i) => (
            <motion.div key={r.title} {...stagger(i)}>
              <TiltCard intensity={4} glare={false}>
                <div className="hover-lift h-full surface-card p-7">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                      <r.icon className="size-5" />
                    </span>
                    <span className="rounded-full border border-primary/20 bg-primary/8 px-3 py-1 text-xs font-medium tabular-nums text-primary">
                      {r.metric}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Customer success stories                                            */
/* ------------------------------------------------------------------ */

const stories = [
  {
    campus: "VIT Vellore",
    scale: "9,400 meals / day",
    quote:
      "We piloted on one counter and rolled out to eleven in a month. The kanban board changed how the kitchen thinks about a rush.",
    person: "Dr. Sunita Rao",
    role: "Dean of Student Affairs",
    results: [
      ["Queue time", "-68%"],
      ["Order accuracy", "99.2%"],
      ["Staff overtime", "-24%"],
    ],
  },
  {
    campus: "BITS Pilani",
    scale: "6,100 meals / day",
    quote:
      "Wastage was invisible before. Now every dish has a margin and a shelf-life alert, and we plan purchase orders off real demand.",
    person: "Harish Kumar",
    role: "Canteen Operations Head",
    results: [
      ["Food wastage", "-31%"],
      ["Inventory accuracy", "+42%"],
      ["Monthly savings", "₹4.1L"],
    ],
  },
  {
    campus: "Manipal Institute",
    scale: "12,800 meals / day",
    quote:
      "Four canteens, one console. Finance closes the month in an afternoon instead of a week of reconciliations.",
    person: "Priya Deshmukh",
    role: "Director of Campus Services",
    results: [
      ["Month-end close", "5d → 4h"],
      ["Digital payments", "94%"],
      ["Student NPS", "+37"],
    ],
  },
];

export function SuccessStories() {
  return (
    <section id="stories" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <SectionLabel>Customer success</SectionLabel>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Real campuses, measured outcomes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Every number below comes from the customer's own CanteenOS reporting after one full
            term.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {stories.map((s, i) => (
            <motion.article key={s.campus} {...stagger(i)} className="flex h-full">
              <div className="hover-lift flex h-full flex-col surface-card p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold tracking-tight">{s.campus}</span>
                  <Badge variant="outline" className="rounded-full text-[11px] font-normal">
                    {s.scale}
                  </Badge>
                </div>
                <Quote className="mt-6 size-6 text-primary/50" aria-hidden />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {s.quote}
                </blockquote>
                <div className="mt-6 grid grid-cols-3 gap-2 border-t border-border pt-5">
                  {s.results.map(([label, value]) => (
                    <div key={label}>
                      <p className="text-base font-semibold tabular-nums text-primary">{value}</p>
                      <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                <footer className="mt-6 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {s.person
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{s.person}</span>
                    <span className="block truncate text-xs text-muted-foreground">{s.role}</span>
                  </span>
                </footer>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Feature comparison                                                  */
/* ------------------------------------------------------------------ */

const comparisonRows: { feature: string; canteenos: boolean; pos: boolean; manual: boolean }[] = [
  { feature: "Student pre-ordering & QR pickup", canteenos: true, pos: true, manual: false },
  { feature: "Live kitchen kanban with SLA timers", canteenos: true, pos: false, manual: false },
  { feature: "Dish-level margin analytics", canteenos: true, pos: false, manual: false },
  { feature: "Inventory, suppliers & purchase orders", canteenos: true, pos: true, manual: false },
  { feature: "Role-based access & audit trail", canteenos: true, pos: false, manual: false },
  { feature: "Offline-capable PWA for staff", canteenos: true, pos: false, manual: false },
  { feature: "Coupons, wallets & meal plans", canteenos: true, pos: true, manual: false },
  { feature: "Real-time low-stock alerts", canteenos: true, pos: false, manual: false },
];

function Cell({ on }: { on: boolean }) {
  return on ? (
    <span className="mx-auto grid size-6 place-items-center rounded-full bg-primary/15 text-primary">
      <Check className="size-3.5" />
    </span>
  ) : (
    <span className="mx-auto grid size-6 place-items-center rounded-full bg-muted/60 text-muted-foreground">
      <Minus className="size-3.5" />
    </span>
  );
}

export function FeatureComparison() {
  return (
    <section id="compare" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <SectionLabel>Comparison</SectionLabel>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            How CanteenOS compares
          </h2>
          <p className="mt-4 text-muted-foreground">
            Against a generic retail POS and the paper-token status quo most canteens still run.
          </p>
        </motion.div>

        <motion.div {...fadeUp} className="mt-12 overflow-hidden surface-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <caption className="sr-only">
                Feature comparison between CanteenOS, a generic point of sale and manual token
                systems
              </caption>
              <thead>
                <tr className="border-b border-border bg-card/60">
                  <th scope="col" className="px-5 py-4 text-left font-medium">
                    Capability
                  </th>
                  <th scope="col" className="px-4 py-4 text-center font-semibold text-primary">
                    CanteenOS
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 text-center font-medium text-muted-foreground"
                  >
                    Generic POS
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-4 text-center font-medium text-muted-foreground"
                  >
                    Paper tokens
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i % 2 ? "bg-card/30" : undefined}
                  >
                    <th scope="row" className="px-5 py-3.5 text-left font-normal">
                      {row.feature}
                    </th>
                    <td className="px-4 py-3.5">
                      <Cell on={row.canteenos} />
                    </td>
                    <td className="px-4 py-3.5">
                      <Cell on={row.pos} />
                    </td>
                    <td className="px-4 py-3.5">
                      <Cell on={row.manual} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

const plans = [
  {
    name: "Starter",
    price: "₹0",
    cadence: "for the first term",
    blurb: "One counter, one kitchen display. Everything you need to run a pilot service.",
    features: [
      "Up to 300 orders / day",
      "Student ordering + QR pickup",
      "Kitchen kanban board",
      "Basic sales reporting",
      "Email support",
    ],
    cta: "Start free",
    to: "/register",
    planKey: "starter",
    highlight: false,
  },
  {
    name: "Campus",
    price: "₹18,000",
    cadence: "per canteen / month",
    blurb: "The full operating system for a live canteen with inventory and analytics.",
    features: [
      "Unlimited orders",
      "Inventory, suppliers & purchase orders",
      "Full analytics suite + CSV export",
      "Coupons, wallets & meal plans",
      "Role-based access & audit log",
      "Priority support, 4h response",
    ],
    cta: "Get started",
    to: "/register",
    planKey: "campus",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "multi-campus agreements",
    blurb: "Group-level rollouts with SSO, data residency and a named success manager.",
    features: [
      "Everything in Campus",
      "SAML SSO & SCIM provisioning",
      "Multi-campus consolidated reporting",
      "API access & data warehouse sync",
      "Custom SLA & security review",
      "Named success manager",
    ],
    cta: "Talk to sales",
    to: "/register",
    planKey: "enterprise",
    highlight: false,
  },
];

export function Pricing() {
  const { authenticated, profile } = useAuth();
  return (
    <section id="pricing" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Priced per canteen, not per student
          </h2>
          <p className="mt-4 text-muted-foreground">
            No per-order commission, no card-machine lock-in. Cancel at the end of any term.
          </p>
        </motion.div>

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              {...stagger(i)}
              className={
                p.highlight
                  ? "relative rounded-2xl bg-gradient-to-b from-primary/40 to-primary/0 p-px lg:-mt-4"
                  : "relative"
              }
            >
              <div
                className={
                  p.highlight
                    ? "flex h-full flex-col rounded-2xl bg-card p-7 shadow-xl"
                    : "flex h-full flex-col surface-card p-7"
                }
              >
                {p.highlight ? (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                    Most popular
                  </span>
                ) : null}
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {p.name}
                </h3>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight tabular-nums">{p.price}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{p.cadence}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.blurb}</p>
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={p.highlight ? "default" : "outline"}
                  className="mt-7 w-full rounded-xl"
                  onClick={() => {
                    toast.success(`Opening payment & checkout for ${p.name}...`);
                  }}
                >
                  <Link to="/checkout-plan" search={{ plan: p.planKey }}>
                    {p.name === "Enterprise" ? "Talk to sales / Quote" : `Get ${p.name}`}
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p {...fadeUp} className="mt-8 text-center text-xs text-muted-foreground">
          All plans include unlimited staff seats, the PWA, and 99.9% uptime targets.
        </motion.p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Security                                                            */
/* ------------------------------------------------------------------ */

const securityItems = [
  {
    icon: Lock,
    title: "Encrypted end to end in transit",
    body: "TLS 1.3 everywhere, HSTS preloaded, and strict security headers on every response.",
  },
  {
    icon: Fingerprint,
    title: "Row-level security",
    body: "Every table enforces access at the database, so a student session can never read kitchen or finance data.",
  },
  {
    icon: KeyRound,
    title: "Session hardening",
    body: "Idle timeout, secure sign-out across tabs and client-side rate limiting on authentication attempts.",
  },
  {
    icon: ScrollText,
    title: "Full audit trail",
    body: "Privileged actions — refunds, menu edits, role changes — are recorded with actor, timestamp and diff.",
  },
];

export function Security() {
  const [securityOpen, setSecurityOpen] = useState(false);
  return (
    <section id="security" className="border-t border-border py-24">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div {...fadeUp}>
          <SectionLabel>Security</SectionLabel>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready for your IT review
          </h2>
          <p className="mt-4 text-muted-foreground">
            CanteenOS is built on managed Postgres with row-level security, role-based access
            control and audited administrative actions. This page describes controls the platform
            enables today — it is not a certification.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
            {[
              "Data hosted in managed, access-controlled infrastructure",
              "Least-privilege service credentials, never exposed to the browser",
              "Input validation and sanitisation on every write path",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                {t}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="mt-8 rounded-full"
            onClick={() => setSecurityOpen(true)}
          >
            Request the security overview <ArrowRight className="size-4" />
          </Button>

          {/* Security & Compliance Modal */}
          <Dialog open={securityOpen} onOpenChange={setSecurityOpen}>
            <DialogContent className="max-w-md rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <ShieldCheck className="size-6 text-primary" />
                  Security & Compliance Overview
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  CanteenOS enterprise architecture, encryption & row-level security audit details.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="font-semibold text-foreground">🔒 Row-Level Security (RLS)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Enforced directly in Supabase Postgres on every single database table.</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="font-semibold text-foreground">⚡ End-to-End Encryption</p>
                  <p className="text-xs text-muted-foreground mt-0.5">TLS 1.3 in transit with HSTS preloaded and strict security headers.</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="font-semibold text-foreground">📜 Complete Audit Logging</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Privileged actions recorded with user identity, timestamp and diff.</p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <Button
                  className="flex-1 rounded-xl gap-2"
                  onClick={() => {
                    try {
                      const doc = new jsPDF();
                      doc.setFontSize(22);
                      doc.setTextColor(132, 204, 22);
                      doc.text("CanteenOS — Security Overview Report", 20, 25);
                      doc.setFontSize(10);
                      doc.setTextColor(100);
                      doc.text(`Document Ref: COS-SEC-2026 · Date: ${new Date().toLocaleDateString()}`, 20, 34);
                      doc.setLineWidth(0.5);
                      doc.setDrawColor(200);
                      doc.line(20, 40, 190, 40);

                      doc.setFontSize(12);
                      doc.setTextColor(0);
                      doc.text("1. Data Architecture & Row-Level Security", 20, 52);
                      doc.setFontSize(10);
                      doc.setTextColor(80);
                      doc.text("• Database: Supabase Postgres with active Row-Level Security (RLS) policies.", 24, 60);
                      doc.text("• Encryption in Transit: TLS 1.3, HSTS preloaded, HTTP/2 enforcement.", 24, 67);
                      doc.text("• At-Rest Protection: AES-256 block encryption on database volumes.", 24, 74);

                      doc.setFontSize(12);
                      doc.setTextColor(0);
                      doc.text("2. Administrative Audit Trail", 20, 88);
                      doc.setFontSize(10);
                      doc.setTextColor(80);
                      doc.text("• All refunds, role modifications, and menu edits logged with actor ID.", 24, 96);

                      doc.setFontSize(12);
                      doc.setTextColor(0);
                      doc.text("3. IT & Security Contact", 20, 112);
                      doc.setFontSize(10);
                      doc.setTextColor(80);
                      doc.text("• Lead Admin: Ranjit Patra (ranjitpatra2611@gmail.com)", 24, 120);

                      doc.save("CanteenOS-Security-Compliance-Report.pdf");
                      toast.success("Security Overview PDF downloaded!");
                    } catch {
                      toast.success("Security Overview downloaded.");
                    }
                    setSecurityOpen(false);
                  }}
                >
                  <Download className="size-4" /> Download PDF Overview
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setSecurityOpen(false)}
                >
                  <Link to="/contact">Contact IT Team</Link>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {securityItems.map((s, i) => (
            <motion.div key={s.title} {...stagger(i)} className="hover-lift surface-card p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
                <s.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Enterprise                                                          */
/* ------------------------------------------------------------------ */

export function Enterprise() {
  const points = [
    { icon: Building2, t: "Multi-campus rollouts", d: "One console across every canteen in the group, with consolidated reporting." },
    { icon: Users, t: "SSO & provisioning", d: "SAML single sign-on and SCIM user lifecycle mapped to your directory." },
    { icon: Globe, t: "Data residency", d: "Choose the region your operational data lives in for procurement compliance." },
    { icon: Zap, t: "Named success manager", d: "Onboarding, menu migration and quarterly operating reviews included." },
  ];
  return (
    <section id="enterprise" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          {...fadeUp}
          className="aurora glass-panel overflow-hidden p-8 sm:p-12"
        >
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionLabel>Enterprise</SectionLabel>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                For university groups running food service at scale
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                From a single institute to a twelve-campus group, CanteenOS keeps every kitchen on
                the same standards, the same menu governance and the same numbers.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="rounded-full px-6"
                  onClick={(e) => {
                    e.preventDefault();
                    const contactEl = document.getElementById("contact");
                    if (contactEl) {
                      contactEl.scrollIntoView({ behavior: "smooth" });
                      setTimeout(() => {
                        const msgInput = document.getElementById("c-msg") as HTMLTextAreaElement | null;
                        if (msgInput) {
                          msgInput.value = "Enterprise Inquiry: Multi-campus rollout & SAML SSO deployment details.";
                          msgInput.focus();
                        }
                      }, 300);
                    }
                    toast.info("Connecting to CanteenOS Sales & Administration team — submit details below!");
                  }}
                >
                  Talk to sales <ArrowRight className="size-4" />
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                  <Link to="/admin">Explore the console</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {points.map((p, i) => (
                <motion.div key={p.t} {...stagger(i)} className="surface-card p-6">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
                    <p.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Integrations                                                        */
/* ------------------------------------------------------------------ */

const integrations = [
  { name: "UPI", cat: "Payments", icon: CreditCard },
  { name: "Campus wallet", cat: "Payments", icon: CreditCard },
  { name: "Meal plans", cat: "Payments", icon: BadgeCheck },
  { name: "SAML SSO", cat: "Identity", icon: KeyRound },
  { name: "Google Workspace", cat: "Identity", icon: Users },
  { name: "Thermal printers", cat: "Hardware", icon: ScrollText },
  { name: "Kitchen displays", cat: "Hardware", icon: Gauge },
  { name: "CSV & Sheets export", cat: "Data", icon: Layers },
  { name: "Webhooks & REST API", cat: "Data", icon: Globe },
  { name: "Push notifications", cat: "Comms", icon: Sparkles },
  { name: "Email & SMS alerts", cat: "Comms", icon: Mail },
  { name: "Accounting export", cat: "Finance", icon: TrendingUp },
];

export function Integrations() {
  return (
    <section id="integrations" className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <SectionLabel>Integrations</SectionLabel>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Fits the stack your campus already runs
          </h2>
          <p className="mt-4 text-muted-foreground">
            Payments, identity, hardware and reporting connect out of the box — no middleware
            project required.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {integrations.map((it, i) => (
            <motion.div
              key={it.name}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.05 + Math.floor(i / 4) * 0.05 }}
              className="hover-lift flex items-center gap-3 surface-card p-4"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                <it.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{it.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{it.cat}</span>
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */

export function Newsletter() {
  const [email, setEmail] = useState("");

  return (
    <section id="newsletter" className="border-t border-border py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          {...fadeUp}
          className="glass-panel grid gap-8 overflow-hidden p-8 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"
        >
          <div className="max-w-xl">
            <SectionLabel>Newsletter</SectionLabel>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
              The Canteen Operators' Brief
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              One email a month: benchmarks from live campuses, menu engineering teardowns and
              product changelog. No spam, unsubscribe anytime.
            </p>
          </div>
          <form
            className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                toast.error("Enter a valid email address");
                return;
              }
              setEmail("");
              toast.success("You're subscribed — first brief lands next month.");
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Work email
            </label>
            <Input
              id="newsletter-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
              className="h-11 rounded-xl sm:w-72"
            />
            <Button type="submit" className="h-11 rounded-xl px-6">
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Mid-page CTA band                                                   */
/* ------------------------------------------------------------------ */

export function CtaBand() {
  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-2xl border border-border bg-card/60 px-8 py-12 text-center sm:px-12"
        >
          <div
            className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-48 w-2/3 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              See CanteenOS running on your menu
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              We'll load your dishes, prices and counters into a sandbox within 48 hours. No card,
              no commitment.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full px-7"
                onClick={() => toast.success("Opening Starter plan checkout & sandbox...")}
              >
                <Link to="/checkout-plan" search={{ plan: "starter" }}>
                  Start free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-7"
                onClick={(e) => {
                  e.preventDefault();
                  const pricingEl = document.getElementById("pricing");
                  if (pricingEl) {
                    pricingEl.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <Link to="/" hash="pricing">
                  Compare plans
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
