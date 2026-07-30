import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BellOff } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import {
  NotificationCard,
  toneFor,
  type NotificationTone,
} from "@/components/shared/notification-card";
import { EmptyState, TableSkeleton } from "@/components/shared/states";
import { ErrorState } from "@/components/shared/states";
import { SegmentedControl } from "@/components/shared/panels";
import { Button } from "@/components/ui/button";
import { useMarkNotificationsRead, useNotifications } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — CanteenOS" },
      {
        name: "description",
        content:
          "Order updates, ready alerts, payment receipts and coupon offers from your campus canteen.",
      },
      { property: "og:title", content: "Notifications — CanteenOS" },
      { property: "og:description", content: "Your canteen order and offer alerts in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificationsPage,
});

const FILTERS: Array<{ value: string; label: string }> = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "order", label: "Orders" },
  { value: "offer", label: "Coupons" },
  { value: "system", label: "System" },
];

function NotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const [filter, setFilter] = useState("all");

  const notifications = useMemo(() => data ?? [], [data]);
  const unread = notifications.filter((n) => !n.read);

  const visible = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return unread;
    const wanted: Record<string, NotificationTone[]> = {
      order: ["order", "ready", "payment"],
      offer: ["offer"],
      system: ["system", "stock"],
    };
    const tones = wanted[filter] ?? [];
    return notifications.filter((n) => tones.includes(toneFor(n)));
  }, [filter, notifications, unread]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description={
          unread.length
            ? `${unread.length} unread update${unread.length === 1 ? "" : "s"}`
            : "You're all caught up."
        }
        crumbs={[{ label: "Student", to: "/app" }, { label: "Notifications" }]}
        actions={
          unread.length ? (
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={markRead.isPending}
              onClick={() =>
                markRead.mutate(undefined, {
                  onSuccess: () => toast.success("All notifications marked read"),
                  onError: () => toast.error("Could not update notifications"),
                })
              }
            >
              Mark all read
            </Button>
          ) : null
        }
      />

      <div className="mb-4 overflow-x-auto">
        <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : visible.length ? (
        <div className="grid gap-3">
          {visible.map((n, i) => (
            <NotificationCard key={n.id} notification={n} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BellOff className="size-6" />}
          title="Nothing here yet"
          description="Order updates, ready alerts and campus offers will show up in this feed."
        />
      )}
    </div>
  );
}
