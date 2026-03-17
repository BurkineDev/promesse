import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PackageStatus } from "@/types";
import { Package } from "lucide-react";

export default async function MesColisPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/register");

  const { data: packages } = await supabase
    .from("packages")
    .select("id, tracking_number, status, destination, origin, description, created_at, is_urgent")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes colis</h1>
        <Link href="/portal/submit" className="btn-primary text-sm py-2">+ Nouveau</Link>
      </div>

      {packages && packages.length > 0 ? (
        <div className="space-y-3">
          {packages.map(pkg => (
            <Link key={pkg.id} href={`/track?numero=${pkg.tracking_number}`}
              className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-sm text-gray-900">
                    {pkg.tracking_number}
                  </span>
                  {pkg.is_urgent && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">URGENT</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate max-w-xs">{pkg.description}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {pkg.origin} → {pkg.destination} · {formatDate(pkg.created_at)}
                </p>
              </div>
              <StatusBadge status={pkg.status as PackageStatus} size="sm" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Vous n&apos;avez pas encore de colis</p>
          <Link href="/portal/submit" className="btn-primary">Envoyer mon premier colis</Link>
        </div>
      )}
    </div>
  );
}
