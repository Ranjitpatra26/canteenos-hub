import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard, Pill } from "@/components/shared/panels";
import { NotificationCard } from "@/components/shared/notification-card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  NOTIFICATION_SCENARIOS,
  previewNotification,
  type NotificationScenario,
} from "@/lib/notification-scenarios";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/notification-lab")({
  head: () => ({
    meta: [
      { title: "Notification lab — CanteenOS" },
      {
        name: "description",
        content:
          "Preview and fire realistic CanteenOS notifications: new orders, status changes, payments and inventory alerts.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Notification lab — CanteenOS" },
      {
        property: "og:description",
        content: "Preview every notification scenario and send test events.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationLabPage,
});

function NotificationLabPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<NotificationScenario>(NOTIFICATION_SCENARIOS[0]);
  const [nonce, setNonce] = useState(0);
  const [sending, setSending] = useState<string | null>(null);

  // Rebuilds (new order code / timestamp) whenever the scenario or nonce changes.
  const preview = useMemo(
    () => previewNotification(selected),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, nonce],
  );

  const send = async (scenario: NotificationScenario, audience: "me" | "everyone") => {
    if (!user) return;
    setSending(`${scenario.id}-${audience}`);
    const payload = scenario.build();
    const { error } = await supabase.from("notifications").insert({
      user_id: audience === "me" ? user.id : null,
      title: payload.title,
      body: payload.body,
      kind: payload.kind,
    });
    setSending(null);
    if (error) {
      toast.error("Could not send the test notification", { description: error.message });
      return;
    }
    toast.success(
      audience === "me" ? "Test notification sent to you" : "Broadcast sent to everyone",
      { description: payload.title },
    );
  };

  const groups = ["Orders", "Payments", "Inventory", "Marketing"] as const;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Notification lab"
        description="Preview every notification exactly as students and staff see it, then fire a real test event."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Notification lab" }]}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          {groups.map((group, gi) => (
            <SectionCard key={group} title={group} index={gi}>
              <div className="grid gap-2">
                {NOTIFICATION_SCENARIOS.filter((s) => s.group === group).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelected(s);
                      setNonce((n) => n + 1);
                    }}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-colors",
                      selected.id === s.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <span className="block text-sm font-medium">{s.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{s.trigger}</span>
                  </button>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <SectionCard title="Preview" index={0}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Pill tone="primary">{selected.group}</Pill>
              <Pill>{selected.audience}</Pill>
            </div>
            <NotificationCard notification={preview} />
            <p className="mt-3 text-xs text-muted-foreground">
              Fires when: {selected.trigger}. This preview is not stored anywhere.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setNonce((n) => n + 1)}
              >
                <Bell className="size-4" /> Regenerate
              </Button>
              <Button
                className="rounded-xl"
                disabled={sending !== null || !user}
                onClick={() => void send(selected, "me")}
              >
                <Send className="size-4" /> Send to me
              </Button>
              <Button
                variant="secondary"
                className="rounded-xl"
                disabled={sending !== null || !user}
                onClick={() => void send(selected, "everyone")}
              >
                Broadcast to everyone
              </Button>
            </div>
          </SectionCard>

          <SectionCard title="How to verify" index={1}>
            <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
              <li>Send a test event above.</li>
              <li>Watch the bell badge in the header update without a refresh (realtime).</li>
              <li>
                Open the matching feed — student <code>/app/notifications</code> or kitchen{" "}
                <code>/kitchen/notifications</code> — and confirm the icon, tone and copy.
              </li>
              <li>Mark as read and confirm the unread indicator clears.</li>
            </ol>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
