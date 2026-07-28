"use client";

import { useState } from "react";
import {
  Sparkles,
  Send,
  FileSearch,
  ShieldCheck,
  CornerDownLeft,
} from "lucide-react";
import { Card, CardHeader, SourceChip } from "@/components/ui/Card";
import { SUGGESTED_QUESTIONS, SAMPLE_ANSWER } from "@/lib/mock-data";
import { initials } from "@/lib/format";

export default function AskAiPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const ask = (q) => {
    const text = (q ?? input).trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "assistant", payload: SAMPLE_ANSWER },
    ]);
    setInput("");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[30px] font-bold leading-none text-ink">
          Ask AI
        </h1>
        <p className="mt-0.5 text-[13px] text-ink-soft">
          Ask about your sales data in plain English. Every answer links to the
          records behind it.
        </p>
      </div>

      {/* Chat left, prompts right on desktop; prompts drop below on mobile */}
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          <Card className="flex min-h-[520px] flex-col">
            <CardHeader
              title="Conversation"
              action={
                <span className="inline-flex items-center gap-1.5 rounded-md bg-brand-soft px-2 py-1 text-[11px] font-semibold text-brand">
                  <ShieldCheck className="size-3" />
                  Read-only
                </span>
              }
            />

            <div className="scroll-slim flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {messages.length === 0 && <EmptyState onPick={ask} />}
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <UserBubble key={i} text={m.text} />
                ) : (
                  <AnswerBlock key={i} data={m.payload} />
                )
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-line p-3 sm:p-4">
              <div className="flex items-end gap-2">
                <textarea
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      ask();
                    }
                  }}
                  placeholder="Ask about calls, customers, pipeline or payments…"
                  className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand focus:bg-card"
                />
                <button
                  onClick={() => ask()}
                  disabled={!input.trim()}
                  aria-label="Send question"
                  className="grid size-[42px] shrink-0 place-items-center rounded-xl bg-brand text-white transition-opacity hover:opacity-90 disabled:opacity-35"
                >
                  <Send className="size-[17px]" />
                </button>
              </div>
              <p className="mt-2 text-[11px] text-ink-faint">
                Answers come only from imported ERPNext records. Verify before
                acting on financial decisions.
              </p>
            </div>
          </Card>
        </div>

        <div className="min-w-0 space-y-4 lg:col-span-4">
          <Card>
            <CardHeader title="Try asking" />
            <ul className="space-y-1 p-3">
              {SUGGESTED_QUESTIONS.map((q) => (
                <li key={q}>
                  <button
                    onClick={() => ask(q)}
                    className="group flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] leading-snug text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                  >
                    <CornerDownLeft className="mt-0.5 size-3.5 shrink-0 text-ink-faint" />
                    <span>{q}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="How answers are built" />
            <ol className="space-y-3 p-4 text-[12px] leading-relaxed text-ink-soft">
              {[
                "Your question is translated into a read-only SELECT against the reporting database.",
                "Write operations are blocked at the query layer, not just the prompt.",
                "Results are returned with the exact filters applied, so you can check the scope.",
                "AI commentary is labelled separately from the figures themselves.",
              ].map((s, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="grid size-5 shrink-0 place-items-center rounded-md bg-canvas text-[10px] font-bold text-ink-soft">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPick }) {
  return (
    <div className="grid h-full place-items-center py-10 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-purple-soft">
          <Sparkles className="size-5 text-purple" />
        </span>
        <h3 className="mt-3 text-[15px] font-semibold text-ink">
          Ask your first question
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
          Try something specific, like a date range or a salesperson. Pick one
          from the list to see the shape of an answer.
        </p>
        <button
          onClick={() => onPick(SUGGESTED_QUESTIONS[0])}
          className="mt-4 rounded-xl bg-brand px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          {SUGGESTED_QUESTIONS[0]}
        </button>
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div className="flex justify-end gap-2.5">
      <div className="max-w-[80%] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
        {text}
      </div>
    </div>
  );
}

function AnswerBlock({ data }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-purple-soft">
        <Sparkles className="size-4 text-purple" />
      </span>

      <div className="min-w-0 flex-1 space-y-3">
        {/* Scope: what the system understood, before any numbers */}
        <div className="rounded-xl border border-line bg-canvas/70 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-ink-faint">
            Understood as
          </div>
          <p className="mt-1 text-[12px] text-ink-soft">{data.understood}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.filters.map((f) => (
              <SourceChip key={f.label}>
                {f.label}: {f.value}
              </SourceChip>
            ))}
          </div>
        </div>

        {/* The fact */}
        <div className="rounded-xl border border-line bg-card p-3.5">
          <p className="text-[15px] font-semibold text-ink">{data.answer}</p>

          <ul className="mt-3 space-y-2">
            {data.breakdown.map((b) => (
              <li key={b.user} className="flex items-center gap-2.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-md bg-canvas text-[10px] font-bold text-ink-soft">
                  {initials(b.user)}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12px] text-ink-soft">
                  {b.user}
                </span>
                <span className="shrink-0 text-[12px] font-semibold numeric text-ink">
                  {b.calls}
                </span>
              </li>
            ))}
          </ul>

          <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-[12px] font-semibold text-brand transition-colors hover:bg-brand-soft">
            <FileSearch className="size-3.5" />
            View source records ({data.sourceCount})
          </button>
        </div>

        {/* Interpretation, clearly fenced off from the fact above */}
        <div className="rounded-xl border border-purple/20 bg-purple-soft/40 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-purple">
            <Sparkles className="size-3" />
            AI observation
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
            {data.observation}
          </p>
        </div>
      </div>
    </div>
  );
}
