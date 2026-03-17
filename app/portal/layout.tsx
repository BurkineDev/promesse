import Link from "next/link";
import { Package, PlusCircle, List, Home, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href={user ? "/portal" : "/"} className="flex items-center gap-2">
            <div className="bg-blue-700 rounded-lg p-1">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">La Promesse</span>
          </Link>

          {user ? (
            /* ── Connected nav ── */
            <div className="flex items-center gap-1">
              <Link href="/portal" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Accueil</span>
              </Link>
              <Link href="/portal/mes-colis" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Mes colis</span>
              </Link>
              <Link href="/portal/submit" className="flex items-center gap-1.5 text-sm bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors">
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Envoyer</span>
              </Link>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors ml-1"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* ── Guest nav ── */
            <div className="flex items-center gap-2">
              <Link href="/track" className="text-sm text-gray-500 hover:text-gray-900 px-3 py-2">
                Suivre un colis
              </Link>
              <Link href="/portal/register" className="btn-primary py-1.5 text-sm">
                Connexion / Inscription
              </Link>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
