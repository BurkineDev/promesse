import Link from "next/link";
import { Package } from "lucide-react";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/portal" className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-700" />
            <span className="font-bold text-gray-900">La Promesse</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/track" className="text-gray-500 hover:text-gray-900">Suivre un colis</Link>
            <Link href="/portal/register" className="btn-primary py-1.5 text-sm">Créer un compte</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-2xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
