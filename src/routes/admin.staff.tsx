import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Plus, UserRoundCog } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ExportActions, Pill, SectionCard, MetricRow } from "@/components/shared/panels";
import { ChartPanel, BarSeries } from "@/components/shared/charts";
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
import { tintStyle } from "@/lib/format";
import { staff as seedStaff } from "@/data/orders";
import { staffPerformance, roles } from "@/data/admin";
import type { StaffMember } from "@/types";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({
    meta: [
      { title: "Kitchen staff — CanteenOS" },
      {
        name: "description",
        content:
          "Manage kitchen and counter staff, shifts, stations and live availability across the canteen.",
      },
      { property: "og:title", content: "Kitchen staff — CanteenOS" },
      {
        property: "og:description",
        content: "Roster, stations and shift management for canteen staff.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StaffPage,
});

const stations = ["Grill", "Pizza", "Beverage", "Chinese", "South Indian", "Counter"];
const shifts = ["Morning 7–3", "Evening 3–11", "Night 11–7"];

function StaffPage() {
  const [rows, setRows] = useState<StaffMember[]>(seedStaff);
  const [station, setStation] = useState("all");
  const [inviting, setInviting] = useState(false);
  const [invite, setInvite] = useState({
    name: "",
    email: "",
    role: "Chef",
    station: stations[0],
    shift: shifts[0],
  });

  const filtered = rows.filter((r) => station === "all" || r.station === station);
  const onShift = rows.filter((r) => r.status === "on-shift").length;

  const columns: Column<StaffMember>[] = [
    {
      key: "name",
      header: "Member",
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
      key: "role",
      header: "Role",
      sortable: true,
      sortValue: (r) => r.role,
      cell: (r) => <Pill tone="primary">{r.role}</Pill>,
    },
    {
      key: "station",
      header: "Station",
      sortable: true,
      sortValue: (r) => r.station,
      cell: (r) => r.station,
    },
    {
      key: "shift",
      header: "Shift",
      cell: (r) => <span className="text-sm text-muted-foreground">{r.shift}</span>,
    },
    {
      key: "orders",
      header: "Orders",
      align: "right",
      sortable: true,
      sortValue: (r) => r.ordersHandled,
      cell: (r) => r.ordersHandled,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <Pill
          tone={r.status === "on-shift" ? "success" : r.status === "break" ? "warning" : "muted"}
        >
          {r.status === "on-shift" ? "On shift" : r.status === "break" ? "On break" : "Off shift"}
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
            variant="outline"
            className="rounded-lg"
            onClick={() => {
              setRows((p) =>
                p.map((x) =>
                  x.id === r.id
                    ? { ...x, status: x.status === "on-shift" ? "off-shift" : "on-shift" }
                    : x,
                ),
              );
              toast.success(
                `${r.name} marked ${r.status === "on-shift" ? "off shift" : "on shift"}`,
              );
            }}
          >
            {r.status === "on-shift" ? "End shift" : "Start shift"}
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Kitchen staff"
        description="Roster, stations and live shift status for the whole team."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Staff" }]}
        actions={
          <>
            <ExportActions name="Staff roster" />
            <Button className="rounded-xl" onClick={() => setInviting(true)}>
              <Plus className="size-4" /> Invite staff
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Team size"
          value={String(rows.length)}
          icon={<UserRoundCog className="size-4" />}
          index={0}
        />
        <StatCard
          label="On shift now"
          value={String(onShift)}
          delta={{ value: "live" }}
          index={1}
        />
        <StatCard
          label="Orders handled"
          value={rows.reduce((s, r) => s + r.ordersHandled, 0).toLocaleString("en-IN")}
          index={2}
        />
        <StatCard
          label="Stations covered"
          value={String(new Set(rows.map((r) => r.station)).size)}
          index={3}
        />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ChartPanel title="Orders handled per member" description="Rolling seven days" height={340} index={0}>
          <BarSeries
            data={staffPerformance}
            xKey="name"
            bars={[{ key: "orders", name: "Orders" }]}
            horizontal
          />
        </ChartPanel>
        <SectionCard title="Role distribution" description="Members per access role" index={1}>
          <div className="space-y-4">
            {roles.map((r) => (
              <MetricRow
                key={r.id}
                label={r.name}
                value={`${r.members} members`}
                pct={
                  (r.members /
                    Math.max(
                      1,
                      roles.reduce((s, x) => s + x.members, 0),
                    )) *
                  100
                }
              />
            ))}
          </div>
        </SectionCard>
      </div>

      <DataTable
        rows={filtered}
        columns={columns}
        pageSize={10}
        searchKeys={(r) => `${r.name} ${r.email} ${r.role} ${r.station}`}
        searchPlaceholder="Search staff…"
        emptyTitle="No staff found"
        toolbar={
          <Select value={station} onValueChange={setStation}>
            <SelectTrigger className="w-[170px] rounded-xl">
              <SelectValue placeholder="Station" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stations</SelectItem>
              {Array.from(new Set(rows.map((r) => r.station))).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={inviting} onOpenChange={setInviting}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Invite a staff member</DialogTitle>
            <DialogDescription>
              They receive an email with a link to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="st-name">Full name</Label>
              <Input
                id="st-name"
                value={invite.name}
                onChange={(e) => setInvite({ ...invite, name: e.target.value })}
                placeholder="Arvind Kulkarni"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="st-email">Work email</Label>
              <Input
                id="st-email"
                type="email"
                value={invite.email}
                onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                placeholder="arvind@campus.edu"
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label>Station</Label>
              <Select
                value={invite.station}
                onValueChange={(v) => setInvite({ ...invite, station: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Shift</Label>
              <Select
                value={invite.shift}
                onValueChange={(v) => setInvite({ ...invite, shift: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
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
              disabled={!invite.name || !invite.email}
              onClick={() => {
                setRows((p) => [
                  {
                    id: `st${Date.now()}`,
                    name: invite.name,
                    email: invite.email,
                    role: invite.role,
                    shift: invite.shift,
                    station: invite.station,
                    status: "off-shift",
                    ordersHandled: 0,
                    tint: "186 90% 52%",
                  },
                  ...p,
                ]);
                toast.success("Invitation sent", {
                  description: `${invite.email} will receive a setup link.`,
                });
                setInvite({
                  name: "",
                  email: "",
                  role: "Chef",
                  station: stations[0],
                  shift: shifts[0],
                });
                setInviting(false);
              }}
            >
              <Mail className="size-4" /> Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
