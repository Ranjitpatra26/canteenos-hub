import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Clock, ShieldAlert, XCircle } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard, SegmentedControl, ExportActions, Pill } from "@/components/shared/panels";
import { ApprovalChain, StateBadge } from "@/components/org/org-ui";
import { BranchSwitcher, ScopeNotice } from "@/components/org/branch-switcher";
import { Button } from "@/components/ui/button";
import { useOrg } from "@/contexts/org-context";
import {
  approvalPolicies,
  approvalRequests,
  type ApprovalRequest,
  type ApprovalState,
} from "@/data/organization";
import { inr, timeAgo } from "@/lib/format";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/approvals")({
  head: () => ({
    meta: [
      { title: "Approvals — CanteenOS admin" },
      {
        name: "description",
        content:
          "Multi-step approval workflows for purchase orders, refunds, menu changes, leave and access requests.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Approvals — CanteenOS admin" },
      {
        property: "og:description",
        content: "Route requests through branch, campus and org approvers with SLA tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ApprovalsPage,
});

const filters: Array<{ value: ApprovalState | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "escalated", label: "Escalated" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function ApprovalsPage() {
  const { branches, branch, campus, allBranches } = useOrg();
  const [filter, setFilter] = useState<ApprovalState | "all">("pending");
  const [decided, setDecided] = useState<Record<string, ApprovalState>>({});

  const scoped = useMemo(() => {
    const ids = branch ? [branch.id] : branches.map((b) => b.id);
    return approvalRequests
      .filter((r) => ids.includes(r.branchId) || r.campusId === campus.id)
      .map((r) => ({ ...r, state: decided[r.id] ?? r.state }));
  }, [branches, branch, campus, decided]);

  const rows = scoped.filter((r) => filter === "all" || r.state === filter);
  const pending = scoped.filter((r) => r.state === "pending").length;
  const escalated = scoped.filter((r) => r.state === "escalated").length;
  const approved = scoped.filter((r) => r.state === "approved").length;
  const rejected = scoped.filter((r) => r.state === "rejected").length;

  const decide = (req: ApprovalRequest, state: ApprovalState) => {
    setDecided((d) => ({ ...d, [req.id]: state }));
    toast.success(`${req.ref} ${state}`, {
      description: `${req.title} — requester and next approver notified.`,
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Approvals"
        description="Every request that needs a human decision, routed through the policy chain with SLA tracking."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Approvals" }]}
        actions={
          <>
            <BranchSwitcher />
            <ExportActions name="Approvals" />
          </>
        }
      />

      <ScopeNotice count={scoped.length} noun="requests" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Awaiting decision"
          value={String(pending)}
          icon={<Clock className="size-4" />}
          hint="within SLA"
          index={0}
        />
        <StatCard
          label="Escalated"
          value={String(escalated)}
          icon={<ShieldAlert className="size-4" />}
          delta={{ value: escalated ? "SLA breach" : "clear", positive: escalated === 0 }}
          index={1}
        />
        <StatCard
          label="Approved · 30d"
          value={String(approved)}
          icon={<CheckCircle2 className="size-4" />}
          index={2}
        />
        <StatCard
          label="Rejected · 30d"
          value={String(rejected)}
          icon={<XCircle className="size-4" />}
          index={3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[0.9375rem] font-semibold tracking-tight">Request queue</h2>
            <SegmentedControl value={filter} onChange={setFilter} options={filters} />
          </div>

          <AnimatePresence initial={false}>
            {rows.map((r, i) => (
              <motion.article
                key={r.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                className="surface-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="numeric text-xs text-muted-foreground">{r.ref}</span>
                      <Pill tone="muted">{r.kind}</Pill>
                      <StateBadge state={r.state} />
                    </div>
                    <h3 className="mt-1.5 truncate text-sm font-medium">{r.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.requester} · {r.requesterRole} ·{" "}
                      {allBranches.find((b) => b.id === r.branchId)?.name ?? r.branchId} ·{" "}
                      {timeAgo(r.submittedAt)}
                    </p>
                  </div>
                  {r.amount ? (
                    <span className="numeric text-sm font-semibold">{inr(r.amount)}</span>
                  ) : null}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{r.note}</p>

                <div className="mt-4">
                  <ApprovalChain chain={r.chain} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
                  <Button
                    size="sm"
                    className="rounded-xl"
                    disabled={r.state === "approved"}
                    onClick={() => decide(r, "approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    disabled={r.state === "rejected"}
                    onClick={() => decide(r, "rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => decide(r, "escalated")}
                  >
                    Escalate
                  </Button>
                  <span className="numeric ml-auto text-[11px] text-muted-foreground">
                    SLA {r.slaHours}h · step {r.step + 1} of {r.chain.length}
                  </span>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>

          {rows.length === 0 ? (
            <SectionCard title="Nothing to review">
              <p className="text-sm text-muted-foreground">
                This queue is clear for the selected scope. Switch filters or canteens to see other requests.
              </p>
            </SectionCard>
          ) : null}
        </div>

        <SectionCard
          title="Approval policies"
          description="What triggers a workflow, who signs off and how long they have."
          index={1}
        >
          <ul className="space-y-4">
            {approvalPolicies.map((p) => (
              <li key={p.id} className="border-b border-border/60 pb-4 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{p.name}</p>
                  <Pill tone={p.autoEscalate ? "warning" : "muted"}>
                    {p.autoEscalate ? "Auto-escalates" : "Manual"}
                  </Pill>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.trigger}</p>
                <p className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                  {p.steps.map((s, i) => (
                    <span key={s} className="flex items-center gap-1">
                      <span className="rounded-md bg-secondary px-1.5 py-0.5">{s}</span>
                      {i < p.steps.length - 1 ? <span aria-hidden>→</span> : null}
                    </span>
                  ))}
                </p>
                <p className="numeric mt-2 text-[11px] text-muted-foreground">SLA {p.sla}</p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
