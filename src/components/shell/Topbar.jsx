"use client";

import { Menu, Search, Bell, ChevronDown } from "lucide-react";

export default function Topbar({ onMenu }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-card/85 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenu}
        aria-label="Open navigation"
        className="grid size-9 shrink-0 place-items-center rounded-xl border border-line text-ink-soft transition-colors hover:bg-canvas lg:hidden"
      >
        <Menu className="size-[18px]" />
      </button>

      {/* Search: full-width on mobile, centred and capped on desktop */}
      <div className="flex min-w-0 flex-1 justify-center">
        <label className="relative w-full max-w-[460px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            placeholder="Search customers, reports, activities…"
            className="h-9 w-full rounded-xl border border-line bg-canvas pl-9 pr-3 text-[13px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand focus:bg-card sm:pr-12"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-card px-1.5 py-0.5 text-[10px] font-medium text-ink-faint sm:block">
            ⌘K
          </kbd>
        </label>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          aria-label="Notifications"
          className="relative grid size-9 place-items-center rounded-xl border border-line text-ink-soft transition-colors hover:bg-canvas"
        >
          <Bell className="size-[17px]" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-red ring-2 ring-card" />
        </button>

        <button className="flex items-center gap-2 rounded-xl border border-line py-1 pl-1 pr-1.5 transition-colors hover:bg-canvas sm:pr-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-[11px] font-bold text-brand">
            AD
          </span>
          <span className="hidden text-left leading-tight sm:block">
            <span className="block text-[12px] font-semibold text-ink">
              Admin User
            </span>
            <span className="block text-[10px] text-ink-faint">
              Administrator
            </span>
          </span>
          <ChevronDown className="hidden size-3.5 text-ink-faint sm:block" />
        </button>
      </div>
    </header>
  );
}
