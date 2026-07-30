import { AnimatePresence, motion } from "motion/react";
import { CloudOff, RefreshCw, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-pwa";
import { useOfflineQueue } from "@/hooks/use-offline-queue";
import { cn } from "@/lib/utils";

/** Thin status strip that appears when the connection drops or a sync runs. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const { queue, syncing } = useOfflineQueue();
  const show = !online || syncing;
  const offlineLabel = queue.length
    ? `You're offline — ${queue.length} order${queue.length > 1 ? "s" : ""} queued for sync`
    : "You're offline — browsing cached menu and orders";

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          role="status"
          aria-live="polite"
          className={cn(
            "overflow-hidden border-b text-center text-xs font-medium",
            online
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          <span className="flex items-center justify-center gap-2 px-4 py-2">
            {syncing ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : online ? (
              <Wifi className="size-3.5" />
            ) : (
              <CloudOff className="size-3.5" />
            )}
            {syncing ? "Syncing queued orders…" : offlineLabel}
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
