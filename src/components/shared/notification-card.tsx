import { memo } from "react";
import { motion } from "motion/react";
import {
  BellRing,
  CheckCircle2,
  CreditCard,
  Megaphone,
  PackageCheck,
  PackageX,
  Receipt,
  Sparkles,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import type { AppNotification } from "@/types";

export type NotificationTone = "order" | "ready" | "stock" | "payment" | "offer" | "announcement" | "system";

const TONES: Record<
  NotificationTone,
  { icon: React.ComponentType<{ className?: string }>; label: string; className: string }
> = {
  order: { icon: Receipt, label: "New order", className: "bg-primary/12 text-primary" },
  ready: { icon: PackageCheck, label: "Order ready", className: "bg-accent/15 text-accent" },
  stock: {
    icon: PackageX,
    label: "Low inventory",
    className: "bg-destructive/12 text-destructive",
  },
  payment: { icon: CreditCard, label: "Payment", className: "bg-emerald-500/12 text-emerald-500" },
  offer: { icon: Sparkles, label: "Coupon", className: "bg-amber-500/12 text-amber-500" },
  announcement: { icon: Megaphone, label: "Announcement", className: "bg-primary/15 text-primary" },
  system: { icon: Wrench, label: "System", className: "bg-muted text-muted-foreground" },
};

/** Maps the stored notification kind + copy onto a richer visual tone. */
export function toneFor(n: Pick<AppNotification, "kind" | "title"> & { body?: string }): NotificationTone {
  const t = `${n.title} ${n.body ?? ""}`.toLowerCase();
  if (n.kind === "stock") return "stock";
  if (n.kind === "announcement") return "announcement";
  if (n.kind === "offer" && (t.includes("coupon") || t.includes("discount") || t.includes("% off") || t.includes("promo"))) return "offer";
  if (n.kind === "system" && !t.includes("announcement")) return "system";
  if (t.includes("ready") || t.includes("collect")) return "ready";
  if (t.includes("payment") || t.includes("paid") || t.includes("refund")) return "payment";
  return "announcement";
}

function NotificationCardBase({
  notification,
  index = 0,
  onClick,
  action,
}: {
  notification: AppNotification;
  index?: number;
  onClick?: () => void;
  action?: React.ReactNode;
}) {
  const tone = TONES[toneFor(notification)];
  const Icon = tone.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.28), ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={cn(
        "glass-reflect group relative flex gap-3.5 overflow-hidden surface-card p-4 transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]",
        onClick && "cursor-pointer",
        !notification.read && "border-primary/30",
      )}
    >
      {!notification.read ? (
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary" />
      ) : null}

      <span
        className={cn("mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl", tone.className)}
      >
        <Icon className="size-[18px]" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold">{notification.title}</h3>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            {tone.label}
          </span>
          {!notification.read ? (
            <span className="text-[10px] font-medium uppercase tracking-wide text-primary">
              New
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{notification.body}</p>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <BellRing className="size-3" /> {timeAgo(notification.time)}
          </span>
          {notification.read ? (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Read
            </span>
          ) : null}
        </div>
      </div>

      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </motion.article>
  );
}

/** Memoised: these render in long lists and re-render on every parent update. */
export const NotificationCard = memo(NotificationCardBase);
