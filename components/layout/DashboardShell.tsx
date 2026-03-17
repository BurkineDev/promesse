"use client";

import { useState } from "react";
import { Menu, Package } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  pendingCount: number;
}

export function DashboardShell({ children, pendingCount }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        pendingCount={pendingCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenu principal */}
      <div className="flex-1 md:ml-64 min-w-0">
        {/* Barre mobile en haut */}
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 safe-area-top">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2 flex-1">
            <Package className="w-5 h-5 text-blue-700" />
            <span className="font-bold text-gray-900 text-sm">La Promesse</span>
          </Link>

          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingCount > 99 ? "99+" : pendingCount}
            </span>
          )}
        </div>

        {/* Page */}
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
