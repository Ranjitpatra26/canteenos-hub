import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, TableSkeleton } from "@/components/shared/states";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right";
  className?: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchKeys,
  searchPlaceholder = "Search…",
  pageSize = 8,
  toolbar,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Adjust your filters or search to see more results.",
  onRowClick,
  selectable = false,
  bulkActions,
  loading = false,
}: {
  rows: T[];
  columns: Column<T>[];
  searchKeys?: (row: T) => string;
  searchPlaceholder?: string;
  pageSize?: number;
  toolbar?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  bulkActions?: (selected: T[], clear: () => void) => ReactNode;
  loading?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected((prev) => prev.filter((id) => rows.some((r) => r.id === id)));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows;
    if (q && searchKeys) out = out.filter((r) => searchKeys(r).toLowerCase().includes(q));
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sortValue) {
        out = [...out].sort((a, b) => {
          const av = col.sortValue!(a);
          const bv = col.sortValue!(b);
          const cmp =
            typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv));
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return out;
  }, [rows, query, sort, columns, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * pageSize, current * pageSize);
  const selectedRows = rows.filter((r) => selected.includes(r.id));
  const allOnPage = paged.length > 0 && paged.every((r) => selected.includes(r.id));

  const toggleSort = (key: string) =>
    setSort((prev) =>
      prev?.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );

  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const togglePage = () =>
    setSelected((prev) =>
      allOnPage
        ? prev.filter((id) => !paged.some((r) => r.id === id))
        : [...new Set([...prev, ...paged.map((r) => r.id)])],
    );

  return (
    <div className="overflow-hidden surface-card">
      <div className="grid gap-3 border-b border-border/70 px-4 py-3.5 sm:flex sm:items-center sm:justify-between">
        {searchKeys ? (
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="rounded-xl pl-9"
            />
          </div>
        ) : (
          <span />
        )}
        {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
      </div>

      <AnimatePresence initial={false}>
        {selectable && selectedRows.length > 0 ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-border bg-primary/8"
          >
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
              <span className="font-medium">{selectedRows.length} selected</span>
              <div className="flex flex-wrap items-center gap-2">
                {bulkActions?.(selectedRows, () => setSelected([]))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto rounded-lg"
                onClick={() => setSelected([])}
              >
                Clear
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {loading ? (
        <div className="p-4">
          <TableSkeleton rows={Math.min(pageSize, 6)} />
        </div>
      ) : paged.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            className="border-none bg-transparent"
          />
        </div>
      ) : (
        <>
          {/* Phones get a stacked card list — tables never scroll off-screen. */}
          <ul className="divide-y divide-border/60 md:hidden">
            {paged.map((row) => (
              <li
                key={row.id}
                onClick={() => onRowClick?.(row)}
                data-selected={selected.includes(row.id) || undefined}
                className={cn(
                  "space-y-2 p-4 transition-colors data-[selected]:bg-primary/6",
                  onRowClick && "cursor-pointer active:bg-secondary/60",
                )}
              >
                {selectable ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.includes(row.id)}
                      onCheckedChange={() => toggleRow(row.id)}
                      aria-label="Select row"
                    />
                  </div>
                ) : null}
                {columns.map((c, i) => (
                  <div
                    key={c.key}
                    className={cn(
                      "grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-center gap-3",
                      i === 0 && "text-base font-semibold",
                    )}
                  >
                    <span className="label-micro shrink-0">{c.header}</span>
                    <span className="min-w-0 truncate text-right text-sm">{c.cell(row)}</span>
                  </div>
                ))}
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {selectable ? (
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allOnPage}
                        onCheckedChange={togglePage}
                        aria-label="Select all rows on this page"
                      />
                    </TableHead>
                  ) : null}
                  {columns.map((c) => (
                    <TableHead
                      key={c.key}
                      className={cn(c.align === "right" && "text-right", c.className)}
                    >
                      {c.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(c.key)}
                          className={cn(
                            "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                            c.align === "right" && "flex-row-reverse",
                          )}
                        >
                          {c.header}
                          {sort?.key === c.key ? (
                            sort.dir === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )
                          ) : null}
                        </button>
                      ) : (
                        c.header
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => onRowClick?.(row)}
                    data-selected={selected.includes(row.id) || undefined}
                    className={cn(
                      "transition-colors data-[selected]:bg-primary/6",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {selectable ? (
                      <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selected.includes(row.id)}
                          onCheckedChange={() => toggleRow(row.id)}
                          aria-label="Select row"
                        />
                      </TableCell>
                    ) : null}
                    {columns.map((c) => (
                      <TableCell
                        key={c.key}
                        className={cn("py-3", c.align === "right" && "text-right", c.className)}
                      >
                        {c.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <div className="grid gap-3 border-t border-border/70 px-4 py-3.5 text-sm text-muted-foreground sm:flex sm:items-center sm:justify-between">
        <span>
          Showing {paged.length} of {filtered.length} records
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <span className="px-1 text-foreground">
            {current} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={current >= totalPages}
            onClick={() => setPage(current + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
