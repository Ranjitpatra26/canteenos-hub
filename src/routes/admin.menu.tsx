import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Pill, ExportActions } from "@/components/shared/panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { inr } from "@/lib/format";
import {
  useCategories,
  useDeleteMenuItems,
  useMenuItems,
  useSaveMenuItem,
  useSetMenuAvailability,
  type DbMenuItem,
} from "@/lib/api";
import type { MenuItem } from "@/types";
import { foodImage } from "@/lib/food-images";

export const Route = createFileRoute("/admin/menu")({
  head: () => ({
    meta: [
      { title: "Menu management — CanteenOS" },
      {
        name: "description",
        content:
          "Create, edit, price and publish every dish on the campus canteen menu with bulk availability controls.",
      },
      { property: "og:title", content: "Menu management — CanteenOS" },
      { property: "og:description", content: "Full CRUD control over the canteen menu catalogue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuManagement,
});

const blank = (categorySlug: string): MenuItem => ({
  id: "",
  name: "",
  slug: "",
  description: "",
  price: 0,
  categorySlug,
  rating: 0,
  reviews: 0,
  available: true,
  prepTimeMins: 10,
  emoji: "🍽️",
  tint: "124 70% 55%",
  veg: true,
  calories: 0,
  tags: [],
  popularity: 0,
});

function MenuManagement() {
  const { data: items = [], isLoading } = useMenuItems();
  const { data: categories = [] } = useCategories();
  const saveMenuItem = useSaveMenuItem();
  const deleteMenuItems = useDeleteMenuItems();
  const setAvailability_ = useSetMenuAvailability();
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);

  const rows = useMemo(
    () =>
      items.filter(
        (i) =>
          (category === "all" || i.categorySlug === category) &&
          (availability === "all" || (availability === "live" ? i.available : !i.available)),
      ),
    [items, category, availability],
  );

  const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong");

  const toggle = (row: MenuItem) => {
    saveMenuItem.mutate(
      { id: row.id, available: !row.available },
      { onSuccess: () => toast.success("Availability updated"), onError: fail },
    );
  };

  const save = (item: MenuItem) => {
    const categoryId = categories.find((c) => c.slug === item.categorySlug)?.id ?? null;
    const payload = {
      name: item.name,
      slug: item.slug || item.name.toLowerCase().replace(/\s+/g, "-"),
      description: item.description,
      price: item.price,
      category_id: categoryId,
      available: item.available,
      prep_time_mins: item.prepTimeMins,
      emoji: item.emoji,
      tint: item.tint,
      veg: item.veg,
      calories: item.calories,
      tags: item.tags,
    };
    saveMenuItem.mutate(item.id ? { id: item.id, ...payload } : payload, {
      onSuccess: () => {
        toast.success(item.id ? "Dish updated" : "Dish added to menu");
        setEditing(null);
      },
      onError: fail,
    });
  };

  const remove = (item: MenuItem) => {
    deleteMenuItems.mutate([item.id], {
      onSuccess: () => {
        toast.success(`${item.name} removed`);
        setDeleting(null);
      },
      onError: fail,
    });
  };

  const columns: Column<MenuItem>[] = [
    {
      key: "name",
      header: "Dish",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="flex items-center gap-3">
          <img
            src={foodImage(r)}
            alt={r.name || "Dish"}
            loading="lazy"
            width={80}
            height={80}
            className="size-10 shrink-0 rounded-xl object-cover"
            style={{ backgroundColor: `hsl(${r.tint} / 0.16)` }}
          />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{r.name || "Untitled dish"}</span>
            <span className="block max-w-[280px] truncate text-xs text-muted-foreground">
              {r.description}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      sortValue: (r) => r.categorySlug,
      cell: (r) => (
        <Pill>{categories.find((c) => c.slug === r.categorySlug)?.name ?? r.categorySlug}</Pill>
      ),
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      sortable: true,
      sortValue: (r) => r.price,
      cell: (r) => <span className="font-medium">{inr(r.price)}</span>,
    },
    {
      key: "prep",
      header: "Prep",
      align: "right",
      sortable: true,
      sortValue: (r) => r.prepTimeMins,
      cell: (r) => `${r.prepTimeMins} min`,
    },
    {
      key: "diet",
      header: "Diet",
      cell: (r) => <Pill tone={r.veg ? "success" : "danger"}>{r.veg ? "Veg" : "Non-veg"}</Pill>,
    },
    {
      key: "available",
      header: "Live",
      cell: (r) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={r.available}
            onCheckedChange={() => toggle(r)}
            aria-label="Toggle availability"
          />
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      cell: (r) => (
        <span className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setEditing(r)}
            aria-label="Edit dish"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive"
            onClick={() => setDeleting(r)}
            aria-label="Delete dish"
          >
            <Trash2 className="size-4" />
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Menu management"
        description="Publish dishes, tune pricing and control availability in real time."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Menu" }]}
        actions={
          <>
            <ExportActions name="Menu catalogue" />
            <Button
              className="rounded-xl"
              onClick={() => setEditing(blank(categories[0]?.slug ?? ""))}
            >
              <Plus className="size-4" /> Add dish
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total dishes" value={String(items.length)} index={0} />
        <StatCard
          label="Live now"
          value={String(items.filter((i) => i.available).length)}
          delta={{ value: "+3" }}
          index={1}
        />
        <StatCard
          label="Out of stock"
          value={String(items.filter((i) => !i.available).length)}
          index={2}
        />
        <StatCard
          label="Avg. price"
          value={inr(
            items.length ? Math.round(items.reduce((s, i) => s + i.price, 0) / items.length) : 0,
          )}
          index={3}
        />
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        loading={isLoading}
        pageSize={10}
        selectable
        searchKeys={(r) => `${r.name} ${r.description} ${r.categorySlug} ${r.tags.join(" ")}`}
        searchPlaceholder="Search dishes, tags…"
        emptyTitle="No dishes found"
        emptyDescription="Try a different category or clear the search."
        toolbar={
          <>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[170px] rounded-xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.emoji} {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger className="w-[150px] rounded-xl">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="off">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
        bulkActions={(selected, clear) => (
          <>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                const ids = selected.map((s) => s.id);
                setAvailability_.mutate(
                  { ids, available: true },
                  {
                    onSuccess: () => {
                      toast.success(`${ids.length} dishes published`);
                      clear();
                    },
                    onError: fail,
                  },
                );
              }}
            >
              Mark available
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg"
              onClick={() => {
                const ids = selected.map((s) => s.id);
                setAvailability_.mutate(
                  { ids, available: false },
                  {
                    onSuccess: () => {
                      toast.success(`${ids.length} dishes hidden`);
                      clear();
                    },
                    onError: fail,
                  },
                );
              }}
            >
              Mark unavailable
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="rounded-lg"
              onClick={() => {
                const ids = selected.map((s) => s.id);
                deleteMenuItems.mutate(ids, {
                  onSuccess: () => {
                    toast.success(`${ids.length} dishes deleted`);
                    clear();
                  },
                  onError: fail,
                });
              }}
            >
              Delete
            </Button>
          </>
        )}
      />

      <MenuDialog
        item={editing}
        onClose={() => setEditing(null)}
        onSave={save}
        categories={categories}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the dish from the student menu immediately. Past orders keep their
              history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={() => deleting && remove(deleting)}>
              Delete dish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MenuDialog({
  item,
  onClose,
  onSave,
  categories,
}: {
  item: MenuItem | null;
  onClose: () => void;
  onSave: (i: MenuItem) => void;
  categories: { slug: string; name: string; emoji: string }[];
}) {
  const [draft, setDraft] = useState<MenuItem | null>(item);
  if (item && draft?.id !== item.id) setDraft(item);

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item?.name ? "Edit dish" : "Add a new dish"}</DialogTitle>
          <DialogDescription>
            Changes go live on the student menu as soon as you save.
          </DialogDescription>
        </DialogHeader>

        {draft ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => toast.info("Image upload connects once storage is enabled")}
              className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:col-span-2"
            >
              <ImagePlus className="size-6" />
              <span className="text-xs font-medium">Upload dish photo · PNG or JPG up to 5 MB</span>
            </button>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="dish-name">Dish name</Label>
              <Input
                id="dish-name"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Paneer Tikka Sub"
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="dish-desc">Description</Label>
              <Textarea
                id="dish-desc"
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder="Char-grilled paneer, peppers and mint mayo in a herbed sub roll."
                className="min-h-24 rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dish-price">Price (₹)</Label>
              <Input
                id="dish-price"
                type="number"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dish-prep">Prep time (min)</Label>
              <Input
                id="dish-prep"
                type="number"
                value={draft.prepTimeMins}
                onChange={(e) => setDraft({ ...draft, prepTimeMins: Number(e.target.value) })}
                className="rounded-xl"
              />
            </div>

            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={draft.categorySlug}
                onValueChange={(v) => setDraft({ ...draft, categorySlug: v })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.emoji} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dish-cal">Calories</Label>
              <Input
                id="dish-cal"
                type="number"
                value={draft.calories}
                onChange={(e) => setDraft({ ...draft, calories: Number(e.target.value) })}
                className="rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <Label htmlFor="dish-veg" className="text-sm">
                Vegetarian
              </Label>
              <Switch
                id="dish-veg"
                checked={draft.veg}
                onCheckedChange={(v) => setDraft({ ...draft, veg: v })}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <Label htmlFor="dish-live" className="text-sm">
                Available now
              </Label>
              <Switch
                id="dish-live"
                checked={draft.available}
                onCheckedChange={(v) => setDraft({ ...draft, available: v })}
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-xl"
            disabled={!draft?.name}
            onClick={() => draft && onSave(draft)}
          >
            Save dish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
