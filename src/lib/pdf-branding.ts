import type jsPDF from "jspdf";

export interface SecurityReportOptions {
  docRef?: string;
  publishedDate?: string;
  authorName?: string;
  authorEmail?: string;
}

export interface InvoiceOptions {
  planKey: string;
  planName: string;
  billingCycle: "monthly" | "annual";
  basePrice: number;
  tax: number;
  totalAmount: number;
  customerName: string;
  campus: string;
  email: string;
  phone: string;
}

export interface OrderReceiptOptions {
  orderId: string;
  code: string;
  placedAt: string;
  status: string;
  counter: string;
  method: string;
  paymentMethod: string;
  subtotal: number;
  gst: number;
  fee: number;
  total: number;
  lines: Array<{
    itemId: string;
    name: string;
    qty: number;
    price: number;
  }>;
}

/**
 * Draws the signature CanteenOS header banner with official Chef Hat logo badge and document header styling.
 */
export function drawCanteenOSHeader(
  doc: jsPDF,
  opts: {
    title: string;
    subtitle?: string;
    docRef?: string;
    badgeText?: string;
  }
) {
  const pageWidth = doc.internal.pageSize.getWidth();

  // Dark slate top header bar (#0F172A)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 58, "F");

  // Vibrant Lime Green top accent bar (#84CC16)
  doc.setFillColor(132, 204, 22);
  doc.rect(0, 0, pageWidth, 4, "F");

  // Logo Badge Container (Lime Green #84CC16)
  doc.setFillColor(132, 204, 22);
  doc.roundedRect(16, 12, 34, 34, 7, 7, "F");

  // Official Chef Hat emblem inside logo badge (Dark Slate #0F172A)
  doc.setFillColor(15, 23, 42);
  
  // Chef hat crown puff circles
  doc.circle(33, 23.5, 5.5, "F"); // Center dome
  doc.circle(28.5, 25.5, 4.2, "F"); // Left dome
  doc.circle(37.5, 25.5, 4.2, "F"); // Right dome

  // Chef hat crown body rectangle
  doc.rect(27.5, 25.5, 11, 7, "F");

  // Chef hat base band with small rounded corners
  doc.roundedRect(26.5, 32.5, 13, 4, 1, 1, "F");

  // Brand Name Typography
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("CanteenOS", 58, 28);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(132, 204, 22); // Lime accent subhead
  doc.text("ENTERPRISE CAMPUS DINING PLATFORM", 58, 38);

  // Document Title on Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(opts.title.toUpperCase(), pageWidth - 16, 25, { align: "right" });

  if (opts.subtitle || opts.docRef) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    const sub = [opts.subtitle, opts.docRef].filter(Boolean).join(" · ");
    doc.text(sub, pageWidth - 16, 36, { align: "right" });
  }

  if (opts.badgeText) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setFillColor(34, 197, 94); // Green badge
    const badgeWidth = doc.getTextWidth(opts.badgeText) + 12;
    doc.roundedRect(pageWidth - 16 - badgeWidth, 43, badgeWidth, 10, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(opts.badgeText, pageWidth - 16 - badgeWidth / 2, 50, { align: "center" });
  }

  // Header bottom border
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.75);
  doc.line(16, 64, pageWidth - 16, 64);
}

/**
 * Draws the standardized CanteenOS page footer with running page count and support contact.
 */
export function drawCanteenOSFooter(doc: jsPDF, currentPage: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Footer top divider line
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(16, pageHeight - 24, pageWidth - 16, pageHeight - 24);

  // Footer text without any mention of SAKEC
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);

  doc.text(
    "CanteenOS™ Enterprise Platform · Tech Operations Hub, Chembur, Mumbai 400088 · ranjitpatra2611@gmail.com",
    16,
    pageHeight - 12
  );

  doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth - 16, pageHeight - 12, {
    align: "right",
  });
}

/**
 * Renders a stylized section header with green accent indicator.
 */
export function drawSectionHeading(doc: jsPDF, y: number, text: string): number {
  doc.setFillColor(132, 204, 22);
  doc.rect(16, y, 4, 14, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(text, 24, y + 11);

  return y + 20;
}

/**
 * Generates the full, comprehensive Enterprise Security & Compliance Whitepaper PDF.
 */
export async function generateSecurityWhitepaperPDF(opts?: SecurityReportOptions): Promise<jsPDF> {
  const { default: JsPDF } = await import("jspdf");
  const doc = new JsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const docRef = opts?.docRef ?? `COS-SEC-2026-V2`;
  const publishedDate = opts?.publishedDate ?? new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const authorName = opts?.authorName ?? "Ranjit Patra";
  const authorEmail = opts?.authorEmail ?? "ranjitpatra2611@gmail.com";

  // PAGE 1
  drawCanteenOSHeader(doc, {
    title: "Security & Compliance Whitepaper",
    subtitle: "Enterprise Technical Specifications & Audit Guide",
    docRef: `REF: ${docRef}`,
    badgeText: "CONFIDENTIAL · AUDIT READY",
  });

  let y = 74;

  // Metadata Card Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, y, 563, 42, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("DOCUMENT CONTROL & AUDIT METADATA", 24, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Published: ${publishedDate}  |  Doc ID: ${docRef}  |  Version: 2026.2 Enterprise`, 24, y + 28);
  doc.text(`Lead Administrator & Author: ${authorName} (${authorEmail})`, 330, y + 28);

  y += 54;

  // Executive Summary Callout Box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(16, y, 563, 48, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(6, 95, 70);
  doc.text("EXECUTIVE SUMMARY & ENTERPRISE OVERVIEW", 24, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text(
    "CanteenOS is a cloud-native campus dining operating system built for high-concurrency food ordering, real-time kitchen execution, and financial audit readiness. This whitepaper details the data isolation model, cryptographic protection, role-based access control, and regulatory compliance standards enforced across the platform.",
    24,
    y + 28,
    { maxWidth: 545 }
  );

  y += 62;

  // Section 1: Data Architecture & RLS
  y = drawSectionHeading(doc, y, "1. Data Architecture & Row-Level Security (RLS)");

  const sec1Bullets = [
    "• PostgreSQL Database Isolation: Operating on Supabase managed Postgres clusters with strict Row-Level Security (RLS) policies configured on every table (orders, menus, inventory, staff, user profiles).",
    "• Multi-Tenant Data Separation: Tenant boundary checks are cryptographically validated against authenticated JWT claims (auth.uid()). Cross-campus or cross-canteen data leaks are prevented at the database kernel level.",
    "• Data-at-Rest Protection: Database volumes, storage buckets, and automated snapshot backups are encrypted using AES-256 block ciphers with automated KMS key rotation.",
    "• Data-in-Transit Encryption: All incoming and outgoing web traffic enforces TLS 1.3 with Perfect Forward Secrecy (PFS), HTTP Strict Transport Security (HSTS) preloading, and HTTP/2 transport.",
    "• Automated Backups & Disaster Recovery: Continuous Write-Ahead Logging (WAL) with daily full snapshots. Point-In-Time Recovery (PITR) enables restoration to any minute within a 30-day rolling window.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  sec1Bullets.forEach((bullet) => {
    const lines = doc.splitTextToSize(bullet, 550);
    doc.text(lines, 24, y);
    y += lines.length * 11 + 3;
  });

  y += 8;

  // Section 2: Identity & Access Management
  y = drawSectionHeading(doc, y, "2. Identity & Role-Based Access Control (RBAC)");

  const sec2Bullets = [
    "• Granular RBAC Matrix: 4 distinct privilege tiers enforce least-privilege principles across the system:",
    "   - Student / Customer: Self-service ordering, campus wallet balance operations, order tracking.",
    "   - Kitchen Staff: Real-time Kitchen Display System (KDS) order management, status updates (placed -> preparing -> ready).",
    "   - Canteen Manager: Menu pricing adjustments, inventory restocking, workforce shift scheduling, revenue analytics.",
    "   - Lead Admin (Ranjit Patra): System-wide organization governance, global compliance policies, audit logs.",
    "• Session Lifecycles: JWT access tokens stored in HttpOnly, SameSite=Strict cookies with automatic idle session revocation after 30 minutes.",
    "• Password Security: User credentials are salted and hashed using Argon2id / bcrypt. Authentication endpoints enforce IP-based rate limiting (5 attempts/min) to prevent brute-force attacks.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  sec2Bullets.forEach((bullet) => {
    const lines = doc.splitTextToSize(bullet, 550);
    doc.text(lines, 24, y);
    y += lines.length * 11 + 3;
  });

  // PAGE 2
  doc.addPage();
  drawCanteenOSHeader(doc, {
    title: "Security & Compliance Whitepaper",
    subtitle: "Threat Protection, Audit Trails & Regulatory SLA",
    docRef: `REF: ${docRef}`,
    badgeText: "CONFIDENTIAL · AUDIT READY",
  });

  y = 74;

  // Section 3: Financial & Payment Integrity
  y = drawSectionHeading(doc, y, "3. Transactional & Financial Security");

  const sec3Bullets = [
    "• Payment Gateway PCI-DSS Compliance: Payment processing is tokenized through PCI-DSS Level 1 certified gateways (Razorpay, UPI, NetBanking, Campus Wallet). Zero credit card or banking secrets are stored on local servers.",
    "• Idempotent Double-Entry Ledger: Financial transactions use optimistic concurrency locking and idempotent request headers to guarantee zero duplicate billings or unauthorized credit adjustments.",
    "• Digital Receipt Verification: Cryptographically signed digital transaction codes accompany every completed order to verify counter collection authenticity.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  sec3Bullets.forEach((bullet) => {
    const lines = doc.splitTextToSize(bullet, 550);
    doc.text(lines, 24, y);
    y += lines.length * 11 + 3;
  });

  y += 8;

  // Section 4: Infrastructure Defense & Audit Trail
  y = drawSectionHeading(doc, y, "4. Infrastructure Defense & Security Auditing");

  const sec4Bullets = [
    "• Cloudflare Edge WAF: Deployed behind Cloudflare Enterprise Edge with automated Web Application Firewall (WAF) rules filtering DDoS attacks, SQL Injection (SQLi), Cross-Site Scripting (XSS), and CSRF threats.",
    "• Immutable Administrative Audit Trail: Every administrative configuration change, role escalation, refund transaction, and menu price update is logged in an append-only audit trail table capturing actor ID, timestamp, and client IP.",
    "• Continuous Automated Vulnerability Scanning: Automated daily SAST/DAST code analysis and automated dependency vulnerability alerts via GitHub Dependabot.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  sec4Bullets.forEach((bullet) => {
    const lines = doc.splitTextToSize(bullet, 550);
    doc.text(lines, 24, y);
    y += lines.length * 11 + 3;
  });

  y += 8;

  // Section 5: Regulatory Compliance Readiness & SLA
  y = drawSectionHeading(doc, y, "5. Regulatory Compliance & SLA Specifications");

  const sec5Bullets = [
    "• SOC 2 Type II & ISO 27001 Alignment: System control procedures align with SOC 2 Trust Services Criteria (Security, Availability, Confidentiality) and ISO/IEC 27001 security guidelines.",
    "• DPDP Act (India) & GDPR Compliance: Full compliance with India's Digital Personal Data Protection Act 2023 and GDPR guidelines. Users can request automated profile data exports or complete account erasure.",
    "• Service Level Agreement (SLA): 99.9% operational uptime SLA. Target Recovery Time Objective (RTO) < 15 minutes; Target Recovery Point Objective (RPO) < 5 minutes.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  sec5Bullets.forEach((bullet) => {
    const lines = doc.splitTextToSize(bullet, 550);
    doc.text(lines, 24, y);
    y += lines.length * 11 + 3;
  });

  y += 12;

  // Section 6: Contact & Operations Escalation
  y = drawSectionHeading(doc, y, "6. Official Operations & Escalation Contacts");

  // Contact Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(16, y, 563, 68, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("CANTEENOS MANAGEMENT & IT DESK", 26, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Lead Administrator & Manager: ${authorName} (${authorEmail})`, 26, y + 30);
  doc.text("• Licensing & Enterprise Desk: sales@canteenos.com", 26, y + 42);
  doc.text("• Helpline & Campus IT Support: +91 (022) 2854-9000 (Mon–Sat, 9 AM – 7 PM)", 26, y + 54);

  doc.text("• Operations HQ Address:", 330, y + 30);
  doc.setFont("helvetica", "bold");
  doc.text("CanteenOS Tech Operations Hub, Chembur,", 330, y + 42);
  doc.text("Mumbai, Maharashtra 400088", 330, y + 54);

  // Draw Footers on both pages
  drawCanteenOSFooter(doc, 1, 2);
  doc.setPage(2);
  drawCanteenOSFooter(doc, 2, 2);

  return doc;
}

/**
 * Generates a branded Tax Invoice PDF for subscription checkouts.
 */
export async function generateTaxInvoicePDF(opts: InvoiceOptions): Promise<jsPDF> {
  const { default: JsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new JsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const invoiceNo = `COS-INV-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  drawCanteenOSHeader(doc, {
    title: "Official Tax Invoice",
    subtitle: `Invoice No: ${invoiceNo}`,
    docRef: `Date: ${dateStr}`,
    badgeText: "PAYMENT STATUS: PAID",
  });

  let y = 74;

  // Billed From & Billed To Grid Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, y, 563, 86, 6, 6, "FD");

  // Left Column - Billed From
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("BILLED FROM (PROVIDER):", 26, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text("CanteenOS Technologies India Pvt Ltd", 26, y + 30);
  doc.text("CanteenOS Tech Operations Hub, Chembur", 26, y + 42);
  doc.text("Mumbai, Maharashtra 400088", 26, y + 54);
  doc.text("GSTIN: 27AAACC1234D1Z5 · SAC: 998313", 26, y + 66);

  // Right Column - Billed To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("BILLED TO (CUSTOMER):", 310, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Name: ${opts.customerName || "Valued Client"}`, 310, y + 30);
  doc.text(`Campus / Canteen: ${opts.campus || "Main Campus"}`, 310, y + 42);
  doc.text(`Email: ${opts.email || "N/A"}`, 310, y + 54);
  doc.text(`Phone: ${opts.phone || "N/A"}`, 310, y + 66);

  y += 100;

  // Itemized Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("SUBSCRIPTION SUMMARY & ITEMIZATION", 16, y);

  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Item Description", "Billing Cycle", "Qty", "Base Price", "GST (18%)", "Total Amount"]],
    body: [
      [
        `CanteenOS Platform — ${opts.planName} Tier`,
        opts.billingCycle.toUpperCase(),
        "1",
        `INR ${opts.basePrice.toLocaleString("en-IN")}`,
        `INR ${opts.tax.toLocaleString("en-IN")}`,
        `INR ${opts.totalAmount.toLocaleString("en-IN")}`,
      ],
    ],
    styles: { fontSize: 8.5, cellPadding: 8, font: "helvetica" },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 16, right: 16 },
  });

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 50;

  y = finalY + 16;

  // Totals Summary Box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(330, y, 249, 74, 6, 6, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Subtotal Base Price:", 342, y + 20);
  doc.text(`INR ${opts.basePrice.toLocaleString("en-IN")}`, 565, y + 20, { align: "right" });

  doc.text("CGST (9%) + SGST (9%):", 342, y + 36);
  doc.text(`INR ${opts.tax.toLocaleString("en-IN")}`, 565, y + 36, { align: "right" });

  doc.setDrawColor(167, 243, 208);
  doc.line(342, y + 44, 565, y + 44);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(16, 185, 129);
  doc.text("Total Paid:", 342, y + 60);
  doc.text(`INR ${opts.totalAmount.toLocaleString("en-IN")}`, 565, y + 60, { align: "right" });

  // Payment note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(
    "Note: This is an officially generated electronic tax invoice. No physical signature is required.",
    16,
    y + 60
  );

  drawCanteenOSFooter(doc, 1, 1);

  return doc;
}

/**
 * Generates a branded Student Order Receipt PDF.
 */
export async function generateOrderReceiptPDF(opts: OrderReceiptOptions): Promise<jsPDF> {
  const { default: JsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new JsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const dateStr = opts.placedAt ? new Date(opts.placedAt).toLocaleString("en-IN") : new Date().toLocaleString("en-IN");

  drawCanteenOSHeader(doc, {
    title: "Official Order Receipt",
    subtitle: `Order Code: ${opts.code}`,
    docRef: dateStr,
    badgeText: `STATUS: ${opts.status.toUpperCase()}`,
  });

  let y = 74;

  // Order Information Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, y, 563, 50, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`ORDER CODE: ${opts.code}`, 26, y + 16);
  doc.text(`PICKUP COUNTER: ${opts.counter || "Main Counter"}`, 310, y + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`Fulfillment: ${opts.method === "pickup" ? "Counter Pickup" : "Delivery"}`, 26, y + 34);
  doc.text(`Payment Mode: ${opts.paymentMethod || "UPI / Wallet"}`, 310, y + 34);

  y += 64;

  // Items Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("ORDERED ITEMS", 16, y);

  y += 8;

  const tableBody = opts.lines.map((l) => [
    l.name,
    `${l.qty}`,
    `INR ${l.price.toLocaleString("en-IN")}`,
    `INR ${(l.price * l.qty).toLocaleString("en-IN")}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Item Name", "Qty", "Unit Price", "Subtotal"]],
    body: tableBody,
    styles: { fontSize: 8.5, cellPadding: 6, font: "helvetica" },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 16, right: 16 },
  });

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 40;

  y = finalY + 16;

  // Totals Box
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(350, y, 229, 68, 6, 6, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text("Items Subtotal:", 362, y + 18);
  doc.text(`INR ${opts.subtotal.toLocaleString("en-IN")}`, 565, y + 18, { align: "right" });

  doc.text("GST & Platform Fee:", 362, y + 32);
  doc.text(`INR ${(opts.gst + opts.fee).toLocaleString("en-IN")}`, 565, y + 32, { align: "right" });

  doc.setDrawColor(203, 213, 225);
  doc.line(362, y + 40, 565, y + 40);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(34, 197, 94);
  doc.text("Total Paid:", 362, y + 54);
  doc.text(`INR ${opts.total.toLocaleString("en-IN")}`, 565, y + 54, { align: "right" });

  drawCanteenOSFooter(doc, 1, 1);

  return doc;
}

/**
 * Generates a full 2-page branded CanteenOS Tech Stack Architecture Specification PDF.
 */
export async function generateTechStackPDF(): Promise<jsPDF> {
  const { default: JsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new JsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const docRef = "COS-TECH-2026-V2";
  const publishedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const authorName = "Ranjit Patra";
  const authorEmail = "ranjitpatra2611@gmail.com";

  // PAGE 1
  drawCanteenOSHeader(doc, {
    title: "Technology Stack & Architecture",
    subtitle: "Enterprise Technical Specifications & Infrastructure Guide",
    docRef: `REF: ${docRef}`,
    badgeText: "SYSTEM ARCHITECTURE · OFFICIAL",
  });

  let y = 74;

  // Metadata Card Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(16, y, 563, 42, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("CANTEENOS TECH STACK ARCHITECTURE SPECIFICATION", 24, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Published: ${publishedDate}  |  Doc ID: ${docRef}  |  Platform: Enterprise Edition`, 24, y + 28);
  doc.text(`Lead Architect: ${authorName} (${authorEmail})`, 330, y + 28);

  y += 52;

  // Executive Summary Box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(16, y, 563, 46, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(6, 95, 70);
  doc.text("SYSTEM ARCHITECTURE OVERVIEW", 24, y + 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(4, 120, 87);
  doc.text(
    "CanteenOS is engineered as a high-concurrency, full-stack campus dining operating system leveraging modern reactive web technologies, serverless database architecture, real-time WebSockets, 3D WebGL visuals, and multi-LLM artificial intelligence engines. Below is the complete specifications matrix.",
    24,
    y + 27,
    { maxWidth: 545 }
  );

  y += 58;

  // Section 1: Core Frontend & SSR Runtime
  y = drawSectionHeading(doc, y, "1. Core Frontend & Server-Side Rendering (SSR) Engine");

  autoTable(doc, {
    startY: y,
    head: [["Layer", "Technology", "Version", "Role & Usage in Codebase"]],
    body: [
      ["Framework", "React", "v19.2.0", "Core reactive UI rendering engine across student, kitchen & admin portals"],
      ["Language", "TypeScript", "v5.8.3", "End-to-end static type safety, strict interfaces & contract validations"],
      ["Routing Engine", "TanStack Start & Router", "v1.170", "Full-stack SSR/SSG file-based routing system (src/routes/)"],
      ["Build & Bundler", "Vite 8 & Nitro 3", "v8.1.5", "Ultra-fast HMR dev server & edge prebuilt production bundle"],
    ],
    styles: { fontSize: 8, cellPadding: 6, font: "helvetica" },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 16, right: 16 },
  });

  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 100;
  y += 16;

  // Section 2: Backend & Database Layer
  y = drawSectionHeading(doc, y, "2. Backend Infrastructure & Database Isolation Layer");

  autoTable(doc, {
    startY: y,
    head: [["Component", "Technology", "Role & Infrastructure Details"]],
    body: [
      ["Database", "Supabase PostgreSQL", "Serverless Postgres database storing orders, menus, inventory & user profiles"],
      ["Security", "Row-Level Security (RLS)", "Database kernel-level multi-tenant isolation tied to JWT auth.uid() claims"],
      ["Realtime Engine", "Supabase WebSockets", "Live event broadcasting for instant Kitchen Display System (KDS) order updates"],
      ["Authentication", "Supabase Auth", "Secure JWT session management supporting Student, Kitchen & Admin roles"],
    ],
    styles: { fontSize: 8, cellPadding: 6, font: "helvetica" },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 16, right: 16 },
  });

  // PAGE 2
  doc.addPage();
  drawCanteenOSHeader(doc, {
    title: "Technology Stack & Architecture",
    subtitle: "UI System, AI Engine & Infrastructure Specifications",
    docRef: `REF: ${docRef}`,
    badgeText: "SYSTEM ARCHITECTURE · OFFICIAL",
  });

  y = 74;

  // Section 3: UI Design System & 3D Visual Pipeline
  y = drawSectionHeading(doc, y, "3. UI Design System, 3D Visuals & Animation Pipeline");

  autoTable(doc, {
    startY: y,
    head: [["Module", "Technology", "Application & Description"]],
    body: [
      ["Styling System", "Tailwind CSS v4", "Utility-first design system with dark/light HSL CSS color variables"],
      ["Headless UI", "Radix UI Primitives", "Accessible headless UI components (Dialog, Tabs, Select, Switch, Slider)"],
      ["Icons Suite", "Lucide React", "Scalable vector icon suite across navigation and administrative dashboards"],
      ["3D Graphics", "Three.js & R3F", "Interactive 3D canvas rendering for hero landing scenes (src/components/landing)"],
      ["Animations", "Framer Motion & GSAP", "Smooth micro-animations, page transitions, and landing scroll effects"],
      ["Smooth Scroll", "Lenis Scroll", "High-performance smooth inertia scrolling system for modern UX"],
    ],
    styles: { fontSize: 8, cellPadding: 6, font: "helvetica" },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 16, right: 16 },
  });

  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 120;
  y += 16;

  // Section 4: Canteen AI Engine & Data Export Framework
  y = drawSectionHeading(doc, y, "4. Canteen AI Engine & Data Export Framework");

  autoTable(doc, {
    startY: y,
    head: [["Feature", "Technology", "Implementation & Specifications"]],
    body: [
      ["Multi-LLM Engine", "Gemini / Groq / Grok", "Hybrid LLM provider engine with fallback to smart local recommendation mode"],
      ["Voice STT", "Web Speech API", "Browser-native Speech-to-Text engine for hands-free voice food ordering"],
      ["PDF Engine", "jsPDF & AutoTable", "Client/SSR branded document rendering for Whitepapers, Invoices & Receipts"],
      ["Spreadsheets", "Write-Excel-File", "Automated Excel report generation for admin sales & inventory auditing"],
    ],
    styles: { fontSize: 8, cellPadding: 6, font: "helvetica" },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 16, right: 16 },
  });

  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 100;
  y += 16;

  // Section 5: Cloud Infrastructure & Compliance Standards
  y = drawSectionHeading(doc, y, "5. Hosting, Edge Infrastructure & Security Compliance");

  const sec5Bullets = [
    "• Vercel Global Edge Network: Production deployment hosted live at https://canteenos-hub.vercel.app with automated CI/CD builds from GitHub main.",
    "• Cloudflare WAF & TLS 1.3: Edge network firewall filtering DDoS, SQLi, and XSS attacks over encrypted TLS 1.3 transport.",
    "• Regulatory Compliance Readiness: Architecture aligns with India's DPDP Act 2023, GDPR guidelines, and SOC 2 Type II trust criteria.",
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  sec5Bullets.forEach((bullet) => {
    const lines = doc.splitTextToSize(bullet, 550);
    doc.text(lines, 24, y);
    y += lines.length * 11 + 3;
  });

  // Draw Footers on both pages
  drawCanteenOSFooter(doc, 1, 2);
  doc.setPage(2);
  drawCanteenOSFooter(doc, 2, 2);

  return doc;
}
