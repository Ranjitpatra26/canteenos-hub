import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard, Pill } from "@/components/shared/panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategories, useDeleteCategory, useSaveCategory } from "@/lib/api";
import type { Category } from "@/types";
import { categoryImage } from "@/lib/food-images";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Category management — CanteenOS" },
      {
        name: "description",
        content: "Organise the canteen menu into categories, control display order and visibility.",
      },
      { property: "og:title", content: "Category management — CanteenOS" },
      { property: "og:description", content: "Organise and publish canteen menu categories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoryManagement,
});

interface Row extends Category {
  visible: boolean;
}

function CategoryManagement() {
  const { data: rows = [] } = useCategories();
  const saveCategory = useSaveCategory();
  const deleteCategory = useDeleteCategory();
  const [editing, setEditing] = useState<Row | null>(null);

  const fail = (e: unknown) => toast.error(e instanceof Error ? e.message : "Something went wrong");

  const save = (row: Row) => {
    const payload = {
      name: row.name,
      slug: row.slug || row.name.toLowerCase().replace(/\s+/g, "-"),
      emoji: row.emoji,
      tint: row.tint,
      visible: row.visible,
    };
    saveCategory.mutate(row.id ? { id: row.id, ...payload } : payload, {
      onSuccess: () => {
        toast.success("Category saved");
        setEditing(null);
      },
      onError: fail,
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Categories"
        description="Group dishes so students can browse the menu faster."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Categories" }]}
        actions={
          <Button
            className="rounded-xl"
            onClick={() =>
              setEditing({
                id: "",
                name: "",
                slug: "",
                emoji: "🍽️",
                itemCount: 0,
                tint: "124 70% 55%",
                visible: true,
              })
            }
          >
            <Plus className="size-4" /> New category
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((c, i) => (
          <motion.article
            key={c.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            whileHover={{ y: -4 }}
            className="group surface-card p-5"
          >
            <div className="flex items-start gap-3">
              <span
                className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl text-lg"
                style={{ backgroundColor: `hsl(${c.tint} / 0.16)` }}
              >
                <img
                  src={categoryImage(c.slug)}
                  alt={c.name || "Category"}
                  loading="lazy"
                  width={96}
                  height={96}
                  className="absolute inset-0 size-full object-cover"
                />
                <span className="relative rounded-full bg-background/70 px-1 backdrop-blur">
                  {c.emoji}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{c.name || "Untitled"}</h3>
                <p className="text-xs text-muted-foreground">/{c.slug || "slug"}</p>
              </div>
              <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Pill tone="primary">{c.itemCount} dishes</Pill>
              <Pill tone={c.visible ? "success" : "muted"}>{c.visible ? "Visible" : "Hidden"}</Pill>
            </div>

            <div className="mt-5 flex items-center justify-between gap-2">
              <Switch
                checked={c.visible}
                onCheckedChange={(v) =>
                  saveCategory.mutate(
                    { id: c.id, visible: v },
                    {
                      onSuccess: () => toast.success(`${c.name} ${v ? "shown" : "hidden"}`),
                      onError: fail,
                    },
                  )
                }
                aria-label="Toggle visibility"
              />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setEditing(c)}
                  aria-label="Edit category"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  aria-label="Delete category"
                  onClick={() =>
                    deleteCategory.mutate(c.id, {
                      onSuccess: () => toast.success(`${c.name} deleted`),
                      onError: fail,
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <SectionCard title="Ordering tips" className="mt-6" index={1}>
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>Drag a category card to change the order students see on the menu.</li>
          <li>Hidden categories keep their dishes but disappear from browse and search.</li>
          <li>Keep 8–12 categories for the fastest browsing experience on mobile.</li>
          <li>Emojis double as category icons across the student app.</li>
        </ul>
      </SectionCard>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.name ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>
              Categories drive the browse chips in the student menu.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cat-name">Name</Label>
                <Input
                  id="cat-name"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    })
                  }
                  placeholder="Healthy bowls"
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cat-emoji">Icon emoji</Label>
                <Input
                  id="cat-emoji"
                  value={editing.emoji}
                  onChange={(e) => setEditing({ ...editing, emoji: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                <Label htmlFor="cat-vis" className="text-sm">
                  Visible to students
                </Label>
                <Switch
                  id="cat-vis"
                  checked={editing.visible}
                  onCheckedChange={(v) => setEditing({ ...editing, visible: v })}
                />
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              disabled={!editing?.name}
              onClick={() => editing && save(editing)}
            >
              Save category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
