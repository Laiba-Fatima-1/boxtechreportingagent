"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Sparkles, Table2, ChevronRight, X, Box,
  Receipt, Waypoints, PhoneCall, Building2, Wallet, Users,
} from "lucide-react";
import {
  NAV_GROUPS, PRIMARY_LINKS, ACCENT_CLASS, SLUG_TO_GROUP,
} from "@/lib/nav";

const PRIMARY_ICONS = { LayoutGrid: LayoutDashboard, Sparkles, Table2 };
const GROUP_ICONS = { Receipt, Waypoints, PhoneCall, Building2, Wallet, Users };

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  /* Which report (if any) are we looking at? */
  const activeSlug = pathname?.startsWith("/reports/")
    ? pathname.split("/")[2]
    : null;
  const activeGroup = activeSlug ? SLUG_TO_GROUP[activeSlug] : null;

  /* Groups start collapsed — but the one containing the current report
     opens automatically. Landing on a page and finding the nav closed
     around you is disorienting; the sidebar should always show where
     you are. */
  const [openGroups, setOpenGroups] = useState(() =>
    activeGroup ? new Set([activeGroup]) : new Set()
  );

  useEffect(() => {
    if (activeGroup) {
      setOpenGroups((prev) => new Set(prev).add(activeGroup));
    }
  }, [activeGroup]);

  const toggle = (id) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden={!open}
        className={`fixed inset-0 z-40 bg-forest-deep/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[252px] flex-col bg-forest text-white transition-transform duration-300 ease-[var(--ease-brand)] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* ---------- brand ---------- */}
        <div className="flex items-center gap-2.5 px-4 pb-3 pt-4">
          <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/10">
            <Box className="size-4 text-white" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display truncate text-[15px] font-bold leading-tight">
              BoxTech
            </div>
            <div className="truncate text-[10px] font-medium text-white/45">
              AI Reporting Agent
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="grid size-7 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="scroll-slim flex-1 overflow-y-auto px-2.5 pb-3">
          {/* ---------- primary ---------- */}
          <ul className="space-y-0.5">
            {PRIMARY_LINKS.map((l) => {
              const Icon = PRIMARY_ICONS[l.icon];
              const active = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`nav-item relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium ${
                      active
                        ? "bg-white/12 text-white"
                        : "text-white/60 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {/* Accent bar: an active state you can spot peripherally,
                        rather than a background tint you have to look for. */}
                    {active && (
                      <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-emerald-300" />
                    )}
                    <Icon className="size-4 shrink-0" strokeWidth={2} />
                    <span className="flex-1 truncate">{l.label}</span>
                    {l.badge && (
                      <span className="shrink-0 rounded bg-emerald-300/90 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-forest">
                        {l.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mx-2 my-3 h-px bg-white/10" />
          <div className="px-3 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/30">
            Reports
          </div>

          {/* ---------- categories ---------- */}
          <ul className="space-y-0.5">
            {NAV_GROUPS.map((g) => {
              const isOpen = openGroups.has(g.id);
              const accent = ACCENT_CLASS[g.accent];
              const Icon = GROUP_ICONS[g.icon];
              const holdsActive = activeGroup === g.id;

              return (
                <li key={g.id}>
                  <button
                    onClick={() => toggle(g.id)}
                    aria-expanded={isOpen}
                    className={`nav-item flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] font-medium ${
                      holdsActive
                        ? "text-white"
                        : "text-white/60 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {/* Tinted icon chip replaces the coloured dot. Same colour
                        coding, but the glyph also says what the category is. */}
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-lg bg-white/8 ${accent.chip}`}
                    >
                      <Icon className="size-3.5" strokeWidth={2.1} />
                    </span>
                    <span className="flex-1 truncate">{g.label}</span>
                    <span className="numeric shrink-0 text-[10px] text-white/30">
                      {g.reports.length}
                    </span>
                    <ChevronRight
                      className={`size-3.5 shrink-0 text-white/35 transition-transform duration-200 ${
                        isOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-[var(--ease-brand)] ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <ul className="overflow-hidden">
                      <div className="ml-[22px] mt-0.5 space-y-px border-l border-white/10 pl-2.5">
                        {g.reports.map((r) => {
                          const active = activeSlug === r.slug;
                          return (
                            <li key={r.slug}>
                              <Link
                                href={`/reports/${r.slug}`}
                                onClick={onClose}
                                aria-current={active ? "page" : undefined}
                                title={`Source: ${r.source}`}
                                className={`nav-item relative block truncate rounded-lg px-2.5 py-1.5 text-[12px] ${
                                  active
                                    ? "bg-white/12 font-semibold text-white"
                                    : "text-white/50 hover:bg-white/8 hover:text-white"
                                }`}
                              >
                                {active && (
                                  <span className="absolute -left-[11px] top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-emerald-300" />
                                )}
                                {r.label}
                              </Link>
                            </li>
                          );
                        })}
                      </div>
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ---------- footer ----------
            Sync status moved to the topbar, where global state belongs and
            where it isn't duplicated. What stays here is the one thing that
            should never scroll out of view: the read-only guarantee. */}
        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-[10px] leading-relaxed text-white/35">
            Read-only mirror of ERPNext.
            <br />
            No data is ever written back.
          </p>
        </div>
      </aside>
    </>
  );
}
