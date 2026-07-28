/**
 * REPORT REGISTRY
 *
 * Twenty reports, one renderer. Each definition describes its KPI strip, its
 * charts and its table; `ReportView` turns that into UI. Writing twenty bespoke
 * pages would mean twenty places to fix every future layout change.
 *
 * Definition shape:
 *   { title, group, source, description, kpis[], charts[], table{}, pipelines? }
 *
 * `pipelines` is present only on the two lead reports, which can be viewed as
 * the standard Lead funnel, the custom Leads deal pipeline, or both joined.
 */

import {
  STANDARD_LEADS, CUSTOM_LEADS, SALES_STATUS, LEAD_STATUS,
  leadsPerDay, standardFunnel, customPipeline, sourcePerformance,
  conversionSummary, conversionByOwner, categoryMix, PIPELINES,
} from "./mock/leads";

import {
  ACTIVITIES, PROGRESS, callsByOwner, activityByOwner, hourlyPattern,
  weekdayPattern, activityTrend, activityMix, staleCustomers,
  callsWithoutFollowUp, overdueActivities,
} from "./mock/activities";

import {
  QUOTATIONS, ORDERS, INVOICES, salesByOwner, salesTrend, pendingPayments,
  overdueInvoices, ageingBuckets, quotationFunnel, cycleDurations,
  customerEngagement,
} from "./mock/sales";

import { CONTACT_ROLES, COMPANIES, SALESPEOPLE } from "./mock/reference";
import { rng, pick, int } from "./mock/rng";

const C = {
  brand: "var(--color-brand)",
  blue: "var(--color-blue)",
  purple: "var(--color-purple)",
  amber: "var(--color-amber)",
  red: "var(--color-red)",
  faint: "var(--color-ink-faint)",
};

/* =====================================================================
   LEAD GENERATION — supports both pipelines
   ===================================================================== */

function leadGeneration() {
  const trend = leadsPerDay(30);
  const sources = sourcePerformance();
  const cats = categoryMix();

  const stdNew30 = STANDARD_LEADS.filter((l) => l._createdDaysAgo < 30).length;
  const cusNew30 = CUSTOM_LEADS.filter((l) => l._createdDaysAgo < 30).length;
  const cusValue = CUSTOM_LEADS.filter((l) => l._createdDaysAgo < 30)
    .reduce((s, l) => s + l.total, 0);

  const base = {
    title: "Lead Generation",
    group: "Leads & Pipeline",
    description:
      "New leads captured over time, by source and by owner. Both lead pipelines are live in ERPNext, so pick which one you want to see.",
  };

  return {
    ...base,
    source: "Lead + Leads (custom)",
    pipelines: {
      /* ---------------- standard Lead ---------------- */
      standard: {
        source: "Lead",
        note: "Standard ERPNext capture funnel. Records interest and qualification; carries no monetary value.",
        kpis: [
          { label: "New leads (30d)", value: stdNew30, accent: "blue" },
          { label: "Qualified", value: STANDARD_LEADS.filter((l) => l.qualification_status === "Qualified").length, accent: "brand" },
          { label: "In process", value: STANDARD_LEADS.filter((l) => l.qualification_status === "In Process").length, accent: "amber" },
          { label: "Do not contact", value: STANDARD_LEADS.filter((l) => l.status === "Do Not Contact").length, accent: "red" },
        ],
        charts: [
          { type: "area", title: "Leads captured per day", data: trend, xKey: "date", xFormat: "date",
            series: [{ key: "standard", label: "Lead", color: C.blue }], span: 8 },
          { type: "donut", title: "By qualification", span: 4,
            data: ["Qualified", "In Process", "Unqualified"].map((q, i) => ({
              name: q,
              value: STANDARD_LEADS.filter((l) => l.qualification_status === q).length,
              color: [C.brand, C.amber, C.faint][i],
            })) },
          { type: "hbar", title: "Lead source performance", data: sources, labelKey: "source",
            series: [{ key: "total", label: "Captured", color: C.blue }, { key: "converted", label: "Became deals", color: C.brand }], span: 12 },
        ],
        table: {
          title: "Leads",
          columns: [
            { key: "name", label: "ID", mono: true },
            { key: "lead_name", label: "Company", primary: true },
            { key: "status", label: "Status", badge: "leadStatus" },
            { key: "qualification_status", label: "Qualification", badge: "qualification" },
            { key: "utm_source", label: "Source" },
            { key: "territory", label: "Territory" },
            { key: "lead_owner", label: "Owner", user: true },
            { key: "creation", label: "Created", align: "right", format: "date" },
          ],
          rows: [...STANDARD_LEADS].sort((a, b) => a._createdDaysAgo - b._createdDaysAgo),
        },
      },

      /* ---------------- custom Leads ---------------- */
      custom: {
        source: "Leads (custom DocType)",
        note: "BoxTech's own deal pipeline. Thirteen sales stages, each row carries a value, category and expected close date.",
        kpis: [
          { label: "New deals (30d)", value: cusNew30, accent: "purple" },
          { label: "Pipeline value (30d)", value: cusValue, format: "money", accent: "brand" },
          { label: "Open deals", value: CUSTOM_LEADS.filter((l) => l._isOpen).length, accent: "blue" },
          { label: "Avg deal size", value: Math.round(cusValue / Math.max(cusNew30, 1)), format: "money", accent: "amber" },
        ],
        charts: [
          { type: "area", title: "Deals created per day", data: trend, xKey: "date", xFormat: "date",
            series: [{ key: "custom", label: "Leads (deal)", color: C.purple }], span: 8 },
          { type: "donut", title: "By category", span: 4,
            data: cats.map((c, i) => ({ name: c.name, value: c.count,
              color: [C.brand, C.blue, C.purple, C.amber, C.faint][i % 5] })) },
          { type: "bar", title: "Deals by sales stage", data: customPipeline(), xKey: "stage", rotateLabels: true,
            series: [{ key: "count", label: "Deals", color: C.purple }], span: 12 },
        ],
        table: {
          title: "Deals",
          columns: [
            { key: "name", label: "ID", mono: true },
            { key: "client_name", label: "Client", primary: true },
            { key: "sales_status", label: "Sales stage", badge: "salesStatus" },
            { key: "category", label: "Category" },
            { key: "manufacturer", label: "Manufacturer" },
            { key: "probability", label: "Prob.", align: "right", format: "percent" },
            { key: "total", label: "Value", align: "right", format: "money", strong: true },
            { key: "lead_owner", label: "Owner", user: true },
            { key: "expected_closing_date", label: "Expected close", align: "right", format: "date" },
          ],
          rows: [...CUSTOM_LEADS].sort((a, b) => b.total - a.total),
        },
      },

      /* ---------------- both ---------------- */
      combined: {
        source: "Lead + Leads (custom)",
        note: "Capture and deal pipelines side by side. A lead is normally captured in Lead, then tracked as a deal in Leads once qualified.",
        kpis: [
          { label: "Captured leads (30d)", value: stdNew30, accent: "blue" },
          { label: "Deals created (30d)", value: cusNew30, accent: "purple" },
          { label: "Pipeline value", value: cusValue, format: "money", accent: "brand" },
          { label: "Capture → deal", value: conversionSummary().dealRate, format: "percent", accent: "amber" },
        ],
        charts: [
          { type: "area", title: "Both pipelines per day", data: trend, xKey: "date", xFormat: "date",
            series: [
              { key: "standard", label: "Lead (capture)", color: C.blue },
              { key: "custom", label: "Leads (deal)", color: C.purple },
            ], span: 12 },
          { type: "hbar", title: "Source performance", data: sources, labelKey: "source",
            series: [{ key: "total", label: "Captured", color: C.blue }, { key: "converted", label: "Became deals", color: C.brand }], span: 6 },
          { type: "bar", title: "Deal stages", data: customPipeline(), xKey: "stage", rotateLabels: true,
            series: [{ key: "count", label: "Deals", color: C.purple }], span: 6 },
        ],
        table: {
          title: "All leads and deals",
          columns: [
            { key: "_pipeline", label: "Pipeline", badge: "pipeline" },
            { key: "_id", label: "ID", mono: true },
            { key: "_client", label: "Company", primary: true },
            { key: "_stage", label: "Stage / status" },
            { key: "_value", label: "Value", align: "right", format: "money", strong: true },
            { key: "_owner", label: "Owner", user: true },
            { key: "_date", label: "Created", align: "right", format: "date" },
          ],
          rows: [
            ...STANDARD_LEADS.map((l) => ({
              _pipeline: "Lead", _id: l.name, _client: l.lead_name,
              _stage: l.status, _value: null, _owner: l.lead_owner,
              _date: l.creation, _sort: l._createdDaysAgo,
            })),
            ...CUSTOM_LEADS.map((l) => ({
              _pipeline: "Leads", _id: l.name, _client: l.client_name,
              _stage: l.sales_status, _value: l.total, _owner: l.lead_owner,
              _date: l.lead_date, _sort: l._createdDaysAgo,
            })),
          ].sort((a, b) => a._sort - b._sort),
        },
      },
    },
  };
}

/* =====================================================================
   LEAD CONVERSION — supports both pipelines
   ===================================================================== */

function leadConversion() {
  const s = conversionSummary();
  const byOwner = conversionByOwner();

  return {
    title: "Lead Conversion",
    group: "Leads & Pipeline",
    source: "Lead → Leads → Won",
    description:
      "How leads progress from first capture through to a won deal. Both pipelines are shown because conversion spans them.",
    pipelines: {
      standard: {
        source: "Lead",
        note: "Movement through the standard status ladder. Conversion here means the lead reached Opportunity or beyond.",
        kpis: [
          { label: "Total leads", value: s.captured, accent: "blue" },
          { label: "Qualified", value: s.qualified, accent: "brand" },
          { label: "Qualify rate", value: s.qualifyRate, format: "percent", accent: "purple" },
          { label: "Reached deal stage", value: s.intoDeals, accent: "amber" },
        ],
        charts: [
          { type: "funnel", title: "Standard lead funnel", data: standardFunnel(), span: 7 },
          { type: "donut", title: "Status split", span: 5,
            data: LEAD_STATUS.map((st, i) => ({
              name: st,
              value: STANDARD_LEADS.filter((l) => l.status === st).length,
              color: [C.faint, C.blue, C.purple, C.amber, C.brand, C.brand, C.red][i],
            })).filter((d) => d.value > 0) },
        ],
        table: {
          title: "Conversion by owner",
          columns: [
            { key: "name", label: "Salesperson", primary: true },
            { key: "captured", label: "Captured", align: "right" },
            { key: "qualified", label: "Qualified", align: "right" },
            { key: "deals", label: "Deals", align: "right" },
          ],
          rows: byOwner,
        },
      },

      custom: {
        source: "Leads (custom DocType)",
        note: "Progress through the 13-stage commercial pipeline. Win rate counts Confirmed and beyond against Lost.",
        kpis: [
          { label: "Deals", value: CUSTOM_LEADS.length, accent: "purple" },
          { label: "Won", value: s.won, accent: "brand" },
          { label: "Win rate", value: s.winRate, format: "percent", accent: "blue" },
          { label: "Won value", value: s.wonValue, format: "money", accent: "amber" },
        ],
        charts: [
          { type: "funnel", title: "Deal stage funnel", data: customPipeline().map((p) => ({ stage: p.stage, count: p.count })), span: 7 },
          { type: "donut", title: "Won / open / lost", span: 5,
            data: [
              { name: "Won", value: s.won, color: C.brand },
              { name: "Open", value: CUSTOM_LEADS.filter((l) => l._isOpen).length, color: C.blue },
              { name: "Lost", value: s.lost, color: C.red },
            ] },
          { type: "hbar", title: "Pipeline value by stage", data: customPipeline(), labelKey: "stage",
            series: [{ key: "value", label: "Value", color: C.purple, format: "money" }], span: 12 },
        ],
        table: {
          title: "Win rate by owner",
          columns: [
            { key: "name", label: "Salesperson", primary: true },
            { key: "deals", label: "Deals", align: "right" },
            { key: "won", label: "Won", align: "right" },
            { key: "winRate", label: "Win rate", align: "right", format: "percent" },
            { key: "wonValue", label: "Won value", align: "right", format: "money", strong: true },
          ],
          rows: byOwner,
        },
      },

      combined: {
        source: "Lead + Leads (custom)",
        note: "The full journey. Each step below is a real drop-off point across the two DocTypes.",
        kpis: [
          { label: "Captured", value: s.captured, accent: "blue" },
          { label: "Became deals", value: s.intoDeals, accent: "purple" },
          { label: "Won", value: s.won, accent: "brand" },
          { label: "End-to-end rate", value: Math.round((s.won / s.captured) * 100), format: "percent", accent: "amber" },
        ],
        charts: [
          { type: "funnel", title: "Capture to close", span: 12,
            data: [
              { stage: "Leads captured (Lead)", count: s.captured },
              { stage: "Qualified (Lead)", count: s.qualified },
              { stage: "Became deals (Leads)", count: s.intoDeals },
              { stage: "In negotiation (Leads)", count: CUSTOM_LEADS.filter((l) => ["Commercial Proposal", "Negotiation"].includes(l.sales_status)).length },
              { stage: "Won (Leads)", count: s.won },
            ] },
          { type: "hbar", title: "Won value by salesperson", data: byOwner, labelKey: "name",
            series: [{ key: "wonValue", label: "Won value", color: C.brand, format: "money" }], span: 12 },
        ],
        table: {
          title: "Full funnel by owner",
          columns: [
            { key: "name", label: "Salesperson", primary: true },
            { key: "captured", label: "Captured", align: "right" },
            { key: "qualified", label: "Qualified", align: "right" },
            { key: "deals", label: "Deals", align: "right" },
            { key: "won", label: "Won", align: "right" },
            { key: "winRate", label: "Win rate", align: "right", format: "percent" },
            { key: "wonValue", label: "Won value", align: "right", format: "money", strong: true },
          ],
          rows: byOwner,
        },
      },
    },
  };
}

/* =====================================================================
   Remaining 18 reports
   ===================================================================== */

const r0 = rng(0xbeef);

function simpleReports() {
  const calls7 = callsByOwner(7);
  const act7 = activityByOwner(7);
  const trend30 = activityTrend(30);
  const sTrend = salesTrend(30);
  const sOwner = salesByOwner(30);
  const stale = staleCustomers(7);
  const engagement = customerEngagement();
  const pending = pendingPayments();
  const overdue = overdueInvoices();

  const contacts = COMPANIES.slice(0, 30).map((c, i) => ({
    customer: c,
    name1: ["Ahmed Al Mansoori", "Sara Khan", "Omar Haddad", "Layla Nasser", "Yusuf Rahman", "Fatima Ali"][i % 6],
    role: CONTACT_ROLES[i % CONTACT_ROLES.length],
    email: `contact${i + 1}@${c.toLowerCase().replace(/[^a-z]/g, "").slice(0, 10)}.com`,
    phone_number: `+971 5${(i % 10)} ${100 + i} ${1000 + i * 7}`,
  }));

  return {
    /* ---------------- SALES ---------------- */
    "daily-sales-activity": {
      title: "Daily Sales Activity", group: "Sales",
      source: "Customer Activity Detail (child of Customer)",
      description: "Every logged activity, day by day, with completion status.",
      kpis: [
        { label: "Activities (30d)", value: ACTIVITIES.filter((a) => a._daysAgo < 30).length, accent: "brand" },
        { label: "Completed", value: ACTIVITIES.filter((a) => a._daysAgo < 30 && a.progress === PROGRESS.COMPLETE).length, accent: "blue" },
        { label: "In progress", value: ACTIVITIES.filter((a) => a._daysAgo < 30 && a.progress === PROGRESS.IN_PROGRESS).length, accent: "amber" },
        { label: "Rejected", value: ACTIVITIES.filter((a) => a._daysAgo < 30 && a.progress === PROGRESS.REJECTED).length, accent: "red" },
      ],
      charts: [
        { type: "area", title: "Activity trend", data: trend30, xKey: "date", xFormat: "date", span: 8,
          series: [{ key: "activities", label: "All activities", color: C.brand }, { key: "calls", label: "Calls", color: C.purple }] },
        { type: "donut", title: "By type", data: activityMix(30), span: 4 },
      ],
      table: {
        title: "Activity log",
        columns: [
          { key: "date", label: "Date", format: "date" },
          { key: "time", label: "Time", mono: true },
          { key: "parent", label: "Customer", primary: true },
          { key: "activity_type", label: "Type", badge: "activityType" },
          { key: "phone_call_scenario", label: "Scenario" },
          { key: "progress", label: "Progress", badge: "progress" },
          { key: "owner", label: "Logged by", user: true },
        ],
        rows: ACTIVITIES.filter((a) => a._daysAgo < 30).slice(0, 200),
      },
    },

    "sales-order": {
      title: "Sales Order", group: "Sales", source: "Sales Order",
      description: "Confirmed orders, delivery progress and billing status.",
      kpis: [
        { label: "Orders (30d)", value: ORDERS.filter((o) => o._daysAgo < 30).length, accent: "brand" },
        { label: "Order value", value: ORDERS.filter((o) => o._daysAgo < 30).reduce((s, o) => s + o.grand_total, 0), format: "money", accent: "blue" },
        { label: "Completed", value: ORDERS.filter((o) => o.status === "Completed").length, accent: "purple" },
        { label: "Awaiting delivery", value: ORDERS.filter((o) => o.status.includes("Deliver")).length, accent: "amber" },
      ],
      charts: [
        { type: "area", title: "Order value per day", data: sTrend, xKey: "date", xFormat: "date", span: 12,
          series: [{ key: "orders", label: "Order value", color: C.brand, format: "money" }] },
      ],
      table: {
        title: "Orders",
        columns: [
          { key: "name", label: "Order", mono: true },
          { key: "customer", label: "Customer", primary: true },
          { key: "transaction_date", label: "Date", format: "date" },
          { key: "delivery_date", label: "Delivery", format: "date" },
          { key: "status", label: "Status", badge: "orderStatus" },
          { key: "per_delivered", label: "Delivered", align: "right", format: "percent" },
          { key: "grand_total", label: "Value", align: "right", format: "money", strong: true },
        ],
        rows: [...ORDERS].sort((a, b) => a._daysAgo - b._daysAgo),
      },
    },

    "sales-invoice": {
      title: "Sales Invoice", group: "Sales", source: "Sales Invoice",
      description: "Invoices raised, paid and outstanding.",
      kpis: [
        { label: "Invoices (30d)", value: INVOICES.filter((i) => i._daysAgo < 30).length, accent: "brand" },
        { label: "Invoiced value", value: INVOICES.filter((i) => i._daysAgo < 30).reduce((s, i) => s + i.grand_total, 0), format: "money", accent: "blue" },
        { label: "Outstanding", value: INVOICES.reduce((s, i) => s + i.outstanding_amount, 0), format: "money", accent: "amber" },
        { label: "Overdue", value: overdue.length, accent: "red" },
      ],
      charts: [
        { type: "area", title: "Invoiced value per day", data: sTrend, xKey: "date", xFormat: "date", span: 8,
          series: [{ key: "sales", label: "Invoiced", color: C.brand, format: "money" }] },
        { type: "donut", title: "By status", span: 4,
          data: ["Paid", "Unpaid", "Overdue", "Partly Paid"].map((s, i) => ({
            name: s, value: INVOICES.filter((x) => x.status === s).length,
            color: [C.brand, C.blue, C.red, C.amber][i] })) },
      ],
      table: {
        title: "Invoices",
        columns: [
          { key: "name", label: "Invoice", mono: true },
          { key: "customer", label: "Customer", primary: true },
          { key: "posting_date", label: "Posted", format: "date" },
          { key: "due_date", label: "Due", format: "date" },
          { key: "status", label: "Status", badge: "invoiceStatus" },
          { key: "grand_total", label: "Total", align: "right", format: "money" },
          { key: "outstanding_amount", label: "Outstanding", align: "right", format: "money", strong: true },
        ],
        rows: [...INVOICES].sort((a, b) => a._daysAgo - b._daysAgo),
      },
    },

    "sales-value-by-salesperson": {
      title: "Sales Value by Salesperson", group: "Sales",
      source: "Sales Invoice + Sales Team",
      description: "Invoiced value, order value and quotation win rate per salesperson.",
      kpis: [
        { label: "Total invoiced", value: sOwner.reduce((s, o) => s + o.invoiced, 0), format: "money", accent: "brand" },
        { label: "Top performer", value: sOwner[0]?.name ?? "—", format: "text", accent: "blue" },
        { label: "Total outstanding", value: sOwner.reduce((s, o) => s + o.outstanding, 0), format: "money", accent: "amber" },
        { label: "Avg win rate", value: Math.round(sOwner.reduce((s, o) => s + o.quotationWinRate, 0) / sOwner.length), format: "percent", accent: "purple" },
      ],
      charts: [
        { type: "hbar", title: "Invoiced value", data: sOwner, labelKey: "name", span: 12,
          series: [{ key: "invoiced", label: "Invoiced", color: C.brand, format: "money" }] },
      ],
      table: {
        title: "By salesperson",
        columns: [
          { key: "name", label: "Salesperson", primary: true },
          { key: "quotations", label: "Quotations", align: "right" },
          { key: "quotationWinRate", label: "Win rate", align: "right", format: "percent" },
          { key: "orders", label: "Orders", align: "right" },
          { key: "invoiced", label: "Invoiced", align: "right", format: "money", strong: true },
          { key: "outstanding", label: "Outstanding", align: "right", format: "money" },
        ],
        rows: sOwner,
      },
    },

    "quotation-performance": {
      title: "Quotation Performance", group: "Sales", source: "Quotation",
      description: "How many quotations convert into orders, and what gets lost.",
      kpis: [
        { label: "Quotations (90d)", value: QUOTATIONS.length, accent: "brand" },
        { label: "Ordered", value: QUOTATIONS.filter((q) => q._won).length, accent: "blue" },
        { label: "Win rate", value: Math.round((QUOTATIONS.filter((q) => q._won).length / QUOTATIONS.length) * 100), format: "percent", accent: "purple" },
        { label: "Lost value", value: QUOTATIONS.filter((q) => q.status === "Lost").reduce((s, q) => s + q.grand_total, 0), format: "money", accent: "red" },
      ],
      charts: [
        { type: "funnel", title: "Quotation outcomes", span: 6,
          data: quotationFunnel().map((q) => ({ stage: q.status, count: q.count })) },
        { type: "hbar", title: "Value by outcome", data: quotationFunnel(), labelKey: "status", span: 6,
          series: [{ key: "value", label: "Value", color: C.brand, format: "money" }] },
      ],
      table: {
        title: "Quotations",
        columns: [
          { key: "name", label: "Quotation", mono: true },
          { key: "party_name", label: "Customer", primary: true },
          { key: "transaction_date", label: "Date", format: "date" },
          { key: "valid_till", label: "Valid till", format: "date" },
          { key: "status", label: "Status", badge: "quotationStatus" },
          { key: "grand_total", label: "Value", align: "right", format: "money", strong: true },
          { key: "owner", label: "Owner", user: true },
        ],
        rows: [...QUOTATIONS].sort((a, b) => a._daysAgo - b._daysAgo),
      },
    },

    "sales-cycle-duration": {
      title: "Sales Cycle Duration", group: "Sales",
      source: "Lead → Quotation → Sales Order",
      description: "Average days spent at each handover point, against target.",
      kpis: cycleDurations().map((c, i) => ({
        label: c.stage, value: c.days, format: "days",
        accent: ["blue", "purple", "brand", "amber"][i],
      })),
      charts: [
        { type: "hbar", title: "Actual vs target (days)", data: cycleDurations(), labelKey: "stage", span: 12,
          series: [{ key: "days", label: "Actual", color: C.brand }, { key: "target", label: "Target", color: C.faint }] },
      ],
      table: {
        title: "Cycle stages",
        columns: [
          { key: "stage", label: "Stage", primary: true },
          { key: "days", label: "Average days", align: "right", format: "days" },
          { key: "target", label: "Target", align: "right", format: "days" },
        ],
        rows: cycleDurations(),
      },
    },

    /* ---------------- PIPELINE ---------------- */
    "opportunity-pipeline": {
      title: "Opportunity Pipeline", group: "Leads & Pipeline", source: "Opportunity + Leads",
      description: "Open commercial pipeline by stage, with weighted value.",
      kpis: [
        { label: "Open deals", value: CUSTOM_LEADS.filter((l) => l._isOpen).length, accent: "blue" },
        { label: "Pipeline value", value: CUSTOM_LEADS.filter((l) => l._isOpen).reduce((s, l) => s + l.total, 0), format: "money", accent: "brand" },
        { label: "Weighted value", value: Math.round(CUSTOM_LEADS.filter((l) => l._isOpen).reduce((s, l) => s + (l.total * l.probability) / 100, 0)), format: "money", accent: "purple" },
        { label: "Avg probability", value: Math.round(CUSTOM_LEADS.filter((l) => l._isOpen).reduce((s, l) => s + l.probability, 0) / Math.max(CUSTOM_LEADS.filter((l) => l._isOpen).length, 1)), format: "percent", accent: "amber" },
      ],
      charts: [
        { type: "funnel", title: "Pipeline by stage", data: customPipeline(), span: 7 },
        { type: "donut", title: "By category", span: 5,
          data: categoryMix().map((c, i) => ({ name: c.name, value: c.count, color: [C.brand, C.blue, C.purple, C.amber, C.faint][i % 5] })) },
      ],
      table: {
        title: "Open deals",
        columns: [
          { key: "name", label: "ID", mono: true },
          { key: "client_name", label: "Client", primary: true },
          { key: "sales_status", label: "Stage", badge: "salesStatus" },
          { key: "category", label: "Category" },
          { key: "probability", label: "Prob.", align: "right", format: "percent" },
          { key: "total", label: "Value", align: "right", format: "money", strong: true },
          { key: "expected_closing_date", label: "Expected close", align: "right", format: "date" },
          { key: "lead_owner", label: "Owner", user: true },
        ],
        rows: CUSTOM_LEADS.filter((l) => l._isOpen).sort((a, b) => b.total - a.total),
      },
    },

    /* ---------------- ACTIVITIES ---------------- */
    "calls-by-salesperson": {
      title: "Calls by Salesperson", group: "Calls & Activities",
      source: "Customer Activity Detail + Call Log",
      description: "Call volume, completion rate and average duration per person.",
      kpis: [
        { label: "Calls (7d)", value: calls7.reduce((s, c) => s + c.calls, 0), accent: "purple" },
        { label: "Completed", value: calls7.reduce((s, c) => s + c.completed, 0), accent: "brand" },
        { label: "Avg completion", value: Math.round(calls7.reduce((s, c) => s + c.completionRate, 0) / calls7.length), format: "percent", accent: "blue" },
        { label: "Most active", value: calls7[0]?.name ?? "—", format: "text", accent: "amber" },
      ],
      charts: [
        { type: "hbar", title: "Calls this week", data: calls7, labelKey: "name", span: 7,
          series: [{ key: "calls", label: "Calls", color: C.purple }, { key: "completed", label: "Completed", color: C.brand }] },
        { type: "area", title: "Daily call volume", data: trend30, xKey: "date", xFormat: "date", span: 5,
          series: [{ key: "calls", label: "Calls", color: C.purple }] },
      ],
      table: {
        title: "By salesperson",
        columns: [
          { key: "name", label: "Salesperson", primary: true },
          { key: "calls", label: "Calls", align: "right" },
          { key: "completed", label: "Completed", align: "right" },
          { key: "completionRate", label: "Rate", align: "right", format: "percent" },
          { key: "avgDuration", label: "Avg duration", align: "right", format: "duration" },
        ],
        rows: calls7,
      },
    },

    "employee-activity": {
      title: "Employee Activity", group: "Calls & Activities",
      source: "Customer Activity Detail (child of Customer)",
      description: "Activity volume per person, split by type.",
      kpis: [
        { label: "Activities (7d)", value: act7.reduce((s, a) => s + a.total, 0), accent: "brand" },
        { label: "Avg per person", value: Math.round(act7.reduce((s, a) => s + a.total, 0) / act7.length), accent: "blue" },
        { label: "Most active", value: act7[0]?.name ?? "—", format: "text", accent: "purple" },
        { label: "Below average", value: act7.filter((a) => a.total < act7.reduce((s, x) => s + x.total, 0) / act7.length).length, accent: "amber" },
      ],
      charts: [
        { type: "bar", title: "Activity mix by person", data: act7, xKey: "name", span: 12, stacked: true,
          series: [
            { key: "Call", label: "Calls", color: C.purple },
            { key: "Email", label: "Emails", color: C.brand },
            { key: "Meeting", label: "Meetings", color: C.blue },
            { key: "Task", label: "Tasks", color: C.amber },
            { key: "Visit", label: "Visits", color: C.faint },
          ] },
      ],
      table: {
        title: "By employee",
        columns: [
          { key: "name", label: "Employee", primary: true },
          { key: "Call", label: "Calls", align: "right" },
          { key: "Email", label: "Emails", align: "right" },
          { key: "Meeting", label: "Meetings", align: "right" },
          { key: "Task", label: "Tasks", align: "right" },
          { key: "Visit", label: "Visits", align: "right" },
          { key: "total", label: "Total", align: "right", strong: true },
        ],
        rows: act7,
      },
    },

    "overdue-activities": {
      title: "Overdue Activities", group: "Calls & Activities",
      source: "Customer Activity Detail.progress",
      description: "Activities still marked In Progress after five days or more.",
      kpis: [
        { label: "Overdue", value: overdueActivities().length, accent: "red" },
        { label: "Oldest", value: overdueActivities()[0]?._daysAgo ?? 0, format: "days", accent: "amber" },
        { label: "Owners affected", value: new Set(overdueActivities().map((a) => a.owner)).size, accent: "blue" },
        { label: "Customers affected", value: new Set(overdueActivities().map((a) => a.parent)).size, accent: "purple" },
      ],
      charts: [
        { type: "hbar", title: "Overdue by owner", labelKey: "name", span: 12,
          data: SALESPEOPLE.map((p) => ({
            name: p.name,
            count: overdueActivities().filter((a) => a.owner === p.user).length,
          })).sort((a, b) => b.count - a.count),
          series: [{ key: "count", label: "Overdue items", color: C.red }] },
      ],
      table: {
        title: "Overdue items",
        columns: [
          { key: "date", label: "Logged", format: "date" },
          { key: "_daysAgo", label: "Age", align: "right", format: "days" },
          { key: "parent", label: "Customer", primary: true },
          { key: "activity_type", label: "Type", badge: "activityType" },
          { key: "phone_call_scenario", label: "Scenario" },
          { key: "owner", label: "Owner", user: true },
        ],
        rows: overdueActivities(),
      },
    },

    "daily-working-pattern": {
      title: "Daily Working Pattern", group: "Calls & Activities",
      source: "Customer Activity Detail.time",
      description: "When the sales team actually works — busiest hours and days.",
      kpis: [
        { label: "Busiest hour", value: hourlyPattern().sort((a, b) => b.activities - a.activities)[0].hour, format: "text", accent: "brand" },
        { label: "Busiest day", value: weekdayPattern().sort((a, b) => b.activities - a.activities)[0].day, format: "text", accent: "blue" },
        { label: "Activities logged", value: ACTIVITIES.length, accent: "purple" },
        { label: "Active hours/day", value: 9, format: "text", accent: "amber" },
      ],
      charts: [
        { type: "bar", title: "Activity by hour of day", data: hourlyPattern(), xKey: "hour", span: 7,
          series: [{ key: "activities", label: "Activities", color: C.brand }, { key: "calls", label: "Calls", color: C.purple }] },
        { type: "bar", title: "Activity by weekday", data: weekdayPattern(), xKey: "day", span: 5,
          series: [{ key: "activities", label: "Activities", color: C.blue }] },
      ],
      table: {
        title: "Hourly breakdown",
        columns: [
          { key: "hour", label: "Hour", primary: true, mono: true },
          { key: "activities", label: "Activities", align: "right" },
          { key: "calls", label: "Calls", align: "right" },
        ],
        rows: hourlyPattern(),
      },
    },

    /* ---------------- CUSTOMERS ---------------- */
    "customer-contact": {
      title: "Customer Contact", group: "Customers",
      source: "Customer Contacts (child of Customer)",
      description: "Named contacts held against each customer, by role.",
      kpis: [
        { label: "Contacts", value: contacts.length, accent: "brand" },
        { label: "Customers covered", value: new Set(contacts.map((c) => c.customer)).size, accent: "blue" },
        { label: "Decision makers", value: contacts.filter((c) => /CEO|CTO|Director/.test(c.role)).length, accent: "purple" },
        { label: "Missing contacts", value: COMPANIES.length - new Set(contacts.map((c) => c.customer)).size, accent: "amber" },
      ],
      charts: [
        { type: "hbar", title: "Contacts by role", labelKey: "role", span: 12,
          data: CONTACT_ROLES.map((role) => ({ role, count: contacts.filter((c) => c.role === role).length })).sort((a, b) => b.count - a.count),
          series: [{ key: "count", label: "Contacts", color: C.brand }] },
      ],
      table: {
        title: "Contacts",
        columns: [
          { key: "customer", label: "Customer", primary: true },
          { key: "name1", label: "Contact" },
          { key: "role", label: "Role" },
          { key: "email", label: "Email" },
          { key: "phone_number", label: "Phone", mono: true },
        ],
        rows: contacts,
      },
    },

    "customer-follow-up": {
      title: "Customer Follow-Up", group: "Customers",
      source: "Customer Activity Detail",
      description: "Most recent contact per customer and what stage they sit at.",
      kpis: [
        { label: "Customers", value: COMPANIES.length, accent: "brand" },
        { label: "Contacted (7d)", value: COMPANIES.length - stale.length, accent: "blue" },
        { label: "Awaiting follow-up", value: stale.length, accent: "amber" },
        { label: "Never contacted", value: stale.filter((s) => s.lastContactDays == null).length, accent: "red" },
      ],
      charts: [
        { type: "area", title: "Contact activity trend", data: trend30, xKey: "date", xFormat: "date", span: 12,
          series: [{ key: "completed", label: "Completed contacts", color: C.brand }] },
      ],
      table: {
        title: "Follow-up status",
        columns: [
          { key: "customer", label: "Customer", primary: true },
          { key: "stage", label: "Pipeline stage" },
          { key: "lastContact", label: "Last contact", format: "date" },
          { key: "lastContactDays", label: "Days since", align: "right", format: "days" },
          { key: "owner", label: "Owner", user: true },
        ],
        rows: stale,
      },
    },

    "missed-follow-ups": {
      title: "Missed Follow-Ups", group: "Customers",
      source: "Customer Activity Detail.progress",
      description: "Completed calls that were never followed by another activity.",
      kpis: [
        { label: "Missed follow-ups", value: callsWithoutFollowUp().length, accent: "red" },
        { label: "Customers affected", value: new Set(callsWithoutFollowUp().map((c) => c.customer)).size, accent: "amber" },
        { label: "Avg days waiting", value: Math.round(callsWithoutFollowUp().reduce((s, c) => s + c.daysSince, 0) / Math.max(callsWithoutFollowUp().length, 1)), format: "days", accent: "purple" },
        { label: "Owners involved", value: new Set(callsWithoutFollowUp().map((c) => c.owner)).size, accent: "blue" },
      ],
      charts: [
        { type: "hbar", title: "Missed follow-ups by owner", labelKey: "name", span: 12,
          data: SALESPEOPLE.map((p) => ({ name: p.name, count: callsWithoutFollowUp().filter((c) => c.owner === p.user).length })).sort((a, b) => b.count - a.count),
          series: [{ key: "count", label: "Missed", color: C.amber }] },
      ],
      table: {
        title: "Calls awaiting follow-up",
        columns: [
          { key: "customer", label: "Customer", primary: true },
          { key: "lastCall", label: "Last call", format: "date" },
          { key: "daysSince", label: "Days since", align: "right", format: "days" },
          { key: "scenario", label: "Call scenario" },
          { key: "owner", label: "Owner", user: true },
        ],
        rows: callsWithoutFollowUp(),
      },
    },

    "customer-engagement": {
      title: "Customer Engagement", group: "Customers",
      source: "Customer + Sales Invoice",
      description: "Value against recency. High value plus long silence is the risk segment.",
      kpis: [
        { label: "Active customers", value: engagement.length, accent: "brand" },
        { label: "Total value", value: engagement.reduce((s, c) => s + c.value, 0), format: "money", accent: "blue" },
        { label: "At risk", value: engagement.filter((c) => c.atRisk).length, accent: "red" },
        { label: "At-risk value", value: engagement.filter((c) => c.atRisk).reduce((s, c) => s + c.value, 0), format: "money", accent: "amber" },
      ],
      charts: [
        { type: "hbar", title: "Top customers by value", data: engagement.slice(0, 10), labelKey: "customer", span: 12,
          series: [{ key: "value", label: "Invoiced value", color: C.brand, format: "money" }] },
      ],
      table: {
        title: "Engagement",
        columns: [
          { key: "customer", label: "Customer", primary: true },
          { key: "invoices", label: "Invoices", align: "right" },
          { key: "value", label: "Value", align: "right", format: "money", strong: true },
          { key: "outstanding", label: "Outstanding", align: "right", format: "money" },
          { key: "lastContactDays", label: "Days since contact", align: "right", format: "days" },
          { key: "atRisk", label: "Status", badge: "risk" },
        ],
        rows: engagement,
      },
    },

    /* ---------------- FINANCE ---------------- */
    "pending-payment": {
      title: "Pending Payment", group: "Finance",
      source: "Sales Invoice.outstanding_amount",
      description: "Every invoice with money still outstanding.",
      kpis: [
        { label: "Pending invoices", value: pending.length, accent: "amber" },
        { label: "Total outstanding", value: pending.reduce((s, i) => s + i.outstanding_amount, 0), format: "money", accent: "red" },
        { label: "Customers", value: new Set(pending.map((i) => i.customer)).size, accent: "blue" },
        { label: "Largest single", value: pending[0]?.outstanding_amount ?? 0, format: "money", accent: "purple" },
      ],
      charts: [
        { type: "hbar", title: "Outstanding by customer", labelKey: "customer", span: 12,
          data: Object.entries(pending.reduce((acc, i) => { acc[i.customer] = (acc[i.customer] || 0) + i.outstanding_amount; return acc; }, {}))
            .map(([customer, outstanding]) => ({ customer, outstanding }))
            .sort((a, b) => b.outstanding - a.outstanding).slice(0, 10),
          series: [{ key: "outstanding", label: "Outstanding", color: C.amber, format: "money" }] },
      ],
      table: {
        title: "Pending payments",
        columns: [
          { key: "name", label: "Invoice", mono: true },
          { key: "customer", label: "Customer", primary: true },
          { key: "posting_date", label: "Posted", format: "date" },
          { key: "due_date", label: "Due", format: "date" },
          { key: "status", label: "Status", badge: "invoiceStatus" },
          { key: "grand_total", label: "Total", align: "right", format: "money" },
          { key: "outstanding_amount", label: "Outstanding", align: "right", format: "money", strong: true },
        ],
        rows: pending,
      },
    },

    "overdue-invoice": {
      title: "Overdue Invoice", group: "Finance",
      source: "Sales Invoice.due_date",
      description: "Invoices past their due date, bucketed by how late they are.",
      kpis: [
        { label: "Overdue invoices", value: overdue.length, accent: "red" },
        { label: "Overdue value", value: overdue.reduce((s, i) => s + i.outstanding_amount, 0), format: "money", accent: "amber" },
        { label: "Oldest", value: overdue[0]?._overdueDays ?? 0, format: "days", accent: "purple" },
        { label: "Customers", value: new Set(overdue.map((i) => i.customer)).size, accent: "blue" },
      ],
      charts: [
        { type: "bar", title: "Ageing buckets", data: ageingBuckets(), xKey: "bucket", span: 6,
          series: [{ key: "count", label: "Invoices", color: C.red }] },
        { type: "hbar", title: "Value by bucket", data: ageingBuckets(), labelKey: "bucket", span: 6,
          series: [{ key: "value", label: "Value", color: C.amber, format: "money" }] },
      ],
      table: {
        title: "Overdue invoices",
        columns: [
          { key: "name", label: "Invoice", mono: true },
          { key: "customer", label: "Customer", primary: true },
          { key: "due_date", label: "Due", format: "date" },
          { key: "_overdueDays", label: "Days late", align: "right", format: "days" },
          { key: "outstanding_amount", label: "Outstanding", align: "right", format: "money", strong: true },
          { key: "owner", label: "Owner", user: true },
        ],
        rows: overdue,
      },
    },

    /* ---------------- PEOPLE ---------------- */
    "salesperson-performance": {
      title: "Salesperson Performance", group: "People",
      source: "Sales Person + Sales Team",
      description: "Activity effort against commercial result, per person.",
      kpis: [
        { label: "Team invoiced", value: sOwner.reduce((s, o) => s + o.invoiced, 0), format: "money", accent: "brand" },
        { label: "Activities (7d)", value: act7.reduce((s, a) => s + a.total, 0), accent: "blue" },
        { label: "Top by value", value: sOwner[0]?.name ?? "—", format: "text", accent: "purple" },
        { label: "Top by activity", value: act7[0]?.name ?? "—", format: "text", accent: "amber" },
      ],
      charts: [
        { type: "hbar", title: "Invoiced value", data: sOwner, labelKey: "name", span: 6,
          series: [{ key: "invoiced", label: "Invoiced", color: C.brand, format: "money" }] },
        { type: "hbar", title: "Activity volume", data: act7, labelKey: "name", span: 6,
          series: [{ key: "total", label: "Activities", color: C.blue }] },
      ],
      table: {
        title: "Performance",
        columns: [
          { key: "name", label: "Salesperson", primary: true },
          { key: "quotations", label: "Quotations", align: "right" },
          { key: "quotationWinRate", label: "Win rate", align: "right", format: "percent" },
          { key: "orders", label: "Orders", align: "right" },
          { key: "invoiced", label: "Invoiced", align: "right", format: "money", strong: true },
        ],
        rows: sOwner,
      },
    },
  };
}

/* ------------------------------------------------------------------ */

let _cache = null;
function all() {
  if (!_cache) {
    _cache = {
      "lead-generation": leadGeneration(),
      "lead-conversion": leadConversion(),
      ...simpleReports(),
    };
  }
  return _cache;
}

export function getReport(slug) {
  return all()[slug] ?? null;
}

export function getAllSlugs() {
  return Object.keys(all());
}

export { PIPELINES };
