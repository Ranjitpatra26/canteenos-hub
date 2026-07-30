import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCoupons, useMenuItems } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { DELIVERY_FEE, GST_RATE, PACKAGING_FEE } from "@/lib/format";
import type { CartLine, FulfilmentMethod, MenuItem } from "@/types";

const CART_KEY = "canteenos.cart";
const FAV_KEY = "canteenos.favorites";

export interface AppliedPromo {
  code: string;
  label: string;
  discount: number;
}

interface CartContextValue {
  lines: CartLine[];
  detailed: Array<{ item: MenuItem; qty: number }>;
  count: number;
  method: FulfilmentMethod;
  setMethod: (m: FulfilmentMethod) => void;
  promo: AppliedPromo | null;
  promoError: string | null;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
  add: (itemId: string, qty?: number) => void;
  remove: (itemId: string) => void;
  setQty: (itemId: string, qty: number) => void;
  clear: () => void;
  totals: {
    subtotal: number;
    gst: number;
    fee: number;
    packaging: number;
    discount: number;
    total: number;
  };
  favorites: string[];
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [method, setMethod] = useState<FulfilmentMethod>("pickup");
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const { user } = useAuth();
  const { data: menuItems = [] } = useMenuItems();
  const { data: coupons = [] } = useCoupons();

  useEffect(() => {
    setLines(readStorage<CartLine[]>(CART_KEY, []));
    setFavorites(readStorage<string[]>(FAV_KEY, []));
  }, []);

  /** Favourites live in the database for signed-in students. */
  useEffect(() => {
    let active = true;
    if (user) {
      void supabase
        .from("favorites")
        .select("menu_item_id")
        .eq("user_id", user.id)
        .then(({ data }) => {
          if (!active) return;
          if (data && data.length > 0) {
            setFavorites(data.map((f) => f.menu_item_id));
          } else if (menuItems.length > 0) {
            setFavorites(menuItems.slice(0, 4).map((m) => m.id));
          }
        });
    } else if (menuItems.length > 0 && favorites.length === 0) {
      setFavorites(menuItems.slice(0, 4).map((m) => m.id));
    }
    return () => {
      active = false;
    };
  }, [user, menuItems]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const add = useCallback((itemId: string, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.itemId === itemId);
      if (existing) {
        return prev.map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { itemId, qty }];
    });
  }, []);

  const remove = useCallback((itemId: string) => {
    setLines((prev) => prev.filter((l) => l.itemId !== itemId));
  }, []);

  const setQty = useCallback((itemId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.itemId !== itemId)
        : prev.map((l) => (l.itemId === itemId ? { ...l, qty } : l)),
    );
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setPromo(null);
  }, []);

  const detailed = useMemo(() => {
    const out: Array<{ item: MenuItem; qty: number }> = [];
    for (const l of lines) {
      const item = menuItems.find((m) => m.id === l.itemId);
      if (item) out.push({ item, qty: l.qty });
    }
    return out;
  }, [lines, menuItems]);

  const subtotal = useMemo(
    () => detailed.reduce((s, l) => s + l.item.price * l.qty, 0),
    [detailed],
  );

  const applyPromo = useCallback(
    (code: string) => {
      const key = code.trim().toUpperCase();
      const found = coupons.find((c) => c.code.toUpperCase() === key && c.active);
      if (!found) {
        setPromoError("That promo code isn't valid.");
        return false;
      }
      if (subtotal < found.minOrder) {
        setPromoError(`Minimum order of ₹${found.minOrder} required for ${key}.`);
        return false;
      }
      const discount =
        found.type === "percent" ? Math.round((subtotal * found.value) / 100) : found.value;
      setPromo({ code: key, label: found.description, discount });
      setPromoError(null);
      return true;
    },
    [subtotal, coupons],
  );

  const clearPromo = useCallback(() => {
    setPromo(null);
    setPromoError(null);
  }, []);

  const totals = useMemo(() => {
    const discount = promo?.discount ?? 0;
    const taxable = Math.max(0, subtotal - discount);
    const gst = Math.round(taxable * GST_RATE);
    const fee = method === "delivery" && subtotal > 0 ? DELIVERY_FEE : 0;
    const packaging = subtotal > 0 ? PACKAGING_FEE : 0;
    return { subtotal, gst, fee, packaging, discount, total: taxable + gst + fee + packaging };
  }, [subtotal, promo, method]);

  const toggleFavorite = useCallback(
    (itemId: string) => {
      setFavorites((prev) => {
        const has = prev.includes(itemId);
        if (user) {
          if (has) {
            void supabase
              .from("favorites")
              .delete()
              .eq("user_id", user.id)
              .eq("menu_item_id", itemId);
          } else {
            void supabase.from("favorites").insert({ user_id: user.id, menu_item_id: itemId });
          }
        }
        return has ? prev.filter((f) => f !== itemId) : [...prev, itemId];
      });
    },
    [user],
  );

  const value: CartContextValue = {
    lines,
    detailed,
    count: lines.reduce((s, l) => s + l.qty, 0),
    method,
    setMethod,
    promo,
    promoError,
    applyPromo,
    clearPromo,
    add,
    remove,
    setQty,
    clear,
    totals,
    favorites,
    toggleFavorite,
    isFavorite: (id: string) => favorites.includes(id),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
