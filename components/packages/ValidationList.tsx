"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime, formatCurrency } from "@/lib/utils";
import {
  CheckCircle, XCircle, ExternalLink, Home, AlertCircle, ChevronDown, ChevronUp,
} from "lucide-react";
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
  notes: string | null;
  created_at: string;
  // client from clients table (admin-created)
  client: { name: string; phone?: string; email?: string } | null;
  // submitter from profiles (portal-submitted)
  submitter: { name: string; phone?: string } | null;
}

const FLAG: Record<string, string> = {
  "Burkina Faso": "🇧🇫", "Mali": "🇲🇱", "Sénégal": "🇸🇳",
  "Côte d'Ivoire": "🇨🇮", "Canada": "🇨🇦",
};
function destFlag(dest: string) {
  for (const [country, flag] of Object.entries(FLAG)) {
    if (dest.includes(country)) return flag;
  }
  return "🌍";
}

function parseHomePickupNotes(notes: string | null) {
  if (!notes?.includes("COLLECTE À DOMICILE")) return null;
  const lines = notes.split("\n");
  const data: Record<string, string> = {};
  for (const line of lines) {
    if (line.startsWith("Adresse :")) data.address = line.replace("Adresse :", "").trim();
    if (line.startsWith("Date souhaitée :")) data.date = line.replace("Date souhaitée :", "").trim();
    if (line.startsWith("Créneau :")) data.slot = line.replace("Créneau :", "").trim();
    if (line.startsWith("Instructions :")) data.instructions = line.replace("Instructions :", "").trim();
  }
  return data;
}

export function ValidationList({ packages }: { packages: PendingPackage[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [processing, setProcessing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectMode, setRejectMode] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function handleValidate(pkg: PendingPackage) {
    setProcessing(pkg.id);
    await supabase.from("packages").update({ status: "RECU" }).eq("id", pkg.id);
    await supabase.from("tracking_events").insert({
      package_id: pkg.id, status: "RECU",
      location: pkg.origin,
      notes: "Demande validée par l'équipe — colis accepté",
    });
    setProcessing(null);
    router.refresh();
  }

  async function handleReject(pkg: PendingPackage) {
    setProcessing(pkg.id);
    const reason = rejectReason.trim() || "Demande refusée par l'équipe";
    await supabase.from("packages").update({ status: "ANNULE" }).eq("id", pkg.id);
    await supabase.from("tracking_events").insert({
      package_id: pkg.id, status: "ANNULE",
      notes: reason,
    });
    setProcessing(null);
    setRejectMode(null);
    setRejectReason("");
    router.refresh();
  }

  if (packages.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <p className="font-semibold text-gray-700 text-lg">Tout est traité !</p>
        <p className="text-gray-400 text-sm mt-1">Aucune demande en attente de validation.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {packages.map(pkg => {
        const clientName = pkg.client?.name ?? pkg.submitter?.name ?? "Client inconnu";
        const clientPhone = pkg.client?.phone ?? pkg.submitter?.phone;
        const homePickup = parseHomePickupNotes(pkg.notes);
        const isOpen = expanded === pkg.id;

        return (
          <div key={pkg.id}
            className={`card overflow-hidden transition-shadow hover:shadow-md ${
              pkg.is_urgent ? "ring-2 ring-orange-300" : ""
            }`}>

            {/* ── Header bande ── */}
            {pkg.is_urgent && (
              <div className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                ENVOI PRIORITAIRE
              </div>
            )}
            {homePickup && !pkg.is_urgent && (
              <div className="bg-amber-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-2">
                <Home className="w-3.5 h-3.5" />
                COLLECTE À DOMICILE
              </div>
            )}

            <div className="p-5">
              {/* ── Ligne principale ── */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Tracking + statut */}
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="font-mono font-bold text-gray-900 text-base">{pkg.tracking_number}</span>
                    <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {pkg.status === "SOUMIS" ? "⏳ Nouveau" : "⏳ En attente"}
                    </span>
                  </div>

                  {/* Client */}
                  <div className="flex items-center gap-4 flex-wrap text-sm mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-xs flex-shrink-0">
                        {clientName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{clientName}</span>
                    </div>
                    {clientPhone && (
                      <a href={`https://wa.me/${clientPhone.replace(/\D/g, "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs font-medium">
                        💬 {clientPhone}
                      </a>
                    )}
                  </div>

                  {/* Trajet */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span className="text-gray-400 text-xs">{pkg.origin}</span>
                    <span className="text-gray-300">→</span>
                    <span className="font-medium">{destFlag(pkg.destination)} {pkg.destination}</span>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>{CATEGORY_LABELS[pkg.category as PackageCategory] ?? pkg.category}</span>
                    {pkg.weight && <span>⚖️ {pkg.weight} kg</span>}
                    {pkg.estimated_price && (
                      <span className="text-blue-700 font-semibold">
                        ~{formatCurrency(pkg.estimated_price)}
                      </span>
                    )}
                    <span className="text-gray-400">{formatDateTime(pkg.created_at)}</span>
                  </div>
                </div>

                {/* ── Actions ── */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleValidate(pkg)}
                    disabled={processing === pkg.id}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm">
                    <CheckCircle className="w-4 h-4" />
                    {processing === pkg.id ? "..." : "Valider"}
                  </button>
                  <button
                    onClick={() => setRejectMode(pkg.id)}
                    disabled={processing === pkg.id}
                    className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-medium px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
                    <XCircle className="w-4 h-4" /> Refuser
                  </button>
                  <Link href={`/dashboard/packages/${pkg.id}`}
                    className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors py-1">
                    <ExternalLink className="w-3 h-3" /> Voir détail
                  </Link>
                </div>
              </div>

              {/* ── Description ── */}
              {pkg.description && (
                <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                  📦 {pkg.description}
                </div>
              )}

              {/* ── Collecte domicile info ── */}
              {homePickup && (
                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" /> Détails collecte à domicile
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    {homePickup.address && (
                      <div className="col-span-2">
                        <span className="text-gray-400">Adresse : </span>
                        <span className="font-medium text-gray-800">{homePickup.address}</span>
                      </div>
                    )}
                    {homePickup.date && (
                      <div>
                        <span className="text-gray-400">Date : </span>
                        <span className="font-medium text-gray-800">{homePickup.date}</span>
                      </div>
                    )}
                    {homePickup.slot && (
                      <div>
                        <span className="text-gray-400">Créneau : </span>
                        <span className="font-medium text-gray-800">{homePickup.slot}</span>
                      </div>
                    )}
                    {homePickup.instructions && (
                      <div className="col-span-2 mt-1">
                        <span className="text-gray-400">Instructions : </span>
                        <span className="text-gray-600 italic">{homePickup.instructions}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Expand notes ── */}
              {pkg.notes && !homePickup && (
                <button type="button"
                  onClick={() => setExpanded(isOpen ? null : pkg.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {isOpen ? "Masquer les notes" : "Voir les notes client"}
                </button>
              )}
              {isOpen && pkg.notes && (
                <div className="mt-2 bg-blue-50 rounded-lg px-3 py-2 text-xs text-gray-600 whitespace-pre-line">
                  {pkg.notes}
                </div>
              )}

              {/* ── Reject reason form ── */}
              {rejectMode === pkg.id && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-700">Raison du refus</p>
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    rows={2} className="input resize-none text-sm border-red-200 focus:ring-red-400"
                    placeholder="Ex : Colis non conforme, informations incomplètes, destination non desservie..." />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReject(pkg)}
                      disabled={processing === pkg.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors disabled:opacity-50">
                      {processing === pkg.id ? "..." : "Confirmer le refus"}
                    </button>
                    <button type="button"
                      onClick={() => { setRejectMode(null); setRejectReason(""); }}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
