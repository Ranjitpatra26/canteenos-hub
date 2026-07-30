/**
 * Client-side attempt throttling for sensitive actions (sign-in, sign-up,
 * password reset). This is a UX guard that gives immediate feedback and blocks
 * accidental hammering — the backend remains the source of truth.
 */

export interface RateLimitState {
  blocked: boolean;
  retryAfter: number; // seconds
  remaining: number;
}

interface Bucket {
  attempts: number[];
  blockedUntil: number;
}

const KEY = "canteenos:rate-limit";

function read(): Record<string, Bucket> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, Bucket>;
  } catch {
    return {};
  }
}

function write(data: Record<string, Bucket>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage full or blocked — throttling is best-effort */
  }
}

export interface RateLimitOptions {
  /** Attempts allowed inside the window. */
  limit?: number;
  /** Rolling window in ms. */
  windowMs?: number;
  /** Cooldown applied once the limit is hit. */
  blockMs?: number;
}

export function checkRateLimit(
  action: string,
  { limit = 5, windowMs = 60_000, blockMs = 60_000 }: RateLimitOptions = {},
): RateLimitState {
  const now = Date.now();
  const data = read();
  const bucket = data[action] ?? { attempts: [], blockedUntil: 0 };
  bucket.attempts = bucket.attempts.filter((t) => now - t < windowMs);

  if (bucket.blockedUntil > now) {
    return {
      blocked: true,
      retryAfter: Math.ceil((bucket.blockedUntil - now) / 1000),
      remaining: 0,
    };
  }
  if (bucket.blockedUntil && bucket.blockedUntil <= now) bucket.blockedUntil = 0;

  data[action] = bucket;
  write(data);
  return { blocked: false, retryAfter: 0, remaining: Math.max(0, limit - bucket.attempts.length) };
}

/** Records one attempt and returns the resulting state (blocked once over limit). */
export function recordAttempt(
  action: string,
  { limit = 5, windowMs = 60_000, blockMs = 60_000 }: RateLimitOptions = {},
): RateLimitState {
  const now = Date.now();
  const data = read();
  const bucket = data[action] ?? { attempts: [], blockedUntil: 0 };
  bucket.attempts = bucket.attempts.filter((t) => now - t < windowMs);
  bucket.attempts.push(now);

  if (bucket.attempts.length >= limit) {
    bucket.blockedUntil = now + blockMs;
    bucket.attempts = [];
  }
  data[action] = bucket;
  write(data);

  return bucket.blockedUntil > now
    ? { blocked: true, retryAfter: Math.ceil((bucket.blockedUntil - now) / 1000), remaining: 0 }
    : { blocked: false, retryAfter: 0, remaining: Math.max(0, limit - bucket.attempts.length) };
}

/** Clears the bucket after a successful action. */
export function clearRateLimit(action: string) {
  const data = read();
  delete data[action];
  write(data);
}
