import Link from "next/link";
import { Package, PlusCircle, List, Home, LogOut, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 safe-area-top">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={user ? "/portal" : "/"} className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-1.5 shadow-sm">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">La Promesse</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-0.5">
              <Link href="/portal"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-2.5 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Accueil</span>
              </Link>
              <Link href="/portal/mes-colis"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-2.5 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Colis</span>
              </Link>
              <Link href="/track"
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 px-2.5 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Suivre</span>
              </Link>
              <Link href="/portal/submit"
                className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-2 rounded-xl hover:bg-blue-500 transition-colors font-semibold shadow-sm ml-1">
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Envoyer</span>
              </Link>
              <form action="/api/auth/logout" method="POST" className="ml-1">
                <button type="submit"
                  className="flex items-center text-gray-300 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Se déconnecter">
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/track" className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2 transition-colors">
                Suivre un colis
              </Link>
              <Link href="/portal/register"
                className="text-xs font-semibold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition-all">
                Connexion
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-20">{children}</div>

      {/* Bottom nav for mobile — only when logged in */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 sm:hidden safe-area-bottom z-50">
          <div className="flex items-center justify-around py-2">
            {[
              { href: "/portal", icon: Home, label: "Accueil" },
              { href: "/portal/mes-colis", icon: List, label: "Colis" },
              { href: "/portal/submit", icon: PlusCircle, label: "Envoyer" },
              { href: "/track", icon: Search, label: "Suivre" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
