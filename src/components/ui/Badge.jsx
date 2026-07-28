/**
 * Status badges.
 *
 * Colour encodes meaning, not decoration: green = settled/won, blue = active,
 * amber = needs attention, red = problem, grey = neutral or not started.
 * The maps below cover every enum that appears in a report table.
 */

const NEUTRAL = "bg-canvas text-ink-soft";
const GOOD = "bg-brand-soft text-brand";
const INFO = "bg-blue-soft text-blue";
const WORK = "bg-purple-soft text-purple";
const WARN = "bg-amber-soft text-amber";
const BAD = "bg-red-soft text-red";

const MAPS = {
  progress: {
    "✅Complete": GOOD,
    "⏳In Progress": WARN,
    Rejected: BAD,
  },
  leadStatus: {
    Lead: NEUTRAL,
    Open: INFO,
    Replied: WORK,
    Opportunity: WARN,
    Quotation: WARN,
    Converted: GOOD,
    "Do Not Contact": BAD,
  },
  qualification: {
    Qualified: GOOD,
    "In Process": WARN,
    Unqualified: NEUTRAL,
  },
  salesStatus: {
    "Potential Lead": NEUTRAL,
    "Initial Inquiry": NEUTRAL,
    "Technical Requirement": INFO,
    "Solution Proposal": INFO,
    "Stock Availability": INFO,
    "Client Feedback": WORK,
    "Commercial Proposal": WORK,
    Negotiation: WARN,
    Confirmed: GOOD,
    "Payment Pending": WARN,
    Shipment: INFO,
    "Sales Completed": GOOD,
    Lost: BAD,
  },
  invoiceStatus: {
    Paid: GOOD,
    Unpaid: INFO,
    Overdue: BAD,
    "Partly Paid": WARN,
    Draft: NEUTRAL,
    Return: NEUTRAL,
  },
  orderStatus: {
    Draft: NEUTRAL,
    "To Deliver and Bill": WARN,
    "To Bill": WARN,
    "To Deliver": INFO,
    Completed: GOOD,
    Closed: NEUTRAL,
  },
  quotationStatus: {
    Draft: NEUTRAL,
    Open: INFO,
    Replied: WORK,
    Ordered: GOOD,
    Lost: BAD,
    Expired: NEUTRAL,
  },
  activityType: {
    Call: WORK,
    Meeting: INFO,
    Email: GOOD,
    Task: WARN,
    Visit: NEUTRAL,
  },
  pipeline: {
    Lead: INFO,
    Leads: WORK,
  },
};

export default function Badge({ value, variant }) {
  /* Boolean risk flags render as words, not "true"/"false". */
  if (variant === "risk") {
    return (
      <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
          value ? BAD : GOOD
        }`}
      >
        {value ? "At risk" : "Healthy"}
      </span>
    );
  }

  const cls = MAPS[variant]?.[value] ?? NEUTRAL;
  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-md px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {value ?? "—"}
    </span>
  );
}
