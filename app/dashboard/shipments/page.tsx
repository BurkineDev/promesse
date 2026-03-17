import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DIRECTION_LABELS, TRANSPORT_LABELS, Direction, Transport } from "@/types";

export const metadata: Metadata = { title: "Lots d'expédition" };

const SHIPMENT_STATUS_COLORS = {
  PLANIFIE:  "bg-blue-100 text-blue-700",
  EN_COURS:  "bg-purple-100 text-purple-700",
  ARRIVE:    "bg-green-100 text-green-700",
  FERME:     "bg-gray-100 text-gray-500",
};
const SHIPMENT_STATUS_LABELS = {
  PLANIFIE: "Planifié", EN_COURS: "En cours", ARRIVE: "Arrivé", FERME: "Fermé",
};

export default async function ShipmentsPage() {
  const supabase = await createClient();

  const { data: shipments, count } = await supabase
    .from("shipments")
    .select("*, route:routes(name), packages:packages(count)", { count: "exact" })
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lots d&apos;expédition</h1>
          <p className="text-gray-500 text-sm">{count ?? 0} lot{(count??0)>1?"s":""}</p>
        </div>
        <Link href="/dashboard/shipments/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />Nouveau lot
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="table-th">Nom du lot</th>
              <th className="table-th">Route</th>
              <th className="table-th">Sens</th>
              <th className="table-th">Transport</th>
              <th className="table-th">Départ</th>
              <th className="table-th">Colis</th>
              <th className="table-th">Statut</th>
              <th className="table-th"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shipments && shipments.length > 0 ? shipments.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="table-td font-semibold">{s.name}</td>
                <td className="table-td text-gray-600 text-xs">
                  {(s.route as {name:string}|null)?.name ?? "—"}
                </td>
                <td className="table-td text-xs">{DIRECTION_LABELS[s.direction as Direction]}</td>
                <td className="table-td text-xs">{TRANSPORT_LABELS[s.transport as Transport]}</td>
                <td className="table-td text-gray-500 text-xs">
                  {s.departure_date ? formatDate(s.departure_date) : "—"}
                </td>
                <td className="table-td text-center font-semibold">
                  {(s.packages as {count:number}[])?.[0]?.count ?? 0}
                </td>
                <td className="table-td">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SHIPMENT_STATUS_COLORS[s.status as keyof typeof SHIPMENT_STATUS_COLORS]}`}>
                    {SHIPMENT_STATUS_LABELS[s.status as keyof typeof SHIPMENT_STATUS_LABELS]}
                  </span>
                </td>
                <td className="table-td">
                  <Link href={`/dashboard/shipments/${s.id}`} className="text-blue-700 text-sm hover:underline">Voir</Link>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">Aucun lot créé</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
