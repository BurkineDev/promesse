import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Edit, Weight, MapPin, Calendar, Package, User } from "lucide-react";
import { formatDate, formatDateTime, formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StatusUpdateForm } from "@/components/packages/StatusUpdateForm";
import { TrackingTimeline } from "@/components/tracking/TrackingTimeline";
import { PackageStatus, TrackingEvent } from "@/types";

export const metadata: Metadata = { title: "Détail du colis" };

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pkg }, { data: events }, { data: payments }] =
    await Promise.all([
      supabase
        .from("packages")
        .select("*, client:clients(*)")
        .eq("id", id)
        .single(),
      supabase
        .from("tracking_events")
        .select("*")
        .eq("package_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("*")
        .eq("package_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!pkg) notFound();

  const client = pkg.client as {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  } | null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href="/dashboard/packages"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← Retour aux colis
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-mono text-gray-900">
              {pkg.tracking_number}
            </h1>
            <StatusBadge status={pkg.status as PackageStatus} />
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Créé le {formatDateTime(pkg.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/track?numero=${pkg.tracking_number}`}
            target="_blank"
            className="btn-secondary text-sm"
          >
            Vue client
          </Link>
          <Link
            href={`/dashboard/packages/${id}/edit`}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Package info */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Informations du colis
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {client && (
                <div className="flex items-start gap-2 col-span-2">
                  <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Client</p>
                    <Link
                      href={`/dashboard/clients/${client.id}`}
                      className="text-sm font-medium text-blue-700 hover:underline"
                    >
                      {client.name}
                    </Link>
                    {client.phone && (
                      <p className="text-xs text-gray-500">{client.phone}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Origine</p>
                  <p className="text-sm font-medium">{pkg.origin}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Destination</p>
                  <p className="text-sm font-medium">{pkg.destination}</p>
                </div>
              </div>

              {pkg.weight && (
                <div className="flex items-start gap-2">
                  <Weight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Poids</p>
                    <p className="text-sm font-medium">{pkg.weight} kg</p>
                  </div>
                </div>
              )}

              {pkg.price && (
                <div className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Prix</p>
                    <p className="text-sm font-medium">
                      {formatCurrency(pkg.price)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Enregistré le</p>
                  <p className="text-sm font-medium">
                    {formatDate(pkg.created_at)}
                  </p>
                </div>
              </div>

              {pkg.description && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{pkg.description}</p>
                </div>
              )}

              {pkg.notes && (
                <div className="col-span-2 bg-yellow-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Note interne</p>
                  <p className="text-sm text-gray-700">{pkg.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tracking timeline */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-6">
              Historique de tracking
            </h2>
            <TrackingTimeline events={(events ?? []) as TrackingEvent[]} />
          </div>

          {/* Payments */}
          <div className="card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Paiements</h2>
              <Link
                href={`/dashboard/payments/new?package_id=${id}`}
                className="text-sm text-blue-700 hover:underline"
              >
                + Ajouter
              </Link>
            </div>
            {payments && payments.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-th">Montant</th>
                    <th className="table-th">Méthode</th>
                    <th className="table-th">Statut</th>
                    <th className="table-th">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="table-td font-semibold">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="table-td text-gray-600">
                        {payment.method}
                      </td>
                      <td className="table-td">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            payment.status === "PAYE"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "REMBOURSE"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {payment.status === "PAYE"
                            ? "Payé"
                            : payment.status === "REMBOURSE"
                            ? "Remboursé"
                            : "En attente"}
                        </span>
                      </td>
                      <td className="table-td text-gray-500 text-xs">
                        {formatDate(payment.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-6 py-8 text-center text-gray-400 text-sm">
                Aucun paiement enregistré
              </p>
            )}
          </div>
        </div>

        {/* Right column: Status update */}
        <div>
          <StatusUpdateForm
            packageId={pkg.id}
            currentStatus={pkg.status as PackageStatus}
            clientEmail={client?.email}
            clientName={client?.name}
            trackingNumber={pkg.tracking_number}
            destination={pkg.destination}
          />
        </div>
      </div>
    </div>
  );
}
