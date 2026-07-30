import { toast } from "sonner";

/**
 * Maps backend/auth errors onto calm, human error copy. Raw provider strings
 * leak implementation detail and read badly in a premium product.
 */
const MESSAGES: { match: RegExp; message: string }[] = [
  { match: /invalid login credentials/i, message: "That email and password don't match." },
  { match: /email not confirmed/i, message: "Confirm your email address, then sign in again." },
  {
    match: /user already registered|already been registered/i,
    message: "An account already exists for this email. Try signing in.",
  },
  { match: /password should be at least/i, message: "Choose a longer password (8+ characters)." },
  {
    match: /pwned|compromised/i,
    message: "That password appears in a known breach. Pick a different one.",
  },
  {
    match: /rate limit|too many requests|429/i,
    message: "Too many attempts. Please wait a moment and try again.",
  },
  {
    match: /jwt expired|token.*expired|session.*expired/i,
    message: "Your session expired. Please sign in again.",
  },
  {
    match: /row-level security|permission denied|not authorized|403/i,
    message: "You don't have permission to do that.",
  },
  { match: /duplicate key|already exists/i, message: "That record already exists." },
  { match: /foreign key/i, message: "That item is still linked to other records." },
  {
    match: /failed to fetch|network|offline/i,
    message: "Network problem — check your connection and retry.",
  },
];

export function friendlyError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : typeof error === "object" && error && "message" in error
          ? String((error as { message: unknown }).message)
          : "";
  if (!raw) return fallback;
  const hit = MESSAGES.find((m) => m.match.test(raw));
  if (hit) return hit.message;
  // Never surface SQL/stack detail to end users.
  if (/select |insert |update |delete |pgrst|postgres/i.test(raw)) return fallback;
  return raw.length > 160 ? fallback : raw;
}

/** Toast an error with consistent copy and an optional retry action. */
export function toastError(error: unknown, opts?: { fallback?: string; retry?: () => void }) {
  toast.error(friendlyError(error, opts?.fallback), {
    action: opts?.retry ? { label: "Retry", onClick: opts.retry } : undefined,
  });
}

/** Toast a success message with consistent phrasing. */
export function toastSuccess(message: string, description?: string) {
  toast.success(message, { description });
}
