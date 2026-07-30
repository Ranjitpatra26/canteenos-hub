import { createFileRoute } from "@tanstack/react-router";
import { BellOff } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationCard } from "@/components/shared/notification-card";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import { useMarkNotificationsRead, useNotifications } from "@/lib/api";

export const Route = createFileRoute("/kitchen/notifications")({
  head: () => ({
    meta: [
      { title: "Kitchen alerts — CanteenOS" },
      { name: "description", content: "Order and stock alerts for the canteen kitchen team." },
      { property: "og:title", content: "Kitchen alerts — CanteenOS" },
      { property: "og:description", content: "Live kitchen notifications." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: KitchenNotificationsPage,
});

function KitchenNotificationsPage() {
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationsRead();
  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Kitchen alerts"
        description={
          unread.length
            ? `${unread.length} unread update${unread.length === 1 ? "" : "s"}`
            : "You're all caught up."
        }
        crumbs={[{ label: "Kitchen", to: "/kitchen" }, { label: "Alerts" }]}
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

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : notifications.length ? (
        <div className="grid gap-3">
          {notifications.map((n, i) => (
            <NotificationCard key={n.id} notification={n} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<BellOff className="size-6" />}
          title="Nothing here yet"
          description="New orders, ready alerts and stock warnings will show up in this feed."
        />
      )}
    </div>
  );
}
