"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search, Bell, ChevronDown, ChevronRight } from "lucide-react";
import { SLUG_TO_LABEL, SLUG_TO_GROUP, NAV_GROUPS } from "@/lib/nav";

/** Derive breadcrumb trail from the route. */
function useCrumbs() {
  const pathname = usePathname() ?? "/";

  if (pathname === "/") return [{ label: "Dashboard" }];
  if (pathname === "/ask-ai") return [{ label: "Ask AI" }];
  if (pathname === "/reports") return [{ label: "Reports" }];

  if (pathname.startsWith("/reports/")) {
    const slug = pathname.split("/")[2];
    const label = SLUG_TO_LABEL[slug];
    const groupId = SLUG_TO_GROUP[slug];
    const group = NAV_GROUPS.find((g) => g.id === groupId);
    return [
      { label: "Reports", href: "/reports" },
      ...(group ? [{ label: group.label }] : []),
      ...(label ? [{ label }] : []),
    ];
  }
  return [{ label: "Dashboard" }];
}

export default function Topbar({ onMenu }) {
  const crumbs = useCrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-card/90 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenu}
        aria-label="Open navigation"
        className="press grid size-8 shrink-0 place-items-center rounded-lg border border-line text-ink-soft hover:bg-canvas lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      {/* Breadcrumb. The left of the topbar used to be empty on desktop;
          orientation is the obvious thing to put there, and it matters more
          once there are 20 report pages to get lost in. */}
      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 lg:flex">
        {crumbs.map((c, i) => (
          <span key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight className="size-3 shrink-0 text-ink-faint" />}
            {c.href ? (
              <Link
                href={c.href}
                className="truncate text-[12px] text-ink-faint transition-colors hover:text-ink"
              >
                {c.label}
              </Link>
            ) : (
              <span
                className={`truncate text-[12px] ${
                  i === crumbs.length - 1
                    ? "font-semibold text-ink"
                    : "text-ink-faint"
                }`}
              >
                {c.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <div className="ml-auto flex min-w-0 flex-1 justify-end lg:flex-none">
        <label className="relative w-full max-w-[300px]">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            placeholder="Search…"
            className="h-8 w-full rounded-lg border border-line bg-canvas pl-8 pr-9 text-[12px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand focus:bg-card"
          />
          <kbd className="numeric pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-card px-1 py-px text-[9px] text-ink-faint sm:block">
            ⌘K
          </kbd>
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Sync status lives here now — it's global state, so it belongs in
            global chrome. It previously appeared in both the sidebar footer
            and the dashboard header, saying the same thing twice. */}
        <span className="hidden items-center gap-1.5 rounded-lg border border-line bg-canvas px-2 py-1.5 md:inline-flex">
          <span className="relative flex size-1.5">
            <span className="pulse-ring absolute inline-flex size-full rounded-full bg-brand" />
            <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
          </span>
          <span className="text-[11px] font-medium text-ink-soft">
            Synced <span className="text-ink">just now</span>
          </span>
        </span>

        <button
          aria-label="Notifications"
          className="press relative grid size-8 place-items-center rounded-lg border border-line text-ink-soft transition-colors hover:bg-canvas"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-red ring-2 ring-card" />
        </button>

        <button className="press flex items-center gap-2 rounded-lg border border-line py-1 pl-1 pr-1.5 transition-colors hover:bg-canvas sm:pr-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-brand-soft text-[10px] font-bold text-brand">
            AD
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[12px] font-semibold text-ink">Admin User</span>
            <span className="block text-[10px] text-ink-faint">Administrator</span>
          </span>
          <ChevronDown className="hidden size-3 text-ink-faint sm:block" />
        </button>
      </div>
    </header>
  );
}
