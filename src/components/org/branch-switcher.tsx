import { Building2, Check, ChevronsUpDown, MapPin } from "lucide-react";
import { motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pill } from "@/components/shared/panels";
import { useOrg } from "@/contexts/org-context";
import { branchStateMeta } from "@/data/organization";
import { cn } from "@/lib/utils";

/**
 * Header control for switching the active campus / canteen. The whole admin
 * console reads scope from <OrgProvider>, so switching here re-scopes every
 * page that calls `useOrg()`.
 */
export function BranchSwitcher({ className }: { className?: string }) {
  const { campus, branch, campuses, branches, setCampus, setBranch, scopeLabel } = useOrg();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex min-w-0 max-w-[15rem] cursor-pointer items-center gap-2 rounded-xl border border-border bg-card/60 px-2.5 py-1.5 text-left shadow-[var(--shadow-xs)] transition-colors hover:border-primary/30 hover:bg-secondary",
            className,
          )}
          aria-label="Switch campus or canteen"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary ring-1 ring-inset ring-primary/15">
            <Building2 className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium leading-tight">
              {branch?.name ?? campus.name}
            </span>
            <span className="block truncate text-[10px] leading-tight text-muted-foreground">
              {branch ? `${campus.code} · ${branch.code}` : "All canteens"}
            </span>
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[19rem] rounded-xl p-1.5">
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Campus
        </DropdownMenuLabel>
        {campuses.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onSelect={() => setCampus(c.id)}
            className="cursor-pointer rounded-lg"
          >
            <MapPin className="size-4 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">{c.name}</span>
            <span className="text-[11px] text-muted-foreground">{c.city}</span>
            {c.id === campus.id ? <Check className="size-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Canteen
        </DropdownMenuLabel>
        <DropdownMenuItem
          onSelect={() => setBranch(null)}
          className="cursor-pointer rounded-lg"
        >
          <span className="min-w-0 flex-1 truncate">All canteens</span>
          <span className="text-[11px] text-muted-foreground">{branches.length}</span>
          {!branch ? <Check className="size-4 text-primary" /> : null}
        </DropdownMenuItem>
        {branches.map((b) => (
          <DropdownMenuItem
            key={b.id}
            onSelect={() => setBranch(b.id)}
            className="cursor-pointer rounded-lg"
          >
            <span className="min-w-0 flex-1 truncate">{b.name}</span>
            <Pill tone={branchStateMeta[b.state].tone}>{branchStateMeta[b.state].label}</Pill>
            {b.id === branch?.id ? <Check className="size-4 text-primary" /> : null}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <p className="px-2 py-1.5 text-[11px] text-muted-foreground">Scope: {scopeLabel}</p>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Small inline banner telling the user what the page is currently filtered to. */
export function ScopeNotice({ count, noun = "records" }: { count: number; noun?: string }) {
  const { scopeLabel } = useOrg();
  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
    >
      <Pill tone="primary">{scopeLabel}</Pill>
      <span className="numeric">
        {count} {noun} in scope
      </span>
    </motion.p>
  );
}
