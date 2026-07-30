import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Boxes, LayoutGrid, Receipt, Search, Tags, UserRound, UtensilsCrossed } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  useAllOrders,
  useCategories,
  useDirectory,
  useInventory,
  useMenuItems,
  useMyOrders,
} from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { inr } from "@/lib/format";
import { smartSearchMenu } from "@/lib/canteen-ai";

type Nav = { label: string; to: string; hint: string };

const STUDENT_PAGES: Nav[] = [
  { label: "Overview", to: "/app", hint: "Student dashboard" },
  { label: "Browse menu", to: "/app/menu", hint: "Food" },
  { label: "Cart", to: "/app/cart", hint: "Checkout" },
  { label: "Favorites", to: "/app/favorites", hint: "Saved dishes" },
  { label: "My orders", to: "/app/orders", hint: "History" },
  { label: "Canteen AI", to: "/app/ai", hint: "Assistant" },
  { label: "Profile", to: "/app/profile", hint: "Account" },
  { label: "Settings", to: "/app/settings", hint: "Preferences" },
];

const ADMIN_PAGES: Nav[] = [
  { label: "Admin overview", to: "/admin", hint: "Dashboard" },
  { label: "Analytics", to: "/admin/analytics", hint: "Reports" },
  { label: "Menu management", to: "/admin/menu", hint: "Catalogue" },
  { label: "Categories", to: "/admin/categories", hint: "Catalogue" },
  { label: "Inventory", to: "/admin/inventory", hint: "Stock" },
  { label: "Staff", to: "/admin/staff", hint: "People" },
  { label: "Customers", to: "/admin/customers", hint: "People" },
  { label: "Users & roles", to: "/admin/users", hint: "Access" },
  { label: "Coupons", to: "/admin/coupons", hint: "Marketing" },
  { label: "Audit log", to: "/admin/audit", hint: "Security" },
];

function AdminResults({ query, go }: { query: string; go: (to: string) => void }) {
  const { data: orders = [] } = useAllOrders();
  const { data: directory = [] } = useDirectory();
  const { data: inventory = [] } = useInventory();
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const matchedOrders = orders
    .filter((o) => o.code.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q))
    .slice(0, 5);
  const people = directory
    .filter((u) => u.name.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q))
    .slice(0, 5);
  const stock = inventory
    .filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
    .slice(0, 5);

  return (
    <>
      {matchedOrders.length ? (
        <CommandGroup heading="Orders">
          {matchedOrders.map((o) => (
            <CommandItem
              key={o.id}
              value={`order-${o.code}-${o.customerName}`}
              onSelect={() => go("/admin")}
            >
              <Receipt className="size-4" />
              <span className="flex-1 truncate">
                {o.code} · {o.customerName}
              </span>
              <span className="text-xs text-muted-foreground">{inr(o.total)}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      ) : null}

      {people.length ? (
        <CommandGroup heading="People">
          {people.map((u) => (
            <CommandItem
              key={u.id}
              value={`user-${u.name}-${u.email}`}
              onSelect={() => go("/admin/users")}
            >
              <UserRound className="size-4" />
              <span className="flex-1 truncate">{u.name}</span>
              <span className="truncate text-xs text-muted-foreground">{u.email}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      ) : null}

      {stock.length ? (
        <CommandGroup heading="Inventory">
          {stock.map((i) => (
            <CommandItem
              key={i.id}
              value={`stock-${i.name}-${i.sku}`}
              onSelect={() => go("/admin/inventory")}
            >
              <Boxes className="size-4" />
              <span className="flex-1 truncate">{i.name}</span>
              <span className="text-xs text-muted-foreground">
                {i.stock} {i.unit}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      ) : null}
    </>
  );
}

function SearchBody({ onDone }: { onDone: () => void }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { role } = useAuth();
  const { data: items = [] } = useMenuItems();
  const { data: categories = [] } = useCategories();
  const { data: myOrders = [] } = useMyOrders();

  const go = (to: string) => {
    onDone();
    void navigate({ to });
  };

  const pages = role === "admin" ? [...ADMIN_PAGES, ...STUDENT_PAGES] : STUDENT_PAGES;
  const foods = useMemo(() => smartSearchMenu(query, items, 6), [query, items]);
  const q = query.trim().toLowerCase();
  const cats = q ? categories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4) : [];
  const orders = q
    ? myOrders.filter((o) => o.code.toLowerCase().includes(q) || o.status.includes(q)).slice(0, 4)
    : [];

  return (
    <>
      <CommandInput
        placeholder="Search food, orders, people, inventory…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>No matches. Try a dish, order code or person.</CommandEmpty>

        {foods.length ? (
          <CommandGroup heading="Food">
            {foods.map((item) => (
              <CommandItem
                key={item.id}
                value={`food-${item.name}-${item.tags.join(" ")}`}
                onSelect={() => go(`/app/menu/${item.id}`)}
              >
                <span className="text-base leading-none">{item.emoji}</span>
                <span className="flex-1 truncate">{item.name}</span>
                <span className="text-xs text-muted-foreground">{inr(item.price)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {cats.length ? (
          <CommandGroup heading="Categories">
            {cats.map((c) => (
              <CommandItem key={c.id} value={`cat-${c.name}`} onSelect={() => go("/app/menu")}>
                <Tags className="size-4" />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.itemCount} items</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {orders.length ? (
          <CommandGroup heading="Your orders">
            {orders.map((o) => (
              <CommandItem
                key={o.id}
                value={`myorder-${o.code}`}
                onSelect={() => go(`/app/orders/${o.id}`)}
              >
                <Receipt className="size-4" />
                <span className="flex-1 truncate">{o.code}</span>
                <span className="text-xs capitalize text-muted-foreground">{o.status}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {role === "admin" ? <AdminResults query={query} go={go} /> : null}

        <CommandSeparator />
        <CommandGroup heading="Go to">
          {pages.map((p) => (
            <CommandItem key={p.to} value={`page-${p.label}-${p.hint}`} onSelect={() => go(p.to)}>
              {p.to.startsWith("/admin") ? (
                <LayoutGrid className="size-4" />
              ) : (
                <UtensilsCrossed className="size-4" />
              )}
              <span className="flex-1 truncate">{p.label}</span>
              <span className="text-xs text-muted-foreground">{p.hint}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </>
  );
}

export function useGlobalSearch() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}

export function GlobalSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Global search</DialogTitle>
      <DialogDescription className="sr-only">
        Search food, orders, customers, inventory, users and categories
      </DialogDescription>
      {open ? <SearchBody onDone={() => onOpenChange(false)} /> : null}
    </CommandDialog>
  );
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open global search"
      className="flex w-full items-center gap-2 rounded-xl border border-input bg-background/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Search className="size-4 shrink-0" />
      <span className="truncate">Search orders, dishes, people…</span>
      <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:block">
        ⌘K
      </kbd>
    </button>
  );
}
