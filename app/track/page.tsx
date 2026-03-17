import { Metadata } from "next";
import Image from "next/image";
import { TrackingSearch } from "@/components/tracking/TrackingSearch";
import { Package } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Suivre mon colis",
};

const HERO_IMG = "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80";

export default function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ numero?: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#04091a] text-white">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-1.5 shadow-lg shadow-blue-900/50">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none">La Promesse</p>
              <p className="text-blue-400 text-[10px] leading-none mt-0.5">Canada–Afrique</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/portal/register"
              className="text-sm text-blue-300 hover:text-white transition-colors px-3 py-1.5">
              Mon espace
            </Link>
            <Link href="/portal/submit"
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl transition-all">
              Envoyer un colis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero with photo ── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 h-64">
          <Image src={HERO_IMG} alt="Entrepôt logistique"
            fill className="object-cover object-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#04091a]/50 to-[#04091a]" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 pt-14 pb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/25 rounded-full px-4 py-1.5 text-blue-300 text-xs font-medium mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Suivi en temps réel
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
            Suivez votre colis
          </h1>
          <p className="text-blue-300/70 text-base mb-1">
            Entrez votre numéro de tracking pour localiser votre envoi
          </p>
          <p className="text-blue-400/50 text-xs font-mono">Format : IMP-2026-0001</p>
        </div>
      </div>

      {/* ── Search component ── */}
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <TrackingSearch searchParams={searchParams} />
      </div>

      {/* ── Footer strip ── */}
      <div className="border-t border-white/5 py-8">
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-blue-300/40">
          <p>© {new Date().getFullYear()} La Promesse Logistiques</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-blue-200 transition-colors">Accueil</Link>
            <Link href="/portal/register" className="hover:text-blue-200 transition-colors">Mon espace</Link>
            <a href="https://wa.me/14399782990" target="_blank" rel="noopener noreferrer"
              className="hover:text-blue-200 transition-colors">💬 WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}
