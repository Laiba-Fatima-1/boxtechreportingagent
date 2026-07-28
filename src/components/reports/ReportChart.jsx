"use client";

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import ChartFrame from "@/components/ui/ChartFrame";
import { Card } from "@/components/ui/Card";
import { compactMoney, compactNum, money, num, shortDate } from "@/lib/format";

const AXIS = { fontSize: 11, fill: "var(--color-ink-faint)" };
const GRID = "var(--color-line)";

function fmt(v, f) {
  return f === "money" ? money(v) : num(v);
}
function axisFmt(v, f) {
  return f === "money" ? compactMoney(v) : compactNum(v);
}

/* Shared tooltip so every chart in the app reads the same way. */
function TipBox({ label, rows }) {
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2 shadow-[var(--shadow-lift)]">
      {label && (
        <div className="mb-1 text-[11px] font-medium text-ink-faint">{label}</div>
      )}
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-2 text-[12px]">
          {r.color && (
            <span className="size-2 rounded-full" style={{ background: r.color }} />
          )}
          <span className="text-ink-soft">{r.name}</span>
          <span className="ml-auto font-semibold numeric text-ink">
            {r.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function makeTooltip(series, xFormat) {
  return function Tip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
      <TipBox
        label={xFormat === "date" ? shortDate(label) : label}
        rows={payload.map((p) => {
          const s = series?.find((x) => x.key === p.dataKey);
          return {
            name: s?.label ?? p.name,
            value: fmt(p.value, s?.format),
            color: p.color ?? p.fill,
          };
        })}
      />
    );
  };
}

/* ------------------------------------------------------------------ */

export default function ReportChart({ chart }) {
  const { type, title, span = 12 } = chart;

  return (
    <Card className={`min-w-0 ${SPAN[span] ?? SPAN[12]}`}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h3 className="font-display truncate text-[15px] font-semibold text-ink">{title}</h3>
        {chart.series?.length > 1 && (
          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            {chart.series.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                <span className="text-[11px] text-ink-soft">{s.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3">{renderBody(chart)}</div>
    </Card>
  );
}

const SPAN = {
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  12: "lg:col-span-12",
};

function renderBody(chart) {
  switch (chart.type) {
    case "area": return <AreaBody chart={chart} />;
    case "bar": return <BarBody chart={chart} />;
    case "hbar": return <HBarBody chart={chart} />;
    case "donut": return <DonutBody chart={chart} />;
    case "funnel": return <FunnelBody chart={chart} />;
    default: return null;
  }
}

/* ---------------------------------------------------------- area ---- */

function AreaBody({ chart }) {
  const { data, xKey, xFormat, series } = chart;
  const Tip = makeTooltip(series, xFormat);
  return (
    <ChartFrame height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.24} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey={xKey}
          tickFormatter={xFormat === "date" ? shortDate : undefined}
          tickLine={false} axisLine={false} tick={AXIS} minTickGap={20}
        />
        <YAxis
          tickFormatter={(v) => axisFmt(v, series[0]?.format)}
          tickLine={false} axisLine={false} width={48} tick={AXIS}
        />
        <Tooltip content={<Tip />} cursor={{ stroke: GRID, strokeWidth: 1 }} />
        {series.map((s) => (
          <Area
            key={s.key} type="monotone" dataKey={s.key} stroke={s.color}
            strokeWidth={2.2} fill={`url(#g-${s.key})`}
            dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
        ))}
      </AreaChart>
    </ChartFrame>
  );
}

/* ----------------------------------------------------------- bar ---- */

function BarBody({ chart }) {
  const { data, xKey, series, stacked, rotateLabels } = chart;
  const Tip = makeTooltip(series);
  return (
    <ChartFrame height={rotateLabels ? 320 : 260}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 12, bottom: rotateLabels ? 78 : 4, left: 4 }}
        barGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey={xKey} tickLine={false} axisLine={false} tick={AXIS}
          interval={0}
          angle={rotateLabels ? -40 : 0}
          textAnchor={rotateLabels ? "end" : "middle"}
          height={rotateLabels ? 80 : 30}
        />
        <YAxis
          tickFormatter={(v) => axisFmt(v, series[0]?.format)}
          tickLine={false} axisLine={false} width={48} tick={AXIS}
        />
        <Tooltip content={<Tip />} cursor={{ fill: "var(--color-canvas)" }} />
        {series.map((s) => (
          <Bar
            key={s.key} dataKey={s.key} fill={s.color}
            stackId={stacked ? "a" : undefined}
            radius={stacked ? [0, 0, 0, 0] : [5, 5, 0, 0]}
            maxBarSize={44}
          />
        ))}
      </BarChart>
    </ChartFrame>
  );
}

/* -------------------------------------------------- horizontal bar --- */

function HBarBody({ chart }) {
  const { data, labelKey, series } = chart;
  const Tip = makeTooltip(series);
  /* Height grows with row count so long lists stay readable rather than squashed. */
  const height = Math.max(200, data.length * (series.length > 1 ? 46 : 34) + 40);
  return (
    <ChartFrame height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis
          type="number" tickFormatter={(v) => axisFmt(v, series[0]?.format)}
          tickLine={false} axisLine={false} tick={AXIS}
        />
        <YAxis
          type="category" dataKey={labelKey} width={132}
          tickLine={false} axisLine={false} tick={{ ...AXIS, fontSize: 11.5 }}
        />
        <Tooltip content={<Tip />} cursor={{ fill: "var(--color-canvas)" }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[0, 5, 5, 0]} maxBarSize={18} />
        ))}
      </BarChart>
    </ChartFrame>
  );
}

/* --------------------------------------------------------- donut ---- */

function DonutBody({ chart }) {
  const { data } = chart;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div>
      <div className="relative">
        <ChartFrame height={196}>
          <PieChart>
            <Pie
              data={data} dataKey="value" nameKey="name"
              innerRadius="62%" outerRadius="88%" paddingAngle={2}
              stroke="none" isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <TipBox
                    rows={[{
                      name: payload[0].name,
                      value: `${num(payload[0].value)} (${Math.round((payload[0].value / total) * 100)}%)`,
                      color: payload[0].payload.color,
                    }]}
                  />
                ) : null
              }
            />
          </PieChart>
        </ChartFrame>
        {/* Centre total lives outside the SVG so it can't affect measurement */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-[20px] font-bold leading-none numeric text-ink">
              {num(total)}
            </div>
            <div className="mt-0.5 text-[11px] text-ink-faint">Total</div>
          </div>
        </div>
      </div>

      <ul className="mt-2 space-y-1.5 px-2 pb-1">
        {data.map((d) => (
          <li key={d.name} className="flex min-w-0 items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate text-[12px] text-ink-soft">{d.name}</span>
            <span className="shrink-0 text-[12px] font-semibold numeric text-ink">{d.value}</span>
            <span className="w-9 shrink-0 text-right text-[11px] numeric text-ink-faint">
              {total ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------- funnel ---- */

/**
 * Funnel is drawn with CSS bars rather than a chart library.
 * Recharts' FunnelChart needs a fixed aspect and reads poorly on mobile;
 * proportional bars carry the same information and stay legible at any width.
 */
function FunnelBody({ chart }) {
  const { data } = chart;
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <ul className="space-y-2 p-2">
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        const prev = i > 0 ? data[i - 1].count : null;
        const drop = prev ? Math.round(((prev - d.count) / prev) * 100) : null;
        return (
          <li key={d.stage}>
            <div className="mb-1 flex items-baseline gap-2">
              <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink">
                {d.stage}
              </span>
              {drop != null && drop > 0 && (
                <span className="shrink-0 text-[11px] numeric text-ink-faint">
                  −{drop}%
                </span>
              )}
              <span className="shrink-0 text-[13px] font-bold numeric text-ink">
                {d.count}
              </span>
            </div>
            <div className="h-7 overflow-hidden rounded-lg bg-canvas">
              <div
                className="h-full rounded-lg bg-linear-to-r from-brand to-brand/70 transition-[width] duration-700 ease-[var(--ease-brand)]"
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
