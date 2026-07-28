"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({ children }) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-canvas">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* Sidebar is fixed, so the content column is offset from lg upward only */}
      <div className="lg:pl-[252px]">
        <Topbar onMenu={() => setNavOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
