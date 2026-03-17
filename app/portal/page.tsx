import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, PackageOpen, ScanSearch, Truck, MessageCircle,
  Package, MailOpen, Phone, ChevronRight,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PackageStatus } from "@/types";
import { formatDate } from "@/lib/utils";

export default async function PortalHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/register");

  const { data: profile } = await supabase
    .from("profiles").select("name").eq("id", user.id).single();

  const { data: packages } = await supabase
    .from("packages")
    .select("id, tracking_number, status, destination, origin, created_at")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const total     = packages?.length ?? 0;
  const active    = packages?.filter(p => !["LIVRE", "ANNULE"].includes(p.status)).length ?? 0;
  const delivered = packages?.filter(p => p.status === "LIVRE").length ?? 0;

  const firstName = profile?.name?.split(" ")[0] ?? "vous";

  return (
    <div className="space-y-5 pb-8">

      {/* ══════════════════════════════════════
          HERO — Greeting
      ══════════════════════════════════════ */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 p-6 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute right-8 top-16 w-20 h-20 bg-white/5 rounded-full" />
        <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full" />

        <p className="text-blue-300 text-sm font-medium mb-1">Bonjour,</p>
        <h1 className="text-2xl font-extrabold mb-5">
          {firstName}&nbsp;
          <span className="inline-flex items-center justify-center w-7 h-7 bg-yellow-400 rounded-full ml-0.5">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 110-16 8 8 0 010 16zm-2-9.5c0 .83-.67 1.5-1.5 1.5S7 11.33 7 10.5 7.67 9 8.5 9s1.5.67 1.5 1.5zm7 0c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5S14.67 9 15.5 9s1.5.67 1.5 1.5zm-6.5 4.5h4a.5.5 0 010 1H9.5a.5.5 0 010-1z" fill="currentColor" className="text-yellow-800"/>
            </svg>
          </span>
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Total", value: total, icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-300">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            )},
            { label: "En cours", value: active, icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-300">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            )},
            { label: "Livrés", value: delivered, icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-blue-300">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )},
          ].map((s) => (
            <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="text-2xl font-extrabold leading-none">{s.value}</p>
              <p className="text-blue-200 text-[11px] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          ACTIONS RAPIDES
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-3">

        {/* Envoyer un colis */}
        <Link href="/portal/submit"
          className="group relative overflow-hidden rounded-2xl bg-blue-600 p-5 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-[0.97]">
          <div className="absolute -bottom-5 -right-5 w-24 h-24 bg-white/10 rounded-full" />
          {/* Flat icon */}
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-3">
            <PackageOpen className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <p className="font-bold text-sm leading-tight">Envoyer<br />un colis</p>
          <p className="text-blue-200 text-xs mt-0.5">Nouvelle demande</p>
          <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Suivre un colis */}
        <Link href="/track"
          className="group relative overflow-hidden rounded-2xl bg-violet-600 p-5 text-white hover:bg-violet-700 transition-all shadow-lg shadow-violet-100 active:scale-[0.97]">
          <div className="absolute -bottom-5 -right-5 w-24 h-24 bg-white/10 rounded-full" />
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-3">
            <ScanSearch className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
          <p className="font-bold text-sm leading-tight">Suivre<br />un colis</p>
          <p className="text-violet-200 text-xs mt-0.5">Par numéro</p>
          <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* ── Collecte à domicile CTA ── */}
      <Link href="/portal/submit"
        className="flex items-center gap-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 hover:bg-amber-100 active:scale-[0.98] transition-all">
        <div className="w-11 h-11 bg-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
          <Truck className="w-5 h-5 text-amber-700" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-amber-900 text-sm">Collecte à domicile disponible</p>
          <p className="text-amber-700 text-xs mt-0.5">Notre agent vient chercher votre colis à Montréal</p>
        </div>
        <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
      </Link>

      {/* ══════════════════════════════════════
          DERNIERS COLIS
      ══════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Mes derniers colis</h2>
          <Link href="/portal/mes-colis"
            className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-0.5">
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {packages && packages.length > 0 ? (
          <div className="space-y-2.5">
            {packages.map((pkg) => (
              <Link key={pkg.id} href={`/track?numero=${pkg.tracking_number}`}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 active:scale-[0.98] transition-all">
                {/* Icon */}
                <div className="flex-shrink-0 w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-sm text-gray-900">{pkg.tracking_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {pkg.origin} → {pkg.destination}
                  </p>
                  <p className="text-xs text-gray-300 mt-0.5">{formatDate(pkg.created_at)}</p>
                </div>
                <StatusBadge status={pkg.status as PackageStatus} size="sm" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MailOpen className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="font-semibold text-gray-700 mb-1">Aucun colis pour l&apos;instant</p>
            <p className="text-gray-400 text-sm mb-5">Soumettez votre première demande en quelques clics</p>
            <Link href="/portal/submit" className="btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2">
              <PackageOpen className="w-4 h-4" strokeWidth={1.5} />
              Envoyer mon premier colis
            </Link>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          SUPPORT WHATSAPP
      ══════════════════════════════════════ */}
      <div className="rounded-2xl overflow-hidden border border-green-100">
        {/* Header */}
        <div className="bg-[#128C7E] px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Besoin d&apos;aide ?</p>
            <p className="text-green-200 text-xs">Réponse en moins de 2h sur WhatsApp</p>
          </div>
        </div>
        {/* Contacts */}
        <div className="bg-white divide-y divide-gray-50">
          <a href="https://wa.me/14399782990" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 text-xl">
              🇨🇦
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Canada</p>
              <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3" /> +1 439 978-2990
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-semibold px-3 py-1.5 rounded-xl">
              <MessageCircle className="w-3 h-3" strokeWidth={2} />
              Chat
            </div>
          </a>
          <a href="https://wa.me/22666031661" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 text-xl">
              🇧🇫
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Burkina Faso</p>
              <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3" /> +226 66 03 16 61
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs font-semibold px-3 py-1.5 rounded-xl">
              <MessageCircle className="w-3 h-3" strokeWidth={2} />
              Chat
            </div>
          </a>
        </div>
      </div>

    </div>
  );
}
