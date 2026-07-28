/**
 * Dashboard data.
 *
 * Everything here now DERIVES from the same fixtures the report pages use
 * (lib/mock/*). That matters: if the dashboard says 61 calls for a salesperson
 * and the Calls by Salesperson report says something else, the whole thing
 * loses credibility in a demo. One source, many views.
 */

import {
  callsByOwner, activityByOwner, activityMix, activityTrend,
  staleCustomers, ACTIVITIES, PROGRESS,
} from "./mock/activities";
import {
  salesByOwner, salesTrend, INVOICES, pendingPayments,
} from "./mock/sales";
import { CUSTOM_LEADS, conversionSummary } from "./mock/leads";

export { PROGRESS };

const calls7 = callsByOwner(7);
const act7 = activityByOwner(7);
const sales30 = salesByOwner(30);
const conv = conversionSummary();

const activitiesToday = ACTIVITIES.filter((a) => a._daysAgo === 0).length;
const callsToday = ACTIVITIES.filter(
  (a) => a._daysAgo === 0 && a.activity_type === "Call"
).length;
const salesWeek = INVOICES
  .filter((i) => i._daysAgo < 7 && i.status !== "Draft")
  .reduce((s, i) => s + i.grand_total, 0);
const outstanding = pendingPayments().reduce((s, i) => s + i.outstanding_amount, 0);
const newOpps = CUSTOM_LEADS.filter((l) => l._createdDaysAgo < 30).length;

/** Last 8 days of a series, for the KPI sparklines. */
const spark = (key) => activityTrend(8).map((d) => d[key]);
const sparkSales = () => salesTrend(8).map((d) => Math.round(d.sales));

export const KPIS = [
  {
    id: "activities", label: "Activities Today", value: activitiesToday,
    delta: 18, direction: "up", compare: "vs yesterday",
    accent: "brand", icon: "Activity", trend: spark("activities"),
  },
  {
    id: "calls", label: "Calls Today", value: callsToday,
    delta: 8, direction: "down", compare: "vs yesterday",
    accent: "blue", icon: "Phone", trend: spark("calls"),
  },
  {
    id: "opportunities", label: "New Opportunities", value: newOpps,
    delta: 24, direction: "up", compare: "vs last month",
    accent: "purple", icon: "Target", trend: spark("completed"),
  },
  {
    id: "sales", label: "Sales Value (This Week)", value: salesWeek, format: "money",
    delta: 12, direction: "up", compare: "vs last week",
    accent: "brand", icon: "DollarSign", trend: sparkSales(),
  },
  {
    id: "pending", label: "Pending Payments", value: outstanding, format: "money",
    delta: 10, direction: "up", compare: "vs last week",
    accent: "amber", icon: "Wallet", feature: true, trend: sparkSales(),
  },
];

const stale = staleCustomers(7);

export const AI_SUMMARY = {
  generatedAt: "2026-07-27T08:10:00",
  facts: [
    `${activitiesToday} activities logged today, ${callsToday} of them phone calls.`,
    `Sales value this week is ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(salesWeek)}.`,
    `${newOpps} new deals were created in the custom Leads pipeline this month.`,
  ],
  observations: [
    {
      tone: "good",
      text: `${sales30[0]?.name ?? "—"} leads on invoiced value this month at a ${sales30[0]?.quotationWinRate ?? 0}% quotation win rate.`,
    },
    {
      tone: "watch",
      text: `Capture-to-deal conversion is running at ${conv.dealRate}% across both lead pipelines, with ${conv.winRate}% of deals won once they reach the commercial stages.`,
    },
    {
      tone: "risk",
      text: `${stale.length} customers have had no logged contact in 7+ days.`,
    },
  ],
  sourceCount: ACTIVITIES.length,
};

export const SALESPEOPLE = act7.map((a) => {
  const s = sales30.find((x) => x.user === a.user);
  return {
    user: a.user, name: a.name,
    activities: a.total,
    calls: a.Call,
    sales: s?.invoiced ?? 0,
  };
}).sort((a, b) => b.sales - a.sales);

export const SALES_TREND = salesTrend(8).map((d) => ({
  date: d.date, sales: Math.round(d.sales),
}));

export const ACTIVITY_MIX = activityMix(7);

export const CALLS_BY_PERSON = calls7.map((c) => ({
  user: c.user, name: c.name, calls: c.calls,
}));

export const STALE_CUSTOMERS = stale.slice(0, 5).map((c) => ({
  customer: c.customer,
  lastContact: c.lastContact,
  stage: c.stage,
  owner: c.owner,
}));

export const FILTER_OPTIONS = {
  dateRange: ["Today", "This week", "This month", "Last 30 days", "This quarter", "Custom"],
  salesperson: ["All", ...act7.map((a) => a.user)],
  team: ["All", "GPS Devices", "Video Telematics", "Sensors", "Platform/ Software", "IoT Solutions"],
  region: ["All", "UAE", "Saudi Arabia", "Qatar", "Kuwait", "Oman"],
  activityType: ["All", "Call", "Meeting", "Email", "Visit", "Task"],
  leadStatus: ["All", "Potential Lead", "Initial Inquiry", "Technical Requirement",
    "Solution Proposal", "Commercial Proposal", "Negotiation", "Confirmed", "Lost"],
};

export const SUGGESTED_QUESTIONS = [
  "How many phone calls were completed today?",
  "Which clients have not been contacted in the last seven days?",
  "What is the total sales value for each salesperson?",
  "Which customers have pending payments?",
  "Show the busiest working hours of the sales team.",
  "Which clients received calls but did not receive a follow-up?",
];

export const SAMPLE_ANSWER = {
  question: "How many phone calls were completed today?",
  understood: "Count of activities where activity type = Call and progress = ✅Complete",
  filters: [
    { label: "Date", value: "27 Jul 2026" },
    { label: "Progress", value: PROGRESS.COMPLETE },
    { label: "Source", value: "Customer Activity Detail" },
  ],
  answer: `${callsToday} phone calls were logged today.`,
  breakdown: CALLS_BY_PERSON,
  sourceCount: callsToday,
  observation:
    "Meetings rose over the same period, so the mix has shifted rather than overall outreach dropping. Attribution uses the record owner, which is who entered the row.",
};
