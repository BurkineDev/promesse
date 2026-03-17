import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { INCIDENT_TYPE_LABELS, IncidentType } from "@/types";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "Incidents" };

const INCIDENT_STATUS_COLORS = {
  OUVERT:        "bg-red-100 text-red-700",
  EN_TRAITEMENT: "bg-orange-100 text-orange-700",
  RESOLU:        "bg-green-100 text-green-700",
  FERME:         "bg-gray-100 text-gray-500",
};

export default async function IncidentsPage() {
  const supabase = await createClient();
  const { data: incidents, count } = await supabase
    .from("incidents")
    .select("*, package:packages(tracking_number, destination)", { count: "exact" })
    .order("created_at", { ascending: false });

  const open = incidents?.filter(i => i.status === "OUVERT").length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-500 text-sm">{open} ouvert{open>1?"s":""} · {count ?? 0} total</p>
        </div>
      </div>

      {open > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 font-medium text-sm">{open} incident{open>1?"s":""} ouvert{open>1?"s":""} nécessite{open>1?"nt":""} votre attention</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="table-th">Colis</th>
              <th className="table-th">Type</th>
              <th className="table-th">Description</th>
              <th className="table-th">Statut</th>
              <th className="table-th">Date</th>
              <th className="table-th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {incidents && incidents.length > 0 ? incidents.map(incident => {
              const pkg = incident.package as {tracking_number:string; destination:string} | null;
              return (
                <tr key={incident.id} className="hover:bg-gray-50">
                  <td className="table-td">
                    {pkg ? (
                      <div>
                        <p className="font-mono text-xs font-bold">{pkg.tracking_number}</p>
                        <p className="text-xs text-gray-400">{pkg.destination}</p>
                      </div>
                    ) : "—"}
                  </td>
                  <td className="table-td">
                    <span className="text-sm font-medium text-red-700">
                      {INCIDENT_TYPE_LABELS[incident.type as IncidentType]}
                    </span>
                  </td>
                  <td className="table-td text-gray-600 text-xs max-w-xs truncate">
                    {incident.description ?? "—"}
                  </td>
                  <td className="table-td">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${INCIDENT_STATUS_COLORS[incident.status as keyof typeof INCIDENT_STATUS_COLORS]}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="table-td text-gray-500 text-xs">{formatDate(incident.created_at)}</td>
                  <td className="table-td">
                    {pkg && (
                      <Link href={`/dashboard/packages?q=${pkg.tracking_number}`}
                        className="text-blue-700 text-xs hover:underline">Voir colis</Link>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Aucun incident signalé
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
