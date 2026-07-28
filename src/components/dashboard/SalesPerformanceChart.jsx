"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, CardHeader, SourceChip } from "@/components/ui/Card";
import ChartFrame from "@/components/ui/ChartFrame";
import { SALES_TREND } from "@/lib/mock-data";
import { compactMoney, money, num, shortDate } from "@/lib/format";

const METRICS = [
  { key: "sales", label: "Sales value", color: "var(--color-brand)", money: true },
  { key: "activities", label: "Activities", color: "var(--color-blue)" },
  { key: "calls", label: "Calls", color: "var(--color-purple)" },
];

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-xl border border-line bg-card px-3 py-2 shadow-[var(--shadow-lift)]">
      <div className="text-[11px] font-medium text-ink-faint">
        {shortDate(label)}
      </div>
      <div className="text-[15px] font-bold numeric text-ink">
        {metric.money ? money(v) : num(v)}
      </div>
    </div>
  );
}

export default function SalesPerformanceChart() {
  const [active, setActive] = useState(METRICS[0]);

  return (
    <Card>
      <CardHeader
        title="Performance over time"
        action={<SourceChip>Sales Invoice</SourceChip>}
      />

      {/* Metric tabs — scrollable rather than wrapping on narrow screens */}
      <div className="scroll-slim flex gap-1 overflow-x-auto border-b border-line px-3 py-2">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setActive(m)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${
              active.key === m.key
                ? "bg-canvas text-ink"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <span
                className="size-2 rounded-full"
                style={{ background: m.color }}
              />
              {m.label}
            </span>
          </button>
        ))}
      </div>

      <div className="p-2 sm:p-3">
        <ChartFrame height={260}>
          <AreaChart
            data={SALES_TREND}
            margin={{ top: 10, right: 12, bottom: 4, left: 4 }}
          >
            <defs>
              <linearGradient id="perfFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={active.color} stopOpacity={0.22} />
                <stop offset="100%" stopColor={active.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-line)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={shortDate}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
              minTickGap={16}
            />
            <YAxis
              tickFormatter={(v) => (active.money ? compactMoney(v) : num(v))}
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
            />
            <Tooltip
              content={<CustomTooltip metric={active} />}
              cursor={{ stroke: "var(--color-line)", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey={active.key}
              stroke={active.color}
              strokeWidth={2.4}
              fill="url(#perfFill)"
              dot={{ r: 3, fill: active.color, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ChartFrame>
      </div>
    </Card>
  );
}
