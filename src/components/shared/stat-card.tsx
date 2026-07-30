import { memo, type ReactNode } from "react";
import { motion } from "motion/react";
import { TiltCard } from "@/components/fx/motion-fx";
import { cn } from "@/lib/utils";

function StatCardBase({
  label,
  value,
  delta,
  icon,
  hint,
  index = 0,
}: {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  icon?: ReactNode;
  hint?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard intensity={7} className="group h-full rounded-2xl">
        <div
          data-export-stat={label}
          data-export-value={value}
          className="glass-reflect h-full surface-card overflow-hidden p-5 transition-[border-color,box-shadow] duration-300 group-hover:border-primary/35 group-hover:shadow-[var(--shadow-glow)]"
        >
          <div className="[transform:translateZ(24px)]">
            <div className="flex items-start justify-between gap-3">
              <p className="label-micro min-w-0 truncate pt-1">{label}</p>
              {icon ? (
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/15 transition-transform duration-300 group-hover:scale-110">
                  {icon}
                </span>
              ) : null}
            </div>
            <p className="numeric mt-4 text-[1.75rem] font-semibold leading-none tracking-[-0.02em]">
              {value}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {delta ? (
                <span
                  className={cn(
                    "numeric rounded-full px-2 py-0.5 font-medium",
                    delta.positive === false
                      ? "bg-destructive/15 text-destructive"
                      : "bg-success/15 text-success",
                  )}
                >
                  {delta.value}
                </span>
              ) : null}
              {hint ? <span className="text-muted-foreground">{hint}</span> : null}
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

/** Memoised: these render in long lists and re-render on every parent update. */
export const StatCard = memo(StatCardBase);
