export type Role = "student" | "kitchen" | "admin";

export type OrderStatus = "placed" | "preparing" | "ready" | "completed" | "cancelled";

export type FulfilmentMethod = "pickup" | "delivery";

export interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  itemCount: number;
  tint: string;
}

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  categorySlug: string;
  rating: number;
  reviews: number;
  available: boolean;
  prepTimeMins: number;
  emoji: string;
  tint: string;
  veg: boolean;
  calories: number;
  tags: string[];
  popularity: number;
}

export interface CartLine {
  itemId: string;
  qty: number;
  note?: string;
}

export interface OrderLine {
  itemId: string;
  name: string;
  qty: number;
  price: number;
  emoji: string;
}

export interface Order {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  customerAvatarTint: string;
  placedAt: string;
  status: OrderStatus;
  method: FulfilmentMethod;
  counter: string;
  lines: OrderLine[];
  subtotal: number;
  gst: number;
  fee: number;
  total: number;
  etaMins: number;
  paymentMethod: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  year: string;
  orders: number;
  spend: number;
  joinedAt: string;
  status: "active" | "inactive" | "blocked";
  tint: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  shift: string;
  station: string;
  status: "on-shift" | "off-shift" | "break";
  ordersHandled: number;
  tint: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  unit: string;
  reorderAt: number;
  costPerUnit: number;
  supplier: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  uses: number;
  maxUses: number;
  expiresAt: string;
  active: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: "order" | "system" | "offer" | "stock" | "announcement";
  read: boolean;
}
