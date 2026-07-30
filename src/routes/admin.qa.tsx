import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ExternalLink, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard, Pill } from "@/components/shared/panels";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/qa")({
  head: () => ({
    meta: [
      { title: "QA checklist — CanteenOS" },
      {
        name: "description",
        content:
          "End-to-end verification checklist for ordering, kitchen flow, QR pickup, analytics, notifications and role permissions.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "QA checklist — CanteenOS" },
      {
        property: "og:description",
        content: "Verify every CanteenOS feature route in one pass.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QaPage,
});

interface Suite {
  id: string;
  title: string;
  role: "Student" | "Kitchen" | "Admin" | "Any";
  route: string;
  steps: { id: string; text: string }[];
}

const SUITES: Suite[] = [
  {
    id: "ordering",
    title: "Ordering flow",
    role: "Student",
    route: "/app/menu",
    steps: [
      { id: "menu-loads", text: "Menu loads live dishes with images, prices and veg badges" },
      { id: "search", text: "Search and category filters narrow the list correctly" },
      { id: "detail", text: "Dish detail opens with description, prep time and add-to-cart" },
      { id: "cart", text: "Cart shows quantities, coupon field and totals (GST, fees, discount)" },
      { id: "coupon", text: "Applying a valid coupon reduces the total; an invalid one errors" },
      { id: "favourite", text: "Favouriting a dish persists on /app/favorites after reload" },
    ],
  },
  {
    id: "checkout",
    title: "Checkout & payments",
    role: "Student",
    route: "/app/checkout",
    steps: [
      { id: "mode-badge", text: "Payment badge matches the mode set in Admin → Settings" },
      { id: "simulated", text: "Simulated mode: order confirms instantly and the cart clears" },
      {
        id: "stripe",
        text: "Stripe mode: checkout blocks with a clear 'not connected' message (until Stripe is live)",
      },
      { id: "offline", text: "Going offline queues the order and syncs on reconnect" },
    ],
  },
  {
    id: "qr",
    title: "QR pickup",
    role: "Student",
    route: "/app/orders",
    steps: [
      { id: "qr-render", text: "Confirmation screen renders the QR tile and pickup code" },
      { id: "qr-order", text: "The same code appears on the order detail page" },
      { id: "status", text: "Status timeline advances as the kitchen updates the order" },
      { id: "eta", text: "ETA and counter match what was chosen at checkout" },
    ],
  },
  {
    id: "kitchen",
    title: "Kitchen flow",
    role: "Kitchen",
    route: "/kitchen",
    steps: [
      { id: "board", text: "Kanban board lists placed / preparing / ready / completed lanes" },
      { id: "cards", text: "Each ticket shows student name, items, thumbnails and waiting time" },
      { id: "advance", text: "Advancing a ticket updates the student's order live (no refresh)" },
      { id: "history", text: "/kitchen/history shows completed tickets for the day" },
      { id: "kmenu", text: "/kitchen/menu toggles item availability" },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    role: "Admin",
    route: "/admin/analytics",
    steps: [
      { id: "range", text: "Time-range chips (7d / 30d / 90d / 12m) reshape every chart and KPI" },
      { id: "refresh", text: "Refresh button re-renders charts and updates the 'Updated' timestamp" },
      { id: "tabs", text: "Revenue, Sales, Orders, Customers, Inventory and Staff tabs all render" },
      { id: "export", text: "Export actions produce a file without console errors" },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    role: "Admin",
    route: "/admin/notification-lab",
    steps: [
      { id: "preview", text: "Every scenario previews with the right icon, tone and copy" },
      { id: "send-me", text: "'Send to me' appears in the bell within a second (realtime)" },
      { id: "broadcast", text: "Broadcast reaches student and kitchen feeds" },
      { id: "read", text: "Marking all read clears the unread badge and persists after reload" },
    ],
  },
  {
    id: "roles",
    title: "Role permissions",
    role: "Any",
    route: "/admin/roles",
    steps: [
      { id: "student-block", text: "A student account visiting /admin or /kitchen is redirected" },
      { id: "kitchen-block", text: "A kitchen account visiting /admin is redirected" },
      { id: "switcher", text: "Workspace switcher locks roles the account doesn't have" },
      { id: "switch-login", text: "Choosing a locked workspace prompts for that role's credentials" },
      { id: "signout", text: "Signing out clears cached data and blocks back-button access" },
    ],
  },
];

const STORAGE_KEY = "canteenos.qa-checklist";
const TOTAL = SUITES.reduce((n, s) => n + s.steps.length, 0);

function QaPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore malformed state */
    }
  }, []);

  const persist = useCallback((next: Record<string, boolean>) => {
    setDone(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const checked = useMemo(() => Object.values(done).filter(Boolean).length, [done]);
  const pct = Math.round((checked / TOTAL) * 100);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="End-to-end QA checklist"
        description="Walk every feature route once and tick it off. Progress is saved on this device."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "QA checklist" }]}
        actions={
          <Button variant="outline" className="rounded-xl" onClick={() => persist({})}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        }
      />

      <div className="mb-6 surface-card p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {checked} of {TOTAL} checks passed
          </span>
          <span className={cn("font-semibold", pct === 100 ? "text-success" : "text-primary")}>
            {pct}%
          </span>
        </div>
        <Progress value={pct} className="mt-3" />
        {pct === 100 ? (
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="size-4" /> Full pass complete — ready to ship.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4">
        {SUITES.map((suite, i) => {
          const suiteDone = suite.steps.filter((s) => done[`${suite.id}.${s.id}`]).length;
          return (
            <SectionCard key={suite.id} index={i}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{suite.title}</h3>
                  <Pill tone="primary">{suite.role}</Pill>
                  <Pill tone={suiteDone === suite.steps.length ? "success" : "muted"}>
                    {suiteDone}/{suite.steps.length}
                  </Pill>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <Link to={suite.route}>
                    Open route <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>

              <ul className="mt-4 grid gap-2">
                {suite.steps.map((step) => {
                  const key = `${suite.id}.${step.id}`;
                  return (
                    <li
                      key={key}
                      className="flex items-start gap-3 rounded-xl border border-border px-3 py-2.5"
                    >
                      <Checkbox
                        id={key}
                        checked={Boolean(done[key])}
                        onCheckedChange={(v) => persist({ ...done, [key]: Boolean(v) })}
                        className="mt-0.5"
                      />
                      <label
                        htmlFor={key}
                        className={cn(
                          "cursor-pointer text-sm",
                          done[key] && "text-muted-foreground line-through",
                        )}
                      >
                        {step.text}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}
