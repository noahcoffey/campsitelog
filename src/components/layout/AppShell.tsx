"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";
import MobileSidebar from "./MobileSidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SessionProvider>
      <div className="min-h-screen bg-cream">
        <Sidebar />
        <MobileSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="lg:pl-64">
          <Topbar onMenuToggle={() => setSidebarOpen(true)} />
          <main className="p-4 pb-20 lg:p-6 lg:pb-6">{children}</main>
        </div>

        <MobileNav />
      </div>
    </SessionProvider>
  );
}
