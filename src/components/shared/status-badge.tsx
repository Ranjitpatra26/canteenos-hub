import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const map: Record<OrderStatus, { label: string; className: string }> = {
  placed: { label: "Placed", className: "bg-info/15 text-info border-info/25" },
  preparing: { label: "Preparing", className: "bg-warning/15 text-warning border-warning/25" },
  ready: { label: "Ready", className: "bg-primary/15 text-primary border-primary/30" },
  completed: { label: "Completed", className: "bg-success/15 text-success border-success/25" },
  cancelled: {
    label: "Cancelled",
    className: "bg-destructive/12 text-destructive border-destructive/25",
  },
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const cfg = map[status];
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", cfg.className, className)}>
      <span className="mr-1.5 inline-block size-1.5 rounded-full bg-current" />
      {cfg.label}
    </Badge>
  );
}
