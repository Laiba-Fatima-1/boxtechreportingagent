/**
 * Activity + call fixtures.
 *
 * Modelled on `Customer Activity Detail`, which is a CHILD TABLE of Customer
 * (custom_activity_details). Each row therefore carries its parent customer,
 * and `owner` stands in for Frappe's automatic owner column — the only
 * salesperson attribution available on this DocType. See README for the caveat.
 */

import { rng, pick, int, weighted, chance, daysBefore } from "./rng";
import { SALESPEOPLE, COMPANIES, CONTACT_ROLES } from "./reference";

/** Customer Activity Detail.progress */
export const PROGRESS = {
  IN_PROGRESS: "⏳In Progress",
  COMPLETE: "✅Complete",
  REJECTED: "Rejected",
};

/** Customer Activity Detail.phone_call_scenario — all 14 values */
export const CALL_SCENARIOS = [
  "Introduction",
  "Client Potential Check",
  "Key Contact Collection",
  "Requirement / Project Discussion",
  "Meeting / Visit Arrangement",
  "Propose Testing Device",
  "Testing Feedback",
  "Confirm Pilot Order",
  "Sample / Testing Discussion",
  "Quotation / Commercial Discussion",
  "Project Status Discussion",
  "Relationship Building",
  "Not Applicable",
  "Other",
];

export const ACTIVITY_TYPES = ["Call", "Meeting", "Email", "Visit", "Task"];

function buildActivities(count = 900) {
  const r = rng(0xa11ce);
  const rows = [];

  for (let i = 0; i < count; i++) {
    const daysAgo = int(r, 0, 59);
    const owner = pick(r, SALESPEOPLE);
    const activity_type = weighted(r, [
      ["Call", 34],
      ["Email", 30],
      ["Meeting", 18],
      ["Task", 12],
      ["Visit", 6],
    ]);

    const progress = weighted(r, [
      [PROGRESS.COMPLETE, 72],
      [PROGRESS.IN_PROGRESS, 22],
      [PROGRESS.REJECTED, 6],
    ]);

    /* Working hours cluster 9–18 with a lunch dip, so the daily-pattern
       report shows a believable shape rather than a flat block. */
    const hour = weighted(r, [
      [8, 4], [9, 11], [10, 15], [11, 14], [12, 7],
      [13, 5], [14, 12], [15, 13], [16, 11], [17, 6], [18, 2],
    ]);

    rows.push({
      id: `ACT-${String(i + 1).padStart(5, "0")}`,
      parent: COMPANIES[int(r, 0, COMPANIES.length - 1)],
      date: daysBefore(daysAgo),
      _daysAgo: daysAgo,
      time: `${String(hour).padStart(2, "0")}:${String(int(r, 0, 59)).padStart(2, "0")}`,
      _hour: hour,
      owner: owner.user,
      activity_type,
      phone_call_scenario:
        activity_type === "Call" ? pick(r, CALL_SCENARIOS.slice(0, 12)) : "Not Applicable",
      point_of_contact: pick(r, CONTACT_ROLES),
      progress,
      duration: activity_type === "Call" ? int(r, 45, 1500) : null,
      result: pick(r, [
        "Client interested, sending specs",
        "Requested pricing for 200 units",
        "Follow-up scheduled next week",
        "No answer, will retry",
        "Technical questions forwarded to engineering",
        "Sample approved, moving to commercial",
      ]),
    });
  }
  return rows;
}

export const ACTIVITIES = buildActivities();

export const todayActivities = () => ACTIVITIES.filter((a) => a._daysAgo === 0);

/** Calls per salesperson over a window. */
export function callsByOwner(days = 7) {
  return SALESPEOPLE.map((p) => {
    const rows = ACTIVITIES.filter(
      (a) => a.owner === p.user && a.activity_type === "Call" && a._daysAgo < days
    );
    const done = rows.filter((a) => a.progress === PROGRESS.COMPLETE);
    return {
      user: p.user,
      name: p.name,
      calls: rows.length,
      completed: done.length,
      avgDuration: done.length
        ? Math.round(done.reduce((s, a) => s + a.duration, 0) / done.length)
        : 0,
      completionRate: rows.length
        ? Math.round((done.length / rows.length) * 100)
        : 0,
    };
  }).sort((a, b) => b.calls - a.calls);
}

/** Activity counts per salesperson, split by type. */
export function activityByOwner(days = 7) {
  return SALESPEOPLE.map((p) => {
    const rows = ACTIVITIES.filter((a) => a.owner === p.user && a._daysAgo < days);
    const byType = Object.fromEntries(
      ACTIVITY_TYPES.map((t) => [t, rows.filter((a) => a.activity_type === t).length])
    );
    return {
      user: p.user,
      name: p.name,
      total: rows.length,
      ...byType,
      completed: rows.filter((a) => a.progress === PROGRESS.COMPLETE).length,
    };
  }).sort((a, b) => b.total - a.total);
}

/** Hour-of-day histogram — the "busiest working hours" report. */
export function hourlyPattern() {
  const hours = [];
  for (let h = 8; h <= 18; h++) {
    const rows = ACTIVITIES.filter((a) => a._hour === h);
    hours.push({
      hour: `${String(h).padStart(2, "0")}:00`,
      activities: rows.length,
      calls: rows.filter((a) => a.activity_type === "Call").length,
    });
  }
  return hours;
}

/** Day-of-week histogram. */
export function weekdayPattern() {
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const buckets = names.map((d) => ({ day: d, activities: 0, calls: 0 }));
  for (const a of ACTIVITIES) {
    const idx = new Date(a.date + "T00:00:00Z").getUTCDay();
    buckets[idx].activities++;
    if (a.activity_type === "Call") buckets[idx].calls++;
  }
  /* Gulf working week runs Sun–Thu, so lead with Sunday. */
  return buckets;
}

/** Daily activity trend. */
export function activityTrend(days = 30) {
  const out = [];
  for (let d = days - 1; d >= 0; d--) {
    const rows = ACTIVITIES.filter((a) => a._daysAgo === d);
    out.push({
      date: daysBefore(d),
      activities: rows.length,
      calls: rows.filter((a) => a.activity_type === "Call").length,
      completed: rows.filter((a) => a.progress === PROGRESS.COMPLETE).length,
    });
  }
  return out;
}

/** Activity type mix for the donut. */
export function activityMix(days = 7) {
  const colors = {
    Call: "var(--color-purple)",
    Meeting: "var(--color-blue)",
    Email: "var(--color-brand)",
    Task: "var(--color-amber)",
    Visit: "var(--color-ink-faint)",
  };
  const rows = ACTIVITIES.filter((a) => a._daysAgo < days);
  return ACTIVITY_TYPES.map((t) => ({
    name: t,
    value: rows.filter((a) => a.activity_type === t).length,
    color: colors[t],
  })).filter((d) => d.value > 0);
}

/** Customers with no activity in the window — the follow-up discipline report. */
export function staleCustomers(days = 7) {
  const r = rng(0xc0ffee);
  const seen = new Map();
  for (const a of ACTIVITIES) {
    const prev = seen.get(a.parent);
    if (prev == null || a._daysAgo < prev) seen.set(a.parent, a._daysAgo);
  }
  const stages = [
    "0. Contact Client", "2. Relationship Building", "5. BoxTech Value Proposition",
    "7. Sample / Testing", "8. Commercial Offer", "9. Negotiation",
  ];
  return COMPANIES.map((c) => {
    const last = seen.get(c);
    return {
      customer: c,
      lastContactDays: last ?? null,
      lastContact: last != null ? daysBefore(last) : null,
      stage: pick(r, stages),
      owner: pick(r, SALESPEOPLE).user,
    };
  })
    .filter((c) => c.lastContactDays == null || c.lastContactDays >= days)
    .sort((a, b) => (b.lastContactDays ?? 999) - (a.lastContactDays ?? 999));
}

/** Calls that never got a follow-up activity afterwards. */
export function callsWithoutFollowUp() {
  const byCustomer = new Map();
  for (const a of ACTIVITIES) {
    if (!byCustomer.has(a.parent)) byCustomer.set(a.parent, []);
    byCustomer.get(a.parent).push(a);
  }
  const out = [];
  for (const [customer, rows] of byCustomer) {
    const calls = rows
      .filter((a) => a.activity_type === "Call" && a.progress === PROGRESS.COMPLETE)
      .sort((a, b) => a._daysAgo - b._daysAgo);
    if (!calls.length) continue;
    const latest = calls[0];
    const followed = rows.some(
      (a) => a._daysAgo < latest._daysAgo && a.activity_type !== "Call"
    );
    if (!followed && latest._daysAgo >= 3) {
      out.push({
        customer,
        lastCall: latest.date,
        daysSince: latest._daysAgo,
        scenario: latest.phone_call_scenario,
        owner: latest.owner,
      });
    }
  }
  return out.sort((a, b) => b.daysSince - a.daysSince).slice(0, 24);
}

/** Overdue: still In Progress and older than the threshold. */
export function overdueActivities(days = 5) {
  return ACTIVITIES.filter(
    (a) => a.progress === PROGRESS.IN_PROGRESS && a._daysAgo >= days
  )
    .sort((a, b) => b._daysAgo - a._daysAgo)
    .slice(0, 40);
}
