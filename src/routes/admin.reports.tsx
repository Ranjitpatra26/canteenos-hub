import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarClock, FileBarChart, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { Pill, SectionCard, SegmentedControl } from "@/components/shared/panels";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shortDate, timeAgo } from "@/lib/format";
import {
  reportLibrary,
  monthlyRevenue,
  yearlyRevenue,
  salesByCounter,
  cohortRetention,
  type ReportDefinition,
} from "@/data/admin";
import { menuItems } from "@/data/menu";
import { customers, orders, staff } from "@/data/orders";
import { inventory } from "@/data/operations";
import { exportExcel, exportPdf, type ExportPayload, type ExportSection } from "@/lib/export";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports — CanteenOS" },
      {
        name: "description",
        content:
          "Generate, schedule and download revenue, sales, inventory and staff reports for the canteen.",
      },
      { property: "og:title", content: "Reports — CanteenOS" },
      {
        property: "og:description",
        content: "Scheduled and on-demand reporting for canteen operations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

/** Builds a real file from the selected report definition and saves it locally. */
async function downloadReport(report: ReportDefinition, kind: "PDF" | "Excel") {
  let sections: ExportSection[] = [];

  switch (report.category) {
    case "Revenue":
      sections = [
        {
          title: "Monthly Revenue Breakdown",
          columns: ["Month", "Revenue (INR)", "Orders", "Customers", "Food Cost (INR)"],
          rows: monthlyRevenue.map((r) => [
            r.month,
            r.revenue.toLocaleString("en-IN"),
            r.orders.toLocaleString("en-IN"),
            r.customers.toLocaleString("en-IN"),
            r.cost.toLocaleString("en-IN"),
          ]),
        },
        {
          title: "Yearly Performance",
          columns: ["Year", "Revenue (INR)", "Orders", "Customers"],
          rows: yearlyRevenue.map((r) => [
            r.year,
            r.revenue.toLocaleString("en-IN"),
            r.orders.toLocaleString("en-IN"),
            r.customers.toLocaleString("en-IN"),
          ]),
        },
      ];
      break;
    case "Sales":
      sections = [
        {
          title: "Top Selling Menu Items",
          columns: ["Item Name", "Category", "Price (INR)", "Popularity Score", "Rating"],
          rows: menuItems.map((m) => [
            m.name,
            m.categorySlug,
            m.price.toString(),
            m.popularity.toString(),
            m.rating.toString(),
          ]),
        },
        {
          title: "Sales by Counter",
          columns: ["Counter", "Revenue (INR)", "Total Orders"],
          rows: salesByCounter.map((s) => [
            s.counter,
            s.revenue.toLocaleString("en-IN"),
            s.orders.toLocaleString("en-IN"),
          ]),
        },
      ];
      break;
    case "Orders":
      sections = [
        {
          title: "Order Queue & Fulfilment History",
          columns: ["Order Code", "Customer", "Status", "Method", "Counter", "Total (INR)"],
          rows: orders.map((o) => [
            o.code,
            o.customerName,
            o.status,
            o.method,
            o.counter,
            o.total.toString(),
          ]),
        },
      ];
      break;
    case "Customers":
      sections = [
        {
          title: "Customer Directory & Cohorts",
          columns: ["Name", "Email", "Student ID", "Department", "Year", "Orders", "Spend (INR)"],
          rows: customers.map((c) => [
            c.name,
            c.email,
            c.studentId,
            c.department,
            c.year,
            c.orders.toString(),
            c.spend.toLocaleString("en-IN"),
          ]),
        },
        {
          title: "Cohort Retention",
          columns: ["Cohort", "Active Students", "Retention %"],
          rows: cohortRetention.map((c) => [c.cohort, c.active.toString(), `${c.returning}%`]),
        },
      ];
      break;
    case "Inventory":
      sections = [
        {
          title: "Inventory Stock & Valuation",
          columns: ["Item", "SKU", "Category", "Stock", "Unit", "Reorder Level", "Cost/Unit (INR)", "Supplier"],
          rows: inventory.map((i) => [
            i.name,
            i.sku,
            i.category,
            i.stock.toString(),
            i.unit,
            i.reorderAt.toString(),
            i.costPerUnit.toString(),
            i.supplier,
          ]),
        },
      ];
      break;
    case "Kitchen":
    case "Staff":
      sections = [
        {
          title: "Staff Performance & Roster",
          columns: ["Name", "Role", "Station", "Shift", "Orders Handled"],
          rows: staff.map((s) => [
            s.name,
            s.role,
            s.station,
            s.shift,
            s.ordersHandled.toString(),
          ]),
        },
      ];
      break;
    default:
      sections = [
        {
          title: report.name,
          columns: ["Property", "Value"],
          rows: Object.entries(report).map(([k, v]) => [k, String(v ?? "")]),
        },
      ];
  }

  const payload: ExportPayload = {
    title: report.name,
    generatedAt: new Date().toLocaleString(),
    sections,
  };
  try {
    if (kind === "PDF") await exportPdf(payload);
    else await exportExcel(payload);
    toast.success(`${report.name} downloaded (${payload.sections.reduce((acc, s) => acc + s.rows.length, 0)} records)`);
  } catch (e) {
    toast.error(`${kind} export failed`, {
      description: e instanceof Error ? e.message : "Please try again.",
    });
  }
}



import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Period = "All" | "Weekly" | "Monthly" | "Yearly";

function ReportsPage() {
  const [period, setPeriod] = useState<Period>("All");
  const [category, setCategory] = useState("all");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState("Custom Performance Report");
  const [customCategory, setCustomCategory] = useState("Revenue");
  const [customPeriod, setCustomPeriod] = useState("Monthly");
  const [includeRevenue, setIncludeRevenue] = useState(true);
  const [includeSales, setIncludeSales] = useState(true);
  const [includeCustomers, setIncludeCustomers] = useState(true);
  const [includeInventory, setIncludeInventory] = useState(false);
  const [includeStaff, setIncludeStaff] = useState(false);

  const handleGenerateCustom = async (kind: "PDF" | "Excel") => {
    const customSections: ExportSection[] = [];

    if (includeRevenue) {
      customSections.push({
        title: "Revenue & Financial Breakdown",
        columns: ["Month", "Revenue (INR)", "Orders", "Customers", "Food Cost (INR)"],
        rows: monthlyRevenue.map((r) => [
          r.month,
          r.revenue.toLocaleString("en-IN"),
          r.orders.toLocaleString("en-IN"),
          r.customers.toLocaleString("en-IN"),
          r.cost.toLocaleString("en-IN"),
        ]),
      });
    }

    if (includeSales) {
      customSections.push({
        title: "Top Menu Items & Counter Performance",
        columns: ["Item Name", "Category", "Price (INR)", "Popularity", "Rating"],
        rows: menuItems.map((m) => [
          m.name,
          m.categorySlug,
          m.price.toString(),
          m.popularity.toString(),
          m.rating.toString(),
        ]),
      });
    }

    if (includeCustomers) {
      customSections.push({
        title: "Student Customer Directory",
        columns: ["Name", "Email", "Student ID", "Department", "Orders", "Spend (INR)"],
        rows: customers.map((c) => [
          c.name,
          c.email,
          c.studentId,
          c.department,
          c.orders.toString(),
          c.spend.toLocaleString("en-IN"),
        ]),
      });
    }

    if (includeInventory) {
      customSections.push({
        title: "Inventory Stock Valuation",
        columns: ["Item", "SKU", "Category", "Stock", "Unit", "Supplier"],
        rows: inventory.map((i) => [
          i.name,
          i.sku,
          i.category,
          i.stock.toString(),
          i.unit,
          i.supplier,
        ]),
      });
    }

    if (includeStaff) {
      customSections.push({
        title: "Staff Performance & Roster",
        columns: ["Name", "Role", "Station", "Shift", "Orders Handled"],
        rows: staff.map((s) => [
          s.name,
          s.role,
          s.station,
          s.shift,
          s.ordersHandled.toString(),
        ]),
      });
    }

    if (!customSections.length) {
      toast.error("Please select at least one data section to include.");
      return;
    }

    const payload: ExportPayload = {
      title: customTitle || "Custom Report",
      generatedAt: new Date().toLocaleString(),
      sections: customSections,
    };

    try {
      if (kind === "PDF") await exportPdf(payload);
      else await exportExcel(payload);
      setBuilderOpen(false);
      toast.success(`${customTitle} generated successfully!`);
    } catch (e) {
      toast.error("Custom export failed", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    }
  };

  const rows = reportLibrary.filter(
    (r) =>
      (period === "All" || r.period.toLowerCase() === period.toLowerCase()) &&
      (category === "all" || r.category.toLowerCase() === category.toLowerCase()),
  );

  const columns: Column<ReportDefinition>[] = [
    {
      key: "name",
      header: "Report",
      sortable: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
            <FileBarChart className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{r.name}</span>
            <span className="block text-xs text-muted-foreground">
              {r.rows.toLocaleString("en-IN")} rows · {r.size}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: "cat",
      header: "Category",
      sortable: true,
      sortValue: (r) => r.category,
      cell: (r) => <Pill tone="primary">{r.category}</Pill>,
    },
    { key: "period", header: "Period", cell: (r) => <Pill>{r.period}</Pill> },
    {
      key: "owner",
      header: "Owner",
      cell: (r) => <span className="text-sm text-muted-foreground">{r.owner}</span>,
    },
    {
      key: "gen",
      header: "Generated",
      sortable: true,
      sortValue: (r) => r.generatedAt,
      cell: (r) => (
        <span className="block">
          <span className="block text-sm">{shortDate(r.generatedAt)}</span>
          <span className="block text-xs text-muted-foreground">{timeAgo(r.generatedAt)}</span>
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
            size="sm"
            variant="ghost"
            className="rounded-lg"
            aria-label="Download PDF"
            onClick={() => void downloadReport(r, "PDF")}
          >
            <FileText className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="rounded-lg"
            aria-label="Download Excel"
            onClick={() => void downloadReport(r, "Excel")}
          >
            <FileSpreadsheet className="size-4" />
          </Button>
        </span>
      ),

    },
  ];

  const schedules = [
    {
      id: "sc1",
      name: "Daily revenue digest",
      cadence: "Every day at 6:00 AM",
      to: "managers@campus.edu",
    },
    {
      id: "sc2",
      name: "Weekly inventory consumption",
      cadence: "Mondays at 7:30 AM",
      to: "stores@campus.edu",
    },
    { id: "sc3", name: "Monthly P&L pack", cadence: "1st of each month", to: "finance@campus.edu" },
    {
      id: "sc4",
      name: "Kitchen throughput review",
      cadence: "Fridays at 8:00 PM",
      to: "kitchen-leads@campus.edu",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Reports"
        description="Everything finance and operations need, on demand or on a schedule."
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Reports" }]}
        actions={
          <Button className="rounded-xl" onClick={() => setBuilderOpen(true)}>
            <FileBarChart className="size-4" /> Build report
          </Button>
        }
      />

      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Custom Report Builder</DialogTitle>
            <DialogDescription>
              Select metrics, categories, and date ranges to generate custom PDF or Excel reports.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rep-title">Report Title</Label>
              <Input
                id="rep-title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Q3 Campus Sales & Staffing Summary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Primary Category</Label>
                <Select value={customCategory} onValueChange={setCustomCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Revenue">Revenue</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Orders">Orders</SelectItem>
                    <SelectItem value="Customers">Customers</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Time Period</Label>
                <Select value={customPeriod} onValueChange={setCustomPeriod}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Label>Data Sections to Include</Label>
              <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-border p-3 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeRevenue}
                    onCheckedChange={(c) => setIncludeRevenue(Boolean(c))}
                  />
                  <span>Revenue & Tax</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeSales}
                    onCheckedChange={(c) => setIncludeSales(Boolean(c))}
                  />
                  <span>Sales & Menu</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeCustomers}
                    onCheckedChange={(c) => setIncludeCustomers(Boolean(c))}
                  />
                  <span>Customers</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeInventory}
                    onCheckedChange={(c) => setIncludeInventory(Boolean(c))}
                  />
                  <span>Inventory</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={includeStaff}
                    onCheckedChange={(c) => setIncludeStaff(Boolean(c))}
                  />
                  <span>Staff & Shifts</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-wrap gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setBuilderOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => void handleGenerateCustom("Excel")}>
              <FileSpreadsheet className="size-4" /> Download Excel
            </Button>
            <Button onClick={() => void handleGenerateCustom("PDF")}>
              <FileText className="size-4" /> Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reports available" value={String(reportLibrary.length)} index={0} />
        <StatCard
          label="Scheduled jobs"
          value={String(schedules.length)}
          icon={<CalendarClock className="size-4" />}
          index={1}
        />
        <StatCard label="Generated this week" value="26" delta={{ value: "+4" }} index={2} />
        <StatCard label="Exports downloaded" value="184" delta={{ value: "+22%" }} index={3} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={period}
          onChange={setPeriod}
          options={[
            { value: "All", label: "All" },
            { value: "Weekly", label: "Weekly" },
            { value: "Monthly", label: "Monthly" },
            { value: "Yearly", label: "Yearly" },
          ]}
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[170px] rounded-xl">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Array.from(new Set(reportLibrary.map((r) => r.category))).map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <DataTable
          rows={rows}
          columns={columns}
          pageSize={9}
          searchKeys={(r) => `${r.name} ${r.category} ${r.owner} ${r.period} ${r.id}`}
          searchPlaceholder="Search reports…"
          emptyTitle="No reports match"
        />

        <SectionCard title="Scheduled deliveries" description="Automated email exports" index={1}>
          <ul className="space-y-3">
            {schedules.map((s) => (
              <li key={s.id} className="rounded-xl border border-border/70 p-3">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.cadence}</p>
                <p className="mt-2 truncate font-mono text-xs text-muted-foreground">{s.to}</p>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="mt-4 w-full rounded-xl"
            onClick={() => toast.success("New schedule created")}
          >
            Add schedule
          </Button>
        </SectionCard>
      </div>
    </div>
  );
}
