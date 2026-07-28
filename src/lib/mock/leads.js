/**
 * THE TWO LEAD PIPELINES.
 *
 * Both are live in BoxTech's ERPNext, and they are not duplicates of each other.
 * Reading the schema carefully:
 *
 *   `Lead`  (standard, 44 fields)
 *     Top-of-funnel capture. Has status, qualification_status, utm_source,
 *     email/phone, territory. NO monetary value. Its job is to record that
 *     someone showed interest and whether they were qualified.
 *
 *   `Leads` (custom, 17 fields, naming series CRM-LEAD-.YYYY.-)
 *     A deal tracker. Has sales_status with THIRTEEN stages, total /
 *     base_total currency, probability, expected_closing_date, category and
 *     manufacturer. Its job is to track a commercial opportunity to close.
 *
 * So the funnel really runs: Lead (captured) -> qualified -> Leads (deal) -> won.
 * Reports must therefore be able to show either pipeline alone, or the two
 * joined end to end. That is what PIPELINES below encodes.
 */

import { rng, pick, int, float, weighted, chance, daysBefore } from "./rng";
import {
  SALESPEOPLE,
  TERRITORIES,
  CATEGORIES,
  MANUFACTURERS,
  LEAD_SOURCES,
  COMPANIES,
} from "./reference";

/* ------------------------------------------------------------------ */
/* Enum values — copied verbatim from last_clean_schema.json           */
/* ------------------------------------------------------------------ */

/** Lead.status */
export const LEAD_STATUS = [
  "Lead",
  "Open",
  "Replied",
  "Opportunity",
  "Quotation",
  "Converted",
  "Do Not Contact",
];

/** Lead.qualification_status */
export const QUALIFICATION_STATUS = ["Unqualified", "In Process", "Qualified"];

/** Leads.sales_status — the custom 13-stage commercial pipeline */
export const SALES_STATUS = [
  "Potential Lead",
  "Initial Inquiry",
  "Technical Requirement",
  "Solution Proposal",
  "Stock Availability",
  "Client Feedback",
  "Commercial Proposal",
  "Negotiation",
  "Confirmed",
  "Payment Pending",
  "Shipment",
  "Sales Completed",
  "Lost",
];

/** Stages that count as an active, still-open deal. */
export const OPEN_STAGES = SALES_STATUS.slice(0, 8);
/** Stages that count as won. */
export const WON_STAGES = ["Confirmed", "Payment Pending", "Shipment", "Sales Completed"];

export const PIPELINES = {
  standard: {
    id: "standard",
    label: "Lead",
    sublabel: "Standard capture funnel",
    doctype: "Lead",
    accent: "blue",
  },
  custom: {
    id: "custom",
    label: "Leads",
    sublabel: "Custom deal pipeline",
    doctype: "Leads (custom)",
    accent: "purple",
  },
  combined: {
    id: "combined",
    label: "Both",
    sublabel: "Capture through to close",
    doctype: "Lead + Leads",
    accent: "brand",
  },
};

/* ------------------------------------------------------------------ */
/* Standard Lead records                                               */
/* ------------------------------------------------------------------ */

function buildStandardLeads(count = 96) {
  const r = rng(20260727);
  const rows = [];

  for (let i = 0; i < count; i++) {
    const company = COMPANIES[i % COMPANIES.length];
    const owner = pick(r, SALESPEOPLE);
    const created = int(r, 0, 89);

    /* Weighted so the funnel narrows realistically rather than sitting flat. */
    const status = weighted(r, [
      ["Lead", 26],
      ["Open", 20],
      ["Replied", 14],
      ["Opportunity", 12],
      ["Quotation", 8],
      ["Converted", 12],
      ["Do Not Contact", 8],
    ]);

    /* Qualification correlates with status — a Converted lead is not Unqualified. */
    const qualification =
      status === "Converted" || status === "Quotation"
        ? "Qualified"
        : status === "Do Not Contact"
          ? "Unqualified"
          : weighted(r, [
              ["Unqualified", 30],
              ["In Process", 45],
              ["Qualified", 25],
            ]);

    rows.push({
      name: `CRM-LEAD-2026-${String(i + 1).padStart(5, "0")}`,
      lead_name: company,
      company_name: company,
      status,
      qualification_status: qualification,
      lead_owner: owner.user,
      territory: pick(r, TERRITORIES),
      utm_source: pick(r, LEAD_SOURCES),
      email_id: `contact@${company.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)}.com`,
      phone: `+971 5${int(r, 0, 9)} ${int(r, 100, 999)} ${int(r, 1000, 9999)}`,
      creation: daysBefore(created),
      _createdDaysAgo: created,
      /* Set only when the lead progressed into the custom deal pipeline. */
      converted_to_deal: status === "Converted" || status === "Quotation",
    });
  }
  return rows;
}

/* ------------------------------------------------------------------ */
/* Custom Leads (deal) records                                         */
/* ------------------------------------------------------------------ */

function buildCustomLeads(count = 64) {
  const r = rng(0x5eed42);
  const rows = [];

  for (let i = 0; i < count; i++) {
    const company = COMPANIES[(i * 3 + 7) % COMPANIES.length];
    const owner = pick(r, SALESPEOPLE);
    const created = int(r, 0, 89);

    const sales_status = weighted(r, [
      ["Potential Lead", 10],
      ["Initial Inquiry", 12],
      ["Technical Requirement", 10],
      ["Solution Proposal", 9],
      ["Stock Availability", 5],
      ["Client Feedback", 7],
      ["Commercial Proposal", 8],
      ["Negotiation", 7],
      ["Confirmed", 8],
      ["Payment Pending", 5],
      ["Shipment", 4],
      ["Sales Completed", 9],
      ["Lost", 6],
    ]);

    const stageIndex = SALES_STATUS.indexOf(sales_status);
    const isLost = sales_status === "Lost";
    const isWon = WON_STAGES.includes(sales_status);

    /* Probability tracks how far along the stage ladder the deal is. */
    const probability = isLost
      ? 0
      : isWon
        ? int(r, 90, 100)
        : Math.min(85, 8 + stageIndex * 10 + int(r, -5, 8));

    const quantity = int(r, 25, 1200);
    const unitPrice = float(r, 18, 95);
    const total = Math.round(quantity * unitPrice);

    rows.push({
      name: `CRM-LEAD-2026-D${String(i + 1).padStart(4, "0")}`,
      client_name: company,
      country: pick(r, TERRITORIES),
      lead_date: daysBefore(created),
      _createdDaysAgo: created,
      lead_owner: owner.user,
      expected_closing_date: daysBefore(created - int(r, 20, 75)),
      probability,
      sales_status,
      category: pick(r, CATEGORIES),
      manufacturer: pick(r, MANUFACTURERS),
      quantity,
      total,
      base_total: total,
      stage_comments: isLost
        ? pick(r, [
            "Lost on price to local reseller",
            "Project postponed by client",
            "Competitor already installed",
          ])
        : pick(r, [
            "Awaiting technical sign-off",
            "Sample shipped, feedback pending",
            "Commercial terms under review",
            "Client comparing two models",
            "Waiting on stock confirmation",
          ]),
      _isWon: isWon,
      _isLost: isLost,
      _isOpen: !isWon && !isLost,
    });
  }
  return rows;
}

export const STANDARD_LEADS = buildStandardLeads();
export const CUSTOM_LEADS = buildCustomLeads();

/* ------------------------------------------------------------------ */
/* Derived aggregates used by the report pages                         */
/* ------------------------------------------------------------------ */

/** Leads created per day, for the generation trend chart. */
export function leadsPerDay(days = 30) {
  const out = [];
  for (let d = days - 1; d >= 0; d--) {
    const date = daysBefore(d);
    out.push({
      date,
      standard: STANDARD_LEADS.filter((l) => l._createdDaysAgo === d).length,
      custom: CUSTOM_LEADS.filter((l) => l._createdDaysAgo === d).length,
    });
  }
  return out;
}

/** Standard-funnel counts by status, ordered as the funnel runs. */
export function standardFunnel() {
  return LEAD_STATUS.filter((s) => s !== "Do Not Contact").map((status) => ({
    stage: status,
    count: STANDARD_LEADS.filter((l) => l.status === status).length,
  }));
}

/** Custom-pipeline counts and value by sales_status. */
export function customPipeline() {
  return SALES_STATUS.filter((s) => s !== "Lost").map((stage) => {
    const rows = CUSTOM_LEADS.filter((l) => l.sales_status === stage);
    return {
      stage,
      count: rows.length,
      value: rows.reduce((s, l) => s + l.total, 0),
    };
  });
}

/** Lead source performance — capture volume vs how many became qualified. */
export function sourcePerformance() {
  return LEAD_SOURCES.map((src) => {
    const rows = STANDARD_LEADS.filter((l) => l.utm_source === src);
    const qualified = rows.filter((l) => l.qualification_status === "Qualified");
    const converted = rows.filter((l) => l.converted_to_deal);
    return {
      source: src,
      total: rows.length,
      qualified: qualified.length,
      converted: converted.length,
      rate: rows.length ? Math.round((converted.length / rows.length) * 100) : 0,
    };
  }).sort((a, b) => b.total - a.total);
}

/** Conversion summary spanning BOTH pipelines end to end. */
export function conversionSummary() {
  const captured = STANDARD_LEADS.length;
  const qualified = STANDARD_LEADS.filter(
    (l) => l.qualification_status === "Qualified"
  ).length;
  const intoDeals = STANDARD_LEADS.filter((l) => l.converted_to_deal).length;
  const won = CUSTOM_LEADS.filter((l) => l._isWon).length;
  const lost = CUSTOM_LEADS.filter((l) => l._isLost).length;
  const openValue = CUSTOM_LEADS.filter((l) => l._isOpen).reduce(
    (s, l) => s + l.total,
    0
  );
  const wonValue = CUSTOM_LEADS.filter((l) => l._isWon).reduce(
    (s, l) => s + l.total,
    0
  );

  return {
    captured,
    qualified,
    intoDeals,
    won,
    lost,
    openValue,
    wonValue,
    qualifyRate: Math.round((qualified / captured) * 100),
    dealRate: Math.round((intoDeals / captured) * 100),
    winRate: won + lost ? Math.round((won / (won + lost)) * 100) : 0,
  };
}

/** Per-salesperson conversion across both pipelines. */
export function conversionByOwner() {
  return SALESPEOPLE.map((p) => {
    const captured = STANDARD_LEADS.filter((l) => l.lead_owner === p.user);
    const deals = CUSTOM_LEADS.filter((l) => l.lead_owner === p.user);
    const won = deals.filter((l) => l._isWon);
    return {
      user: p.user,
      name: p.name,
      captured: captured.length,
      qualified: captured.filter((l) => l.qualification_status === "Qualified").length,
      deals: deals.length,
      won: won.length,
      wonValue: won.reduce((s, l) => s + l.total, 0),
      winRate: deals.length ? Math.round((won.length / deals.length) * 100) : 0,
    };
  }).sort((a, b) => b.wonValue - a.wonValue);
}

/** Category split of the custom deal pipeline. */
export function categoryMix() {
  return CATEGORIES.map((c) => {
    const rows = CUSTOM_LEADS.filter((l) => l.category === c);
    return {
      name: c,
      count: rows.length,
      value: rows.reduce((s, l) => s + l.total, 0),
    };
  }).sort((a, b) => b.value - a.value);
}
