/**
 * Sidebar model.
 *
 * Hassan's 20-report list, grouped into 6 categories. This grouping is the
 * direct fix for the "everything feels scattered" complaint — a flat list of
 * 20 has no hierarchy, so nothing is findable.
 *
 * `source` records which ERPNext DocType each report reads from. It is shown
 * in the UI as a provenance hint and doubles as living documentation of the
 * data mapping required by section 5 of the developer task.
 *
 * NOTE ON CUSTOM DOCTYPES (confirmed against last_clean_schema.json):
 *   `Customer Activity Detail` is a CHILD TABLE of Customer (custom_activity_details),
 *   not a standalone DocType. Same for `Customer Contacts` (custom_contact_detail).
 *   Reports below marked "child of Customer" must join through tabCustomer.
 */

export const NAV_GROUPS = [
  {
    id: "sales",
    label: "Sales",
    accent: "brand",
    icon: "Receipt",
    reports: [
      { slug: "daily-sales-activity", label: "Daily Sales Activity", source: "Customer Activity Detail (child of Customer)" },
      { slug: "sales-order", label: "Sales Order", source: "Sales Order" },
      { slug: "sales-invoice", label: "Sales Invoice", source: "Sales Invoice" },
      { slug: "sales-value-by-salesperson", label: "Sales Value by Salesperson", source: "Sales Invoice + Sales Team" },
      { slug: "quotation-performance", label: "Quotation Performance", source: "Quotation" },
      { slug: "sales-cycle-duration", label: "Sales Cycle Duration", source: "Lead -> Quotation -> Sales Order" },
    ],
  },
  {
    id: "pipeline",
    label: "Leads & Pipeline",
    accent: "purple",
    icon: "Waypoints",
    reports: [
      { slug: "lead-generation", label: "Lead Generation", source: "Lead + Leads (custom)" },
      { slug: "lead-conversion", label: "Lead Conversion", source: "Lead -> Opportunity" },
      { slug: "opportunity-pipeline", label: "Opportunity Pipeline", source: "Opportunity" },
    ],
  },
  {
    id: "activities",
    label: "Calls & Activities",
    accent: "blue",
    icon: "PhoneCall",
    reports: [
      { slug: "calls-by-salesperson", label: "Calls by Salesperson", source: "Customer Activity Detail + Call Log" },
      { slug: "employee-activity", label: "Employee Activity", source: "Customer Activity Detail (child of Customer)" },
      { slug: "overdue-activities", label: "Overdue Activities", source: "ToDo + Customer Activity Detail" },
      { slug: "daily-working-pattern", label: "Daily Working Pattern", source: "Customer Activity Detail.time" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    accent: "amber",
    icon: "Building2",
    reports: [
      { slug: "customer-contact", label: "Customer Contact", source: "Customer Contacts (child of Customer)" },
      { slug: "customer-follow-up", label: "Customer Follow-Up", source: "Customer Activity Detail" },
      { slug: "missed-follow-ups", label: "Missed Follow-Ups", source: "Customer Activity Detail.progress" },
      { slug: "customer-engagement", label: "Customer Engagement", source: "Customer + Sales Invoice" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    accent: "red",
    icon: "Wallet",
    reports: [
      { slug: "pending-payment", label: "Pending Payment", source: "Sales Invoice.outstanding_amount" },
      { slug: "overdue-invoice", label: "Overdue Invoice", source: "Sales Invoice.due_date" },
    ],
  },
  {
    id: "people",
    label: "People",
    accent: "blue",
    icon: "Users",
    reports: [
      { slug: "salesperson-performance", label: "Salesperson Performance", source: "Sales Person + Sales Team" },
    ],
  },
];

/** Pinned above the groups — the 3 screens used every day. */
export const PRIMARY_LINKS = [
  { href: "/", label: "Dashboard", icon: "LayoutGrid" },
  { href: "/ask-ai", label: "Ask AI", icon: "Sparkles", badge: "New" },
  { href: "/reports", label: "Report Builder", icon: "Table2" },
];

export const ACCENT_CLASS = {
  brand: { dot: "bg-brand", soft: "bg-brand-soft", text: "text-brand", chip: "text-emerald-300" },
  blue: { dot: "bg-blue", soft: "bg-blue-soft", text: "text-blue", chip: "text-sky-300" },
  purple: { dot: "bg-purple", soft: "bg-purple-soft", text: "text-purple", chip: "text-violet-300" },
  amber: { dot: "bg-amber", soft: "bg-amber-soft", text: "text-amber", chip: "text-amber-300" },
  red: { dot: "bg-red", soft: "bg-red-soft", text: "text-red", chip: "text-rose-300" },
};

/** Flat slug -> group lookup, used to auto-expand the active category. */
export const SLUG_TO_GROUP = Object.fromEntries(
  NAV_GROUPS.flatMap((g) => g.reports.map((r) => [r.slug, g.id]))
);

/** Flat slug -> label lookup, used for the topbar page title. */
export const SLUG_TO_LABEL = Object.fromEntries(
  NAV_GROUPS.flatMap((g) => g.reports.map((r) => [r.slug, r.label]))
);
