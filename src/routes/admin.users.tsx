import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ExportActions, Pill } from "@/components/shared/panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { shortDate, tintStyle, timeAgo } from "@/lib/format";
import { useDirectory, useSetUserRole, useSetUserStatus } from "@/lib/api";
import { roles } from "@/data/admin";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User accounts — CanteenOS" },
      {
        name: "description",
        content:
          "Manage every CanteenOS account: students, kitchen crew and administrators, with roles and access status.",
      },
      { property: "og:title", content: "User accounts — CanteenOS" },
      {
        property: "og:description",
        content: "Account directory with role assignment and access controls.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UsersPage,
});

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  workspace: "Student" | "Kitchen" | "Admin";
  status: "active" | "invited" | "suspended";
  lastActive: string;
  joinedAt: string;
  tint: string;
}

function UsersPage() {
  const { data: directory = [], isLoading } = useDirectory();
  const setUserRole = useSetUserRole();
  const setUserStatus = useSetUserStatus();
  const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong");
  const rows: AppUser[] = directory.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role === "admin" ? "Admin" : u.role === "kitchen" ? "Kitchen crew" : "Student",
    workspace: (u.role === "admin"
      ? "Admin"
      : u.role === "kitchen"
        ? "Kitchen"
        : "Student") as AppUser["workspace"],
    status: (String(u.status) === "blocked" || String(u.status) === "inactive"
      ? "suspended"
      : "active") as AppUser["status"],
    lastActive: u.joinedAt,
    joinedAt: u.joinedAt,
    tint: u.tint,
  }));
  const [workspace, setWorkspace] = useState("all");
  const [status, setStatus] = useState("all");
  const [inviting, setInviting] = useState(false);
  const [invite, setInvite] = useState({ email: "", role: roles[0]?.name ?? "Admin" });

  const filtered = rows.filter(
    (r) =>
      (workspace === "all" || r.workspace === workspace) &&
      (status === "all" || r.status === status),
  );

  const columns: Column<AppUser>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="flex items-center gap-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
            style={tintStyle(r.tint)}
          >
            {r.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{r.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{r.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: "workspace",
      header: "Workspace",
      sortable: true,
      sortValue: (r) => r.workspace,
      cell: (r) => (
        <Pill
          tone={r.workspace === "Admin" ? "primary" : r.workspace === "Kitchen" ? "info" : "muted"}
        >
          {r.workspace}
        </Pill>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (r) => (
        <Select
          value={
            r.workspace === "Admin" ? "admin" : r.workspace === "Kitchen" ? "kitchen" : "student"
          }
          onValueChange={(v) =>
            setUserRole.mutate(
              { userId: r.id, role: v as "student" | "kitchen" | "admin" },
              { onSuccess: () => toast.success(`${r.name} is now ${v}`), onError: fail },
            )
          }
        >
          <SelectTrigger className="h-8 w-[130px] rounded-lg text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="kitchen">Kitchen</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      sortable: true,
      sortValue: (r) => r.joinedAt,
      cell: (r) => shortDate(r.joinedAt),
    },
    {
      key: "last",
      header: "Last active",
      sortable: true,
      sortValue: (r) => r.lastActive,
      cell: (r) => <span className="text-xs text-muted-foreground">{timeAgo(r.lastActive)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <Pill
          tone={r.status === "active" ? "success" : r.status === "invited" ? "warning" : "danger"}
        >
          {r.status}
        </Pill>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) => (
        <span className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-lg"
            onClick={() => toast.success(`Password reset link sent to ${r.email}`)}
          >
            <KeyRound className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg"
            onClick={() => {
              const next = r.status === "suspended" ? "active" : "blocked";
              setUserStatus.mutate(
                { userId: r.id, status: next },
                {
                  onSuccess: () =>
                    toast.success(`${r.name} ${next === "blocked" ? "suspended" : "reactivated"}`),
                  onError: fail,
                },
              );
            }}
          >
            {r.status === "suspended" ? "Reactivate" : "Suspend"}
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="User accounts"
        description="Every account across the student, kitchen and admin workspaces."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Users" }]}
        actions={
          <>
            <ExportActions name="User accounts" />
            <Button className="rounded-xl" onClick={() => setInviting(true)}>
              <UserPlus className="size-4" /> Invite user
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total accounts" value={rows.length.toLocaleString("en-IN")} index={0} />
        <StatCard
          label="Admin & kitchen"
          value={String(rows.filter((r) => r.workspace !== "Student").length)}
          icon={<ShieldCheck className="size-4" />}
          index={1}
        />
        <StatCard
          label="Pending invites"
          value={String(rows.filter((r) => r.status === "invited").length)}
          index={2}
        />
        <StatCard
          label="Suspended"
          value={String(rows.filter((r) => r.status === "suspended").length)}
          index={3}
        />
      </div>

      <DataTable
        rows={filtered}
        loading={isLoading}
        columns={columns}
        pageSize={10}
        searchKeys={(r) => `${r.name} ${r.email} ${r.role} ${r.workspace}`}
        searchPlaceholder="Search accounts…"
        emptyTitle="No accounts found"
        toolbar={
          <>
            <Select value={workspace} onValueChange={setWorkspace}>
              <SelectTrigger className="w-[150px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All workspaces</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Kitchen">Kitchen</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <Dialog open={inviting} onOpenChange={setInviting}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite a user</DialogTitle>
            <DialogDescription>Assign a role now — you can change it any time.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="inv-email">Email address</Label>
              <Input
                id="inv-email"
                type="email"
                value={invite.email}
                onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                placeholder="name@campus.edu"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={invite.role} onValueChange={(v) => setInvite({ ...invite, role: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.name}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setInviting(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              disabled={!invite.email}
              onClick={() => {
                toast.success(
                  `Invitation noted for ${invite.email} — ask them to sign up, then assign a role here.`,
                );
                setInvite({ email: "", role: roles[0]?.name ?? "Admin" });
                setInviting(false);
              }}
            >
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
