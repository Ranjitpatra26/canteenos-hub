import { motion, AnimatePresence } from "motion/react";
import { CloudUpload, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOfflineQueue } from "@/hooks/use-offline-queue";
import { inr } from "@/lib/format";

/** Card listing orders captured offline and waiting to reach the kitchen. */
export function OfflineQueuePanel() {
  const { queue, syncing, online, flush, discard } = useOfflineQueue();

  if (!queue.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card/70 p-4 backdrop-blur-xl sm:p-5"
      aria-label="Offline order queue"
    >
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <CloudUpload className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Waiting to sync</p>
            <p className="truncate text-xs text-muted-foreground">
              {online
                ? "Sending to the kitchen…"
                : "These send automatically when you're back online."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            {queue.length}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            className="rounded-xl"
            disabled={!online || syncing}
            onClick={() => void flush()}
          >
            <RefreshCw className={syncing ? "size-3.5 animate-spin" : "size-3.5"} />
            Sync now
          </Button>
        </div>
      </header>

      <ul className="mt-4 space-y-2">
        <AnimatePresence initial={false}>
          {queue.map((entry) => (
            <motion.li
              key={entry.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/70 bg-background/50 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{entry.summary}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleString()} · {inr(entry.total)}
                  {entry.lastError ? ` · ${entry.lastError}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                aria-label="Discard queued order"
                onClick={() => discard(entry.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </motion.section>
  );
}
