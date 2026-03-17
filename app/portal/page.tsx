import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, PlusCircle, List, Bell } from "lucide-react";

export default async function PortalHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/portal/register");

  const { data: packages } = await supabase
    .from("packages")
    .select("id, tracking_number, status, destination, created_at")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bienvenue 👋</h1>
        <p className="text-gray-500 mt-1">Gérez vos envois avec La Promesse Logistiques</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/portal/submit" className="card p-5 flex flex-col items-center gap-3 hover:shadow-md transition-shadow text-center">
          <div className="bg-blue-100 p-3 rounded-2xl">
            <PlusCircle className="w-7 h-7 text-blue-700" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Envoyer un colis</p>
            <p className="text-xs text-gray-500 mt-0.5">Soumettre une nouvelle demande</p>
          </div>
        </Link>

        <Link href="/portal/mes-colis" className="card p-5 flex flex-col items-center gap-3 hover:shadow-md transition-shadow text-center">
          <div className="bg-purple-100 p-3 rounded-2xl">
            <List className="w-7 h-7 text-purple-700" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Mes colis</p>
            <p className="text-xs text-gray-500 mt-0.5">Voir tous mes envois</p>
          </div>
        </Link>
      </div>

      {/* Tracking rapide */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-700" />
          Derniers colis
        </h2>
        {packages && packages.length > 0 ? (
          <div className="space-y-3">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/track?numero=${pkg.tracking_number}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <div>
                  <p className="font-mono text-sm font-bold text-gray-900">{pkg.tracking_number}</p>
                  <p className="text-xs text-gray-500">{pkg.destination}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                  {pkg.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">Aucun colis pour l&apos;instant</p>
            <Link href="/portal/submit" className="btn-primary mt-3 inline-block text-sm py-1.5">
              Envoyer mon premier colis
            </Link>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <p className="font-semibold text-blue-900 mb-1">💬 Besoin d&apos;aide ?</p>
        <p className="text-sm text-blue-700">Contactez-nous directement via WhatsApp</p>
        <div className="mt-3 flex gap-3 text-sm">
          <a href="https://wa.me/14399782990" target="_blank" rel="noopener noreferrer"
            className="bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-600">
            🇨🇦 Canada
          </a>
          <a href="https://wa.me/22666031661" target="_blank" rel="noopener noreferrer"
            className="bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-600">
            🇧🇫 Burkina
          </a>
        </div>
      </div>
    </div>
  );
}
