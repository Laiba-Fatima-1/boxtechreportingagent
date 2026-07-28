"use client";

import { useState } from "react";
import { Database, Info } from "lucide-react";
import ReportChart from "./ReportChart";
import ReportTable from "./ReportTable";
import { Card } from "@/components/ui/Card";
import { PIPELINES } from "@/lib/mock/leads";
import { formatCell } from "@/lib/format";

export default function ReportView({ report }) {
  const hasPipelines = Boolean(report.pipelines);
  const [mode, setMode] = useState(hasPipelines ? "combined" : null);

  /* When a report supports both lead pipelines, the active pipeline supplies
     its own KPIs, charts, table and source label. */
  const view = hasPipelines ? report.pipelines[mode] : report;
  const source = view.source ?? report.source;

  return (
    <div className="space-y-4">
      {/* ---- header ---- */}
      <div className="anim-rise">
        <div className="text-[11px] font-semibold uppercase tracking-[0.07em] text-ink-faint">
          {report.group}
        </div>
        <h1 className="font-display mt-1 text-[30px] font-bold leading-none text-ink">
          {report.title}
        </h1>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
          {report.description}
        </p>
      </div>

      {/* ---- pipeline switcher ---- */}
      {hasPipelines && (
        <div className="anim-rise anim-d1">
          <PipelineSwitch mode={mode} onChange={setMode} />
        </div>
      )}

      {/* ---- source + note ---- */}
      <div className="anim-rise anim-d1 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-canvas px-2.5 py-1.5 text-[11px] font-medium text-ink-soft">
          <Database className="size-3.5 text-ink-faint" />
          Reads from <strong className="font-semibold text-ink">{source}</strong>
        </span>
        {view.note && (
          <span className="inline-flex min-w-0 items-start gap-1.5 rounded-lg bg-blue-soft px-2.5 py-1.5 text-[11px] leading-relaxed text-blue">
            <Info className="mt-px size-3.5 shrink-0" />
            <span className="min-w-0">{view.note}</span>
          </span>
        )}
      </div>

      {/* ---- KPI strip ---- */}
      {view.kpis?.length > 0 && (
        <section className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">
          {view.kpis.map((k, i) => (
            <StatCard key={k.label} kpi={k} index={i} />
          ))}
        </section>
      )}

      {/* ---- charts ---- */}
      {view.charts?.length > 0 && (
        <section className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12">
          {view.charts.map((c, i) => (
            <div key={c.title} className={`anim-rise min-w-0 ${DELAY[Math.min(i + 2, 5)]} ${SPAN[c.span ?? 12]}`}>
              <ReportChart chart={c} />
            </div>
          ))}
        </section>
      )}

      {/* ---- table ---- */}
      {view.table && (
        <section className="anim-rise anim-d5 min-w-0">
          <ReportTable table={view.table} />
        </section>
      )}

      <p className="pb-2 text-center text-[11px] text-ink-faint">
        Read-only mirror of ERPNext · demo data pending the first backup sync
      </p>
    </div>
  );
}

const SPAN = {
  4: "lg:col-span-4", 5: "lg:col-span-5", 6: "lg:col-span-6",
  7: "lg:col-span-7", 8: "lg:col-span-8", 12: "lg:col-span-12",
};

const DELAY = ["", "anim-d1", "anim-d2", "anim-d3", "anim-d4", "anim-d5"];

const DOT_SOLID = {
  brand: "bg-brand", blue: "bg-blue", purple: "bg-purple",
  amber: "bg-amber", red: "bg-red",
};

function StatCard({ kpi, index }) {
  const dot = DOT_SOLID[kpi.accent] ?? DOT_SOLID.brand;
  return (
    <Card className={`anim-rise ${DELAY[Math.min(index + 1, 5)]} card-hover p-4`}>
      <div className="flex items-center gap-2">
        <span className={`size-1.5 shrink-0 rounded-full ${dot}`} />
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-ink-soft">
          {kpi.label}
        </span>
      </div>
      <div className="numeric mt-2 truncate text-[20px] font-bold leading-none text-ink">
        {formatCell(kpi.value, kpi.format)}
      </div>
    </Card>
  );
}

function PipelineSwitch({ mode, onChange }) {
  const order = ["standard", "custom", "combined"];
  /* Explicit map: Tailwind extracts class names statically, so a template
     literal like `bg-${p.accent}` never gets generated into the stylesheet. */
  const DOT = { standard: "bg-blue", custom: "bg-purple", combined: "bg-brand" };
  return (
    <div className="rounded-[16px] border border-line bg-card p-1.5 shadow-[var(--shadow-raised)]">
      <div className="grid grid-cols-3 gap-1">
        {order.map((id) => {
          const p = PIPELINES[id];
          const active = mode === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`min-w-0 rounded-xl px-3 py-2 text-left transition-all duration-200 ${
                active
                  ? "bg-forest text-white shadow-[var(--shadow-raised)]"
                  : "text-ink-soft hover:bg-canvas"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`size-2 shrink-0 rounded-full ${
                    active ? "bg-white/70" : DOT[id]
                  }`}
                />
                <span className="truncate text-[13px] font-semibold">{p.label}</span>
              </div>
              <span
                className={`mt-0.5 block truncate text-[10px] ${
                  active ? "text-white/55" : "text-ink-faint"
                }`}
              >
                {p.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
