import { inventory } from "./operations";
import { customers, orders, staff } from "./orders";
import { menuItems } from "./menu";

/* ---------------------------------- types --------------------------------- */

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  category: string;
  leadTimeDays: number;
  rating: number;
  onTimePct: number;
  activeSkus: number;
  status: "active" | "paused";
}

export interface StockMovement {
  id: string;
  sku: string;
  item: string;
  type: "in" | "out" | "waste" | "adjust";
  qty: number;
  unit: string;
  reason: string;
  by: string;
  at: string;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplier: string;
  items: number;
  amount: number;
  placedAt: string;
  expectedAt: string;
  status: "draft" | "sent" | "received" | "cancelled";
}

export interface RestockRequest {
  id: string;
  item: string;
  sku: string;
  qty: number;
  unit: string;
  urgency: "low" | "medium" | "high";
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected" | "ordered";
}

export interface AuditLog {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  entity: string;
  ip: string;
  at: string;
  severity: "info" | "warning" | "critical";
}

export interface ActivityEvent {
  id: string;
  title: string;
  detail: string;
  at: string;
  kind: "order" | "menu" | "stock" | "user" | "system" | "payment";
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  members: number;
  permissions: string[];
}

export interface StaffPerformance {
  id: string;
  name: string;
  station: string;
  orders: number;
  avgPrepMins: number;
  onTimePct: number;
  rating: number;
  shiftHours: number;
}

/* -------------------------------- suppliers -------------------------------- */

export const suppliers: Supplier[] = [
  {
    id: "s1",
    name: "Sahyadri Dairy",
    contact: "Rakesh Patil",
    phone: "+91 98220 41120",
    email: "orders@sahyadridairy.in",
    category: "Dairy",
    leadTimeDays: 1,
    rating: 4.8,
    onTimePct: 96,
    activeSkus: 8,
    status: "active",
  },
  {
    id: "s2",
    name: "Freshcut Foods",
    contact: "Nadia Sheikh",
    phone: "+91 90040 77321",
    email: "supply@freshcut.co.in",
    category: "Protein",
    leadTimeDays: 2,
    rating: 4.5,
    onTimePct: 91,
    activeSkus: 12,
    status: "active",
  },
  {
    id: "s3",
    name: "Annapurna Mills",
    contact: "Suresh Rao",
    phone: "+91 93710 22984",
    email: "sales@annapurnamills.com",
    category: "Staples",
    leadTimeDays: 3,
    rating: 4.6,
    onTimePct: 94,
    activeSkus: 19,
    status: "active",
  },
  {
    id: "s4",
    name: "Baba Budan Roasters",
    contact: "Ismail K",
    phone: "+91 99860 55412",
    email: "hello@bababudan.coffee",
    category: "Beverage",
    leadTimeDays: 4,
    rating: 4.9,
    onTimePct: 98,
    activeSkus: 5,
    status: "active",
  },
  {
    id: "s5",
    name: "Green Valley Farms",
    contact: "Pooja Deshmukh",
    phone: "+91 91450 66093",
    email: "farm@greenvalley.in",
    category: "Produce",
    leadTimeDays: 1,
    rating: 4.3,
    onTimePct: 87,
    activeSkus: 24,
    status: "active",
  },
  {
    id: "s6",
    name: "Crust & Co.",
    contact: "Alan D'Souza",
    phone: "+91 98670 31228",
    email: "bakery@crustandco.in",
    category: "Bakery",
    leadTimeDays: 1,
    rating: 4.4,
    onTimePct: 92,
    activeSkus: 9,
    status: "active",
  },
  {
    id: "s7",
    name: "Cocoa Trail",
    contact: "Meghna Bose",
    phone: "+91 97390 88461",
    email: "b2b@cocoatrail.com",
    category: "Bakery",
    leadTimeDays: 6,
    rating: 4.7,
    onTimePct: 89,
    activeSkus: 4,
    status: "paused",
  },
  {
    id: "s8",
    name: "Wok Supply Co.",
    contact: "Li Wen",
    phone: "+91 90190 45577",
    email: "orders@woksupply.in",
    category: "Sauces",
    leadTimeDays: 5,
    rating: 4.2,
    onTimePct: 84,
    activeSkus: 11,
    status: "active",
  },
  {
    id: "s9",
    name: "EcoPack India",
    contact: "Harsh Vora",
    phone: "+91 99300 12094",
    email: "sales@ecopack.in",
    category: "Packaging",
    leadTimeDays: 7,
    rating: 4.1,
    onTimePct: 81,
    activeSkus: 6,
    status: "active",
  },
];

/* ----------------------------- stock movement ----------------------------- */

const movementSeeds: Array<[string, StockMovement["type"], number, string, string]> = [
  ["Mozzarella Cheese", "out", 6, "Pizza station consumption", "Rahul Deshpande"],
  ["Chicken Breast", "in", 40, "PO-2291 received", "Store keeper"],
  ["Paneer Block", "out", 8, "Chinese counter prep", "Farhan Qureshi"],
  ["Tomatoes", "waste", 3, "Spoilage during storage", "Store keeper"],
  ["Arabica Coffee Beans", "out", 2, "Beverage counter refill", "Neha Bhatt"],
  ["Burger Buns", "in", 200, "PO-2287 received", "Store keeper"],
  ["Potatoes", "out", 22, "Fries batch prep", "Rahul Deshpande"],
  ["Full Cream Milk", "out", 18, "Chai and coffee service", "Neha Bhatt"],
  ["Sunflower Oil", "adjust", 4, "Stock count correction", "Priya Menon"],
  ["Basmati Rice", "out", 15, "North Indian counter", "Imran Shaikh"],
  ["Dark Chocolate 70%", "out", 1, "Dessert plating", "Anita Kulkarni"],
  ["Schezwan Paste", "in", 10, "PO-2294 received", "Store keeper"],
  ["Urad Dal", "out", 6, "Dosa batter grind", "Imran Shaikh"],
  ["Paper Takeaway Boxes", "out", 240, "Daily packaging draw", "Store keeper"],
  ["Refined Flour (Maida)", "out", 12, "Pizza dough batch", "Rahul Deshpande"],
  ["Tomatoes", "in", 30, "PO-2296 received", "Store keeper"],
  ["Chicken Breast", "out", 14, "Tandoor marination", "Farhan Qureshi"],
  ["Mozzarella Cheese", "in", 15, "PO-2298 received", "Store keeper"],
];

export const stockMovements: StockMovement[] = movementSeeds.map((m, i) => {
  const inv = inventory.find((x) => x.name === m[0]);
  return {
    id: `sm${i + 1}`,
    item: m[0],
    sku: inv?.sku ?? "GEN-000",
    type: m[1],
    qty: m[2],
    unit: inv?.unit ?? "kg",
    reason: m[3],
    by: m[4],
    at: new Date(Date.UTC(2026, 6, 30, 7, 0) - i * 3.4e6).toISOString(),
  };
});

/* ----------------------------- purchase orders ---------------------------- */

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "po1",
    code: "PO-2298",
    supplier: "Sahyadri Dairy",
    items: 4,
    amount: 18420,
    placedAt: "2026-07-29",
    expectedAt: "2026-07-31",
    status: "sent",
  },
  {
    id: "po2",
    code: "PO-2296",
    supplier: "Green Valley Farms",
    items: 9,
    amount: 11260,
    placedAt: "2026-07-29",
    expectedAt: "2026-07-30",
    status: "received",
  },
  {
    id: "po3",
    code: "PO-2294",
    supplier: "Wok Supply Co.",
    items: 3,
    amount: 6300,
    placedAt: "2026-07-27",
    expectedAt: "2026-08-01",
    status: "sent",
  },
  {
    id: "po4",
    code: "PO-2291",
    supplier: "Freshcut Foods",
    items: 5,
    amount: 24800,
    placedAt: "2026-07-26",
    expectedAt: "2026-07-28",
    status: "received",
  },
  {
    id: "po5",
    code: "PO-2287",
    supplier: "Crust & Co.",
    items: 2,
    amount: 4800,
    placedAt: "2026-07-25",
    expectedAt: "2026-07-26",
    status: "received",
  },
  {
    id: "po6",
    code: "PO-2284",
    supplier: "Baba Budan Roasters",
    items: 2,
    amount: 23600,
    placedAt: "2026-07-24",
    expectedAt: "2026-07-30",
    status: "sent",
  },
  {
    id: "po7",
    code: "PO-2280",
    supplier: "Annapurna Mills",
    items: 7,
    amount: 31940,
    placedAt: "2026-07-22",
    expectedAt: "2026-07-25",
    status: "received",
  },
  {
    id: "po8",
    code: "PO-2277",
    supplier: "EcoPack India",
    items: 3,
    amount: 14700,
    placedAt: "2026-07-20",
    expectedAt: "2026-07-27",
    status: "cancelled",
  },
  {
    id: "po9",
    code: "PO-2301",
    supplier: "Cocoa Trail",
    items: 1,
    amount: 7600,
    placedAt: "2026-07-30",
    expectedAt: "2026-08-05",
    status: "draft",
  },
  {
    id: "po10",
    code: "PO-2275",
    supplier: "Sahyadri Dairy",
    items: 6,
    amount: 21150,
    placedAt: "2026-07-18",
    expectedAt: "2026-07-20",
    status: "received",
  },
];

/* ---------------------------- restock requests ---------------------------- */

export const restockRequests: RestockRequest[] = [
  {
    id: "rr1",
    item: "Arabica Coffee Beans",
    sku: "BEV-COF-003",
    qty: 15,
    unit: "kg",
    urgency: "high",
    requestedBy: "Neha Bhatt",
    requestedAt: "2026-07-30T04:40:00Z",
    status: "pending",
  },
  {
    id: "rr2",
    item: "Paneer Block",
    sku: "DRY-PNR-002",
    qty: 25,
    unit: "kg",
    urgency: "high",
    requestedBy: "Farhan Qureshi",
    requestedAt: "2026-07-30T05:50:00Z",
    status: "approved",
  },
  {
    id: "rr3",
    item: "Tomatoes",
    sku: "VEG-TOM-010",
    qty: 60,
    unit: "kg",
    urgency: "medium",
    requestedBy: "Imran Shaikh",
    requestedAt: "2026-07-30T06:10:00Z",
    status: "ordered",
  },
  {
    id: "rr4",
    item: "Mozzarella Cheese",
    sku: "DRY-CHZ-001",
    qty: 30,
    unit: "kg",
    urgency: "high",
    requestedBy: "Rahul Deshpande",
    requestedAt: "2026-07-30T06:25:00Z",
    status: "pending",
  },
  {
    id: "rr5",
    item: "Dark Chocolate 70%",
    sku: "BKY-CHO-021",
    qty: 12,
    unit: "kg",
    urgency: "low",
    requestedBy: "Anita Kulkarni",
    requestedAt: "2026-07-29T09:20:00Z",
    status: "pending",
  },
  {
    id: "rr6",
    item: "Burger Buns",
    sku: "BKY-BUN-006",
    qty: 400,
    unit: "pcs",
    urgency: "medium",
    requestedBy: "Rahul Deshpande",
    requestedAt: "2026-07-28T12:00:00Z",
    status: "approved",
  },
  {
    id: "rr7",
    item: "Schezwan Paste",
    sku: "SAU-SZC-017",
    qty: 10,
    unit: "kg",
    urgency: "low",
    requestedBy: "Farhan Qureshi",
    requestedAt: "2026-07-27T15:30:00Z",
    status: "rejected",
  },
  {
    id: "rr8",
    item: "Urad Dal",
    sku: "STP-DAL-012",
    qty: 40,
    unit: "kg",
    urgency: "medium",
    requestedBy: "Imran Shaikh",
    requestedAt: "2026-07-27T08:15:00Z",
    status: "ordered",
  },
];

/* --------------------------------- audit ---------------------------------- */

const auditSeeds: Array<[string, string, string, string, AuditLog["severity"]]> = [
  ["Priya Menon", "Admin", "Updated menu item price", "Campus Cheeseburger", "info"],
  ["Priya Menon", "Admin", "Disabled coupon", "FRESHER10", "warning"],
  ["System", "System", "Nightly inventory sync completed", "inventory", "info"],
  ["Rahul Deshpande", "Kitchen lead", "Marked order ready", "CO-8407", "info"],
  ["Priya Menon", "Admin", "Blocked customer account", "Ishaan Verma", "critical"],
  ["Neha Bhatt", "Barista", "Started shift", "Beverage station", "info"],
  ["Priya Menon", "Admin", "Created purchase order", "PO-2298", "info"],
  ["System", "System", "Failed payment webhook retry", "PAY-99312", "warning"],
  ["Anita Kulkarni", "Chef", "Marked item unavailable", "Four Cheese Pizza", "warning"],
  ["Priya Menon", "Admin", "Changed role permissions", "Kitchen lead", "critical"],
  ["Imran Shaikh", "Chef", "Logged stock waste", "Tomatoes 3 kg", "warning"],
  ["System", "System", "Daily revenue report generated", "report-2026-07-29", "info"],
  ["Farhan Qureshi", "Chef", "Reopened cancelled order", "CO-8388", "warning"],
  ["Priya Menon", "Admin", "Invited new staff member", "arvind@campus.edu", "info"],
];

export const auditLogs: AuditLog[] = auditSeeds.map((a, i) => ({
  id: `al${i + 1}`,
  actor: a[0],
  actorRole: a[1],
  action: a[2],
  entity: a[3],
  severity: a[4],
  ip: `10.24.${8 + (i % 5)}.${40 + i}`,
  at: new Date(Date.UTC(2026, 6, 30, 8, 0) - i * 5.1e6).toISOString(),
}));

/* -------------------------------- activity -------------------------------- */

const activitySeeds: Array<[string, string, ActivityEvent["kind"]]> = [
  ["Order CO-8412 placed", "Diya Sharma ordered 3 items worth ₹428 from Counter 2", "order"],
  ["Payment settled", "UPI settlement of ₹1,24,860 credited for 29 Jul", "payment"],
  ["Low stock alert", "Arabica Coffee Beans dropped to 7 kg (reorder at 12 kg)", "stock"],
  ["Menu updated", "Peri Peri Paneer Pizza price changed from ₹239 to ₹249", "menu"],
  ["New student registered", "Sara Fernandes joined from Architecture, 1st year", "user"],
  ["Kitchen milestone", "Beverage station cleared 120 orders before noon", "system"],
  ["Order CO-8407 completed", "Handed over at Counter 3 in 9 minutes", "order"],
  ["Coupon exhausted", "FRESHER10 reached 1,922 of 2,000 redemptions", "system"],
  ["Stock received", "PO-2296 from Green Valley Farms received in full", "stock"],
  ["Refund issued", "₹189 refunded to Kabir Singh for CO-8381", "payment"],
  ["Item unavailable", "Four Cheese Pizza marked out of stock by kitchen", "menu"],
  ["Shift change", "Evening shift signed in — 6 staff on the floor", "system"],
];

export const activityTimeline: ActivityEvent[] = activitySeeds.map((a, i) => ({
  id: `ac${i + 1}`,
  title: a[0],
  detail: a[1],
  kind: a[2],
  at: new Date(Date.UTC(2026, 6, 30, 9, 30) - i * 2.7e6).toISOString(),
}));

/* ----------------------------- roles & access ----------------------------- */

export const permissionGroups: Array<{ group: string; permissions: string[] }> = [
  {
    group: "Orders",
    permissions: ["orders.view", "orders.update", "orders.refund", "orders.cancel"],
  },
  { group: "Menu", permissions: ["menu.view", "menu.create", "menu.update", "menu.delete"] },
  { group: "Inventory", permissions: ["inventory.view", "inventory.adjust", "inventory.purchase"] },
  { group: "People", permissions: ["users.view", "users.manage", "staff.manage", "roles.manage"] },
  { group: "Insights", permissions: ["reports.view", "reports.export", "audit.view"] },
];

export const roles: RoleDefinition[] = [
  {
    id: "r1",
    name: "Super admin",
    description: "Unrestricted access to every workspace, billing and role assignment.",
    members: 2,
    permissions: permissionGroups.flatMap((g) => g.permissions),
  },
  {
    id: "r2",
    name: "Canteen manager",
    description: "Runs day-to-day operations, menu, inventory and staffing.",
    members: 3,
    permissions: [
      "orders.view",
      "orders.update",
      "orders.refund",
      "menu.view",
      "menu.create",
      "menu.update",
      "inventory.view",
      "inventory.adjust",
      "inventory.purchase",
      "staff.manage",
      "reports.view",
      "reports.export",
    ],
  },
  {
    id: "r3",
    name: "Kitchen lead",
    description: "Manages the preparation queue, stations and stock consumption.",
    members: 4,
    permissions: [
      "orders.view",
      "orders.update",
      "menu.view",
      "inventory.view",
      "inventory.adjust",
    ],
  },
  {
    id: "r4",
    name: "Counter staff",
    description: "Handles pickup handover and order status updates only.",
    members: 6,
    permissions: ["orders.view", "orders.update", "menu.view"],
  },
  {
    id: "r5",
    name: "Analyst",
    description: "Read-only access to dashboards, reports and audit history.",
    members: 2,
    permissions: [
      "orders.view",
      "menu.view",
      "inventory.view",
      "reports.view",
      "reports.export",
      "audit.view",
    ],
  },
];

/* ------------------------------ staff perf -------------------------------- */

export const staffPerformance: StaffPerformance[] = staff.map((s, i) => ({
  id: s.id,
  name: s.name,
  station: s.station,
  orders: s.ordersHandled,
  avgPrepMins: 7 + ((i * 3) % 9),
  onTimePct: 82 + ((i * 7) % 16),
  rating: Number((4.1 + ((i * 13) % 8) / 10).toFixed(1)),
  shiftHours: 6 + (i % 3),
}));

/* ------------------------------- analytics -------------------------------- */

export const monthlyRevenue = [
  { month: "Aug", revenue: 892000, orders: 5140, customers: 1180, cost: 512000 },
  { month: "Sep", revenue: 946000, orders: 5480, customers: 1265, cost: 538000 },
  { month: "Oct", revenue: 1024000, orders: 5920, customers: 1348, cost: 574000 },
  { month: "Nov", revenue: 988000, orders: 5690, customers: 1402, cost: 561000 },
  { month: "Dec", revenue: 742000, orders: 4180, customers: 1120, cost: 438000 },
  { month: "Jan", revenue: 1108000, orders: 6340, customers: 1520, cost: 612000 },
  { month: "Feb", revenue: 1162000, orders: 6610, customers: 1604, cost: 634000 },
  { month: "Mar", revenue: 1246000, orders: 7080, customers: 1712, cost: 668000 },
  { month: "Apr", revenue: 1198000, orders: 6840, customers: 1690, cost: 651000 },
  { month: "May", revenue: 864000, orders: 4920, customers: 1284, cost: 489000 },
  { month: "Jun", revenue: 1284000, orders: 7290, customers: 1836, cost: 682000 },
  { month: "Jul", revenue: 1402000, orders: 7940, customers: 2240, cost: 731000 },
];

export const yearlyRevenue = [
  { year: "2022", revenue: 7840000, orders: 48200, customers: 3120 },
  { year: "2023", revenue: 9210000, orders: 56400, customers: 3880 },
  { year: "2024", revenue: 10940000, orders: 64800, customers: 4610 },
  { year: "2025", revenue: 12480000, orders: 72300, customers: 5240 },
  { year: "2026", revenue: 8620000, orders: 51900, customers: 5980 },
];

export const paymentSplit = [
  { name: "UPI", value: 58 },
  { name: "Campus wallet", value: 24 },
  { name: "Card", value: 11 },
  { name: "Mess credit", value: 7 },
];

export const fulfilmentSplit = [
  { name: "Counter pickup", value: 71 },
  { name: "Hostel delivery", value: 29 },
];

export const kitchenPerformance = [
  { day: "Mon", avgPrep: 11.2, onTime: 94, delayed: 6, output: 214 },
  { day: "Tue", avgPrep: 10.4, onTime: 96, delayed: 4, output: 239 },
  { day: "Wed", avgPrep: 12.8, onTime: 89, delayed: 12, output: 288 },
  { day: "Thu", avgPrep: 11.6, onTime: 92, delayed: 9, output: 264 },
  { day: "Fri", avgPrep: 13.9, onTime: 85, delayed: 18, output: 341 },
  { day: "Sat", avgPrep: 9.8, onTime: 97, delayed: 3, output: 198 },
  { day: "Sun", avgPrep: 8.9, onTime: 98, delayed: 2, output: 112 },
];

export const inventoryTrend = [
  { week: "W1", value: 486000, waste: 12400, turnover: 3.1 },
  { week: "W2", value: 512000, waste: 9800, turnover: 3.4 },
  { week: "W3", value: 468000, waste: 14200, turnover: 3.8 },
  { week: "W4", value: 534000, waste: 8600, turnover: 3.2 },
  { week: "W5", value: 498000, waste: 11100, turnover: 3.6 },
  { week: "W6", value: 552000, waste: 7400, turnover: 4.0 },
];

export const cohortRetention = [
  { cohort: "1st Year", active: 612, returning: 71 },
  { cohort: "2nd Year", active: 548, returning: 78 },
  { cohort: "3rd Year", active: 502, returning: 82 },
  { cohort: "4th Year", active: 431, returning: 68 },
  { cohort: "Staff", active: 147, returning: 59 },
];

export const salesByCounter = [
  { counter: "Counter 1 · Grill", revenue: 384000, orders: 2140 },
  { counter: "Counter 2 · Tandoor", revenue: 296000, orders: 1580 },
  { counter: "Counter 3 · Wok", revenue: 341000, orders: 1890 },
  { counter: "Counter 4 · Beverages", revenue: 218000, orders: 2330 },
];

/* -------------------------------- reports --------------------------------- */

export interface ReportDefinition {
  id: string;
  name: string;
  category: "Revenue" | "Orders" | "Sales" | "Customers" | "Inventory" | "Kitchen" | "Staff";
  period: "Weekly" | "Monthly" | "Yearly";
  generatedAt: string;
  size: string;
  rows: number;
  owner: string;
}

const reportSeeds: Array<[string, ReportDefinition["category"], ReportDefinition["period"]]> = [
  ["Revenue summary", "Revenue", "Weekly"],
  ["Revenue summary", "Revenue", "Monthly"],
  ["Revenue & tax breakdown", "Revenue", "Yearly"],
  ["Order volume report", "Orders", "Weekly"],
  ["Order fulfilment report", "Orders", "Monthly"],
  ["Sales by category", "Sales", "Weekly"],
  ["Sales by counter", "Sales", "Monthly"],
  ["Top selling dishes", "Sales", "Yearly"],
  ["Customer acquisition", "Customers", "Monthly"],
  ["Customer retention cohort", "Customers", "Yearly"],
  ["Stock consumption", "Inventory", "Weekly"],
  ["Wastage and shrinkage", "Inventory", "Monthly"],
  ["Purchase spend", "Inventory", "Yearly"],
  ["Kitchen throughput", "Kitchen", "Weekly"],
  ["Prep time distribution", "Kitchen", "Monthly"],
  ["Staff productivity", "Staff", "Weekly"],
  ["Shift coverage", "Staff", "Monthly"],
];

export const reportLibrary: ReportDefinition[] = reportSeeds.map((r, i) => ({
  id: `rep${i + 1}`,
  name: r[0],
  category: r[1],
  period: r[2],
  generatedAt: new Date(Date.UTC(2026, 6, 30, 6, 0) - i * 8.4e6).toISOString(),
  size: `${(0.4 + ((i * 7) % 34) / 10).toFixed(1)} MB`,
  rows: 240 + i * 137,
  owner: i % 3 === 0 ? "Priya Menon" : i % 3 === 1 ? "Scheduled job" : "Arvind Kulkarni",
}));

/* ------------------------------ admin notices ----------------------------- */

export interface AdminNotice {
  id: string;
  title: string;
  body: string;
  at: string;
  channel: "email" | "push" | "in-app" | "sms";
  audience: string;
  status: "sent" | "scheduled" | "draft";
  opens: number;
}

export const adminNotices: AdminNotice[] = [
  {
    id: "an1",
    title: "Monsoon combo launch",
    body: "Announce the ₹99 chai + samosa combo to all hostel residents.",
    at: "2026-07-30T05:00:00Z",
    channel: "push",
    audience: "All students",
    status: "sent",
    opens: 1842,
  },
  {
    id: "an2",
    title: "Counter 3 closed for maintenance",
    body: "Wok counter will be shut between 3 PM and 5 PM today.",
    at: "2026-07-30T03:30:00Z",
    channel: "in-app",
    audience: "All students",
    status: "sent",
    opens: 2410,
  },
  {
    id: "an3",
    title: "Exam week extended hours",
    body: "Canteen open until 1 AM from 4 Aug through 12 Aug.",
    at: "2026-08-01T10:00:00Z",
    channel: "email",
    audience: "All students",
    status: "scheduled",
    opens: 0,
  },
  {
    id: "an4",
    title: "Low stock digest",
    body: "Daily 6 AM summary of items below reorder threshold.",
    at: "2026-07-30T00:30:00Z",
    channel: "email",
    audience: "Managers",
    status: "sent",
    opens: 12,
  },
  {
    id: "an5",
    title: "Shift roster published",
    body: "August roster is live — confirm your slots by 2 Aug.",
    at: "2026-07-29T12:00:00Z",
    channel: "sms",
    audience: "Kitchen staff",
    status: "sent",
    opens: 21,
  },
  {
    id: "an6",
    title: "Loyalty tier revamp",
    body: "Draft announcement for the new Gold tier benefits.",
    at: "2026-08-05T09:00:00Z",
    channel: "push",
    audience: "Gold members",
    status: "draft",
    opens: 0,
  },
];

/* -------------------------------- derived --------------------------------- */

export const lowStock = inventory.filter((i) => i.stock <= i.reorderAt);
export const inventoryValue = inventory.reduce((s, i) => s + i.stock * i.costPerUnit, 0);
export const activeMenuCount = menuItems.filter((m) => m.available).length;
export const liveOrders = orders.filter(
  (o) => o.status !== "completed" && o.status !== "cancelled",
);
export const totalCustomerSpend = customers.reduce((s, c) => s + c.spend, 0);
