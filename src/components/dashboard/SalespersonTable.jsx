"use client";

import { Card, CardHeader, GhostButton } from "@/components/ui/Card";
import { SALESPEOPLE } from "@/lib/mock-data";
import { money, initials } from "@/lib/format";

/**
 * Activity volume vs sales value — the comparison section 8.2 asks for.
 *
 * Responsive strategy: a 4-column table is unreadable under ~640px, so below
 * `sm` each row becomes a stacked card instead of forcing a horizontal scroll.
 */
export default function SalespersonTable() {
  const maxSales = Math.max(...SALESPEOPLE.map((s) => s.sales));

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Activity vs sales value"
        action={<GhostButton>View report</GhostButton>}
      />

      {/* ---------- Desktop / tablet: real table ---------- */}
      <div className="hidden sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {["Salesperson", "Activities", "Sales value"].map((h, i) => (
                <th
                  key={h}
                  className={`px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-ink-faint ${
                    i === 0 ? "text-left" : "text-right"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SALESPEOPLE.map((s) => (
              <tr
                key={s.user}
                className="border-b border-line/60 last:border-0 hover:bg-canvas/60"
              >
                <td className="px-5 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-[10px] font-bold text-brand">
                      {initials(s.user)}
                    </span>
                    <span className="truncate text-[13px] font-medium text-ink">
                      {s.user}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right text-[13px] font-semibold numeric text-ink">
                  {s.activities}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-canvas md:block">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${(s.sales / maxSales) * 100}%` }}
                      />
                    </div>
                    <span className="text-[13px] font-semibold numeric text-ink">
                      {money(s.sales)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- Mobile: stacked cards ---------- */}
      <ul className="divide-y divide-line/60 sm:hidden">
        {SALESPEOPLE.map((s) => (
          <li key={s.user} className="px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-[11px] font-bold text-brand">
                {initials(s.user)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                {s.user}
              </span>
              <span className="shrink-0 text-[13px] font-bold numeric text-ink">
                {money(s.sales)}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2.5 pl-[42px]">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${(s.sales / maxSales) * 100}%` }}
                />
              </div>
              <span className="shrink-0 text-[11px] numeric text-ink-faint">
                {s.activities} activities
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
