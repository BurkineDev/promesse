"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { CATEGORY_LABELS, PackageCategory, PackageStatus } from "@/types";
import Link from "next/link";

interface PendingPackage {
  id: string;
  tracking_number: string;
  status: PackageStatus;
  description: string | null;
  weight: number | null;
  destination: string;
  origin: string;
  category: string;
  estimated_price: number | null;
  is_urgent: boolean;
  created_at: string;
  client: { name: string; phone?: string; email?: string } | null;
}

export function ValidationList({ packages }: { packages: PendingPackage[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleValidate(pkg: PendingPackage) {
    setProcessing(pkg.id);
    await supabase.from("packages").update({ status: "RECU" }).eq("id", pkg.id);
    await supabase.from("tracking_events").insert({
      package_id: pkg.id, status: "RECU",
      location: pkg.origin, notes: "Demande validée — colis accepté",
    });
    setProcessing(null);
    router.refresh();
  }

  async function handleReject(pkg: PendingPackage) {
    setProcessing(pkg.id);
    await supabase.from("packages").update({ status: "ANNULE" }).eq("id", pkg.id);
    await supabase.from("tracking_events").insert({
      package_id: pkg.id, status: "ANNULE",
      notes: "Demande refusée par l'équipe",
    });
    setProcessing(null);
    router.refresh();
  }

  if (packages.length === 0) {
    return (
      <div className="card p-12 text-center text-gray-400">
        <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Toutes les demandes sont traitées ✓</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {packages.map(pkg => (
        <div key={pkg.id} className={`card p-5 ${pkg.is_urgent ? "border-orange-300 bg-orange-50/30" : ""}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="font-mono font-bold text-gray-900">{pkg.tracking_number}</span>
                {pkg.is_urgent && (
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full font-semibold">🚀 URGENT</span>
                )}
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {pkg.status === "SOUMIS" ? "Nouveau" : "En attente"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div><span className="text-gray-400">Client : </span><span className="text-gray-900 font-medium">{pkg.client?.name ?? "Inconnu"}</span></div>
                <div><span className="text-gray-400">Tél : </span><span className="text-gray-700">{pkg.client?.phone ?? "—"}</span></div>
                <div><span className="text-gray-400">Catégorie : </span><span className="text-gray-700">{CATEGORY_LABELS[pkg.category as PackageCategory] ?? pkg.category}</span></div>
                <div><span className="text-gray-400">Poids : </span><span className="text-gray-700">{pkg.weight ? `${pkg.weight} kg` : "Non renseigné"}</span></div>
                <div><span className="text-gray-400">Destination : </span><span className="text-gray-700">{pkg.destination}</span></div>
                {pkg.estimated_price && (
                  <div><span className="text-gray-400">Estimation : </span><span className="text-blue-700 font-semibold">{formatCurrency(pkg.estimated_price)}</span></div>
                )}
              </div>

              {pkg.description && (
                <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                  {pkg.description}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-2">Soumis le {formatDateTime(pkg.created_at)}</p>
            </div>

            <div className="flex flex-col gap-2">
              <Link href={`/dashboard/packages/${pkg.id}`}
                className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <ExternalLink className="w-3 h-3" />Détail
              </Link>
              <button
                onClick={() => handleValidate(pkg)}
                disabled={processing === pkg.id}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
                <CheckCircle className="w-4 h-4" />
                {processing === pkg.id ? "..." : "Valider"}
              </button>
              <button
                onClick={() => handleReject(pkg)}
                disabled={processing === pkg.id}
                className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
                <XCircle className="w-4 h-4" />Refuser
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
