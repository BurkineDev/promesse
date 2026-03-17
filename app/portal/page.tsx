import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PackageStatus, STATUS_LABELS } from "@/types";
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

  const total   = packages?.length ?? 0;
  const active  = packages?.filter(p => !["LIVRE","ANNULE"].includes(p.status)).length ?? 0;
  const delivered = packages?.filter(p => p.status === "LIVRE").length ?? 0;

  const firstName = profile?.name?.split(" ")[0] ?? "vous";

  return (
    <div className="space-y-6 pb-6">

      {/* ── Greeting banner ── */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-blue-900 p-6 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -right-2 top-12 w-24 h-24 bg-white/5 rounded-full" />
        <p className="text-blue-300 text-sm font-medium mb-1">Bonjour,</p>
        <h1 className="text-2xl font-extrabold mb-4">{firstName} 👋</h1>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Colis total",   value: total },
            { label: "En cours",      value: active },
            { label: "Livrés",        value: delivered },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center">
              <p className="text-2xl font-extrabold">{s.value}</p>
              <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/portal/submit"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white hover:from-blue-500 hover:to-blue-700 transition-all shadow-lg shadow-blue-200">
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
          <div className="text-3xl mb-3">📦</div>
          <p className="font-bold text-sm">Envoyer un colis</p>
          <p className="text-blue-200 text-xs mt-0.5">Nouvelle demande</p>
          <ArrowRight className="absolute top-4 right-4 w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link href="/track"
          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 p-5 text-white hover:from-violet-500 hover:to-violet-700 transition-all shadow-lg shadow-violet-200">
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
          <div className="text-3xl mb-3">🔍</div>
          <p className="font-bold text-sm">Suivre un colis</p>
          <p className="text-violet-200 text-xs mt-0.5">Par numéro</p>
          <ArrowRight className="absolute top-4 right-4 w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* ── Collecte à domicile CTA ── */}
      <Link href="/portal/submit"
        className="flex items-center gap-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 hover:bg-amber-100 transition-colors">
        <div className="text-3xl flex-shrink-0">🚚</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-amber-900 text-sm">Collecte à domicile disponible</p>
          <p className="text-amber-700 text-xs mt-0.5">Notre agent vient chercher votre colis chez vous à Montréal</p>
        </div>
        <ArrowRight className="w-4 h-4 text-amber-500 flex-shrink-0" />
      </Link>

      {/* ── Derniers colis ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Mes derniers colis</h2>
          <Link href="/portal/mes-colis" className="text-sm text-blue-600 font-medium hover:underline">
            Voir tout →
          </Link>
        </div>

        {packages && packages.length > 0 ? (
          <div className="space-y-2.5">
            {packages.map((pkg) => (
              <Link key={pkg.id} href={`/track?numero=${pkg.tracking_number}`}
                className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-sm text-gray-900">{pkg.tracking_number}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {pkg.origin} → {pkg.destination} · {formatDate(pkg.created_at)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={pkg.status as PackageStatus} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-semibold text-gray-700 mb-1">Aucun colis pour l&apos;instant</p>
            <p className="text-gray-400 text-sm mb-4">Soumettez votre première demande en quelques clics</p>
            <Link href="/portal/submit" className="btn-primary text-sm py-2 px-5">
              Envoyer mon premier colis
            </Link>
          </div>
        )}
      </div>

      {/* ── Support WhatsApp ── */}
      <div className="rounded-2xl bg-[#075e54] p-5 text-white">
        <p className="font-bold mb-0.5">💬 Besoin d&apos;aide ?</p>
        <p className="text-green-200 text-sm mb-4">Notre équipe répond en moins de 2h sur WhatsApp</p>
        <div className="grid grid-cols-2 gap-3">
          <a href="https://wa.me/14399782990" target="_blank" rel="noopener noreferrer"
            className="bg-white/15 hover:bg-white/25 rounded-xl p-3 text-center transition-colors">
            <div className="text-xl mb-1">🇨🇦</div>
            <p className="text-xs font-semibold">Canada</p>
            <p className="text-green-200 text-[10px]">+1 439 978-2990</p>
          </a>
          <a href="https://wa.me/22666031661" target="_blank" rel="noopener noreferrer"
            className="bg-white/15 hover:bg-white/25 rounded-xl p-3 text-center transition-colors">
            <div className="text-xl mb-1">🇧🇫</div>
            <p className="text-xs font-semibold">Burkina Faso</p>
            <p className="text-green-200 text-[10px]">+226 66 03 16 61</p>
          </a>
        </div>
      </div>
    </div>
  );
}
