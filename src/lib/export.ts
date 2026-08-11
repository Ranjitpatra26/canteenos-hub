/**
 * Real, downloadable exports for admin screens.
 *
 * Everything is generated in the browser from whatever the current page has
 * rendered — tables, stat cards and metric rows — so PDF/Excel always match
 * what the user is looking at. No email, no server round-trip.
 */

export interface ExportSection {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface ExportPayload {
  title: string;
  generatedAt: string;
  sections: ExportSection[];
}

const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

function scopeRoot(): HTMLElement {
  return (document.querySelector("main") as HTMLElement | null) ?? document.body;
}

/** Reads tables, stat cards and metric rows out of the live DOM. */
export function collectPageData(title: string): ExportPayload {
  const root = scopeRoot();
  const sections: ExportSection[] = [];

  // Summary tiles (StatCard / KPI blocks).
  const stats: string[][] = [];
  root.querySelectorAll("[data-export-stat]").forEach((el) => {
    const label = clean(el.getAttribute("data-export-stat"));
    const value = clean(el.getAttribute("data-export-value") ?? el.textContent);
    if (label) stats.push([label, value]);
  });
  if (stats.length) sections.push({ title: "Summary", columns: ["Metric", "Value"], rows: stats });

  // Any rendered table.
  root.querySelectorAll("table").forEach((table, i) => {
    const columns = Array.from(table.querySelectorAll("thead th")).map((th) =>
      clean(th.textContent),
    );
    const rows = Array.from(table.querySelectorAll("tbody tr"))
      .map((tr) => Array.from(tr.querySelectorAll("td")).map((td) => clean(td.textContent)))
      .filter((r) => r.some(Boolean));
    if (!rows.length) return;
    const width = Math.max(columns.length, ...rows.map((r) => r.length));
    sections.push({
      title: clean(table.getAttribute("data-export-title")) || `Table ${i + 1}`,
      columns: columns.length
        ? columns
        : Array.from({ length: width }, (_, c) => `Column ${c + 1}`),
      rows,
    });
  });

  return {
    title,
    generatedAt: new Date().toLocaleString(),
    sections,
  };
}

function fallback(payload: ExportPayload): ExportPayload {
  if (payload.sections.length) return payload;
  const text = clean(scopeRoot().innerText).slice(0, 4000);
  return {
    ...payload,
    sections: [{ title: "Page contents", columns: ["Details"], rows: [[text]] }],
  };
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "report";

export async function exportPdf(payload: ExportPayload) {
  const data = fallback(payload);
  const { default: JsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const { drawCanteenOSHeader, drawCanteenOSFooter } = await import("@/lib/pdf-branding");

  const doc = new JsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  
  drawCanteenOSHeader(doc, {
    title: data.title,
    subtitle: `Generated: ${data.generatedAt}`,
    badgeText: "CONFIDENTIAL REPORT",
  });

  let y = 84;
  data.sections.forEach((section) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(section.title, 40, y);
    autoTable(doc, {
      startY: y + 8,
      head: [section.columns],
      body: section.rows,
      styles: { fontSize: 8, cellPadding: 5, overflow: "linebreak", font: "helvetica" },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 40, right: 40 },
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 30;
    if (y > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage();
      drawCanteenOSHeader(doc, {
        title: data.title,
        subtitle: `Generated: ${data.generatedAt}`,
        badgeText: "CONFIDENTIAL REPORT",
      });
      y = 84;
    }
  });

  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawCanteenOSFooter(doc, i, pageCount);
  }

  doc.save(`${slug(data.title)}.pdf`);
}

export async function exportExcel(payload: ExportPayload) {
  const data = fallback(payload);
  const { default: writeXlsxFile } = await import("write-excel-file/browser");

  type Cell = { value: string; fontWeight?: "bold" };
  const rows: Cell[][] = [
    [{ value: data.title, fontWeight: "bold" }],
    [{ value: `Generated ${data.generatedAt}` }],
  ];

  data.sections.forEach((s) => {
    rows.push([]);
    rows.push([{ value: s.title, fontWeight: "bold" }]);
    rows.push(s.columns.map((c) => ({ value: c, fontWeight: "bold" as const })));
    s.rows.forEach((r) => rows.push(s.columns.map((_, i) => ({ value: r[i] ?? "" }))));
  });

  // Ask for a Blob and save it ourselves — the library's own `fileName`
  // download path doesn't reliably fire in all browsers.
  const out = await (writeXlsxFile as unknown as (
    r: unknown,
  ) => Promise<{ toBlob: () => Promise<Blob> | Blob }>)(rows);
  downloadBlob(await out.toBlob(), `${slug(data.title)}.xlsx`);
}


function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}


export function printPage() {
  window.print();
}
