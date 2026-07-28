import Link from "next/link";
import {
  ArrowRight, Receipt, Waypoints, PhoneCall, Building2, Wallet, Users,
} from "lucide-react";

/* Same icon language as the sidebar, so a category is recognisable by shape
   wherever it appears. */
const GROUP_ICONS = { Receipt, Waypoints, PhoneCall, Building2, Wallet, Users };
import { NAV_GROUPS, ACCENT_CLASS } from "@/lib/nav";
import { Card } from "@/components/ui/Card";

export const metadata = { title: "Reports · BoxTech" };

const DELAY = ["", "anim-d1", "anim-d2", "anim-d3", "anim-d4", "anim-d5"];

export default function ReportsHubPage() {
  const total = NAV_GROUPS.reduce((s, g) => s + g.reports.length, 0);

  return (
    <div className="space-y-5">
      <div className="anim-rise">
        <h1 className="font-display text-[30px] font-bold leading-none text-ink">
          Reports
        </h1>
        <p className="mt-0.5 max-w-2xl text-[13px] text-ink-soft">
          {total} reports across {NAV_GROUPS.length} categories. Each one shows
          the ERPNext DocType it reads from, so any number can be traced back.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {NAV_GROUPS.map((g, gi) => {
          const accent = ACCENT_CLASS[g.accent];
          const Icon = GROUP_ICONS[g.icon];
          return (
            <Card
              key={g.id}
              className={`anim-rise ${DELAY[Math.min(gi + 1, 5)]} card-hover flex flex-col`}
            >
              <div className="flex items-center gap-2.5 border-b border-line px-4 py-3.5">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-lg ${accent.soft} ${accent.text}`}
                >
                  <Icon className="size-4" strokeWidth={2.1} />
                </span>
                <h2 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">
                  {g.label}
                </h2>
                <span className="shrink-0 rounded-md bg-canvas px-1.5 py-0.5 text-[11px] font-semibold numeric text-ink-faint">
                  {g.reports.length}
                </span>
              </div>

              <ul className="flex-1 divide-y divide-line/60">
                {g.reports.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/reports/${r.slug}`}
                      className="group flex items-center gap-2 px-4 py-3 transition-colors hover:bg-canvas"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-ink">
                          {r.label}
                        </span>
                        <span className="block truncate text-[11px] text-ink-faint">
                          {r.source}
                        </span>
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 -translate-x-1 text-ink-faint opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
