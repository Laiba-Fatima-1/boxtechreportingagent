"use client";

import { Phone, UserX } from "lucide-react";
import { Card, CardHeader, GhostButton } from "@/components/ui/Card";
import { CALLS_BY_PERSON, STALE_CUSTOMERS } from "@/lib/mock-data";
import { initials, daysAgo } from "@/lib/format";

export function CallsPanel() {
  const max = Math.max(...CALLS_BY_PERSON.map((c) => c.calls));

  return (
    <Card>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            <Phone className="size-4 text-blue" />
            Calls by salesperson
          </span>
        }
        action={<GhostButton>View all</GhostButton>}
      />
      <ul className="divide-y divide-line/60">
        {CALLS_BY_PERSON.map((c) => (
          <li key={c.user} className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-blue-soft text-[11px] font-bold text-blue">
              {initials(c.user)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-ink">
                {c.user}
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-blue"
                  style={{ width: `${(c.calls / max) * 100}%` }}
                />
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[15px] font-bold numeric text-ink">
                {c.calls}
              </div>
              <div className="text-[10px] text-ink-faint">calls</div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function StaleCustomersPanel() {
  return (
    <Card>
      <CardHeader
        title={
          <span className="inline-flex items-center gap-2">
            <UserX className="size-4 text-amber" />
            Customers without recent follow-up
          </span>
        }
        action={<GhostButton>View all</GhostButton>}
      />
      <ul className="divide-y divide-line/60">
        {STALE_CUSTOMERS.map((c) => (
          <li
            key={c.customer}
            className="flex items-start gap-3 px-4 py-3 sm:px-5"
          >
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-canvas text-[11px] font-bold text-ink-soft">
              {c.customer.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-ink">
                {c.customer}
              </div>
              {/* Pipeline stage, straight from Customer.custom_client_progress */}
              <div className="truncate text-[11px] text-ink-faint">
                {c.stage}
              </div>
            </div>
            <span
              className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold ${
                c.lastContact
                  ? "bg-amber-soft text-amber"
                  : "bg-red-soft text-red"
              }`}
            >
              {c.lastContact ? daysAgo(c.lastContact) : "No activity"}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
