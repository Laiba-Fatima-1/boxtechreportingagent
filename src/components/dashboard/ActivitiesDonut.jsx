"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardHeader, SourceChip } from "@/components/ui/Card";
import ChartFrame from "@/components/ui/ChartFrame";
import { ACTIVITY_MIX } from "@/lib/mock-data";

export default function ActivitiesDonut() {
  const total = ACTIVITY_MIX.reduce((s, d) => s + d.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Activities by type"
        action={<SourceChip>Activity Type</SourceChip>}
      />

      <div className="relative p-3">
        <ChartFrame height={200}>
          <PieChart>
            <Pie
              data={ACTIVITY_MIX}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {ACTIVITY_MIX.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--color-line)",
                fontSize: 12,
                boxShadow: "var(--shadow-lift)",
              }}
            />
          </PieChart>
        </ChartFrame>

        {/* Centre label sits outside the SVG so it can never affect measurement */}
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-[30px] font-bold leading-none numeric text-ink">
              {total}
            </div>
            <div className="mt-0.5 text-[11px] text-ink-faint">Total</div>
          </div>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line px-4 py-3.5">
        {ACTIVITY_MIX.map((d) => (
          <li key={d.name} className="flex min-w-0 items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: d.color }}
            />
            <span className="min-w-0 flex-1 truncate text-[12px] text-ink-soft">
              {d.name}
            </span>
            <span className="shrink-0 text-[12px] font-semibold numeric text-ink">
              {d.value}
            </span>
            <span className="shrink-0 text-[11px] numeric text-ink-faint">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
