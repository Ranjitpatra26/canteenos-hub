/**
 * Enterprise / organization mock data.
 *
 * Shapes mirror what a multi-tenant backend would return (organization →
 * campuses → canteens/branches → staff → shifts → attendance → approvals),
 * so wiring these to real tables later is a data-layer change only.
 */

export type BranchState = "open" | "closed" | "maintenance";
export type ShiftCode = "morning" | "afternoon" | "evening" | "night" | "off";
export type AttendanceState = "present" | "late" | "absent" | "leave" | "holiday";
export type ApprovalState = "pending" | "approved" | "rejected" | "escalated";

export interface Campus {
  id: string;
  name: string;
  code: string;
  city: string;
  timezone: string;
  students: number;
  canteens: number;
  manager: string;
  revenue30d: number;
  orders30d: number;
  satisfaction: number;
  state: "active" | "onboarding" | "paused";
}

export interface Branch {
  id: string;
  campusId: string;
  name: string;
  code: string;
  block: string;
  state: BranchState;
  seats: number;
  counters: number;
  openHours: string;
  manager: string;
  staffCount: number;
  revenue30d: number;
  orders30d: number;
  avgPrepMins: number;
  rating: number;
  utilisation: number;
}

export interface OrgSettingsShape {
  legalName: string;
  displayName: string;
  domain: string;
  supportEmail: string;
  gstin: string;
  currency: string;
  locale: string;
  fiscalStart: string;
  billingPlan: "Campus" | "Multi-campus" | "Enterprise";
  seatsUsed: number;
  seatsTotal: number;
  ssoEnforced: boolean;
  mfaRequired: boolean;
  dataResidency: string;
  retentionDays: number;
}

export interface ShiftTemplate {
  id: string;
  code: ShiftCode;
  name: string;
  start: string;
  end: string;
  breakMins: number;
  headcount: number;
  premium: number;
  colorTint: string;
  branchIds: string[];
}

export interface ScheduleAssignment {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  branchId: string;
  /** Monday-first, 7 entries. */
  week: ShiftCode[];
  hours: number;
  overtime: number;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  branchId: string;
  date: string;
  state: AttendanceState;
  clockIn?: string;
  clockOut?: string;
  hours: number;
  lateMins: number;
}

export interface ApprovalRequest {
  id: string;
  ref: string;
  title: string;
  kind: "Purchase order" | "Menu change" | "Refund" | "Leave" | "Discount" | "Access";
  amount?: number;
  requester: string;
  requesterRole: string;
  branchId: string;
  campusId: string;
  submittedAt: string;
  slaHours: number;
  state: ApprovalState;
  step: number;
  chain: Array<{ role: string; approver: string; state: ApprovalState; at?: string }>;
  note: string;
}

export interface OrgRoleScope {
  id: string;
  name: string;
  description: string;
  scope: "Organization" | "Campus" | "Branch";
  members: number;
  inherits?: string;
  grants: Record<string, "full" | "write" | "read" | "none">;
}

export const organization: OrgSettingsShape = {
  legalName: "CanteenOS Hospitality Services Pvt. Ltd.",
  displayName: "CanteenOS",
  domain: "canteenos.app",
  supportEmail: "support@canteenos.app",
  gstin: "29ABCDE1234F1Z5",
  currency: "INR (₹)",
  locale: "en-IN",
  fiscalStart: "April",
  billingPlan: "Enterprise",
  seatsUsed: 148,
  seatsTotal: 200,
  ssoEnforced: true,
  mfaRequired: true,
  dataResidency: "India (Mumbai)",
  retentionDays: 365,
};

export const campuses: Campus[] = [
  {
    id: "cmp-north",
    name: "North Campus",
    code: "NRT",
    city: "Bengaluru",
    timezone: "Asia/Kolkata",
    students: 8420,
    canteens: 4,
    manager: "Ritika Sharma",
    revenue30d: 4820000,
    orders30d: 61240,
    satisfaction: 4.6,
    state: "active",
  },
  {
    id: "cmp-south",
    name: "South Campus",
    code: "STH",
    city: "Bengaluru",
    timezone: "Asia/Kolkata",
    students: 5310,
    canteens: 3,
    manager: "Arjun Mehta",
    revenue30d: 3120000,
    orders30d: 40110,
    satisfaction: 4.4,
    state: "active",
  },
  {
    id: "cmp-tech",
    name: "Tech Park Campus",
    code: "TPK",
    city: "Hyderabad",
    timezone: "Asia/Kolkata",
    students: 3960,
    canteens: 2,
    manager: "Neha Kulkarni",
    revenue30d: 2410000,
    orders30d: 28870,
    satisfaction: 4.7,
    state: "active",
  },
  {
    id: "cmp-coastal",
    name: "Coastal Campus",
    code: "CST",
    city: "Mangaluru",
    timezone: "Asia/Kolkata",
    students: 1780,
    canteens: 1,
    manager: "Sameer Rao",
    revenue30d: 640000,
    orders30d: 9120,
    satisfaction: 4.2,
    state: "onboarding",
  },
];

export const branches: Branch[] = [
  {
    id: "br-nrt-central",
    campusId: "cmp-north",
    name: "Central Canteen",
    code: "NRT-01",
    block: "Block A · Ground floor",
    state: "open",
    seats: 420,
    counters: 6,
    openHours: "07:30 – 22:00",
    manager: "Ritika Sharma",
    staffCount: 34,
    revenue30d: 1980000,
    orders30d: 24880,
    avgPrepMins: 9.4,
    rating: 4.7,
    utilisation: 88,
  },
  {
    id: "br-nrt-hostel",
    campusId: "cmp-north",
    name: "Hostel Mess",
    code: "NRT-02",
    block: "Hostel Block C",
    state: "open",
    seats: 280,
    counters: 3,
    openHours: "06:30 – 23:30",
    manager: "Imran Qureshi",
    staffCount: 22,
    revenue30d: 1240000,
    orders30d: 18320,
    avgPrepMins: 7.8,
    rating: 4.4,
    utilisation: 76,
  },
  {
    id: "br-nrt-cafe",
    campusId: "cmp-north",
    name: "Library Café",
    code: "NRT-03",
    block: "Central Library",
    state: "open",
    seats: 90,
    counters: 2,
    openHours: "08:00 – 20:00",
    manager: "Anaya Bose",
    staffCount: 11,
    revenue30d: 890000,
    orders30d: 11420,
    avgPrepMins: 5.2,
    rating: 4.8,
    utilisation: 64,
  },
  {
    id: "br-nrt-express",
    campusId: "cmp-north",
    name: "Grab & Go Express",
    code: "NRT-04",
    block: "Sports Complex",
    state: "maintenance",
    seats: 40,
    counters: 1,
    openHours: "10:00 – 19:00",
    manager: "Dev Patel",
    staffCount: 6,
    revenue30d: 310000,
    orders30d: 6620,
    avgPrepMins: 3.6,
    rating: 4.3,
    utilisation: 41,
  },
  {
    id: "br-sth-main",
    campusId: "cmp-south",
    name: "South Food Court",
    code: "STH-01",
    block: "Academic Block B",
    state: "open",
    seats: 360,
    counters: 5,
    openHours: "07:00 – 21:30",
    manager: "Arjun Mehta",
    staffCount: 28,
    revenue30d: 1620000,
    orders30d: 21140,
    avgPrepMins: 10.1,
    rating: 4.5,
    utilisation: 82,
  },
  {
    id: "br-sth-juice",
    campusId: "cmp-south",
    name: "Juice & Salad Bar",
    code: "STH-02",
    block: "Wellness Centre",
    state: "open",
    seats: 60,
    counters: 2,
    openHours: "08:00 – 20:00",
    manager: "Kavya Nair",
    staffCount: 9,
    revenue30d: 720000,
    orders30d: 10980,
    avgPrepMins: 4.4,
    rating: 4.6,
    utilisation: 58,
  },
  {
    id: "br-sth-night",
    campusId: "cmp-south",
    name: "Night Owl Counter",
    code: "STH-03",
    block: "Hostel Block F",
    state: "open",
    seats: 70,
    counters: 1,
    openHours: "20:00 – 03:00",
    manager: "Rohit Verma",
    staffCount: 8,
    revenue30d: 780000,
    orders30d: 7990,
    avgPrepMins: 8.9,
    rating: 4.2,
    utilisation: 69,
  },
  {
    id: "br-tpk-atrium",
    campusId: "cmp-tech",
    name: "Atrium Kitchen",
    code: "TPK-01",
    block: "Tower 1 · Level 2",
    state: "open",
    seats: 300,
    counters: 4,
    openHours: "07:30 – 21:00",
    manager: "Neha Kulkarni",
    staffCount: 26,
    revenue30d: 1520000,
    orders30d: 17640,
    avgPrepMins: 8.2,
    rating: 4.8,
    utilisation: 79,
  },
  {
    id: "br-tpk-roast",
    campusId: "cmp-tech",
    name: "Roastery Bar",
    code: "TPK-02",
    block: "Tower 2 · Lobby",
    state: "open",
    seats: 80,
    counters: 2,
    openHours: "08:00 – 19:00",
    manager: "Farah Sheikh",
    staffCount: 10,
    revenue30d: 890000,
    orders30d: 11230,
    avgPrepMins: 4.1,
    rating: 4.7,
    utilisation: 61,
  },
  {
    id: "br-cst-mess",
    campusId: "cmp-coastal",
    name: "Coastal Mess",
    code: "CST-01",
    block: "Main Block",
    state: "closed",
    seats: 160,
    counters: 2,
    openHours: "07:00 – 21:00",
    manager: "Sameer Rao",
    staffCount: 12,
    revenue30d: 640000,
    orders30d: 9120,
    avgPrepMins: 11.3,
    rating: 4.2,
    utilisation: 44,
  },
];

export const branchStateMeta: Record<
  BranchState,
  { label: string; tone: "success" | "muted" | "warning" }
> = {
  open: { label: "Open", tone: "success" },
  closed: { label: "Closed", tone: "muted" },
  maintenance: { label: "Maintenance", tone: "warning" },
};

export const shiftMeta: Record<
  ShiftCode,
  { label: string; short: string; className: string; tint: string }
> = {
  morning: {
    label: "Morning",
    short: "M",
    className: "bg-primary/15 text-primary",
    tint: "124 70% 55%",
  },
  afternoon: {
    label: "Afternoon",
    short: "A",
    className: "bg-accent/15 text-accent",
    tint: "190 90% 55%",
  },
  evening: {
    label: "Evening",
    short: "E",
    className: "bg-warning/15 text-warning",
    tint: "38 92% 58%",
  },
  night: { label: "Night", short: "N", className: "bg-info/15 text-info", tint: "255 85% 68%" },
  off: { label: "Off", short: "—", className: "bg-muted text-muted-foreground", tint: "0 0% 60%" },
};

export const shiftTemplates: ShiftTemplate[] = [
  {
    id: "sft-morning",
    code: "morning",
    name: "Morning prep",
    start: "06:00",
    end: "14:00",
    breakMins: 45,
    headcount: 38,
    premium: 0,
    colorTint: shiftMeta.morning.tint,
    branchIds: ["br-nrt-central", "br-nrt-hostel", "br-sth-main", "br-tpk-atrium"],
  },
  {
    id: "sft-afternoon",
    code: "afternoon",
    name: "Afternoon service",
    start: "11:00",
    end: "19:00",
    breakMins: 45,
    headcount: 42,
    premium: 0,
    colorTint: shiftMeta.afternoon.tint,
    branchIds: ["br-nrt-central", "br-nrt-cafe", "br-sth-main", "br-sth-juice", "br-tpk-atrium"],
  },
  {
    id: "sft-evening",
    code: "evening",
    name: "Evening rush",
    start: "15:00",
    end: "23:00",
    breakMins: 30,
    headcount: 31,
    premium: 12,
    colorTint: shiftMeta.evening.tint,
    branchIds: ["br-nrt-central", "br-nrt-hostel", "br-sth-main", "br-tpk-roast"],
  },
  {
    id: "sft-night",
    code: "night",
    name: "Night counter",
    start: "20:00",
    end: "03:00",
    breakMins: 30,
    headcount: 9,
    premium: 25,
    colorTint: shiftMeta.night.tint,
    branchIds: ["br-sth-night", "br-nrt-hostel"],
  },
];

const scheduleSeeds: Array<[string, string, string, ShiftCode[]]> = [
  ["Ritika Sharma", "Branch manager", "br-nrt-central", ["morning", "morning", "morning", "afternoon", "afternoon", "off", "off"]],
  ["Imran Qureshi", "Head chef", "br-nrt-hostel", ["morning", "morning", "off", "evening", "evening", "evening", "off"]],
  ["Anaya Bose", "Barista lead", "br-nrt-cafe", ["afternoon", "afternoon", "afternoon", "afternoon", "morning", "off", "off"]],
  ["Dev Patel", "Counter staff", "br-nrt-express", ["off", "afternoon", "afternoon", "afternoon", "afternoon", "afternoon", "off"]],
  ["Arjun Mehta", "Campus lead", "br-sth-main", ["morning", "morning", "morning", "morning", "morning", "off", "off"]],
  ["Kavya Nair", "Nutrition chef", "br-sth-juice", ["morning", "off", "morning", "morning", "afternoon", "afternoon", "off"]],
  ["Rohit Verma", "Night supervisor", "br-sth-night", ["night", "night", "night", "off", "off", "night", "night"]],
  ["Neha Kulkarni", "Operations manager", "br-tpk-atrium", ["morning", "afternoon", "morning", "afternoon", "morning", "off", "off"]],
  ["Farah Sheikh", "Café lead", "br-tpk-roast", ["afternoon", "afternoon", "off", "afternoon", "evening", "evening", "off"]],
  ["Sameer Rao", "Mess in-charge", "br-cst-mess", ["morning", "morning", "morning", "off", "morning", "morning", "off"]],
  ["Vikram Iyer", "Sous chef", "br-nrt-central", ["evening", "evening", "evening", "off", "off", "morning", "morning"]],
  ["Priya Menon", "Cashier", "br-sth-main", ["afternoon", "afternoon", "afternoon", "off", "afternoon", "afternoon", "off"]],
];

export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const scheduleAssignments: ScheduleAssignment[] = scheduleSeeds.map(
  ([staffName, role, branchId, week], i) => {
    const worked = week.filter((d) => d !== "off").length;
    return {
      id: `sch-${i + 1}`,
      staffId: `stf-${i + 1}`,
      staffName,
      role,
      branchId,
      week,
      hours: worked * 8,
      overtime: i % 4 === 0 ? 6 : i % 3 === 0 ? 3 : 0,
    };
  },
);

const attendanceStates: AttendanceState[] = [
  "present",
  "present",
  "present",
  "late",
  "present",
  "leave",
  "present",
  "absent",
  "present",
  "present",
];

export const attendanceRecords: AttendanceRecord[] = scheduleAssignments.flatMap((a, si) =>
  Array.from({ length: 5 }, (_, di) => {
    const state = attendanceStates[(si * 3 + di) % attendanceStates.length];
    const date = new Date(Date.now() - di * 86400000).toISOString().slice(0, 10);
    const lateMins = state === "late" ? 8 + ((si + di) % 4) * 5 : 0;
    const worked = state === "present" || state === "late";
    return {
      id: `att-${a.staffId}-${di}`,
      staffId: a.staffId,
      staffName: a.staffName,
      branchId: a.branchId,
      date,
      state,
      clockIn: worked ? (lateMins ? "07:38" : "07:28") : undefined,
      clockOut: worked ? "16:05" : undefined,
      hours: worked ? 8 - lateMins / 60 : 0,
      lateMins,
    };
  }),
);

export const attendanceTrend = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(Date.now() - (13 - i) * 86400000);
  return {
    day: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    present: 118 + ((i * 7) % 11),
    late: 6 + ((i * 5) % 5),
    absent: 3 + ((i * 3) % 4),
  };
});

export const approvalRequests: ApprovalRequest[] = [
  {
    id: "apr-1",
    ref: "REQ-4821",
    title: "Bulk rice & pulses restock",
    kind: "Purchase order",
    amount: 184500,
    requester: "Imran Qureshi",
    requesterRole: "Head chef",
    branchId: "br-nrt-hostel",
    campusId: "cmp-north",
    submittedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    slaHours: 24,
    state: "pending",
    step: 1,
    chain: [
      { role: "Branch manager", approver: "Ritika Sharma", state: "approved", at: "2h ago" },
      { role: "Campus finance", approver: "Anil Kapoor", state: "pending" },
      { role: "Org controller", approver: "Meera Das", state: "pending" },
    ],
    note: "Monsoon buffer stock for hostel mess — 30 day cover.",
  },
  {
    id: "apr-2",
    ref: "REQ-4820",
    title: "Add ‘Millet Thali’ to lunch menu",
    kind: "Menu change",
    requester: "Kavya Nair",
    requesterRole: "Nutrition chef",
    branchId: "br-sth-juice",
    campusId: "cmp-south",
    submittedAt: new Date(Date.now() - 9 * 3600000).toISOString(),
    slaHours: 48,
    state: "pending",
    step: 0,
    chain: [
      { role: "Branch manager", approver: "Arjun Mehta", state: "pending" },
      { role: "Menu council", approver: "Neha Kulkarni", state: "pending" },
    ],
    note: "Pilot for 2 weeks at ₹95, replaces low-performing pasta bowl.",
  },
  {
    id: "apr-3",
    ref: "REQ-4816",
    title: "Refund — order CO-10422 (cold delivery)",
    kind: "Refund",
    amount: 460,
    requester: "Priya Menon",
    requesterRole: "Cashier",
    branchId: "br-sth-main",
    campusId: "cmp-south",
    submittedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    slaHours: 12,
    state: "escalated",
    step: 1,
    chain: [
      { role: "Branch manager", approver: "Arjun Mehta", state: "approved", at: "1d ago" },
      { role: "Campus finance", approver: "Anil Kapoor", state: "escalated", at: "4h ago" },
    ],
    note: "SLA breached — auto-escalated to campus finance.",
  },
  {
    id: "apr-4",
    ref: "REQ-4809",
    title: "Annual leave — 12 to 18 Aug",
    kind: "Leave",
    requester: "Rohit Verma",
    requesterRole: "Night supervisor",
    branchId: "br-sth-night",
    campusId: "cmp-south",
    submittedAt: new Date(Date.now() - 40 * 3600000).toISOString(),
    slaHours: 72,
    state: "approved",
    step: 2,
    chain: [
      { role: "Branch manager", approver: "Arjun Mehta", state: "approved", at: "1d ago" },
      { role: "HR partner", approver: "Divya Suresh", state: "approved", at: "20h ago" },
    ],
    note: "Night cover reassigned to Vikram Iyer.",
  },
  {
    id: "apr-5",
    ref: "REQ-4802",
    title: "Flat 25% festival discount",
    kind: "Discount",
    amount: 0,
    requester: "Anaya Bose",
    requesterRole: "Barista lead",
    branchId: "br-nrt-cafe",
    campusId: "cmp-north",
    submittedAt: new Date(Date.now() - 60 * 3600000).toISOString(),
    slaHours: 48,
    state: "rejected",
    step: 1,
    chain: [
      { role: "Branch manager", approver: "Ritika Sharma", state: "approved", at: "2d ago" },
      { role: "Revenue desk", approver: "Meera Das", state: "rejected", at: "2d ago" },
    ],
    note: "Margin impact above threshold — capped at 15% instead.",
  },
  {
    id: "apr-6",
    ref: "REQ-4798",
    title: "Grant inventory.manage to Dev Patel",
    kind: "Access",
    requester: "Ritika Sharma",
    requesterRole: "Branch manager",
    branchId: "br-nrt-express",
    campusId: "cmp-north",
    submittedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    slaHours: 24,
    state: "pending",
    step: 0,
    chain: [
      { role: "Security review", approver: "Meera Das", state: "pending" },
      { role: "Org admin", approver: "Aarav Sharma", state: "pending" },
    ],
    note: "Temporary elevation for 30 days while express counter is rebuilt.",
  },
];

export const approvalStateMeta: Record<
  ApprovalState,
  { label: string; tone: "warning" | "success" | "danger" | "info" }
> = {
  pending: { label: "Pending", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  escalated: { label: "Escalated", tone: "info" },
};

export const approvalPolicies = [
  {
    id: "pol-po",
    name: "Purchase orders",
    trigger: "Any PO above ₹50,000",
    steps: ["Branch manager", "Campus finance", "Org controller"],
    sla: "24 hours",
    autoEscalate: true,
  },
  {
    id: "pol-refund",
    name: "Refunds",
    trigger: "Refund above ₹250 or after pickup",
    steps: ["Branch manager", "Campus finance"],
    sla: "12 hours",
    autoEscalate: true,
  },
  {
    id: "pol-menu",
    name: "Menu changes",
    trigger: "New item, price change above 10%",
    steps: ["Branch manager", "Menu council"],
    sla: "48 hours",
    autoEscalate: false,
  },
  {
    id: "pol-access",
    name: "Access elevation",
    trigger: "Any grant of manage-level permissions",
    steps: ["Security review", "Org admin"],
    sla: "24 hours",
    autoEscalate: true,
  },
  {
    id: "pol-leave",
    name: "Leave requests",
    trigger: "More than 2 consecutive days",
    steps: ["Branch manager", "HR partner"],
    sla: "72 hours",
    autoEscalate: false,
  },
];

export const permissionResources = [
  "Menu & catalogue",
  "Orders",
  "Kitchen board",
  "Inventory",
  "Staff & scheduling",
  "Approvals",
  "Analytics",
  "Organization settings",
  "Audit logs",
  "Billing",
];

export const orgRoles: OrgRoleScope[] = [
  {
    id: "role-owner",
    name: "Organization owner",
    description: "Unrestricted control across every campus, branch and billing surface.",
    scope: "Organization",
    members: 2,
    grants: Object.fromEntries(permissionResources.map((r) => [r, "full"])) as OrgRoleScope["grants"],
  },
  {
    id: "role-org-admin",
    name: "Org administrator",
    description: "Full operations control; billing is read-only.",
    scope: "Organization",
    members: 5,
    inherits: "Organization owner",
    grants: Object.fromEntries(
      permissionResources.map((r) => [r, r === "Billing" ? "read" : "full"]),
    ) as OrgRoleScope["grants"],
  },
  {
    id: "role-campus",
    name: "Campus director",
    description: "Everything inside one campus, including all of its canteens.",
    scope: "Campus",
    members: 4,
    grants: Object.fromEntries(
      permissionResources.map((r) => [
        r,
        r === "Billing" ? "none" : r === "Organization settings" ? "read" : "full",
      ]),
    ) as OrgRoleScope["grants"],
  },
  {
    id: "role-branch",
    name: "Branch manager",
    description: "Day-to-day running of a single canteen.",
    scope: "Branch",
    members: 10,
    grants: Object.fromEntries(
      permissionResources.map((r) => [
        r,
        ["Billing", "Organization settings"].includes(r)
          ? "none"
          : ["Analytics", "Audit logs"].includes(r)
            ? "read"
            : r === "Approvals"
              ? "write"
              : "full",
      ]),
    ) as OrgRoleScope["grants"],
  },
  {
    id: "role-chef",
    name: "Head chef",
    description: "Kitchen board, inventory consumption and rota input.",
    scope: "Branch",
    members: 12,
    grants: Object.fromEntries(
      permissionResources.map((r) => [
        r,
        ["Kitchen board", "Inventory"].includes(r)
          ? "full"
          : ["Menu & catalogue", "Orders", "Staff & scheduling"].includes(r)
            ? "write"
            : r === "Analytics"
              ? "read"
              : "none",
      ]),
    ) as OrgRoleScope["grants"],
  },
  {
    id: "role-finance",
    name: "Finance controller",
    description: "Approves spend, reads every ledger, changes nothing operational.",
    scope: "Organization",
    members: 3,
    grants: Object.fromEntries(
      permissionResources.map((r) => [
        r,
        r === "Billing" ? "full" : r === "Approvals" ? "write" : r === "Kitchen board" ? "none" : "read",
      ]),
    ) as OrgRoleScope["grants"],
  },
  {
    id: "role-auditor",
    name: "Auditor",
    description: "Read-only observer for compliance reviews.",
    scope: "Organization",
    members: 2,
    grants: Object.fromEntries(
      permissionResources.map((r) => [r, r === "Billing" ? "none" : "read"]),
    ) as OrgRoleScope["grants"],
  },
];

export const grantMeta: Record<
  "full" | "write" | "read" | "none",
  { label: string; tone: "success" | "primary" | "info" | "muted" }
> = {
  full: { label: "Full", tone: "success" },
  write: { label: "Write", tone: "primary" },
  read: { label: "Read", tone: "info" },
  none: { label: "None", tone: "muted" },
};

export const orgRevenueTrend = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(2026, i, 1).toLocaleDateString("en-IN", { month: "short" });
  return {
    month,
    north: 3600000 + i * 98000 + (i % 3) * 120000,
    south: 2400000 + i * 62000 + (i % 4) * 90000,
    tech: 1750000 + i * 55000 + (i % 2) * 70000,
    coastal: 380000 + i * 22000,
  };
});

export const campusComparison = campuses.map((c) => ({
  campus: c.code,
  revenue: c.revenue30d,
  orders: c.orders30d,
  satisfaction: c.satisfaction * 20,
}));

export const branchUtilisation = branches.map((b) => ({
  branch: b.code,
  utilisation: b.utilisation,
  prep: b.avgPrepMins,
}));

export const orgKpis = {
  revenue30d: campuses.reduce((s, c) => s + c.revenue30d, 0),
  orders30d: campuses.reduce((s, c) => s + c.orders30d, 0),
  activeBranches: branches.filter((b) => b.state === "open").length,
  totalBranches: branches.length,
  staff: branches.reduce((s, b) => s + b.staffCount, 0),
  students: campuses.reduce((s, c) => s + c.students, 0),
  avgSatisfaction:
    campuses.reduce((s, c) => s + c.satisfaction, 0) / Math.max(1, campuses.length),
};

export const campusById = (id: string) => campuses.find((c) => c.id === id);
export const branchById = (id: string) => branches.find((b) => b.id === id);
export const branchesForCampus = (campusId: string) =>
  branches.filter((b) => b.campusId === campusId);
