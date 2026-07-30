import { z } from "zod";

/**
 * Central validation schemas. Every user-facing form validates through zod so
 * error copy, length limits and trimming stay consistent across the app.
 */

const email = z
  .string()
  .trim()
  .min(1, { message: "Email is required." })
  .email({ message: "Enter a valid email address." })
  .max(255, { message: "Email must be under 255 characters." });

const password = z
  .string()
  .min(8, { message: "Use at least 8 characters." })
  .max(72, { message: "Passwords are limited to 72 characters." });

export const loginSchema = z.object({
  email,
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).max(72),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "Enter your full name." })
    .max(80, { message: "Name must be under 80 characters." }),
  email,
  studentId: z
    .string()
    .trim()
    .min(4, { message: "Enter your student or staff ID." })
    .max(32, { message: "ID must be under 32 characters." })
    .regex(/^[A-Za-z0-9._/-]+$/, { message: "IDs use letters, numbers, dot, dash or slash only." }),
  password,
  agree: z.literal(true, { errorMap: () => ({ message: "Please accept the terms to continue." }) }),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({ password, confirm: z.string() })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords don't match.",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Enter your current password." }).max(72),
    password,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords don't match.",
  })
  .refine((v) => v.currentPassword !== v.password, {
    path: ["password"],
    message: "Choose a password different from your current one.",
  });

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, { message: "Enter your name." }).max(80),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+\-\s()]*$/, { message: "Enter a valid phone number." })
    .optional()
    .or(z.literal("")),
  department: z.string().trim().max(80).optional().or(z.literal("")),
  year: z.string().trim().max(20).optional().or(z.literal("")),
});

export const orderNoteSchema = z
  .string()
  .trim()
  .max(280, { message: "Notes are limited to 280 characters." });

export const couponCodeSchema = z
  .string()
  .trim()
  .min(3, { message: "Coupon codes need at least 3 characters." })
  .max(24)
  .regex(/^[A-Za-z0-9_-]+$/, { message: "Coupon codes use letters, numbers, dash or underscore." });

/** Runs a schema and returns a flat `{ field: message }` map for form state. */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  value: unknown,
):
  | { ok: true; data: z.infer<T>; errors: Record<string, never> }
  | {
      ok: false;
      data: null;
      errors: Record<string, string>;
    } {
  const parsed = schema.safeParse(value);
  if (parsed.success) return { ok: true, data: parsed.data, errors: {} };
  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] ? String(issue.path[0]) : "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return { ok: false, data: null, errors };
}

/**
 * Escapes user-supplied text before it is ever interpolated into markup or a
 * URL. React escapes by default — this exists for the non-JSX paths
 * (window.open targets, share links, exported CSV/HTML).
 */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strips control characters and clamps length before sending text to the API. */
export function sanitizeText(value: string, max = 500) {
  return value
    // eslint-disable-next-line no-control-regex -- stripping control chars is the point
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);
}

/** Only allow same-origin relative paths for post-auth redirects (open-redirect guard). */
export function safeRedirectPath(value: string | null | undefined, fallback = "/") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
