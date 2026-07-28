"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Sparkles,
  Table2,
  ChevronRight,
  X,
  Box,
} from "lucide-react";
import { NAV_GROUPS, PRIMARY_LINKS, ACCENT_CLASS } from "@/lib/nav";

const ICONS = { LayoutGrid, Sparkles, Table2 };

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  /* Groups start CLOSED. Twenty reports behind six labels is scannable;
     twenty reports all expanded is the scattered wall we're replacing. */
  const [openGroups, setOpenGroups] = useState(() => new Set());

  const toggle = (id) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <>
      {/* Scrim — only exists below lg, where the sidebar is a drawer */}
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-forest-deep/40 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[268px] flex-col bg-forest text-white transition-transform duration-300 ease-[var(--ease-brand)] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 pb-4 pt-5">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10">
            <Box className="size-[18px] text-white" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-bold tracking-[-0.01em]">
              BoxTech
            </div>
            <div className="truncate text-[11px] font-medium text-white/45">
              AI Reporting Agent
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="scroll-slim flex-1 overflow-y-auto px-3 pb-4">
          {/* Daily screens, always visible */}
          <ul className="space-y-0.5">
            {PRIMARY_LINKS.map((l) => {
              const Icon = ICONS[l.icon];
              const active = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={onClose}
                    className={`nav-item flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium ${
                      active
                        ? "bg-white/12 text-white"
                        : "text-white/65 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <Icon className="size-[17px] shrink-0" strokeWidth={2} />
                    <span className="flex-1 truncate">{l.label}</span>
                    {l.badge && (
                      <span className="shrink-0 rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
                        {l.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mx-3 my-4 h-px bg-white/10" />

          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-white/35">
            Reports
          </div>

          {/* The six categories */}
          <ul className="space-y-0.5">
            {NAV_GROUPS.map((g) => {
              const isOpen = openGroups.has(g.id);
              const accent = ACCENT_CLASS[g.accent];
              return (
                <li key={g.id}>
                  <button
                    onClick={() => toggle(g.id)}
                    aria-expanded={isOpen}
                    className="nav-item flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-white/65 hover:bg-white/8 hover:text-white"
                  >
                    <span
                      className={`size-2 shrink-0 rounded-full ${accent.dot}`}
                    />
                    <span className="flex-1 truncate">{g.label}</span>
                    <span className="shrink-0 text-[11px] numeric text-white/35">
                      {g.reports.length}
                    </span>
                    <ChevronRight
                      className={`size-3.5 shrink-0 text-white/40 transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {/* Grid-rows trick: animates height without measuring JS */}
                  <div
                    className={`grid transition-all duration-300 ease-[var(--ease-brand)] ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <ul className="overflow-hidden">
                      <div className="ml-[19px] mt-0.5 space-y-px border-l border-white/10 pl-3">
                        {g.reports.map((r) => (
                          <li key={r.slug}>
                            <Link
                              href={`/reports/${r.slug}`}
                              onClick={onClose}
                              title={`Source: ${r.source}`}
                              className="nav-item block truncate rounded-lg px-3 py-2 text-[12px] text-white/55 hover:bg-white/8 hover:text-white"
                            >
                              {r.label}
                            </Link>
                          </li>
                        ))}
                      </div>
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sync status — read-only guarantee stated where it's always visible */}
        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="pulse-ring absolute inline-flex size-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[12px] font-medium text-white/75">
              Synced · just now
            </span>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-white/35">
            Read-only mirror · next sync 1:00 PM
          </p>
        </div>
      </aside>
    </>
  );
}
