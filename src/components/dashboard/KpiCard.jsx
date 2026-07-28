"use client";

import { AreaChart, Area, YAxis } from "recharts";
import {
  Activity, Phone, Target, DollarSign, Wallet,
  TrendingUp, TrendingDown,
} from "lucide-react";
import ChartFrame from "@/components/ui/ChartFrame";
import { Card } from "@/components/ui/Card";
import { smartMoney, num } from "@/lib/format";

const ICONS = { Activity, Phone, Target, DollarSign, Wallet };
const DELAY = ["", "anim-d1", "anim-d2", "anim-d3", "anim-d4", "anim-d5"];

const ACCENT = {
  brand: { bg: "bg-brand-soft", fg: "text-brand", stroke: "var(--color-brand)" },
  blue: { bg: "bg-blue-soft", fg: "text-blue", stroke: "var(--color-blue)" },
  purple: { bg: "bg-purple-soft", fg: "text-purple", stroke: "var(--color-purple)" },
  amber: { bg: "bg-amber-soft", fg: "text-amber", stroke: "var(--color-amber)" },
};

export default function KpiCard({ kpi, index = 0 }) {
  const Icon = ICONS[kpi.icon] ?? Activity;
  const accent = ACCENT[kpi.accent] ?? ACCENT.brand;
  const feature = kpi.feature;

  const display = kpi.format === "money" ? smartMoney(kpi.value) : num(kpi.value);
  const rising = kpi.direction === "up";

  /* Direction and sentiment are different things. On Pending Payments,
     "up" is bad news — so the arrow follows direction while the colour
     follows whether that direction is good. */
  const goodNews = kpi.id === "pending" ? !rising : rising;
  const Arrow = rising ? TrendingUp : TrendingDown;

  const deltaClass = feature
    ? goodNews ? "delta-up-dark" : "delta-down-dark"
    : goodNews ? "delta-up" : "delta-down";

  const data = kpi.trend.map((v, i) => ({ i, v }));
  const stroke = feature ? "rgba(255,255,255,0.85)" : accent.stroke;
  const gradId = `spark-${kpi.id}`;

  return (
    <Card
      tier={feature ? "float" : "raised"}
      className={`card-hover anim-rise group relative flex flex-col overflow-hidden ${DELAY[Math.min(index, 5)]} ${
        feature ? "kpi-feature text-white" : "kpi-surface"
      }`}
    >
      {/* Coloured hairline: ties the card to its metric accent without
          adding another block of colour. */}
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: feature ? "rgba(255,255,255,0.28)" : accent.stroke }}
      />

      {/* header: icon + label */}
      <div className="flex items-start gap-2.5 px-4 pt-4">
        <span
          className={`grid size-8 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${
            feature ? "bg-white/12" : accent.bg
          }`}
        >
          <Icon
            className={`size-4 ${feature ? "text-white" : accent.fg}`}
            strokeWidth={2.1}
          />
        </span>
        <span
          className={`mt-1 min-w-0 flex-1 text-[12px] font-medium leading-snug ${
            feature ? "text-white/70" : "text-ink-soft"
          }`}
        >
          {kpi.label}
        </span>
      </div>

      {/* value + delta pill */}
      <div className="px-4 pb-3 pt-3">
        <div
          className={`kpi-value truncate text-[29px] font-bold leading-none sm:text-[32px] ${
            display.length > 9 ? "text-[24px] sm:text-[27px]" : ""
          } ${feature ? "text-white" : "text-ink"}`}
          title={display}
        >
          {display}
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <span
            className={`numeric inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${deltaClass}`}
          >
            <Arrow className="size-3" strokeWidth={2.6} />
            {Math.abs(kpi.delta)}%
          </span>
          <span
            className={`truncate text-[11px] ${
              feature ? "text-white/45" : "text-ink-faint"
            }`}
          >
            {kpi.compare}
          </span>
        </div>
      </div>

      {/* sparkline sits flush to the bottom edge, so the card reads as one
          object rather than a chart bolted under a number */}
      <div className="mt-auto">
        <ChartFrame height={40}>
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["dataMin - 5%", "dataMax + 14%"]} />
            <Area
              type="monotone"
              dataKey="v"
              stroke={stroke}
              strokeWidth={1.8}
              fill={`url(#${gradId})`}
              isAnimationActive={false}
              dot={false}
              className="spark-draw"
            />
          </AreaChart>
        </ChartFrame>
      </div>
    </Card>
  );
}
