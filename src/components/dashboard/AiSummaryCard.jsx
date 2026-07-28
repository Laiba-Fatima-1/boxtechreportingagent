"use client";

import {
  Sparkles, RefreshCw, TrendingUp, Eye, AlertTriangle, FileSearch,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AI_SUMMARY } from "@/lib/mock-data";
import { num } from "@/lib/format";

const TONE = {
  good: { Icon: TrendingUp, ring: "bg-brand-soft text-brand" },
  watch: { Icon: Eye, ring: "bg-blue-soft text-blue" },
  risk: { Icon: AlertTriangle, ring: "bg-amber-soft text-amber" },
};

export default function AiSummaryCard() {
  return (
    <Card tier="float" className="ai-surface relative flex h-full flex-col overflow-hidden">
      {/* ---- header ---- */}
      <div className="flex items-center gap-3 px-5 pt-5">
        <span className="relative grid size-10 shrink-0 place-items-center">
          {/* Halo is the only continuous motion on the page. It's what makes
              this card feel live rather than static — and it's confined to
              one element so it never becomes noise. */}
          <span className="halo absolute inset-0 rounded-2xl bg-purple/20 blur-md" />
          <span className="relative grid size-10 place-items-center rounded-2xl bg-white shadow-[var(--shadow-raised)]">
            <Sparkles className="size-[18px] text-purple" strokeWidth={2.1} />
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[15px] font-semibold text-ink">
            AI Daily Summary
          </h2>
          <p className="text-[11px] text-ink-faint">
            8:10 AM · <span className="numeric">{num(AI_SUMMARY.sourceCount)}</span> records
          </p>
        </div>

        <button
          className="press group grid size-8 shrink-0 place-items-center rounded-xl border border-line bg-white/80 text-ink-soft transition-colors hover:text-brand"
          aria-label="Regenerate summary"
        >
          <RefreshCw className="size-3.5 transition-transform duration-500 group-hover:rotate-180" />
        </button>
      </div>

      <div className="flex-1 space-y-4 px-5 py-4">
        {/* ---- FACTS ---- */}
        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            What the records show
          </h3>
          <ul className="space-y-2">
            {AI_SUMMARY.facts.map((f, i) => (
              <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink">
                <span className="mt-[7px] size-1 shrink-0 rounded-full bg-ink-faint" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* The compliance boundary required by section 9: verifiable facts
            above, model interpretation below. The rule is load-bearing, so
            it's a visible line and a labelled heading, not a subtle shift. */}
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-linear-to-r from-transparent via-line to-transparent" />
        </div>

        {/* ---- OBSERVATIONS ---- */}
        <section>
          <h3 className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-purple">
            <Sparkles className="size-3" />
            AI analysis · not a source record
          </h3>
          <ul className="space-y-2.5">
            {AI_SUMMARY.observations.map((o, i) => {
              const { Icon, ring } = TONE[o.tone];
              return (
                <li key={i} className="flex gap-2.5">
                  <span className={`grid size-6 shrink-0 place-items-center rounded-lg ${ring}`}>
                    <Icon className="size-3.5" strokeWidth={2.2} />
                  </span>
                  <span className="text-[12px] leading-relaxed text-ink-soft">
                    {o.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line-soft px-5 py-3">
        <p className="text-[11px] text-ink-faint">Reflects current filters.</p>
        <button className="press group inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-brand">
          <FileSearch className="size-3.5" />
          <span className="border-b border-transparent transition-colors group-hover:border-brand">
            View source records
          </span>
        </button>
      </div>
    </Card>
  );
}
