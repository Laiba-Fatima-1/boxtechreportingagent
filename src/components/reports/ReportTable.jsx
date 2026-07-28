"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown, ArrowUp, ArrowDown, Search, Download,
  ChevronLeft, ChevronRight, Inbox,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { formatCell, initials } from "@/lib/format";

const PAGE_SIZE = 12;

export default function ReportTable({ table }) {
  const { title, columns, rows } = table;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: null, dir: "asc" });
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      columns.some((c) => String(r[c.key] ?? "").toLowerCase().includes(q))
    );
  }, [rows, columns, query]);

  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = a[sort.key], y = b[sort.key];
      if (x == null) return 1;
      if (y == null) return -1;
      if (typeof x === "number" && typeof y === "number") return (x - y) * dir;
      return String(x).localeCompare(String(y)) * dir;
    });
  }, [filtered, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const toggleSort = (key) => {
    setPage(0);
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" }
    );
  };

  /* Export the FILTERED+SORTED set, not just the visible page — exporting
     what you can see on screen is almost never what people actually want. */
  const exportCsv = () => {
    const head = columns.map((c) => c.label).join(",");
    const body = sorted
      .map((r) =>
        columns
          .map((c) => {
            const v = formatCell(r[c.key], c.format);
            return `"${String(v).replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <h3 className="mr-auto text-[15px] font-semibold text-ink">{title}</h3>

        <label className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0); }}
            placeholder="Filter rows…"
            className="h-8 w-[150px] rounded-lg border border-line bg-canvas pl-8 pr-2 text-[12px] outline-none transition-[width,border-color] focus:w-[190px] focus:border-brand focus:bg-card"
          />
        </label>

        <button
          onClick={exportCsv}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink active:scale-[0.97]"
        >
          <Download className="size-3.5" />
          <span className="hidden sm:inline">CSV</span>
        </button>
      </div>

      {visible.length === 0 ? (
        <EmptyRows query={query} onClear={() => setQuery("")} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="scroll-slim hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-line">
                  {columns.map((c) => {
                    const active = sort.key === c.key;
                    const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
                    return (
                      <th
                        key={c.key}
                        className={`px-4 py-2.5 ${c.align === "right" ? "text-right" : "text-left"}`}
                      >
                        <button
                          onClick={() => toggleSort(c.key)}
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.07em] transition-colors hover:text-ink ${
                            active ? "text-ink" : "text-ink-faint"
                          } ${c.align === "right" ? "flex-row-reverse" : ""}`}
                        >
                          {c.label}
                          <Icon className="size-3 opacity-60" />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.map((row, i) => (
                  <tr
                    key={i}
                    className="row-hover border-b border-line-soft last:border-0"
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-4 py-2.5 ${c.align === "right" ? "text-right" : "text-left"}`}
                      >
                        <Cell row={row} col={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: each row becomes a stacked card */}
          <ul className="divide-y divide-line/50 md:hidden">
            {visible.map((row, i) => {
              const primary = columns.find((c) => c.primary) ?? columns[0];
              const rest = columns.filter((c) => c !== primary).slice(0, 4);
              return (
                <li key={i} className="px-4 py-3">
                  <div className="mb-1.5 truncate text-[13px] font-semibold text-ink">
                    {formatCell(row[primary.key], primary.format)}
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
                    {rest.map((c) => (
                      <div key={c.key} className="flex min-w-0 items-baseline gap-1.5">
                        <dt className="shrink-0 text-[11px] text-ink-faint">{c.label}</dt>
                        <dd className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink">
                          <Cell row={row} col={c} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>

          {/* Pager */}
          <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
            <span className="text-[11px] numeric text-ink-faint">
              {safePage * PAGE_SIZE + 1}–
              {Math.min((safePage + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
            </span>
            <div className="flex items-center gap-1">
              <PagerBtn disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                <ChevronLeft className="size-4" />
              </PagerBtn>
              <span className="px-2 text-[12px] numeric text-ink-soft">
                {safePage + 1} / {pageCount}
              </span>
              <PagerBtn
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
              >
                <ChevronRight className="size-4" />
              </PagerBtn>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

function Cell({ row, col }) {
  const v = row[col.key];

  if (col.badge) return <Badge value={v} variant={col.badge} />;

  if (col.user && v) {
    return (
      <span className="inline-flex min-w-0 items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-soft text-[10px] font-bold text-brand">
          {initials(v)}
        </span>
        <span className="truncate text-[12px] text-ink-soft">{v}</span>
      </span>
    );
  }

  return (
    <span
      className={`truncate text-[12px] ${col.mono ? "font-mono text-[11px]" : ""} ${
        col.strong ? "font-semibold text-ink" : col.primary ? "font-medium text-ink" : "text-ink-soft"
      } ${col.align === "right" ? "numeric" : ""}`}
    >
      {formatCell(v, col.format)}
    </span>
  );
}

function PagerBtn({ disabled, onClick, children }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-canvas disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function EmptyRows({ query, onClear }) {
  return (
    <EmptyState
      icon={Inbox}
      title={query ? "Nothing matches that filter" : "No rows yet"}
      body={
        query
          ? "Try a shorter search term, or clear the filter to see everything."
          : "Rows appear here once the sync loads this report's source DocType."
      }
      action={
        query ? (
          <button
            onClick={onClear}
            className="press rounded-lg border border-line px-3 py-1.5 text-[12px] font-medium text-ink-soft hover:bg-canvas"
          >
            Clear filter
          </button>
        ) : null
      }
    />
  );
}
