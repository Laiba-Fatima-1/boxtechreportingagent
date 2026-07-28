"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  CalendarDays, Users, Package, Globe, Activity, Target,
  RotateCcw, Check, ChevronDown, X, Search, SlidersHorizontal,
} from "lucide-react";
import { FILTER_OPTIONS } from "@/lib/mock-data";
import { initials } from "@/lib/format";

/**
 * Dashboard filter bar.
 *
 * Two deliberate choices over a row of native <select>s:
 *
 *  1. Date range is a SEGMENTED CONTROL, not a dropdown. It's the filter people
 *     change most often, so it earns one tap instead of two. The other five are
 *     changed rarely, so they stay tucked into popovers.
 *
 *  2. Applied filters surface as removable CHIPS. With six dropdowns it's easy
 *     to forget a filter is still on and misread the whole dashboard; the chip
 *     row makes active state impossible to miss.
 */

const DATE_PRESETS = [
  { value: "Today", short: "Today" },
  { value: "This week", short: "Week" },
  { value: "This month", short: "Month" },
  { value: "Last 30 days", short: "30 days" },
  { value: "This quarter", short: "Quarter" },
];

const FIELDS = [
  { key: "salesperson", label: "Salesperson", icon: Users, avatar: true },
  { key: "team", label: "Category", icon: Package },
  { key: "region", label: "Region", icon: Globe },
  { key: "activityType", label: "Activity", icon: Activity },
  { key: "leadStatus", label: "Lead status", icon: Target, dot: true },
];

const DEFAULTS = {
  dateRange: "This week",
  salesperson: "All",
  team: "All",
  region: "All",
  activityType: "All",
  leadStatus: "All",
};

/* Status colours mirror the Badge component so the same value reads the
   same way wherever it appears. */
const STATUS_DOT = {
  "Potential Lead": "bg-ink-faint",
  "Initial Inquiry": "bg-ink-faint",
  "Technical Requirement": "bg-blue",
  "Solution Proposal": "bg-blue",
  "Commercial Proposal": "bg-purple",
  Negotiation: "bg-amber",
  Confirmed: "bg-brand",
  Lost: "bg-red",
};

export default function FilterBar() {
  const [values, setValues] = useState(DEFAULTS);
  const [openKey, setOpenKey] = useState(null);
  const rootRef = useRef(null);

  const activeFields = FIELDS.filter((f) => values[f.key] !== DEFAULTS[f.key]);
  const activeCount =
    activeFields.length + (values.dateRange !== DEFAULTS.dateRange ? 1 : 0);

  const set = useCallback((k, v) => {
    setValues((p) => ({ ...p, [k]: v }));
    setOpenKey(null);
  }, []);

  /* Close on outside click or Escape. Both are expected of a popover;
     leaving either out makes it feel broken rather than custom. */
  useEffect(() => {
    if (!openKey) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpenKey(null);
    };
    const onKey = (e) => e.key === "Escape" && setOpenKey(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openKey]);

  const dateIndex = Math.max(
    0,
    DATE_PRESETS.findIndex((d) => d.value === values.dateRange)
  );

  return (
    <div ref={rootRef} className="filter-shell px-3 py-3 sm:px-4">
      {/* ---------- row 1: date segments + reset ---------- */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="hidden shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint sm:inline-flex">
          <CalendarDays className="size-3.5" />
          Period
        </span>

        {/* Segmented control. Scrolls rather than wraps on narrow screens so
            the sliding thumb never has to track a second line. */}
        <div className="scroll-slim -mx-1 min-w-0 max-w-full overflow-x-auto px-1">
          <div
            role="tablist"
            aria-label="Date range"
            className="seg-track grid w-max auto-cols-fr grid-flow-col gap-0 rounded-[14px] bg-canvas p-1"
          >
            <span
              className="seg-thumb"
              style={{
                width: `calc((100% - 8px) / ${DATE_PRESETS.length})`,
                transform: `translateX(calc(${dateIndex} * 100%))`,
                left: 4,
              }}
            />
            {DATE_PRESETS.map((d) => {
              const active = values.dateRange === d.value;
              return (
                <button
                  key={d.value}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setValues((p) => ({ ...p, dateRange: d.value }))}
                  className={`relative z-10 min-w-[76px] whitespace-nowrap rounded-[11px] px-4 py-1.5 text-[12px] font-semibold transition-colors duration-200 ${
                    active ? "text-white" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {d.short}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => setValues(DEFAULTS)}
          disabled={activeCount === 0}
          className="press ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-line bg-white/70 px-2.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-white hover:text-ink disabled:opacity-40 disabled:hover:bg-white/70"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* ---------- row 2: popover triggers ---------- */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="hidden shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint sm:inline-flex">
          <SlidersHorizontal className="size-3.5" />
          Filters
        </span>

        {FIELDS.map((f) => (
          <FilterPopover
            key={f.key}
            field={f}
            value={values[f.key]}
            isDefault={values[f.key] === DEFAULTS[f.key]}
            open={openKey === f.key}
            onToggle={() => setOpenKey(openKey === f.key ? null : f.key)}
            onSelect={(v) => set(f.key, v)}
          />
        ))}
      </div>

      {/* ---------- row 3: applied chips ---------- */}
      {activeCount > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-line/70 pt-2.5">
          <span className="text-[11px] font-medium text-ink-faint">Applied</span>

          {values.dateRange !== DEFAULTS.dateRange && (
            <Chip
              label="Period"
              value={values.dateRange}
              onClear={() =>
                setValues((p) => ({ ...p, dateRange: DEFAULTS.dateRange }))
              }
            />
          )}

          {activeFields.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              value={values[f.key]}
              onClear={() => setValues((p) => ({ ...p, [f.key]: DEFAULTS[f.key] }))}
            />
          ))}

          <button
            onClick={() => setValues(DEFAULTS)}
            className="ml-auto text-[11px] font-semibold text-brand hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function FilterPopover({ field, value, isDefault, open, onToggle, onSelect }) {
  const { key, label, icon: Icon, avatar, dot } = field;
  const options = FILTER_OPTIONS[key] ?? [];
  const [query, setQuery] = useState("");

  /* Search only appears once a list is long enough to need it. */
  const searchable = options.length > 8;
  const shown = searchable
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        data-active={!isDefault}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="filter-trigger press inline-flex h-8 max-w-[190px] items-center gap-1.5 rounded-xl border border-line bg-white/70 pl-2.5 pr-2 text-[12px] font-medium text-ink-soft"
      >
        <Icon className={`size-3.5 shrink-0 ${isDefault ? "text-ink-faint" : "text-brand"}`} />
        <span className="truncate">
          {isDefault ? label : <span className="font-semibold text-ink">{value}</span>}
        </span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-ink-faint transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="popover-panel absolute left-0 top-[calc(100%+6px)] z-50 w-[228px] overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow-lift)]"
        >
          <div className="border-b border-line px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
            {label}
          </div>

          {searchable && (
            <div className="border-b border-line p-2">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="h-8 w-full rounded-lg border border-line bg-canvas pl-8 pr-2 text-[12px] outline-none focus:border-brand focus:bg-card"
                />
              </label>
            </div>
          )}

          <ul className="scroll-slim max-h-[264px] overflow-y-auto p-1.5">
            {shown.length === 0 && (
              <li className="px-2.5 py-4 text-center text-[12px] text-ink-faint">
                No matches
              </li>
            )}
            {shown.map((o) => {
              const selected = o === value;
              return (
                <li key={o}>
                  <button
                    role="option"
                    aria-selected={selected}
                    onClick={() => onSelect(o)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors ${
                      selected
                        ? "bg-brand-soft font-semibold text-brand"
                        : "text-ink-soft hover:bg-canvas hover:text-ink"
                    }`}
                  >
                    {avatar && o !== "All" && (
                      <span className="grid size-5 shrink-0 place-items-center rounded-md bg-brand-soft text-[10px] font-bold text-brand">
                        {initials(o)}
                      </span>
                    )}
                    {dot && o !== "All" && (
                      <span
                        className={`size-2 shrink-0 rounded-full ${
                          STATUS_DOT[o] ?? "bg-ink-faint"
                        }`}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate">{o}</span>
                    {selected && <Check className="size-3.5 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Chip({ label, value, onClear }) {
  return (
    <span className="filter-chip inline-flex max-w-[210px] items-center gap-1.5 rounded-lg py-1 pl-2 pr-1 text-[11px]">
      <span className="shrink-0 text-ink-faint">{label}:</span>
      <span className="min-w-0 truncate font-semibold text-ink">{value}</span>
      <button
        onClick={onClear}
        aria-label={`Remove ${label} filter`}
        className="press grid size-4 shrink-0 place-items-center rounded text-ink-faint transition-colors hover:bg-red-soft hover:text-red"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
