import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  QUEUE_EVENT,
  QUEUE_KEY,
  readQueue,
  removeQueued,
  updateQueued,
  type QueuedOrder,
} from "@/lib/offline-queue";
import { insertOrder } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useOnlineStatus } from "@/hooks/use-pwa";
import { friendlyError } from "@/lib/errors";

/**
 * Reads the offline order queue and flushes it as soon as the connection and a
 * signed-in session are both available.
 */
export function useOfflineQueue() {
  const [queue, setQueue] = useState<QueuedOrder[]>([]);
  const [syncing, setSyncing] = useState(false);
  const online = useOnlineStatus();
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    const sync = () => setQueue(readQueue());
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === QUEUE_KEY) sync();
    };
    window.addEventListener(QUEUE_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(QUEUE_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const flush = useCallback(async () => {
    const pending = readQueue();
    if (!pending.length || !user || !navigator.onLine || syncing) return;
    setSyncing(true);
    let sent = 0;
    for (const entry of pending) {
      try {
        const order = await insertOrder(user.id, entry.payload);
        removeQueued(entry.id);
        sent += 1;
        toast.success(`Queued order sent as ${order.code}`);
      } catch (error) {
        updateQueued(entry.id, {
          attempts: entry.attempts + 1,
          lastError: friendlyError(error, "Sync failed — we'll retry."),
        });
      }
    }
    setSyncing(false);
    if (sent) void qc.invalidateQueries({ queryKey: ["orders"] });
  }, [qc, syncing, user]);

  // Auto-flush whenever the connection returns or the user signs in.
  useEffect(() => {
    if (online && user) void flush();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online, user]);

  return {
    queue,
    syncing,
    online,
    flush,
    discard: (id: string) => removeQueued(id),
  };
}
