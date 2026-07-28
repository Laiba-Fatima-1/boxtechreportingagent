import KpiCard from "@/components/dashboard/KpiCard";
import AiSummaryCard from "@/components/dashboard/AiSummaryCard";
import FilterBar from "@/components/dashboard/FilterBar";
import SalesPerformanceChart from "@/components/dashboard/SalesPerformanceChart";
import ActivitiesDonut from "@/components/dashboard/ActivitiesDonut";
import SalespersonTable from "@/components/dashboard/SalespersonTable";
import { CallsPanel, StaleCustomersPanel } from "@/components/dashboard/ListPanels";
import { SectionLabel } from "@/components/ui/Card";
import { KPIS } from "@/lib/mock-data";

/**
 * SPACING RHYTHM
 *
 * Previously every gap was the same, so the page read as one long list of
 * cards with no grouping. Now there are two distances doing different jobs:
 *   gap-3.5  – between cards that belong together
 *   space-y-7 – between zones that don't
 * Plus small-caps labels naming each zone, so the page has an outline you
 * can scan instead of a wall of equal-weight panels.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-7 pb-4">
      {/* ---------- page head ---------- */}
      {/* Sync status used to sit here as well as in the sidebar and topbar.
          It now lives only in the topbar, where global state belongs. */}
      <header className="anim-rise">
        <h1 className="font-display text-[30px] font-bold leading-none text-ink">
          Good morning, Admin
        </h1>
        <p className="mt-2 text-[13px] text-ink-soft">
          Here&apos;s what&apos;s happening across sales today.
        </p>
      </header>

      {/* ---------- filters ----------
          relative + z-40 is load-bearing, not cosmetic. Sections below use
          anim-rise, which animates opacity and therefore creates its own
          stacking context. Without an explicit z-index here, the filter
          popovers are trapped inside this wrapper's context and later
          siblings paint over them. */}
      <div className="anim-rise anim-d1 relative z-40">
        <FilterBar />
      </div>

      {/* ---------- zone 1: today ---------- */}
      <section className="anim-rise anim-d2 relative z-0">
        <SectionLabel>Today at a glance</SectionLabel>
        <div className="grid min-w-0 grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {KPIS.map((k, i) => (
            <KpiCard key={k.id} kpi={k} index={i} />
          ))}
        </div>
      </section>

      {/* ---------- zone 2: what it means ---------- */}
      <section className="anim-rise anim-d3 relative z-0">
        <SectionLabel>Summary &amp; team performance</SectionLabel>
        <div className="grid min-w-0 grid-cols-1 gap-3.5 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-5">
            <AiSummaryCard />
          </div>
          <div className="min-w-0 lg:col-span-7">
            <SalespersonTable />
          </div>
        </div>
      </section>

      {/* ---------- zone 3: trends ---------- */}
      <section className="anim-rise anim-d4 relative z-0">
        <SectionLabel>Trends</SectionLabel>
        <div className="grid min-w-0 grid-cols-1 gap-3.5 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <SalesPerformanceChart />
          </div>
          <div className="min-w-0 lg:col-span-4">
            <ActivitiesDonut />
          </div>
        </div>
      </section>

      {/* ---------- zone 4: needs attention ---------- */}
      <section className="anim-rise anim-d5 relative z-0">
        <SectionLabel>Needs attention</SectionLabel>
        <div className="grid min-w-0 grid-cols-1 gap-3.5 lg:grid-cols-2">
          <div className="min-w-0">
            <CallsPanel />
          </div>
          <div className="min-w-0">
            <StaleCustomersPanel />
          </div>
        </div>
      </section>

      <p className="text-center text-[11px] text-ink-faint">
        Read-only mirror of ERPNext · figures reflect the 10:00 AM sync
      </p>
    </div>
  );
}
