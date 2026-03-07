import { Metadata } from "next";
import { TrackingSearch } from "@/components/tracking/TrackingSearch";
import { Package } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Suivre mon colis | PromessTrack",
};

export default function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ numero?: string }>;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/track" className="flex items-center gap-2 text-white">
          <Package className="w-7 h-7 text-blue-200" />
          <div>
            <p className="font-bold text-lg leading-tight">PromessTrack</p>
            <p className="text-blue-300 text-xs">Suivi de colis</p>
          </div>
        </Link>
        <Link
          href="/auth/login"
          className="text-sm text-blue-200 hover:text-white transition-colors"
        >
          Espace professionnel →
        </Link>
      </nav>

      {/* Hero */}
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">
          Suivez votre colis
        </h1>
        <p className="text-blue-200 text-lg mb-10">
          Entrez votre numéro de tracking pour connaître l&apos;état de votre
          envoi en temps réel
        </p>

        <TrackingSearch searchParams={searchParams} />
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-blue-400 text-sm">
        <p>PromessTrack — Gestion import-export professionnelle</p>
      </div>
    </div>
  );
}
