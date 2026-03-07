import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Edit, Package, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PackageStatus } from "@/types";

export const metadata: Metadata = { title: "Fiche client" };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: client }, { data: packages }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).single(),
    supabase
      .from("packages")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!client) notFound();

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/dashboard/clients"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Retour aux clients
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Client depuis le {formatDate(client.created_at)}
          </p>
        </div>
        <Link
          href={`/dashboard/clients/${id}/edit`}
          className="btn-secondary flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Modifier
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Informations
          </h2>

          {client.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700">{client.phone}</span>
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a
                href={`mailto:${client.email}`}
                className="text-blue-700 hover:underline"
              >
                {client.email}
              </a>
            </div>
          )}
          {client.address && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{client.address}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500">
              Créé le {formatDate(client.created_at)}
            </span>
          </div>
          {client.notes && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              {client.notes}
            </div>
          )}
        </div>

        {/* Packages */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">
              Colis ({packages?.length ?? 0})
            </h2>
            <Link
              href={`/dashboard/packages/new?client_id=${id}`}
              className="btn-primary text-sm py-1.5 flex items-center gap-1"
            >
              <Package className="w-3.5 h-3.5" />
              Nouveau colis
            </Link>
          </div>

          {packages && packages.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="table-th">Tracking</th>
                  <th className="table-th">Destination</th>
                  <th className="table-th">Statut</th>
                  <th className="table-th">Date</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-gray-50">
                    <td className="table-td font-mono font-semibold text-xs">
                      {pkg.tracking_number}
                    </td>
                    <td className="table-td text-gray-600">{pkg.destination}</td>
                    <td className="table-td">
                      <StatusBadge
                        status={pkg.status as PackageStatus}
                        size="sm"
                      />
                    </td>
                    <td className="table-td text-gray-500 text-xs">
                      {formatDate(pkg.created_at)}
                    </td>
                    <td className="table-td">
                      <Link
                        href={`/dashboard/packages/${pkg.id}`}
                        className="text-blue-700 hover:underline text-xs font-medium"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun colis pour ce client</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
