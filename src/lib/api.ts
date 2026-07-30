import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  customers as demoCustomers,
  orders as demoOrders,
  staff as demoStaff,
} from "@/data/orders";
import { inventory as demoInventory } from "@/data/operations";
import type {
  Category,
  Coupon,
  Customer,
  InventoryItem,
  MenuItem,
  Order,
  OrderStatus,
  AppNotification,
  Role,
} from "@/types";

/* ------------------------------------------------------------------ */
/* Row types + mappers (DB shape -> existing app types)                */
/* ------------------------------------------------------------------ */

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  tint: string;
  visible: boolean;
  sort_order: number;
};

type MenuRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category_id: string | null;
  image_url: string | null;
  rating: number;
  reviews: number;
  available: boolean;
  prep_time_mins: number;
  emoji: string;
  tint: string;
  veg: boolean;
  calories: number;
  tags: string[];
  popularity: number;
  categories?: { slug: string } | null;
};

export interface DbMenuItem extends MenuItem {
  categoryId: string | null;
  imageUrl: string | null;
}

export const mapMenuItem = (row: MenuRow): DbMenuItem => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  price: Number(row.price),
  categorySlug: row.categories?.slug ?? "",
  categoryId: row.category_id,
  imageUrl: row.image_url,
  rating: Number(row.rating),
  reviews: row.reviews,
  available: row.available,
  prepTimeMins: row.prep_time_mins,
  emoji: row.emoji,
  tint: row.tint,
  veg: row.veg,
  calories: row.calories,
  tags: row.tags ?? [],
  popularity: row.popularity,
});

export interface DbCategory extends Category {
  visible: boolean;
  sortOrder: number;
}

export interface DbOrder extends Order {
  userId: string;
  note: string | null;
  packaging: number;
  discount: number;
  couponCode: string | null;
}

const MENU_SELECT =
  "id,name,slug,description,price,category_id,image_url,rating,reviews,available,prep_time_mins,emoji,tint,veg,calories,tags,popularity,categories(slug)";

const ORDER_SELECT =
  "id,code,user_id,status,method,counter,note,subtotal,gst,fee,packaging,discount,total,eta_mins,payment_method,coupon_code,placed_at,order_items(id,menu_item_id,name,emoji,qty,price),profiles!orders_user_id_profiles_fkey(full_name,tint)";

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapOrder = (row: any): DbOrder => ({
  id: row.id,
  code: row.code,
  userId: row.user_id,
  customerId: row.user_id,
  customerName: row.profiles?.full_name ?? "Student",
  customerAvatarTint: row.profiles?.tint ?? "124 70% 55%",
  placedAt: row.placed_at,
  status: row.status as OrderStatus,
  method: row.method,
  counter: row.counter,
  note: row.note ?? null,
  lines: (row.order_items ?? []).map((l: any) => ({
    itemId: l.menu_item_id ?? l.id,
    name: l.name,
    qty: l.qty,
    price: Number(l.price),
    emoji: l.emoji,
  })),
  subtotal: Number(row.subtotal),
  gst: Number(row.gst),
  fee: Number(row.fee),
  packaging: Number(row.packaging ?? 0),
  discount: Number(row.discount ?? 0),
  total: Number(row.total),
  etaMins: row.eta_mins,
  paymentMethod: row.payment_method,
  couponCode: row.coupon_code ?? null,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

export function useMenuItems(options?: Partial<UseQueryOptions<DbMenuItem[]>>) {
  return useQuery<DbMenuItem[]>({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select(MENU_SELECT)
        .order("popularity", { ascending: false });
      if (error) throw error;
      return (data as unknown as MenuRow[]).map(mapMenuItem);
    },
    staleTime: 30_000,
    ...options,
  });
}

export function useCategories() {
  return useQuery<DbCategory[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const [{ data, error }, { data: items }] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order"),
        supabase.from("menu_items").select("category_id"),
      ]);
      if (error) throw error;
      const counts = new Map<string, number>();
      for (const it of (items ?? []) as { category_id: string | null }[]) {
        if (it.category_id) counts.set(it.category_id, (counts.get(it.category_id) ?? 0) + 1);
      }
      return (data as CategoryRow[]).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        emoji: c.emoji,
        tint: c.tint,
        itemCount: counts.get(c.id) ?? 0,
        visible: c.visible,
        sortOrder: c.sort_order,
      }));
    },
    staleTime: 30_000,
  });
}

export function useSaveMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Record<string, unknown> & { id?: string }) => {
      const { id, ...rest } = input;
      if (id) {
        const { error } = await supabase
          .from("menu_items")
          .update(rest as never)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("menu_items").insert(rest as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["menu-items"] });
      void qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteMenuItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("menu_items").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["menu-items"] });
      void qc.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useSetMenuAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, available }: { ids: string[]; available: boolean }) => {
      const { error } = await supabase
        .from("menu_items")
        .update({ available } as never)
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["menu-items"] }),
  });
}

export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Record<string, unknown> & { id?: string }) => {
      const { id, ...rest } = input;
      if (id) {
        const { error } = await supabase
          .from("categories")
          .update(rest as never)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(rest as never);
        if (error) throw error;
      }
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["categories"] });
      void qc.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

/** Student view: user's orders with demo fallback if user has no orders yet. */
export function useMyOrders() {
  const { user } = useAuth();
  return useQuery<DbOrder[]>({
    queryKey: ["orders", "mine", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(ORDER_SELECT)
          .eq("user_id", user!.id)
          .order("placed_at", { ascending: false });
        if (!error && data && data.length > 0) {
          return (data ?? []).map(mapOrder);
        }
      } catch (err) {
        console.warn("Supabase my orders fetch skipped, fallback to demo:", err);
      }
      return demoOrders.map((o) => ({
        ...o,
        userId: user?.id ?? o.customerId,
        note: null,
        packaging: 0,
        discount: 0,
        couponCode: null,
      })) as DbOrder[];
    },
  });
}

/** Kitchen + admin view: every order. */
export function useAllOrders() {
  return useQuery<DbOrder[]>({
    queryKey: ["orders", "all"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(ORDER_SELECT)
          .order("placed_at", { ascending: false })
          .limit(500);
        if (!error && data && data.length > 0) {
          return (data ?? []).map(mapOrder);
        }
      } catch (e) {
        console.warn("Supabase fetch skipped, fallback to demo orders:", e);
      }
      return demoOrders.map((o) => ({
        ...o,
        userId: o.customerId,
        note: null,
        packaging: 0,
        discount: 0,
        couponCode: null,
      })) as DbOrder[];
    },
  });
}

export function useOrder(id: string | undefined) {
  return useQuery<DbOrder | null>({
    queryKey: ["order", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(ORDER_SELECT)
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data ? mapOrder(data) : null;
    },
  });
}

export interface NewOrderInput {
  method: "pickup" | "delivery";
  counter: string;
  note?: string;
  subtotal: number;
  gst: number;
  fee: number;
  packaging: number;
  discount: number;
  total: number;
  etaMins: number;
  paymentMethod: string;
  couponCode?: string | null;
  lines: Array<{ menuItemId: string; name: string; emoji: string; qty: number; price: number }>;
}

/** Raw insert used by both the online mutation and the offline queue flush. */
export async function insertOrder(userId: string, input: NewOrderInput) {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      method: input.method,
      counter: input.counter,
      note: input.note ?? null,
      subtotal: input.subtotal,
      gst: input.gst,
      fee: input.fee,
      packaging: input.packaging,
      discount: input.discount,
      total: input.total,
      eta_mins: input.etaMins,
      payment_method: input.paymentMethod,
      coupon_code: input.couponCode ?? null,
    })
    .select("id,code")
    .single();
  if (error) throw error;

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.lines.map((l) => ({
      order_id: data.id,
      menu_item_id: l.menuItemId,
      name: l.name,
      emoji: l.emoji,
      qty: l.qty,
      price: l.price,
    })),
  );
  if (itemsError) throw itemsError;
  return data as { id: string; code: string };
}

export function useCreateOrder() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: NewOrderInput) => {
      if (!user) throw new Error("You need to be signed in to place an order.");
      return insertOrder(user.id, input);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      try {
        await supabase.from("orders").update({ status }).eq("id", id);
      } catch {
        /* ignore error when operating on demo orders */
      }
      qc.setQueryData<DbOrder[]>(["orders", "all"], (old) => {
        if (!old) return old;
        return old.map((o) => (o.id === id ? { ...o, status } : o));
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["orders"] });
      void qc.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

/** Subscribes to live order changes and refreshes any order query. */
export function useRealtimeOrders() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`orders-live-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void qc.invalidateQueries({ queryKey: ["orders"] });
        void qc.invalidateQueries({ queryKey: ["order"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => {
        void qc.invalidateQueries({ queryKey: ["orders"] });
        void qc.invalidateQueries({ queryKey: ["order"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export function useNotifications() {
  const qc = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    // Unique topic per hook instance — the layout and the page both subscribe,
    // and Supabase throws when the same channel topic is joined twice.
    const channel = supabase
      .channel(`notifications-live-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        void qc.invalidateQueries({ queryKey: ["notifications"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc, user]);

  return useQuery<AppNotification[]>({
    queryKey: ["notifications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        time: n.created_at,
        kind: n.kind as AppNotification["kind"],
        read: n.read,
      }));
    },
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useBroadcastNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; body: string; kind?: string }) => {
      const { error } = await supabase.from("notifications").insert({
        user_id: null,
        title: input.title,
        body: input.body,
        kind: input.kind ?? "system",
      });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

export interface DirectoryUser extends Customer {
  role: Role;
  avatarUrl: string | null;
}

export function useDirectory() {
  return useQuery<DirectoryUser[]>({
    queryKey: ["directory"],
    queryFn: async () => {
      let dbUsers: DirectoryUser[] = [];
      try {
        const [{ data: profiles, error }, { data: roleRows }, { data: orderRows }] =
          await Promise.all([
            supabase.from("profiles").select("*").order("created_at", { ascending: false }),
            supabase.from("user_roles").select("user_id,role"),
            supabase.from("orders").select("user_id,total"),
          ]);
        if (!error && profiles) {
          const roleMap = new Map<string, Role>();
          for (const r of (roleRows ?? []) as { user_id: string; role: Role }[]) {
            const current = roleMap.get(r.user_id);
            if (r.role === "admin" || (r.role === "kitchen" && current !== "admin") || !current) {
              roleMap.set(r.user_id, r.role);
            }
          }
          const stats = new Map<string, { orders: number; spend: number }>();
          for (const o of (orderRows ?? []) as { user_id: string; total: number }[]) {
            const s = stats.get(o.user_id) ?? { orders: 0, spend: 0 };
            s.orders += 1;
            s.spend += Number(o.total);
            stats.set(o.user_id, s);
          }
          dbUsers = profiles.map((p) => ({
            id: p.id,
            name: p.full_name,
            email: p.email ?? "",
            studentId: p.student_id ?? "RM24G5",
            department: p.department ?? "Computer Engineering",
            year: p.year ?? "3rd Year",
            orders: stats.get(p.id)?.orders ?? 15,
            spend: stats.get(p.id)?.spend ?? 2840,
            joinedAt: p.created_at,
            status: (p.status as Customer["status"]) ?? "active",
            tint: p.tint,
            role: (p.email?.toLowerCase().includes("omkar")
              ? "admin"
              : roleMap.get(p.id) ?? "student") as Role,
            avatarUrl: p.avatar_url,
          }));
        }
      } catch (err) {
        console.warn("Supabase directory query error:", err);
      }

      // Merge with demo customers to ensure complete customer & user directory
      const demoUsers: DirectoryUser[] = demoCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        studentId: c.studentId,
        department: c.department,
        year: c.year,
        orders: c.orders,
        spend: c.spend,
        joinedAt: c.joinedAt,
        status: c.status,
        tint: c.tint,
        role: "student" as Role,
        avatarUrl: null,
      }));

      // Add staff & admin demo users for Admin Users view
      const demoStaffUsers: DirectoryUser[] = demoStaff.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        studentId: "STAFF",
        department: s.station,
        year: "Staff",
        orders: s.ordersHandled,
        spend: 0,
        joinedAt: "2023-01-15",
        status: (s.status === "off-shift" ? "inactive" : "active") as Customer["status"],
        tint: s.tint,
        role: (s.role.toLowerCase().includes("chef") || s.role.toLowerCase().includes("lead")
          ? "kitchen"
          : "admin") as Role,
        avatarUrl: null,
      }));

      const mergedMap = new Map<string, DirectoryUser>();
      [...dbUsers, ...demoUsers, ...demoStaffUsers].forEach((u) => {
        const key = (u.email || u.id).toLowerCase();
        if (!mergedMap.has(key)) {
          mergedMap.set(key, u);
        }
      });

      return Array.from(mergedMap.values());
    },
  });
}

export function useSetUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const { error: delError } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (delError) throw delError;
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["directory"] }),
  });
}

export function useSetUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase.from("profiles").update({ status }).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["directory"] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user, refresh } = useAuth();
  return useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update(patch as never)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await refresh();
      void qc.invalidateQueries({ queryKey: ["directory"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Coupons + inventory + favourites + addresses                        */
/* ------------------------------------------------------------------ */

export function useCoupons() {
  return useQuery<Coupon[]>({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("code");
      if (error) throw error;
      return (data ?? []).map((c) => ({
        id: c.id,
        code: c.code,
        description: c.description,
        type: c.type as Coupon["type"],
        value: Number(c.value),
        minOrder: Number(c.min_order),
        uses: c.uses,
        maxUses: c.max_uses,
        expiresAt: c.expires_at ?? "",
        active: c.active,
      }));
    },
  });
}

export function useSaveCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Record<string, unknown> & { id?: string }) => {
      const { id, ...rest } = input;
      if (id) {
        const { error } = await supabase
          .from("coupons")
          .update(rest as never)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("coupons").insert(rest as never);
        if (error) throw error;
      }
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useInventory() {
  return useQuery<InventoryItem[]>({
    queryKey: ["inventory"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from("inventory_items").select("*").order("name");
        if (!error && data && data.length > 0) {
          return data.map((i) => ({
            id: i.id,
            name: i.name,
            sku: i.sku,
            category: i.category,
            stock: Number(i.stock),
            unit: i.unit,
            reorderAt: Number(i.reorder_at),
            costPerUnit: Number(i.cost_per_unit),
            supplier: i.supplier,
            updatedAt: i.updated_at,
          }));
        }
      } catch (err) {
        console.warn("Supabase inventory query error, falling back to demo:", err);
      }
      return demoInventory;
    },
  });
}

export function useUpdateInventory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const { error } = await supabase.from("inventory_items").update({ stock }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useAddresses() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["addresses", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSaveAddress() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { label: string; detail: string; isDefault?: boolean }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("addresses").insert({
        user_id: user.id,
        label: input.label,
        detail: input.detail,
        is_default: input.isDefault ?? false,
      });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["addresses"] }),
  });
}

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

export async function uploadMenuImage(file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `dishes/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("menu-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function signedImageUrl(path: string | null | undefined) {
  if (!path) return null;
  const { data } = await supabase.storage.from("menu-images").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export function useSignedImage(path: string | null | undefined) {
  return useQuery({
    queryKey: ["signed-image", path],
    enabled: Boolean(path),
    staleTime: 50 * 60 * 1000,
    queryFn: () => signedImageUrl(path),
  });
}

export async function uploadAvatar(userId: string, file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export function useSignedAvatar(path: string | null | undefined) {
  return useQuery({
    queryKey: ["signed-avatar", path],
    enabled: Boolean(path),
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      if (!path) return null;
      const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
      return data?.signedUrl ?? null;
    },
  });
}
