"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Package, CreditCard, Search,
  LogOut, Truck, AlertTriangle, CheckSquare, Globe, Megaphone,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard",             label: "Tableau de bord",  icon: LayoutDashboard, badge: false },
  { href: "/dashboard/packages",    label: "Colis",            icon: Package,         badge: false },
  { href: "/dashboard/validation",  label: "Validation",       icon: CheckSquare,     badge: true  },
  { href: "/dashboard/clients",     label: "Clients",          icon: Users,           badge: false },
  { href: "/dashboard/shipments",   label: "Lots / Départs",   icon: Truck,           badge: false },
  { href: "/dashboard/payments",    label: "Paiements",        icon: CreditCard,      badge: false },
  { href: "/dashboard/incidents",   label: "Incidents",        icon: AlertTriangle,   badge: false },
  { href: "/dashboard/annonces",    label: "Annonces",         icon: Megaphone,       badge: false },
];

export function Sidebar({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <aside className="w-64 bg-blue-900 text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-blue-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Package className="w-7 h-7 text-blue-300" />
          <div>
            <p className="text-white font-bold text-lg leading-tight">La Promesse</p>
            <p className="text-blue-400 text-xs">Services Logistiques</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          const showBadge = badge && pendingCount > 0;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-700 text-white"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              }`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 border-t border-blue-800 mt-4 space-y-1">
          <Link href="/track" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors">
            <Search className="w-5 h-5 flex-shrink-0" />Portail tracking
          </Link>
          <Link href="/portal" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors">
            <Globe className="w-5 h-5 flex-shrink-0" />Portail client
          </Link>
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-blue-800">
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors">
          <LogOut className="w-5 h-5 flex-shrink-0" />Déconnexion
        </button>
      </div>
    </aside>
  );
}
