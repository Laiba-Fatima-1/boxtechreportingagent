/** Display helpers. All number/date shaping lives here so reports stay consistent. */

export const money = (n, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency", currency, maximumFractionDigits: 0,
  }).format(n ?? 0);

export const compactMoney = (n, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency", currency, notation: "compact", maximumFractionDigits: 1,
  }).format(n ?? 0);

export const num = (n) => new Intl.NumberFormat("en-US").format(n ?? 0);

export const compactNum = (n) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n ?? 0);

export const percent = (n) => `${Math.round(n ?? 0)}%`;

export const days = (n) =>
  n == null ? "—" : n === 0 ? "Today" : n === 1 ? "1 day" : `${n} days`;

/** Seconds -> "12m 30s", used for call durations. */
export const duration = (s) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return m ? `${m}m ${rem}s` : `${rem}s`;
};

export const shortDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

export const fullDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export function daysAgo(iso) {
  if (!iso) return "No activity";
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d} days ago`;
}

export const initials = (s = "") =>
  s.replace(/@.*/, "").split(/[.\s_]+/).filter(Boolean).slice(0, 2)
    .map((w) => w[0]?.toUpperCase()).join("");

/** Single entry point used by the generic report table. */
export function formatCell(value, format) {
  if (value == null || value === "") return "—";
  switch (format) {
    case "money": return money(value);
    case "percent": return percent(value);
    case "days": return days(value);
    case "duration": return duration(value);
    case "date": return fullDate(value);
    case "number": return num(value);
    default: return String(value);
  }
}
