import type { NewOrderInput } from "@/lib/api";

export const QUEUE_KEY = "canteenos.offline-orders";
export const QUEUE_EVENT = "canteenos:offline-queue";

export interface QueuedOrder {
  id: string;
  createdAt: string;
  /** Human summary so the queue card can render without the menu loaded. */
  summary: string;
  total: number;
  attempts: number;
  lastError?: string;
  payload: NewOrderInput;
}

function read(): QueuedOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedOrder[]) : [];
  } catch {
    return [];
  }
}

function write(queue: QueuedOrder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  // Same-tab listeners don't get a `storage` event, so broadcast our own.
  window.dispatchEvent(new CustomEvent(QUEUE_EVENT));
}

export function readQueue() {
  return read();
}

export function enqueueOrder(entry: Omit<QueuedOrder, "id" | "createdAt" | "attempts">) {
  const queued: QueuedOrder = {
    ...entry,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `q_${Date.now()}`,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  write([...read(), queued]);
  return queued;
}

export function removeQueued(id: string) {
  write(read().filter((q) => q.id !== id));
}

export function updateQueued(id: string, patch: Partial<QueuedOrder>) {
  write(read().map((q) => (q.id === id ? { ...q, ...patch } : q)));
}

export function clearQueue() {
  write([]);
}
