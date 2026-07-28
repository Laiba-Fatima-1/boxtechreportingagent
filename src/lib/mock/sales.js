/**
 * Sales document fixtures: Quotation -> Sales Order -> Sales Invoice -> Payment.
 * Field names and status values follow the standard ERPNext DocTypes in the schema.
 */

import { rng, pick, int, float, weighted, chance, daysBefore } from "./rng";
import { SALESPEOPLE, COMPANIES, TERRITORIES } from "./reference";

export const INVOICE_STATUS = ["Paid", "Unpaid", "Overdue", "Partly Paid", "Draft"];
export const ORDER_STATUS = ["Draft", "To Deliver and Bill", "To Bill", "To Deliver", "Completed", "Closed"];
export const QUOTATION_STATUS = ["Draft", "Open", "Replied", "Ordered", "Lost", "Expired"];

function buildQuotations(count = 140) {
  const r = rng(0x9021);
  return Array.from({ length: count }, (_, i) => {
    const d = int(r, 0, 89);
    const total = int(r, 1800, 92000);
    const status = weighted(r, [
      ["Open", 24], ["Replied", 16], ["Ordered", 30],
      ["Lost", 18], ["Expired", 8], ["Draft", 4],
    ]);
    return {
      name: `SAL-QTN-2026-${String(i + 1).padStart(5, "0")}`,
      party_name: COMPANIES[int(r, 0, COMPANIES.length - 1)],
      transaction_date: daysBefore(d),
      _daysAgo: d,
      valid_till: daysBefore(d - 30),
      grand_total: total,
      status,
      owner: pick(r, SALESPEOPLE).user,
      territory: pick(r, TERRITORIES),
      _won: status === "Ordered",
    };
  });
}

function buildOrders(count = 96) {
  const r = rng(0x7742);
  return Array.from({ length: count }, (_, i) => {
    const d = int(r, 0, 89);
    const total = int(r, 2400, 88000);
    const status = weighted(r, [
      ["To Deliver and Bill", 22], ["To Bill", 14], ["To Deliver", 12],
      ["Completed", 40], ["Draft", 6], ["Closed", 6],
    ]);
    return {
      name: `SAL-ORD-2026-${String(i + 1).padStart(5, "0")}`,
      customer: COMPANIES[int(r, 0, COMPANIES.length - 1)],
      transaction_date: daysBefore(d),
      _daysAgo: d,
      delivery_date: daysBefore(d - int(r, 7, 40)),
      grand_total: total,
      status,
      per_delivered: status === "Completed" ? 100 : int(r, 0, 90),
      per_billed: status === "Completed" ? 100 : int(r, 0, 80),
      owner: pick(r, SALESPEOPLE).user,
      territory: pick(r, TERRITORIES),
    };
  });
}

function buildInvoices(count = 120) {
  const r = rng(0x33ab);
  return Array.from({ length: count }, (_, i) => {
    const d = int(r, 0, 89);
    const total = int(r, 1500, 76000);
    const status = weighted(r, [
      ["Paid", 44], ["Unpaid", 20], ["Overdue", 18],
      ["Partly Paid", 12], ["Draft", 6],
    ]);
    const outstanding =
      status === "Paid" ? 0
        : status === "Partly Paid" ? Math.round(total * float(r, 0.2, 0.7))
          : total;
    /* Due 30 days after posting; overdue rows are deliberately pushed past it. */
    const dueDaysAgo = status === "Overdue" ? int(r, 1, 45) : d - 30;
    return {
      name: `ACC-SINV-2026-${String(i + 1).padStart(5, "0")}`,
      customer: COMPANIES[int(r, 0, COMPANIES.length - 1)],
      posting_date: daysBefore(d),
      _daysAgo: d,
      due_date: daysBefore(dueDaysAgo),
      _overdueDays: status === "Overdue" ? dueDaysAgo : 0,
      grand_total: total,
      outstanding_amount: outstanding,
      status,
      owner: pick(r, SALESPEOPLE).user,
      territory: pick(r, TERRITORIES),
    };
  });
}

export const QUOTATIONS = buildQuotations();
export const ORDERS = buildOrders();
export const INVOICES = buildInvoices();

/* ---------------------------------------------------------------- derived -- */

export const salesByOwner = (days = 30) =>
  SALESPEOPLE.map((p) => {
    const inv = INVOICES.filter(
      (x) => x.owner === p.user && x._daysAgo < days && x.status !== "Draft"
    );
    const ord = ORDERS.filter((x) => x.owner === p.user && x._daysAgo < days);
    const qtn = QUOTATIONS.filter((x) => x.owner === p.user && x._daysAgo < days);
    return {
      user: p.user,
      name: p.name,
      invoiced: inv.reduce((s, x) => s + x.grand_total, 0),
      outstanding: inv.reduce((s, x) => s + x.outstanding_amount, 0),
      orders: ord.length,
      orderValue: ord.reduce((s, x) => s + x.grand_total, 0),
      quotations: qtn.length,
      quotationWinRate: qtn.length
        ? Math.round((qtn.filter((q) => q._won).length / qtn.length) * 100)
        : 0,
    };
  }).sort((a, b) => b.invoiced - a.invoiced);

export const salesTrend = (days = 30) => {
  const out = [];
  for (let d = days - 1; d >= 0; d--) {
    const inv = INVOICES.filter((x) => x._daysAgo === d && x.status !== "Draft");
    const ord = ORDERS.filter((x) => x._daysAgo === d);
    out.push({
      date: daysBefore(d),
      sales: inv.reduce((s, x) => s + x.grand_total, 0),
      orders: ord.reduce((s, x) => s + x.grand_total, 0),
      count: inv.length,
    });
  }
  return out;
};

export const pendingPayments = () =>
  INVOICES.filter((x) => x.outstanding_amount > 0 && x.status !== "Draft")
    .sort((a, b) => b.outstanding_amount - a.outstanding_amount);

export const overdueInvoices = () =>
  INVOICES.filter((x) => x.status === "Overdue").sort(
    (a, b) => b._overdueDays - a._overdueDays
  );

/** Ageing buckets for the overdue report. */
export function ageingBuckets() {
  const rows = overdueInvoices();
  const defs = [
    { bucket: "1–15 days", min: 1, max: 15 },
    { bucket: "16–30 days", min: 16, max: 30 },
    { bucket: "31–60 days", min: 31, max: 60 },
    { bucket: "60+ days", min: 61, max: 9999 },
  ];
  return defs.map((d) => {
    const r = rows.filter((x) => x._overdueDays >= d.min && x._overdueDays <= d.max);
    return {
      bucket: d.bucket,
      count: r.length,
      value: r.reduce((s, x) => s + x.outstanding_amount, 0),
    };
  });
}

/** Quotation funnel by status. */
export const quotationFunnel = () =>
  QUOTATION_STATUS.map((s) => {
    const rows = QUOTATIONS.filter((q) => q.status === s);
    return { status: s, count: rows.length, value: rows.reduce((a, b) => a + b.grand_total, 0) };
  }).filter((r) => r.count > 0);

/** Average days between pipeline stages — the sales cycle report. */
export function cycleDurations() {
  return [
    { stage: "Lead → Quotation", days: 12.4, target: 10 },
    { stage: "Quotation → Order", days: 18.7, target: 14 },
    { stage: "Order → Invoice", days: 6.2, target: 7 },
    { stage: "Invoice → Payment", days: 27.9, target: 30 },
  ];
}

/** Customers ranked by value, flagged when engagement has gone quiet. */
export function customerEngagement() {
  const r = rng(0x5150);
  return COMPANIES.map((c) => {
    const inv = INVOICES.filter((x) => x.customer === c && x.status !== "Draft");
    const value = inv.reduce((s, x) => s + x.grand_total, 0);
    const lastDays = int(r, 0, 40);
    return {
      customer: c,
      invoices: inv.length,
      value,
      outstanding: inv.reduce((s, x) => s + x.outstanding_amount, 0),
      lastContactDays: lastDays,
      /* High value + long silence = the segment section 9 asks us to surface. */
      atRisk: value > 60000 && lastDays > 14,
    };
  })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
}
